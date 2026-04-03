import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatVND } from "@/lib/formatters";
import { Plus, Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sản phẩm | Fruitholic Admin",
};

export default async function ProductsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: products } = (await (supabase as any)
    .from("products")
    .select(`
      id, name, slug, is_active, sort_order, created_at,
      categories(name),
      product_images(url, sort_order),
      product_variants(price, is_active)
    `)
    .order("sort_order")) as { data: any[] };

  const allProducts = products ?? [];

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">
            Sản phẩm
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs font-medium text-primary bg-primary-container px-3 py-1 rounded-full">
              Tổng: {allProducts.length} sản phẩm
            </span>
          </div>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-primary text-on-primary font-headline font-bold px-6 py-3 rounded-full flex items-center gap-2 transition-all shadow-lg shadow-primary/20 hover:brightness-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Thêm sản phẩm
        </Link>
      </div>

      <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0px_20px_40px_rgba(43,48,45,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/10">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Ảnh
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Tên sản phẩm
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Danh mục
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Giá từ
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
              {allProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-on-surface-variant">
                    Chưa có sản phẩm nào.{" "}
                    <Link href="/admin/products/new" className="text-primary font-semibold underline">
                      Thêm ngay
                    </Link>
                  </td>
                </tr>
              )}
              {allProducts.map((product: any) => {
                const thumb = product.product_images?.sort(
                  (a: any, b: any) => a.sort_order - b.sort_order,
                )?.[0]?.url;
                const minPrice = product.product_variants
                  ?.filter((v: any) => v.is_active)
                  .reduce(
                    (min: number, v: any) => Math.min(min, v.price),
                    Infinity,
                  );

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-surface-container/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-container overflow-hidden">
                        {thumb && (
                          <img
                            src={thumb}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-on-surface">
                      <div>{product.name}</div>
                      <div className="text-xs font-mono text-on-surface-variant mt-0.5 opacity-60">
                        /{product.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.categories?.name ? (
                        <span className="bg-surface-variant text-on-surface-variant px-2 py-1 rounded text-xs font-medium">
                          {product.categories.name}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant opacity-40 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {minPrice && isFinite(minPrice)
                        ? formatVND(minPrice)
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`flex items-center gap-1.5 text-sm font-semibold ${
                          product.is_active ? "text-primary" : "text-outline-variant"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${product.is_active ? "bg-primary animate-pulse" : "bg-outline-variant"}`}
                        />
                        {product.is_active ? "Hiển thị" : "Ẩn"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-all"
                        >
                          <Pencil className="w-4.5 h-4.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
