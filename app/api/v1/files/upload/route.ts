import { withSecurity, jsonOk } from "@/lib/api/security";
import { uploadFile } from "@/lib/storage/service";
import { ApiError } from "@/lib/api/errors";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "files.write",
    audit: true,
  },
  async (request) => {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be multipart/form-data.");
    }

    const folder = String(form.get("folder") ?? "");
    const file = form.get("file");
    if (!(file instanceof File)) {
      throw new ApiError(400, "INVALID_UPLOAD", "A file is required.");
    }
    if (!file.name) {
      throw new ApiError(400, "INVALID_UPLOAD", "The file name is required.");
    }

    const meta = await uploadFile(folder, file.name, file.stream(), file.size);
    return jsonOk(meta, 201);
  },
);
