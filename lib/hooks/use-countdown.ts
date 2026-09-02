"use client";

import { useEffect, useState } from "react";

/**
 * Live countdown to a client-relative deadline (epoch ms). Returns `null`
 * until the first tick after mount so server and client HTML never disagree
 * about wall-clock derived text.
 */
export function useCountdown(
  deadline: number | null,
): { secondsLeft: number | null; done: boolean } {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (deadline === null) return;
    // First tick fires on the next macrotask (not synchronously in the
    // effect) so the initial client render still matches the server HTML.
    const tick = () => setNow(Date.now());
    let id = window.setTimeout(() => {
      tick();
      id = window.setInterval(tick, 1000);
    }, 0);
    return () => window.clearInterval(id);
  }, [deadline]);

  if (deadline === null) return { secondsLeft: null, done: true };
  if (now === null) return { secondsLeft: null, done: false };
  const secondsLeft = Math.max(0, Math.ceil((deadline - now) / 1000));
  return { secondsLeft, done: secondsLeft <= 0 };
}
