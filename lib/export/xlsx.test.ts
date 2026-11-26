import { inflateRawSync } from "node:zlib";
import { describe, expect, it } from "vitest";

import { buildXlsxWorkbook } from "./xlsx";

function readZipEntries(buffer: Buffer): Record<string, string> {
  // Locate End of Central Directory signature (0x06054b50).
  let eocdOffset = -1;
  for (let i = buffer.length - 22; i >= 0; i -= 1) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  expect(eocdOffset).toBeGreaterThan(-1);

  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  const centralOffset = buffer.readUInt32LE(eocdOffset + 16);
  const files: Record<string, string> = {};

  let cursor = centralOffset;
  for (let i = 0; i < entryCount; i += 1) {
    expect(buffer.readUInt32LE(cursor)).toBe(0x02014b50);
    const nameLen = buffer.readUInt16LE(cursor + 28);
    const extraLen = buffer.readUInt16LE(cursor + 30);
    const commentLen = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const name = buffer.subarray(cursor + 46, cursor + 46 + nameLen).toString("utf8");

    expect(buffer.readUInt32LE(localOffset)).toBe(0x04034b50);
    const localNameLen = buffer.readUInt16LE(localOffset + 26);
    const localExtraLen = buffer.readUInt16LE(localOffset + 28);
    const compressedSize = buffer.readUInt32LE(localOffset + 18);
    const dataStart = localOffset + 30 + localNameLen + localExtraLen;
    const raw = inflateRawSync(buffer.subarray(dataStart, dataStart + compressedSize));
    files[name] = raw.toString("utf8");

    cursor += 46 + nameLen + extraLen + commentLen;
  }

  return files;
}

describe("buildXlsxWorkbook", () => {
  it("produces a valid OOXML archive with all required parts", () => {
    const buffer = buildXlsxWorkbook({
      sheetName: "رزروها",
      rtl: true,
      columns: [
        { header: "کد سفارش", type: "string" },
        { header: "نام", type: "string" },
        { header: "تلفن", type: "string" },
        { header: "مبلغ", type: "number" },
      ],
      rows: [["NF-10001", "سارا محمدی", "09123456789", 100000]],
    });

    const entries = readZipEntries(buffer);
    expect(Object.keys(entries).sort()).toEqual([
      "[Content_Types].xml",
      "_rels/.rels",
      "xl/_rels/workbook.xml.rels",
      "xl/styles.xml",
      "xl/workbook.xml",
      "xl/worksheets/sheet1.xml",
    ]);

    expect(entries["xl/workbook.xml"]).toContain('name="رزروها"');
    const sheet = entries["xl/worksheets/sheet1.xml"];
    expect(sheet).toContain('rightToLeft="1"');
    expect(sheet).toContain('<c r="C2" s="0" t="inlineStr">');
    expect(sheet).toContain(">09123456789</t>");
    expect(sheet).toContain('<c r="D2" s="2" t="n"><v>100000</v></c>');
  });

  it("omits rightToLeft for LTR workbooks and keeps leading plus/formula chars safe", () => {
    const buffer = buildXlsxWorkbook({
      sheetName: "Reservations: [2026]/Q4*?",
      rtl: false,
      columns: [
        { header: "Phone", type: "string" },
        { header: "Notes", type: "string" },
      ],
      rows: [
        ["+989120000001", "=SUM(A1:A2) & <test> \"quoted\" 'apos'"],
        ["09120000002", "bad\u0000control\u000bchars"],
      ],
    });

    const entries = readZipEntries(buffer);
    expect(entries["xl/workbook.xml"]).toContain('name="Reservations   2026  Q4"');
    expect(entries["xl/workbook.xml"]).not.toContain('name="Reservations: [2026]/Q4*?"');

    const sheet = entries["xl/worksheets/sheet1.xml"];
    expect(sheet).not.toContain('rightToLeft="1"');
    expect(sheet).toContain(
      "=SUM(A1:A2) &amp; &lt;test&gt; &quot;quoted&quot; &apos;apos&apos;",
    );
    expect(sheet).toContain("badcontrolchars");
    expect(sheet).not.toContain("\u0000");
  });

  it("supports empty datasets and columns beyond Z (AA, AB)", () => {
    const columns = Array.from({ length: 28 }, (_, i) => ({
      header: `Col ${i + 1}`,
      type: "string" as const,
    }));

    const buffer = buildXlsxWorkbook({
      sheetName: "A".repeat(40),
      columns,
      rows: [columns.map((_, i) => `V${i + 1}`)],
    });

    const entries = readZipEntries(buffer);
    expect(entries["xl/workbook.xml"]).toContain(`name="${"A".repeat(31)}"`);
    expect(entries["xl/worksheets/sheet1.xml"]).toContain('r="AB1"');
    expect(entries["xl/worksheets/sheet1.xml"]).toContain('r="AB2"');
  });
});
