"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { User } from "firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  FaBagShopping,
  FaBars,
  FaBell,
  FaBolt,
  FaMagnifyingGlass,
  FaNewspaper,
  FaPersonRunning,
  FaShoePrints,
  FaTableTennisPaddleBall,
  FaUser,
  FaShieldHalved,
  FaArrowRightFromBracket
} from "react-icons/fa6";
import { SiAdidas, SiNike, SiPuma } from "react-icons/si";
import { getFirebaseAuth } from "@/lib/firebase";
import { useCart } from "@/features/cart/CartContext";
import { getApiBaseUrl } from "@/features/auth/utils";

type ProductNotification = {
  id: string;
  name: string;
  brand: string;
  price: string;
  imageUrl: string | null;
  message: string;
  createdAt: string;
};

type RealtimeSocket = {
  on: (event: "product.created", callback: (notification: ProductNotification) => void) => void;
  disconnect: () => void;
};

declare global {
  interface Window {
    io?: (url: string, options?: { transports?: string[] }) => RealtimeSocket;
  }
}

function getRealtimeBaseUrl() {
  return process.env.NEXT_PUBLIC_REALTIME_URL ?? getApiBaseUrl().replace(/\/api\/?$/, "");
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<ProductNotification[]>([]);
  const [latestNotification, setLatestNotification] = useState<ProductNotification | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationToastTimerRef = useRef<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { count } = useCart();

  useEffect(() => {
    const auth = getFirebaseAuth();

    if (!auth) {
      return;
    }

    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const res = await fetch(`${getApiBaseUrl()}/users/${firebaseUser.uid}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setIsAdmin(!!data?.isAdmin);
          } else {
            setIsAdmin(false);
          }
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (accountMenuRef.current && !accountMenuRef.current.contains(target)) {
        setIsAccountMenuOpen(false);
      }

      if (notificationMenuRef.current && !notificationMenuRef.current.contains(target)) {
        setIsNotificationMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
        setIsNotificationMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    setSearchTerm(searchParams.get("q") ?? "");
  }, [pathname, searchParams]);

  useEffect(() => {
    let cancelled = false;

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/notifications?limit=10`);

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (!cancelled && Array.isArray(data)) {
          setNotifications(data as ProductNotification[]);
          setUnreadNotificationCount(data.length);
        }
      } catch {
        // Realtime still works when notification history is temporarily unavailable.
      }
    };

    void fetchNotifications();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let socket: RealtimeSocket | null = null;
    let cancelled = false;
    const realtimeBaseUrl = getRealtimeBaseUrl();

    const handleProductCreated = (notification: ProductNotification) => {
      setNotifications((current) => [notification, ...current].slice(0, 10));
      setUnreadNotificationCount((current) => current + 1);
      setLatestNotification(notification);

      if (notificationToastTimerRef.current) {
        window.clearTimeout(notificationToastTimerRef.current);
      }

      notificationToastTimerRef.current = window.setTimeout(() => {
        setLatestNotification(null);
      }, 5000);
    };

    const connect = () => {
      if (cancelled || !window.io) {
        return;
      }

      socket = window.io(`${realtimeBaseUrl}/notifications`, {
        transports: ["websocket", "polling"]
      });

      socket.on("product.created", handleProductCreated);
    };

    if (window.io) {
      connect();
    } else {
      const existingScript = document.querySelector<HTMLScriptElement>("script[data-socket-io-client='true']");

      if (existingScript) {
        existingScript.addEventListener("load", connect, { once: true });
      } else {
        const script = document.createElement("script");
        script.src = `${realtimeBaseUrl}/socket.io/socket.io.js`;
        script.async = true;
        script.dataset.socketIoClient = "true";
        script.addEventListener("load", connect, { once: true });
        document.body.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      socket?.disconnect();

      if (notificationToastTimerRef.current) {
        window.clearTimeout(notificationToastTimerRef.current);
      }
    };
  }, []);

  const handleSignOut = useCallback(async () => {
    const auth = getFirebaseAuth();

    if (!auth) {
      return;
    }

    setSignOutLoading(true);

    try {
      await signOut(auth);
      router.push("/login");
    } finally {
      setSignOutLoading(false);
    }
  }, [router]);

  const handleToggleAccountMenu = useCallback(() => {
    setIsAccountMenuOpen((current) => !current);
  }, []);

  const handleToggleNotificationMenu = useCallback(() => {
    setIsNotificationMenuOpen((current) => !current);
    setUnreadNotificationCount(0);
  }, []);

  const handleLoginClick = useCallback(() => {
    setIsAccountMenuOpen(false);
  }, []);

  const handleSearchSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchTerm.trim();

    if (!query) {
      router.push("/products");
      return;
    }

    router.push(`/products?q=${encodeURIComponent(query)}`);
  }, [router, searchTerm]);

  return (
    <header className="sticky top-0 z-50 bg-[#0d3a6b] text-white shadow-lg shadow-slate-900/20">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <FaShoePrints className="text-xl" />
          </span>
          <span className="text-3xl italic">myshoes</span>
          <span className="hidden text-sm font-medium italic text-white/80 sm:inline">Real shoes, real good</span>
          <span className="rounded bg-red-600 px-1.5 py-0.5 text-xs font-bold">.vn</span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center md:flex md:max-w-xl">
          <form onSubmit={handleSearchSubmit} className="flex w-full items-center rounded-full bg-white px-4 py-2 text-slate-900">
            <input
              type="text"
              placeholder="Find your next pair..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b2f55] text-white transition-colors hover:bg-[#0a2747]"
              aria-label="Search"
            >
              <FaMagnifyingGlass />
            </button>
          </form>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div ref={notificationMenuRef} className="relative">
            <button
              type="button"
              onClick={handleToggleNotificationMenu}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#0b2f55] text-lg transition-colors hover:bg-[#0a2747]"
              aria-label="Product notifications"
              aria-expanded={isNotificationMenuOpen}
              aria-haspopup="menu"
            >
              <FaBell />
              {unreadNotificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                  {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                </span>
              )}
            </button>

            {isNotificationMenuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full mt-3 w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl shadow-slate-950/30"
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Notifications</p>
                    <p className="mt-1 text-sm font-bold text-slate-950">New product updates</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    Live
                  </span>
                </div>

                <div className="max-h-96 overflow-y-auto p-2">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <Link
                        key={`${notification.id}-${notification.createdAt}`}
                        href={`/products/${notification.id}`}
                        className="flex gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50"
                        role="menuitem"
                        onClick={() => setIsNotificationMenuOpen(false)}
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-100">
                          {notification.imageUrl ? (
                            <img src={notification.imageUrl} alt={notification.name} className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-950">New product available</p>
                          <p className="mt-0.5 truncate text-sm font-semibold text-[#0d3a6b]">
                            {notification.name}
                          </p>
                          <p className="mt-1 flex items-center justify-between gap-3 text-xs text-slate-500">
                            <span className="truncate">{notification.brand || "Myshoes"}</span>
                            <span className="shrink-0 font-bold text-rose-600">{notification.price}</span>
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <FaBell />
                      </div>
                      <p className="text-sm font-semibold text-slate-900">No notifications yet</p>
                      <p className="mt-1 text-xs text-slate-500">New product alerts will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div ref={accountMenuRef} className="relative">
            {user ? (
              <button
                type="button"
                onClick={handleToggleAccountMenu}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b2f55] text-lg transition-colors hover:bg-[#0a2747]"
                aria-label="Account menu"
                aria-expanded={isAccountMenuOpen}
                aria-haspopup="menu"
              >
                <FaUser />
              </button>
            ) : (
              <Link
                href="/login"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b2f55] text-lg transition-colors hover:bg-[#0a2747]"
                aria-label="Login"
                onClick={handleLoginClick}
              >
                <FaUser />
              </Link>
            )}

            {user && isAccountMenuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-900 shadow-2xl shadow-slate-950/30"
              >
                <div className="border-b border-slate-200 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Logged in</p>
                  <p className="mt-1 break-words text-sm font-semibold">{user.email ?? "Firebase user"}</p>
                </div>
                <div className="p-2 space-y-1">
                  <Link
                    href="/profile"
                    role="menuitem"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <FaUser className="text-base text-slate-500" />
                    My Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      role="menuitem"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#0d3a6b] transition-colors hover:bg-slate-50"
                    >
                      <FaShieldHalved className="text-base text-[#0d3a6b]" />
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      void handleSignOut();
                      setIsAccountMenuOpen(false);
                    }}
                    disabled={signOutLoading}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                    role="menuitem"
                  >
                    <FaArrowRightFromBracket className="text-base text-red-500" />
                    {signOutLoading ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <Link href="/cart" className="relative flex items-center" aria-label="Shopping Cart">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b2f55] text-lg transition-colors hover:bg-[#0a2747]">
              <FaBagShopping />
            </span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <FaBars />
          </button>
        </div>
      </div>

      <nav
        className={`border-t border-white/10 bg-[#0b2f55] ${isMenuOpen ? "block" : "hidden"} md:block`}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 text-sm font-semibold sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between md:gap-0">
          <Link href="/brand/nike" className="flex items-center gap-2 text-white/90 hover:text-white">
            <SiNike className="text-base text-orange-400" /> Nike shoes
          </Link>
          <Link href="/brand/adidas" className="flex items-center gap-2 text-white/90 hover:text-white">
            <SiAdidas className="text-base text-yellow-400" /> Adidas shoes
          </Link>
          <Link href="/brand/puma" className="flex items-center gap-2 text-white/90 hover:text-white">
            <SiPuma className="text-base text-red-400" /> Puma shoes
          </Link>
          <Link href="/brand/pickleball" className="flex items-center gap-2 text-white/90 hover:text-white">
            <FaTableTennisPaddleBall className="text-base" /> Pickleball Shoes
          </Link>
          <Link href="/brand/sport" className="flex items-center gap-2 text-white/90 hover:text-white">
            <FaPersonRunning className="text-base" /> Sport Shoes
          </Link>
          <Link href="/accessories" className="flex items-center gap-2 text-white/90 hover:text-white">
            <FaBagShopping className="text-base" /> Accessories
          </Link>
          <Link href="/sale" className="flex items-center gap-2 text-white/90 hover:text-white">
            <FaBolt className="text-base" /> Sale
          </Link>
          <Link href="/news" className="flex items-center gap-2 text-white/90 hover:text-white">
            <FaNewspaper className="text-base" /> News
          </Link>
        </div>
      </nav>

      {latestNotification ? (
        <Link
          href={`/products/${latestNotification.id}`}
          className="fixed right-5 top-36 z-[60] flex w-[340px] gap-3 rounded-2xl border border-emerald-100 bg-white p-4 text-slate-900 shadow-2xl shadow-slate-900/15 animate-fade-in-up"
          onClick={() => setLatestNotification(null)}
        >
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-100">
            {latestNotification.imageUrl ? (
              <img src={latestNotification.imageUrl} alt={latestNotification.name} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-emerald-600">New product available</p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-950">{latestNotification.name}</p>
            <p className="mt-0.5 flex items-center justify-between gap-3 text-xs text-slate-500">
              <span className="truncate">{latestNotification.brand || "Myshoes"}</span>
              <span className="shrink-0 font-bold text-rose-600">{latestNotification.price}</span>
            </p>
          </div>
        </Link>
      ) : null}
    </header>
  );
}
