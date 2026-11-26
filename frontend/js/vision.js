/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-16 | 大模型：DeepSeek-V4.1-Flash
*/

(function () {
  'use strict';

  // ===== DOM =====
  var zhang_dropZone = document.getElementById('zhang_vision_drop_zone');
  var zhang_fileInput = document.getElementById('zhang_vision_file_input');
  var zhang_previewBox = document.getElementById('zhang_vision_preview_box');
  var zhang_preview = document.getElementById('zhang_vision_preview');
  var zhang_previewInfo = document.getElementById('zhang_vision_preview_info');
  var zhang_questionInput = document.getElementById('zhang_vision_question');
  var zhang_alertBox = document.getElementById('zhang_vision_alert');
  var zhang_alertText = document.getElementById('zhang_vision_alert_text');
  var zhang_loadingSection = document.getElementById('zhang_vision_loading');
  var zhang_resultSection = document.getElementById('zhang_vision_result');
  var zhang_costLabel = document.getElementById('zhang_vision_cost');
  var zhang_nameLabel = document.getElementById('zhang_vision_name');
  var zhang_confidenceLabel = document.getElementById('zhang_vision_confidence');
  var zhang_fieldsBox = document.getElementById('zhang_vision_fields');
  var zhang_descLabel = document.getElementById('zhang_vision_desc');
  var zhang_tagsBox = document.getElementById('zhang_vision_tags');
  var zhang_historyBody = document.getElementById('zhang_vision_history_body');
  var zhang_historyCount = document.getElementById('zhang_vision_history_count');
  var zhang_sendRaw = document.getElementById('zhang_vision_send_raw');
  var zhang_recvRaw = document.getElementById('zhang_vision_recv_raw');

  // HTML 转义，避免模型返回内容破坏页面结构
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

  function zhang_formatTime(zhang_value) {
    if (!zhang_value) return '—';
    return String(zhang_value).replace('T', ' ').substring(0, 19);
  }

  /**
   * 上传图片并识别
   */
  function zhang_upload(zhang_file) {
    if (!zhang_file) return;

    if (zhang_file.type.indexOf('image') === -1) {
      zhang_showAlert('请选择 jpg、png、webp、bmp 格式的图片');
      return;
    }

    if (zhang_file.size > 10 * 1024 * 1024) {
      zhang_showAlert('图片大小不能超过 10MB');
      return;
    }

    zhang_hideAlert();

    // 本地预览
    zhang_preview.src = URL.createObjectURL(zhang_file);
    zhang_previewBox.hidden = false;
    zhang_previewInfo.textContent = zhang_file.name + ' · ' + Math.round(zhang_file.size / 1024) + ' KB';

    zhang_resultSection.style.display = 'none';
    zhang_loadingSection.style.display = 'block';
    zhang_dropZone.classList.add('zhang_kb_uploading');

    var zhang_formData = new FormData();
    zhang_formData.append('file', zhang_file);
    var zhang_question = zhang_questionInput.value.trim();
    if (zhang_question) {
      zhang_formData.append('question', zhang_question);
    }

    fetch('/api/vision/analyze', {
      method: 'POST',
      body: zhang_formData
    })
      .then(function (zhang_res) { return zhang_res.json(); })
      .then(function (zhang_data) {
        console.log('===== [图像识别] 从大模型接收到的数据 =====');
        console.log(JSON.stringify(zhang_data, null, 2));
        console.log('==========================================');

        zhang_recvRaw.textContent = JSON.stringify(zhang_data, null, 2);

        if (zhang_data.code === 0) {
          console.log('===== [图像识别] 发送给大模型的数据 =====');
          console.log(JSON.stringify(zhang_data.data.sendData, null, 2));
          console.log('========================================');
          zhang_sendRaw.textContent = JSON.stringify(zhang_data.data.sendData, null, 2);
          zhang_renderResult(zhang_data.data);
          zhang_loadHistory();
        } else {
          zhang_showAlert(zhang_data.msg || '图像识别失败');
        }
      })
      .catch(function (zhang_err) {
        console.error('图像识别请求异常：', zhang_err);
        zhang_recvRaw.textContent = '请求异常：' + zhang_err.message;
        zhang_showAlert('请求异常：' + zhang_err.message);
      })
      .finally(function () {
        zhang_loadingSection.style.display = 'none';
        zhang_dropZone.classList.remove('zhang_kb_uploading');
      });
  }

  /**
   * 渲染识别结果
   */
  function zhang_renderResult(zhang_data) {
    var zhang_result = zhang_data.result || {};

    zhang_costLabel.textContent = '耗时 ' + zhang_data.costMs + ' ms';
    zhang_nameLabel.textContent = zhang_result.name || '未命名主体';

    var zhang_conf = Number(zhang_result.confidence);
    zhang_confidenceLabel.textContent = isNaN(zhang_conf)
      ? '—'
      : '置信度 ' + Math.round(zhang_conf * 100) + '%' + (zhang_data.fallback ? ' · 已兜底' : '');

    var zhang_fields = [];
    zhang_fields.push(zhang_field('识别品类', zhang_result.category || '—'));
    zhang_fields.push(zhang_field('识别物品', Array.isArray(zhang_result.items) && zhang_result.items.length ? zhang_result.items.join('、') : '—'));
    zhang_fields.push(zhang_field('新鲜度', zhang_result.freshness || '—'));
    zhang_fields.push(zhang_field('识别模型', zhang_data.model || '—'));
    zhang_fieldsBox.innerHTML = zhang_fields.join('');

    zhang_descLabel.textContent = zhang_result.description || '（无描述）';

    var zhang_tags = Array.isArray(zhang_result.tags) ? zhang_result.tags : [];
    zhang_tagsBox.innerHTML = zhang_tags.map(function (zhang_tag) {
      return '<span class="zhang_tag">' + zhang_escape(zhang_tag) + '</span>';
    }).join('');

    zhang_resultSection.style.display = 'block';
  }

  function zhang_field(zhang_label, zhang_value) {
    return '<div class="zhang_intent_item">' +
      '<span class="zhang_intent_label">' + zhang_escape(zhang_label) + '</span>' +
      '<span class="zhang_intent_value">' + zhang_escape(zhang_value) + '</span>' +
      '</div>';
  }

  /**
   * 加载历史记录
   */
  function zhang_loadHistory() {
    fetch('/api/vision/history?limit=20')
      .then(function (zhang_res) { return zhang_res.json(); })
      .then(function (zhang_data) {
        console.log('===== [图像识别] 历史记录 =====');
        console.log(JSON.stringify(zhang_data, null, 2));

        if (zhang_data.code !== 0 || !zhang_data.data) return;

        var zhang_list = zhang_data.data.list || [];
        zhang_historyCount.textContent = zhang_list.length + ' 条';

        if (zhang_list.length === 0) {
          zhang_historyBody.innerHTML = '<tr><td colspan="7" class="zhang_table_empty">暂无记录</td></tr>';
          return;
        }

        zhang_historyBody.innerHTML = zhang_list.map(function (zhang_item, zhang_index) {
          return '<tr>' +
            '<td class="zhang_sent_td_idx">' + (zhang_index + 1) + '</td>' +
            '<td class="zhang_sent_td_text">' + zhang_escape(zhang_item.zhang_filename) + '</td>' +
            '<td class="zhang_sent_td_text">' + zhang_escape(zhang_item.zhang_name || '—') + '</td>' +
            '<td class="zhang_sent_td_sent">' + zhang_escape(zhang_item.zhang_category || '—') + '</td>' +
            '<td class="zhang_sent_td_sent">' + zhang_escape(zhang_item.zhang_freshness || '—') + '</td>' +
            '<td class="zhang_sent_td_idx">' + Math.round(Number(zhang_item.zhang_confidence || 0) * 100) + '%</td>' +
            '<td class="zhang_sent_td_reason">' + zhang_formatTime(zhang_item.zhang_create_time) + '</td>' +
            '</tr>';
        }).join('');
      })
      .catch(function (zhang_err) {
        console.error('加载图像识别历史记录失败：', zhang_err);
        zhang_historyBody.innerHTML = '<tr><td colspan="7" class="zhang_table_empty">加载失败：' + zhang_escape(zhang_err.message) + '</td></tr>';
      });
  }

  // ===== 事件绑定 =====
  zhang_dropZone.addEventListener('click', function () {
    zhang_fileInput.click();
  });

  zhang_fileInput.addEventListener('change', function () {
    if (zhang_fileInput.files && zhang_fileInput.files[0]) {
      zhang_upload(zhang_fileInput.files[0]);
    }
    zhang_fileInput.value = '';
  });

  zhang_dropZone.addEventListener('dragover', function (zhang_event) {
    zhang_event.preventDefault();
    zhang_dropZone.classList.add('zhang_kb_dragover');
  });

  zhang_dropZone.addEventListener('dragleave', function () {
    zhang_dropZone.classList.remove('zhang_kb_dragover');
  });

  zhang_dropZone.addEventListener('drop', function (zhang_event) {
    zhang_event.preventDefault();
    zhang_dropZone.classList.remove('zhang_kb_dragover');
    if (zhang_event.dataTransfer.files && zhang_event.dataTransfer.files[0]) {
      zhang_upload(zhang_event.dataTransfer.files[0]);
    }
  });

  // 首次加载历史记录
  zhang_loadHistory();
})();
