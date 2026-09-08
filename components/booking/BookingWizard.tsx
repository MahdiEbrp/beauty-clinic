"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { findCartConflicts } from "@/lib/booking/scheduling";
import type { PublicServiceTree } from "@/lib/services/types";
import { createBookingGroup, payBookingGroup } from "./api";
import { invalidateSlots } from "./slots-cache";
import Stepper from "./Stepper";
import BottomBar from "./BottomBar";
import BookingModals from "./BookingModals";
import ServicesStep from "./steps/ServicesStep";
import ScheduleStep from "./steps/ScheduleStep";
import SummaryStep from "./steps/SummaryStep";
import ConfirmationStep from "./steps/ConfirmationStep";
import { buildInvoice } from "./invoice";
import type { InvoiceData } from "./modals/PrintInvoiceModal";
import type { CartItem, ContactInfo, WizardStep } from "./types";

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

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function VerifiedWizard(props: BookingWizardProps) {
  const { tree, currency, clinic, minCancelHours, defaultDeposit } = props;
  const t = useTranslations("booking");
  const locale = useLocale() as "fa" | "en";
  const searchParams = useSearchParams();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState<WizardStep>(0);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [group, setGroup] = useState<Awaited<ReturnType<typeof createBookingGroup>> | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);

  // One-time hydration + ?service= preselect.
  useEffect(() => {
    const stored = loadCart();
    const slug = searchParams.get("service");
    if (slug && !stored.some((item) => item.service.slug === slug)) {
      outer: for (const groupNode of tree.groups) {
        for (const category of groupNode.categories) {
          const service = category.services.find((s) => s.slug === slug);
          if (service) {
            stored.push({
              service: {
                ...service,
                groupSlug: groupNode.slug,
                groupTitle: groupNode.title,
                categorySlug: category.slug,
                categoryTitle: category.title,
              },
              quantity: 1,
              slot: null,
            });
            break outer;
          }
        }
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

  const totals = useMemo(() => {
    const total = cart.reduce((sum, item) => sum + Number(item.service.price) * item.quantity, 0);
    const deposit = cart.length > 0 ? defaultDeposit : 0;
    return { total, deposit, remaining: Math.max(total - deposit, 0) };
  }, [cart, defaultDeposit]);

  const allScheduled = cart.length > 0 && cart.every((line) => line.slot);
  const conflicts = useMemo(() => findCartConflicts(cart), [cart]);
  const readyToNext = allScheduled && conflicts.length === 0;

  const toggleService = useCallback((item: CartItem) => {
    setCart((prev) =>
      prev.some((line) => line.service.id === item.service.id)
        ? prev.filter((line) => line.service.id !== item.service.id)
        : [...prev, { ...item, quantity: 1, slot: null }],
    );
  }, []);

  const removeLine = useCallback((serviceId: string) => {
    setCart((prev) => (prev.length === 1 ? [] : prev.filter((line) => line.service.id !== serviceId)));
  }, []);

  const assignSlot = useCallback((serviceId: string, slot: CartItem["slot"]) => {
    setCart((prev) => prev.map((line) => (line.service.id === serviceId ? { ...line, slot } : line)));
  }, []);

  const submitBooking = useCallback(
    async (data: ContactInfo): Promise<void> => {
      setContact(data);
      const created = await createBookingGroup({
        fullName: data.fullName,
        phone: data.phone,
        locale,
        notes: data.notes || null,
        hasAllergies: false,
        isPregnant: false,
        termsAccepted: data.agreeToTerms,
        items: cart.map((line) => ({
          serviceId: line.service.id,
          slotId: line.slot?.id ?? "",
          quantity: line.quantity,
        })),
      });
      let reference: string | null = null;
      try {
        const payment = await payBookingGroup(created.groupRef);
        reference = payment.paymentReference ?? null;
      } catch {
        reference = null;
      }
      setGroup(created);
      setPaymentReference(reference);
      setStep(3);
      invalidateSlots();
      window.localStorage.removeItem(CART_STORAGE_KEY);
    },
    [cart, locale],
  );

  const canStepTo = useCallback(
    (index: number) => {
      if (index === 0) return true;
      if (index === 1) return cart.length > 0;
      if (index === 2) return readyToNext;
      return true;
    },
    [cart.length, readyToNext],
  );

  const goNext = () => setStep((current) => (current === 0 || current === 1 ? ((current + 1) as WizardStep) : current));
  const goBack = () => setStep((current) => (current > 0 ? ((current - 1) as WizardStep) : current));

  const openInvoice = useCallback(() => {
    if (!group) return;
    setInvoice(buildInvoice(group, cart, contact, currency, totals, paymentReference));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- group only
  }, [group]);

  return (
    <>
      <Stepper
        current={step}
        canStepTo={canStepTo}
        onStepClick={(index) => setStep(index as WizardStep)}
        onOpenMyBookings={() => setShowMyBookings(true)}
        bookingsCount={0}
      />

      <h1 className="sr-only">{t("title")}</h1>

      <main className="mx-auto w-full max-w-4xl flex-1 px-2 pb-40 pt-4 sm:px-5 sm:py-6">
        {step === 0 ? <ServicesStep tree={tree} currency={currency} cart={cart} onToggle={toggleService} onRemove={removeLine} /> : null}
        {step === 1 ? <ScheduleStep cart={cart} currency={currency} onAssignSlot={assignSlot} onBack={() => setStep(0)} /> : null}
        {step === 2 ? (
          <SummaryStep cart={cart} currency={currency} totals={totals} onSubmit={submitBooking} />
        ) : null}
        {step === 3 && group ? (
          <ConfirmationStep
            group={group}
            contact={contact}
            currency={currency}
            paymentReference={paymentReference}
            clinic={clinic}
            onOpenInvoice={openInvoice}
          />
        ) : null}

        <BottomBar step={step} canProceed={step === 0 ? cart.length > 0 : readyToNext} onNext={goNext} onPrev={goBack} />
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