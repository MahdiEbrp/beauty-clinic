export type GroupRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  displayOrder: number;
  isActive: boolean;
  categoryCount: number;
  translations: {
    fa: { name: string; description: string | null };
    en: { name: string; description: string | null };
  };
};

export type CategoryRow = {
  id: string;
  groupId: string;
  groupName: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  displayOrder: number;
  isActive: boolean;
  serviceCount: number;
  translations: {
    fa: { name: string; description: string | null };
    en: { name: string; description: string | null };
  };
};
