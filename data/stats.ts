/**
 * About-section statistics.
 *
 * Stored as real numbers and formatted with toLocaleString("en") to ensure
 * English digits. The ss01 font feature in Estedad visually converts them
 * to Persian digits when locale is fa (DESIGN_RULES #72-74).
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
