"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FaCheck, FaChevronRight, FaHeadset, FaRotateLeft, FaShieldHalved } from "react-icons/fa6";

type LastOrderItem = {
  productId: string;
  name: string;
  price: string;
  image: string | null;
  size: string;
  color: string;
  quantity: number;
};

type LastOrder = {
  orderNumber: string;
  orderDate: string;
  items: LastOrderItem[];
  total: number;
  paymentMethod: string;
  email?: string;
  paymentStatus?: string;
};

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

function parsePrice(price: string): number {
  return parseInt(price.replace(/\D/g, ""), 10) || 0;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("myshoes_last_order");
      if (raw) {
        setOrder(JSON.parse(raw) as LastOrder);
      }
    } catch {
      setOrder(null);
    }
  }, []);

  const orderInfo = useMemo<LastOrder>(() => {
    return order ?? {
      orderNumber: "MS-ORDER",
      orderDate: new Date().toISOString(),
      items: [],
      total: 0,
      paymentMethod: "cod"
    };
  }, [order]);

  const visibleItems = orderInfo.items.slice(0, 4);
  const hiddenItemCount = Math.max(orderInfo.items.length - visibleItems.length, 0);
  const isSingleItem = visibleItems.length <= 1;
  const isCompactItems = visibleItems.length >= 3;
  const itemCardClass = isSingleItem
    ? "flex flex-1 items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100/60"
    : isCompactItems
      ? "flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-2 shadow-sm shadow-slate-100/60"
      : "flex flex-1 items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm shadow-slate-100/60";
  const itemImageClass = isSingleItem
    ? "h-20 w-20"
    : isCompactItems
      ? "h-11 w-11"
      : "h-14 w-14";

  return (
    <main className="flex h-[calc(100vh-178px)] items-center bg-[#f5f7fb] px-4 py-4">
      <section className="mx-auto grid h-full max-h-[620px] min-h-[500px] w-full max-w-5xl gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between rounded-xl bg-gradient-to-b from-emerald-50 to-white p-5 text-center">
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 ring-8 ring-white">
              <FaCheck className="text-3xl" />
            </div>

            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">
              Order Confirmed
            </p>
            <h1 className="!mb-0 !text-2xl !font-bold !leading-tight !tracking-normal text-slate-950 sm:!text-3xl">
              Your order has been placed
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">
              Order <span className="font-semibold text-[#0d3a6b]">#{orderInfo.orderNumber}</span> is confirmed and will be processed shortly.
            </p>
          </div>

          <div className="mt-6">
            <div className="grid gap-3">
              <Link
                href="/"
                className="rounded-lg bg-[#0d3a6b] py-3 text-center text-sm font-semibold !text-white shadow-lg shadow-[#0d3a6b]/20 transition-transform hover:-translate-y-0.5 hover:!text-white"
              >
                Back to Home
              </Link>
              <Link
                href="/products"
                className="flex items-center justify-center gap-2 rounded-lg border border-[#0d3a6b] bg-white py-3 text-sm font-semibold text-[#0d3a6b] transition-colors hover:bg-[#0d3a6b]/5"
              >
                Continue Shopping <FaChevronRight className="text-[10px]" />
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-emerald-100 pt-4">
              <div>
                <FaHeadset className="mx-auto text-lg text-[#0d3a6b]" />
                <p className="mt-1.5 text-[11px] font-semibold text-slate-900">Support</p>
              </div>
              <div>
                <FaRotateLeft className="mx-auto text-lg text-[#0d3a6b]" />
                <p className="mt-1.5 text-[11px] font-semibold text-slate-900">Returns</p>
              </div>
              <div>
                <FaShieldHalved className="mx-auto text-lg text-[#0d3a6b]" />
                <p className="mt-1.5 text-[11px] font-semibold text-slate-900">Secure</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-full flex-col rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#0d3a6b]">
              Order Summary
            </h2>
            <p className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
              {orderInfo.paymentMethod === "vnpay" ? "Paid with VNPay" : "Paid on delivery"}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl bg-slate-50 p-3 text-sm">
            <div>
              <p className="text-slate-500">Order Number</p>
              <p className="mt-1 break-all font-semibold text-slate-950">#{orderInfo.orderNumber}</p>
            </div>
            <div>
              <p className="text-slate-500">Order Date</p>
              <p className="mt-1 font-semibold text-slate-950">{formatDate(orderInfo.orderDate)}</p>
            </div>
            <div>
              <p className="text-slate-500">Payment Method</p>
              <p className="mt-1 font-semibold text-slate-950">
                {orderInfo.paymentMethod === "cod" ? "Cash on Delivery" : orderInfo.paymentMethod === "vnpay" ? "VNPay" : orderInfo.paymentMethod}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Total Amount</p>
              <p className="mt-1 text-lg font-bold text-rose-600">{formatPrice(orderInfo.total)}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-1 flex-col">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.06em] text-slate-950">Items Ordered</p>
            <div className="flex flex-1 flex-col gap-2">
              {visibleItems.length > 0 ? (
                visibleItems.map((item) => (
                  <div key={`${item.productId}__${item.size}__${item.color}`} className={itemCardClass}>
                    <div className={`${itemImageClass} shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50`}>
                      {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`${isSingleItem ? "text-xl" : "text-base"} truncate font-semibold leading-6 text-slate-950`}>{item.name}</p>
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        Quantity: {item.quantity}{item.color ? `, ${item.color}` : ""}{item.size ? `, Size ${item.size}` : ""}
                      </p>
                    </div>
                    <p className={`${isSingleItem ? "text-xl" : "text-base"} font-bold text-slate-950`}>
                      {formatPrice(parsePrice(item.price) * item.quantity)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                  Order details are not available.
                </div>
              )}
            </div>

            {hiddenItemCount > 0 && (
              <p className="mt-3 text-center text-xs font-semibold text-slate-500">
                +{hiddenItemCount} more {hiddenItemCount === 1 ? "item" : "items"}
              </p>
            )}
          </div>

          {orderInfo.email && (
            <p className="mt-3 rounded-lg bg-[#0d3a6b]/5 px-3 py-2 text-center text-[11px] text-slate-500">
              A confirmation email has been sent to {orderInfo.email}.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
