export const RESERVE_STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  confirmed: "bg-copper-deep/10 text-copper-strong border-copper-deep/30",
  paid: "bg-success/10 text-success border-success/30",
  cancelled: "bg-surface-tertiary text-content-secondary border-border-primary",
};

export const SLOT_STATUS_CLASS: Record<"true" | "false", string> = {
  true: "bg-success/10 text-success border-success/30",
  false: "bg-surface-tertiary text-content-secondary border-border-primary",
};
