import type { Metadata } from "next";
import Link from "next/link";
import { FaChevronRight, FaStar, FaFilter } from "react-icons/fa6";
import { getAllProducts, getProductImage } from "@/lib/products";

const PRODUCTS_PER_PAGE = 9;

export const metadata: Metadata = {
  title: "Tất cả sản phẩm | myshoes.vn",
  description: "Khám phá bộ sưu tập giày Nike, Adidas, Puma chính hãng tại myshoes.vn"
};

const BRANDS = ["Nike", "Adidas", "Puma", "Salomon", "Under Armour", "New Balance", "Vans", "Reebok", "Asics"];
const CATEGORIES = ["Running", "Lifestyle", "Court", "Trail", "Training", "Casual"];

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<{ brand?: string; category?: string; sort?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const { brand, category, sort, q, page } = params;

  let products = await getAllProducts();

  // Filter
  if (brand) products = products.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  if (category) products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  if (q) {
    const query = q.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  }

  // Sort
  if (sort === "price-asc") {
    products = [...products].sort((a, b) => {
      const priceA = parseInt(a.price.replace(/\D/g, ""));
      const priceB = parseInt(b.price.replace(/\D/g, ""));
      return priceA - priceB;
    });
  } else if (sort === "price-desc") {
    products = [...products].sort((a, b) => {
      const priceA = parseInt(a.price.replace(/\D/g, ""));
      const priceB = parseInt(b.price.replace(/\D/g, ""));
      return priceB - priceA;
    });
  } else if (sort === "rating") {
    products = [...products].sort((a, b) => b.rating - a.rating);
  } else if (sort === "sold") {
    products = [...products].sort((a, b) => b.sold - a.sold);
  }

  const currentPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PRODUCTS_PER_PAGE;
  const visibleProducts = products.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  const startItem = products.length === 0 ? 0 : startIndex + 1;
  const endItem = Math.min(startIndex + PRODUCTS_PER_PAGE, products.length);

  const buildUrl = (key: string, value: string) => {
    const p = new URLSearchParams();
    if (brand && key !== "brand") p.set("brand", brand);
    if (category && key !== "category") p.set("category", category);
    if (sort && key !== "sort") p.set("sort", sort);
    if (q && key !== "q") p.set("q", q);
    if (value) p.set(key, value);
    return `/products?${p.toString()}`;
  };

  const buildPageUrl = (pageNumber: number) => {
    const p = new URLSearchParams();
    if (brand) p.set("brand", brand);
    if (category) p.set("category", category);
    if (sort) p.set("sort", sort);
    if (q) p.set("q", q);
    if (pageNumber > 1) p.set("page", String(pageNumber));
    return `/products${p.toString() ? `?${p.toString()}` : ""}`;
  };

  const clearFilter = () => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    return `/products?${p.toString()}`;
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-[#0d3a6b] transition-colors">Trang chủ</Link>
          <FaChevronRight className="text-xs" />
          <span className="text-slate-900 font-medium">Sản phẩm</span>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar Filter */}
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Active filters */}
              {(brand || category) && (
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-slate-900">Bộ lọc đang dùng</p>
                    <Link href={clearFilter()} className="text-xs text-rose-500 hover:underline">Xóa tất cả</Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {brand && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#0d3a6b]/10 px-3 py-1 text-xs font-semibold text-[#0d3a6b]">
                        {brand}
                        <Link href={buildUrl("brand", "")} className="ml-1 hover:text-rose-500">×</Link>
                      </span>
                    )}
                    {category && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#0d3a6b]/10 px-3 py-1 text-xs font-semibold text-[#0d3a6b]">
                        {category}
                        <Link href={buildUrl("category", "")} className="ml-1 hover:text-rose-500">×</Link>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Brand filter */}
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="mb-3 text-sm font-semibold text-slate-900">Thương hiệu</p>
                <div className="space-y-2">
                  {BRANDS.map((b) => (
                    <Link
                      key={b}
                      href={buildUrl("brand", brand === b ? "" : b)}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                        brand === b
                          ? "bg-[#0d3a6b] !text-white font-semibold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {b}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Category filter */}
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="mb-3 text-sm font-semibold text-slate-900">Danh mục</p>
                <div className="space-y-2">
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c}
                      href={buildUrl("category", category === c ? "" : c)}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                        category === c
                          ? "bg-[#0d3a6b] !text-white font-semibold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* Header row */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  {brand ? `Giày ${brand}` : category ? `Giày ${category}` : q ? `Kết quả: "${q}"` : "Tất cả sản phẩm"}
                </h1>
                <p className="text-sm text-slate-500 mt-1">{products.length} sản phẩm</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Mobile filter button */}
                <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm lg:hidden">
                  <FaFilter className="text-xs" />
                  Lọc
                </button>
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 hidden sm:block">Sắp xếp:</span>
                  <div className="flex gap-1">
                    {[
                      { label: "Mới nhất", value: "" },
                      { label: "Giá ↑", value: "price-asc" },
                      { label: "Giá ↓", value: "price-desc" },
                      { label: "Đánh giá", value: "rating" },
                      { label: "Bán chạy", value: "sold" },
                    ].map((s) => (
                      <Link
                        key={s.value}
                        href={buildUrl("sort", s.value)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          (sort ?? "") === s.value
                            ? "bg-[#0d3a6b] !text-white"
                            : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                        }`}
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Product grid */}
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-24 text-center shadow-sm">
                <div className="text-6xl mb-4">👟</div>
                <h2 className="text-xl font-semibold text-slate-900">Không tìm thấy sản phẩm</h2>
                <p className="mt-2 text-slate-500">Thử bỏ bộ lọc hoặc tìm kiếm với từ khóa khác.</p>
                <Link href="/products" className="mt-6 rounded-full bg-[#0d3a6b] px-6 py-2 text-sm font-semibold text-white">
                  Xem tất cả sản phẩm
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visibleProducts.map((product) => {
                  const img = getProductImage(product);
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                    >
                      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#f7f9ff] to-[#dbe7ff]">
                        {img ? (
                          <img
                            src={img}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-4xl">👟</div>
                        )}
                        <span className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">
                          {product.discount}
                        </span>
                        {product.productType === "Flash Sale" && (
                          <span className="absolute right-4 top-4 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-[#1b1202]">
                            Flash Sale
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                          <span className="font-medium text-[#0d3a6b]">{product.brand}</span>
                          <span>{product.category}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
                          {product.name}
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{product.description}</p>
                        <div className="mt-3 flex items-end justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-base font-semibold text-[#0d3a6b]">{product.price}</span>
                              <span className="text-xs text-slate-400 line-through">{product.oldPrice}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                              <FaStar className="text-amber-400" />
                              {product.rating.toFixed(1)} · {product.sold} đã bán
                            </div>
                          </div>
                          <span className="rounded-full bg-[#0d3a6b] px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                            Xem
                          </span>
                        </div>
                        {product.promotion && (
                          <p className="mt-2 text-xs font-medium text-emerald-600">{product.promotion}</p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {products.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <Link
                    href={buildPageUrl(safePage - 1)}
                    aria-disabled={safePage === 1}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                      safePage === 1
                        ? "pointer-events-none border-slate-200 bg-slate-50 text-slate-300"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    &lsaquo;
                  </Link>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <Link
                      key={pageNumber}
                      href={buildPageUrl(pageNumber)}
                      className={`min-w-10 rounded-xl px-3 py-2 text-sm font-semibold text-center transition-colors ${
                        pageNumber === safePage
                          ? "bg-[#0d3a6b] text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {pageNumber}
                    </Link>
                  ))}
                  <Link
                    href={buildPageUrl(safePage + 1)}
                    aria-disabled={safePage === totalPages}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                      safePage === totalPages
                        ? "pointer-events-none border-slate-200 bg-slate-50 text-slate-300"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    &rsaquo;
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
