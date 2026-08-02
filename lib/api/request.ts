import { ApiError } from "./errors";

const DEFAULT_JSON_LIMIT_BYTES = 64 * 1024;

/**
 * Reads and parses a JSON request body with a hard byte cap, validating the
 * Content-Type first. Prevents large-payload DoS and rejects non-JSON input.
 */
export async function readJsonBody(
  request: Request,
  limitBytes: number = DEFAULT_JSON_LIMIT_BYTES,
): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json.");
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > limitBytes) {
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
  }

  if (!request.body) {
    throw new ApiError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  let received = 0;
  const chunks: Uint8Array[] = [];
  const reader = request.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > limitBytes) {
      await reader.cancel();
      throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
    }
    chunks.push(value);
  }

  const text = new TextDecoder().decode(
    chunks.length === 1
      ? chunks[0]
      : (() => {
          const merged = new Uint8Array(received);
          let offset = 0;
          for (const chunk of chunks) {
            merged.set(chunk, offset);
            offset += chunk.byteLength;
          }
          return merged;
        })(),
  );

  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }
}

/**
 * Secondary CSRF defense for cookie-based state-changing requests: the Origin
 * (falling back to Referer) must match the Host. Browsers always send Origin on
 * cross-origin writes, so a mismatch means a cross-site request.
 */
export function isSameOrigin(request: Request): boolean {
  const host = request.headers.get("host");
  if (!host) return false;

  const origin = request.headers.get("origin");
  if (origin) {
    if (origin === "null") return false;
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  return false;
}

export function clientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || undefined;
  }
  return request.headers.get("x-real-ip") ?? undefined;
}
