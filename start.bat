@echo off
title Portfolio - Lokaler Server
echo.
echo  Portfolio wird gestartet...
echo  Browser oeffnet sich in 2 Sekunden.
echo  Dieses Fenster offen lassen!
echo  Zum Beenden: Fenster schliessen oder Strg+C
echo.
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"
python -m http.server 3000
pause
