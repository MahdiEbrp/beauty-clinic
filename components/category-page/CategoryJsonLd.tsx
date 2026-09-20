export type BreadcrumbItem = {
  label: string;
  href: string;
};

type CategoryJsonLdProps = {
  crumbs: BreadcrumbItem[];
};

function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

/**
 * schema.org BreadcrumbList for the category page. Every crumb resolves to an
 * absolute URL on the canonical site origin; the last crumb is the current
 * page (non-linkable per BreadcrumbList convention).
 */
export default function CategoryJsonLd({ crumbs }: CategoryJsonLdProps) {
  const itemListElement = crumbs.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.label,
    ...(index === crumbs.length - 1
      ? {}
      : { "@id": crumb.href, url: crumb.href }),
  }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}