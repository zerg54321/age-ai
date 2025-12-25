'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Gallery() {
  const [list, setList] = useState<any[]>([])

  const fetchData = async () => {
    const { data } = await supabase
      .from('translations')
      .select('*')
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
          <div key={item.id} className="relative p-8 bg-[#fdfcf8] border border-[#e5e0d0] border-l-4 border-l-[#8e292c] shadow-sm hover:shadow-md transition-shadow rounded-r-md">
            <p className="text-stone-400 text-xs mb-4 font-sans leading-relaxed">
              “ {item.original_text} ”
            </p>
            <p className="text-xl font-serif text-[#2c1810] leading-loose tracking-wider">
              {item.translated_text}
            </p>
            <div className="mt-6 flex justify-between items-center text-[10px] text-stone-400 border-t border-dashed border-stone-200 pt-4">
              <span className="font-mono">{new Date(item.created_at).toLocaleDateString()}</span>
              <span className="px-2 py-0.5 border border-stone-300 rounded uppercase">{item.style_tag}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}