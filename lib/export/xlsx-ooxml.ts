/* eslint-disable no-secrets/no-secrets -- OOXML schema URIs and static spreadsheet markup, not credentials */

export const CONTENT_TYPES_XML = [
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
  '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
  '<Default Extension="xml" ContentType="application/xml"/>',
  '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
  '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>',
  '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>',
  "</Types>",
].join("");

export const ROOT_RELS_XML = [
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
  '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>',
  "</Relationships>",
].join("");

export const WORKBOOK_RELS_XML = [
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
  '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>',
  '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>',
  "</Relationships>",
].join("");

export const STYLES_XML = [
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
  '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
  '<fonts count="2">',
  '<font><sz val="11"/><color rgb="FF1F1612"/><name val="Arial"/></font>',
  '<font><b/><sz val="11"/><color rgb="FF2C1810"/><name val="Arial"/></font>',
  "</fonts>",
  '<fills count="3">',
  '<fill><patternFill patternType="none"/></fill>',
  '<fill><patternFill patternType="gray125"/></fill>',
  '<fill><patternFill patternType="solid"><fgColor rgb="FFF4ECE4"/></patternFill></fill>',
  "</fills>",
  '<borders count="2">',
  "<border><left/><right/><top/><bottom/><diagonal/></border>",
  '<border><left/><right/><top/><bottom style="thin"><color rgb="FFD6C7B8"/></bottom><diagonal/></border>',
  "</borders>",
  '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>',
  '<cellXfs count="3">',
  '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"><alignment vertical="center"/></xf>',
  '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>',
  '<xf numFmtId="3" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"><alignment vertical="center"/></xf>',
  "</cellXfs>",
  '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>',
  "</styleSheet>",
].join("");

export function buildWorkbookXml(escapedSheetName: string): string {
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
    `<sheets><sheet name="${escapedSheetName}" sheetId="1" r:id="rId1"/></sheets>`,
    "</workbook>",
  ].join("");
}

export function wrapWorksheetXml(parts: {
  viewAttrs: string;
  colsXml: string;
  rowsXml: string;
}): string {
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
    `<sheetViews><sheetView${parts.viewAttrs}/></sheetViews>`,
    '<sheetFormatPr defaultRowHeight="20"/>',
    `<cols>${parts.colsXml}</cols>`,
    `<sheetData>${parts.rowsXml}</sheetData>`,
    "</worksheet>",
  ].join("");
}
