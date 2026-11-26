# 姓名：【张婧雅】 | 学号：【24005240115】 |
# 时间：2026-11-26 | 大模型：DeepSeek-V4.1-Flash
# 说明：田园优选项目一键部署启动脚本，检查环境 -> 安装依赖 -> 启动 8115 服务 -> 打开首页

$ErrorActionPreference = 'Stop'
$zhang_root = Split-Path -Parent $MyInvocation.MyCommand.Path
$zhang_back = Join-Path $zhang_root 'backend'
$zhang_front = Join-Path $zhang_root 'frontend'
$zhang_url = 'http://localhost:8115/index.html'
$zhang_port = 8115

function zhang_pause {
  Write-Host ''
  Read-Host '按回车键退出'
}

Write-Host '================================================'
Write-Host '   田园优选 · 农产品销售网站　一键部署启动'
Write-Host '   张婧雅　24005240115'
Write-Host '================================================'
Write-Host ''

# 1. 检查 Node.js
$zhang_node = Get-Command node -ErrorAction SilentlyContinue
if (-not $zhang_node) {
  Write-Host '[错误] 未检测到 Node.js，请先安装 Node.js 后重试。'
  zhang_pause
  exit 1
}
Write-Host ('[环境] Node.js ' + (node -v))

# 2. 检查前端首页
if (-not (Test-Path (Join-Path $zhang_front 'index.html'))) {
  Write-Host '[错误] 未找到 frontend\index.html，请确认项目目录完整。'
  zhang_pause
  exit 1
}

# 3. 检查 8115 端口是否已在运行
$zhang_running = Get-NetTCPConnection -LocalPort $zhang_port -State Listen -ErrorAction SilentlyContinue
if ($zhang_running) {
  Write-Host '[提示] 检测到 8115 端口已有服务在运行，直接打开首页。'
} else {
  # 4. 安装后端依赖（优先 cnpm，否则用 npm 国内镜像）
  if (Test-Path (Join-Path $zhang_back 'node_modules')) {
    Write-Host '[1/3] 后端依赖已存在，跳过安装。'
  } else {
    Write-Host '[1/3] 正在安装后端依赖，请稍候...'
    Push-Location $zhang_back
    $zhang_cnpm = Get-Command cnpm -ErrorAction SilentlyContinue
    if ($zhang_cnpm) {
      & cnpm install
    } else {
      & npm install --registry=https://registry.npmmirror.com
    }
    Pop-Location
    if (-not (Test-Path (Join-Path $zhang_back 'node_modules'))) {
      Write-Host '[错误] 依赖安装失败，请进入 backend 目录手动执行 npm install。'
      zhang_pause
      exit 1
    }
    Write-Host '[1/3] 依赖安装完成。'
  }

  # 5. 检查数据库配置文件
  if (-not (Test-Path (Join-Path $zhang_back '.env'))) {
    Write-Host '[提示] 未找到 backend\.env，数据库相关接口可能无法使用。'
  }

  # 6. 启动后端服务（独立命令行窗口，便于查看日志）
  Write-Host '[2/3] 正在启动后端服务（端口 8115）...'
  $zhang_cmd = '/k cd /d "' + $zhang_back + '" && node app.js'
  Start-Process -FilePath 'cmd.exe' -ArgumentList $zhang_cmd -WorkingDirectory $zhang_back

  # 等待端口就绪，最多 20 秒
  $zhang_ready = $false
  for ($zhang_i = 0; $zhang_i -lt 20; $zhang_i++) {
    Start-Sleep -Seconds 1
    if (Get-NetTCPConnection -LocalPort $zhang_port -State Listen -ErrorAction SilentlyContinue) {
      $zhang_ready = $true
      break
    }
  }
  if ($zhang_ready) {
    Write-Host '[2/3] 服务启动成功。'
  } else {
    Write-Host '[提示] 服务尚未监听 8115 端口，请查看新打开的命令行窗口日志。'
  }
}

# 7. 打开首页
Write-Host ('[3/3] 正在打开首页：' + $zhang_url)
Start-Process $zhang_url
Write-Host ''
Write-Host '启动完成。关闭本窗口不会停止服务；'
Write-Host '如需停止服务，请关闭新打开的 node app.js 命令行窗口。'
zhang_pause
