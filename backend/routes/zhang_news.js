/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_express = require('express');
const zhang_newsController = require('../controllers/zhang_newsController');

const zhang_router = zhang_express.Router();

zhang_router.get('/news', zhang_newsController.zhang_newsList);

module.exports = zhang_router;
