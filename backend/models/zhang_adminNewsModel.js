/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_pool = require('../config/zhang_db');

// 管理端新闻列表：关键词搜索 + 分页（列表不返回正文，详情再单独查询）
async function zhang_listNews(zhang_options) {
  const zhang_page = zhang_options.page;
  const zhang_pageSize = zhang_options.pageSize;
  const zhang_keyword = zhang_options.keyword;
  const zhang_offset = (zhang_page - 1) * zhang_pageSize;

  let zhang_where = '';
  const zhang_params = [];
  if (zhang_keyword) {
    zhang_where =
      ' WHERE zhang_title LIKE ? OR zhang_category LIKE ? OR zhang_author LIKE ? OR zhang_source LIKE ?';
    const zhang_like = '%' + zhang_keyword + '%';
    zhang_params.push(zhang_like, zhang_like, zhang_like, zhang_like);
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

  return { total: zhang_countRows[0].zhang_total, list: zhang_rows };
}

// 新闻详情（含正文）
async function zhang_findNewsById(zhang_id) {
  const [zhang_rows] = await zhang_pool.query(
    'SELECT zhang_id, zhang_title, zhang_category, zhang_summary, zhang_content, zhang_source, zhang_author, zhang_views, zhang_publish_time, zhang_create_time' +
      ' FROM zhang_news WHERE zhang_id = ? LIMIT 1',
    [zhang_id]
  );
  return zhang_rows[0] || null;
}

// 新增新闻
async function zhang_createNews(zhang_news) {
  const [zhang_result] = await zhang_pool.query(
    'INSERT INTO zhang_news (zhang_title, zhang_category, zhang_summary, zhang_content, zhang_source, zhang_author, zhang_views, zhang_publish_time)' +
      ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      zhang_news.title,
      zhang_news.category,
      zhang_news.summary,
      zhang_news.content,
      zhang_news.source,
      zhang_news.author,
      zhang_news.views,
      zhang_news.publishTime
    ]
  );
  return zhang_result.insertId;
}

// 修改新闻
async function zhang_updateNews(zhang_id, zhang_news) {
  const [zhang_result] = await zhang_pool.query(
    'UPDATE zhang_news SET zhang_title = ?, zhang_category = ?, zhang_summary = ?, zhang_content = ?,' +
      ' zhang_source = ?, zhang_author = ?, zhang_views = ?, zhang_publish_time = ? WHERE zhang_id = ?',
    [
      zhang_news.title,
      zhang_news.category,
      zhang_news.summary,
      zhang_news.content,
      zhang_news.source,
      zhang_news.author,
      zhang_news.views,
      zhang_news.publishTime,
      zhang_id
    ]
  );
  return zhang_result.affectedRows;
}

// 删除新闻
async function zhang_deleteNews(zhang_id) {
  const [zhang_result] = await zhang_pool.query('DELETE FROM zhang_news WHERE zhang_id = ?', [zhang_id]);
  return zhang_result.affectedRows;
}

module.exports = {
  zhang_listNews,
  zhang_findNewsById,
  zhang_createNews,
  zhang_updateNews,
  zhang_deleteNews
};
