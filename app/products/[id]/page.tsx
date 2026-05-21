import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaChevronRight, FaStar, FaShieldHeart, FaArrowsRotate, FaMedal } from "react-icons/fa6";
import { getProductById, getProductImage, getProductsByCategory } from "@/lib/products";

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return { title: "Không tìm thấy sản phẩm" };
  }

  return {
    title: `${product.name} | myshoes.vn`,
    description: product.description
  };
}

const SIZES = ["38", "39", "40", "41", "42", "43", "44"];

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getProductsByCategory(product.category);
  const filteredRelated = relatedProducts.filter(p => p.id !== product.id).slice(0, 4);
  const img = getProductImage(product);

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-[#0d3a6b] transition-colors">Trang chủ</Link>
            <FaChevronRight className="text-[10px]" />
            <Link href="/products" className="hover:text-[#0d3a6b] transition-colors">Sản phẩm</Link>
            <FaChevronRight className="text-[10px]" />
            <Link href={`/products?category=${product.category}`} className="hover:text-[#0d3a6b] transition-colors">{product.category}</Link>
            <FaChevronRight className="text-[10px]" />
            <span className="text-slate-900 font-medium truncate max-w-[200px] sm:max-w-md">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-[#f7f9ff] to-[#dbe7ff] shadow-sm">
              {img ? (
                <img
                  src={img}
                  alt={product.name}
                  className="h-full w-full object-cover"
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
            
            {/* Thumbnail Gallery */}
            {product.imageUrls.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.imageUrls.map((url, i) => (
                  <div key={i} className="aspect-square cursor-pointer overflow-hidden rounded-2xl bg-[#f7f9ff] border-2 border-transparent hover:border-[#0d3a6b] transition-colors">
                    <img src={url} alt={`${product.name} ${i+1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <Link href={`/brand/${product.brand.toLowerCase()}`} className="text-sm font-semibold uppercase tracking-wider text-[#0d3a6b] hover:underline">
                {product.brand}
              </Link>
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <FaStar className="text-amber-400" />
                <span className="font-semibold text-slate-900">{product.rating.toFixed(1)}</span>
                <span>({product.reviewCount} đánh giá)</span>
                <span className="px-1.5">·</span>
                <span>{product.sold} đã bán</span>
              </div>
            </div>

            <h1 className="text-3xl font-semibold text-slate-900 leading-tight sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-6 flex items-end gap-3">
              <span className="text-3xl font-semibold text-rose-600">{product.price}</span>
              {product.oldPrice && (
                <span className="text-lg text-slate-400 line-through mb-1">{product.oldPrice}</span>
              )}
            </div>
            
            {product.promotion && (
              <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 border border-emerald-100">
                🎁 {product.promotion}
              </div>
            )}

            <div className="mt-8 border-t border-slate-200 pt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Chọn kích cỡ</h3>
                <button className="text-sm text-[#0d3a6b] hover:underline">Hướng dẫn chọn size</button>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-7">
                {SIZES.map(size => (
                  <button 
                    key={size}
                    className="flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-all hover:border-[#0d3a6b] hover:text-[#0d3a6b] focus:border-[#0d3a6b] focus:bg-[#0d3a6b] focus:text-white focus:outline-none"
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
                    <button key={color} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 flex gap-4">
              <button className="flex-1 rounded-full bg-[#0d3a6b] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[#0d3a6b]/30 transition-transform hover:-translate-y-1">
                Thêm vào giỏ hàng
              </button>
              <button className="flex-1 rounded-full bg-rose-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-rose-600/30 transition-transform hover:-translate-y-1">
                Mua ngay
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <FaShieldHeart className="text-lg" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">100% Chính hãng</p>
                  <p className="text-[11px] text-slate-500">Đền gấp 10 nếu fake</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <FaArrowsRotate className="text-lg" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Đổi trả 30 ngày</p>
                  <p className="text-[11px] text-slate-500">Miễn phí đổi size</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <FaMedal className="text-lg" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Bảo hành 1 năm</p>
                  <p className="text-[11px] text-slate-500">Yên tâm sử dụng</p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-lg font-semibold text-slate-900">Mô tả sản phẩm</h3>
              <div className="mt-4 prose prose-sm max-w-none text-slate-600">
                <p className="whitespace-pre-line">{product.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {filteredRelated.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-8">Sản phẩm tương tự</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredRelated.map((item) => {
              const relatedImg = getProductImage(item);
              return (
                <Link
                  key={item.id}
                  href={`/products/${item.id}`}
                  className="group overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#f7f9ff] to-[#dbe7ff]">
                    {relatedImg ? (
                      <img
                        src={relatedImg}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">👟</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{item.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-base font-semibold text-rose-600">{item.price}</span>
                      <span className="text-xs text-slate-400 line-through">{item.oldPrice}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </main>
  );
}
