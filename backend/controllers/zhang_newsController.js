/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_newsModel = require('../models/zhang_newsModel');

// 获取科技新闻列表
async function zhang_newsList(zhang_req, zhang_res) {
  const zhang_page = parseInt(zhang_req.query.page, 10) > 0 ? parseInt(zhang_req.query.page, 10) : 1;
  const zhang_pageSizeRaw = parseInt(zhang_req.query.pageSize, 10);
  const zhang_pageSize = zhang_pageSizeRaw > 0 && zhang_pageSizeRaw <= 50 ? zhang_pageSizeRaw : 10;
  const zhang_keyword = (zhang_req.query.keyword || '').trim();

  try {
    const zhang_result = await zhang_newsModel.zhang_findNews({
      page: zhang_page,
      pageSize: zhang_pageSize,
      keyword: zhang_keyword
    });

    zhang_res.json({
      code: 0,
      msg: '获取新闻列表成功',
      data: {
        total: zhang_result.total,
        page: zhang_page,
        pageSize: zhang_pageSize,
        keyword: zhang_keyword,
        list: zhang_result.list
      }
    });
  } catch (zhang_err) {
    console.error('查询新闻列表失败：', zhang_err.message);
    zhang_res.json({ code: 1, msg: '查询新闻列表失败：' + zhang_err.message, data: null });
  }
}

module.exports = {
  zhang_newsList
};
