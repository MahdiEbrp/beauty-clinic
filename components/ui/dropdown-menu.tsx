"use client";

import * as React from "react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuSeparator = ({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) => (
  <DropdownMenuPrimitive.Separator
    className={cn("-mx-1 my-1 h-px bg-border-primary", className)}
    {...props}
  />
);
const DropdownMenuContent = ({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      sideOffset={sideOffset}
      collisionPadding={12}
      className={cn(
        "z-120 w-max min-w-[min(13rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] max-h-[min(24rem,calc(100dvh-1.5rem))] overflow-x-hidden overflow-y-auto overscroll-contain rounded-card border border-border-primary bg-surface-secondary p-2 text-accent shadow-elevation-4 outline-none",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
);
const DropdownMenuItem = ({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
}) => (
  <DropdownMenuPrimitive.Item
    className={cn(
      "flex min-h-11 min-w-0 cursor-pointer select-none items-center gap-2 rounded-control px-3 text-start  text-sm  outline-none transition-colors focus:bg-surface-tertiary data-disabled:pointer-events-none data-disabled:opacity-45",
      inset && "ps-8",
      className,
    )}
    {...props}
  />
);

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};
