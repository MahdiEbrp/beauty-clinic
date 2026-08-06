import type { AdminUser } from "@/lib/users/service";

export type StatusFilter = "all" | "active" | "inactive" | "banned";
export type RoleFilter =
  | "all"
  | "admin"
  | "doctor"
  | "receptionist"
  | "customer";
export type ConfirmAction = "ban" | "deactivate" | "delete";
export type BulkAction =
  | "activate"
  | "deactivate"
  | "ban"
  | "unban"
  | "change-role"
  | "delete"
  | "reset-password";
export type DestructiveConfirm =
  | { kind: "row"; user: AdminUser; action: ConfirmAction }
  | { kind: "bulk"; action: BulkAction };

export const ROLE_KEYS = ["admin", "doctor", "receptionist", "customer"] as const;