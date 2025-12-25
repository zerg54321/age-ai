"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import Gallery from "@/components/Gallery"

// --- 定义结果接口 ---
interface TranslationResult {
  translation: string;
  commentary: string;
  dynasty: string;
  genre: string;
}

export default function YayanPage() {
  // --- 状态管理 ---
  const [inputText, setInputText] = useState("")
  const [style, setStyle] = useState("auto") // 默认改为 auto，让先生自裁
  const [isLoading, setIsLoading] = useState(false)
  const [isPublic, setIsPublic] = useState(true)

  // 核心改动：将 outputText 升级为对象状态
  const [result, setResult] = useState<TranslationResult | null>(null)

  // --- 逻辑处理 ---
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error("阁下尚未落笔，先生无从感应。")
      return
    }

    setIsLoading(true)
    
    try {
      // 1. 调用后端接口 (现在返回的是 JSON)
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, genre: style }),
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // 2. 将结果写入 Supabase (包含新增的字段)
      const { error: dbError } = await supabase
        .from('translations') // 确保这里是你真实的表名
        .insert([
          { 
            original_text: inputText, 
            translated_text: data.translation,
            commentary: data.commentary, // 新增
            genre: data.genre,           // 新增
            dynasty: data.dynasty,       // 新增
            style_tag: style,
            is_public: isPublic 
          },
        ])

      if (dbError) throw dbError

      // 3. 更新 UI 状态
      setResult(data)
      toast.success("跨时空感应成功，前世墨宝已现。")

    } catch (error: any) {
      console.error(error)
      toast.error(`感应中断：${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 py-10 px-4 md:px-20 font-serif text-stone-900">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* 标题部分 */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-[0.3em] text-stone-800">打捞前世书</h1>
          <p className="text-stone-500 italic text-sm">“寻回另一个时空的笔触”</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* 左侧：输入卡片 */}
          <Card className="border-stone-200 shadow-sm sticky top-10">
            <CardHeader>
              <CardTitle className="text-lg font-medium">此时心境</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="在此输入你想说的话..."
                className="min-h-[200px] border-stone-200 focus-visible:ring-stone-400 bg-white/50"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              
              <div className="flex items-center justify-between">
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="w-[120px] border-stone-200">
                    <SelectValue placeholder="先生自裁" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">先生自裁</SelectItem>
                    <SelectItem value="诗经体">风雅诗经</SelectItem>
                    <SelectItem value="绝句">绝句律诗</SelectItem>
                    <SelectItem value="宋词">长短句词</SelectItem>
                    <SelectItem value="秦汉散文">秦汉散文</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-md border border-stone-200">
                  <Button
                    variant={!isPublic ? "default" : "ghost"} 
                    size="sm"
                    onClick={() => setIsPublic(false)}
                    className={`h-7 px-3 text-[10px] ${!isPublic ? 'bg-stone-600 text-white shadow-sm' : 'text-stone-400'}`}
                  >密缄</Button>
                  <Button
                    variant={isPublic ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setIsPublic(true)}
                    className={`h-7 px-3 text-[10px] ${isPublic ? 'bg-[#8e292c] text-white shadow-sm' : 'text-stone-400'}`}
                  >传阅</Button>
                </div>
              </div>

              <Button 
                onClick={handleTranslate}
                disabled={isLoading}
                className="w-full bg-stone-800 hover:bg-stone-700 text-stone-100 py-6 text-lg"
              >
                {isLoading ? "感应时空中..." : "打捞墨宝"}
              </Button>
            </CardContent>
          </Card>

          {/* 右侧：结果展示（重点重构区） */}
          <Card className="border-stone-300 bg-[#fbfaf5] shadow-md relative min-h-[450px] flex flex-col border-l-4 border-l-stone-400">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />
            
            <CardContent className="flex-grow flex flex-col p-8 pt-12 relative group">
              {!result && !isLoading ? (
                <div className="flex-grow flex items-center justify-center text-stone-300 italic tracking-widest">
                  墨池泛起涟漪...
                </div>
              ) : (
                <div className="flex flex-col h-full animate-in fade-in duration-1000">
                  {/* 1. 正文：去除突出的首字下沉，改用自然的古籍排版 */}
                  <div className="flex-grow">
                    <div className="text-xl leading-[2] text-stone-800 tracking-wider text-justify whitespace-pre-wrap font-medium">
                      {result?.translation}
                    </div>
                    
                    {/* 2. 极简落款：像呼吸一样自然 */}
                    <div className="mt-6 flex justify-end items-center gap-2 opacity-40 hover:opacity-100 transition-opacity duration-500">
                      <span className="h-[1px] w-8 bg-stone-300"></span>
                      <span className="text-[10px] text-stone-500 tracking-tighter">
                        {result?.dynasty} · {result?.genre}
                      </span>
                    </div>
                  </div>

                  {/* 3. 这里的朱批改用“侧记”感，不再用厚重的背景 */}
                  <div className="mt-10 pt-6 border-t border-stone-100 relative">
                    <div className="absolute -top-3 left-0 bg-[#fbfaf5] px-2 text-[10px] text-[#8e292c]/50 tracking-widest">
                      后世识
                    </div>
                    <p className="text-sm leading-relaxed text-[#8e292c]/70 italic selection:bg-[#8e292c]/10">
                      {result?.commentary}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 底部：雅言广场 */}
        <Gallery />
      </div>
    </main>
  )
}