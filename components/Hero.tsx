"use client";

import { useTranslations } from "next-intl";
import { Sparkles, CalendarPlus, Eye } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Magnetic from "@/components/motion/magnetic";

/**
 * Hero — full-viewport entrance with parallax background, floating glow orbs,
 * staggered text reveal, grain overlay and magnetic CTA buttons.
 */
export default function Hero() {
  const t = useTranslations();
  const reduce = useReducedMotion();

  const fadeUp = reduce
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 32 };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : 0.12,
        delayChildren: reduce ? 0 : 0.15,
      },
    },
  };

  const childVariants = {
    hidden: fadeUp,
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section
      id="home"
      className="hero-bg min-h-dvh flex items-center relative pt-24 overflow-hidden"
    >
      {/* ── Background layers ─────────────────────────────────── */}
      <div className="hero-overlay absolute inset-0 z-0" />

      {/* Floating decorative glow orbs — position:absolute won't affect layout.
         They sit between the overlay and the content, adding depth. */}
      <div
        className="absolute top-[15%] inset-e-[10%] w-72 h-72 rounded-full animate-float-slow opacity-60 pointer-events-none z-1"
        aria-hidden="true"
      >
        <div className="glow-accent w-full h-full" />
      </div>
      <div
        className="absolute bottom-[20%] inset-s-[5%] w-96 h-96 rounded-full animate-float-slower opacity-40 pointer-events-none z-1"
        aria-hidden="true"
      >
        <div className="glow-gold w-full h-full" />
      </div>

      {/* Grain overlay — textured feel without adding color or changing type */}
      <div className="grain absolute inset-0 z-2 pointer-events-none" aria-hidden="true" />

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-content mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-full"
        >
          {/* Tagline pill */}
          <motion.div
            variants={childVariants}
            className="inline-flex items-center gap-2 px-4 py-2 bg-surface-secondary/90 backdrop-blur-sm border border-border-primary rounded-pill text-caption font-semibold text-copper-strong mb-8 shadow-elevation-1"
          >
            <Sparkles className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            <span>{t("hero.tagline")}</span>
          </motion.div>

          {/* Heading — split into two lines for staggered reveal */}
          <motion.h1
            variants={childVariants}
            className="text-display font-extralight mb-6 leading-[1.1] tracking-tight text-accent"
          >
            {t("hero.heading1")}
            <br />
            <b className="bg-linear-to-br from-accent to-copper bg-clip-text text-transparent">
              {t("hero.heading2")}
            </b>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={childVariants}
            className="text-body-lead max-w-lg mb-12 leading-normal text-content-secondary"
          >
            {t("hero.description")}
          </motion.p>

          {/* CTA buttons — with magnetic hover */}
          <motion.div
            variants={childVariants}
            className="flex gap-4 flex-wrap"
          >
            <Magnetic strength={6}>
              <a
                id="hero-cta"
                href="#contact"
                className="btn-hero-primary inline-flex items-center justify-center gap-3 px-10 py-5 text-body-lg min-h-15 bg-accent text-content-contrast rounded-pill font-bold no-underline border border-copper transition-all duration-300 hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-elevation-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95"
              >
                <CalendarPlus className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
                {t("hero.cta1")}
              </a>
            </Magnetic>
            <Magnetic strength={4}>
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 text-body-lg min-h-15 bg-transparent text-accent border-2 border-border-interactive rounded-pill font-bold no-underline transition-all duration-300 hover:border-accent hover:bg-surface-tertiary hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Eye className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
                {t("hero.cta2")}
              </a>
            </Magnetic>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
