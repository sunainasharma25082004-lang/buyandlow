@echo off
title BuyLow Expo - Tunnel Mode
cd /d "%~dp0.."
powershell -ExecutionPolicy Bypass -File "%~dp0start-tunnel.ps1"
pause