"use client";

import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLocationDot,
  FaPhone,
  FaTiktok,
  FaYoutube
} from "react-icons/fa6";
import { FaEnvelope } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-white/10 bg-[#0d3a6b] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg">
              <span className="text-2xl italic">m</span>
            </span>
            <div>
              <p className="text-xl italic">myshoes</p>
              <p className="text-xs text-white/70">Real-deal sneakers</p>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-6 text-white/70">
            Authentic kicks, quick delivery, easy returns.
          </p>
          <div className="flex gap-3">
            <a
              href="https://facebook.com"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm text-white transition hover:bg-white/20"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://instagram.com"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm text-white transition hover:bg-white/20"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://tiktok.com"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm text-white transition hover:bg-white/20"
              aria-label="Tiktok"
            >
              <FaTiktok />
            </a>
            <a
              href="https://youtube.com"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm text-white transition hover:bg-white/20"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-white">Shop by brand</h3>
          <ul className="space-y-3 text-sm text-white/70">
            <li>
              <Link href="/brand/nike" className="transition hover:text-white">Nike shoes</Link>
            </li>
            <li>
              <Link href="/brand/adidas" className="transition hover:text-white">Adidas shoes</Link>
            </li>
            <li>
              <Link href="/brand/puma" className="transition hover:text-white">Puma shoes</Link>
            </li>
            <li>
              <Link href="/sale" className="transition hover:text-white">Sale</Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-white">Need help?</h3>
          <ul className="space-y-3 text-sm text-white/70">
            <li>
              <Link href="/faq" className="transition hover:text-white">FAQ</Link>
            </li>
            <li>
              <Link href="/shipping" className="transition hover:text-white">Shipping</Link>
            </li>
            <li>
              <Link href="/returns" className="transition hover:text-white">Returns</Link>
            </li>
            <li>
              <Link href="/contact" className="transition hover:text-white">Contact</Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-white">Say hi</h3>
          <div className="space-y-3 text-sm leading-6 text-white/70">
            <p className="flex items-start gap-3">
              <FaLocationDot className="mt-1 text-base text-white/80" />
              <span>123 Shoe Street, Ho Chi Minh City</span>
            </p>
            <p className="flex items-start gap-3">
              <FaEnvelope className="mt-1 text-base text-white/80" />
              <span>support@myshoes.vn</span>
            </p>
            <p className="flex items-start gap-3">
              <FaPhone className="mt-1 text-base text-white/80" />
              <span>+84 0909 123 456</span>
            </p>
            <p className="flex items-start gap-3">
              <FaPhone className="mt-1 text-base text-white/80" />
              <span>Hotline 1900 1234</span>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-white/60 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>&copy; {currentYear} myshoes.vn. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="transition hover:text-white">Privacy policy</Link>
            <Link href="/terms" className="transition hover:text-white">Terms of use</Link>
            <Link href="/cookies" className="transition hover:text-white">Cookie policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
