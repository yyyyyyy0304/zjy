/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

var multer = require('multer');
var zhang_voiceModel = require('../models/zhang_voiceModel');

// ===== 硅基流动服务配置（密钥统一存放在 backend/.env） =====
var zhang_apiKey = process.env.LLM_API_KEY || '';
var zhang_baseUrl = (process.env.LLM_BASE_URL || 'https://api.siliconflow.cn/v1').replace(/\/+$/, '');
// 语音识别模型：Qwen3-ASR-1.7B（支持中英等多语种）
var zhang_asrModel = process.env.ASR_MODEL || 'Qwen/Qwen3-ASR-1.7B';
// 回退模型：识别失败或无文本时改用 SenseVoiceSmall（支持 50+ 语种）
var zhang_asrFallbackModel = process.env.ASR_FALLBACK_MODEL || 'FunAudioLLM/SenseVoiceSmall';
// 【本次新增】多语种模型链：按顺序依次尝试，任一模型得到文本即停止，覆盖世界各国家/地区语言
var zhang_asrModels = String(
  process.env.ASR_MODEL_CHAIN || [zhang_asrModel, zhang_asrFallbackModel, 'TeleAI/TeleSpeechASR'].join(',')
)
  .split(',')
  .map(function (zhang_item) {
    return zhang_item.trim();
  })
  .filter(function (zhang_item, zhang_index, zhang_arr) {
    return zhang_item && zhang_arr.indexOf(zhang_item) === zhang_index;
  });
// 【本次新增】是否把用户选择的语种作为 language 参数传给识别模型（默认关闭，避免个别模型不认识该字段）
var zhang_sendLanguageParam = String(process.env.ASR_SEND_LANGUAGE || '0') === '1';
// 文本理解模型：用于多语种判定、翻译与客服意图识别
var zhang_chatModel = process.env.LLM_MODEL || 'deepseek-ai/DeepSeek-V4-Flash';

