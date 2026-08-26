@echo off
setlocal
cd /d "%~dp0"
echo.
echo BUYHORECA canonical storefront installer

echo Removing legacy route conflicts...
if exist "app\shop" rmdir /S /Q "app\shop"
if exist ".next" rmdir /S /Q ".next"

echo Installing dependencies...
npm install
if errorlevel 1 (
  echo.
  echo npm install failed. Check your network and try again.
  exit /b 1
)

echo.
echo Install complete.
echo Keep your existing .env.local and public\images\buyhoreca_logo.png.
echo.
echo Run: npm run dev
endlocal
