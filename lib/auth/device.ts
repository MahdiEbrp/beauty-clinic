export type DeviceKind = "mobile" | "tablet" | "desktop" | "unknown";

export type DeviceInfo = {
  kind: DeviceKind;
  /** Human-readable label like "Computer · Chrome · Windows". Empty when unknown. */
  label: string;
};

/**
 * Minimal user-agent → device info for the dashboard sessions list. Cosmetic
 * only: a hand-rolled parser keeps dependencies at zero and covers the vast
 * majority of real UAs. Unknown agents degrade to an empty label so the client
 * can render a translated fallback.
 */
export function describeDevice(userAgent?: string | null): DeviceInfo {
  if (!userAgent) return { kind: "unknown", label: "" };

  let kind: DeviceKind = "desktop";
  if (/iPad|Tablet/i.test(userAgent)) kind = "tablet";
  else if (/Mobile|Android|iPhone/i.test(userAgent)) kind = "mobile";

  let browser = "";
  if (/Edg\//i.test(userAgent)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(userAgent)) browser = "Opera";
  else if (/Firefox\//i.test(userAgent)) browser = "Firefox";
  else if (/Chrome\//i.test(userAgent)) browser = "Chrome";
  else if (/Safari\//i.test(userAgent)) browser = "Safari";

  let os = "";
  // iOS UAs embed "like Mac OS X", so it must win over the macOS check.
  if (/iPhone|iPad/i.test(userAgent)) os = "iOS";
  else if (/Windows/i.test(userAgent)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(userAgent)) os = "macOS";
  else if (/Android/i.test(userAgent)) os = "Android";
  else if (/Linux/i.test(userAgent)) os = "Linux";

  const parts = [
    kind === "desktop" ? "Computer" : kind === "tablet" ? "Tablet" : "Mobile",
    browser,
    os,
  ].filter(Boolean);

  return { kind, label: parts.join(" · ") };
}
