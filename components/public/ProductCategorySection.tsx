import Link from "next/link";
import { ProductCard } from "@/components/public/ProductCard";
import type { ProductListItem } from "@/lib/data/products";

type Props = {
  category: { id: string; name: string; slug: string };
  items: ProductListItem[];
};

export function ProductCategorySection({ category, items }: Props) {
  return (
    <section>
      <div className="flex justify-between items-end mb-6 border-b border-outline-variant/20 pb-4">
        <h2 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
          {category.name}
        </h2>
        <Link
          href={`/category/${category.slug}`}
          className="text-primary font-bold text-sm hover:underline"
        >
          Xem tất cả
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.slice(0, 6).map((p) => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            slug={p.slug}
            price={p.price}
            imageUrl={p.imageUrl}
            hasRequiredOptions={p.hasRequiredOptions}
            isMix={category.name.toLowerCase().includes("mix")}
            isPremium={false}
          />
        ))}
      </div>
    </section>
  );
}
