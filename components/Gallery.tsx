'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Gallery() {
  const [list, setList] = useState<any[]>([])

  const fetchData = async () => {
    // 显式选择字段，确保 commentary 被加载
    const { data } = await supabase
      .from('translations')
      .select('id, original_text, translated_text, commentary, created_at, style_tag, dynasty, genre')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(10)
    if (data) setList(data)
  }

  useEffect(() => { fetchData() }, [])

  return (
    <div className="mt-16 w-full max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-center space-x-4 mb-10">
        <div className="h-[1px] w-20 bg-stone-300"></div>
        <h2 className="text-2xl font-serif text-stone-700">雅言广场</h2>
        <div className="h-[1px] w-20 bg-stone-300"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {list.map((item) => (
          <div key={item.id} className="relative p-8 bg-[#fdfcf8] border border-[#e5e0d0] border-l-4 border-l-[#8e292c] shadow-sm hover:shadow-md transition-all rounded-r-md flex flex-col min-h-[300px]">
            {/* 原文心境 */}
            <p className="text-stone-400 text-[10px] mb-4 font-sans leading-relaxed italic">
              “ {item.original_text} ”
            </p>
            
            {/* 打捞墨宝正文 */}
            <p className="text-xl font-serif text-[#2c1810] leading-loose tracking-wider mb-6">
              {item.translated_text}
            </p>

            {/* 核心新增：后世识点评 - 采用侧记视觉逻辑 */}
            {item.commentary && (
              <div className="mt-auto pt-4 border-t border-stone-100 relative mb-4">
                <div className="absolute -top-2.5 left-0 bg-[#fdfcf8] px-2 text-[9px] text-[#8e292c]/40 tracking-widest">
                  后世识
                </div>
                <p className="text-[11px] leading-relaxed text-[#8e292c]/60 italic">
                  {item.commentary}
                </p>
              </div>
            )}

            {/* 底部信息栏 */}
            <div className="mt-2 flex justify-between items-center text-[9px] text-stone-400 border-t border-dashed border-stone-200 pt-4">
              <span className="font-mono">{new Date(item.created_at).toLocaleDateString()}</span>
              <div className="flex gap-2">
                <span className="px-1.5 py-0.5 border border-stone-200 rounded uppercase text-[8px]">
                  {item.dynasty || '佚名'}
                </span>
                <span className="px-1.5 py-0.5 bg-stone-100 rounded uppercase text-[8px] text-stone-500">
                  {item.genre || item.style_tag}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}