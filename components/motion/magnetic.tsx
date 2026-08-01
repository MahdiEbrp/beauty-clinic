"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useSpring } from "motion/react";

interface MagneticProps {
  children: ReactNode;
  /** Max pull in px towards the cursor. */
  strength?: number;
  className?: string;
}

/**
 * Subtle magnetic pull towards the cursor. Used sparingly on primary CTAs.
 * Skipped on touch / reduced-motion (no pointer-hover available or requested).
 */
export default function Magnetic({
  children,
  strength = 8,
  className,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const x = useSpring(0, { stiffness: 250, damping: 18 });
  const y = useSpring(0, { stiffness: 250, damping: 18 });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // Normalise to -1..1 across the element, then scale to strength.
    x.set(((e.clientX - cx) / (rect.width / 2)) * strength);
    y.set(((e.clientY - cy) / (rect.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
