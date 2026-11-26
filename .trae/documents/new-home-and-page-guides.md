<!--
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-26 | 大模型：DeepSeek-V4.1-Flash
-->

# 新首页 + 后台接口页面说明文档 实施计划

## 一、概述

本次改造分三部分：

1. **新首页**：替换 `frontend/index.html`，只保留「纯前端页面」与「基于 Supabase 的页面」的超链接，并把「个人简历」作为页面核心亮点突出展示。
2. **旧导航存档**：把现有 18 个页面入口的导航页另存为 `frontend/pages.html`，改成纯静态页面（去掉 `/api/health` 服务状态检测），作为全部页面导航的存档入口。
3. **接口页面说明页**：为 15 个使用后台接口的页面，每个新建一个说明 HTML（`frontend/guide/` 下），包含该页面的真实截图、功能说明、接口清单与相关文件，统一视觉规范、美观展示。

约束：只改 `frontend/` 与根目录记录文件，不改 `backend/`；不引入任何第三方库或 CDN；新文件全部带规定注释头；所有新类名/变量以 `zhang_` 开头。

---

## 二、现状分析

### 2.1 页面分类（已核对 `frontend/` 实际文件）

| 分类 | 页面 |
| --- | --- |
| 纯前端 | `resume.html`（简历，Canvas 动画）、`ai-news.html`（Supabase 直连，`js/vendor/supabase-js.umd.min.js` 本地依赖） |
| 前台接口页面（11） | `database.html`、`news.html`、`produce.html`、`chat.html`、`knowledge.html`、`sentiment.html`、`vision.html`、`voice.html`、`login.html`、`register.html`、`admin/login.html` |
| 后台接口页面（4） | `admin/index.html`（仪表盘）、`admin/news.html`、`admin/produce.html`、`admin/users.html` |

合计 15 个接口页面需要说明页。

### 2.2 已有可复用能力

- 背景动画：`frontend/js/zhang_canvas.js`，识别 `#zhang_canvas_bg` 画布并绘制粒子连线，可直接复用。
- 设计变量：`frontend/css/style.css` 已定义深色主题变量（`--zhang_color_bg` / `--zhang_color_accent` / `--zhang_color_wheat` 等）与 `.zhang_top`、`.zhang_footer` 等基础样式。
- 说明页文案来源：现 `index.html` 第 81–242 行每张卡片的名称与描述；接口信息来源 `backend/zhang_interface.md`（只读参考）。
- 后端与 MySQL 当前可用：`/api/news`、`/api/produce` 实测返回 `code:0` 且有数据，可用于真实截图。
- 管理后台鉴权：`localStorage` 键为 `zhang_admin_token` 与 `zhang_admin_user`（见 `admin/js/zhang_admin_api.js`）；未登录时 `zhang_admin_layout.js` 会 `location.replace('./login.html')`。
- 管理员测试账号：`zhang_admin / admin123456`（见 `admin/login.html` 提示）；`/api/auth/captcha` 返回 `captchaId` 与内联 SVG（4 位字符在 SVG 文本节点中）。

---

## 三、变更清单

### 3.1 新增 / 修改文件总览

| 文件 | 类型 | 说明 |
| --- | --- | --- |
| `frontend/index.html` | 重写 | 新首页（深色主题 + Canvas 背景） |
| `frontend/pages.html` | 新增 | 旧 18 入口导航存档（纯静态，去掉服务状态检测） |
| `frontend/css/zhang_home.css` | 新增 | 新首页专属样式（简历突出区、页面卡片、分组网格、响应式） |
| `frontend/css/zhang_guide.css` | 新增 | 说明页共用样式（浏览器窗口式截图框、接口表格、要点列表、上下页） |
| `frontend/guide/*.html` | 新增 15 个 | 每个后台接口页面一个说明页 |
| `frontend/images/screenshots/*.png` | 新增 15 张 | 15 个接口页面的真实截图（1440×900 视口） |
| `zhang_prompt.md` | 追加 | 记录本次提示词与执行说明 |

