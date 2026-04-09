import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductsClient } from "@/components/admin/ProductsClient";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Products | Fruitholic Admin",
};

export default async function ProductsPage() {
  const supabase = await createSupabaseServerClient();
  const heads = await headers();
  const host = heads.get("host") ?? "localhost:3000";
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";
  const siteUrl = `${proto}://${host}`;

  const [{ data: products }, { data: categories }, { data: optionGroups }] =
    await Promise.all([
      (supabase as any)
        .from("products")
        .select(
          `
        id, name, slug, is_active, sort_order, category_id,
        short_description, description,
        categories(name),
        product_images(url, sort_order),
        product_variants(name, price, is_active, sort_order),
        product_option_groups(option_group_id, sort_order)
      `,
        )
        .order("sort_order"),
      (supabase as any)
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("sort_order"),
      (supabase as any)
        .from("option_groups")
        .select(
          "id, name, min_select, max_select, option_values(id, name, price, sort_order, is_active)",
        )
        .order("name"),
    ]);

  return (
    <div className="container mx-auto">
      <ProductsClient
        products={products ?? []}
        categories={categories ?? []}
        optionGroups={(optionGroups ?? []).map((g: any) => ({
          ...g,
          option_values: g.option_values ?? [],
        }))}
        siteUrl={siteUrl}
      />
    </div>
  );
}
