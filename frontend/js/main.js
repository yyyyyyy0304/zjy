/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
*/

(function () {
  'use strict';

  var zhang_apiBase = '/api';
  var zhang_statusDot = document.getElementById('zhang_status_dot');
  var zhang_statusText = document.getElementById('zhang_status_text');

  // 设置服务状态展示
  function zhang_setStatus(zhang_isOk, zhang_message) {
    if (!zhang_statusDot || !zhang_statusText) {
      return;
    }
    zhang_statusDot.className = 'zhang_status_dot ' + (zhang_isOk ? 'zhang_status_ok' : 'zhang_status_err');
    zhang_statusText.textContent = zhang_message;
  }

  // 检测后端服务是否可用
  function zhang_checkHealth() {
    fetch(zhang_apiBase + '/health')
      .then(function (zhang_res) {
        return zhang_res.json();
      })
      .then(function (zhang_data) {
        console.log('后端 /api/health 返回：', zhang_data);
        if (zhang_data.code === 0) {
          zhang_setStatus(true, '后端服务正常　（' + zhang_data.data.time + '）');
        } else {
          zhang_setStatus(false, '后端返回错误：' + zhang_data.msg);
        }
      })
      .catch(function (zhang_err) {
        console.error('检测后端服务失败：', zhang_err);
        zhang_setStatus(false, '后端服务未启动，请在 backend 目录执行 npm start（端口 8115）');
      });
  }

  zhang_checkHealth();
})();
