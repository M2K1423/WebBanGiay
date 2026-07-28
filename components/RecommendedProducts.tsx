"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaChevronRight, FaStar } from "react-icons/fa6";
import { getApiBaseUrl } from "@/features/auth/utils";
import { getFirebaseAuth } from "@/lib/firebase";
import type { FeaturedProduct } from "@/lib/products";

export default function RecommendedProducts() {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchRecommendations = async () => {
      try {
        const auth = getFirebaseAuth();
        const userId = auth?.currentUser?.uid ?? "";

        // Read recently viewed product IDs
        let recentIds: string[] = [];
        if (typeof window !== "undefined") {
          try {
            const viewedStr = localStorage.getItem("myshoes_viewed_products");
            recentIds = viewedStr ? JSON.parse(viewedStr) : [];
          } catch (e) {
            console.error(e);
          }
        }

        const queryParams = new URLSearchParams();
        if (userId) queryParams.set("userId", userId);
        if (recentIds.length > 0) queryParams.set("recentIds", recentIds.slice(0, 5).join(","));
        queryParams.set("limit", "4");

        const res = await fetch(`${getApiBaseUrl()}/products/recommendations?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setProducts(data);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải gợi ý sản phẩm:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    // Listen for auth state changes to fetch personalized products
    const auth = getFirebaseAuth();
    let unsubscribe = () => {};
    if (auth) {
      unsubscribe = auth.onAuthStateChanged(() => {
        void fetchRecommendations();
      });
    } else {
      void fetchRecommendations();
    }

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-10 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-72 w-full animate-pulse rounded-3xl bg-white shadow-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 3c.13 0 .26.05.35.15.77 2.45 2.7 4.38 5.15 5.15.2.06.35.25.35.47 0 .22-.15.41-.35.47-2.45.77-4.38 2.7-5.15 5.15-.09.2-.28.35-.5.35-.22 0-.41-.15-.47-.35-.77-2.45-2.7-4.38-5.15-5.15-.2-.06-.35-.25-.35-.47 0-.22.15-.41.35-.47 2.45-.77 4.38-2.7 5.15-5.15.06-.2.25-.35.47-.35.02 0 .04 0 .06.01zm-5.5 12c.08 0 .15.03.2.09.43 1.37 1.5 2.44 2.87 2.87.11.03.2.14.2.26 0 .12-.09.23-.2.26-1.37.43-2.44 1.5-2.87 2.87-.03.11-.14.2-.26.2-.12 0-.23-.09-.26-.2-.43-1.37-1.5-2.44-2.87-2.87-.11-.03-.2-.14-.2-.26 0-.12.09-.23.2-.26 1.37-.43 2.44-1.5 2.87-2.87.03-.11.14-.2.26-.2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Gợi ý dành riêng cho bạn</h2>
        </div>
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d3a6b] hover:underline" href="/products">
          Xem tất cả sản phẩm
          <FaChevronRight className="text-xs" />
        </Link>
      </div>

      <div className="mt-6 grid gap-6 grid-cols-2 md:grid-cols-4">
        {products.map((item) => {
          const imgUrl = item.imageUrls[0] ?? null;
          return (
            <Link
              key={item.id}
              href={`/products/${item.id}`}
              className="group overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-slate-100 flex flex-col justify-between"
            >
              <div>
                <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-[#f7f9ff] to-[#dbe7ff]">
                  {imgUrl ? (
                    <img
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      src={imgUrl}
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-4xl">👟</div>
                  )}
                  {item.discount && (
                    <div className="absolute left-4 top-4 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white">
                      {item.discount}
                    </div>
                  )}
                </div>
                <div className="p-4 pb-1">
                  <div className="mb-1 flex items-center justify-between gap-3 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    <span className="text-[#0d3a6b]">{item.brand}</span>
                    <span>{item.category}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug h-10">{item.name}</h3>
                </div>
              </div>
              <div className="p-4 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-2">
                  <FaStar className="text-amber-400 text-xs shrink-0" />
                  <span className="font-bold text-slate-900">{item.rating.toFixed(1)}</span>
                  <span>({item.reviewCount})</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-semibold text-rose-600">{item.price}</span>
                  {item.oldPrice && (
                    <span className="text-xs text-slate-400 line-through">{item.oldPrice}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
