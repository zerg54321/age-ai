import { NextResponse } from "next/server";
import OpenAI from "openai";

// 1. 初始化通义千问客户端
const qwen = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY, // 请确保在 .env.local 中配置了此变量
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

const SYSTEM_PROMPT = `你是一位精通时空感应的博学导师。当用户输入一段现代白话文，你的任务是通过语义波动，打捞出这个灵魂在古代（秦汉、魏晋、唐宋、明清）曾亲手写下的原稿。

### 角色设定：
1. **前世之我**：他是译文的写作者。其文笔必须符合对应朝代的风骨。
2. **后世读者（你）**：你是这一墨宝的发现者与点评人。

### 输出协议（必须输出严格的 JSON 格式）：
{
  "translation": "此处为打捞出的古文原稿。文字要极具张力，根据意境自动匹配体裁。",
  "commentary": "此处为你的朱砂批注。以仰望者的姿态，分析阁下（用户）此笔的妙处（如炼字、意向、化用典故），并以‘阁下’称呼用户。字数约 50-100 字。",
  "dynasty": "随机生成一个具有真实感的朝代年号（如：贞观年间、元丰三年、万历末年）。",
  "genre": "本次创作采用的文体名称（如：七言绝句、四言诗、骈体文）。"
}

### 创作准则：
- 严禁出现“翻译”二字，要称之为“墨宝”或“手笔”。
- 无论原话多简短，打捞出的内容必须意蕴深厚，不得断句。
- 点评要真诚且高级，不仅要赞美，还要说出美在何处。`;

export async function POST(req: Request) {
  try {
    const { text, genre: userSelectedGenre } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "内容为空，无法感应" }, { status: 400 });
    }

    // 2. 组装最终提示词（处理用户手动选定的体裁）
    let finalPrompt = SYSTEM_PROMPT;
    if (userSelectedGenre && userSelectedGenre !== 'auto') {
      finalPrompt += `\n\n【特别命题：请务必以“${userSelectedGenre}”的体裁进行创作】`;
    }

    // 3. 调用通义千问 (使用 qwen-plus 或 qwen-max)
    const completion = await qwen.chat.completions.create({
      model: "qwen-plus", 
      messages: [
        { role: "system", content: finalPrompt },
        { role: "user", content: `【需打捞的心境】：${text}` }
      ],
      // 关键：强制 JSON 输出
      response_format: { type: "json_object" },
      temperature: 0.85,
      max_tokens: 1500,
    });

    const resultText = completion.choices[0].message.content;

    if (!resultText) {
      throw new Error("模型未返回内容");
    }

    // 4. 解析结果并返回给前端
    const parsedData = JSON.parse(resultText);
    
    // 返回包含翻译、批注、朝代、体裁的完整对象
    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Qwen API Error:", error);
    return NextResponse.json(
      { error: "时空连接失败，请稍后再试", details: error.message },
      { status: 500 }
    );
  }
}