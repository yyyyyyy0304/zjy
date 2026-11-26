/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_express = require('express');
const zhang_supabaseAuthController = require('../controllers/zhang_supabaseAuthController');

const zhang_router = zhang_express.Router();

// Supabase 用户鉴权接口
zhang_router.get('/auth/supabase/status', zhang_supabaseAuthController.zhang_status);
zhang_router.post('/auth/supabase/register', zhang_supabaseAuthController.zhang_register);
zhang_router.post('/auth/supabase/login', zhang_supabaseAuthController.zhang_login);
zhang_router.get('/auth/supabase/me', zhang_supabaseAuthController.zhang_me);

module.exports = zhang_router;
