import type { AdminSocialLink } from "@/lib/social/admin";

export type SocialLinkSeed = {
  url: string;
  imageUrl: string;
  labelFa: string;
  labelEn: string;
  displayOrder: string;
  isActive: boolean;
};

const EMPTY: SocialLinkSeed = {
  url: "",
  imageUrl: "",
  labelFa: "",
  labelEn: "",
  displayOrder: "0",
  isActive: true,
};

export function seedFromLink(link: AdminSocialLink): SocialLinkSeed {
  return {
    url: link.url,
    imageUrl: link.imageUrl ?? "",
    labelFa: link.labelFa,
    labelEn: link.labelEn,
    displayOrder: String(link.displayOrder),
    isActive: link.isActive,
  };
}

export function emptySeed(): SocialLinkSeed {
  return EMPTY;
}