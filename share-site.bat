@echo off
title Nocfinity Cloudflare Public Tunnel
echo ========================================================
echo  Starting Secure Cloudflare Tunnel for Nocfinity...
echo  (TCP Port 443 HTTP/2 Mode - ISP Unblocked)
echo ========================================================
echo.
C:\laragon\bin\cloudflared\cloudflared.exe tunnel --protocol http2 --edge-ip-version 4 --url http://localhost:3000
pause
