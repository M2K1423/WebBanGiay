"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdminRoute ? (
        <Suspense fallback={null}>
          <Header />
        </Suspense>
      ) : null}
      {children}
      {!isAdminRoute ? <Footer /> : null}
    </>
  );
}