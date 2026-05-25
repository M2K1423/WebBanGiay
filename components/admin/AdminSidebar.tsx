"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaChartPie,
  FaBoxOpen,
  FaCartShopping,
  FaUsers,
  FaArrowRightFromBracket,
  FaStore,
} from "react-icons/fa6";

const MENU = [
  { name: "Dashboard", href: "/admin", icon: FaChartPie },
  { name: "Sản phẩm", href: "/admin/products", icon: FaBoxOpen },
  { name: "Đơn hàng", href: "/admin/orders", icon: FaCartShopping },
  { name: "Khách hàng", href: "/admin/users", icon: FaUsers },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 border-r border-slate-200 bg-white shadow-lg">
      <div className="flex h-16 items-center border-b border-slate-100 px-6">
        <Link href="/admin" className="flex items-center gap-2 text-xl font-bold text-[#0d3a6b]">
          <FaStore className="text-2xl text-rose-500" /> Admin
        </Link>
      </div>

      <div className="flex flex-col justify-between h-[calc(100vh-64px)] p-4 text-slate-700">
        <nav className="space-y-1">
          {MENU.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive ? "bg-[#0d3a6b] text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <item.icon className={isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700"} />
                <span className={isActive ? "select-none text-white" : "select-none text-slate-600 group-hover:text-slate-900"}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 pt-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            <FaArrowRightFromBracket className="text-slate-500" />
            Thoát Admin
          </Link>
        </div>
      </div>
    </aside>
  );
}
