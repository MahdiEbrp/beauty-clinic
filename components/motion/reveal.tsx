"use client";

import { createElement, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

/**
 * Scroll-triggered reveal. Respects prefers-reduced-motion (DESIGN_RULES #7):
 * when the user opts out of motion the element renders in its final state with
 * no transition.
 *
 * `as` lets a Reveal become a semantic element (section, article, li …) so the
 * document outline is unaffected.
 */
type Direction = "up" | "down" | "start" | "end" | "none";

interface RevealProps {
  children: ReactNode;
  /** Distance the element travels in. 24px by default, multiples of 4 (DESIGN_RULES #5). */
  distance?: number;
  direction?: Direction;
  delay?: number;
  duration?: number;
  once?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
}

const offsetFor = (direction: Direction, distance: number) => {
  switch (direction) {
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
    // Logical inline axis: start/end flip with dir automatically via x.
    case "start":
      return { x: distance };
    case "end":
      return { x: -distance };
    default:
      return {};
  }
};

export default function Reveal({
  children,
  distance = 24,
  direction = "up",
  delay = 0,
  duration = 0.6,
  once = true,
  as = "div",
  className,
}: RevealProps) {
  const reduce = useReducedMotion();
  // Per DESIGN_RULES #7 the visible animation range is 150–300ms, but Motion's
  // scroll reveals are a one-shot entrance rather than a UI micro-interaction,
  // so a slightly longer eased reveal reads as premium without being sluggish.
  // Reduced-motion users get an instant settle.
  const variants: Variants = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, ...offsetFor(direction, distance) },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: reduce ? 0 : duration,
        delay,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return createElement(
    motion[as as "div"],
    {
      initial: "hidden",
      whileInView: "visible",
      viewport: { once, margin: "-80px" },
      variants,
      className,
    },
    children,
  );
}
