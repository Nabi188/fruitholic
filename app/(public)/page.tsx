import { getProducts, getProductsGroupedByCategory } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { CategoryNavBar } from "@/components/public/CategoryNavBar";
import { HeroBanner } from "@/components/public/HeroBanner";
import { FlashSaleSection } from "@/components/public/FlashSaleSection";
import { ProductCategorySection } from "@/components/public/ProductCategorySection";
import { NewsletterSection } from "@/components/public/NewsletterSection";

export const metadata = {
  title: "Fruitholic - Trái Cây Tươi Cắt Sẵn & Nước Ép Nguyên Chất",
  description: "Dairy Fresh",
};

export default async function HomePage() {
  const [categories, products, groupedProducts] = await Promise.all([
    getCategories(),
    getProducts(),
    getProductsGroupedByCategory(),
  ]);

  return (
    <>
      <CategoryNavBar categories={categories} />

      <main className="pt-16">
        <HeroBanner />

        <div className="space-y-16 px-2 pb-32 container mx-auto">
          <FlashSaleSection products={products} />

          {groupedProducts.map((group) => (
            <ProductCategorySection
              key={group.category.id}
              category={group.category}
              items={group.items}
            />
          ))}
        </div>

        <NewsletterSection />
      </main>
    </>
  );
}
