import type { SeedGroup } from "./types";
import { BODY_FILLER_GROUP } from "./body-filler";
import { BOTOX_ENZYME_GROUP } from "./botox-enzyme-treatments";
import { FACE_FILLER_GROUP } from "./face-filler";
import { FULL_FACE_FILLER_GROUP } from "./full-face-filler";
import { HIFU_GROUP } from "./hifu";
import { LASER_HAIR_REMOVAL_GROUP } from "./laser-hair-removal";
import { MESOTHERAPY_GROUP } from "./mesotherapy-skin-rejuvenation";
import { SKIN_CARE_GROUP } from "./skin-care";
import { TATTOO_REMOVAL_GROUP } from "./tattoo-removal-skin-brightening";

export type { SeedGroup, SeedCategory, SeedService } from "./types";

/**
 * The full catalog, ordered by the live `service_groups.displayOrder`
 * (0, 1, 2, 3, 5, 6, 7, 8, 9 — the gap at 4 is left as-is to match the DB).
 */
export const CATALOG_SEED: SeedGroup[] = [
  FACE_FILLER_GROUP,
  BODY_FILLER_GROUP,
  BOTOX_ENZYME_GROUP,
  FULL_FACE_FILLER_GROUP,
  MESOTHERAPY_GROUP,
  LASER_HAIR_REMOVAL_GROUP,
  TATTOO_REMOVAL_GROUP,
  HIFU_GROUP,
  SKIN_CARE_GROUP,
];