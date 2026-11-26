/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
*/

// Supabase 用户鉴权服务：通过 GoTrue REST 接口完成注册、登录与令牌校验
// 说明：密钥只从 backend/.env 读取，绝不下发到前端；项目 URL 未配置时所有调用返回“未配置”错误

const zhang_SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
const zhang_SUPABASE_KEY = String(process.env.SUPABASE_SECRET_KEY || '').trim();

// 判断 Supabase 是否已完成配置（URL 与密钥缺一不可）
function zhang_isConfigured() {
  return Boolean(zhang_SUPABASE_URL && zhang_SUPABASE_KEY);
}

// 统一请求 Supabase REST 接口
async function zhang_call(zhang_path, zhang_options) {
  if (!zhang_isConfigured()) {
    const zhang_err = new Error('SUPABASE_NOT_CONFIGURED');
    zhang_err.zhang_code = 'SUPABASE_NOT_CONFIGURED';
    throw zhang_err;
  }

  const zhang_opts = zhang_options || {};
  const zhang_headers = {
    apikey: zhang_SUPABASE_KEY,
    'Content-Type': 'application/json'
  };
  zhang_headers.Authorization = 'Bearer ' + (zhang_opts.token || zhang_SUPABASE_KEY);

  const zhang_response = await fetch(zhang_SUPABASE_URL + zhang_path, {
    method: zhang_opts.method || 'GET',
    headers: zhang_headers,
    body: zhang_opts.body ? JSON.stringify(zhang_opts.body) : undefined
  });

  let zhang_data = null;
  try {
    zhang_data = await zhang_response.json();
  } catch (zhang_err) {
    zhang_data = null;
  }

  return { ok: zhang_response.ok, status: zhang_response.status, data: zhang_data };
}

// 把 Supabase 英文错误翻译成中文提示
function zhang_translateError(zhang_data, zhang_status) {
  const zhang_raw = zhang_data || {};
  const zhang_text = String(zhang_raw.msg || zhang_raw.message || zhang_raw.error_description || zhang_raw.error || '');
  const zhang_lower = zhang_text.toLowerCase();

  if (zhang_lower.indexOf('invalid login credentials') >= 0) {
    return '邮箱或密码错误，请重新输入';
  }
  if (zhang_lower.indexOf('email not confirmed') >= 0) {
    return '邮箱尚未验证，请先在邮箱中点击验证链接后再登录';
  }
  if (zhang_lower.indexOf('already registered') >= 0 || zhang_lower.indexOf('already been registered') >= 0) {
    return '该邮箱已注册，请直接登录';
  }
  if (zhang_lower.indexOf('user already exists') >= 0) {
    return '该邮箱已注册，请直接登录';
  }
  if (zhang_lower.indexOf('password') >= 0 && zhang_lower.indexOf('least') >= 0) {
    return '密码长度不足，至少需要 6 个字符';
  }
  if (zhang_lower.indexOf('rate limit') >= 0 || zhang_status === 429) {
    return '请求过于频繁，请稍后再试';
  }
  if (zhang_lower.indexOf('invalid api key') >= 0 || zhang_status === 401) {
    return 'Supabase 密钥无效或已失效，请检查 SUPABASE_SECRET_KEY';
  }
  return zhang_text || 'Supabase 服务调用失败，请稍后重试';
}

// 使用管理员接口创建已确认邮箱的用户，注册后即可直接登录
async function zhang_registerUser(zhang_email, zhang_password, zhang_nickname) {
  return zhang_call('/auth/v1/admin/users', {
    method: 'POST',
    body: {
      email: zhang_email,
      password: zhang_password,
      email_confirm: true,
      user_metadata: { nickname: zhang_nickname }
    }
  });
}

// 邮箱密码登录，返回 Supabase 会话
async function zhang_loginUser(zhang_email, zhang_password) {
  return zhang_call('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: { email: zhang_email, password: zhang_password }
  });
}

// 用 Supabase 会话中的 access_token 换取用户信息
async function zhang_getUser(zhang_accessToken) {
  return zhang_call('/auth/v1/user', { token: zhang_accessToken });
}

module.exports = {
  zhang_isConfigured,
  zhang_translateError,
  zhang_registerUser,
  zhang_loginUser,
  zhang_getUser
};
