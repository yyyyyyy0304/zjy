/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

// 管理员登录页：图形验证码、表单校验、自定义提示
(function () {
  'use strict';

  var zhang_api = window.zhang_admin_api;
  var zhang_form = document.getElementById('zhang_admin_login_form');
  var zhang_username = document.getElementById('zhang_admin_username');
  var zhang_password = document.getElementById('zhang_admin_password');
  var zhang_captcha = document.getElementById('zhang_admin_captcha');
  var zhang_captchaBox = document.getElementById('zhang_admin_login_captcha_box');
  var zhang_alert = document.getElementById('zhang_admin_login_alert');
  var zhang_submit = document.getElementById('zhang_admin_login_submit');
  var zhang_captchaId = '';

  function zhang_showAlert(zhang_isOk, zhang_message) {
    zhang_alert.hidden = false;
    zhang_alert.className = 'zhang_admin_alert ' + (zhang_isOk ? 'zhang_admin_alert_ok' : 'zhang_admin_alert_err');
    zhang_alert.querySelector('.zhang_admin_alert_icon').textContent = zhang_isOk ? '✓' : '!';
    zhang_alert.querySelector('.zhang_admin_alert_text').textContent = zhang_message;
  }

  // 加载图形验证码
  function zhang_loadCaptcha() {
    zhang_captchaBox.innerHTML = '加载中…';
    zhang_api
      .request('/api/auth/captcha')
      .then(function (zhang_data) {
        console.log('管理员登录页获取验证码返回：', zhang_data);
        if (zhang_data.code === 0 && zhang_data.data) {
          zhang_captchaBox.innerHTML = zhang_data.data.svg;
          zhang_captchaId = zhang_data.data.captchaId;
        } else {
          zhang_captchaBox.textContent = '加载失败，点击重试';
          zhang_captchaId = '';
        }
      })
      .catch(function (zhang_err) {
        console.error('获取验证码失败：', zhang_err);
        zhang_captchaBox.textContent = '加载失败，点击重试';
        zhang_captchaId = '';
      });
  }

  zhang_captchaBox.addEventListener('click', zhang_loadCaptcha);

  zhang_form.addEventListener('submit', function (zhang_event) {
    zhang_event.preventDefault();

    var zhang_name = zhang_username.value.trim();
    var zhang_pwd = zhang_password.value;
    var zhang_code = zhang_captcha.value.trim();

    if (!zhang_name) {
      zhang_showAlert(false, '请输入管理员用户名');
      zhang_username.focus();
      return;
    }
    if (!zhang_pwd) {
      zhang_showAlert(false, '请输入管理员密码');
      zhang_password.focus();
      return;
    }
    if (!zhang_code) {
      zhang_showAlert(false, '请输入图形验证码');
      zhang_captcha.focus();
      return;
    }
    if (!zhang_captchaId) {
      zhang_showAlert(false, '验证码未加载成功，请点击验证码区域刷新');
      return;
    }

    zhang_submit.disabled = true;
    zhang_submit.textContent = '登录中…';

    zhang_api
      .request('/api/admin/login', {
        method: 'POST',
        body: {
          username: zhang_name,
          password: zhang_pwd,
          captchaId: zhang_captchaId,
          captchaCode: zhang_code
        }
      })
      .then(function (zhang_data) {
        console.log('管理员登录接口返回：', zhang_data);
        if (zhang_data.code === 0 && zhang_data.data) {
          zhang_api.saveAuth(zhang_data.data.token, zhang_data.data.admin);
          zhang_showAlert(true, '登录成功，正在进入管理后台…');
          zhang_api.toast('登录成功，欢迎回来', 'success');
          setTimeout(function () {
            location.href = './index.html';
          }, 500);
        } else {
          zhang_showAlert(false, zhang_data.msg || '登录失败，请重试');
          zhang_api.toast(zhang_data.msg || '登录失败，请重试', 'error');
          zhang_captcha.value = '';
          zhang_loadCaptcha();
          zhang_submit.disabled = false;
          zhang_submit.textContent = '登 录';
        }
      })
      .catch(function (zhang_err) {
        console.error('管理员登录失败：', zhang_err);
        zhang_showAlert(false, '网络异常，请确认后端服务已启动后重试');
        zhang_api.toast('网络异常，请稍后重试', 'error');
        zhang_submit.disabled = false;
        zhang_submit.textContent = '登 录';
      });
  });

  zhang_loadCaptcha();
})();
