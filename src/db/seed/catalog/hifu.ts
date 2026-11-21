import type { SeedGroup } from "./types";
import { svc, withSeo } from "./types";
import { IMG } from "../images";

export const HIFU_GROUP: SeedGroup = {
  slug: "hifu",
  icon: "hifu",
  image: IMG.hifu,
  displayOrder: 9,
  i18n: [
    {
      locale: "fa",
      name: "هایفوتراپی",
      description:
        "خدمات هایفوتراپی صورت و بدن؛ توضیحات و تصاویر هر خدمت پس از ورود به همین صفحه نمایش داده می‌شود.",
      seoTitle: "هایفوتراپی | خدمات لیفت و سفتی پوست",
      seoDescription:
        "مشاهده خدمات هایفوتراپی صورت و بدن و اطلاعات هر خدمت. قیمت پس از ثبت در پنل مدیریت نمایش داده می‌شود.",
    },
    {
      locale: "en",
      name: "HIFU",
      description:
        "HIFU services for face and body, with treatment details and photos displayed on this page.",
      seoTitle: "HIFU | Skin Lifting & Tightening Services",
      seoDescription:
        "Explore HIFU services for face and body. Pricing can be added later from the admin dashboard.",
    },
  ],
  categories: [
    {
      slug: "hifu-services",
      icon: "hifu",
      displayOrder: 0,
      i18n: [
        {
          locale: "fa",
          name: "خدمات هایفو",
          description:
            "خدمات هایفوتراپی؛ برای مشاهده توضیحات و تصاویر هر خدمت وارد جزئیات آن شوید.",
          seoTitle: "خدمات هایفوتراپی | لیفت و سفتی پوست",
          seoDescription:
            "اطلاعات خدمات هایفوتراپی صورت و بدن.",
        },
        {
          locale: "en",
          name: "HIFU Services",
          description:
            "HIFU treatments with individual service descriptions and photos.",
          seoTitle: "HIFU Services | Skin Lifting & Tightening",
          seoDescription: "Information about HIFU face and body services.",
        },
      ],
      services: [
        withSeo(
          svc("hifu-treatment", "هایفوتراپی", "HIFU Treatment", null, 0, "on_request"),
          {
            fa: {
              shortDesc: "خدمات هایفوتراپی؛ برای اطلاع از جزئیات و هزینه با کلینیک تماس بگیرید.",
              seoTitle: "هایفوتراپی | اطلاعات و مشاوره",
              seoDescription: "معرفی خدمات هایفوتراپی؛ مبلغ خدمت پس از تعیین در پنل مدیریت قابل نمایش است.",
            },
            en: {
              shortDesc: "HIFU treatment services. Contact the clinic for details and pricing.",
              seoTitle: "HIFU Treatment | Information & Consultation",
              seoDescription: "Information about HIFU treatment services. Pricing can be configured in the admin dashboard.",
            },
          },
        ),
      ],
    },
  ],
};
