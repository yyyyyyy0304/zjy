# zhang_interface.md

<!--
姓名：【张婧雅】 | 学号：【24005240115】 | 时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
-->

本文件记录后端所有接口，**只追加，不覆盖**。

---

## 接口：/api/health　服务健康检查

- 接口路径：`/api/health`
- HTTP 方法：`GET`
- 请求参数：无
- 请求示例：

```http
GET http://localhost:8115/api/health
```

- 响应格式：

```json
{
  "code": 0,
  "msg": "服务运行正常",
  "data": {
    "time": "2026/11/9 15:52:40",
    "uptime": "6 秒",
    "port": 8115
  }
}
```

- 修改时间：2026-11-09 15:52:00

---

## 接口：/api/db/connect　测试连接 MySQL 数据库

- 接口路径：`/api/db/connect`
- HTTP 方法：`POST`
- 请求参数（JSON Body）：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| host | string | 否 | 主机地址，默认 `localhost` |
| port | number | 否 | 端口，默认 `3306` |
| user | string | 是 | 用户名 |
| password | string | 是 | 密码 |
| database | string | 是 | 数据库名 |

- 请求示例：

```json
{
  "host": "localhost",
  "port": 3306,
  "user": "root",
  "password": "root",
  "database": "zhang_db"
}
```

- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "数据库连接成功",
  "data": {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "database": "zhang_db",
    "version": "9.3.0",
    "charset": "utf8mb4"
  }
}
```

- 响应格式（失败示例）：

```json
{ "code": 1, "msg": "连接失败：用户名或密码错误", "data": null }
```

```json
{ "code": 1, "msg": "连接失败：数据库不存在，请确认数据库名", "data": null }
```

- 修改时间：2026-11-09 16:20:00

---

## 接口：/api/news　获取科技新闻列表

- 接口路径：`/api/news`
- HTTP 方法：`GET`
- 请求参数（Query）：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页条数，默认 10，最大 50 |
| keyword | string | 否 | 关键词，匹配标题 / 摘要 / 分类 |

- 请求示例：

```http
GET http://localhost:8115/api/news?page=1&pageSize=3&keyword=芯片
```

- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "获取新闻列表成功",
  "data": {
    "total": 3,
    "page": 1,
    "pageSize": 3,
    "keyword": "芯片",
    "list": [
      {
        "zhang_id": 2,
        "zhang_title": "新一代国产 GPU 量产，单卡显存带宽提升 45%",
        "zhang_category": "芯片",
        "zhang_summary": "某国产 GPU 厂商宣布新一代数据中心加速卡进入量产阶段……",
        "zhang_source": "芯东西",
        "zhang_author": "王瑞",
        "zhang_views": 4310,
        "zhang_publish_time": "2026-11-08T08:05:00.000Z",
        "zhang_create_time": "2026-11-09T08:35:00.000Z"
      }
    ]
  }
}
```

- 响应格式（失败）：

```json
{ "code": 1, "msg": "查询新闻列表失败：数据库连接异常", "data": null }
```

- 修改时间：2026-11-09 16:40:00

---

## 接口：/api/produce　获取农产品图文列表

- 接口路径：`/api/produce`
- HTTP 方法：`GET`
- 请求参数（Query）：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页条数，默认 10，最大 50 |
| keyword | string | 否 | 关键词，匹配名称 / 描述 / 分类 / 产地 |

- 请求示例：

```http
GET http://localhost:8115/api/produce?page=1&pageSize=4&keyword=云南
```

- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "获取农产品图文列表成功",
  "data": {
    "total": 2,
    "page": 1,
    "pageSize": 4,
    "keyword": "云南",
    "list": [
      {
        "zhang_id": 8,
        "zhang_name": "高山土蜂蜜",
        "zhang_category": "山珍干货",
        "zhang_price": "68.00",
        "zhang_unit": "瓶",
        "zhang_origin": "云南怒江",
        "zhang_desc": "海拔 2000 米以上蜜源，自然成熟封盖取蜜，质地浓稠带花香。",
        "zhang_image": "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=...&image_size=landscape_4_3",
        "zhang_stock": 96,
        "zhang_create_time": "2026-11-09T09:05:00.000Z"
      }
    ]
  }
}
```

- 响应格式（失败）：

```json
{ "code": 1, "msg": "查询农产品图文列表失败：数据库连接异常", "data": null }
```

- 修改时间：2026-11-09 17:05:00

---

## 接口：/api/chat　AI 聊天（代理 SiliconFlow 大模型）

- 接口路径：`/api/chat`
- HTTP 方法：`POST`
- 请求参数（JSON Body）：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| messages | array | 是 | 消息数组，每项含 `role`（system / user / assistant）与 `content` |
| model | string | 否 | 模型名，默认 `deepseek-ai/DeepSeek-V4-Flash` |

- 请求示例：

```json
{
  "model": "deepseek-ai/DeepSeek-V4-Flash",
  "messages": [
    { "role": "system", "content": "你是一个有用的助手" },
    { "role": "user", "content": "你好，请介绍一下你自己" }
  ]
}
```

- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "AI 回复成功",
  "data": {
    "model": "deepseek-ai/DeepSeek-V4-Flash",
    "sendData": {
      "model": "deepseek-ai/DeepSeek-V4-Flash",
      "messages": [
        { "role": "system", "content": "你是一个有用的助手" },
        { "role": "user", "content": "你好，请介绍一下你自己" }
      ]
    },
    "response": {
      "id": "chatcmpl-xxxxx",
      "object": "chat.completion",
      "model": "deepseek-ai/DeepSeek-V4-Flash",
      "choices": [
        {
          "index": 0,
          "message": {
            "role": "assistant",
            "content": "你好！我是一个 AI 助手……"
          },
          "finish_reason": "stop"
        }
      ],
      "usage": { "prompt_tokens": 20, "completion_tokens": 80, "total_tokens": 100 }
    }
  }
}
```

