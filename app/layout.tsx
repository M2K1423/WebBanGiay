import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Script from "next/script";
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
        <Script id="remove-extension-form-attributes" strategy="beforeInteractive">{`
          (() => {
            const attribute = "fdprocessedid";
            const clean = (root) => {
              if (!(root instanceof Element)) return;
              root.removeAttribute(attribute);
              root.querySelectorAll("[" + attribute + "]").forEach((element) => element.removeAttribute(attribute));
            };
            clean(document.documentElement);
            new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (mutation.type === "attributes") clean(mutation.target);
                mutation.addedNodes.forEach(clean);
              });
            }).observe(document.documentElement, {
              subtree: true,
              childList: true,
              attributes: true,
              attributeFilter: [attribute]
            });
          })();
        `}</Script>
        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
