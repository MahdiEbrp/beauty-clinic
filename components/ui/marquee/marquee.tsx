"use client";

import * as React from "react";
import { Direction as DirectionPrimitive, Slot as SlotPrimitive } from "radix-ui";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import {
  MarqueeContext,
  type ContentElement,
  type Direction,
  type MarqueeProps,
  type Orientation,
  type RootElement,
} from "./context";
import { useResizeObserverStore } from "./resize-observer";

export function Marquee(props: MarqueeProps) {
  const {
    side = "left",
    dir: dirProp,
    speed = 50,
    delay = 0,
    loopCount = 0,
    gap = "1rem",
    asChild,
    autoFill = false,
    pauseOnHover = false,
    pauseOnKeyboard = false,
    reverse = false,
    className,
    style: styleProp,
    ref,
    ...marqueeProps
  } = props;

  const orientation: Orientation =
    side === "top" || side === "bottom" ? "vertical" : "horizontal";

  const dir = DirectionPrimitive.useDirection(dirProp);

  const rootRef = React.useRef<RootElement>(null);
  const contentRef = React.useRef<ContentElement>(null);
  const composedRef = useComposedRefs(ref, rootRef);

  const [paused, setPaused] = React.useState(false);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (pauseOnKeyboard && event.key === " ") {
        event.preventDefault();
        setPaused((prev) => !prev);
      }
    },
    [pauseOnKeyboard],
  );

  const dimensions = useResizeObserverStore(rootRef, contentRef, orientation);

  const duration = React.useMemo(() => {
    const safeSpeed = Math.max(0.001, speed);

    if (!dimensions) {
      const defaultDistance = autoFill ? 1000 : 2000;
      return defaultDistance / safeSpeed;
    }

    const { rootSize, contentSize } = dimensions;

    if (autoFill) {
      const multiplier =
        contentSize < rootSize ? Math.ceil(rootSize / contentSize) : 1;
      return (contentSize * multiplier) / safeSpeed;
    } else {
      return contentSize < rootSize
        ? rootSize / safeSpeed
        : contentSize / safeSpeed;
    }
  }, [dimensions, speed, autoFill]);

  const style = React.useMemo<React.CSSProperties>(
    () => ({
      "--marquee-duration": `${duration}s`,
      "--marquee-gap": gap,
      "--marquee-delay": `${delay}s`,
      "--marquee-loop-count":
        loopCount === 0 || loopCount === Infinity
          ? "infinite"
          : loopCount.toString(),
      ...styleProp,
    }),
    [duration, gap, delay, loopCount, styleProp],
  );

  const contextValue = React.useMemo(
    () => ({
      side,
      orientation,
      dir,
      speed,
      loopCount,
      contentRef,
      rootRef,
      autoFill,
      paused,
      pauseOnHover,
      pauseOnKeyboard,
      reverse,
    }),
    [
      side,
      orientation,
      dir,
      speed,
      loopCount,
      autoFill,
      paused,
      pauseOnHover,
      pauseOnKeyboard,
      reverse,
    ],
  );

  const MarqueePrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <MarqueeContext.Provider value={contextValue}>
      <div data-slot="marquee-wrapper" className="grid">
        <MarqueePrimitive
          role="marquee"
          aria-live="off"
          data-orientation={orientation}
          data-slot="marquee"
          dir={dir}
          tabIndex={pauseOnKeyboard ? 0 : undefined}
          {...marqueeProps}
          ref={composedRef}
          className={cn(
            "relative flex overflow-hidden motion-reduce:animate-none",
            orientation === "vertical" && "h-full flex-col",
            orientation === "horizontal" && "w-full",
            paused && "**:[animation-play-state:paused]",
            pauseOnHover && "group",
            pauseOnKeyboard &&
              "rounded-md focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            className,
          )}
          style={style}
          onKeyDown={pauseOnKeyboard ? onKeyDown : undefined}
        />
      </div>
    </MarqueeContext.Provider>
  );
}

export type { Direction };
