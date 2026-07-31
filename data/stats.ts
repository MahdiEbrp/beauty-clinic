/**
 * About-section statistics.
 *
 * Stored as real numbers so they can be formatted per locale with
 * Intl.NumberFormat (DESIGN_RULES #72). They were previously hardcoded in JSX
 * as the literals "۱۰K+", "۱۵+", "۵۰+", which rendered Persian digits on the
 * English page and were also double-converted by the global `ss01` font
 * feature (DESIGN_RULES #74).
 */
export type Stat = {
  key: string;
  value: number;
  /** Render with compact notation (10000 -> "10K" / "۱۰ هزار"). */
  compact?: boolean;
  /** Append a "+" after the formatted number. */
  plus?: boolean;
};

export const stats: Stat[] = [
  { key: "stat1", value: 10000, compact: true, plus: true },
  { key: "stat2", value: 15, plus: true },
  { key: "stat3", value: 50, plus: true },
];
