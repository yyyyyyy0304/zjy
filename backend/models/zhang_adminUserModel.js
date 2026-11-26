/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_pool = require('../config/zhang_db');

// 管理端用户列表：关键词搜索 + 分页（不返回密码哈希）
async function zhang_listUser(zhang_options) {
  const zhang_page = zhang_options.page;
  const zhang_pageSize = zhang_options.pageSize;
  const zhang_keyword = zhang_options.keyword;
  const zhang_offset = (zhang_page - 1) * zhang_pageSize;

  let zhang_where = '';
  const zhang_params = [];
  if (zhang_keyword) {
    zhang_where = ' WHERE zhang_username LIKE ? OR zhang_nickname LIKE ? OR zhang_email LIKE ?';
    const zhang_like = '%' + zhang_keyword + '%';
    zhang_params.push(zhang_like, zhang_like, zhang_like);
  }

  const [zhang_countRows] = await zhang_pool.query(
    'SELECT COUNT(*) AS zhang_total FROM zhang_user' + zhang_where,
    zhang_params
  );

  const [zhang_rows] = await zhang_pool.query(
    'SELECT zhang_id, zhang_username, zhang_nickname, zhang_email, zhang_create_time, zhang_last_login_time' +
      ' FROM zhang_user' + zhang_where +
      ' ORDER BY zhang_id ASC LIMIT ? OFFSET ?',
    zhang_params.concat([zhang_pageSize, zhang_offset])
  );

  return { total: zhang_countRows[0].zhang_total, list: zhang_rows };
}

// 用户详情
async function zhang_findUserById(zhang_id) {
  const [zhang_rows] = await zhang_pool.query(
    'SELECT zhang_id, zhang_username, zhang_nickname, zhang_email, zhang_create_time, zhang_last_login_time' +
      ' FROM zhang_user WHERE zhang_id = ? LIMIT 1',
    [zhang_id]
  );
  return zhang_rows[0] || null;
}

// 按用户名查询用户，用于新增时查重
async function zhang_findUserByUsername(zhang_username) {
  const [zhang_rows] = await zhang_pool.query('SELECT zhang_id FROM zhang_user WHERE zhang_username = ? LIMIT 1', [
    zhang_username
  ]);
  return zhang_rows[0] || null;
}

// 新增用户
async function zhang_createUser(zhang_user) {
  const [zhang_result] = await zhang_pool.query(
    'INSERT INTO zhang_user (zhang_username, zhang_password, zhang_nickname, zhang_email) VALUES (?, ?, ?, ?)',
    [zhang_user.username, zhang_user.password, zhang_user.nickname, zhang_user.email]
  );
  return zhang_result.insertId;
}

// 修改用户资料
async function zhang_updateUser(zhang_id, zhang_user) {
  const [zhang_result] = await zhang_pool.query(
    'UPDATE zhang_user SET zhang_nickname = ?, zhang_email = ? WHERE zhang_id = ?',
    [zhang_user.nickname, zhang_user.email, zhang_id]
  );
  return zhang_result.affectedRows;
}

// 重置用户密码（传入已哈希的密码）
async function zhang_updateUserPassword(zhang_id, zhang_password) {
  const [zhang_result] = await zhang_pool.query('UPDATE zhang_user SET zhang_password = ? WHERE zhang_id = ?', [
    zhang_password,
    zhang_id
  ]);
  return zhang_result.affectedRows;
}

// 删除用户
async function zhang_deleteUser(zhang_id) {
  const [zhang_result] = await zhang_pool.query('DELETE FROM zhang_user WHERE zhang_id = ?', [zhang_id]);
  return zhang_result.affectedRows;
}

module.exports = {
  zhang_listUser,
  zhang_findUserById,
  zhang_findUserByUsername,
  zhang_createUser,
  zhang_updateUser,
  zhang_updateUserPassword,
  zhang_deleteUser
};
