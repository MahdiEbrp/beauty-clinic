"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type ServiceImageProps = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
};

/**
 * Renders a service image with a native <img> tag. Remote (http/https) URLs are
 * loaded directly by the browser (never run through Next's image optimizer, so
 * they work for pre-signed/third-party hosts without configuration). A graceful
 * placeholder replaces broken or missing images.
 */
export default function ServiceImage({
  src,
  alt,
  className,
  sizes,
  fill = false,
  width,
  height,
}: ServiceImageProps) {
  const [failed, setFailed] = useState(false);
  const hasSrc = Boolean(src);

  if (!hasSrc || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex items-center justify-center bg-surface-tertiary text-copper",
          className,
        )}
      >
        <Sparkles className="size-8" strokeWidth={1.5} aria-hidden="true" />
      </div>
    );
  }

  const sizing = fill ? "h-full w-full" : "";
  return (
    <img
      src={src as string}
      alt={alt}
      width={fill ? undefined : (width ?? 480)}
      height={fill ? undefined : (height ?? 360)}
      sizes={sizes}
      onError={() => setFailed(true)}
      className={cn("object-cover", sizing, className)}
    />
  );
}
