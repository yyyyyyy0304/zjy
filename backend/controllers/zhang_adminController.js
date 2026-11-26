/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_adminModel = require('../models/zhang_adminModel');
const zhang_cryptoService = require('../services/zhang_cryptoService');
const zhang_captchaService = require('../services/zhang_captchaService');
const zhang_dashboardModel = require('../models/zhang_dashboardModel');
const zhang_adminNewsModel = require('../models/zhang_adminNewsModel');
const zhang_adminProduceModel = require('../models/zhang_adminProduceModel');
const zhang_adminUserModel = require('../models/zhang_adminUserModel');

const zhang_USERNAME_RE = /^[A-Za-z][A-Za-z0-9_]{3,19}$/;
const zhang_PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d)\S{8,20}$/;
const zhang_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

// 只返回可公开的管理员字段
function zhang_publicAdmin(zhang_row) {
  return {
    id: zhang_row.zhang_id,
    username: zhang_row.zhang_username,
    realname: zhang_row.zhang_realname,
    role: zhang_row.zhang_role,
    status: zhang_row.zhang_status,
    createTime: zhang_row.zhang_create_time,
    lastLoginTime: zhang_row.zhang_last_login_time
  };
}

// 分页参数：page 最小 1，pageSize 限制 1-50
function zhang_parsePage(zhang_query) {
  let zhang_page = parseInt(zhang_query.page, 10);
  let zhang_pageSize = parseInt(zhang_query.pageSize, 10);
  if (!Number.isFinite(zhang_page) || zhang_page < 1) {
    zhang_page = 1;
  }
  if (!Number.isFinite(zhang_pageSize) || zhang_pageSize < 1) {
    zhang_pageSize = 8;
  }
  if (zhang_pageSize > 50) {
    zhang_pageSize = 50;
  }
  return { page: zhang_page, pageSize: zhang_pageSize, keyword: String(zhang_query.keyword || '').trim() };
}

// datetime-local 的 2026-11-19T10:30 转为 MySQL 可识别的 2026-11-19 10:30:00
function zhang_normalizeTime(zhang_value) {
  const zhang_text = String(zhang_value || '').trim();
  if (!zhang_text) {
    return '';
  }
  const zhang_date = new Date(zhang_text.replace(' ', 'T'));
  if (isNaN(zhang_date.getTime())) {
    return '';
  }
  function zhang_pad(zhang_num) {
    return zhang_num < 10 ? '0' + zhang_num : String(zhang_num);
  }
  return (
    zhang_date.getFullYear() + '-' + zhang_pad(zhang_date.getMonth() + 1) + '-' + zhang_pad(zhang_date.getDate()) +
    ' ' + zhang_pad(zhang_date.getHours()) + ':' + zhang_pad(zhang_date.getMinutes()) + ':' + zhang_pad(zhang_date.getSeconds())
  );
}

// ==================== 管理员登录 / 当前管理员 ====================

