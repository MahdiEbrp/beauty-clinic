import {
  landingCollectionCreate,
  landingCollectionList,
} from "@/lib/landing/admin/api";
import { withSecurity } from "@/lib/api/security";
import {
  createStatSchema,
  landingListQuerySchema,
} from "@/lib/validation/landing";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "services.read",
    validate: { query: landingListQuerySchema },
  },
  landingCollectionList("stats"),
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "services.write",
    validate: { body: createStatSchema },
    audit: true,
  },
  landingCollectionCreate("stats"),
);