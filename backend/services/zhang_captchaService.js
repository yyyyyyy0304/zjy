/*
姓名：【张婧雅】 | 学号：【24005240115】 |
时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const zhang_crypto = require('crypto');

// 去掉易混淆字符（0/O/1/I），验证码存入内存并设置 5 分钟有效期
const zhang_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const zhang_TTL = 5 * 60 * 1000;
const zhang_MAX_SIZE = 1000;
const zhang_store = new Map();

function zhang_randInt(zhang_min, zhang_max) {
  return zhang_crypto.randomInt(zhang_min, zhang_max + 1);
}

// 清理过期验证码，并限制内存占用
function zhang_cleanup() {
  const zhang_now = Date.now();
  zhang_store.forEach(function (zhang_value, zhang_key) {
    if (zhang_value.expire <= zhang_now) {
      zhang_store.delete(zhang_key);
    }
  });
  while (zhang_store.size > zhang_MAX_SIZE) {
    zhang_store.delete(zhang_store.keys().next().value);
  }
}

// 生成验证码 SVG 图片（干扰线 + 噪点 + 随机旋转字符）
function zhang_buildSvg(zhang_code) {
  const zhang_colors = ['#5fdba0', '#a8f0c6', '#f2c96d', '#7ecbff', '#ffb3c7'];
  const zhang_strokes = ['#5fdba0', '#f2c96d', '#7ecbff'];

  let zhang_chars = '';
  zhang_code.split('').forEach(function (zhang_char, zhang_index) {
    const zhang_x = 20 + zhang_index * 26;
    const zhang_y = zhang_randInt(27, 33);
    const zhang_rotate = zhang_randInt(-20, 20);
    const zhang_size = zhang_randInt(22, 27);
    const zhang_color = zhang_colors[zhang_randInt(0, zhang_colors.length - 1)];
    zhang_chars +=
      '<text x="' + zhang_x + '" y="' + zhang_y + '" fill="' + zhang_color + '" font-size="' + zhang_size +
      '" font-family="Consolas,Menlo,monospace" font-weight="700" transform="rotate(' + zhang_rotate + ' ' +
      zhang_x + ' ' + zhang_y + ')">' + zhang_char + '</text>';
  });

  let zhang_noise = '';
  for (let zhang_i = 0; zhang_i < 3; zhang_i++) {
    zhang_noise +=
      '<line x1="' + zhang_randInt(0, 30) + '" y1="' + zhang_randInt(4, 40) + '" x2="' + zhang_randInt(90, 120) +
      '" y2="' + zhang_randInt(4, 40) + '" stroke="' + zhang_strokes[zhang_randInt(0, zhang_strokes.length - 1)] +
      '" stroke-width="1" opacity="0.45" />';
  }
  for (let zhang_j = 0; zhang_j < 24; zhang_j++) {
    zhang_noise +=
      '<circle cx="' + zhang_randInt(2, 118) + '" cy="' + zhang_randInt(2, 42) + '" r="' + zhang_randInt(1, 2) +
      '" fill="' + zhang_strokes[zhang_randInt(0, zhang_strokes.length - 1)] + '" opacity="0.35" />';
  }

  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="44" viewBox="0 0 120 44">' +
    '<rect width="120" height="44" rx="8" fill="#0a1c14" />' + zhang_noise + zhang_chars + '</svg>'
  );
}

// 生成验证码，返回编号与 SVG 图片
function zhang_createCaptcha() {
  let zhang_code = '';
  for (let zhang_i = 0; zhang_i < 4; zhang_i++) {
    zhang_code += zhang_CHARS[zhang_randInt(0, zhang_CHARS.length - 1)];
  }

  const zhang_id = zhang_crypto.randomBytes(12).toString('hex');
  zhang_cleanup();
  zhang_store.set(zhang_id, { code: zhang_code, expire: Date.now() + zhang_TTL });

  return {
    captchaId: zhang_id,
    svg: zhang_buildSvg(zhang_code),
    expireIn: zhang_TTL / 1000
  };
}

// 校验验证码：无论成功失败都立即作废，防止重复使用
function zhang_verifyCaptcha(zhang_id, zhang_input) {
  if (!zhang_id || !zhang_input) {
    return false;
  }

  const zhang_item = zhang_store.get(String(zhang_id));
  if (!zhang_item) {
    return false;
  }
  zhang_store.delete(String(zhang_id));

  if (zhang_item.expire <= Date.now()) {
    return false;
  }

  return zhang_item.code.toLowerCase() === String(zhang_input).trim().toLowerCase();
}

module.exports = {
  zhang_createCaptcha,
  zhang_verifyCaptcha
};
