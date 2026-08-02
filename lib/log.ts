/**
 * Minimal structured logger. Never log passwords, tokens, or payment data.
 * Server-side only; values are JSON-serialized for grep-able logs.
 */
export function logError(event: string, context: Record<string, unknown>): void {
  console.error(JSON.stringify({ level: "error", event, ...context }));
}
