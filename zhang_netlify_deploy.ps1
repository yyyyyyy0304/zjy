# 姓名：【张婧雅】 | 学号：【24005240115】 |
# 时间：2026-11-26 | 大模型：DeepSeek-V4.1-Flash
# 说明：一键部署纯前端页面到 Netlify 公网（自动打包 -> 创建站点 -> 上传 -> 输出网址）
# 用法：双击 zhang_netlify_deploy.bat；首次运行需粘贴一次 Netlify Personal Access Token

param(
  [switch]$BuildOnly
)

$ErrorActionPreference = 'Stop'
$zhang_root = Split-Path -Parent $MyInvocation.MyCommand.Path
$zhang_front = Join-Path $zhang_root 'frontend'
$zhang_build = Join-Path $env:TEMP 'zhang_netlify_build'
$zhang_zip = Join-Path $env:TEMP 'zhang_netlify.zip'
$zhang_tokenFile = Join-Path $env:USERPROFILE '.zhang_netlify_token'
$zhang_siteName = 'zhang-tianyuan-24005240115'

function zhang_pause {
  Write-Host ''
  Read-Host '按回车键退出'
}

Write-Host '================================================'
Write-Host '   田园优选 · 纯前端页面 一键部署到 Netlify'
Write-Host '   张婧雅　24005240115'
Write-Host '================================================'
Write-Host ''

# ---------- 1. 检查项目文件 ----------
if (-not (Test-Path (Join-Path $zhang_front 'index.html'))) {
  Write-Host '[错误] 未找到 frontend\index.html，请确认项目目录完整。'
  zhang_pause
  exit 1
}

# ---------- 2. 生成部署包 ----------
Write-Host '[1/4] 正在生成纯前端部署包...'
if (Test-Path $zhang_build) { Remove-Item $zhang_build -Recurse -Force }
New-Item -ItemType Directory -Path $zhang_build | Out-Null

$zhang_files = @(
  'index.html', 'resume.html', 'ai-news.html',
  'css\style.css', 'css\zhang_home.css', 'css\zhang_resume.css', 'css\zhang_ai_news.css', 'css\zhang_guide.css',
  'js\zhang_canvas.js', 'js\zhang_resume.js', 'js\zhang_ai_news.js', 'js\vendor\supabase-js.umd.min.js'
)
$zhang_dirs = @('guide', 'images\screenshots')

foreach ($zhang_f in $zhang_files) {
  $zhang_src = Join-Path $zhang_front $zhang_f
  $zhang_dst = Join-Path $zhang_build $zhang_f
  New-Item -ItemType Directory -Path (Split-Path -Parent $zhang_dst) -Force | Out-Null
  Copy-Item $zhang_src $zhang_dst -Force
}
foreach ($zhang_d in $zhang_dirs) {
  $zhang_src = Join-Path $zhang_front $zhang_d
  $zhang_dst = Join-Path $zhang_build $zhang_d
  New-Item -ItemType Directory -Path $zhang_dst -Force | Out-Null
  Copy-Item (Join-Path $zhang_src '*') $zhang_dst -Recurse -Force
}

# 首页：去掉依赖后端的 pages.html 入口，调整统计数字与说明文案
$zhang_indexPath = Join-Path $zhang_build 'index.html'
$zhang_html = Get-Content -Raw -Encoding UTF8 $zhang_indexPath
$zhang_html = $zhang_html -replace '(?s)\s*<a class="zhang_home_front_card" href="\./pages\.html">.*?</a>', ''
$zhang_html = $zhang_html.Replace(
  '<div class="zhang_home_hero_stat"><strong>18</strong><span>全部页面入口</span></div>',
  '<div class="zhang_home_hero_stat"><strong>17</strong><span>线上可访问页面</span></div>'
)
$zhang_html = $zhang_html.Replace(
  '<p>每个使用后端接口的页面都配有一份独立说明文档，包含页面截图、功能要点与接口清单。</p>',
  '<p>每个使用后端接口的页面都配有一份独立说明文档，包含页面截图、功能要点与接口清单；线上演示版仅展示文档，接口部分需在本地运行后端服务。</p>'
)
[System.IO.File]::WriteAllText($zhang_indexPath, $zhang_html, (New-Object System.Text.UTF8Encoding($false)))