- 响应格式（失败）：

```json
{ "code": 1, "msg": "参数错误：messages 不能为空", "data": null }
```

```json
{ "code": 1, "msg": "大模型请求失败（HTTP 401）", "data": { "statusCode": 401, "raw": "..." } }
```

- 修改时间：2026-11-12 10:00:00

---

## 接口：/api/knowledge/upload　知识库文件上传

- 接口路径：`/api/knowledge/upload`
- HTTP 方法：`POST`（`multipart/form-data`）
- 请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| file | file | 是 | 知识库文件，支持 txt、pdf、doc、docx，最大 20MB |

- 请求示例：

```http
POST http://localhost:8115/api/knowledge/upload
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="产品手册.txt"
Content-Type: text/plain

（文件内容）
------WebKitFormBoundary--
```

- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "文件上传并解析成功",
  "data": {
    "id": 1,
    "originalname": "产品手册.txt",
    "ext": ".txt",
    "size": 2048,
    "uploadTime": "2026/11/12 16:30:00",
    "chunkCount": 6,
    "contentPreview": "田园优选农产品销售网站产品手册…"
  }
}
```

- 响应格式（失败）：

```json
{ "code": 1, "msg": "仅支持 txt、pdf、doc、docx 格式的文件", "data": null }
```

- 修改时间：2026-11-12 16:30:00

---

## 接口：/api/knowledge/list　获取知识库文件列表

- 接口路径：`/api/knowledge/list`
- HTTP 方法：`GET`
- 请求参数：无
- 请求示例：

```http
GET http://localhost:8115/api/knowledge/list
```

- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "获取知识库列表成功",
  "data": {
    "total": 2,
    "list": [
      {
        "id": 1,
        "originalname": "产品手册.txt",
        "ext": ".txt",
        "size": 2048,
        "uploadTime": "2026/11/12 16:30:00",
        "chunkCount": 6
      }
    ]
  }
}
```

- 修改时间：2026-11-12 16:30:00

---

## 接口：/api/knowledge/delete/:id　删除知识库文件

- 接口路径：`/api/knowledge/delete/:id`
- HTTP 方法：`DELETE`
- 请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | 文件 ID（URL 路径参数） |

- 请求示例：

```http
DELETE http://localhost:8115/api/knowledge/delete/1
```

- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "文件删除成功",
  "data": { "id": 1 }
}
```

- 响应格式（失败）：

```json
{ "code": 1, "msg": "文件不存在", "data": null }
```

- 修改时间：2026-11-12 16:30:00

---

## 接口：/api/knowledge/ask　基于知识库的 RAG 问答

- 接口路径：`/api/knowledge/ask`
- HTTP 方法：`POST`
- 请求参数（JSON Body）：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| question | string | 是 | 用户问题 |
| history | array | 否 | 对话历史，每项含 `role` 与 `content` |

- 请求示例：

```json
{
  "question": "退换货政策是什么？",
  "history": []
}
```

- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "RAG 问答成功",
  "data": {
    "question": "退换货政策是什么？",
    "answer": "根据知识库内容，田园优选提供七天无理由退货……",
    "matchedChunks": [
      {
        "source": "售后服务政策与常见问题.txt",
        "score": 5,
        "preview": "田园优选售后服务政策与常见问题解答…"
      }
    ],
    "sendData": {
      "model": "deepseek-ai/DeepSeek-V4-Flash",
      "messages": [...]
    },
    "response": { "choices": [{ "message": { "content": "..." } }] }
  }
}
```

- 响应格式（失败）：

```json
{ "code": 1, "msg": "知识库为空，请先上传文件", "data": null }
```

- 修改时间：2026-11-12 16:30:00

---

## 接口：/api/sentiment/analyze　商业评论情感分类

- 接口路径：`/api/sentiment/analyze`
- HTTP 方法：`POST`
- 请求参数（`multipart/form-data`）：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| file | file | 是 | Excel 文件（.xlsx / .xls，≤20MB），需包含「评论内容 / 评论 / 评价 / content」等列名 |

- 请求示例：

```http
POST http://localhost:8115/api/sentiment/analyze
Content-Type: multipart/form-data; boundary=----boundary

------boundary
Content-Disposition: form-data; name="file"; filename="餐饮门店评论_20条.xlsx"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

<二进制文件内容>
------boundary--
```

- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "情感分类成功",
  "data": {
    "total": 20,
    "stats": { "好评": 10, "中评": 5, "差评": 5 },
    "results": [
      {
        "index": 1,
        "text": "菜品很新鲜，番茄炒蛋的番茄特别甜，米饭也很香。",
        "sentiment": "好评",
        "reason": "正面描述菜品新鲜美味"
      }
    ],
    "highlights": {
      "好评": [{ "index": 1, "text": "…", "sentiment": "好评", "reason": "…" }],
      "中评": [],
      "差评": []
    },
    "sendData": {
      "model": "deepseek-ai/DeepSeek-V4-Flash",
      "messages": [{ "role": "system", "content": "你是商业评论情感分析助手…" }, { "role": "user", "content": "第1条：…" }]
    },
    "response": { "id": "…", "choices": [{ "message": { "role": "assistant", "content": "[{\"index\":1,\"sentiment\":\"好评\",\"reason\":\"…\"}]" } }] }
  }
}
```

- 响应格式（失败）：

```json
{ "code": 1, "msg": "仅支持 xlsx、xls 格式的 Excel 文件", "data": null }
```

```json
{ "code": 1, "msg": "大模型请求失败（HTTP 401）", "data": { "statusCode": 401, "raw": "…" } }
```

- 说明：`sendData` 为发送给大模型的数据，`response` 为大模型返回的原始数据，前端将两者输出到浏览器控制台；示例数据文件位于 `frontend/files/`（3 个，每个 20 条评论）。
- 修改时间：2026-11-16 15:20:00

---

## 接口：/api/voice/transcribe　语音识别（ASR + 客服意图识别）

- 接口路径：`/api/voice/transcribe`
- HTTP 方法：`POST`
- Content-Type：`multipart/form-data`
- 请求参数：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| file | File | 是 | 音频文件，支持 mp3 / wav / m4a / webm / ogg / flac / aac / amr，单个不超过 25MB |
| model | String | 否 | 覆盖默认语音识别模型，默认 `Qwen/Qwen3-ASR-1.7B` |

- 请求示例（Apifox / curl）：

```bash
curl -X POST http://localhost:8115/api/voice/transcribe -F "file=@语音样例-售后咨询.mp3"
```

- 处理流程：音频 → 硅基流动 `/v1/audio/transcriptions`（Qwen3-ASR-1.7B）转写 → `/v1/chat/completions`（DeepSeek-V4-Flash）识别客服意图 JSON → 写入 `zhang_voice_record` → 返回识别文本与意图。
- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "语音识别成功",
  "data": {
    "model": "Qwen/Qwen3-ASR-1.7B",
    "costMs": 4405,
    "transcript": {
      "text": "你好，我想咨询一下售后问题。我昨天收到的蔬菜包装有破损，请问可以申请退换货吗？",
      "language": "Chinese",
      "duration": 10
    },
    "intent": {
      "intent": "售后问题",
      "keywords": ["蔬菜", "包装破损", "退换货"],
      "quantity": "",
      "reply": "您好，非常抱歉给您带来不便，可以申请退换货，通常在 1-3 个工作日内处理完成。",
      "confidence": 0.95,
      "need_review": false
    },
    "recordId": 9,
    "sendData": {
      "asr": { "model": "Qwen/Qwen3-ASR-1.7B", "filename": "语音样例-售后咨询.mp3", "mimetype": "audio/mpeg", "size": 146000 },
      "chat": { "model": "deepseek-ai/DeepSeek-V4-Flash", "temperature": 0.2, "messages": [{ "role": "system", "content": "你是“田园优选”农产品电商网站的语音客服意图识别模块…" }, { "role": "user", "content": "语音转写文本：…" }] }
    },
    "response": { "asr": { "text": "…", "language": "Chinese", "usage": { "type": "duration", "seconds": 10 } }, "chat": { "id": "…", "choices": [{ "message": { "content": "{\"intent\":\"售后问题\",…}" } }] } }
  }
}
```

- 响应格式（失败）：

```json
{ "code": 1, "msg": "仅支持 mp3、wav、m4a、webm、ogg、flac、aac、amr 格式的音频", "data": null }
```

```json
{ "code": 1, "msg": "语音识别失败（HTTP 401）", "data": { "statusCode": 401, "raw": "…" } }
```

- 说明：`sendData` 与 `response` 分别表示发送给大模型、从大模型接收到的数据，前端输出到浏览器控制台；音频采用内存存储，不在服务端落盘。
- 修改时间：2026-11-16 16:50:00

---

## 接口：/api/voice/history　查询语音识别记录

- 接口路径：`/api/voice/history`
- HTTP 方法：`GET`
- 请求参数：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| limit | Number | 否 | 返回条数，默认 20 |

- 请求示例：

```text
http://localhost:8115/api/voice/history?limit=20
```

- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "获取语音识别记录成功",
  "data": {
    "total": 3,
    "list": [
      {
        "zhang_id": 9,
        "zhang_filename": "语音样例-售后咨询.mp3",
        "zhang_text": "你好，我想咨询一下售后问题……",
        "zhang_language": "Chinese",
        "zhang_duration": "10.00",
        "zhang_model": "Qwen/Qwen3-ASR-1.7B",
        "zhang_intent": "售后问题",
        "zhang_keywords": "蔬菜、包装破损、退换货",
        "zhang_reply": "您好，非常抱歉给您带来不便……",
        "zhang_confidence": "0.95",
        "zhang_create_time": "2026-11-16T16:45:00.000Z"
      }
    ]
  }
}
```

- 响应格式（失败）：

```json
{ "code": 1, "msg": "查询语音识别记录失败：…", "data": null }
```

- 修改时间：2026-11-16 16:50:00

---

## 接口：/api/vision/analyze　图像识别（视觉语言模型结构化输出）

- 接口路径：`/api/vision/analyze`
- HTTP 方法：`POST`
- Content-Type：`multipart/form-data`
- 请求参数：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| file | File | 是 | 图片文件，支持 jpg / jpeg / png / webp / bmp，单个不超过 10MB |
| question | String | 否 | 针对图片的附加问题，留空则按默认规则识别 |
| model | String | 否 | 覆盖默认视觉模型，默认 `Qwen/Qwen3-VL-8B-Instruct` |

- 请求示例：

```bash
curl -X POST http://localhost:8115/api/vision/analyze -F "file=@示例图片-有机番茄.jpg" -F "question=这张图里的番茄新鲜吗？"
```

- 处理流程：图片 → base64 data URL → `/v1/chat/completions`（Qwen3-VL-8B-Instruct，system 提示词约定 JSON 结构）→ 容错解析 JSON（失败时兜底展示原文）→ 写入 `zhang_vision_record`。
- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "图像识别成功",
  "data": {
    "model": "Qwen/Qwen3-VL-8B-Instruct",
    "costMs": 10897,
    "result": {
      "name": "番茄",
      "category": "新鲜果蔬",
      "items": ["番茄"],
      "freshness": "新鲜",
      "description": "几颗红润饱满的番茄堆叠在木桌上，表皮光滑，绿蒂鲜亮，显得十分新鲜自然。",
      "tags": ["新鲜", "红色", "木桌", "户外", "蔬菜"],
      "confidence": 0.98
    },
    "fallback": false,
    "recordId": 9,
    "sendData": {
      "model": "Qwen/Qwen3-VL-8B-Instruct",
      "filename": "示例图片-有机番茄.jpg",
      "mimetype": "image/jpeg",
      "size": 391386,
      "messages": [{ "role": "system", "content": "你是“田园优选”农产品电商网站的图像识别助手…" }, { "role": "user", "content": [{ "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,…" } }, { "type": "text", "text": "这张图里的番茄新鲜吗？" }] }]
    },
    "response": { "id": "…", "choices": [{ "message": { "content": "{\"name\":\"番茄\",…}" } }], "usage": { "total_tokens": 3393 } }
  }
}
```

