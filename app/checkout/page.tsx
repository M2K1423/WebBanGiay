"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaCheck, FaChevronRight, FaLocationDot, FaMoneyBillWave, FaShieldHalved } from "react-icons/fa6";
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

function createOrderNumber() {
  return `MS-${Date.now().toString().slice(-6)}`;
}

export default function CheckoutPage() {
  const { items, total, count, clearCart } = useCart();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [stocks, setStocks] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchStocks = async () => {
      const stockMap: Record<string, number> = {};
      const apiBaseUrl = typeof window !== "undefined"
        ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api")
        : "http://localhost:3001/api";
      for (const item of items) {
        try {
          const res = await fetch(`${apiBaseUrl}/products/${item.productId}`);
          if (res.ok) {
            const prod = await res.json();
            stockMap[item.productId] = prod.stock ?? 0;
          }
        } catch {}
      }
      setStocks(stockMap);
    };
    if (items.length > 0) {
      void fetchStocks();
    }
  }, [items]);

  const hasStockError = items.some(item => stocks[item.productId] !== undefined && item.quantity > stocks[item.productId]);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    note: "",
    paymentMethod: "cod"
  });

  // Geolocation and map states
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt của bạn không hỗ trợ định vị.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "vi,en"
              }
            }
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              setFormData((prev) => ({ ...prev, address: data.display_name }));
            } else {
              setFormData((prev) => ({ ...prev, address: `${latitude}, ${longitude}` }));
            }
          } else {
            setFormData((prev) => ({ ...prev, address: `${latitude}, ${longitude}` }));
          }
        } catch (error) {
          console.error("Lỗi giải mã địa chỉ:", error);
          setFormData((prev) => ({ ...prev, address: `${latitude}, ${longitude}` }));
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Lỗi định vị:", error);
        let errorMsg = "Không thể lấy vị trí hiện tại.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Quyền truy cập vị trí bị từ chối. Vui lòng cho phép quyền truy cập vị trí trong cài đặt trình duyệt.";
        }
        alert(errorMsg);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const searchAddressOnMap = async () => {
    const addressVal = formData.address.trim();
    if (!addressVal) {
      alert("Vui lòng nhập địa chỉ trước khi tìm trên bản đồ.");
      return;
    }

    setIsSearchingMap(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressVal)}&limit=1`,
        {
          headers: {
            "Accept-Language": "vi,en"
          }
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const newLat = parseFloat(data[0].lat);
          const newLng = parseFloat(data[0].lon);
          setCoords({ lat: newLat, lng: newLng });
        } else {
          alert("Không tìm thấy vị trí trên bản đồ cho địa chỉ này. Hãy thử nhập chi tiết hơn.");
        }
      } else {
        alert("Không thể kết nối với dịch vụ bản đồ lúc này.");
      }
    } catch (error) {
      console.error("Lỗi tìm kiếm bản đồ:", error);
      alert("Đã xảy ra lỗi khi kết nối với dịch vụ bản đồ.");
    } finally {
      setIsSearchingMap(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (mounted && items.length === 0 && !orderPlaced) {
      router.push("/cart");
    }
  }, [items.length, mounted, orderPlaced, router]);

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
      const auth = getFirebaseAuth();
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      
      const headers: any = {
        "Content-Type": "application/json"
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${getApiBaseUrl()}/orders/user/${userId}`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const createdOrder = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(createdOrder?.message || "Không thể tạo đơn hàng");
      }
      const orderNumber =
        createdOrder?.orderNumber ??
        createdOrder?.orderId ??
        createdOrder?.id ??
        createdOrder?._id ??
        createOrderNumber();

      sessionStorage.setItem(
        "myshoes_last_order",
        JSON.stringify({
          orderNumber,
          orderDate: new Date().toISOString(),
          items,
          total,
          paymentMethod: formData.paymentMethod,
          email: formData.email
        })
      );

      if (formData.paymentMethod === "vnpay") {
        const paymentResponse = await fetch(`${getApiBaseUrl()}/payments/vnpay/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: createdOrder?._id,
            paymentToken: createdOrder?.paymentAccessToken
          })
        });
        const paymentData = await paymentResponse.json().catch(() => null);
        if (!paymentResponse.ok || !paymentData?.paymentUrl) {
          throw new Error(paymentData?.message || "Không tạo được giao dịch VNPay");
        }
        window.location.assign(paymentData.paymentUrl);
        return;
      }

      setOrderPlaced(true);
      setShowOrderSuccess(true);

      window.setTimeout(() => {
        void clearCart();
        router.push("/checkout/success");
      }, 900);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Không thể tạo đơn hàng. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] pb-24">
      {showOrderSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-5 top-48 z-50 flex min-w-[270px] items-center gap-4 rounded-2xl border border-emerald-200 bg-white px-5 py-4 text-base font-semibold text-slate-900 shadow-2xl shadow-emerald-900/10 ring-1 ring-emerald-100 animate-fade-in-up sm:right-8"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50">
            <FaCheck className="text-lg" />
          </span>
          <span>Order Successfully</span>
        </div>
      )}

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

      <div className="mx-auto max-w-7xl px-4 mt-5 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_450px]">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Shipping Info */}
            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0d3a6b]/10 text-[#0d3a6b]">
                  <FaLocationDot />
                </div>
                <h2 className="text-xl font-bold text-slate-950">Shipping Information</h2>
              </div>

              {hasStockError && (
                <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-sm font-semibold text-rose-700 shadow-sm animate-pulse flex items-center gap-3">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <p className="font-bold">Đơn hàng vượt quá tồn kho thực tế!</p>
                    <p className="font-normal text-xs text-rose-600 mt-0.5">Một số sản phẩm trong giỏ hàng có số lượng vượt mức tồn kho hiện có. Vui lòng quay lại <Link href="/cart" className="underline font-bold hover:text-rose-800">Giỏ hàng</Link> để điều chỉnh.</p>
                  </div>
                </div>
              )}

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
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]"
                    placeholder="To receive order updates"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="address" className="text-sm font-medium text-slate-700">
                      Shipping Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleGetCurrentLocation}
                        disabled={isLocating}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0d3a6b]/5 hover:bg-[#0d3a6b]/10 text-[#0d3a6b] text-xs font-semibold px-2.5 py-1.5 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isLocating ? (
                          <>
                            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#0d3a6b] border-t-transparent"></span>
                            Đang lấy vị trí...
                          </>
                        ) : (
                          <>
                            <FaLocationDot className="text-[10px]" />
                            Vị trí hiện tại
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={searchAddressOnMap}
                        disabled={isSearchingMap || !formData.address.trim()}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1.5 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                      >
                        {isSearchingMap ? (
                          <>
                            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-600 border-t-transparent"></span>
                            Đang tìm...
                          </>
                        ) : (
                          <>
                            🔍 Xem bản đồ
                          </>
                        )}
                      </button>
                    </div>
                  </div>
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

                  {/* Google Map Embed */}
                  {coords && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300">
                      <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1.5 font-medium">
                          🗺️ Bản đồ Google Maps (Tọa độ: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)})
                        </span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0d3a6b] font-bold hover:underline"
                        >
                          Mở Google Maps ↗
                        </a>
                      </div>
                      <div className="relative w-full h-[250px]">
                        <iframe
                          title="Google Maps Location"
                          src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=16&output=embed`}
                          className="absolute inset-0 w-full h-full border-0"
                          allowFullScreen
                          loading="lazy"
                        ></iframe>
                      </div>
                    </div>
                  )}
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
                <h2 className="text-xl font-bold text-slate-950">Payment Method</h2>
              </div>

              <div className="space-y-3">
                <label className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-colors ${formData.paymentMethod === "cod" ? "border-[#0d3a6b] bg-[#0d3a6b]/5" : "border-slate-200 hover:border-slate-300"
                  }`}>
                  <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === "cod"} onChange={handleChange} className="sr-only" />
                  <div className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${formData.paymentMethod === "cod" ? "border-[#0d3a6b]" : "border-slate-300"
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

                <label className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-colors ${formData.paymentMethod === "vnpay" ? "border-[#0d3a6b] bg-[#0d3a6b]/5" : "border-slate-200 hover:border-slate-300"
                  }`}>
                  <input type="radio" name="paymentMethod" value="vnpay" checked={formData.paymentMethod === "vnpay"} onChange={handleChange} className="sr-only" />
                  <div className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${formData.paymentMethod === "vnpay" ? "border-[#0d3a6b]" : "border-slate-300"
                      }`}>
                      {formData.paymentMethod === "vnpay" && <div className="h-3 w-3 rounded-full bg-[#0d3a6b]" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">VNPay Payment</p>
                      <p className="text-xs text-slate-500">ATM / Visa / MasterCard / JCB</p>
                    </div>
                  </div>
                  <div className="flex h-8 items-center rounded-lg bg-gradient-to-r from-[#005baa] to-[#ed1c24] px-3 text-xs font-black italic text-white">VNPAY</div>
                </label>
              </div>
            </section>
          </div>

          {/* Order Summary */}
          <div>
            <div className="sticky top-24 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-slate-950 mb-6">Your Order</h2>

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
                      {stocks[item.productId] !== undefined && item.quantity > stocks[item.productId] && (
                        <p className="mt-1 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-2 py-0.5 inline-block animate-pulse">
                          ⚠️ Chỉ còn {stocks[item.productId]} đôi trong kho
                        </p>
                      )}
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
                disabled={isSubmitting || hasStockError}
                className="mt-8 w-full rounded-full bg-[#0d3a6b] py-4 text-base font-bold text-white shadow-lg shadow-[#0d3a6b]/20 transition-all hover:-translate-y-0.5 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed disabled:opacity-100 disabled:translate-y-0 flex justify-center items-center gap-2"
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
