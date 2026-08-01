[7/30/26 9:20 AM] Mahdi: # قانون‌نامهٔ جامع طراحی و توسعهٔ وب



معیارها: طراحی ۱۰/۱۰ · امنیت ۱۰/۱۰ · سئو ۱۰/۱۰ · نمایش بصری ۱۰/۱۰ · استانداردهای وب/موزیلا ۱۰/۱۰ · چندزبانگی ۱۰/۱۰ · درخواست سرور ۱۰/۱۰

---

## الف) طراحی بصری (۱–۱۸)

1. هیچ رنگ hex مستقیم در JSX/CSS — فقط CSS variables یا Tailwind token.
2. کنتراست حداقل ۴.۵:۱ برای متن معمولی، ۳:۱ برای متن بزرگ (WCAG AA)، در حالت روشن و تاریک جداگانه تست شود.
3. حداکثر ۶ اندازهٔ فونت (type scale) در کل پروژه.
4. line-height بین ۱.۴ تا ۱.۶ برای متن بدنه.
5. تمام spacing‌ها مضربی از واحد پایه (۴px یا ۸px)؛ هیچ مقدار دلخواه مجاز نیست.
6. حداکثر ۲ فونت اصلی در کل سایت (یک برای fa، یک برای en).
7. انیمیشن‌ها بین ۱۵۰ تا ۳۰۰ میلی‌ثانیه، و prefers-reduced-motion رعایت شود.
8. هیچ عنصر تعاملی زیر ۴۴×۴۴px نباشد.
9. آیکون‌های تنها (بدون متن همراه) باید aria-label داشته باشند.
10. **آیکون‌ها فقط از کتابخانهٔ کامپوننتی lucide-react استفاده شوند، نه SVG خام یا inline.** این کار یکدستی سایز/ضخامت خط (stroke-width) را تضمین می‌کند، امکان styling با prop (size, className, color) می‌دهد، tree-shaking واقعی دارد (فقط آیکون‌های import‌شده در باندل می‌مانند)، و از ریسک‌های SVG دستی/چسبانده‌شده (مثل نیاز احتمالی به dangerouslySetInnerHTML) دور می‌ماند.
11. سایه‌ها (box-shadow) از یک مقیاس ثابت (۳ تا ۴ سطح عمق) بیایند.
12. radius گوشه‌ها از یک token ثابت استفاده شود.
13. حالت‌های تعاملی هر کامپوننت کامل باشد: default, hover, active, focus, disabled, loading.
14. حالت focus هرگز با outline: none بدون جایگزین حذف نشود.
15. تصاویر همیشه aspect-ratio ثابت داشته باشند تا از layout shift جلوگیری شود.
16. Empty state و Error state هر لیست/جدول باید طراحی بصری اختصاصی داشته باشد.
17. Skeleton loading به‌جای اسپینر تنها، برای محتوای لیستی/جدولی.
18. تضاد بصری بین برند اصلی و رنگ‌های خطا/هشدار/موفقیت باید واضح و غیرقابل اشتباه باشد.

## ب) امنیت (۱۹–۳۵)

19. هیچ secret/API key در کد کلاینت یا git commit نباشد.
20. تمام ورودی کاربر با Zod در سمت سرور اعتبارسنجی شود، نه فقط کلاینت.
21. هدرهای امنیتی اجباری: CSP، X-Frame-Options: DENY، X-Content-Type-Options: nosniff، Strict-Transport-Security، Referrer-Policy.
22. Rate limiting روی لاگین، پرداخت، فرم تماس.
23. هیچ raw SQL با string concatenation — فقط parameterized/ORM query.
24. رمز عبور فقط با bcrypt یا argon2 هش شود.
25. Auth token در httpOnly + secure + sameSite=strict cookie، هرگز در localStorage.
26. آپلود فایل: بررسی MIME واقعی، محدودیت حجم، sanitize نام فایل.
27. لاگ‌ها هرگز رمز عبور، توکن، یا دادهٔ پرداخت را ثبت نکنند.
28. npm audit/Dependabot پیش از هر deploy اجرا شود.
29. هر endpoint حساس نیاز به authorization check دارد، نه فقط authentication.
30. CORS فقط برای origin‌های مشخص باز شود، نه *.
31. داده‌های حساس (شماره کارت، کد ملی) رمزنگاری‌شده در دیتابیس ذخیره شوند.
32. Session expiry و refresh token rotation فعال باشد.
33. حملهٔ brute-force روی لاگین با lockout موقت مسدود شود.
34. هیچ dangerouslySetInnerHTML بدون sanitize (مثل DOMPurify) استفاده نشود.
35. تمام کلیدهای environment در .env باشند و .env در .gitignore قرار گیرد.