# 说明页：把「打开原页面」改为静态提示，避免线上死链
foreach ($zhang_g in (Get-ChildItem (Join-Path $zhang_build 'guide') -Filter '*.html')) {
  $zhang_gHtml = Get-Content -Raw -Encoding UTF8 $zhang_g.FullName
  $zhang_gHtml = $zhang_gHtml -replace '<a class="zhang_guide_open" href="\.\./[^"]+">打开原页面 →</a>', '<span class="zhang_guide_meta">线上演示版 · 接口需本地运行</span>'
  [System.IO.File]::WriteAllText($zhang_g.FullName, $zhang_gHtml, (New-Object System.Text.UTF8Encoding($false)))
}

# ---------- 3. 打包 ZIP（正斜杠路径，Netlify 可直接解压） ----------
Write-Host '[2/4] 正在打包 ZIP...'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (Test-Path $zhang_zip) { Remove-Item $zhang_zip -Force }
$zhang_zipStream = [System.IO.File]::Create($zhang_zip)
$zhang_archive = New-Object System.IO.Compression.ZipArchive($zhang_zipStream, [System.IO.Compression.ZipArchiveMode]::Create)
$zhang_all = Get-ChildItem $zhang_build -Recurse -File
foreach ($zhang_item in $zhang_all) {
  $zhang_entryName = $zhang_item.FullName.Substring($zhang_build.Length + 1).Replace('\', '/')
  $zhang_entry = $zhang_archive.CreateEntry($zhang_entryName, [System.IO.Compression.CompressionLevel]::Optimal)
  $zhang_entryStream = $zhang_entry.Open()
  $zhang_read = [System.IO.File]::OpenRead($zhang_item.FullName)
  $zhang_read.CopyTo($zhang_entryStream)
  $zhang_read.Close()
  $zhang_entryStream.Close()
}
$zhang_archive.Dispose()
$zhang_zipStream.Close()
$zhang_zipKB = [math]::Round((Get-Item $zhang_zip).Length / 1KB)
Write-Host ("[2/4] 打包完成：{0} 个文件，{1} KB" -f $zhang_all.Count, $zhang_zipKB)

if ($BuildOnly) {
  Write-Host '[仅打包模式] 已生成：' $zhang_zip
  zhang_pause
  exit 0
}

# ---------- 4. 取得 Netlify 授权令牌 ----------
$zhang_token = $env:NETLIFY_AUTH_TOKEN
if (-not $zhang_token -and (Test-Path $zhang_tokenFile)) {
  $zhang_saved = Get-Content -Raw $zhang_tokenFile
  if ($zhang_saved) { $zhang_token = $zhang_saved.Trim() }
}
if (-not $zhang_token) {
  Write-Host ''
  Write-Host '首次部署需要 Netlify 授权令牌：'
  Write-Host '  登录 Netlify -> 右上头像 -> User settings -> Applications -> Personal access tokens -> New access token'
  Write-Host ''
  $zhang_input = Read-Host '请粘贴 Personal Access Token（输入后回车，本地保存复用）'
  if ($zhang_input) { $zhang_token = $zhang_input.Trim() }
  if (-not $zhang_token) {
    Write-Host '[错误] 未输入令牌，部署中止。'
    zhang_pause
    exit 1
  }
  [System.IO.File]::WriteAllText($zhang_tokenFile, $zhang_token, (New-Object System.Text.UTF8Encoding($false)))
}

function zhang_api([string]$method, [string]$url, [string]$jsonBody, [string]$zipFile) {
  $zhang_args = @('-k', '-s', '-X', $method, $url, '-H', "Authorization: Bearer $zhang_token", '--max-time', '300')
  if ($jsonBody) {
    $zhang_bodyFile = Join-Path $env:TEMP 'zhang_netlify_body.json'
    [System.IO.File]::WriteAllText($zhang_bodyFile, $jsonBody, (New-Object System.Text.UTF8Encoding($false)))
    $zhang_args += @('-H', 'Content-Type: application/json', '--data-binary', ('@' + $zhang_bodyFile))
  } elseif ($zipFile) {
    $zhang_args += @('-H', 'Content-Type: application/zip', '--data-binary', ('@' + $zipFile))
  }
  $zhang_raw = & curl.exe @zhang_args
  return ($zhang_raw -join '')
}

# ---------- 5. 创建站点 ----------
Write-Host '[3/4] 正在创建 Netlify 站点...'
$zhang_siteJson = zhang_api 'POST' 'https://api.netlify.com/api/v1/sites' ('{"name":"' + $zhang_siteName + '"}') ''
$zhang_site = $null
try { $zhang_site = $zhang_siteJson | ConvertFrom-Json } catch { $zhang_site = $null }

if (-not $zhang_site -or -not $zhang_site.id) {
  Write-Host '[提示] 指定站点名不可用，改用自动生成名称重试...'
  $zhang_siteJson = zhang_api 'POST' 'https://api.netlify.com/api/v1/sites' '{}' ''
  try { $zhang_site = $zhang_siteJson | ConvertFrom-Json } catch { $zhang_site = $null }
}
if (-not $zhang_site -or -not $zhang_site.id) {
  Write-Host '[错误] 创建站点失败，接口返回：'
  Write-Host $zhang_siteJson
  zhang_pause
  exit 1
}
Write-Host ('[3/4] 站点已创建：' + $zhang_site.name)

# ---------- 6. 上传部署包 ----------
Write-Host '[4/4] 正在上传文件，请勿关闭窗口...'
$zhang_deployUrl = 'https://api.netlify.com/api/v1/sites/' + $zhang_site.id + '/deploys'
$zhang_deployJson = zhang_api 'POST' $zhang_deployUrl '' $zhang_zip
$zhang_deploy = $null
try { $zhang_deploy = $zhang_deployJson | ConvertFrom-Json } catch { $zhang_deploy = $null }
if (-not $zhang_deploy -or -not $zhang_deploy.id) {
  Write-Host '[错误] 上传失败，接口返回：'
  Write-Host $zhang_deployJson
  zhang_pause
  exit 1
}

# 等待部署完成
$zhang_state = $zhang_deploy.state
for ($zhang_i = 0; $zhang_i -lt 60; $zhang_i++) {
  if ($zhang_state -eq 'ready' -or $zhang_state -eq 'current') { break }
  Start-Sleep -Seconds 3
  $zhang_infoJson = zhang_api 'GET' ('https://api.netlify.com/api/v1/deploys/' + $zhang_deploy.id) '' ''
  try {
    $zhang_info = $zhang_infoJson | ConvertFrom-Json
    $zhang_state = $zhang_info.state
  } catch { }
}

$zhang_siteUrl = $zhang_site.ssl_url
if (-not $zhang_siteUrl) { $zhang_siteUrl = $zhang_site.url }

Write-Host ''
if ($zhang_state -eq 'ready' -or $zhang_state -eq 'current') {
  Write-Host '部署成功，公网地址：'
  Write-Host ('  ' + $zhang_siteUrl)
  Write-Host ('  管理后台：https://app.netlify.com/sites/' + $zhang_site.name)
} else {
  Write-Host ('部署已提交，当前状态：' + $zhang_state)
  Write-Host ('站点地址：' + $zhang_siteUrl)
}

Start-Process $zhang_siteUrl
zhang_pause
