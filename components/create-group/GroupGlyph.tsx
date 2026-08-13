import { createElement } from "react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { Sparkles } from "lucide-react";

import {
  canonicalIconName,
  groupIconForKey,
} from "@/data/group-icons";

/**
 * Renders the lucide icon stored on a service group. Curated choices use the
 * statically imported component (resolved via createElement so the icon stays
 * data, not a component definition); any other stored key is resolved lazily
 * through `DynamicIcon` so the full icon library stays out of the bundle.
 */
export default function GroupGlyph({
  name,
  className,
  size = 24,
  strokeWidth,
  "aria-hidden": ariaHidden = true,
}: {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
  "aria-hidden"?: boolean;
}) {
  const Glyph = groupIconForKey(name);
  if (Glyph) {
    return createElement(Glyph, {
      className,
      size,
      strokeWidth,
      "aria-hidden": ariaHidden,
    });
  }
  const canonical = canonicalIconName(name);
  if (canonical) {
    return (
      <DynamicIcon
        name={canonical as IconName}
        className={className}
        size={size}
        strokeWidth={strokeWidth}
        aria-hidden={ariaHidden}
      />
    );
  }
  return createElement(Sparkles, {
    className,
    size,
    strokeWidth,
    "aria-hidden": ariaHidden,
  });
}
