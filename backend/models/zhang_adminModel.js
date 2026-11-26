/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_pool = require('../config/zhang_db');

// 按用户名查询管理员（含密码哈希，仅登录校验时使用）
async function zhang_findByUsername(zhang_username) {
  const [zhang_rows] = await zhang_pool.query(
    'SELECT zhang_id, zhang_username, zhang_password, zhang_realname, zhang_role, zhang_status, zhang_create_time, zhang_last_login_time' +
      ' FROM zhang_admin WHERE zhang_username = ? LIMIT 1',
    [zhang_username]
  );
  return zhang_rows[0] || null;
}

// 按主键查询管理员（不返回密码哈希）
async function zhang_findById(zhang_id) {
  const [zhang_rows] = await zhang_pool.query(
    'SELECT zhang_id, zhang_username, zhang_realname, zhang_role, zhang_status, zhang_create_time, zhang_last_login_time' +
      ' FROM zhang_admin WHERE zhang_id = ? LIMIT 1',
    [zhang_id]
  );
  return zhang_rows[0] || null;
}

// 更新最近登录时间
async function zhang_touchLogin(zhang_id) {
  await zhang_pool.query('UPDATE zhang_admin SET zhang_last_login_time = NOW() WHERE zhang_id = ?', [zhang_id]);
}

module.exports = {
  zhang_findByUsername,
  zhang_findById,
  zhang_touchLogin
};
