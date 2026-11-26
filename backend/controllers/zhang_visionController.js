/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-16 | 大模型：DeepSeek-V4.1-Flash
*/

var multer = require('multer');
var zhang_visionModel = require('../models/zhang_visionModel');

// ===== 硅基流动服务配置（密钥统一存放在 backend/.env） =====
var zhang_apiKey = process.env.LLM_API_KEY || '';
var zhang_baseUrl = (process.env.LLM_BASE_URL || 'https://api.siliconflow.cn/v1').replace(/\/+$/, '');
// 图像识别模型：Qwen3-VL-8B-Instruct（多模态视觉语言模型）
var zhang_vlmModel = process.env.VLM_MODEL || 'Qwen/Qwen3-VL-8B-Instruct';

// 图片上传（内存存储，转 base64 后以 data URL 形式发送给模型）
var zhang_uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (zhang_req, zhang_file, zhang_cb) {
    var zhang_ext = (zhang_file.originalname.split('.').pop() || '').toLowerCase();
    var zhang_allow = ['jpg', 'jpeg', 'png', 'webp', 'bmp'];
    if (zhang_allow.indexOf(zhang_ext) !== -1) {
      zhang_cb(null, true);
    } else {
      zhang_cb(new Error('仅支持 jpg、jpeg、png、webp、bmp 格式的图片'));
    }
  }
}).single('file');

/**
 * 从模型输出文本中容错解析 JSON（兼容 ```json 包裹与前后多余文字）
 */
function zhang_parseJson(zhang_text) {
  if (!zhang_text) return null;
  var zhang_str = String(zhang_text).trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();

  try {
    return JSON.parse(zhang_str);
  } catch (zhang_e) {
    // 继续尝试截取第一个 { 到最后一个 }
  }

  var zhang_start = zhang_str.indexOf('{');
  var zhang_end = zhang_str.lastIndexOf('}');
  if (zhang_start !== -1 && zhang_end > zhang_start) {
    try {
      return JSON.parse(zhang_str.substring(zhang_start, zhang_end + 1));
    } catch (zhang_e2) {
      return null;
    }
  }

  return null;
}

/**
 * 图像识别接口：图片 -> 视觉语言模型 -> 结构化 JSON -> 写入记录表
 */
