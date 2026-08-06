"use client";

import * as React from "react";

export const ROOT_NAME = "Marquee";
export const CONTENT_NAME = "MarqueeContent";

export type Side = "left" | "right" | "top" | "bottom";
export type Orientation = "horizontal" | "vertical";
export type Direction = "ltr" | "rtl";

export type RootElement = HTMLDivElement;
export type ContentElement = HTMLDivElement;

export interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

export interface MarqueeContextValue {
  side: Side;
  orientation: Orientation;
  dir: Direction;
  speed: number;
  loopCount: number;
  contentRef: React.RefObject<ContentElement | null>;
  rootRef: React.RefObject<RootElement | null>;
  autoFill: boolean;
  pauseOnHover: boolean;
  pauseOnKeyboard: boolean;
  reverse: boolean;
  paused: boolean;
}

export interface MarqueeProps extends DivProps {
  side?: Side;
  dir?: Direction;
  speed?: number;
  delay?: number;
  loopCount?: number;
  gap?: string | number;
  autoFill?: boolean;
  pauseOnHover?: boolean;
  pauseOnKeyboard?: boolean;
  reverse?: boolean;
}

export const MarqueeContext = React.createContext<MarqueeContextValue | null>(
  null,
);

export function useMarqueeContext(consumerName: string): MarqueeContextValue {
  const context = React.useContext(MarqueeContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}
