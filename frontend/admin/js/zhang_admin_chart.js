/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

// 原生 Canvas 图表库：柱状图、折线图、环形图、横向条形图，数据全部来自后端接口
(function () {
  'use strict';

  var zhang_COLORS = ['#5fdba0', '#f2c96d', '#7ec8e3', '#c792ea', '#ff9f68', '#8be7ba', '#e38b8b', '#9db7a7'];
  var zhang_TEXT = '#e9f6ee';
  var zhang_MUTED = '#9db7a7';
  var zhang_GRID = 'rgba(126, 214, 163, 0.14)';
  var zhang_AXIS = 'rgba(126, 214, 163, 0.32)';
  var zhang_FONT = '12px "Microsoft YaHei", "PingFang SC", sans-serif';

  // 适配高分屏，返回画布尺寸与上下文
  function zhang_setup(zhang_canvas) {
    var zhang_width = zhang_canvas.clientWidth || zhang_canvas.parentNode.clientWidth || 480;
    var zhang_height = zhang_canvas.clientHeight || zhang_canvas.parentNode.clientHeight || 260;
    var zhang_dpr = window.devicePixelRatio || 1;
    zhang_canvas.width = Math.round(zhang_width * zhang_dpr);
    zhang_canvas.height = Math.round(zhang_height * zhang_dpr);
    var zhang_ctx = zhang_canvas.getContext('2d');
    zhang_ctx.setTransform(zhang_dpr, 0, 0, zhang_dpr, 0, 0);
    zhang_ctx.clearRect(0, 0, zhang_width, zhang_height);
    return { ctx: zhang_ctx, width: zhang_width, height: zhang_height };
  }

  // 取一个“好看”的坐标轴上限
  function zhang_niceMax(zhang_max) {
    if (!Number.isFinite(zhang_max) || zhang_max <= 0) {
      return 5;
    }
    var zhang_exponent = Math.pow(10, Math.floor(Math.log10(zhang_max)));
    var zhang_fraction = zhang_max / zhang_exponent;
    var zhang_niceFraction;
    if (zhang_fraction <= 1) {
      zhang_niceFraction = 1;
    } else if (zhang_fraction <= 2) {
      zhang_niceFraction = 2;
    } else if (zhang_fraction <= 5) {
      zhang_niceFraction = 5;
    } else {
      zhang_niceFraction = 10;
    }
    return zhang_niceFraction * zhang_exponent;
  }

  function zhang_roundRect(zhang_ctx, zhang_x, zhang_y, zhang_w, zhang_h, zhang_r) {
    var zhang_radius = Math.min(zhang_r, zhang_w / 2, zhang_h / 2);
    zhang_ctx.beginPath();
    zhang_ctx.moveTo(zhang_x + zhang_radius, zhang_y);
    zhang_ctx.lineTo(zhang_x + zhang_w - zhang_radius, zhang_y);
    zhang_ctx.quadraticCurveTo(zhang_x + zhang_w, zhang_y, zhang_x + zhang_w, zhang_y + zhang_radius);
    zhang_ctx.lineTo(zhang_x + zhang_w, zhang_y + zhang_h);
    zhang_ctx.lineTo(zhang_x, zhang_y + zhang_h);
    zhang_ctx.lineTo(zhang_x, zhang_y + zhang_radius);
    zhang_ctx.quadraticCurveTo(zhang_x, zhang_y, zhang_x + zhang_radius, zhang_y);
    zhang_ctx.closePath();
  }

  function zhang_empty(zhang_ctx, zhang_width, zhang_height, zhang_text) {
    zhang_ctx.fillStyle = zhang_MUTED;
    zhang_ctx.font = '13px "Microsoft YaHei", sans-serif';
    zhang_ctx.textAlign = 'center';
    zhang_ctx.textBaseline = 'middle';
    zhang_ctx.fillText(zhang_text || '暂无数据', zhang_width / 2, zhang_height / 2);
  }

  // 柱状图：data = [{ label, value }]
  function zhang_drawBar(zhang_canvas, zhang_data, zhang_options) {
    var zhang_opts = zhang_options || {};
    var zhang_view = zhang_setup(zhang_canvas);
    var zhang_ctx = zhang_view.ctx;
    var zhang_width = zhang_view.width;
    var zhang_height = zhang_view.height;

    if (!zhang_data || !zhang_data.length) {
      zhang_empty(zhang_ctx, zhang_width, zhang_height, '暂无数据');
      return;
    }

    var zhang_unit = zhang_opts.unit || '';
    var zhang_padLeft = 48;
    var zhang_padRight = 16;
    var zhang_padTop = 28;
    var zhang_padBottom = 46;
    var zhang_plotW = zhang_width - zhang_padLeft - zhang_padRight;
    var zhang_plotH = zhang_height - zhang_padTop - zhang_padBottom;
    var zhang_maxValue = 0;
    zhang_data.forEach(function (zhang_item) {
      zhang_maxValue = Math.max(zhang_maxValue, Number(zhang_item.value) || 0);
    });
    var zhang_max = zhang_niceMax(zhang_maxValue);

    // 横向网格与 Y 轴刻度
    zhang_ctx.font = zhang_FONT;
    zhang_ctx.textAlign = 'right';
    zhang_ctx.textBaseline = 'middle';
    for (var zhang_i = 0; zhang_i <= 4; zhang_i++) {
      var zhang_ratio = zhang_i / 4;
      var zhang_y = zhang_padTop + zhang_plotH - zhang_plotH * zhang_ratio;
      zhang_ctx.strokeStyle = zhang_i === 0 ? zhang_AXIS : zhang_GRID;
      zhang_ctx.lineWidth = 1;
      zhang_ctx.beginPath();
      zhang_ctx.moveTo(zhang_padLeft, zhang_y + 0.5);
      zhang_ctx.lineTo(zhang_padLeft + zhang_plotW, zhang_y + 0.5);
      zhang_ctx.stroke();
      zhang_ctx.fillStyle = zhang_MUTED;
      zhang_ctx.fillText(String(Math.round(zhang_max * zhang_ratio)), zhang_padLeft - 8, zhang_y);
    }

    // 柱子
    var zhang_count = zhang_data.length;
    var zhang_slot = zhang_plotW / zhang_count;
    var zhang_barW = Math.min(46, zhang_slot * 0.52);

    zhang_data.forEach(function (zhang_item, zhang_index) {
      var zhang_value = Number(zhang_item.value) || 0;
      var zhang_barH = zhang_max > 0 ? (zhang_value / zhang_max) * zhang_plotH : 0;
      var zhang_x = zhang_padLeft + zhang_slot * zhang_index + (zhang_slot - zhang_barW) / 2;
      var zhang_y = zhang_padTop + zhang_plotH - zhang_barH;

      var zhang_gradient = zhang_ctx.createLinearGradient(0, zhang_y, 0, zhang_padTop + zhang_plotH);
      zhang_gradient.addColorStop(0, zhang_index % 2 === 0 ? '#8be7ba' : '#f2c96d');
      zhang_gradient.addColorStop(1, zhang_index % 2 === 0 ? '#3ea87a' : '#c79a3c');
      zhang_ctx.fillStyle = zhang_gradient;
      zhang_roundRect(zhang_ctx, zhang_x, zhang_y, zhang_barW, Math.max(zhang_barH, 2), 6);
      zhang_ctx.fill();

      // 数值
      zhang_ctx.fillStyle = zhang_TEXT;
      zhang_ctx.font = '11px "Microsoft YaHei", sans-serif';
      zhang_ctx.textAlign = 'center';
      zhang_ctx.textBaseline = 'bottom';
      zhang_ctx.fillText(
        zhang_value + zhang_unit,
        zhang_x + zhang_barW / 2,
        Math.max(zhang_y - 5, zhang_padTop - 6)
      );

      // 分类名
      zhang_ctx.fillStyle = zhang_MUTED;
      zhang_ctx.font = zhang_FONT;
      zhang_ctx.textAlign = 'center';
      zhang_ctx.textBaseline = 'top';
      var zhang_label = String(zhang_item.label || '');
      if (zhang_label.length > 6) {
        zhang_label = zhang_label.slice(0, 6) + '…';
      }
      zhang_ctx.fillText(zhang_label, zhang_x + zhang_barW / 2, zhang_padTop + zhang_plotH + 12);
    });
  }

  // 折线图：data = [{ label, value }]
  function zhang_drawLine(zhang_canvas, zhang_data, zhang_options) {
    var zhang_opts = zhang_options || {};
    var zhang_view = zhang_setup(zhang_canvas);
    var zhang_ctx = zhang_view.ctx;
    var zhang_width = zhang_view.width;
    var zhang_height = zhang_view.height;

    if (!zhang_data || !zhang_data.length) {
      zhang_empty(zhang_ctx, zhang_width, zhang_height, '暂无数据');
      return;
    }

    var zhang_unit = zhang_opts.unit || '';
    var zhang_padLeft = 44;
    var zhang_padRight = 20;
    var zhang_padTop = 28;
    var zhang_padBottom = 38;
    var zhang_plotW = zhang_width - zhang_padLeft - zhang_padRight;
    var zhang_plotH = zhang_height - zhang_padTop - zhang_padBottom;
    var zhang_maxValue = 0;
    zhang_data.forEach(function (zhang_item) {
      zhang_maxValue = Math.max(zhang_maxValue, Number(zhang_item.value) || 0);
    });
    var zhang_max = zhang_niceMax(zhang_maxValue);

    zhang_ctx.font = zhang_FONT;
    for (var zhang_i = 0; zhang_i <= 4; zhang_i++) {
      var zhang_ratio = zhang_i / 4;
      var zhang_y = zhang_padTop + zhang_plotH - zhang_plotH * zhang_ratio;
      zhang_ctx.strokeStyle = zhang_i === 0 ? zhang_AXIS : zhang_GRID;
      zhang_ctx.lineWidth = 1;
      zhang_ctx.beginPath();
      zhang_ctx.moveTo(zhang_padLeft, zhang_y + 0.5);
      zhang_ctx.lineTo(zhang_padLeft + zhang_plotW, zhang_y + 0.5);
      zhang_ctx.stroke();
      zhang_ctx.fillStyle = zhang_MUTED;
      zhang_ctx.textAlign = 'right';
      zhang_ctx.textBaseline = 'middle';
      zhang_ctx.fillText(String(Math.round(zhang_max * zhang_ratio)), zhang_padLeft - 8, zhang_y);
    }

    var zhang_count = zhang_data.length;
    var zhang_step = zhang_count > 1 ? zhang_plotW / (zhang_count - 1) : 0;
    var zhang_points = zhang_data.map(function (zhang_item, zhang_index) {
      var zhang_value = Number(zhang_item.value) || 0;
      return {
        x: zhang_padLeft + (zhang_count > 1 ? zhang_step * zhang_index : zhang_plotW / 2),
        y: zhang_padTop + zhang_plotH - (zhang_max > 0 ? (zhang_value / zhang_max) * zhang_plotH : 0),
        value: zhang_value,
        label: String(zhang_item.label || '')
      };
    });

    // 渐变面积
    var zhang_area = zhang_ctx.createLinearGradient(0, zhang_padTop, 0, zhang_padTop + zhang_plotH);
    zhang_area.addColorStop(0, 'rgba(95, 219, 160, 0.34)');
    zhang_area.addColorStop(1, 'rgba(95, 219, 160, 0.02)');
    zhang_ctx.beginPath();
    zhang_points.forEach(function (zhang_point, zhang_index) {
      if (zhang_index === 0) {
        zhang_ctx.moveTo(zhang_point.x, zhang_point.y);
      } else {
        zhang_ctx.lineTo(zhang_point.x, zhang_point.y);
      }
    });
    zhang_ctx.lineTo(zhang_points[zhang_points.length - 1].x, zhang_padTop + zhang_plotH);
    zhang_ctx.lineTo(zhang_points[0].x, zhang_padTop + zhang_plotH);
    zhang_ctx.closePath();
    zhang_ctx.fillStyle = zhang_area;
    zhang_ctx.fill();

    // 折线
    zhang_ctx.beginPath();
    zhang_points.forEach(function (zhang_point, zhang_index) {
      if (zhang_index === 0) {
        zhang_ctx.moveTo(zhang_point.x, zhang_point.y);
      } else {
        zhang_ctx.lineTo(zhang_point.x, zhang_point.y);
      }
    });
    zhang_ctx.strokeStyle = '#5fdba0';
    zhang_ctx.lineWidth = 2;
    zhang_ctx.lineJoin = 'round';
    zhang_ctx.stroke();

    var zhang_labelStep = Math.ceil(zhang_count / 8);
    zhang_points.forEach(function (zhang_point, zhang_index) {
      // 数据点
      zhang_ctx.beginPath();
      zhang_ctx.arc(zhang_point.x, zhang_point.y, 3.6, 0, Math.PI * 2);
      zhang_ctx.fillStyle = '#07140e';
      zhang_ctx.fill();
      zhang_ctx.strokeStyle = '#f2c96d';
      zhang_ctx.lineWidth = 2;
      zhang_ctx.stroke();

      // 数值
      zhang_ctx.fillStyle = zhang_TEXT;
      zhang_ctx.font = '11px "Microsoft YaHei", sans-serif';
      zhang_ctx.textAlign = 'center';
      zhang_ctx.textBaseline = 'bottom';
      zhang_ctx.fillText(zhang_point.value + zhang_unit, zhang_point.x, zhang_point.y - 8);

      // X 轴标签（过密时隔点显示）
      if (zhang_index % zhang_labelStep === 0 || zhang_index === zhang_count - 1) {
        zhang_ctx.fillStyle = zhang_MUTED;
        zhang_ctx.font = zhang_FONT;
        zhang_ctx.textAlign = 'center';
        zhang_ctx.textBaseline = 'top';
        zhang_ctx.fillText(zhang_point.label, zhang_point.x, zhang_padTop + zhang_plotH + 10);
      }
    });
  }

  // 环形图：data = [{ label, value }]，右侧带图例
  function zhang_drawDonut(zhang_canvas, zhang_data, zhang_options) {
    var zhang_opts = zhang_options || {};
    var zhang_view = zhang_setup(zhang_canvas);
    var zhang_ctx = zhang_view.ctx;
    var zhang_width = zhang_view.width;
    var zhang_height = zhang_view.height;

    if (!zhang_data || !zhang_data.length) {
      zhang_empty(zhang_ctx, zhang_width, zhang_height, '暂无数据');
      return;
    }

    var zhang_total = 0;
    zhang_data.forEach(function (zhang_item) {
      zhang_total += Number(zhang_item.value) || 0;
    });
    if (zhang_total <= 0) {
      zhang_empty(zhang_ctx, zhang_width, zhang_height, '暂无数据');
      return;
    }

    var zhang_legendW = Math.min(150, zhang_width * 0.42);
    var zhang_centerX = (zhang_width - zhang_legendW) / 2;
    var zhang_centerY = zhang_height / 2;
    var zhang_radius = Math.max(38, Math.min((zhang_height - 44) / 2, (zhang_width - zhang_legendW - 24) / 2));
    var zhang_inner = zhang_radius * 0.62;

    var zhang_start = -Math.PI / 2;
    zhang_data.forEach(function (zhang_item, zhang_index) {
      var zhang_value = Number(zhang_item.value) || 0;
      var zhang_angle = (zhang_value / zhang_total) * Math.PI * 2;
      var zhang_gap = Math.min(0.028, zhang_angle / 5);
      zhang_ctx.beginPath();
      zhang_ctx.moveTo(zhang_centerX, zhang_centerY);
      zhang_ctx.arc(zhang_centerX, zhang_centerY, zhang_radius, zhang_start + zhang_gap, zhang_start + zhang_angle - zhang_gap);
      zhang_ctx.closePath();
      zhang_ctx.fillStyle = zhang_COLORS[zhang_index % zhang_COLORS.length];
      zhang_ctx.fill();
      zhang_start += zhang_angle;
    });

    // 中心挖空
    zhang_ctx.beginPath();
    zhang_ctx.arc(zhang_centerX, zhang_centerY, zhang_inner, 0, Math.PI * 2);
    zhang_ctx.fillStyle = '#0e2219';
    zhang_ctx.fill();

    zhang_ctx.textAlign = 'center';
    zhang_ctx.fillStyle = zhang_TEXT;
    zhang_ctx.font = '700 20px Consolas, "Courier New", monospace';
    zhang_ctx.textBaseline = 'middle';
    zhang_ctx.fillText(String(zhang_total), zhang_centerX, zhang_centerY - 8);
    zhang_ctx.fillStyle = zhang_MUTED;
    zhang_ctx.font = zhang_FONT;
    zhang_ctx.fillText(zhang_opts.centerLabel || '总计', zhang_centerX, zhang_centerY + 14);

    // 图例
    var zhang_legendX = zhang_width - zhang_legendW + 6;
    var zhang_rowH = Math.min(30, (zhang_height - 30) / zhang_data.length);
    var zhang_legendTop = zhang_centerY - (zhang_data.length * zhang_rowH) / 2 + zhang_rowH / 2;
    zhang_data.forEach(function (zhang_item, zhang_index) {
      var zhang_y = zhang_legendTop + zhang_index * zhang_rowH;
      zhang_ctx.fillStyle = zhang_COLORS[zhang_index % zhang_COLORS.length];
      zhang_ctx.beginPath();
      zhang_ctx.arc(zhang_legendX + 4, zhang_y, 4, 0, Math.PI * 2);
      zhang_ctx.fill();

      zhang_ctx.fillStyle = zhang_TEXT;
      zhang_ctx.font = zhang_FONT;
      zhang_ctx.textAlign = 'left';
      zhang_ctx.textBaseline = 'middle';
      var zhang_name = String(zhang_item.label || '');
      if (zhang_name.length > 6) {
        zhang_name = zhang_name.slice(0, 6) + '…';
      }
      zhang_ctx.fillText(zhang_name, zhang_legendX + 14, zhang_y);

      zhang_ctx.fillStyle = zhang_MUTED;
      zhang_ctx.textAlign = 'right';
      var zhang_value = Number(zhang_item.value) || 0;
      var zhang_pct = Math.round((zhang_value / zhang_total) * 100);
      zhang_ctx.fillText(zhang_value + ' · ' + zhang_pct + '%', zhang_width - 4, zhang_y);
    });
  }

  // 横向条形图：data = [{ label, value }]
  function zhang_drawHBar(zhang_canvas, zhang_data, zhang_options) {
    var zhang_opts = zhang_options || {};
    var zhang_view = zhang_setup(zhang_canvas);
    var zhang_ctx = zhang_view.ctx;
    var zhang_width = zhang_view.width;
    var zhang_height = zhang_view.height;

    if (!zhang_data || !zhang_data.length) {
      zhang_empty(zhang_ctx, zhang_width, zhang_height, '暂无数据');
      return;
    }

    var zhang_unit = zhang_opts.unit || '';
    var zhang_padLeft = 84;
    var zhang_padRight = 62;
    var zhang_padTop = 18;
    var zhang_padBottom = 14;
    var zhang_plotW = zhang_width - zhang_padLeft - zhang_padRight;
    var zhang_plotH = zhang_height - zhang_padTop - zhang_padBottom;
    var zhang_max = 0;
    zhang_data.forEach(function (zhang_item) {
      zhang_max = Math.max(zhang_max, Number(zhang_item.value) || 0);
    });
    if (zhang_max <= 0) {
      zhang_max = 1;
    }

    var zhang_rowH = zhang_plotH / zhang_data.length;
    var zhang_barH = Math.min(18, zhang_rowH * 0.5);

    zhang_data.forEach(function (zhang_item, zhang_index) {
      var zhang_value = Number(zhang_item.value) || 0;
      var zhang_y = zhang_padTop + zhang_index * zhang_rowH + (zhang_rowH - zhang_barH) / 2;
      var zhang_barW = Math.max((zhang_value / zhang_max) * zhang_plotW, 2);

      // 轨道
      zhang_ctx.fillStyle = 'rgba(126, 214, 163, 0.08)';
      zhang_roundRect(zhang_ctx, zhang_padLeft, zhang_y, zhang_plotW, zhang_barH, zhang_barH / 2);
      zhang_ctx.fill();

      // 条形
      var zhang_gradient = zhang_ctx.createLinearGradient(zhang_padLeft, 0, zhang_padLeft + zhang_barW, 0);
      zhang_gradient.addColorStop(0, zhang_COLORS[zhang_index % zhang_COLORS.length]);
      zhang_gradient.addColorStop(1, '#8be7ba');
      zhang_ctx.fillStyle = zhang_gradient;
      zhang_roundRect(zhang_ctx, zhang_padLeft, zhang_y, zhang_barW, zhang_barH, zhang_barH / 2);
      zhang_ctx.fill();

      // 名称
      zhang_ctx.fillStyle = zhang_TEXT;
      zhang_ctx.font = zhang_FONT;
      zhang_ctx.textAlign = 'right';
      zhang_ctx.textBaseline = 'middle';
      var zhang_label = String(zhang_item.label || '');
      if (zhang_label.length > 6) {
        zhang_label = zhang_label.slice(0, 6) + '…';
      }
      zhang_ctx.fillText(zhang_label, zhang_padLeft - 10, zhang_y + zhang_barH / 2);

      // 数值
      zhang_ctx.fillStyle = zhang_MUTED;
      zhang_ctx.textAlign = 'left';
      zhang_ctx.fillText(zhang_value + zhang_unit, zhang_padLeft + zhang_barW + 8, zhang_y + zhang_barH / 2);
    });
  }

  // 窗口尺寸变化时重绘（防抖）
  var zhang_resizeTimer = null;
  function zhang_bindResize(zhang_fn) {
    window.addEventListener('resize', function () {
      if (zhang_resizeTimer) {
        clearTimeout(zhang_resizeTimer);
      }
      zhang_resizeTimer = setTimeout(function () {
        zhang_fn();
      }, 160);
    });
  }

  window.zhang_admin_chart = {
    drawBar: zhang_drawBar,
    drawLine: zhang_drawLine,
    drawDonut: zhang_drawDonut,
    drawHBar: zhang_drawHBar,
    bindResize: zhang_bindResize
  };
})();
