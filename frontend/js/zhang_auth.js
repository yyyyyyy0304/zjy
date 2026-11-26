/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

// 登录 / 注册页公共工具：令牌存储、接口请求、验证码加载、表单提示
(function () {
  'use strict';

  var zhang_TOKEN_KEY = 'zhang_auth_token';
  var zhang_USER_KEY = 'zhang_auth_user';

  function zhang_getToken() {
    return localStorage.getItem(zhang_TOKEN_KEY) || '';
  }

  function zhang_getUser() {
    try {
      return JSON.parse(localStorage.getItem(zhang_USER_KEY) || 'null');
    } catch (zhang_err) {
      return null;
    }
  }

  function zhang_saveAuth(zhang_token, zhang_user) {
    localStorage.setItem(zhang_TOKEN_KEY, zhang_token);
    localStorage.setItem(zhang_USER_KEY, JSON.stringify(zhang_user));
  }

  function zhang_clearAuth() {
    localStorage.removeItem(zhang_TOKEN_KEY);
    localStorage.removeItem(zhang_USER_KEY);
  }

  // 统一请求：自动携带 Bearer 令牌与 JSON 请求头
  function zhang_request(zhang_url, zhang_options) {
    var zhang_opts = zhang_options || {};
    var zhang_headers = { 'Content-Type': 'application/json' };
    var zhang_token = zhang_getToken();
    if (zhang_token) {
      zhang_headers.Authorization = 'Bearer ' + zhang_token;
    }

    return fetch(zhang_url, {
      method: zhang_opts.method || 'GET',
      headers: zhang_headers,
      body: zhang_opts.body ? JSON.stringify(zhang_opts.body) : undefined
    }).then(function (zhang_res) {
      return zhang_res.json();
    });
  }

  // 加载图形验证码，回调返回 captchaId
  function zhang_loadCaptcha(zhang_box, zhang_done) {
    zhang_box.innerHTML = '<span class="zhang_captcha_fail">加载中…</span>';
    zhang_request('/api/auth/captcha')
      .then(function (zhang_data) {
        console.log('图形验证码接口返回：', zhang_data);
        if (zhang_data.code === 0 && zhang_data.data) {
          zhang_box.innerHTML = zhang_data.data.svg;
          zhang_done(zhang_data.data.captchaId);
        } else {
          zhang_box.innerHTML = '<span class="zhang_captcha_fail">加载失败，点击重试</span>';
          zhang_done('');
        }
      })
      .catch(function (zhang_err) {
        console.error('获取图形验证码失败：', zhang_err);
        zhang_box.innerHTML = '<span class="zhang_captcha_fail">加载失败，点击重试</span>';
        zhang_done('');
      });
  }

  // 顶部提示框：zhang_ok 为 true 显示成功样式
  function zhang_showAlert(zhang_alert, zhang_isOk, zhang_message) {
    if (!zhang_alert) {
      return;
    }
    zhang_alert.hidden = false;
    zhang_alert.className = 'zhang_alert ' + (zhang_isOk ? 'zhang_alert_ok' : 'zhang_alert_err');
    var zhang_icon = zhang_alert.querySelector('.zhang_alert_icon');
    var zhang_text = zhang_alert.querySelector('.zhang_alert_text');
    if (zhang_icon) {
      zhang_icon.textContent = zhang_isOk ? '✓' : '✗';
    }
    if (zhang_text) {
      zhang_text.textContent = zhang_message;
    }
  }

  // 字段校验提示：有内容时标红输入框
  function zhang_setTip(zhang_tip, zhang_message) {
    if (!zhang_tip) {
      return;
    }
    zhang_tip.textContent = zhang_message || '';
    var zhang_item = zhang_tip.closest('.zhang_form_item');
    if (zhang_item) {
      zhang_item.classList.toggle('zhang_item_err', Boolean(zhang_message));
    }
  }

  // 时间格式化：2026-11-19T07:50:32.000Z → 2026-11-19 15:50
  function zhang_formatTime(zhang_value) {
    if (!zhang_value) {
      return '暂无';
    }
    var zhang_date = new Date(zhang_value);
    if (isNaN(zhang_date.getTime())) {
      return String(zhang_value);
    }
    function zhang_pad(zhang_num) {
      return zhang_num < 10 ? '0' + zhang_num : String(zhang_num);
    }
    return (
      zhang_date.getFullYear() + '-' + zhang_pad(zhang_date.getMonth() + 1) + '-' + zhang_pad(zhang_date.getDate()) +
      ' ' + zhang_pad(zhang_date.getHours()) + ':' + zhang_pad(zhang_date.getMinutes())
    );
  }

  window.zhang_auth = {
    getToken: zhang_getToken,
    getUser: zhang_getUser,
    saveAuth: zhang_saveAuth,
    clearAuth: zhang_clearAuth,
    request: zhang_request,
    loadCaptcha: zhang_loadCaptcha,
    showAlert: zhang_showAlert,
    setTip: zhang_setTip,
    formatTime: zhang_formatTime
  };
})();
