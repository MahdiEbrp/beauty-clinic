"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, ArrowRight, CalendarDays } from "lucide-react";
import { findCartConflicts } from "@/lib/booking/scheduling";
import { SlotLabel } from "../SlotLabel";
import DateModal from "./DateModal";
import type { CartItem, SlotOption } from "../types";

type ScheduleStepProps = {
  cart: CartItem[];
  onAssignSlot: (groupId: string, slot: SlotOption | null) => void;
  onBack: () => void;
};

/**
 * Step 2 — ONE shared date & time picker applied to ALL selected services.
 *
 * The customer chooses a single date+slot once; every cart line receives the
 * same slot. `findCartConflicts` intentionally skips pairs whose slot ids are
 * identical, so a shared slot creates no false self-conflicts and the cart is
 * considered fully scheduled as soon as one slot is chosen.
 */
export default function ScheduleStep({ cart, onAssignSlot, onBack }: ScheduleStepProps) {
  const t = useTranslations("booking");
  const [modalOpen, setModalOpen] = useState(false);
  const [sharedSlot, setSharedSlot] = useState<SlotOption | null>(null);

  const selectedSlot = sharedSlot ?? cart[0]?.slot ?? null;
  const conflicts = findCartConflicts(cart);

  const primaryGroup = cart[0]?.group ?? null;

  const openPicker = () => {
    if (!primaryGroup) return;
    setModalOpen(true);
  };

  // One slot for every line: assign the chosen slot to all cart lines at once.
  const assignToAll = (_groupId: string, slot: SlotOption) => {
    setSharedSlot(slot);
    cart.forEach((line) => onAssignSlot(line.group.id, slot));
    setModalOpen(false);
  };


  if (cart.length === 0) {
    return (
      <div className="w-full space-y-4">
        <div className="rounded-panel border border-dashed border-border-primary bg-surface-secondary p-10 text-center">
          <AlertCircle className="mx-auto mb-3 size-10 text-copper" aria-hidden="true" />
          <h3 className="text-body font-black text-content-primary">{t("schedule.noGroupsTitle")}</h3>
          <p className="mx-auto mt-1 max-w-sm text-caption text-content-secondary">{t("schedule.noGroupsDesc")}</p>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-pill bg-accent px-5 text-body-sm font-black text-content-contrast transition-colors hover:bg-copper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ArrowRight className="rtl-mirror size-4" aria-hidden="true" />
            {t("schedule.backToGroups")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Top bar */}
      <div className="rounded-panel border border-border-primary/80 bg-surface-secondary/70 p-3 shadow-xs sm:p-3.5">
        <div className="flex flex-col justify-between gap-2.5 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-body-lg font-black tracking-tight text-accent">{t("schedule.title")}</h2>
            <span className="rounded-pill border border-border-primary/80 bg-surface-primary px-2.5 py-0.5 text-caption font-black text-copper">
              {t("schedule.selectedCount", { n: cart.length })}
            </span>
          </div>


        </div>
      </div>

      {/* Conflict alert */}
      {conflicts.length > 0 ? (
        <div role="alert" className="flex items-start gap-2.5 rounded-panel border border-error/40 bg-error/5 p-3.5">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-error" aria-hidden="true" />
          <div>
            <p className="text-body-sm font-black text-error">{t("schedule.conflictsTitle")}</p>
            <p className="mt-0.5 text-caption text-content-secondary">{t("schedule.conflictsDesc")}</p>
          </div>
        </div>
      ) : null}

      {/* Table */}
      <div className="overflow-hidden rounded-panel border border-border-primary bg-surface-primary shadow-xs">
        {/* Desktop header */}
        <div className="hidden grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3 border-b border-border-primary/80 bg-surface-secondary/90 px-4 py-3 text-caption font-black text-accent md:grid">
          <div className="text-center">{t("schedule.colIndex")}</div>
          <div>{t("schedule.colGroup")}</div>
        </div>

        <div className="divide-y divide-border-primary/60">
          {cart.map((line, index) => {
            return (
              <div key={line.group.id} className="w-full bg-surface-primary even:bg-surface-secondary/15 hover:bg-surface-secondary/50">
                {/* Desktop row */}
                <div className="hidden grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3 px-4 py-3 md:grid">
                  <div className="flex items-center justify-center">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-border-interactive/70 bg-surface-secondary text-caption font-black text-content-secondary">
                      {index + 1}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <span className="text-body-sm font-black leading-snug text-content-primary">{line.group.title}</span>
                    {line.group.description ? (
                      <p className="mt-0.5 max-w-lg truncate text-caption leading-tight text-content-tertiary">{line.group.description}</p>
                    ) : null}
                  </div>

                </div>

                {/* Mobile row */}
                <div className="block space-y-2.5 p-3.5 md:hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-border-interactive bg-surface-secondary text-caption font-black text-content-secondary">
                        {index + 1}
                      </span>
                      <span className="min-w-0 truncate text-body-sm font-black text-content-primary">{line.group.title}</span>
                    </div>
                  </div>

                  {line.group.description ? (
                    <p className="truncate border-t border-border-primary/40 pt-2 text-caption text-content-tertiary">{line.group.description}</p>
                  ) : null}


                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shared date/time modal — one picker for every selected service */}
      {modalOpen && primaryGroup ? (
        <DateModal
          group={primaryGroup}
          shared
          current={selectedSlot}
          cart={cart}
          onAssign={assignToAll}
          onClose={() => setModalOpen(false)}
        />
      ) : null}

      {/* Keep the date/time action at the bottom of step 2 for mobile users. */}
      <div className="sticky bottom-0 z-20 -mx-3 border-t border-border-primary/80 bg-surface-primary/95 px-3 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:-mx-4 sm:px-4">
        <button
          type="button"
          onClick={openPicker}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-pill border border-copper bg-copper/10 px-5 text-body-sm font-black text-copper-deep transition-colors hover:bg-copper hover:text-content-contrast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <CalendarDays className="size-4" aria-hidden="true" />
          {selectedSlot && cart[0] ? <SlotLabel line={{ ...cart[0], slot: selectedSlot }} /> : t("schedule.pickDateTime")}
          <span className="font-black underline">{selectedSlot ? t("schedule.editSlot") : t("schedule.pick")}</span>
        </button>
      </div>
      <div aria-hidden="true" className="h-2 sm:h-3" />
    </div>
  );
}
