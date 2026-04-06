# WebGIS - Aplikasi Pemetaan Vektor Interaktif

<p align="center">
  <img src="https://github.com/user-attachments/assets/78f41f3c-a8a6-4dc2-9607-da6045805937" alt="Screenshot 1" width="100%"/>
  <img src="https://github.com/user-attachments/assets/ce297b6b-e247-47dd-b885-937a19763728" alt="Screenshot 2" width="100%"/>
  <img src="https://github.com/user-attachments/assets/5bdddadc-9870-4525-8c0b-89d4cfd2155e" alt="Screenshot 3" width="100%"/>
</p>

Aplikasi WebGIS sederhana namun powerful yang dibangun dengan Laravel dan Leaflet.js. Memungkinkan pengguna untuk menggambar, menyimpan, mengelola, dan menampilkan data vektor geospasial (Point, Line, Polygon) secara real-time pada peta interaktif. Data disimpan menggunakan PostgreSQL dengan ekstensi PostGIS.

---

## Fitur Utama

- **Drawing Tools** — Menggambar fitur Point, Polyline, dan Polygon langsung di peta menggunakan Leaflet.draw
- **Penyimpanan Real-time** — Data vektor disimpan ke database via REST API dengan format GeoJSON
- **Manajemen Layer Sidebar** — Daftar vektor interaktif untuk menampilkan/menyembunyikan (toggle) atau menghapus layer
- **Load Data Dinamis** — Memuat semua data vektor yang tersimpan dari database saat halaman pertama kali dibuka
- **Keamanan Dasar** — Validasi input backend & sanitasi HTML sederhana untuk mencegah XSS

---

## Teknologi yang Digunakan

| Layer    | Teknologi                            |
|----------|--------------------------------------|
| Backend  | Laravel (PHP), RESTful API           |
| Database | PostgreSQL + PostGIS                 |
| Frontend | Blade Template, Vanilla JavaScript   |
| Mapping  | Leaflet.js, Leaflet.draw Control     |
| Icons    | FontAwesome                          |

---

## Prasyarat

Sebelum menginstal, pastikan sistem Anda memiliki:

- PHP >= 8.1 & Composer
- PostgreSQL dengan ekstensi PostGIS teraktifkan

---

## Instalasi & Setup

**1. Clone Repository**
```bash
git clone https://github.com/irfanahmadhidayat/webgis.git
cd webgis
```

**2. Instal Dependencies**
```bash
composer install
```

**3. Konfigurasi Environment**
```bash
cp .env.example .env
php artisan key:generate
```

Edit file `.env` dan sesuaikan konfigurasi database:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=webgis
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

> **Penting:** Pastikan ekstensi PostGIS sudah diaktifkan di database PostgreSQL Anda dengan menjalankan:
> ```sql
> CREATE EXTENSION postgis;
> ```

**4. Jalankan Migrasi**

Pastikan tabel `spatials` memiliki kolom: `id`, `name`, `type`, `geom` (geometry PostGIS), `created_at`, `updated_at`. Lalu jalankan:
```bash
php artisan migrate
```

**5. Jalankan Server**
```bash
php artisan serve
```
Akses aplikasi di **http://localhost:8000**

---

## Cara Penggunaan

1. Buka aplikasi di browser. Peta akan tampil dengan koordinat default (Jakarta)
2. Gunakan kontrol drawing di peta untuk memilih mode **Point**, **Line**, atau **Polygon**
3. Gambar bentuk yang diinginkan di atas peta
4. Masukkan nama vektor pada prompt yang muncul, lalu klik **OK**
5. Data akan tersimpan otomatis dan muncul di panel sidebar
6. Klik ikon 👁️ untuk menampilkan/menyembunyikan layer, atau ikon 🗑️ untuk menghapusnya dari database & peta
