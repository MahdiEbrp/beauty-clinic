import type { SeedGroup } from "./types";
import { THREAD_LIFT_SERVICES_CATEGORY } from "./thread-lift-services";
import { IMG } from "../images";

export const FACE_THREAD_LIFT_GROUP: SeedGroup = {
  slug: "face-thread-lift",
  icon: "peel",
  image: IMG.skinRejuvenation,
  displayOrder: 13,
  i18n: [
    {
      locale: "fa",
      name: "نخ لیفت صورت",
      description:
        "با نخ لیفت صورت، افتادگی خفیف پوست را بدون جراحی بهبود دهید و فرم و کانتور صورت را طبیعی‌تر و جوان‌تر کنید.",
      seoTitle: "نخ لیفت صورت | لیفت بدون جراحی",
      seoDescription:
        "نخ لیفت صورت برای بهبود افتادگی خفیف پوست و فرم‌دهی طبیعی چهره بدون جراحی؛ با رویکردی متناسب و ایمن.",
    },
    {
      locale: "en",
      name: "Face Thread Lift",
      description:
        "Lift and redefine your facial contours without surgery with personalized face thread lift services.",
      seoTitle: "Face Thread Lift | Non-Surgical Lifting",
      seoDescription:
        "Face thread lift to improve mild skin laxity and refine facial contours naturally, without surgery.",
    },
  ],
  categories: [THREAD_LIFT_SERVICES_CATEGORY],
};
