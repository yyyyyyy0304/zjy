# 姓名：【张婧雅】 | 学号：【24005240115】 |
# 时间：2026-11-26 | 大模型：DeepSeek-V4.1-Flash
# 说明：生成纯静态目录 docs/（Trae 一键部署与 GitHub Pages 共用）
#       只收集不使用后台接口的页面（新首页、个人简历、15 份接口页面说明），
#       使用后台接口的页面（新闻、农产品、聊天、知识库、情感、图像、语音、登录注册、后台管理、Supabase 页面）不进入部署目录。

param(
  [switch]$NoOpen
)

$ErrorActionPreference = 'Stop'
$zhang_root = Split-Path -Parent $MyInvocation.MyCommand.Path
$zhang_front = Join-Path $zhang_root 'frontend'
$zhang_out = Join-Path $zhang_root 'docs'
$zhang_utf8 = New-Object System.Text.UTF8Encoding($false)

Write-Host '================================================'
Write-Host '   田园优选 · Trae 一键部署纯静态目录生成'
Write-Host '   张婧雅　24005240115'
Write-Host '================================================'
Write-Host ''

if (-not (Test-Path (Join-Path $zhang_front 'index.html'))) {
  Write-Host '[错误] 未找到 frontend\index.html，请确认项目目录完整。'
  exit 1
}

# ---------- 1. 重建部署目录 ----------
Write-Host '[1/4] 清理并重建 docs 目录...'
if (Test-Path $zhang_out) { Remove-Item $zhang_out -Recurse -Force }
New-Item -ItemType Directory -Path $zhang_out | Out-Null
# 关闭 Jekyll 处理，保证静态文件原样发布到 GitHub Pages
[System.IO.File]::WriteAllText((Join-Path $zhang_out '.nojekyll'), '', $zhang_utf8)

# ---------- 2. 复制静态页面与资源 ----------
Write-Host '[2/4] 复制纯静态页面与资源...'
$zhang_files = @(
  'resume.html',
  'css\style.css',
  'css\zhang_home.css',
  'css\zhang_resume.css',
  'css\zhang_guide.css',
  'js\zhang_canvas.js',
  'js\zhang_resume.js'
)
foreach ($zhang_f in $zhang_files) {
  $zhang_src = Join-Path $zhang_front $zhang_f
  $zhang_dst = Join-Path $zhang_out $zhang_f
  New-Item -ItemType Directory -Path (Split-Path -Parent $zhang_dst) -Force | Out-Null
  Copy-Item $zhang_src $zhang_dst -Force
}

New-Item -ItemType Directory -Path (Join-Path $zhang_out 'guide') -Force | Out-Null
Copy-Item (Join-Path $zhang_front 'guide\*.html') (Join-Path $zhang_out 'guide') -Force

New-Item -ItemType Directory -Path (Join-Path $zhang_out 'images\screenshots') -Force | Out-Null
Copy-Item (Join-Path $zhang_front 'images\screenshots\*.png') (Join-Path $zhang_out 'images\screenshots') -Force

# ---------- 3. 生成部署版首页（移除后台接口页面入口） ----------
Write-Host '[3/4] 生成部署版首页...'
$zhang_index = Get-Content -Raw -Encoding UTF8 (Join-Path $zhang_front 'index.html')

# 顶部导航：移除 Supabase 锚点
$zhang_index = $zhang_index -replace '(?s)\s*<a href="#zhang_home_supabase">.*?</a>', ''
# 主视觉按钮：移除 AI 新闻列表（Supabase 页面）
$zhang_index = $zhang_index -replace '(?s)\s*<a class="zhang_home_btn" href="\./ai-news\.html">.*?</a>', ''
# 纯前端卡片：移除 AI 新闻列表与 pages.html 存档
$zhang_index = $zhang_index -replace '(?s)\s*<a class="zhang_home_front_card" href="\./ai-news\.html">.*?</a>', ''
$zhang_index = $zhang_index -replace '(?s)\s*<a class="zhang_home_front_card" href="\./pages\.html">.*?</a>', ''
# 移除整个 Supabase 区块
$zhang_index = $zhang_index -replace '(?s)\s*<!-- Supabase -->\s*<section class="zhang_home_sec" id="zhang_home_supabase">.*?</section>', ''

# 首屏说明文案
$zhang_index = $zhang_index.Replace(
  '<p class="zhang_home_lead">纯前端页面与基于 Supabase 的页面集中在这里，个人简历单独突出展示；使用后端接口的页面，均提供带真实截图的说明文档。</p>',
  '<p class="zhang_home_lead">本页为 Trae 一键部署的线上静态演示版，仅包含不依赖后台接口的页面：个人简历与 15 份接口页面说明文档；使用后台接口的页面不推送到服务器，需在本地启动服务后访问。</p>'
)
# 统计数字
$zhang_index = $zhang_index.Replace(
  '<div class="zhang_home_hero_stat"><strong>2</strong><span>纯前端 / Supabase 页面</span></div>',
  '<div class="zhang_home_hero_stat"><strong>2</strong><span>纯静态页面</span></div>'
)
$zhang_index = $zhang_index.Replace(
  '<div class="zhang_home_hero_stat"><strong>18</strong><span>全部页面入口</span></div>',
  '<div class="zhang_home_hero_stat"><strong>17</strong><span>线上可访问页面</span></div>'
)
# 纯前端区块说明
$zhang_index = $zhang_index.Replace(
  '<p>不依赖后端接口，静态文件即可完整运行。</p>',
  '<p>不依赖后端接口，静态文件即可完整运行；依赖后台接口的页面不在本次线上部署范围内。</p>'
)
# 控制台日志
$zhang_index = $zhang_index.Replace(
  "console.log('[项目首页] 已加载：2 个纯前端 / Supabase 页面，15 个接口页面说明文档');",
  "console.log('[部署版首页] 已加载：纯静态页面，共 17 个线上入口；后台接口页面未部署');"
)

[System.IO.File]::WriteAllText((Join-Path $zhang_out 'index.html'), $zhang_index, $zhang_utf8)

# ---------- 4. 说明页：把「打开原页面」替换为静态提示 ----------
Write-Host '[4/4] 处理接口页面说明文档...'
foreach ($zhang_g in (Get-ChildItem (Join-Path $zhang_out 'guide') -Filter '*.html')) {
  $zhang_html = Get-Content -Raw -Encoding UTF8 $zhang_g.FullName
  $zhang_html = $zhang_html -replace '<a class="zhang_guide_open" href="\.\./[^"]+">打开原页面 →</a>', '<span class="zhang_guide_open">线上演示版 · 依赖后台接口，未部署</span>'
  [System.IO.File]::WriteAllText($zhang_g.FullName, $zhang_html, $zhang_utf8)
}

# ---------- 5. 结果汇总 ----------
$zhang_all = Get-ChildItem $zhang_out -Recurse -File
$zhang_totalKB = [math]::Round((($zhang_all | Measure-Object Length -Sum).Sum) / 1KB)
Write-Host ''
Write-Host ('[完成] 部署目录：' + $zhang_out)
Write-Host ('[完成] 文件数量：' + $zhang_all.Count + ' 个，合计约 ' + $zhang_totalKB + ' KB')
Write-Host ''
Write-Host '下一步：在 Trae 左侧插件市场安装并打开「一键部署」，'
Write-Host '在对话中说明「只部署 docs 目录，使用后台接口的页面不部署」即可上线。'
Write-Host ''

if (-not $NoOpen) {
  Start-Process explorer.exe $zhang_out
}
