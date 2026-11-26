@echo off
REM Author: Zhang Jingya | 24005240115 | 2026-11-26 | DeepSeek-V4.1-Flash
REM One-click deploy static site to Netlify (runs zhang_netlify_deploy.ps1)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0zhang_netlify_deploy.ps1"
if errorlevel 1 pause