// ===== 【本次新增】语种字典：覆盖世界各国家/地区的主要语言与常见方言 =====
var zhang_languages = [
  { code: 'zh', name: '中文（普通话）' },
  { code: 'yue', name: '粤语' },
  { code: 'en', name: '英语' },
  { code: 'ja', name: '日语' },
  { code: 'ko', name: '韩语' },
  { code: 'fr', name: '法语' },
  { code: 'de', name: '德语' },
  { code: 'es', name: '西班牙语' },
  { code: 'pt', name: '葡萄牙语' },
  { code: 'it', name: '意大利语' },
  { code: 'ru', name: '俄语' },
  { code: 'uk', name: '乌克兰语' },
  { code: 'be', name: '白俄罗斯语' },
  { code: 'pl', name: '波兰语' },
  { code: 'cs', name: '捷克语' },
  { code: 'sk', name: '斯洛伐克语' },
  { code: 'sl', name: '斯洛文尼亚语' },
  { code: 'hr', name: '克罗地亚语' },
  { code: 'sr', name: '塞尔维亚语' },
  { code: 'bg', name: '保加利亚语' },
  { code: 'ro', name: '罗马尼亚语' },
  { code: 'hu', name: '匈牙利语' },
  { code: 'el', name: '希腊语' },
  { code: 'nl', name: '荷兰语' },
  { code: 'sv', name: '瑞典语' },
  { code: 'no', name: '挪威语' },
  { code: 'da', name: '丹麦语' },
  { code: 'fi', name: '芬兰语' },
  { code: 'is', name: '冰岛语' },
  { code: 'et', name: '爱沙尼亚语' },
  { code: 'lv', name: '拉脱维亚语' },
  { code: 'lt', name: '立陶宛语' },
  { code: 'ga', name: '爱尔兰语' },
  { code: 'cy', name: '威尔士语' },
  { code: 'ca', name: '加泰罗尼亚语' },
  { code: 'eu', name: '巴斯克语' },
  { code: 'sq', name: '阿尔巴尼亚语' },
  { code: 'mk', name: '马其顿语' },
  { code: 'mt', name: '马耳他语' },
  { code: 'tr', name: '土耳其语' },
  { code: 'az', name: '阿塞拜疆语' },
  { code: 'hy', name: '亚美尼亚语' },
  { code: 'ka', name: '格鲁吉亚语' },
  { code: 'he', name: '希伯来语' },
  { code: 'ar', name: '阿拉伯语' },
  { code: 'fa', name: '波斯语' },
  { code: 'ur', name: '乌尔都语' },
  { code: 'hi', name: '印地语' },
  { code: 'bn', name: '孟加拉语' },
  { code: 'ne', name: '尼泊尔语' },
  { code: 'si', name: '僧伽罗语' },
  { code: 'ta', name: '泰米尔语' },
  { code: 'te', name: '泰卢固语' },
  { code: 'mr', name: '马拉地语' },
  { code: 'gu', name: '古吉拉特语' },
  { code: 'pa', name: '旁遮普语' },
  { code: 'kn', name: '卡纳达语' },
  { code: 'ml', name: '马拉雅拉姆语' },
  { code: 'vi', name: '越南语' },
  { code: 'th', name: '泰语' },
  { code: 'lo', name: '老挝语' },
  { code: 'km', name: '高棉语' },
  { code: 'my', name: '缅甸语' },
  { code: 'ms', name: '马来语' },
  { code: 'id', name: '印尼语' },
  { code: 'jv', name: '爪哇语' },
  { code: 'fil', name: '菲律宾语' },
  { code: 'mn', name: '蒙古语' },
  { code: 'kk', name: '哈萨克语' },
  { code: 'uz', name: '乌兹别克语' },
  { code: 'ky', name: '吉尔吉斯语' },
  { code: 'tg', name: '塔吉克语' },
  { code: 'ps', name: '普什图语' },
  { code: 'ku', name: '库尔德语' },
  { code: 'sw', name: '斯瓦希里语' },
  { code: 'am', name: '阿姆哈拉语' },
  { code: 'ha', name: '豪萨语' },
  { code: 'yo', name: '约鲁巴语' },
  { code: 'ig', name: '伊博语' },
  { code: 'zu', name: '祖鲁语' },
  { code: 'af', name: '南非荷兰语' },
  { code: 'so', name: '索马里语' },
  { code: 'mg', name: '马达加斯加语' },
  { code: 'eo', name: '世界语' },
  { code: 'la', name: '拉丁语' }
];

// 模型/SenseVoice 可能返回的语种别名 -> 标准代码
var zhang_languageAlias = {
  auto: '',
  none: '',
  unknown: '',
  'n/a': '',
  null: '',
  zhcn: 'zh',
  'zh-cn': 'zh',
  'zh-hans': 'zh',
  'zh-tw': 'zh',
  'zh-hant': 'zh',
  cmn: 'zh',
  mandarin: 'zh',
  chinese: 'zh',
  cantonese: 'yue',
  english: 'en',
  japanese: 'ja',
  korean: 'ko',
  spanish: 'es',
  french: 'fr',
  german: 'de',
  russian: 'ru',
  arabic: 'ar',
  portuguese: 'pt',
  italian: 'it',
  vietnamese: 'vi',
  thai: 'th',
  indonesian: 'id',
  hindi: 'hi',
  turkish: 'tr',
  dutch: 'nl',
  polish: 'pl',
  ukrainian: 'uk'
};

/**
 * 根据语种代码取中文名称
 */
function zhang_languageName(zhang_code) {
  var zhang_key = String(zhang_code || '').toLowerCase();
  for (var zhang_i = 0; zhang_i < zhang_languages.length; zhang_i++) {
    if (zhang_languages[zhang_i].code === zhang_key) {
      return zhang_languages[zhang_i].name;
    }
  }
  return '';
}

