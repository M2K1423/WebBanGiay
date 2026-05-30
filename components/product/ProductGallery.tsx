"use client";

import { useState } from "react";
import type { FeaturedProduct } from "@/lib/products";

type ProductGalleryProps = {
  product: FeaturedProduct;
};

export default function ProductGallery({ product }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = product.imageUrls[selectedIndex] ?? product.imageUrls[0] ?? null;

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-[#f7f9ff] to-[#dbe7ff] shadow-sm">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt={product.name}
            className="h-full w-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">👟</div>
        )}
        {product.discount && (
          <span className="absolute left-6 top-6 rounded-full bg-rose-500 px-4 py-1.5 text-sm font-semibold text-white">
            {product.discount}
          </span>
        )}
      </div>

      {product.imageUrls.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {product.imageUrls.map((url, index) => {
            const isActive = index === selectedIndex;

            return (
              <button
                key={`${url}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`aspect-square overflow-hidden rounded-2xl bg-[#f7f9ff] border-2 transition-all ${
                  isActive
                    ? "border-[#0d3a6b] shadow-md ring-2 ring-[#0d3a6b]/20"
                    : "border-transparent hover:border-[#0d3a6b]"
                }`}
                aria-label={`Xem ảnh ${index + 1} của ${product.name}`}
                aria-pressed={isActive}
              >
                <img
                  src={url}
                  alt={`${product.name} ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}