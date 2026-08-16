"use client";

import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;
const AlertDialogOverlay = ({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) => <AlertDialogPrimitive.Overlay className={cn("fixed inset-0 z-130 bg-accent-hover/80 backdrop-blur-md data-[state=open]:animate-fade-in", className)} {...props} />;
const AlertDialogContent = ({ className, children, closeLabel = "Close", ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Content> & { closeLabel?: string }) => <AlertDialogPortal><AlertDialogOverlay /><AlertDialogPrimitive.Content className={cn("fixed top-1/2 inset-s-1/2 z-130 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-y-1/2 gap-5 overflow-y-auto rounded-panel border border-border-primary bg-surface-secondary p-6 shadow-elevation-4 outline-none rtl:translate-x-1/2 ltr:-translate-x-1/2 data-[state=open]:animate-slide-up", className)} {...props}>{children}<AlertDialogPrimitive.Cancel className="absolute top-4 inset-e-4 inline-flex size-11 items-center justify-center rounded-pill border border-transparent text-accent transition hover:border-border-interactive hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><XIcon className="size-5" aria-hidden="true" /><span className="sr-only">{closeLabel}</span></AlertDialogPrimitive.Cancel></AlertDialogPrimitive.Content></AlertDialogPortal>;
const AlertDialogHeader = ({ className, ...props }: React.ComponentProps<"div">) => <div className={cn("grid gap-2 pe-8 text-start", className)} {...props} />;
const AlertDialogFooter = ({ className, ...props }: React.ComponentProps<"div">) => <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
const AlertDialogTitle = ({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) => <AlertDialogPrimitive.Title className={cn("text-body-lg font-bold text-accent", className)} {...props} />;
const AlertDialogDescription = ({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Description>) => <AlertDialogPrimitive.Description className={cn("text-body-sm leading-6 text-content-secondary", className)} {...props} />;
const AlertDialogAction = ({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Action>) => <AlertDialogPrimitive.Action className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-error px-5 text-body-sm font-bold text-content-contrast transition hover:bg-error/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:pointer-events-none disabled:opacity-50", className)} {...props} />;
const AlertDialogCancel = ({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) => <AlertDialogPrimitive.Cancel className={cn("inline-flex min-h-11 items-center justify-center rounded-pill bg-surface-tertiary px-5 text-body-sm font-bold text-accent transition hover:bg-surface-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent", className)} {...props} />;

export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger };
