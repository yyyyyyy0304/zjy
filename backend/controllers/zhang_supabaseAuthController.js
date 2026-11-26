/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
*/

// Supabase 用户鉴权控制器：注册、登录、当前用户与配置状态
// 登录成功后同步一份本地 zhang_user 资料，并签发本站令牌，便于访问已有的用户相关接口

const zhang_crypto = require('crypto');
const zhang_supabaseService = require('../services/zhang_supabaseService');
const zhang_cryptoService = require('../services/zhang_cryptoService');
const zhang_userModel = require('../models/zhang_userModel');

const zhang_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const zhang_PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d)\S{8,20}$/;

const zhang_NOT_CONFIGURED_MSG =
  'Supabase 尚未完成配置：请在 backend/.env 中填写 SUPABASE_URL（形如 https://xxxx.supabase.co）后重启服务';

// 本地用户对外字段
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

// 由 Supabase 用户资料同步本地用户：已存在则直接返回，不存在则自动创建
async function zhang_syncLocalUser(zhang_supabaseUser) {
  const zhang_email = String(zhang_supabaseUser.email || '').trim();
  if (!zhang_email) {
    return null;
  }

  const zhang_exist = await zhang_userModel.zhang_findByEmail(zhang_email);
  if (zhang_exist) {
    return zhang_exist;
  }

  const zhang_meta = zhang_supabaseUser.user_metadata || {};
  let zhang_nickname = String(zhang_meta.nickname || zhang_email.split('@')[0] || 'Supabase用户').trim();
  if (zhang_nickname.length < 2) {
    zhang_nickname = 'sb_' + zhang_nickname;
  }
  zhang_nickname = zhang_nickname.slice(0, 20);

  // 由邮箱前缀生成合法用户名，冲突时追加随机数字
  let zhang_base = zhang_email.split('@')[0].replace(/[^A-Za-z0-9_]/g, '');
  if (!/^[A-Za-z]/.test(zhang_base)) {
    zhang_base = 'sb' + zhang_base;
  }
  zhang_base = (zhang_base + 'user').slice(0, 16);

  let zhang_username = zhang_base;
  for (let zhang_i = 0; zhang_i < 6; zhang_i++) {
    const zhang_taken = await zhang_userModel.zhang_findByUsername(zhang_username);
    if (!zhang_taken) {
      break;
    }
    zhang_username = zhang_base + Math.floor(100 + Math.random() * 900);
  }

  // 本地密码随机生成并加盐哈希，Supabase 用户不通过本地密码登录
  const zhang_randomPassword = zhang_crypto.randomBytes(12).toString('hex') + 'Aa1';
  const zhang_newId = await zhang_userModel.zhang_createUser({
    username: zhang_username.slice(0, 20),
    password: zhang_cryptoService.zhang_hashPassword(zhang_randomPassword),
    nickname: zhang_nickname,
    email: zhang_email
  });

  return zhang_userModel.zhang_findById(zhang_newId);
}

// 查询 Supabase 配置状态
async function zhang_status(zhang_req, zhang_res) {
  const zhang_configured = zhang_supabaseService.zhang_isConfigured();
  zhang_res.json({
    code: 0,
    msg: zhang_configured ? 'Supabase 已配置，可以进行注册与登录' : 'Supabase 缺少项目 URL，暂不可用',
    data: {
      configured: zhang_configured,
      hasSecretKey: Boolean(process.env.SUPABASE_SECRET_KEY),
      hint: zhang_configured ? '' : zhang_NOT_CONFIGURED_MSG
    }
  });
}

// Supabase 注册
async function zhang_register(zhang_req, zhang_res) {
  const zhang_body = zhang_req.body || {};
  const zhang_email = String(zhang_body.email || '').trim();
  const zhang_password = String(zhang_body.password || '');
  const zhang_nickname = String(zhang_body.nickname || '').trim();

  if (!zhang_email || !zhang_password || !zhang_nickname) {
    return zhang_res.json({ code: 1, msg: '邮箱、密码、昵称均为必填项', data: null });
  }
  if (!zhang_EMAIL_RE.test(zhang_email)) {
    return zhang_res.json({ code: 1, msg: '邮箱格式不正确', data: null });
  }
  if (zhang_nickname.length < 2 || zhang_nickname.length > 20) {
    return zhang_res.json({ code: 1, msg: '昵称长度需为 2-20 个字符', data: null });
  }
  if (!zhang_PASSWORD_RE.test(zhang_password)) {
    return zhang_res.json({ code: 1, msg: '密码需为 8-20 位，且同时包含字母和数字', data: null });
  }

  try {
    const zhang_result = await zhang_supabaseService.zhang_registerUser(zhang_email, zhang_password, zhang_nickname);
    console.log('Supabase 注册接口返回：', zhang_result.status, zhang_result.data);

    if (!zhang_result.ok) {
      return zhang_res.json({
        code: 1,
        msg: zhang_supabaseService.zhang_translateError(zhang_result.data, zhang_result.status),
        data: null
      });
    }

    const zhang_user = zhang_result.data && zhang_result.data.user ? zhang_result.data.user : zhang_result.data;
    zhang_res.json({
      code: 0,
      msg: 'Supabase 注册成功，请使用邮箱和密码登录',
      data: {
        supabaseUser: {
          id: zhang_user && zhang_user.id,
          email: zhang_user && zhang_user.email,
          nickname: (zhang_user && zhang_user.user_metadata && zhang_user.user_metadata.nickname) || zhang_nickname
        }
      }
    });
  } catch (zhang_err) {
    if (zhang_err.zhang_code === 'SUPABASE_NOT_CONFIGURED') {
      return zhang_res.json({ code: 1, msg: zhang_NOT_CONFIGURED_MSG, data: null });
    }
    console.error('Supabase 注册失败：', zhang_err);
    zhang_res.json({ code: 1, msg: 'Supabase 注册失败，请稍后重试', data: null });
  }
}

