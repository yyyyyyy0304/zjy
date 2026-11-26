/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_pool = require('../config/zhang_db');

// 仪表盘聚合数据：全部由数据库真实统计得出
async function zhang_getDashboard() {
  const [zhang_newsCount] = await zhang_pool.query('SELECT COUNT(*) AS zhang_total FROM zhang_news');
  const [zhang_produceCount] = await zhang_pool.query('SELECT COUNT(*) AS zhang_total FROM zhang_produce');
  const [zhang_userCount] = await zhang_pool.query('SELECT COUNT(*) AS zhang_total FROM zhang_user');
  const [zhang_viewSum] = await zhang_pool.query('SELECT IFNULL(SUM(zhang_views), 0) AS zhang_total FROM zhang_news');

  // 新闻分类分布
  const [zhang_newsCategory] = await zhang_pool.query(
    'SELECT zhang_category AS zhang_name, COUNT(*) AS zhang_value FROM zhang_news GROUP BY zhang_category ORDER BY zhang_value DESC'
  );

  // 农产品各分类库存合计
  const [zhang_produceCategory] = await zhang_pool.query(
    'SELECT zhang_category AS zhang_name, SUM(zhang_stock) AS zhang_value, COUNT(*) AS zhang_count' +
      ' FROM zhang_produce GROUP BY zhang_category ORDER BY zhang_value DESC'
  );

  // 近 30 天用户注册趋势（按日期聚合）
  const [zhang_userTrend] = await zhang_pool.query(
    "SELECT DATE_FORMAT(MIN(zhang_create_time), '%m-%d') AS zhang_date, COUNT(*) AS zhang_value" +
      ' FROM zhang_user WHERE zhang_create_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)' +
      ' GROUP BY DATE(zhang_create_time) ORDER BY DATE(zhang_create_time) ASC'
  );

  // 库存最高的 5 个农产品
  const [zhang_stockTop] = await zhang_pool.query(
    'SELECT zhang_name AS zhang_name, zhang_stock AS zhang_value, zhang_unit AS zhang_unit' +
      ' FROM zhang_produce ORDER BY zhang_stock DESC LIMIT 5'
  );

  // 最新发布的 5 条新闻
  const [zhang_latestNews] = await zhang_pool.query(
    'SELECT zhang_id, zhang_title, zhang_category, zhang_author, zhang_views, zhang_publish_time' +
      ' FROM zhang_news ORDER BY zhang_publish_time DESC, zhang_id DESC LIMIT 5'
  );

  return {
    stats: {
      news: zhang_newsCount[0].zhang_total,
      produce: zhang_produceCount[0].zhang_total,
      user: zhang_userCount[0].zhang_total,
      views: Number(zhang_viewSum[0].zhang_total)
    },
    newsCategory: zhang_newsCategory,
    produceCategory: zhang_produceCategory,
    userTrend: zhang_userTrend,
    stockTop: zhang_stockTop,
    latestNews: zhang_latestNews
  };
}

module.exports = {
  zhang_getDashboard
};
