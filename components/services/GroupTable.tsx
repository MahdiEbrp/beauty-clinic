import type { GroupRow } from "./manager-types";
import { Clock, Edit3, Trash2, LayoutList } from "lucide-react";

type GroupTableProps = {
  groups: GroupRow[];
  canWrite: boolean;
  onViewCategories: (groupId: string) => void;
  onEditGroup: (group: GroupRow) => void;
  onDeleteGroup: (id: string) => void;
};

export function GroupTable({
  groups,
  canWrite,
  onViewCategories,
  onEditGroup,
  onDeleteGroup,
}: GroupTableProps) {
  const formatBool = (v: boolean) => (v ? "فعال" : "غیرفعال");

  if (groups.length === 0) {
    return (
      <div className="rounded-panel border border-dashed border-border-primary bg-surface-secondary p-12 text-center">
        <LayoutList className="mx-auto mb-3 size-10 text-content-tertiary" aria-hidden="true" />
        <p className="text-caption text-content-secondary">
          هیچ گروه-defini شده‌ای وجود ندارد.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-panel border border-border-primary bg-surface-secondary shadow-elevation-2">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-tertiary/50">
            <th className="p-4 text-dash-caption font-bold uppercase tracking-wider text-content-secondary">
              نام گروه
            </th>
            <th className="p-4 text-dash-caption font-bold uppercase tracking-wider text-content-secondary">
              توضیحات
            </th>
            <th className="p-4 text-dash-caption font-bold uppercase tracking-wider text-content-secondary text-center">
              تعداد زیر شاخه
            </th>
            <th className="p-4 text-dash-caption font-bold uppercase tracking-wider text-content-secondary text-center">
              وضعیت
            </th>
            <th className="p-4 text-dash-caption font-bold uppercase tracking-wider text-content-secondary text-center">
              عملیات
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr
              key={group.id}
              className="border-b border-border-primary/60 hover:bg-surface-tertiary/30 transition-colors"
            >
              <td className="p-4">
                <div className="flex items-center gap-2">
                  {group.icon && (
                    <span className="text-copper-strong">{group.icon}</span>
                  )}
                  <span className="font-bold text-content-primary">
                    {group.name}
                  </span>
                </div>
              </td>
              <td className="p-4 text-content-secondary">
                {group.description || "—"}
              </td>
              <td className="p-4 text-center">
                <span className="inline-flex items-center justify-center min-w-8 rounded-pill border border-border-primary bg-surface-tertiary px-2 text-[11px] font-bold text-content-tertiary">
                  {group.categoryCount}
                </span>
              </td>
              <td className="p-4 text-center">
                <span
                  className={`inline-flex items-center justify-center min-w-20 rounded-pill border px-2 py-0.5 text-[11px] font-bold ${
                    group.isActive
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-border-interactive bg-surface-tertiary text-content-secondary"
                  }`}
                >
                  {formatBool(group.isActive)}
                </span>
              </td>
              <td className="p-4 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      void onViewCategories(group.id);
                    }}
                    className="inline-flex min-h-9 items-center gap-1 rounded-control border border-border-interactive bg-surface-secondary px-2 text-[11px] font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <Clock className="size-3" aria-hidden="true" />
                    زیر شاخه‌ها
                  </button>
                  {canWrite && (
                    <>
                      <button
                        type="button"
                        onClick={() => onEditGroup(group)}
                        className="inline-flex min-h-9 items-center gap-1 rounded-control border border-border-interactive bg-surface-secondary px-2 text-[11px] font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        <Edit3 className="size-3" aria-hidden="true" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void onDeleteGroup(group.id);
                        }}
                        className="inline-flex min-h-9 items-center gap-1 rounded-control border border-error/40 bg-error/5 px-2 text-[11px] font-bold text-error transition-colors hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        <Trash2 className="size-3" aria-hidden="true" />
                        حذف
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
