/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
说明：AI 新闻列表页逻辑，通过本地 supabase-js 直连 Supabase PostgREST 查询 zhang_ai_news 表
*/

(function () {
  'use strict';

  // ===== Supabase 连接配置（publishable key 可公开在前端使用，仅具备 RLS 允许的只读权限） =====
  var ZHANG_SUPABASE_URL = 'https://mbaoiodmgwxyzdidhpcg.supabase.co';
  var ZHANG_SUPABASE_KEY = 'sb_publishable_l0djczVzz5OjuvAM4iWuvQ_SIt6l1FW';
  var ZHANG_TABLE = 'zhang_ai_news';
  var ZHANG_LIST_FIELDS = 'zhang_id,zhang_title,zhang_summary,zhang_category,zhang_source,zhang_author,zhang_cover,zhang_tags,zhang_views,zhang_publish_time,zhang_create_time';
  var ZHANG_CATEGORIES = ['全部', '大模型', '行业应用', '政策监管', '算力硬件', '开源生态', '研究突破'];

  var zhang_state = {
    page: 1,
    pageSize: 6,
    keyword: '',
    category: '全部',
    sort: 'latest',
    total: 0
  };

  var zhang_client = null;

  // ===== DOM =====
  var zhang_grid = document.getElementById('zhang_ai_grid');
  var zhang_countEl = document.getElementById('zhang_ai_count');
  var zhang_totalEl = document.getElementById('zhang_ai_total');
  var zhang_pageCountEl = document.getElementById('zhang_ai_pagecount');
  var zhang_filters = document.getElementById('zhang_ai_filters');
  var zhang_keywordInput = document.getElementById('zhang_ai_keyword');
  var zhang_sortSelect = document.getElementById('zhang_ai_sort');
  var zhang_alert = document.getElementById('zhang_ai_alert');
  var zhang_alertText = document.getElementById('zhang_ai_alert_text');
  var zhang_pager = document.getElementById('zhang_ai_pager');
  var zhang_pagerText = document.getElementById('zhang_ai_pager_text');
  var zhang_prevBtn = document.getElementById('zhang_ai_prev_btn');
  var zhang_nextBtn = document.getElementById('zhang_ai_next_btn');
  var zhang_rawJson = document.getElementById('zhang_ai_raw_json');
  var zhang_apiUrlEl = document.getElementById('zhang_ai_api_url');
  var zhang_modal = document.getElementById('zhang_ai_modal');
  var zhang_modalMask = document.getElementById('zhang_ai_modal_mask');
  var zhang_modalClose = document.getElementById('zhang_ai_modal_close');
  var zhang_modalCover = document.getElementById('zhang_ai_modal_cover');
  var zhang_modalCat = document.getElementById('zhang_ai_modal_cat');
  var zhang_modalTitle = document.getElementById('zhang_ai_modal_title');
  var zhang_modalMeta = document.getElementById('zhang_ai_modal_meta');
  var zhang_modalTags = document.getElementById('zhang_ai_modal_tags');
  var zhang_modalContent = document.getElementById('zhang_ai_modal_content');

  // ===== 工具函数 =====
  function zhang_escape(zhang_text) {
    return String(zhang_text == null ? '' : zhang_text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function zhang_pad(zhang_num) {
    return zhang_num < 10 ? '0' + zhang_num : String(zhang_num);
  }

  function zhang_formatTime(zhang_value) {
    var zhang_date = new Date(zhang_value);
    if (isNaN(zhang_date.getTime())) {
      return '';
    }
    return zhang_date.getFullYear() + '-' + zhang_pad(zhang_date.getMonth() + 1) + '-' + zhang_pad(zhang_date.getDate()) +
      ' ' + zhang_pad(zhang_date.getHours()) + ':' + zhang_pad(zhang_date.getMinutes());
  }

  function zhang_formatViews(zhang_views) {
    var zhang_num = Number(zhang_views) || 0;
    if (zhang_num >= 10000) {
      return (zhang_num / 10000).toFixed(1) + ' 万';
    }
    return String(zhang_num);
  }

  // 搜索关键词只保留普通字符，避免破坏 PostgREST 的 or 过滤语法
  function zhang_cleanKeyword(zhang_text) {
    return String(zhang_text || '').trim().replace(/[(),%*"']/g, ' ');
  }

  function zhang_showAlert(zhang_message) {
    zhang_alert.hidden = false;
    zhang_alertText.textContent = zhang_message;
  }

  function zhang_hideAlert() {
    zhang_alert.hidden = true;
  }

  function zhang_renderSkeleton() {
    zhang_grid.innerHTML = '<div class="zhang_ai_skeleton"></div><div class="zhang_ai_skeleton"></div><div class="zhang_ai_skeleton"></div>';
  }

  // ===== 分类筛选 =====
  function zhang_renderFilters() {
    zhang_filters.innerHTML = ZHANG_CATEGORIES.map(function (zhang_cat) {
      var zhang_active = zhang_cat === zhang_state.category ? ' zhang_ai_chip_active' : '';
      return '<button class="zhang_ai_chip' + zhang_active + '" type="button" data-category="' +
        zhang_escape(zhang_cat) + '">' + zhang_escape(zhang_cat) + '</button>';
    }).join('');
  }

  // ===== 卡片渲染 =====
  function zhang_renderList(zhang_list) {
    if (!zhang_list || zhang_list.length === 0) {
      zhang_grid.innerHTML = '<div class="zhang_empty">没有找到符合条件的 AI 新闻，试试更换关键词或分类。</div>';
      return;
    }

    zhang_grid.innerHTML = zhang_list.map(function (zhang_item) {
      var zhang_tags = Array.isArray(zhang_item.zhang_tags) ? zhang_item.zhang_tags : [];
      var zhang_tagHtml = zhang_tags.map(function (zhang_tag) {
        return '<span class="zhang_ai_tag">' + zhang_escape(zhang_tag) + '</span>';
      }).join('');

      return '' +
        '<article class="zhang_ai_card" data-id="' + zhang_item.zhang_id + '" tabindex="0">' +
          '<div class="zhang_ai_cover">' +
            '<div class="zhang_ai_cover_fallback">AI</div>' +
            '<img src="' + zhang_escape(zhang_item.zhang_cover) + '" alt="' + zhang_escape(zhang_item.zhang_title) + '" loading="lazy" />' +
          '</div>' +
          '<div class="zhang_ai_card_body">' +
            '<div class="zhang_ai_card_top">' +
              '<span class="zhang_ai_badge">' + zhang_escape(zhang_item.zhang_category) + '</span>' +
              '<span class="zhang_ai_views">浏览 ' + zhang_formatViews(zhang_item.zhang_views) + '</span>' +
            '</div>' +
            '<h3 class="zhang_ai_title">' + zhang_escape(zhang_item.zhang_title) + '</h3>' +
            '<p class="zhang_ai_summary">' + zhang_escape(zhang_item.zhang_summary) + '</p>' +
            (zhang_tagHtml ? '<div class="zhang_ai_tags">' + zhang_tagHtml + '</div>' : '') +
            '<div class="zhang_ai_foot">' +
              '<span>' + zhang_escape(zhang_item.zhang_source) + ' · ' + zhang_escape(zhang_item.zhang_author) + '</span>' +
              '<span>' + zhang_formatTime(zhang_item.zhang_publish_time) + '</span>' +
            '</div>' +
          '</div>' +
        '</article>';
    }).join('');

    // 封面加载失败时隐藏图片，露出底层占位块
    Array.prototype.forEach.call(zhang_grid.querySelectorAll('.zhang_ai_cover img'), function (zhang_img) {
      zhang_img.addEventListener('error', function () {
        zhang_img.style.display = 'none';
      });
    });
  }

  // ===== 分页 =====
  function zhang_renderPager() {
    var zhang_totalPage = Math.max(1, Math.ceil(zhang_state.total / zhang_state.pageSize));
    zhang_pager.hidden = zhang_state.total <= 0;
    zhang_pagerText.textContent = '第 ' + zhang_state.page + ' / ' + zhang_totalPage + ' 页';
    zhang_prevBtn.disabled = zhang_state.page <= 1;
    zhang_nextBtn.disabled = zhang_state.page >= zhang_totalPage;
  }

  // ===== 列表查询 =====
  async function zhang_loadList() {
    if (!zhang_client) {
      zhang_showAlert('Supabase 客户端未初始化，请确认 js/vendor/supabase-js.umd.min.js 已正确下载。');
      zhang_rawJson.textContent = 'supabase-js 未加载';
      return;
    }

    zhang_renderSkeleton();
    zhang_hideAlert();
    zhang_countEl.textContent = '加载中…';

    var zhang_from = (zhang_state.page - 1) * zhang_state.pageSize;
    var zhang_to = zhang_from + zhang_state.pageSize - 1;
    var zhang_orderField = zhang_state.sort === 'hot' ? 'zhang_views' : 'zhang_publish_time';

    var zhang_query = zhang_client
      .from(ZHANG_TABLE)
      .select(ZHANG_LIST_FIELDS, { count: 'exact' });

    if (zhang_state.keyword) {
      var zhang_kw = zhang_state.keyword;
      zhang_query = zhang_query.or(
        'zhang_title.ilike.%' + zhang_kw + '%,' +
        'zhang_summary.ilike.%' + zhang_kw + '%,' +
        'zhang_author.ilike.%' + zhang_kw + '%'
      );
    }

    if (zhang_state.category !== '全部') {
      zhang_query = zhang_query.eq('zhang_category', zhang_state.category);
    }

    zhang_query = zhang_query
      .order(zhang_orderField, { ascending: false })
      .range(zhang_from, zhang_to);

    var zhang_requestInfo = {
      table: ZHANG_TABLE,
      select: ZHANG_LIST_FIELDS,
      keyword: zhang_state.keyword,
      category: zhang_state.category,
      sort: zhang_orderField,
      page: zhang_state.page,
      pageSize: zhang_state.pageSize,
      range: [zhang_from, zhang_to]
    };

    console.log('[AI新闻] 查询参数：', zhang_requestInfo);

    var zhang_result;
    try {
      zhang_result = await zhang_query;
    } catch (zhang_err) {
      console.error('[AI新闻] 查询异常：', zhang_err);
      zhang_countEl.textContent = '';
      zhang_grid.innerHTML = '';
      zhang_pageCountEl.textContent = '0';
      zhang_showAlert('查询失败：' + (zhang_err && zhang_err.message ? zhang_err.message : '网络异常'));
      zhang_rawJson.textContent = String(zhang_err);
      return;
    }

    var zhang_data = zhang_result.data;
    var zhang_count = zhang_result.count;
    var zhang_error = zhang_result.error;

    console.log('[AI新闻] Supabase 返回：', { data: zhang_data, count: zhang_count, error: zhang_error });
    zhang_rawJson.textContent = JSON.stringify({
      request: zhang_requestInfo,
      count: zhang_count,
      error: zhang_error,
      data: zhang_data
    }, null, 2);

    if (zhang_error) {
      console.error('[AI新闻] 查询出错：', zhang_error);
      zhang_countEl.textContent = '';
      zhang_grid.innerHTML = '';
      zhang_pageCountEl.textContent = '0';
      zhang_showAlert('查询出错：' + zhang_error.message + '（请检查 RLS 策略是否允许匿名读取）');
      return;
    }

    zhang_state.total = zhang_count || 0;
    zhang_countEl.textContent = '共 ' + zhang_state.total + ' 条';
    zhang_totalEl.textContent = String(zhang_state.total);
    zhang_pageCountEl.textContent = String((zhang_data || []).length);
    zhang_renderList(zhang_data || []);
    zhang_renderPager();
  }

  // ===== 详情 =====
  async function zhang_openDetail(zhang_id) {
    zhang_modal.hidden = false;
    document.body.style.overflow = 'hidden';
    zhang_modalCat.textContent = '';
    zhang_modalTitle.textContent = '正在加载…';
    zhang_modalMeta.innerHTML = '';
    zhang_modalTags.innerHTML = '';
    zhang_modalContent.innerHTML = '正在读取正文…';
    zhang_modalCover.style.display = 'none';

    console.log('[AI新闻] 打开详情，zhang_id =', zhang_id);

    var zhang_result = await zhang_client
      .from(ZHANG_TABLE)
      .select('*')
      .eq('zhang_id', zhang_id)
      .single();

    console.log('[AI新闻] 详情返回：', zhang_result);

    if (zhang_result.error) {
      console.error('[AI新闻] 详情查询出错：', zhang_result.error);
      zhang_modalTitle.textContent = '详情加载失败';
      zhang_modalContent.innerHTML = '<p>' + zhang_escape(zhang_result.error.message) + '</p>';
      return;
    }

    var zhang_item = zhang_result.data;
    zhang_modalCat.textContent = zhang_item.zhang_category;
    zhang_modalTitle.textContent = zhang_item.zhang_title;
    zhang_modalMeta.innerHTML =
      '<span>来源：' + zhang_escape(zhang_item.zhang_source) + '</span>' +
      '<span>作者：' + zhang_escape(zhang_item.zhang_author) + '</span>' +
      '<span>发布：' + zhang_formatTime(zhang_item.zhang_publish_time) + '</span>' +
      '<span>浏览：' + zhang_formatViews(zhang_item.zhang_views) + '</span>' +
      '<span>编号：' + zhang_escape(zhang_item.zhang_id) + '</span>';

    var zhang_tags = Array.isArray(zhang_item.zhang_tags) ? zhang_item.zhang_tags : [];
    zhang_modalTags.innerHTML = zhang_tags.map(function (zhang_tag) {
      return '<span class="zhang_ai_tag">' + zhang_escape(zhang_tag) + '</span>';
    }).join('');

    var zhang_paragraphs = String(zhang_item.zhang_content || '').split(/\n{2,}/);
    zhang_modalContent.innerHTML = zhang_paragraphs.map(function (zhang_p) {
      return '<p>' + zhang_escape(zhang_p) + '</p>';
    }).join('');

    if (zhang_item.zhang_cover) {
      zhang_modalCover.src = zhang_item.zhang_cover;
      zhang_modalCover.style.display = 'block';
    }
  }

  function zhang_closeDetail() {
    zhang_modal.hidden = true;
    document.body.style.overflow = '';
  }

  // ===== 事件绑定 =====
  function zhang_bindEvents() {
    document.getElementById('zhang_ai_search_btn').addEventListener('click', function () {
      zhang_state.keyword = zhang_cleanKeyword(zhang_keywordInput.value);
      zhang_state.page = 1;
      zhang_loadList();
    });

    zhang_keywordInput.addEventListener('keydown', function (zhang_event) {
      if (zhang_event.key === 'Enter') {
        zhang_state.keyword = zhang_cleanKeyword(zhang_keywordInput.value);
        zhang_state.page = 1;
        zhang_loadList();
      }
    });

    document.getElementById('zhang_ai_reset_btn').addEventListener('click', function () {
      zhang_keywordInput.value = '';
      zhang_state.keyword = '';
      zhang_state.category = '全部';
      zhang_state.sort = 'latest';
      zhang_state.page = 1;
      zhang_sortSelect.value = 'latest';
      zhang_renderFilters();
      zhang_loadList();
    });

    zhang_sortSelect.addEventListener('change', function () {
      zhang_state.sort = zhang_sortSelect.value;
      zhang_state.page = 1;
      zhang_loadList();
    });

    zhang_filters.addEventListener('click', function (zhang_event) {
      var zhang_btn = zhang_event.target.closest('.zhang_ai_chip');
      if (!zhang_btn) {
        return;
      }
      zhang_state.category = zhang_btn.getAttribute('data-category');
      zhang_state.page = 1;
      zhang_renderFilters();
      zhang_loadList();
    });

    zhang_grid.addEventListener('click', function (zhang_event) {
      var zhang_card = zhang_event.target.closest('.zhang_ai_card');
      if (zhang_card) {
        zhang_openDetail(zhang_card.getAttribute('data-id'));
      }
    });

    zhang_grid.addEventListener('keydown', function (zhang_event) {
      if (zhang_event.key !== 'Enter') {
        return;
      }
      var zhang_card = zhang_event.target.closest('.zhang_ai_card');
      if (zhang_card) {
        zhang_openDetail(zhang_card.getAttribute('data-id'));
      }
    });

    zhang_prevBtn.addEventListener('click', function () {
      if (zhang_state.page > 1) {
        zhang_state.page -= 1;
        zhang_loadList();
      }
    });

    zhang_nextBtn.addEventListener('click', function () {
      if (zhang_state.page < Math.ceil(zhang_state.total / zhang_state.pageSize)) {
        zhang_state.page += 1;
        zhang_loadList();
      }
    });

    zhang_modalClose.addEventListener('click', zhang_closeDetail);
    zhang_modalMask.addEventListener('click', zhang_closeDetail);

    document.addEventListener('keydown', function (zhang_event) {
      if (zhang_event.key === 'Escape' && !zhang_modal.hidden) {
        zhang_closeDetail();
      }
    });

    zhang_modalCover.addEventListener('error', function () {
      zhang_modalCover.style.display = 'none';
    });
  }

  // ===== 初始化 =====
  function zhang_init() {
    zhang_apiUrlEl.href = ZHANG_SUPABASE_URL + '/rest/v1/' + ZHANG_TABLE + '?select=*';
    zhang_apiUrlEl.textContent = ZHANG_SUPABASE_URL + '/rest/v1/' + ZHANG_TABLE;

    if (!window.supabase) {
      zhang_showAlert('未找到 supabase-js，请确认 frontend/js/vendor/supabase-js.umd.min.js 已下载。');
      zhang_grid.innerHTML = '';
      zhang_rawJson.textContent = 'supabase-js 未加载';
      return;
    }

    zhang_client = window.supabase.createClient(ZHANG_SUPABASE_URL, ZHANG_SUPABASE_KEY);
    zhang_renderFilters();
    zhang_bindEvents();
    zhang_loadList();
  }

  zhang_init();
})();
