"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
import { Dialog as SheetPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui Sheet (new-york-v4), adapted like `dialog.tsx`:
 *   - imports the unified `radix-ui` package;
 *   - uses the project's own fade / drawer slide tokens (no `tw-animate-css`);
 *   - logical `start`/`end` anchoring + `rtl:` slide direction.
 *
 * `side` selects a physical edge; the exit entry mirrors via `rtl:` so an
 * end-anchored sheet slides in from the correct side in both scripts.
 */

function Sheet({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-100 bg-accent-hover/80 backdrop-blur-md data-[state=open]:animate-fade-in",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  showCloseButton = true,
  closeLabel = "Close",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  showCloseButton?: boolean;
  /** Accessible name for the built-in close button. Must be translated. */
  closeLabel?: string;
}) {
  return (
    <SheetPortal data-slot="sheet-portal">
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed inset-y-0 inset-e-0 z-100 flex h-full w-[85%] max-w-xs flex-col border-s border-border-primary bg-surface-secondary shadow-elevation-4 outline-none sm:max-w-sm data-[state=open]:animate-drawer-in-rtl rtl:data-[state=open]:animate-drawer-in",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            className="absolute top-4 inset-e-4 inline-flex size-11 items-center justify-center rounded-pill border border-transparent bg-transparent text-accent transition-all duration-200 hover:bg-surface-tertiary hover:border-border-interactive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <XIcon className="size-5" strokeWidth={2} aria-hidden="true" />
            <span className="sr-only">{closeLabel}</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 text-center sm:text-start", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col-reverse sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-body-lg font-bold leading-none text-accent", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-body-sm text-content-secondary", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
