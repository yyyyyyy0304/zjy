/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_express = require('express');
const zhang_dbController = require('../controllers/zhang_dbController');

const zhang_router = zhang_express.Router();

zhang_router.post('/db/connect', zhang_dbController.zhang_connect);

module.exports = zhang_router;
