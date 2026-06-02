"use client";

import { useState } from "react";
import Link from "next/link";
import { FaChevronRight, FaStar, FaBagShopping, FaCircleCheck } from "react-icons/fa6";
import { useCart } from "@/features/cart/CartContext";

const ACCESSORY_PRODUCTS = [
  {
    id: "acc-socks-01",
    name: "Premium Anti-Slip Athletic Socks",
    price: "150.000đ",
    oldPrice: "195.000đ",
    discount: "-23%",
    image: "https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=600&q=80",
    colors: ["White", "Black", "Grey"],
    sizes: ["M (36-40)", "L (41-45)"],
    rating: 4.9,
    sold: 432,
    description: "Premium cotton knit socks with anti-slip silicone grippers on the sole, offering maximum traction and shock absorption for high-intensity sports."
  },
  {
    id: "acc-sole-02",
    name: "3D Active Gel Silicone Insoles",
    price: "250.000đ",
    oldPrice: "320.000đ",
    discount: "-21%",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80",
    colors: ["Blue"],
    sizes: ["S (35-39)", "L (40-45)"],
    rating: 4.8,
    sold: 219,
    description: "Ultra-comfortable gel silicone shoe insoles with 3D arch support to reduce fatigue and prevent heel injuries, perfect for long-standing activities."
  },
  {
    id: "acc-lace-03",
    name: "Smart Dial Lock Reflective Shoelaces",
    price: "75.000đ",
    oldPrice: "110.000đ",
    discount: "-31%",
    image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=80",
    colors: ["Reflective Black", "Reflective White", "Neon Yellow"],
    sizes: ["Standard"],
    rating: 4.7,
    sold: 654,
    description: "Elastic stretch material combined with high-visibility nighttime reflective threads. Solid alloy dial lock system for quick wear and release."
  },
  {
    id: "acc-spray-04",
    name: "Silver Nano Shoe Deodorant Spray",
    price: "120.000đ",
    oldPrice: "160.000đ",
    discount: "-25%",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    colors: ["Standard Silver"],
    sizes: ["150ml Bottle"],
    rating: 4.9,
    sold: 812,
    description: "Powerful antibacterial Silver Nano particles instantly eliminate odors and humidity, keeping shoes dry and freshly scented all day."
  }
];

export default function AccessoriesPage() {
  const { addItem } = useCart();
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>(
    ACCESSORY_PRODUCTS.reduce((acc, p) => ({ ...acc, [p.id]: p.colors[0] }), {})
  );
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>(
    ACCESSORY_PRODUCTS.reduce((acc, p) => ({ ...acc, [p.id]: p.sizes[0] }), {})
  );
  const [notification, setNotification] = useState<string | null>(null);

  const handleColorChange = (productId: string, color: string) => {
    setSelectedColors(prev => ({ ...prev, [productId]: color }));
  };

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product: typeof ACCESSORY_PRODUCTS[number]) => {
    const size = selectedSizes[product.id];
    const color = selectedColors[product.id];

    addItem({
      productId: product.id,
      name: product.name,
      brand: "Accessories",
      price: product.price,
      oldPrice: product.oldPrice,
      image: product.image,
      size,
      color
    });

    setNotification(`Added "${product.name}" (${color}, ${size}) to cart!`);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] pb-24">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white shadow-2xl animate-fade-in-up">
          <FaCircleCheck className="text-emerald-400 text-lg" />
          <span>{notification}</span>
        </div>
      )}

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-[#0d3a6b] via-[#114c8d] to-[#1e6ad1] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Premium Shoe Accessories
            </h1>
            <p className="mt-4 text-base text-white/80 sm:text-lg">
              Take better care of your feet and extend the lifespan of your favorite shoes with professional shoe care and support accessories.
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-[#0d3a6b] transition-colors">Home</Link>
          <FaChevronRight className="text-xs" />
          <span className="text-slate-900 font-medium">Accessories</span>
        </nav>
      </div>

      {/* Accessories Listing */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid gap-8 md:grid-cols-2">
          {ACCESSORY_PRODUCTS.map((product) => {
            const activeColor = selectedColors[product.id];
            const activeSize = selectedSizes[product.id];

            return (
              <div 
                key={product.id}
                className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-lg sm:flex-row"
              >
                {/* Visual Image */}
                <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-[#f7f9ff] to-[#dbe7ff] sm:aspect-square sm:w-60 shrink-0">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="h-full w-full object-cover mix-blend-multiply transition-transform duration-500 hover:scale-105" 
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">
                    {product.discount}
                  </span>
                </div>

                {/* Details Content */}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0d3a6b]">Accessories</span>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <FaStar className="text-amber-400" />
                        <span className="font-semibold text-slate-900">{product.rating}</span>
                        <span>({product.sold} sold)</span>
                      </div>
                    </div>

                    <h3 className="mt-3 text-lg font-bold text-slate-900 leading-snug">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Color selectors */}
                    {product.colors.length > 1 && (
                      <div className="mt-4">
                        <span className="text-xs font-semibold text-slate-700">Colors:</span>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {product.colors.map(col => (
                            <button
                              key={col}
                              type="button"
                              onClick={() => handleColorChange(product.id, col)}
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all border ${
                                activeColor === col 
                                  ? "border-[#0d3a6b] bg-[#0d3a6b]/5 text-[#0d3a6b]" 
                                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {col}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Size selectors */}
                    {product.sizes.length > 1 && (
                      <div className="mt-3">
                        <span className="text-xs font-semibold text-slate-700">Sizes:</span>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {product.sizes.map(sz => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleSizeChange(product.id, sz)}
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all border ${
                                activeSize === sz 
                                  ? "border-[#0d3a6b] bg-[#0d3a6b] text-white" 
                                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price and Add button */}
                  <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-rose-600">{product.price}</span>
                        <span className="text-xs text-slate-400 line-through">{product.oldPrice}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="flex items-center gap-2 rounded-full bg-[#0d3a6b] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#0b2f55] hover:scale-105 active:scale-95"
                    >
                      <FaBagShopping /> Add to cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
