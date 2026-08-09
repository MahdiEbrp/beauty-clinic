const MIME_BY_EXT: Record<string, string> = {
  txt: "text/plain",
  md: "text/markdown",
  markdown: "text/markdown",
  json: "application/json",
  js: "text/javascript",
  mjs: "text/javascript",
  cjs: "text/javascript",
  ts: "text/typescript",
  tsx: "text/typescript",
  jsx: "text/javascript",
  css: "text/css",
  html: "text/html",
  htm: "text/html",
  xml: "application/xml",
  csv: "text/csv",
  yaml: "text/yaml",
  yml: "text/yaml",
  toml: "application/toml",
  ini: "text/plain",
  log: "text/plain",
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  avif: "image/avif",
  ico: "image/x-icon",
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  zip: "application/zip",
  gz: "application/gzip",
  tar: "application/x-tar",
  "7z": "application/x-7z-compressed",
  rar: "application/vnd.rar",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  sql: "application/sql",
  sh: "text/x-shellscript",
};

/** Best-effort MIME type from a file name; octet-stream as a safe fallback. */
export function mimeFromName(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot <= 0 || dot === name.length - 1) return "application/octet-stream";
  const ext = name.slice(dot + 1).toLowerCase();
  // eslint-disable-next-line security/detect-object-injection -- fixed extension lookup map with safe fallback
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

/** True when the content type is text-like and safe to open in the editor. */
export function isTextMime(mime: string): boolean {
  return (
    mime.startsWith("text/") ||
    mime === "application/json" ||
    mime === "application/xml" ||
    mime === "application/sql" ||
    mime === "application/javascript" ||
    mime === "application/toml" ||
    mime === "application/yaml"
  );
}

/** True when the file can be rendered inline (image / pdf). */
export function isPreviewable(mime: string): boolean {
  return mime.startsWith("image/") || mime === "application/pdf";
}
