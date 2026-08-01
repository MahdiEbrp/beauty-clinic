"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

/**
 * Container that staggers the entrance of its children. Pair each child with a
 * `<StaggerItem>` so the orchestration is driven by the container, not by
 * per-child delays (cleaner, and the stagger stays consistent if reordered).
 */

interface StaggerProps {
  children: ReactNode;
  /** Gap between each child entering. */
  stagger?: number;
  delay?: number;
  once?: boolean;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

export function Stagger({
  children,
  stagger = 0.08,
  delay = 0,
  once = true,
  className,
}: StaggerProps) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : stagger,
        delayChildren: reduce ? 0 : delay,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  /** "up" | "start" travel the element inward. */
  direction?: "up" | "start";
  distance?: number;
  className?: string;
}

export function StaggerItem({
  children,
  direction = "up",
  distance = 24,
  className,
}: StaggerItemProps) {
  const reduce = useReducedMotion();
  const offset = direction === "up" ? { y: distance } : { x: distance };

  const variants: Variants = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, ...offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: reduce ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}
