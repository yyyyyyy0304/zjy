/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-12 | 大模型：DeepSeek-V4.1-Flash
*/

var zhang_express = require('express');
var zhang_chatController = require('../controllers/zhang_chatController');
var zhang_knowledgeController = require('../controllers/zhang_knowledgeController');

var zhang_router = zhang_express.Router();

/**
 * 包装 multer 中间件，捕获文件类型/大小错误
 */
function zhang_uploadWrapper(zhang_req, zhang_res, zhang_next) {
  zhang_knowledgeController.zhang_uploadMiddleware(zhang_req, zhang_res, function (zhang_err) {
    if (zhang_err) {
      return zhang_res.json({ code: 1, msg: zhang_err.message, data: null });
    }
    zhang_next();
  });
}

// 知识库文件上传
zhang_router.post('/knowledge/upload', zhang_uploadWrapper, zhang_knowledgeController.zhang_knowledgeUpload);

// 获取知识库文件列表
zhang_router.get('/knowledge/list', zhang_knowledgeController.zhang_knowledgeList);

// 删除知识库文件
zhang_router.delete('/knowledge/delete/:id', zhang_knowledgeController.zhang_knowledgeDelete);

// 基于知识库的 RAG 问答
zhang_router.post('/knowledge/ask', zhang_knowledgeController.zhang_knowledgeAsk);

// 普通聊天（复用已有控制器）
zhang_router.post('/chat', zhang_chatController.zhang_chatSend);

module.exports = zhang_router;
