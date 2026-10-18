"use client";

import { useTranslations, useLocale } from "next-intl";
import { navigationKeys, routeNavigationKeys } from "@/data/navigation";
import { Link, usePathname } from "@/src/i18n/navigation";
import BrandLogo from "@/components/BrandLogo";
import type { ClinicData } from "@/data/clinic";

interface FooterProps {
  clinic?: ClinicData;
}

const linkClass =
  "text-footer-muted text-body-sm no-underline hover:text-gold transition-colors inline-flex items-center min-h-11 rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

const DEVELOPER_PHONE = "09011675969";
const DEVELOPER_EMAIL = "mahdi.a.ebrp@gmail.com";
const DEVELOPER_NAME = "Mahdi Ebrahim Pour";

// Verbatim copy of the snippet issued in the enamad panel (دسترسی‌ها و امکانات).
// Injected raw because the panel only honours the exact markup it issued — React's
// JSX path rewrites the attribute casing and would append its own attributes.
const ENAMAD_SNIPPET =
  "<a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=8012387&Code=tGf6kbvd1zly0cWZ1D0Kbs2oh0WstDuM'><img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=8012387&Code=tGf6kbvd1zly0cWZ1D0Kbs2oh0WstDuM' alt='' style='cursor:pointer' code='tGf6kbvd1zly0cWZ1D0Kbs2oh0WstDuM'></a>";

function safeHtmlComment(value: string): string {
  const clean = value.replace(/[<>]/g, "").replace(/--/g, "\u2010\u2010");
  return `<!-- ${clean} -->`;
}

export default function Footer({ clinic }: FooterProps) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const isHomePage = pathname === "/" || pathname === `/${locale}`;

  const getAnchorHref = (anchor: string) => {
    return isHomePage ? anchor : `/${anchor}`;
  };

  const socials = clinic?.social ?? [];
  const opensInNewTab = clinic?.content.opensInNewTab;

  return (
    <footer className="bg-footer-bg text-footer-text pt-16 mt-16">
      <div className="relative max-w-content mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-8">
          <div>
            <div className="text-xl font-black flex items-center gap-2 mb-6 text-footer-heading">
              <BrandLogo alt={t("site.name")} className="h-8" />
              <span>{t("site.name")}</span>
            </div>
            <p className="max-w-xs text-footer-muted">{t("site.footerDesc")}</p>
          </div>

          <nav aria-label={t("footer.quickAccessNav")}>
            <h3 className="mb-6 text-body text-footer-heading">
              {t("footer.quickAccess")}
            </h3>
            <ul className="list-none flex flex-col">
              {navigationKeys
                .map((key) => (
                  <li key={key}>
                    <Link href={getAnchorHref(`#${key}`)} className={linkClass}>
                      {t(`nav.${key}`)}
                    </Link>
                  </li>
                ))}
              {routeNavigationKeys.map((key) => (
                <li key={key}>
                  <Link href={`/${key}`} className={linkClass}>
                    {t(`nav.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t("footer.socialNav")}>
            <h3 className="mb-6 text-body text-footer-heading">
              {t("footer.socialHeading")}
            </h3>
            <ul className="list-none flex flex-col">
              {socials.map((social) => (
                <li key={social.url}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {social.label}
                    <span className="sr-only"> ({opensInNewTab})</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-t border-footer-border mt-12 pt-8 pb-36 lg:pb-24 flex flex-col sm:flex-row sm:justify-between sm:items-center text-body-sm text-footer-muted gap-4">
          <div className="flex items-center gap-4">
            <div dangerouslySetInnerHTML={{ __html: ENAMAD_SNIPPET }} />
            <span>
              © <span>{new Date().getFullYear()}</span> {t("site.name")}.{" "}
              {t("site.rights")}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
            <span>
              {t("footer.developer")}{" "}
              <span className="text-footer-heading">
                {t("footer.developerName")}
              </span>
            </span>
            <a href={`tel:${DEVELOPER_PHONE}`} className={linkClass}>
              {t("footer.developerPhone")}:{" "}
              <span dir="ltr">{DEVELOPER_PHONE}</span>
            </a>
            <a href={`mailto:${DEVELOPER_EMAIL}`} className={linkClass}>
              {t("footer.developerEmail")}:{" "}
              <span dir="ltr">{DEVELOPER_EMAIL}</span>
            </a>
          </div>
        </div>

        <div
          aria-hidden="true"
          dangerouslySetInnerHTML={{
            __html: safeHtmlComment(
              `Developed by ${DEVELOPER_NAME} | Phone: ${DEVELOPER_PHONE} | Email: ${DEVELOPER_EMAIL}`,
            ),
          }}
        />
      </div>
    </footer>
  );
}
