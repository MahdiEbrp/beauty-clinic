export interface PricingItem {
  readonly nameKey: string;
  readonly price: number;
}

export interface PricingSection {
  readonly nameKey: string;
  readonly items: readonly PricingItem[];
}

export const laserFaceAreas: readonly PricingItem[] = [
  { nameKey: "face", price: 150 },
  { nameKey: "upperLip", price: 90 },
  { nameKey: "chin", price: 90 },
  { nameKey: "doubleChin", price: 90 },
] as const;

export const laserPackages: readonly PricingItem[] = [
  { nameKey: "functional", price: 790 },
  { nameKey: "fullFunctional", price: 880 },
  { nameKey: "fullBody", price: 990 },
] as const;

export const laserBodyAreas: readonly PricingItem[] = [
  { nameKey: "underarm", price: 200 },
  { nameKey: "calf", price: 200 },
  { nameKey: "fullArm", price: 250 },
  { nameKey: "abdomen", price: 155 },
  { nameKey: "back", price: 150 },
  { nameKey: "bikini", price: 190 },
  { nameKey: "lowerLeg", price: 180 },
  { nameKey: "fullLeg", price: 300 },
] as const;

export const laserPersonalKit: readonly PricingItem[] = [
  { nameKey: "goggles", price: 50 },
  { nameKey: "cap", price: 50 },
  { nameKey: "towel", price: 35 },
  { nameKey: "mat", price: 40 },
] as const;

export const laserSections: readonly PricingSection[] = [
  { nameKey: "faceAreas", items: laserFaceAreas },
  { nameKey: "packages", items: laserPackages },
  { nameKey: "bodyAreas", items: laserBodyAreas },
  { nameKey: "personalKit", items: laserPersonalKit },
] as const;
