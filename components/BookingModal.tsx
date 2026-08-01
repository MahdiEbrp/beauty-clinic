"use client";

import { useTranslations } from "next-intl";
import BookingForm from "./BookingForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Built on Radix Dialog, which supplies the behaviour the previous hand-rolled
 * overlay was missing entirely: Escape to dismiss, a focus trap, focus restored
 * to the trigger on close, body scroll lock, and `aria-hidden` on the rest of
 * the page.
 */
export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const t = useTranslations();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        closeLabel={t("booking.close")}
        className="max-w-2xl rounded-feature p-8 md:p-12 max-h-[90dvh] overflow-y-auto"
      >
        <DialogHeader className="text-center sm:text-center mb-8">
          <DialogTitle className="text-[var(--text-heading-2)] leading-tight text-accent mb-2">
            {t("booking.title")}
          </DialogTitle>
          <DialogDescription className="text-body text-content-secondary">
            {t("booking.description")}
          </DialogDescription>
        </DialogHeader>

        <BookingForm />
      </DialogContent>
    </Dialog>
  );
}
