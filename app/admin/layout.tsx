"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getFirebaseAuth } from "@/lib/firebase";
import { getApiBaseUrl } from "@/features/auth/utils";
import { onAuthStateChanged } from "firebase/auth";
import { 
  FaChartPie, 
  FaBoxOpen, 
  FaCartShopping, 
  FaUsers, 
  FaArrowRightFromBracket,
  FaStore
} from "react-icons/fa6";

const MENU = [
  { name: "Dashboard", href: "/admin", icon: FaChartPie },
  { name: "Sản phẩm", href: "/admin/products", icon: FaBoxOpen },
  { name: "Đơn hàng", href: "/admin/orders", icon: FaCartShopping },
  { name: "Khách hàng", href: "/admin/users", icon: FaUsers },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = getFirebaseAuth();
    
    if (!auth) {
      router.push("/");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }

      try {
        const res = await fetch(`${getApiBaseUrl()}/users/${user.uid}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.isAdmin) {
            setIsAdmin(true);
          } else {
            router.push("/");
          }
        } else {
          router.push("/");
        }
      } catch (err) {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isAdmin === null) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0d3a6b] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center border-b border-slate-100 px-6">
          <Link href="/admin" className="flex items-center gap-2 text-xl font-bold text-[#0d3a6b]">
            <FaStore className="text-2xl text-rose-500" /> Admin
          </Link>
        </div>
        
        <div className="flex flex-col justify-between h-[calc(100vh-64px)] p-4">
          <nav className="space-y-1">
            {MENU.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#0d3a6b] text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <item.icon className={isActive ? "text-white/80" : "text-slate-400"} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="border-t border-slate-100 pt-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <FaArrowRightFromBracket className="text-slate-400" />
              Thoát Admin
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
