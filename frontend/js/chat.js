/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-12 | 大模型：DeepSeek-V4.1-Flash
*/

(function () {
  'use strict';

  // DOM 元素
  var zhang_chatList = document.getElementById('zhang_chat_list');
  var zhang_chatInput = document.getElementById('zhang_chat_input');
  var zhang_sendBtn = document.getElementById('zhang_chat_send_btn');
  var zhang_clearBtn = document.getElementById('zhang_chat_clear_btn');
  var zhang_alertBox = document.getElementById('zhang_chat_alert');
  var zhang_alertText = document.getElementById('zhang_chat_alert_text');
  var zhang_countLabel = document.getElementById('zhang_chat_count');
  var zhang_sendRaw = document.getElementById('zhang_chat_send_raw');
  var zhang_recvRaw = document.getElementById('zhang_chat_recv_raw');

  // 聊天历史（用于维护上下文）
  var zhang_chatHistory = [];
  // 系统提示词
  var zhang_systemPrompt = { role: 'system', content: '你是一个有用的助手' };

  // 消息计数
  var zhang_msgCount = 0;

  /**
   * 显示错误提示
   * @param {string} zhang_msg - 错误信息
   */
  function zhang_showAlert(zhang_msg) {
    zhang_alertText.textContent = zhang_msg;
    zhang_alertBox.hidden = false;
  }

  /**
   * 隐藏错误提示
   */
  function zhang_hideAlert() {
    zhang_alertBox.hidden = true;
  }

  /**
   * 更新消息计数
   */
  function zhang_updateCount() {
    zhang_countLabel.textContent = zhang_msgCount + ' 条消息';
  }

  /**
   * 创建一条消息气泡 DOM
   * @param {string} zhang_role - 'user' 或 'assistant'
   * @param {string} zhang_content - 消息内容
   * @returns {HTMLElement}
   */
  function zhang_createBubble(zhang_role, zhang_content) {
    var zhang_bubble = document.createElement('div');
    zhang_bubble.className = 'zhang_chat_msg zhang_chat_' + zhang_role;

    var zhang_avatar = document.createElement('div');
    zhang_avatar.className = 'zhang_chat_avatar';
    zhang_avatar.textContent = zhang_role === 'user' ? '我' : 'AI';

    var zhang_bubbleBody = document.createElement('div');
    zhang_bubbleBody.className = 'zhang_chat_bubble';

    // 将文本按换行分段渲染
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
   * 追加一条消息到聊天区域
   * @param {string} zhang_role - 'user' 或 'assistant'
   * @param {string} zhang_content - 消息内容
   */
  function zhang_appendMessage(zhang_role, zhang_content) {
    // 第一次发消息时移除欢迎语
    var zhang_welcome = zhang_chatList.querySelector('.zhang_chat_welcome');
    if (zhang_welcome) {
      zhang_welcome.remove();
    }

    var zhang_bubble = zhang_createBubble(zhang_role, zhang_content);
    zhang_chatList.appendChild(zhang_bubble);
    zhang_chatList.scrollTop = zhang_chatList.scrollHeight;
    zhang_msgCount++;
    zhang_updateCount();
  }

  /**
   * 创建加载中气泡（"AI 正在思考…"）
   * @returns {HTMLElement}
   */
  function zhang_createLoadingBubble() {
    var zhang_bubble = document.createElement('div');
    zhang_bubble.className = 'zhang_chat_msg zhang_chat_assistant zhang_chat_loading_msg';
    zhang_bubble.id = 'zhang_chat_loading';

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

  /**
   * 移除加载中气泡
   */
  function zhang_removeLoading() {
    var zhang_loading = document.getElementById('zhang_chat_loading');
    if (zhang_loading) {
      zhang_loading.remove();
    }
  }

  /**
   * 发送消息
   */
  function zhang_sendMessage() {
    var zhang_text = zhang_chatInput.value.trim();
    if (!zhang_text) {
      return;
    }

    zhang_hideAlert();

    // 在页面显示用户消息
    zhang_appendMessage('user', zhang_text);

    // 将用户消息加入历史
    zhang_chatHistory.push({ role: 'user', content: zhang_text });

    // 清空输入框
    zhang_chatInput.value = '';

    // 构造发送给后端的数据（包含系统提示 + 完整对话历史）
    var zhang_messages = [zhang_systemPrompt].concat(zhang_chatHistory);
    var zhang_sendData = {
      model: 'deepseek-ai/DeepSeek-V4-Flash',
      messages: zhang_messages
    };

    // 在浏览器控制台输出发送给大模型的数据
    console.log('===== 发送给大模型的数据 =====');
    console.log(JSON.stringify(zhang_sendData, null, 2));
    console.log('==============================');

    // 在页面展示发送数据
    zhang_sendRaw.textContent = JSON.stringify(zhang_sendData, null, 2);

    // 禁用发送按钮，显示加载中
    zhang_sendBtn.disabled = true;
    zhang_chatList.appendChild(zhang_createLoadingBubble());
    zhang_chatList.scrollTop = zhang_chatList.scrollHeight;

    // 发送请求到后端
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zhang_sendData)
    })
      .then(function (zhang_res) {
        return zhang_res.json();
      })
      .then(function (zhang_data) {
        // 在浏览器控制台输出从大模型接收到的数据（格式化 JSON 字符串，无需手动展开）
        console.log('===== 从大模型接收到的数据 =====');
        console.log(JSON.stringify(zhang_data, null, 2));
        console.log('================================');

        // 在页面展示接收数据
        zhang_recvRaw.textContent = JSON.stringify(zhang_data, null, 2);

        zhang_removeLoading();
        zhang_sendBtn.disabled = false;

        if (zhang_data.code === 0) {
          // 提取 AI 回复文本
          var zhang_reply = '';
          if (zhang_data.data && zhang_data.data.response && zhang_data.data.response.choices &&
              zhang_data.data.response.choices.length > 0) {
            zhang_reply = zhang_data.data.response.choices[0].message.content;
          } else {
            zhang_reply = '（未收到有效回复）';
          }

          // 在页面显示 AI 回复
          zhang_appendMessage('assistant', zhang_reply);

          // 将 AI 回复加入历史
          zhang_chatHistory.push({ role: 'assistant', content: zhang_reply });
        } else {
          zhang_showAlert(zhang_data.msg || 'AI 回复失败');
        }
      })
      .catch(function (zhang_err) {
        console.error('AI 聊天请求异常：', zhang_err);
        zhang_recvRaw.textContent = '请求异常：' + zhang_err.message;
        zhang_removeLoading();
        zhang_sendBtn.disabled = false;
        zhang_showAlert('请求异常：' + zhang_err.message);
      });
  }

  /**
   * 清空聊天
   */
  function zhang_clearChat() {
    zhang_chatHistory = [];
    zhang_msgCount = 0;
    zhang_updateCount();
    zhang_hideAlert();
    zhang_chatList.innerHTML = '';
    zhang_sendRaw.textContent = '暂无数据';
    zhang_recvRaw.textContent = '暂无数据';

    // 恢复欢迎语
    var zhang_welcome = document.createElement('div');
    zhang_welcome.className = 'zhang_chat_welcome';
    zhang_welcome.innerHTML =
      '<div class="zhang_chat_welcome_icon">AI</div>' +
      '<p class="zhang_chat_welcome_text">你好！我是 AI 助手，有什么可以帮你的吗？</p>';
    zhang_chatList.appendChild(zhang_welcome);
  }

  // 绑定事件
  zhang_sendBtn.addEventListener('click', zhang_sendMessage);

  zhang_clearBtn.addEventListener('click', zhang_clearChat);

  // Enter 发送，Shift + Enter 换行
  zhang_chatInput.addEventListener('keydown', function (zhang_event) {
    if (zhang_event.key === 'Enter' && !zhang_event.shiftKey) {
      zhang_event.preventDefault();
      zhang_sendMessage();
    }
  });

  // 自动调整输入框高度
  zhang_chatInput.addEventListener('input', function () {
    zhang_chatInput.style.height = 'auto';
    zhang_chatInput.style.height = Math.min(zhang_chatInput.scrollHeight, 120) + 'px';
  });
})();
