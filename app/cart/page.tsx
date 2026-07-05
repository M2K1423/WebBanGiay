"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaBagShopping, FaChevronRight, FaMinus, FaPlus, FaTrashCan } from "react-icons/fa6";
import { useCart } from "@/features/cart/CartContext";

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

function parsePrice(price: string): number {
  return parseInt(price.replace(/\D/g, ""), 10) || 0;
}

export default function CartPage() {
  const { items, total, count, removeItem, updateQuantity } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <main className="min-h-[calc(100vh-200px)] bg-[#f5f7fb] py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white px-4 py-24 text-center shadow-sm">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-4xl text-slate-300">
              <FaBagShopping />
            </div>
            <h1 className="!mb-0 !text-3xl !font-semibold !tracking-normal text-slate-900">Your cart is empty</h1>
            <p className="mt-3 max-w-sm text-slate-500">
              It looks like you have not added any products to your cart yet. Explore our latest collections.
            </p>
            <Link
              href="/products"
              className="mt-8 rounded-full bg-[#0d3a6b] px-8 py-3.5 text-sm font-semibold !text-white shadow-lg shadow-[#0d3a6b]/20 transition-transform hover:-translate-y-0.5 hover:!text-white"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-[calc(100vh-178px)] overflow-hidden bg-[#f5f7fb]">
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="transition-colors hover:text-[#0d3a6b]">Home</Link>
            <FaChevronRight className="text-[10px]" />
            <span className="font-medium text-slate-900">Cart</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto flex h-[calc(100%-45px)] max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0d3a6b]">Shopping Cart</p>
            <h1 className="!mb-0 !text-2xl !font-bold !leading-tight !tracking-normal text-slate-950 sm:!text-3xl">
              Your Cart
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
              {count} {count === 1 ? "item" : "items"}
            </span>
            <Link
              href="/products"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#0d3a6b] shadow-sm transition-colors hover:bg-slate-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
          <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60">
            <div className="hidden border-b border-slate-100 bg-slate-50/80 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 md:grid md:grid-cols-[minmax(280px,1fr)_110px_135px_120px_40px] md:items-center">
              <span>Product</span>
              <span>Price</span>
              <span className="text-center">Quantity</span>
              <span>Total</span>
              <span />
            </div>

            <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto px-5">
              {items.map((item) => {
                const itemTotal = parsePrice(item.price) * item.quantity;

                return (
                  <div
                    key={`${item.productId}__${item.size}__${item.color}`}
                    className="grid gap-4 py-4 md:grid-cols-[minmax(280px,1fr)_110px_135px_120px_40px] md:items-center"
                  >
                    <div className="flex min-w-0 gap-4">
                      <Link href={`/products/${item.productId}`} className="shrink-0">
                        <div className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-2xl text-slate-300">
                              <FaBagShopping />
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="min-w-0 self-center">
                        <Link
                          href={`/products/${item.productId}`}
                          className="line-clamp-2 text-base font-bold text-slate-950 transition-colors hover:text-[#0d3a6b]"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.color || "Default"}{item.size ? `, Size ${item.size}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 md:block">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 md:hidden">Price</span>
                      <p className="font-bold text-slate-950">{item.price}</p>
                    </div>

                    <div className="flex items-center justify-between gap-3 md:justify-center">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 md:hidden">Quantity</span>
                      <div className="flex items-center rounded-full bg-slate-100 p-1">
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-white disabled:opacity-40"
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <FaMinus className="text-[11px]" />
                        </button>
                        <span className="w-9 text-center text-sm font-bold text-slate-950">{item.quantity}</span>
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-white"
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                          disabled={item.quantity >= 99}
                          aria-label="Increase quantity"
                        >
                          <FaPlus className="text-[11px]" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 md:block">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 md:hidden">Total</span>
                      <div>
                        <p className="font-bold text-slate-950">{formatPrice(itemTotal)}</p>
                        {item.oldPrice && (
                          <p className="mt-0.5 text-xs text-slate-400 line-through">{item.oldPrice}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId, item.size, item.color)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Remove item"
                    >
                      <FaTrashCan className="text-sm" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="min-h-0">
            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60">
              <div className="bg-[#0d3a6b] px-5 py-4 text-white">
                <h2 className="text-lg font-bold">Order Summary</h2>
                <p className="mt-1 text-xs text-white/70">Review your cart before checkout</p>
              </div>

              <div className="space-y-3 px-5 py-4 text-sm">
                <div className="flex justify-between gap-4 text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-950">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between gap-4 text-slate-600">
                  <span>Shipping</span>
                  <span className="font-bold text-emerald-600">Free</span>
                </div>
              </div>

              <div className="border-y border-slate-100 bg-slate-50 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-lg font-bold text-slate-950">Total</span>
                  <span className="text-xl font-bold text-rose-600">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="px-5 py-4">
                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full rounded-full bg-[#0d3a6b] px-6 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-[#0d3a6b]/20 transition-transform hover:-translate-y-0.5 hover:bg-[#0a2747]"
                >
                  Checkout
                </button>
                <div className="mt-4 grid gap-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-500">
                  <p className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Free shipping on every order
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                    Easy returns within 30 days
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
