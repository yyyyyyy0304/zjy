/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_express = require('express');
const zhang_authController = require('../controllers/zhang_authController');

const zhang_router = zhang_express.Router();

// 图形验证码
zhang_router.get('/auth/captcha', zhang_authController.zhang_getCaptcha);
// 用户注册
zhang_router.post('/auth/register', zhang_authController.zhang_register);
// 用户登录
zhang_router.post('/auth/login', zhang_authController.zhang_login);
// 当前登录用户（需携带 Bearer 令牌）
zhang_router.get('/auth/me', zhang_authController.zhang_me);

module.exports = zhang_router;
