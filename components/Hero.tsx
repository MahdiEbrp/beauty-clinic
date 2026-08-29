"use client";

import { useTranslations } from "next-intl";
import { CalendarPlus, Eye, Heart, Shield, Sparkles, Zap } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Magnetic from "@/components/motion/magnetic";
import type { PublicLanding } from "@/lib/landing";
import Link from "next/link";

interface HeroProps {
  landing: PublicLanding | null;
}

/** Static tagline glyph; resolved from the stored key with a Sparkles fallback. */
function TaglineGlyph({ icon }: { icon: string | null }) {
  const cls = "w-4 h-4";
  if (icon === "Heart") return <Heart className={cls} strokeWidth={2} aria-hidden="true" />;
  if (icon === "Shield") return <Shield className={cls} strokeWidth={2} aria-hidden="true" />;
  if (icon === "Zap") return <Zap className={cls} strokeWidth={2} aria-hidden="true" />;
  return <Sparkles className={cls} strokeWidth={2} aria-hidden="true" />;
}

/**
 * Hero — full-viewport entrance with parallax background, floating glow orbs,
 * staggered text reveal, grain overlay and magnetic CTA buttons. All copy is
 * DB-driven through `landing.hero` and localized for the active locale.
 */
export default function Hero({ landing }: HeroProps) {
  const t = useTranslations("hero");
  const reduce = useReducedMotion();
  const data = landing?.hero;

  const fadeUp = reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 };

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

  const [titleLine1, titleLine2] = (data?.title ?? "").split("\n");

  return (
    <section
      id="home"
      className="hero-bg min-h-dvh flex items-center relative pt-24 overflow-hidden"
    >
      {data?.image ? (
        <img
          src={data.image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />
      ) : null}

      <div className="hero-overlay absolute inset-0 z-0" aria-hidden="true" />

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

      <div className="grain absolute inset-0 z-2 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-content mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-full"
        >
          <motion.div
            variants={childVariants}
            className="inline-flex items-center gap-2 px-4 py-2 bg-surface-secondary/90 backdrop-blur-sm border border-border-primary rounded-pill text-caption font-semibold text-copper-strong mb-8 shadow-elevation-1"
          >
            <TaglineGlyph icon={data?.taglineIcon ?? null} />
            <span>{data?.tagline ?? t("tagline")}</span>
          </motion.div>

          <motion.h1
            variants={childVariants}
            className="text-display font-extralight mb-6 leading-[1.1] tracking-tight text-accent"
          >
            {titleLine1 || t("heading1")}
            <br />
            <b className="bg-linear-to-br from-accent to-copper bg-clip-text text-transparent">
              {titleLine2 || t("heading2")}
            </b>
          </motion.h1>

          <motion.p
            variants={childVariants}
            className="text-body-lead max-w-lg mb-12 leading-normal text-content-secondary"
          >
            {data?.description ?? t("description")}
          </motion.p>

          <motion.div variants={childVariants} className="flex gap-4 flex-wrap">
            <Magnetic strength={6}>
              <Link
                id="hero-cta"
                href="/booking"
                className="btn-hero-primary inline-flex items-center justify-center gap-3 px-10 py-5 text-body-lg min-h-15 bg-accent text-content-contrast rounded-pill font-bold no-underline border border-copper transition-all duration-300 hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-elevation-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95"
              >
                <CalendarPlus className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
                {data?.ctaLabel1 ?? t("cta1")}
              </Link>
            </Magnetic>
            <Magnetic strength={4}>
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 text-body-lg min-h-15 bg-transparent text-accent border-2 border-border-interactive rounded-pill font-bold no-underline transition-all duration-300 hover:border-accent hover:bg-surface-tertiary hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Eye className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
                {data?.ctaLabel2 ?? t("cta2")}
              </a>
            </Magnetic>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
