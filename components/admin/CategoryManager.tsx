"use client";

import { useState, useTransition } from "react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
} from "@/app/actions/admin/categories";
import { Plus, Pencil, Trash2, X } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  parent_id: string | null;
  product_count?: number;
};

type Props = {
  categories: Category[];
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function CategoryManager({ categories }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sort_order: 0,
    is_active: true,
    parent_id: "",
  });
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: "", slug: "", sort_order: 0, is_active: true, parent_id: "" });
    setError(null);
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      sort_order: cat.sort_order,
      is_active: cat.is_active,
      parent_id: cat.parent_id ?? "",
    });
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("slug", formData.slug);
    fd.append("sort_order", String(formData.sort_order));
    fd.append("is_active", String(formData.is_active));
    if (formData.parent_id) fd.append("parent_id", formData.parent_id);

    startTransition(async () => {
      const result = editing
        ? await updateCategory(editing.id, fd)
        : await createCategory(fd);

      if (result.error) {
        setError(typeof result.error === "string" ? result.error : "Có lỗi xảy ra.");
      } else {
        setShowModal(false);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa danh mục này không?")) return;
    startTransition(async () => { await deleteCategory(id); });
  };

  const handleToggle = (id: string, is_active: boolean) => {
    startTransition(async () => { await toggleCategoryActive(id, !is_active); });
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">
            Danh mục sản phẩm
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs font-medium text-primary bg-primary-container px-3 py-1 rounded-full">
              Tổng: {categories.length} danh mục
            </span>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary text-on-primary font-headline font-bold px-6 py-3 rounded-full flex items-center gap-2 transition-all shadow-lg shadow-primary/20 hover:brightness-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Thêm danh mục
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0px_20px_40px_rgba(43,48,45,0.06)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/10">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Tên danh mục
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Slug
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Thứ tự
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10 text-sm">
            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-8 py-12 text-center text-on-surface-variant"
                >
                  Chưa có danh mục nào. Hãy tạo danh mục đầu tiên!
                </td>
              </tr>
            )}
            {categories.map((cat) => (
              <tr
                key={cat.id}
                className="hover:bg-surface-container/30 transition-colors"
              >
                <td className="px-6 py-4 font-bold text-on-surface">
                  {cat.name}
                  {cat.parent_id && (
                    <span className="ml-2 text-xs text-on-surface-variant font-normal opacity-60">
                      (sub)
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-on-surface-variant font-mono text-xs">
                  {cat.slug}
                </td>
                <td className="px-6 py-4 text-on-surface-variant">
                  {cat.sort_order}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggle(cat.id, cat.is_active)}
                    className={`flex items-center gap-1.5 text-sm font-semibold transition-all ${
                      cat.is_active
                        ? "text-primary"
                        : "text-outline-variant"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${cat.is_active ? "bg-primary animate-pulse" : "bg-outline-variant"}`}
                    />
                    {cat.is_active ? "Hiển thị" : "Ẩn"}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-all"
                    >
                      <Pencil className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 hover:bg-error/10 rounded-full text-error transition-all"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-[2rem] p-8 w-full max-w-lg shadow-[0_40px_80px_rgba(0,0,0,0.15)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold font-headline text-on-surface">
                {editing ? "Sửa danh mục" : "Thêm danh mục mới"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-surface-container rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-error/10 text-error text-sm rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                      slug: editing ? prev.slug : slugify(e.target.value),
                    }));
                  }}
                  className="w-full px-4 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="VD: Trái cây nhiệt đới"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-surface-container-low border-none rounded-full text-sm font-mono outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="trai-cay-nhiet-doi"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                    Thứ tự
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sort_order: Number(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={String(formData.is_active)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_active: e.target.value === "true",
                      }))
                    }
                    className="w-full px-4 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="true">Hiển thị</option>
                    <option value="false">Ẩn</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                  Danh mục cha (tuỳ chọn)
                </label>
                <select
                  value={formData.parent_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      parent_id: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">— Không có —</option>
                  {categories
                    .filter((c) => !c.parent_id && c.id !== editing?.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-surface-container border border-outline-variant/20 text-on-surface-variant font-semibold rounded-full hover:bg-surface-container-high transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-full shadow-lg shadow-primary/20 hover:brightness-105 transition-all disabled:opacity-60"
                >
                  {isPending ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
