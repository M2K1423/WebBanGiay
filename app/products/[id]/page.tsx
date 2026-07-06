import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaChevronRight, FaStar, FaShieldHeart, FaArrowsRotate, FaMedal } from "react-icons/fa6";
import { getProductById, getProductImage, getProductsByCategory } from "@/lib/products";
import AddToCart from "@/features/cart/AddToCart";
import ProductGallery from "@/components/product/ProductGallery";
import ProductReviews from "@/features/reviews/ProductReviews";

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return { title: "Product Not Found" };
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

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-[#0d3a6b] transition-colors">Home</Link>
            <FaChevronRight className="text-[10px]" />
            <Link href="/products" className="hover:text-[#0d3a6b] transition-colors">Products</Link>
            <FaChevronRight className="text-[10px]" />
            <Link href={`/products?category=${product.category}`} className="hover:text-[#0d3a6b] transition-colors">{product.category}</Link>
            <FaChevronRight className="text-[10px]" />
            <span className="text-slate-900 font-medium truncate max-w-[200px] sm:max-w-md">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[4.1fr_5.9fr] items-start">
          {/* Image Gallery */}
          <ProductGallery product={product} />

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <Link href={`/brand/${product.brand.toLowerCase()}`} className="text-sm font-semibold uppercase tracking-wider text-[#0d3a6b] hover:underline">
                {product.brand}
              </Link>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-semibold">
                <FaStar className="text-amber-400" />
                <span className="font-bold text-slate-900">{product.rating.toFixed(1)}</span>
                <span>({product.reviewCount} đánh giá)</span>
                <span className="px-1">·</span>
                <span>Đã bán {product.sold}</span>
                <span className="px-1">·</span>
                <span className={product.stock > 0 ? "text-emerald-600" : "text-rose-600"}>
                  {product.stock > 0 ? `Còn ${product.stock} đôi` : "Hết hàng"}
                </span>
              </div>
            </div>

            <h1 className="text-xl font-black uppercase tracking-wider text-slate-900 leading-tight sm:text-2xl">
              {product.name}
            </h1>

            <div className="mt-2 flex items-end gap-3">
              <span className="text-2xl font-bold text-rose-600">{product.price}</span>
              {product.oldPrice && (
                <span className="text-sm text-slate-400 line-through mb-0.5">{product.oldPrice}</span>
              )}
            </div>
            
            {product.promotion && (
              <div className="mt-3 rounded-lg bg-emerald-50/70 px-3.5 py-2 text-xs font-semibold text-emerald-700 border border-emerald-100/60">
                🎁 {product.promotion}
              </div>
            )}

            <AddToCart 
              product={{
                id: product.id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                oldPrice: product.oldPrice,
                image: getProductImage(product),
                colors: product.colors ?? [],
                stock: product.stock ?? 0,
              }}
              sizes={SIZES}
            />

            {/* Compact Trust Badges */}
            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-slate-100 pt-6 text-center text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5 justify-center">
                <FaShieldHeart className="text-rose-500 shrink-0 text-sm" />
                <span>Chính hãng</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center border-x border-slate-100">
                <FaArrowsRotate className="text-[#0d3a6b] shrink-0 text-sm" />
                <span>30 ngày đổi size</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center">
                <FaMedal className="text-amber-500 shrink-0 text-sm" />
                <span>Bảo hành 1 năm</span>
              </div>
            </div>

            {/* Product Description */}
            <div className="mt-6 border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Mô tả sản phẩm</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

          </div>
        </div>

        {/* Product Reviews */}
        <div className="mt-12 border-t border-slate-200 pt-10">
          <ProductReviews productId={product.id} />
        </div>
      </div>

      {/* Related Products */}
      {filteredRelated.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-8">Related Products</h2>
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
