import {
  FaArrowsRotate,
  FaBolt,
  FaCalendarCheck,
  FaChevronRight,
  FaMedal,
  FaNewspaper,
  FaShieldHeart,
  FaStar
} from "react-icons/fa6";
import Link from "next/link";
import { getFeaturedProducts } from "../lib/products";
import FlashSaleCarousel from "../components/FlashSaleCarousel";

const trustBadges = [
  {
    title: "100% Authentic",
    desc: "Only the real deal",
    icon: FaShieldHeart
  },
  {
    title: "Easy Returns",
    desc: "Quick size swaps, no stress",
    icon: FaArrowsRotate
  },
  {
    title: "Trusted Store",
    desc: "Loved by shoe fans",
    icon: FaMedal
  },
  {
    title: "12-Month Warranty",
    desc: "Youre covered for a year",
    icon: FaCalendarCheck
  }
];

const newsItems = [
  {
    title: "Find Your Perfect Size",
    desc: "Easy tips for a comfy fit.",
    meta: "Guide"
  },
  {
    title: "Running Trends 2026",
    desc: "Hot pairs everyone is wearing.",
    meta: "News"
  },
  {
    title: "Keep Your Shoes Fresh",
    desc: "Simple care tips that work.",
    meta: "Blog"
  }
];

function getProductImage(product: { imageUrls: string[] }) {
  return product.imageUrls[0] ?? null;
}