// 管理员登录（需图形验证码，复用登录页验证码服务）
async function zhang_login(zhang_req, zhang_res) {
  const zhang_body = zhang_req.body || {};
  const zhang_username = String(zhang_body.username || '').trim();
  const zhang_password = String(zhang_body.password || '');
  const zhang_captchaId = String(zhang_body.captchaId || '').trim();
  const zhang_captchaCode = String(zhang_body.captchaCode || '').trim();

  if (!zhang_username || !zhang_password) {
    return zhang_res.json({ code: 1, msg: '请输入管理员用户名和密码', data: null });
  }
  if (!zhang_captchaCode) {
    return zhang_res.json({ code: 1, msg: '请输入图形验证码', data: null });
  }
  if (!zhang_captchaService.zhang_verifyCaptcha(zhang_captchaId, zhang_captchaCode)) {
    return zhang_res.json({ code: 1, msg: '图形验证码错误或已过期，请刷新后重试', data: null });
  }

  try {
    const zhang_admin = await zhang_adminModel.zhang_findByUsername(zhang_username);
    if (!zhang_admin || !zhang_cryptoService.zhang_verifyPassword(zhang_password, zhang_admin.zhang_password)) {
      return zhang_res.json({ code: 1, msg: '管理员用户名或密码错误', data: null });
    }
    if (Number(zhang_admin.zhang_status) !== 1) {
      return zhang_res.json({ code: 1, msg: '该管理员账号已被停用，请联系系统管理员', data: null });
    }

    await zhang_adminModel.zhang_touchLogin(zhang_admin.zhang_id);
    const zhang_latest = await zhang_adminModel.zhang_findById(zhang_admin.zhang_id);
    const zhang_token = zhang_cryptoService.zhang_signToken({
      id: zhang_admin.zhang_id,
      username: zhang_admin.zhang_username,
      role: 'admin'
    });

    zhang_res.json({
      code: 0,
      msg: '登录成功，欢迎回来',
      data: {
        token: zhang_token,
        tokenExpire: zhang_cryptoService.zhang_TOKEN_TTL,
        admin: zhang_publicAdmin(zhang_latest)
      }
    });
  } catch (zhang_err) {
    console.error('管理员登录失败：', zhang_err);
    zhang_res.json({ code: 1, msg: '登录失败，请稍后重试', data: null });
  }
}

// 当前登录管理员
async function zhang_me(zhang_req, zhang_res) {
  try {
    const zhang_admin = await zhang_adminModel.zhang_findById(zhang_req.zhang_admin.id);
    if (!zhang_admin) {
      return zhang_res.status(401).json({ code: 401, msg: '管理员不存在，请重新登录', data: null });
    }
    zhang_res.json({ code: 0, msg: '获取当前管理员成功', data: { admin: zhang_publicAdmin(zhang_admin) } });
  } catch (zhang_err) {
    console.error('获取当前管理员失败：', zhang_err);
    zhang_res.json({ code: 1, msg: '获取管理员信息失败，请稍后重试', data: null });
  }
}

// 仪表盘数据
async function zhang_dashboard(zhang_req, zhang_res) {
  try {
    const zhang_data = await zhang_dashboardModel.zhang_getDashboard();
    zhang_res.json({ code: 0, msg: '获取仪表盘数据成功', data: zhang_data });
  } catch (zhang_err) {
    console.error('获取仪表盘数据失败：', zhang_err);
    zhang_res.json({ code: 1, msg: '获取仪表盘数据失败，请稍后重试', data: null });
  }
}

// ==================== 新闻管理 ====================

async function zhang_newsList(zhang_req, zhang_res) {
  try {
    const zhang_options = zhang_parsePage(zhang_req.query);
    const zhang_result = await zhang_adminNewsModel.zhang_listNews(zhang_options);
    zhang_res.json({
      code: 0,
      msg: '获取新闻列表成功',
      data: {
        total: zhang_result.total,
        page: zhang_options.page,
        pageSize: zhang_options.pageSize,
        keyword: zhang_options.keyword,
        list: zhang_result.list
      }
    });
  } catch (zhang_err) {
    console.error('获取新闻列表失败：', zhang_err);
    zhang_res.json({ code: 1, msg: '获取新闻列表失败，请稍后重试', data: null });
  }
}

async function zhang_newsDetail(zhang_req, zhang_res) {
  try {
    const zhang_news = await zhang_adminNewsModel.zhang_findNewsById(zhang_req.params.id);
    if (!zhang_news) {
      return zhang_res.json({ code: 1, msg: '新闻不存在或已被删除', data: null });
    }
    zhang_res.json({ code: 0, msg: '获取新闻详情成功', data: { news: zhang_news } });
  } catch (zhang_err) {
    console.error('获取新闻详情失败：', zhang_err);
    zhang_res.json({ code: 1, msg: '获取新闻详情失败，请稍后重试', data: null });
  }
}

