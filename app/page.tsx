"use client"

import { useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import Gallery from "@/components/Gallery"
import { Copy, ImageDown } from "lucide-react"
import { toPng } from 'html-to-image'

interface TranslationResult {
  translation: string;
  commentary: string;
  dynasty: string;
  genre: string;
}

export default function YayanPage() {
  const [inputText, setInputText] = useState("")
  const [style, setStyle] = useState("auto")
  const [isLoading, setIsLoading] = useState(false)
  const [isPublic, setIsPublic] = useState(true)
  const [result, setResult] = useState<TranslationResult | null>(null)
  
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    if (!result) return;
    const shareText = `${result.translation}\n\n—— ${result.dynasty} · ${result.genre}\n\n后世识：${result.commentary}`;
    navigator.clipboard.writeText(shareText);
    toast.success("墨宝已存入行囊");
  };

  const handleExportImage = async () => {
    if (!cardRef.current) return;
    const loadingToast = toast.loading("正在装裱墨宝...");
    try {
      const dataUrl = await toPng(cardRef.current, { 
        backgroundColor: '#fbfaf5',
        cacheBust: true,
        pixelRatio: 2,
        filter: (node) => {
          // 彻底过滤掉带 print:hidden 的所有功能性按钮
          const cls = (node as HTMLElement).className;
          return typeof cls === 'string' ? !cls.includes('print:hidden') : true;
        }
      });
      
      const link = document.createElement('a');
      link.download = `雅言墨宝-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
      toast.dismiss(loadingToast);
      toast.success("墨宝装裱完成");
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("装裱失败");
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error("阁下尚未落笔，先生无从感应。")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, genre: style }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      await supabase.from('translations').insert([{ 
        original_text: inputText, 
        translated_text: data.translation,
        commentary: data.commentary,
        genre: data.genre,
        dynasty: data.dynasty,
        style_tag: style,
        is_public: isPublic 
      }]);

      setResult(data)
      toast.success("感应成功")
    } catch (error: any) {
      toast.error(`感应中断：${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 py-10 px-4 md:px-20 font-serif text-stone-900">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-[0.3em] text-stone-800 uppercase">打捞前世书</h1>
          <p className="text-stone-500 italic text-sm">“寻回另一个时空的笔触”</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <Card className="border-stone-200 shadow-sm md:sticky md:top-10 z-10 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-stone-700">此时心境</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="在此输入你想说的话..."
                className="min-h-[200px] border-stone-200 focus-visible:ring-stone-400 bg-transparent font-sans text-base"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="w-[120px] border-stone-200 font-sans">
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
                  <Button variant={!isPublic ? "default" : "ghost"} size="sm" onClick={() => setIsPublic(false)} className={`h-7 px-3 text-[10px] ${!isPublic ? 'bg-stone-600 text-white shadow-sm' : 'text-stone-400'}`}>密缄</Button>
                  <Button variant={isPublic ? "default" : "ghost"} size="sm" onClick={() => setIsPublic(true)} className={`h-7 px-3 text-[10px] ${isPublic ? 'bg-[#8e292c] text-white shadow-sm' : 'text-stone-400'}`}>传阅</Button>
                </div>
              </div>
              <Button onClick={handleTranslate} disabled={isLoading} className="w-full bg-stone-800 hover:bg-stone-700 text-stone-100 py-6 text-lg font-sans transition-all active:scale-[0.98]">
                {isLoading ? "感应时空中..." : "打捞墨宝"}
              </Button>
            </CardContent>
          </Card>

          <Card ref={cardRef} className="border-stone-300 bg-[#fbfaf5] shadow-md relative min-h-[500px] flex flex-col border-l-4 border-l-stone-400 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />
            
            {result && !isLoading && (
              <div className="absolute top-4 right-4 flex gap-2 z-20 print:hidden">
                <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 text-stone-400 hover:text-[#8e292c] hover:bg-white/50 transition-colors">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleExportImage} className="h-8 w-8 text-stone-400 hover:text-[#8e292c] hover:bg-white/50 transition-colors">
                  <ImageDown className="h-4 w-4" />
                </Button>
              </div>
            )}

            <CardContent className="flex-grow flex flex-col p-8 pt-12 relative">
              {!result && !isLoading ? (
                <div className="flex-grow flex items-center justify-center text-stone-300 italic tracking-[0.2em]">
                  墨池泛起涟漪...
                </div>
              ) : (
                <div className="flex flex-col h-full animate-in fade-in duration-700">
                  <div className="flex-grow">
                    <div className="text-xl leading-[2.2] text-stone-800 tracking-wider text-justify whitespace-pre-wrap font-medium">
                      {result?.translation}
                    </div>
                    <div className="mt-8 flex justify-end items-center gap-2 opacity-50">
                      <span className="h-[1px] w-8 bg-stone-300"></span>
                      <span className="text-[11px] text-stone-500 tracking-tighter">
                        {result?.dynasty} · {result?.genre}
                      </span>
                    </div>
                  </div>

                  <div className="mt-12 pt-6 border-t border-stone-200 relative mb-4">
                    <div className="absolute -top-3 left-0 bg-[#fbfaf5] px-2 text-[10px] text-[#8e292c]/50 tracking-widest uppercase">
                      后世识
                    </div>
                    <p className="text-sm leading-relaxed text-[#8e292c]/70 italic">
                      {result?.commentary}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Gallery />
      </div>
    </main>
  )
}