/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_cryptoService = require('../services/zhang_cryptoService');

// 管理接口鉴权：必须携带管理员令牌（载荷 role 为 admin），否则直接拦截
function zhang_adminAuth(zhang_req, zhang_res, zhang_next) {
  const zhang_header = zhang_req.headers.authorization || '';
  const zhang_token = zhang_header.indexOf('Bearer ') === 0 ? zhang_header.slice(7).trim() : '';
  const zhang_payload = zhang_cryptoService.zhang_verifyToken(zhang_token);

  if (!zhang_payload || zhang_payload.role !== 'admin') {
    return zhang_res.status(401).json({
      code: 401,
      msg: '未登录或登录状态已失效，请先登录管理后台',
      data: null
    });
  }

  zhang_req.zhang_admin = {
    id: zhang_payload.sub,
    username: zhang_payload.username
  };
  zhang_next();
}

module.exports = {
  zhang_adminAuth
};
