import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaChevronRight, FaStar, FaFilter } from "react-icons/fa6";
import { getProductsByBrand, getProductImage } from "@/lib/products";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brandName = slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    title: `Giày ${brandName} Chính Hãng | myshoes.vn`,
    description: `Mua giày ${brandName} chính hãng, giá tốt nhất thị trường tại myshoes.vn. Hàng chuẩn, giao nhanh, đổi trả dễ dàng.`
  };
}

export default async function BrandPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { slug } = await params;
  const { sort } = await searchParams;
  
  const brandName = slug.charAt(0).toUpperCase() + slug.slice(1);
  let products = await getProductsByBrand(brandName);

  if (!products || products.length === 0) {
    // We don't want to 404 just because a brand has no products currently
    // but maybe check if it's a valid brand first
    const validBrands = ["nike", "adidas", "puma", "salomon", "vans", "reebok", "crocs", "asics", "new-balance"];
    if (!validBrands.includes(slug.toLowerCase())) {
      notFound();
    }
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

  const buildUrl = (sortValue: string) => {
    return `/brand/${slug}?sort=${sortValue}`;
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      {/* Brand Banner */}
      <div className="bg-gradient-to-r from-[#0d3a6b] to-[#1e6ad1] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4 sm:text-5xl tracking-tight">
              {brandName} Shoes
            </h1>
            <p className="text-lg text-white/80">
              Khám phá bộ sưu tập giày {brandName} chính hãng mới nhất. Thiết kế đột phá, hiệu năng vượt trội.
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100 mb-8">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-[#0d3a6b] transition-colors">Trang chủ</Link>
            <FaChevronRight className="text-[10px]" />
            <Link href="/products" className="hover:text-[#0d3a6b] transition-colors">Thương hiệu</Link>
            <FaChevronRight className="text-[10px]" />
            <span className="text-slate-900 font-medium">{brandName}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Sản phẩm {brandName}</h2>
            <p className="text-sm text-slate-500 mt-1">{products.length} sản phẩm</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 hidden sm:block">Sắp xếp:</span>
            <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-200">
              {[
                { label: "Mới nhất", value: "" },
                { label: "Giá ↑", value: "price-asc" },
                { label: "Giá ↓", value: "price-desc" },
                { label: "Bán chạy", value: "sold" },
              ].map((s) => (
                <Link
                  key={s.label}
                  href={buildUrl(s.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    (sort ?? "") === s.value
                      ? "bg-[#0d3a6b] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-24 text-center shadow-sm">
            <div className="text-6xl mb-4">👟</div>
            <h2 className="text-xl font-semibold text-slate-900">Thương hiệu này đang trống</h2>
            <p className="mt-2 text-slate-500">Chúng tôi đang cập nhật thêm sản phẩm {brandName}.</p>
            <Link href="/products" className="mt-6 rounded-full bg-[#0d3a6b] px-6 py-2 text-sm font-semibold text-white">
              Xem các thương hiệu khác
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
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
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
