/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

// 注册页：逐项表单校验、图形验证码、注册成功后跳转登录页
(function () {
  'use strict';

  var zhang_auth = window.zhang_auth;

  var zhang_form = document.getElementById('zhang_register_form');
  var zhang_alert = document.getElementById('zhang_register_alert');
  var zhang_submit = document.getElementById('zhang_register_submit');
  var zhang_captchaBox = document.getElementById('zhang_register_captcha_box');
  var zhang_captchaInput = document.getElementById('zhang_register_captcha');
  var zhang_captchaId = '';

  var zhang_USERNAME_RE = /^[A-Za-z][A-Za-z0-9_]{3,19}$/;
  var zhang_PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d)\S{8,20}$/;
  var zhang_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

  function zhang_input(zhang_id) {
    return document.getElementById(zhang_id);
  }

  function zhang_tip(zhang_id) {
    return document.getElementById(zhang_id);
  }

  function zhang_refreshCaptcha() {
    zhang_captchaInput.value = '';
    zhang_auth.loadCaptcha(zhang_captchaBox, function (zhang_id) {
      zhang_captchaId = zhang_id;
    });
  }

  // 前端逐项校验，与服务端规则保持一致
  function zhang_validate() {
    var zhang_ok = true;
    var zhang_username = zhang_input('zhang_register_username').value.trim();
    var zhang_nickname = zhang_input('zhang_register_nickname').value.trim();
    var zhang_email = zhang_input('zhang_register_email').value.trim();
    var zhang_password = zhang_input('zhang_register_password').value;
    var zhang_password2 = zhang_input('zhang_register_password2').value;
    var zhang_captcha = zhang_captchaInput.value.trim();

    zhang_auth.setTip(zhang_tip('zhang_register_username_tip'), '');
    zhang_auth.setTip(zhang_tip('zhang_register_nickname_tip'), '');
    zhang_auth.setTip(zhang_tip('zhang_register_email_tip'), '');
    zhang_auth.setTip(zhang_tip('zhang_register_password_tip'), '');
    zhang_auth.setTip(zhang_tip('zhang_register_password2_tip'), '');
    zhang_auth.setTip(zhang_tip('zhang_register_captcha_tip'), '');

    if (!zhang_username) {
      zhang_auth.setTip(zhang_tip('zhang_register_username_tip'), '请输入用户名');
      zhang_ok = false;
    } else if (!zhang_USERNAME_RE.test(zhang_username)) {
      zhang_auth.setTip(zhang_tip('zhang_register_username_tip'), '需以字母开头，4-20 位字母、数字或下划线');
      zhang_ok = false;
    }

    if (zhang_nickname.length < 2 || zhang_nickname.length > 20) {
      zhang_auth.setTip(zhang_tip('zhang_register_nickname_tip'), '昵称长度需为 2-20 个字符');
      zhang_ok = false;
    }

    if (zhang_email && !zhang_EMAIL_RE.test(zhang_email)) {
      zhang_auth.setTip(zhang_tip('zhang_register_email_tip'), '邮箱格式不正确');
      zhang_ok = false;
    }

    if (!zhang_PASSWORD_RE.test(zhang_password)) {
      zhang_auth.setTip(zhang_tip('zhang_register_password_tip'), '8-20 位，且同时包含字母和数字');
      zhang_ok = false;
    }

    if (zhang_password2 !== zhang_password) {
      zhang_auth.setTip(zhang_tip('zhang_register_password2_tip'), '两次输入的密码不一致');
      zhang_ok = false;
    }

    if (!/^[A-Za-z0-9]{4}$/.test(zhang_captcha)) {
      zhang_auth.setTip(zhang_tip('zhang_register_captcha_tip'), '请输入 4 位图形验证码');
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
    zhang_submit.textContent = '注册中…';

    var zhang_username = zhang_input('zhang_register_username').value.trim();

    zhang_auth
      .request('/api/auth/register', {
        method: 'POST',
        body: {
          username: zhang_username,
          nickname: zhang_input('zhang_register_nickname').value.trim(),
          email: zhang_input('zhang_register_email').value.trim(),
          password: zhang_input('zhang_register_password').value,
          password2: zhang_input('zhang_register_password2').value,
          captchaId: zhang_captchaId,
          captchaCode: zhang_captchaInput.value.trim()
        }
      })
      .then(function (zhang_data) {
        console.log('注册接口返回：', zhang_data);
        if (zhang_data.code === 0) {
          zhang_auth.showAlert(zhang_alert, true, zhang_data.msg + '，正在跳转登录页…');
          zhang_form.reset();
          setTimeout(function () {
            window.location.href = './login.html?username=' + encodeURIComponent(zhang_username);
          }, 1200);
        } else {
          zhang_auth.showAlert(zhang_alert, false, zhang_data.msg || '注册失败');
          zhang_refreshCaptcha();
          zhang_submit.disabled = false;
          zhang_submit.textContent = '注 册';
        }
      })
      .catch(function (zhang_err) {
        console.error('请求注册接口失败：', zhang_err);
        zhang_auth.showAlert(zhang_alert, false, '无法访问后端服务，请先启动 backend（端口 8115）');
        zhang_refreshCaptcha();
        zhang_submit.disabled = false;
        zhang_submit.textContent = '注 册';
      });
  }

  // 输入时清除对应错误提示，提升表单体验
  [
    ['zhang_register_username', 'zhang_register_username_tip'],
    ['zhang_register_nickname', 'zhang_register_nickname_tip'],
    ['zhang_register_email', 'zhang_register_email_tip'],
    ['zhang_register_password', 'zhang_register_password_tip'],
    ['zhang_register_password2', 'zhang_register_password2_tip'],
    ['zhang_register_captcha', 'zhang_register_captcha_tip']
  ].forEach(function (zhang_pair) {
    zhang_input(zhang_pair[0]).addEventListener('input', function () {
      zhang_auth.setTip(zhang_tip(zhang_pair[1]), '');
    });
  });

  zhang_form.addEventListener('submit', zhang_onSubmit);
  zhang_captchaBox.addEventListener('click', zhang_refreshCaptcha);
  zhang_refreshCaptcha();
})();
