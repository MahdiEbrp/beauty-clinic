import type {
  ServiceFaqContent,
  TranslatedContent,
} from "@/lib/services/types";

export const FAQ_CONTENT: Record<string, TranslatedContent<ServiceFaqContent[]>> = {
  "gel-botox-injection": {
    fa: [
      {
        "question": "آیا تزریق ژل درد دارد؟",
        "answer": "این فرآیند سریع است؛ ما از کرم بی‌حسی موضعی و سوزن‌های ظریف استفاده می‌کنیم، بنابراین اکثر مراجعین فقط فشار خفیفی احساس می‌کنند."
      },
      {
        "question": "نتایج چقدر ماندگار است؟",
        "answer": "بسته به برند و ناحیه، ماندگاری اکثر ژل‌ها بین ۶ تا ۱۸ ماه و بوتاکس معمولاً بین ۳ تا ۶ ماه است."
      }
    ],
    en: [
      {
        "question": "Does filler injection hurt?",
        "answer": "The procedure is quick; we use topical numbing cream and fine needles, so most clients feel only slight pressure."
      },
      {
        "question": "How long do the results last?",
        "answer": "Depending on the brand and area, most fillers last between 6 and 18 months; botox typically lasts 3 to 6 months."
      }
    ]
  },
  "specialized-facial": {
    fa: [
      {
        "question": "هر چند وقت یک‌بار فیشیال انجام دهم؟",
        "answer": "برای بهترین نتیجه، هر ۳ تا ۴ هفته یک جلسه توصیه می‌شود که با چرخه بازسازی پوست هماهنگ است."
      },
      {
        "question": "آیا دوره نقاهتی وجود دارد؟",
        "answer": "خیر. بلافاصله می‌توانید به فعالیت عادی برگردید؛ قرمزی خفیف طی چند ساعت از بین می‌رود."
      }
    ],
    en: [
      {
        "question": "How often should I get a facial?",
        "answer": "For best results we recommend a session every 3 to 4 weeks, matching your skin's renewal cycle."
      },
      {
        "question": "Is there any downtime?",
        "answer": "No. You can return to your normal routine immediately; mild redness fades within a few hours."
      }
    ]
  },
  "rejuvenation-lift": {
    fa: [
      {
        "question": "به چند جلسه نیاز دارم؟",
        "answer": "اکثر مراجعین پس از ۲ تا ۴ جلسه بهبود واضح می‌بینند؛ متخصص شما برنامه را بر اساس واکنش پوست تنظیم می‌کند."
      },
      {
        "question": "چه زمانی نتیجه را می‌بینم؟",
        "answer": "با تحریک کلاژن، نتیجه طی ۲ تا ۶ هفته به‌تدریج نمایان می‌شود و با گذشت زمان بهتر می‌شود."
      }
    ],
    en: [
      {
        "question": "How many sessions will I need?",
        "answer": "Most clients see clear improvement after 2 to 4 sessions; your specialist will adjust the plan based on your skin's response."
      },
      {
        "question": "When will I see results?",
        "answer": "Results appear gradually over 2 to 6 weeks as collagen is stimulated, and continue to improve over time."
      }
    ]
  },
  "body-filler": {
    fa: [
      {
        "question": "آیا فیلر بادی ایمن است؟",
        "answer": "در صورت انجام توسط پزشک مجرب و با محصولات باکیفیت، این روش کاملاً شناخته‌شده و کم‌تهاجمی است."
      },
      {
        "question": "قیمت چگونه محاسبه می‌شود؟",
        "answer": "قیمت به‌ازای هر سی‌سی است و حجم مورد نیاز در جلسه مشاوره بر اساس هدف شما تعیین می‌شود."
      }
    ],
    en: [
      {
        "question": "Is body filler safe?",
        "answer": "When performed by an experienced physician with quality products, it is a well-established, minimally invasive procedure."
      },
      {
        "question": "How is the price calculated?",
        "answer": "Pricing is per cc, and the required volume is determined during the consultation based on your goals."
      }
    ]
  },
  "hifu-therapy": {
    fa: [
      {
        "question": "آیا هایفو دردناک است؟",
        "answer": "در طول جلسه ممکن است گرمای خفیف یا سوزن سوزن شدن احساس کنید؛ ناراحتی حداقلی است و نیازی به بی‌حسی نیست."
      },
      {
        "question": "نتایج هایفو چقدر ماندگار است؟",
        "answer": "بیشتر مراجعین ۱۲ تا ۱۸ ماه نتیجه را حفظ می‌کنند و یک تا دو جلسه ترمیمی در سال توصیه می‌شود."
      }
    ],
    en: [
      {
        "question": "Is HIFU painful?",
        "answer": "You may feel a mild warming or tingling during the session; discomfort is minimal and no anaesthesia is needed."
      },
      {
        "question": "How long do HIFU results last?",
        "answer": "Most clients maintain results for 12 to 18 months, with touch-up sessions recommended once or twice a year."
      }
    ]
  },
  "microneedling": {
    fa: [
      {
        "question": "چند جلسه لازم است؟",
        "answer": "یک دوره معمول ۳ تا ۵ جلسه با فاصله ۴ هفته برای بهترین بازسازی کلاژن است."
      },
      {
        "question": "دوره نقاهت چقدر است؟",
        "answer": "پوست ۲۴ تا ۴۸ ساعت مثل آفتاب‌سوختگی خفیف قرمز است؛ اکثر مراجعین روز بعد سر کار برمی‌گردند."
      }
    ],
    en: [
      {
        "question": "How many sessions are needed?",
        "answer": "A typical course is 3 to 5 sessions, 4 weeks apart, for the best collagen remodelling."
      },
      {
        "question": "What is the recovery time?",
        "answer": "Skin appears red like a mild sunburn for 24 to 48 hours; most clients return to work the next day."
      }
    ]
  }
};