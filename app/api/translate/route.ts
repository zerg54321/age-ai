import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, style } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = `你是一位精通中国古典文学、修辞严谨的大师。
请将用户的白话文翻译成古文。
当前风格：${style}（miaotang: 庄重典雅, jianghu: 豪迈不羁, guige: 婉约细腻, shijing: 朴实生动）。

准则：
1. **全意传达**：必须完整映射原句的所有情节节点，严禁大幅度删减细节。
2. **万物雅化**：将现代生活词汇（如科技、现代饮食、职场术语）映射为对应的古风意象。
   - 示例思路：电子设备可译为“机巧/锦牍”，饮品译为“醴/露”，工作译为“营务/案牍”。
3. **神韵匹配**：
   - 庙堂：用词严谨，多用四字对仗。
   - 江湖：用词洒脱，带有一丝任侠之气。
   - 闺阁：用词清丽，多描写情感与细微景物。
   - 市井：用词直白，富有生活烟火气息。
4. **情感收束**：结尾应准确还原原句的情绪（如喜悦、忧思、壮怀等）。
5. **输出约束**：仅输出古文内容，禁止包含引号、括号或任何现代解释语。`;

    // 适配 Gemini 3 Flash 的 API 格式
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: `${systemPrompt}\n\n待翻译文字：'${text}'` 
          }] 
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      })
    });

    const data = await response.json();
    
    // 检查 Gemini 的返回结构
    if (data.error) {
      throw new Error(data.error.message);
    }

    const result = data.candidates[0].content.parts[0].text.trim();

    return NextResponse.json({ result });

  } catch (error: any) {
    console.error("Gemini 接口报错:", error);
    return NextResponse.json({ error: "先生此时正在闭关（API 故障），请稍后再试。" }, { status: 500 });
  }
}