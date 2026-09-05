"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { findCartConflicts } from "@/lib/booking/scheduling";
import type { PublicServiceTree } from "@/lib/services/types";
import { createBookingGroup } from "./api";
import { invalidateSlots } from "./slots-cache";
import Stepper from "./Stepper";
import SummarySidebar from "./SummarySidebar";
import MobileSummaryBar from "./MobileSummaryBar";
import BookingModals from "./BookingModals";
import BookingPanel from "./BookingPanel";
import { buildInvoice } from "./invoice";
import type { InvoiceData } from "./modals/PrintInvoiceModal";
import type { CartItem, ContactInfo, CreatedBookingGroup, WizardStep } from "./types";

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

function VerifiedWizard({
  tree,
  currency,
  openingHours,
  minCancelHours,
  defaultDeposit,
  clinic,
}: BookingWizardProps) {
  const t = useTranslations("booking");
  const locale = useLocale() as "fa" | "en";
  const searchParams = useSearchParams();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState<WizardStep>(0);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [group, setGroup] = useState<CreatedBookingGroup | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [showClinicInfo, setShowClinicInfo] = useState(false);
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

  const toggleService = useCallback((item: CartItem) => {
    setCart((prev) => {
      const exists = prev.some((line) => line.service.id === item.service.id);
      return exists
        ? prev.filter((line) => line.service.id !== item.service.id)
        : [...prev, { ...item, quantity: 1, slot: null }];
    });
  }, []);

  const removeLine = useCallback((serviceId: string) => {
    setCart((prev) => (prev.length === 1 ? [] : prev.filter((line) => line.service.id !== serviceId)));
  }, []);

  const assignSlot = useCallback((serviceId: string, slot: CartItem["slot"]) => {
    setCart((prev) => prev.map((line) => (line.service.id === serviceId ? { ...line, slot } : line)));
  }, []);

  const submitBooking = useCallback(
    async (data: ContactInfo): Promise<CreatedBookingGroup> => {
      setContact(data);
      const created = await createBookingGroup({
        fullName: data.fullName,
        phone: data.phone,
        locale,
        notes: data.notes || null,
        hasAllergies: data.hasAllergies,
        isPregnant: data.isPregnant,
        termsAccepted: data.agreeToTerms,
        items: cart.map((line) => ({
          serviceId: line.service.id,
          slotId: line.slot?.id ?? "",
          quantity: line.quantity,
        })),
      });
      setGroup(created);
      setStep(3);
      invalidateSlots();
      window.localStorage.removeItem(CART_STORAGE_KEY);
      return created;
    },
    [cart, locale],
  );

  const nextDisabled = step === 0 ? cart.length === 0 : !(allScheduled && conflicts.length === 0);
  const nextLabel =
    step === 0 ? t("sidebar.nextSchedule") : step === 1 ? t("sidebar.nextContact") : "";
  const goNext = () => {
    if (step === 0) setStep(1);
    else if (step === 1) setStep(2);
  };

  const canStepTo = (index: number) => (index === 0 ? true : index === 1 ? cart.length > 0 : allScheduled);
  const makeInvoice = (g: CreatedBookingGroup, ref: string | null = null) =>
    buildInvoice(g, cart, contact, currency, totals, ref);

  const resetAll = () => {
    setCart([]);
    setStep(0);
    setGroup(null);
    setShowSuccess(false);
    setContact(null);
    setPaymentReference(null);
    setInvoice(null);
    window.localStorage.removeItem(CART_STORAGE_KEY);
  };

  return (
    <>
      <Stepper
        current={step}
        canStepTo={canStepTo}
        onStepClick={(i) => setStep(i as WizardStep)}
        onOpenMyBookings={() => setShowMyBookings(true)}
        bookingsCount={0}
      />

      <h1 className="sr-only">{t("title")}</h1>

      <main className="mx-auto w-full max-w-7xl flex-1 px-2 xs:px-3.5 sm:px-5 lg:px-6 py-4 pb-32 sm:py-6 sm:pb-40 lg:pb-10">
        <div className="flex flex-col items-start gap-4 sm:gap-6 lg:flex-row">
          <BookingPanel
            step={step}
            tree={tree}
            currency={currency}
            openingHours={openingHours}
            cart={cart}
            group={group}
            contact={contact}
            defaultDeposit={defaultDeposit}
            onToggleCart={toggleService}
            onRemove={removeLine}
            onAssignSlot={assignSlot}
            onSlotBack={() => setStep(0)}
            onSlotContinue={() => setStep(2)}
            onContactBack={() => setStep(1)}
            onSubmitContact={submitBooking}
            onPaid={(ref) => {
              setPaymentReference(ref);
              setShowSuccess(true);
            }}
            onReviewBack={() => setStep(2)}
            onPreviewInvoice={(g) => setInvoice(makeInvoice(g))}
            clinic={clinic}
          />

          <SummarySidebar
            cart={cart}
            currency={currency}
            totals={totals}
            step={step}
            nextLabel={nextLabel}
            nextDisabled={nextDisabled}
            onRemove={removeLine}
            onNext={goNext}
            addressTitle={clinic.addressTitle}
            address={clinic.address}
          />
        </div>
      </main>

      <MobileSummaryBar
        cart={cart}
        currency={currency}
        totals={totals}
        step={step}
        nextLabel={nextLabel}
        nextDisabled={nextDisabled}
        onNext={goNext}
        address={clinic.address}
      />

      <BookingModals
        showSuccess={showSuccess}
        group={group}
        cart={cart}
        contact={contact}
        currency={currency}
        deposit={defaultDeposit}
        clinic={clinic}
        openingHours={openingHours}
        showMyBookings={showMyBookings}
        minCancelHours={minCancelHours}
        showClinicInfo={showClinicInfo}
        invoice={invoice}
        onCloseSuccess={() => setShowSuccess(false)}
        onNew={resetAll}
        onPrintInvoice={() => {
          if (group) setInvoice(makeInvoice(group, paymentReference));
        }}
        onCloseMyBookings={() => setShowMyBookings(false)}
        onCloseClinic={() => setShowClinicInfo(false)}
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
