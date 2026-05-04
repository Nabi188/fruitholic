import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return { title: `Edit Product #${id.slice(0, 8)} | Fruitholic Admin` };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: productRaw }, { data: categories }, { data: optionGroups }] =
    await Promise.all([
      (supabase as any)
        .from("products")
        .select(
          `
          id, name, slug, is_active, sort_order, category_id,
          short_description, description,
          categories(name),
          product_images(id, url, sort_order),
          product_variants(id, name, price, is_active, sort_order),
          product_option_groups(option_group_id, sort_order)
        `,
        )
        .eq("id", id)
        .single(),
      (supabase as any)
        .from("categories")
        .select("id, name, slug, sort_order, is_active, parent_id")
        .eq("is_active", true)
        .order("sort_order"),
      (supabase as any)
        .from("option_groups")
        .select(
          "id, name, min_select, max_select, option_values(id, name, price, sort_order, is_active)",
        )
        .order("name"),
    ]);

  if (!productRaw) notFound();

  // Normalise product: extract linked group IDs from junction table
  const product = {
    ...productRaw,
    linked_option_group_ids: (productRaw.product_option_groups ?? [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((r: any) => r.option_group_id),
  };

  const normalizedOptionGroups = (optionGroups ?? []).map((g: any) => ({
    ...g,
    option_values: g.option_values ?? [],
  }));

  return (
    <ProductForm
      product={product}
      categories={categories ?? []}
      optionGroups={normalizedOptionGroups}
    />
  );
}
