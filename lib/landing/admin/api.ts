import "server-only";

import { jsonError, jsonOk } from "@/lib/api/errors";
import { z } from "zod";

import {
  createGalleryItem,
  createMarqueeItem,
  createServiceCard,
  createStat,
  deleteCollectionBulk,
  deleteGalleryItem,
  deleteMarqueeItem,
  deleteServiceCard,
  deleteStat,
  setCollectionActiveBulk,
  updateGalleryItem,
  updateMarqueeItem,
  updateServiceCard,
  updateStat,
} from "./mutations";
import {
  findCollectionIds,
  getCollectionRow,
  listCollectionRows,
} from "./queries";
import type { LandingCollectionKey } from "./types";

type ApiCtx = {
  body?: unknown;
  query?: unknown;
  params?: Record<string, string>;
};

function asQuery(ctx: ApiCtx) {
  return ctx.query ?? (() => { throw new Error("Query params are missing"); })();
}

function asBody(ctx: ApiCtx) {
  return ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
}

function invalidId(key: LandingCollectionKey) {
  return jsonError("INVALID_LANDING_ID", `Invalid ${key} item id.`, 400);
}

type CreateDraft = {
  displayOrder: number;
  isActive: boolean;
  translations: unknown;
  icon?: string | null;
  image?: string | null;
  imageUrl?: string;
  value?: number;
  compact?: boolean;
  plus?: boolean;
};

type UpdateDraft = Partial<CreateDraft>;

async function createFor(key: LandingCollectionKey, body: CreateDraft) {
  switch (key) {
    case "marquee":
      return createMarqueeItem(body as never);
    case "services":
      return createServiceCard(body as never);
    case "stats":
      return createStat(body as never);
    case "gallery":
      return createGalleryItem(body as never);
  }
}

async function updateFor(key: LandingCollectionKey, id: string, body: UpdateDraft) {
  switch (key) {
    case "marquee":
      return updateMarqueeItem(id, body as never);
    case "services":
      return updateServiceCard(id, body as never);
    case "stats":
      return updateStat(id, body as never);
    case "gallery":
      return updateGalleryItem(id, body as never);
  }
}

async function deleteFor(key: LandingCollectionKey, id: string) {
  switch (key) {
    case "marquee":
      return deleteMarqueeItem(id);
    case "services":
      return deleteServiceCard(id);
    case "stats":
      return deleteStat(id);
    case "gallery":
      return deleteGalleryItem(id);
  }
}

export function landingCollectionList(key: LandingCollectionKey) {
  return async (_request: Request, ctx: ApiCtx) => {
    const { page, perPage, search, status } = asQuery(ctx) as {
      page: number;
      perPage: number;
      search?: string;
      status?: "all" | "active" | "inactive";
    };
    const result = await listCollectionRows(key, { page, perPage, search, status });
    return jsonOk(result);
  };
}

export function landingCollectionCreate(key: LandingCollectionKey) {
  return async (_request: Request, ctx: ApiCtx) => {
    const id = await createFor(key, asBody(ctx) as CreateDraft);
    return jsonOk(id, 201);
  };
}

export function landingCollectionItemGet(key: LandingCollectionKey) {
  return async (_request: Request, ctx: ApiCtx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId(key);
    const item = await getCollectionRow(key, id);
    return jsonOk(item);
  };
}

export function landingCollectionItemPatch(key: LandingCollectionKey) {
  return async (_request: Request, ctx: ApiCtx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId(key);
    await updateFor(key, id, asBody(ctx) as UpdateDraft);
    return jsonOk({ ok: true });
  };
}

export function landingCollectionItemDelete(key: LandingCollectionKey) {
  return async (_request: Request, ctx: ApiCtx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId(key);
    await deleteFor(key, id);
    return jsonOk({ ok: true });
  };
}

export function landingCollectionBulk(key: LandingCollectionKey) {
  return async (_request: Request, ctx: ApiCtx) => {
    const body = asBody(ctx) as {
      action: "activate" | "deactivate" | "delete";
      scope: "page" | "filtered";
      ids?: string[];
      filters?: { search?: string; status?: "all" | "active" | "inactive" };
    };
    const ids =
      body.scope === "filtered"
        ? await findCollectionIds(key, body.filters ?? {})
        : [...new Set(body.ids ?? [])];
    if (body.action === "delete") {
      await deleteCollectionBulk(key, ids);
    } else {
      await setCollectionActiveBulk(key, ids, body.action === "activate");
    }
    return jsonOk({ requested: ids.length, succeeded: ids.length, failures: [] });
  };
}