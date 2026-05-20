"use client";

import Link from "next/link";
import { useState } from "react";
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

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0d3a6b] text-white shadow-lg shadow-slate-900/20">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <FaShoePrints className="text-xl" />
          </span>
          <span className="text-3xl italic">myshoes</span>
          <span className="hidden text-sm font-medium italic text-white/80 sm:inline">Giày chính hãng!</span>
          <span className="rounded bg-red-600 px-1.5 py-0.5 text-xs font-bold">.vn</span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center md:flex md:max-w-xl">
          <div className="flex w-full items-center rounded-full bg-white px-4 py-2 text-slate-900">
            <input
              type="text"
              placeholder="Bạn muốn tìm đôi giày nào?"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b2f55] text-white transition-colors hover:bg-[#0a2747]"
              aria-label="Search"
            >
              <FaMagnifyingGlass />
            </button>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <Link href="/login" className="flex items-center gap-2" aria-label="Login">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b2f55] text-lg">
              <FaUser />
            </span>
            <span className="hidden text-sm font-semibold md:block">Tài khoản</span>
          </Link>
          <Link href="/cart" className="relative flex items-center gap-2" aria-label="Shopping Cart">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b2f55] text-lg">
              <FaBagShopping />
            </span>
            <span className="hidden text-sm font-semibold md:block">Giỏ hàng</span>
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white">
              0
            </span>
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
            <SiNike className="text-base text-orange-400" /> Giày Nike
          </Link>
          <Link href="/brand/adidas" className="flex items-center gap-2 text-white/90 hover:text-white">
            <SiAdidas className="text-base text-yellow-400" /> Giày Adidas
          </Link>
          <Link href="/brand/puma" className="flex items-center gap-2 text-white/90 hover:text-white">
            <SiPuma className="text-base text-red-400" /> Giày Puma
          </Link>
          <Link href="/collections/pickleball" className="flex items-center gap-2 text-white/90 hover:text-white">
            <FaTableTennisPaddleBall className="text-base" /> Pickleball
          </Link>
          <Link href="/categories" className="flex items-center gap-2 text-white/90 hover:text-white">
            <FaPersonRunning className="text-base" /> Thể thao
            <FaChevronDown className="text-xs opacity-80" />
          </Link>
          <Link href="/accessories" className="flex items-center gap-2 text-white/90 hover:text-white">
            <FaBagShopping className="text-base" /> Phụ kiện
            <FaChevronDown className="text-xs opacity-80" />
          </Link>
          <Link href="/sale" className="flex items-center gap-2 text-white/90 hover:text-white">
            <FaBolt className="text-base" /> Sale
          </Link>
          <Link href="/news" className="flex items-center gap-2 text-white/90 hover:text-white">
            <FaNewspaper className="text-base" /> Bảng Tin
          </Link>
        </div>
      </nav>
    </header>
  );
}
