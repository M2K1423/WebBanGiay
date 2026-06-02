import type { Metadata } from "next";
import Link from "next/link";
import { FaChevronRight, FaBolt, FaStar } from "react-icons/fa6";
import { getSaleProducts, getProductImage } from "@/lib/products";

export const metadata: Metadata = {
  title: "Flash Sale - Genuine Shoes Sale | myshoes.vn",
  description: "Get hot deals on Nike and Adidas shoes. Special promotions daily at myshoes.vn"
};

export default async function SalePage({
  searchParams
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  let products = await getSaleProducts();

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
  } else if (sort === "discount") {
    // Sort by largest discount percentage
    products = [...products].sort((a, b) => {
      const discA = parseInt(a.discount.replace(/\D/g, ""));
      const discB = parseInt(b.discount.replace(/\D/g, ""));
      return discB - discA;
    });
  }

  const buildUrl = (sortValue: string) => {
    return `/sale?sort=${sortValue}`;
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      {/* Sale Banner */}
      <div className="bg-gradient-to-r from-rose-600 to-orange-500 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <FaBolt className="text-[200px]" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-xl">
              <FaBolt className="text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl tracking-tight">
                FLASH SALE
              </h1>
              <p className="text-white/90 mt-1">
                Save up to 50%. Shop now!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100 mb-8">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-rose-600 transition-colors">Home</Link>
            <FaChevronRight className="text-[10px]" />
            <span className="text-rose-600 font-semibold">Flash Sale</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Sale Products</h2>
            <p className="text-sm text-slate-500 mt-1">{products.length} {products.length === 1 ? "product" : "products"}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 hidden sm:block">Sort by:</span>
            <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-200">
              {[
                { label: "Newest", value: "" },
                { label: "Highest Discount", value: "discount" },
                { label: "Price ↑", value: "price-asc" },
                { label: "Price ↓", value: "price-desc" },
              ].map((s) => (
                <Link
                  key={s.label}
                  href={buildUrl(s.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    (sort ?? "") === s.value
                      ? "bg-rose-600 text-white"
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
            <div className="text-6xl mb-4 text-slate-300"><FaBolt /></div>
            <h2 className="text-xl font-semibold text-slate-900">No Sale Available</h2>
            <p className="mt-2 text-slate-500">Please check back later.</p>
            <Link href="/products" className="mt-6 rounded-full bg-[#0d3a6b] px-6 py-2 text-sm font-semibold text-white">
              View all products
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
                  className="group overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 border border-rose-100"
                >
                  <div className="relative h-52 overflow-hidden bg-gradient-to-br from-rose-50 to-orange-50">
                    {img ? (
                      <img
                        src={img}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">👟</div>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-rose-500/30">
                      {product.discount}
                    </span>
                    <span className="absolute bottom-4 left-4 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-[#1b1202]">
                      {product.promotion}
                    </span>
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
                          <span className="text-base font-semibold text-rose-600">{product.price}</span>
                          <span className="text-xs text-slate-400 line-through">{product.oldPrice}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <FaStar className="text-amber-400" />
                          {product.rating.toFixed(1)} · {product.sold} sold
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
