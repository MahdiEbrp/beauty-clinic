import type { CategoryRow } from "./manager-types";
import { Edit3, Trash2, LayoutList } from "lucide-react";

type CategoryTableProps = {
  categories: CategoryRow[];
  selectedGroup: { name: string } | null;
  canWrite: boolean;
  onAddCategory: () => void;
  onEditCategory: (cat: CategoryRow) => void;
  onDeleteCategory: (id: string) => void;
};

export function CategoryTable({
  categories,
  selectedGroup,
  canWrite,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: CategoryTableProps) {
  const formatBool = (v: boolean) => (v ? "فعال" : "غیرفعال");

  if (categories.length === 0) {
    return (
      <div className="rounded-panel border border-dashed border-border-primary bg-surface-secondary p-12 text-center flex flex-col items-center justify-center gap-2">
        <LayoutList className="mx-auto size-10 text-content-tertiary" aria-hidden="true" />
        <p className="text-caption text-content-secondary">
          برای این گروه هنوز زیر شاخه-defini نشده است.
        </p>
        {canWrite && (
          <button
            type="button"
            onClick={onAddCategory}
            className="inline-flex min-h-10 items-center gap-2 rounded-pill bg-accent px-5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            افزودن زیر شاخه
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-dash-title font-bold tracking-tight text-content-primary">
          زیر شاخه‌های {selectedGroup?.name ?? ""}
        </h2>
        {canWrite && (
          <button
            type="button"
            onClick={onAddCategory}
            className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-accent px-5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            افزودن زیر شاخه
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-panel border border-border-primary bg-surface-secondary shadow-elevation-2">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-tertiary/50">
            <th className="p-4 text-dash-caption font-bold uppercase tracking-wider text-content-secondary">
              نام زیر شاخه
            </th>
            <th className="p-4 text-dash-caption font-bold uppercase tracking-wider text-content-secondary">
              توضیحات
            </th>
            <th className="p-4 text-dash-caption font-bold uppercase tracking-wider text-content-secondary text-center">
              تعداد خدمات
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
          {categories.map((cat) => (
            <tr
              key={cat.id}
              className="border-b border-border-primary/60 hover:bg-surface-tertiary/30 transition-colors"
            >
              <td className="p-4">
                <div className="flex items-center gap-2">
                  {cat.icon && <span className="text-copper-strong">{cat.icon}</span>}
                  <span className="font-bold text-content-primary">{cat.name}</span>
                </div>
              </td>
              <td className="p-4 text-content-secondary">
                {cat.description || "—"}
              </td>
              <td className="p-4 text-center">
                <span className="inline-flex items-center justify-center min-w-8 rounded-pill border border-border-primary bg-surface-tertiary px-2 text-[11px] font-bold text-content-tertiary">
                  {cat.serviceCount}
                </span>
              </td>
              <td className="p-4 text-center">
                <span
                  className={`inline-flex items-center justify-center min-w-20 rounded-pill border px-2 py-0.5 text-[11px] font-bold ${
                    cat.isActive
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-border-interactive bg-surface-tertiary text-content-secondary"
                  }`}
                >
                  {formatBool(cat.isActive)}
                </span>
              </td>
              <td className="p-4 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  {canWrite && (
                    <>
                      <button
                        type="button"
                        onClick={() => onEditCategory(cat)}
                        className="inline-flex min-h-9 items-center gap-1 rounded-control border border-border-interactive bg-surface-secondary px-2 text-[11px] font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        <Edit3 className="size-3" aria-hidden="true" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void onDeleteCategory(cat.id);
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
    </section>
  );
}