/**
 * 【本次新增】把模型返回/用户选择的各种语种写法统一成 ISO 639-1 代码
 * 兼容 zh-CN、cmn、Mandarin、中文（普通话）、None 等写法
 */
function zhang_normalizeLanguage(zhang_value) {
  var zhang_raw = String(zhang_value == null ? '' : zhang_value).trim();
  if (!zhang_raw) return '';

  var zhang_lower = zhang_raw.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(zhang_languageAlias, zhang_lower)) {
    return zhang_languageAlias[zhang_lower];
  }

  // 中文名称反查代码：如「日语」「西班牙语」
  for (var zhang_i = 0; zhang_i < zhang_languages.length; zhang_i++) {
    if (zhang_languages[zhang_i].name === zhang_raw) {
      return zhang_languages[zhang_i].code;
    }
  }

  // 带地区后缀的写法：en-US -> en、pt-BR -> pt
  if (zhang_lower.indexOf('-') !== -1) {
    var zhang_head = zhang_lower.split('-')[0];
    return zhang_languageName(zhang_head) || zhang_languageAlias[zhang_lower] || zhang_head;
  }

  return zhang_lower;
}

/**
 * 【本次新增】按字符集（Unicode 区间）离线判断语种
 * 作用：当识别模型没有返回 language 字段时，也能给出较准确的语种
 */
var zhang_scriptRules = [
  { code: 'ja', regex: /[\u3040-\u309F\u30A0-\u30FF]/ }, // 平假名 / 片假名
  { code: 'ko', regex: /[\uAC00-\uD7AF\u1100-\u11FF]/ }, // 谚文
  { code: 'th', regex: /[\u0E00-\u0E7F]/ }, // 泰文
  { code: 'lo', regex: /[\u0E80-\u0EFF]/ }, // 老挝文
  { code: 'ar', regex: /[\u0600-\u06FF\u0750-\u077F]/ }, // 阿拉伯文
  { code: 'he', regex: /[\u0590-\u05FF]/ }, // 希伯来文
  { code: 'ru', regex: /[\u0400-\u04FF]/ }, // 西里尔文（俄/乌/保/塞等）
  { code: 'el', regex: /[\u0370-\u03FF]/ }, // 希腊文
  { code: 'hy', regex: /[\u0530-\u058F]/ }, // 亚美尼亚文
  { code: 'ka', regex: /[\u10A0-\u10FF]/ }, // 格鲁吉亚文
  { code: 'hi', regex: /[\u0900-\u097F]/ }, // 天城文（印地/马拉地/尼泊尔）
  { code: 'bn', regex: /[\u0980-\u09FF]/ }, // 孟加拉文
  { code: 'pa', regex: /[\u0A00-\u0A7F]/ }, // 古木基文（旁遮普）
  { code: 'gu', regex: /[\u0A80-\u0AFF]/ }, // 古吉拉特文
  { code: 'ta', regex: /[\u0B80-\u0BFF]/ }, // 泰米尔文
  { code: 'te', regex: /[\u0C00-\u0C7F]/ }, // 泰卢固文
  { code: 'kn', regex: /[\u0C80-\u0CFF]/ }, // 卡纳达文
  { code: 'ml', regex: /[\u0D00-\u0D7F]/ }, // 马拉雅拉姆文
  { code: 'si', regex: /[\u0D80-\u0DFF]/ }, // 僧伽罗文
  { code: 'my', regex: /[\u1000-\u109F]/ }, // 缅甸文
  { code: 'am', regex: /[\u1200-\u137F]/ }, // 埃塞俄比亚文
  { code: 'km', regex: /[\u1780-\u17FF]/ }, // 高棉文
  { code: 'zh', regex: /[\u4E00-\u9FFF\u3400-\u4DBF]/ } // 汉字
];

