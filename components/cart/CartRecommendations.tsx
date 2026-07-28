"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaPlus, FaCheck, FaStar } from "react-icons/fa6";
import { useCart } from "@/features/cart/CartContext";
import { getApiBaseUrl } from "@/features/auth/utils";
import { getFirebaseAuth } from "@/lib/firebase";
import type { FeaturedProduct } from "@/lib/products";

const ACCESSORIES = [
  {
    id: "acc-socks-01",
    name: "Premium Anti-Slip Athletic Socks",
    price: "150.000đ",
    oldPrice: "195.000đ",
    discount: "-23%",
    image: "https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=600&q=80",
    colors: ["White", "Black", "Grey"],
    sizes: ["M (36-40)", "L (41-45)"],
    rating: 4.9,
    sold: 432,
    brand: "Accessories"
  },
  {
    id: "acc-sole-02",
    name: "3D Active Gel Silicone Insoles",
    price: "250.000đ",
    oldPrice: "320.000đ",
    discount: "-21%",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80",
    colors: ["Blue"],
    sizes: ["S (35-39)", "L (40-45)"],
    rating: 4.8,
    sold: 219,
    brand: "Accessories"
  },
  {
    id: "acc-lace-03",
    name: "Smart Dial Lock Reflective Shoelaces",
    price: "75.000đ",
    oldPrice: "110.000đ",
    discount: "-31%",
    image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=80",
    colors: ["Reflective Black", "Reflective White", "Neon Yellow"],
    sizes: ["Standard"],
    rating: 4.7,
    sold: 654,
    brand: "Accessories"
  },
  {
    id: "acc-spray-04",
    name: "Silver Nano Shoe Deodorant Spray",
    price: "120.000đ",
    oldPrice: "160.000đ",
    discount: "-25%",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    colors: ["Standard Silver"],
    sizes: ["150ml Bottle"],
    rating: 4.9,
    sold: 812,
    brand: "Accessories"
  }
];

