export const navigationKeys = [
  "services",
  "about",
  "gallery",
  "contact",
] as const;

export type NavKey = (typeof navigationKeys)[number];

export function getNavItems() {
  return navigationKeys.map((key) => ({
    key,
    href: `#${key}`,
  }));
}
