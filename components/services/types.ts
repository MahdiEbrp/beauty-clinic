import type {
  AdminService,
  AdminServiceCategory,
  AdminServiceGroup,
} from "@/lib/services/types";

export type TabKey = "services" | "groups" | "categories";

export type StatusFilter = "all" | "active" | "inactive";
export type FeaturedFilter = "all" | "yes" | "no";

export type DeleteTarget =
  | { kind: "service"; item: AdminService }
  | { kind: "group"; item: AdminServiceGroup }
  | { kind: "category"; item: AdminServiceCategory };

export type ServiceDialogState =
  | { mode: "create" }
  | { mode: "edit"; service: AdminService }
  | null;

export type GroupDialogState =
  | { mode: "create" }
  | { mode: "edit"; group: AdminServiceGroup }
  | null;

export type CategoryDialogState =
  | { mode: "create" }
  | { mode: "edit"; category: AdminServiceCategory }
  | null;

export type ServiceFormValues = {
  groupId: string;
  categoryId: string;
  title: string;
  slug: string;
  shortDesc: string;
  fullDesc: string;
  price: string;
  priceType: "fixed" | "from" | "on_request";
  durationMin: string;
  sessionsCount: string;
  coverImage: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: string;
  images: Array<{ imageUrl: string; type: "before" | "after" | "gallery" }>;
  faqs: Array<{ question: string; answer: string }>;
};

export type GroupFormValues = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  displayOrder: string;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
};

export type CategoryFormValues = {
  groupId: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  displayOrder: string;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
};
