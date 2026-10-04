import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const cacheGet = vi.fn<() => Promise<unknown>>();
const cacheSet = vi.fn<() => Promise<void>>();
vi.mock("@/lib/cache", () => ({ cacheGet, cacheSet }));

const logInfo = vi.fn();
const logError = vi.fn();
vi.mock("@/lib/log", () => ({ logInfo, logError }));

/** Captures the POST body so assertions can inspect the submitted URL list. */
const fetchMock =
  vi.fn<(url: string, init: RequestInit) => Promise<Response>>();
vi.stubGlobal("fetch", fetchMock);

const getGroupCatalog = vi.fn();
const getCategoryPageCatalog = vi.fn();
// The sweep reads the same cached nav feed the navbar uses; stubbing it keeps the
// test off the database.
vi.mock("@/lib/services/group-page", () => ({ getGroupCatalog }));
vi.mock("@/lib/services/category-page", () => ({
  getCategoryCatalog: getCategoryPageCatalog,
}));

const {
  indexNowConfigured,
  indexNowSweepEnabled,
  notifyIndexNow,
  submitSitemapToIndexNow,
} = await import("./indexnow");

// Protocol-valid dummy key (32 lowercase hex chars); never used for a real submit.
// eslint-disable-next-line no-secrets/no-secrets -- fixed test fixture, not a credential
const KEY = "0123456789abcdef0123456789abcdef";

function ok() {
  return new Response("", { status: 200 });
}

