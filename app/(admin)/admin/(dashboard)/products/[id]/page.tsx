import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sửa sản phẩm | Fruitholic Admin",
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    (supabase as any)
      .from("products")
      .select(`
        id, name, slug, category_id, short_description, description, is_active, sort_order,
        product_variants(name, price, is_active, sort_order),
        product_images(url, sort_order)
      `)
      .eq("id", id)
      .single(),
    (supabase as any)
      .from("categories")
      .select("id, name")
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  if (!product) notFound();

  return (
    <ProductForm
      categories={categories ?? []}
      product={{
        ...product,
        product_variants: product.product_variants?.sort(
          (a: any, b: any) => a.sort_order - b.sort_order,
        ),
        product_images: product.product_images?.sort(
          (a: any, b: any) => a.sort_order - b.sort_order,
        ),
      }}
    />
  );
}
