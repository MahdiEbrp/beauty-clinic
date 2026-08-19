import {
  landingCollectionItemDelete,
  landingCollectionItemGet,
  landingCollectionItemPatch,
} from "@/lib/landing/admin/api";
import { withSecurity } from "@/lib/api/security";
import { updateGalleryItemSchema } from "@/lib/validation/landing";

export const runtime = "nodejs";

export const GET = withSecurity(
  { auth: "required", permissions: "services.read" },
  landingCollectionItemGet("gallery"),
);

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "services.write",
    validate: { body: updateGalleryItemSchema },
    audit: true,
  },
  landingCollectionItemPatch("gallery"),
);

export const DELETE = withSecurity(
  { auth: "required", permissions: "services.manage", audit: true },
  landingCollectionItemDelete("gallery"),
);