"use client";

import * as React from "react";
import { Slot as SlotPrimitive } from "radix-ui";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { CONTENT_NAME, useMarqueeContext, type DivProps } from "./context";
import {
  resizeObserverStore,
  useResizeObserverStore,
} from "./resize-observer";
import { marqueeContentVariants } from "./variants";

export function MarqueeContent(props: DivProps) {
  const {
    className,
    asChild,
    ref,
    children,
    style: styleProp,
    ...contentProps
  } = props;

  const context = useMarqueeContext(CONTENT_NAME);
  const composedRef = useComposedRefs(ref, context.contentRef);

  const isVertical = context.orientation === "vertical";
  const isRtl = context.dir === "rtl";

  const dimensions = useResizeObserverStore(
    context.rootRef,
    context.contentRef,
    context.orientation,
  );

  React.useEffect(() => {
    if (context.rootRef.current && context.contentRef.current) {
      resizeObserverStore.observe(
        context.rootRef.current,
        context.contentRef.current,
      );

      return () => {
        resizeObserverStore.unobserve(
          context.rootRef.current,
          context.contentRef.current,
        );
      };
    }
  }, [context.rootRef, context.contentRef]);

  const multiplier = React.useMemo(() => {
    if (!context.autoFill || !dimensions) return 1;

    const { rootSize, contentSize } = dimensions;
    if (contentSize === 0) return 1;

    return contentSize < rootSize ? Math.ceil(rootSize / contentSize) : 1;
  }, [context.autoFill, dimensions]);

  const onMultipliedChildrenRender = React.useCallback(
    (count: number) => {
      return Array.from({ length: Math.max(0, count) }).map((_, i) => (
        <React.Fragment key={i}>{children}</React.Fragment>
      ));
    },
    [children],
  );

  const style = React.useMemo(
    () => ({
      ...styleProp,
      animationDuration: "var(--marquee-duration)",
      animationDelay: "var(--marquee-delay)",
      animationIterationCount: "var(--marquee-loop-count)",
      animationDirection: context.reverse ? "reverse" : "normal",
    }),
    [styleProp, context.reverse],
  );

  const ContentPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <>
      <ContentPrimitive
        data-orientation={context.orientation}
        data-slot="marquee-content"
        {...contentProps}
        style={style}
        className={cn(
          marqueeContentVariants({
            side: context.side,
            dir: context.dir,
            pauseOnHover: context.pauseOnHover,
            reverse: context.reverse,
            className,
          }),
          isVertical && "flex-col",
          isVertical
            ? "mb-(--marquee-gap)"
            : isRtl
              ? "ml-(--marquee-gap)"
              : "mr-(--marquee-gap)",
        )}
      >
        <div
          ref={composedRef}
          className={cn(
            "flex shrink-0 gap-(--marquee-gap)",
            isVertical && "flex-col",
          )}
        >
          {children}
        </div>
        {onMultipliedChildrenRender(multiplier - 1)}
      </ContentPrimitive>
      <ContentPrimitive
        role="presentation"
        aria-hidden="true"
        {...contentProps}
        style={style}
        className={cn(
          marqueeContentVariants({
            side: context.side,
            dir: context.dir,
            pauseOnHover: context.pauseOnHover,
            reverse: context.reverse,
            className,
          }),
          isVertical && "flex-col",
        )}
      >
        {onMultipliedChildrenRender(multiplier)}
      </ContentPrimitive>
    </>
  );
}
