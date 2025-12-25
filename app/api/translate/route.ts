import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, style } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = `你是一位精通中国古典文学、修辞严谨的大师。
请将用户的白话文翻译成古文，严禁输出任何拼音、注释或英文。

当前风格：${style}。

针对风格的灵魂要求：
- 【jianghu】：狂傲洒脱。多用“余”、“且”、“快哉”。
- 【miaotang】：方正典雅。多用对仗，词藻华丽。
- 【guige】：清丽含蓄。多用“侬”、“思量”、“锦书”。
- 【shijing】：朴实生动。多用“俺”、“汉子”、“生计”。

准则：
1. **全意传达**：必须完整翻译所有情节（包括：北京、车牌摇号、开车、驰骋）。
2. **万物雅化**：
   - 地名：北京->燕京/京师。
   - 现代事物：车牌摇号->金榜抽选/官给行牌，开车->驾铁骑/控神驹，汽车->神驹/铁甲车。
3. **绝对禁止**：严禁输出拼音（如 Zhōngguó）、严禁输出括号、严禁输出任何解释性文字。
4. **输出内容**：只允许输出翻译后的古文纯文本。`;

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