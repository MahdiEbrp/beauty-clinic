/**
 * In-process pub/sub hub that pushes live unread-count updates to connected
 * dashboard clients over SSE.
 *
 * NOTE: module-local state means events do not travel across Node processes.
 * This suits a single-instance deployment. For multi-instance/serverless deploys
 * (or when notifications need to cross instances), replace this module with a
 * shared transport (Redis pub/sub or Postgres LISTEN/NOTIFY) and keep the same
 * subscribe/publish surface.
 */

type Listener = (payload: unknown) => void;

const subscribers = new Map<string, Set<Listener>>();

// All dashboard users share the same read state in this app, so a single global
// channel is sufficient: every connected client gets the latest unread count.
const COUNT_CHANNEL = "notification:unread-count";

/** Subscribe to unread-count updates; returns an unsubscribe function. */
export function subscribeNotification(listener: Listener): () => void {
  let set = subscribers.get(COUNT_CHANNEL);
  if (!set) {
    set = new Set<Listener>();
    subscribers.set(COUNT_CHANNEL, set);
  }
  set.add(listener);
  return () => {
    set.delete(listener);
    if (set.size === 0) subscribers.delete(COUNT_CHANNEL);
  };
}

/** Publish a payload to every connected subscriber. Never throws on a bad listener. */
export function publishNotification(payload: unknown): void {
  const set = subscribers.get(COUNT_CHANNEL);
  if (!set) return;
  for (const listener of [...set]) {
    try {
      listener(payload);
    } catch {
      // A single misbehaving listener must not break the broadcast.
    }
  }
}