/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-16 | 大模型：DeepSeek-V4.1-Flash
*/

var zhang_express = require('express');
var zhang_sentimentController = require('../controllers/zhang_sentimentController');

var zhang_router = zhang_express.Router();

/**
 * 包装 multer 中间件，捕获文件类型/大小错误
 */
function zhang_uploadWrapper(zhang_req, zhang_res, zhang_next) {
  zhang_sentimentController.zhang_uploadMiddleware(zhang_req, zhang_res, function (zhang_err) {
    if (zhang_err) {
      return zhang_res.json({ code: 1, msg: zhang_err.message, data: null });
    }
    zhang_next();
  });
}

// 情感分类接口
zhang_router.post('/sentiment/analyze', zhang_uploadWrapper, zhang_sentimentController.zhang_sentimentAnalyze);

module.exports = zhang_router;
