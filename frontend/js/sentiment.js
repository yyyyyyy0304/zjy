/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-16 | 大模型：DeepSeek-V4.1-Flash
*/

(function () {
  'use strict';

  // ===== DOM =====
  var zhang_dropZone = document.getElementById('zhang_sent_drop_zone');
  var zhang_fileInput = document.getElementById('zhang_sent_file_input');
  var zhang_alertBox = document.getElementById('zhang_sent_alert');
  var zhang_alertText = document.getElementById('zhang_sent_alert_text');
  var zhang_loadingSection = document.getElementById('zhang_sent_loading');
  var zhang_resultSection = document.getElementById('zhang_sent_result');
  var zhang_totalLabel = document.getElementById('zhang_sent_total');
  var zhang_chartCanvas = document.getElementById('zhang_sent_chart');
  var zhang_legendBox = document.getElementById('zhang_sent_legend');
  var zhang_highlightsBox = document.getElementById('zhang_sent_highlights');
  var zhang_tableBody = document.getElementById('zhang_sent_table_body');
  var zhang_sendRaw = document.getElementById('zhang_sent_send_raw');
  var zhang_recvRaw = document.getElementById('zhang_sent_recv_raw');

  var zhang_colors = { '好评': '#5fdba0', '中评': '#f2c96d', '差评': '#f0656a' };

  // HTML 转义，避免评论内容中的特殊字符破坏结构
  function zhang_escape(zhang_text) {
    return String(zhang_text == null ? '' : zhang_text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function zhang_showAlert(zhang_msg) {
    zhang_alertText.textContent = zhang_msg;
    zhang_alertBox.hidden = false;
  }

  function zhang_hideAlert() {
    zhang_alertBox.hidden = true;
  }

  /**
   * 上传文件并分析
   */
  function zhang_uploadAndAnalyze(zhang_file) {
    if (!zhang_file) return;

    var zhang_name = zhang_file.name.toLowerCase();
    if (!zhang_name.endsWith('.xlsx') && !zhang_name.endsWith('.xls')) {
      zhang_showAlert('仅支持 xlsx、xls 格式的 Excel 文件');
      return;
    }

    if (zhang_file.size > 20 * 1024 * 1024) {
      zhang_showAlert('文件大小不能超过 20MB');
      return;
    }

    zhang_hideAlert();
    zhang_resultSection.style.display = 'none';
    zhang_loadingSection.style.display = 'block';
    zhang_dropZone.classList.add('zhang_kb_uploading');

    var zhang_formData = new FormData();
    zhang_formData.append('file', zhang_file);

    fetch('/api/sentiment/analyze', {
      method: 'POST',
      body: zhang_formData
    })
      .then(function (zhang_res) { return zhang_res.json(); })
      .then(function (zhang_data) {
        // 控制台输出从大模型接收到的数据
        console.log('===== [情感分类] 从大模型接收到的数据 =====');
        console.log(JSON.stringify(zhang_data, null, 2));
        console.log('==========================================');

        zhang_recvRaw.textContent = JSON.stringify(zhang_data, null, 2);

        zhang_loadingSection.style.display = 'none';
        zhang_dropZone.classList.remove('zhang_kb_uploading');

        if (zhang_data.code === 0) {
          // 控制台输出发送给大模型的数据
          console.log('===== [情感分类] 发送给大模型的数据 =====');
          console.log(JSON.stringify(zhang_data.data.sendData, null, 2));
          console.log('========================================');

          zhang_sendRaw.textContent = JSON.stringify(zhang_data.data.sendData, null, 2);
          zhang_renderResult(zhang_data.data);
        } else {
          zhang_showAlert(zhang_data.msg || '分析失败');
        }
      })
      .catch(function (zhang_err) {
        console.error('情感分类请求异常：', zhang_err);
        zhang_recvRaw.textContent = '请求异常：' + zhang_err.message;
        zhang_loadingSection.style.display = 'none';
        zhang_dropZone.classList.remove('zhang_kb_uploading');
        zhang_showAlert('请求异常：' + zhang_err.message);
      });
  }

  /**
   * 绘制饼状图（甜甜圈）
   */
  function zhang_drawPieChart(zhang_stats, zhang_total) {
    var zhang_ctx = zhang_chartCanvas.getContext('2d');
    var zhang_cx = zhang_chartCanvas.width / 2;
    var zhang_cy = zhang_chartCanvas.height / 2;
    var zhang_radius = Math.min(zhang_cx, zhang_cy) - 10;

    zhang_ctx.clearRect(0, 0, zhang_chartCanvas.width, zhang_chartCanvas.height);

    var zhang_labels = ['好评', '中评', '差评'];
    var zhang_startAngle = -Math.PI / 2;

    for (var zhang_i = 0; zhang_i < zhang_labels.length; zhang_i++) {
      var zhang_label = zhang_labels[zhang_i];
      var zhang_count = zhang_stats[zhang_label] || 0;
      if (zhang_count === 0) continue;

      var zhang_angle = (zhang_count / zhang_total) * Math.PI * 2;
      var zhang_endAngle = zhang_startAngle + zhang_angle;

      zhang_ctx.beginPath();
      zhang_ctx.moveTo(zhang_cx, zhang_cy);
      zhang_ctx.arc(zhang_cx, zhang_cy, zhang_radius, zhang_startAngle, zhang_endAngle);
      zhang_ctx.closePath();
      zhang_ctx.fillStyle = zhang_colors[zhang_label];
      zhang_ctx.fill();
      zhang_ctx.strokeStyle = 'rgba(5,18,12,0.5)';
      zhang_ctx.lineWidth = 2;
      zhang_ctx.stroke();

      // 百分比文字
      var zhang_pct = Math.round((zhang_count / zhang_total) * 100);
      if (zhang_pct > 5) {
        var zhang_midAngle = zhang_startAngle + zhang_angle / 2;
        var zhang_textX = zhang_cx + Math.cos(zhang_midAngle) * (zhang_radius * 0.6);
        var zhang_textY = zhang_cy + Math.sin(zhang_midAngle) * (zhang_radius * 0.6);
        zhang_ctx.fillStyle = '#04220f';
        zhang_ctx.font = 'bold 14px sans-serif';
        zhang_ctx.textAlign = 'center';
        zhang_ctx.textBaseline = 'middle';
        zhang_ctx.fillText(zhang_pct + '%', zhang_textX, zhang_textY);
      }

      zhang_startAngle = zhang_endAngle;
    }

    // 中心圆（甜甜圈效果）
    zhang_ctx.beginPath();
    zhang_ctx.arc(zhang_cx, zhang_cy, zhang_radius * 0.45, 0, Math.PI * 2);
    zhang_ctx.fillStyle = 'rgba(10,30,20,0.85)';
    zhang_ctx.fill();

    // 中心文字
    zhang_ctx.fillStyle = '#5fdba0';
    zhang_ctx.font = 'bold 28px sans-serif';
    zhang_ctx.textAlign = 'center';
    zhang_ctx.textBaseline = 'middle';
    zhang_ctx.fillText(String(zhang_total), zhang_cx, zhang_cy - 6);
    zhang_ctx.fillStyle = '#9a8c6e';
    zhang_ctx.font = '12px sans-serif';
    zhang_ctx.fillText('条评论', zhang_cx, zhang_cy + 16);
  }

  /**
   * 渲染图例
   */
  function zhang_renderLegend(zhang_stats, zhang_total) {
    var zhang_labels = ['好评', '中评', '差评'];
    var zhang_html = '';

    for (var zhang_i = 0; zhang_i < zhang_labels.length; zhang_i++) {
      var zhang_label = zhang_labels[zhang_i];
      var zhang_count = zhang_stats[zhang_label] || 0;
      var zhang_pct = zhang_total > 0 ? Math.round((zhang_count / zhang_total) * 100) : 0;

      zhang_html +=
        '<div class="zhang_sent_legend_item">' +
          '<span class="zhang_sent_legend_dot" style="background:' + zhang_colors[zhang_label] + '"></span>' +
          '<span class="zhang_sent_legend_label">' + zhang_label + '</span>' +
          '<span class="zhang_sent_legend_count">' + zhang_count + ' 条</span>' +
          '<span class="zhang_sent_legend_pct">' + zhang_pct + '%</span>' +
        '</div>';
    }

    zhang_legendBox.innerHTML = zhang_html;
  }

  /**
   * 渲染精选评论
   */
  function zhang_renderHighlights(zhang_highlights) {
    var zhang_labels = ['好评', '中评', '差评'];
    var zhang_html = '';

    for (var zhang_i = 0; zhang_i < zhang_labels.length; zhang_i++) {
      var zhang_label = zhang_labels[zhang_i];
      var zhang_items = zhang_highlights[zhang_label] || [];
      if (zhang_items.length === 0) continue;

      zhang_html += '<div class="zhang_sent_highlight_group">';
      zhang_html += '<h3 class="zhang_sent_highlight_title"><span class="zhang_sent_tag" style="background:' + zhang_colors[zhang_label] + '">' + zhang_label + '</span>精选评论</h3>';
      zhang_html += '<div class="zhang_sent_highlight_list">';

      for (var zhang_j = 0; zhang_j < zhang_items.length; zhang_j++) {
        var zhang_item = zhang_items[zhang_j];
        zhang_html +=
          '<div class="zhang_sent_highlight_card">' +
            '<p class="zhang_sent_highlight_text">' + zhang_escape(zhang_item.text) + '</p>' +
            (zhang_item.reason ? '<p class="zhang_sent_highlight_reason">' + zhang_escape(zhang_item.reason) + '</p>' : '') +
          '</div>';
      }

      zhang_html += '</div></div>';
    }

    zhang_highlightsBox.innerHTML = zhang_html;
  }

  /**
   * 渲染全部评论表格
   */
  function zhang_renderTable(zhang_results) {
    var zhang_html = '';

    for (var zhang_i = 0; zhang_i < zhang_results.length; zhang_i++) {
      var zhang_r = zhang_results[zhang_i];
      zhang_html +=
        '<tr>' +
          '<td class="zhang_sent_td_idx">' + zhang_r.index + '</td>' +
          '<td class="zhang_sent_td_text">' + zhang_escape(zhang_r.text) + '</td>' +
          '<td class="zhang_sent_td_sent"><span class="zhang_sent_tag" style="background:' + (zhang_colors[zhang_r.sentiment] || '#888') + '">' + zhang_r.sentiment + '</span></td>' +
          '<td class="zhang_sent_td_reason">' + (zhang_r.reason ? zhang_escape(zhang_r.reason) : '-') + '</td>' +
        '</tr>';
    }

    zhang_tableBody.innerHTML = zhang_html;
  }

  /**
   * 渲染完整结果
   */
  function zhang_renderResult(zhang_data) {
    zhang_resultSection.style.display = 'block';
    zhang_totalLabel.textContent = zhang_data.total + ' 条评论';

    zhang_drawPieChart(zhang_data.stats, zhang_data.total);
    zhang_renderLegend(zhang_data.stats, zhang_data.total);
    zhang_renderHighlights(zhang_data.highlights);
    zhang_renderTable(zhang_data.results);

    zhang_resultSection.scrollIntoView({ behavior: 'smooth' });
  }

  // ===== 事件绑定 =====

  zhang_dropZone.addEventListener('click', function () {
    zhang_fileInput.click();
  });

  zhang_fileInput.addEventListener('change', function () {
    if (this.files && this.files[0]) {
      zhang_uploadAndAnalyze(this.files[0]);
      this.value = '';
    }
  });

  zhang_dropZone.addEventListener('dragover', function (zhang_e) {
    zhang_e.preventDefault();
    zhang_dropZone.classList.add('zhang_kb_dragover');
  });

  zhang_dropZone.addEventListener('dragleave', function () {
    zhang_dropZone.classList.remove('zhang_kb_dragover');
  });

  zhang_dropZone.addEventListener('drop', function (zhang_e) {
    zhang_e.preventDefault();
    zhang_dropZone.classList.remove('zhang_kb_dragover');
    if (zhang_e.dataTransfer.files && zhang_e.dataTransfer.files[0]) {
      zhang_uploadAndAnalyze(zhang_e.dataTransfer.files[0]);
    }
  });
})();
