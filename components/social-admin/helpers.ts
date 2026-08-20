import type { AdminSocialLink } from "@/lib/social/admin";

export type SocialLinkStatus = "active" | "inactive";

export function statusOf(link: AdminSocialLink): SocialLinkStatus {
  return link.isActive ? "active" : "inactive";
}

export const statusClass: Record<SocialLinkStatus, string> = {
  active: "bg-success/10 text-success border-success/30",
  inactive: "bg-surface-tertiary text-content-secondary border-border-primary",
};