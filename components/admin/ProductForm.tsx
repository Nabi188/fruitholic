"use client";

import { useRouter } from "next/navigation";
import { Plus, Loader2, Save, Trash2, ArrowLeft } from "lucide-react";
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { AdminProduct, AdminCategory, AdminOptionGroup } from "@/types/admin";
import { useProductForm } from "@/hooks/use-product-form";
import { slugify } from "@/utils/slugify";
import { QuickCreateOptionGroup } from "./QuickCreateOptionGroup";
import { SortableVariantItem } from "./SortableVariantItem";
import { ImageManager } from "./ImageManager";

type Props = {
  categories: AdminCategory[];
  optionGroups: AdminOptionGroup[];
  product?: AdminProduct;
};

export function ProductForm({ categories, optionGroups, product }: Props) {
  const router = useRouter();

  const { state, actions } = useProductForm(product, optionGroups, () =>
    router.push("/admin/products"),
  );

  const {
    name,
    slug,
    categoryId,
    shortDesc,
    desc,
    isActive,
    sortOrder,
    variants,
    images,
    selectedGroupIds,
    localGroups,
    uploading,
    newImageUrl,
    isPending,
  } = state;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  return (
    <div className="min-h-screen bg-surface-container">
      {/* Sticky Header */}
      <div className="bg-surface-container-lowest border-b border-outline-variant/10 sticky top-0 z-10">
        <div className="container mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => router.push("/admin/products")}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-extrabold font-headline text-on-surface leading-none">
                {product ? "Chỉnh sửa sản phẩm" : "Sản phẩm mới"}
              </h1>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {product
                  ? `Cập nhật "${product.name}"`
                  : "Điền thông tin chi tiết dưới đây"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {product && (
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xoá sản phẩm
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có chắc?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Sản phẩm này sẽ bị xoá vĩnh viễn. Hành động này không thể
                      hoàn tác
                      <strong>{product.name}</strong>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={actions.handleDelete}
                      className="bg-error text-on-error hover:bg-error/90"
                    >
                      Xoá sản phẩm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button
              type="submit"
              form="product-form"
              disabled={isPending}
              className="rounded-full h-9 shadow-xl shadow-primary/20"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {product ? "Update" : "Create"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Page Body */}
      <div className="container mx-auto px-6 md:px-8 py-8">
        <form
          id="product-form"
          onSubmit={actions.handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* LEFT: main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 space-y-4 shadow-sm">
              <h2 className="text-base font-bold font-headline text-on-surface">
                Thông tin cơ bản
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                    Tên sản phẩm *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      actions.setName(e.target.value);
                      if (!product) actions.setSlug(slugify(e.target.value));
                    }}
                    className="w-full px-5 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g. Strawberry Smoothie"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => actions.setSlug(e.target.value)}
                    className="w-full px-5 py-3 bg-surface-container-low border-none rounded-full text-sm font-mono outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                    Danh mục
                  </label>
                  <select
                    value={categoryId ?? ""}
                    onChange={(e) => actions.setCategoryId(e.target.value)}
                    className="w-full px-5 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Không có danh mục</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                  Mô tả ngắn
                </label>
                <textarea
                  value={shortDesc ?? ""}
                  onChange={(e) => actions.setShortDesc(e.target.value)}
                  rows={2}
                  className="w-full px-5 py-3 bg-surface-container-low border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  placeholder="Mô tả ngắn..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                  Mô tả chi tiết
                </label>
                <TipTapEditor
                  value={desc ?? ""}
                  onChange={(html) => actions.setDesc(html)}
                  placeholder="Mô tả chi tiết..."
                />
              </div>
            </div>

            {/* Variants */}
            <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold font-headline text-on-surface">
                  Các biến thể
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={actions.addVariant}
                  className="text-primary"
                >
                  <Plus className="w-4 h-4 mr-1" /> Thêm biến thể
                </Button>
              </div>
              <DndContext
                id="variants-dnd"
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={actions.handleVariantDragEnd}
              >
                <SortableContext
                  items={variants.map((v) => v.uid!)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {variants.map((v) => (
                      <SortableVariantItem
                        key={v.uid}
                        variant={v}
                        isOnly={variants.length === 1}
                        onUpdate={(key, val) =>
                          actions.updateVariant(v.uid!, key, val)
                        }
                        onRemove={() => actions.removeVariant(v.uid!)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {/* Images */}
            <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-sm">
              <ImageManager
                images={images}
                uploading={uploading}
                newImageUrl={newImageUrl}
                onFileUpload={actions.handleFileUpload}
                onUrlAdd={actions.handleUrlAdd}
                onRemove={actions.removeImage}
                onDragEnd={actions.handleImageDragEnd}
                onUrlChange={actions.setNewImageUrl}
              />
            </div>
          </div>

          {/* RIGHT: sidebar */}
          <div className="space-y-6">
            {/* Settings card */}
            <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 space-y-4 shadow-sm">
              <h2 className="text-base font-bold font-headline text-on-surface">
                Cài đặt
              </h2>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => actions.setSortOrder(Number(e.target.value))}
                  className="w-full px-5 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                  Trạng thái
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => actions.setIsActive(true)}
                    className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${isActive ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant"}`}
                  >
                    Hiển thị
                  </button>
                  <button
                    type="button"
                    onClick={() => actions.setIsActive(false)}
                    className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${!isActive ? "bg-error/10 text-error" : "bg-surface-container-low text-on-surface-variant"}`}
                  >
                    Ẩn
                  </button>
                </div>
              </div>
            </div>

            {/* Option Groups card */}
            <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold font-headline text-on-surface">
                    Nhóm tuỳ chọn
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Để khách hàng tuỳ chọn.
                  </p>
                </div>
                <QuickCreateOptionGroup
                  onCreated={actions.handleOptionGroupCreated}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {localGroups.map((g) => {
                  const isSelected = selectedGroupIds.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => actions.toggleOptionGroup(g.id)}
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                        isSelected
                          ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20"
                          : "bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:border-primary/40"
                      }`}
                    >
                      {g.name}
                      {isSelected && <span className="ml-2">✓</span>}
                    </button>
                  );
                })}
                {localGroups.length === 0 && (
                  <p className="text-xs text-on-surface-variant opacity-50">
                    Chưa có nhóm tuỳ chọn.
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
