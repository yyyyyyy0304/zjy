@echo off
REM ============================================================
REM 姓名：【张婧雅】 | 学号：【24005240115】 |
REM 时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
REM 作用：安装后端依赖（如缺失）并启动后端服务（端口 8115）
REM ============================================================

set "zhang_root=%~dp0"
set "zhang_backend=%zhang_root%backend"

cd /d "%zhang_backend%"
if errorlevel 1 (
  echo [错误] 未找到 backend 目录：%zhang_backend%
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [提示] 未检测到 node_modules，正在安装依赖...
  call cnpm i
  if errorlevel 1 (
    echo [提示] cnpm 安装失败，改用 npm 安装...
    call npm i
    if errorlevel 1 (
      echo [错误] 依赖安装失败，请检查网络或 cnpm/npm 配置。
      pause
      exit /b 1
    )
  )
)

echo [启动] 后端服务运行在 http://localhost:8115
start "" http://localhost:8115
node app.js

pause
