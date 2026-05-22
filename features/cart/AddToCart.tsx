"use client";

import { useState } from "react";
import { useCart } from "./CartContext";
import { useRouter } from "next/navigation";

type AddToCartProps = {
  product: {
    id: string;
    name: string;
    brand: string;
    price: string;
    oldPrice: string;
    image: string | null;
    colors: string[];
  };
  sizes: string[];
};

export default function AddToCart({ product, sizes }: AddToCartProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0] : ""
  );
  const [error, setError] = useState<string>("");
  
  const { addItem } = useCart();
  const router = useRouter();

  const handleAdd = () => {
    if (!selectedSize) {
      setError("Vui lòng chọn kích cỡ");
      return;
    }
    setError("");
    
    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      oldPrice: product.oldPrice,
      image: product.image,
      size: selectedSize,
      color: selectedColor,
    });
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setError("Vui lòng chọn kích cỡ");
      return;
    }
    handleAdd();
    router.push("/cart");
  };

  return (
    <div>
      <div className="mt-8 border-t border-slate-200 pt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Chọn kích cỡ <span className="text-rose-500">*</span>
          </h3>
          <button className="text-sm text-[#0d3a6b] hover:underline">Hướng dẫn chọn size</button>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-7">
          {sizes.map(size => (
            <button 
              key={size}
              type="button"
              onClick={() => {
                setSelectedSize(size);
                setError("");
              }}
              className={`flex h-12 items-center justify-center rounded-xl border text-sm font-medium transition-all focus:outline-none ${
                selectedSize === size
                  ? "border-[#0d3a6b] bg-[#0d3a6b] text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-[#0d3a6b] hover:text-[#0d3a6b]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {product.colors && product.colors.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-slate-900">Màu sắc</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.colors.map(color => (
              <button 
                key={color} 
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  selectedColor === color
                    ? "border-[#0d3a6b] bg-[#0d3a6b]/5 text-[#0d3a6b]"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 text-sm font-medium text-rose-500">{error}</div>
      )}

      <div className="mt-8 flex gap-4">
        <button 
          onClick={handleAdd}
          className="flex-1 rounded-full bg-[#0d3a6b] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[#0d3a6b]/30 transition-transform hover:-translate-y-1 active:translate-y-0"
        >
          Thêm vào giỏ hàng
        </button>
        <button 
          onClick={handleBuyNow}
          className="flex-1 rounded-full bg-rose-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-rose-600/30 transition-transform hover:-translate-y-1 active:translate-y-0"
        >
          Mua ngay
        </button>
      </div>
    </div>
  );
}