- 响应格式（失败）：

```json
{ "code": 1, "msg": "仅支持 jpg、jpeg、png、webp、bmp 格式的图片", "data": null }
```

```json
{ "code": 1, "msg": "图像识别失败（HTTP 400）", "data": { "statusCode": 400, "raw": "…" } }
```

- 说明：控制台不打印完整 base64，仅打印文件名、大小、模型与提示词；模型未按 JSON 输出时 `fallback` 为 `true`，`result.description` 为模型原文。
- 修改时间：2026-11-16 16:50:00

---

## 接口：/api/vision/history　查询图像识别记录

- 接口路径：`/api/vision/history`
- HTTP 方法：`GET`
- 请求参数：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| limit | Number | 否 | 返回条数，默认 20 |

- 请求示例：

```text
http://localhost:8115/api/vision/history?limit=20
```

- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "获取图像识别记录成功",
  "data": {
    "total": 3,
    "list": [
      {
        "zhang_id": 9,
        "zhang_filename": "示例图片-有机番茄.jpg",
        "zhang_name": "番茄",
        "zhang_category": "新鲜果蔬",
        "zhang_items": "番茄",
        "zhang_freshness": "新鲜",
        "zhang_description": "几颗红润饱满的番茄堆叠在木桌上……",
        "zhang_tags": "新鲜、红色、木桌、户外、蔬菜",
        "zhang_confidence": "0.98",
        "zhang_model": "Qwen/Qwen3-VL-8B-Instruct",
        "zhang_create_time": "2026-11-16T16:46:00.000Z"
      }
    ]
  }
}
```

- 响应格式（失败）：

```json
{ "code": 1, "msg": "查询图像识别记录失败：…", "data": null }
```

- 修改时间：2026-11-16 16:50:00

---

## 接口变更记录：/api/voice/transcribe（2026-11-16 20:25:00）

- 变更原因：浏览器录音默认生成 `webm/opus`，部分语音模型会返回空文本，导致录音无法识别。
- 变更内容：
  1. 首次识别失败或返回空文本时，自动回退到 `FunAudioLLM/SenseVoiceSmall`（支持 50+ 语种）重试一次，`requestedModel` 与 `model` 分别记录请求模型与实际使用模型。
  2. 新增响应字段：`requestedModel`、`retried`（是否发生回退重试）、`emptyText`（是否未识别到文本）。
  3. 未识别到文本时 `msg` 变为明确提示，前端据此弹出红色提示条。
  4. 前端录音结束后，用 Web Audio API 将录音转为 16kHz 单声道 WAV 再上传，兼容性更好；同时检测录音音量峰值，音量过低时给出麦克风提示。
- 新增环境变量：`ASR_FALLBACK_MODEL`（默认 `FunAudioLLM/SenseVoiceSmall`），位于 `backend/.env`。
- 响应片段示例：

```json
{
  "code": 0,
  "msg": "语音识别完成，但未识别到文本：请确认录音清晰、麦克风正常，或改用其他语种重试",
  "data": {
    "model": "Qwen/Qwen3-ASR-1.7B",
    "requestedModel": "Qwen/Qwen3-ASR-1.7B",
    "retried": true,
    "emptyText": true,
    "transcript": { "text": "", "language": "None", "duration": 2 },
    "intent": null
  }
}
```

- 修改时间：2026-11-16 20:25:00

---

## 接口变更记录：/api/voice/transcribe（2026-11-19 12:42:00）

- 变更原因：原实现只固定调用 1 个识别模型 + 1 个回退模型，遇到英语、西班牙语、阿拉伯语等非中英日韩语种时识别率低甚至返回空文本，无法「适应所有国家语言」。
- 变更内容：
  1. **多语种模型链**：按 `ASR_MODEL_CHAIN` 顺序依次尝试 `Qwen/Qwen3-ASR-1.7B` → `FunAudioLLM/SenseVoiceSmall` → `TeleAI/TeleSpeechASR`（最多 3 个），任一模型得到文本即返回，并用 `attempts` 记录每次尝试的模型、状态码、文本长度。
  2. **新增请求参数 `language`**：可传 `auto`（默认，自动检测任意语言）或 ISO 639-1 语种代码（如 `es`、`ja`、`ar`）；仅在 `ASR_SEND_LANGUAGE=1` 时才作为参数上送识别模型，避免个别模型不识别该字段导致 400。
  3. **语种三级判定**：识别模型返回语种 → 用户指定语种 → Unicode 字符集离线判断（日文假名/韩文/阿拉伯文/泰文/西里尔文/天城文等 23 种文字区间）→ 大模型判定，`language.source` 记录判定来源（`model` / `manual` / `script` / `llm`）。
  4. **识别文本清洗**：自动剥离 SenseVoice 输出的 `<|zh|><|NEUTRAL|><|Speech|>` 等标记，并提取 `emotion` 情绪标签，避免标记污染识别结果。
  5. **多语种理解**：意图提示词升级为多语种归一化，新增 `text_zh`（中文译文）、`reply_zh`（中文回复）、`reply`（原语种回复）、`language` / `language_name` 字段。
  6. **响应结构升级**：新增 `data.language`（`code` / `name` / `source` / `requested`）、`transcript.languageName`、`transcript.textZh`、`transcript.emotion`、`attempts`、`modelChain`；旧字段 `transcript.language`（语种代码）保留，向后兼容。
  7. 前端新增「识别语种」下拉框（85 个语种，含方言）、中文译文展示、原语种回复展示。
- 新增环境变量（`backend/.env`）：`ASR_MODEL_CHAIN`、`ASR_SEND_LANGUAGE`。
- 实测：西班牙语、日语音频均能正确识别、判定语种、翻译成中文并给出客服意图。
- 响应片段示例：

```json
{
  "code": 0,
  "msg": "语音识别成功（西班牙语）",
  "data": {
    "model": "Qwen/Qwen3-ASR-1.7B",
    "requestedModel": "Qwen/Qwen3-ASR-1.7B",
    "modelChain": ["Qwen/Qwen3-ASR-1.7B", "FunAudioLLM/SenseVoiceSmall", "TeleAI/TeleSpeechASR"],
    "attempts": [{ "model": "Qwen/Qwen3-ASR-1.7B", "statusCode": 200, "textLength": 80, "language": "" }],
    "retried": false,
    "emptyText": false,
    "costMs": 5234,
    "language": { "code": "es", "name": "西班牙语", "source": "llm", "requested": "auto" },
    "transcript": {
      "language": "es",
      "languageName": "西班牙语",
      "text": "Hola, quiero comprar dos cajas de tomates orgánicos. ¿Cuándo llegarán a mi casa?",
      "textZh": "你好，我想买两箱有机番茄。它们什么时候能送到我家？",
      "emotion": "",
      "duration": 6
    },
    "intent": {
      "language": "es",
      "language_name": "西班牙语",
      "text_zh": "你好，我想买两箱有机番茄。它们什么时候能送到我家？",
      "intent": "下单购买",
      "keywords": ["有机番茄", "两箱", "配送时间"],
      "quantity": "两箱",
      "reply_zh": "您好，感谢您的购买！有机番茄两箱今天下单，预计 1-3 天送达，请留意收货。",
      "reply": "¡Hola! Gracias por su compra. Los dos cajas de tomates orgánicos se entregarán en 1-3 días.",
      "confidence": 0.92,
      "need_review": false
    },
    "recordId": 12
  }
}
```

- 修改时间：2026-11-19 12:42:00

---

## 接口：/api/voice/languages　查询支持的语种列表（新增）

- 接口路径：`/api/voice/languages`
- HTTP 方法：`GET`
- 请求参数：无
- 请求示例：

```text
http://localhost:8115/api/voice/languages
```

- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "获取支持语种成功",
  "data": {
    "total": 86,
    "auto": { "code": "auto", "name": "自动检测" },
    "list": [
      { "code": "zh", "name": "中文（普通话）" },
      { "code": "yue", "name": "粤语" },
      { "code": "en", "name": "英语" },
      { "code": "es", "name": "西班牙语" },
      { "code": "ar", "name": "阿拉伯语" }
    ]
  }
}
```

