import type { SeedGroup } from "./types";
import { BOTOX_GROUP } from "./botox";
import { SENSITIVE_FILLER_GROUP } from "./sensitive-filler";
import { BODY_FILLER_GROUP } from "./body-filler";
import { ENZYME_GROUP } from "./enzyme";
import { FACE_FILLER_GROUP } from "./face-filler";
import { FACE_THREAD_LIFT_GROUP } from "./face-thread-lift";
import { FULL_FACE_FILLER_GROUP } from "./full-face-filler";
import { HIFU_GROUP } from "./hifu";
import { LASER_HAIR_REMOVAL_GROUP } from "./laser-hair-removal";
import { MESO_FATBURN_GROUP } from "./meso-fatburn";
import { MESO_GEL_REJUVENATION_GROUP } from "./meso-gel-rejuvenation";
import { TATTOO_REMOVAL_GROUP } from "./tattoo-removal-skin-brightening";

export type { SeedGroup, SeedCategory, SeedService } from "./types";

/**
 * The full catalog, ordered by the live `service_groups.display_order`.
 * The top-level groups are the clinic's canonical service groups (Mahdi's
 * list); legacy groups not listed here are deactivated by `syncCatalogGroups`.
 */
export const CATALOG_SEED: SeedGroup[] = [
  FACE_FILLER_GROUP,
  SENSITIVE_FILLER_GROUP,
  BODY_FILLER_GROUP,
  FULL_FACE_FILLER_GROUP,
  BOTOX_GROUP,
  ENZYME_GROUP,
  MESO_GEL_REJUVENATION_GROUP,
  LASER_HAIR_REMOVAL_GROUP,
  HIFU_GROUP,
  TATTOO_REMOVAL_GROUP,
  FACE_THREAD_LIFT_GROUP,
  MESO_FATBURN_GROUP,
];
