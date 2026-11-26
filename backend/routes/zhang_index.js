/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_express = require('express');
const zhang_indexController = require('../controllers/zhang_indexController');

const zhang_router = zhang_express.Router();

zhang_router.get('/health', zhang_indexController.zhang_health);

module.exports = zhang_router;
