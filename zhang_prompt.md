# zhang_prompt.md

<!--
姓名：【张婧雅】 | 学号：【24005240115】 | 时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
-->

本文件记录本项目每一次发给 AI 的开发指令，**只追加，不覆盖**。
格式：时间 | 提示词全文 | 大模型名称

---

## 2026-11-09 12:00:00 | DeepSeek-V4.1-Flash

提示词全文：

> 在当前项目根目录创建 AGENTS.md，写入以下规则。
>
> ## 项目结构与技术栈
> - 前端：frontend/ 目录
>   - 原生 HTML、CSS、JavaScript，禁止使用任何第三方库、框架、CDN 链接
>   - 目录结构：frontend/ 下建 css/、js/、fonts/、images/ 子目录；
>     fonts/ 存放 iconfont 图标文件（如果有）
> - 后端：backend/ 目录，Node.js + Express，RESTful+MVC 风格，
>   所有接口以 /api/ 为前缀，端口固定为 8115（你的学号后3位），
>   并以 express.static 托管 frontend/ 目录
>   后端支持所有跨域访问。
> - 后端依赖安装：优先 cnpm i 包名；失败或超时则使用 npm i 包名
> - 数据库： MySQL （用户名root、密码：root）
>   - 数据库凭据写入 backend/.env（变量名：DB_USER、DB_PASSWORD、
>     DB_HOST、DB_NAME），不得出现在代码或 AGENTS.md 中；
>     .env 同时加入 .gitignore
> - 根据后端的要求自行建立和修改数据库表，每张表建立后，插入至少 8 条有真实业务意义的测试数据
>
> ## 命名与注释
> - CSS 类名、JS 变量名、JS 函数名、数据库表名（及字段相关命名）
>   一律以 zhang_ 开头
> - 每个文件头部包含注释块：
>   姓名：【张婧雅】 | 学号：【24005240115】 |
>   时间：yyyy-mm-dd | 大模型：{本次使用的大模型名称}
>
> ## 记录文件（一律追加写入，禁止覆盖已有内容）
> - zhang_prompt.md（项目根目录）：每次向 AI 发出开发指令后，
>   追加记录：时间 | 提示词全文 | 大模型名称
> - backend/zhang_interface.md：每次创建或修改接口后，追加：
>   接口路径 | HTTP 方法 | 请求参数（含示例）|
>   响应格式（含 JSON 示例）| 修改时间
> - backend/zhang_database.md：每次建表、改表或插入数据后，
>   按执行顺序追加对应 SQL 语句（含测试数据的 INSERT），
>   要求仅凭此文件即可在新机器上完整重建数据库
> - 统一 JSON 响应格式：{ "code": 0, "msg": "提示信息", "data": {...} }，
>   code=0 表示成功，非 0 表示失败
> ## 前端约定
> - 服务器返回的数据和错误信息输出到浏览器控制台（console.log /
>   console.error）；
> - 新建 HTML 页面后，在 frontend/index.html 中追加超链接入口；
>   文件名包含 detail 的页面除外

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-09 15:52:00 | DeepSeek-V4.1-Flash

提示词全文：

> 基于vibe coding的全栈项目的开发基本流程
> （零） 安装node.js,24以上版本，尽量已安装cnpm。
> （一）创建项目（文件夹），设立规则AGENTS.md
>      修改给定提示词，也可自行设置提示词。
> （二） 初始化项目。帮我检查一下项目把没有创建过的创建一下

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-09 16:05:00 | DeepSeek-V4.1-Flash

提示词全文：

> 创建运行后台的bat文件，在根目录下。

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-09 16:10:00 | DeepSeek-V4.1-Flash

提示词全文：