beforeEach(() => {
  vi.stubEnv("INDEXNOW_KEY", KEY);
  cacheGet.mockReset().mockResolvedValue(undefined);
  cacheSet.mockReset().mockResolvedValue(undefined);
  logInfo.mockReset();
  logError.mockReset();
  fetchMock.mockReset().mockResolvedValue(ok());
  getGroupCatalog.mockReset().mockResolvedValue([]);
  getCategoryPageCatalog.mockReset().mockResolvedValue([]);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("configuration", () => {
  it("is configured only when the key matches the protocol charset", () => {
    expect(indexNowConfigured()).toBe(true);

    vi.stubEnv("INDEXNOW_KEY", "");
    expect(indexNowConfigured()).toBe(false);

    vi.stubEnv("INDEXNOW_KEY", "has spaces and $ymbols");
    expect(indexNowConfigured()).toBe(false);

    vi.stubEnv("INDEXNOW_KEY", "short");
    expect(indexNowConfigured()).toBe(false);
  });

  it("defaults the sweep on outside development and honours an explicit off", () => {
    vi.stubEnv("INDEXNOW_ENABLED", undefined);
    vi.stubEnv("NODE_ENV", "production");
    expect(indexNowSweepEnabled()).toBe(true);

    vi.stubEnv("INDEXNOW_ENABLED", "false");
    expect(indexNowSweepEnabled()).toBe(false);
  });
});

describe("notifyIndexNow", () => {
  it("does nothing when unconfigured, so a missing key never spams 403s", async () => {
    vi.stubEnv("INDEXNOW_KEY", "");
    await notifyIndexNow(["/rules"]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does nothing for an empty list", async () => {
    await notifyIndexNow([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  /**
   * A locale-relative path must fan out to both locales: a fa-only content
   * change still alters the en URL, and IndexNow keys URLs, not content.
   */
  it("expands a relative path into every locale variant", async () => {
    await notifyIndexNow(["/rules"]);

    const body = JSON.parse(fetchMock.mock.calls[0][1]?.body as string) as {
      host: string;
      key: string;
      keyLocation: string;
      urlList: string[];
    };
    expect(body.urlList.sort()).toEqual([
      "https://example.com/en/rules",
      "https://example.com/rules",
    ]);
    expect(body.host).toBe("example.com");
    expect(body.key).toBe(KEY);
    expect(body.keyLocation).toBe(`https://example.com/${KEY}.txt`);
  });

  it("accepts absolute URLs and URL objects verbatim", async () => {
    await notifyIndexNow([
      "https://example.com/pricing",
      new URL("https://example.com/care"),
    ]);

    const body = JSON.parse(fetchMock.mock.calls[0][1]?.body as string) as {
      urlList: string[];
    };
    expect(body.urlList.sort()).toEqual([
      "https://example.com/care",
      "https://example.com/pricing",
    ]);
  });

  /**
   * IndexNow answers 429 to excessive submissions and repeated 429s can get a key
   * throttled, so an already-submitted URL is suppressed for the dedupe window.
   */
  it("suppresses URLs already submitted inside the dedupe window", async () => {
    cacheGet.mockResolvedValue(true);
    await notifyIndexNow(["/rules"]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("de-duplicates repeats within a single call", async () => {
    await notifyIndexNow(["/rules", "/rules", "https://example.com/rules"]);

    const body = JSON.parse(fetchMock.mock.calls[0][1]?.body as string) as {
      urlList: string[];
    };
    expect(body.urlList).toHaveLength(2);
  });

  it("marks only successfully submitted URLs as sent", async () => {
    fetchMock.mockResolvedValueOnce(new Response("", { status: 500 }));
    await notifyIndexNow(["/rules"]);

    expect(cacheSet).not.toHaveBeenCalled();

    logError.mockClear();
    fetchMock.mockResolvedValueOnce(new Response("", { status: 429 }));
    await notifyIndexNow(["/care"]);

    expect(cacheSet).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledWith(
      "indexnow.rejected",
      expect.objectContaining({ status: 429 }),
    );
  });

  it("accepts 202, which the endpoint returns while validating a new key", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 202 }));
    await notifyIndexNow(["/rules"]);
    expect(cacheSet).toHaveBeenCalled();
  });

  /**
   * The critical safety property: an admin edit must never be rolled back because
   * a notification failed, so nothing here may throw into the caller's
   * transaction.
   */
  it("swallows network failures instead of throwing into the caller", async () => {
    fetchMock.mockRejectedValue(new Error("ECONNRESET"));
    await expect(notifyIndexNow(["/rules"])).resolves.toBeUndefined();
    expect(logError).toHaveBeenCalledWith(
      "indexnow.failed",
      expect.objectContaining({ error: "ECONNRESET" }),
    );
  });

  it("batches at the 10,000-URL protocol ceiling", async () => {
    const paths = Array.from({ length: 10_001 }, (_, i) => `https://example.com/p${i}`);
    await notifyIndexNow(paths);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const sizes = fetchMock.mock.calls.map((call) => {
      const body = JSON.parse(call[1]?.body as string) as { urlList: string[] };
      return body.urlList.length;
    });
    expect(sizes).toEqual([10_000, 1]);
  });

  it("aborts a hung request instead of blocking the mutation forever", async () => {
    // The implementation arms a 10s AbortController; assert the signal is
    // actually plumbed through rather than reproducing the timeout here.
    let captured: AbortSignal | undefined;
    fetchMock.mockImplementation((_url: unknown, init?: RequestInit) => {
      captured = init?.signal ?? undefined;
      return new Promise<Response>((_resolve, reject) => {
        captured?.addEventListener("abort", () =>
          reject(new DOMException("aborted", "AbortError")),
        );
      });
    });

    const pending = notifyIndexNow(["/rules"]);
    // Let the fetch start, then confirm the caller is still pending (not
    // resolved) and that an abort signal was supplied.
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(captured).toBeInstanceOf(AbortSignal);
    expect(captured?.aborted).toBe(false);

    captured?.dispatchEvent(new Event("abort"));
    await expect(pending).resolves.toBeUndefined();
    expect(logError).toHaveBeenCalledWith(
      "indexnow.failed",
      expect.objectContaining({ error: "aborted" }),
    );
  });
});

// eslint-disable-next-line no-secrets/no-secrets -- exported function name, not a credential
describe("submitSitemapToIndexNow", () => {
  it("includes static pages, groups and categories for both locales", async () => {
    cacheGet.mockResolvedValue(true);
    getGroupCatalog.mockResolvedValue([
      { groupSlug: "face-filler", updatedAt: new Date("2026-01-01") },
    ]);
    getCategoryPageCatalog.mockResolvedValue([
      {
        groupSlug: "face-filler",
        categorySlug: "face-filler-cheek",
        updatedAt: new Date("2026-01-01"),
      },
    ]);

    await submitSitemapToIndexNow();

    // Everything fits in a single batch at this catalog size.
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const body = JSON.parse(fetchMock.mock.calls[0][1]?.body as string) as {
      urlList: string[];
    };
    expect(body.urlList.sort()).toEqual([
      "https://example.com/",
      "https://example.com/booking",
      "https://example.com/care",
      "https://example.com/en",
      "https://example.com/en/booking",
      "https://example.com/en/care",
      "https://example.com/en/pricing",
      "https://example.com/en/rules",
      "https://example.com/en/services",
      "https://example.com/en/services/face-filler",
      "https://example.com/en/services/face-filler/face-filler-cheek",
      "https://example.com/pricing",
      "https://example.com/rules",
      "https://example.com/services",
      "https://example.com/services/face-filler",
      "https://example.com/services/face-filler/face-filler-cheek",
    ]);
  });

  /**
   * The sweep's whole purpose is to re-announce, so it must bypass the dedupe
   * window that suppresses repeated targeted submissions.
   */
  it("re-announces URLs already marked as submitted", async () => {
    cacheGet.mockResolvedValue(true);
    await submitSitemapToIndexNow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("is a no-op without a key", async () => {
    vi.stubEnv("INDEXNOW_KEY", "");
    await submitSitemapToIndexNow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("logs the outcome for the sweep", async () => {
    await submitSitemapToIndexNow();
     
    expect(logInfo).toHaveBeenCalledWith(
      "indexnow.sweep",
      expect.objectContaining({ accepted: 1 }),
    );
  });
});