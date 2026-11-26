/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

// 管理后台公共工具：令牌存储、接口请求、自定义 toast、模态框、格式化
(function () {
  'use strict';

  var zhang_TOKEN_KEY = 'zhang_admin_token';
  var zhang_ADMIN_KEY = 'zhang_admin_user';

  function zhang_getToken() {
    return localStorage.getItem(zhang_TOKEN_KEY) || '';
  }

  function zhang_getAdmin() {
    try {
      return JSON.parse(localStorage.getItem(zhang_ADMIN_KEY) || 'null');
    } catch (zhang_err) {
      return null;
    }
  }

  function zhang_saveAuth(zhang_token, zhang_admin) {
    localStorage.setItem(zhang_TOKEN_KEY, zhang_token);
    localStorage.setItem(zhang_ADMIN_KEY, JSON.stringify(zhang_admin));
  }

  function zhang_clearAuth() {
    localStorage.removeItem(zhang_TOKEN_KEY);
    localStorage.removeItem(zhang_ADMIN_KEY);
  }

  // 是否处于登录页（避免登录页被重定向循环）
  function zhang_isLoginPage() {
    return /zhang_admin_login\.html|login\.html$/i.test(location.pathname);
  }

  // 统一请求：自动携带管理员 Bearer 令牌；401 时清理登录态并跳转登录页
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
    })
      .then(function (zhang_res) {
        return zhang_res.json();
      })
      .then(function (zhang_data) {
        if (zhang_data && zhang_data.code === 401) {
          zhang_clearAuth();
          if (!zhang_isLoginPage() && !zhang_opts.noRedirect) {
            location.replace('./login.html');
          }
        }
        return zhang_data;
      });
  }

  // 自定义提示：右上角浮层，2.6 秒后自动消失
  function zhang_toast(zhang_message, zhang_type) {
    var zhang_box = document.getElementById('zhang_admin_toast_box');
    if (!zhang_box) {
      zhang_box = document.createElement('div');
      zhang_box.className = 'zhang_admin_toast_box';
      zhang_box.id = 'zhang_admin_toast_box';
      document.body.appendChild(zhang_box);
    }

    var zhang_item = document.createElement('div');
    zhang_item.className = 'zhang_admin_toast ' + (zhang_type === 'error' ? 'zhang_admin_toast_err' : 'zhang_admin_toast_ok');
    zhang_item.innerHTML =
      '<span class="zhang_admin_toast_icon">' + (zhang_type === 'error' ? '✕' : '✓') + '</span>' +
      '<span class="zhang_admin_toast_text"></span>';
    zhang_item.querySelector('.zhang_admin_toast_text').textContent = zhang_message;
    zhang_box.appendChild(zhang_item);

    setTimeout(function () {
      if (zhang_item.parentNode) {
        zhang_item.parentNode.removeChild(zhang_item);
      }
    }, 2600);
  }

  // 关闭当前模态框
  function zhang_closeModal() {
    var zhang_mask = document.querySelector('.zhang_admin_mask');
    if (zhang_mask && zhang_mask.parentNode) {
      var zhang_onClose = zhang_mask.zhang_onClose;
      zhang_mask.parentNode.removeChild(zhang_mask);
      if (typeof zhang_onClose === 'function') {
        zhang_onClose();
      }
    }
  }

  // 自定义模态框：config = { title, content, width, footer: [{text, className, onClick, keepOpen}], onClose }
  function zhang_openModal(zhang_config) {
    zhang_closeModal();

    var zhang_mask = document.createElement('div');
    zhang_mask.className = 'zhang_admin_mask';

    var zhang_dialog = document.createElement('div');
    zhang_dialog.className = 'zhang_admin_dialog';
    if (zhang_config.width) {
      zhang_dialog.style.width = zhang_config.width + 'px';
    }

    var zhang_head = document.createElement('div');
    zhang_head.className = 'zhang_admin_dialog_head';
    zhang_head.innerHTML = '<h3></h3><button class="zhang_admin_dialog_close" type="button" title="关闭">×</button>';
    zhang_head.querySelector('h3').textContent = zhang_config.title || '提示';

    var zhang_body = document.createElement('div');
    zhang_body.className = 'zhang_admin_dialog_body';
    if (typeof zhang_config.content === 'string') {
      zhang_body.innerHTML = zhang_config.content;
    } else if (zhang_config.content) {
      zhang_body.appendChild(zhang_config.content);
    }

    zhang_dialog.appendChild(zhang_head);
    zhang_dialog.appendChild(zhang_body);

    var zhang_api = {
      close: zhang_closeModal,
      dialog: zhang_dialog,
      body: zhang_body,
      mask: zhang_mask
    };

    if (zhang_config.footer && zhang_config.footer.length) {
      var zhang_foot = document.createElement('div');
      zhang_foot.className = 'zhang_admin_dialog_foot';
      zhang_config.footer.forEach(function (zhang_btnConfig) {
        var zhang_btn = document.createElement('button');
        zhang_btn.type = 'button';
        zhang_btn.className = zhang_btnConfig.className || 'zhang_admin_btn';
        zhang_btn.textContent = zhang_btnConfig.text || '确定';
        zhang_btn.addEventListener('click', function () {
          if (typeof zhang_btnConfig.onClick === 'function') {
            zhang_btnConfig.onClick(zhang_api);
          }
          if (!zhang_btnConfig.keepOpen) {
            zhang_closeModal();
          }
        });
        zhang_foot.appendChild(zhang_btn);
      });
      zhang_dialog.appendChild(zhang_foot);
    }

    zhang_mask.appendChild(zhang_dialog);
    zhang_mask.zhang_onClose = zhang_config.onClose;

    zhang_head.querySelector('.zhang_admin_dialog_close').addEventListener('click', function () {
      zhang_closeModal();
    });
    zhang_mask.addEventListener('click', function (zhang_event) {
      if (zhang_event.target === zhang_mask) {
        zhang_closeModal();
      }
    });
    document.addEventListener('keydown', zhang_onEsc);

    function zhang_onEsc(zhang_event) {
      if (zhang_event.key === 'Escape') {
        document.removeEventListener('keydown', zhang_onEsc);
        zhang_closeModal();
      }
    }

    document.body.appendChild(zhang_mask);
    return zhang_api;
  }

  // 自定义确认框（替代原生 confirm），返回 Promise<boolean>
  function zhang_confirm(zhang_message, zhang_options) {
    var zhang_opts = zhang_options || {};
    return new Promise(function (zhang_resolve) {
      var zhang_settled = false;
      function zhang_done(zhang_value) {
        if (!zhang_settled) {
          zhang_settled = true;
          zhang_resolve(zhang_value);
        }
      }

      zhang_openModal({
        title: zhang_opts.title || '操作确认',
        width: 430,
        content: '<p class="zhang_admin_confirm_text">' + zhang_message + '</p>',
        footer: [
          {
            text: '取消',
            className: 'zhang_admin_btn zhang_admin_btn_ghost',
            onClick: function () {
              zhang_done(false);
            }
          },
          {
            text: zhang_opts.okText || '确定删除',
            className: 'zhang_admin_btn zhang_admin_btn_danger',
            onClick: function () {
              zhang_done(true);
            }
          }
        ],
        onClose: function () {
          zhang_done(false);
        }
      });
    });
  }

  function zhang_escapeHtml(zhang_value) {
    return String(zhang_value === null || zhang_value === undefined ? '' : zhang_value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

  // datetime-local 输入框需要的 YYYY-MM-DDTHH:mm
  function zhang_toInputTime(zhang_value) {
    var zhang_date = zhang_value ? new Date(zhang_value) : new Date();
    if (isNaN(zhang_date.getTime())) {
      zhang_date = new Date();
    }
    function zhang_pad(zhang_num) {
      return zhang_num < 10 ? '0' + zhang_num : String(zhang_num);
    }
    return (
      zhang_date.getFullYear() + '-' + zhang_pad(zhang_date.getMonth() + 1) + '-' + zhang_pad(zhang_date.getDate()) +
      'T' + zhang_pad(zhang_date.getHours()) + ':' + zhang_pad(zhang_date.getMinutes())
    );
  }

  function zhang_formatNumber(zhang_value) {
    var zhang_num = Number(zhang_value || 0);
    return zhang_num.toLocaleString('zh-CN');
  }

  window.zhang_admin_api = {
    getToken: zhang_getToken,
    getAdmin: zhang_getAdmin,
    saveAuth: zhang_saveAuth,
    clearAuth: zhang_clearAuth,
    request: zhang_request,
    toast: zhang_toast,
    confirm: zhang_confirm,
    openModal: zhang_openModal,
    closeModal: zhang_closeModal,
    escapeHtml: zhang_escapeHtml,
    formatTime: zhang_formatTime,
    toInputTime: zhang_toInputTime,
    formatNumber: zhang_formatNumber
  };
})();
