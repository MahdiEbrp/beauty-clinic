import type { MockDbInternal } from "./defaults";
import { FindFirstBuilder } from "./find-first-builder";
import {
  DeleteBuilder,
  InsertBuilder,
  UpdateBuilder,
} from "./mutate-builders";
import { SelectBuilder } from "./select-builder";
import type { Row } from "./sql";

export type { Row, Chunk } from "./sql";
export { sqlText, evalWhere } from "./sql";

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
    serviceGroups: { findFirst(opts: unknown): PromiseLike<Row | undefined> };
    serviceCategories: { findFirst(opts: unknown): PromiseLike<Row | undefined> };
    services: { findFirst(opts: unknown): PromiseLike<Row | undefined> };
  };
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
    set failInsert(
      fn: ((table: string, values: Row) => unknown | null) | undefined,
    ) {
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
      return {
        from: (table: unknown) => new SelectBuilder(state, shape).from(table),
      };
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
      serviceGroups: {
        findFirst: (opts: unknown) =>
          new FindFirstBuilder(state, "service_groups", opts as {
            where?: unknown;
            columns?: Record<string, boolean>;
          }),
      },
      serviceCategories: {
        findFirst: (opts: unknown) =>
          new FindFirstBuilder(state, "service_categories", opts as {
            where?: unknown;
            columns?: Record<string, boolean>;
          }),
      },
      services: {
        findFirst: (opts: unknown) =>
          new FindFirstBuilder(state, "services", opts as {
            where?: unknown;
            columns?: Record<string, boolean>;
          }),
      },
    },
  };

  return db;
}
