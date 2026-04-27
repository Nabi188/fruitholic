import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ShopClient } from "@/components/public/ShopClient";

export const revalidate = 0;

export const metadata = {
  title: "Tất cả sản phẩm | Fruitholic",
  description:
    "Khám phá toàn bộ bộ sưu tập trái cây tươi ngon và nước ép hữu cơ từ Fruitholic.",
};

export default async function ShopPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: rawCategories }, { data: rawProducts }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select(
        `
        id, name, slug, category_id, is_active, sort_order,
        product_images(url, sort_order),
        product_variants(price, is_active),
        product_option_groups(option_groups(min_select))
      `,
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  const categories = (rawCategories || []) as {
    id: string;
    name: string;
    slug: string;
  }[];

  const products = (rawProducts || []).map((p: any) => {
    const activeVariants =
      p.product_variants?.filter((v: any) => v.is_active) || [];

    const prices = activeVariants
      .map((v: any) => parseFloat(String(v.price)))
      .filter((val: number) => !isNaN(val) && val > 0);

    const basePrice = prices.length > 0 ? Math.min(...prices) : 0;

    const images = [...(p.product_images || [])];
    images.sort((a: any, b: any) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
    const thumbnailUrl = images[0]?.url;

    const hasRequiredOptions = (p.product_option_groups || []).some(
      (pog: any) => pog.option_groups?.min_select > 0,
    );

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      categoryId: p.category_id,
      price: basePrice,
      imageUrl: thumbnailUrl,
      hasRequiredOptions,
      isActive: p.is_active,
      hasActiveVariants: activeVariants.length > 0,
    };
  });

  return <ShopClient categories={categories} products={products} />;
}
