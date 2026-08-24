"use client";

import { useTranslations } from "next-intl";
import type { MessageNamespace } from "@/src/i18n/message-key";
import { ImageIcon } from "lucide-react";

import GroupGlyph from "../../create-group/GroupGlyph";
import { Panel } from "../../create-group/ui";

export default function AppearanceStep({
  iconKey,
  onOpenIconPicker,
  ns = "guideWizard",
}: {
  iconKey: string;
  onOpenIconPicker: () => void;
  ns?: MessageNamespace;
}) {
  const t = useTranslations(ns);

  return (
    <Panel>
      <div className="grid gap-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-dash-heading font-bold tracking-tight text-content-primary">
              {t("appearance.title")}
            </h3>
            <p className="mt-1 max-w-xl text-dash-body-sm text-content-secondary">
              {t("appearance.hint")}
            </p>
          </div>
          <span className="hidden shrink-0 items-center gap-2 rounded-pill bg-copper/10 px-3 py-1.5 text-dash-caption font-bold text-copper-strong sm:inline-flex">
            <ImageIcon className="size-4" aria-hidden="true" />
            {t("appearance.badge")}
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenIconPicker}
          aria-label={t("iconPicker.title")}
          className="inline-flex min-h-12 w-fit items-center gap-3 rounded-control border border-border-interactive bg-surface-secondary px-3.5 py-2.5 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-pill border border-border-primary bg-surface-tertiary text-copper-strong">
            <GroupGlyph name={iconKey} size={20} />
          </span>
          <span>{t("appearance.icon")}</span>
        </button>
      </div>
    </Panel>
  );
}