- 说明：共 85 个语种（覆盖世界各国家/地区主要语言与常见方言），前端「识别语种」下拉框据此动态生成。
- 修改时间：2026-11-19 12:42:00

---

## 接口：/api/auth/captcha　获取图形验证码

- 接口路径：`/api/auth/captcha`
- HTTP 方法：`GET`
- 请求参数：无
- 请求示例：

```http
GET http://localhost:8115/api/auth/captcha
```

- 响应格式：

```json
{
  "code": 0,
  "msg": "获取验证码成功",
  "data": {
    "captchaId": "02672eb7fe4a9e2243ad651a",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"44\">…</svg>",
    "expireIn": 300
  }
}
```

- 说明：4 位字符验证码，保存在后端内存，5 分钟内有效且只能校验一次；前端直接渲染 `svg`，点击图片重新获取。
- 修改时间：2026-11-19 15:55:00

---

## 接口：/api/auth/register　用户注册

- 接口路径：`/api/auth/register`
- HTTP 方法：`POST`
- 请求参数（JSON Body）：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| username | string | 是 | 字母开头，4-20 位字母 / 数字 / 下划线，唯一 |
| nickname | string | 是 | 昵称，2-20 个字符 |
| email | string | 否 | 邮箱，填写时校验格式 |
| password | string | 是 | 8-20 位，必须同时包含字母和数字 |
| password2 | string | 是 | 确认密码，需与 password 一致 |
| captchaId | string | 是 | 验证码接口返回的 captchaId |
| captchaCode | string | 是 | 用户输入的 4 位验证码 |

