# Cai lai thu vien an toan tren Windows.
# Loi EPERM better_sqlite3.node xay ra khi server Node dang chay va giu file.
# Script nay tat server cua du an truoc, roi moi chay npm ci.
$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host '1/3 Dang tat server cua du an (neu co)...' -ForegroundColor Cyan
$pids = @()

$conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($conn) { $pids += $conn.OwningProcess }

$nodeProcs = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -match 'server[\\/]index\.js|npm-cli\.js.*start' }
foreach ($p in $nodeProcs) { $pids += $p.ProcessId }

$pids = $pids | Sort-Object -Unique
foreach ($id in $pids) {
  try {
    Stop-Process -Id $id -Force -ErrorAction Stop
    Write-Host "   - da tat PID $id" -ForegroundColor Yellow
  } catch {
    Write-Host "   - khong tat duoc PID $id (co the da tat)" -ForegroundColor DarkYellow
  }
}
Start-Sleep -Milliseconds 1200

Write-Host '2/3 Dang cai lai thu vien (npm ci)...' -ForegroundColor Cyan
npm ci
if ($LASTEXITCODE -ne 0) {
  Write-Host 'npm ci that bai. Hay dong cac cua so terminal/editor dang mo thu muc node_modules roi chay lai: npm run reinstall' -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host '3/3 Xong! Bay gio chay: npm start' -ForegroundColor Green
Write-Host '   Sau do mo: http://localhost:3000/login.html' -ForegroundColor Green
