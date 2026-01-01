# 🎭 打捞前世书 (AGE-AI)

> **“借古人之口，述今时之心。”** —— 这是一个跨越时空的笔触感应器。

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E)
![Vercel](https://img.shields.io/badge/Vercel-Deploys-white)

## 📜 缘起
AGE-AI 不仅仅是一个翻译工具。它通过语义波动，试图从时空的深处，打捞出那个灵魂在秦汉、魏晋、唐宋、明清曾亲手写下的原稿。

## ✨ 核心意向

- **【时空感应】**：基于通义千问 `qwen-plus` 深度定制，将现代心境精准转化为风雅诗经、绝句律诗、长短句词或秦汉散文。
- **【后世之识】**：每一份墨宝都伴随一段“后世识”批注，以跨时空的视角解读阁下笔尖下的风骨与妙处。
- **【墨宝装裱】**：一键将感应结果装裱为方正的古风长图，去芜存菁，计白当黑，极简排版专为手机分享而生。
- **【雅言广场】**：集合众人的前世手笔。在这里，你可以窥见他人笔下的江湖月色与庙堂忧思。
- **【密缄与传阅】**：支持隐私模式。心事可付诸万民广场传阅，亦可选择“密缄”入库，唯己可知。

## 🛠️ 造物工法

- **前端 (Frontend)**: `Next.js 15` + `Shadcn UI` + `Tailwind CSS 4.0`
- **后端 (Backend)**: `Next.js Route Handlers` + `OpenAI SDK (Qwen)`
- **数据库 (Database)**: `Supabase` (实时打捞与存证)
- **装裱工艺 (Image Export)**: `html-to-image` (Retina 高清渲染)
- **性能监控 (Performance)**: `Vercel Speed Insights` (保持 100 分的丝滑体验)

## 🚀 开启感应

1. **环境准备**:
   复制 `.env.example` 为 `.env.local`，并填入你的 `DASHSCOPE_API_KEY` 与 `SUPABASE` 密钥。

2. **落笔生花**:
   ```bash
   npm install
   npm run dev
3. **打捞脉络**: 访问 http://localhost:3000，输入此时心境，静候前世墨宝。