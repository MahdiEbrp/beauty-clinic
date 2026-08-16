/** Named accent colors a clinic rule can be highlighted with. */
export const RULE_COLORS = [
  "gold",
  "copper",
  "copper-strong",
  "copper-deep",
  "accent",
] as const;

export type RuleColor = (typeof RULE_COLORS)[number];

/** Solid token backgrounds used to paint the color swatches in the wizard. */
export const RULE_SWATCH_CLASSES: Record<string, string> = {
  gold: "bg-gold",
  copper: "bg-copper",
  "copper-strong": "bg-copper-strong",
  "copper-deep": "bg-copper-deep",
  accent: "bg-accent",
  default: "bg-accent",
};

/** Resolve the solid swatch background for a stored rule color key. */
export function ruleSwatchClass(color: string | null): string {
  return RULE_SWATCH_CLASSES[color ?? "default"] ?? RULE_SWATCH_CLASSES.default;
}

/**
 * The check mark drawn inside a selected swatch must stay legible against
 * both the light metals (gold/copper) and the dark ones (maroon accent).
 */
export function ruleSwatchCheckClass(color: string | null): string {
  return color === "gold" || color === "copper"
    ? "text-accent"
    : "text-content-contrast";
}