- 请求示例：

```json
{
  "username": "farmer02",
  "nickname": "果园小周",
  "email": "farmer02@zhangfarm.cn",
  "password": "zhang123456",
  "password2": "zhang123456",
  "captchaId": "02672eb7fe4a9e2243ad651a",
  "captchaCode": "89L4"
}
```

- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "注册成功，请前往登录",
  "data": {
    "user": {
      "id": 9,
      "username": "farmer02",
      "nickname": "果园小周",
      "email": "farmer02@zhangfarm.cn",
      "createTime": "2026-11-19T07:52:30.000Z",
      "lastLoginTime": null
    }
  }
}
```

- 响应格式（失败示例）：

```json
{ "code": 1, "msg": "该用户名已被注册，请更换用户名", "data": null }
```

- 说明：密码使用 Node 内置 `crypto.scryptSync` 加盐哈希后写入 `zhang_user`，数据库中不保存明文。
- 修改时间：2026-11-19 15:55:00

---

## 接口：/api/auth/login　用户登录

- 接口路径：`/api/auth/login`
- HTTP 方法：`POST`
- 请求参数（JSON Body）：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| username | string | 是 | 用户名 |
| password | string | 是 | 密码明文，服务端与加盐哈希比对 |
| captchaId | string | 是 | 验证码接口返回的 captchaId |
| captchaCode | string | 是 | 用户输入的 4 位验证码 |

- 请求示例：

```json
{
  "username": "farmer01",
  "password": "zhang123456",
  "captchaId": "4b1f0b9c1a2d3e4f5a6b7c8d",
  "captchaCode": "8KQ2"
}
```

- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiZmFybWVyMDEi…",
    "tokenExpire": 7200,
    "user": {
      "id": 1,
      "username": "farmer01",
      "nickname": "田间老张",
      "email": "farmer01@zhangfarm.cn",
      "createTime": "2026-10-20T07:50:32.000Z",
      "lastLoginTime": "2026-11-19T07:52:17.000Z"
    }
  }
}
```

- 响应格式（失败示例）：

```json
{ "code": 1, "msg": "用户名或密码错误", "data": null }
```

- 说明：令牌为 HMAC-SHA256 自签名结构，有效期 7200 秒，前端保存在 `localStorage` 并随请求放入 `Authorization: Bearer <token>`。
- 修改时间：2026-11-19 15:55:00

---

## 接口：/api/auth/me　获取当前登录用户

- 接口路径：`/api/auth/me`
- HTTP 方法：`GET`
- 请求参数（请求头）：

| 参数 | 位置 | 必填 | 说明 |
| --- | --- | --- | --- |
| Authorization | Header | 是 | `Bearer <登录接口返回的 token>` |

- 请求示例：

```http
GET http://localhost:8115/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs…
```

- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "获取当前用户成功",
  "data": {
    "user": {
      "id": 1,
      "username": "farmer01",
      "nickname": "田间老张",
      "email": "farmer01@zhangfarm.cn",
      "createTime": "2026-10-20T07:50:32.000Z",
      "lastLoginTime": "2026-11-19T07:52:17.000Z"
    }
  }
}
```

- 响应格式（令牌无效或过期）：

```json
{ "code": 401, "msg": "登录状态已失效，请重新登录", "data": null }
```

- 说明：登录页打开时用本地令牌调用此接口，成功即恢复登录状态，失败则清除本地令牌。
- 修改时间：2026-11-19 15:55:00

---

## 接口：/api/admin/login　管理员登录

- 接口路径：`/api/admin/login`
- HTTP 方法：`POST`
- 请求参数（JSON Body）：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| username | string | 是 | 管理员用户名 |
| password | string | 是 | 密码明文，服务端与 scrypt 哈希比对 |
| captchaId | string | 是 | 验证码接口返回的 captchaId |
| captchaCode | string | 是 | 4 位图形验证码 |

- 请求示例：

```json
{
  "username": "zhang_admin",
  "password": "admin123456",
  "captchaId": "02672eb7fe4a9e2243ad651a",
  "captchaCode": "X4RB"
}
```

- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "登录成功，欢迎回来",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiemhhbmdfYWRtaW4iLCJyb2xlIjoiYWRtaW4i…",
    "tokenExpire": 7200,
    "admin": {
      "id": 1,
      "username": "zhang_admin",
      "realname": "张婧雅",
      "role": "超级管理员",
      "status": 1,
      "createTime": "2026-09-20T07:50:32.000Z",
      "lastLoginTime": "2026-11-19T08:35:00.000Z"
    }
  }
}
```

- 响应格式（失败）：

```json
{ "code": 1, "msg": "图形验证码错误或已过期，请刷新后重试", "data": null }
```

```json
{ "code": 1, "msg": "管理员用户名或密码错误", "data": null }
```

- 说明：令牌载荷包含 `role: "admin"`，有效期 7200 秒，前端保存在 `localStorage`（键 `zhang_admin_token`）。
- 修改时间：2026-11-19 16:45:00

---

## 接口：/api/admin/me　获取当前登录管理员