// 校验并整理新闻输入
function zhang_readNewsBody(zhang_body, zhang_isCreate) {
  const zhang_news = {
    title: String(zhang_body.title || '').trim(),
    category: String(zhang_body.category || '').trim(),
    summary: String(zhang_body.summary || '').trim(),
    content: String(zhang_body.content || '').trim(),
    source: String(zhang_body.source || '').trim(),
    author: String(zhang_body.author || '').trim(),
    views: parseInt(zhang_body.views, 10),
    publishTime: zhang_normalizeTime(zhang_body.publishTime)
  };
  if (!Number.isFinite(zhang_news.views) || zhang_news.views < 0) {
    zhang_news.views = 0;
  }
  if (!zhang_news.publishTime) {
    zhang_news.publishTime = zhang_normalizeTime(new Date());
  }

  if (!zhang_news.title || !zhang_news.category || !zhang_news.summary || !zhang_news.content || !zhang_news.source || !zhang_news.author) {
    return { error: '标题、分类、摘要、正文、来源、作者均为必填项' };
  }
  if (zhang_news.title.length > 200) {
    return { error: '标题长度不能超过 200 个字符' };
  }
  if (zhang_news.category.length > 50) {
    return { error: '分类长度不能超过 50 个字符' };
  }
  if (zhang_news.summary.length > 500) {
    return { error: '摘要长度不能超过 500 个字符' };
  }
  if (zhang_news.source.length > 100 || zhang_news.author.length > 50) {
    return { error: '来源或作者长度超出限制' };
  }
  if (zhang_isCreate && zhang_news.views > 100000000) {
    return { error: '浏览量数值过大' };
  }
  return { news: zhang_news };
}

async function zhang_newsCreate(zhang_req, zhang_res) {
  const zhang_checked = zhang_readNewsBody(zhang_req.body || {}, true);
  if (zhang_checked.error) {
    return zhang_res.json({ code: 1, msg: zhang_checked.error, data: null });
  }
  try {
    const zhang_id = await zhang_adminNewsModel.zhang_createNews(zhang_checked.news);
    const zhang_news = await zhang_adminNewsModel.zhang_findNewsById(zhang_id);
    zhang_res.json({ code: 0, msg: '新增新闻成功', data: { news: zhang_news } });
  } catch (zhang_err) {
    console.error('新增新闻失败：', zhang_err);
    zhang_res.json({ code: 1, msg: '新增新闻失败，请稍后重试', data: null });
  }
}

async function zhang_newsUpdate(zhang_req, zhang_res) {
  const zhang_id = zhang_req.params.id;
  const zhang_checked = zhang_readNewsBody(zhang_req.body || {}, false);
  if (zhang_checked.error) {
    return zhang_res.json({ code: 1, msg: zhang_checked.error, data: null });
  }
  try {
    const zhang_exist = await zhang_adminNewsModel.zhang_findNewsById(zhang_id);
    if (!zhang_exist) {
      return zhang_res.json({ code: 1, msg: '新闻不存在或已被删除', data: null });
    }
    await zhang_adminNewsModel.zhang_updateNews(zhang_id, zhang_checked.news);
    const zhang_news = await zhang_adminNewsModel.zhang_findNewsById(zhang_id);
    zhang_res.json({ code: 0, msg: '修改新闻成功', data: { news: zhang_news } });
  } catch (zhang_err) {
    console.error('修改新闻失败：', zhang_err);
    zhang_res.json({ code: 1, msg: '修改新闻失败，请稍后重试', data: null });
  }
}

async function zhang_newsDelete(zhang_req, zhang_res) {
  try {
    const zhang_affected = await zhang_adminNewsModel.zhang_deleteNews(zhang_req.params.id);
    if (!zhang_affected) {
      return zhang_res.json({ code: 1, msg: '新闻不存在或已被删除', data: null });
    }
    zhang_res.json({ code: 0, msg: '删除新闻成功', data: { id: Number(zhang_req.params.id) } });
  } catch (zhang_err) {
    console.error('删除新闻失败：', zhang_err);
    zhang_res.json({ code: 1, msg: '删除新闻失败，请稍后重试', data: null });
  }
}

