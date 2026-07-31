export interface CareInstruction {
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly iconKey: string;
}

export interface DurabilityPoint {
  readonly titleKey: string;
  readonly descriptionKey: string;
}

export const preCareInstructions: readonly CareInstruction[] = [
  {
    titleKey: "noAlcohol",
    descriptionKey: "noAlcoholDesc",
    iconKey: "wine",
  },
  {
    titleKey: "noBloodThinners",
    descriptionKey: "noBloodThinnersDesc",
    iconKey: "pill",
  },
  {
    titleKey: "noHeavyExercise",
    descriptionKey: "noHeavyExerciseDesc",
    iconKey: "dumbbell",
  },
  {
    titleKey: "noMakeup",
    descriptionKey: "noMakeupDesc",
    iconKey: "palette",
  },
  {
    titleKey: "discloseConditions",
    descriptionKey: "discloseConditionsDesc",
    iconKey: "clipboardCheck",
  },
  {
    titleKey: "drinkWater",
    descriptionKey: "drinkWaterDesc",
    iconKey: "droplets",
  },
] as const;

export const postCareInstructions: readonly CareInstruction[] = [
  {
    titleKey: "noHeat",
    descriptionKey: "noHeatDesc",
    iconKey: "thermometer",
  },
  {
    titleKey: "noMakeup48h",
    descriptionKey: "noMakeup48hDesc",
    iconKey: "ban",
  },
  {
    titleKey: "noAlcoholWeek",
    descriptionKey: "noAlcoholWeekDesc",
    iconKey: "wine",
  },
  {
    titleKey: "noSmokingWeek",
    descriptionKey: "noSmokingWeekDesc",
    iconKey: "cigarette",
  },
  {
    titleKey: "noHeavyExercise48h",
    descriptionKey: "noHeavyExercise48hDesc",
    iconKey: "dumbbell",
  },
  {
    titleKey: "takeCephalexin",
    descriptionKey: "takeCephalexinDesc",
    iconKey: "pill",
  },
  {
    titleKey: "vitaminC",
    descriptionKey: "vitaminCDesc",
    iconKey: "apple",
  },
  {
    titleKey: "contactDoctor",
    descriptionKey: "contactDoctorDesc",
    iconKey: "phone",
  },
] as const;

export const durabilityPoints: readonly DurabilityPoint[] = [
  {
    titleKey: "bodyCompatibility",
    descriptionKey: "bodyCompatibilityDesc",
  },
  {
    titleKey: "areaDurability",
    descriptionKey: "areaDurabilityDesc",
  },
  {
    titleKey: "aftercareImportance",
    descriptionKey: "aftercareImportanceDesc",
  },
  {
    titleKey: "firstTimerNote",
    descriptionKey: "firstTimerNoteDesc",
  },
] as const;
