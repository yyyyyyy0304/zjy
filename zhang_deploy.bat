@echo off
REM Author: Zhang Jingya | 24005240115 | 2026-11-26 | DeepSeek-V4.1-Flash
REM One-click deployment launcher: runs zhang_deploy.ps1 with PowerShell

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0zhang_deploy.ps1"
if errorlevel 1 pause
