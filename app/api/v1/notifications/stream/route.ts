import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/dal";
import { subscribeNotification } from "@/lib/notifications/hub";
import { countUnreadNotifications } from "@/lib/notifications/service";

export const runtime = "nodejs";

// SSE spec recommends a keep-alive frame every ~15-30s; proxies also time out
// idle connections, so ping well before the common 60s proxy cutoff.
const HEARTBEAT_MS = 25_000;

// This endpoint serves a long-lived stream, so it handles auth inline instead
// of wrapping with withSecurity (which returns a JSON NextResponse).
export async function GET(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Not authenticated.",
        },
      },
      { status: 401 },
    );
  }

  const encoder = new TextEncoder();
  const requestId = crypto.randomUUID();
  let unsubscribe = () => {};
  let ended = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: unknown) => {
        if (ended) return;
        const frame = `event: notification\ndata: ${JSON.stringify(payload)}\n\n`;
        try {
          controller.enqueue(encoder.encode(frame));
        } catch {
          // Stream closed between checks.
        }
      };

      // Send the current count immediately so the badge is correct on load.
      try {
        send({ unreadCount: await countUnreadNotifications() });
      } catch {
        // Initial snapshot is best-effort; the client also polls as a fallback.
      }

      unsubscribe = subscribeNotification((payload) => send(payload));

      const heartbeat = setInterval(() => {
        if (ended) return;
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          // Ignore; connection is already gone.
        }
      }, HEARTBEAT_MS);

      const finish = () => {
        if (ended) return;
        ended = true;
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      };

      request.signal?.addEventListener("abort", finish, { once: true });
    },
    cancel() {
      // Fires when the client disconnects/times out before graceful abort.
      if (!ended) {
        ended = true;
        unsubscribe();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Disable proxy buffering so events flush to the client immediately.
      "X-Accel-Redirect-Buffer": "no",
      "X-Request-Id": requestId,
    },
  });
}