## ج) سئو (۳۶–۵۱)

36. هر صفحه <title> و meta description منحصربه‌فرد دارد.
37. از Next.js Metadata API استفاده شود، نه <Head> دستی.
38. یک <h1> در هر صفحه؛ سلسله‌مراتب h2→h3 صحیح.
39. استفاده از <nav>, <main>, <article>, <section> به‌جای <div> عمومی.
40. hreflang برای نسخه‌های fa/en هر صفحه.
41. lang صحیح روی <html> (fa یا en، پویا).
42. JSON-LD structured data برای صفحات محصول/سازمان/breadcrumb.
43. sitemap.xml پویا (sitemap.ts).
44. robots.txt پویا و کنترل‌شده.
45. LCP زیر ۲.۵ ثانیه.
46. INP زیر ۲۰۰ میلی‌ثانیه.
47. CLS زیر ۰.۱.
48. تمام تصاویر با next/image؛ تمام فونت‌ها با next/font.
49. URLها kebab-case و معنادار، بدون query string غیرضروری.
50. Canonical URL روی هر صفحه (به‌خصوص بین نسخهٔ fa/en).
51. Alt text معنادار برای هر تصویر (نه خالی، نه فقط نام فایل).

## د) استانداردهای وب / موزیلا (۵۲–۶۶)
[7/30/26 9:20 AM] Mahdi: 52. HTML باید معتبر (valid) باشد — چک با W3C Validator.
53. فرم‌ها <label for> مرتبط با input دارند.
54. خطاهای فرم با aria-live="polite" اعلام شوند.
55. ناوبری کامل با کیبورد (Tab, Enter, Escape, Arrow) در تمام کامپوننت‌ها.
56. عناصر بومی (<button>, <a>) به‌جای <div onClick> استفاده شوند.
57. کامپوننت سفارشی (مثل date/time picker) باید role و aria-* کامل معادل استاندارد HTML داشته باشد.
58. بدون vendor-prefix دستی — فقط Autoprefixer/PostCSS.
59. تست کراس‌براوزر روی Chrome, Firefox, Safari (خصوصاً رندر RTL و فونت فارسی).
60. فایل‌های استاتیک با Cache-Control صحیح.
61. فشرده‌سازی gzip/brotli فعال باشد.
62. تصاویر در فرمت مدرن (WebP/AVIF) با fallback.
63. هیچ کد بلااستفاده (dead code/CSS) در باندل نهایی نباشد — tree-shaking فعال.
64. Console error/warning در production نباید ظاهر شود.
65. تمام کامپوننت‌های تعاملی باید با screen reader (NVDA/VoiceOver) قابل استفاده باشند.
66. Favicon و meta viewport استاندارد در هر صفحه تعریف شده باشد.

## ه) چندزبانگی / RTL (۶۷–۸۱)

67. هیچ رشتهٔ متنی hardcoded در JSX — همه از فایل ترجمه (next-intl) بیایند.
68. سوییچ زبان بدون reload و بدون از دست دادن state فعلی.
69. dir="rtl"/dir="ltr" پویا روی <html>، نه فقط CSS.
70. استفاده از logical properties (margin-inline-start به‌جای margin-left).
71. منطق تبدیل تقویم جلالی/میلادی فقط در یک hook مرکزی (useCalendar()).
72. اعداد همیشه به صورت English digits ذخیره و رندر شوند (مثلاً ۱۰,۰۰۰) — ss01 فونت به صورت بصری آنها را به فارسی (۱۰,۰۰۰) تبدیل می‌کند.
73. فونت واحد: Estedad برای تمام localeها — بدون Inter، با ss01 برای حروف و اعداد فارسی فعال.
74. رقم‌ها هرگز از طریق Intl.NumberFormat فارسی نشوند — فقط از ss01 فونت برای تبدیل بصری استفاده شود.
75. آیکون‌های جهت‌دار (فلش/chevron) در RTL آینه شوند.
76. تاریخ و ساعت نمایشی مطابق locale فرمت شود (نه فرمت ثابت میلادی).
77. ترتیب فوکوس کیبورد (tab order) در RTL باید منطقی و معکوس‌شده باشد.
78. متن‌های دوزبانه (مثل input‌های عددی) باید جهت صحیح (unicode-bidi) داشته باشند.
79. کوتاه‌نویسی/truncate متن نباید در RTL باعث بریدگی اشتباه شود.
80. واحد پول و ارز بر اساس locale نمایش داده شود (ریال/تومان با جداکنندهٔ هزارگان صحیح، از طریق Intl.NumberFormat).
81. پیام‌های اعتبارسنجی فرم، placeholder، tooltip و alt باید ترجمه‌شده و locale-aware باشند (نه فقط متن اصلی UI).

