import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CategoryManager } from "@/components/admin/CategoryManager";


export const metadata = {
  title: "Danh mục",
};

export default async function CategoriesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: categories } = (await supabase
    .from("categories")
    .select("id, name, slug, sort_order, is_active, parent_id")
    .order("sort_order")) as { data: any[]; error: any };

  return (
    <div className="container mx-auto">
      <CategoryManager categories={categories ?? []} />
    </div>
  );
}
