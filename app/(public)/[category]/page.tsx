import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/public/ProductCard";
import { notFound } from "next/navigation";

export const revalidate = 60;

type Props = {
  params: Promise<{ category: string }>;
};

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: categoryData } = (await supabase
    .from("categories")
    .select("id, name")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()) as { data: any; error: any };

  if (!categoryData) {
    notFound();
  }

  const { data: products } = (await supabase
    .from("products")
    .select(
      `
      id, name, slug, short_description,
      product_images(url, sort_order),
      product_variants(price, is_active)
    `,
    )
    .eq("category_id", categoryData.id)
    .eq("is_active", true)
    .order("sort_order")) as { data: any[]; error: any };

  return (
    <div className="px-6 lg:px-12 py-16 max-w-[1400px] mx-auto min-h-[60vh]">
      <div className="mb-12 border-b border-outline-variant/20 pb-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-on-background tracking-tighter font-headline">
          {categoryData.name}
        </h1>
        <p className="mt-4 text-on-surface-variant font-body text-lg">
          Khám phá {products?.length || 0} sản phẩm thơm ngon. 100% nguyên bản từ thiên nhiên.
        </p>
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {products.map((p) => {
            const activeVariants =
              p.product_variants?.filter((v: any) => v.is_active) || [];
            const basePrice =
              activeVariants.length > 0
                ? Math.min(...activeVariants.map((v: any) => v.price))
                : 0;

            const images = p.product_images || [];
            images.sort((a: any, b: any) => a.sort_order - b.sort_order);
            const thumbnailUrl = images[0]?.url;

            return (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                price={basePrice}
                imageUrl={thumbnailUrl}
              />
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center">
          <p className="text-on-surface-variant font-body">
            Chưa có sản phẩm nào trong danh mục này.
          </p>
        </div>
      )}
    </div>
  );
}
