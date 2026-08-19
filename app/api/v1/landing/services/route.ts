import {
  landingCollectionCreate,
  landingCollectionList,
} from "@/lib/landing/admin/api";
import { withSecurity } from "@/lib/api/security";
import {
  createServiceCardSchema,
  landingListQuerySchema,
} from "@/lib/validation/landing";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "services.read",
    validate: { query: landingListQuerySchema },
  },
  landingCollectionList("services"),
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "services.write",
    validate: { body: createServiceCardSchema },
    audit: true,
  },
  landingCollectionCreate("services"),
);