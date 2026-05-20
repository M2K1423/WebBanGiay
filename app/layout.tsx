import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
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
      <body className={spaceGrotesk.variable}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}