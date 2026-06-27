@echo off
title BuyLow - Allow Expo on Firewall
echo.
echo Windows Firewall mein Expo (port 8081) allow kar rahe hain...
echo Admin permission maangega - "Yes" dabao.
echo.

netsh advfirewall firewall add rule name="BuyLow Expo Metro 8081" dir=in action=allow protocol=TCP localport=8081
netsh advfirewall firewall add rule name="BuyLow Expo Metro 8082" dir=in action=allow protocol=TCP localport=8082
netsh advfirewall firewall add rule name="BuyLow API Server 5000" dir=in action=allow protocol=TCP localport=5000

echo.
echo Done! Ab npm run start:phone chalao.
echo.
pause