不修改：`backend/` 全部文件、`database.md`、`backend/zhang_*.md`。

### 3.2 新首页 `frontend/index.html` 结构

沿用深色主题，加载 `css/style.css` + `css/zhang_home.css` + `js/zhang_canvas.js`（与旧首页一致）。

1. **顶部栏**：品牌「田园优选 / 项目页面总览」；导航锚点：`#zhang_home_resume`、`#zhang_home_front`、`#zhang_home_supabase`、`#zhang_home_meta`。
2. **Hero**：`张婧雅 · 24005240115`、主标题「高级网页设计 · 全栈项目」、副标题；两个按钮：`查看个人简历`（主按钮，指向 `./resume.html`）、`AI 新闻列表`（次按钮，指向 `./ai-news.html`）。
3. **简历突出区** `#zhang_home_resume`（视觉最重的一块）：
   - 左侧大号「RESUME」渐变徽标 + 头像字「张」；
   - 右侧标题「个人简历 · 前端开发工程师（实习）」、简介、三个数据点（7 个内容模块 / Canvas 背景动画 / 支持打印 PDF）；
   - 按钮「进入简历页面」→ `./resume.html`；整体带渐变边框光效与 hover 抬升。
4. **纯前端页面** `#zhang_home_front`：
   - 卡片 `resume.html`（标注「重点」）；
   - 卡片 `ai-news.html`（Supabase，标注数据源）；
   - 卡片 `pages.html`（旧版全部页面导航存档）。
5. **后台接口页面说明**（属于纯前端说明页，允许出现在首页）：
   - 分组一「前台功能说明」11 张卡片 → `guide/zhang_guide_*.html`；
   - 分组二「管理后台说明」4 张卡片 → `guide/zhang_guide_admin_*.html`。
   - 每张卡片含：序号、页面名、原页面文件名、一句话描述、截图缩略图（`loading="lazy"`）。
6. **Supabase 数据页面** `#zhang_home_supabase`：展示 `ai-news.html` 数据源说明（项目 Ref、表 `zhang_ai_news`、20 条数据、RLS 只读、本地 supabase-js），按钮进入页面。
7. **项目信息** `#zhang_home_meta`：姓名、学号、项目名称、技术栈（静态文本，非超链接）。
8. **页脚**：姓名、学号、项目名。

**链接白名单（硬性）**：首页 `href` 只允许 `./resume.html`、`./ai-news.html`、`./pages.html`、`./guide/*.html`、页内锚点 `#...`。不出现任何 `news.html`、`admin/*.html` 等直接链接。

### 3.3 旧导航 `frontend/pages.html`

- 复制现有 `index.html` 全部内容（18 张卡片、项目信息、Canvas）。
- 删除「服务状态」整节与 `<script src="./js/main.js">`，改为纯静态；顶部加提示条：「以下为项目全部页面导航存档，部分页面依赖后端服务与 MySQL」。
- 卡片 01 改为「新首页」指向 `./index.html`；其余卡片保持原链接与描述。
- 保留 `zhang_canvas.js` 背景动画。

### 3.4 说明页模板（15 个文件统一）

目录：`frontend/guide/`，文件名如下：

