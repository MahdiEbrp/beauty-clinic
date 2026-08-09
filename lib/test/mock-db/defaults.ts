/* eslint-disable security/detect-object-injection -- mock rows are indexed by dynamic schema column keys */
import { randomUUID } from "node:crypto";

import { Table } from "drizzle-orm";
import type { Column } from "drizzle-orm/column";

import {
  columnOf,
  columnKey,
  isColumn,
  sqlText,
  type Row,
} from "./sql";

export interface MockDbInternal {
  data: Record<string, Row[]>;
  log: Array<{ type: string; table: string; sql?: string; values?: Row }>;
  failInsert?: (table: string, values: Row) => unknown | null;
}

const tableSymbols = (Table as unknown as {
  Symbol: { Name: symbol; Columns: symbol };
}).Symbol;

function defaultFor(column: Column): unknown {
  const { hasDefault, default: def, dataType } = column;
  if (hasDefault) {
    if (typeof def === "object" && def !== null) {
      // SQL default (defaultNow / defaultRandom).
      if (dataType === "date") return new Date();
      if (sqlText(def).includes("uuid")) return randomUUID();
      return null;
    }
    return def;
  }
  switch (dataType) {
    case "boolean":
      return false;
    case "number":
      return 0;
    case "date":
      return null;
    case "json":
      return null;
    case "string":
      return "";
    default:
      return null;
  }
}

function asAny(value: unknown): Record<PropertyKey, unknown> {
  return value as Record<PropertyKey, unknown>;
}

export function applyDefaults(
  table: unknown,
  values: Record<string, unknown>,
): Row {
  const cols = (asAny(table)[tableSymbols.Columns] ?? {}) as Record<
    string,
    Column
  >;
  const row: Row = { ...values };
  for (const [key, col] of Object.entries(cols)) {
    if (row[key] === undefined) row[key] = defaultFor(col);
  }
  return row;
}

export function sortRows(rows: Row[], order: unknown[]): Row[] {
  if (order.length === 0) return rows;
  const sorted = [...rows];
  sorted.sort((a, b) => {
    for (const entry of order) {
      let key: string;
      let direction = 1;
      if (isColumn(entry)) {
        key = columnKey(entry);
      } else {
        const column = columnOf(entry);
        if (!column) continue;
        key = columnKey(column);
        if (sqlText(entry).trim().endsWith("desc")) direction = -1;
      }
      const av = a[key];
      const bv = b[key];
      if (av === bv) continue;
      if (av === undefined || av === null) return 1;
      if (bv === undefined || bv === null) return -1;
      return (av < bv ? -1 : 1) * direction;
    }
    return 0;
  });
  return sorted;
}

export { defaultFor };
