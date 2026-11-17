"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useFiles } from "./files-context";

const TYPES = ["all", "folders", "files"] as const;

export function FilesTypeFilter() {
  const t = useTranslations("files");
  const locale = useLocale();
  const { entryType, setEntryType } = useFiles();
  return (
    <SelectPrimitive.Root
      value={entryType}
      dir={locale === "fa" ? "rtl" : "ltr"}
      onValueChange={(value) => {
        const type = TYPES.find((item) => item === value);
        if (type) setEntryType(type);
      }}
    >
      <SelectPrimitive.Trigger
        aria-label={t("typeFilter")}
        className="flex min-h-11 items-center justify-between gap-2 rounded-control border border-form-input-border bg-form-input-bg px-3 text-dash-body-sm font-bold text-accent transition-colors hover:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent data-[state=open]:border-copper data-[state=open]:ring-1 data-[state=open]:ring-copper"
      >
        <span>{t("typeFilter")}</span>
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content position="popper" sideOffset={4} className="z-50 overflow-hidden rounded-control border border-border-primary bg-surface-secondary text-accent shadow-elevation-3">
          <SelectPrimitive.Viewport className="p-1">
            {TYPES.map((type) => (
              <SelectPrimitive.Item key={type} value={type} className="relative flex min-h-11 cursor-pointer select-none items-center rounded-control ps-3 pe-10 text-dash-body-sm text-accent outline-none focus:bg-surface-tertiary data-highlighted:bg-surface-tertiary data-[state=checked]:bg-accent-subtle data-[state=checked]:font-bold">
                <SelectPrimitive.ItemText>{t(`filterTypes.${type}`)}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute end-3 inline-flex items-center">
                  <Check className="size-4 text-copper-strong" aria-hidden="true" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
