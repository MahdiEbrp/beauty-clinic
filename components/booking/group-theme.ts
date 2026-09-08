import type { ComponentType } from "react";
import { Droplets, Gem, Layers, Smile, Sparkles } from "lucide-react";

/**
 * Per-service-group visual theme (Template parity).
 *
 * Numbers of groups are DB-driven and arbitrary slugs can't be trusted, so the
 * palette cycles by GROUP INDEX — every group gets a cohesive, distinct look
 * without coupling UI to seed data. Every class is a design token.
 */
export type GroupTheme = {
  icon: ComponentType<{ className?: string }>;
  lineColor: string;
  titleColor: string;
  iconBg: string;
  iconColor: string;
  bulletColor: string;
  buttonBorder: string;
  buttonHoverBorder: string;
  buttonHoverBg: string;
  buttonSelectedRing: string;
  buttonCheckBg: string;
  tagBarBg: string;
  tagBarText: string;
  tagBarBorder: string;
  tabActiveBg: string;
  tabDotColor: string;
};

const PALETTES: GroupTheme[] = [
  {
    icon: Sparkles,
    lineColor: "bg-gold/60",
    titleColor: "text-copper-deep",
    iconBg: "bg-gold/25",
    iconColor: "text-copper-deep",
    bulletColor: "bg-gold",
    buttonBorder: "border-gold/50",
    buttonHoverBorder: "hover:border-gold",
    buttonHoverBg: "hover:bg-gold/10",
    buttonSelectedRing: "ring-2 ring-gold shadow-elevation-1",
    buttonCheckBg: "bg-copper-strong text-on-primary",
    tagBarBg: "bg-gold/20",
    tagBarText: "text-copper-deep",
    tagBarBorder: "border-gold/40",
    tabActiveBg: "bg-copper-strong text-on-primary",
    tabDotColor: "bg-gold",
  },
  {
    icon: Gem,
    lineColor: "bg-copper/60",
    titleColor: "text-copper-deep",
    iconBg: "bg-copper/25",
    iconColor: "text-copper-deep",
    bulletColor: "bg-copper-deep",
    buttonBorder: "border-copper/50",
    buttonHoverBorder: "hover:border-copper-deep",
    buttonHoverBg: "hover:bg-copper/10",
    buttonSelectedRing: "ring-2 ring-copper-deep shadow-elevation-1",
    buttonCheckBg: "bg-copper-deep text-on-primary",
    tagBarBg: "bg-copper/20",
    tagBarText: "text-copper-deep",
    tagBarBorder: "border-copper/40",
    tabActiveBg: "bg-copper-deep text-on-primary",
    tabDotColor: "bg-copper-deep",
  },
  {
    icon: Smile,
    lineColor: "bg-accent/40",
    titleColor: "text-accent",
    iconBg: "bg-accent/20",
    iconColor: "text-accent",
    bulletColor: "bg-accent",
    buttonBorder: "border-accent/35",
    buttonHoverBorder: "hover:border-accent",
    buttonHoverBg: "hover:bg-accent/10",
    buttonSelectedRing: "ring-2 ring-accent shadow-elevation-1",
    buttonCheckBg: "bg-accent text-on-primary",
    tagBarBg: "bg-accent/15",
    tagBarText: "text-accent",
    tagBarBorder: "border-accent/25",
    tabActiveBg: "bg-accent text-on-primary",
    tabDotColor: "bg-accent",
  },
  {
    icon: Droplets,
    lineColor: "bg-border-interactive/60",
    titleColor: "text-content-primary",
    iconBg: "bg-border-interactive/20",
    iconColor: "text-content-primary",
    bulletColor: "bg-border-interactive",
    buttonBorder: "border-border-interactive/50",
    buttonHoverBorder: "hover:border-border-interactive",
    buttonHoverBg: "hover:bg-surface-secondary",
    buttonSelectedRing: "ring-2 ring-border-interactive shadow-elevation-1",
    buttonCheckBg: "bg-content-secondary text-on-primary",
    tagBarBg: "bg-surface-variant",
    tagBarText: "text-content-primary",
    tagBarBorder: "border-border-interactive/35",
    tabActiveBg: "bg-content-secondary text-on-primary",
    tabDotColor: "bg-border-interactive",
  },
];

const FALLBACK: GroupTheme = {
  icon: Layers,
  lineColor: "bg-copper/50",
  titleColor: "text-content-primary",
  iconBg: "bg-copper/15",
  iconColor: "text-copper-deep",
  bulletColor: "bg-copper",
  buttonBorder: "border-border-interactive/50",
  buttonHoverBorder: "hover:border-copper",
  buttonHoverBg: "hover:bg-surface-secondary",
  buttonSelectedRing: "ring-2 ring-copper shadow-elevation-1",
  buttonCheckBg: "bg-copper text-on-primary",
  tagBarBg: "bg-copper/15",
  tagBarText: "text-copper-deep",
  tagBarBorder: "border-border-primary/50",
  tabActiveBg: "bg-accent text-on-primary",
  tabDotColor: "bg-copper",
};

/** Distinct theme for a group by its stable 0-based index in the tree. */
export function getGroupTheme(index: number): GroupTheme {
  if (!Number.isFinite(index) || index < 0) return FALLBACK;
  return PALETTES[index % PALETTES.length] ?? FALLBACK;
}