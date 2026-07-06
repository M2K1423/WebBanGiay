"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaUser, FaBagShopping, FaClock, FaIdCard, FaCircleInfo, FaEnvelope, FaShieldHalved } from "react-icons/fa6";
import { getApiBaseUrl } from "@/features/auth/utils";
import { getFirebaseAuth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

type UserProfile = {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  provider: string;
  isAdmin: boolean;
  createdAt?: string;
  lastLogin?: string;
};

type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  size: string;
};

type Order = {
  _id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"info" | "orders">("info");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      router.push("/login");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/login");
        return;
      }
      setUser(firebaseUser);

      // Fetch profile from DB
      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch(`${getApiBaseUrl()}/users/${firebaseUser.uid}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setLoadingProfile(false);
      }

      // Fetch orders from DB
      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch(`${getApiBaseUrl()}/orders/user/${firebaseUser.uid}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load user orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "đã giao":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "shipping":
      case "đang giao":
        return "bg-sky-50 text-sky-700 border border-sky-200";
      case "pending":
      case "chờ xử lý":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "cancelled":
      case "đã hủy":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  const translateStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "Completed";
      case "shipping":
        return "Shipping";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0d3a6b] border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-500">Loading account details...</p>
        </div>
      </div>
    );
  }

  const userInitial = (profile?.displayName || profile?.email || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex text-sm font-medium text-slate-500 gap-2">
          <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800">Account</span>
        </nav>

        {/* User Banner Header */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0d3a6b] p-8 text-white shadow-xl shadow-slate-900/10 mb-8">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white/10 text-3xl font-extrabold border-2 border-white/20">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="avatar" className="h-full w-full rounded-full object-cover" />
              ) : (
                userInitial
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">{profile?.displayName || "Customer"}</h1>
              <p className="mt-1.5 text-white/80 font-medium flex items-center justify-center md:justify-start gap-1.5">
                <FaEnvelope className="text-white/60" />
                {profile?.email}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                  {profile?.provider === "password" ? "Email Account" : `Logged in via ${profile?.provider}`}
                </span>
                {profile?.isAdmin && (
                  <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-1">
                    <FaShieldHalved /> Administrator
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Subtle background decoration */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-white/5 to-transparent skew-x-12 transform origin-top-right"></div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-6 mb-8">
          <button
            onClick={() => setActiveTab("info")}
            className={`pb-4 text-base font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "info"
                ? "border-[#0d3a6b] text-[#0d3a6b]"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <FaCircleInfo /> Profile Info
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-4 text-base font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "orders"
                ? "border-[#0d3a6b] text-[#0d3a6b]"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <FaBagShopping /> My Orders ({orders.length})
          </button>
        </div>

        {/* Tab 1: Info Content */}
        {activeTab === "info" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-4">Account Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                    <FaIdCard /> Account ID (UID)
                  </label>
                  <p className="text-sm font-mono bg-slate-50 border border-slate-100 rounded-xl p-3 select-all text-slate-700">
                    {profile?.uid}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                    <FaUser /> Display Name
                  </label>
                  <p className="text-base font-semibold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl p-3">
                    {profile?.displayName || "Not Set"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                    <FaClock /> Last Login
                  </label>
                  <p className="text-base font-semibold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl p-3">
                    {formatDate(profile?.lastLogin)}
                  </p>
                </div>
                {profile?.createdAt && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                      <FaClock /> Joined Date
                    </label>
                    <p className="text-base font-semibold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl p-3">
                      {formatDate(profile?.createdAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {profile?.isAdmin && (
              <div className="mt-8 rounded-2xl bg-amber-50 border border-amber-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-amber-800 flex items-center gap-2">
                    <FaShieldHalved /> You have Administrator privileges
                  </h3>
                  <p className="mt-1 text-sm text-amber-700">
                    With this account, you can access the admin dashboard to manage products, orders, and view customers.
                  </p>
                </div>
                <Link
                  href="/admin"
                  className="shrink-0 bg-amber-500 hover:bg-amber-600 transition-colors text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm"
                >
                  Access Admin Panel
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Orders Content */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {loadingOrders ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center text-slate-400">
                Loading order history...
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-2xl">
                  <FaBagShopping />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No orders yet</h3>
                <p className="mt-2 text-sm text-slate-500">You have not made any purchases yet.</p>
                <Link
                  href="/products"
                  className="mt-5 inline-block bg-[#0d3a6b] hover:bg-[#0b2f55] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Shop Now
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-800">
                        Order ID: <span className="font-mono text-xs select-all text-slate-600">{order._id}</span>
                      </div>
                      <div className="text-slate-500 text-xs">
                        Order Date: {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusBadgeClass(order.status)}`}>
                        {translateStatus(order.status)}
                      </span>
                      <span className="font-extrabold text-rose-600 text-lg">
                        {order.total.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  </div>

                  {/* Order Body - Items */}
                  <div className="p-6 divide-y divide-slate-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <Link href={`/products/${item.productId}`} className="font-bold text-slate-800 hover:text-[#0d3a6b] transition-colors truncate block">
                            {item.name}
                          </Link>
                          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                            <span>Size: <strong className="text-slate-700">{item.size}</strong></span>
                            <span>|</span>
                            <span>Qty: <strong className="text-slate-700">{item.quantity}</strong></span>
                          </div>
                        </div>
                        <span className="font-semibold text-slate-700 shrink-0 text-sm">
                          {(item.price * item.quantity).toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer - Shipping Info */}
                  <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 text-xs text-slate-500 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-bold text-slate-700 mb-1">Shipping Address:</p>
                      <p>{order.fullName} - {order.phone}</p>
                      <p>{order.address}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 mb-1">Payment Detail:</p>
                      <p>Method: {order.paymentMethod === "cod" ? "Cash on Delivery (COD)" : order.paymentMethod.toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
