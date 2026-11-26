/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

// 用户管理：列表 + 搜索 + 分页 + 详情 + 新增 / 编辑 / 删除
(function () {
  'use strict';

  var zhang_api = window.zhang_admin_api;
  var zhang_state = { page: 1, pageSize: 8, keyword: '', total: 0, list: [] };

  var zhang_tbody = document.getElementById('zhang_user_tbody');
  var zhang_pager = document.getElementById('zhang_user_pager');
  var zhang_pageinfo = document.getElementById('zhang_user_pageinfo');
  var zhang_searchInput = document.getElementById('zhang_user_search');

  function zhang_renderList() {
    if (!zhang_state.list.length) {
      zhang_tbody.innerHTML = '<tr><td colspan="7"><div class="zhang_admin_empty">没有找到符合条件的用户</div></td></tr>';
      return;
    }

    zhang_tbody.innerHTML = zhang_state.list
      .map(function (zhang_item) {
        return (
          '<tr>' +
          '<td class="zhang_admin_td_num">' + zhang_item.zhang_id + '</td>' +
          '<td>' + zhang_api.escapeHtml(zhang_item.zhang_username) + '</td>' +
          '<td>' + zhang_api.escapeHtml(zhang_item.zhang_nickname) + '</td>' +
          '<td>' + (zhang_item.zhang_email ? zhang_api.escapeHtml(zhang_item.zhang_email) : '未填写') + '</td>' +
          '<td>' + zhang_api.formatTime(zhang_item.zhang_create_time) + '</td>' +
          '<td>' + zhang_api.formatTime(zhang_item.zhang_last_login_time) + '</td>' +
          '<td class="zhang_admin_td_ops">' +
          '<button class="zhang_admin_btn zhang_admin_btn_ghost zhang_admin_btn_sm" type="button" data-zhang-act="detail" data-zhang-id="' + zhang_item.zhang_id + '">详情</button>' +
          '<button class="zhang_admin_btn zhang_admin_btn_ghost zhang_admin_btn_sm" type="button" data-zhang-act="edit" data-zhang-id="' + zhang_item.zhang_id + '">编辑</button>' +
          '<button class="zhang_admin_btn zhang_admin_btn_danger zhang_admin_btn_sm" type="button" data-zhang-act="delete" data-zhang-id="' + zhang_item.zhang_id + '">删除</button>' +
          '</td>' +
          '</tr>'
        );
      })
      .join('');
  }

  function zhang_renderPager() {
    var zhang_totalPages = Math.max(1, Math.ceil(zhang_state.total / zhang_state.pageSize));
    zhang_pageinfo.textContent =
      '共 ' + zhang_state.total + ' 条记录，第 ' + zhang_state.page + ' / ' + zhang_totalPages + ' 页';

    var zhang_btns = [];
    zhang_btns.push(
      '<button type="button" data-zhang-page="' + (zhang_state.page - 1) + '"' +
        (zhang_state.page <= 1 ? ' disabled' : '') + '>上一页</button>'
    );

    var zhang_start = Math.max(1, zhang_state.page - 2);
    var zhang_end = Math.min(zhang_totalPages, zhang_start + 4);
    zhang_start = Math.max(1, zhang_end - 4);
    for (var zhang_i = zhang_start; zhang_i <= zhang_end; zhang_i++) {
      zhang_btns.push(
        '<button type="button" data-zhang-page="' + zhang_i + '"' +
          (zhang_i === zhang_state.page ? ' class="zhang_admin_pager_on"' : '') + '>' + zhang_i + '</button>'
      );
    }

    zhang_btns.push(
      '<button type="button" data-zhang-page="' + (zhang_state.page + 1) + '"' +
        (zhang_state.page >= zhang_totalPages ? ' disabled' : '') + '>下一页</button>'
    );

    zhang_pager.innerHTML = zhang_btns.join('');
  }

  function zhang_loadList() {
    zhang_tbody.innerHTML = '<tr><td colspan="7"><div class="zhang_admin_empty">数据加载中…</div></td></tr>';
    var zhang_url =
      '/api/admin/users?page=' + zhang_state.page +
      '&pageSize=' + zhang_state.pageSize +
      '&keyword=' + encodeURIComponent(zhang_state.keyword);

    zhang_api
      .request(zhang_url)
      .then(function (zhang_data) {
        console.log('用户列表接口返回：', zhang_data);
        if (zhang_data.code !== 0 || !zhang_data.data) {
          zhang_api.toast(zhang_data.msg || '用户列表加载失败', 'error');
          zhang_tbody.innerHTML = '<tr><td colspan="7"><div class="zhang_admin_empty">加载失败，请稍后重试</div></td></tr>';
          return;
        }
        zhang_state.total = zhang_data.data.total;
        zhang_state.list = zhang_data.data.list || [];
        zhang_renderList();
        zhang_renderPager();
      })
      .catch(function (zhang_err) {
        console.error('加载用户列表失败：', zhang_err);
        zhang_api.toast('网络异常，用户列表加载失败', 'error');
      });
  }

  function zhang_openDetail(zhang_id) {
    zhang_api
      .request('/api/admin/users/' + zhang_id)
      .then(function (zhang_data) {
        console.log('用户详情接口返回：', zhang_data);
        if (zhang_data.code !== 0 || !zhang_data.data) {
          zhang_api.toast(zhang_data.msg || '用户详情加载失败', 'error');
          return;
        }
        var zhang_user = zhang_data.data.user;
        zhang_api.openModal({
          title: '用户详情 · #' + zhang_user.zhang_id,
          width: 560,
          content:
            '<div class="zhang_admin_detail_row"><span class="zhang_admin_detail_label">用户名</span><span class="zhang_admin_detail_value">' +
            zhang_api.escapeHtml(zhang_user.zhang_username) + '</span></div>' +
            '<div class="zhang_admin_detail_row"><span class="zhang_admin_detail_label">昵称</span><span class="zhang_admin_detail_value">' +
            zhang_api.escapeHtml(zhang_user.zhang_nickname) + '</span></div>' +
            '<div class="zhang_admin_detail_row"><span class="zhang_admin_detail_label">邮箱</span><span class="zhang_admin_detail_value">' +
            (zhang_user.zhang_email ? zhang_api.escapeHtml(zhang_user.zhang_email) : '未填写') + '</span></div>' +
            '<div class="zhang_admin_detail_row"><span class="zhang_admin_detail_label">注册时间</span><span class="zhang_admin_detail_value">' +
            zhang_api.formatTime(zhang_user.zhang_create_time) + '</span></div>' +
            '<div class="zhang_admin_detail_row"><span class="zhang_admin_detail_label">最近登录</span><span class="zhang_admin_detail_value">' +
            zhang_api.formatTime(zhang_user.zhang_last_login_time) + '</span></div>',
          footer: [{ text: '关闭', className: 'zhang_admin_btn zhang_admin_btn_ghost' }]
        });
      })
      .catch(function (zhang_err) {
        console.error('加载用户详情失败：', zhang_err);
        zhang_api.toast('网络异常，用户详情加载失败', 'error');
      });
  }

  function zhang_openForm(zhang_user) {
    var zhang_isEdit = Boolean(zhang_user);
    var zhang_item = zhang_user || { zhang_username: '', zhang_nickname: '', zhang_email: '' };

    zhang_api.openModal({
      title: zhang_isEdit ? '编辑用户 · #' + zhang_item.zhang_id : '新增用户',
      width: 560,
      content:
        '<div class="zhang_admin_form">' +
        '<div class="zhang_admin_form_item zhang_admin_form_full"><label class="zhang_admin_form_label">用户名<em>*</em></label>' +
        '<input id="zhang_user_username" type="text" maxlength="20" value="' + zhang_api.escapeHtml(zhang_item.zhang_username) + '" placeholder="字母开头，4-20 位字母 / 数字 / 下划线"' +
        (zhang_isEdit ? ' disabled' : '') + ' /></div>' +
        '<div class="zhang_admin_form_item"><label class="zhang_admin_form_label">昵称<em>*</em></label>' +
        '<input id="zhang_user_nickname" type="text" maxlength="20" value="' + zhang_api.escapeHtml(zhang_item.zhang_nickname) + '" placeholder="2-20 个字符" /></div>' +
        '<div class="zhang_admin_form_item"><label class="zhang_admin_form_label">邮箱</label>' +
        '<input id="zhang_user_email" type="email" maxlength="100" value="' + zhang_api.escapeHtml(zhang_item.zhang_email) + '" placeholder="选填" /></div>' +
        '<div class="zhang_admin_form_item zhang_admin_form_full"><label class="zhang_admin_form_label">' +
        (zhang_isEdit ? '重置密码（留空则不修改）' : '初始密码<em>*</em>') + '</label>' +
        '<input id="zhang_user_password" type="password" maxlength="20" placeholder="8-20 位，需同时包含字母和数字" autocomplete="new-password" /></div>' +
        '</div>' +
        '<p class="zhang_admin_form_tip" id="zhang_user_form_tip"></p>',
      footer: [
        { text: '取消', className: 'zhang_admin_btn zhang_admin_btn_ghost' },
        {
          text: zhang_isEdit ? '保存修改' : '确认新增',
          className: 'zhang_admin_btn',
          keepOpen: true,
          onClick: function () {
            zhang_submitForm(zhang_isEdit ? zhang_item.zhang_id : 0, zhang_isEdit);
          }
        }
      ]
    });
  }

  function zhang_formValue(zhang_id) {
    var zhang_el = document.getElementById(zhang_id);
    return zhang_el ? zhang_el.value : '';
  }

  function zhang_submitForm(zhang_id, zhang_isEdit) {
    var zhang_tip = document.getElementById('zhang_user_form_tip');
    var zhang_body = {
      nickname: zhang_formValue('zhang_user_nickname').trim(),
      email: zhang_formValue('zhang_user_email').trim(),
      password: zhang_formValue('zhang_user_password')
    };
    var zhang_username = zhang_formValue('zhang_user_username').trim();

    if (!zhang_isEdit) {
      zhang_body.username = zhang_username;
    }

    if (!zhang_body.nickname) {
      zhang_tip.textContent = '请填写昵称';
      zhang_tip.className = 'zhang_admin_form_tip zhang_admin_tip_err';
      return;
    }
    if (!zhang_isEdit && !zhang_username) {
      zhang_tip.textContent = '请填写用户名';
      zhang_tip.className = 'zhang_admin_form_tip zhang_admin_tip_err';
      return;
    }
    if (!zhang_isEdit && !zhang_body.password) {
      zhang_tip.textContent = '请填写初始密码';
      zhang_tip.className = 'zhang_admin_form_tip zhang_admin_tip_err';
      return;
    }

    zhang_tip.textContent = '正在保存…';
    zhang_tip.className = 'zhang_admin_form_tip';

    zhang_api
      .request(zhang_id ? '/api/admin/users/' + zhang_id : '/api/admin/users', {
        method: zhang_id ? 'PUT' : 'POST',
        body: zhang_body
      })
      .then(function (zhang_data) {
        console.log('保存用户接口返回：', zhang_data);
        if (zhang_data.code === 0) {
          zhang_api.closeModal();
          zhang_api.toast(zhang_data.msg || '保存成功', 'success');
          zhang_loadList();
        } else {
          zhang_tip.textContent = zhang_data.msg || '保存失败，请重试';
          zhang_tip.className = 'zhang_admin_form_tip zhang_admin_tip_err';
        }
      })
      .catch(function (zhang_err) {
        console.error('保存用户失败：', zhang_err);
        zhang_tip.textContent = '网络异常，保存失败';
        zhang_tip.className = 'zhang_admin_form_tip zhang_admin_tip_err';
      });
  }

  function zhang_handleDelete(zhang_id, zhang_username) {
    zhang_api
      .confirm('确定要删除用户 <b>「' + zhang_api.escapeHtml(zhang_username) + '」</b> 吗？删除后该用户将无法登录。', {
        title: '删除用户'
      })
      .then(function (zhang_ok) {
        if (!zhang_ok) {
          return;
        }
        zhang_api
          .request('/api/admin/users/' + zhang_id, { method: 'DELETE' })
          .then(function (zhang_data) {
            console.log('删除用户接口返回：', zhang_data);
            if (zhang_data.code === 0) {
              zhang_api.toast(zhang_data.msg || '删除成功', 'success');
              if (zhang_state.list.length === 1 && zhang_state.page > 1) {
                zhang_state.page -= 1;
              }
              zhang_loadList();
            } else {
              zhang_api.toast(zhang_data.msg || '删除失败', 'error');
            }
          })
          .catch(function (zhang_err) {
            console.error('删除用户失败：', zhang_err);
            zhang_api.toast('网络异常，删除失败', 'error');
          });
      });
  }

  zhang_tbody.addEventListener('click', function (zhang_event) {
    var zhang_btn = zhang_event.target.closest('button[data-zhang-act]');
    if (!zhang_btn) {
      return;
    }
    var zhang_id = Number(zhang_btn.getAttribute('data-zhang-id'));
    var zhang_act = zhang_btn.getAttribute('data-zhang-act');
    var zhang_row = zhang_state.list.filter(function (zhang_item) {
      return Number(zhang_item.zhang_id) === zhang_id;
    })[0];

    if (zhang_act === 'detail') {
      zhang_openDetail(zhang_id);
    } else if (zhang_act === 'edit' && zhang_row) {
      zhang_openForm(zhang_row);
    } else if (zhang_act === 'delete' && zhang_row) {
      zhang_handleDelete(zhang_id, zhang_row.zhang_username);
    }
  });

  zhang_pager.addEventListener('click', function (zhang_event) {
    var zhang_btn = zhang_event.target.closest('button[data-zhang-page]');
    if (!zhang_btn || zhang_btn.disabled) {
      return;
    }
    var zhang_next = Number(zhang_btn.getAttribute('data-zhang-page'));
    var zhang_totalPages = Math.max(1, Math.ceil(zhang_state.total / zhang_state.pageSize));
    if (zhang_next < 1 || zhang_next > zhang_totalPages || zhang_next === zhang_state.page) {
      return;
    }
    zhang_state.page = zhang_next;
    zhang_loadList();
  });

  document.getElementById('zhang_user_search_btn').addEventListener('click', function () {
    zhang_state.keyword = zhang_searchInput.value.trim();
    zhang_state.page = 1;
    zhang_loadList();
  });

  zhang_searchInput.addEventListener('keydown', function (zhang_event) {
    if (zhang_event.key === 'Enter') {
      zhang_state.keyword = zhang_searchInput.value.trim();
      zhang_state.page = 1;
      zhang_loadList();
    }
  });

  document.getElementById('zhang_user_reset_btn').addEventListener('click', function () {
    zhang_searchInput.value = '';
    zhang_state.keyword = '';
    zhang_state.page = 1;
    zhang_loadList();
  });

  document.getElementById('zhang_user_add_btn').addEventListener('click', function () {
    zhang_openForm(null);
  });

  zhang_loadList();
})();
