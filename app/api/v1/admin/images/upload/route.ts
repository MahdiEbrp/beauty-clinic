import { withSecurity, jsonOk } from "@/lib/api/security";
import { ApiError } from "@/lib/api/errors";
import { uploadFile } from "@/lib/storage/service";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export const POST = withSecurity(
  {
    auth: "required",
    anyPermissions: [
      "files.write",
      "services.write",
      "services.manage",
      "rules.write",
      "care-guides.write",
      "settings.write",
    ],
    audit: true,
  },
  async (request) => {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be multipart/form-data.");
    }

    const file = form.get("file");
    if (!(file instanceof File) || !file.name) {
      throw new ApiError(400, "INVALID_UPLOAD", "An image file is required.");
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Only JPG, PNG, WEBP and GIF images are supported.");
    }
    const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const isPng = header.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => header[index] === byte);
    const isJpeg = header.length >= 3 && header[0] === 255 && header[1] === 216 && header[2] === 255;
    const isGif = header.length >= 6 && String.fromCharCode(...header.slice(0, 6)).startsWith("GIF8");
    const isWebp = header.length >= 12 && String.fromCharCode(...header.slice(0, 4)) === "RIFF" && String.fromCharCode(...header.slice(8, 12)) === "WEBP";
    if (!(isPng || isJpeg || isGif || isWebp)) {
      throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "The uploaded file is not a supported image.");
    }
    if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
      throw new ApiError(413, "PAYLOAD_TOO_LARGE", "The image must be between 1 byte and 10 MB.");
    }

    const extension = file.type === "image/jpeg" ? "jpg"
      : file.type === "image/png" ? "png"
      : file.type === "image/webp" ? "webp"
      : "gif";
    const filename = `image-${crypto.randomUUID()}.${extension}`;
    const meta = await uploadFile("uploads/images", filename, file.stream(), file.size);
    return jsonOk({ url: `/uploads/images/${meta.name}` }, 201);
  },
);
