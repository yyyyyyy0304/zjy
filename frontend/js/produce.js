/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
*/

(function () {
  'use strict';

  var zhang_state = {
    page: 1,
    pageSize: 10,
    keyword: '',
    total: 0
  };

  var zhang_galleryBox = document.getElementById('zhang_gallery_box');
  var zhang_countEl = document.getElementById('zhang_produce_count');
  var zhang_alert = document.getElementById('zhang_produce_alert');
  var zhang_alertText = document.getElementById('zhang_produce_alert_text');
  var zhang_pager = document.getElementById('zhang_produce_pager');
  var zhang_pagerText = document.getElementById('zhang_produce_pager_text');
  var zhang_prevBtn = document.getElementById('zhang_produce_prev_btn');
  var zhang_nextBtn = document.getElementById('zhang_produce_next_btn');
  var zhang_rawJson = document.getElementById('zhang_produce_raw_json');
  var zhang_apiUrl = document.getElementById('zhang_api_url');
  var zhang_keywordInput = document.getElementById('zhang_produce_keyword');

  // HTML 转义，避免数据中的特殊字符破坏结构
  function zhang_escape(zhang_text) {
    return String(zhang_text == null ? '' : zhang_text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // 价格格式化为两位小数
  function zhang_formatPrice(zhang_value) {
    var zhang_num = Number(zhang_value);
    return isNaN(zhang_num) ? zhang_value : zhang_num.toFixed(2);
  }

  function zhang_showAlert(zhang_message) {
    zhang_alert.hidden = false;
    zhang_alertText.textContent = zhang_message;
  }

  // 渲染图文卡片
  function zhang_renderList(zhang_list) {
    if (!zhang_list || zhang_list.length === 0) {
      zhang_galleryBox.innerHTML = '<div class="zhang_empty">没有找到符合条件的农产品。</div>';
      return;
    }

    zhang_galleryBox.innerHTML = zhang_list.map(function (zhang_item) {
      return '' +
        '<article class="zhang_gallery_item">' +
          '<div class="zhang_gallery_media">' +
            '<img class="zhang_gallery_img" src="' + zhang_escape(zhang_item.zhang_image) + '" alt="' + zhang_escape(zhang_item.zhang_name) + '" loading="lazy" />' +
            '<span class="zhang_gallery_tag">' + zhang_escape(zhang_item.zhang_category) + '</span>' +
          '</div>' +
          '<div class="zhang_gallery_body">' +
            '<h3 class="zhang_gallery_name">' + zhang_escape(zhang_item.zhang_name) + '</h3>' +
            '<p class="zhang_gallery_desc">' + zhang_escape(zhang_item.zhang_desc) + '</p>' +
            '<div class="zhang_gallery_meta">' +
              '<span>产地：' + zhang_escape(zhang_item.zhang_origin) + '</span>' +
              '<span>库存：' + zhang_item.zhang_stock + '</span>' +
              '<span class="zhang_gallery_id">ID：' + zhang_item.zhang_id + '</span>' +
            '</div>' +
            '<div class="zhang_gallery_price">' +
              '<span class="zhang_price_symbol">¥</span>' +
              '<span class="zhang_price_num">' + zhang_formatPrice(zhang_item.zhang_price) + '</span>' +
              '<span class="zhang_price_unit">/ ' + zhang_escape(zhang_item.zhang_unit) + '</span>' +
            '</div>' +
          '</div>' +
        '</article>';
    }).join('');
  }

  // 渲染分页
  function zhang_renderPager() {
    var zhang_totalPage = Math.max(1, Math.ceil(zhang_state.total / zhang_state.pageSize));
    zhang_pager.hidden = false;
    zhang_pagerText.textContent = '第 ' + zhang_state.page + ' / ' + zhang_totalPage + ' 页';
    zhang_prevBtn.disabled = zhang_state.page <= 1;
    zhang_nextBtn.disabled = zhang_state.page >= zhang_totalPage;
  }

  // 请求图文列表
  function zhang_loadProduce() {
    var zhang_query = '?page=' + zhang_state.page + '&pageSize=' + zhang_state.pageSize +
      (zhang_state.keyword ? '&keyword=' + encodeURIComponent(zhang_state.keyword) : '');
    var zhang_requestUrl = '/api/produce' + zhang_query;

    zhang_apiUrl.href = zhang_requestUrl;
    zhang_apiUrl.textContent = 'http://localhost:8115' + zhang_requestUrl;
    zhang_countEl.textContent = '加载中…';
    zhang_alert.hidden = true;

    fetch(zhang_requestUrl)
      .then(function (zhang_res) {
        return zhang_res.json();
      })
      .then(function (zhang_data) {
        console.log('后端 /api/produce 返回：', zhang_data);
        zhang_rawJson.textContent = JSON.stringify(zhang_data, null, 2);

        if (zhang_data.code !== 0) {
          zhang_countEl.textContent = '';
          zhang_showAlert('接口返回错误：' + zhang_data.msg);
          zhang_galleryBox.innerHTML = '';
          return;
        }

        zhang_state.total = zhang_data.data.total;
        zhang_countEl.textContent = '共 ' + zhang_data.data.total + ' 条';
        zhang_renderList(zhang_data.data.list);
        zhang_renderPager();
      })
      .catch(function (zhang_err) {
        console.error('请求农产品图文列表失败：', zhang_err);
        zhang_countEl.textContent = '';
        zhang_showAlert('无法获取图文数据，请确认后端服务（端口 8115）与 MySQL 已启动。');
        zhang_galleryBox.innerHTML = '';
        zhang_rawJson.textContent = '请求失败：' + zhang_err.message;
      });
  }

  function zhang_onSearch() {
    zhang_state.keyword = zhang_keywordInput.value.trim();
    zhang_state.page = 1;
    zhang_loadProduce();
  }

  function zhang_onReset() {
    zhang_keywordInput.value = '';
    zhang_state.keyword = '';
    zhang_state.page = 1;
    zhang_loadProduce();
  }

  document.getElementById('zhang_produce_search_btn').addEventListener('click', zhang_onSearch);
  document.getElementById('zhang_produce_reset_btn').addEventListener('click', zhang_onReset);

  zhang_keywordInput.addEventListener('keydown', function (zhang_event) {
    if (zhang_event.key === 'Enter') {
      zhang_onSearch();
    }
  });

  zhang_prevBtn.addEventListener('click', function () {
    if (zhang_state.page > 1) {
      zhang_state.page -= 1;
      zhang_loadProduce();
    }
  });

  zhang_nextBtn.addEventListener('click', function () {
    zhang_state.page += 1;
    zhang_loadProduce();
  });

  zhang_loadProduce();
})();
