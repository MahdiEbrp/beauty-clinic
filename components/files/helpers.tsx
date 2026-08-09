import { createElement } from "react";
import {
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Folder,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function joinRel(parent: string, name: string): string {
  return parent === "" ? name : `${parent}/${name}`;
}

export function splitPath(rel: string): { parent: string; name: string } {
  if (rel === "") return { parent: "", name: "" };
  const index = rel.lastIndexOf("/");
  if (index === -1) return { parent: "", name: rel };
  return { parent: rel.slice(0, index), name: rel.slice(index + 1) };
}

export function extOf(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot <= 0 || dot === name.length - 1) return "";
  return name.slice(dot + 1).toLowerCase();
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  // eslint-disable-next-line security/detect-object-injection -- array indexing by a bounded exponent
  return `${value.toFixed(exponent === 0 ? 0 : value >= 100 ? 0 : 1)} ${units[exponent]}`;
}

const TEXT_EXTS = new Set([
  "txt",
  "md",
  "markdown",
  "json",
  "js",
  "mjs",
  "cjs",
  "ts",
  "tsx",
  "jsx",
  "css",
  "html",
  "htm",
  "xml",
  "csv",
  "yaml",
  "yml",
  "toml",
  "ini",
  "log",
  "sql",
  "sh",
]);

const IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "avif", "ico"]);
const VIDEO_EXTS = new Set(["mp4", "webm", "mov"]);
const AUDIO_EXTS = new Set(["mp3", "wav", "ogg", "m4a"]);
const ARCHIVE_EXTS = new Set(["zip", "gz", "tar", "7z", "rar"]);
const SPREADSHEET_EXTS = new Set(["xls", "xlsx", "csv"]);

export function iconFor(entry: { isDir: boolean; name: string }): LucideIcon {
  if (entry.isDir) return Folder;
  const ext = extOf(entry.name);
  if (IMAGE_EXTS.has(ext)) return FileImage;
  if (VIDEO_EXTS.has(ext)) return FileVideo;
  if (AUDIO_EXTS.has(ext)) return FileAudio;
  if (ARCHIVE_EXTS.has(ext)) return FileArchive;
  if (SPREADSHEET_EXTS.has(ext)) return FileSpreadsheet;
  if (TEXT_EXTS.has(ext) || ext === "pdf") return FileText;
  return FileCode;
}

/**
 * Renders the entry icon to an element without creating a component during
 * render. Uses createElement because lucide-react icons are React 19
 * forwardRef objects, which cannot be invoked as plain functions.
 */
export function renderEntryIcon(
  entry: { isDir: boolean; name: string },
  className: string,
  strokeWidth = 2,
): React.ReactNode {
  return createElement(iconFor(entry), {
    className,
    "aria-hidden": true,
    strokeWidth,
  });
}

export function isEditable(entry: { isDir: boolean; name: string }): boolean {
  return !entry.isDir && TEXT_EXTS.has(extOf(entry.name));
}

export function isPreviewable(entry: { isDir: boolean; name: string }): boolean {
  if (entry.isDir) return false;
  const ext = extOf(entry.name);
  return IMAGE_EXTS.has(ext) || ext === "pdf";
}

export function entryColor(entry: { isDir: boolean; name: string }): string {
  if (entry.isDir) return "text-accent";
  const ext = extOf(entry.name);
  if (IMAGE_EXTS.has(ext)) return "text-copper-strong";
  if (VIDEO_EXTS.has(ext) || AUDIO_EXTS.has(ext)) return "text-success";
  if (ARCHIVE_EXTS.has(ext)) return "text-warning";
  if (SPREADSHEET_EXTS.has(ext)) return "text-copper";
  return "text-content-secondary";
}
