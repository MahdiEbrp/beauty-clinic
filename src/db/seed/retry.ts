/**
 * Retry helper for the seed pipeline.
 *
 * Every seed phase is built from idempotent upserts, so re-running a phase
 * after a transient connection drop is safe. The DB layer never retries
 * queries itself (it cannot know whether an operation is idempotent), so the
 * seed wraps each phase here instead.
 */

const TRANSIENT_ERROR =
  /ECONNRESET|ECONNREFUSED|ETIMEDOUT|EPIPE|EHOSTUNREACH|ENETUNREACH|CONNECT_TIMEOUT|idle timeout|socket (?:hang up|closed)|connection (?:terminated|reset|closed|refused|timeout)|failed to connect|timeout expired/i;

export interface RetryOptions {
  /** Total attempts including the first run. Defaults to 3. */
  attempts?: number;
  /** Backoff base in ms. Delay before attempt n is base * 2^(n-1). Defaults to 300. */
  baseDelayMs?: number;
  /** Whether to log each retry to the console. Defaults to true. */
  log?: boolean;
}

/** Whether the error looks like a transient connection-level failure. */
function isTransient(error: unknown): boolean {
  return TRANSIENT_ERROR.test(errorMessage(error));
}

function errorMessage(error: unknown): string {
  if (error instanceof AggregateError && error.errors) {
    return error.errors.map(errorMessage).join(" ");
  }
  if (error instanceof Error) {
    const pieces = [error.message];
    if (error.cause != null) pieces.push(errorMessage(error.cause));
    return pieces.join(" ");
  }
  return String(error);
}

/**
 * Runs `fn`, retrying it up to `attempts` times only when it fails with a
 * transient connection error. Non-transient failures rethrow immediately.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const attempts = Math.max(1, options.attempts ?? 3);
  const baseDelayMs = Math.max(0, options.baseDelayMs ?? 300);
  const log = options.log ?? true;

  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isTransient(error)) throw error;
      if (attempt >= attempts) break;
      const delayMs = baseDelayMs * 2 ** (attempt - 1);
      if (log) {
        console.warn(
          `[seed] transient DB error (retry ${attempt} of ${attempts - 1}), retrying in ${delayMs}ms...`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}