"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui NavigationMenu (new-york-v4), adapted like `sheet.tsx`:
 *   - imports the unified `radix-ui` package;
 *   - uses the project's own fade tokens (no `tw-animate-css`);
 *   - logical properties + token radii/elevations; no hardcoded colors.
 *
 * The animated viewport is positioned by the consumer (absolute under the
 * navbar row); its width tracks `--radix-navigation-menu-viewport-width` and
 * height animates on `--radix-navigation-menu-viewport-height`.
 *
 * IMPORTANT: `NavigationMenuContent` must be `w-full` so Radix measures the
 * *actual* rendered width of its children (e.g. the mega menu's
 * `w-[min(92vw,58rem)]` grid) rather than shrinking to fit an unconstrained
 * absolutely-positioned box. Without this, `--radix-navigation-menu-viewport-width`
 * gets published as a too-small value and the viewport (which uses that var
 * and clips with `overflow-hidden`) squeezes all mega menu content into a
 * narrow column.
 */

function NavigationMenu({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root>) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn("relative z-10 flex max-w-max items-center justify-center", className)}
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn("flex list-none items-center justify-center gap-1", className)}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

const navigationMenuTriggerStyle = () =>
  "inline-flex h-11 items-center justify-center whitespace-nowrap rounded-control bg-transparent px-4 py-2 text-body-sm font-semibold text-content-secondary no-underline transition-colors hover:bg-surface-tertiary hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent-subtle data-[state=open]:text-accent";

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}
      <ChevronDownIcon
        className="relative top-px ms-1.5 size-3.5 shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180"
        strokeWidth={2}
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        // w-full (not w-auto/unset) is required: Radix measures this box to
        // publish --radix-navigation-menu-viewport-width. Left unconstrained,
        // it can be measured before/without respecting the child's intrinsic
        // width, producing a too-narrow viewport that clips the mega menu.
        "left-0 top-0 w-full data-[motion^=from-]:animate-fade-in md:absolute md:w-max",
        className,
      )}
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Content>
  );
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={className}
      {...props}
    />
  );
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <NavigationMenuPrimitive.Viewport
      data-slot="navigation-menu-viewport"
      className={cn(
        "relative mt-2 h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) origin-top overflow-hidden rounded-panel border border-border-primary bg-surface-secondary shadow-elevation-3 transition-[width,height] duration-300 ease-out data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in",
        className,
      )}
      {...props}
    />
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};