> 请初始化本项目：
> 1、 git init + .gitignore（排除 node_modules、.env）+ 首次提交
> 2、按 AGENTS.md 规则创建前后端目录骨架、安装依赖、
> 3、创建前端首页index.html，包括姓名**、学号**、项目名称、项目类别（自选、模仿），所有完成的html页面的超链接。有canvas背景动画。主体是页面链接导航。页面美观。
> 4、创建readme.md，在根目录下，包括学号、姓名。

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-09 16:22:00 | DeepSeek-V4.1-Flash

提示词全文：

> 创建database.html页面，输入用户名，密码，链接数据库，数据库使用mysql，成功和错误都有提示，默认用户名root，密码root。

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-09 16:45:00 | DeepSeek-V4.1-Flash

提示词全文：

> 完成科技新闻列表页面，新闻的数据存在数据库表里。网页显示后端接口链接和数据内容

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-09 17:10:00 | DeepSeek-V4.1-Flash

提示词全文：

> 完成图文列表，图片可以使用网络图片或创建图片，创建一个新的表，网页显示后端接口链接和数据内容。

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-12 10:00:00 | DeepSeek-V4.1-Flash

提示词全文：

> 创建AI聊天页面。
> Api-key： sk-********（已脱敏），
> curl --request POST \
>   --url https://api.siliconflow.cn/v1/chat/completions \
>   -H "Content-Type: application/json" \
>   -H "Authorization: Bearer YOUR_API_KEY" \
>   -d '{
>     "model": "deepseek-ai/DeepSeek-V4-Flash",
>     "messages": [
>       {"role": "system", "content": "你是一个有用的助手"},
>       {"role": "user", "content": "你好，请介绍一下你自己"}
>     ]
>   }'，在控制台里输出发送给大模型的数据和从大模型接收到的数据

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-12 16:30:00 | DeepSeek-V4.1-Flash

提示词全文：

> 完成知识库文件上传，构建2个知识库文件，完成基于知识库的问答，支持doc和docx，ppt等，完成知识库管理（RAG）：基于本地文件（如PDF/TXT）上传、解析，构建专属自动客服或问答系统，包括知识库文件上传模块。在控制台输出发送给大模型的数据和接受大模型的数据。

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-16 15:20:00 | DeepSeek-V4.1-Flash

提示词全文：

> 完成商业评论情感分类功能，用户上传excel文件，文件里是若干商业评论，llm对每条评论进行分类：好评、中评、差评，前端接受llm返回的数据，显示为饼状图，显示精选评论，生成3个excel模拟数据文件，每个有20条数据，大模型发送和接受的数据都在控制台显示。帮我继续完成上面的内容

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-16 16:49:55 | DeepSeek-V4.1-Flash

提示词全文：

> `https://cloud.siliconflow.cn/me/models`帮我在这个模型广场里面找一个语音识别和一个图像识别的模型根据指导书做出来

（随附文件：`LLM应用设计-实验指导书.docx`）

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-16 20:25:06 | DeepSeek-V4.1-Flash

提示词全文：

> 为什么我自己的录音识别不了内容   能不能给我修改一下可以识别任何语言

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-19 12:42:00 | DeepSeek-V4.1-Flash

提示词全文：

> 帮我修改语音识别 使其能适应所有国家语言

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-19 15:58:00 | DeepSeek-V4.1-Flash

提示词全文：

> 实现登录与注册
> KT3_HTML 表单、
> KT20_JavaScript DOM、
> KT25_JSON 和 AJAX
>
> 评分标准：具备登录、注册两个页面及对应接口；表单含基本控件与校验；登录状态可保持（session 或 token 均可）；高阶功能（如 “密码加密存储” 与 “图形验证码” 等）至少实现 1 项。扣分：缺登录页或注册页任一项扣 1 分；表单无任何自定义 CSS 扣 1 分；登录状态无法保持扣 1 分；密码加密存储与图形验证码等高阶功能均未实现扣 1 分（实现任一即不扣）扣完为止。
> 分值：5
>
> 先提供选项帮助我完成选型

选型结果（用户确认）：

