/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_express = require('express');
const zhang_adminController = require('../controllers/zhang_adminController');
const zhang_adminAuth = require('../middlewares/zhang_adminAuth');

const zhang_router = zhang_express.Router();

// 管理员登录（无需令牌）
zhang_router.post('/admin/login', zhang_adminController.zhang_login);

// 以下接口全部需要管理员令牌，未登录或角色不符统一返回 401
zhang_router.use('/admin', zhang_adminAuth.zhang_adminAuth);

// 当前管理员与仪表盘
zhang_router.get('/admin/me', zhang_adminController.zhang_me);
zhang_router.get('/admin/dashboard', zhang_adminController.zhang_dashboard);

// 新闻管理
zhang_router.get('/admin/news', zhang_adminController.zhang_newsList);
zhang_router.get('/admin/news/:id', zhang_adminController.zhang_newsDetail);
zhang_router.post('/admin/news', zhang_adminController.zhang_newsCreate);
zhang_router.put('/admin/news/:id', zhang_adminController.zhang_newsUpdate);
zhang_router.delete('/admin/news/:id', zhang_adminController.zhang_newsDelete);

// 农产品管理
zhang_router.get('/admin/produce', zhang_adminController.zhang_produceList);
zhang_router.get('/admin/produce/:id', zhang_adminController.zhang_produceDetail);
zhang_router.post('/admin/produce', zhang_adminController.zhang_produceCreate);
zhang_router.put('/admin/produce/:id', zhang_adminController.zhang_produceUpdate);
zhang_router.delete('/admin/produce/:id', zhang_adminController.zhang_produceDelete);

// 用户管理
zhang_router.get('/admin/users', zhang_adminController.zhang_userList);
zhang_router.get('/admin/users/:id', zhang_adminController.zhang_userDetail);
zhang_router.post('/admin/users', zhang_adminController.zhang_userCreate);
zhang_router.put('/admin/users/:id', zhang_adminController.zhang_userUpdate);
zhang_router.delete('/admin/users/:id', zhang_adminController.zhang_userDelete);

module.exports = zhang_router;