function zhang_detectLanguageByScript(zhang_text) {
  var zhang_value = String(zhang_text || '');
  // 拉丁字母无法靠字符集区分语种（英/法/西/德/葡…），交给大模型判断
  if (!/[\u0080-\uFFFF]/.test(zhang_value)) return '';

  for (var zhang_i = 0; zhang_i < zhang_scriptRules.length; zhang_i++) {
    if (zhang_scriptRules[zhang_i].regex.test(zhang_value)) {
      return zhang_scriptRules[zhang_i].code;
    }
  }
  return '';
}

/**
 * 【本次新增】清理识别文本中的模型标记
 * SenseVoice 会输出 <|zh|><|NEUTRAL|><|Speech|><|woitn|> 这类标记，
 * 之前直接返回给前端会污染识别结果，这里统一剥离，并提取语种/情绪
 */
var zhang_languageTagSet = [
  'zh', 'en', 'yue', 'ja', 'ko', 'ru', 'fr', 'de', 'es', 'it', 'pt', 'ar', 'hi', 'th',
  'vi', 'id', 'ms', 'tr', 'uk', 'pl', 'nl', 'fa', 'ur', 'bn', 'ta', 'te', 'mr', 'gu',
  'pa', 'ne', 'si', 'my', 'km', 'lo', 'mn', 'kk', 'uz', 'hy', 'ka', 'he', 'el', 'hu',
  'cs', 'sk', 'ro', 'bg', 'hr', 'sr', 'sl', 'lt', 'lv', 'et', 'fi', 'sv', 'no', 'da',
  'is', 'la', 'eo', 'sw', 'am', 'ha', 'yo', 'ig', 'zu', 'af', 'ca', 'eu', 'sq', 'mk',
  'mt', 'az', 'ky', 'tg', 'ps', 'ku', 'so', 'mg', 'fil', 'jv', 'be', 'ga', 'cy'
];
var zhang_emotionTagSet = ['NEUTRAL', 'HAPPY', 'SAD', 'ANGRY', 'FEARFUL', 'DISGUSTED', 'SURPRISED', 'EMO_UNKNOWN'];

function zhang_cleanAsrText(zhang_raw) {
  var zhang_text = String(zhang_raw == null ? '' : zhang_raw);
  var zhang_tags = zhang_text.match(/<\|[\s\S]{1,24}?\|>/g) || [];
  var zhang_languageTag = '';
  var zhang_emotion = '';

  zhang_tags.forEach(function (zhang_tag) {
    var zhang_value = zhang_tag.replace(/<\|/g, '').replace(/\|>/g, '').trim();
    if (!zhang_languageTag && zhang_languageTagSet.indexOf(zhang_value.toLowerCase()) !== -1) {
      zhang_languageTag = zhang_value.toLowerCase();
    }
    if (!zhang_emotion && zhang_emotionTagSet.indexOf(zhang_value.toUpperCase()) !== -1) {
      zhang_emotion = zhang_value.toUpperCase();
    }
  });

  var zhang_cleaned = zhang_text.replace(/<\|[\s\S]{1,24}?\|>/g, ' ').replace(/\s+/g, ' ').trim();

  return { text: zhang_cleaned, language: zhang_languageTag, emotion: zhang_emotion };
}

// 音频文件上传（内存存储，解析后直接转发，不在磁盘留临时文件）
var zhang_uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: function (zhang_req, zhang_file, zhang_cb) {
    var zhang_ext = (zhang_file.originalname.split('.').pop() || '').toLowerCase();
    var zhang_allow = ['mp3', 'wav', 'm4a', 'webm', 'ogg', 'flac', 'aac', 'amr'];
    if (zhang_allow.indexOf(zhang_ext) !== -1) {
      zhang_cb(null, true);
    } else {
      zhang_cb(new Error('仅支持 mp3、wav、m4a、webm、ogg、flac、aac、amr 格式的音频'));
    }
  }
}).single('file');

