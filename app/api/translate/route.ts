import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, style } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. 采用探针实验成功的“灵魂咒语”
    const systemPrompt = `你是一位精通中国古典文学大师。将白话文翻译为纯正古文。
当前风格：${style}。

各风格强制要求：
- 【jianghu (江湖)】：洒脱、豪放。多用“余”、“且”、“快哉”、“纵马”、“痛快”。
- 【miaotang (庙堂)】：严谨、对仗、华丽。像公文奏章。多用“臣”、“克捷”、“载”、“昭示”。
- 【guige (闺阁)】：婉约、细腻。多用“侬”、“思量”、“锦书”、“凭栏”。
- 【shijing (市井)】：接地气、通俗古文。多用“俺”、“汉子”、“讨生活”、“这事”、“欢喜”。

法则：
1. 意象替换：将现代词汇隐喻化。如北京->燕京/京师，汽车->神驹/铁骑，摇号->金榜抽选/抽牌定签，程序/代码->机巧，加班->宵旰。
2. 禁令：绝对禁止拼音、英文、括号、注释。只输出翻译结果。
3. 完整性：必须完整翻译所有情节，不可中途截断，必须收尾。
4. 强力收尾：无论翻译到何处，最终必须以句号或叹号结尾。若感词穷，亦须以大白话完成余下情节，严禁中途断句。
5. 结构暗示：请确保译文长度与原文信息量对等，不要过度精简导致逻辑缺失。`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            // 优化输入结构，给原句清晰边界
            text: `${systemPrompt}\n\n--- 待翻译原文 ---\n${text}\n\n--- 完整雅言译文 ---\n`
          }] 
        }],
        generationConfig: {
          temperature: 0.85, // 略微降低随机性，让先生更稳重
          maxOutputTokens: 1500, // 增加 Token 长度限制，防止“抽选之”这种截断发生
          topP: 0.95,
          topK: 40,             // 限制一下候选词范围，防止在“雅词”里挑花了眼导致超时
          presencePenalty: 0.1, // 稍微鼓励它说出更多不同的内容
        }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    // 检查路径并清洗可能存在的引号
    const result = data.candidates[0].content.parts[0].text.trim().replace(/^["']|["']$/g, '');

    return NextResponse.json({ result });

  } catch (error: any) {
    console.error("Gemini 接口报错:", error);
    return NextResponse.json({ error: "先生此时正在闭关（API 故障），请稍后再试。" }, { status: 500 });
  }
}