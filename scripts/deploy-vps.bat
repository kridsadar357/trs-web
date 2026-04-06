@echo off
setlocal EnableExtensions
chcp 65001 >nul

REM =============================================================================
REM TRS Web — deploy / update on VPS over SSH (flat Next.js standalone + PM2)
REM Edit the variables below once, then double-click or run: scripts\deploy-vps.bat
REM Requires: OpenSSH client (ssh) — Windows 10/11: Settings → Optional features → OpenSSH Client
REM =============================================================================

set "VPS_USER=root"
set "VPS_HOST=76.13.218.2"
set "VPS_DIR=~/web/trs-web"
set "GIT_BRANCH=main"

REM Optional: uncomment to push from this PC before remote update
REM git push origin %GIT_BRANCH%

where ssh >nul 2>nul || (
  echo [ERROR] ssh not found. Install "OpenSSH Client" in Windows Optional Features.
  exit /b 1
)

if "%VPS_HOST%"=="" goto :badhost
if /I "%VPS_HOST%"=="YOUR_VPS_IP_OR_HOSTNAME" goto :badhost
goto :hostok
:badhost
  echo [ERROR] Edit scripts\deploy-vps.bat and set VPS_HOST ^(and VPS_USER / VPS_DIR if needed^).
  exit /b 1
:hostok

echo.
echo === Deploying to %VPS_USER%@%VPS_HOST%:%VPS_DIR% ===
echo.

REM Copy public + .next/static into every standalone layout Next may emit.
REM PM2 cwd is often .next/standalone/trs-web (see ecosystem.config.cjs); copying only to
REM .next/standalone/public breaks /site.webmanifest, /logo.svg, etc. (404 on localhost:3000).
REM Use -o BatchMode=yes only when SSH key auth works (no password prompt).
ssh %VPS_USER%@%VPS_HOST% "cd %VPS_DIR% && git pull origin %GIT_BRANCH% && npm ci && npm exec prisma generate && npm run build && cp -r public .next/standalone/public && mkdir -p .next/standalone/.next && cp -r .next/static .next/standalone/.next/static && mkdir -p .next/standalone/trs-web/.next && cp -r public .next/standalone/trs-web/public && cp -r .next/static .next/standalone/trs-web/.next/static && pm2 restart trs-next"

if errorlevel 1 (
  echo.
  echo [ERROR] Remote command failed. If git pull failed, fix conflicts or untracked files on the server.
  exit /b 1
)

echo.
echo === Done. Smoke test on server: curl -sS -o /dev/null -w "%%{http_code}\n" http://127.0.0.1:3000/api/health ===
exit /b 0
