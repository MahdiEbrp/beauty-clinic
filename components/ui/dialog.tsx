"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui Dialog (new-york-v4), with three deliberate deviations from upstream:
 *
 * 1. `DialogFooter`'s optional close button was removed along with its `Button`
 *    import — this project has no Button component and does not need one here.
 * 2. Upstream uses `tw-animate-css` utilities (`animate-in`, `fade-in-0`,
 *    `zoom-in-95`, …). That package is not installed, so those classes would be
 *    silent no-ops. They are replaced with the project's own `animate-fade-in`
 *    and `animate-slide-up` tokens.
 * 3. Upstream positions the close button with `right-4` and aligns the header
 *    with `sm:text-left`. Both are physical properties and break in RTL, so they
 *    are `end-4` and `sm:text-start` here.
 */

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-100 bg-accent-hover/80 backdrop-blur-md data-[state=open]:animate-fade-in",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  overlayClassName,
  children,
  showCloseButton = true,
  closeLabel = "Close",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
  /** Extra classes for the backdrop, e.g. a darker scrim for media viewers. */
  overlayClassName?: string;
  /** Accessible name for the built-in close button. Must be translated. */
  closeLabel?: string;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed inset-x-0 top-1/2 z-100 grid max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] -translate-y-1/2 gap-4 overflow-y-auto rounded-panel border border-border-primary bg-surface-secondary p-6 shadow-elevation-4 outline-none data-[state=open]:animate-slide-up sm:max-w-lg",
          // Centred horizontally with `inset-x-0` + `mx-auto` (direction-agnostic,
          // no translate). A translate-based centre would fight the `ltr:`/`rtl:`
          // variants — emitted later in the cascade — whenever a consumer
          // overrides the transform (e.g. a mobile bottom sheet).
          "mx-auto",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute top-4 inset-e-4 inline-flex items-center justify-center w-11 h-11 rounded-pill border border-transparent bg-transparent text-accent transition-all duration-200 hover:bg-surface-tertiary hover:border-border-interactive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none"
          >
            <XIcon className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
            <span className="sr-only">{closeLabel}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-start", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-body-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-body-sm text-content-secondary", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
