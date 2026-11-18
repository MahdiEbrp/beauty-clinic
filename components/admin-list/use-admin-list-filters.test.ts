// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAdminList } from "./use-admin-list";
import { useAdminActions } from "./use-admin-actions";
import type { AdminListConfig } from "./types";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("sonner", () => ({ toast: { loading: vi.fn(), success: vi.fn(), error: vi.fn() } }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const initialData = { items: [{ id: "slot" }], page: 1, perPage: 10, total: 1, totalPages: 1 };
const user = { id: "user", email: "user@example.com", fullName: "Admin", roles: [], permissions: ["appointments.manage"] };
const config: AdminListConfig<{ id: string }> = {
  namespace: "bookingSlots", routeBase: "/dashboard/slots", backHref: "/dashboard", addHref: "/dashboard/slots/add",
  listUrl: "/api/v1/bookings/slots/list", permissions: { read: "appointments.read", write: "appointments.write", manage: "appointments.manage" },
  statusOptions: [], columns: [], renderMobileCard: () => null, rowActionButtons: () => [],
  statusPatch: () => ({}), confirmPhrase: () => ({ title: "", description: "" }), bulkActions: [],
  executeBulk: () => Promise.resolve({ requested: 0, succeeded: 0, failures: [] }),
  itemUrl: (row) => `/api/v1/bookings/slots/${row.id}`,
  patchRow: () => Promise.resolve(), deleteRow: () => Promise.resolve(),
};

function setup() {
  const fetchMock = vi.fn(() => Promise.resolve(new Response(JSON.stringify({ data: initialData }))));
  vi.stubGlobal("fetch", fetchMock);
  const hook = renderHook(() => {
    const list = useAdminList(config, user, initialData);
    return { list, actions: useAdminActions(config, list) };
  });
  return { ...hook, fetchMock };
}

describe("admin list group and date filters", () => {
  it("sends active filters with pagination and preserves them after a row mutation", async () => {
    const { result, fetchMock } = setup();
    act(() => {
      result.current.list.setFilterValue("groupId", "group");
      result.current.list.setFilterValue("from", "2026-11-01");
      result.current.list.setFilterValue("to", "2026-11-30");
      result.current.list.setPage(2);
    });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/v1/bookings/slots/list?page=2&perPage=10&status=all&groupId=group&from=2026-11-01&to=2026-11-30",
      { credentials: "include" },
    );
    await act(() => result.current.actions.runAction({ id: "slot" }, { isActive: false }));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]).toEqual(fetchMock.mock.calls[0]);
  });

  it("removes cleared filters instead of sending empty query values", async () => {
    const { result, fetchMock } = setup();
    act(() => result.current.list.setFilterValue("groupId", "group"));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    act(() => result.current.list.setFilterValue("groupId", ""));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/v1/bookings/slots/list?page=1&perPage=10&status=all", { credentials: "include" },
    );
  });
});
