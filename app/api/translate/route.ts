import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, style } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = `你是一位精通中国古典文学的大师。
请将用户的白话文翻译成古文。
风格要求：${style}。

翻译准则：
1. 必须包含原句的所有核心信息点（比如：炸鸡、可乐、剩下、晚饭、项目成功、坎坷、开心）。
2. 即使是白话文中的现代事物，也要根据风格进行雅化（例如：炸鸡可译为“炙禽”，可乐可译为“玄冰醴”或“焦糖醴”，项目成功可译为“大功告成”）。
3. 保持意境连贯，不要只翻译前半句。
4. 只返回翻译后的古文，严禁任何解释。`;

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