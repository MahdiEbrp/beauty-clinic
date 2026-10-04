import { describe, expect, it, vi } from "vitest";

// The module is server-only; this is the repo's established test convention.
vi.mock("server-only", () => ({}));

const { buildSiteGraph, CLINIC_ID, WEBSITE_ID } = await import("./schema");
import type { ClinicData } from "@/data/clinic";

const clinic: ClinicData = {
  telephone: "+989120000000",
  address: {
    streetAddress: "پلاک ۳۹",
    addressLocality: "اندیشه",
    addressRegion: "تهران",
    addressCountry: "IR",
  },
  openingHours: [
    { days: ["Saturday"], opens: "09:00", closes: "19:00", capacity: 1 },
  ],
  timezone: "Asia/Tehran",
  social: [
    {
      url: "https://instagram.com/nafasclinic",
      imageUrl: null,
      label: "Instagram",
    },
  ],
  maps: {
    neshan: "https://nshn.ir/x",
    google: "https://maps.google.com/?q=x",
    coords: { lat: 35.696215, lng: 51.0030191 },
  },
  currency: "تومان",
  minCancelHours: 24,
  defaultDeposit: 100000,
  content: {} as ClinicData["content"],
};

function parse(): { "@context": string; "@graph": Record<string, unknown>[] } {
  return JSON.parse(
    buildSiteGraph({
      clinic,
      locale: "fa",
      name: "کلینیک زیبایی نفس",
      description: "شرح",
      image: "https://cdn.example/clinic.webp",
      groups: [
        {
          slug: "face-filler",
          icon: null,
          title: "فیلر صورت",
          updatedAt: new Date("2026-01-01T00:00:00.000Z"),
          categories: [],
        },
      ],
    }),
  ) as { "@context": string; "@graph": Record<string, unknown>[] };
}

function node(graph: Record<string, unknown>[], id: string) {
  const found = graph.find((n) => n["@id"] === id);
  if (!found) throw new Error(`missing node ${id}`);
  return found;
}

describe("site JSON-LD graph", () => {
  const graph = parse();

  it("wraps the entities in a single @graph so they cross-reference", () => {
    expect(graph["@context"]).toBe("https://schema.org");
    expect(graph["@graph"]).toHaveLength(2);
  });

  it("identifies the clinic as a BeautySalon", () => {
    expect(node(graph["@graph"], CLINIC_ID)["@type"]).toBe("BeautySalon");
  });

  /**
   * The coordinates were already stored and driving the map embed, but never
   * reached the markup — without `geo` the entity cannot qualify for local
   * results, which is the whole point of a single-location clinic.
   */
  it("emits geo coordinates for local intent", () => {
    const geo = node(graph["@graph"], CLINIC_ID).geo as Record<string, unknown>;
    expect(geo["@type"]).toBe("GeoCoordinates");
    expect(geo.latitude).toBe(35.696215);
    expect(geo.longitude).toBe(51.0030191);
  });

  it("emits postal address, hours, telephone, currency and sameAs", () => {
    const clinicNode = node(graph["@graph"], CLINIC_ID);
    expect((clinicNode.address as Record<string, unknown>)["@type"]).toBe(
      "PostalAddress",
    );
    expect(clinicNode.telephone).toBe("+989120000000");
    expect(clinicNode.currenciesAccepted).toBe("تومان");
    expect(clinicNode.sameAs).toEqual([
      "https://instagram.com/nafasclinic",
    ]);
    const hours = clinicNode.openingHoursSpecification as Record<string, unknown>[];
    expect(hours[0]["@type"]).toBe("OpeningHoursSpecification");
    expect(hours[0].opens).toBe("09:00");
  });

  it("exposes the service catalogue as an OfferCatalog", () => {
    const catalog = node(graph["@graph"], CLINIC_ID).hasOfferCatalog as Record<
      string,
      unknown
    >;
    expect(catalog["@type"]).toBe("OfferCatalog");
    const items = catalog.itemListElement as Record<string, unknown>[];
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe("فیلر صورت");
    expect(String(items[0].url)).toContain("/services/face-filler");
    // Must be the bare origin: a locale-prefixed or relative URL would not
    // resolve for a crawler fetching the entity directly.
    expect(String(items[0].url).startsWith("https://")).toBe(true);
  });

  it("links the website to the clinic as publisher", () => {
    const site = node(graph["@graph"], WEBSITE_ID);
    expect(site["@type"]).toBe("WebSite");
    expect((site.publisher as Record<string, unknown>)["@id"]).toBe(CLINIC_ID);
  });

  /**
   * These strings are admin-editable (clinic address, service names) and are
   * rendered unescaped inside a script element, so a `</script>` in any of them
   * would otherwise be a stored-XSS vector.
   */
  it("escapes angle brackets and ampersands so values cannot break out", () => {
    const raw = buildSiteGraph({
      clinic: {
        ...clinic,
        address: { ...clinic.address, streetAddress: "</script><img onerror=alert(1)>" },
      },
      locale: "fa",
      name: "</script>",
      description: "a & b",
      image: "https://cdn.example/clinic.webp",
      groups: [],
    });

    expect(raw).not.toContain("</script><img");
    expect(raw).toContain("\\u003c/script\\u003e");
    expect(raw).toContain("\\u0026");
    // Still valid JSON once parsed, i.e. the escaping is only for the HTML
    // parser and does not corrupt the document's data.
    expect(() => {
      JSON.parse(raw);
    }).not.toThrow();
  });

  it("omits the offer catalog when there are no active groups", () => {
    const empty = JSON.parse(
      buildSiteGraph({
        clinic,
        locale: "fa",
        name: "n",
        description: "d",
        image: "https://cdn.example/x.webp",
        groups: [],
      }),
    ) as { "@graph": Record<string, unknown>[] };
    expect(node(empty["@graph"], CLINIC_ID).hasOfferCatalog).toBeUndefined();
  });

  it("omits telephone rather than emitting a placeholder when unset", () => {
    const noPhone = JSON.parse(
      buildSiteGraph({
        clinic: { ...clinic, telephone: null },
        locale: "fa",
        name: "n",
        description: "d",
        image: "https://cdn.example/x.webp",
        groups: [],
      }),
    ) as { "@graph": Record<string, unknown>[] };
    expect(node(noPhone["@graph"], CLINIC_ID).telephone).toBeUndefined();
  });
});