import { evalWhere, sqlText, type Row } from "./sql";
import type { MockDbInternal } from "./defaults";

export class FindFirstBuilder implements PromiseLike<Row | undefined> {
  constructor(
    private readonly db: MockDbInternal,
    private readonly tableName: string,
    private readonly opts: {
      where?: unknown;
      columns?: Record<string, boolean>;
    } = {},
  ) {}

  then<TResult1 = Row | undefined, TResult2 = never>(
    onfulfilled?:
      | ((value: Row | undefined) => TResult1 | PromiseLike<TResult1>)
      | null,
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
