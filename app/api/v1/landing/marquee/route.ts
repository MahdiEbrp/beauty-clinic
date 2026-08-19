import {
  landingCollectionCreate,
  landingCollectionList,
} from "@/lib/landing/admin/api";
import { withSecurity } from "@/lib/api/security";
import {
  createMarqueeItemSchema,
  landingListQuerySchema,
} from "@/lib/validation/landing";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "services.read",
    validate: { query: landingListQuerySchema },
  },
  landingCollectionList("marquee"),
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "services.write",
    validate: { body: createMarqueeItemSchema },
    audit: true,
  },
  landingCollectionCreate("marquee"),
);