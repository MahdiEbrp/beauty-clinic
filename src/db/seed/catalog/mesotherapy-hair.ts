import type { SeedGroup } from "./types";
import { HAIR_MESOTHERAPY_CATEGORY } from "./meso-hair-services";
import { IMG } from "../images";

export const HAIR_MESOTHERAPY_GROUP: SeedGroup = {
  slug: "hair-mesotherapy",
  icon: "droplet",
  image: IMG.mesotherapy,
  displayOrder: 7,
  i18n: [
    {
      locale: "fa",
      name: "تقویت مو",
      description:
        "مزوتراپی و خدمات تخصصی برای تقویت ریشه، کاهش ریزش و بهبود کیفیت و تراکم مو؛ متناسب با نیاز و وضعیت موی شما.",
      seoTitle: "تقویت مو | کاهش ریزش و افزایش تراکم",
      seoDescription:
        "مزوتراپی و تقویت مو برای کاهش ریزش، تقویت ریشه و بهبود کیفیت و تراکم مو با رویکردی متناسب و تخصصی.",
    },
    {
      locale: "en",
      name: "Mesotherapy & Hair Strengthening",
      description:
        "Targeted mesotherapy to strengthen the roots, reduce hair loss and improve hair quality and density.",
      seoTitle: "Mesotherapy & Hair Strengthening",
      seoDescription:
        "Mesotherapy and hair strengthening to reduce hair loss, support the roots and improve hair quality and density.",
    },
  ],
  categories: [HAIR_MESOTHERAPY_CATEGORY],
};
