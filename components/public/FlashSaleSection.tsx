import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/public/ProductCard";
import type { ProductListItem } from "@/lib/data/products";

type Props = {
  products: ProductListItem[];
};

export function FlashSaleSection({ products }: Props) {
  return (
    <section>
      <div className="flex justify-between items-end mb-6 border-b border-outline-variant/20 pb-4">
        <h2 className="font-headline text-3xl font-bold text-on-surface flex items-center gap-2 tracking-tight">
          <Zap
            className="w-8 h-8 text-error fill-error"
            strokeWidth={2}
          />
          Flash Sale Hôm Nay
        </h2>
        <Link
          href="/flash-sale"
          className="text-primary font-bold hidden sm:inline-flex items-center gap-1 hover:underline"
        >
          Xem tất cả ưu đãi <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {products.slice(0, 8).map((p, i) => (
          <ProductCard
            key={`flash-${p.id}`}
            id={p.id}
            name={p.name}
            slug={p.slug}
            price={p.price}
            imageUrl={p.imageUrl}
            hasRequiredOptions={p.hasRequiredOptions}
            discountPercentage={i === 0 ? 30 : i === 1 ? 15 : undefined}
          />
        ))}
      </div>
    </section>
  );
}
