/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
*/

require('dotenv').config({ path: __dirname + '/.env' });

const zhang_express = require('express');
const zhang_cors = require('cors');
const zhang_path = require('path');

const zhang_indexRouter = require('./routes/zhang_index');
const zhang_dbRouter = require('./routes/zhang_db');
const zhang_newsRouter = require('./routes/zhang_news');
const zhang_produceRouter = require('./routes/zhang_produce');
const zhang_chatRouter = require('./routes/zhang_knowledge');
const zhang_sentimentRouter = require('./routes/zhang_sentiment');
const zhang_voiceRouter = require('./routes/zhang_voice');
const zhang_visionRouter = require('./routes/zhang_vision');
const zhang_authRouter = require('./routes/zhang_auth');
const zhang_adminRouter = require('./routes/zhang_admin');
const zhang_supabaseAuthRouter = require('./routes/zhang_supabaseAuth');

const zhang_app = zhang_express();
const zhang_port = 8115; // 学号 24005240115 后 3 位

// 支持所有跨域访问
zhang_app.use(zhang_cors());

// 解析 JSON 与表单请求体
zhang_app.use(zhang_express.json());
zhang_app.use(zhang_express.urlencoded({ extended: true }));

// 托管 frontend 目录
zhang_app.use(zhang_express.static(zhang_path.join(__dirname, '..', 'frontend')));

// 所有接口统一以 /api 为前缀
zhang_app.use('/api', zhang_indexRouter);
zhang_app.use('/api', zhang_dbRouter);
zhang_app.use('/api', zhang_newsRouter);
zhang_app.use('/api', zhang_produceRouter);
zhang_app.use('/api', zhang_chatRouter);
zhang_app.use('/api', zhang_sentimentRouter);
zhang_app.use('/api', zhang_voiceRouter);
zhang_app.use('/api', zhang_visionRouter);
zhang_app.use('/api', zhang_authRouter);
zhang_app.use('/api', zhang_adminRouter);
zhang_app.use('/api', zhang_supabaseAuthRouter);

// 未匹配的接口统一返回 JSON
zhang_app.use('/api', function (zhang_req, zhang_res) {
  zhang_res.status(404).json({ code: 404, msg: '接口不存在：' + zhang_req.originalUrl, data: null });
});

// 统一错误处理
zhang_app.use(function (zhang_err, zhang_req, zhang_res, zhang_next) {
  console.error('服务器异常：', zhang_err);
  zhang_res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
});

zhang_app.listen(zhang_port, function () {
  console.log('服务已启动：http://localhost:' + zhang_port);
});
