@echo off
setlocal
cd /d "%~dp0"

echo Discord Extensions launcher

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo Starting the desktop host...
call npm run dev
if errorlevel 1 (
  echo Launch failed.
  pause
  exit /b 1
)
