import type { Metadata } from "next";
import Link from "next/link";
import {
  FaArrowsRotate,
  FaBolt,
  FaChevronRight,
  FaMedal,
  FaShieldHeart,
  FaStar,
  FaTableTennisPaddleBall
} from "react-icons/fa6";
import { getAllProducts, getProductImage } from "@/lib/products";

export const metadata: Metadata = {
  title: "Pickleball Shoes | myshoes.vn",
  description: "Khám phá giày pickleball tối ưu cho chuyển động ngang, độ bám và độ ổn định khi thi đấu."
};

function priceValue(price: string) {
  return parseInt(price.replace(/\D/g, ""), 10) || 0;
}

export default async function PickleballCollectionPage() {
  const products = (await getAllProducts())
    .filter((product) => ["Court", "Training"].includes(product.category))
    .sort((a, b) => b.rating - a.rating || b.sold - a.sold)
    .slice(0, 8);

  const featuredCount = products.length;
  const averagePrice =
    featuredCount > 0
      ? Math.round(products.reduce((sum, product) => sum + priceValue(product.price), 0) / featuredCount)
      : 0;

  const highlights = [
    {
      title: "Bám sân tốt",
      desc: "Đế ổn định cho các pha đổi hướng nhanh.",
      icon: FaShieldHeart
    },
    {
      title: "Giảm chấn êm",
      desc: "Hỗ trợ các bước chạy ngắn và bật nhảy liên tục.",
      icon: FaArrowsRotate
    },
    {
      title: "Thi đấu bền",
      desc: "Tối ưu cho cường độ chơi pickleball mỗi ngày.",
      icon: FaMedal
    }
  ];

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <section className="bg-gradient-to-br from-[#0d3a6b] via-[#114c8d] to-[#1e6ad1] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
              <FaTableTennisPaddleBall /> Pickleball Shoes
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Giày pickleball cho những pha đổi hướng nhanh và bám sân chắc hơn.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
              Dòng giày này tập trung vào độ ổn định, độ bám và cảm giác chân linh hoạt khi di chuyển ngang.
              Chọn mẫu phù hợp để chơi lâu hơn và an toàn hơn trên sân.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#pickleball-products" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0d3a6b]">
                Xem sản phẩm
                <FaChevronRight className="text-xs" />
              </a>
              <a href="/products?category=Court" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white">
                Mở danh mục Court
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.title} className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0d3a6b]">
                    <item.icon />
                  </div>
                  <h2 className="mt-3 text-sm font-semibold text-white">{item.title}</h2>
                  <p className="mt-1 text-sm text-white/75">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 self-end sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl bg-white p-6 text-[#0f2340] shadow-2xl shadow-black/10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0d3a6b]">Curated pick</p>
              <h2 className="mt-3 text-2xl font-semibold">Dành cho sân court và luyện tập</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Chúng tôi ưu tiên các đôi giày court/training từ catalog hiện có để tạo bộ sưu tập phù hợp với pickleball.
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Tổng quan</p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-white">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-white/70">Số mẫu hiển thị</p>
                  <p className="mt-2 text-2xl font-bold">{featuredCount}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-white/70">Giá trung bình</p>
                  <p className="mt-2 text-2xl font-bold">{averagePrice ? `${averagePrice.toLocaleString("vi-VN")}đ` : "-"}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-white/80">
                <FaBolt className="text-amber-300" />
                Tối ưu cho những ai đang tìm một đôi court shoe dễ chuyển hướng hơn.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-[#0d3a6b] transition-colors">Trang chủ</Link>
          <FaChevronRight className="text-xs" />
          <span className="text-slate-900 font-medium">Pickleball Shoes</span>
        </nav>
      </section>

      <section id="pickleball-products" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Collection</p>
            <h2 className="text-2xl font-semibold text-slate-900">Pickleball-ready shoes</h2>
            <p className="mt-1 text-sm text-slate-500">Các mẫu court/training phù hợp cho di chuyển ngang và độ ổn định.</p>
          </div>
          <Link href="/products?category=Court" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d3a6b]">
            Xem thêm Court
            <FaChevronRight />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl bg-white py-24 text-center shadow-sm">
            <div className="text-6xl mb-4">🏓</div>
            <h3 className="text-xl font-semibold text-slate-900">Chưa có sản phẩm pickleball phù hợp</h3>
            <p className="mt-2 text-slate-500">Hãy thử mở danh mục Court hoặc Training để xem các mẫu gần nhất.</p>
            <Link href="/products" className="mt-6 inline-flex rounded-full bg-[#0d3a6b] px-6 py-3 text-sm font-semibold text-white">
              Xem tất cả sản phẩm
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
                  className="group overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
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
                    <span className="absolute right-4 top-4 rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-[#1b1202]">
                      Court fit
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
                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{product.description}</p>
                    <div className="mt-3 flex items-end justify-between gap-3">
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
                    {product.promotion ? (
                      <p className="mt-2 text-xs font-medium text-emerald-600">{product.promotion}</p>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}