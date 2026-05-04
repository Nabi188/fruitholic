import { getCategoryBySlug } from "@/lib/data/categories";
import { getProductsByCategory } from "@/lib/data/products";
import { ProductCard } from "@/components/public/ProductCard";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { category: slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) return { title: "Không tìm thấy danh mục" };
  return {
    title: `${cat.name} | Fruitholic`,
    description: `Khám phá các sản phẩm ${cat.name} tại Fruitholic. 100% nguyên bản từ thiên nhiên.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const categoryData = await getCategoryBySlug(slug);

  if (!categoryData) {
    notFound();
  }

  const products = await getProductsByCategory(categoryData.id);

  return (
    <div className="px-6 lg:px-12 py-16 max-w-[1400px] mx-auto min-h-[60vh]">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2 text-xs text-outline uppercase tracking-widest font-headline">
        <Link href="/" className="hover:text-primary transition-colors">
          Trang chủ
        </Link>
        <ChevronRight strokeWidth={2} className="w-3 h-3 opacity-30" />
        <Link
          href="/products"
          className="hover:text-primary transition-colors"
        >
          Cửa hàng
        </Link>
        <ChevronRight strokeWidth={2} className="w-3 h-3 opacity-30" />
        <span className="text-on-background font-bold">{categoryData.name}</span>
      </div>

      <div className="mb-12 border-b border-outline-variant/20 pb-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-on-background tracking-tighter font-headline">
          {categoryData.name}
        </h1>
        <p className="mt-4 text-on-surface-variant font-body text-lg">
          Khám phá {products.length} sản phẩm thơm ngon. 100% nguyên bản
          từ thiên nhiên.
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              price={p.price}
              imageUrl={p.imageUrl}
              hasRequiredOptions={p.hasRequiredOptions}
            />
          ))}
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
