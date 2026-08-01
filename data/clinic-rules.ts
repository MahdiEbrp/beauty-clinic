export type RuleColor = "peach" | "gold" | "copper" | "rose" | "sand" | "accent";

export interface ClinicRule {
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly iconKey: string;
  readonly colorKey: RuleColor;
  readonly highlighted: boolean;
}

export const clinicRules: readonly ClinicRule[] = [
  {
    titleKey: "respectAppointments",
    descriptionKey: "respectAppointmentsDesc",
    iconKey: "clock",
    colorKey: "peach",
    highlighted: false,
  },
  {
    titleKey: "keepClean",
    descriptionKey: "keepCleanDesc",
    iconKey: "sparkles",
    colorKey: "gold",
    highlighted: false,
  },
  {
    titleKey: "parkingRules",
    descriptionKey: "parkingRulesDesc",
    iconKey: "car",
    colorKey: "copper",
    highlighted: false,
  },
  {
    titleKey: "noUnnecessaryCompanions",
    descriptionKey: "noUnnecessaryCompanionsDesc",
    iconKey: "users",
    colorKey: "rose",
    highlighted: false,
  },
  {
    titleKey: "waitTime",
    descriptionKey: "waitTimeDesc",
    iconKey: "hourglass",
    colorKey: "sand",
    highlighted: false,
  },
  {
    titleKey: "cancellationPolicy",
    descriptionKey: "cancellationPolicyDesc",
    iconKey: "calendarX",
    colorKey: "accent",
    highlighted: true,
  },
] as const;
