"use client";

import Link from "next/link";
import { formatVND } from "@/lib/formatters";
import { Plus } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

type ProductCardProps = {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl?: string;
  isMix?: boolean;
  isPremium?: boolean;
  discountPercentage?: number;
};

export function ProductCard({
  id,
  name,
  slug,
  price,
  imageUrl,
  isMix,
  isPremium,
  discountPercentage,
}: ProductCardProps) {
  const { addItem } = useCartStore();

  const displayImage =
    imageUrl ||
    "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(
      {
        productId: id,
        productName: name,
        productSlug: slug,
        imageUrl: displayImage,
        variantId: "default",
        variantName: "Mặc định",
        variantPrice: price,
        options: [],
      },
      1,
    );
  };

  return (
    <Link
      href={`/products/${slug}`}
      className="group bg-surface-container-lowest rounded-lg p-3 transition-all duration-300 hover:shadow-md border border-outline-variant/10 block relative"
    >
      <div className="aspect-square rounded-lg overflow-hidden bg-surface-container-low mb-3 relative">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Badges fake =)) */}
        {discountPercentage && discountPercentage > 0 && (
          <span className="absolute top-2 left-2 bg-error text-on-error text-[10px] px-2 py-0.5 rounded-full font-bold">
            -{discountPercentage}%
          </span>
        )}
        {isMix && !discountPercentage && (
          <span className="absolute top-2 left-2 bg-secondary text-white text-[10px] px-2 py-0.5 rounded-full font-bold z-10">
            Mix
          </span>
        )}
        {isPremium && !discountPercentage && !isMix && (
          <span className="absolute top-2 left-2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold z-10">
            Premium
          </span>
        )}
      </div>

      <h3 className="font-bold text-sm text-on-surface line-clamp-1 mb-1 font-body">
        {name}
      </h3>

      <div className="flex items-center justify-between mt-2">
        <span className="text-primary font-bold text-sm tracking-tight">
          {formatVND(price)}
        </span>
        <button
          onClick={handleAddToCart}
          className="bg-primary-container text-on-primary-container p-1.5 rounded-full hover:bg-primary hover:text-white transition-colors z-20 relative"
          aria-label="Add to cart"
        >
          <Plus strokeWidth={2.5} className="w-4 h-4" />
        </button>
      </div>
    </Link>
  );
}
