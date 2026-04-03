import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = {
  title: "Thêm sản phẩm | Fruitholic Admin",
};

export default async function NewProductPage() {
  const supabase = await createSupabaseServerClient();
  const { data: categories } = (await (supabase as any)
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order")) as { data: any[] };

  return <ProductForm categories={categories ?? []} />;
}