- 接口路径：`/api/admin/me`
- HTTP 方法：`GET`
- 请求参数（请求头）：`Authorization: Bearer <管理员 token>`
- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "获取当前管理员成功",
  "data": {
    "admin": { "id": 1, "username": "zhang_admin", "realname": "张婧雅", "role": "超级管理员", "status": 1 }
  }
}
```

- 响应格式（未登录 / 令牌失效）：HTTP 401

```json
{ "code": 401, "msg": "未登录或登录状态已失效，请先登录管理后台", "data": null }
```

- 修改时间：2026-11-19 16:45:00

---

## 接口：/api/admin/dashboard　仪表盘统计数据

- 接口路径：`/api/admin/dashboard`
- HTTP 方法：`GET`
- 请求参数：请求头 `Authorization: Bearer <管理员 token>`
- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "获取仪表盘数据成功",
  "data": {
    "stats": { "news": 10, "produce": 10, "user": 9, "views": 25699 },
    "newsCategory": [{ "zhang_name": "芯片", "zhang_value": 3 }],
    "produceCategory": [{ "zhang_name": "时令水果", "zhang_value": "1600", "zhang_count": 3 }],
    "userTrend": [{ "zhang_date": "11-19", "zhang_value": 1 }],
    "stockTop": [{ "zhang_name": "散养土鸡蛋", "zhang_value": 1200, "zhang_unit": "枚" }],
    "latestNews": [{ "zhang_id": 1, "zhang_title": "国产大模型开源生态加速…", "zhang_category": "人工智能", "zhang_author": "李明", "zhang_views": 5821, "zhang_publish_time": "2026-11-09T01:20:00.000Z" }]
  }
}
```

- 说明：全部数值由 `zhang_news`、`zhang_produce`、`zhang_user` 聚合查询得出，前端 Canvas 图表直接使用该数据。
- 修改时间：2026-11-19 16:45:00

---

## 接口：/api/admin/news　新闻列表 / 新增

- 接口路径：`/api/admin/news`
- HTTP 方法：`GET`（列表）、`POST`（新增）
- GET 请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页条数，默认 8，最大 50 |
| keyword | string | 否 | 按标题 / 分类 / 作者 / 来源模糊搜索 |

- GET 响应示例：

```json
{
  "code": 0,
  "msg": "获取新闻列表成功",
  "data": { "total": 3, "page": 1, "pageSize": 8, "keyword": "芯片", "list": [{ "zhang_id": 2, "zhang_title": "新一代国产 GPU 量产…", "zhang_category": "芯片", "zhang_views": 4310, "zhang_publish_time": "2026-11-08T08:05:00.000Z" }] }
}
```

- POST 请求参数（JSON Body，均为必填，views 与 publishTime 可选）：

```json
{
  "title": "标题",
  "category": "软件工程",
  "summary": "摘要",
  "content": "正文",
  "source": "来源",
  "author": "作者",
  "views": 0,
  "publishTime": "2026-11-19T10:00"
}
```

- POST 响应示例：

```json
{ "code": 0, "msg": "新增新闻成功", "data": { "news": { "zhang_id": 11, "zhang_title": "标题" } } }
```

- 修改时间：2026-11-19 16:45:00

---

## 接口：/api/admin/news/:id　新闻详情 / 修改 / 删除

- 接口路径：`/api/admin/news/:id`
- HTTP 方法：`GET`（详情，含正文）、`PUT`（修改，请求体同新增）、`DELETE`（删除）
- 请求示例：

```http
GET    http://localhost:8115/api/admin/news/2
PUT    http://localhost:8115/api/admin/news/11
DELETE http://localhost:8115/api/admin/news/11
```

- 响应示例：

```json
{ "code": 0, "msg": "获取新闻详情成功", "data": { "news": { "zhang_id": 2, "zhang_title": "新一代国产 GPU 量产…", "zhang_content": "该卡采用新架构……" } } }
```

```json
{ "code": 0, "msg": "修改新闻成功", "data": { "news": { "zhang_id": 11 } } }
```

```json
{ "code": 0, "msg": "删除新闻成功", "data": { "id": 11 } }
```

- 响应格式（不存在）：

```json
{ "code": 1, "msg": "新闻不存在或已被删除", "data": null }
```

- 修改时间：2026-11-19 16:45:00

---

## 接口：/api/admin/produce　农产品列表 / 新增

- 接口路径：`/api/admin/produce`
- HTTP 方法：`GET`（列表）、`POST`（新增）
- GET 参数：`page`、`pageSize`、`keyword`（按名称 / 分类 / 产地 / 描述搜索）
- POST 请求参数（JSON Body）：

```json
{
  "name": "有机番茄",
  "category": "时令蔬菜",
  "price": 12.8,
  "unit": "斤",
  "origin": "山东寿光",
  "desc": "温室有机种植……",
  "image": "https://…",
  "stock": 320
}
```

- 响应示例：

```json
{ "code": 0, "msg": "获取农产品列表成功", "data": { "total": 6, "page": 1, "pageSize": 8, "keyword": "时令", "list": [{ "zhang_id": 1, "zhang_name": "有机番茄", "zhang_price": "12.80", "zhang_stock": 320 }] } }
```

```json
{ "code": 0, "msg": "新增农产品成功", "data": { "produce": { "zhang_id": 11, "zhang_name": "有机番茄" } } }
```

- 修改时间：2026-11-19 16:45:00

---

## 接口：/api/admin/produce/:id　农产品详情 / 修改 / 删除

- 接口路径：`/api/admin/produce/:id`
- HTTP 方法：`GET`、`PUT`（请求体同新增）、`DELETE`
- 响应示例：

```json
{ "code": 0, "msg": "获取农产品详情成功", "data": { "produce": { "zhang_id": 1, "zhang_name": "有机番茄", "zhang_desc": "温室有机种植……", "zhang_image": "https://…" } } }
```

```json
{ "code": 0, "msg": "删除农产品成功", "data": { "id": 11 } }
```

- 修改时间：2026-11-19 16:45:00

---

## 接口：/api/admin/users　用户列表 / 新增

