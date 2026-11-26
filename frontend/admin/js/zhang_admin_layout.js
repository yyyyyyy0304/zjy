/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

// 管理后台公共布局：登录守卫、左侧导航、顶栏、退出登录
(function () {
  'use strict';

  var zhang_api = window.zhang_admin_api;

  // 未登录直接回登录页
  if (!zhang_api.getToken()) {
    location.replace('./login.html');
    return;
  }

  var zhang_pageMeta = {
    dashboard: { title: '仪表盘', desc: '后台核心数据总览，图表数据均来自数据库实时统计' },
    news: { title: '新闻管理', desc: '科技新闻的增删改查、关键词搜索与分页浏览' },
    produce: { title: '农产品管理', desc: '农产品图文信息的增删改查、关键词搜索与分页浏览' },
    users: { title: '用户管理', desc: '注册用户的增删改查、资料维护与密码重置' }
  };

  var zhang_page = document.body.getAttribute('data-zhang-page') || 'dashboard';
  var zhang_meta = zhang_pageMeta[zhang_page] || zhang_pageMeta.dashboard;

  var zhang_navList = [
    { key: 'dashboard', name: '仪表盘', icon: '▦', href: './index.html' },
    { key: 'news', name: '新闻管理', icon: '✎', href: './news.html' },
    { key: 'produce', name: '农产品管理', icon: '▤', href: './produce.html' },
    { key: 'users', name: '用户管理', icon: '◎', href: './users.html' }
  ];

  function zhang_renderSide() {
    var zhang_side = document.getElementById('zhang_admin_side');
    if (!zhang_side) {
      return;
    }

    var zhang_navHtml = zhang_navList
      .map(function (zhang_item) {
        var zhang_on = zhang_item.key === zhang_page ? ' zhang_admin_nav_on' : '';
        return (
          '<a class="' + zhang_on.trim() + '" href="' + zhang_item.href + '">' +
          '<i>' + zhang_item.icon + '</i><span>' + zhang_item.name + '</span></a>'
        );
      })
      .join('');

    zhang_side.innerHTML =
      '<a class="zhang_admin_logo" href="./index.html">' +
      '<span class="zhang_admin_logo_mark">田</span>' +
      '<span class="zhang_admin_logo_text"><b>田园优选</b><small>管理后台</small></span>' +
      '</a>' +
      '<nav class="zhang_admin_nav">' + zhang_navHtml +
      '<a href="../index.html" target="_blank"><i>↗</i><span>前台首页</span></a>' +
      '</nav>' +
      '<div class="zhang_admin_side_foot">张婧雅 · 24005240115<br />农产品销售网站后台</div>';
  }

  function zhang_renderTopbar() {
    var zhang_top = document.getElementById('zhang_admin_topbar');
    if (!zhang_top) {
      return;
    }

    var zhang_admin = zhang_api.getAdmin() || { username: 'admin', realname: '管理员', role: '管理员' };
    var zhang_display = zhang_admin.realname || zhang_admin.username;
    var zhang_avatar = String(zhang_display).slice(0, 1);

    zhang_top.innerHTML =
      '<div class="zhang_admin_topbar_title">' + zhang_api.escapeHtml(zhang_meta.title) +
      '<small>' + zhang_api.escapeHtml(zhang_meta.desc) + '</small></div>' +
      '<div class="zhang_admin_topbar_right">' +
      '<div class="zhang_admin_user">' +
      '<span class="zhang_admin_avatar">' + zhang_api.escapeHtml(zhang_avatar) + '</span>' +
      '<div><div class="zhang_admin_user_name">' + zhang_api.escapeHtml(zhang_display) + '</div>' +
      '<div class="zhang_admin_user_role">' + zhang_api.escapeHtml(zhang_admin.role || '管理员') + '</div></div>' +
      '</div>' +
      '<button class="zhang_admin_btn zhang_admin_btn_ghost zhang_admin_btn_sm" type="button" id="zhang_admin_logout">退出登录</button>' +
      '</div>';

    document.getElementById('zhang_admin_logout').addEventListener('click', function () {
      zhang_api.confirm('确定要退出登录吗？退出后需要重新输入管理员账号密码。', {
        title: '退出登录',
        okText: '退出登录'
      }).then(function (zhang_ok) {
        if (zhang_ok) {
          zhang_api.clearAuth();
          location.replace('./login.html');
        }
      });
    });
  }

  zhang_renderSide();
  zhang_renderTopbar();

  // 校验令牌是否仍然有效（过期或被篡改则回登录页）
  zhang_api.request('/api/admin/me').then(function (zhang_data) {
    console.log('管理员身份校验接口返回：', zhang_data);
    if (zhang_data && zhang_data.code === 0 && zhang_data.data && zhang_data.data.admin) {
      zhang_api.saveAuth(zhang_api.getToken(), zhang_data.data.admin);
    }
  });
})();
