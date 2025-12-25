import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, style } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // 针对 Gemini 优化的 Prompt
    const systemPrompt = `你是一位精通中国古典文学的大师。
    请将用户的白话文翻译成古文。
    风格要求：${style}（miaotang: 庄重典雅, jianghu: 豪放不羁, guige: 婉约细腻, shijing: 朴实生动）。
    要求：只返回翻译结果，不要任何多余的解释或引号。`;

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
          maxOutputTokens: 200,
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