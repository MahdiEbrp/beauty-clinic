import {
  landingCollectionItemDelete,
  landingCollectionItemGet,
  landingCollectionItemPatch,
} from "@/lib/landing/admin/api";
import { withSecurity } from "@/lib/api/security";
import { updateMarqueeItemSchema } from "@/lib/validation/landing";

export const runtime = "nodejs";

export const GET = withSecurity(
  { auth: "required", permissions: "services.read" },
  landingCollectionItemGet("marquee"),
);

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "services.write",
    validate: { body: updateMarqueeItemSchema },
    audit: true,
  },
  landingCollectionItemPatch("marquee"),
);

export const DELETE = withSecurity(
  { auth: "required", permissions: "services.manage", audit: true },
  landingCollectionItemDelete("marquee"),
);