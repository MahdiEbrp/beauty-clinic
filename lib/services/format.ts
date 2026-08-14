/**
 * Number/price formatting for the public catalog.
 *
 * Values render with Latin digits and thousands grouping; the Estedad `ss01`
 * font feature converts those digits to Persian glyphs in fa, so we never use
 * `Intl.NumberFormat` with the fa locale (which would double-apply conversion).
 */

export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
