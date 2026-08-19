import {
  landingCollectionItemDelete,
  landingCollectionItemGet,
  landingCollectionItemPatch,
} from "@/lib/landing/admin/api";
import { withSecurity } from "@/lib/api/security";
import { updateServiceCardSchema } from "@/lib/validation/landing";

export const runtime = "nodejs";

export const GET = withSecurity(
  { auth: "required", permissions: "services.read" },
  landingCollectionItemGet("services"),
);

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "services.write",
    validate: { body: updateServiceCardSchema },
    audit: true,
  },
  landingCollectionItemPatch("services"),
);

export const DELETE = withSecurity(
  { auth: "required", permissions: "services.manage", audit: true },
  landingCollectionItemDelete("services"),
);