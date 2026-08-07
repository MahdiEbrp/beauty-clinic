"use client";

import { useCallback, useState } from "react";
import type { EntryMeta } from "./types";

export interface FilesSelectionState {
  selectedNames: string[];
  selectedEntries: EntryMeta[];
  anySelected: boolean;
  allSelected: boolean;
  isSelected: (name: string) => boolean;
  selectOnly: (name: string) => void;
  toggleSelect: (name: string) => void;
  rangeSelect: (name: string) => void;
  selectAll: () => void;
  toggleSelectAll: () => void;
  clearSelection: () => void;
}

/**
 * Explorer-style selection keyed by entry name within the current folder.
 * Mouse: plain click selects only, Ctrl/Cmd+click toggles, Shift+click extends
 * from the anchor. The hook is intentionally path-agnostic: navigation helpers
 * clear it when the folder or view changes.
 */
export function useFilesSelection(entries: EntryMeta[]): FilesSelectionState {
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [anchorName, setAnchorName] = useState<string | null>(null);

  const isSelected = useCallback(
    (name: string) => selectedNames.includes(name),
    [selectedNames],
  );

  const selectOnly = useCallback((name: string) => {
    setAnchorName(name);
    setSelectedNames([name]);
  }, []);

  const toggleSelect = useCallback((name: string) => {
    setAnchorName(name);
    setSelectedNames((current) =>
      current.includes(name)
        ? current.filter((value) => value !== name)
        : [...current, name],
    );
  }, []);

  const rangeSelect = useCallback(
    (name: string) => {
      if (selectedNames.length === 0) {
        setAnchorName(name);
        setSelectedNames([name]);
        return;
      }
      const targetIndex = entries.findIndex((entry) => entry.name === name);
      if (targetIndex === -1) return;
      const anchorIndex = entries.findIndex((entry) => entry.name === anchorName);
      const from = anchorIndex === -1 ? targetIndex : Math.min(anchorIndex, targetIndex);
      const to = anchorIndex === -1 ? targetIndex : Math.max(anchorIndex, targetIndex);
      // Keep the anchor stable so repeated shift-clicks extend from the first
      // selection (Explorer semantics) rather than from the last click.
      setSelectedNames(entries.slice(from, to + 1).map((entry) => entry.name));
    },
    [anchorName, entries, selectedNames],
  );

  const selectAll = useCallback(
    () => setSelectedNames(entries.map((entry) => entry.name)),
    [entries],
  );

  const toggleSelectAll = useCallback(() => {
    const all = entries.map((entry) => entry.name);
    setSelectedNames((current) =>
      current.length === entries.length && entries.length > 0 ? [] : all,
    );
  }, [entries]);

  const clearSelection = useCallback(() => {
    setSelectedNames([]);
    setAnchorName(null);
  }, []);

  const selectedEntries = entries.filter((entry) =>
    selectedNames.includes(entry.name),
  );
  const allSelected = entries.length > 0 && selectedEntries.length === entries.length;

  return {
    selectedNames,
    selectedEntries,
    anySelected: selectedEntries.length > 0,
    allSelected,
    isSelected,
    selectOnly,
    toggleSelect,
    rangeSelect,
    selectAll,
    toggleSelectAll,
    clearSelection,
  };
}