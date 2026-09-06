import {
  columnKey,
  evalAssign,
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
    where?: unknown;
    set?: Record<string, unknown>;
  };
  private conflictNothing = false;

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
    where?: unknown;
    set?: Record<string, unknown>;
  }): this {
    this.conflict = conflict;
    return this;
  }

  /** Skips rows that collide with the conflict target (unique index). */
  onConflictDoNothing(conflict?: {
    target?: unknown[];
    targetWhere?: unknown;
    where?: unknown;
  }): this {
    this.conflict = conflict;
    this.conflictNothing = true;
    return this;
  }

  returning(): PromiseLike<Row[]> {
    return this;
  }

  then<TResult1 = Row[], TResult2 = never>(
    onfulfilled?: ((value: Row[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    const run = (): Promise<Row[]> => {
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
          if (this.conflictNothing) continue;
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
      return Promise.resolve(inserted);
    };
    return run().then(onfulfilled, onrejected);
  }

  private findConflictRow(
    table: string,
    values: Record<string, unknown>,
  ): Row | undefined {
    const conflict = this.conflict;
    if (!conflict) return undefined;
    // Drizzle accepts a single column or an array as the conflict target.
    const target = (
      Array.isArray(conflict.target) ? conflict.target : [conflict.target]
    ).filter(Boolean);
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
      const predicate = conflict.where ?? conflict.targetWhere;
      if (predicate && !evalWhere(predicate, row)) {
        return false;
      }
      return true;
    });
  }
}

export class UpdateBuilder implements PromiseLike<void> {
  private setValues?: Record<string, unknown>;
  private whereClause?: unknown;
  private withReturning = false;

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

  returning(): this {
    this.withReturning = true;
    return this;
  }

  then<TResult1 = void, TResult2 = never>(
    onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    const run = (): Row[] => {
      const name = tableName(this.table);
      this.db.log.push({
        type: "update",
        table: name,
        sql: this.whereClause ? sqlText(this.whereClause) : undefined,
        values: this.setValues,
      });
      const rows = this.db.data[name] ?? [];
      const updated: Row[] = [];
      for (const row of rows) {
        if (evalWhere(this.whereClause, row)) {
          const applied: Row = {};
          for (const [k, v] of Object.entries(this.setValues ?? {})) {
            applied[k] = evalAssign(v, row);
          }
          Object.assign(row, applied);
          updated.push({ ...row });
        }
      }
      return updated;
    };
    return Promise.resolve()
      .then(run)
      .then((rows) => (this.withReturning ? rows : undefined) as unknown as void)
      .then(onfulfilled, onrejected);
  }
}

export class DeleteBuilder implements PromiseLike<void> {
  private whereClause?: unknown;
  private withReturning = false;

  constructor(
    private readonly db: MockDbInternal,
    private readonly table: unknown,
  ) {}

  where(where: unknown): this {
    this.whereClause = where;
    return this;
  }

  returning(): this {
    this.withReturning = true;
    return this;
  }

  then<TResult1 = void, TResult2 = never>(
    onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    const run = (): Row[] => {
      const name = tableName(this.table);
      this.db.log.push({
        type: "delete",
        table: name,
        sql: this.whereClause ? sqlText(this.whereClause) : undefined,
      });
      const rows = this.db.data[name] ?? [];
      const deleted = rows
        .filter((r) => (this.whereClause ? evalWhere(this.whereClause, r) : true))
        .map((r) => ({ ...r }));
      const remaining = rows.filter((r) =>
        this.whereClause ? !evalWhere(this.whereClause, r) : false,
      );
      if (remaining.length > 0 || rows.length > 0) {
        this.db.data[name] = remaining;
      }
      return deleted;
    };
    return Promise.resolve()
      .then(run)
      .then((rows) => (this.withReturning ? rows : undefined) as unknown as void)
      .then(onfulfilled, onrejected);
  }
}