/**
 * 调用硅基流动语音识别接口（/v1/audio/transcriptions）
 * @param {Buffer} zhang_buffer - 音频二进制
 * @param {string} zhang_filename - 文件名
 * @param {string} zhang_mimetype - MIME 类型
 * @param {string} zhang_model - 识别模型
 * @param {string} zhang_languageHint - 用户选择的语种（可选，是否上送由 ASR_SEND_LANGUAGE 控制）
 * @returns {Promise<Object>} - { statusCode, raw, json }
 */
async function zhang_callASR(zhang_buffer, zhang_filename, zhang_mimetype, zhang_model, zhang_languageHint) {
  var zhang_form = new FormData();
  zhang_form.append('file', new Blob([zhang_buffer], { type: zhang_mimetype || 'audio/mpeg' }), zhang_filename);
  zhang_form.append('model', zhang_model);

  // 【本次新增】可选：把指定语种传给识别模型，进一步提升小语种命中率
  if (zhang_sendLanguageParam && zhang_languageHint && zhang_languageHint !== 'auto') {
    zhang_form.append('language', zhang_languageHint);
  }

  var zhang_res = await fetch(zhang_baseUrl + '/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + zhang_apiKey },
    body: zhang_form
  });

  var zhang_raw = await zhang_res.text();
  var zhang_json = null;
  try {
    zhang_json = JSON.parse(zhang_raw);
  } catch (zhang_e) {
    zhang_json = null;
  }

  return { statusCode: zhang_res.status, raw: zhang_raw, json: zhang_json };
}

/**
 * 【本次新增】多模型链路识别：依次尝试模型链中的每个模型，任一模型识别出文本即返回
 * 目的：不同模型擅长的语种不同，串起来才能覆盖世界各国家/地区语言
 */
async function zhang_transcribeWithChain(zhang_buffer, zhang_filename, zhang_mimetype, zhang_models, zhang_languageHint) {
  var zhang_attempts = [];
  var zhang_last = null;

  for (var zhang_index = 0; zhang_index < zhang_models.length; zhang_index++) {
    var zhang_modelName = zhang_models[zhang_index];
    var zhang_result = await zhang_callASR(zhang_buffer, zhang_filename, zhang_mimetype, zhang_modelName, zhang_languageHint);
    var zhang_clean = zhang_cleanAsrText(
      zhang_result.json ? zhang_result.json.text || zhang_result.json.transcription : ''
    );

    console.log('===== [语音识别] 第 ' + (zhang_index + 1) + ' 次尝试 · 模型：' + zhang_modelName + ' =====');
    console.log('HTTP ' + zhang_result.statusCode + ' · 文本长度 ' + zhang_clean.text.length + ' · 原始返回：' + String(zhang_result.raw).substring(0, 500));

    zhang_attempts.push({
      model: zhang_modelName,
      statusCode: zhang_result.statusCode,
      textLength: zhang_clean.text.length,
      language: zhang_clean.language || ''
    });

    if (zhang_result.statusCode === 200 && zhang_clean.text) {
      return {
        asr: zhang_result,
        clean: zhang_clean,
        model: zhang_modelName,
        attempts: zhang_attempts,
        retried: zhang_index > 0
      };
    }

    zhang_last = { asr: zhang_result, clean: zhang_clean, model: zhang_modelName };
  }

  var zhang_fallback = zhang_last || {
    asr: { statusCode: 0, raw: '', json: null },
    clean: { text: '', language: '', emotion: '' },
    model: zhang_models[0]
  };

  return {
    asr: zhang_fallback.asr,
    clean: zhang_fallback.clean,
    model: zhang_fallback.model,
    attempts: zhang_attempts,
    retried: zhang_attempts.length > 1
  };
}

/**
 * 调用对话模型：多语种判定 + 翻译成中文 + 客服意图识别（JSON 结构化输出）
 * @param {string} zhang_text - 语音转写文本
 * @param {string} zhang_languageHint - 用户选择的语种（auto 表示自动检测）
 * @returns {Promise<Object>} - { statusCode, raw, json, sendData }
 */
