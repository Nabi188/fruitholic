"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/app/actions/admin/products";
import {
  ArrowLeft,
  Trash2,
  AlertCircle,
  Plus,
  X,
  Loader2,
  ImagePlus,
  Save,
} from "lucide-react";

type Variant = { name: string; price: number; is_active: boolean };
type Category = { id: string; name: string };

type Props = {
  categories: Category[];
  product?: {
    id: string;
    name: string;
    slug: string;
    category_id: string | null;
    short_description: string | null;
    description: string | null;
    is_active: boolean;
    sort_order: number;
    product_variants: { name: string; price: number; is_active: boolean }[];
    product_images: { url: string; sort_order: number }[];
  };
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

export function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [shortDesc, setShortDesc] = useState(product?.short_description ?? "");
  const [desc, setDesc] = useState(product?.description ?? "");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(product?.sort_order ?? 0);
  const [variants, setVariants] = useState<Variant[]>(
    product?.product_variants ?? [
      { name: "Mặc định", price: 0, is_active: true },
    ],
  );
  const [imageUrls, setImageUrls] = useState<string[]>(
    product?.product_images
      ?.sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => i.url) ?? [],
  );
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addVariant = () =>
    setVariants((prev) => [...prev, { name: "", price: 0, is_active: true }]);

  const removeVariant = (i: number) =>
    setVariants((prev) => prev.filter((_, idx) => idx !== i));

  const updateVariant = (
    i: number,
    key: keyof Variant,
    val: string | number | boolean,
  ) =>
    setVariants((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, [key]: val } : v)),
    );

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const sigRes = await fetch("/api/upload", { method: "POST" });
      const { timestamp, signature, cloudName, apiKey, folder } =
        await sigRes.json();

      const fd = new FormData();
      fd.append("file", file);
      fd.append("timestamp", String(timestamp));
      fd.append("signature", signature);
      fd.append("api_key", apiKey);
      fd.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: fd },
      );
      const result = await uploadRes.json();
      if (result.secure_url) {
        setImageUrls((prev) => [...prev, result.secure_url]);
      }
    } catch {
      setError("Lỗi tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const productData = {
      name,
      slug,
      category_id: categoryId || null,
      short_description: shortDesc,
      description: desc,
      is_active: isActive,
      sort_order: sortOrder,
    };

    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, {
            product: productData,
            variants,
            imageUrls,
          })
        : await createProduct({
            product: productData,
            variants,
            imageUrls,
          });

      if (result.error) {
        setError(
          typeof result.error === "string" ? result.error : "Có lỗi xảy ra.",
        );
      } else {
        router.push("/admin/products");
      }
    });
  };

  const handleDelete = () => {
    if (!product) return;
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này không?")) return;
    startTransition(async () => {
      await deleteProduct(product.id);
      router.push("/admin/products");
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-surface-container rounded-full transition-all text-on-surface-variant"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-extrabold font-headline text-on-surface">
            {product ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h2>
          {product && (
            <p className="text-on-surface-variant text-sm mt-0.5">
              /{product.slug}
            </p>
          )}
        </div>
        {product && (
          <button
            onClick={handleDelete}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full text-error hover:bg-error/10 transition-all text-sm font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            Xóa sản phẩm
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-error/10 text-error text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(43,48,45,0.06)] space-y-5">
          <h3 className="font-headline font-bold text-lg">Thông tin cơ bản</h3>

          <div>
            <label className="block text-sm font-semibold text-on-surface-variant mb-2">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!product) setSlug(slugify(e.target.value));
              }}
              className="w-full px-4 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="VD: Nước ép cam tươi"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border-none rounded-full text-sm font-mono outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                Danh mục
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">— Không có —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface-variant mb-2">
              Mô tả ngắn
            </label>
            <textarea
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-surface-container-low border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Một dòng mô tả ngắn gọn về sản phẩm..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface-variant mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-surface-container-low border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Mô tả đầy đủ về sản phẩm..."
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
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full px-4 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                Trạng thái
              </label>
              <select
                value={String(isActive)}
                onChange={(e) => setIsActive(e.target.value === "true")}
                className="w-full px-4 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="true">Hiển thị</option>
                <option value="false">Ẩn</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(43,48,45,0.06)] space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-lg">
              Phân loại (Variants)
            </h3>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-1 text-sm text-primary font-semibold hover:underline"
            >
              <Plus className="w-4 h-4" />
              Thêm
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  type="text"
                  required
                  value={v.name}
                  onChange={(e) => updateVariant(i, "name", e.target.value)}
                  placeholder="Tên (VD: Nhỏ, Lớn, 500ml)"
                  className="flex-1 px-4 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="number"
                  required
                  min={0}
                  value={v.price}
                  onChange={(e) =>
                    updateVariant(i, "price", Number(e.target.value))
                  }
                  placeholder="Giá (VNĐ)"
                  className="w-36 px-4 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
                <select
                  value={String(v.is_active)}
                  onChange={(e) =>
                    updateVariant(i, "is_active", e.target.value === "true")
                  }
                  className="px-3 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="true">Bật</option>
                  <option value="false">Tắt</option>
                </select>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="p-2 text-error hover:bg-error/10 rounded-full transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(43,48,45,0.06)] space-y-5">
          <h3 className="font-headline font-bold text-lg">Hình ảnh</h3>

          <div className="flex flex-wrap gap-3">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative group w-24 h-24">
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() =>
                    setImageUrls((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-outline-variant/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
              {uploading ? (
                <Loader2 className="w-6 h-6 text-outline-variant animate-spin" />
              ) : (
                <ImagePlus className="w-6 h-6 text-outline-variant" />
              )}
              <span className="text-xs text-on-surface-variant mt-1">
                {uploading ? "..." : "Tải lên"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                }}
              />
            </label>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Hoặc nhập URL ảnh trực tiếp..."
              className="flex-1 px-4 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="button"
              onClick={() => {
                if (newImageUrl.trim()) {
                  setImageUrls((prev) => [...prev, newImageUrl.trim()]);
                  setNewImageUrl("");
                }
              }}
              className="px-5 py-3 bg-surface-container-high rounded-full text-sm font-semibold hover:bg-surface-container-highest transition-all"
            >
              Thêm
            </button>
          </div>
        </div>

        <div className="flex gap-4 pb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3.5 bg-surface-container border border-outline-variant/20 text-on-surface-variant font-semibold rounded-full hover:bg-surface-container-high transition-all"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-3.5 bg-primary text-on-primary font-bold rounded-full shadow-lg shadow-primary/20 hover:brightness-105 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {product ? "Cập nhật" : "Tạo sản phẩm"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