- 登录状态：JWT Token（localStorage 保存，请求头 Authorization: Bearer）
- 高阶功能：密码 scrypt 加盐哈希存储 + 服务端生成图形验证码（两项均实现）
- 实现依赖：Node 内置 crypto，零新增依赖
- 登录状态展示：仅在登录页展示当前用户与退出登录

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-19 16:05:00 | DeepSeek-V4.1-Flash

提示词全文：

> 注册登录在右上角导航上面也设置一下

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-19 16:45:00 | DeepSeek-V4.1-Flash

提示词全文：

> 完成后台管理系统，管理员登录的页面包含管理员的用户名和密码，提示信息不用默认的 prompt，自己封装一个。左右结构，有项目名称和 logo。标准：后台至少管理 3 个实体，每个实体具备增、删、改、查（列表），并包含搜索、分页；管理页面覆盖列表与详情主要内容；未登录访问管理接口被拦截。扣分（实体管理组）：管理实体不足 3 个每少 1 个扣 1 分；任一实体缺增 / 删 / 改 / 查任一项每缺 1 项扣 0.5 分；缺搜索或分页任一项扣 1 分；管理内容未覆盖列表或详情主要内容扣 1 分；鉴权失效（未登录可访问管理接口）扣 1 分；扣完为止。
>
> 具备仪表盘或其他适合使用图表的页面，合理选用图表展示数据，图表由后端接口真实数据驱动，图表与数据匹配、可读性良好。扣分：后台无仪表盘页面扣 1 分；有仪表盘但无图表扣 2 分；图表无法显示扣 2 分；静态写死数据或截图替代扣 2 分；图表与数据不匹配每处扣 1 分；可读性差每处扣 1 分；扣完为止。

实现说明：

- 新增 `zhang_admin` 管理员表（8 条测试数据，密码 admin123456，scrypt 加盐哈希）
- 管理实体 3 个：科技新闻 `zhang_news`、农产品 `zhang_produce`、用户 `zhang_user`
- 每个实体均实现列表、详情、新增、修改、删除，并支持关键词搜索与分页
- `/api/admin/*` 全部接口由 `zhang_adminAuth` 中间件校验管理员令牌，未登录 / 伪造令牌返回 401
- 前端 `frontend/admin/`：左右结构登录页（项目名称 + Logo）、侧边栏布局、自定义提示 toast 与模态框（不使用 prompt / alert / confirm）
- 仪表盘 4 个原生 Canvas 图表：新闻分类柱状图、农产品库存环形图、近 30 天注册趋势折线图、库存 Top5 横向条形图，数据来自 `/api/admin/dashboard` 实时聚合

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-23 15:50:00 | DeepSeek-V4.1-Flash

提示词全文：

> 链接supbase，sb_secret_********（已脱敏）

选型结果（用户确认）：

- 接入方式：接入 Supabase 用户鉴权（保留原有自研登录与 MySQL 业务数据）
- 项目 URL：用户暂未提供，先在配置与代码层完成接入，待补 URL 后即可启用

实现说明：

- `backend/.env` 新增 `SUPABASE_URL`（留空待填）与 `SUPABASE_SECRET_KEY`（服务端专用，已被 `.gitignore` 忽略）
- 新增 `backend/services/zhang_supabaseService.js`：基于 Node 原生 fetch 调用 Supabase GoTrue REST 接口，零新增依赖
- 新增 `backend/controllers/zhang_supabaseAuthController.js` 与 `backend/routes/zhang_supabaseAuth.js`
- 新增接口：`GET /api/auth/supabase/status`、`POST /api/auth/supabase/register`、`POST /api/auth/supabase/login`、`GET /api/auth/supabase/me`
- 登录成功后自动同步本地 `zhang_user` 资料并签发本站令牌，原有用户接口可继续使用
- 未填写 `SUPABASE_URL` 时接口返回明确的中文配置提示，而非报错

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-23 15:49:00 | DeepSeek-V4.1-Flash

