import { randomUUID } from "node:crypto";

import { Table } from "drizzle-orm";
import type { Column } from "drizzle-orm/column";

/**
 * Shared in-memory fake of the drizzle `db` object (see `@/src/db`).
 *
 * Implements the chainable API surface used by the service layer
 * (`select/from/where/orderBy/limit/offset`, `innerJoin`,
 * `insert/values/onConflictDoUpdate/returning`, `update/set/where`,
 * `delete/where`, `query.<table>.findFirst` and `transaction`) against plain
 * in-memory row arrays, so service tests run without Postgres while still
 * exercising real filtering, ordering, pagination, upserts and deletes.
 *
 * Usage (see `lib/users/service.test.ts`):
 *
 *   vi.mock("@/src/db", async () => {
 *     const { createMockDb } = await import("@/lib/test/mock-db");
 *     return { db: createMockDb() };
 *   });
 *   import { db } from "@/src/db";
 *   const mockDb = db as unknown as MockDb;
 *
 * Rows are keyed by the camelCase schema keys (the shape of `$inferSelect`),
 * seeded via `mockDb.seed("users", [...])`.
 */

export type Row = Record<string, unknown>;

type Chunk =
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

function isSQL(c: unknown): c is { queryChunks: Chunk[] } {
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

function isColumn(c: unknown): c is Column {
  return (
    typeof c === "object" &&
    c !== null &&
    typeof asAny(c).name === "string" &&
    asAny(c).table !== undefined &&
    !("value" in c) &&
    !("queryChunks" in c)
  );
}

function tableName(table: unknown): string {
  return String(asAny(table)[tableSymbols.Name]);
}

function columnKey(column: Column): string {
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
      params.push(...chunk.map((value) => (isParam(value) ? value.value : value)));
    } else if (
      typeof chunk === "string" ||
      typeof chunk === "number" ||
      typeof chunk === "boolean"
    ) {
      params.push(chunk);
    }
    else if (isColumn(chunk) && chunk !== column) {
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
  if (normalizedOp.includes("!=")) return value !== params[0];
  if (normalizedOp.includes("=")) return value === params[0];
  if (opText.includes(" < ")) return (value as number) < (params[0] as number);
  if (opText.includes(" > ")) return (value as number) > (params[0] as number);
  throw new Error(`mock-db: unsupported predicate: "${opText}"`);
}

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

function applyDefaults(table: unknown, values: Record<string, unknown>): Row {
  const cols = asAny(table)[tableSymbols.Columns] as
    | Record<string, Column>
    | undefined;
  const row: Row = { ...values };
  if (cols) {
    for (const [key, col] of Object.entries(cols)) {
      if (row[key] === undefined) row[key] = defaultFor(col);
    }
  }
  return row;
}

function sortRows(rows: Row[], order: unknown[]): Row[] {
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

export interface MockDb {
  /** Seeded rows per table name (camelCase schema keys). */
  readonly data: Record<string, Row[]>;
  /** Structured log of every executed query, in order. */
  readonly log: Array<{
    type: string;
    table: string;
    sql?: string;
    values?: Row;
  }>;
  /**
   * Optional hook that runs before an insert. When it returns a truthy value
   * that value is thrown, which lets tests simulate unique-violation errors
   * (e.g. `{ code: "23505" }`).
   */
  failInsert?: (table: string, values: Row) => unknown | null;
  /** Clears all data and the query log. */
  reset(): void;
  /** Seeds rows into a table. */
  seed(table: string, rows: Row[]): void;
  select(shape?: Record<string, unknown>): {
    from(table: unknown): SelectBuilder;
  };
  insert(table: unknown): InsertBuilder;
  update(table: unknown): UpdateBuilder;
  delete(table: unknown): DeleteBuilder;
  transaction<T>(fn: (tx: MockDb) => Promise<T>): Promise<T>;
  query: {
    users: { findFirst(opts: unknown): PromiseLike<Row | undefined> };
    roles: { findFirst(opts: unknown): PromiseLike<Row | undefined> };
  };
}

type MockDbInternal = {
  data: Record<string, Row[]>;
  log: Array<{ type: string; table: string; sql?: string; values?: Row }>;
  failInsert?: (table: string, values: Row) => unknown | null;
};

export class SelectBuilder implements PromiseLike<Row[]> {
  private table?: unknown;
  private whereClause?: unknown;
  private order: unknown[] = [];
  private limitValue?: number;
  private offsetValue?: number;
  private joins: Array<{ table: unknown; on: unknown }> = [];

  constructor(
    private readonly db: MockDbInternal,
    private readonly shape?: Record<string, unknown>,
  ) {}

  from(table: unknown): this {
    this.table = table;
    return this;
  }

  innerJoin(table: unknown, on: unknown): this {
    this.joins.push({ table, on });
    return this;
  }

  where(where: unknown): this {
    this.whereClause = where;
    return this;
  }

  orderBy(...order: unknown[]): this {
    this.order.push(...order);
    return this;
  }

  limit(limit: number): this {
    this.limitValue = limit;
    return this;
  }

  offset(offset: number): this {
    this.offsetValue = offset;
    return this;
  }

  then<TResult1 = Row[], TResult2 = never>(
    onfulfilled?: ((value: Row[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.run().then(onfulfilled, onrejected);
  }

  private async run(): Promise<Row[]> {
    if (!this.table) throw new Error("mock-db: select() requires .from(table)");
    const name = tableName(this.table);

    this.db.log.push({
      type: "select",
      table: name,
      sql: this.whereClause ? sqlText(this.whereClause) : undefined,
    });

    const base = [...(this.db.data[name] ?? [])];
    const filtered = this.whereClause
      ? base.filter((r) => evalWhere(this.whereClause, r))
      : base;
    const allCount = filtered.length;

    // Each output row carries the source row per joined table so select shapes
    // can pull the right column even when joined tables share column names.
    let results: Array<{ row: Row; sources: Map<string, Row> }> = filtered.map(
      (row) => ({ row, sources: new Map([[name, row]]) }),
    );

    for (const join of this.joins) {
      const joinName = tableName(join.table);
      const joined: typeof results = [];
      for (const entry of results) {
        for (const other of this.db.data[joinName] ?? []) {
          if (evalWhere(join.on, { ...entry.row, ...other })) {
            const sources = new Map(entry.sources);
            sources.set(joinName, other);
            joined.push({ row: { ...entry.row, ...other }, sources });
          }
        }
      }
      results = joined;
    }

    if (this.order.length > 0) {
      const sortedRows = sortRows(results.map((entry) => entry.row), this.order);
      results.sort((a, b) => sortedRows.indexOf(a.row) - sortedRows.indexOf(b.row));
    }
    if (this.offsetValue !== undefined) results = results.slice(this.offsetValue);
    if (this.limitValue !== undefined) results = results.slice(0, this.limitValue);

    const shape = this.shape;
    if (shape) {
      return results.map((entry) => {
        const { row, sources } = entry;
        const out: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(shape)) {
          if (isColumn(value)) {
            const source = sources.get(tableName(value.table)) ?? row;
            out[key] = source[columnKey(value)];
          } else if (isSQL(value)) {
            // `{ value: count() }` / `{ count: sql`count(*)` }` selects.
            out[key] = allCount;
          } else {
            out[key] = value;
          }
        }
        return out;
      });
    }
    return results.map((entry) => entry.row);
  }
}

class FindFirstBuilder implements PromiseLike<Row | undefined> {
  constructor(
    private readonly db: MockDbInternal,
    private readonly tableName: string,
    private readonly opts: {
      where?: unknown;
      columns?: Record<string, boolean>;
    } = {},
  ) {}

  then<TResult1 = Row | undefined, TResult2 = never>(
    onfulfilled?: ((value: Row | undefined) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    const run = async (): Promise<Row | undefined> => {
      const { where, columns } = this.opts;
      this.db.log.push({
        type: "findFirst",
        table: this.tableName,
        sql: where ? sqlText(where) : undefined,
      });
      const rows = this.db.data[this.tableName] ?? [];
      const found = where ? rows.find((r) => evalWhere(where, r)) : rows[0];
      if (!found) return undefined;
      if (columns) {
        const out: Row = {};
        for (const [key, include] of Object.entries(columns)) {
          if (include) out[key] = found[key];
        }
        return out;
      }
      return { ...found };
    };
    return run().then(onfulfilled, onrejected);
  }
}

class InsertBuilder implements PromiseLike<Row[]> {
  private valuesData: Record<string, unknown> = {};
  private conflict?: {
    target?: unknown[];
    targetWhere?: unknown;
    set?: Record<string, unknown>;
  };

  constructor(
    private readonly db: MockDbInternal,
    private readonly table: unknown,
  ) {}

  values(values: Record<string, unknown>): this {
    this.valuesData = values;
    return this;
  }

  onConflictDoUpdate(conflict: {
    target?: unknown[];
    targetWhere?: unknown;
    set?: Record<string, unknown>;
  }): this {
    this.conflict = conflict;
    return this;
  }

  returning(): PromiseLike<Row[]> {
    return this;
  }

  then<TResult1 = Row[], TResult2 = never>(
    onfulfilled?: ((value: Row[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    const run = async (): Promise<Row[]> => {
      const name = tableName(this.table);
      this.db.log.push({ type: "insert", table: name, values: { ...this.valuesData } });

      // Real drizzle omits `undefined` values from inserts.
      const clean: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(this.valuesData)) {
        if (v !== undefined) clean[k] = v;
      }

      const failure = this.db.failInsert?.(name, clean);
      if (failure) throw failure;

      const existing = this.findConflictRow(name, clean);
      let row: Row;
      if (existing && this.conflict) {
        row = { ...existing };
        for (const [k, v] of Object.entries(this.conflict.set ?? {})) {
          row[k] = v;
        }
      } else {
        row = applyDefaults(this.table, clean);
        (this.db.data[name] ??= []).push(row);
      }
      return [row];
    };
    return run().then(onfulfilled, onrejected);
  }

  private findConflictRow(
    table: string,
    values: Record<string, unknown>,
  ): Row | undefined {
    const conflict = this.conflict;
    if (!conflict) return undefined;
    const target = (conflict.target ?? []) as unknown[];
    const rows = this.db.data[table] ?? [];
    return rows.find((row) => {
      for (const column of target) {
        if (isColumn(column) && row[columnKey(column)] !== values[columnKey(column)]) {
          return false;
        }
      }
      if (conflict.targetWhere && !evalWhere(conflict.targetWhere, row)) {
        return false;
      }
      return true;
    });
  }
}

class UpdateBuilder implements PromiseLike<void> {
  private setValues?: Record<string, unknown>;
  private whereClause?: unknown;

  constructor(
    private readonly db: MockDbInternal,
    private readonly table: unknown,
  ) {}

  set(values: Record<string, unknown>): this {
    this.setValues = values;
    return this;
  }

  where(where: unknown): this {
    this.whereClause = where;
    return this;
  }

  then<TResult1 = void, TResult2 = never>(
    onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    const run = async (): Promise<void> => {
      const name = tableName(this.table);
      this.db.log.push({
        type: "update",
        table: name,
        sql: this.whereClause ? sqlText(this.whereClause) : undefined,
        values: this.setValues,
      });
      const rows = this.db.data[name] ?? [];
      for (const row of rows) {
        if (evalWhere(this.whereClause, row)) Object.assign(row, this.setValues);
      }
    };
    return run().then(onfulfilled, onrejected);
  }
}

class DeleteBuilder implements PromiseLike<void> {
  private whereClause?: unknown;

  constructor(
    private readonly db: MockDbInternal,
    private readonly table: unknown,
  ) {}

  where(where: unknown): this {
    this.whereClause = where;
    return this;
  }

  then<TResult1 = void, TResult2 = never>(
    onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    const run = async (): Promise<void> => {
      const name = tableName(this.table);
      this.db.log.push({
        type: "delete",
        table: name,
        sql: this.whereClause ? sqlText(this.whereClause) : undefined,
      });
      const rows = this.db.data[name] ?? [];
      const remaining = rows.filter((r) => !evalWhere(this.whereClause, r));
      if (remaining.length > 0 || rows.length > 0) this.db.data[name] = remaining;
    };
    return run().then(onfulfilled, onrejected);
  }
}

export function createMockDb(): MockDb {
  const state: MockDbInternal = {
    data: {},
    log: [],
  };

  const db: MockDb = {
    get data() {
      return state.data;
    },
    get log() {
      return state.log;
    },
    set failInsert(fn: ((table: string, values: Row) => unknown | null) | undefined) {
      state.failInsert = fn;
    },
    get failInsert() {
      return state.failInsert;
    },
    reset() {
      state.data = {};
      state.log = [];
      state.failInsert = undefined;
    },
    seed(table: string, rows: Row[]) {
      state.data[table] = [...(state.data[table] ?? []), ...rows];
    },
    select(shape?: Record<string, unknown>) {
      return { from: (table: unknown) => new SelectBuilder(state, shape).from(table) };
    },
    insert(table: unknown) {
      return new InsertBuilder(state, table);
    },
    update(table: unknown) {
      return new UpdateBuilder(state, table);
    },
    delete(table: unknown) {
      return new DeleteBuilder(state, table);
    },
    async transaction<T>(fn: (tx: MockDb) => Promise<T>): Promise<T> {
      state.log.push({ type: "transaction", table: "" });
      return fn(db);
    },
    query: {
      users: {
        findFirst: (opts: unknown) =>
          new FindFirstBuilder(state, "users", opts as {
            where?: unknown;
            columns?: Record<string, boolean>;
          }),
      },
      roles: {
        findFirst: (opts: unknown) =>
          new FindFirstBuilder(state, "roles", opts as {
            where?: unknown;
            columns?: Record<string, boolean>;
          }),
      },
    },
  };

  return db;
}
