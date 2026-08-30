import { describe, expect, it } from "vitest";

import { createSmsTemplateSchema } from "./sms-templates";

const translations = {
  fa: { name: "تأیید", content: "سلام {{name}}" },
  en: { name: "Confirm", content: "Hello {{name}}" },
};

describe("SMS template validation", () => {
  it("accepts bilingual templates", () => {
    expect(createSmsTemplateSchema.safeParse({ key: "booking.confirmed", translations }).success).toBe(true);
  });

  it("rejects duplicate variables and invalid keys", () => {
    expect(createSmsTemplateSchema.safeParse({ key: "Booking", variables: ["name", "name"], translations }).success).toBe(false);
  });
});
