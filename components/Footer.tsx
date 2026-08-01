"use client";

import { useTranslations, useLocale } from "next-intl";
import { Wind } from "lucide-react";
import { clinic } from "@/data/clinic";
import { navigationKeys, routeNavigationKeys } from "@/data/navigation";
import { Link, usePathname } from "@/src/i18n/navigation";

const linkClass =
  "text-footer-muted text-body-sm no-underline hover:text-gold transition-colors inline-flex items-center min-h-11 rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const isHomePage = pathname === "/" || pathname === `/${locale}`;

  const getAnchorHref = (anchor: string) => {
    return isHomePage ? anchor : `/${anchor}`;
  };

  const socials = [
    { key: "rubika", href: clinic.social.rubika },
    { key: "bale", href: clinic.social.bale },
  ] as const;

  return (
    <footer className="bg-footer-bg text-footer-text pt-16 mt-16">
      <div className="relative max-w-content mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-8">
          <div>
            <div className="text-xl font-black flex items-center gap-2 mb-6 text-footer-heading">
              <Wind className="w-6 h-6 text-gold" strokeWidth={2} aria-hidden="true" />
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
                .filter((key) => key !== "gallery")
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
                <li key={social.key}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {t(`contact.${social.key}`)}
                    <span className="sr-only">
                      {" "}
                      ({t("contact.opensInNewTab")})
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-t border-footer-border mt-12 py-8 flex justify-between items-center text-body-sm text-footer-muted flex-wrap gap-4">
          <span>
            © <span>{new Date().getFullYear()}</span> {t("site.name")}.{" "}
            {t("site.rights")}
          </span>
        </div>
      </div>
    </footer>
  );
}
