"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "motion/react";

interface CounterProps {
  value: number;
  /** Locale used only for grouping separators (DESIGN_RULES #72: en digits). */
  locale?: string;
  /** Render with compact notation (10000 → "10K"). */
  compact?: boolean;
  plus?: boolean;
  duration?: number;
  className?: string;
}

/**
 * Counts up from 0 to `value` when it first scrolls into view. The digits stay
 * English throughout (toLocaleString("en")); the ss01 font feature handles the
 * visual Persian substitution (DESIGN_RULES #72-74), so no Intl number shaping
 * is applied here.
 */
export default function Counter({
  value,
  locale = "en",
  compact = false,
  plus = false,
  duration = 1.8,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const mv = useMotionValue(0);

  useEffect(() => {
    if (!inView) return;

    if (reduce) {
      mv.set(value);
      if (ref.current) {
        ref.current.textContent = format(value, locale, compact, plus);
      }
      return;
    }

    const controls = animate(mv, value, {
      duration,
      ease: [0.16, 1, 0.3, 1] as const,
      onUpdate(latest) {
        if (ref.current) {
          ref.current.textContent = format(
            Math.round(latest),
            locale,
            compact,
            plus,
          );
        }
      },
    });

    return () => controls.stop();
  }, [inView, value, locale, compact, plus, duration, reduce, mv]);

  return (
    <span ref={ref} className={className}>
      {format(reduce ? value : 0, locale, compact, plus)}
    </span>
  );
}

function format(
  n: number,
  locale: string,
  compact: boolean,
  plus: boolean,
): string {
  const formatted = compact
    ? new Intl.NumberFormat(locale, { notation: "compact" }).format(n)
    : n.toLocaleString(locale);
  return plus ? `${formatted}+` : formatted;
}
