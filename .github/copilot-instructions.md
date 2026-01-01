<!-- Copilot / AI agent 指令（项目专用，精简版） -->
# AGE-AI — 快速上手（给 AI 代码助手）

目的：在最短时间内让 AI 助手理解本仓库的架构、约定与高风险改动点。

- 架构速览：Next.js 14（app/）前端 + Next API 路由后端（app/api/translate/route.ts）+ Supabase（lib/supabase.ts）。

- 关键实现（请优先阅读并谨慎修改）
  - 模型调用与强制 JSON 输出：[app/api/translate/route.ts](app/api/translate/route.ts#L44-L54)
  - 后端 JSON 解析点（必须保持 schema）：[app/api/translate/route.ts](app/api/translate/route.ts#L63)
  - 前端调用与请求体示例：[app/page.tsx](app/page.tsx#L41-L45)
  - 前端写入 DB（字段映射示例）：[app/page.tsx](app/page.tsx#L51-L63)

- 必知约定
  - API 必须返回严格 JSON，含 `translation`, `commentary`, `dynasty`, `genre`。前端/DB 均依赖这些字段。
  - 禁止在系统提示里写“翻译”二字（改用“墨宝”“手笔”），见 [app/api/translate/route.ts](app/api/translate/route.ts#L10-L27)。
  - Supabase 单例在 `lib/supabase.ts`，前端直接导入使用。

- 环境与运行
  - 必需 env：`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DASHSCOPE_API_KEY`。
  - 常用命令：`npm run dev`, `npm run build`, `npm run start`, `npm run lint`。

- 风险与变更须知
  - 绝不可随意更改后端返回字段名或将响应改成文本/HTML。若需新增字段：先在 `route.ts` 输出 → 更新 `app/page.tsx` 的 `.insert()` 映射 → 数据库迁移。
  - 修改模型参数（temperature/max_tokens）时，请同时验证 `completion.choices[0].message.content` 的提取逻辑无误。

- 调试小贴士
  - 前端报解析错误：在服务端打印 `completion.choices[0].message.content` 查看原始文本。
  - DB 写入失败：复核 env 与表结构，查看 `components/Gallery.tsx` 的查询示例。

若需把说明扩展为更详细的开发流程（CI、迁移脚本、行号更多示例），告知我要添加的内容。 