// Supabase 登录
async function zhang_login(zhang_req, zhang_res) {
  const zhang_body = zhang_req.body || {};
  const zhang_email = String(zhang_body.email || '').trim();
  const zhang_password = String(zhang_body.password || '');

  if (!zhang_email || !zhang_password) {
    return zhang_res.json({ code: 1, msg: '请输入邮箱和密码', data: null });
  }
  if (!zhang_EMAIL_RE.test(zhang_email)) {
    return zhang_res.json({ code: 1, msg: '邮箱格式不正确', data: null });
  }

  try {
    const zhang_result = await zhang_supabaseService.zhang_loginUser(zhang_email, zhang_password);
    console.log('Supabase 登录接口返回：', zhang_result.status);

    if (!zhang_result.ok || !zhang_result.data || !zhang_result.data.access_token) {
      return zhang_res.json({
        code: 1,
        msg: zhang_supabaseService.zhang_translateError(zhang_result.data, zhang_result.status),
        data: null
      });
    }

    const zhang_session = zhang_result.data;
    const zhang_supabaseUser = zhang_session.user || {};
    let zhang_localUser = null;
    let zhang_localToken = '';

    try {
      zhang_localUser = await zhang_syncLocalUser(zhang_supabaseUser);
      if (zhang_localUser) {
        await zhang_userModel.zhang_touchLogin(zhang_localUser.zhang_id);
        zhang_localToken = zhang_cryptoService.zhang_signToken({
          id: zhang_localUser.zhang_id,
          username: zhang_localUser.zhang_username
        });
      }
    } catch (zhang_syncErr) {
      console.error('Supabase 用户同步本地资料失败：', zhang_syncErr);
    }

    zhang_res.json({
      code: 0,
      msg: 'Supabase 登录成功',
      data: {
        session: {
          accessToken: zhang_session.access_token,
          refreshToken: zhang_session.refresh_token,
          expiresIn: zhang_session.expires_in,
          tokenType: zhang_session.token_type
        },
        supabaseUser: {
          id: zhang_supabaseUser.id,
          email: zhang_supabaseUser.email,
          nickname: (zhang_supabaseUser.user_metadata && zhang_supabaseUser.user_metadata.nickname) || ''
        },
        token: zhang_localToken,
        user: zhang_localUser ? zhang_publicUser(zhang_localUser) : null
      }
    });
  } catch (zhang_err) {
    if (zhang_err.zhang_code === 'SUPABASE_NOT_CONFIGURED') {
      return zhang_res.json({ code: 1, msg: zhang_NOT_CONFIGURED_MSG, data: null });
    }
    console.error('Supabase 登录失败：', zhang_err);
    zhang_res.json({ code: 1, msg: 'Supabase 登录失败，请稍后重试', data: null });
  }
}

// 校验 Supabase access_token 并返回用户信息
async function zhang_me(zhang_req, zhang_res) {
  const zhang_header = zhang_req.headers.authorization || '';
  const zhang_accessToken = zhang_req.body && zhang_req.body.accessToken
    ? String(zhang_req.body.accessToken)
    : zhang_header.indexOf('Bearer ') === 0
      ? zhang_header.slice(7).trim()
      : '';

  if (!zhang_accessToken) {
    return zhang_res.status(401).json({ code: 401, msg: '缺少 Supabase 访问令牌', data: null });
  }

  try {
    const zhang_result = await zhang_supabaseService.zhang_getUser(zhang_accessToken);
    if (!zhang_result.ok || !zhang_result.data) {
      return zhang_res.status(401).json({ code: 401, msg: 'Supabase 令牌无效或已过期，请重新登录', data: null });
    }

    const zhang_supabaseUser = zhang_result.data;
    let zhang_localUser = null;
    try {
      zhang_localUser = await zhang_syncLocalUser(zhang_supabaseUser);
    } catch (zhang_syncErr) {
      console.error('Supabase 用户同步本地资料失败：', zhang_syncErr);
    }

    zhang_res.json({
      code: 0,
      msg: '获取 Supabase 用户成功',
      data: {
        supabaseUser: {
          id: zhang_supabaseUser.id,
          email: zhang_supabaseUser.email,
          nickname: (zhang_supabaseUser.user_metadata && zhang_supabaseUser.user_metadata.nickname) || ''
        },
        user: zhang_localUser ? zhang_publicUser(zhang_localUser) : null
      }
    });
  } catch (zhang_err) {
    if (zhang_err.zhang_code === 'SUPABASE_NOT_CONFIGURED') {
      return zhang_res.json({ code: 1, msg: zhang_NOT_CONFIGURED_MSG, data: null });
    }
    console.error('Supabase 用户校验失败：', zhang_err);
    zhang_res.json({ code: 1, msg: 'Supabase 用户校验失败，请稍后重试', data: null });
  }
}

module.exports = {
  zhang_status,
  zhang_register,
  zhang_login,
  zhang_me
};