export default function CartRecommendations() {
  const { items, addItem } = useCart();
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [shoeRecommendations, setShoeRecommendations] = useState<FeaturedProduct[]>([]);
  const [loadingShoes, setLoadingShoes] = useState(true);

  const cartProductIds = items.map((item) => item.productId);
  const filteredAccessories = ACCESSORIES.filter((acc) => !cartProductIds.includes(acc.id));

  useEffect(() => {
    if (items.length === 0) return;

    let active = true;
    const fetchShoeRecs = async () => {
      try {
        setLoadingShoes(true);
        const auth = getFirebaseAuth();
        const userId = auth?.currentUser?.uid ?? "";

        const queryParams = new URLSearchParams();
        if (userId) queryParams.set("userId", userId);
        
        // Exclude shoe products that are already in the cart
        const shoeCartIds = cartProductIds.filter(id => !id.startsWith("acc-"));
        if (shoeCartIds.length > 0) {
          queryParams.set("recentIds", shoeCartIds.slice(0, 5).join(","));
          queryParams.set("excludeId", shoeCartIds.join(","));
        }
        queryParams.set("limit", "4");

        const res = await fetch(`${getApiBaseUrl()}/products/recommendations?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          // Filter out accessories from the backend response (if any)
          const filteredShoes = data.filter((p: FeaturedProduct) => !p.id.startsWith("acc-"));
          if (active) {
            setShoeRecommendations(filteredShoes);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải gợi ý giày ở giỏ hàng:", err);
      } finally {
        if (active) {
          setLoadingShoes(false);
        }
      }
    };

    void fetchShoeRecs();

    return () => {
      active = false;
    };
  }, [items.length]);

  if (items.length === 0) {
    return null;
  }

  const handleAddAccessory = (acc: typeof ACCESSORIES[number]) => {
    addItem({
      productId: acc.id,
      name: acc.name,
      brand: acc.brand,
      price: acc.price,
      oldPrice: acc.oldPrice,
      image: acc.image,
      size: acc.sizes[0],
      color: acc.colors[0],
      quantity: 1
    });

    setAddedItems((prev) => ({ ...prev, [acc.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [acc.id]: false }));
    }, 2000);
  };

  return (
    <div className="space-y-8 mt-8">
      {/* 1. Shoe Recommendations */}
      {!loadingShoes && shoeRecommendations.length > 0 && (
        <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-xl shadow-slate-200/60">
          <h3 className="text-lg font-bold text-slate-950">Giày gợi ý dành riêng cho bạn</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">Những đôi giày hấp dẫn có thể bạn sẽ thích.</p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {shoeRecommendations.map((shoe) => {
              const imgUrl = shoe.imageUrls[0] ?? null;
              return (
                <Link
                  key={shoe.id}
                  href={`/products/${shoe.id}`}
                  className="group overflow-hidden rounded-2xl bg-white p-3 border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[1.25] overflow-hidden rounded-xl bg-gradient-to-br from-[#f7f9ff] to-[#dbe7ff]">
                      {imgUrl ? (
                        <img
                          alt={shoe.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          src={imgUrl}
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-3xl">👟</div>
                      )}
                      {shoe.discount && (
                        <div className="absolute left-2.5 top-2.5 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                          {shoe.discount}
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <div className="mb-0.5 flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        <span className="text-[#0d3a6b]">{shoe.brand}</span>
                        <span>{shoe.category}</span>
                      </div>
                      <h4 className="line-clamp-2 text-xs font-bold text-slate-950 leading-snug h-8">
                        {shoe.name}
                      </h4>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-50 pt-2.5">
                    <div>
                      <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        <FaStar className="text-amber-400 text-[10px]" />
                        <span className="text-slate-900">{shoe.rating.toFixed(1)}</span>
                      </p>
                      <p className="text-sm font-black text-rose-600 leading-none mt-1">{shoe.price}</p>
                    </div>
                    <span className="flex h-7 px-2.5 items-center justify-center rounded-full bg-slate-100 text-[#0d3a6b] text-[10px] font-bold transition-all duration-200 group-hover:bg-[#0d3a6b]/5">
                      Chi tiết
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Accessories Recommendations */}
      {filteredAccessories.length > 0 && (
        <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-xl shadow-slate-200/60">
          <h3 className="text-lg font-bold text-slate-950">Gợi ý phụ kiện mua kèm</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">Những phụ kiện hữu ích giúp bảo vệ và chăm sóc đôi giày của bạn tốt hơn.</p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredAccessories.map((acc) => {
              const isAdded = addedItems[acc.id];
              return (
                <div
                  key={acc.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 transition-all duration-300 hover:shadow-md"
                >
                  <div>
                    <div className="relative aspect-[1.25] overflow-hidden rounded-xl bg-slate-50">
                      <img
                        src={acc.image}
                        alt={acc.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {acc.discount && (
                        <span className="absolute left-2.5 top-2.5 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                          {acc.discount}
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <h4 className="line-clamp-2 text-xs font-bold text-slate-950 leading-snug h-8">
                        {acc.name}
                      </h4>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                        <FaStar className="text-amber-400 shrink-0" />
                        <span className="text-slate-900">{acc.rating}</span>
                        <span>·</span>
                        <span>Đã bán {acc.sold}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-50 pt-3">
                    <div>
                      <p className="text-sm font-black text-rose-600 leading-none">{acc.price}</p>
                      <p className="text-[10px] text-slate-400 line-through mt-1 leading-none">
                        {acc.oldPrice}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddAccessory(acc)}
                      disabled={isAdded}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                        isAdded
                          ? "bg-emerald-500 text-white"
                          : "bg-[#0d3a6b] text-white hover:bg-[#0a2747] active:scale-90"
                      }`}
                      aria-label="Add to cart"
                    >
                      {isAdded ? <FaCheck className="text-xs" /> : <FaPlus className="text-xs" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
