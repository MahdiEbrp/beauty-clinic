import type { SeedGroup } from "./types";
import { BODY_FILLER_GROUP } from "./body-filler";
import { ENZYME_GROUP } from "./enzyme";
import { FACE_FILLER_GROUP } from "./face-filler";
import { FACE_THREAD_LIFT_GROUP } from "./face-thread-lift";
import { FULL_FACE_FILLER_GROUP } from "./full-face-filler";
import { LASER_HAIR_REMOVAL_GROUP } from "./laser-hair-removal";
import { LIP_FILLER_GROUP } from "./lip-filler";
import { MESO_FATBURN_ANTISPOT_GROUP } from "./meso-fatburn-antispot";
import { MESOTHERAPY_GROUP } from "./mesotherapy-skin-rejuvenation";
import { MESOTHERAPY_HAIR_GROUP } from "./mesotherapy-hair";
import { SKIN_TREATMENTS_GROUP } from "./skin-treatments";
import { TATTOO_REMOVAL_GROUP } from "./tattoo-removal-skin-brightening";

export type { SeedGroup, SeedCategory, SeedService } from "./types";

/**
 * The full catalog, ordered by the live `service_groups.display_order`
 * (0..11). The 12 top-level groups are the clinic's canonical service groups;
 * legacy groups not listed here are deactivated by `syncCatalogGroups`.
 */
export const CATALOG_SEED: SeedGroup[] = [
  LIP_FILLER_GROUP,
  FACE_FILLER_GROUP,
  FULL_FACE_FILLER_GROUP,
  ENZYME_GROUP,
  BODY_FILLER_GROUP,
  FACE_THREAD_LIFT_GROUP,
  MESOTHERAPY_GROUP,
  MESOTHERAPY_HAIR_GROUP,
  SKIN_TREATMENTS_GROUP,
  MESO_FATBURN_ANTISPOT_GROUP,
  LASER_HAIR_REMOVAL_GROUP,
  TATTOO_REMOVAL_GROUP,
];
