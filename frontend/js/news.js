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

  var zhang_listBox = document.getElementById('zhang_news_list_box');
  var zhang_countEl = document.getElementById('zhang_news_count');
  var zhang_alert = document.getElementById('zhang_news_alert');
  var zhang_alertText = document.getElementById('zhang_news_alert_text');
  var zhang_pager = document.getElementById('zhang_pager');
  var zhang_pagerText = document.getElementById('zhang_pager_text');
  var zhang_prevBtn = document.getElementById('zhang_prev_btn');
  var zhang_nextBtn = document.getElementById('zhang_next_btn');
  var zhang_rawJson = document.getElementById('zhang_raw_json');
  var zhang_apiUrl = document.getElementById('zhang_api_url');

  // HTML 转义，避免数据中的特殊字符破坏结构
  function zhang_escape(zhang_text) {
    return String(zhang_text == null ? '' : zhang_text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // 时间格式化为 yyyy-mm-dd hh:mm
  function zhang_formatTime(zhang_value) {
    var zhang_date = new Date(zhang_value);
    if (isNaN(zhang_date.getTime())) {
      return zhang_value;
    }
    function zhang_pad(zhang_num) {
      return zhang_num < 10 ? '0' + zhang_num : String(zhang_num);
    }
    return zhang_date.getFullYear() + '-' + zhang_pad(zhang_date.getMonth() + 1) + '-' + zhang_pad(zhang_date.getDate()) +
      ' ' + zhang_pad(zhang_date.getHours()) + ':' + zhang_pad(zhang_date.getMinutes());
  }

  function zhang_showAlert(zhang_message) {
    zhang_alert.hidden = false;
    zhang_alertText.textContent = zhang_message;
  }

  function zhang_hideAlert() {
    zhang_alert.hidden = true;
  }

  // 渲染新闻卡片
  function zhang_renderList(zhang_list) {
    if (!zhang_list || zhang_list.length === 0) {
      zhang_listBox.innerHTML = '<div class="zhang_empty">没有找到符合条件的新闻。</div>';
      return;
    }

    zhang_listBox.innerHTML = zhang_list.map(function (zhang_item) {
      return '' +
        '<article class="zhang_news_item">' +
          '<div class="zhang_news_head">' +
            '<span class="zhang_news_tag">' + zhang_escape(zhang_item.zhang_category) + '</span>' +
            '<h3 class="zhang_news_title">' + zhang_escape(zhang_item.zhang_title) + '</h3>' +
          '</div>' +
          '<p class="zhang_news_summary">' + zhang_escape(zhang_item.zhang_summary) + '</p>' +
          '<div class="zhang_news_meta">' +
            '<span>来源：' + zhang_escape(zhang_item.zhang_source) + '</span>' +
            '<span>作者：' + zhang_escape(zhang_item.zhang_author) + '</span>' +
            '<span>发布：' + zhang_formatTime(zhang_item.zhang_publish_time) + '</span>' +
            '<span>浏览：' + zhang_item.zhang_views + '</span>' +
            '<span class="zhang_news_id">ID：' + zhang_item.zhang_id + '</span>' +
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

  // 请求新闻列表
  function zhang_loadNews() {
    var zhang_query = '?page=' + zhang_state.page + '&pageSize=' + zhang_state.pageSize +
      (zhang_state.keyword ? '&keyword=' + encodeURIComponent(zhang_state.keyword) : '');
    var zhang_requestUrl = '/api/news' + zhang_query;

    zhang_apiUrl.href = zhang_requestUrl;
    zhang_apiUrl.textContent = 'http://localhost:8115' + zhang_requestUrl;
    zhang_countEl.textContent = '加载中…';
    zhang_hideAlert();

    fetch(zhang_requestUrl)
      .then(function (zhang_res) {
        return zhang_res.json();
      })
      .then(function (zhang_data) {
        console.log('后端 /api/news 返回：', zhang_data);
        zhang_rawJson.textContent = JSON.stringify(zhang_data, null, 2);

        if (zhang_data.code !== 0) {
          zhang_countEl.textContent = '';
          zhang_showAlert('接口返回错误：' + zhang_data.msg);
          zhang_listBox.innerHTML = '';
          return;
        }

        zhang_state.total = zhang_data.data.total;
        zhang_countEl.textContent = '共 ' + zhang_data.data.total + ' 条';
        zhang_renderList(zhang_data.data.list);
        zhang_renderPager();
      })
      .catch(function (zhang_err) {
        console.error('请求新闻列表失败：', zhang_err);
        zhang_countEl.textContent = '';
        zhang_showAlert('无法获取新闻数据，请确认后端服务（端口 8115）与 MySQL 已启动。');
        zhang_listBox.innerHTML = '';
        zhang_rawJson.textContent = '请求失败：' + zhang_err.message;
      });
  }

  // 搜索
  function zhang_onSearch() {
    zhang_state.keyword = document.getElementById('zhang_keyword').value.trim();
    zhang_state.page = 1;
    zhang_loadNews();
  }

  function zhang_onReset() {
    document.getElementById('zhang_keyword').value = '';
    zhang_state.keyword = '';
    zhang_state.page = 1;
    zhang_loadNews();
  }

  document.getElementById('zhang_search_btn').addEventListener('click', zhang_onSearch);
  document.getElementById('zhang_reset_btn').addEventListener('click', zhang_onReset);

  document.getElementById('zhang_keyword').addEventListener('keydown', function (zhang_event) {
    if (zhang_event.key === 'Enter') {
      zhang_onSearch();
    }
  });

  zhang_prevBtn.addEventListener('click', function () {
    if (zhang_state.page > 1) {
      zhang_state.page -= 1;
      zhang_loadNews();
    }
  });

  zhang_nextBtn.addEventListener('click', function () {
    zhang_state.page += 1;
    zhang_loadNews();
  });

  zhang_loadNews();
})();