// ==================== 农产品管理 ====================

async function zhang_produceList(zhang_req, zhang_res) {
  try {
    const zhang_options = zhang_parsePage(zhang_req.query);
    const zhang_result = await zhang_adminProduceModel.zhang_listProduce(zhang_options);
    zhang_res.json({
      code: 0,
      msg: '获取农产品列表成功',
      data: {
        total: zhang_result.total,
        page: zhang_options.page,
        pageSize: zhang_options.pageSize,
        keyword: zhang_options.keyword,
        list: zhang_result.list
      }
    });
  } catch (zhang_err) {
    console.error('获取农产品列表失败：', zhang_err);
    zhang_res.json({ code: 1, msg: '获取农产品列表失败，请稍后重试', data: null });
  }
}

async function zhang_produceDetail(zhang_req, zhang_res) {
  try {
    const zhang_produce = await zhang_adminProduceModel.zhang_findProduceById(zhang_req.params.id);
    if (!zhang_produce) {
      return zhang_res.json({ code: 1, msg: '农产品不存在或已被删除', data: null });
    }
    zhang_res.json({ code: 0, msg: '获取农产品详情成功', data: { produce: zhang_produce } });
  } catch (zhang_err) {
    console.error('获取农产品详情失败：', zhang_err);
    zhang_res.json({ code: 1, msg: '获取农产品详情失败，请稍后重试', data: null });
  }
}

function zhang_readProduceBody(zhang_body) {
  const zhang_produce = {
    name: String(zhang_body.name || '').trim(),
    category: String(zhang_body.category || '').trim(),
    price: Number(zhang_body.price),
    unit: String(zhang_body.unit || '').trim(),
    origin: String(zhang_body.origin || '').trim(),
    desc: String(zhang_body.desc || '').trim(),
    image: String(zhang_body.image || '').trim(),
    stock: parseInt(zhang_body.stock, 10)
  };

  if (!zhang_produce.name || !zhang_produce.category || !zhang_produce.unit || !zhang_produce.origin || !zhang_produce.desc) {
    return { error: '名称、分类、计价单位、产地、描述均为必填项' };
  }
  if (zhang_produce.name.length > 100 || zhang_produce.category.length > 50) {
    return { error: '名称或分类长度超出限制' };
  }
  if (!Number.isFinite(zhang_produce.price) || zhang_produce.price < 0) {
    return { error: '单价必须为不小于 0 的数字' };
  }
  if (!Number.isFinite(zhang_produce.stock) || zhang_produce.stock < 0) {
    return { error: '库存必须为不小于 0 的整数' };
  }
  if (zhang_produce.desc.length > 500) {
    return { error: '描述长度不能超过 500 个字符' };
  }
  if (zhang_produce.image.length > 600) {
    return { error: '图片地址长度不能超过 600 个字符' };
  }
  return { produce: zhang_produce };
}

async function zhang_produceCreate(zhang_req, zhang_res) {
  const zhang_checked = zhang_readProduceBody(zhang_req.body || {});
  if (zhang_checked.error) {
    return zhang_res.json({ code: 1, msg: zhang_checked.error, data: null });
  }
  try {
    const zhang_id = await zhang_adminProduceModel.zhang_createProduce(zhang_checked.produce);
    const zhang_produce = await zhang_adminProduceModel.zhang_findProduceById(zhang_id);
    zhang_res.json({ code: 0, msg: '新增农产品成功', data: { produce: zhang_produce } });
  } catch (zhang_err) {
    console.error('新增农产品失败：', zhang_err);
    zhang_res.json({ code: 1, msg: '新增农产品失败，请稍后重试', data: null });
  }
}

