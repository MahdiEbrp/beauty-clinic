import { Table } from "drizzle-orm";
import type { Column } from "drizzle-orm/column";

export type Row = Record<string, unknown>;

export type Chunk =
  | { value: string[] } // StringChunk: SQL fragments
  | { value: string | number | boolean | Date | null } // single Param
  | unknown[] // raw param array (`inArray` values)
  | { queryChunks: Chunk[] } // nested SQL
  | Column;

const asAny = (value: unknown): Record<PropertyKey, unknown> =>
  value as Record<PropertyKey, unknown>;

const tableSymbols = (Table as unknown as {
  Symbol: { Name: symbol; Columns: symbol };
}).Symbol;

export { tableSymbols };

export function isSQL(c: unknown): c is { queryChunks: Chunk[] } {
  return (
    typeof c === "object" &&
    c !== null &&
    Array.isArray(asAny(c).queryChunks)
  );
}

function isStringChunk(c: unknown): c is { value: string[] } {
  return (
    typeof c === "object" &&
    c !== null &&
    "value" in c &&
    Array.isArray(asAny(c).value) &&
    (asAny(c).value as unknown[]).every((v: unknown) => typeof v === "string")
  );
}

function isParam(
  c: unknown,
): c is { value: string | number | boolean | Date | null } {
  return typeof c === "object" && c !== null && "value" in c;
}

function isRawArray(c: unknown): c is unknown[] {
  return Array.isArray(c);
}

export function isColumn(c: unknown): c is Column {
  return (
    typeof c === "object" &&
    c !== null &&
    typeof asAny(c).name === "string" &&
    asAny(c).table !== undefined &&
    !("value" in c) &&
    !("queryChunks" in c)
  );
}

export function tableName(table: unknown): string {
  return String(asAny(table)[tableSymbols.Name]);
}

export function columnKey(column: Column): string {
  const cols = asAny(column.table)[tableSymbols.Columns] as
    | Record<string, Column>
    | undefined;
  if (cols) {
    for (const [key, col] of Object.entries(cols)) {
      if (col === column) return key;
    }
  }
  return column.name;
}

/** Recursively joins the SQL fragments into a single, param-inlined string. */
export function sqlText(sql: unknown): string {
  const s = asAny(sql);
  if (!s || !Array.isArray(s.queryChunks)) return String(sql ?? "");
  return s.queryChunks
    .map((chunk: unknown) => {
      if (isSQL(chunk)) return sqlText(chunk);
      if (isStringChunk(chunk)) return chunk.value.join("");
      if (isParam(chunk)) return String(chunk.value);
      if (isRawArray(chunk)) return chunk.map((v) => String(v)).join(", ");
      if (isColumn(chunk)) return `"${tableName(chunk.table)}"."${chunk.name}"`;
      return String(chunk);
    })
    .join("");
}

function columnOf(sql: unknown): Column | undefined {
  const s = asAny(sql);
  if (!s || !Array.isArray(s.queryChunks)) return undefined;
  for (const chunk of s.queryChunks as unknown[]) {
    if (isColumn(chunk)) return chunk;
    if (isSQL(chunk)) {
      const nested = columnOf(chunk);
      if (nested) return nested;
    }
  }
  return undefined;
}

/**
 * Evaluates a drizzle `where` clause against a single row. Rows use the
 * camelCase schema keys. Understands `and`/`or`, `eq`, `isNull`, `ilike`,
 * `like`, `in` and column-to-column comparisons; anything else fails loudly.
 */
export function evalWhere(where: unknown, row: Row): boolean {
  if (where === undefined || where === null) return true;
  if (!isSQL(where)) {
    throw new Error(`mock-db: unsupported where clause: ${String(where)}`);
  }
  return evalSQL(where, row);
}

function evalSQL(sql: { queryChunks: Chunk[] }, row: Row): boolean {
  const chunks = sql.queryChunks;

  // Leaf comparison: a column is referenced directly in this SQL object.
  if (chunks.some(isColumn)) return evalLeaf(chunks, row);

  let result = false;
  let mode: "and" | "or" | null = null;
  let seen = false;

  for (const chunk of chunks) {
    if (isSQL(chunk)) {
      const value = evalSQL(chunk, row);
      if (!seen) {
        result = value;
        seen = true;
      } else if (mode === "or") {
        result = result || value;
      } else {
        result = result && value;
      }
    } else if (isStringChunk(chunk)) {
      const text = chunk.value.join("").trim();
      if (text === "and") mode = "and";
      else if (text === "or") mode = "or";
    }
  }
  return result;
}

function evalLeaf(chunks: Chunk[], row: Row): boolean {
  const column = chunks.find(isColumn);
  if (!column) throw new Error("mock-db: leaf without a column");
  const value = row[columnKey(column)];

  let opText = "";
  const params: unknown[] = [];
  for (const chunk of chunks) {
    if (isStringChunk(chunk)) opText += chunk.value.join("");
    else if (isParam(chunk)) params.push(chunk.value);
    else if (isRawArray(chunk)) {
      params.push(
        ...chunk.map((v) => (isParam(v) ? v.value : v)),
      );
    } else if (
      typeof chunk === "string" ||
      typeof chunk === "number" ||
      typeof chunk === "boolean"
    ) {
      params.push(chunk);
    } else if (isColumn(chunk) && chunk !== column) {
      params.push(row[columnKey(chunk)]);
    }
  }
  opText = opText.trim();

  if (opText.endsWith("is null")) return value === null || value === undefined;
  if (opText.endsWith("is not null")) {
    return value !== null && value !== undefined;
  }
  if (opText.includes("ilike")) {
    const needle = String(params[0] ?? "").replace(/%/g, "").toLowerCase();
    return String(value ?? "").toLowerCase().includes(needle);
  }
  if (opText.includes("like")) {
    const needle = String(params[0] ?? "").replace(/%/g, "");
    return String(value ?? "").includes(needle);
  }
  const normalizedOp = opText.replace(/\s+/g, " ");
  if (/\bin\b/.test(normalizedOp)) return params.includes(value);
  if (normalizedOp.includes("<>")) return value !== params[0];
  if (normalizedOp.includes("!=")) return value !== params[0];
  if (normalizedOp.includes("=")) return value === params[0];
  if (opText.includes(" < ")) return (value as number) < (params[0] as number);
  if (opText.includes(" > ")) return (value as number) > (params[0] as number);
  throw new Error(`mock-db: unsupported predicate: "${opText}"`);
}

export { columnOf };

/**
 * Evaluates a drizzle `set` value against the current row. Plain values pass
 * through unchanged; SQL templates shaped like `"col" + 3` (column + number)
 * are evaluated so atomic counters such as `attempts + 1` behave like Postgres
 * in tests. Anything more complex is passed through verbatim.
 */
export function evalAssign(value: unknown, row: Row): unknown {
  if (!isSQL(value)) return value;
  const column = columnOf(value);
  if (!column) return value;
  const prev = row[columnKey(column)] ?? 0;

  let opText = "";
  for (const chunk of asAny(value).queryChunks as unknown[]) {
    if (isStringChunk(chunk)) opText += chunk.value.join("");
  }
  // Matches shapes like `"col" + 3`, `"col" - 1` (column + number).
  const match = opText
    .replace(/["a-z_]+/gi, " ")
    .trim()
    .match(/^([+-])\s*(\d+(?:\.\d+)?)$/);
  if (typeof prev === "number" && match) {
    const amount = Number(match[2]);
    return match[1] === "-" ? prev - amount : prev + amount;
  }
  return value;
}
