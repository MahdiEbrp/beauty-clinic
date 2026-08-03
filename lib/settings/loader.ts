import "server-only";

import { cache } from "react";
import { getSystemSettings } from "./service";

export const loadSystemSettingsMap = cache(async () => {
  const rows = await getSystemSettings();
  return new Map(rows.map((r) => [r.key, r.value]));
});
