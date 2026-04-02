@echo off
chcp 65001 >nul
echo.
echo === 今晚吃什么 - 部署脚本 ===
echo.

set NODE_PATH=C:\Users\xmzx\.workbuddy\binaries\node\versions\20.18.0.installing.15624.__extract_temp__\node-v20.18.0-win-x64
set PATH=%NODE_PATH%;%PATH%
cd /d C:\Users\xmzx\WorkBuddy\20260331135211\dinner-picker

echo [1/2] 正在构建...
node node_modules\vite\bin\vite.js build
if errorlevel 1 (
    echo 构建失败！请检查代码错误。
    pause
    exit /b 1
)

echo.
echo [2/2] 正在部署到 GitHub Pages...
set /p TOKEN=请输入 GitHub Token (ghp_...): 
node node_modules\gh-pages\bin\gh-pages.js -d dist --repo https://wujian0428:%TOKEN%@github.com/wujian0428/dinner-picker.git

if errorlevel 1 (
    echo 部署失败！
    pause
    exit /b 1
)

echo.
echo ✅ 部署成功！
echo 访问地址: https://wujian0428.github.io/dinner-picker
echo (等待 1~2 分钟后生效)
echo.
pause
