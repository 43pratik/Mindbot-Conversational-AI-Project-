@echo off
echo =========================================
echo       Starting MindBot Full-Stack
echo =========================================

:: 1. Start the Python Backend
echo Starting FastAPI Backend...
:: We use ..\venv\Scripts\activate because venv is in the main folder
start cmd /k "cd mindbot-backend && ..\venv\Scripts\activate && uvicorn app.main:app --reload"

:: 2. Start the React Frontend
echo Starting React Frontend...
start cmd /k "cd mindbot-frontend && npm run dev"

:: 3. Wait for 3 seconds to let the servers boot up, then open the browser!
timeout /t 3 /nobreak > NUL
start http://localhost:5173

echo Done! Both servers are booting up and the browser is opening.