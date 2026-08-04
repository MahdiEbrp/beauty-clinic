"use client";

import { usePathname } from "@/src/i18n/navigation";
import type { AuthUser } from "@/lib/auth/dal";
import Navbar from "./Navbar";
import Footer from "./Footer";

type FooterClinic = React.ComponentProps<typeof Footer>["clinic"];

const APP_PREFIXES = ["/dashboard"];

/**
 * App chrome for public pages: skip link, navbar, main, footer.
 *
 * Dashboard routes render their own shell (sidebar) inside the protected
 * layout, so the public chrome is intentionally omitted there — the marketing
 * navbar and footer would clash with the CMS-like dashboard chrome.
 */
export default function AppChrome({
  children,
  user,
  clinic,
  skipLabel,
}: {
  children: React.ReactNode;
  user: AuthUser | null;
  clinic?: FooterClinic;
  skipLabel: string;
}) {
  const pathname = usePathname();
  const isAppRoute = APP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isAppRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:inset-s-4 focus:z-100 focus:inline-flex focus:items-center focus:min-h-11 focus:px-6 focus:rounded-pill focus:bg-accent focus:text-content-contrast focus:font-bold focus:shadow-elevation-3"
      >
        {skipLabel}
      </a>
      <Navbar user={user} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer clinic={clinic} />
    </>
  );
}
