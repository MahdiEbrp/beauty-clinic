import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSession, type AuthSession } from "@/lib/auth/dal";
import { uploadFile } from "@/lib/storage/service";
import { POST } from "./route";

vi.mock("@/lib/auth/dal", () => ({ getSession: vi.fn() }));
vi.mock("@/lib/storage/service", () => ({ uploadFile: vi.fn() }));

const session: AuthSession = {
  sessionId: "550e8400-e29b-41d4-a716-4466554400aa",
  userId: "550e8400-e29b-41d4-a716-446655440001",
  user: { id: "550e8400-e29b-41d4-a716-446655440001", email: "editor@example.com", fullName: "Editor", roles: [], permissions: ["services.write"] },
};
const context = { params: Promise.resolve({}) };
const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);

function request(bytes: Uint8Array = png, type = "image/png", origin = "http://localhost:3000") {
  const form = new FormData();
  form.append("file", new File([bytes as Uint8Array<ArrayBuffer>], "untrusted.html", { type }));
  return new Request("http://localhost:3000/api/v1/admin/images/upload", {
    method: "POST", headers: { origin, host: "localhost:3000" }, body: form,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSession).mockResolvedValue(session);
  vi.mocked(uploadFile).mockImplementation((_folder, name) => Promise.resolve({ name, isDir: false, size: 8, mtimeMs: 0 }));
});

describe("permission-scoped image upload", () => {
  it("allows service editors without file-manager access and generates a safe filename", async () => {
    const response = await POST(request(), context);
    expect(response.status).toBe(201);
    const name = vi.mocked(uploadFile).mock.calls[0][1];
    expect(name).toMatch(/^image-[0-9a-f-]+\.png$/);
    expect(uploadFile).toHaveBeenCalledWith("uploads/images", name, expect.any(ReadableStream), 8);
    expect(await response.json()).toMatchObject({ data: { url: `/uploads/images/${name}` } });
  });

  it("rejects unauthenticated users", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    expect((await POST(request(), context)).status).toBe(401);
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it("rejects users without any image-editing permission", async () => {
    vi.mocked(getSession).mockResolvedValue({ ...session, user: { ...session.user, permissions: ["services.read"] } });
    expect((await POST(request(), context)).status).toBe(403);
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it("rejects cross-origin mutations", async () => {
    expect((await POST(request(png, "image/png", "https://evil.example"), context)).status).toBe(403);
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it.each([
    [png, "image/jpeg"],
    [new TextEncoder().encode("<script>alert(1)</script>"), "image/png"],
    [new TextEncoder().encode("GIF8xx"), "image/gif"],
    [new TextEncoder().encode("<svg/>"), "image/svg+xml"],
  ])("rejects mismatched or unsupported signatures (%s, %s)", async (bytes, type) => {
    const response = await POST(request(bytes, type), context);
    expect(response.status).toBe(415);
    expect(await response.json()).toMatchObject({ error: { code: "UNSUPPORTED_MEDIA_TYPE" } });
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it.each([
    [Uint8Array.from([255, 216, 255]), "image/jpeg", "jpg"],
    [new TextEncoder().encode("GIF87a"), "image/gif", "gif"],
    [new TextEncoder().encode("GIF89a"), "image/gif", "gif"],
    [new TextEncoder().encode("RIFF0000WEBP"), "image/webp", "webp"],
  ])("accepts a supported magic signature (%s, %s)", async (bytes, type, extension) => {
    expect((await POST(request(bytes, type), context)).status).toBe(201);
    expect(vi.mocked(uploadFile).mock.calls[0][1].endsWith(`.${extension}`)).toBe(true);
  });

  it.each([new Uint8Array(), new Uint8Array(10 * 1024 * 1024 + 1)])("rejects invalid file sizes before storing", async (bytes) => {
    expect((await POST(request(bytes), context)).status).toBe(413);
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it("rejects a multipart form without a file", async () => {
    const response = await POST(new Request("http://localhost:3000/api/v1/admin/images/upload", {
      method: "POST", headers: { origin: "http://localhost:3000", host: "localhost:3000" }, body: new FormData(),
    }), context);
    expect(response.status).toBe(400);
    expect(uploadFile).not.toHaveBeenCalled();
  });
});
