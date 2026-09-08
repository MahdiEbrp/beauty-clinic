"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ServicesPaginationProps = {
  page: number;
  totalPages: number;
  pageSize: number;
  sizes: readonly number[];
  pageNumbers: (number | string)[];
  onGoTo: (page: number) => void;
  onPageSize: (size: number) => void;
};

/** Directory pagination controls + page-size selector (Template parity). */
export function ServicesPagination({ page, totalPages, pageSize, sizes, pageNumbers, onGoTo, onPageSize }: ServicesPaginationProps) {
  const t = useTranslations("booking");

  const navClass = (disabled: boolean) =>
    cn(
      "flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border-primary bg-surface-primary text-content-secondary transition-colors hover:border-copper hover:text-content-primary disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
      disabled && "cursor-not-allowed",
    );

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border-primary bg-surface-tertiary/60 p-3 text-caption text-content-secondary select-none sm:flex-row sm:px-4 sm:py-2.5">
      <div className="order-2 flex items-center gap-1.5 sm:order-1">
        <span className="font-bold text-content-tertiary">{t("services.perPage")}</span>
        <div className="flex items-center gap-1 rounded-pill border border-border-primary bg-surface-primary p-0.5">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onPageSize(size)}
              className={cn(
                "rounded-pill px-2 py-1 text-caption font-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                pageSize === size ? "bg-accent text-content-contrast shadow-xs" : "cursor-pointer text-content-secondary hover:text-content-primary",
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="order-1 flex flex-wrap items-center justify-center gap-1 sm:order-2">
        <button type="button" onClick={() => onGoTo(1)} disabled={page === 1} aria-label={t("services.pageFirst")} className={navClass(page === 1)}>
          <ChevronsRight className="rtl-mirror size-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => onGoTo(page - 1)} disabled={page === 1} aria-label={t("services.pagePrev")} className={navClass(page === 1)}>
          <ChevronRight className="rtl-mirror size-4" aria-hidden="true" />
        </button>

        {pageNumbers.map((pageNum, index) =>
          pageNum === "…" ? (
            <span key={`ellipsis-${index}`} className="px-1.5 text-caption font-black text-content-tertiary">
              …
            </span>
          ) : (
            <button
              key={`page-${pageNum}`}
              type="button"
              onClick={() => onGoTo(pageNum as number)}
              aria-current={pageNum === page ? "page" : undefined}
              className={cn(
                "flex size-9 cursor-pointer items-center justify-center rounded-lg text-caption font-black transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                pageNum === page
                  ? "bg-accent text-content-contrast shadow-xs"
                  : "border border-border-primary bg-surface-primary text-content-secondary hover:border-copper hover:text-content-primary",
              )}
            >
              {pageNum}
            </button>
          ),
        )}

        <button type="button" onClick={() => onGoTo(page + 1)} disabled={page === totalPages} aria-label={t("services.pageNext")} className={navClass(page === totalPages)}>
          <ChevronLeft className="rtl-mirror size-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => onGoTo(totalPages)} disabled={page === totalPages} aria-label={t("services.pageLast")} className={navClass(page === totalPages)}>
          <ChevronsLeft className="rtl-mirror size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}