"use client";

import * as React from "react";
import type {
  ContentElement,
  Orientation,
  RootElement,
} from "./context";

interface Dimensions {
  width: number;
  height: number;
}

export interface ElementDimensions {
  rootSize: number;
  contentSize: number;
}

function createResizeObserverStore() {
  const listeners = new Set<() => void>();
  let observer: ResizeObserver | null = null;
  const elements = new Map<Element, Dimensions>();
  const refCounts = new Map<Element, number>();
  const isSupported = typeof ResizeObserver !== "undefined";
  let notificationScheduled = false;

  const snapshotCache = new WeakMap<
    Element,
    WeakMap<
      Element,
      { horizontal: ElementDimensions; vertical: ElementDimensions }
    >
  >();

  function notify() {
    if (notificationScheduled) return;
    notificationScheduled = true;
    queueMicrotask(() => {
      notificationScheduled = false;
      for (const callback of listeners) {
        callback();
      }
    });
  }

  function cleanup() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    elements.clear();
    refCounts.clear();
  }

  function subscribe(callback: () => void) {
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        cleanup();
      }
    };
  }

  function getSnapshot(
    rootElement: RootElement | null,
    contentElement: ContentElement | null,
    orientation: Orientation,
  ): ElementDimensions | null {
    if (!rootElement || !contentElement) return null;

    const rootDims = elements.get(rootElement);
    const contentDims = elements.get(contentElement);

    if (!rootDims || !contentDims) return null;

    const rootSize =
      orientation === "vertical" ? rootDims.height : rootDims.width;
    const contentSize =
      orientation === "vertical" ? contentDims.height : contentDims.width;

    let rootCache = snapshotCache.get(rootElement);
    if (!rootCache) {
      rootCache = new WeakMap();
      snapshotCache.set(rootElement, rootCache);
    }

    let contentCache = rootCache.get(contentElement);
    if (!contentCache) {
      contentCache = {
        horizontal: { rootSize: -1, contentSize: -1 },
        vertical: { rootSize: -1, contentSize: -1 },
      };
      rootCache.set(contentElement, contentCache);
    }

    const cached = contentCache[orientation];
    if (cached.rootSize === rootSize && cached.contentSize === contentSize) {
      return cached;
    }

    const snapshot = { rootSize, contentSize };
    contentCache[orientation] = snapshot;
    return snapshot;
  }

  function observe(
    rootElement: RootElement | null,
    contentElement: Element | null,
  ) {
    if (!isSupported || !rootElement || !contentElement) return;

    if (!observer) {
      observer = new ResizeObserver((entries) => {
        let hasChanged = false;

        for (const entry of entries) {
          const element = entry.target;
          const { width, height } = entry.contentRect;

          const currentData = elements.get(element);

          if (
            !currentData ||
            currentData.width !== width ||
            currentData.height !== height
          ) {
            elements.set(element, { width, height });
            hasChanged = true;
          }
        }

        if (hasChanged) {
          notify();
        }
      });
    }

    refCounts.set(rootElement, (refCounts.get(rootElement) ?? 0) + 1);
    refCounts.set(contentElement, (refCounts.get(contentElement) ?? 0) + 1);

    observer.observe(rootElement);
    observer.observe(contentElement);

    const rootRect = rootElement.getBoundingClientRect();
    const contentRect = contentElement.getBoundingClientRect();

    const rootData = { width: rootRect.width, height: rootRect.height };
    const contentData = {
      width: contentRect.width,
      height: contentRect.height,
    };

    elements.set(rootElement, rootData);
    elements.set(contentElement, contentData);

    if (
      rootData.width > 0 &&
      rootData.height > 0 &&
      contentData.width > 0 &&
      contentData.height > 0
    ) {
      notify();
    }
  }

  function unobserve(
    rootElement: RootElement | null,
    contentElement: Element | null,
  ) {
    if (!observer || !rootElement || !contentElement) return;

    const rootCount = (refCounts.get(rootElement) ?? 1) - 1;
    const contentCount = (refCounts.get(contentElement) ?? 1) - 1;

    if (rootCount <= 0) {
      observer.unobserve(rootElement);
      elements.delete(rootElement);
      refCounts.delete(rootElement);
    } else {
      refCounts.set(rootElement, rootCount);
    }

    if (contentCount <= 0) {
      observer.unobserve(contentElement);
      elements.delete(contentElement);
      refCounts.delete(contentElement);
    } else {
      refCounts.set(contentElement, contentCount);
    }
  }

  return {
    subscribe,
    getSnapshot,
    observe,
    unobserve,
  };
}

const resizeObserverStore = createResizeObserverStore();

export function useResizeObserverStore(
  rootRef: React.RefObject<RootElement | null>,
  contentRef: React.RefObject<ContentElement | null>,
  orientation: Orientation,
) {
  const onSubscribe = React.useCallback(
    (callback: () => void) => resizeObserverStore.subscribe(callback),
    [],
  );

  const getSnapshot = React.useCallback(
    () =>
      resizeObserverStore.getSnapshot(
        rootRef.current,
        contentRef.current,
        orientation,
      ),
    [rootRef, contentRef, orientation],
  );

  return React.useSyncExternalStore(onSubscribe, getSnapshot, getSnapshot);
}

export { resizeObserverStore };
