import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { deliveryStateToStatus } from "./provider-diagnostics-service";

describe("SMS.ir delivery state mapping", () => {
  it("maps each provider delivery state to a local message status", () => {
    expect(deliveryStateToStatus(1)).toBe("delivered");
    expect(deliveryStateToStatus(3)).toBe("sent");
    expect(deliveryStateToStatus(5)).toBe("sent");
    expect(deliveryStateToStatus(2)).toBe("failed");
    expect(deliveryStateToStatus(4)).toBe("failed");
    expect(deliveryStateToStatus(6)).toBe("failed");
    expect(deliveryStateToStatus(7)).toBe("failed");
    expect(deliveryStateToStatus(8)).toBe("sending");
  });
});