async function zhang_produceUpdate(zhang_req, zhang_res) {
  const zhang_id = zhang_req.params.id;
  const zhang_checked = zhang_readProduceBody(zhang_req.body || {});
  if (zhang_checked.error) {
    return zhang_res.json({ code: 1, msg: zhang_checked.error, data: null });
  }
  try {
    const zhang_exist = await zhang_adminProduceModel.zhang_findProduceById(zhang_id);
    if (!zhang_exist) {
      return zhang_res.json({ code: 1, msg: '农产品不存在或已被删除', data: null });
    }
    await zhang_adminProduceModel.zhang_updateProduce(zhang_id, zhang_checked.produce);
    const zhang_produce = await zhang_adminProduceModel.zhang_findProduceById(zhang_id);
    zhang_res.json({ code: 0, msg: '修改农产品成功', data: { produce: zhang_produce } });
  } catch (zhang_err) {
    console.error('修改农产品失败：', zhang_err);
    zhang_res.json({ code: 1, msg: '修改农产品失败，请稍后重试', data: null });
  }
}

async function zhang_produceDelete(zhang_req, zhang_res) {
  try {
    const zhang_affected = await zhang_adminProduceModel.zhang_deleteProduce(zhang_req.params.id);
    if (!zhang_affected) {
      return zhang_res.json({ code: 1, msg: '农产品不存在或已被删除', data: null });
    }
    zhang_res.json({ code: 0, msg: '删除农产品成功', data: { id: Number(zhang_req.params.id) } });
  } catch (zhang_err) {
    console.error('删除农产品失败：', zhang_err);
    zhang_res.json({ code: 1, msg: '删除农产品失败，请稍后重试', data: null });
  }
}

// ==================== 用户管理 ====================

async function zhang_userList(zhang_req, zhang_res) {
  try {
    const zhang_options = zhang_parsePage(zhang_req.query);
    const zhang_result = await zhang_adminUserModel.zhang_listUser(zhang_options);
    zhang_res.json({
      code: 0,
      msg: '获取用户列表成功',
      data: {
        total: zhang_result.total,
        page: zhang_options.page,
        pageSize: zhang_options.pageSize,
        keyword: zhang_options.keyword,
        list: zhang_result.list
      }
    });
  } catch (zhang_err) {
    console.error('获取用户列表失败：', zhang_err);
    zhang_res.json({ code: 1, msg: '获取用户列表失败，请稍后重试', data: null });
  }
}

async function zhang_userDetail(zhang_req, zhang_res) {
  try {
    const zhang_user = await zhang_adminUserModel.zhang_findUserById(zhang_req.params.id);
    if (!zhang_user) {
      return zhang_res.json({ code: 1, msg: '用户不存在或已被删除', data: null });
    }
    zhang_res.json({ code: 0, msg: '获取用户详情成功', data: { user: zhang_user } });
  } catch (zhang_err) {
    console.error('获取用户详情失败：', zhang_err);
    zhang_res.json({ code: 1, msg: '获取用户详情失败，请稍后重试', data: null });
  }
}

async function zhang_userCreate(zhang_req, zhang_res) {
  const zhang_body = zhang_req.body || {};
  const zhang_username = String(zhang_body.username || '').trim();
  const zhang_nickname = String(zhang_body.nickname || '').trim();
  const zhang_email = String(zhang_body.email || '').trim();
  const zhang_password = String(zhang_body.password || '');

  if (!zhang_username || !zhang_nickname || !zhang_password) {
    return zhang_res.json({ code: 1, msg: '用户名、昵称、初始密码均为必填项', data: null });
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
    return zhang_res.json({ code: 1, msg: '初始密码需为 8-20 位，且同时包含字母和数字', data: null });
  }

  try {
    const zhang_exist = await zhang_adminUserModel.zhang_findUserByUsername(zhang_username);
    if (zhang_exist) {
      return zhang_res.json({ code: 1, msg: '该用户名已存在，请更换用户名', data: null });
    }
    const zhang_id = await zhang_adminUserModel.zhang_createUser({
      username: zhang_username,
      password: zhang_cryptoService.zhang_hashPassword(zhang_password),
      nickname: zhang_nickname,
      email: zhang_email
    });
    const zhang_user = await zhang_adminUserModel.zhang_findUserById(zhang_id);
    zhang_res.json({ code: 0, msg: '新增用户成功', data: { user: zhang_user } });
  } catch (zhang_err) {
    console.error('新增用户失败：', zhang_err);
    if (zhang_err && zhang_err.code === 'ER_DUP_ENTRY') {
      return zhang_res.json({ code: 1, msg: '该用户名已存在，请更换用户名', data: null });
    }
    zhang_res.json({ code: 1, msg: '新增用户失败，请稍后重试', data: null });
  }
}

