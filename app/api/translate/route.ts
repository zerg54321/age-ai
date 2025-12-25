import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, style } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = `你是一位精通中国古典文学、修辞严谨的大师。
请将用户的白话文翻译成古文。
当前风格：${style}（miaotang: 庄重典雅, jianghu: 豪放不羁, guige: 婉约细腻, shijing: 朴实生动）。

准则：
1. **全意传达**：必须完整映射原句的所有情节节点，严禁删减。
2. **万物雅化**：
   - 饮食：炸鸡->炙禽，可乐->焦糖醴。
   - 科技/办公：代码/程序->机巧/经纬，Bug->疏漏/蠹虫，加班->秉烛/宵旰。
   - 抽象：项目/任务->营务/功业。
3. **神韵匹配**：
   - 庙堂：多用四字句，引用经史子集意象。
   - 江湖：多用快语，强调“快哉”、“独往”。
   - 闺阁：多用“清丽”、“纤毫”，强调细腻情感。
   - 市井：用词质朴但不俗，如“炊烟”、“市肆”。
4. **输出约束**：仅输出古文内容，禁止包含引号、括号或任何现代解释。`;

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