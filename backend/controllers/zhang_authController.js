/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_userModel = require('../models/zhang_userModel');
const zhang_cryptoService = require('../services/zhang_cryptoService');
const zhang_captchaService = require('../services/zhang_captchaService');

// 用户名：字母开头，4-20 位字母 / 数字 / 下划线
const zhang_USERNAME_RE = /^[A-Za-z][A-Za-z0-9_]{3,19}$/;
// 密码：8-20 位，必须同时包含字母和数字，不允许空格
const zhang_PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d)\S{8,20}$/;
const zhang_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

// 只返回可公开的字段，绝不下发密码哈希
function zhang_publicUser(zhang_row) {
  return {
    id: zhang_row.zhang_id,
    username: zhang_row.zhang_username,
    nickname: zhang_row.zhang_nickname,
    email: zhang_row.zhang_email,
    createTime: zhang_row.zhang_create_time,
    lastLoginTime: zhang_row.zhang_last_login_time
  };
}

// 从 Authorization: Bearer xxx 中读取令牌
function zhang_readToken(zhang_req) {
  const zhang_header = zhang_req.headers.authorization || '';
  if (zhang_header.indexOf('Bearer ') === 0) {
    return zhang_header.slice(7).trim();
  }
  return '';
}

// 获取图形验证码
function zhang_getCaptcha(zhang_req, zhang_res) {
  const zhang_result = zhang_captchaService.zhang_createCaptcha();
  zhang_res.json({ code: 0, msg: '获取验证码成功', data: zhang_result });
}

// 用户注册
async function zhang_register(zhang_req, zhang_res) {
  const zhang_body = zhang_req.body || {};
  const zhang_username = String(zhang_body.username || '').trim();
  const zhang_nickname = String(zhang_body.nickname || '').trim();
  const zhang_email = String(zhang_body.email || '').trim();
  const zhang_password = String(zhang_body.password || '');
  const zhang_password2 = String(zhang_body.password2 || '');
  const zhang_captchaId = String(zhang_body.captchaId || '').trim();
  const zhang_captchaCode = String(zhang_body.captchaCode || '').trim();

  if (!zhang_username || !zhang_nickname || !zhang_password || !zhang_password2 || !zhang_captchaCode) {
    return zhang_res.json({ code: 1, msg: '用户名、昵称、密码、确认密码、验证码均为必填项', data: null });
  }
  if (!zhang_USERNAME_RE.test(zhang_username)) {
    return zhang_res.json({ code: 1, msg: '用户名需以字母开头，由 4-20 位字母、数字或下划线组成', data: null });
  }
  if (zhang_nickname.length < 2 || zhang_nickname.length > 20) {
    return zhang_res.json({ code: 1, msg: '昵称长度需为 2-20 个字符', data: null });
  }
  if (zhang_email && !zhang_EMAIL_RE.test(zhang_email)) {
    return zhang_res.json({ code: 1, msg: '邮箱格式不正确', data: null });
  }
  if (!zhang_PASSWORD_RE.test(zhang_password)) {
    return zhang_res.json({ code: 1, msg: '密码需为 8-20 位，且同时包含字母和数字', data: null });
  }
  if (zhang_password !== zhang_password2) {
    return zhang_res.json({ code: 1, msg: '两次输入的密码不一致', data: null });
  }
  if (!zhang_captchaService.zhang_verifyCaptcha(zhang_captchaId, zhang_captchaCode)) {
    return zhang_res.json({ code: 1, msg: '图形验证码错误或已过期，请刷新后重试', data: null });
  }

  try {
    const zhang_exist = await zhang_userModel.zhang_findByUsername(zhang_username);
    if (zhang_exist) {
      return zhang_res.json({ code: 1, msg: '该用户名已被注册，请更换用户名', data: null });
    }

    // 密码加盐哈希后入库，数据库中不保存明文
    const zhang_passwordHash = zhang_cryptoService.zhang_hashPassword(zhang_password);
    const zhang_insertId = await zhang_userModel.zhang_createUser({
      username: zhang_username,
      password: zhang_passwordHash,
      nickname: zhang_nickname,
      email: zhang_email
    });

    const zhang_user = await zhang_userModel.zhang_findById(zhang_insertId);
    zhang_res.json({
      code: 0,
      msg: '注册成功，请前往登录',
      data: { user: zhang_publicUser(zhang_user) }
    });
  } catch (zhang_err) {
    console.error('用户注册失败：', zhang_err);
    if (zhang_err && zhang_err.code === 'ER_DUP_ENTRY') {
      return zhang_res.json({ code: 1, msg: '该用户名已被注册，请更换用户名', data: null });
    }
    zhang_res.json({ code: 1, msg: '注册失败，请稍后重试', data: null });
  }
}

