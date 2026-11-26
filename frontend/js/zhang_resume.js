/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-26 | 大模型：DeepSeek-V4.1-Flash
说明：个人简历页面交互，包含 Canvas 粒子背景动画、滚动入场动画与打印按钮
*/

(function () {
  'use strict';

  var zhang_canvas = document.getElementById('zhang_resume_canvas');
  var zhang_ctx = zhang_canvas.getContext('2d');
  var zhang_width = 0;
  var zhang_height = 0;
  var zhang_dpr = Math.min(window.devicePixelRatio || 1, 2);
  var zhang_particles = [];
  var zhang_mouse = { x: -9999, y: -9999 };
  var zhang_reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var zhang_rafId = null;

  var ZHANG_LINK_DISTANCE = 132;
  var ZHANG_MOUSE_DISTANCE = 150;

  // ===== Canvas 尺寸 =====
  function zhang_resizeCanvas() {
    zhang_width = window.innerWidth;
    zhang_height = window.innerHeight;
    zhang_canvas.width = Math.floor(zhang_width * zhang_dpr);
    zhang_canvas.height = Math.floor(zhang_height * zhang_dpr);
    zhang_canvas.style.width = zhang_width + 'px';
    zhang_canvas.style.height = zhang_height + 'px';
    zhang_ctx.setTransform(zhang_dpr, 0, 0, zhang_dpr, 0, 0);
    zhang_buildParticles();
  }

  // ===== 生成粒子 =====
  function zhang_buildParticles() {
    var zhang_count = Math.min(96, Math.max(34, Math.round((zhang_width * zhang_height) / 19000)));
    zhang_particles = [];
    for (var zhang_i = 0; zhang_i < zhang_count; zhang_i++) {
      zhang_particles.push({
        x: Math.random() * zhang_width,
        y: Math.random() * zhang_height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 2 + 1,
        gold: Math.random() > 0.82
      });
    }
  }

  // ===== 绘制单帧 =====
  function zhang_drawFrame() {
    zhang_ctx.clearRect(0, 0, zhang_width, zhang_height);

    var zhang_i;
    var zhang_j;

    for (zhang_i = 0; zhang_i < zhang_particles.length; zhang_i++) {
      var zhang_a = zhang_particles[zhang_i];

      if (!zhang_reduceMotion) {
        zhang_a.x += zhang_a.vx;
        zhang_a.y += zhang_a.vy;

        if (zhang_a.x < -20) { zhang_a.x = zhang_width + 20; }
        if (zhang_a.x > zhang_width + 20) { zhang_a.x = -20; }
        if (zhang_a.y < -20) { zhang_a.y = zhang_height + 20; }
        if (zhang_a.y > zhang_height + 20) { zhang_a.y = -20; }

        var zhang_dx = zhang_a.x - zhang_mouse.x;
        var zhang_dy = zhang_a.y - zhang_mouse.y;
        var zhang_md = Math.sqrt(zhang_dx * zhang_dx + zhang_dy * zhang_dy);
        if (zhang_md > 0 && zhang_md < ZHANG_MOUSE_DISTANCE) {
          var zhang_force = (ZHANG_MOUSE_DISTANCE - zhang_md) / ZHANG_MOUSE_DISTANCE;
          zhang_a.x += (zhang_dx / zhang_md) * zhang_force * 0.9;
          zhang_a.y += (zhang_dy / zhang_md) * zhang_force * 0.9;
        }
      }

      // 粒子连线
      for (zhang_j = zhang_i + 1; zhang_j < zhang_particles.length; zhang_j++) {
        var zhang_b = zhang_particles[zhang_j];
        var zhang_lx = zhang_a.x - zhang_b.x;
        var zhang_ly = zhang_a.y - zhang_b.y;
        var zhang_dist = Math.sqrt(zhang_lx * zhang_lx + zhang_ly * zhang_ly);
        if (zhang_dist < ZHANG_LINK_DISTANCE) {
          var zhang_alpha = (1 - zhang_dist / ZHANG_LINK_DISTANCE) * 0.26;
          zhang_ctx.beginPath();
          zhang_ctx.moveTo(zhang_a.x, zhang_a.y);
          zhang_ctx.lineTo(zhang_b.x, zhang_b.y);
          zhang_ctx.strokeStyle = 'rgba(31, 157, 107, ' + zhang_alpha.toFixed(3) + ')';
          zhang_ctx.lineWidth = 0.7;
          zhang_ctx.stroke();
        }
      }

      // 鼠标连线
      var zhang_mDistx = zhang_a.x - zhang_mouse.x;
      var zhang_mDisty = zhang_a.y - zhang_mouse.y;
      var zhang_mDist = Math.sqrt(zhang_mDistx * zhang_mDistx + zhang_mDisty * zhang_mDisty);
      if (zhang_mDist < ZHANG_MOUSE_DISTANCE) {
        var zhang_mAlpha = (1 - zhang_mDist / ZHANG_MOUSE_DISTANCE) * 0.3;
        zhang_ctx.beginPath();
        zhang_ctx.moveTo(zhang_a.x, zhang_a.y);
        zhang_ctx.lineTo(zhang_mouse.x, zhang_mouse.y);
        zhang_ctx.strokeStyle = 'rgba(184, 130, 44, ' + zhang_mAlpha.toFixed(3) + ')';
        zhang_ctx.lineWidth = 0.8;
        zhang_ctx.stroke();
      }

      // 粒子本体
      zhang_ctx.beginPath();
      zhang_ctx.arc(zhang_a.x, zhang_a.y, zhang_a.r, 0, Math.PI * 2);
      zhang_ctx.fillStyle = zhang_a.gold ? 'rgba(184, 130, 44, 0.55)' : 'rgba(31, 157, 107, 0.5)';
      zhang_ctx.fill();
    }

    if (!zhang_reduceMotion) {
      zhang_rafId = window.requestAnimationFrame(zhang_drawFrame);
    }
  }

  function zhang_startCanvas() {
    zhang_resizeCanvas();
    if (zhang_rafId) {
      window.cancelAnimationFrame(zhang_rafId);
      zhang_rafId = null;
    }
    zhang_drawFrame();
  }

  // ===== 滚动入场动画 =====
  function zhang_initReveal() {
    var zhang_items = Array.prototype.slice.call(document.querySelectorAll('.zhang_resume_reveal'));

    if (!('IntersectionObserver' in window) || zhang_reduceMotion) {
      zhang_items.forEach(function (zhang_el) {
        zhang_el.classList.add('zhang_resume_in');
      });
      return;
    }

    var zhang_observer = new IntersectionObserver(function (zhang_entries) {
      zhang_entries.forEach(function (zhang_entry, zhang_index) {
        if (zhang_entry.isIntersecting) {
          var zhang_target = zhang_entry.target;
          window.setTimeout(function () {
            zhang_target.classList.add('zhang_resume_in');
          }, (zhang_index % 4) * 90);
          zhang_observer.unobserve(zhang_target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    zhang_items.forEach(function (zhang_el) {
      zhang_observer.observe(zhang_el);
    });
  }

  // ===== 打印 =====
  function zhang_initPrint() {
    var zhang_btn = document.getElementById('zhang_resume_print_btn');
    if (!zhang_btn) {
      return;
    }
    zhang_btn.addEventListener('click', function () {
      console.log('[简历] 触发打印 / 保存 PDF');
      window.print();
    });
  }

  // ===== 事件 =====
  var zhang_resizeTimer = null;
  window.addEventListener('resize', function () {
    window.clearTimeout(zhang_resizeTimer);
    zhang_resizeTimer = window.setTimeout(zhang_startCanvas, 180);
  });

  window.addEventListener('mousemove', function (zhang_event) {
    zhang_mouse.x = zhang_event.clientX;
    zhang_mouse.y = zhang_event.clientY;
  });

  window.addEventListener('mouseout', function () {
    zhang_mouse.x = -9999;
    zhang_mouse.y = -9999;
  });

  // ===== 初始化 =====
  zhang_startCanvas();
  zhang_initReveal();
  zhang_initPrint();
  console.log('[简历] 页面初始化完成，Canvas 粒子数量：' + zhang_particles.length);
})();
