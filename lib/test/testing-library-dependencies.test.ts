import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import manifest from "@/package.json";

describe("Testing Library build dependencies", () => {
  it("declares the DOM peer directly instead of relying on automatic peer installation", () => {
    expect(manifest.devDependencies).toHaveProperty("@testing-library/dom");
  });

  it("resolves the DOM helpers re-exported by React Testing Library", () => {
    expect(typeof fireEvent).toBe("function");
    expect(typeof screen.getByRole).toBe("function");
    expect(typeof waitFor).toBe("function");
  });
});
