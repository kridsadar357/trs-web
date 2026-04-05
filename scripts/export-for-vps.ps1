# Export MySQL data + public media for VPS / Docker deploy.
# Usage (from repo root):  powershell -ExecutionPolicy Bypass -File scripts/export-for-vps.ps1

$ErrorActionPreference = "Stop"
# scripts/ -> repo root
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if (-not (Test-Path (Join-Path $Root "package.json"))) {
  throw "Run this script from the trs-web repo (package.json not found above scripts/)."
}

$EnvFile = Join-Path $Root ".env"
$OutDir = Join-Path $Root "exports"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

function Get-DatabaseUrlFromEnv {
  if (-not (Test-Path $EnvFile)) {
    Write-Warning (".env not found at $EnvFile - using defaults: " + 'mysql://root:@127.0.0.1:3306/trs_web')
    return 'mysql://root:@127.0.0.1:3306/trs_web'
  }
  foreach ($line in Get-Content $EnvFile) {
    $t = $line.Trim()
    if ($t.StartsWith("DATABASE_URL")) {
      $i = $t.IndexOf("=")
      if ($i -lt 0) { continue }
      return $t.Substring($i + 1).Trim().Trim('"').Trim("'")
    }
  }
  throw "DATABASE_URL not found in .env"
}

function Parse-MySqlUrl([string]$url) {
  # mysql://user:pass@host:port/dbname  (password may be empty)
  if (-not $url.StartsWith("mysql://")) {
    throw "DATABASE_URL must start with mysql://"
  }
  $rest = $url.Substring(8)
  $at = $rest.LastIndexOf("@")
  if ($at -lt 0) { throw "Invalid DATABASE_URL (missing at-sign between user and host)" }
  $userPass = $rest.Substring(0, $at)
  $hostPortDb = $rest.Substring($at + 1)
  $colonUp = $userPass.IndexOf(":")
  $user = if ($colonUp -ge 0) { $userPass.Substring(0, $colonUp) } else { $userPass }
  $password = if ($colonUp -ge 0) { $userPass.Substring($colonUp + 1) } else { "" }
  $slash = $hostPortDb.IndexOf("/")
  if ($slash -lt 0) { throw "Invalid DATABASE_URL (missing /database)" }
  $hostPort = $hostPortDb.Substring(0, $slash)
  $database = $hostPortDb.Substring($slash + 1).Split("?")[0].TrimEnd("/")
  $colonHp = $hostPort.LastIndexOf(":")
  $dbHost = if ($colonHp -ge 0) { $hostPort.Substring(0, $colonHp) } else { $hostPort }
  $port = if ($colonHp -ge 0) { $hostPort.Substring($colonHp + 1) } else { "3306" }
  return @{
    User     = $user
    Password = $password
    Host     = $dbHost
    Port     = $port
    Database = $database
  }
}

function Find-Mysqldump {
  $cmd = Get-Command mysqldump -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $laragon = @(
    "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysqldump.exe",
    "C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqldump.exe"
  ) | Where-Object { Test-Path $_ } | Select-Object -First 1
  if ($laragon) { return $laragon }
  throw "mysqldump not found. Install MySQL client or add mysqldump to PATH."
}

$dbUrl = Get-DatabaseUrlFromEnv
$db = Parse-MySqlUrl $dbUrl
$dumpExe = Find-Mysqldump

$SqlOut = Join-Path $OutDir "trs_web_full_dump.sql"
$ZipOut = Join-Path $OutDir "public_media.zip"

Write-Host ("Dumping database {0} on {1}:{2} ..." -f $db.Database, $db.Host, $db.Port) -ForegroundColor Cyan
$dumpArgs = @(
  "-h", $db.Host,
  "-P", $db.Port,
  "-u", $db.User
)
if ($db.Password) {
  $dumpArgs += "-p$($db.Password)"
}
$dumpArgs += @(
  $db.Database,
  "--single-transaction",
  "--routines",
  "--triggers",
  "--add-drop-table",
  "--set-gtid-purged=OFF",
  "-r", $SqlOut
)

& $dumpExe @dumpArgs
if ($LASTEXITCODE -ne 0) { throw "mysqldump failed with exit $LASTEXITCODE" }

Write-Host "Zipping public\hero and public\uploads ..." -ForegroundColor Cyan
$hero = Join-Path $Root "public\hero"
$uploads = Join-Path $Root "public\uploads"
$zipItems = @()
if (Test-Path $hero) { $zipItems += $hero }
if (Test-Path $uploads) { $zipItems += $uploads }
if ($zipItems.Count -eq 0) {
  Write-Warning "No public\hero or public\uploads - skipping zip"
} else {
  if (Test-Path $ZipOut) { Remove-Item $ZipOut -Force }
  Compress-Archive -Path $zipItems -DestinationPath $ZipOut -Force
}

Write-Host ""
Write-Host "Done:" -ForegroundColor Green
Write-Host "  $SqlOut"
if (Test-Path $ZipOut) { Write-Host "  $ZipOut" }
Write-Host ""
Write-Host "Copy these to your VPS (scp). Do not commit SQL to a public GitHub repo." -ForegroundColor Yellow
