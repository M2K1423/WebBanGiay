import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { CartProvider } from "@/features/cart/CartContext";
import SiteChrome from "@/components/site-chrome/SiteChrome";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "vietnamese"],
  variable: "--font-space-grotesk"
});

export const metadata: Metadata = {
  title: "Solelane Shoes",
  description: "Web ban giay hien dai xay dung voi Next.js"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={spaceGrotesk.className}>
        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}