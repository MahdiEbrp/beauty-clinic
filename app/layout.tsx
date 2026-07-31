import { getLocale } from "next-intl/server";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { dirForLocale } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const estedad = localFont({
  src: "../public/fonts/Estedad-VF.ttf",
  variable: "--font-estedad",
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
      className={`${inter.variable} ${estedad.variable} antialiased`}
    >
      <body className="min-h-dvh flex flex-col bg-surface-primary text-content-primary">
        {children}
      </body>
    </html>
  );
}
