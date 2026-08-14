"use client";

import Image from "next/image";
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
 * Renders a service image with next/image. Remote (http/https) URLs are served
 * unoptimized — uploaded files live under /public so they render locally, but
 * an admin may paste an external URL and we never fail on it. A graceful
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
  const remote = hasSrc ? /^https?:\/\//.test(src as string) : false;

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

  if (fill) {
    return (
      <Image
        src={src as string}
        alt={alt}
        fill
        sizes={sizes}
        unoptimized={remote}
        onError={() => setFailed(true)}
        className={className}
      />
    );
  }

  return (
    <Image
      src={src as string}
      alt={alt}
      width={width ?? 480}
      height={height ?? 360}
      sizes={sizes}
      unoptimized={remote}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
