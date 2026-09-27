"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { findCartConflicts } from "@/lib/booking/scheduling";
import type { PublicServiceTree } from "@/lib/services/types";
import type { PublicRule } from "@/lib/services/rules-types";
import { checkoutBookingGroup, createBookingGroup } from "./api";
import { invalidateSlots } from "./slots-cache";
import Stepper from "./Stepper";
import BottomBar from "./BottomBar";
import BookingModals from "./BookingModals";
import GroupsStep from "./steps/GroupsStep";
import ScheduleStep from "./steps/ScheduleStep";
import SummaryStep from "./steps/SummaryStep";
import ConfirmationStep from "./steps/ConfirmationStep";
import { buildInvoice } from "./invoice";
import type { InvoiceData } from "./modals/PrintInvoiceModal";
import type { CartItem, ContactInfo, HealthFlags, SelectedGroup, WizardStep } from "./types";

export type ClinicBookingInfo = {
  clinicName: string;
  addressTitle: string;
  address: string;
  telephone: string | null;
  phoneDisplay: string;
  neshanMap: string;
  googleMap: string;
};

export type BookingWizardProps = {
  tree: PublicServiceTree;
  rules: PublicRule[];
  currency: string;
  openingHours: readonly {
    readonly days: readonly string[];
    readonly opens: string;
    readonly closes: string;
  }[];
  minCancelHours: number;
  defaultDeposit: number;
  clinic: ClinicBookingInfo;
};

const CART_STORAGE_KEY = "nafas_booking_cart";

/**
 * Guards the persisted cart against schema drift (e.g. carts saved before the
 * service→group switch held `{ service }`). Only entries that carry a valid
 * `group` survive; anything else is dropped instead of crashing the wizard.
 */
function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const group = (value as { group?: unknown }).group;
  if (!group || typeof group !== "object") return false;
  const candidate = group as { id?: unknown; title?: unknown };
  return typeof candidate.id === "string" && typeof candidate.title === "string";
}

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
}

/** Finds a group by slug, or the group that owns a service slug (legacy `?service=`). */
function findGroupBySlug(tree: PublicServiceTree, slug: string): SelectedGroup | null {
  for (let index = 0; index < tree.groups.length; index += 1) {
    const group = tree.groups[index];
    if (!group) continue;
    if (group.slug === slug) return { ...group, groupIndex: index };
    for (const category of group.categories) {
      if (category.services.some((service) => service.slug === slug)) {
        return { ...group, groupIndex: index };
      }
    }
  }
  return null;
}

