"use client";

import { useState } from "react";
import { ProductImage } from "@/types/app";

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images?.[0]?.url);

  return (
    <div className="space-y-6">
      <div className="relative group aspect-square max-w-[440px] mx-auto rounded-3xl overflow-hidden bg-surface-container-lowest border border-outline-variant/10 shadow-sm transition-all duration-500 hover:shadow-xl">
        <img
          src={selectedImage}
          alt={productName}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
      </div>

      {images && images.length > 1 && (
        <div className="grid grid-cols-4 gap-4 max-w-[340px] mx-auto">
          {images
            .map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedImage(img.url)}
                className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 relative cursor-pointer active:scale-95 ${
                  selectedImage === img.url
                    ? "border-primary shadow-lg shadow-primary/10 ring-4 ring-primary/5"
                    : "border-outline-variant/10 hover:border-primary/40"
                }`}
              >
                <img
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              </button>
            ))
            .slice(0, 4)}
        </div>
      )}
    </div>
  );
}