async function zhang_callIntent(zhang_text, zhang_languageHint) {
  var zhang_system = [
    '你是“田园优选”农产品电商网站的语音客服意图识别模块，同时负责多语种归一化。',
    '用户可能使用世界上任何一个国家或地区的语言说话（包括方言、口音、中英混说、小语种），你都必须先判断语种、再理解语义，绝不能因为语种少见而拒答。',
    '只输出严格的 JSON，不要输出 markdown 代码块，不要输出任何解释文字。',
    'JSON 字段要求：',
    '{',
    '  "language": "识别到的主要语种 ISO 639-1 代码，例如 zh、en、ja、yue、ar、es；无法判断填 unknown",',
    '  "language_name": "该语种的中文名称，例如 日语、西班牙语、阿拉伯语",',
    '  "text_zh": "把用户原话完整翻译成简体中文；若原话已是中文则原样返回",',
    '  "intent": "商品咨询 | 物流查询 | 售后问题 | 下单购买 | 其他（五选一，必须用中文词）",',
    '  "keywords": ["关键商品名或问题词，最多 4 个，统一用中文写出"],',
    '  "quantity": "用户提到的数量，未提及则填空字符串",',
    '  "reply_zh": "以中文客服口吻给出 1-2 句可直接回复用户的话",',
    '  "reply": "用用户原语种写出的、与 reply_zh 意思相同的客服回复；若原语种是中文则与 reply_zh 相同",',
    '  "confidence": 0 到 1 之间的数字,',
    '  "need_review": 布尔值，confidence 低于 0.6 时为 true',
    '}'
  ].join('\n');

  var zhang_langText = !zhang_languageHint || zhang_languageHint === 'auto'
    ? '自动检测（用户未指定）'
    : zhang_languageHint + '（' + (zhang_languageName(zhang_languageHint) || '用户指定语种') + '）';

  var zhang_sendData = {
    model: zhang_chatModel,
    temperature: 0.2,
    messages: [
      { role: 'system', content: zhang_system },
      {
        role: 'user',
        content: '语音转写文本：' + zhang_text + '\n用户事先选择的语种：' + zhang_langText + '\n请严格按字段输出 JSON。'
      }
    ]
  };

  var zhang_res = await fetch(zhang_baseUrl + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + zhang_apiKey
    },
    body: JSON.stringify(zhang_sendData)
  });

  var zhang_raw = await zhang_res.text();
  var zhang_json = null;
  try {
    zhang_json = JSON.parse(zhang_raw);
  } catch (zhang_e) {
    zhang_json = null;
  }

  return { statusCode: zhang_res.status, raw: zhang_raw, json: zhang_json, sendData: zhang_sendData };
}

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
 * 语音识别接口：音频 -> 文本（多模型链路，自动适配世界各语种）-> 多语种意图 JSON -> 写入记录表
 */
