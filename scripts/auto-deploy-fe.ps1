# =========================================================
# auto-deploy-fe.ps1
# Auto deploy untuk Frontend (tukang-fe) di server NEMESIS
# Alur: cek update -> (install jika perlu) -> build
# =========================================================

$ErrorActionPreference = "Stop"

# ---------- KONFIGURASI (SESUAIKAN INI) ----------
$AppDir   = "D:\Applications\tukang"                 # path project FE di server nemesis
$Branch   = "master"
$LogFile  = "D:\Applications\deploy\deploy-fe.log"
$Lock     = "D:\Applications\deploy\deploy-fe.lock"

# Isi ini HANYA jika FE dijalankan via pm2 (misal Next.js `next start`).
# Kalau FE cuma static build yang di-serve IIS/nginx, biarkan kosong ("").
$PmName   = ""                                  # contoh: "tukangfe"
# ---------------------------------------------------

function Log($msg) {
    $line = "$(Get-Date -Format 's') | $msg"
    $line | Tee-Object -FilePath $LogFile -Append
}

function Run($cmd) {
    Log "RUN: $cmd"
    Invoke-Expression $cmd
    if ($LASTEXITCODE -ne 0) {
        throw "Command gagal (exit $LASTEXITCODE): $cmd"
    }
}

# Cegah 2 proses deploy jalan bersamaan
if (Test-Path $Lock) {
    Log "Lock file ada, deploy sebelumnya kemungkinan masih jalan. Skip."
    exit 0
}
New-Item -ItemType Directory -Path "D:\Applications\deploy" -Force | Out-Null

try {
    Set-Location $AppDir

    Run "git fetch origin $Branch"
    $local  = (git rev-parse HEAD).Trim()
    $remote = (git rev-parse "origin/$Branch").Trim()

    if ($local -eq $remote) {
        Log "Tidak ada commit baru. Skip deploy."
        exit 0
    }

    Log "======================================================"
    Log "Ada update: $local -> $remote"

    # Cek file apa saja yang berubah, buat tahu apakah perlu install ulang
    $changedFiles = git diff --name-only $local $remote
    $depsChanged  = $changedFiles -match "package-lock\.json" -or $changedFiles -match "^package\.json$"

    if ($depsChanged) {
        Log "Terdeteksi perubahan pada package.json/package-lock.json"
    } else {
        Log "Tidak ada perubahan dependencies"
    }

    try {
        Run "git reset --hard origin/$Branch"

        if ($depsChanged) {
            Log "Menjalankan npm ci (dependencies berubah)"
            Run "npm ci"
        } else {
            Log "Skip npm ci (dependencies tidak berubah)"
        }

        Log "Build frontend..."
        $env:CI = "false"
        Run "npm run build"

        if ($PmName -ne "") {
            Log "Restart proses pm2: $PmName"
            Run "pm2 restart $PmName --update-env"
        } else {
            Log "PmName kosong -> FE static, tidak perlu restart proses (IIS/nginx langsung serve folder build)"
        }

        Log "DEPLOY FE SUKSES ($local -> $remote)"
    }
    catch {
    Log "DEPLOY FE GAGAL: $($_.Exception.Message)"
    Log "Rollback ke commit sebelumnya: $local"

    git reset --hard $local
    if ($depsChanged) { npm ci }
    npm run build
    if ($PmName -ne "") { pm2 restart $PmName --update-env }

    Log "Rollback selesai, FE kembali ke versi lama"
    throw   # <-- tambahin ini, biar job Actions ikut ditandai gagal
}
}
finally {
    Remove-Item $Lock -Force -ErrorAction SilentlyContinue
}
