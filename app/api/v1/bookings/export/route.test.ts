import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSession, type AuthSession } from "@/lib/auth/dal";
import { exportBookingsToXlsx } from "@/lib/bookings/export";
import { GET } from "./route";

vi.mock("@/lib/auth/dal", () => ({ getSession: vi.fn() }));
vi.mock("@/lib/bookings/export", () => ({ exportBookingsToXlsx: vi.fn() }));

const staffSession: AuthSession = {
  sessionId: "550e8400-e29b-41d4-a716-4466554400aa",
  userId: "550e8400-e29b-41d4-a716-446655440001",
  user: {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "reception@example.com",
    fullName: "Receptionist",
    roles: ["receptionist"],
    permissions: ["appointments.read", "appointments.write"],
  },
};

const context = { params: Promise.resolve({}) };

function makeRequest(qs = "?locale=fa&status=paid&tz=Asia/Tehran") {
  return new Request(`http://localhost:3000/api/v1/bookings/export${qs}`, {
    method: "GET",
    headers: { host: "localhost:3000" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSession).mockResolvedValue(staffSession);
  vi.mocked(exportBookingsToXlsx).mockResolvedValue({
    buffer: Buffer.from("PK\x03\x04mock-xlsx"),
    filename: "reservations-2026-11-26.xlsx",
  });
});

describe("GET /api/v1/bookings/export", () => {
  it("allows receptionist/doctor with appointments.read and returns xlsx download headers", async () => {
    const response = await GET(makeRequest(), context);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    expect(response.headers.get("content-disposition")).toBe(
      'attachment; filename="reservations-2026-11-26.xlsx"',
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(exportBookingsToXlsx).toHaveBeenCalledWith({
      locale: "fa",
      status: "paid",
      tz: "Asia/Tehran",
    });
  });

  it("rejects unauthenticated requests with 401", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const response = await GET(makeRequest(), context);
    expect(response.status).toBe(401);
    expect(exportBookingsToXlsx).not.toHaveBeenCalled();
  });

  it("rejects users lacking appointments.read with 403", async () => {
    vi.mocked(getSession).mockResolvedValue({
      ...staffSession,
      user: { ...staffSession.user, permissions: ["services.read"] },
    });
    const response = await GET(makeRequest(), context);
    expect(response.status).toBe(403);
    expect(exportBookingsToXlsx).not.toHaveBeenCalled();
  });
});
