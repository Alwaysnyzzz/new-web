# 🚀 Panduan Deploy DzzStore ke VPS

## Yang Dibutuhkan
- VPS (Ubuntu 20.04/22.04)
- Domain yang sudah diarahkan ke IP VPS
- Akses SSH ke VPS

---

## 1. Koneksi ke VPS

```bash
ssh root@IP_VPS_KAMU
```

---

## 2. Install Nginx

```bash
apt update && apt upgrade -y
apt install nginx -y
systemctl enable nginx
systemctl start nginx
```

---

## 3. Upload File

Dari PC/HP (pakai SCP atau Termux):

```bash
# Buat folder site
mkdir -p /var/www/dzzstore

# Upload dari lokal (jalankan di PC/Termux lokal, bukan VPS)
scp -r ./dzzstore/* root@IP_VPS_KAMU:/var/www/dzzstore/
```

Atau kalau pakai Termux langsung di HP:
```bash
scp index.html produk.html root@IP_VPS_KAMU:/var/www/dzzstore/
```

---

## 4. Konfigurasi Nginx

```bash
nano /etc/nginx/sites-available/dzzstore
```

Isi dengan:

```nginx
server {
    listen 80;
    server_name DOMAIN_KAMU.COM www.DOMAIN_KAMU.COM;

    root /var/www/dzzstore;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Cache static files
    location ~* \.(html|css|js|ico|png|jpg|jpeg|gif|svg|woff|woff2)$ {
        expires 7d;
        add_header Cache-Control "public";
    }

    # Gzip
    gzip on;
    gzip_types text/html text/css application/javascript;
}
```

Aktifkan:

```bash
ln -s /etc/nginx/sites-available/dzzstore /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 5. SSL Gratis (HTTPS) dengan Certbot

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d DOMAIN_KAMU.COM -d www.DOMAIN_KAMU.COM
```

Ikuti instruksi, masukkan email, pilih redirect HTTP → HTTPS.

Auto-renew sudah aktif otomatis.

---

## 6. Set Permission File

```bash
chown -R www-data:www-data /var/www/dzzstore
chmod -R 755 /var/www/dzzstore
```

---

## 7. Cek Hasil

Buka browser: `https://DOMAIN_KAMU.COM`

---

## Update File (kalau ada perubahan)

```bash
# Upload ulang file yang diubah
scp index.html root@IP_VPS_KAMU:/var/www/dzzstore/
scp produk.html root@IP_VPS_KAMU:/var/www/dzzstore/
```

---

## Struktur File di VPS

```
/var/www/dzzstore/
├── index.html     ← Halaman utama (Home)
└── produk.html    ← Halaman produk
```

---

## Troubleshoot

| Masalah | Solusi |
|---|---|
| 403 Forbidden | `chmod -R 755 /var/www/dzzstore` |
| 502 Bad Gateway | `systemctl restart nginx` |
| SSL gagal | Pastikan domain sudah pointing ke IP VPS (tunggu propagasi DNS ~1 jam) |
| Nginx error | `nginx -t` untuk cek syntax |
