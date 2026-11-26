/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-16 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_pool = require('../config/zhang_db');

/**
 * 新增一条语音识别记录
 * @param {Object} zhang_data - 记录字段
 * @returns {Promise<number>} - 新记录 ID
 */
async function zhang_insertRecord(zhang_data) {
  const [zhang_result] = await zhang_pool.query(
    'INSERT INTO zhang_voice_record' +
      ' (zhang_filename, zhang_text, zhang_language, zhang_duration, zhang_model, zhang_intent, zhang_keywords, zhang_reply, zhang_confidence)' +
      ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      zhang_data.filename,
      zhang_data.text,
      zhang_data.language,
      zhang_data.duration,
      zhang_data.model,
      zhang_data.intent,
      zhang_data.keywords,
      zhang_data.reply,
      zhang_data.confidence
    ]
  );

  return zhang_result.insertId;
}

/**
 * 查询最近的语音识别记录
 * @param {number} zhang_limit - 返回条数
 */
async function zhang_findRecords(zhang_limit) {
  const [zhang_rows] = await zhang_pool.query(
    'SELECT zhang_id, zhang_filename, zhang_text, zhang_language, zhang_duration, zhang_model,' +
      ' zhang_intent, zhang_keywords, zhang_reply, zhang_confidence, zhang_create_time' +
      ' FROM zhang_voice_record ORDER BY zhang_id DESC LIMIT ?',
    [zhang_limit]
  );

  return zhang_rows;
}

module.exports = {
  zhang_insertRecord,
  zhang_findRecords
};
