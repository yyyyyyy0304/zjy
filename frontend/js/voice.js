/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

(function () {
  'use strict';

  // ===== DOM =====
  var zhang_recBtn = document.getElementById('zhang_voice_rec_btn');
  var zhang_recDot = document.getElementById('zhang_voice_rec_dot');
  var zhang_recStatus = document.getElementById('zhang_voice_rec_status');
  var zhang_recTime = document.getElementById('zhang_voice_rec_time');
  var zhang_audio = document.getElementById('zhang_voice_audio');
  var zhang_dropZone = document.getElementById('zhang_voice_drop_zone');
  var zhang_fileInput = document.getElementById('zhang_voice_file_input');
  var zhang_alertBox = document.getElementById('zhang_voice_alert');
  var zhang_alertText = document.getElementById('zhang_voice_alert_text');
  var zhang_loadingSection = document.getElementById('zhang_voice_loading');
  var zhang_resultSection = document.getElementById('zhang_voice_result');
  var zhang_metaLabel = document.getElementById('zhang_voice_meta');
  var zhang_textLabel = document.getElementById('zhang_voice_text');
  var zhang_confidenceLabel = document.getElementById('zhang_voice_confidence');
  var zhang_intentBox = document.getElementById('zhang_voice_intent');
  var zhang_historyBody = document.getElementById('zhang_voice_history_body');
  var zhang_historyCount = document.getElementById('zhang_voice_history_count');
  var zhang_sendRaw = document.getElementById('zhang_voice_send_raw');
  var zhang_recvRaw = document.getElementById('zhang_voice_recv_raw');
  // 【本次新增】语种选择与中文译文
  var zhang_langSelect = document.getElementById('zhang_voice_lang');
  var zhang_langTip = document.getElementById('zhang_voice_lang_tip');
  var zhang_translationLabel = document.getElementById('zhang_voice_translation');

  // 【本次新增】常用语种（其余语种进入“其他语种与方言”分组）
  var zhang_commonLangs = ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'ar', 'pt', 'it', 'vi', 'th', 'id', 'hi', 'tr', 'nl', 'pl', 'uk'];

  var zhang_mediaRecorder = null;
  var zhang_recordStream = null;
  var zhang_recordTimer = null;
  var zhang_recordSeconds = 0;
  var zhang_peak = 0;
  var zhang_recordAudioCtx = null;
  var zhang_recordAnalyser = null;

  // HTML 转义，避免识别文本中的特殊字符破坏结构
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

  function zhang_pad(zhang_num) {
    return zhang_num < 10 ? '0' + zhang_num : '' + zhang_num;
  }

  /**
   * 把 PCM 浮点采样编码为 16 位单声道 WAV
   */
  function zhang_encodeWav(zhang_samples, zhang_sampleRate) {
    var zhang_buffer = new ArrayBuffer(44 + zhang_samples.length * 2);
    var zhang_view = new DataView(zhang_buffer);

    function zhang_writeString(zhang_offset, zhang_str) {
      for (var zhang_i = 0; zhang_i < zhang_str.length; zhang_i++) {
        zhang_view.setUint8(zhang_offset + zhang_i, zhang_str.charCodeAt(zhang_i));
      }
    }

    zhang_writeString(0, 'RIFF');
    zhang_view.setUint32(4, 36 + zhang_samples.length * 2, true);
    zhang_writeString(8, 'WAVE');
    zhang_writeString(12, 'fmt ');
    zhang_view.setUint32(16, 16, true);
    zhang_view.setUint16(20, 1, true);
    zhang_view.setUint16(22, 1, true);
    zhang_view.setUint32(24, zhang_sampleRate, true);
    zhang_view.setUint32(28, zhang_sampleRate * 2, true);
    zhang_view.setUint16(32, 2, true);
    zhang_view.setUint16(34, 16, true);
    zhang_writeString(36, 'data');
    zhang_view.setUint32(40, zhang_samples.length * 2, true);

    var zhang_offset = 44;
    for (var zhang_j = 0; zhang_j < zhang_samples.length; zhang_j++, zhang_offset += 2) {
      var zhang_sample = Math.max(-1, Math.min(1, zhang_samples[zhang_j]));
      zhang_view.setInt16(zhang_offset, zhang_sample < 0 ? zhang_sample * 0x8000 : zhang_sample * 0x7fff, true);
    }

    return new Blob([zhang_buffer], { type: 'audio/wav' });
  }

  /**
   * 把浏览器录音（通常是 webm/opus）转成 16kHz 单声道 WAV
   * 说明：语音识别模型对 wav 兼容性最好，可避免 webm 容器识别为空
   */
  function zhang_blobToWav(zhang_blob) {
    var zhang_AudioCtx = window.AudioContext || window.webkitAudioContext;
    var zhang_OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;

    if (!zhang_AudioCtx || !zhang_OfflineCtx) {
      return Promise.resolve(null);
    }

    return zhang_blob.arrayBuffer()
      .then(function (zhang_arrayBuffer) {
        var zhang_ctx = new zhang_AudioCtx();
        return zhang_ctx.decodeAudioData(zhang_arrayBuffer).then(function (zhang_audioBuffer) {
          zhang_ctx.close();

          var zhang_targetRate = 16000;
          var zhang_frameCount = Math.max(1, Math.ceil(zhang_audioBuffer.duration * zhang_targetRate));
          var zhang_offline = new zhang_OfflineCtx(1, zhang_frameCount, zhang_targetRate);
          var zhang_source = zhang_offline.createBufferSource();
          zhang_source.buffer = zhang_audioBuffer;
          zhang_source.connect(zhang_offline.destination);
          zhang_source.start(0);

          return zhang_offline.startRendering().then(function (zhang_rendered) {
            return zhang_encodeWav(zhang_rendered.getChannelData(0), zhang_targetRate);
          });
        });
      })
      .catch(function (zhang_err) {
        console.error('录音转 WAV 失败，改为上传原始音频：', zhang_err);
        return null;
      });
  }

  /**
   * 【本次新增】把后端返回的语种清单填充到下拉框
   * 常用语种单列一组，其余语种与方言归入“其他”，覆盖世界各国家/地区语言
   */
  function zhang_fillLanguages(zhang_list) {
    if (!zhang_langSelect) return;

    var zhang_auto = '<option value="auto">自动检测（推荐，支持世界各国家/地区语言）</option>';
    var zhang_common = [];
    var zhang_rest = [];

    (zhang_list || []).forEach(function (zhang_item) {
      if (!zhang_item || !zhang_item.code) return;
      var zhang_option = '<option value="' + zhang_escape(zhang_item.code) + '">' +
        zhang_escape(zhang_item.name) + '（' + zhang_escape(zhang_item.code) + '）</option>';
      if (zhang_commonLangs.indexOf(zhang_item.code) !== -1) {
        zhang_common.push(zhang_option);
      } else {
        zhang_rest.push(zhang_option);
      }
    });

    zhang_langSelect.innerHTML = zhang_auto +
      (zhang_common.length ? '<optgroup label="常用语种">' + zhang_common.join('') + '</optgroup>' : '') +
      (zhang_rest.length ? '<optgroup label="其他语种与方言">' + zhang_rest.join('') + '</optgroup>' : '');
  }

  /**
   * 【本次新增】加载后端支持的语种列表（失败时保留下拉框的“自动检测”项）
   */
  function zhang_loadLanguages() {
    fetch('/api/voice/languages')
      .then(function (zhang_res) { return zhang_res.json(); })
      .then(function (zhang_data) {
        console.log('===== [语音识别] 支持的语种列表 =====');
        console.log(JSON.stringify(zhang_data, null, 2));
        if (zhang_data.code === 0 && zhang_data.data) {
          zhang_fillLanguages(zhang_data.data.list);
        }
      })
      .catch(function (zhang_err) {
        console.error('加载语种列表失败：', zhang_err);
      });
  }

  /**
   * 上传音频并识别
   */
  function zhang_upload(zhang_file) {
    if (!zhang_file) return;

    var zhang_minetype = zhang_file.type || '';
    if (zhang_minetype.indexOf('audio') === -1 && !/\.(mp3|wav|m4a|webm|ogg|flac|aac|amr)$/i.test(zhang_file.name)) {
      zhang_showAlert('请选择 mp3、wav、m4a、webm、ogg 等格式的音频文件');
      return;
    }

    if (zhang_file.size > 25 * 1024 * 1024) {
      zhang_showAlert('音频文件大小不能超过 25MB');
      return;
    }

    zhang_hideAlert();
    zhang_resultSection.style.display = 'none';
    zhang_loadingSection.style.display = 'block';
    zhang_dropZone.classList.add('zhang_kb_uploading');

    var zhang_formData = new FormData();
    zhang_formData.append('file', zhang_file);
    // 【本次新增】把用户选择的语种一起提交，auto 表示自动检测
    zhang_formData.append('language', (zhang_langSelect && zhang_langSelect.value) || 'auto');

    fetch('/api/voice/transcribe', {
      method: 'POST',
      body: zhang_formData
    })
      .then(function (zhang_res) { return zhang_res.json(); })
      .then(function (zhang_data) {
        console.log('===== [语音识别] 从大模型接收到的数据 =====');
        console.log(JSON.stringify(zhang_data, null, 2));
        console.log('==========================================');

        zhang_recvRaw.textContent = JSON.stringify(zhang_data, null, 2);

        if (zhang_data.code === 0) {
          console.log('===== [语音识别] 发送给大模型的数据 =====');
          console.log(JSON.stringify(zhang_data.data.sendData, null, 2));
          console.log('========================================');
          zhang_sendRaw.textContent = JSON.stringify(zhang_data.data.sendData, null, 2);
          zhang_renderResult(zhang_data.data);
          if (zhang_data.data.emptyText) {
            zhang_showAlert(zhang_data.msg);
          }
          zhang_loadHistory();
        } else {
          zhang_showAlert(zhang_data.msg || '语音识别失败');
        }
      })
      .catch(function (zhang_err) {
        console.error('语音识别请求异常：', zhang_err);
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
    var zhang_transcript = zhang_data.transcript || {};
    var zhang_intent = zhang_data.intent;
    var zhang_langInfo = zhang_data.language || {};
    var zhang_langName = zhang_transcript.languageName || zhang_langInfo.name || zhang_transcript.language || '未知';

    // 【本次修改】显示语种名称（而不只是代码），并标出模型链尝试次数
    zhang_metaLabel.textContent = zhang_langName + ' · ' +
      (zhang_transcript.duration || 0) + ' 秒 · ' + zhang_data.model +
      (zhang_data.retried ? '（已自动切换多语种模型，共尝试 ' + (zhang_data.attempts ? zhang_data.attempts.length : 2) + ' 次）' : '') +
      (zhang_transcript.emotion ? ' · 情绪 ' + zhang_transcript.emotion : '') +
      ' · 耗时 ' + zhang_data.costMs + ' ms';
    zhang_textLabel.textContent = zhang_transcript.text || '（未识别到语音内容）';

    // 【本次新增】非中文语音时展示中文译文，方便核对识别是否准确
    var zhang_textZh = zhang_transcript.textZh || '';
    var zhang_isZh = (zhang_transcript.language === 'zh' || zhang_transcript.language === 'yue');
    if (zhang_textZh && !zhang_isZh && zhang_textZh !== zhang_transcript.text) {
      zhang_translationLabel.hidden = false;
      zhang_translationLabel.textContent = '中文译文：' + zhang_textZh;
    } else {
      zhang_translationLabel.hidden = true;
      zhang_translationLabel.textContent = '';
    }

    if (zhang_intent) {
      var zhang_conf = Number(zhang_intent.confidence);
      zhang_confidenceLabel.textContent = isNaN(zhang_conf)
        ? '—'
        : '意图置信度 ' + Math.round(zhang_conf * 100) + '%' + (zhang_intent.need_review ? ' · 建议人工复核' : '');

      var zhang_fields = [];
      zhang_fields.push(zhang_field('识别语种', zhang_langName + (zhang_langInfo.code && zhang_langInfo.code !== 'unknown' ? '（' + zhang_langInfo.code + '）' : '') + (zhang_langInfo.source ? ' · 判定来源：' + zhang_langInfo.source : '')));
      zhang_fields.push(zhang_field('客服意图', zhang_intent.intent || '—'));
      zhang_fields.push(zhang_field('关键词', Array.isArray(zhang_intent.keywords) ? zhang_intent.keywords.join('、') : '—'));
      zhang_fields.push(zhang_field('数量', zhang_intent.quantity || '未提及'));
      zhang_fields.push(zhang_field('中文回复', zhang_intent.reply_zh || zhang_intent.reply || '—'));
      zhang_fields.push(zhang_field('原语种回复', zhang_intent.reply || zhang_intent.reply_zh || '—'));
      zhang_intentBox.innerHTML = zhang_fields.join('');
    } else {
      zhang_confidenceLabel.textContent = '模型未返回可解析的意图 JSON';
      zhang_intentBox.innerHTML = '<p class="zhang_result_empty">意图识别失败，可查看下方原始返回数据分析原因。</p>';
    }

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
    fetch('/api/voice/history?limit=20')
      .then(function (zhang_res) { return zhang_res.json(); })
      .then(function (zhang_data) {
        console.log('===== [语音识别] 历史记录 =====');
        console.log(JSON.stringify(zhang_data, null, 2));

        if (zhang_data.code !== 0 || !zhang_data.data) return;

        var zhang_list = zhang_data.data.list || [];
        zhang_historyCount.textContent = zhang_list.length + ' 条';

        if (zhang_list.length === 0) {
          zhang_historyBody.innerHTML = '<tr><td colspan="6" class="zhang_table_empty">暂无记录</td></tr>';
          return;
        }

        zhang_historyBody.innerHTML = zhang_list.map(function (zhang_item, zhang_index) {
          var zhang_text = zhang_item.zhang_text || '';
          var zhang_short = zhang_text.length > 36 ? zhang_text.substring(0, 36) + '…' : zhang_text;
          return '<tr>' +
            '<td class="zhang_sent_td_idx">' + (zhang_index + 1) + '</td>' +
            '<td class="zhang_sent_td_text">' + zhang_escape(zhang_item.zhang_filename) + '</td>' +
            '<td class="zhang_sent_td_text">' + zhang_escape(zhang_short) + '</td>' +
            '<td class="zhang_sent_td_sent">' + zhang_escape(zhang_item.zhang_intent || '—') + '</td>' +
            '<td class="zhang_sent_td_idx">' + Math.round(Number(zhang_item.zhang_confidence || 0) * 100) + '%</td>' +
            '<td class="zhang_sent_td_reason">' + zhang_formatTime(zhang_item.zhang_create_time) + '</td>' +
            '</tr>';
        }).join('');
      })
      .catch(function (zhang_err) {
        console.error('加载语音识别历史记录失败：', zhang_err);
        zhang_historyBody.innerHTML = '<tr><td colspan="6" class="zhang_table_empty">加载失败：' + zhang_escape(zhang_err.message) + '</td></tr>';
      });
  }

  /**
   * 开始 / 停止录音
   */
  function zhang_toggleRecord() {
    if (zhang_mediaRecorder && zhang_mediaRecorder.state === 'recording') {
      zhang_mediaRecorder.stop();
      return;
    }

    if (!navigator.mediaDevices || !window.MediaRecorder) {
      zhang_showAlert('当前浏览器不支持录音，请改用上传音频文件的方式');
      return;
    }

    zhang_hideAlert();

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function (zhang_stream) {
        var zhang_chunks = [];
        zhang_recordStream = zhang_stream;
        zhang_mediaRecorder = new MediaRecorder(zhang_stream);

        // 用 AnalyserNode 采集音量峰值，用于判断是否真的录到了声音
        var zhang_AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (zhang_AudioCtx) {
          zhang_recordAudioCtx = new zhang_AudioCtx();
          zhang_recordAnalyser = zhang_recordAudioCtx.createAnalyser();
          zhang_recordAnalyser.fftSize = 1024;
          zhang_recordAudioCtx.createMediaStreamSource(zhang_stream).connect(zhang_recordAnalyser);
        }

        zhang_mediaRecorder.ondataavailable = function (zhang_event) {
          if (zhang_event.data && zhang_event.data.size > 0) {
            zhang_chunks.push(zhang_event.data);
          }
        };

        zhang_mediaRecorder.onstop = function () {
          zhang_recordStream.getTracks().forEach(function (zhang_track) { zhang_track.stop(); });
          clearInterval(zhang_recordTimer);
          zhang_recBtn.textContent = '开始录音';
          zhang_recDot.classList.remove('zhang_rec_dot_on');
          zhang_recStatus.textContent = '录音结束，正在转换并上传识别…';

          if (zhang_recordAudioCtx) {
            zhang_recordAudioCtx.close();
            zhang_recordAudioCtx = null;
            zhang_recordAnalyser = null;
          }

          var zhang_rawBlob = new Blob(zhang_chunks, { type: zhang_mediaRecorder.mimeType || 'audio/webm' });
          if (zhang_rawBlob.size === 0) {
            zhang_recStatus.textContent = '没有录到声音，请重新录音';
            zhang_showAlert('没有录到声音，请检查麦克风权限后重试');
            return;
          }

          if (zhang_peak < 0.005) {
            zhang_recStatus.textContent = '检测到的声音较小，正在尝试识别…（若仍为空请检查麦克风）';
            zhang_showAlert('检测到的录音音量偏低：请确认已选对麦克风、没有静音，并靠近麦克风重试');
          } else {
            zhang_recStatus.textContent = '录音结束，正在转换并上传识别…';
          }

          zhang_blobToWav(zhang_rawBlob).then(function (zhang_wavBlob) {
            var zhang_uploadBlob = zhang_wavBlob || zhang_rawBlob;
            var zhang_ext = zhang_wavBlob ? '.wav' : '.webm';
            var zhang_type = zhang_wavBlob ? 'audio/wav' : (zhang_rawBlob.type || 'audio/webm');

            zhang_audio.src = URL.createObjectURL(zhang_uploadBlob);
            zhang_audio.hidden = false;

            var zhang_file = new File([zhang_uploadBlob], '录音-' + Date.now() + zhang_ext, { type: zhang_type });
            zhang_upload(zhang_file);
          });
        };

        zhang_mediaRecorder.start();
        zhang_recordSeconds = 0;
        zhang_peak = 0;
        zhang_recTime.textContent = '00:00';
        zhang_recBtn.textContent = '停止录音';
        zhang_recDot.classList.add('zhang_rec_dot_on');
        zhang_recStatus.textContent = '正在录音… 再次点击按钮结束录音';

        zhang_recordTimer = setInterval(function () {
          zhang_recordSeconds++;
          zhang_recTime.textContent = '00:' + zhang_pad(zhang_recordSeconds);

          // 采样当前音量峰值，用于判断录音是否有效
          if (zhang_recordAnalyser) {
            var zhang_wave = new Uint8Array(zhang_recordAnalyser.fftSize);
            zhang_recordAnalyser.getByteTimeDomainData(zhang_wave);
            for (var zhang_i = 0; zhang_i < zhang_wave.length; zhang_i++) {
              var zhang_level = Math.abs(zhang_wave[zhang_i] - 128) / 128;
              if (zhang_level > zhang_peak) {
                zhang_peak = zhang_level;
              }
            }
          }
        }, 1000);
      })
      .catch(function (zhang_err) {
        console.error('录音失败：', zhang_err);
        zhang_showAlert('无法访问麦克风：' + zhang_err.message);
      });
  }

  // ===== 事件绑定 =====
  zhang_recBtn.addEventListener('click', zhang_toggleRecord);

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

  // 【本次新增】切换语种时更新提示文案
  if (zhang_langSelect) {
    zhang_langSelect.addEventListener('change', function () {
      var zhang_value = zhang_langSelect.value;
      if (zhang_value === 'auto') {
        zhang_langTip.textContent = '自动检测会按字符集 + 大模型双重判断语种；指定语种可提高小众语言的识别准确率';
      } else {
        var zhang_text = zhang_langSelect.options[zhang_langSelect.selectedIndex].textContent;
        zhang_langTip.textContent = '已指定 ' + zhang_text + '，识别会优先按该语种解析';
      }
    });
  }

  // 首次加载语种列表与历史记录
  zhang_loadLanguages();
  zhang_loadHistory();
})();
