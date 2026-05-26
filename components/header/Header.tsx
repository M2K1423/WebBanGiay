"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { User } from "firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  FaBagShopping,
  FaBars,
  FaBolt,
  FaChevronDown,
  FaMagnifyingGlass,
  FaNewspaper,
  FaPersonRunning,
  FaShoePrints,
  FaTableTennisPaddleBall,
  FaUser
} from "react-icons/fa6";
import { SiAdidas, SiNike, SiPuma } from "react-icons/si";
import { getFirebaseAuth } from "@/lib/firebase";
import { useCart } from "@/features/cart/CartContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { count } = useCart();

  useEffect(() => {
    const auth = getFirebaseAuth();

    if (!auth) {
      return;
    }

    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!accountMenuRef.current) {
        return;
      }

      if (!accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
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
          <div ref={accountMenuRef} className="relative">
            {user ? (
              <button
                type="button"
                onClick={handleToggleAccountMenu}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b2f55] text-lg transition-colors hover:bg-[#0a2747]"
                aria-label="Mo menu tai khoan"
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
                <div className="p-2">
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
                    <FaUser className="text-base" />
                    {signOutLoading ? "Dang xuat..." : "Dang xuat"}
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
          <Link href="/brand/sports" className="flex items-center gap-2 text-white/90 hover:text-white">
            <FaPersonRunning className="text-base" /> Sport Shoes
          </Link>
          <Link href="/sale" className="flex items-center gap-2 text-white/90 hover:text-white">
            <FaBolt className="text-base" /> Sale
          </Link>
          <Link href="/news" className="flex items-center gap-2 text-white/90 hover:text-white">
            <FaNewspaper className="text-base" /> News
          </Link>
        </div>
      </nav>
    </header>
  );
}
