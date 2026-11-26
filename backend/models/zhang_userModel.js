/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_pool = require('../config/zhang_db');

// 按用户名查询用户（含密码哈希，仅登录校验时使用）
async function zhang_findByUsername(zhang_username) {
  const [zhang_rows] = await zhang_pool.query(
    'SELECT zhang_id, zhang_username, zhang_password, zhang_nickname, zhang_email, zhang_create_time, zhang_last_login_time' +
      ' FROM zhang_user WHERE zhang_username = ? LIMIT 1',
    [zhang_username]
  );
  return zhang_rows[0] || null;
}

// 按主键查询用户（不返回密码哈希）
async function zhang_findById(zhang_id) {
  const [zhang_rows] = await zhang_pool.query(
    'SELECT zhang_id, zhang_username, zhang_nickname, zhang_email, zhang_create_time, zhang_last_login_time' +
      ' FROM zhang_user WHERE zhang_id = ? LIMIT 1',
    [zhang_id]
  );
  return zhang_rows[0] || null;
}

// 按邮箱查询用户（Supabase 登录时同步本地资料使用，不返回密码哈希）
async function zhang_findByEmail(zhang_email) {
  const [zhang_rows] = await zhang_pool.query(
    'SELECT zhang_id, zhang_username, zhang_nickname, zhang_email, zhang_create_time, zhang_last_login_time' +
      ' FROM zhang_user WHERE LOWER(zhang_email) = LOWER(?) LIMIT 1',
    [zhang_email]
  );
  return zhang_rows[0] || null;
}

// 新增用户，密码列由调用方传入已加盐哈希后的值
async function zhang_createUser(zhang_user) {
  const [zhang_result] = await zhang_pool.query(
    'INSERT INTO zhang_user (zhang_username, zhang_password, zhang_nickname, zhang_email) VALUES (?, ?, ?, ?)',
    [zhang_user.username, zhang_user.password, zhang_user.nickname, zhang_user.email]
  );
  return zhang_result.insertId;
}

// 更新最近登录时间
async function zhang_touchLogin(zhang_id) {
  await zhang_pool.query('UPDATE zhang_user SET zhang_last_login_time = NOW() WHERE zhang_id = ?', [zhang_id]);
}

module.exports = {
  zhang_findByUsername,
  zhang_findById,
  zhang_findByEmail,
  zhang_createUser,
  zhang_touchLogin
};
