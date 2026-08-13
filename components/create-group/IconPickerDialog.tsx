"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GROUP_ICONS } from "@/data/group-icons";
import { inputClass } from "./ui";

export default function IconPickerDialog({
  open,
  onOpenChange,
  selected,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: string;
  onSelect: (key: string) => void;
}) {
  const t = useTranslations("groupWizard");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return GROUP_ICONS;
    return GROUP_ICONS.filter((entry) =>
      entry.key.toLowerCase().includes(query),
    );
  }, [search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        closeLabel={t("iconPicker.title")}
        className="max-w-lg gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="border-b border-border-primary bg-surface-tertiary/35 px-6 pb-4 pt-6 text-start">
          <DialogTitle className="text-dash-heading font-bold tracking-tight text-accent">
            {t("iconPicker.title")}
          </DialogTitle>
        </DialogHeader>
        <div className="border-b border-border-primary p-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute inset-y-0 start-3.5 my-auto size-4 text-content-tertiary"
              aria-hidden="true"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("iconPicker.searchPlaceholder")}
              className={`${inputClass(false)} ps-10`}
              aria-label={t("iconPicker.searchPlaceholder")}
            />
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-dash-body-sm text-content-tertiary">
              {t("iconPicker.empty")}
            </p>
          ) : (
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
              {filtered.map(({ key, icon: Icon }) => {
                const isSelected = key === selected;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSelect(key)}
                    title={key}
                    aria-pressed={isSelected}
                    aria-label={key}
                    className={`flex aspect-square items-center justify-center rounded-control border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      isSelected
                        ? "border-accent bg-accent text-on-primary"
                        : "border-border-primary bg-surface-secondary text-content-secondary hover:border-border-interactive hover:bg-surface-tertiary"
                    }`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
