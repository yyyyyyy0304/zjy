/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_express = require('express');
const zhang_produceController = require('../controllers/zhang_produceController');

const zhang_router = zhang_express.Router();

zhang_router.get('/produce', zhang_produceController.zhang_produceList);

module.exports = zhang_router;
