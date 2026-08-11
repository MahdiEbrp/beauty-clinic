"use client";

import { iconForCatalog } from "@/data/services";
import { usePublicCatalog } from "@/lib/hooks/use-public-catalog";

const SKELETON_COUNT = 3;

export default function ServiceDetailCards() {
  const catalog = usePublicCatalog();
  const categories = catalog?.categories ?? [];

  if (categories.length === 0) {
    return (
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        role="status"
      >
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <div
            key={index}
            className="bg-surface-secondary border border-border-primary rounded-panel p-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-surface-primary rounded-control animate-pulse" />
              <div className="h-6 w-40 bg-surface-primary rounded animate-pulse" />
            </div>
            <div className="h-4 w-full bg-surface-primary rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-surface-primary rounded animate-pulse mt-2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => {
        const Icon = iconForCatalog(category.icon);

        return (
          <article
            key={category.slug}
            className="bg-surface-secondary border border-border-primary rounded-panel p-8 relative overflow-hidden transition-all duration-300 flex flex-col hover:-translate-y-2 hover:shadow-elevation-3 hover:border-transparent hover:bg-surface-tertiary group"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-surface-primary text-copper rounded-control flex items-center justify-center transition-all duration-300 shrink-0 group-hover:bg-accent group-hover:text-content-contrast group-hover:scale-110 group-hover:-rotate-12">
                <Icon className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
              </div>
              <h3 className="text-heading-3 font-bold m-0 text-accent">
                {category.title}
              </h3>
            </div>
            <p className="mt-auto text-body-sm text-content-secondary leading-relaxed">
              {category.description}
            </p>
          </article>
        );
      })}
    </div>
  );
}