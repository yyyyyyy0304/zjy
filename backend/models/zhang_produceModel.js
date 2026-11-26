/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_pool = require('../config/zhang_db');

// 查询农产品图文列表（支持关键词搜索与分页）
async function zhang_findProduce(zhang_options) {
  const zhang_page = zhang_options.page;
  const zhang_pageSize = zhang_options.pageSize;
  const zhang_keyword = zhang_options.keyword;
  const zhang_offset = (zhang_page - 1) * zhang_pageSize;

  let zhang_where = '';
  const zhang_params = [];
  if (zhang_keyword) {
    zhang_where = ' WHERE zhang_name LIKE ? OR zhang_desc LIKE ? OR zhang_category LIKE ? OR zhang_origin LIKE ?';
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

  return {
    total: zhang_countRows[0].zhang_total,
    list: zhang_rows
  };
}

module.exports = {
  zhang_findProduce
};
