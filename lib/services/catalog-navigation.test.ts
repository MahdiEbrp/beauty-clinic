import { describe, expect, it } from "vitest";
import { hasPublicSubcategories } from "./catalog-navigation";

describe("public service group navigation", () => {
  it.each([
    "face-filler",
    "sensitive-filler",
    "botox",
    "body-filler",
    "full-face-filler",
    "enzyme",
    "meso-gel-rejuvenation",
    "laser-hair-removal",
    "hifu",
    "tattoo-removal-skin-brightening",
  ])("keeps %s on a single public detail page", (slug) => {
    expect(hasPublicSubcategories(slug)).toBe(false);
  });
});
