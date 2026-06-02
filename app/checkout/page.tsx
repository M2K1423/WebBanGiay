"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaChevronRight, FaLocationDot, FaMoneyBillWave, FaShieldHalved } from "react-icons/fa6";
import { useCart } from "@/features/cart/CartContext";
import { onAuthStateChanged } from "firebase/auth";
import { getApiBaseUrl } from "@/features/auth/utils";
import { getFirebaseAuth } from "@/lib/firebase";

type CheckoutUser = {
  uid: string;
};

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

export default function CheckoutPage() {
  const { items, total, count, clearCart } = useCart();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    note: "",
    paymentMethod: "cod"
  });

  useEffect(() => {
    setMounted(true);
    if (mounted && items.length === 0) {
      router.push("/cart");
    }
  }, [items.length, mounted, router]);

  useEffect(() => {
    const auth = getFirebaseAuth();

    if (!auth) {
      return;
    }

    return onAuthStateChanged(auth, (user: CheckoutUser | null) => {
      setCustomerId(user?.uid ?? null);
    });
  }, []);

  if (!mounted || items.length === 0) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const userId = customerId ?? (formData.email.trim() || `guest-${Date.now()}`);

    const payload = {
      items,
      total,
      status: "pending",
      shippingAddress: {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        note: formData.note
      },
      paymentMethod: formData.paymentMethod
    };

    try {
      const response = await fetch(`${getApiBaseUrl()}/orders/user/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      clearCart();
      router.push("/checkout/success");
    } catch {
      alert("Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] pb-24">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-[#0d3a6b] transition-colors">Home</Link>
            <FaChevronRight className="text-[10px]" />
            <Link href="/cart" className="hover:text-[#0d3a6b] transition-colors">Cart</Link>
            <FaChevronRight className="text-[10px]" />
            <span className="text-slate-900 font-medium">Checkout</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_450px]">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Shipping Info */}
            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0d3a6b]/10 text-[#0d3a6b]">
                  <FaLocationDot />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Shipping Information</h2>
              </div>
              
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]"
                    placeholder="Enter recipient's full name"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]"
                    placeholder="To receive order updates"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Shipping Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]"
                    placeholder="House number, street, ward, district, city"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="note" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Order Note (Optional)
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    rows={3}
                    value={formData.note}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]"
                    placeholder="E.g., Deliver during business hours..."
                  />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <FaMoneyBillWave />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Payment Method</h2>
              </div>

              <div className="space-y-3">
                <label className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-colors ${
                  formData.paymentMethod === "cod" ? "border-[#0d3a6b] bg-[#0d3a6b]/5" : "border-slate-200 hover:border-slate-300"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      formData.paymentMethod === "cod" ? "border-[#0d3a6b]" : "border-slate-300"
                    }`}>
                      {formData.paymentMethod === "cod" && <div className="h-3 w-3 rounded-full bg-[#0d3a6b]" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Cash on Delivery (COD)</p>
                      <p className="text-xs text-slate-500">Pay with cash upon delivery</p>
                    </div>
                  </div>
                  <div className="h-8 w-12 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">COD</div>
                </label>

                <label className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-colors ${
                  formData.paymentMethod === "vnpay" ? "border-[#0d3a6b] bg-[#0d3a6b]/5" : "border-slate-200 hover:border-slate-300"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      formData.paymentMethod === "vnpay" ? "border-[#0d3a6b]" : "border-slate-300"
                    }`}>
                      {formData.paymentMethod === "vnpay" && <div className="h-3 w-3 rounded-full bg-[#0d3a6b]" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">VNPay Payment (Under Maintenance)</p>
                      <p className="text-xs text-slate-500">ATM / Visa / MasterCard / JCB</p>
                    </div>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Order Summary */}
          <div>
            <div className="sticky top-24 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Your Order</h2>
              
              <div className="mb-6 space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={`${item.productId}__${item.size}__${item.color}`} className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 rounded-xl bg-[#f7f9ff] overflow-hidden border border-slate-100">
                      {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover mix-blend-multiply" />}
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-500 text-[10px] text-white font-bold border border-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-slate-900 line-clamp-2">{item.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.color ? `${item.color}, ` : ""}Size {item.size}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm border-t border-slate-100 pt-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({count} {count === 1 ? "item" : "items"})</span>
                  <span className="font-medium text-slate-900">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-medium text-[#0d3a6b] font-semibold">Free</span>
                </div>
                
                <div className="border-t border-dashed border-slate-200 pt-4 mt-2">
                  <div className="flex items-end justify-between">
                    <span className="font-semibold text-slate-900 text-base">Total</span>
                    <div className="text-right">
                      <span className="text-2xl font-semibold text-rose-600">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="mt-8 w-full rounded-full bg-[#0d3a6b] py-4 text-sm font-semibold text-white shadow-lg shadow-[#0d3a6b]/20 transition-transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <>Processing...</>
                ) : (
                  <>
                    <FaShieldHalved /> Place Order Now
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
