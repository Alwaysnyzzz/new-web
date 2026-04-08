# DzzStore – File Backup

## Struktur Upload ke VPS
```
/var/www/dzzstore/
├── index.html          → (buat sendiri / sudah ada)
├── produk.html
├── kontak.html         → (buat sendiri / sudah ada)
├── riwayat.html
├── profil.html
├── login.html
├── register.html
├── create-user.html    → diakses via /buat-user
├── auth.js             → wajib ada, dipakai semua halaman
├── config.js           → ISI dulu sebelum upload!
├── pterodactyl.js
├── schema.sql          → jalankan di Supabase SQL Editor
└── produk/
    └── panel-pterodactyl.html

## Backup Scripts
├── setup-backup.sh     → jalankan SEKALI untuk setup
└── auto-backup.sh      → jalan otomatis via systemd
```

## Setup Wajib Sebelum Upload
1. Isi SUPABASE_URL + SUPABASE_KEY di config.js (pakai anon key!)
2. Isi PTERO_URL + PTERO_API_KEY di config.js
3. Jalankan schema.sql di Supabase → SQL Editor → Run
4. Matikan "Confirm email" di Supabase Auth Settings

## Upload ke VPS
```bash
scp -r dzzstore_files/* root@IP:/var/www/dzzstore/
```

## Setup Auto Backup
Edit setup-backup.sh → isi GITHUB_REPO, GITHUB_USER, GITHUB_EMAIL, GITHUB_TOKEN
```bash
chmod +x setup-backup.sh auto-backup.sh
./setup-backup.sh
```
