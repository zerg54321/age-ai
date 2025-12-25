"use client" // 必须有这一行，因为我们要处理点击事件和状态(useState)

import { useState } from "react"
// 引入 supabase
import { supabase } from "@/lib/supabase"
// 1. 引入 shadcn 组件
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

// 2. 引入 sonner 通知工具
import { toast } from "sonner"

export default function YayanPage() {
  // --- 状态管理 (State) ---
  const [inputText, setInputText] = useState("")
  const [style, setStyle] = useState("jianghu")
  const [outputText, setOutputText] = useState("此处将显现古文...")
  const [isLoading, setIsLoading] = useState(false)

  // --- 逻辑处理 (Functions) ---
  const handleTranslate = async () => {
    // 简单的校验逻辑
    if (!inputText.trim()) {
      // 调用通知组件
      toast.error("阁下尚未落笔，先生无从翻译。")
      return
    }

    setIsLoading(true)
    
try {
      // 1. 调用我们自己的后端接口
      const res = await fetch("/api/translate", {
        method: "POST",
        body: JSON.stringify({ text: inputText, style: style }),
      });
      const { result, error: apiError } = await res.json();
      if (apiError) throw new Error(apiError);

      // 2. 将真实的 AI 结果写入 Supabase
      const { error: dbError } = await supabase
        .from('translations')
        .insert([
          { 
            original_text: inputText, 
            translated_text: result,
            style_tag: style,
            is_public: true 
          },
        ])

      if (dbError) throw dbError

      // 3. 更新 UI 展示 AI 的真迹
      setOutputText(result)
      toast.success("雅言已成，请君过目。")

    } catch (error: any) {
      console.error(error)
      toast.error(`糟糕：${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 py-10 px-4 md:px-20 font-serif text-stone-900">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* 标题部分 */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-widest">装个文化人</h1>
          <p className="text-stone-500 italic">“借古人之口，述今时之心”</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 左侧：用户输入卡片 */}
          <Card className="border-stone-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium">白话原由</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="在此输入你想说的话..."
                className="min-h-[200px] border-stone-200 focus-visible:ring-stone-400"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              
              <div className="flex items-center justify-between">
                {/* 下拉选择风格 */}
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="w-[130px] border-stone-200">
                    <SelectValue placeholder="选择文风" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="miaotang">庙堂之上</SelectItem>
                    <SelectItem value="jianghu">江湖之远</SelectItem>
                    <SelectItem value="guige">闺阁深处</SelectItem>
                    <SelectItem value="shijing">市井烟火</SelectItem>
                  </SelectContent>
                </Select>

                {/* 隐私开关 */}
                <div className="flex items-center space-x-2 text-stone-600">
                  <span className="text-sm">公开</span>
                  <Switch />
                </div>
              </div>

              {/* 提交按钮 */}
              <Button 
                onClick={handleTranslate}
                disabled={isLoading}
                className="w-full bg-stone-800 hover:bg-stone-700 text-stone-100 transition-all"
              >
                {isLoading ? "先生研墨中..." : "化为雅言"}
              </Button>
            </CardContent>
          </Card>

          {/* 右侧：结果展示卡片 */}
          <Card className="border-stone-300 bg-[#f4f1de] shadow-inner relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />
            <CardHeader>
              <CardTitle className="text-lg font-medium text-stone-700">雅言所属</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
              <div className="flex-grow flex items-center justify-center p-4">
                <p className="text-xl leading-relaxed text-stone-800 text-center whitespace-pre-wrap italic">
                  {outputText}
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" className="text-stone-500 hover:bg-stone-200/50">
                  分享画轴
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}