@echo off
rem 姓名：【张婧雅】 | 学号：【24005240115】 | 时间：2026-11-26 | 大模型：DeepSeek-V4.1-Flash
rem 生成 Trae 一键部署用的纯静态目录（只含不使用后台接口的页面）
chcp 65001 >nul
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0zhang_trae_deploy.ps1"
pause
