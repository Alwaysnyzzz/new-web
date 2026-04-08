#!/bin/bash
# ╔══════════════════════════════════════════════════════╗
# ║       DzzStore – Setup Auto Backup (jalankan sekali) ║
# ╚══════════════════════════════════════════════════════╝

WATCH_DIR="/var/www/dzzstore"
GITHUB_REPO="https://github.com/USERNAME/REPO_NAME.git"
# ↑ GANTI dengan repo GitHub kamu, contoh:
# GITHUB_REPO="https://github.com/Alwaysnyzzz/new-web.git"

GITHUB_USER="USERNAME"          # username GitHub kamu
GITHUB_EMAIL="email@gmail.com"  # email GitHub kamu
GITHUB_TOKEN="ghp_XXXXX"       # Personal Access Token GitHub
# Token: github.com → Settings → Developer settings → Personal access tokens → Generate new token
# Centang: repo (full control)

# ── Install inotify-tools ─────────────────────────────
echo "Installing inotify-tools..."
apt-get install -y inotify-tools git 2>/dev/null

# ── Setup git identity ───────────────────────────────
git config --global user.name "$GITHUB_USER"
git config --global user.email "$GITHUB_EMAIL"

# ── Init git di folder dzzstore ──────────────────────
cd "$WATCH_DIR" || { echo "ERROR: Folder $WATCH_DIR tidak ada"; exit 1; }

if [ ! -d ".git" ]; then
  git init
  echo "Git initialized."
fi

# ── Setup remote dengan token (agar push tanpa password) ──
# Format: https://TOKEN@github.com/USER/REPO.git
REMOTE_URL="https://${GITHUB_TOKEN}@${GITHUB_REPO#https://}"
git remote remove origin 2>/dev/null
git remote add origin "$REMOTE_URL"
echo "Remote origin set."

# ── .gitignore ───────────────────────────────────────
cat > .gitignore << 'EOF'
*.log
*.tmp
.DS_Store
node_modules/
EOF

# ── Initial commit dan push ───────────────────────────
git add -A
git commit -m "initial backup: $(date '+%Y-%m-%d %H:%M:%S')" 2>/dev/null || echo "Nothing to commit."
git branch -M main
git push -u origin main --force
echo "Initial push done."

# ── Copy auto-backup.sh ke /usr/local/bin ────────────
# Ambil dari folder yang sama dengan setup-backup.sh
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cp "$SCRIPT_DIR/auto-backup.sh" /usr/local/bin/dzzstore-backup.sh
chmod +x /usr/local/bin/dzzstore-backup.sh
echo "Backup script installed."

# ── Buat systemd service ──────────────────────────────
cat > /etc/systemd/system/dzzstore-backup.service << 'SVCEOF'
[Unit]
Description=DzzStore Auto Backup VPS to GitHub
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/dzzstore-backup.sh
Restart=always
RestartSec=5
User=root
StandardOutput=append:/var/log/dzzstore-backup.log
StandardError=append:/var/log/dzzstore-backup.log

[Install]
WantedBy=multi-user.target
SVCEOF

# ── Aktifkan dan jalankan service ────────────────────
systemctl daemon-reload
systemctl enable dzzstore-backup
systemctl start dzzstore-backup

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║  Auto Backup berhasil disetup!        ║"
echo "║                                       ║"
echo "║  Cek status: systemctl status dzzstore-backup"
echo "║  Lihat log:  tail -f /var/log/dzzstore-backup.log"
echo "╚═══════════════════════════════════════╝"
