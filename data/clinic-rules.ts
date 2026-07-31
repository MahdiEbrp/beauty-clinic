export interface ClinicRule {
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly iconKey: string;
}

export const clinicRules: readonly ClinicRule[] = [
  {
    titleKey: "respectAppointments",
    descriptionKey: "respectAppointmentsDesc",
    iconKey: "clock",
  },
  {
    titleKey: "keepClean",
    descriptionKey: "keepCleanDesc",
    iconKey: "sparkles",
  },
  {
    titleKey: "parkingRules",
    descriptionKey: "parkingRulesDesc",
    iconKey: "car",
  },
  {
    titleKey: "noUnnecessaryCompanions",
    descriptionKey: "noUnnecessaryCompanionsDesc",
    iconKey: "users",
  },
  {
    titleKey: "waitTime",
    descriptionKey: "waitTimeDesc",
    iconKey: "hourglass",
  },
  {
    titleKey: "cancellationPolicy",
    descriptionKey: "cancellationPolicyDesc",
    iconKey: "calendarX",
  },
] as const;
