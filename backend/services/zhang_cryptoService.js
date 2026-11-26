/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_crypto = require('crypto');

// 令牌签名密钥与有效期（密钥来自 backend/.env，未配置时使用项目默认值）
const zhang_SECRET = process.env.AUTH_SECRET || 'zhang_24005240115_auth_default_secret';
const zhang_TOKEN_TTL = 2 * 60 * 60; // 2 小时（单位：秒）

// base64url 编码，去掉 JWT 中不需要的 =、+、/
function zhang_toBase64Url(zhang_text) {
  return Buffer.from(String(zhang_text), 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function zhang_fromBase64Url(zhang_text) {
  const zhang_normalized = String(zhang_text).replace(/-/g, '+').replace(/_/g, '/');
  const zhang_pad = zhang_normalized.length % 4 === 0 ? '' : '='.repeat(4 - (zhang_normalized.length % 4));
  return Buffer.from(zhang_normalized + zhang_pad, 'base64').toString('utf8');
}

// HMAC-SHA256 签名
function zhang_hmac(zhang_content) {
  return zhang_crypto
    .createHmac('sha256', zhang_SECRET)
    .update(zhang_content)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

// 密码加盐哈希：scrypt$盐(hex)$哈希(hex)，同一个密码每次结果都不同
function zhang_hashPassword(zhang_plain) {
  const zhang_salt = zhang_crypto.randomBytes(16);
  const zhang_hash = zhang_crypto.scryptSync(String(zhang_plain), zhang_salt, 64);
  return 'scrypt$' + zhang_salt.toString('hex') + '$' + zhang_hash.toString('hex');
}

// 校验密码：重新计算哈希后用 timingSafeEqual 比对，防止时序攻击
function zhang_verifyPassword(zhang_plain, zhang_stored) {
  if (!zhang_plain || !zhang_stored) {
    return false;
  }

  const zhang_parts = String(zhang_stored).split('$');
  if (zhang_parts.length !== 3 || zhang_parts[0] !== 'scrypt') {
    return false;
  }

  const zhang_salt = Buffer.from(zhang_parts[1], 'hex');
  const zhang_expected = Buffer.from(zhang_parts[2], 'hex');
  if (!zhang_salt.length || !zhang_expected.length) {
    return false;
  }

  const zhang_actual = zhang_crypto.scryptSync(String(zhang_plain), zhang_salt, zhang_expected.length);
  return zhang_crypto.timingSafeEqual(zhang_expected, zhang_actual);
}

// 签发令牌（结构：header.payload.signature，算法 HS256）
function zhang_signToken(zhang_user) {
  const zhang_now = Math.floor(Date.now() / 1000);
  const zhang_header = zhang_toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const zhang_payload = zhang_toBase64Url(
    JSON.stringify({
      sub: zhang_user.id,
      username: zhang_user.username,
      role: zhang_user.role || 'user',
      iat: zhang_now,
      exp: zhang_now + zhang_TOKEN_TTL
    })
  );
  const zhang_signature = zhang_hmac(zhang_header + '.' + zhang_payload);
  return zhang_header + '.' + zhang_payload + '.' + zhang_signature;
}

// 校验令牌，合法返回载荷，非法或过期返回 null
function zhang_verifyToken(zhang_token) {
  if (!zhang_token) {
    return null;
  }

  const zhang_parts = String(zhang_token).split('.');
  if (zhang_parts.length !== 3) {
    return null;
  }

  const zhang_expected = Buffer.from(zhang_hmac(zhang_parts[0] + '.' + zhang_parts[1]), 'utf8');
  const zhang_actual = Buffer.from(zhang_parts[2], 'utf8');
  if (zhang_expected.length !== zhang_actual.length || !zhang_crypto.timingSafeEqual(zhang_expected, zhang_actual)) {
    return null;
  }

  let zhang_payload = null;
  try {
    zhang_payload = JSON.parse(zhang_fromBase64Url(zhang_parts[1]));
  } catch (zhang_err) {
    return null;
  }

  if (!zhang_payload || !zhang_payload.sub || !zhang_payload.exp) {
    return null;
  }
  if (zhang_payload.exp * 1000 <= Date.now()) {
    return null;
  }

  return zhang_payload;
}

module.exports = {
  zhang_TOKEN_TTL,
  zhang_hashPassword,
  zhang_verifyPassword,
  zhang_signToken,
  zhang_verifyToken
};
