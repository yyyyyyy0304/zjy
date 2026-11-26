/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-12 | 大模型：DeepSeek-V4.1-Flash
*/

const https = require('https');

// SiliconFlow API 密钥（从 backend/.env 的 LLM_API_KEY 读取，不写入代码）
const zhang_apiKey = String(process.env.LLM_API_KEY || '').trim();
// SiliconFlow 聊天补全接口地址
const zhang_apiHost = 'api.siliconflow.cn';
const zhang_apiPath = '/v1/chat/completions';
// 默认模型
const zhang_defaultModel = 'deepseek-ai/DeepSeek-V4-Flash';

/**
 * 使用 Node.js 原生 https 模块向 SiliconFlow 发送 POST 请求
 * @param {string} zhang_bodyStr - JSON 字符串请求体
 * @returns {Promise<Object>} - 解析后的 JSON 响应
 */
function zhang_requestSiliconFlow(zhang_bodyStr) {
  return new Promise(function (zhang_resolve, zhang_reject) {
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
      zhang_res.on('data', function (zhang_chunk) {
        zhang_chunks.push(zhang_chunk);
      });
      zhang_res.on('end', function () {
        var zhang_raw = Buffer.concat(zhang_chunks).toString('utf8');
        try {
          zhang_resolve({
            statusCode: zhang_res.statusCode,
            raw: zhang_raw,
            json: JSON.parse(zhang_raw)
          });
        } catch (zhang_e) {
          zhang_resolve({
            statusCode: zhang_res.statusCode,
            raw: zhang_raw,
            json: null
          });
        }
      });
    });

    zhang_req.on('error', function (zhang_err) {
      zhang_reject(zhang_err);
    });

    zhang_req.write(zhang_bodyStr);
    zhang_req.end();
  });
}

/**
 * AI 聊天接口
 * 接收前端消息，转发给 SiliconFlow 大模型，返回模型回复
 */
async function zhang_chatSend(zhang_req, zhang_res) {
  var zhang_messages = zhang_req.body.messages;
  var zhang_model = zhang_req.body.model || zhang_defaultModel;

  // 参数校验
  if (!zhang_messages || !Array.isArray(zhang_messages) || zhang_messages.length === 0) {
    return zhang_res.json({
      code: 1,
      msg: '参数错误：messages 不能为空',
      data: null
    });
  }

  // 构造发送给大模型的数据
  var zhang_sendData = {
    model: zhang_model,
    messages: zhang_messages
  };

  var zhang_bodyStr = JSON.stringify(zhang_sendData);

  try {
    // 在后端控制台输出发送给大模型的数据
    console.log('===== 发送给大模型的数据 =====');
    console.log(JSON.stringify(zhang_sendData, null, 2));
    console.log('==============================');

    var zhang_response = await zhang_requestSiliconFlow(zhang_bodyStr);

    // 在后端控制台输出大模型返回的数据
    console.log('===== 从大模型接收到的数据 =====');
    console.log(zhang_response.raw);
    console.log('================================');

    if (zhang_response.statusCode === 200 && zhang_response.json) {
      return zhang_res.json({
        code: 0,
        msg: 'AI 回复成功',
        data: {
          model: zhang_model,
          response: zhang_response.json,
          sendData: zhang_sendData
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
    console.error('AI 聊天接口异常：', zhang_err.message);
    return zhang_res.json({
      code: 1,
      msg: 'AI 聊天接口异常：' + zhang_err.message,
      data: null
    });
  }
}

module.exports = {
  zhang_chatSend
};
