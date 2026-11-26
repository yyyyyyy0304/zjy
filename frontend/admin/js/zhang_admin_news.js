/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

// 新闻管理：列表 + 搜索 + 分页 + 详情 + 新增 / 编辑 / 删除
(function () {
  'use strict';

  var zhang_api = window.zhang_admin_api;
  var zhang_state = { page: 1, pageSize: 8, keyword: '', total: 0, list: [] };

  var zhang_tbody = document.getElementById('zhang_news_tbody');
  var zhang_pager = document.getElementById('zhang_news_pager');
  var zhang_pageinfo = document.getElementById('zhang_news_pageinfo');
  var zhang_searchInput = document.getElementById('zhang_news_search');

  function zhang_renderList() {
    if (!zhang_state.list.length) {
      zhang_tbody.innerHTML = '<tr><td colspan="8"><div class="zhang_admin_empty">没有找到符合条件的新闻</div></td></tr>';
      return;
    }

    zhang_tbody.innerHTML = zhang_state.list
      .map(function (zhang_item) {
        return (
          '<tr>' +
          '<td class="zhang_admin_td_num">' + zhang_item.zhang_id + '</td>' +
          '<td class="zhang_admin_td_title" title="' + zhang_api.escapeHtml(zhang_item.zhang_title) + '">' +
          zhang_api.escapeHtml(zhang_item.zhang_title) + '</td>' +
          '<td><span class="zhang_admin_badge">' + zhang_api.escapeHtml(zhang_item.zhang_category) + '</span></td>' +
          '<td>' + zhang_api.escapeHtml(zhang_item.zhang_source) + '</td>' +
          '<td>' + zhang_api.escapeHtml(zhang_item.zhang_author) + '</td>' +
          '<td class="zhang_admin_td_num">' + zhang_api.formatNumber(zhang_item.zhang_views) + '</td>' +
          '<td>' + zhang_api.formatTime(zhang_item.zhang_publish_time) + '</td>' +
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
    zhang_tbody.innerHTML = '<tr><td colspan="8"><div class="zhang_admin_empty">数据加载中…</div></td></tr>';
    var zhang_url =
      '/api/admin/news?page=' + zhang_state.page +
      '&pageSize=' + zhang_state.pageSize +
      '&keyword=' + encodeURIComponent(zhang_state.keyword);

    zhang_api
      .request(zhang_url)
      .then(function (zhang_data) {
        console.log('新闻列表接口返回：', zhang_data);
        if (zhang_data.code !== 0 || !zhang_data.data) {
          zhang_api.toast(zhang_data.msg || '新闻列表加载失败', 'error');
          zhang_tbody.innerHTML = '<tr><td colspan="8"><div class="zhang_admin_empty">加载失败，请稍后重试</div></td></tr>';
          return;
        }
        zhang_state.total = zhang_data.data.total;
        zhang_state.list = zhang_data.data.list || [];
        zhang_renderList();
        zhang_renderPager();
      })
      .catch(function (zhang_err) {
        console.error('加载新闻列表失败：', zhang_err);
        zhang_api.toast('网络异常，新闻列表加载失败', 'error');
      });
  }

  function zhang_openDetail(zhang_id) {
    zhang_api
      .request('/api/admin/news/' + zhang_id)
      .then(function (zhang_data) {
        console.log('新闻详情接口返回：', zhang_data);
        if (zhang_data.code !== 0 || !zhang_data.data) {
          zhang_api.toast(zhang_data.msg || '新闻详情加载失败', 'error');
          return;
        }
        var zhang_news = zhang_data.data.news;
        zhang_api.openModal({
          title: '新闻详情 · #' + zhang_news.zhang_id,
          width: 680,
          content:
            '<div class="zhang_admin_detail_row"><span class="zhang_admin_detail_label">标题</span><span class="zhang_admin_detail_value">' +
            zhang_api.escapeHtml(zhang_news.zhang_title) + '</span></div>' +
            '<div class="zhang_admin_detail_row"><span class="zhang_admin_detail_label">分类</span><span class="zhang_admin_detail_value"><span class="zhang_admin_badge">' +
            zhang_api.escapeHtml(zhang_news.zhang_category) + '</span></span></div>' +
            '<div class="zhang_admin_detail_row"><span class="zhang_admin_detail_label">摘要</span><span class="zhang_admin_detail_value">' +
            zhang_api.escapeHtml(zhang_news.zhang_summary) + '</span></div>' +
            '<div class="zhang_admin_detail_row"><span class="zhang_admin_detail_label">正文</span><span class="zhang_admin_detail_value">' +
            zhang_api.escapeHtml(zhang_news.zhang_content) + '</span></div>' +
            '<div class="zhang_admin_detail_row"><span class="zhang_admin_detail_label">来源 / 作者</span><span class="zhang_admin_detail_value">' +
            zhang_api.escapeHtml(zhang_news.zhang_source) + ' · ' + zhang_api.escapeHtml(zhang_news.zhang_author) + '</span></div>' +
            '<div class="zhang_admin_detail_row"><span class="zhang_admin_detail_label">浏览量</span><span class="zhang_admin_detail_value">' +
            zhang_api.formatNumber(zhang_news.zhang_views) + '</span></div>' +
            '<div class="zhang_admin_detail_row"><span class="zhang_admin_detail_label">发布时间</span><span class="zhang_admin_detail_value">' +
            zhang_api.formatTime(zhang_news.zhang_publish_time) + '</span></div>' +
            '<div class="zhang_admin_detail_row"><span class="zhang_admin_detail_label">创建时间</span><span class="zhang_admin_detail_value">' +
            zhang_api.formatTime(zhang_news.zhang_create_time) + '</span></div>',
          footer: [{ text: '关闭', className: 'zhang_admin_btn zhang_admin_btn_ghost' }]
        });
      })
      .catch(function (zhang_err) {
        console.error('加载新闻详情失败：', zhang_err);
        zhang_api.toast('网络异常，新闻详情加载失败', 'error');
      });
  }

  function zhang_openEdit(zhang_id) {
    zhang_api
      .request('/api/admin/news/' + zhang_id)
      .then(function (zhang_data) {
        console.log('编辑前获取新闻详情：', zhang_data);
        if (zhang_data.code !== 0 || !zhang_data.data) {
          zhang_api.toast(zhang_data.msg || '新闻详情加载失败', 'error');
          return;
        }
        zhang_openForm(zhang_data.data.news);
      })
      .catch(function (zhang_err) {
        console.error('编辑前加载新闻详情失败：', zhang_err);
        zhang_api.toast('网络异常，新闻详情加载失败', 'error');
      });
  }

  function zhang_openForm(zhang_news) {
    var zhang_isEdit = Boolean(zhang_news);
    var zhang_item = zhang_news || {
      zhang_title: '',
      zhang_category: '',
      zhang_summary: '',
      zhang_content: '',
      zhang_source: '',
      zhang_author: '',
      zhang_views: 0,
      zhang_publish_time: ''
    };

    var zhang_api2 = zhang_api.openModal({
      title: zhang_isEdit ? '编辑新闻 · #' + zhang_item.zhang_id : '新增新闻',
      width: 720,
      content:
        '<div class="zhang_admin_form">' +
        '<div class="zhang_admin_form_item zhang_admin_form_full"><label class="zhang_admin_form_label">标题<em>*</em></label>' +
        '<input id="zhang_form_title" type="text" maxlength="200" value="' + zhang_api.escapeHtml(zhang_item.zhang_title) + '" placeholder="请输入新闻标题" /></div>' +
        '<div class="zhang_admin_form_item"><label class="zhang_admin_form_label">分类<em>*</em></label>' +
        '<input id="zhang_form_category" type="text" maxlength="50" list="zhang_news_category_list" value="' + zhang_api.escapeHtml(zhang_item.zhang_category) + '" placeholder="如：人工智能" />' +
        '<datalist id="zhang_news_category_list"><option value="人工智能"></option><option value="芯片"></option><option value="量子计算"></option><option value="软件工程"></option><option value="智能驾驶"></option><option value="云计算"></option><option value="智能制造"></option></datalist></div>' +
        '<div class="zhang_admin_form_item"><label class="zhang_admin_form_label">来源<em>*</em></label>' +
        '<input id="zhang_form_source" type="text" maxlength="100" value="' + zhang_api.escapeHtml(zhang_item.zhang_source) + '" placeholder="如：科技日报" /></div>' +
        '<div class="zhang_admin_form_item"><label class="zhang_admin_form_label">作者<em>*</em></label>' +
        '<input id="zhang_form_author" type="text" maxlength="50" value="' + zhang_api.escapeHtml(zhang_item.zhang_author) + '" placeholder="请输入作者" /></div>' +
        '<div class="zhang_admin_form_item"><label class="zhang_admin_form_label">浏览量</label>' +
        '<input id="zhang_form_views" type="number" min="0" step="1" value="' + Number(zhang_item.zhang_views || 0) + '" /></div>' +
        '<div class="zhang_admin_form_item zhang_admin_form_full"><label class="zhang_admin_form_label">发布时间</label>' +
        '<input id="zhang_form_publish" type="datetime-local" value="' + zhang_api.toInputTime(zhang_item.zhang_publish_time) + '" /></div>' +
        '<div class="zhang_admin_form_item zhang_admin_form_full"><label class="zhang_admin_form_label">摘要<em>*</em></label>' +
        '<textarea id="zhang_form_summary" maxlength="500" placeholder="请输入新闻摘要（不超过 500 字）">' + zhang_api.escapeHtml(zhang_item.zhang_summary) + '</textarea></div>' +
        '<div class="zhang_admin_form_item zhang_admin_form_full"><label class="zhang_admin_form_label">正文<em>*</em></label>' +
        '<textarea id="zhang_form_content" style="min-height: 120px;" placeholder="请输入新闻正文">' + zhang_api.escapeHtml(zhang_item.zhang_content) + '</textarea></div>' +
        '</div>' +
        '<p class="zhang_admin_form_tip" id="zhang_news_form_tip"></p>',
      footer: [
        { text: '取消', className: 'zhang_admin_btn zhang_admin_btn_ghost' },
        {
          text: zhang_isEdit ? '保存修改' : '确认新增',
          className: 'zhang_admin_btn',
          keepOpen: true,
          onClick: function (zhang_modal) {
            zhang_submitForm(zhang_modal, zhang_isEdit ? zhang_item.zhang_id : 0);
          }
        }
      ]
    });

    setTimeout(function () {
      var zhang_titleInput = document.getElementById('zhang_form_title');
      if (zhang_titleInput) {
        zhang_titleInput.focus();
      }
    }, 50);
    return zhang_api2;
  }

  function zhang_formValue(zhang_id) {
    var zhang_el = document.getElementById(zhang_id);
    return zhang_el ? zhang_el.value : '';
  }

  function zhang_submitForm(zhang_modal, zhang_id) {
    var zhang_tip = document.getElementById('zhang_news_form_tip');
    var zhang_body = {
      title: zhang_formValue('zhang_form_title').trim(),
      category: zhang_formValue('zhang_form_category').trim(),
      source: zhang_formValue('zhang_form_source').trim(),
      author: zhang_formValue('zhang_form_author').trim(),
      views: zhang_formValue('zhang_form_views'),
      publishTime: zhang_formValue('zhang_form_publish'),
      summary: zhang_formValue('zhang_form_summary').trim(),
      content: zhang_formValue('zhang_form_content').trim()
    };

    if (!zhang_body.title || !zhang_body.category || !zhang_body.source || !zhang_body.author || !zhang_body.summary || !zhang_body.content) {
      zhang_tip.textContent = '带 * 的字段均为必填项，请完整填写';
      zhang_tip.className = 'zhang_admin_form_tip zhang_admin_tip_err';
      return;
    }

    zhang_tip.textContent = '正在保存…';
    zhang_tip.className = 'zhang_admin_form_tip';

    var zhang_url = zhang_id ? '/api/admin/news/' + zhang_id : '/api/admin/news';
    var zhang_method = zhang_id ? 'PUT' : 'POST';

    zhang_api
      .request(zhang_url, { method: zhang_method, body: zhang_body })
      .then(function (zhang_data) {
        console.log('保存新闻接口返回：', zhang_data);
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
        console.error('保存新闻失败：', zhang_err);
        zhang_tip.textContent = '网络异常，保存失败';
        zhang_tip.className = 'zhang_admin_form_tip zhang_admin_tip_err';
      });
  }

  function zhang_handleDelete(zhang_id, zhang_title) {
    zhang_api
      .confirm('确定要删除新闻 <b>「' + zhang_api.escapeHtml(zhang_title) + '」</b> 吗？删除后不可恢复。', {
        title: '删除新闻'
      })
      .then(function (zhang_ok) {
        if (!zhang_ok) {
          return;
        }
        zhang_api
          .request('/api/admin/news/' + zhang_id, { method: 'DELETE' })
          .then(function (zhang_data) {
            console.log('删除新闻接口返回：', zhang_data);
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
            console.error('删除新闻失败：', zhang_err);
            zhang_api.toast('网络异常，删除失败', 'error');
          });
      });
  }

  // 表格操作按钮事件委托
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
      zhang_openEdit(zhang_id);
    } else if (zhang_act === 'delete' && zhang_row) {
      zhang_handleDelete(zhang_id, zhang_row.zhang_title);
    }
  });

  // 分页按钮
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

  document.getElementById('zhang_news_search_btn').addEventListener('click', function () {
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

  document.getElementById('zhang_news_reset_btn').addEventListener('click', function () {
    zhang_searchInput.value = '';
    zhang_state.keyword = '';
    zhang_state.page = 1;
    zhang_loadList();
  });

  document.getElementById('zhang_news_add_btn').addEventListener('click', function () {
    zhang_openForm(null);
  });

  zhang_loadList();
})();
