"use client";

import type { PublicServiceTree } from "@/lib/services/types";
import type { CartItem, ContactInfo, CreatedBookingGroup, SlotOption, WizardStep } from "./types";
import ServiceStep from "./steps/ServiceStep";

const EMPTY_CONTACT: ContactInfo = {
  fullName: "",
  phone: "",
  email: "",
  notes: "",
  consultationRequired: true,
  hasAllergies: false,
  isPregnant: false,
  agreeToTerms: true,
};
import SlotStep from "./steps/SlotStep";
import ContactStep from "./steps/ContactStep";
import ReviewStep from "./steps/ReviewStep";

export type ReviewClinicInfo = {
  addressTitle: string;
  address: string;
  telephone: string | null;
  phoneDisplay: string;
  googleMap: string;
};

type BookingPanelProps = {
  step: WizardStep;
  tree: PublicServiceTree;
  currency: string;
  openingHours: readonly {
    readonly days: readonly string[];
    readonly opens: string;
    readonly closes: string;
  }[];
  cart: CartItem[];
  group: CreatedBookingGroup | null;
  contact: ContactInfo | null;
  defaultDeposit: number;
  onToggleCart: (item: CartItem) => void;
  onRemove: (serviceId: string) => void;
  onAssignSlot: (serviceId: string, slot: SlotOption | null) => void;
  onSlotBack: () => void;
  onSlotContinue: () => void;
  onContactBack: () => void;
  onSubmitContact: (data: ContactInfo) => Promise<unknown>;
  onPaid: () => void;
  onReviewBack: () => void;
  onPreviewInvoice: (group: CreatedBookingGroup) => void;
  clinic: ReviewClinicInfo;
};

/** Renders the active wizard step body (presentational). */
export default function BookingPanel({
  step,
  tree,
  currency,
  openingHours,
  cart,
  group,
  contact,
  defaultDeposit,
  onToggleCart,
  onRemove,
  onAssignSlot,
  onSlotBack,
  onSlotContinue,
  onContactBack,
  onSubmitContact,
  onPaid,
  onReviewBack,
  onPreviewInvoice,
  clinic,
}: BookingPanelProps) {
  return (
    <div className="w-full min-w-0 flex-1">
      {step === 0 ? (
        <ServiceStep tree={tree} currency={currency} cart={cart} onToggle={onToggleCart} onRemove={onRemove} />
      ) : null}
      {step === 1 ? (
        <SlotStep cart={cart} openingHours={openingHours} onAssign={onAssignSlot} onBack={onSlotBack} onContinue={onSlotContinue} />
      ) : null}
      {step === 2 ? (
        <ContactStep defaultValues={EMPTY_CONTACT} onBack={onContactBack} onContinue={onSubmitContact} />
      ) : null}
      {step === 3 && group ? (
        <ReviewStep
          group={group}
          cart={cart}
          currency={currency}
          deposit={defaultDeposit}
          contact={contact}
          onPaid={onPaid}
          onBack={onReviewBack}
          onPreviewInvoice={onPreviewInvoice}
          clinic={clinic}
        />
      ) : null}
    </div>
  );
}
