@echo off
title BuyLow Expo - Phone Mode
cd /d "%~dp0.."
powershell -ExecutionPolicy Bypass -File "%~dp0start-phone.ps1"
pause