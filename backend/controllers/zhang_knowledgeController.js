/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-12 | 大模型：DeepSeek-V4.1-Flash
*/

var fs = require('fs');
var path = require('path');
var https = require('https');
var multer = require('multer');
var mammoth = require('mammoth');
var pdfParse = require('pdf-parse');
var iconv = require('iconv-lite');

// ===== 知识库存储目录 =====
var zhang_kbDir = path.join(__dirname, '..', 'zhang_knowledge_files');

// 确保目录存在
if (!fs.existsSync(zhang_kbDir)) {
  fs.mkdirSync(zhang_kbDir, { recursive: true });
}

// ===== 内存中的知识库数据 =====
// 每条记录：{ id, filename, originalname, ext, size, uploadTime, content, chunks }
var zhang_kbStore = [];
var zhang_kbIdCounter = 1;

// ===== 文件上传配置 =====
var zhang_storage = multer.diskStorage({
  destination: function (zhang_req, zhang_file, zhang_cb) {
    zhang_cb(null, zhang_kbDir);
  },
  filename: function (zhang_req, zhang_file, zhang_cb) {
    var zhang_ext = path.extname(zhang_file.originalname);
    var zhang_name = 'kb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8) + zhang_ext;
    zhang_cb(null, zhang_name);
  }
});

