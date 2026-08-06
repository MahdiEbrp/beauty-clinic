import { getLocale } from "next-intl/server";
import { Rubik } from "next/font/google";
import localFont from "next/font/local";
import { dirForLocale } from "@/lib/site";
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
