import { deflateRawSync } from "node:zlib";

import {
  CONTENT_TYPES_XML,
  ROOT_RELS_XML,
  STYLES_XML,
  WORKBOOK_RELS_XML,
  buildWorkbookXml,
  wrapWorksheetXml,
} from "./xlsx-ooxml";

export type XlsxColumn = {
  header: string;
  width?: number;
  type?: "string" | "number";
};

export type XlsxCell = string | number | null | undefined;

export type BuildXlsxOptions = {
  sheetName: string;
  columns: readonly XlsxColumn[];
  rows: readonly (readonly XlsxCell[])[];
  rtl?: boolean;
};

type ZipEntry = {
  name: string;
  data: Buffer;
};

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildZip(entries: readonly ZipEntry[]): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, "utf8");
    const raw = entry.data;
    const compressed = deflateRawSync(raw);
    const crc = crc32(raw);

    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed: 2.0
    local.writeUInt16LE(0x0800, 6); // UTF-8 filename flag
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    nameBuf.copy(local, 30);

    localParts.push(local, compressed);

    const central = Buffer.alloc(46 + nameBuf.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    nameBuf.copy(central, 46);

    centralParts.push(central);
    offset += local.length + compressed.length;
  }

  const centralDir = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDir, eocd]);
}

function stripInvalidXmlChars(value: string): string {
  let out = "";
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (
      code === 0x09 ||
      code === 0x0a ||
      code === 0x0d ||
      (code >= 0x20 && code <= 0xd7ff) ||
      (code >= 0xe000 && code <= 0xfffd)
    ) {
      out += value[i];
    }
  }
  return out;
}

function escapeXml(value: string): string {
  return stripInvalidXmlChars(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function sanitizeSheetName(name: string): string {
  const cleaned = stripInvalidXmlChars(name)
    .replace(/[[\]:*?/\\]/g, " ")
    .trim();
  return (cleaned || "Sheet1").slice(0, 31);
}

function colLetter(index: number): string {
  let n = index + 1;
  let result = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

function computeColWidths(
  columns: readonly XlsxColumn[],
  rows: readonly (readonly XlsxCell[])[],
): number[] {
  return columns.map((col, colIdx) => {
    if (typeof col.width === "number" && col.width > 0) return col.width;
    let maxLen = col.header.length;
    const sampleLimit = Math.min(rows.length, 200);
    for (let r = 0; r < sampleLimit; r += 1) {
      const cell = rows[r]?.[colIdx];
      if (cell !== null && cell !== undefined) {
        const len = String(cell).length;
        if (len > maxLen) maxLen = len;
      }
    }
    return Math.min(48, Math.max(12, maxLen + 4));
  });
}

function renderCell(
  ref: string,
  value: XlsxCell,
  styleIndex: number,
  forceType?: "string" | "number",
): string {
  if (value === null || value === undefined || value === "") {
    return `<c r="${ref}" s="${styleIndex}"/>`;
  }
  if (
    (forceType === "number" || (!forceType && typeof value === "number")) &&
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return `<c r="${ref}" s="${styleIndex}" t="n"><v>${value}</v></c>`;
  }
  const text = escapeXml(String(value));
  return `<c r="${ref}" s="${styleIndex}" t="inlineStr"><is><t xml:space="preserve">${text}</t></is></c>`;
}

function buildWorksheetXml(opts: BuildXlsxOptions): string {
  const widths = computeColWidths(opts.columns, opts.rows);
  const colsXml = widths
    .map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`)
    .join("");

  const viewAttrs = opts.rtl ? ' workbookViewId="0" rightToLeft="1"' : ' workbookViewId="0"';

  const headerCells = opts.columns
    .map((col, c) => renderCell(`${colLetter(c)}1`, col.header, 1, "string"))
    .join("");
  const rowsXml = [`<row r="1" ht="24" customHeight="1">${headerCells}</row>`];

  for (let r = 0; r < opts.rows.length; r += 1) {
    const rowNum = r + 2;
    const rowValues = opts.rows[r] ?? [];
    const cellsXml = opts.columns
      .map((col, c) => {
        const val = rowValues[c];
        const isNum =
          col.type === "number" || (col.type !== "string" && typeof val === "number");
        return renderCell(`${colLetter(c)}${rowNum}`, val, isNum ? 2 : 0, col.type);
      })
      .join("");
    rowsXml.push(`<row r="${rowNum}">${cellsXml}</row>`);
  }

  return wrapWorksheetXml({
    viewAttrs,
    colsXml,
    rowsXml: rowsXml.join(""),
  });
}

/** Builds a binary `.xlsx` (OOXML) workbook buffer without external dependencies. */
export function buildXlsxWorkbook(opts: BuildXlsxOptions): Buffer {
  const sheetName = escapeXml(sanitizeSheetName(opts.sheetName));
  const workbookXml = buildWorkbookXml(sheetName);
  const sheetXml = buildWorksheetXml(opts);

  return buildZip([
    { name: "[Content_Types].xml", data: Buffer.from(CONTENT_TYPES_XML, "utf8") },
    { name: "_rels/.rels", data: Buffer.from(ROOT_RELS_XML, "utf8") },
    { name: "xl/workbook.xml", data: Buffer.from(workbookXml, "utf8") },
    { name: "xl/_rels/workbook.xml.rels", data: Buffer.from(WORKBOOK_RELS_XML, "utf8") },
    { name: "xl/styles.xml", data: Buffer.from(STYLES_XML, "utf8") },
    { name: "xl/worksheets/sheet1.xml", data: Buffer.from(sheetXml, "utf8") },
  ]);
}
