import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";


export const metadata = {
  title: "New Product | Fruitholic Admin",
};

export default async function NewProductPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: categories }, { data: optionGroups }] = await Promise.all([
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

  const normalizedOptionGroups = (optionGroups ?? []).map((g: any) => ({
    ...g,
    option_values: g.option_values ?? [],
  }));

  return (
    <ProductForm
      categories={categories ?? []}
      optionGroups={normalizedOptionGroups}
    />
  );
}
