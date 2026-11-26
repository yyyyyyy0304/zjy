/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_pool = require('../config/zhang_db');

// 管理端农产品列表：关键词搜索 + 分页
async function zhang_listProduce(zhang_options) {
  const zhang_page = zhang_options.page;
  const zhang_pageSize = zhang_options.pageSize;
  const zhang_keyword = zhang_options.keyword;
  const zhang_offset = (zhang_page - 1) * zhang_pageSize;

  let zhang_where = '';
  const zhang_params = [];
  if (zhang_keyword) {
    zhang_where = ' WHERE zhang_name LIKE ? OR zhang_category LIKE ? OR zhang_origin LIKE ? OR zhang_desc LIKE ?';
    const zhang_like = '%' + zhang_keyword + '%';
    zhang_params.push(zhang_like, zhang_like, zhang_like, zhang_like);
  }

  const [zhang_countRows] = await zhang_pool.query(
    'SELECT COUNT(*) AS zhang_total FROM zhang_produce' + zhang_where,
    zhang_params
  );

  const [zhang_rows] = await zhang_pool.query(
    'SELECT zhang_id, zhang_name, zhang_category, zhang_price, zhang_unit, zhang_origin, zhang_desc, zhang_image, zhang_stock, zhang_create_time' +
      ' FROM zhang_produce' + zhang_where +
      ' ORDER BY zhang_id ASC LIMIT ? OFFSET ?',
    zhang_params.concat([zhang_pageSize, zhang_offset])
  );

  return { total: zhang_countRows[0].zhang_total, list: zhang_rows };
}

// 农产品详情
async function zhang_findProduceById(zhang_id) {
  const [zhang_rows] = await zhang_pool.query(
    'SELECT zhang_id, zhang_name, zhang_category, zhang_price, zhang_unit, zhang_origin, zhang_desc, zhang_image, zhang_stock, zhang_create_time' +
      ' FROM zhang_produce WHERE zhang_id = ? LIMIT 1',
    [zhang_id]
  );
  return zhang_rows[0] || null;
}

// 新增农产品
async function zhang_createProduce(zhang_produce) {
  const [zhang_result] = await zhang_pool.query(
    'INSERT INTO zhang_produce (zhang_name, zhang_category, zhang_price, zhang_unit, zhang_origin, zhang_desc, zhang_image, zhang_stock)' +
      ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      zhang_produce.name,
      zhang_produce.category,
      zhang_produce.price,
      zhang_produce.unit,
      zhang_produce.origin,
      zhang_produce.desc,
      zhang_produce.image,
      zhang_produce.stock
    ]
  );
  return zhang_result.insertId;
}

// 修改农产品
async function zhang_updateProduce(zhang_id, zhang_produce) {
  const [zhang_result] = await zhang_pool.query(
    'UPDATE zhang_produce SET zhang_name = ?, zhang_category = ?, zhang_price = ?, zhang_unit = ?,' +
      ' zhang_origin = ?, zhang_desc = ?, zhang_image = ?, zhang_stock = ? WHERE zhang_id = ?',
    [
      zhang_produce.name,
      zhang_produce.category,
      zhang_produce.price,
      zhang_produce.unit,
      zhang_produce.origin,
      zhang_produce.desc,
      zhang_produce.image,
      zhang_produce.stock,
      zhang_id
    ]
  );
  return zhang_result.affectedRows;
}

// 删除农产品
async function zhang_deleteProduce(zhang_id) {
  const [zhang_result] = await zhang_pool.query('DELETE FROM zhang_produce WHERE zhang_id = ?', [zhang_id]);
  return zhang_result.affectedRows;
}

module.exports = {
  zhang_listProduce,
  zhang_findProduceById,
  zhang_createProduce,
  zhang_updateProduce,
  zhang_deleteProduce
};
