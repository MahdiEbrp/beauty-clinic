import {
  landingCollectionItemDelete,
  landingCollectionItemGet,
  landingCollectionItemPatch,
} from "@/lib/landing/admin/api";
import { withSecurity } from "@/lib/api/security";
import { updateStatSchema } from "@/lib/validation/landing";

export const runtime = "nodejs";

export const GET = withSecurity(
  { auth: "required", permissions: "services.read" },
  landingCollectionItemGet("stats"),
);

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "services.write",
    validate: { body: updateStatSchema },
    audit: true,
  },
  landingCollectionItemPatch("stats"),
);

export const DELETE = withSecurity(
  { auth: "required", permissions: "services.manage", audit: true },
  landingCollectionItemDelete("stats"),
);