"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-lg shadow-sm">
            👟
          </span>
          <span>Solelane</span>
        </Link>

        <nav
          className={`absolute left-0 right-0 top-full border-b border-slate-200 bg-white px-4 py-4 shadow-lg shadow-slate-900/5 transition-all duration-200 md:static md:block md:border-0 md:bg-transparent md:p-0 md:shadow-none ${
            isMenuOpen ? "block" : "hidden"
          } md:block`}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
            <Link href="/" className="text-sm font-medium text-slate-600 transition-colors hover:text-amber-500">
            Trang Chủ
            </Link>
            <Link href="/products" className="text-sm font-medium text-slate-600 transition-colors hover:text-amber-500">
            Sản Phẩm
            </Link>
            <Link href="/collections" className="text-sm font-medium text-slate-600 transition-colors hover:text-amber-500">
            Bộ Sưu Tập
            </Link>
            <Link href="/about" className="text-sm font-medium text-slate-600 transition-colors hover:text-amber-500">
            Về Chúng Tôi
            </Link>
            <Link href="/contact" className="text-sm font-medium text-slate-600 transition-colors hover:text-amber-500">
            Liên Hệ
            </Link>
          </div>
        </nav>

        <div className="hidden min-w-0 flex-1 items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 md:flex md:max-w-sm lg:max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm giày..."
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button className="text-slate-500 transition-colors hover:text-amber-500" aria-label="Search">
            🔍
          </button>
        </div>

        <div className="ml-auto flex items-center gap-3 md:gap-4">
          <Link href="/login" className="text-xl text-slate-700 transition-transform hover:scale-110" aria-label="Login">
            👤
          </Link>
          <Link href="/cart" className="relative text-xl text-slate-700 transition-transform hover:scale-110" aria-label="Shopping Cart">
            <span>🛒</span>
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
              0
            </span>
          </Link>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors hover:border-amber-400 hover:text-amber-500 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
