import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 1. 引入 Sonner 的 Toaster 组件
import { Toaster } from "@/components/ui/sonner";
// 引入 Speed Insights 组件
import { SpeedInsights } from "@vercel/speed-insights/next";

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

        {/* 3. 性能监测组件：它只在生产环境中运行，不会影响开发体验 */}
        <SpeedInsights />
      </body>
    </html>
  );
}