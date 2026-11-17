// @vitest-environment jsdom
import { createElement } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ImageUploader from "./ImageUploader";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));

const fetchMock = vi.fn<typeof fetch>();
const onChange = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("URL", class extends URL {
    static createObjectURL = vi.fn(() => "blob:preview");
    static revokeObjectURL = vi.fn();
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function mount() {
  return render(createElement(ImageUploader, { id: "image", label: "Image", value: "", onChange }));
}
function choose(type = "image/png") {
  fireEvent.change(screen.getByLabelText("Image"), {
    target: { files: [new File(["image"], "photo.png", { type })] },
  });
}

describe("ImageUploader", () => {
  it("rejects unsupported types before starting a request", () => {
    mount();
    choose("image/svg+xml");
    expect(screen.getByRole("alert").textContent).toBe("invalidType");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uploads an image and replaces the local preview with the saved URL", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ data: { url: "/uploads/images/saved.png" } })));
    mount();
    choose();
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("/uploads/images/saved.png"));
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/images/upload", expect.objectContaining({
      method: "POST", credentials: "include", 
    }));
    expect(fetchMock.mock.calls[0][1]?.body).toBeInstanceOf(FormData);
    expect(fetchMock.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
    await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview"));
  });

  it("does not restore a cleared image when an in-flight upload resolves late", async () => {
    let resolve!: (response: Response) => void;
    fetchMock.mockImplementation(() => new Promise<Response>((done) => { resolve = done; }));
    mount();
    choose();
    fireEvent.click(screen.getByRole("button", { name: "remove" }));
    expect(onChange).toHaveBeenLastCalledWith("");
    await act(async () => { resolve(new Response(JSON.stringify({ data: { url: "/late.png" } }))); await Promise.resolve(); });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "choose" }).hasAttribute("disabled")).toBe(false);
  });

  it("keeps a manually entered URL instead of a stale upload response", async () => {
    let resolve!: (response: Response) => void;
    fetchMock.mockImplementation(() => new Promise<Response>((done) => { resolve = done; }));
    mount();
    choose();
    fireEvent.change(screen.getByLabelText("urlLabel"), { target: { value: "https://example.com/manual.png" } });
    await act(async () => { resolve(new Response(JSON.stringify({ data: { url: "/late.png" } }))); await Promise.resolve(); });
    expect(onChange).toHaveBeenCalledExactlyOnceWith("https://example.com/manual.png");
  });

  it("aborts uploads on unmount", () => {
    let signal: AbortSignal | null | undefined;
    fetchMock.mockImplementation((_url, init) => {
      signal = init?.signal;
      return new Promise<Response>(() => {});
    });
    const { unmount } = mount();
    choose();
    unmount();
    expect(signal?.aborted).toBe(true);
  });

  it("shows a localized permission error on forbidden uploads", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ error: { code: "FORBIDDEN" } }), { status: 403 }));
    mount();
    choose();
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("forbidden"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
