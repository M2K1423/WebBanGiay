"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getFirebaseAuth } from "@/lib/firebase";
import { getApiBaseUrl } from "@/features/auth/utils";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

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
        const token = await user.getIdToken();
        const res = await fetch(`${getApiBaseUrl()}/users/${user.uid}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
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
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />
      <main className="ml-64 h-screen min-w-0 flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
