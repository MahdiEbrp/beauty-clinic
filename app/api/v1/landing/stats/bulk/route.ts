import { landingCollectionBulk } from "@/lib/landing/admin/api";
import { withSecurity } from "@/lib/api/security";
import { bulkLandingCollectionSchema } from "@/lib/validation/landing";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "services.manage",
    validate: { body: bulkLandingCollectionSchema },
    audit: true,
  },
  landingCollectionBulk("stats"),
);