async function zhang_voiceTranscribe(zhang_req, zhang_res) {
  if (!zhang_req.file) {
    return zhang_res.json({ code: 1, msg: '请选择要识别的音频文件', data: null });
  }

  // multer 按 latin1 解析上传文件名，中文文件名需转回 utf8
  var zhang_filename = Buffer.from(zhang_req.file.originalname, 'latin1').toString('utf8');
  var zhang_mimetype = zhang_req.file.mimetype;
  var zhang_requestedModel = zhang_req.body.model || zhang_asrModel;
  // 【本次新增】前端可指定语种（默认 auto 自动检测任意语言）
  var zhang_requestedLang = zhang_normalizeLanguage(zhang_req.body.language || 'auto') || 'auto';

  if (!zhang_apiKey) {
    return zhang_res.json({ code: 1, msg: '服务端未配置 LLM_API_KEY，请检查 backend/.env', data: null });
  }

  // 【本次新增】模型链：先试用户/默认模型，再依次试多语种模型，最多 3 个（避免耗时过长）
  var zhang_models = [zhang_requestedModel]
    .concat(zhang_asrModels)
    .filter(function (zhang_item, zhang_index, zhang_arr) {
      return zhang_item && zhang_arr.indexOf(zhang_item) === zhang_index;
    })
    .slice(0, 3);

  try {
    console.log('===== [语音识别] 发送给大模型的文件信息 =====');
    console.log(JSON.stringify({
      filename: zhang_filename,
      mimetype: zhang_mimetype,
      size: zhang_req.file.size,
      requestedModel: zhang_requestedModel,
      modelChain: zhang_models,
      requestedLanguage: zhang_requestedLang
    }, null, 2));

    var zhang_t0 = Date.now();
    var zhang_chain = await zhang_transcribeWithChain(
      zhang_req.file.buffer,
      zhang_filename,
      zhang_mimetype,
      zhang_models,
      zhang_requestedLang
    );

    var zhang_asr = zhang_chain.asr;
    var zhang_asrUsed = zhang_chain.model;
    var zhang_text = zhang_chain.clean.text;
    var zhang_emotion = zhang_chain.clean.emotion;

    if (zhang_asr.statusCode !== 200 && !zhang_text) {
      return zhang_res.json({
        code: 1,
        msg: '语音识别失败（HTTP ' + zhang_asr.statusCode + '）',
        data: {
          statusCode: zhang_asr.statusCode,
          raw: zhang_asr.raw,
          asrModelUsed: zhang_asrUsed,
          attempts: zhang_chain.attempts
        }
      });
    }

    // 【本次新增】语种三级判定：识别模型返回 > 用户指定 > 字符集离线判断 > 大模型判定
    var zhang_langCode = zhang_normalizeLanguage(zhang_chain.clean.language) || zhang_normalizeLanguage(zhang_asr.json && zhang_asr.json.language);
    var zhang_langSource = zhang_langCode ? 'model' : '';
    if (!zhang_langCode && zhang_requestedLang !== 'auto') {
      zhang_langCode = zhang_requestedLang;
      zhang_langSource = 'manual';
    }
    if (!zhang_langCode) {
      zhang_langCode = zhang_detectLanguageByScript(zhang_text);
      zhang_langSource = zhang_langCode ? 'script' : '';
    }

    var zhang_duration = (zhang_asr.json && zhang_asr.json.usage && zhang_asr.json.usage.seconds) || 0;

    // 识别成功后，把文本交给对话模型：判语种 + 翻中文 + 客服意图
    var zhang_intentData = null;
    var zhang_intentRaw = '';
    var zhang_intentJson = null;
    var zhang_intentSend = null;

    if (zhang_text) {
      var zhang_intentRes = await zhang_callIntent(zhang_text, zhang_requestedLang);
      zhang_intentRaw = zhang_intentRes.raw;
      zhang_intentJson = zhang_intentRes.json;
      zhang_intentSend = zhang_intentRes.sendData;

      console.log('===== [语音意图] 发送给大模型的数据 =====');
      console.log(JSON.stringify(zhang_intentSend, null, 2));
      console.log('===== [语音意图] 从大模型接收到的数据 =====');
      console.log(zhang_intentRaw);
      console.log('======================================');

      if (zhang_intentRes.statusCode === 200 && zhang_intentRes.json && zhang_intentRes.json.choices) {
        zhang_intentData = zhang_parseJson(zhang_intentRes.json.choices[0].message.content);
      }
    }

    // 大模型判定的语种作为最后兜底
    if (zhang_intentData) {
      if (!zhang_langCode) {
        zhang_langCode = zhang_normalizeLanguage(zhang_intentData.language);
        zhang_langSource = zhang_langCode ? 'llm' : '';
      }
    }

    var zhang_langName = zhang_languageName(zhang_langCode) || (zhang_intentData && zhang_intentData.language_name) || (zhang_langCode || '未知');
    var zhang_textZh = (zhang_intentData && zhang_intentData.text_zh) || '';

    // 写入数据库（失败不影响识别结果返回）
    var zhang_recordId = null;
    try {
      zhang_recordId = await zhang_voiceModel.zhang_insertRecord({
        filename: zhang_filename,
        text: zhang_text,
        language: zhang_langName + (zhang_langCode ? '（' + zhang_langCode + '）' : ''),
        duration: zhang_duration,
        model: zhang_asrUsed,
        intent: zhang_intentData ? zhang_intentData.intent || '' : '',
        keywords: zhang_intentData && Array.isArray(zhang_intentData.keywords) ? zhang_intentData.keywords.join('、') : '',
        reply: zhang_intentData ? zhang_intentData.reply || zhang_intentData.reply_zh || '' : '',
        confidence: zhang_intentData ? Number(zhang_intentData.confidence) || 0 : 0
      });
    } catch (zhang_dbErr) {
      console.error('语音识别记录写入失败：', zhang_dbErr.message);
    }

    return zhang_res.json({
      code: 0,
      msg: zhang_text
        ? '语音识别成功（' + zhang_langName + '）'
        : '未识别到语音内容：请确认录音清晰、麦克风正常；若语种较小众，可在页面上手动指定语种后重试',
      data: {
        model: zhang_asrUsed,
        requestedModel: zhang_requestedModel,
        modelChain: zhang_models,
        attempts: zhang_chain.attempts,
        retried: zhang_chain.retried,
        emptyText: !zhang_text,
        costMs: Date.now() - zhang_t0,
        language: {
          code: zhang_langCode || 'unknown',
          name: zhang_langName,
          source: zhang_langSource || 'unknown',
          requested: zhang_requestedLang
        },
        transcript: {
          // 兼容旧字段：language 仍是语种代码
          language: zhang_langCode || 'unknown',
          languageName: zhang_langName,
          text: zhang_text,
          textZh: zhang_textZh,
          emotion: zhang_emotion,
          duration: zhang_duration
        },
        intent: zhang_intentData,
        recordId: zhang_recordId,
        sendData: {
          asr: {
            model: zhang_requestedModel,
            modelChain: zhang_models,
            language: zhang_requestedLang,
            filename: zhang_filename,
            mimetype: zhang_mimetype,
            size: zhang_req.file.size
          },
          chat: zhang_intentSend
        },
        response: {
          asr: zhang_asr.json,
          chat: zhang_intentJson
        }
      }
    });
  } catch (zhang_err) {
    console.error('语音识别接口异常：', zhang_err.message);
    return zhang_res.json({ code: 1, msg: '语音识别接口异常：' + zhang_err.message, data: null });
  }
}

/**
 * 查询语音识别历史记录
 */
async function zhang_voiceHistory(zhang_req, zhang_res) {
  var zhang_limit = parseInt(zhang_req.query.limit, 10) || 20;

  try {
    var zhang_list = await zhang_voiceModel.zhang_findRecords(zhang_limit);
    return zhang_res.json({
      code: 0,
      msg: '获取语音识别记录成功',
      data: { total: zhang_list.length, list: zhang_list }
    });
  } catch (zhang_err) {
    console.error('查询语音识别记录失败：', zhang_err.message);
    return zhang_res.json({ code: 1, msg: '查询语音识别记录失败：' + zhang_err.message, data: null });
  }
}

/**
 * 【本次新增】返回支持的语种列表，供前端下拉框使用
 */
function zhang_voiceLanguages(zhang_req, zhang_res) {
  return zhang_res.json({
    code: 0,
    msg: '获取支持语种成功',
    data: {
      total: zhang_languages.length + 1,
      auto: { code: 'auto', name: '自动检测' },
      list: zhang_languages
    }
  });
}

module.exports = {
  zhang_uploadMiddleware,
  zhang_voiceTranscribe,
  zhang_voiceHistory,
  zhang_voiceLanguages
};
