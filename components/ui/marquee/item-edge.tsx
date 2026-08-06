"use client";

import { Slot as SlotPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import type { DivProps } from "./context";
import { marqueeEdgeVariants } from "./variants";

export function MarqueeItem(props: DivProps) {
  const { className, asChild, ...itemProps } = props;

  const ItemPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <ItemPrimitive
      data-slot="marquee-item"
      {...itemProps}
      className={cn("shrink-0", className)}
    />
  );
}

interface MarqueeEdgeProps
  extends React.ComponentProps<"div"> {
  side: "left" | "right" | "top" | "bottom";
  size?: "default" | "sm" | "lg";
  asChild?: boolean;
}

export function MarqueeEdge(props: MarqueeEdgeProps) {
  const { side, size, className, asChild, ...edgeProps } = props;

  const EdgePrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <EdgePrimitive
      data-size={size}
      data-slot="marquee-edge"
      {...edgeProps}
      className={cn(marqueeEdgeVariants({ side, size, className }))}
    />
  );
}
