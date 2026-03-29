# 🚀 DzzStore – Panduan Deploy VPS

## Struktur File

```
/var/www/dzzstore/
├── index.html                          → namawebmu.com/
├── produk.html                         → namawebmu.com/produk
├── kontak.html                         → namawebmu.com/kontak
└── produk/
    ├── panel-pterodactyl.html          → namawebmu.com/produk/panel-pterodactyl
    ├── pulsa.html                      → namawebmu.com/produk/pulsa
    ├── paket-data.html                 → namawebmu.com/produk/paket-data
    └── suntik-follower.html            → namawebmu.com/produk/suntik-follower
```

---

## 1. Upload File ke VPS

```bash
# Buat folder di VPS
ssh root@IP_VPS
mkdir -p /var/www/dzzstore/produk

# Upload dari Termux / PC
scp index.html root@IP_VPS:/var/www/dzzstore/
scp produk.html root@IP_VPS:/var/www/dzzstore/
scp kontak.html root@IP_VPS:/var/www/dzzstore/
scp panel-pterodactyl.html root@IP_VPS:/var/www/dzzstore/produk/
```

---

## 2. Install Nginx

```bash
apt update && apt install nginx -y
systemctl enable nginx && systemctl start nginx
```

---

## 3. Konfigurasi Nginx – **Clean URL tanpa .html**

```bash
nano /etc/nginx/sites-available/dzzstore
```

Isi dengan:

```nginx
server {
    listen 80;
    server_name NAMADOMAINMU.COM www.NAMADOMAINMU.COM;

    root /var/www/dzzstore;
    index index.html;

    # ─────────────────────────────────────────────────
    # CLEAN URL — namawebmu.com/produk bukan produk.html
    # try_files coba: file → file.html → folder/index → 404
    # ─────────────────────────────────────────────────
    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    # ─────────────────────────────────────────────────
    # SUBFOLDER PRODUK — namawebmu.com/produk/panel-pterodactyl
    # ─────────────────────────────────────────────────
    location /produk/ {
        try_files $uri $uri.html $uri/ =404;
    }

    # Cache assets
    location ~* \.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
        expires 14d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip
    gzip on;
    gzip_types text/html text/css application/javascript;
}
```

Aktifkan:

```bash
ln -s /etc/nginx/sites-available/dzzstore /etc/nginx/sites-enabled/
nginx -t          # cek syntax, harus "test is successful"
systemctl reload nginx
```

---

## 4. SSL Gratis (HTTPS)

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d NAMADOMAINMU.COM -d www.NAMADOMAINMU.COM
```

Ikuti instruksi → pilih redirect HTTP ke HTTPS.

---

## 5. Set Permission

```bash
chown -R www-data:www-data /var/www/dzzstore
chmod -R 755 /var/www/dzzstore
```

---

## 6. Hasil Akhir URL

| File | URL |
|---|---|
| `index.html` | `namawebmu.com` |
| `produk.html` | `namawebmu.com/produk` |
| `kontak.html` | `namawebmu.com/kontak` |
| `produk/panel-pterodactyl.html` | `namawebmu.com/produk/panel-pterodactyl` |
| `produk/pulsa.html` | `namawebmu.com/produk/pulsa` |

---

## 7. Update File (kalau ada perubahan)

```bash
# Upload ulang file yang diubah
scp panel-pterodactyl.html root@IP_VPS:/var/www/dzzstore/produk/
```

---

## Troubleshoot

| Masalah | Solusi |
|---|---|
| URL masih bisa `.html` | Normal, Nginx serve dua-duanya. Bisa redirect dengan `return 301` kalau mau paksa |
| 404 di `/produk/panel-pterodactyl` | Pastikan file ada di `/var/www/dzzstore/produk/panel-pterodactyl.html` |
| 403 Forbidden | `chmod -R 755 /var/www/dzzstore` |
| SSL gagal | DNS domain belum pointing ke IP VPS, tunggu propagasi ~1 jam |
| Nginx syntax error | `nginx -t` untuk lihat detail error |

---

## Cara Atur Jarak Tepi di panel-pterodactyl.html

Buka file, cari komentar `↓ JARAK ...`:

```css
/* ↓ JARAK KONTEN DARI TEPI LAYAR — ubah padding: 0 XX px 40px */
.page-wrap { padding: 0 20px 40px; }
                            ↑
                     ubah angka ini

/* ↓ JARAK ANTAR CARD — ubah gap */
.pkg-grid { gap: 16px; }
                 ↑
          ubah angka ini
```
