/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

// 农产品管理：列表 + 搜索 + 分页 + 详情 + 新增 / 编辑 / 删除
(function () {
  'use strict';

  var zhang_api = window.zhang_admin_api;
  var zhang_state = { page: 1, pageSize: 8, keyword: '', total: 0, list: [] };

  var zhang_tbody = document.getElementById('zhang_produce_tbody');
  var zhang_pager = document.getElementById('zhang_produce_pager');
  var zhang_pageinfo = document.getElementById('zhang_produce_pageinfo');
  var zhang_searchInput = document.getElementById('zhang_produce_search');

  function zhang_priceText(zhang_item) {
    return '¥' + Number(zhang_item.zhang_price).toFixed(2) + ' / ' + zhang_api.escapeHtml(zhang_item.zhang_unit);
  }

  function zhang_renderList() {
    if (!zhang_state.list.length) {
      zhang_tbody.innerHTML = '<tr><td colspan="8"><div class="zhang_admin_empty">没有找到符合条件的农产品</div></td></tr>';
      return;
    }

    zhang_tbody.innerHTML = zhang_state.list
      .map(function (zhang_item) {
        var zhang_img = zhang_item.zhang_image
          ? '<img class="zhang_admin_thumb" src="' + zhang_api.escapeHtml(zhang_item.zhang_image) + '" alt="' + zhang_api.escapeHtml(zhang_item.zhang_name) + '" />'
          : '<span class="zhang_admin_badge">无图</span>';
        return (
          '<tr>' +
          '<td class="zhang_admin_td_num">' + zhang_item.zhang_id + '</td>' +
          '<td>' + zhang_img + '</td>' +
          '<td class="zhang_admin_td_title" title="' + zhang_api.escapeHtml(zhang_item.zhang_desc) + '">' +
          zhang_api.escapeHtml(zhang_item.zhang_name) + '</td>' +
          '<td><span class="zhang_admin_badge">' + zhang_api.escapeHtml(zhang_item.zhang_category) + '</span></td>' +
          '<td>' + zhang_priceText(zhang_item) + '</td>' +
          '<td>' + zhang_api.escapeHtml(zhang_item.zhang_origin) + '</td>' +
          '<td class="zhang_admin_td_num">' + zhang_api.formatNumber(zhang_item.zhang_stock) + '</td>' +
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
      '/api/admin/produce?page=' + zhang_state.page +
      '&pageSize=' + zhang_state.pageSize +
      '&keyword=' + encodeURIComponent(zhang_state.keyword);

    zhang_api
      .request(zhang_url)
      .then(function (zhang_data) {
        console.log('农产品列表接口返回：', zhang_data);
        if (zhang_data.code !== 0 || !zhang_data.data) {
          zhang_api.toast(zhang_data.msg || '农产品列表加载失败', 'error');
          zhang_tbody.innerHTML = '<tr><td colspan="8"><div class="zhang_admin_empty">加载失败，请稍后重试</div></td></tr>';
          return;
        }
        zhang_state.total = zhang_data.data.total;
        zhang_state.list = zhang_data.data.list || [];
        zhang_renderList();
        zhang_renderPager();
      })
      .catch(function (zhang_err) {
        console.error('加载农产品列表失败：', zhang_err);
        zhang_api.toast('网络异常，农产品列表加载失败', 'error');
      });
  }

  function zhang_openDetail(zhang_id) {
    zhang_api
      .request('/api/admin/produce/' + zhang_id)
      .then(function (zhang_data) {
        console.log('农产品详情接口返回：', zhang_data);
        if (zhang_data.code !== 0 || !zhang_data.data) {
          zhang_api.toast(zhang_data.msg || '农产品详情加载失败', 'error');
          return;
        }
        var zhang_item = zhang_data.data.produce;
        zhang_api.openModal({
          title: '农产品详情 · #' + zhang_item.zhang_id,
          width: 620,
          content:
            (zhang_item.zhang_image
              ? '<img class="zhang_admin_detail_img" src="' + zhang_api.escapeHtml(zhang_item.zhang_image) + '" alt="' + zhang_api.escapeHtml(zhang_item.zhang_name) + '" />'
              : '') +
            '<div class="zhang_admin_detail_row"><span class="zhang_admin_detail_label">名称</span><span class="zhang_admin_detail_value">' +
            zhang_api.escapeHtml(zhang_item.zhang_name) + '</span></div>' +
            '<div class="zhang_admin_detail_row"><span class="zhang_admin_detail_label">分类</span><span class="zhang_admin_detail_value"><span class="zhang_admin_badge">' +
            zhang_api.escapeHtml(zhang_item.zhang_category) + '</span></span></div>' +
            '<div class="zhang_admin_detail_row"><span class="zhang_admin_detail_label">价格</span><span class="zhang_admin_detail_value">' +
            zhang_priceText(zhang_item) + '</span></div>' +
            '<div class="zhang_admin_detail_row"><span class="zhang_admin_detail_label">产地</span><span class="zhang_admin_detail_value">' +
            zhang_api.escapeHtml(zhang_item.zhang_origin) + '</span></div>' +
            '<div class="zhang_admin_detail_row"><span class="zhang_admin_detail_label">库存</span><span class="zhang_admin_detail_value">' +
            zhang_api.formatNumber(zhang_item.zhang_stock) + ' ' + zhang_api.escapeHtml(zhang_item.zhang_unit) + '</span></div>' +
            '<div class="zhang_admin_detail_row"><span class="zhang_admin_detail_label">描述</span><span class="zhang_admin_detail_value">' +
            zhang_api.escapeHtml(zhang_item.zhang_desc) + '</span></div>' +
            '<div class="zhang_admin_detail_row"><span class="zhang_admin_detail_label">创建时间</span><span class="zhang_admin_detail_value">' +
            zhang_api.formatTime(zhang_item.zhang_create_time) + '</span></div>',
          footer: [{ text: '关闭', className: 'zhang_admin_btn zhang_admin_btn_ghost' }]
        });
      })
      .catch(function (zhang_err) {
        console.error('加载农产品详情失败：', zhang_err);
        zhang_api.toast('网络异常，农产品详情加载失败', 'error');
      });
  }

  function zhang_openForm(zhang_produce) {
    var zhang_isEdit = Boolean(zhang_produce);
    var zhang_item = zhang_produce || {
      zhang_name: '',
      zhang_category: '',
      zhang_price: '',
      zhang_unit: '斤',
      zhang_origin: '',
      zhang_desc: '',
      zhang_image: '',
      zhang_stock: 0
    };

    zhang_api.openModal({
      title: zhang_isEdit ? '编辑农产品 · #' + zhang_item.zhang_id : '新增农产品',
      width: 700,
      content:
        '<div class="zhang_admin_form">' +
        '<div class="zhang_admin_form_item"><label class="zhang_admin_form_label">名称<em>*</em></label>' +
        '<input id="zhang_produce_name" type="text" maxlength="100" value="' + zhang_api.escapeHtml(zhang_item.zhang_name) + '" placeholder="如：有机番茄" /></div>' +
        '<div class="zhang_admin_form_item"><label class="zhang_admin_form_label">分类<em>*</em></label>' +
        '<input id="zhang_produce_category" type="text" maxlength="50" list="zhang_produce_category_list" value="' + zhang_api.escapeHtml(zhang_item.zhang_category) + '" placeholder="如：时令蔬菜" />' +
        '<datalist id="zhang_produce_category_list"><option value="时令蔬菜"></option><option value="时令水果"></option><option value="禽蛋水产"></option><option value="山珍干货"></option><option value="粮油米面"></option></datalist></div>' +
        '<div class="zhang_admin_form_item"><label class="zhang_admin_form_label">单价（元）<em>*</em></label>' +
        '<input id="zhang_produce_price" type="number" min="0" step="0.01" value="' + (zhang_item.zhang_price === null || zhang_item.zhang_price === undefined ? '' : Number(zhang_item.zhang_price)) + '" placeholder="如：12.80" /></div>' +
        '<div class="zhang_admin_form_item"><label class="zhang_admin_form_label">计价单位<em>*</em></label>' +
        '<input id="zhang_produce_unit" type="text" maxlength="20" value="' + zhang_api.escapeHtml(zhang_item.zhang_unit) + '" placeholder="如：斤 / 枚 / 瓶" /></div>' +
        '<div class="zhang_admin_form_item"><label class="zhang_admin_form_label">产地<em>*</em></label>' +
        '<input id="zhang_produce_origin" type="text" maxlength="100" value="' + zhang_api.escapeHtml(zhang_item.zhang_origin) + '" placeholder="如：山东寿光" /></div>' +
        '<div class="zhang_admin_form_item"><label class="zhang_admin_form_label">库存<em>*</em></label>' +
        '<input id="zhang_produce_stock" type="number" min="0" step="1" value="' + Number(zhang_item.zhang_stock || 0) + '" /></div>' +
        '<div class="zhang_admin_form_item zhang_admin_form_full"><label class="zhang_admin_form_label">图片地址</label>' +
        '<input id="zhang_produce_image" type="text" maxlength="600" value="' + zhang_api.escapeHtml(zhang_item.zhang_image) + '" placeholder="图片 URL，可留空" /></div>' +
        '<div class="zhang_admin_form_item zhang_admin_form_full"><label class="zhang_admin_form_label">描述<em>*</em></label>' +
        '<textarea id="zhang_produce_desc" maxlength="500" placeholder="请输入农产品描述（不超过 500 字）">' + zhang_api.escapeHtml(zhang_item.zhang_desc) + '</textarea></div>' +
        '</div>' +
        '<p class="zhang_admin_form_tip" id="zhang_produce_form_tip"></p>',
      footer: [
        { text: '取消', className: 'zhang_admin_btn zhang_admin_btn_ghost' },
        {
          text: zhang_isEdit ? '保存修改' : '确认新增',
          className: 'zhang_admin_btn',
          keepOpen: true,
          onClick: function () {
            zhang_submitForm(zhang_isEdit ? zhang_item.zhang_id : 0);
          }
        }
      ]
    });
  }

  function zhang_formValue(zhang_id) {
    var zhang_el = document.getElementById(zhang_id);
    return zhang_el ? zhang_el.value : '';
  }

  function zhang_submitForm(zhang_id) {
    var zhang_tip = document.getElementById('zhang_produce_form_tip');
    var zhang_body = {
      name: zhang_formValue('zhang_produce_name').trim(),
      category: zhang_formValue('zhang_produce_category').trim(),
      price: zhang_formValue('zhang_produce_price'),
      unit: zhang_formValue('zhang_produce_unit').trim(),
      origin: zhang_formValue('zhang_produce_origin').trim(),
      stock: zhang_formValue('zhang_produce_stock'),
      image: zhang_formValue('zhang_produce_image').trim(),
      desc: zhang_formValue('zhang_produce_desc').trim()
    };

    if (!zhang_body.name || !zhang_body.category || !zhang_body.unit || !zhang_body.origin || !zhang_body.desc) {
      zhang_tip.textContent = '带 * 的字段均为必填项，请完整填写';
      zhang_tip.className = 'zhang_admin_form_tip zhang_admin_tip_err';
      return;
    }
    if (zhang_body.price === '' || Number(zhang_body.price) < 0) {
      zhang_tip.textContent = '请输入正确的单价';
      zhang_tip.className = 'zhang_admin_form_tip zhang_admin_tip_err';
      return;
    }

    zhang_tip.textContent = '正在保存…';
    zhang_tip.className = 'zhang_admin_form_tip';

    zhang_api
      .request(zhang_id ? '/api/admin/produce/' + zhang_id : '/api/admin/produce', {
        method: zhang_id ? 'PUT' : 'POST',
        body: zhang_body
      })
      .then(function (zhang_data) {
        console.log('保存农产品接口返回：', zhang_data);
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
        console.error('保存农产品失败：', zhang_err);
        zhang_tip.textContent = '网络异常，保存失败';
        zhang_tip.className = 'zhang_admin_form_tip zhang_admin_tip_err';
      });
  }

  function zhang_handleDelete(zhang_id, zhang_name) {
    zhang_api
      .confirm('确定要删除农产品 <b>「' + zhang_api.escapeHtml(zhang_name) + '」</b> 吗？删除后不可恢复。', {
        title: '删除农产品'
      })
      .then(function (zhang_ok) {
        if (!zhang_ok) {
          return;
        }
        zhang_api
          .request('/api/admin/produce/' + zhang_id, { method: 'DELETE' })
          .then(function (zhang_data) {
            console.log('删除农产品接口返回：', zhang_data);
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
            console.error('删除农产品失败：', zhang_err);
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
      zhang_handleDelete(zhang_id, zhang_row.zhang_name);
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

  document.getElementById('zhang_produce_search_btn').addEventListener('click', function () {
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

  document.getElementById('zhang_produce_reset_btn').addEventListener('click', function () {
    zhang_searchInput.value = '';
    zhang_state.keyword = '';
    zhang_state.page = 1;
    zhang_loadList();
  });

  document.getElementById('zhang_produce_add_btn').addEventListener('click', function () {
    zhang_openForm(null);
  });

  zhang_loadList();
})();