提示词全文：

> {
>   "servers": {
>     "supabase": {
>       "type": "http",
>       "url": "`https://mcp.supabase.com/mcp?project_ref=mbaoiodmgwxyzdidhpcg&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cfeedback%2Cnotebooks`"
>     }
>   }
> }

实现说明：

- 在 `.trae/mcp.json` 写入上述 MCP 服务器配置（已去除 URL 外层误加的反引号，保证 JSON 与 URL 合法）
- 从配置中的 `project_ref=mbaoiodmgwxyzdidhpcg` 推导出 Supabase 项目 URL，填入 `backend/.env` 的 `SUPABASE_URL`
- 重启后端并实测真实 Supabase 项目：
  - `GET /api/auth/supabase/status` 返回 `configured:true`
  - `POST /api/auth/supabase/register` 创建 `supatest@zhangfarm.cn`、`supatest2@zhangfarm.cn` 成功（中文昵称正常）
  - `POST /api/auth/supabase/login` 返回 Supabase 会话与本站令牌，并同步本地 `zhang_user`
  - `GET /api/auth/supabase/me` 携带 accessToken 可正确取回用户信息

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-23 15:51:00 | DeepSeek-V4.1-Flash

提示词全文：

> mcp连接上了吗

排查与修复说明：

- 查看 Trae 日志发现 MCP 一直报 `Configuration error {"command": ""}`：IDE 实际读取的配置是 `C:\Users\ASUS\AppData\Roaming\Trae CN\User\mcp.json`（`mcpServers` 结构），其中 `supabase-mcp` 为空对象
- 将该用户级配置改写为 http 类型并填入 MCP URL，同时删除未被读取的 `.trae/mcp.json`（`servers` 结构不被本版本识别）
- 修复后日志变为 `MCP server authentication failed`，说明 URL 已识别，但仍需在 MCP 面板完成 Supabase OAuth 授权登录才能连接

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-23 16:00:00 | DeepSeek-V4.1-Flash

提示词全文：

> npx skills add supabase/agent-skills

执行说明：

