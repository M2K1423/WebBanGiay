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
    stock: number;
  };
  sizes: string[];
};

export default function AddToCart({ product, sizes }: AddToCartProps) {
  const isOutOfStock = (product.stock ?? 0) <= 0;
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0] : ""
  );
  const [error, setError] = useState<string>(
    isOutOfStock ? "Sản phẩm này hiện đang hết hàng" : ""
  );
  
  const { addItem } = useCart();
  const router = useRouter();

  const handleAdd = () => {
    if (!selectedSize) {
      setError("Please select a size");
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
      setError("Please select a size");
      return;
    }
    handleAdd();
    router.push("/cart");
  };

  return (
    <div>
      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Chọn Size <span className="text-rose-500">*</span>
          </h3>
          <button className="text-xs font-bold text-[#0d3a6b] hover:underline" disabled={isOutOfStock}>Hướng dẫn chọn size</button>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {sizes.map(size => (
            <button 
              key={size}
              type="button"
              disabled={isOutOfStock}
              onClick={() => {
                setSelectedSize(size);
                setError("");
              }}
              className={`flex h-10 items-center justify-center rounded-lg border text-sm font-bold transition-all focus:outline-none ${
                selectedSize === size
                  ? "border-[#0d3a6b] bg-[#0d3a6b] text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-[#0d3a6b] hover:text-[#0d3a6b]"
              } disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-400 disabled:cursor-not-allowed`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {product.colors && product.colors.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Màu sắc</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.colors.map(color => (
              <button 
                key={color} 
                type="button"
                disabled={isOutOfStock}
                onClick={() => setSelectedColor(color)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedColor === color
                    ? "border-[#0d3a6b] bg-[#0d3a6b]/5 text-[#0d3a6b]"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                } disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-400 disabled:cursor-not-allowed`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {isOutOfStock ? (
        <div className="mt-4 rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 border border-rose-100 shadow-sm animate-pulse">
          🚫 Sản phẩm này hiện đang hết hàng. Vui lòng quay lại sau!
        </div>
      ) : error ? (
        <div className="mt-3 text-xs font-bold text-rose-500">⚠️ {error}</div>
      ) : null}

      <div className="mt-5 flex gap-3">
        <button 
          onClick={handleAdd}
          disabled={isOutOfStock}
          className="flex-1 rounded-xl bg-[#0d3a6b] px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-[#0d3a6b]/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Thêm vào giỏ hàng
        </button>
        <button 
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className="flex-1 rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Mua ngay
        </button>
      </div>
    </div>
  );
}
