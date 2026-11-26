/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_pool = require('../config/zhang_db');

// 查询新闻列表（支持关键词搜索与分页）
async function zhang_findNews(zhang_options) {
  const zhang_page = zhang_options.page;
  const zhang_pageSize = zhang_options.pageSize;
  const zhang_keyword = zhang_options.keyword;
  const zhang_offset = (zhang_page - 1) * zhang_pageSize;

  let zhang_where = '';
  const zhang_params = [];
  if (zhang_keyword) {
    zhang_where = ' WHERE zhang_title LIKE ? OR zhang_summary LIKE ? OR zhang_category LIKE ?';
    const zhang_like = '%' + zhang_keyword + '%';
    zhang_params.push(zhang_like, zhang_like, zhang_like);
  }

  const [zhang_countRows] = await zhang_pool.query(
    'SELECT COUNT(*) AS zhang_total FROM zhang_news' + zhang_where,
    zhang_params
  );

  const [zhang_rows] = await zhang_pool.query(
    'SELECT zhang_id, zhang_title, zhang_category, zhang_summary, zhang_source, zhang_author, zhang_views, zhang_publish_time, zhang_create_time' +
      ' FROM zhang_news' + zhang_where +
      ' ORDER BY zhang_publish_time DESC, zhang_id DESC LIMIT ? OFFSET ?',
    zhang_params.concat([zhang_pageSize, zhang_offset])
  );

  return {
    total: zhang_countRows[0].zhang_total,
    list: zhang_rows
  };
}

module.exports = {
  zhang_findNews
};
