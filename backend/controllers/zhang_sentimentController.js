/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-16 | 大模型：DeepSeek-V4.1-Flash
*/

var fs = require('fs');
var path = require('path');
var https = require('https');
var multer = require('multer');
var XLSX = require('xlsx');

// ===== 上传目录 =====
var zhang_uploadDir = path.join(__dirname, '..', 'zhang_sentiment_uploads');
if (!fs.existsSync(zhang_uploadDir)) {
  fs.mkdirSync(zhang_uploadDir, { recursive: true });
}

// ===== multer 配置 =====
var zhang_uploadMiddleware = multer({
  storage: multer.diskStorage({
    destination: function (zhang_req, zhang_file, zhang_cb) {
      zhang_cb(null, zhang_uploadDir);
    },
    filename: function (zhang_req, zhang_file, zhang_cb) {
      var zhang_ext = path.extname(zhang_file.originalname);
      var zhang_name = 'sentiment_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8) + zhang_ext;
      zhang_cb(null, zhang_name);
    }
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: function (zhang_req, zhang_file, zhang_cb) {
    var zhang_ext = path.extname(zhang_file.originalname).toLowerCase();
    if (['.xlsx', '.xls'].indexOf(zhang_ext) !== -1) {
      zhang_cb(null, true);
    } else {
      zhang_cb(new Error('仅支持 xlsx、xls 格式的 Excel 文件'));
    }
  }
}).single('file');

// ===== SiliconFlow API 配置 =====
var zhang_apiKey = String(process.env.LLM_API_KEY || '').trim();
var zhang_apiHost = 'api.siliconflow.cn';
var zhang_apiPath = '/v1/chat/completions';
var zhang_defaultModel = 'deepseek-ai/DeepSeek-V4-Flash';

/**
 * 调用 SiliconFlow 大模型
 */
function zhang_requestLLM(zhang_sendData) {
  return new Promise(function (zhang_resolve, zhang_reject) {
    var zhang_bodyStr = JSON.stringify(zhang_sendData);
    var zhang_options = {
      hostname: zhang_apiHost,
      path: zhang_apiPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + zhang_apiKey,
        'Content-Length': Buffer.byteLength(zhang_bodyStr)
      }
    };

    var zhang_req = https.request(zhang_options, function (zhang_res) {
      var zhang_chunks = [];
      zhang_res.on('data', function (zhang_chunk) { zhang_chunks.push(zhang_chunk); });
      zhang_res.on('end', function () {
        var zhang_raw = Buffer.concat(zhang_chunks).toString('utf8');
        try {
          zhang_resolve({ statusCode: zhang_res.statusCode, raw: zhang_raw, json: JSON.parse(zhang_raw) });
        } catch (zhang_e) {
          zhang_resolve({ statusCode: zhang_res.statusCode, raw: zhang_raw, json: null });
        }
      });
    });

    zhang_req.on('error', function (zhang_err) { zhang_reject(zhang_err); });
    zhang_req.write(zhang_bodyStr);
    zhang_req.end();
  });
}

/**
 * 情感分类接口：上传 Excel → 解析评论 → LLM 批量分类 → 返回结果
 */
async function zhang_sentimentAnalyze(zhang_req, zhang_res) {
  if (!zhang_req.file) {
    return zhang_res.json({ code: 1, msg: '请选择要上传的 Excel 文件', data: null });
  }

  var zhang_filePath = zhang_req.file.path;

  try {
    // ===== 1. 解析 Excel =====
    var zhang_workbook = XLSX.readFile(zhang_filePath);
    var zhang_sheetName = zhang_workbook.SheetNames[0];
    var zhang_sheet = zhang_workbook.Sheets[zhang_sheetName];
    var zhang_rows = XLSX.utils.sheet_to_json(zhang_sheet, { defval: '' });

    if (zhang_rows.length === 0) {
      return zhang_res.json({ code: 1, msg: 'Excel 文件中没有数据', data: null });
    }

    // 提取评论内容（支持常见列名：评论、评论内容、content、comment、text）
    var zhang_reviews = [];
    for (var zhang_i = 0; zhang_i < zhang_rows.length; zhang_i++) {
      var zhang_row = zhang_rows[zhang_i];
      var zhang_text = '';
      // 尝试常见列名
      var zhang_keys = Object.keys(zhang_row);
      for (var zhang_k = 0; zhang_k < zhang_keys.length; zhang_k++) {
        var zhang_lowerKey = zhang_keys[zhang_k].toLowerCase();
        if (['评论', '评论内容', 'content', 'comment', 'text', '评价'].indexOf(zhang_lowerKey) !== -1 ||
            zhang_keys[zhang_k] === '评论' || zhang_keys[zhang_k] === '评论内容' || zhang_keys[zhang_k] === '评价') {
          zhang_text = String(zhang_row[zhang_keys[zhang_k]] || '').trim();
          break;
        }
      }
      // 如果没匹配到列名，取第一列
      if (!zhang_text && zhang_keys.length > 0) {
        zhang_text = String(zhang_row[zhang_keys[0]] || '').trim();
      }
      if (zhang_text) {
        zhang_reviews.push({ index: zhang_i + 1, text: zhang_text });
      }
    }

    if (zhang_reviews.length === 0) {
      return zhang_res.json({ code: 1, msg: '未找到评论数据，请确保 Excel 中有评论列', data: null });
    }

    console.log('解析到 ' + zhang_reviews.length + ' 条评论，开始 LLM 分类…');

    // ===== 2. 构造 LLM 请求 =====
    // 将所有评论拼接，让 LLM 一次性分类
    var zhang_reviewList = zhang_reviews.map(function (r) {
      return '第' + r.index + '条：' + r.text;
    }).join('\n');

    var zhang_systemContent =
      '你是一个商业评论情感分析助手。请对以下每条评论进行情感分类。\n' +
      '分类标准：\n' +
      '- 好评：表达满意、赞美、推荐等正面情感\n' +
      '- 中评：中性描述、一般评价、褒贬参半\n' +
      '- 差评：表达不满、抱怨、批评等负面情感\n\n' +
      '请严格按照以下 JSON 数组格式输出结果，不要输出任何其他内容：\n' +
      '[{"index":1,"sentiment":"好评","reason":"简短理由"},{"index":2,"sentiment":"差评","reason":"简短理由"}]\n\n' +
      '注意：index 必须与输入的评论编号对应，sentiment 只能是"好评"、"中评"或"差评"三者之一。';

    var zhang_userContent = '请对以下 ' + zhang_reviews.length + ' 条商业评论进行情感分类：\n\n' + zhang_reviewList;

    var zhang_sendData = {
      model: zhang_defaultModel,
      messages: [
        { role: 'system', content: zhang_systemContent },
        { role: 'user', content: zhang_userContent }
      ]
    };

    // ===== 3. 发送给大模型 =====
    console.log('===== [情感分类] 发送给大模型的数据 =====');
    console.log(JSON.stringify(zhang_sendData, null, 2));
    console.log('========================================');

    var zhang_response = await zhang_requestLLM(zhang_sendData);

    console.log('===== [情感分类] 从大模型接收到的数据 =====');
    console.log(JSON.stringify(zhang_response.json || zhang_response.raw, null, 2));
    console.log('==========================================');

    if (zhang_response.statusCode !== 200 || !zhang_response.json) {
      return zhang_res.json({
        code: 1,
        msg: '大模型请求失败（HTTP ' + zhang_response.statusCode + '）',
        data: { statusCode: zhang_response.statusCode, raw: zhang_response.raw }
      });
    }

    // ===== 4. 解析 LLM 返回的分类结果 =====
    var zhang_reply = '';
    if (zhang_response.json.choices && zhang_response.json.choices.length > 0) {
      zhang_reply = zhang_response.json.choices[0].message.content;
    }

    // 提取 JSON 数组（LLM 可能在 JSON 前后加了文字）
    var zhang_jsonMatch = zhang_reply.match(/\[[\s\S]*\]/);
    var zhang_classifications = [];

    if (zhang_jsonMatch) {
      try {
        zhang_classifications = JSON.parse(zhang_jsonMatch[0]);
      } catch (zhang_e) {
        console.error('解析 LLM 返回的 JSON 失败：', zhang_e.message);
      }
    }

    // ===== 5. 组装最终结果 =====
    var zhang_results = [];
    var zhang_stats = { 好评: 0, 中评: 0, 差评: 0 };

    for (var zhang_r = 0; zhang_r < zhang_reviews.length; zhang_r++) {
      var zhang_review = zhang_reviews[zhang_r];
      var zhang_cls = null;

      // 从 LLM 分类结果中找到对应的 index
      for (var zhang_c = 0; zhang_c < zhang_classifications.length; zhang_c++) {
        if (zhang_classifications[zhang_c].index === zhang_review.index) {
          zhang_cls = zhang_classifications[zhang_c];
          break;
        }
      }

      var zhang_sentiment = zhang_cls ? (zhang_cls.sentiment || '中评') : '中评';
      // 规范化分类值
      if (zhang_sentiment.indexOf('好') !== -1) zhang_sentiment = '好评';
      else if (zhang_sentiment.indexOf('差') !== -1) zhang_sentiment = '差评';
      else zhang_sentiment = '中评';

      zhang_stats[zhang_sentiment]++;

      zhang_results.push({
        index: zhang_review.index,
        text: zhang_review.text,
        sentiment: zhang_sentiment,
        reason: zhang_cls ? (zhang_cls.reason || '') : ''
      });
    }

    // 精选评论：每种情感取前 3 条
    var zhang_highlights = {
      好评: zhang_results.filter(function (r) { return r.sentiment === '好评'; }).slice(0, 3),
      中评: zhang_results.filter(function (r) { return r.sentiment === '中评'; }).slice(0, 3),
      差评: zhang_results.filter(function (r) { return r.sentiment === '差评'; }).slice(0, 3)
    };

    // 删除临时文件
    fs.unlinkSync(zhang_filePath);

    console.log('情感分类完成：好评 ' + zhang_stats.好评 + '，中评 ' + zhang_stats.中评 + '，差评 ' + zhang_stats.差评);

    return zhang_res.json({
      code: 0,
      msg: '情感分类成功',
      data: {
        total: zhang_results.length,
        stats: zhang_stats,
        results: zhang_results,
        highlights: zhang_highlights,
        sendData: zhang_sendData,
        response: zhang_response.json
      }
    });
  } catch (zhang_err) {
    console.error('情感分类异常：', zhang_err.message);
    // 清理临时文件
    if (fs.existsSync(zhang_filePath)) {
      try { fs.unlinkSync(zhang_filePath); } catch (e) {}
    }
    return zhang_res.json({
      code: 1,
      msg: '情感分类异常：' + zhang_err.message,
      data: null
    });
  }
}

module.exports = {
  zhang_uploadMiddleware: zhang_uploadMiddleware,
  zhang_sentimentAnalyze: zhang_sentimentAnalyze
};
