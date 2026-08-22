"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { CalendarPlus } from "lucide-react";
import { useRouter } from "@/src/i18n/navigation";

export default function FloatingBookingButton() {
  const t = useTranslations();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const heroCta = document.getElementById("hero-cta");
    let scrolledPast = false;
    let heroCtaVisible = Boolean(heroCta);

    const update = () => setVisible(scrolledPast && !heroCtaVisible);
    const onScroll = () => {
      scrolledPast = window.scrollY > 300;
      update();
    };

    let observer: IntersectionObserver | undefined;
    if (heroCta) {
      observer = new IntersectionObserver(
        ([entry]) => {
          heroCtaVisible = entry.isIntersecting;
          update();
        },
        { threshold: 0 },
      );
      observer.observe(heroCta);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => router.push("/booking")}
      // `inert` removes the button from the tab order and the accessibility tree
      // while it is faded out. Previously it stayed focusable, so keyboard users
      // could tab into an invisible control.
      inert={!visible}
      className={`fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] inset-x-0 z-40 mx-auto w-fit bg-accent text-content-contrast px-10 py-5 rounded-pill shadow-elevation-4 flex items-center gap-3 font-extrabold text-body-lg transition-all duration-300 whitespace-nowrap border-2 border-copper isolate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:px-14 md:py-6 md:text-xl md:min-h-17 lg:bottom-6 ${
        visible
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-90 translate-y-4 pointer-events-none"
      }`}
      style={{ animation: visible ? "fab-pulse 1.5s infinite" : "none" }}
    >
      <CalendarPlus
        className="w-7 h-7 md:w-8 md:h-8"
        strokeWidth={2}
        aria-hidden="true"
      />
      <span>{t("nav.bookNow")}</span>
    </button>
  );
}