// multer 中间件（仅允许 txt / pdf / doc / docx）
var zhang_uploadMiddleware = multer({
  storage: zhang_storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: function (zhang_req, zhang_file, zhang_cb) {
    var zhang_ext = path.extname(zhang_file.originalname).toLowerCase();
    if (['.txt', '.pdf', '.doc', '.docx'].indexOf(zhang_ext) !== -1) {
      zhang_cb(null, true);
    } else {
      zhang_cb(new Error('仅支持 txt、pdf、doc、docx 格式的文件'));
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
 * @param {Object} zhang_sendData - { model, messages }
 * @returns {Promise<Object>} - { statusCode, raw, json }
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
 * 将长文本按段落分割为块（用于检索）
 * @param {string} zhang_text - 原始文本
 * @param {number} zhang_maxLen - 每块最大字符数
 * @returns {string[]} - 文本块数组
 */
function zhang_splitText(zhang_text, zhang_maxLen) {
  zhang_maxLen = zhang_maxLen || 500;
  var zhang_chunks = [];
  var zhang_paragraphs = zhang_text.split(/\n+/);
  var zhang_current = '';

  for (var zhang_i = 0; zhang_i < zhang_paragraphs.length; zhang_i++) {
    var zhang_para = zhang_paragraphs[zhang_i].trim();
    if (!zhang_para) continue;

    if ((zhang_current + zhang_para).length > zhang_maxLen) {
      if (zhang_current) {
        zhang_chunks.push(zhang_current);
      }
      if (zhang_para.length > zhang_maxLen) {
        for (var zhang_j = 0; zhang_j < zhang_para.length; zhang_j += zhang_maxLen) {
          zhang_chunks.push(zhang_para.substring(zhang_j, zhang_j + zhang_maxLen));
        }
        zhang_current = '';
      } else {
        zhang_current = zhang_para;
      }
    } else {
      zhang_current = zhang_current ? zhang_current + '\n' + zhang_para : zhang_para;
    }
  }

  if (zhang_current) {
    zhang_chunks.push(zhang_current);
  }

  return zhang_chunks;
}

/**
 * 解析上传的文件，提取纯文本内容
 * @param {string} zhang_filePath - 文件路径
 * @param {string} zhang_ext - 文件扩展名
 * @returns {Promise<string>} - 提取的文本
 */
async function zhang_parseFile(zhang_filePath, zhang_ext) {
  var zhang_content = '';

  if (zhang_ext === '.txt') {
    // 先用二进制读取，再自动识别编码（支持 UTF-8 / GBK / ANSI）
    var zhang_buf = fs.readFileSync(zhang_filePath);
    try {
      zhang_content = iconv.decode(zhang_buf, 'utf-8');
      // 如果解码后仍包含大量替换字符，尝试 GBK
      if (zhang_content.indexOf('\uFFFD') > -1) {
        zhang_content = iconv.decode(zhang_buf, 'gbk');
      }
    } catch (zhang_e) {
      zhang_content = iconv.decode(zhang_buf, 'gbk');
    }
  } else if (zhang_ext === '.pdf') {
    var zhang_dataBuffer = fs.readFileSync(zhang_filePath);
    var zhang_pdfData = await pdfParse(zhang_dataBuffer);
    zhang_content = zhang_pdfData.text;
  } else if (zhang_ext === '.docx') {
    var zhang_result = await mammoth.extractRawText({ path: zhang_filePath });
    zhang_content = zhang_result.value;
  } else if (zhang_ext === '.doc') {
    try {
      var zhang_docResult = await mammoth.extractRawText({ path: zhang_filePath });
      zhang_content = zhang_docResult.value;
    } catch (zhang_e) {
      zhang_content = '（.doc 格式解析失败，建议转换为 .docx 后上传）';
    }
  }

  return zhang_content || '（文件内容为空）';
}

/**
 * 知识库文件上传接口
 */
async function zhang_knowledgeUpload(zhang_req, zhang_res) {
  if (zhang_req.fileError) {
    return zhang_res.json({ code: 1, msg: zhang_req.fileError, data: null });
  }

  if (!zhang_req.file) {
    return zhang_res.json({ code: 1, msg: '请选择要上传的文件', data: null });
  }

  var zhang_file = zhang_req.file;
  // multer 按 latin1 解析上传文件名，中文文件名需转回 utf8 显示
  zhang_file.originalname = Buffer.from(zhang_file.originalname, 'latin1').toString('utf8');
  var zhang_ext = path.extname(zhang_file.originalname).toLowerCase();
  var zhang_filePath = zhang_file.path;

  try {
    var zhang_content = await zhang_parseFile(zhang_filePath, zhang_ext);
    var zhang_chunks = zhang_splitText(zhang_content);

    var zhang_record = {
      id: zhang_kbIdCounter++,
      filename: zhang_file.filename,
      originalname: zhang_file.originalname,
      ext: zhang_ext,
      size: zhang_file.size,
      uploadTime: new Date().toLocaleString('zh-CN'),
      content: zhang_content,
      chunks: zhang_chunks,
      chunkCount: zhang_chunks.length
    };

    zhang_kbStore.push(zhang_record);

    console.log('知识库文件上传成功：' + zhang_record.originalname + '（' + zhang_chunks.length + ' 个文本块）');

    return zhang_res.json({
      code: 0,
      msg: '文件上传并解析成功',
      data: {
        id: zhang_record.id,
        originalname: zhang_record.originalname,
        ext: zhang_record.ext,
        size: zhang_record.size,
        uploadTime: zhang_record.uploadTime,
        chunkCount: zhang_record.chunkCount,
        contentPreview: zhang_content.substring(0, 200) + (zhang_content.length > 200 ? '…' : '')
      }
    });
  } catch (zhang_err) {
    console.error('知识库文件解析失败：', zhang_err.message);
    return zhang_res.json({
      code: 1,
      msg: '文件解析失败：' + zhang_err.message,
      data: null
    });
  }
}

/**
 * 获取知识库文件列表
 */
function zhang_knowledgeList(zhang_req, zhang_res) {
  var zhang_list = zhang_kbStore.map(function (zhang_item) {
    return {
      id: zhang_item.id,
      originalname: zhang_item.originalname,
      ext: zhang_item.ext,
      size: zhang_item.size,
      uploadTime: zhang_item.uploadTime,
      chunkCount: zhang_item.chunkCount
    };
  });

  return zhang_res.json({
    code: 0,
    msg: '获取知识库列表成功',
    data: {
      total: zhang_list.length,
      list: zhang_list
    }
  });
}

/**
 * 删除知识库文件
 */
function zhang_knowledgeDelete(zhang_req, zhang_res) {
  var zhang_id = parseInt(zhang_req.params.id, 10);

  var zhang_index = -1;
  for (var zhang_i = 0; zhang_i < zhang_kbStore.length; zhang_i++) {
    if (zhang_kbStore[zhang_i].id === zhang_id) {
      zhang_index = zhang_i;
      break;
    }
  }

  if (zhang_index === -1) {
    return zhang_res.json({ code: 1, msg: '文件不存在', data: null });
  }

  var zhang_record = zhang_kbStore[zhang_index];
  var zhang_filePath = path.join(zhang_kbDir, zhang_record.filename);
  if (fs.existsSync(zhang_filePath)) {
    fs.unlinkSync(zhang_filePath);
  }

  zhang_kbStore.splice(zhang_index, 1);

  console.log('知识库文件已删除：' + zhang_record.originalname);

  return zhang_res.json({
    code: 0,
    msg: '文件删除成功',
    data: { id: zhang_id }
  });
}

/**
 * 基于知识库的 RAG 问答接口
 * 流程：
 *   1. 根据用户问题在知识库中检索相关文本块
 *   2. 将检索到的文本块作为上下文拼入 prompt
 *   3. 发送给大模型生成回答
 */
async function zhang_knowledgeAsk(zhang_req, zhang_res) {
  var zhang_question = (zhang_req.body.question || '').trim();
  var zhang_history = zhang_req.body.history || [];

  if (!zhang_question) {
    return zhang_res.json({ code: 1, msg: '问题不能为空', data: null });
  }

  if (zhang_kbStore.length === 0) {
    return zhang_res.json({ code: 1, msg: '知识库为空，请先上传文件', data: null });
  }

  try {
    // ===== 步骤 1：检索相关文本块 =====
    var zhang_allChunks = [];

    for (var zhang_i = 0; zhang_i < zhang_kbStore.length; zhang_i++) {
      var zhang_kb = zhang_kbStore[zhang_i];
      for (var zhang_j = 0; zhang_j < zhang_kb.chunks.length; zhang_j++) {
        zhang_allChunks.push({
          source: zhang_kb.originalname,
          text: zhang_kb.chunks[zhang_j]
        });
      }
    }

    // 简单关键词检索：统计用户问题中关键词在每个块中出现的次数
    var zhang_keywords = zhang_question.replace(/[，。？！、,.?!]/g, ' ').split(/\s+/).filter(function (w) {
      return w.length > 0;
    });

    var zhang_scored = zhang_allChunks.map(function (zhang_chunk) {
      var zhang_score = 0;
      var zhang_lowerText = zhang_chunk.text.toLowerCase();
      for (var zhang_k = 0; zhang_k < zhang_keywords.length; zhang_k++) {
        var zhang_kw = zhang_keywords[zhang_k].toLowerCase();
        if (zhang_kw.length < 2) continue;
        var zhang_count = 0;
        var zhang_idx = zhang_lowerText.indexOf(zhang_kw);
        while (zhang_idx !== -1) {
          zhang_count++;
          zhang_idx = zhang_lowerText.indexOf(zhang_kw, zhang_idx + zhang_kw.length);
        }
        zhang_score += zhang_count;
      }
      return { chunk: zhang_chunk, score: zhang_score };
    });

    // 按分数排序，取前 5 个相关块
    zhang_scored.sort(function (a, b) { return b.score - a.score; });
    var zhang_topChunks = zhang_scored.slice(0, 5).filter(function (zhang_item) {
      return zhang_item.score > 0;
    });

    // 如果没有匹配到关键词，取前 3 个块（兜底）
    if (zhang_topChunks.length === 0) {
      zhang_topChunks = zhang_scored.slice(0, 3);
    }

    // 拼接上下文
    var zhang_context = zhang_topChunks.map(function (zhang_item, zhang_idx) {
      return '【片段' + (zhang_idx + 1) + '（来源：' + zhang_item.chunk.source + '）】\n' + zhang_item.chunk.text;
    }).join('\n\n');

    // ===== 步骤 2：构造 RAG prompt =====
    var zhang_systemContent =
      '你是一个基于知识库的智能问答助手。请根据以下知识库内容回答用户的问题。\n' +
      '如果知识库内容足以回答问题，请基于知识库内容给出准确回答。\n' +
      '如果知识库内容不足以回答问题，请说明知识库中没有相关信息，并尝试根据自身知识补充回答。\n\n' +
      '===== 知识库相关内容 =====\n' +
      zhang_context;

    var zhang_messages = [{ role: 'system', content: zhang_systemContent }];

    // 加入历史对话
    for (var zhang_h = 0; zhang_h < zhang_history.length; zhang_h++) {
      zhang_messages.push(zhang_history[zhang_h]);
    }

    // 加入当前问题
    zhang_messages.push({ role: 'user', content: zhang_question });

    var zhang_sendData = {
      model: zhang_defaultModel,
      messages: zhang_messages
    };

    // ===== 步骤 3：发送给大模型 =====
    console.log('===== [RAG] 发送给大模型的数据 =====');
    console.log(JSON.stringify(zhang_sendData, null, 2));
    console.log('====================================');

    var zhang_response = await zhang_requestLLM(zhang_sendData);

    console.log('===== [RAG] 从大模型接收到的数据 =====');
    console.log(JSON.stringify(zhang_response.json || zhang_response.raw, null, 2));
    console.log('======================================');

    if (zhang_response.statusCode === 200 && zhang_response.json) {
      var zhang_reply = '';
      if (zhang_response.json.choices && zhang_response.json.choices.length > 0) {
        zhang_reply = zhang_response.json.choices[0].message.content;
      }

      return zhang_res.json({
        code: 0,
        msg: 'RAG 问答成功',
        data: {
          question: zhang_question,
          answer: zhang_reply,
          matchedChunks: zhang_topChunks.map(function (zhang_item) {
            return {
              source: zhang_item.chunk.source,
              score: zhang_item.score,
              preview: zhang_item.chunk.text.substring(0, 100) + '…'
            };
          }),
          sendData: zhang_sendData,
          response: zhang_response.json
        }
      });
    } else {
      return zhang_res.json({
        code: 1,
        msg: '大模型请求失败（HTTP ' + zhang_response.statusCode + '）',
        data: {
          statusCode: zhang_response.statusCode,
          raw: zhang_response.raw
        }
      });
    }
  } catch (zhang_err) {
    console.error('RAG 问答异常：', zhang_err.message);
    return zhang_res.json({
      code: 1,
      msg: 'RAG 问答异常：' + zhang_err.message,
      data: null
    });
  }
}

module.exports = {
  zhang_uploadMiddleware: zhang_uploadMiddleware,
  zhang_knowledgeUpload: zhang_knowledgeUpload,
  zhang_knowledgeList: zhang_knowledgeList,
  zhang_knowledgeDelete: zhang_knowledgeDelete,
  zhang_knowledgeAsk: zhang_knowledgeAsk
};
