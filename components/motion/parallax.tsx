"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

interface ParallaxProps {
  children: ReactNode;
  /** Multiplier vs scroll. Negative moves up, positive moves down. */
  speed?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Lightweight vertical parallax wrapper. The child translates a fraction of the
 * element's own scroll progress, so it works regardless of page length.
 * Disabled entirely under prefers-reduced-motion.
 */
export default function Parallax({
  children,
  speed = 0.3,
  className,
  style,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${-speed * 100}%`]);

  return (
    <div ref={ref} className={className} style={style}>
      <motion.div style={{ y: reduce ? 0 : y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}