| 说明页 | 原页面 | 截图文件 |
| --- | --- | --- |
| `zhang_guide_database.html` | `database.html` | `zhang_shot_database.png` |
| `zhang_guide_news.html` | `news.html` | `zhang_shot_news.png` |
| `zhang_guide_produce.html` | `produce.html` | `zhang_shot_produce.png` |
| `zhang_guide_chat.html` | `chat.html` | `zhang_shot_chat.png` |
| `zhang_guide_knowledge.html` | `knowledge.html` | `zhang_shot_knowledge.png` |
| `zhang_guide_sentiment.html` | `sentiment.html` | `zhang_shot_sentiment.png` |
| `zhang_guide_vision.html` | `vision.html` | `zhang_shot_vision.png` |
| `zhang_guide_voice.html` | `voice.html` | `zhang_shot_voice.png` |
| `zhang_guide_login.html` | `login.html` | `zhang_shot_login.png` |
| `zhang_guide_register.html` | `register.html` | `zhang_shot_register.png` |
| `zhang_guide_admin_login.html` | `admin/login.html` | `zhang_shot_admin_login.png` |
| `zhang_guide_admin_dashboard.html` | `admin/index.html` | `zhang_shot_admin_dashboard.png` |
| `zhang_guide_admin_news.html` | `admin/news.html` | `zhang_shot_admin_news.png` |
| `zhang_guide_admin_produce.html` | `admin/produce.html` | `zhang_shot_admin_produce.png` |
| `zhang_guide_admin_users.html` | `admin/users.html` | `zhang_shot_admin_users.png` |

每个说明页结构：

```text
顶部栏：← 返回新首页 | 页面说明 · 前台/后台 | 打开原页面 →
头部：kicker（前台页面 02） + H1 页面名 + 简介 + 标签（数据来源/接口/能力）
截图：浏览器窗口样式的 figure，内含 ../images/screenshots/xxx.png（alt 为「XX页面截图」）
页面说明：1–2 段业务说明（取自旧导航卡片描述并扩写）
功能要点：4–6 条 ul
接口说明：表格（方法 | 路径 | 说明），来源 backend/zhang_interface.md
相关文件：前端 HTML / JS / 涉及数据表
底部：上一页 / 下一页说明页 + 返回新首页
```

接口映射（写入对应说明页的接口表）：

| 说明页 | 接口 |
| --- | --- |
| database | `GET /api/health`、`POST /api/db/connect` |
| news | `GET /api/news` |
| produce | `GET /api/produce` |
| chat | `POST /api/chat` |
| knowledge | `POST /api/knowledge/upload`、`GET /api/knowledge/list`、`DELETE /api/knowledge/delete/:id`、`POST /api/knowledge/ask` |
| sentiment | `POST /api/sentiment/analyze` |
| vision | `POST /api/vision/analyze`、`GET /api/vision/history` |
| voice | `POST /api/voice/transcribe`、`GET /api/voice/history`、`GET /api/voice/languages` |
| login | `GET /api/auth/captcha`、`POST /api/auth/login`、`GET /api/auth/me` |
| register | `GET /api/auth/captcha`、`POST /api/auth/register` |
| admin login | `GET /api/auth/captcha`、`POST /api/admin/login`、`GET /api/admin/me` |
| admin dashboard | `GET /api/admin/dashboard` |
| admin news | `GET/POST /api/admin/news`、`GET/PUT/DELETE /api/admin/news/:id` |
| admin produce | `GET/POST /api/admin/produce`、`GET/PUT/DELETE /api/admin/produce/:id` |
| admin users | `GET/POST /api/admin/users`、`GET/PUT/DELETE /api/admin/users/:id` |

### 3.5 截图方案

目标：15 张真实截图，分辨率 1440×900 视口，存入 `frontend/images/screenshots/`。

1. 确认后端在 `http://localhost:8115` 运行（已在运行）；若未运行，在 `backend/` 执行 `node app.js`。
2. **前台 11 页**：用浏览器自动化逐个打开并截图（每次最多 6 个页面，分批执行，避免步骤超限），截图后复制到工作区并重命名。
3. **后台 4 页**：
   - 用 PowerShell 调 `GET /api/auth/captcha` 取 `captchaId` 与 `svg`，用正则提取 SVG 文本节点中的 4 个字符得到验证码；
   - `POST /api/admin/login` 传 `zhang_admin / admin123456 / captchaId / captchaCode`，取 `data.token` 与 `data.admin`；
   - 临时创建 `frontend/_zhang_shot_bootstrap.html`：读取 URL 参数 `token`、`admin`、`to`，写入 `localStorage` 的 `zhang_admin_token` / `zhang_admin_user` 后 `location.replace(to)`；通过该页依次进入 4 个后台页面截图；
   - 截图完成后**删除**该临时文件，并在浏览器中执行一次退出登录清理本地存储（打开 `admin/login.html` 点击退出或清除 localStorage）。
   - 兜底：若 SVG 字符无法解析，则由浏览器自动化在登录页读取验证码文本并手动登录后再截图。