function VerifiedWizard(props: BookingWizardProps) {
  const { tree, rules, currency, clinic, minCancelHours, defaultDeposit } = props;
  const t = useTranslations("booking");
  const locale = useLocale() as "fa" | "en";
  const searchParams = useSearchParams();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState<WizardStep>(0);
  const [health, setHealth] = useState<HealthFlags>({ pregnant: false, illness: false });
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [group, setGroup] = useState<Awaited<ReturnType<typeof createBookingGroup>> | null>(null);
  const [paymentReference] = useState<string | null>(null);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const checkoutKey = useRef<string | null>(null);

  // One-time hydration + ?group= / ?service= preselect.
  useEffect(() => {
    const stored = loadCart();
    const slug = searchParams.get("group") ?? searchParams.get("service");
    if (slug && !stored.some((item) => item.group.slug === slug)) {
      const match = findGroupBySlug(tree, slug);
      if (match && !stored.some((item) => item.group.id === match.id)) {
        stored.push({ group: match, quantity: 1, slot: null });
      }
    }
    /* eslint-disable react-hooks/set-state-in-effect -- one-time localStorage hydration */
    setCart(stored);
    setHydrated(true);
    if (stored.length > 0) setStep(1);
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  const deposit = cart.length > 0 ? defaultDeposit : 0;

  const allScheduled = cart.length > 0 && cart.every((line) => line.slot);
  const conflicts = useMemo(() => findCartConflicts(cart), [cart]);
  const readyToNext = allScheduled && conflicts.length === 0;
  const healthBlocked = health.pregnant || health.illness;

  const setHealthFlag = useCallback((kind: keyof HealthFlags, value: boolean) => {
    setHealth((prev) => ({ ...prev, [kind]: value }));
  }, []);

  const toggleGroup = useCallback((groupItem: SelectedGroup) => {
    setCart((prev) =>
      prev.some((line) => line.group.id === groupItem.id)
        ? prev.filter((line) => line.group.id !== groupItem.id)
        : [...prev, { group: groupItem, quantity: 1, slot: null }],
    );
  }, []);

  const assignSlot = useCallback((groupId: string, slot: CartItem["slot"]) => {
    setCart((prev) => prev.map((line) => (line.group.id === groupId ? { ...line, slot } : line)));
  }, []);

  const submitBooking = useCallback(
    async (data: ContactInfo): Promise<void> => {
      setContact(data);
      const created = group ?? await createBookingGroup({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email ?? null,
        locale,
        notes: data.notes || null,
        hasAllergies: false,
        isPregnant: false,
        termsAccepted: data.agreeToTerms,
        items: cart.map((line) => ({
          groupId: line.group.id,
          slotId: line.slot?.id ?? "",
          quantity: line.quantity,
        })),
      });
      setGroup(created);
      checkoutKey.current ??= crypto.randomUUID();
      try {
        const checkout = await checkoutBookingGroup({
          groupRef: created.groupRef,
          idempotencyKey: checkoutKey.current,
          locale,
        });
        invalidateSlots();
        window.localStorage.removeItem(CART_STORAGE_KEY);
        window.location.assign(checkout.paymentUrl);
      } catch (error) {
        checkoutKey.current = null;
        throw error;
      }
    },
    [cart, group, locale],
  );

  const canStepTo = useCallback(
    (index: number) => {
      if (index === 0) return true;
      if (index === 1) return cart.length > 0 && !healthBlocked;
      if (index === 2) return readyToNext;
      return group !== null;
    },
    [cart.length, group, healthBlocked, readyToNext],
  );

  const goNext = () => setStep((current) => (current === 0 || current === 1 ? ((current + 1) as WizardStep) : current));
  const goBack = () => setStep((current) => (current > 0 ? ((current - 1) as WizardStep) : current));

  // Defensive: never render the confirmation step without a saved group.
  const effectiveStep: WizardStep = step === 3 && !group ? 0 : step;

  const openInvoice = useCallback(() => {
    if (!group) return;
    setInvoice(buildInvoice(group, cart, contact, currency, deposit, paymentReference));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- group only
  }, [group]);

  return (
    <>
      <Stepper
        current={effectiveStep}
        canStepTo={canStepTo}
        onStepClick={(index) => setStep(index as WizardStep)}
        onOpenMyBookings={() => setShowMyBookings(true)}
        bookingsCount={0}
      />

      <h1 className="sr-only">{t("title")}</h1>

      <main className="mx-auto w-full max-w-4xl flex-1 px-2 pb-40 pt-4 sm:px-5 sm:py-6">
        {effectiveStep === 0 ? (
          <GroupsStep tree={tree} cart={cart} health={health} phone={clinic.phoneDisplay} onHealthChange={setHealthFlag} onToggle={toggleGroup} />
        ) : null}
        {effectiveStep === 1 ? <ScheduleStep cart={cart} onAssignSlot={assignSlot} onBack={() => setStep(0)} /> : null}
        {effectiveStep === 2 ? (
          <SummaryStep cart={cart} currency={currency} deposit={deposit} rules={rules} onSubmit={submitBooking} />
        ) : null}
        {effectiveStep === 3 && group ? (
          <ConfirmationStep
            group={group}
            contact={contact}
            currency={currency}
            paymentReference={paymentReference}
            clinic={clinic}
            onOpenInvoice={openInvoice}
          />
        ) : null}

        <BottomBar step={effectiveStep} canProceed={effectiveStep === 0 ? cart.length > 0 && !healthBlocked : readyToNext} onNext={goNext} onPrev={goBack} />
      </main>

      <BookingModals
        showMyBookings={showMyBookings}
        invoice={invoice}
        clinic={clinic}
        minCancelHours={minCancelHours}
        onCloseMyBookings={() => setShowMyBookings(false)}
        onCloseInvoice={() => setInvoice(null)}
      />
    </>
  );
}

export default function BookingWizard(props: BookingWizardProps) {
  return (
    <Suspense fallback={null}>
      <VerifiedWizard {...props} />
    </Suspense>
  );
}
