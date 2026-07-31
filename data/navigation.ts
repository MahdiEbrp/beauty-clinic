export const navigationKeys = [
  "services",
  "about",
  "gallery",
  "contact",
] as const;

export type NavKey = (typeof navigationKeys)[number];

export const routeNavigationKeys = [
  "pricing",
  "care",
  "rules",
] as const;

export type RouteNavKey = (typeof routeNavigationKeys)[number];

export function getNavItems() {
  return navigationKeys.map((key) => ({
    key,
    href: `#${key}`,
  }));
}

export function getRouteNavItems() {
  return routeNavigationKeys.map((key) => ({
    key,
    href: `/${key}`,
  }));
}
