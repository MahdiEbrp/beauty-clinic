"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, Folder, Home } from "lucide-react";
import { useFiles } from "./files-context";

function segmentName(segment: string): string {
  const parts = segment.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? segment;
}

export function Breadcrumbs() {
  const t = useTranslations();
  const { path, setPath } = useFiles();

  const segments = path === "" ? [] : path.split("/");

  const navigate = (index: number) => {
    const rel = segments.slice(0, index + 1).join("/");
    setPath(rel);
  };

  return (
    <nav
      aria-label={t("files.heading")}
      className="flex min-w-0 items-center gap-1 overflow-x-auto py-1"
    >
      <button
        type="button"
        onClick={() => setPath("")}
        aria-current={segments.length === 0 ? "page" : undefined}
        className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-pill px-2 text-dash-caption font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          segments.length === 0
            ? "bg-accent/10 text-accent"
            : "text-content-secondary hover:bg-surface-tertiary hover:text-accent"
        }`}
      >
        <Home className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">{t("files.root")}</span>
      </button>

      {segments.map((segment, index) => (
        <span key={`${segment}-${index}`} className="flex min-w-0 items-center gap-1">
          <ChevronLeft
            className="size-4 shrink-0 text-content-tertiary rtl-mirror"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => navigate(index)}
            aria-current={index === segments.length - 1 ? "page" : undefined}
            className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-pill px-2 text-dash-caption font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              index === segments.length - 1
                ? "bg-accent/10 text-accent"
                : "text-content-secondary hover:bg-surface-tertiary hover:text-accent"
            }`}
          >
            <Folder className="size-4" aria-hidden="true" />
            <span className="max-w-32 truncate sm:max-w-48">
              {segmentName(segment)}
            </span>
          </button>
        </span>
      ))}
    </nav>
  );
}
