import type { Metadata, Viewport } from "next";
import { getLocale } from "next-intl/server";
import { Rubik } from "next/font/google";
import localFont from "next/font/local";
import { dirForLocale, siteUrl } from "@/lib/site";
import "./globals.css";
import ToastProvider from "@/components/ui/toaster";

const estedad = localFont({
  src: "../public/fonts/Estedad.woff2",
  variable: "--font-estedad",
  display: "swap",
});

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
  display: "swap",
});

/**
 * Search-engine ownership tokens. Both are optional so a preview deployment
 * does not emit verification tags for a domain it does not own; set them in the
 * environment after registering with Google Search Console and Bing Webmaster
 * Tools. Next renders `google` as `google-site-verification` and forwards
 * `other` verbatim, which is exactly the `msvalidate.01` format Bing expects.
 */
const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();
const bingSiteVerification = process.env.BING_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  // Every page composes absolute URLs by hand, but metadataBase is still
  // required so any relative URL (icon, future OG asset) resolves against the
  // real origin instead of producing a build warning.
  metadataBase: new URL(siteUrl),
  icons: { icon: "/favicon.ico" },
  formatDetection: { telephone: false, address: false, email: false },
  verification: {
    ...(googleSiteVerification ? { google: googleSiteVerification } : {}),
    other: {
      ...(bingSiteVerification ? { "msvalidate.01": bingSiteVerification } : {}),
    },
  },
};

// The site ships a single light palette (no dark theme in globals.css), so one
// theme-color entry is correct. meta theme-color cannot reference a CSS custom
// property, so this necessarily repeats the literal value of the
// --surface-primary design token.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8e9db",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dir = dirForLocale(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      data-scroll-behavior="smooth"
      className={`${estedad.variable} ${rubik.variable} antialiased`}
    >
      <body className="min-h-dvh flex flex-col bg-surface-primary text-content-primary">
        {children}
        <ToastProvider dir={dir} />
      </body>
    </html>
  );
}