async function zhang_visionAnalyze(zhang_req, zhang_res) {
  if (!zhang_req.file) {
    return zhang_res.json({ code: 1, msg: '请选择要识别的图片', data: null });
  }

  // multer 按 latin1 解析上传文件名，中文文件名需转回 utf8
  var zhang_filename = Buffer.from(zhang_req.file.originalname, 'latin1').toString('utf8');
  var zhang_mimetype = zhang_req.file.mimetype || 'image/jpeg';
  var zhang_model = zhang_req.body.model || zhang_vlmModel;
  var zhang_question = (zhang_req.body.question || '').trim();

  if (!zhang_apiKey) {
    return zhang_res.json({ code: 1, msg: '服务端未配置 LLM_API_KEY，请检查 backend/.env', data: null });
  }

  var zhang_base64 = zhang_req.file.buffer.toString('base64');
  var zhang_dataUrl = 'data:' + zhang_mimetype + ';base64,' + zhang_base64;

  var zhang_system = [
    '你是“田园优选”农产品电商网站的图像识别助手。',
    '请观察图片，识别其中的农产品、包装或场景，只输出严格的 JSON，不要输出 markdown 代码块或多余解释。',
    'JSON 字段要求：',
    '{',
    '  "name": "图片主体名称",',
    '  "category": "新鲜果蔬 | 山珍干货 | 五谷粮油 | 生鲜肉类 | 包装物料 | 其他（六选一）",',
    '  "items": ["识别到的物品名称，最多 6 个"],',
    '  "freshness": "新鲜 | 一般 | 不新鲜 | 无法判断",',
    '  "description": "80 字以内的中文描述",',
    '  "tags": ["关键词标签，最多 5 个"],',
    '  "confidence": 0 到 1 之间的数字',
    '}',
    '若图片与农产品无关，请在 description 中说明，category 填“其他”。'
  ].join('\n');

  var zhang_userText = zhang_question || '请识别这张图片，并按要求输出 JSON。';

  var zhang_sendData = {
    model: zhang_model,
    temperature: 0.2,
    messages: [
      { role: 'system', content: zhang_system },
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: zhang_dataUrl } },
          { type: 'text', text: zhang_userText }
        ]
      }
    ]
  };

  try {
    // 控制台不打印完整 base64，避免刷屏，仅打印图片信息与提示词
    console.log('===== [图像识别] 发送给大模型的数据 =====');
    console.log(JSON.stringify({
      model: zhang_model,
      filename: zhang_filename,
      mimetype: zhang_mimetype,
      size: zhang_req.file.size,
      imageUrl: zhang_dataUrl.substring(0, 80) + '…（base64 已省略）',
      messages: [
        zhang_sendData.messages[0],
        { role: 'user', content: [{ type: 'image_url', image_url: { url: 'data:image/…;base64,…' } }, zhang_sendData.messages[1].content[1]] }
      ]
    }, null, 2));

    var zhang_t0 = Date.now();
    var zhang_response = await fetch(zhang_baseUrl + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + zhang_apiKey
      },
      body: JSON.stringify(zhang_sendData)
    });

    var zhang_raw = await zhang_response.text();
    var zhang_json = null;
    try {
      zhang_json = JSON.parse(zhang_raw);
    } catch (zhang_e) {
      zhang_json = null;
    }

    console.log('===== [图像识别] 从大模型接收到的数据 =====');
    console.log(zhang_raw);
    console.log('==========================================');

    if (zhang_response.status !== 200 || !zhang_json || !zhang_json.choices) {
      return zhang_res.json({
        code: 1,
        msg: '图像识别失败（HTTP ' + zhang_response.status + '）',
        data: { statusCode: zhang_response.status, raw: zhang_raw }
      });
    }

    var zhang_content = zhang_json.choices[0].message.content || '';
    var zhang_result = zhang_parseJson(zhang_content);

    // 模型未按 JSON 输出时，做兜底，保证前端始终有内容可展示
    var zhang_fallback = false;
    if (!zhang_result) {
      zhang_fallback = true;
      zhang_result = {
        name: zhang_filename,
        category: '其他',
        items: [],
        freshness: '无法判断',
        description: zhang_content || '模型未返回可解析的内容',
        tags: [],
        confidence: 0
      };
    }

    // 写入数据库（失败不影响识别结果返回）
    var zhang_recordId = null;
    try {
      zhang_recordId = await zhang_visionModel.zhang_insertRecord({
        filename: zhang_filename,
        name: zhang_result.name || '',
        category: zhang_result.category || '',
        items: Array.isArray(zhang_result.items) ? zhang_result.items.join('、') : '',
        freshness: zhang_result.freshness || '',
        description: zhang_result.description || '',
        tags: Array.isArray(zhang_result.tags) ? zhang_result.tags.join('、') : '',
        confidence: Number(zhang_result.confidence) || 0,
        model: zhang_model
      });
    } catch (zhang_dbErr) {
      console.error('图像识别记录写入失败：', zhang_dbErr.message);
    }

    return zhang_res.json({
      code: 0,
      msg: zhang_fallback ? '图像识别完成（模型未返回标准 JSON，已兜底展示原文）' : '图像识别成功',
      data: {
        model: zhang_model,
        costMs: Date.now() - zhang_t0,
        result: zhang_result,
        fallback: zhang_fallback,
        recordId: zhang_recordId,
        sendData: {
          model: zhang_model,
          filename: zhang_filename,
          mimetype: zhang_mimetype,
          size: zhang_req.file.size,
          messages: zhang_sendData.messages
        },
        response: zhang_json
      }
    });
  } catch (zhang_err) {
    console.error('图像识别接口异常：', zhang_err.message);
    return zhang_res.json({ code: 1, msg: '图像识别接口异常：' + zhang_err.message, data: null });
  }
}

/**
 * 查询图像识别历史记录
 */
async function zhang_visionHistory(zhang_req, zhang_res) {
  var zhang_limit = parseInt(zhang_req.query.limit, 10) || 20;

  try {
    var zhang_list = await zhang_visionModel.zhang_findRecords(zhang_limit);
    return zhang_res.json({
      code: 0,
      msg: '获取图像识别记录成功',
      data: { total: zhang_list.length, list: zhang_list }
    });
  } catch (zhang_err) {
    console.error('查询图像识别记录失败：', zhang_err.message);
    return zhang_res.json({ code: 1, msg: '查询图像识别记录失败：' + zhang_err.message, data: null });
  }
}

module.exports = {
  zhang_uploadMiddleware,
  zhang_visionAnalyze,
  zhang_visionHistory
};
