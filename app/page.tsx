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

const flashSale = [
  {
    name: "Nike Air Zoom Vomero 16 Womens - Black White",
    price: "2.190.000d",
    oldPrice: "4.410.000d",
    discount: "-50%",
    sold: 122
  },
  {
    name: "Nike Air Zoom Pegasus 40 Mens - Blue",
    price: "2.390.000d",
    oldPrice: "3.965.000d",
    discount: "-40%",
    sold: 138
  },
  {
    name: "Nike Air Zoom Pegasus 40 Mens - Black White",
    price: "2.390.000d",
    oldPrice: "3.965.000d",
    discount: "-40%",
    sold: 191
  },
  {
    name: "Nike Free RN NN Mens - White",
    price: "1.690.000d",
    oldPrice: "3.050.000d",
    discount: "-45%",
    sold: 110
  }
];

const newArrivals = [
  {
    name: "Nike Court Vision Low Mens - Blue",
    price: "1.490.000d",
    oldPrice: "2.500.000d"
  },
  {
    name: "Nike Zoom Bella 6 Womens - Black White",
    price: "1.690.000d",
    oldPrice: "2.560.000d"
  },
  {
    name: "Nike Renew In-Season TR 11 Womens - White",
    price: "1.790.000d",
    oldPrice: "2.810.000d"
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

export default function HomePage() {
  return (
    <main className="bg-[#f5f7fb]">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d3a6b] via-[#13519b] to-[#1e6ad1] p-10 text-white">
            <div className="max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Myshoes.vn</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                Authentic Nike, Adidas, Puma Shoes
              </h1>
              <p className="mt-4 text-sm text-white/80">
                Fresh drops, fast delivery, easy swaps.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a className="inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#0d3a6b]" href="#flash-sale">
                  Grab flash sale
                </a>
                <a className="inline-flex items-center rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white" href="#new-arrivals">
                  See new arrivals
                </a>
              </div>
            </div>
            <div className="absolute -right-10 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-white/10" />
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl bg-gradient-to-br from-[#f1b232] via-[#f7c45c] to-[#f7d48b] p-8 text-[#1f2a44]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Flash Sale</p>
              <h2 className="mt-3 text-xl font-semibold">Up to 50% Off</h2>
              <p className="mt-2 text-sm">Deals go quick. Dont miss out.</p>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-[#e6eefc] via-[#d8e7ff] to-[#c8dcff] p-8 text-[#1f2a44]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Sport</p>
              <h2 className="mt-3 text-xl font-semibold">Running Shoes That Feel Great</h2>
              <p className="mt-2 text-sm">Comfy, light, and ready to go.</p>
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Flash sale</p>
              <h2 className="text-2xl font-semibold text-slate-900">FLASH SALE</h2>
            </div>
          </div>
          <a className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d3a6b]" href="/sale">
            See all deals
            <FaChevronRight />
          </a>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {flashSale.map((item) => (
            <article key={item.name} className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <div className="relative h-44 bg-gradient-to-br from-[#f7f9ff] to-[#dbe7ff]">
                <span className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">
                  {item.discount}
                </span>
                <span className="absolute bottom-4 left-4 rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-[#1b1202]">
                  Free socks
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{item.name}</h3>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-base font-semibold text-rose-600">{item.price}</span>
                  <span className="text-xs text-slate-400 line-through">{item.oldPrice}</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <FaStar className="text-amber-400" /> 5.0 | {item.sold} sold
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8" id="new-arrivals">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">New arrivals</p>
            <h2 className="text-2xl font-semibold text-slate-900">Fresh arrivals</h2>
          </div>
          <a className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d3a6b]" href="/products">
            Browse arrivals
            <FaChevronRight />
          </a>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {newArrivals.map((item) => (
            <article key={item.name} className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <div className="h-44 bg-gradient-to-br from-[#f7f9ff] to-[#dbe7ff]" />
              <div className="p-4">
                <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{item.name}</h3>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-base font-semibold text-[#0d3a6b]">{item.price}</span>
                  <span className="text-xs text-slate-400 line-through">{item.oldPrice}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">News</p>
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