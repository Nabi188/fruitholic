import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OptionGroupManager } from "@/components/admin/OptionGroupManager";


export const metadata = {
  title: "Option Groups | Fruitholic Admin",
};

export default async function OptionGroupsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: groups } = (await (supabase as any)
    .from("option_groups")
    .select(
      `
      id, name, min_select, max_select,
      option_values(id, name, price, sort_order, is_active),
      product_option_groups(product_id, products(id, name))
    `,
    )
    .order("name")) as { data: any[] };

  const normalized = (groups ?? []).map((g: any) => ({
    ...g,
    option_values: g.option_values ?? [],
    linked_products: (g.product_option_groups ?? [])
      .map((pog: any) => pog.products)
      .filter(Boolean) as { id: string; name: string }[],
    product_count: (g.product_option_groups ?? []).length,
  }));

  return (
    <div className="container mx-auto">
      <OptionGroupManager groups={normalized} />
    </div>
  );
}