async function zhang_userUpdate(zhang_req, zhang_res) {
  const zhang_id = zhang_req.params.id;
  const zhang_body = zhang_req.body || {};
  const zhang_nickname = String(zhang_body.nickname || '').trim();
  const zhang_email = String(zhang_body.email || '').trim();
  const zhang_password = String(zhang_body.password || '');

  if (!zhang_nickname) {
    return zhang_res.json({ code: 1, msg: '昵称不能为空', data: null });
  }
  if (zhang_nickname.length < 2 || zhang_nickname.length > 20) {
    return zhang_res.json({ code: 1, msg: '昵称长度需为 2-20 个字符', data: null });
  }
  if (zhang_email && !zhang_EMAIL_RE.test(zhang_email)) {
    return zhang_res.json({ code: 1, msg: '邮箱格式不正确', data: null });
  }
  if (zhang_password && !zhang_PASSWORD_RE.test(zhang_password)) {
    return zhang_res.json({ code: 1, msg: '重置密码需为 8-20 位，且同时包含字母和数字', data: null });
  }

  try {
    const zhang_exist = await zhang_adminUserModel.zhang_findUserById(zhang_id);
    if (!zhang_exist) {
      return zhang_res.json({ code: 1, msg: '用户不存在或已被删除', data: null });
    }
    await zhang_adminUserModel.zhang_updateUser(zhang_id, { nickname: zhang_nickname, email: zhang_email });
    if (zhang_password) {
      await zhang_adminUserModel.zhang_updateUserPassword(zhang_id, zhang_cryptoService.zhang_hashPassword(zhang_password));
    }
    const zhang_user = await zhang_adminUserModel.zhang_findUserById(zhang_id);
    zhang_res.json({ code: 0, msg: '修改用户成功', data: { user: zhang_user } });
  } catch (zhang_err) {
    console.error('修改用户失败：', zhang_err);
    zhang_res.json({ code: 1, msg: '修改用户失败，请稍后重试', data: null });
  }
}

async function zhang_userDelete(zhang_req, zhang_res) {
  try {
    const zhang_affected = await zhang_adminUserModel.zhang_deleteUser(zhang_req.params.id);
    if (!zhang_affected) {
      return zhang_res.json({ code: 1, msg: '用户不存在或已被删除', data: null });
    }
    zhang_res.json({ code: 0, msg: '删除用户成功', data: { id: Number(zhang_req.params.id) } });
  } catch (zhang_err) {
    console.error('删除用户失败：', zhang_err);
    zhang_res.json({ code: 1, msg: '删除用户失败，请稍后重试', data: null });
  }
}

module.exports = {
  zhang_login,
  zhang_me,
  zhang_dashboard,
  zhang_newsList,
  zhang_newsDetail,
  zhang_newsCreate,
  zhang_newsUpdate,
  zhang_newsDelete,
  zhang_produceList,
  zhang_produceDetail,
  zhang_produceCreate,
  zhang_produceUpdate,
  zhang_produceDelete,
  zhang_userList,
  zhang_userDetail,
  zhang_userCreate,
  zhang_userUpdate,
  zhang_userDelete
};