## و) درخواست سرور / API (۸۲–۹۶)

82. عملیات نوشتنی (mutation) فقط در Server Action یا Route Handler، نه فچ مستقیم کلاینت به دیتابیس.
83. هر درخواست باید loading, error, empty state مشخص داشته باشد.
84. Optimistic UI فقط برای عملیات کم‌ریسک (toggle)؛ عملیات مالی منتظر تأیید سرور بماند.
85. Retry با exponential backoff و سقف تلاش مشخص برای درخواست‌های ناپایدار.
86. تفکیک آگاهانهٔ cache: force-cache / no-store / revalidate بر اساس حساسیت داده.
87. Idempotency key برای عملیات مالی/تصفیه‌حساب.
88. Versioning API (/api/v1/...).
89. ساختار خطای یکنواخت { error: { code, message } } در همهٔ endpoint‌ها.
90. Timeout مشخص برای هر فراخوانی خارجی (مثل درگاه پرداخت).
91. Pagination اجباری برای هر لیست بزرگ (هرگز fetch کامل جدول).
92. Webhook‌های خارجی (مثل Zarinpal callback) باید امضا/signature تأیید شوند.
93. جداسازی validation schema بین کلاینت و سرور از یک منبع مشترک (Zod schema).
94. عملیات حذف (delete) حساس باید soft-delete باشد، نه حذف فیزیکی فوری.
95. Transaction دیتابیسی برای عملیات چندمرحله‌ای (مثل ثبت تصفیه‌حساب ماهانه).
96. لاگ ساختاریافته (structured logging) برای هر خطای سرور، با request ID قابل ردیابی.

## ز) کیفیت کد و نگهداری (۹۷–۱۰۱)

97. Type-safety کامل با TypeScript strict mode، بدون any غیرضروری.
98. هر کامپوننت مسئولیت واحد داشته باشد؛ کامپوننت‌های بیش از حد بزرگ تفکیک شوند.
99. تست‌های حیاتی (auth، پرداخت، محاسبهٔ حقوق/شیفت) باید unit test داشته باشند.
100. مستندسازی مختصر (README/ADR) برای هر تصمیم معماری مهم.
101. Code review اجباری قبل از merge به main/production branch.

---

## خلاصهٔ سخت‌گیرانه‌ترین قوانین (در صورت کمبود وقت)
[7/30/26 9:20 AM] Mahdi: - هیچ رنگ/فاصله hardcoded؛ فقط توکن.
- آیکون فقط از lucide-react؛ هیچ SVG خام/inline نه.
- هیچ secret در کلاینت؛ همهٔ ورودی سمت سرور اعتبارسنجی شود.
- هر صفحه: یک h1 + metadata یکتا + Core Web Vitals سبز.
- dir پویا + logical properties + سوییچ زبان بدون بازخوانی + فونت Estedad برای fa.
- اعداد فقط از یک مسیر فارسی شوند ( ss01)، هرگز هر دو هم‌زمان.
- هر درخواست: loading/error state + idempotency برای مالی.
use t() for translate
put dynamic language file
put datas like menus or sidebars into data directory (easy to migrate to db or something else)
full multi language file 
from 4k to 300px every thing must read and work perfectly
full rtl support not left right only start and end
use estedad font can clone if not exist https://github.com/aminabedi68/Estedad
if it is persian version of site use OpenType Feature: ss01 - Stylistic Set 01 -20
use .env for SITE URL or sometinh like that
