/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

// 登录页：表单校验、图形验证码、登录态保持与退出
(function () {
  'use strict';

  var zhang_auth = window.zhang_auth;

  var zhang_loginArea = document.getElementById('zhang_login_area');
  var zhang_userArea = document.getElementById('zhang_user_area');
  var zhang_form = document.getElementById('zhang_login_form');
  var zhang_alert = document.getElementById('zhang_login_alert');
  var zhang_submit = document.getElementById('zhang_login_submit');
  var zhang_captchaBox = document.getElementById('zhang_login_captcha_box');
  var zhang_captchaInput = document.getElementById('zhang_login_captcha');
  var zhang_usernameInput = document.getElementById('zhang_login_username');
  var zhang_passwordInput = document.getElementById('zhang_login_password');
  var zhang_captchaId = '';

  // 刷新图形验证码，同时清空输入框
  function zhang_refreshCaptcha() {
    zhang_captchaInput.value = '';
    zhang_auth.loadCaptcha(zhang_captchaBox, function (zhang_id) {
      zhang_captchaId = zhang_id;
    });
  }

  // 展示已登录用户信息
  function zhang_renderUser(zhang_user) {
    zhang_loginArea.hidden = true;
    zhang_userArea.hidden = false;

    document.getElementById('zhang_user_avatar').textContent = (zhang_user.nickname || zhang_user.username || '田').charAt(0);
    document.getElementById('zhang_user_name').textContent = zhang_user.nickname || zhang_user.username;
    document.getElementById('zhang_user_desc').textContent = '已登录：' + zhang_user.username;
    document.getElementById('zhang_user_id').textContent = zhang_user.id;
    document.getElementById('zhang_user_nickname').textContent = zhang_user.nickname || '未设置';
    document.getElementById('zhang_user_email').textContent = zhang_user.email || '未设置';
    document.getElementById('zhang_user_create').textContent = zhang_auth.formatTime(zhang_user.createTime);
    document.getElementById('zhang_user_last_login').textContent = zhang_auth.formatTime(zhang_user.lastLoginTime);
  }

  // 退出登录：清除本地令牌，恢复登录表单
  function zhang_logout() {
    zhang_auth.clearAuth();
    console.log('已退出登录，本地令牌与用户信息已清除');
    zhang_userArea.hidden = true;
    zhang_loginArea.hidden = false;
    zhang_form.reset();
    zhang_auth.setTip(document.getElementById('zhang_login_username_tip'), '');
    zhang_auth.setTip(document.getElementById('zhang_login_password_tip'), '');
    zhang_auth.setTip(document.getElementById('zhang_login_captcha_tip'), '');
    zhang_refreshCaptcha();
    zhang_auth.showAlert(zhang_alert, true, '已退出登录');
  }

  // 前端表单校验
  function zhang_validate() {
    var zhang_ok = true;
    var zhang_username = zhang_usernameInput.value.trim();
    var zhang_password = zhang_passwordInput.value;
    var zhang_captcha = zhang_captchaInput.value.trim();

    zhang_auth.setTip(document.getElementById('zhang_login_username_tip'), '');
    zhang_auth.setTip(document.getElementById('zhang_login_password_tip'), '');
    zhang_auth.setTip(document.getElementById('zhang_login_captcha_tip'), '');

    if (!zhang_username) {
      zhang_auth.setTip(document.getElementById('zhang_login_username_tip'), '请输入用户名');
      zhang_ok = false;
    }
    if (!zhang_password) {
      zhang_auth.setTip(document.getElementById('zhang_login_password_tip'), '请输入密码');
      zhang_ok = false;
    }
    if (!/^[A-Za-z0-9]{4}$/.test(zhang_captcha)) {
      zhang_auth.setTip(document.getElementById('zhang_login_captcha_tip'), '请输入 4 位图形验证码');
      zhang_ok = false;
    }
    return zhang_ok;
  }

  function zhang_onSubmit(zhang_event) {
    zhang_event.preventDefault();
    zhang_alert.hidden = true;

    if (!zhang_validate()) {
      return;
    }
    if (!zhang_captchaId) {
      zhang_auth.showAlert(zhang_alert, false, '验证码尚未加载完成，请点击图片刷新');
      return;
    }

    zhang_submit.disabled = true;
    zhang_submit.textContent = '登录中…';

    zhang_auth
      .request('/api/auth/login', {
        method: 'POST',
        body: {
          username: zhang_usernameInput.value.trim(),
          password: zhang_passwordInput.value,
          captchaId: zhang_captchaId,
          captchaCode: zhang_captchaInput.value.trim()
        }
      })
      .then(function (zhang_data) {
        console.log('登录接口返回：', zhang_data);
        if (zhang_data.code === 0 && zhang_data.data) {
          zhang_auth.saveAuth(zhang_data.data.token, zhang_data.data.user);
          zhang_renderUser(zhang_data.data.user);
          zhang_auth.showAlert(zhang_alert, true, '登录成功，登录状态已保存（有效期 ' + Math.floor(zhang_data.data.tokenExpire / 60) + ' 分钟）');
        } else {
          zhang_auth.showAlert(zhang_alert, false, zhang_data.msg || '登录失败');
          zhang_refreshCaptcha();
        }
      })
      .catch(function (zhang_err) {
        console.error('请求登录接口失败：', zhang_err);
        zhang_auth.showAlert(zhang_alert, false, '无法访问后端服务，请先启动 backend（端口 8115）');
        zhang_refreshCaptcha();
      })
      .finally(function () {
        zhang_submit.disabled = false;
        zhang_submit.textContent = '登 录';
      });
  }

  // 页面打开时校验本地令牌，有效则直接展示登录状态
  function zhang_checkLogin() {
    if (!zhang_auth.getToken()) {
      return;
    }
    zhang_auth
      .request('/api/auth/me')
      .then(function (zhang_data) {
        console.log('当前登录用户接口返回：', zhang_data);
        if (zhang_data.code === 0 && zhang_data.data) {
          zhang_auth.saveAuth(zhang_auth.getToken(), zhang_data.data.user);
          zhang_renderUser(zhang_data.data.user);
        } else {
          zhang_auth.clearAuth();
        }
      })
      .catch(function (zhang_err) {
        console.error('校验登录状态失败：', zhang_err);
      });
  }

  zhang_form.addEventListener('submit', zhang_onSubmit);
  zhang_captchaBox.addEventListener('click', zhang_refreshCaptcha);
  document.getElementById('zhang_logout_btn').addEventListener('click', zhang_logout);

  // 注册成功跳转回来时自动填充用户名
  var zhang_query = new URLSearchParams(window.location.search);
  if (zhang_query.get('username')) {
    zhang_usernameInput.value = zhang_query.get('username');
  }

  zhang_refreshCaptcha();
  zhang_checkLogin();
})();
