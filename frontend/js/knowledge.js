/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-12 | 大模型：DeepSeek-V4.1-Flash
*/

(function () {
  'use strict';

  // ===== DOM 元素 =====
  // 上传区
  var zhang_dropZone = document.getElementById('zhang_kb_drop_zone');
  var zhang_fileInput = document.getElementById('zhang_kb_file_input');
  var zhang_uploadOkBox = document.getElementById('zhang_kb_upload_ok');
  var zhang_uploadOkText = document.getElementById('zhang_kb_upload_ok_text');
  var zhang_uploadErrBox = document.getElementById('zhang_kb_upload_err');
  var zhang_uploadErrText = document.getElementById('zhang_kb_upload_err_text');
  // 文件列表
  var zhang_fileList = document.getElementById('zhang_kb_file_list');
  var zhang_kbCount = document.getElementById('zhang_kb_count');
  // 问答区
  var zhang_chatList = document.getElementById('zhang_kb_chat_list');
  var zhang_chatInput = document.getElementById('zhang_kb_chat_input');
  var zhang_askBtn = document.getElementById('zhang_kb_ask_btn');
  var zhang_clearBtn = document.getElementById('zhang_kb_clear_btn');
  var zhang_chatAlertBox = document.getElementById('zhang_kb_chat_alert');
  var zhang_chatAlertText = document.getElementById('zhang_kb_chat_alert_text');
  var zhang_chatCountLabel = document.getElementById('zhang_kb_chat_count');
  // 控制台数据展示
  var zhang_sendRaw = document.getElementById('zhang_kb_send_raw');
  var zhang_recvRaw = document.getElementById('zhang_kb_recv_raw');
  var zhang_matchedRaw = document.getElementById('zhang_kb_matched_raw');

  // 对话历史（用于多轮问答）
  var zhang_chatHistory = [];
  var zhang_msgCount = 0;

  /**
   * 显示上传成功提示
   */
  function zhang_showUploadOk(zhang_msg) {
    zhang_uploadOkText.textContent = zhang_msg;
    zhang_uploadOkBox.hidden = false;
    zhang_uploadErrBox.hidden = true;
    setTimeout(function () { zhang_uploadOkBox.hidden = true; }, 5000);
  }

  /**
   * 显示上传失败提示
   */
  function zhang_showUploadErr(zhang_msg) {
    zhang_uploadErrText.textContent = zhang_msg;
    zhang_uploadErrBox.hidden = false;
    zhang_uploadOkBox.hidden = true;
  }

  /**
   * 显示问答错误提示
   */
  function zhang_showChatAlert(zhang_msg) {
    zhang_chatAlertText.textContent = zhang_msg;
    zhang_chatAlertBox.hidden = false;
  }

  function zhang_hideChatAlert() {
    zhang_chatAlertBox.hidden = true;
  }

  /**
   * 格式化文件大小
   */
  function zhang_formatSize(zhang_bytes) {
    if (zhang_bytes < 1024) return zhang_bytes + ' B';
    if (zhang_bytes < 1024 * 1024) return (zhang_bytes / 1024).toFixed(1) + ' KB';
    return (zhang_bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  /**
   * 渲染文件列表
   */
  function zhang_renderFileList(zhang_list) {
    zhang_kbCount.textContent = zhang_list.length + ' 个文件';

    if (zhang_list.length === 0) {
      zhang_fileList.innerHTML = '<div class="zhang_empty">暂无知识库文件，请上传</div>';
      return;
    }

    var zhang_html = '';
    for (var zhang_i = 0; zhang_i < zhang_list.length; zhang_i++) {
      var zhang_item = zhang_list[zhang_i];
      zhang_html +=
        '<div class="zhang_kb_file_item">' +
          '<div class="zhang_kb_file_info">' +
            '<span class="zhang_kb_file_ext">' + zhang_item.ext + '</span>' +
            '<div class="zhang_kb_file_detail">' +
              '<div class="zhang_kb_file_name">' + zhang_item.originalname + '</div>' +
              '<div class="zhang_kb_file_meta">' +
                zhang_formatSize(zhang_item.size) + ' · ' +
                zhang_item.chunkCount + ' 个文本块 · ' +
                zhang_item.uploadTime +
              '</div>' +
            '</div>' +
          '</div>' +
          '<button class="zhang_btn zhang_btn_ghost zhang_btn_inline zhang_kb_del_btn" data-id="' + zhang_item.id + '" type="button">删除</button>' +
        '</div>';
    }
    zhang_fileList.innerHTML = zhang_html;

    // 绑定删除按钮
    var zhang_delBtns = zhang_fileList.querySelectorAll('.zhang_kb_del_btn');
    for (var zhang_d = 0; zhang_d < zhang_delBtns.length; zhang_d++) {
      zhang_delBtns[zhang_d].addEventListener('click', function () {
        zhang_deleteFile(this.getAttribute('data-id'));
      });
    }
  }

  /**
   * 加载知识库文件列表
   */
  function zhang_loadFileList() {
    fetch('/api/knowledge/list')
      .then(function (zhang_res) { return zhang_res.json(); })
      .then(function (zhang_data) {
        console.log('知识库文件列表：', zhang_data);
        if (zhang_data.code === 0) {
          zhang_renderFileList(zhang_data.data.list);
        }
      })
      .catch(function (zhang_err) {
        console.error('加载知识库列表失败：', zhang_err);
      });
  }

  /**
   * 上传文件
   */
  function zhang_uploadFile(zhang_file) {
    if (!zhang_file) return;

    // 前端校验文件类型
    var zhang_name = zhang_file.name.toLowerCase();
    var zhang_validExts = ['.txt', '.pdf', '.doc', '.docx'];
    var zhang_valid = false;
    for (var zhang_i = 0; zhang_i < zhang_validExts.length; zhang_i++) {
      if (zhang_name.endsWith(zhang_validExts[zhang_i])) {
        zhang_valid = true;
        break;
      }
    }
    if (!zhang_valid) {
      zhang_showUploadErr('仅支持 txt、pdf、doc、docx 格式的文件');
      return;
    }

    // 校验文件大小
    if (zhang_file.size > 20 * 1024 * 1024) {
      zhang_showUploadErr('文件大小不能超过 20MB');
      return;
    }

    var zhang_formData = new FormData();
    zhang_formData.append('file', zhang_file);

    zhang_showUploadErr('');
    zhang_uploadOkBox.hidden = true;
    zhang_dropZone.classList.add('zhang_kb_uploading');

    fetch('/api/knowledge/upload', {
      method: 'POST',
      body: zhang_formData
    })
      .then(function (zhang_res) { return zhang_res.json(); })
      .then(function (zhang_data) {
        console.log('上传响应：', zhang_data);
        zhang_dropZone.classList.remove('zhang_kb_uploading');

        if (zhang_data.code === 0) {
          zhang_showUploadOk('文件「' + zhang_data.data.originalname + '」上传成功，已解析为 ' + zhang_data.data.chunkCount + ' 个文本块');
          zhang_loadFileList();
        } else {
          zhang_showUploadErr(zhang_data.msg || '上传失败');
        }
      })
      .catch(function (zhang_err) {
        console.error('上传文件失败：', zhang_err);
        zhang_dropZone.classList.remove('zhang_kb_uploading');
        zhang_showUploadErr('上传失败：' + zhang_err.message);
      });
  }

  /**
   * 删除文件
   */
  function zhang_deleteFile(zhang_id) {
    fetch('/api/knowledge/delete/' + zhang_id, { method: 'DELETE' })
      .then(function (zhang_res) { return zhang_res.json(); })
      .then(function (zhang_data) {
        console.log('删除响应：', zhang_data);
        if (zhang_data.code === 0) {
          zhang_loadFileList();
        } else {
          zhang_showUploadErr(zhang_data.msg || '删除失败');
        }
      })
      .catch(function (zhang_err) {
        console.error('删除文件失败：', zhang_err);
        zhang_showUploadErr('删除失败：' + zhang_err.message);
      });
  }

  // ===== 聊天相关 =====

  /**
   * 创建消息气泡
   */
  function zhang_createBubble(zhang_role, zhang_content) {
    var zhang_bubble = document.createElement('div');
    zhang_bubble.className = 'zhang_chat_msg zhang_chat_' + zhang_role;

    var zhang_avatar = document.createElement('div');
    zhang_avatar.className = 'zhang_chat_avatar';
    zhang_avatar.textContent = zhang_role === 'user' ? '我' : 'AI';

    var zhang_bubbleBody = document.createElement('div');
    zhang_bubbleBody.className = 'zhang_chat_bubble';

    var zhang_lines = zhang_content.split('\n');
    for (var zhang_i = 0; zhang_i < zhang_lines.length; zhang_i++) {
      var zhang_p = document.createElement('p');
      zhang_p.className = 'zhang_chat_text';
      zhang_p.textContent = zhang_lines[zhang_i];
      zhang_bubbleBody.appendChild(zhang_p);
    }

    zhang_bubble.appendChild(zhang_avatar);
    zhang_bubble.appendChild(zhang_bubbleBody);
    return zhang_bubble;
  }

  /**
   * 追加消息
   */
  function zhang_appendMessage(zhang_role, zhang_content) {
    var zhang_welcome = zhang_chatList.querySelector('.zhang_chat_welcome');
    if (zhang_welcome) zhang_welcome.remove();

    var zhang_bubble = zhang_createBubble(zhang_role, zhang_content);
    zhang_chatList.appendChild(zhang_bubble);
    zhang_chatList.scrollTop = zhang_chatList.scrollHeight;
    zhang_msgCount++;
    zhang_chatCountLabel.textContent = zhang_msgCount + ' 条消息';
  }

  /**
   * 创建加载中气泡
   */
  function zhang_createLoadingBubble() {
    var zhang_bubble = document.createElement('div');
    zhang_bubble.className = 'zhang_chat_msg zhang_chat_assistant';
    zhang_bubble.id = 'zhang_kb_loading';

    var zhang_avatar = document.createElement('div');
    zhang_avatar.className = 'zhang_chat_avatar';
    zhang_avatar.textContent = 'AI';

    var zhang_bubbleBody = document.createElement('div');
    zhang_bubbleBody.className = 'zhang_chat_bubble';

    var zhang_dots = document.createElement('div');
    zhang_dots.className = 'zhang_chat_typing';
    zhang_dots.innerHTML = '<span></span><span></span><span></span>';

    zhang_bubbleBody.appendChild(zhang_dots);
    zhang_bubble.appendChild(zhang_avatar);
    zhang_bubble.appendChild(zhang_bubbleBody);
    return zhang_bubble;
  }

  function zhang_removeLoading() {
    var zhang_loading = document.getElementById('zhang_kb_loading');
    if (zhang_loading) zhang_loading.remove();
  }

  /**
   * 发送 RAG 问答
   */
  function zhang_sendQuestion() {
    var zhang_text = zhang_chatInput.value.trim();
    if (!zhang_text) return;

    zhang_hideChatAlert();
    zhang_appendMessage('user', zhang_text);
    zhang_chatInput.value = '';

    // 构造发送数据（包含对话历史）
    var zhang_sendData = {
      question: zhang_text,
      history: zhang_chatHistory
    };

    // 在浏览器控制台输出发送给大模型的数据
    console.log('===== [RAG] 发送给大模型的数据 =====');
    console.log(JSON.stringify(zhang_sendData, null, 2));
    console.log('====================================');

    zhang_sendRaw.textContent = JSON.stringify(zhang_sendData, null, 2);

    // 禁用按钮，显示加载中
    zhang_askBtn.disabled = true;
    zhang_chatList.appendChild(zhang_createLoadingBubble());
    zhang_chatList.scrollTop = zhang_chatList.scrollHeight;

    fetch('/api/knowledge/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zhang_sendData)
    })
      .then(function (zhang_res) { return zhang_res.json(); })
      .then(function (zhang_data) {
        // 在浏览器控制台输出从大模型接收到的数据
        console.log('===== [RAG] 从大模型接收到的数据 =====');
        console.log(JSON.stringify(zhang_data, null, 2));
        console.log('======================================');

        zhang_recvRaw.textContent = JSON.stringify(zhang_data, null, 2);

        zhang_removeLoading();
        zhang_askBtn.disabled = false;

        if (zhang_data.code === 0) {
          var zhang_answer = zhang_data.data.answer || '（未收到回复）';
          zhang_appendMessage('assistant', zhang_answer);

          // 展示匹配到的知识库片段
          if (zhang_data.data.matchedChunks && zhang_data.data.matchedChunks.length > 0) {
            zhang_matchedRaw.textContent = JSON.stringify(zhang_data.data.matchedChunks, null, 2);
          } else {
            zhang_matchedRaw.textContent = '未匹配到相关片段';
          }

          // 加入对话历史
          zhang_chatHistory.push({ role: 'user', content: zhang_text });
          zhang_chatHistory.push({ role: 'assistant', content: zhang_answer });
        } else {
          zhang_showChatAlert(zhang_data.msg || '问答失败');
        }
      })
      .catch(function (zhang_err) {
        console.error('RAG 问答请求异常：', zhang_err);
        zhang_recvRaw.textContent = '请求异常：' + zhang_err.message;
        zhang_removeLoading();
        zhang_askBtn.disabled = false;
        zhang_showChatAlert('请求异常：' + zhang_err.message);
      });
  }

  /**
   * 清空问答
   */
  function zhang_clearChat() {
    zhang_chatHistory = [];
    zhang_msgCount = 0;
    zhang_chatCountLabel.textContent = '0 条消息';
    zhang_hideChatAlert();
    zhang_chatList.innerHTML = '';
    zhang_sendRaw.textContent = '暂无数据';
    zhang_recvRaw.textContent = '暂无数据';
    zhang_matchedRaw.textContent = '暂无数据';

    var zhang_welcome = document.createElement('div');
    zhang_welcome.className = 'zhang_chat_welcome';
    zhang_welcome.innerHTML =
      '<div class="zhang_chat_welcome_icon">AI</div>' +
      '<p class="zhang_chat_welcome_text">上传知识库文件后，可以基于文件内容向我提问！</p>';
    zhang_chatList.appendChild(zhang_welcome);
  }

  // ===== 事件绑定 =====

  // 点击上传区触发文件选择
  zhang_dropZone.addEventListener('click', function () {
    zhang_fileInput.click();
  });

  // 文件选择
  zhang_fileInput.addEventListener('change', function () {
    if (this.files && this.files[0]) {
      zhang_uploadFile(this.files[0]);
      this.value = '';
    }
  });

  // 拖拽上传
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
      zhang_uploadFile(zhang_e.dataTransfer.files[0]);
    }
  });

  // 提问
  zhang_askBtn.addEventListener('click', zhang_sendQuestion);

  // 清空问答
  zhang_clearBtn.addEventListener('click', zhang_clearChat);

  // Enter 发送
  zhang_chatInput.addEventListener('keydown', function (zhang_e) {
    if (zhang_e.key === 'Enter' && !zhang_e.shiftKey) {
      zhang_e.preventDefault();
      zhang_sendQuestion();
    }
  });

  // 自动调整输入框高度
  zhang_chatInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
  });

  // 页面加载时获取文件列表
  zhang_loadFileList();
})();
