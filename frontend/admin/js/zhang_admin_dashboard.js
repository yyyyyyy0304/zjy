/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

// 仪表盘：拉取后端真实统计数据并绘制原生 Canvas 图表
(function () {
  'use strict';

  var zhang_api = window.zhang_admin_api;
  var zhang_chart = window.zhang_admin_chart;

  var zhang_data = {
    newsCategory: [],
    produceCategory: [],
    userTrend: [],
    stockTop: [],
    produceUnit: '件'
  };

  function zhang_renderStats(zhang_stats) {
    document.getElementById('zhang_stat_news').textContent = zhang_api.formatNumber(zhang_stats.news);
    document.getElementById('zhang_stat_produce').textContent = zhang_api.formatNumber(zhang_stats.produce);
    document.getElementById('zhang_stat_user').textContent = zhang_api.formatNumber(zhang_stats.user);
    document.getElementById('zhang_stat_views').textContent = zhang_api.formatNumber(zhang_stats.views);
  }

  function zhang_renderLatestNews(zhang_list) {
    var zhang_body = document.getElementById('zhang_latest_news_body');
    if (!zhang_list || !zhang_list.length) {
      zhang_body.innerHTML = '<tr><td colspan="6"><div class="zhang_admin_empty">暂无新闻数据</div></td></tr>';
      return;
    }
    zhang_body.innerHTML = zhang_list
      .map(function (zhang_item) {
        return (
          '<tr>' +
          '<td class="zhang_admin_td_num">' + zhang_item.zhang_id + '</td>' +
          '<td class="zhang_admin_td_title">' + zhang_api.escapeHtml(zhang_item.zhang_title) + '</td>' +
          '<td><span class="zhang_admin_badge">' + zhang_api.escapeHtml(zhang_item.zhang_category) + '</span></td>' +
          '<td>' + zhang_api.escapeHtml(zhang_item.zhang_author) + '</td>' +
          '<td class="zhang_admin_td_num">' + zhang_api.formatNumber(zhang_item.zhang_views) + '</td>' +
          '<td>' + zhang_api.formatTime(zhang_item.zhang_publish_time) + '</td>' +
          '</tr>'
        );
      })
      .join('');
  }

  function zhang_drawAll() {
    zhang_chart.drawBar(
      document.getElementById('zhang_chart_news'),
      zhang_data.newsCategory.map(function (zhang_item) {
        return { label: zhang_item.name, value: Number(zhang_item.value) };
      }),
      { unit: '' }
    );

    zhang_chart.drawDonut(
      document.getElementById('zhang_chart_produce'),
      zhang_data.produceCategory.map(function (zhang_item) {
        return { label: zhang_item.name, value: Number(zhang_item.value) };
      }),
      { centerLabel: '库存合计' }
    );

    zhang_chart.drawLine(
      document.getElementById('zhang_chart_user'),
      zhang_data.userTrend.map(function (zhang_item) {
        return { label: zhang_item.date, value: Number(zhang_item.value) };
      }),
      { unit: '' }
    );

    zhang_chart.drawHBar(
      document.getElementById('zhang_chart_stock'),
      zhang_data.stockTop.map(function (zhang_item) {
        return { label: zhang_item.name, value: Number(zhang_item.value) };
      }),
      { unit: '' }
    );
  }

  zhang_api
    .request('/api/admin/dashboard')
    .then(function (zhang_result) {
      console.log('仪表盘接口返回：', zhang_result);
      if (zhang_result.code !== 0 || !zhang_result.data) {
        zhang_api.toast(zhang_result.msg || '仪表盘数据加载失败', 'error');
        return;
      }

      var zhang_payload = zhang_result.data;
      zhang_renderStats(zhang_payload.stats);
      zhang_renderLatestNews(zhang_payload.latestNews);

      zhang_data.newsCategory = (zhang_payload.newsCategory || []).map(function (zhang_item) {
        return { name: zhang_item.zhang_name, value: zhang_item.zhang_value };
      });
      zhang_data.produceCategory = (zhang_payload.produceCategory || []).map(function (zhang_item) {
        return { name: zhang_item.zhang_name, value: zhang_item.zhang_value };
      });
      zhang_data.userTrend = (zhang_payload.userTrend || []).map(function (zhang_item) {
        return { date: zhang_item.zhang_date, value: zhang_item.zhang_value };
      });
      zhang_data.stockTop = (zhang_payload.stockTop || []).map(function (zhang_item) {
        return { name: zhang_item.zhang_name, value: zhang_item.zhang_value };
      });

      zhang_drawAll();
      zhang_chart.bindResize(zhang_drawAll);
    })
    .catch(function (zhang_err) {
      console.error('加载仪表盘数据失败：', zhang_err);
      zhang_api.toast('网络异常，仪表盘数据加载失败', 'error');
    });
})();
