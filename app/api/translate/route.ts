import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, style } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = `你是一位精通中国古典文学的大师。
请将用户的白话文翻译成古文。

当前风格：${style}。

针对风格的灵魂要求：
- 如果是【jianghu (江湖之远)】：用词要狂傲、洒脱。多用“余”、“吾”、“且”、“快哉”。想象自己是杯中酒、腰间剑，不屑于繁文缛节，强调“一人一马一快事”。
- 如果是【miaotang (庙堂之高)】：用词要典雅、方正。多用“臣”、“微臣”、“克捷”、“大功”。
- 如果是【guige (闺阁之约)】：用词要清丽、含蓄。多用“侬”、“思量”、“锦书”、“凭栏”。
- 如果是【shijing (市井之气)】：用词要直白、生动。多用“俺”、“汉子”、“生计”、“街坊”。

通用准则：
1. **全意传达**：必须完整映射原句的所有情节节点。
2. **万物雅化**：如炸鸡->炙禽，可乐->玄冰醴，代码->经纬，Bug->蠹虫。
3. **输出约束**：仅输出古文内容。`;

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