/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
*/

(function () {
  'use strict';

  var zhang_form = document.getElementById('zhang_db_form');
  var zhang_alert = document.getElementById('zhang_alert');
  var zhang_alert_icon = document.getElementById('zhang_alert_icon');
  var zhang_alert_text = document.getElementById('zhang_alert_text');
  var zhang_db_info = document.getElementById('zhang_db_info');

  function zhang_getInput(zhang_id) {
    return document.getElementById(zhang_id).value.trim();
  }

  // 展示提示（成功 zhang_ok / 失败 zhang_err）
  function zhang_showAlert(zhang_isOk, zhang_message) {
    zhang_alert.hidden = false;
    zhang_alert.className = 'zhang_alert ' + (zhang_isOk ? 'zhang_alert_ok' : 'zhang_alert_err');
    zhang_alert_icon.textContent = zhang_isOk ? '✓' : '✗';
    zhang_alert_text.textContent = zhang_message;
  }

  // 展示连接成功的数据库信息
  function zhang_showInfo(zhang_data) {
    document.getElementById('zhang_info_server').textContent = zhang_data.host + ':' + zhang_data.port;
    document.getElementById('zhang_info_version').textContent = zhang_data.version;
    document.getElementById('zhang_info_db').textContent = zhang_data.database;
    document.getElementById('zhang_info_user').textContent = zhang_data.user;
    document.getElementById('zhang_info_charset').textContent = zhang_data.charset;
    zhang_db_info.hidden = false;
  }

  // 提交连接
  function zhang_onSubmit(zhang_event) {
    zhang_event.preventDefault();
    zhang_db_info.hidden = true;

    var zhang_body = {
      host: zhang_getInput('zhang_db_host'),
      port: parseInt(zhang_getInput('zhang_db_port'), 10) || 3306,
      user: zhang_getInput('zhang_db_user'),
      password: zhang_getInput('zhang_db_password'),
      database: zhang_getInput('zhang_db_name')
    };

    fetch('/api/db/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zhang_body)
    })
      .then(function (zhang_res) {
        return zhang_res.json();
      })
      .then(function (zhang_data) {
        console.log('数据库连接接口返回：', zhang_data);
        if (zhang_data.code === 0) {
          zhang_showAlert(true, zhang_data.msg);
          zhang_showInfo(zhang_data.data);
        } else {
          zhang_showAlert(false, zhang_data.msg);
        }
      })
      .catch(function (zhang_err) {
        console.error('请求数据库连接接口失败：', zhang_err);
        zhang_showAlert(false, '无法访问后端服务，请先启动 backend（端口 8115）');
      });
  }

  zhang_form.addEventListener('submit', zhang_onSubmit);
})();
