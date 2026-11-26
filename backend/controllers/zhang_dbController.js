/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_mysql = require('mysql2/promise');

// 连接 MySQL 并返回连接信息（动态读取前端传入的账号密码，不使用 .env 凭据）
async function zhang_connect(zhang_req, zhang_res) {
  const zhang_host = (zhang_req.body.host || 'localhost').trim();
  const zhang_port = parseInt(zhang_req.body.port, 10) || 3306;
  const zhang_user = (zhang_req.body.user || '').trim();
  const zhang_password = (zhang_req.body.password || '').trim();
  const zhang_database = (zhang_req.body.database || '').trim();

  if (!zhang_user || !zhang_password || !zhang_database) {
    return zhang_res.json({ code: 1, msg: '用户名、密码、数据库名不能为空', data: null });
  }

  let zhang_conn = null;
  try {
    zhang_conn = await zhang_mysql.createConnection({
      host: zhang_host,
      port: zhang_port,
      user: zhang_user,
      password: zhang_password,
      database: zhang_database,
      connectTimeout: 5000
    });

    const [zhang_rows] = await zhang_conn.query('SELECT VERSION() AS zhang_version');
    const [[zhang_db]] = await zhang_conn.query(
      'SELECT SCHEMA_NAME AS zhang_schema, DEFAULT_CHARACTER_SET_NAME AS zhang_charset FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?',
      [zhang_database]
    );

    zhang_res.json({
      code: 0,
      msg: '数据库连接成功',
      data: {
        host: zhang_host,
        port: zhang_port,
        user: zhang_user,
        database: zhang_database,
        version: zhang_rows[0].zhang_version,
        charset: zhang_db ? zhang_db.zhang_charset : '未知'
      }
    });
  } catch (zhang_err) {
    console.error('数据库连接失败：', zhang_err.message);
    const zhang_hint = zhang_err.code === 'ER_ACCESS_DENIED_ERROR'
      ? '用户名或密码错误'
      : (zhang_err.code === 'ER_BAD_DB_ERROR'
        ? '数据库不存在，请确认数据库名'
        : (zhang_err.code === 'ECONNREFUSED' || zhang_err.code === 'ETIMEDOUT'
          ? '无法连接 MySQL 服务，请检查主机、端口与 MySQL 是否已启动'
          : zhang_err.message));
    zhang_res.json({ code: 1, msg: '连接失败：' + zhang_hint, data: null });
  } finally {
    if (zhang_conn) {
      await zhang_conn.end().catch(function () {});
    }
  }
}

module.exports = {
  zhang_connect
};
