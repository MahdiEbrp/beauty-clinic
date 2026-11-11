"use client";
import { useCallback, useState } from "react";
import { Network, X } from "lucide-react";
import { useRouter } from "@/src/i18n/navigation";
import type { AuthUser } from "@/lib/auth/dal";
import type { SyntheticEvent } from "react";
import { GroupTable } from "./GroupTable";
import { CategoryTable } from "./CategoryTable";
import { GroupForm } from "./GroupForm";
import { CategoryForm } from "./CategoryForm";
import type { GroupRow, CategoryRow } from "./manager-types";

export function UnifiedServiceManager({
  user,
  initialGroups,
}: {
  user: AuthUser;
  initialGroups: GroupRow[];
}) {
  const router = useRouter();
  const canWrite = user.permissions.includes("services.write");

  const [viewMode, setViewMode] = useState<"groups" | "categories">("groups");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupRow[]>(initialGroups);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [editingGroup, setEditingGroup] = useState<GroupRow | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadCategoriesForGroup = useCallback(async (groupId: string) => {
    setSelectedGroupId(groupId);
    setViewMode("categories");
    try {
      const res = await fetch(
        `/api/v1/service-categories?perPage=100&groupId=${groupId}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("load_failed");
      const data = (await res.json()) as { items?: CategoryRow[] };
      setCategories(data.items ?? []);
    } catch {
      setError("بارگذاری زیر شاخه‌ها انجام نشد.");
    }
  }, []);

  const handleSubmitGroup = async (event: SyntheticEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget as HTMLFormElement);
      const body = {
        slug: formData.get("slug"),
        icon: formData.get("icon") || undefined,
        image: formData.get("image") || undefined,
        displayOrder: Number(formData.get("displayOrder") || 0),
        isActive: formData.get("isActive") === "true",
        translations: {
          fa: {
            name: formData.get("name_fa"),
            description: formData.get("description_fa") || undefined,
          },
          en: {
            name: formData.get("name_en"),
            description: formData.get("description_en") || undefined,
          },
        },
      };

      const url = editingGroup
        ? `/api/v1/service-groups/${editingGroup.id}`
        : "/api/v1/service-groups";
      const method = editingGroup ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("save_failed");

      const listRes = await fetch(
        "/api/v1/service-groups?perPage=100&status=all",
        { credentials: "include" },
      );
      if (listRes.ok) {
        const listData = (await listRes.json()) as { items?: GroupRow[] };
        setGroups(listData.items ?? []);
      }

      setEditingGroup(null);
      router.refresh();
    } catch {
      setError("ذخیره گروه انجام نشد.");
    } finally {
      setSubmitting(false);
    }
  };
  const handleSubmitCategory = async (event: SyntheticEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget as HTMLFormElement);
      const body = {
        groupId: formData.get("groupId") || selectedGroupId,
        slug: formData.get("slug"),
        icon: formData.get("icon") || undefined,
        image: formData.get("image") || undefined,
        displayOrder: Number(formData.get("displayOrder") || 0),
        isActive: formData.get("isActive") === "true",
        translations: {
          fa: {
            name: formData.get("name_fa"),
            description: formData.get("description_fa") || undefined,
          },
          en: {
            name: formData.get("name_en"),
            description: formData.get("description_en") || undefined,
          },
        },
      };

      const url = editingCategory
        ? `/api/v1/service-categories/${editingCategory.id}`
        : "/api/v1/service-categories";
      const method = editingCategory ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("save_failed");

      if (selectedGroupId) {
        await loadCategoriesForGroup(selectedGroupId);
      }
      setEditingCategory(null);
      router.refresh();
    } catch {
      setError("ذخیره زیر شاخه انجام نشد.");
    } finally {
      setSubmitting(false);
    }
  };
  const deleteGroup = async (id: string) => {
    if (
      !confirm("آیا مطمئن هستید که می‌خواهید این گروه را حذف کنید؟")
    )
      return;
    try {
      const res = await fetch(`/api/v1/service-groups/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("delete_failed");
      setGroups((prev) => prev.filter((g) => g.id !== id));
      if (selectedGroupId === id) {
        setSelectedGroupId(null);
        setViewMode("groups");
        setCategories([]);
      }
      router.refresh();
    } catch {
      setError("حذف گروه انجام نشد.");
    }
  };
  const deleteCategory = async (id: string) => {
    if (
      !confirm("آیا مطمئن هستید که می‌خواهید این زیر شاخه را حذف کنید؟")
    )
      return;
    try {
      const res = await fetch(`/api/v1/service-categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("delete_failed");
      if (selectedGroupId) {
        await loadCategoriesForGroup(selectedGroupId);
      }
      router.refresh();
    } catch {
      setError("حذف زیر شاخه انجام نشد.");
    }
  };
  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null;
  const groupCategories = selectedGroupId
    ? categories.filter((c) => c.groupId === selectedGroupId)
    : [];

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="space-y-2">
        <h1 className="text-dash-display font-bold tracking-tight text-accent">
          مدیریت خدمات و زیر شاخه‌ها
        </h1>
        <p className="text-dash-body text-content-secondary">
          گروه‌های خدماتی و زیر شاخه‌های مربوطه را در یک صفحه مدیریت کنید.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-control border border-error/40 bg-error/5 px-4 py-3 text-body-sm font-bold text-error"
        >
          <X className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setViewMode("groups")}
          className={`inline-flex min-h-10 items-center gap-2 rounded-control border px-3 text-dash-caption font-bold transition-colors ${
            viewMode === "groups"
              ? "bg-accent text-content-contrast border-accent"
              : "border-border-interactive bg-surface-secondary text-content-secondary hover:bg-surface-tertiary"
          }`}
        >
          <Network className="size-4" aria-hidden="true" />
          گروه‌های خدماتی
        </button>
        {selectedGroup && (
          <button
            type="button"
            onClick={() => {
              setViewMode("groups");
              setSelectedGroupId(null);
              setCategories([]);
            }}
            className="inline-flex min-h-10 items-center gap-2 rounded-control border border-border-interactive bg-surface-secondary px-3 text-dash-caption font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="size-4" aria-hidden="true" />
            بازگشت به گروه‌ها
          </button>
        )}
      </div>

      {viewMode === "groups" ? (
        <GroupTable
          groups={groups}
          canWrite={canWrite}
          onViewCategories={(groupId) => {
            void loadCategoriesForGroup(groupId);
          }}
          onEditGroup={setEditingGroup}
          onDeleteGroup={(id) => {
            void deleteGroup(id);
          }}
        />
      ) : (
        <CategoryTable
          categories={groupCategories}
          selectedGroup={selectedGroup}
          canWrite={canWrite}
          onAddCategory={() => setEditingCategory(null)}
          onEditCategory={setEditingCategory}
          onDeleteCategory={(id) => {
            void deleteCategory(id);
          }}
        />
      )}

      {editingGroup && (
        <GroupForm
          group={editingGroup}
          onSave={(event) => {
            void handleSubmitGroup(event);
          }}
          onCancel={() => setEditingGroup(null)}
          submitting={submitting}
        />
      )}

      {editingCategory && (
        <CategoryForm
          category={editingCategory}
          onSave={(event) => {
            void handleSubmitCategory(event);
          }}
          onCancel={() => setEditingCategory(null)}
          submitting={submitting}
        />
      )}
    </div>
  );
}
