#!/bin/bash
# ╔══════════════════════════════════════════════════════╗
# ║       DzzStore – Auto Backup VPS → GitHub            ║
# ║  Setiap ada perubahan file di VPS → push ke GitHub   ║
# ╚══════════════════════════════════════════════════════╝

WATCH_DIR="/var/www/dzzstore"
LOG_FILE="/var/log/dzzstore-backup.log"
COOLDOWN=10   # detik tunggu setelah perubahan terakhir sebelum push

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== Auto Backup dimulai, memantau $WATCH_DIR ==="

cd "$WATCH_DIR" || { log "ERROR: Folder $WATCH_DIR tidak ditemukan"; exit 1; }

# Pastikan git sudah init
if [ ! -d ".git" ]; then
  log "ERROR: Bukan git repo. Jalankan setup.sh dulu!"
  exit 1
fi

# Loop utama: pantau perubahan file
inotifywait -m -r \
  --event modify,create,delete,move \
  --exclude '\.git' \
  --format '%T %w%f %e' \
  --timefmt '%H:%M:%S' \
  "$WATCH_DIR" 2>/dev/null | while read -r TIME FILE EVENT; do

  log "Perubahan: [$EVENT] $FILE"

  # Tunggu cooldown — kalau ada perubahan lagi dalam X detik, reset timer
  # Pakai file flag agar tidak spam commit
  touch /tmp/dzzstore_pending_backup

  sleep "$COOLDOWN"

  # Cek apakah flag masih ada (tidak di-reset oleh proses lain)
  if [ -f /tmp/dzzstore_pending_backup ]; then
    rm /tmp/dzzstore_pending_backup

    cd "$WATCH_DIR"

    # Tambah semua perubahan
    git add -A

    # Cek apakah ada yang berubah (diff dengan HEAD)
    if git diff --cached --quiet; then
      log "Tidak ada perubahan baru di git, skip."
      continue
    fi

    # Commit dengan timestamp
    COMMIT_MSG="auto-backup: $(date '+%Y-%m-%d %H:%M:%S')"
    git commit -m "$COMMIT_MSG"

    # Push ke GitHub — force push agar selalu berhasil
    if git push origin main --force 2>&1 | tee -a "$LOG_FILE"; then
      log "✓ Backup berhasil → GitHub"
    else
      log "✗ Backup GAGAL — cek log di $LOG_FILE"
    fi
  fi
done
