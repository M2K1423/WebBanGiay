"use client";

import Link from "next/link";
import { FaChevronRight, FaMinus, FaPlus, FaTrashCan, FaBagShopping } from "react-icons/fa6";
import { useCart } from "@/features/cart/CartContext";
import { useRouter } from "next/navigation";

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

export default function CartPage() {
  const { items, total, count, removeItem, updateQuantity } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <main className="min-h-[calc(100vh-200px)] bg-[#f5f7fb] py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white px-4 py-24 text-center shadow-sm">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-4xl text-slate-300 mb-6">
              <FaBagShopping />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Your cart is empty</h1>
            <p className="mt-2 text-slate-500 max-w-sm">
              It looks like you haven't added any products to your cart yet. Explore our latest collections.
            </p>
            <Link 
              href="/products" 
              className="mt-8 rounded-full bg-[#0d3a6b] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#0d3a6b]/20 transition-transform hover:-translate-y-0.5"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] pb-24">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-[#0d3a6b] transition-colors">Home</Link>
            <FaChevronRight className="text-[10px]" />
            <span className="text-slate-900 font-medium">Cart</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">
          Shopping Cart <span className="text-slate-500 text-lg font-normal tracking-normal">({count} {count === 1 ? "item" : "items"})</span>
        </h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Cart Items List */}
          <div className="space-y-4">
            {items.map((item) => (
              <div 
                key={`${item.productId}__${item.size}__${item.color}`}
                className="flex gap-4 rounded-3xl bg-white p-4 shadow-sm sm:p-6"
              >
                <Link href={`/products/${item.productId}`} className="shrink-0">
                  <div className="h-28 w-28 overflow-hidden rounded-2xl bg-[#f7f9ff] sm:h-36 sm:w-36">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover mix-blend-multiply" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">👟</div>
                    )}
                  </div>
                </Link>

                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link 
                        href={`/products/${item.productId}`}
                        className="font-semibold text-slate-900 line-clamp-2 hover:text-[#0d3a6b]"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        Variant: {item.color ? `${item.color}, ` : ""}Size {item.size}
                      </p>
                    </div>
                    <button 
                      onClick={() => removeItem(item.productId, item.size, item.color)}
                      className="text-slate-400 transition-colors hover:text-rose-500"
                      aria-label="Remove item"
                    >
                      <FaTrashCan />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-end justify-between gap-4 sm:flex-nowrap">
                    <div className="flex items-center gap-1.5 rounded-full border border-slate-200 p-1">
                      <button 
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <FaMinus className="text-[10px]" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button 
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100"
                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                      >
                        <FaPlus className="text-[10px]" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-rose-600">{item.price}</p>
                      {item.oldPrice && (
                        <p className="text-xs text-slate-400 line-through">{item.oldPrice}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({count} {count === 1 ? "item" : "items"})</span>
                  <span className="font-medium text-slate-900">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-medium text-[#0d3a6b] font-semibold">Free</span>
                </div>
                
                <div className="border-t border-dashed border-slate-200 pt-4">
                  <div className="flex items-end justify-between">
                    <span className="font-semibold text-slate-900">Total</span>
                    <div className="text-right">
                      <span className="text-2xl font-semibold text-rose-600">{formatPrice(total)}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">(VAT included if applicable)</p>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => router.push("/checkout")}
                className="mt-8 w-full rounded-full bg-[#0d3a6b] py-4 text-sm font-semibold text-white shadow-lg shadow-[#0d3a6b]/20 transition-transform hover:-translate-y-0.5"
              >
                Proceed to Checkout
              </button>
 
              <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
                <p className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-600">✓</span>
                  Free shipping on all orders
                </p>
                <p className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] text-blue-600">✓</span>
                  Free returns within 30 days
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