// 用户登录
async function zhang_login(zhang_req, zhang_res) {
  const zhang_body = zhang_req.body || {};
  const zhang_username = String(zhang_body.username || '').trim();
  const zhang_password = String(zhang_body.password || '');
  const zhang_captchaId = String(zhang_body.captchaId || '').trim();
  const zhang_captchaCode = String(zhang_body.captchaCode || '').trim();

  if (!zhang_username || !zhang_password) {
    return zhang_res.json({ code: 1, msg: '请输入用户名和密码', data: null });
  }
  if (!zhang_captchaCode) {
    return zhang_res.json({ code: 1, msg: '请输入图形验证码', data: null });
  }
  if (!zhang_captchaService.zhang_verifyCaptcha(zhang_captchaId, zhang_captchaCode)) {
    return zhang_res.json({ code: 1, msg: '图形验证码错误或已过期，请刷新后重试', data: null });
  }

  try {
    const zhang_user = await zhang_userModel.zhang_findByUsername(zhang_username);
    if (!zhang_user || !zhang_cryptoService.zhang_verifyPassword(zhang_password, zhang_user.zhang_password)) {
      return zhang_res.json({ code: 1, msg: '用户名或密码错误', data: null });
    }

    await zhang_userModel.zhang_touchLogin(zhang_user.zhang_id);
    const zhang_latest = await zhang_userModel.zhang_findById(zhang_user.zhang_id);
    const zhang_token = zhang_cryptoService.zhang_signToken({
      id: zhang_user.zhang_id,
      username: zhang_user.zhang_username
    });

    zhang_res.json({
      code: 0,
      msg: '登录成功',
      data: {
        token: zhang_token,
        tokenExpire: zhang_cryptoService.zhang_TOKEN_TTL,
        user: zhang_publicUser(zhang_latest)
      }
    });
  } catch (zhang_err) {
    console.error('用户登录失败：', zhang_err);
    zhang_res.json({ code: 1, msg: '登录失败，请稍后重试', data: null });
  }
}

// 获取当前登录用户（校验令牌，用于刷新页面后保持登录状态）
async function zhang_me(zhang_req, zhang_res) {
  const zhang_payload = zhang_cryptoService.zhang_verifyToken(zhang_readToken(zhang_req));
  if (!zhang_payload) {
    return zhang_res.json({ code: 401, msg: '登录状态已失效，请重新登录', data: null });
  }

  try {
    const zhang_user = await zhang_userModel.zhang_findById(zhang_payload.sub);
    if (!zhang_user) {
      return zhang_res.json({ code: 401, msg: '用户不存在，请重新登录', data: null });
    }
    zhang_res.json({ code: 0, msg: '获取当前用户成功', data: { user: zhang_publicUser(zhang_user) } });
  } catch (zhang_err) {
    console.error('获取当前用户失败：', zhang_err);
    zhang_res.json({ code: 1, msg: '获取用户信息失败，请稍后重试', data: null });
  }
}

module.exports = {
  zhang_getCaptcha,
  zhang_register,
  zhang_login,
  zhang_me
};
