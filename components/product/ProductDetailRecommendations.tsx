"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaStar, FaChevronRight } from "react-icons/fa6";
import { getApiBaseUrl } from "@/features/auth/utils";
import { getFirebaseAuth } from "@/lib/firebase";
import type { FeaturedProduct } from "@/lib/products";

type ProductDetailRecommendationsProps = {
  currentProduct: FeaturedProduct;
};

export default function ProductDetailRecommendations({
  currentProduct
}: ProductDetailRecommendationsProps) {
  const [activeTab, setActiveTab] = useState<"similar" | "brand" | "recent">("similar");
  const [similarProducts, setSimilarProducts] = useState<FeaturedProduct[]>([]);
  const [brandProducts, setBrandProducts] = useState<FeaturedProduct[]>([]);
  const [recentProducts, setRecentProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchAllTabs = async () => {
      setLoading(true);
      try {
        const auth = getFirebaseAuth();
        const userId = auth?.currentUser?.uid ?? "";

        // 1. Fetch similar products (matching category/price)
        const similarRes = await fetch(
          `${getApiBaseUrl()}/products/recommendations?excludeId=${currentProduct.id}&recentIds=${currentProduct.id}&limit=4`
        );
        const similarData = similarRes.ok ? await similarRes.json() : [];

        // 2. Fetch brand products
        const brandRes = await fetch(
          `${getApiBaseUrl()}/products?brand=${encodeURIComponent(currentProduct.brand)}`
        );
        const brandData: FeaturedProduct[] = brandRes.ok ? await brandRes.json() : [];
        const filteredBrandData = brandData.filter((p) => p.id !== currentProduct.id).slice(0, 4);

        // 3. Fetch recently viewed products
        let viewedIds: string[] = [];
        if (typeof window !== "undefined") {
          try {
            const viewedStr = localStorage.getItem("myshoes_viewed_products");
            viewedIds = viewedStr ? JSON.parse(viewedStr) : [];
          } catch (e) {
            console.error(e);
          }
        }
        const filteredViewedIds = viewedIds.filter((id) => id !== currentProduct.id);

        let recentData = [];
        if (filteredViewedIds.length > 0) {
          const recentQueryParams = new URLSearchParams();
          if (userId) recentQueryParams.set("userId", userId);
          recentQueryParams.set("recentIds", filteredViewedIds.slice(0, 4).join(","));
          recentQueryParams.set("limit", "4");
          recentQueryParams.set("excludeId", currentProduct.id);

          const recentRes = await fetch(
            `${getApiBaseUrl()}/products/recommendations?${recentQueryParams.toString()}`
          );
          recentData = recentRes.ok ? await recentRes.json() : [];
        }

        if (active) {
          setSimilarProducts(similarData);
          setBrandProducts(filteredBrandData);
          setRecentProducts(recentData);
        }
      } catch (err) {
        console.error("Lỗi khi tải gợi ý chi tiết sản phẩm:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchAllTabs();

    return () => {
      active = false;
    };
  }, [currentProduct.id, currentProduct.brand]);

  // Determine which list to display
  const getActiveList = () => {
    switch (activeTab) {
      case "similar":
        return similarProducts;
      case "brand":
        return brandProducts;
      case "recent":
        return recentProducts;
      default:
        return [];
    }
  };

  const activeProducts = getActiveList();

  const tabs = [
    { id: "similar", label: "Có thể bạn thích" },
    { id: "brand", label: `Cùng thương hiệu ${currentProduct.brand}` },
    { id: "recent", label: "Đã xem gần đây", hide: recentProducts.length === 0 }
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 border-t border-slate-200 mt-12">
      <div className="flex flex-col border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900 sm:text-2xl">Gợi ý sản phẩm</h2>
        
        {/* Tab Headers */}
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
          {tabs.map((tab) => {
            if (tab.hide) return null;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#0d3a6b] text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-72 w-full animate-pulse rounded-3xl bg-white shadow-sm" />
          ))}
        </div>
      ) : activeProducts.length === 0 ? (
        <div className="mt-12 text-center text-slate-500 py-10 font-medium">
          Không có sản phẩm nào để hiển thị trong mục này.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in">
          {activeProducts.map((item) => {
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
      )}
    </div>
  );
}
