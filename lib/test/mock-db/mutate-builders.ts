/* eslint-disable security/detect-object-injection -- mock rows are indexed by dynamic schema column keys */
import {
  columnKey,
  evalWhere,
  isColumn,
  sqlText,
  tableName,
  type Row,
} from "./sql";
import { applyDefaults, type MockDbInternal } from "./defaults";

export class InsertBuilder implements PromiseLike<Row[]> {
  private valuesData: Record<string, unknown>[] = [];
  private conflict?: {
    target?: unknown[];
    targetWhere?: unknown;
    set?: Record<string, unknown>;
  };

  constructor(
    private readonly db: MockDbInternal,
    private readonly table: unknown,
  ) {}

  values(values: Record<string, unknown> | Record<string, unknown>[]): this {
    this.valuesData = Array.isArray(values) ? values : [values];
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
      const inserted: Row[] = [];

      for (const single of this.valuesData) {
        this.db.log.push({
          type: "insert",
          table: name,
          values: { ...single },
        });

        // Real drizzle omits `undefined` values from inserts.
        const clean: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(single)) {
          if (v !== undefined) clean[k] = v;
        }

        const failure = this.db.failInsert?.(name, clean);
        if (failure) throw failure;

        const existing = this.findConflictRow(name, clean);
        if (existing && this.conflict) {
          const row = { ...existing };
          for (const [k, v] of Object.entries(this.conflict.set ?? {})) {
            row[k] = v;
          }
          inserted.push(row);
        } else {
          const row = applyDefaults(this.table, clean);
          (this.db.data[name] ??= []).push(row);
          inserted.push(row);
        }
      }
      return inserted;
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
        if (
          isColumn(column) &&
          row[columnKey(column)] !== values[columnKey(column)]
        ) {
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

export class UpdateBuilder implements PromiseLike<void> {
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

export class DeleteBuilder implements PromiseLike<void> {
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
      if (remaining.length > 0 || rows.length > 0) {
        this.db.data[name] = remaining;
      }
    };
    return run().then(onfulfilled, onrejected);
  }
}
