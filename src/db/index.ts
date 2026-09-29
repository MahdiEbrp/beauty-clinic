import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import dns from "node:dns";
import * as schema from "./schema";
import { env } from "@/lib/env";

/**
 * Supabase's pooler host is dual-stack; Node resolves AAAA first and the IPv6
 * route to `*.pooler.supabase.com` often hangs until `connect_timeout` fires
 * (surfacing as `CONNECT_TIMEOUT` and multi-second page loads). Prefer IPv4.
 */
dns.setDefaultResultOrder("ipv4first");

const globalForDb = globalThis as unknown as { db?: ReturnType<typeof createDb> };

/**
 * Honor the connection URL's `sslmode` so hosts without TLS (e.g. a plain
 * Postgres box) can be used via `?sslmode=disable`. Defaults to `require` to
 * match the production/pooler URLs in `.env.example`.
 */
function resolveSslMode(url: string): boolean | "require" | "allow" | "prefer" | "verify-full" {
  const mode = new URL(url).searchParams.get("sslmode") ?? "require";
  if (mode === "disable" || mode === "false") return false;
  if (mode === "allow" || mode === "prefer" || mode === "require" || mode === "verify-full") {
    return mode;
  }
  return "require";
}

function createDb() {
  const client = postgres(env.DATABASE_URL, {
    ssl: resolveSslMode(env.DATABASE_URL),
    // A single connection (max: 1) deadlocks whenever one request issues
    // concurrent queries (e.g. a page awaiting listServices + getCatalogSummary
    // via Promise.all). Keep a small pool so concurrent queries can proceed.
    max: 5,
    prepare: false,
    // The Supabase pooler closes idle client sockets (surfacing as
    // CONNECTION_CLOSED on the next query). Keep connections alive with TCP
    // keepalive and never proactively expire idle sockets; `max_lifetime`
    // still recycles them eventually.
    idle_timeout: 0,
    keep_alive: 30,
    connect_timeout: 20,
    max_lifetime: 60 * 30,
    onnotice: () => {},
  });
  return drizzle(client, { schema });
}

export const db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== "production") globalForDb.db = db;
