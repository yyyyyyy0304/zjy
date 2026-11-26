/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-12 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_express = require('express');
const zhang_chatController = require('../controllers/zhang_chatController');

const zhang_router = zhang_express.Router();

zhang_router.post('/chat', zhang_chatController.zhang_chatSend);

module.exports = zhang_router;
