import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 1. 引入 Sonner 的 Toaster 组件
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "装个文化人 - AGE-AI",
  description: "借古人之口，述今时之心",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* children 就是 page.tsx 里的内容 */}
        {children}
        
        {/* 2. 放置通知容器，它会悬浮在所有页面之上 */}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}