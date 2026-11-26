// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import type { AuthUser } from "@/lib/auth/dal";
import { AdminListProvider } from "./context";
import { AdminListHeader } from "./header";
import type { AdminListConfig } from "./types";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock("sonner", () => ({
  toast: { loading: vi.fn(), success: vi.fn(), error: vi.fn() },
}));
vi.mock("@/src/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

afterEach(cleanup);

function renderHeader(permissions: string[]) {
  const onExport = vi.fn();
  const config: AdminListConfig<{ id: string }> = {
    namespace: "bookingReservations",
    routeBase: "/dashboard/bookings/manage/reservations",
    backHref: "/dashboard/bookings",
    addHref: "/dashboard/bookings/manage/reservations/add",
    listUrl: "/api/v1/bookings",
    permissions: {
      read: "appointments.read",
      write: "appointments.write",
      manage: "appointments.manage",
    },
    exportAction: { labelKey: "bookingReservations.export", onExport },
    statusOptions: [],
    columns: [],
    renderMobileCard: () => null,
    rowActionButtons: () => [],
    statusPatch: () => ({}),
    confirmPhrase: () => ({ title: "", description: "" }),
    bulkActions: [],
    executeBulk: () => Promise.resolve({ requested: 0, succeeded: 0, failures: [] }),
    itemUrl: (r) => r.id,
    deleteRow: () => Promise.resolve(),
    patchRow: () => Promise.resolve(),
  };

  const user: AuthUser = {
    id: "u1",
    email: "staff@example.com",
    fullName: "Staff",
    roles: ["receptionist"],
    permissions,
  };

  render(
    <AdminListProvider
      config={config}
      user={user}
      initialData={{ items: [], total: 3, perPage: 10, totalPages: 1, page: 1 }}
    >
      <AdminListHeader />
    </AdminListProvider>,
  );

  return { onExport };
}

describe("AdminListHeader Excel export button", () => {
  it("renders Export button for read-only staff (without manage permission) and forwards active filters", () => {
    const { onExport } = renderHeader(["appointments.read"]);
    const button = screen.getByRole("button", { name: "bookingReservations.export" });
    fireEvent.click(button);
    expect(onExport).toHaveBeenCalledWith({ search: "", status: "all" });
  });

  it("hides Export button when user lacks read permission", () => {
    renderHeader(["services.read"]);
    expect(
      screen.queryByRole("button", { name: "bookingReservations.export" }),
    ).toBeNull();
  });
});
