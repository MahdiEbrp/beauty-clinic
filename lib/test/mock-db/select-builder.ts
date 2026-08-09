/* eslint-disable security/detect-object-injection -- mock rows are indexed by dynamic schema column keys */
import {
  columnKey,
  evalWhere,
  isColumn,
  isSQL,
  sqlText,
  tableName,
  type Row,
} from "./sql";
import { sortRows, type MockDbInternal } from "./defaults";

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
      results.sort(
        (a, b) => sortedRows.indexOf(a.row) - sortedRows.indexOf(b.row),
      );
    }
    if (this.offsetValue !== undefined)
      results = results.slice(this.offsetValue);
    if (this.limitValue !== undefined)
      results = results.slice(0, this.limitValue);

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
