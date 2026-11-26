/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
*/

(function () {
  'use strict';

  var zhang_canvas = document.getElementById('zhang_canvas_bg');
  if (!zhang_canvas) {
    return;
  }

  var zhang_ctx = zhang_canvas.getContext('2d');
  var zhang_particles = [];
  var zhang_width = 0;
  var zhang_height = 0;
  var zhang_dpr = window.devicePixelRatio || 1;
  var zhang_linkDistance = 150;
  var zhang_mouse = { x: -9999, y: -9999, active: false };
  var zhang_reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 按画布面积计算粒子数量
  function zhang_getCount() {
    return Math.min(90, Math.round((zhang_width * zhang_height) / 16000));
  }

  // 初始化粒子（位置、速度、半径、透明度）
  function zhang_initParticles() {
    zhang_particles = [];
    var zhang_count = zhang_getCount();
    for (var zhang_i = 0; zhang_i < zhang_count; zhang_i++) {
      zhang_particles.push({
        x: Math.random() * zhang_width,
        y: Math.random() * zhang_height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1 + Math.random() * 2.2,
        alpha: 0.25 + Math.random() * 0.5
      });
    }
  }

  // 调整画布尺寸（适配高 DPI）
  function zhang_resize() {
    zhang_width = zhang_canvas.clientWidth || window.innerWidth;
    zhang_height = zhang_canvas.clientHeight || window.innerHeight;
    zhang_dpr = window.devicePixelRatio || 1;
    zhang_canvas.width = Math.round(zhang_width * zhang_dpr);
    zhang_canvas.height = Math.round(zhang_height * zhang_dpr);
    zhang_ctx.setTransform(zhang_dpr, 0, 0, zhang_dpr, 0, 0);
    zhang_initParticles();
  }

  // 绘制单帧
  function zhang_draw() {
    zhang_ctx.clearRect(0, 0, zhang_width, zhang_height);

    for (var zhang_i = 0; zhang_i < zhang_particles.length; zhang_i++) {
      var zhang_p = zhang_particles[zhang_i];

      // 连线（粒子之间）
      for (var zhang_j = zhang_i + 1; zhang_j < zhang_particles.length; zhang_j++) {
        var zhang_q = zhang_particles[zhang_j];
        var zhang_dx = zhang_p.x - zhang_q.x;
        var zhang_dy = zhang_p.y - zhang_q.y;
        var zhang_dist = Math.sqrt(zhang_dx * zhang_dx + zhang_dy * zhang_dy);
        if (zhang_dist < zhang_linkDistance) {
          var zhang_opacity = (1 - zhang_dist / zhang_linkDistance) * 0.28;
          zhang_ctx.strokeStyle = 'rgba(126, 214, 163,' + zhang_opacity.toFixed(3) + ')';
          zhang_ctx.lineWidth = 1;
          zhang_ctx.beginPath();
          zhang_ctx.moveTo(zhang_p.x, zhang_p.y);
          zhang_ctx.lineTo(zhang_q.x, zhang_q.y);
          zhang_ctx.stroke();
        }
      }

      // 连线（鼠标与粒子）
      if (zhang_mouse.active) {
        var zhang_mdx = zhang_p.x - zhang_mouse.x;
        var zhang_mdy = zhang_p.y - zhang_mouse.y;
        var zhang_mdist = Math.sqrt(zhang_mdx * zhang_mdx + zhang_mdy * zhang_mdy);
        if (zhang_mdist < zhang_linkDistance * 1.4) {
          var zhang_mopacity = (1 - zhang_mdist / (zhang_linkDistance * 1.4)) * 0.45;
          zhang_ctx.strokeStyle = 'rgba(242, 201, 109,' + zhang_mopacity.toFixed(3) + ')';
          zhang_ctx.lineWidth = 1;
          zhang_ctx.beginPath();
          zhang_ctx.moveTo(zhang_p.x, zhang_p.y);
          zhang_ctx.lineTo(zhang_mouse.x, zhang_mouse.y);
          zhang_ctx.stroke();
        }
      }

      // 粒子本体
      zhang_ctx.beginPath();
      zhang_ctx.fillStyle = 'rgba(168, 240, 198,' + zhang_p.alpha.toFixed(3) + ')';
      zhang_ctx.arc(zhang_p.x, zhang_p.y, zhang_p.r, 0, Math.PI * 2);
      zhang_ctx.fill();
    }
  }

  // 更新粒子位置
  function zhang_update() {
    for (var zhang_i = 0; zhang_i < zhang_particles.length; zhang_i++) {
      var zhang_p = zhang_particles[zhang_i];
      zhang_p.x += zhang_p.vx;
      zhang_p.y += zhang_p.vy;

      // 越界回绕
      if (zhang_p.x < -10) zhang_p.x = zhang_width + 10;
      if (zhang_p.x > zhang_width + 10) zhang_p.x = -10;
      if (zhang_p.y < -10) zhang_p.y = zhang_height + 10;
      if (zhang_p.y > zhang_height + 10) zhang_p.y = -10;
    }
  }

  // 动画循环
  function zhang_animate() {
    zhang_update();
    zhang_draw();
    window.requestAnimationFrame(zhang_animate);
  }

  // 鼠标跟踪
  function zhang_onMouseMove(zhang_event) {
    zhang_mouse.x = zhang_event.clientX;
    zhang_mouse.y = zhang_event.clientY;
    zhang_mouse.active = true;
  }

  function zhang_onMouseLeave() {
    zhang_mouse.active = false;
    zhang_mouse.x = -9999;
    zhang_mouse.y = -9999;
  }

  zhang_resize();
  zhang_draw();

  if (!zhang_reduceMotion) {
    window.requestAnimationFrame(zhang_animate);
  }

  window.addEventListener('resize', function () {
    zhang_resize();
    if (zhang_reduceMotion) {
      zhang_draw();
    }
  });

  window.addEventListener('mousemove', zhang_onMouseMove);
  window.addEventListener('mouseleave', zhang_onMouseLeave);
})();