- `npx skills add` 在 git clone 阶段因本机 SSL 证书链问题失败（`unable to get local issuer certificate`）
- 改用官方仓库压缩包下载（codeload）后按 skill-creator 规范手工安装到全局技能目录 `C:\Users\ASUS\.trae-cn\skills\`
- 安装 2 个技能：`supabase`（4 个文件）、`supabase-postgres-best-practices`（36 个文件），已做 SHA256 清单比对，与源仓库完全一致

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-23 16:36:41 | DeepSeek-V4.1-Flash

提示词全文：

> 完成一个ai新闻列表功能，服务器使用supabase，通过mcp操控，只修改frontend目录 不修改backend目录，cdn文件下载到本地。需要建表，表里有20条有意义的模拟数据。所有数据库信息写在根目录的database.md文件里。

执行说明：

- 通过 Supabase MCP 在项目 `mbaoiodmgwxyzdidhpcg` 中新建 `public.zhang_ai_news` 表，开启 RLS 并添加匿名只读策略，写入 20 条有业务含义的 AI 新闻模拟数据
- 未修改 `backend/` 目录任何文件
- `@supabase/supabase-js` v2.119.2 UMD 构建已下载到 `frontend/js/vendor/supabase-js.umd.min.js`，页面不引用任何 CDN
- 新增 `frontend/ai-news.html`、`frontend/css/zhang_ai_news.css`、`frontend/js/zhang_ai_news.js`，实现搜索、分类筛选、排序、分页、详情弹层，并在浏览器控制台输出查询参数与返回数据
- `frontend/index.html` 页面导航追加 `ai-news.html` 入口
- 根目录新增 `database.md`，记录连接信息、建表 SQL、字段说明、索引、RLS 策略、20 条 INSERT、前端查询方式与重建步骤
- 浏览器实测：列表显示「共 20 条」，卡片、封面、详情弹层均正常，无错误提示

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-26 15:58:54 | DeepSeek-V4.1-Flash

提示词全文：

> `d:\高级网页设计\zhang\frontend\files\个人简历-张婧雅-市场版.docx`根据给定doc完成HTML网页的设计，能展示大学生简历，页面美观，有camras背景动画

执行说明：

- 解析 docx 中的全部文字内容，整理为 7 个模块：个人概述、教育背景、专业技能、AI 工具使用、项目经历、实践经历与荣誉、自我评价
- 新增 `frontend/resume.html`，采用左侧深色信息栏 + 右侧正文的双栏简历布局，附顶部打印按钮
- 新增 `frontend/css/zhang_resume.css`，包含响应式断点与 A4 打印样式
- 新增 `frontend/js/zhang_resume.js`，实现 Canvas 粒子连线背景动画（含鼠标交互、DPR 适配、减少动效偏好处理）、滚动入场动画与打印功能
- `frontend/index.html` 页面导航追加 `resume.html` 入口（第 18 个）
- 浏览器实测通过：左右栏内容完整、Canvas 背景动画正常、打印按钮可见、控制台无报错

大模型名称：DeepSeek-V4.1-Flash

---



## 2026-11-26 16:41:34 | DeepSeek-V4.1-Flash

提示词全文：

> /plan 完成一个新的首页，只包括纯前端页面和基于supabase的页面的超链接，简历在其中，突出它。使用后台接口的页面，每个页面新建一个对应的说明的html，包括该页面的截图和说明，美观展示。

执行说明：

- 原 `frontend/index.html` 另存为 `frontend/pages.html`（页面导航存档，改为纯静态页面，移除服务状态检测与 main.js）
- 重写 `frontend/index.html` 为新首页：只收录 `resume.html`、`ai-news.html`、`pages.html` 三个纯前端 / Supabase 页面，简历独立成突出展示区
- 新增 `frontend/css/zhang_home.css`：深色主题首页样式，含简历突出区、纯前端卡片、说明页网格与响应式断点
- 新增 `frontend/css/zhang_guide.css`：接口页面说明页样式，含浏览器窗口式截图框、接口表格、方法色块与上下页
- 新增 `frontend/guide/` 下 15 个接口页面说明 HTML（前台 11 个 + 管理后台 4 个），每页含真实截图、页面说明、功能要点、接口说明表、相关文件与跨页上一页 / 下一页
- 采集 15 张真实页面截图至 `frontend/images/screenshots/`（1440×900，后台页面通过临时登录态采集，采集后清理 localStorage 与临时目录）
- 浏览器实测通过：首页简历突出区正常、说明页截图无破图、控制台无报错，全部 34 个页面与 15 张截图均返回 200

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-26 16:52:31 | DeepSeek-V4.1-Flash

提示词全文：

> 一键部署

执行说明：

- 新增根目录 `zhang_deploy.bat`（双击入口）与 `zhang_deploy.ps1`（部署逻辑）
- 脚本流程：检查 Node.js 环境 → 校验 `frontend/index.html` → 检测 8115 端口是否已运行 → 缺失时安装 backend 依赖（优先 cnpm，其次 npm 国内镜像）→ 检查 `backend/.env` → 启动后端服务并等待端口就绪（最多 20 秒）→ 自动打开首页
- 编码处理：ps1 以 UTF-8 BOM 保存，bat 使用纯 ASCII 指令，避免中文乱码导致命令解析失败
- 实测通过：端口检测正常、服务启动成功、首页可访问（200）

大模型名称：DeepSeek-V4.1-Flash

---


## 2026-11-26 17:03:44 | DeepSeek-V4.1-Flash

提示词全文：

> 给我一键部署放到公网上

执行说明：

- 新增根目录 `zhang_netlify_deploy.bat`（双击入口）与 `zhang_netlify_deploy.ps1`（部署逻辑）
- 部署范围：仅纯前端页面（首页、简历、AI 新闻列表、15 个接口页面说明与截图），自动剔除依赖后端的 pages.html 入口与「打开原页面」死链
- 脚本流程：生成部署包 → 用 .NET ZipArchive 打包为带正斜杠路径的 ZIP → 调 Netlify API 创建站点 → 上传 ZIP → 轮询部署状态 → 输出公网地址并自动打开
- 授权：首次运行粘贴一次 Netlify Personal Access Token，保存在用户目录 `.zhang_netlify_token`，后续一键复用；也支持环境变量 `NETLIFY_AUTH_TOKEN`
- 支持 `-BuildOnly` 参数仅打包本地校验，实测 42 个文件、约 5 MB 打包成功

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-26 17:15:00 | DeepSeek-V4.1-Flash

提示词全文：

> 一键部署

部署要求（随附指令）：

> 部署项目到 trae 的一键部署。只部署不使用后台接口的前端页面。使用后台接口的前端页面不推送到服务器端。

执行说明：

- 新增根目录 `zhang_trae_deploy.bat`（双击入口）与 `zhang_trae_deploy.ps1`（打包逻辑），用于生成 Trae「一键部署」专用纯静态目录 `deploy/`
- 部署范围仅包含不使用后台接口的页面：`index.html`（部署版首页）、`resume.html`（个人简历）、`guide/` 下 15 份接口页面说明文档，以及对应 CSS、JS 与截图
- 明确排除：`ai-news.html`（Supabase 接口）、`pages.html`（含后台页面死链）、新闻 / 农产品 / 聊天 / 知识库 / 情感 / 图像 / 语音 / 数据库连接 / 登录 / 注册页面、`admin/` 后台管理页面、`js/vendor/`、`backend/` 全部代码与 `.env`
- 部署版首页自动移除 Supabase 导航与区块、AI 新闻入口、pages.html 存档卡片，改写首屏说明与统计数字（17 个线上入口），并在控制台输出部署版提示
- 说明页把「打开原页面 →」替换为「线上演示版 · 依赖后台接口，未部署」标签，避免线上死链
- 实测生成 38 个文件、约 5104 KB，静态服务下首页、简历、说明页、截图、CSS、JS 全部返回 200
- 上线方式：Trae 插件市场安装「一键部署」后，在对话中说明只部署 `deploy` 目录，使用后台接口的页面不部署

大模型名称：DeepSeek-V4.1-Flash

---

## 2026-11-26 17:35:00 | DeepSeek-V4.1-Flash

提示词全文：

> `https://github.com/yyyyyyy0304/zjy` 帮我给项目提交到GitHub这个仓库里面

执行说明：

- 远程仓库 `yyyyyyy0304/zjy` 为公开空仓库（默认分支 main），本地新增 origin 远程并修复 Git HTTPS 证书链问题（改用系统证书库 schannel，未关闭 TLS 校验）
- 密钥脱敏：`zhang_chatController.js`、`zhang_knowledgeController.js`、`zhang_sentimentController.js` 中的 SiliconFlow API Key 改为从 `backend/.env` 的 `LLM_API_KEY` 读取，不再硬编码
- 历史清理：按用户确认采用「压缩为单次提交」方案，用 `git checkout --orphan main` 以脱敏后的文件重建 main 分支并只推送这一次提交；旧的 4 次提交仅保留在本地 master，不推送到远程
- `.gitignore` 继续排除 `backend/.env`、`node_modules/`、日志与分享包，仓库中不含数据库凭据
- 推送 `origin/main` 成功（提交 0451084），本地 main 已跟踪 origin/main；远程仓库中不存在 `backend/.env`

大模型名称：DeepSeek-V4.1-Flash

---

