import { createElement } from "react";
import { groupIconForKey } from "@/data/group-icons";

/**
 * Renders the lucide icon stored on a service group. The component reference
 * is resolved via createElement so it is never created inside the render
 * phase (the icon is data, not a React component definition).
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
  return createElement(Glyph, { className, size, strokeWidth, "aria-hidden": ariaHidden });
}
