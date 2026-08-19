import {
  landingCollectionCreate,
  landingCollectionList,
} from "@/lib/landing/admin/api";
import { withSecurity } from "@/lib/api/security";
import {
  createGalleryItemSchema,
  landingListQuerySchema,
} from "@/lib/validation/landing";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "services.read",
    validate: { query: landingListQuerySchema },
  },
  landingCollectionList("gallery"),
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "services.write",
    validate: { body: createGalleryItemSchema },
    audit: true,
  },
  landingCollectionCreate("gallery"),
);