/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-16 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_pool = require('../config/zhang_db');

/**
 * 新增一条图像识别记录
 * @param {Object} zhang_data - 记录字段
 * @returns {Promise<number>} - 新记录 ID
 */
async function zhang_insertRecord(zhang_data) {
  const [zhang_result] = await zhang_pool.query(
    'INSERT INTO zhang_vision_record' +
      ' (zhang_filename, zhang_name, zhang_category, zhang_items, zhang_freshness, zhang_description, zhang_tags, zhang_confidence, zhang_model)' +
      ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      zhang_data.filename,
      zhang_data.name,
      zhang_data.category,
      zhang_data.items,
      zhang_data.freshness,
      zhang_data.description,
      zhang_data.tags,
      zhang_data.confidence,
      zhang_data.model
    ]
  );

  return zhang_result.insertId;
}

/**
 * 查询最近的图像识别记录
 * @param {number} zhang_limit - 返回条数
 */
async function zhang_findRecords(zhang_limit) {
  const [zhang_rows] = await zhang_pool.query(
    'SELECT zhang_id, zhang_filename, zhang_name, zhang_category, zhang_items, zhang_freshness,' +
      ' zhang_description, zhang_tags, zhang_confidence, zhang_model, zhang_create_time' +
      ' FROM zhang_vision_record ORDER BY zhang_id DESC LIMIT ?',
    [zhang_limit]
  );

  return zhang_rows;
}

module.exports = {
  zhang_insertRecord,
  zhang_findRecords
};
