"use client";

import { Toaster } from "sonner";

export default function ToastProvider({ dir }: { dir: "ltr" | "rtl" }) {
  return <Toaster dir={dir} position={dir === "rtl" ? "bottom-left" : "bottom-right"} expand={false} closeButton richColors toastOptions={{ className: "rounded-card border-border-primary bg-surface-secondary text-accent shadow-elevation-3", duration: 4200 }} />;
}