- 接口路径：`/api/admin/users`
- HTTP 方法：`GET`（列表）、`POST`（新增）
- GET 参数：`page`、`pageSize`、`keyword`（按用户名 / 昵称 / 邮箱搜索）
- POST 请求参数（JSON Body）：

```json
{
  "username": "farmer09",
  "nickname": "果园小周",
  "email": "farmer09@zhangfarm.cn",
  "password": "zhang123456"
}
```

- 响应示例：

```json
{ "code": 0, "msg": "获取用户列表成功", "data": { "total": 9, "page": 1, "pageSize": 8, "keyword": "", "list": [{ "zhang_id": 1, "zhang_username": "farmer01", "zhang_nickname": "田间老张", "zhang_email": "farmer01@zhangfarm.cn" }] } }
```

```json
{ "code": 0, "msg": "新增用户成功", "data": { "user": { "zhang_id": 10, "zhang_username": "farmer09" } } }
```

- 说明：新增用户时密码由服务端 scrypt 加盐哈希后入库。
- 修改时间：2026-11-19 16:45:00

---

## 接口：/api/admin/users/:id　用户详情 / 修改 / 删除

- 接口路径：`/api/admin/users/:id`
- HTTP 方法：`GET`、`PUT`、`DELETE`
- PUT 请求参数（JSON Body，password 留空则不修改密码）：

```json
{ "nickname": "果园小周", "email": "farmer09@zhangfarm.cn", "password": "" }
```

- 响应示例：

```json
{ "code": 0, "msg": "修改用户成功", "data": { "user": { "zhang_id": 10, "zhang_username": "farmer09" } } }
```

```json
{ "code": 0, "msg": "删除用户成功", "data": { "id": 10 } }
```

- 修改时间：2026-11-19 16:45:00

---

## 接口：/api/auth/supabase/status　Supabase 配置状态

- 接口路径：`/api/auth/supabase/status`
- HTTP 方法：`GET`
- 请求参数：无
- 响应示例（已配置）：

```json
{ "code": 0, "msg": "Supabase 已配置，可以进行注册与登录", "data": { "configured": true, "hasSecretKey": true, "hint": "" } }
```

- 响应示例（缺少项目 URL）：

```json
{
  "code": 0,
  "msg": "Supabase 缺少项目 URL，暂不可用",
  "data": {
    "configured": false,
    "hasSecretKey": true,
    "hint": "Supabase 尚未完成配置：请在 backend/.env 中填写 SUPABASE_URL（形如 https://xxxx.supabase.co）后重启服务"
  }
}
```

- 说明：用于前端判断是否展示 Supabase 登录入口，不返回密钥内容。
- 修改时间：2026-11-23 15:50:00

---

## 接口：/api/auth/supabase/register　Supabase 注册

- 接口路径：`/api/auth/supabase/register`
- HTTP 方法：`POST`
- 请求参数（JSON Body）：

```json
{ "email": "supatest@zhangfarm.cn", "password": "zhang123456", "nickname": "测试用户" }
```

- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "Supabase 注册成功，请使用邮箱和密码登录",
  "data": { "supabaseUser": { "id": "7f1c…", "email": "supatest@zhangfarm.cn", "nickname": "测试用户" } }
}
```

- 响应格式（未配置项目 URL）：

```json
{ "code": 1, "msg": "Supabase 尚未完成配置：请在 backend/.env 中填写 SUPABASE_URL（形如 https://xxxx.supabase.co）后重启服务", "data": null }
```

- 说明：服务端调用 Supabase Admin API 创建用户并自动确认邮箱，注册后可直接登录；密钥仅在服务端使用。
- 修改时间：2026-11-23 15:50:00

---

## 接口：/api/auth/supabase/login　Supabase 登录

- 接口路径：`/api/auth/supabase/login`
- HTTP 方法：`POST`
- 请求参数（JSON Body）：

```json
{ "email": "supatest@zhangfarm.cn", "password": "zhang123456" }
```

- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "Supabase 登录成功",
  "data": {
    "session": { "accessToken": "eyJhbGciOi…", "refreshToken": "v1…", "expiresIn": 3600, "tokenType": "bearer" },
    "supabaseUser": { "id": "7f1c…", "email": "supatest@zhangfarm.cn", "nickname": "测试用户" },
    "token": "本站自签令牌",
    "user": { "id": 10, "username": "supatest", "nickname": "测试用户", "email": "supatest@zhangfarm.cn" }
  }
}
```

- 响应格式（账号密码错误）：

```json
{ "code": 1, "msg": "邮箱或密码错误，请重新输入", "data": null }
```

- 说明：登录成功后把 Supabase 用户资料同步到本地 `zhang_user`（已存在则直接复用），并签发本站令牌，原有用户相关接口可继续使用。
- 修改时间：2026-11-23 15:50:00

---

## 接口：/api/auth/supabase/me　获取 Supabase 当前用户

- 接口路径：`/api/auth/supabase/me`
- HTTP 方法：`GET`
- 请求参数（请求头）：`Authorization: Bearer <Supabase access_token>`
- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "获取 Supabase 用户成功",
  "data": {
    "supabaseUser": { "id": "7f1c…", "email": "supatest@zhangfarm.cn", "nickname": "测试用户" },
    "user": { "id": 10, "username": "supatest", "nickname": "测试用户" }
  }
}
```

- 响应格式（令牌无效或过期）：HTTP 401

```json
{ "code": 401, "msg": "Supabase 令牌无效或已过期，请重新登录", "data": null }
```

- 修改时间：2026-11-23 15:50:00

---
