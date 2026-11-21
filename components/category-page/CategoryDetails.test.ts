// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { createTranslator } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CategoryPageCategory, CategoryPageService } from "@/lib/services/category-page";
import en from "@/messages/en.json";
import fa from "@/messages/fa.json";
import CategoryDetails from "./CategoryDetails";

vi.mock("next-intl/server", () => ({
  getTranslations: ({ locale }: { locale: string }) => Promise.resolve(createTranslator({ locale, messages: locale === "fa" ? fa : en })),
}));
afterEach(cleanup);

function service(overrides: Partial<CategoryPageService> = {}): CategoryPageService {
  return {
    id: "service", slug: "service", title: "Treatment", shortDesc: "Short description",
    fullDesc: "Full description", seoTitle: null, seoDescription: null, price: 100,
    priceType: "fixed", durationMin: 30, sessionsCount: 1, coverImage: "/cover.jpg",
    isFeatured: false, updatedAt: new Date("2026-11-01"), displayOrder: 0, images: [], faqs: [],
    ...overrides,
  };
}

function category(services: CategoryPageService[]): CategoryPageCategory {
  return {
    slug: "category", title: "Category", icon: null, image: null, description: null, seoTitle: null,
    seoDescription: null, updatedAt: new Date("2026-11-01"), displayOrder: 0, services,
  };
}

async function renderDetails(services: CategoryPageService[], locale = "en") {
  return render(await CategoryDetails({ category: category(services), locale }));
}

function grid(article: HTMLElement) {
  const element = article.firstElementChild;
  if (!element) throw new Error("Article grid missing");
  return element;
}

describe("category service details", () => {
  it("uses two desktop columns for a service with a cover image", async () => {
    await renderDetails([service()]);
    expect(grid(screen.getByRole("article")).classList.contains("md:grid-cols-2")).toBe(true);
    expect(screen.getByRole("img", { name: "Treatment" }).getAttribute("src")).toBe("/cover.jpg");
    expect(screen.getByText("Full description")).toBeTruthy();
  });

  it("uses full-width text without reserving an empty image column", async () => {
    await renderDetails([service({ coverImage: null })]);
    const layout = grid(screen.getByRole("article"));
    expect(layout.classList.contains("grid-cols-1")).toBe(true);
    expect(layout.classList.contains("md:grid-cols-2")).toBe(false);
    expect(layout.children).toHaveLength(1);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByRole("heading", { name: "Treatment" })).toBeTruthy();
  });

  it("chooses the layout independently for mixed service images", async () => {
    await renderDetails([service(), service({ id: "second", title: "Second treatment", coverImage: null })]);
    const articles = screen.getAllByRole("article");
    expect(grid(articles[0]).classList.contains("md:grid-cols-2")).toBe(true);
    expect(grid(articles[1]).classList.contains("md:grid-cols-2")).toBe(false);
    expect(within(articles[1]).getByRole("heading", { name: "Second treatment" })).toBeTruthy();
  });

  it("omits the section when the category has no services", async () => {
    expect(await CategoryDetails({ category: category([]), locale: "en" })).toBeNull();
  });

  it.each(["fa", "en"])("renders translated duration copy in %s without adding purchase controls", async (locale) => {
    await renderDetails([service()], locale);
    const messages = locale === "fa" ? fa : en;
    expect(screen.getByText(messages.booking.appointment.duration)).toBeTruthy();
    expect(screen.getByText(messages.booking.appointment.minutes)).toBeTruthy();
    expect(screen.getByText("30")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("omits absent descriptions and duration while retaining the title", async () => {
    await renderDetails([service({ shortDesc: null, fullDesc: null, durationMin: null })]);
    expect(screen.getByRole("heading", { name: "Treatment" })).toBeTruthy();
    expect(screen.queryByText("Short description")).toBeNull();
    expect(screen.queryByText("Full description")).toBeNull();
    expect(screen.queryByText(en.booking.appointment.duration)).toBeNull();
  });
});
