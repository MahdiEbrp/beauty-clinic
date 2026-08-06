"use client";

import { cva } from "class-variance-authority";

export const marqueeContentVariants = cva(
  "flex min-w-full shrink-0 gap-(--marquee-gap)",
  {
    variants: {
      side: {
        left: "animate-marquee-left",
        right: "animate-marquee-right",
        top: "min-h-full min-w-auto animate-marquee-up flex-col",
        bottom: "min-h-full min-w-auto animate-marquee-down flex-col",
      },
      dir: {
        ltr: "",
        rtl: "",
      },
      pauseOnHover: {
        true: "group-hover:[animation-play-state:paused]",
        false: "",
      },
      reverse: {
        true: "[animation-direction:reverse]",
        false: "",
      },
    },
    compoundVariants: [
      {
        side: "left",
        dir: "rtl",
        className: "animate-marquee-left-rtl",
      },
      {
        side: "right",
        dir: "rtl",
        className: "animate-marquee-right-rtl",
      },
    ],
    defaultVariants: {
      side: "left",
      dir: "ltr",
      pauseOnHover: false,
      reverse: false,
    },
  },
);

export const marqueeEdgeVariants = cva("pointer-events-none absolute z-10", {
  variants: {
    side: {
      left: "top-0 left-0 h-full bg-gradient-to-r from-background to-transparent",
      right:
        "top-0 right-0 h-full bg-gradient-to-l from-background to-transparent",
      top: "top-0 left-0 w-full bg-gradient-to-b from-background to-transparent",
      bottom:
        "bottom-0 left-0 w-full bg-gradient-to-t from-background to-transparent",
    },
    size: {
      default: "",
      sm: "",
      lg: "",
    },
  },
  compoundVariants: [
    {
      side: ["left", "right"],
      size: "default",
      className: "w-1/4",
    },
    {
      side: ["left", "right"],
      size: "sm",
      className: "w-1/6",
    },
    {
      side: ["left", "right"],
      size: "lg",
      className: "w-1/3",
    },
    {
      side: ["top", "bottom"],
      size: "default",
      className: "h-1/4",
    },
    {
      side: ["top", "bottom"],
      size: "sm",
      className: "h-1/6",
    },
    {
      side: ["top", "bottom"],
      size: "lg",
      className: "h-1/3",
    },
  ],
  defaultVariants: {
    size: "default",
  },
});
