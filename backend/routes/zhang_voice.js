/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

var zhang_express = require('express');
var zhang_voiceController = require('../controllers/zhang_voiceController');

var zhang_router = zhang_express.Router();

/**
 * 包装 multer 中间件，捕获文件类型/大小错误
 */
function zhang_uploadWrapper(zhang_req, zhang_res, zhang_next) {
  zhang_voiceController.zhang_uploadMiddleware(zhang_req, zhang_res, function (zhang_err) {
    if (zhang_err) {
      return zhang_res.json({ code: 1, msg: zhang_err.message, data: null });
    }
    zhang_next();
  });
}

// 语音识别接口
zhang_router.post('/voice/transcribe', zhang_uploadWrapper, zhang_voiceController.zhang_voiceTranscribe);

// 语音识别历史记录
zhang_router.get('/voice/history', zhang_voiceController.zhang_voiceHistory);

// 【本次新增】支持的语种列表（前端下拉框用，覆盖世界各国家/地区语言）
zhang_router.get('/voice/languages', zhang_voiceController.zhang_voiceLanguages);

module.exports = zhang_router;
