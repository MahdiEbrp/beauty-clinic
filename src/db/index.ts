import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { env } from "@/lib/env";

const globalForDb = globalThis as unknown as { db?: ReturnType<typeof createDb> };

function createDb() {
  const client = postgres(env.DATABASE_URL, {
    ssl: "require",
    // A single connection (max: 1) deadlocks whenever one request issues
    // concurrent queries (e.g. a page awaiting listServices + getCatalogSummary
    // via Promise.all). Keep a small pool so concurrent queries can proceed.
    max: 5,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return drizzle(client, { schema });
}

export const db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== "production") globalForDb.db = db;
