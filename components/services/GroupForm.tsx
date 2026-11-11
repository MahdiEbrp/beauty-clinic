import type { SyntheticEvent } from "react";
import type { GroupRow } from "./manager-types";
import { Field } from "@/components/bookings/wizard-fields";

type GroupFormProps = {
  group: GroupRow | null;
  onSave: (event: SyntheticEvent) => void;
  onCancel: () => void;
  submitting: boolean;
};

export function GroupForm({
  group,
  onSave,
  onCancel,
  submitting,
}: GroupFormProps) {
  const isEdit = !!group;

  return (
    <section className="space-y-4">
      <div className="rounded-panel border border-surface-variant/50 bg-surface-secondary p-5 shadow-elevation-2 sm:p-6">
        <h2 className="text-dash-title font-bold tracking-tight text-content-primary">
          {isEdit ? "ویرایش گروه" : "افزودن گروه جدید"}
        </h2>
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="نام گروه (فارسی)">
              <input
                type="text"
                name="name_fa"
                defaultValue={group?.translations?.fa?.name ?? ""}
                required
                className="h-11 w-full rounded-control border bg-form-input-bg px-3 text-dash-body-sm text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
            </Field>
            <Field label="نام گروه (انگلیسی)">
              <input
                type="text"
                name="name_en"
                defaultValue={group?.translations?.en?.name ?? ""}
                className="h-11 w-full rounded-control border bg-form-input-bg px-3 text-dash-body-sm text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
            </Field>
          </div>
          <Field label="Slug">
            <input
              type="text"
              name="slug"
              defaultValue={group?.slug ?? ""}
              required
              placeholder="botox"
              className="h-11 w-full rounded-control border bg-form-input-bg px-3 text-dash-body-sm text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </Field>
          <Field label="توضیحات (فارسی)">
            <textarea
              name="description_fa"
              defaultValue={group?.translations?.fa?.description ?? ""}
              rows={2}
              className="h-24 w-full rounded-control border bg-form-input-bg px-3 text-dash-body-sm text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </Field>
          <Field label="توضیحات (انگلیسی)">
            <textarea
              name="description_en"
              defaultValue={group?.translations?.en?.description ?? ""}
              rows={2}
              className="h-24 w-full rounded-control border bg-form-input-bg px-3 text-dash-body-sm text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="آیکون">
              <input
                type="text"
                name="icon"
                defaultValue={group?.icon ?? ""}
                placeholder="💉"
                className="h-11 w-full rounded-control border bg-form-input-bg px-3 text-dash-body-sm text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
            </Field>
            <Field label="تصویر (URL)">
              <input
                type="text"
                name="image"
                defaultValue={group?.image ?? ""}
                placeholder="https://..."
                className="h-11 w-full rounded-control border bg-form-input-bg px-3 text-dash-body-sm text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
            </Field>
            <Field label="ترتیب نمایش">
              <input
                type="number"
                name="displayOrder"
                defaultValue={String(group?.displayOrder ?? 0)}
                className="h-11 w-full rounded-control border bg-form-input-bg px-3 text-dash-body-sm text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
            </Field>
            <Field label="وضعیت">
              <select
                name="isActive"
                className="h-11 w-full rounded-control border bg-form-input-bg px-3 text-dash-body-sm text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <option value="true">فعال</option>
                <option value="false">غیرفعال</option>
              </select>
            </Field>
          </div>
          <div className="flex items-center justify-between gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent transition hover:bg-surface-tertiary disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-accent px-5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {submitting ? "ذخیره..." : isEdit ? "بروزرسانی گروه" : "افزودن گروه"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
