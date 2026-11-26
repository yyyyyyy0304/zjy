# 田园优选 · 农产品销售网站

<!--
姓名：【张婧雅】 | 学号：【24005240115】 | 时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
-->

## 项目信息

| 项目 | 内容 |
| --- | --- |
| 学号 | 24005240115 |
| 姓名 | 张婧雅 |
| 项目名称 | 田园优选 · 农产品销售网站 |
| 项目类别 | 自选 |
| 前端技术 | 原生 HTML / CSS / JavaScript（不使用任何第三方库、框架、CDN） |
| 后端技术 | Node.js + Express（RESTful + MVC） |
| 数据库 | MySQL |
| 服务端口 | 8115 |

## 功能清单

| 序号 | 页面 | 功能 |
| --- | --- | --- |
| 01 | index.html | 首页：项目信息、页面导航、服务状态检测、Canvas 粒子背景动画 |
| 02 | database.html | 输入用户名/密码测试 MySQL 连接，成功与失败均有提示 |
| 03 | news.html | 科技新闻列表（MySQL 表 `zhang_news`），支持搜索与分页 |
| 04 | produce.html | 农产品图文列表（MySQL 表 `zhang_produce`），展示接口地址与原始数据 |
| 05 | chat.html | 基础 AI 聊天：多轮上下文、历史压缩、控制台输出发送与接收数据 |
| 06 | knowledge.html | 知识库 RAG：文件上传解析、分块检索 Top-K、引用来源问答 |
| 07 | sentiment.html | 商业评论情感分类：Excel 上传 → 好评/中评/差评 + 饼状图 + 精选评论 |
| 08 | vision.html | 图像识别：上传农产品图片，Qwen3-VL-8B-Instruct 输出结构化 JSON 并写入记录表 |
| 09 | voice.html | 语音识别：录音/上传音频，Qwen3-ASR-1.7B 转写 + 大模型客服意图识别，写入记录表 |

## 目录结构

```
zhang/
├── AGENTS.md                  # 项目开发规则
├── zhang_prompt.md            # AI 开发指令记录
├── README.md                  # 项目说明
├── frontend/                  # 前端（express.static 托管）
│   ├── index.html             # 首页（项目信息 + 页面导航 + Canvas 背景动画）
│   ├── css/style.css
│   ├── js/
│   │   ├── main.js            # 后端状态检测
│   │   └── zhang_canvas.js    # Canvas 粒子背景动画
│   ├── fonts/                 # iconfont 图标（如有）
│   └── images/
└── backend/                   # 后端
    ├── app.js                 # 服务入口（端口 8115，跨域、静态托管）
    ├── config/zhang_db.js     # MySQL 连接池
    ├── routes/zhang_index.js  # 路由层
    ├── controllers/zhang_indexController.js  # 控制层
    ├── .env                   # 数据库凭据（不提交）
    ├── zhang_interface.md     # 接口记录
    └── zhang_database.md      # 数据库记录
```

## 运行方式

方式一：双击根目录下的 `zhang_start_backend.bat`（自动检测并安装依赖，然后启动服务并打开浏览器）。

方式二：手动执行。

1. 安装后端依赖（在 `backend` 目录）：

```bash
cnpm i
# 或
npm i
```

2. 启动服务（在 `backend` 目录）：

```bash
npm start
```

3. 浏览器访问：<http://localhost:8115>

## 接口约定

统一响应格式：

```json
{ "code": 0, "msg": "提示信息", "data": {} }
```

- `code = 0` 表示成功，非 0 表示失败。
- 所有接口以 `/api` 为前缀，详见 `backend/zhang_interface.md`。

## 配置项

配置仅存放在 `backend/.env`，已加入 `.gitignore`，不提交到仓库。

| 变量名 | 说明 |
| --- | --- |
| DB_USER / DB_PASSWORD / DB_HOST / DB_NAME | MySQL 连接凭据 |
| LLM_API_KEY | 硅基流动 API Key（仅后端使用，前端不接触） |
| LLM_BASE_URL | 大模型接口地址，默认 `https://api.siliconflow.cn/v1` |
| LLM_MODEL | 默认对话模型 `deepseek-ai/DeepSeek-V4-Flash` |
| ASR_MODEL | 语音识别模型 `Qwen/Qwen3-ASR-1.7B` |
| ASR_FALLBACK_MODEL | 识别失败或为空时的回退模型 `FunAudioLLM/SenseVoiceSmall`（50+ 语种） |
| VLM_MODEL | 图像识别模型 `Qwen/Qwen3-VL-8B-Instruct` |