4. 校验：15 个 PNG 均存在且大于 20KB；说明页中 `<img>` 能正常加载（浏览器实测无破图）。

### 3.6 样式与规范

- 新首页：深色主题 + Canvas 粒子背景，与现有站点一致；新增 `zhang_home_*` 类名。
- 说明页：同样深色主题，截图用「浏览器窗口」外框（顶部三个圆点 + 文件名）；新增 `zhang_guide_*` 类名；响应式断点 960px / 640px。
- 每个新增 HTML / CSS 文件头部包含：
  `姓名：【张婧雅】 | 学号：【24005240115】 | 时间：2026-11-26 | 大模型：DeepSeek-V4.1-Flash`
- 不使用第三方库、不使用 CDN；图片全部为本地文件。
- 首页与说明页均在浏览器控制台输出一条初始化日志（页面类型、说明页数量），便于检查。

---

## 四、假设与决策

1. 新首页直接替换 `index.html`；旧导航完整保留在 `pages.html`（纯静态，作为「全部页面」存档）。首页不直接链接任何后台接口页面。
2. 说明页本身就是纯前端静态页面，因此可以出现在首页；后台页面的入口统一走「说明页」。
3. 说明页覆盖全部 15 个接口页面（前台 11 + 后台 4）。
4. 截图使用真实页面数据（后端与 MySQL 当前可用）；AI 类页面截取初始界面，不触发模型调用，避免产生额外费用与等待。
5. 管理后台截图需要临时登录态：仅用于截图，截图后清理临时引导页与 localStorage，不写入任何凭据到前端代码或文档。
6. `pages.html` 不再请求 `/api/health`，保证它是纯前端页面。

---

## 五、实施顺序

1. 重写 `frontend/index.html`，新增 `frontend/css/zhang_home.css`；生成 `frontend/pages.html`。
2. 新增 `frontend/css/zhang_guide.css` 与 15 个说明页（先完成结构，图片路径统一预留）。
3. 启动/确认后端，按 3.5 采集 15 张截图到 `frontend/images/screenshots/`，清理临时文件。
4. 修正说明页截图路径与文案，检查所有接口表内容。
5. 浏览器实测首页、说明页、简历跳转、截图加载。
6. 追加 `zhang_prompt.md` 记录。

---

## 六、验证步骤

1. 静态检查：`curl -o NUL -w "%{http_code}"` 逐个访问 `index.html`、`pages.html` 与 15 个说明页，全部返回 200。
2. 首页链接审计：提取 `index.html` 所有 `href`，确认只包含 `./resume.html`、`./ai-news.html`、`./pages.html`、`./guide/*.html` 与页内锚点；无 `news.html`、`admin/*.html` 直链。
3. 浏览器实测：
   - 首页 Hero、简历突出区、三个分组卡片正常显示，无横向溢出；
   - 点击「查看个人简历」进入 `resume.html`；点击 Supabase 卡片进入 `ai-news.html`（数据仍显示 20 条）；
   - 打开任意说明页（含 1 个后台说明页），截图完整显示、接口表格排版正常、无破图；
   - 控制台无报错。
4. 图片校验：15 个 PNG 文件存在，尺寸合理。
5. 后台截图会话清理：确认 `_zhang_shot_bootstrap.html` 已删除、`admin/login.html` 页面已无登录态（或本地存储已清理）。
6. 记录文件校验：`zhang_prompt.md` 末尾新增本次记录；`backend/` 无任何改动。
