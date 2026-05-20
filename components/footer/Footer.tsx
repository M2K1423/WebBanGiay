"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-lg text-slate-950">
              👟
            </span>
            <span>Solelane</span>
          </div>
          <p className="max-w-sm text-sm leading-6 text-slate-400">
            Cung cấp các đôi giày chất lượng cao với thiết kế hiện đại và giá cả hợp lý.
          </p>
          <div className="flex gap-3">
            <a href="https://facebook.com" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-sm text-white transition hover:bg-amber-400 hover:text-slate-950" aria-label="Facebook">
              f
            </a>
            <a href="https://instagram.com" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-sm text-white transition hover:bg-amber-400 hover:text-slate-950" aria-label="Instagram">
              📷
            </a>
            <a href="https://twitter.com" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-sm text-white transition hover:bg-amber-400 hover:text-slate-950" aria-label="Twitter">
              𝕏
            </a>
            <a href="https://youtube.com" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-sm text-white transition hover:bg-amber-400 hover:text-slate-950" aria-label="YouTube">
              ▶️
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-white">Liên Kết</h3>
          <ul className="space-y-3 text-sm text-slate-400">
            <li>
              <Link href="/about" className="transition hover:text-amber-400">Về Chúng Tôi</Link>
            </li>
            <li>
              <Link href="/products" className="transition hover:text-amber-400">Sản Phẩm</Link>
            </li>
            <li>
              <Link href="/collections" className="transition hover:text-amber-400">Bộ Sưu Tập</Link>
            </li>
            <li>
              <Link href="/blog" className="transition hover:text-amber-400">Blog</Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-white">Hỗ Trợ Khách Hàng</h3>
          <ul className="space-y-3 text-sm text-slate-400">
            <li>
              <Link href="/faq" className="transition hover:text-amber-400">Câu Hỏi Thường Gặp</Link>
            </li>
            <li>
              <Link href="/shipping" className="transition hover:text-amber-400">Giao Hàng</Link>
            </li>
            <li>
              <Link href="/returns" className="transition hover:text-amber-400">Trả Hàng</Link>
            </li>
            <li>
              <Link href="/contact" className="transition hover:text-amber-400">Liên Hệ</Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-white">Liên Hệ</h3>
          <div className="space-y-3 text-sm leading-6 text-slate-400">
            <p>
              <strong>Địa chỉ:</strong> 123 Đường Giày, TP. Hồ Chí Minh
            </p>
            <p>
              <strong>Email:</strong> support@solelane.com
            </p>
            <p>
              <strong>Điện thoại:</strong> +84 (0) 123 456 789
            </p>
            <p>
              <strong>Giờ làm việc:</strong> 8:00 - 18:00 (T2-T6)
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>&copy; {currentYear} Solelane. Bảo lưu mọi quyền.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="transition hover:text-amber-400">Chính sách bảo mật</Link>
            <Link href="/terms" className="transition hover:text-amber-400">Điều khoản sử dụng</Link>
            <Link href="/cookies" className="transition hover:text-amber-400">Chính sách Cookie</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
