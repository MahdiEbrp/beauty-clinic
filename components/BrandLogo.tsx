import { cn } from "@/lib/utils";

type BrandLogoProps = {
  alt: string;
  className?: string;
};

/**
 * The clinic logo rendered as a native <img>. Height is set by the caller and
 * width follows automatically (w-auto) so the 16:9 artwork is never stretched
 * or squashed.
 */
export default function BrandLogo({ alt, className }: BrandLogoProps) {
  return (
    <img
      src="/images/logo.webp"
      alt={alt}
      width={400}
      height={225}
      className={cn("h-7 w-auto", className)}
    />
  );
}