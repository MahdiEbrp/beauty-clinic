import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = resolve(process.cwd());
const en = JSON.parse(
  readFileSync(resolve(root, "messages/en.json"), "utf8"),
) as Record<string, unknown>;
const fa = JSON.parse(
  readFileSync(resolve(root, "messages/fa.json"), "utf8"),
) as Record<string, unknown>;

type LeafNode = string | null | number | boolean;
type JsonNode = LeafNode | JsonNode[] | { [key: string]: JsonNode };

function collectKeys(node: JsonNode, prefix = ""): string[] {
  if (node === null || typeof node !== "object") return [prefix];
  const keys: string[] = [];
  for (const [key, value] of Object.entries(node)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...collectKeys(value, next));
    } else {
      keys.push(next);
    }
  }
  return keys;
}

function collectParams(node: JsonNode, prefix = ""): string[] {
  if (node === null || typeof node !== "object") return [];
  const params: string[] = [];
  for (const [key, value] of Object.entries(node)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      params.push(...collectParams(value, next));
    } else if (typeof value === "string") {
      for (const match of value.matchAll(/\{([a-zA-Z0-9_]+)\}/g)) {
        params.push(`${next}->${match[1]}`);
      }
    }
  }
  return params;
}

describe("message parity", () => {
  it("has identical key structure in en and fa", () => {
    const enKeys = collectKeys(en as JsonNode).sort();
    const faKeys = collectKeys(fa as JsonNode).sort();
    expect(faKeys).toEqual(enKeys);
  });

  it("uses the same interpolation params for every translated string", () => {
    const enParams = collectParams(en as JsonNode).sort();
    const faParams = collectParams(fa as JsonNode).sort();
    expect(faParams).toEqual(enParams);
  });
});

describe("serviceCategories namespace", () => {
  it("covers every key the UI reads", () => {
    const required = [
      "heading",
      "resultsLabel",
      "add",
      "search",
      "searchPlaceholder",
      "status",
      "statusAll",
      "statuses.active",
      "statuses.inactive",
      "clearFilters",
      "loading",
      "empty",
      "emptySearch",
      "errorTitle",
      "errorDescription",
      "retry",
      "table.name",
      "table.group",
      "table.services",
      "table.status",
      "actions.edit",
      "actions.activate",
      "actions.deactivate",
      "actions.delete",
      "actions.menu",
      "deactivateDialog.title",
      "deactivateDialog.description",
      "dialog.cancel",
      "dialog.confirm",
      "dialog.done",
      "pagination.showing",
      "pagination.previous",
      "pagination.next",
      "pagination.pageInfo",
      "bulk.selected",
      "bulk.selectedFiltered",
      "bulk.activate",
      "bulk.deactivate",
      "bulk.delete",
      "bulk.apply",
      "bulk.clear",
      "bulk.pageSelected",
      "bulk.selectFiltered",
      "bulk.confirm.delete",
      "bulk.confirm.deactivate",
      "bulk.confirmDescription",
      "bulk.resultTitle",
      "bulk.resultPartialTitle",
      "bulk.resultDescription",
      "bulk.resultPartialDescription",
      "toast.syncing",
      "toast.success",
      "toast.deleted",
      "toast.error",
    ];
    for (const key of required) {
      for (const messages of [en, fa]) {
        const ns = messages.serviceCategories as Record<string, unknown>;
        expect(collectKeys(ns as JsonNode)).toContain(key);
      }
    }
  });
});

describe("categoryWizard namespace", () => {
  it("covers every key the wizard reads", () => {
    const required = [
      "back",
      "heading",
      "subtitle",
      "editHeading",
      "editSubtitle",
      "steps.group.name",
      "steps.identity.name",
      "steps.appearance.name",
      "steps.localization.name",
      "steps.seo.name",
      "steps.review.name",
      "language.en",
      "language.fa",
      "language.editing",
      "group.title",
      "group.hint",
      "group.emptyTitle",
      "group.emptyDescription",
      "group.createGroup",
      "identity.groupName",
      "identity.slug",
      "identity.slugPrefix",
      "identity.active",
      "identity.displayOrder",
      "appearance.icon",
      "appearance.change",
      "appearance.image",
      "localization.title",
      "localization.name",
      "localization.description",
      "seo.title",
      "seo.pageTitle",
      "seo.metaDescription",
      "review.group",
      "review.groupName",
      "review.slug",
      "review.visibility",
      "review.icon",
      "nav.back",
      "nav.continue",
      "nav.create",
      "nav.save",
      "nav.stepOf",
      "errors.slugRequired",
      "errors.nameRequired",
      "errors.groupRequired",
      "errors.slugTaken",
      "errors.generic",
      "toast.creating",
      "toast.created",
      "toast.saving",
      "toast.updated",
      "toast.error",
    ];
    for (const key of required) {
      for (const messages of [en, fa]) {
        const ns = messages.categoryWizard as Record<string, unknown>;
        expect(collectKeys(ns as JsonNode)).toContain(key);
      }
    }
  });
});