function buildHeroBackground(imageUrl: string | null, overlay: string) {
  return imageUrl
    ? {
        backgroundImage: `linear-gradient(${overlay}), url(${imageUrl})`
      }
    : {
        backgroundImage: `linear-gradient(${overlay})`
      };
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();
  const flashSaleProducts = featuredProducts.filter((product) => product.productType === "Flash Sale").slice(0, 4);
  const flashSaleCarousel = flashSaleProducts.length > 0 ? [...flashSaleProducts, ...flashSaleProducts] : [];

  // Popular products
  const popularProducts = featuredProducts.slice(0, 4);

  // Best Sellers
  const bestSellerProducts = [...featuredProducts]
    .sort((a, b) => (b.sold || 0) - (a.sold || 0))
    .slice(0, 4);

  // Helper to get discount percentage
  const getDiscountValue = (discountStr?: string) => {
    if (!discountStr) return 0;
    const parsed = parseInt(discountStr.replace(/[^\d]/g, ""), 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Best Sales
  const bestSaleProducts = [...featuredProducts]
    .sort((a, b) => getDiscountValue(b.discount) - getDiscountValue(a.discount))
    .slice(0, 4);

  const heroImages = [
    "https://i.pinimg.com/736x/de/1d/52/de1d520ea130ebaa7e850010c1011eab.jpg",
    "https://i.pinimg.com/736x/d3/dd/e2/d3dde2f143f8eb197c31f15ee28af988.jpg",
    "https://i.pinimg.com/736x/9c/a6/06/9ca606ae0fbeb8a276a14c843ae07735.jpg"
  ];

  return (
    <main className="bg-[#f5f7fb]">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
          <div
            className="relative overflow-hidden rounded-[2rem] border border-white/30 p-8 text-white shadow-[0_30px_100px_rgba(13,58,107,0.22)] sm:p-10"
            style={buildHeroBackground(heroImages[0], "135deg, rgba(12, 41, 82, 0.80) 0%, rgba(12, 71, 141, 0.55) 52%, rgba(44, 122, 255, 0.35) 100%")}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,183,3,0.15),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_45%)]" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/12 to-transparent" />
            <div className="absolute right-4 top-4 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-white/80 backdrop-blur-md">
              Myshoes.vn / 2026
            </div>
            <div className="relative z-10 max-w-[34rem] pt-10 sm:pt-8 lg:pt-2">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/75">Premium Sneaker Store</p>
              <h1 className="mt-4 text-4xl font-semibold leading-[0.94] tracking-[-0.06em] sm:text-5xl lg:text-[4.3rem]">
                Authentic Nike, Adidas, Puma Shoes
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/82 sm:text-base">
                Fresh drops, fast delivery, easy swaps. Discover a sharper selection with a cleaner shopping flow.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a className="inline-flex items-center rounded-full bg-[#ffb703] px-5 py-2.5 text-sm font-semibold text-[#1b1202] shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5" href="#flash-sale">
                  Grab flash sale
                </a>
                <a className="inline-flex items-center rounded-full border border-white/35 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-transform hover:-translate-y-0.5" href="#new-arrivals">
                  See new arrivals
                </a>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Authentic", value: "100%" },
                  { label: "Dispatch", value: "24h" },
                  { label: "Exchange", value: "Easy" }
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                    <div className="text-xl font-semibold text-white">{stat.value}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/65">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -right-10 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-white/12 blur-2xl" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div
              className="relative min-h-[280px] overflow-hidden rounded-[2rem] border border-white/40 p-8 text-[#1f2a44] shadow-[0_24px_70px_rgba(251,133,0,0.14)]"
              style={buildHeroBackground(heroImages[1], "135deg, rgba(234, 173, 38, 0.80) 0%, rgba(246, 205, 108, 0.70) 52%, rgba(255, 228, 170, 0.54) 100%")}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.02))]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.30),transparent_38%)]" />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="inline-flex w-fit rounded-full bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.26em] text-[#1f2a44] backdrop-blur-md">
                  Flash Sale
                </div>
                <div className="max-w-[15rem]">
                  <h2 className="text-2xl font-semibold leading-tight">Up to 50% Off</h2>
                  <p className="mt-2 text-sm text-[#1f2a44]/80">Deals go quick. Dont miss out.</p>
                </div>
              </div>
            </div>
            <div
              className="relative min-h-[280px] overflow-hidden rounded-[2rem] border border-white/40 p-8 text-[#1f2a44] shadow-[0_24px_70px_rgba(64,95,160,0.14)]"
              style={buildHeroBackground(heroImages[2], "135deg, rgba(224, 233, 250, 0.90) 0%, rgba(202, 222, 255, 0.84) 52%, rgba(177, 205, 247, 0.72) 100%")}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0.06))]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.42),transparent_34%)]" />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="inline-flex w-fit rounded-full bg-[#0d3a6b]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.26em] text-[#0d3a6b] backdrop-blur-md">
                  Sport
                </div>
                <div className="max-w-[15rem]">
                  <h2 className="text-2xl font-semibold leading-tight">Running Shoes That Feel Great</h2>
                  <p className="mt-2 text-sm text-[#1f2a44]/80">Comfy, light, and ready to go.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustBadges.map((item) => (
            <div key={item.title} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0d3a6b] text-white">
                <item.icon className="text-lg" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8" id="flash-sale">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0d3a6b] text-white">
              <FaBolt />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">FLASH SALE</h2>
            </div>
          </div>
          <a className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d3a6b]" href="/sale">
            See all deals
            <FaChevronRight />
          </a>
        </div>

        <FlashSaleCarousel products={flashSaleProducts} />
      </section>

      {/* SECTION 1: POPULAR PRODUCTS */}
      {popularProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Products Popular</h2>
            </div>
            <a className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d3a6b] hover:underline" href="/products?type=popular">
              All products
              <FaChevronRight className="text-xs" />
            </a>
          </div>

          <div className="mt-6 grid gap-6 grid-cols-2 md:grid-cols-4">
            {popularProducts.map((item) => (
              <Link key={item.id} href={`/products/${item.id}`} className="group overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-[#f7f9ff] to-[#dbe7ff]">
                  {getProductImage(item) ? (
                    <img alt={item.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" src={getProductImage(item) ?? undefined} />
                  ) : null}
                  {item.discount && (
                    <div className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">
                      {item.discount}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-500">
                    <span className="font-medium text-[#0d3a6b]">{item.brand}</span>
                    <span>{item.category}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">{item.name}</h3>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-base font-semibold text-[#0d3a6b]">{item.price}</span>
                    <span className="text-xs text-slate-400 line-through">{item.oldPrice}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <FaStar className="text-amber-400" /> {item.rating.toFixed(1)} | {item.sold} sold
                  </div>
                  {item.promotion && <p className="mt-2 text-xs font-medium text-emerald-600">{item.promotion}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: BEST SELLERS */}
      {bestSellerProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Best Sellers</h2>
            </div>
            <a className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d3a6b] hover:underline" href="/products?type=best-seller&sort=sold">
              All products
              <FaChevronRight className="text-xs" />
            </a>
          </div>

          <div className="mt-6 grid gap-6 grid-cols-2 md:grid-cols-4">
            {bestSellerProducts.map((item) => (
              <Link key={item.id} href={`/products/${item.id}`} className="group overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-[#f7f9ff] to-[#dbe7ff]">
                  {getProductImage(item) ? (
                    <img alt={item.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" src={getProductImage(item) ?? undefined} />
                  ) : null}
                  {item.discount && (
                    <div className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">
                      {item.discount}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-500">
                    <span className="font-medium text-[#0d3a6b]">{item.brand}</span>
                    <span>{item.category}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">{item.name}</h3>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-base font-semibold text-[#0d3a6b]">{item.price}</span>
                    <span className="text-xs text-slate-400 line-through">{item.oldPrice}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <FaStar className="text-amber-400" /> {item.rating.toFixed(1)} | {item.sold} sold
                  </div>
                  {item.promotion && <p className="mt-2 text-xs font-medium text-emerald-600">{item.promotion}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: BEST SALES */}
      {bestSaleProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8" id="new-arrivals">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Best Deals</h2>
            </div>
            <a className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d3a6b] hover:underline" href="/products?type=best-sale&sort=discount">
              All products
              <FaChevronRight className="text-xs" />
            </a>
          </div>

          <div className="mt-6 grid gap-6 grid-cols-2 md:grid-cols-4">
            {bestSaleProducts.map((item) => (
              <Link key={item.id} href={`/products/${item.id}`} className="group overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-[#f7f9ff] to-[#dbe7ff]">
                  {getProductImage(item) ? (
                    <img alt={item.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" src={getProductImage(item) ?? undefined} />
                  ) : null}
                  {item.discount && (
                    <div className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">
                      {item.discount}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-500">
                    <span className="font-medium text-[#0d3a6b]">{item.brand}</span>
                    <span>{item.category}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">{item.name}</h3>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-base font-semibold text-[#0d3a6b]">{item.price}</span>
                    <span className="text-xs text-slate-400 line-through">{item.oldPrice}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <FaStar className="text-amber-400" /> {item.rating.toFixed(1)} | {item.sold} sold
                  </div>
                  {item.promotion && <p className="mt-2 text-xs font-medium text-emerald-600">{item.promotion}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Latest stories</h2>
          </div>
          <a className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d3a6b]" href="/blog">
            See all stories
            <FaChevronRight />
          </a>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {newsItems.map((item) => (
            <article key={item.title} className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{item.meta}</span>
                <FaNewspaper />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{item.desc}</p>
              <a className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0d3a6b]" href="/blog">
                Read more
                <FaChevronRight />
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}