// @vitest-environment jsdom
import { Children, cloneElement, isValidElement } from "react";
import type { AnchorHTMLAttributes, ReactElement, ReactNode } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { createTranslator, NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CategoryPageData, CategoryPageService } from "@/lib/services/category-page";
import en from "@/messages/en.json";
import fa from "@/messages/fa.json";
import CategoryPage from "./CategoryPage";
import CategoryDetails from "./CategoryDetails";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next-intl/server", () => ({
  getTranslations: ({ locale, namespace }: { locale: string; namespace?: "servicesPage" }) =>
    Promise.resolve(createTranslator({ locale, namespace, messages: locale === "fa" ? fa : en })),
}));
vi.mock("@/src/i18n/navigation", () => ({
  Link: ({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>,
  useRouter: () => ({ push }),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
});

function fixture(): CategoryPageData {
  const service: CategoryPageService = {
    id: "s", slug: "service", title: "Treatment", shortDesc: "Treatment intro",
    fullDesc: "Treatment details", seoTitle: null, seoDescription: null,
    price: 100, priceType: "fixed", durationMin: 30, sessionsCount: 1,
    coverImage: "/service.jpg", isFeatured: false, updatedAt: new Date("2026-11-01"),
    displayOrder: 0, images: [{ imageUrl: "/gallery.jpg", type: "gallery", displayOrder: 0 }],
    faqs: [
      { question: "Recovery?", answer: "Recovery information", displayOrder: 0 },
      { question: "Recovery?", answer: "Duplicate answer", displayOrder: 1 },
      { question: "Unanswered?", answer: "", displayOrder: 2 },
    ],
  };
  return {
    currency: "IRR", siblings: [],
    group: { slug: "face-filler", title: "Parent group", icon: "syringe", description: "Parent intro" },
    category: {
      slug: "lip", title: "Category title", icon: "syringe", image: "/category.jpg",
      description: "Category intro", seoTitle: null, seoDescription: null,
      updatedAt: new Date("2026-11-01"), displayOrder: 0, services: [service],
    },
  };
}

async function renderPage(data = fixture(), locale: "en" | "fa" = "en") {
  // Resolve the nested async server component before rendering client components
  // in jsdom; the real header, gallery, FAQ and floating button remain mounted.
  const page: ReactElement<{ children?: ReactNode }> = await CategoryPage({ data, locale });
  const children = await Promise.all(Children.toArray(page.props.children).map(async (node) => {
    if (!isValidElement<{ children?: ReactNode }>(node) || node.type !== "div") return node;
    const content = await Promise.all(Children.toArray(node.props.children).map(async (child) => {
      if (isValidElement<{ category: CategoryPageData["category"]; locale: string }>(child)
        && child.type === CategoryDetails) {
        return CategoryDetails(child.props);
      }
      return child;
    }));
    return cloneElement(node, {}, ...content);
  }));
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === "fa" ? fa : en}>
      {cloneElement(page, {}, ...children)}
    </NextIntlClientProvider>,
  );
}

describe("category page shared group layout", () => {
  it.each(["en", "fa"] as const)("preserves category content, breadcrumbs and structured data in %s", async (locale) => {
    const { container } = await renderPage(fixture(), locale);
    const header = container.querySelector("header");
    if (!header) throw new Error("Shared header missing");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(within(header).getByRole("heading", { level: 1 }).textContent).toBe("Category title");
    expect(within(header).getByText("Category intro")).toBeTruthy();
    expect(within(header).getByRole("img", { name: "Category title" }).getAttribute("src")).toBe("/category.jpg");
    expect(within(header).getByRole("link", { name: "Parent group" }).getAttribute("href")).toBe("/services/face-filler");
    expect(header.querySelector('[aria-current="page"]')?.textContent).toBe("Category title");
    expect(screen.getByText("Treatment details")).toBeTruthy();
    expect(container.querySelector('img[src="/gallery.jpg"]')).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Recovery?" })).toHaveLength(1);
    expect(screen.queryByText("Unanswered?")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Recovery?" }));
    expect(screen.getByText("Recovery information")).toBeTruthy();
    const script = container.querySelector('script[type="application/ld+json"]');
    const schema = JSON.parse(script?.textContent ?? "{}") as {
      itemListElement: { name: string; url?: string }[];
    };
    expect(schema.itemListElement).toHaveLength(4);
    const prefix = locale === "fa" ? "" : "/en";
    expect(schema.itemListElement[2].url).toBe(`https://example.com${prefix}/services/face-filler`);
    expect(schema.itemListElement[3].name).toBe("Category title");
  });

  it("handles a category without an image, description or services", async () => {
    const data = fixture();
    data.category.image = null;
    data.category.description = null;
    data.category.services = [];
    const { container } = await renderPage(data);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Category title");
    expect(container.querySelector("header img")).toBeNull();
    expect(screen.queryByText("Category intro")).toBeNull();
    expect(screen.queryByRole("article")).toBeNull();
    expect(screen.queryByText("Recovery?")).toBeNull();
  });

  it("reveals the floating booking action after scrolling and routes to booking", async () => {
    const { container } = await renderPage();
    const button = Array.from(container.querySelectorAll("button")).find(
      (element) => element.textContent === en.nav.bookNow,
    );
    if (!button) throw new Error("Booking action missing");
    expect(button.hasAttribute("inert")).toBe(true);
    Object.defineProperty(window, "scrollY", { configurable: true, value: 400 });
    fireEvent.scroll(window);
    expect(button.hasAttribute("inert")).toBe(false);
    fireEvent.click(button);
    expect(push).toHaveBeenCalledWith("/booking");
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    fireEvent.scroll(window);
    expect(button.hasAttribute("inert")).toBe(true);
  });
});
