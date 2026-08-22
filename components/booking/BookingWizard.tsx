"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import type { PublicServiceTree } from "@/lib/services/types";
import { createBooking } from "./api";
import AppointmentCard from "./AppointmentCard";
import Stepper from "./Stepper";
import ServiceStep from "./steps/ServiceStep";
import SlotStep from "./steps/SlotStep";
import ContactStep from "./steps/ContactStep";
import ReviewStep from "./steps/ReviewStep";
import ConfirmationStep from "./steps/ConfirmationStep";
import type {
  ContactInfo,
  CreatedBooking,
  SelectedService,
  SlotOption,
  WizardStep,
} from "./types";

type BookingWizardProps = {
  tree: PublicServiceTree;
  currency: string;
  openingHours: readonly { readonly days: readonly string[]; readonly opens: string; readonly closes: string }[];
  defaultDeposit?: number;
};

function flattenServices(tree: PublicServiceTree): SelectedService[] {
  const out: SelectedService[] = [];
  for (const group of tree.groups) {
    for (const category of group.categories) {
      for (const service of category.services) {
        out.push({
          ...service,
          groupSlug: group.slug,
          groupTitle: group.title,
          categorySlug: category.slug,
          categoryTitle: category.title,
        });
      }
    }
  }
  return out;
}

function resolvePreselected(
  services: SelectedService[],
  slug: string | null,
): SelectedService | null {
  if (!slug) return null;
  return (
    services.find((s) => s.slug === slug) ??
    services.find((s) => s.categorySlug === slug) ??
    services.find((s) => s.groupSlug === slug) ??
    null
  );
}

function Wizard({ tree, currency }: BookingWizardProps) {
  const t = useTranslations("booking");
  const locale = useLocale() as "fa" | "en";
  const searchParams = useSearchParams();

  const services = useMemo(() => flattenServices(tree), [tree]);
  const preselected = useMemo(
    () => resolvePreselected(services, searchParams.get("service")),
    [services, searchParams],
  );

  const [step, setStep] = useState<WizardStep>(preselected ? 1 : 0);
  const [service, setService] = useState<SelectedService | null>(preselected);
  const [slot, setSlot] = useState<SlotOption | null>(null);
  const [contact] = useState<ContactInfo>({ fullName: "", phone: "", email: "", notes: "" });
  const [booking, setBooking] = useState<CreatedBooking | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const amount = useMemo(
    () => Number(booking?.totalAmount ?? 0) || 0,
    [booking],
  );

  const selectService = (next: SelectedService) => {
    setService(next);
    setSlot(null);
    setStep(1);
  };

  const selectSlot = (next: SlotOption) => {
    setSlot(next);
    setStep(2);
  };

  const submitContact = async (data: ContactInfo) => {
    if (!service || !slot) return;
    const created = await createBooking({
      fullName: data.fullName,
      phone: data.phone,
      email: data.email || null,
      serviceId: service.id,
      slotId: slot.id,
      locale,
      notes: data.notes || null,
    });
    setBooking({ ...created, serviceTitle: service.title });
    setStep(3);
  };

  const completed = (paid: CreatedBooking) => {
    setBooking({ ...paid, serviceTitle: service?.title ?? paid.serviceTitle });
    setConfirmed(true);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <ServiceStep
            tree={tree}
            currency={currency}
            selectedId={service?.id ?? null}
            initialGroupSlug={service?.groupSlug}
            onSelect={selectService}
          />
        );
      case 1:
        return (
          <SlotStep
            serviceId={service?.id ?? ""}
            selectedSlotId={slot?.id ?? null}
            onSelect={selectSlot}
          />
        );
      case 2:
        return <ContactStep defaultValues={contact} onContinue={submitContact} />;
        default:
          return booking && service && slot ? (
            <ReviewStep booking={booking} service={service} slot={slot} onDone={completed} />
          ) : null;
    }
  };

  if (confirmed && booking) {
    return (
      <section className="bg-surface-primary py-16 md:py-24">
        <div className="mx-auto max-w-content px-4 md:px-6">
          <ConfirmationStep booking={booking} />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface-primary py-14 md:py-20">
      <div className="mx-auto max-w-content px-4 md:px-6">
        <div className="mb-10 max-w-prose">
          <h1 className="mb-3 text-heading-2 font-bold text-accent">{t("title")}</h1>
          <p className="text-body text-content-secondary">{t("description")}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
          <div className="rounded-panel border border-border-primary bg-surface-secondary p-4 shadow-elevation-1 md:p-8">
            <div className="mb-8">
              <Stepper current={step} />
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <AppointmentCard service={service} slot={slot} amount={amount} currency={currency} />
          </aside>
        </div>
      </div>
    </section>
  );
}

export default function BookingWizard(props: BookingWizardProps) {
  return (
    <Suspense fallback={null}>
      <Wizard {...props} />
    </Suspense>
  );
}
