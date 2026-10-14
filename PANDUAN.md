# PANDUAN: Lokasi Google Maps di Riwayat Pendidikan (v6)

> **Hanya menambah tulisan kecil "Lihat Lokasi"** pada riwayat pendidikan yang punya link Maps. Nama institusi, periode, tata letak, warna, animasi, logo, login, dan fitur lain tidak diubah. Perlu 1 langkah SQL kecil (menambah kolom kosong `maps_url` di tabel `education`, tidak menghapus apa pun).
>
> 1. Supabase → SQL Editor → jalankan `supabase-update-v6-maps.sql`.
> 2. Unggah `app.js`, `admin.js`, `style.css` ke GitHub (root repository, jangan timpa `config.js`).
> 3. Admin → **Pendidikan** → Edit/Tambah → isi **Link Google Maps (opsional)** → **Simpan**.
> Kosongkan kolom itu untuk menyembunyikan "Lihat Lokasi". Hanya link http/https yang ditampilkan.

---

# PANDUAN: Logo di Pojok Kiri Atas (v5)

> **Hanya mengganti kotak biru inisial (mis. "AS") di navbar** dengan logo Anda. Footer, favicon, nama, dan bagian lain tidak diubah. Perlu 1 langkah SQL kecil (menambah kolom `logo_url` di tabel `profile`, tidak menghapus apa pun).
>
> 1. Supabase → SQL Editor → jalankan `supabase-update-v5-logo.sql`.
> 2. Unggah `app.js`, `style.css`, `admin.js` ke GitHub (root repository, jangan timpa `config.js`).
> 3. Dashboard admin → **Profil** → kolom **Logo website** paling atas → pilih gambar (PNG/WebP transparan terbaik) → **Simpan profil**.
> Kosongkan kolom itu untuk kembali ke inisial. Jika gambar gagal dimuat, inisial otomatis tampil.

# PANDUAN: Hero Bersih, Tanpa Kartu Karya Ganda (v4.2)

> **Perubahan tampilan saja** pada `index.html`, `app.js`, dan `style.css`. Dua kartu karya kecil yang menumpuk di samping foto/inisial hero dihapus (beserta kode dan CSS khususnya). Foto profil (atau inisial jika belum ada foto) tetap tampil. Daftar "Karya Pilihan" dan seluruh data karya tidak berubah. Tanpa SQL, tanpa perubahan database, login, atau admin.

# PANDUAN: Gambar Karya Selalu Utuh (v4.1)

> **Perubahan tampilan saja** pada `style.css` dan `admin.css`. Tanpa SQL, tanpa perubahan database, login, atau Supabase. Gambar karya kini memakai `object-fit: contain` di kartu, halaman detail, galeri kecil, dan kolase beranda, dengan latar navy. Area gambar kartu seragam tingginya, dan di halaman detail gambar tampil besar dan utuh. Efek zoom saat hover dihapus karena bisa memotong tepi gambar.

# PANDUAN: Fitur Tools & Platforms (v4)

> **Perlu 1 langkah database** (hanya membuat tabel baru, tidak menyentuh data lama). Urutan penting: **jalankan SQL dulu, baru unggah file**. Jika file diunggah lebih dulu, website tetap normal; bagian Tools hanya kosong sampai SQL dijalankan.

## 1. Jalankan SQL (sekali saja)
1. Supabase → **SQL Editor** → New query.
2. Buka file `supabase-update-v4-tools.sql`, salin seluruh isinya, tempel, tekan **Run**.
3. Hasil akhir harus menampilkan 1 baris: `tools_platforms` dengan `rowsecurity = true`.
SQL ini aman dijalankan berulang. Ia hanya membuat tabel `tools_platforms` dengan aturan keamanan yang sama seperti tabel lain: pengunjung hanya membaca yang tampil, hanya pemilik (`is_owner()`) yang boleh menambah, mengubah, menghapus.

## 2. Unggah file ke GitHub
Unggah: `index.html`, `app.js`, `style.css`, `admin.html`, `admin.js`, `admin.css`, `sample-data.js`, `PANDUAN.md`, dan `supabase-update-v4-tools.sql` (agar tersimpan di repository). **Jangan timpa `config.js`.** Tunggu Netlify "Published", lalu muat ulang paksa.

## 3. Memakai fitur
- Dashboard admin → menu **Tools** → **Tambah**: nama, kategori (Design, Video Editing, Web Development, AI, Other), ikon/logo (opsional), deskripsi, tautan, status penggunaan.
- **Tandai Most Used / Batalkan Most Used**: tombol bintang di tiap baris. Ini pilihan manual Anda; tidak ada persentase kemampuan.
- **Urutan**: tombol ↑ ↓ di tiap baris, atau isi angka "Urutan tampil" di formulir (angka kecil tampil lebih dulu).
- **Sembunyikan / Hapus** tersedia seperti bagian lain.
- Di website: bagian **Tools & Platforms** (setelah Keahlian), dengan filter kategori. Filter hanya menampilkan kategori yang punya isi.

## 4. Uji setelah online
Tambah satu tool di admin → buka website → tool muncul (muat ulang jika perlu) → tandai Most Used → badge muncul → ↓ urutan berubah → filter kategori berfungsi → buka website tanpa login: tidak ada tombol admin. Coba juga tombol "Kunjungi" (buka tab baru).

## Menu "Tools & Platforms" tidak muncul di Dashboard Admin?
Penyebab paling umum: file admin belum ikut terunggah atau browser masih memakai versi lama. Pastikan **ketiga** file ini sudah diunggah ke GitHub: `admin.js`, `admin.html`, `admin.css`. Buka `/admin.html` → menu **Akun**: harus tertulis "Versi dashboard: v4-tools". Jika tidak, `admin.js` di website masih versi lama. Muat ulang paksa (atau hapus data situs di Chrome) setelah Netlify "Published". Jika menu muncul tetapi menyimpan gagal dengan pesan "Tabel Tools belum dibuat", jalankan `supabase-update-v4-tools.sql`.

## Batas pengujian
Diuji dengan Supabase tiruan di Chromium (HP 390 px dan laptop 1440 px). **Belum teruji:** database Supabase asli (SQL v4 belum dijalankan di project Anda), unggah ikon ke Storage asli, HP Android fisik, Safari/Firefox.

---

# PANDUAN: Tema Midnight Navy + Ice Blue (v3.1)

> **Pembaruan warna saja.** Hanya 6 file tampilan yang berubah: `tokens.css`, `style.css`, `admin.css`, `index.html`, `admin.html`, `common.js`. Tanpa SQL, tanpa perubahan database/Auth/RLS/`config.js`. Unggah ke GitHub dengan cara yang sama seperti di bawah.

## Redesain editorial (v3)

> **Redesain ini TIDAK memerlukan SQL apa pun.** Database, Auth, RLS, Storage, `config.js`, dan `netlify.toml` tidak disentuh. Cukup ganti 7 file tampilan (di bawah).

## File yang diubah (hanya ini yang perlu diunggah)

| File | Isi perubahan |
|---|---|
| `tokens.css` | Warna navy + aksen ice blue (`--accent`), huruf Bricolage Grotesque, tombol, fokus |
| `style.css` | Seluruh tampilan publik: header, hero, galeri, tentang, kontak, detail, animasi |
| `index.html` | Susunan halaman baru. Semua ID lama dipertahankan |
| `app.js` | Hanya tampilan: kolase hero, tautan menu, kartu. Logika data/filter/cari/detail/formulir tidak diubah |
| `common.js` | Hanya warna `theme-color` |
| `admin.html` | Hanya font dan warna |
| `admin.css` | Dashboard admin mengikuti tema baru. `admin.js` TIDAK berubah |

**Jangan timpa:** `config.js` (berisi kunci Anda), file `.sql`, `netlify.toml`, `admin.js`, `sample-data.js`.

## Langkah menerbitkan (GitHub → Netlify, dari HP)
1. Buka repository di GitHub → **Add file → Upload files**.
2. Pilih 7 file di atas (dari hasil ekstrak ZIP). Nama sama = otomatis menggantikan.
3. **Commit changes**.
4. Netlify otomatis membangun ulang (±1 menit, lihat tab Deploys sampai "Published").
5. Buka website, lalu muat ulang paksa (di Chrome Android: menu ⋮ → ikon muat ulang, atau hapus data situs) agar CSS lama tidak tersimpan.

## Daftar uji setelah online
**Publik:** tidak ada kolom putih/geser ke samping di HP · menu HP buka/tutup · tautan Beranda, Karya, Tentang, Kontak menuju bagian yang benar · kartu karya terbuka ke detail dan tombol Kembali memulihkan posisi · filter kategori dan pencarian berfungsi · gambar tampil · mode terang/gelap · animasi masuk halus.
**Admin:** `/admin.html` bisa masuk · tambah, ubah, sembunyikan, hapus karya · unggah gambar · keluar lalu masuk lagi.
**Keamanan:** tanpa login, `/admin.html` hanya menampilkan formulir masuk · tidak ada tombol daftar · akun non-admin ditolak · tidak ada kunci rahasia di kode sumber.

## Catatan keamanan (CSP)
`netlify.toml` tidak diubah. Tidak ada skrip inline baru, tidak ada `unsafe-eval`.


Panduan ini untuk **pemula** dan bisa dikerjakan **hanya dari HP Android**.

---

## Apa yang berubah

| Bagian | Sekarang |
|---|---|
| Tampilan | Tema gelap premium (hitam kebiruan, aksen ungu-biru, efek glow tipis), font Poppins. Mode terang tetap ada lewat tombol bulan/matahari |
| Beranda | Teks nama muncul bertahap, foto di dalam bingkai lengkung dengan cincin berputar pelan, tombol putih, ikon media sosial dari data kontak Anda |
| Tentang Saya | Cerita di kiri, kartu Karakter / Nilai hidup / Minat / Tujuan di kanan |
| Keahlian | Kartu per kategori dengan ikon dan titik tingkat |
| Karya Pilihan | Kartu gambar besar, filter kategori, pencarian, tombol "Lihat semua" |
| Detail karya | Halaman penuh: gambar utama, galeri thumbnail, deskripsi, alat yang dipakai, tautan. Tombol Kembali di Android berfungsi |
| Kontak | Tautan sosial dan formulir pesan (dibuka di aplikasi Email / WhatsApp pengunjung) |
| Navigasi | Penanda halaman aktif yang bergeser halus, garis kemajuan scroll, menu layar penuh untuk semua 10 bagian |
| Dashboard admin | Sidebar, halaman Ringkasan (jumlah isi + karya terbaru), unggah banyak gambar galeri, kolom Alat |

**Yang tidak berubah:** koneksi Supabase, login admin, Row Level Security, semua tabel dan data Anda, serta fitur tambah/ubah/hapus/sembunyikan/unggah.

---

## Daftar file

Semua file sejajar (tanpa folder).

**Unggah ke GitHub (menimpa file lama):**

```
index.html   admin.html   style.css   admin.css   tokens.css (BARU)
app.js       admin.js     common.js   sample-data.js
favicon.svg  robots.txt   netlify.toml   PANDUAN.md
```

> ⚠️ **config.js: JANGAN ditimpa** jika Anda sudah mengisinya dengan URL dan key Supabase.
> File `config.js` di ZIP ini hanya kosongan. Jika Anda menimpanya, website kembali menampilkan konten contoh. Jika itu terjadi, isi ulang dua nilainya.

**Disalin ke Supabase (bukan ke GitHub):**

```
supabase-update-v2.sql      → WAJIB untuk Anda yang sudah memasang versi lama
supabase-setup.sql          → hanya untuk pemasangan baru dari nol
supabase-jadikan-admin.sql  → hanya untuk pemasangan baru dari nol
supabase-contoh-konten.sql  → opsional, isi contoh bertanda [ISI: ...]
```

---

## Pemasangan, jika Anda SUDAH punya website versi lama

1. **Cadangkan dulu** (1 menit): Supabase → Table Editor → tabel `works` → ⋯ → Export as CSV. Salin juga kode lama jika perlu (GitHub menyimpan riwayatnya).
2. **Jalankan SQL update:** Supabase → SQL Editor → New query → tempel isi `supabase-update-v2.sql` → Run. Hasil yang benar: muncul 2 baris (`tools`, `gallery_urls`). Perintah ini hanya **menambah 2 kolom**, tidak menghapus atau mereset data.
3. **Unggah file ke GitHub:** buka repository → Add file → Upload files → pilih semua file di daftar "Unggah ke GitHub" di atas (**tanpa config.js**) → Commit changes. File dengan nama sama akan diganti.
4. **Tunggu ±1 menit.** Netlify menerbitkan ulang otomatis.
5. Buka website, lalu **tarik layar ke bawah** untuk memuat ulang.

## Pemasangan baru dari nol

Ikuti urutan ini. Semua nilai `config.js` didapat dari Supabase (Project Settings → API / Data API).

1. Buat akun GitHub, Supabase, dan Netlify (daftar dengan Google paling mudah).
2. Supabase → New project (region **Singapore**), simpan kata sandi database.
3. SQL Editor → jalankan `supabase-setup.sql`. (Sudah mencakup kolom v2.)
4. Authentication → Users → **Add user** (email + kata sandi kuat, centang **Auto Confirm User**). Lalu Authentication → Sign In / Providers → **matikan** "Allow new users to sign up".
5. SQL Editor → ganti email di `supabase-jadikan-admin.sql` → Run (harus muncul 1 baris berisi email Anda).
6. Isi `config.js`: `SUPABASE_URL` dan `SUPABASE_ANON_KEY` (kunci **anon/publishable**). **Jangan pernah** memakai kunci `service_role` atau secret.
7. GitHub → New repository → Upload semua file di daftar (13 file + config.js yang sudah diisi).
8. Netlify → Add new project → Import from GitHub → pilih repository → Build command **kosong**, Publish directory `.` → Deploy.
9. Supabase → Authentication → URL Configuration → Site URL → isi alamat Netlify Anda.

---

## Mengisi konten (Dashboard)

Buka `https://alamat-anda.netlify.app/admin`, masuk, lalu pakai menu di sisi kiri (di HP: tombol ☰ di kiri atas).

- **Ringkasan**: jumlah isi dan karya terbaru. Tombol cepat untuk Tambah karya dan Edit profil.
- **Profil**: nama, foto, perkenalan, cerita, nilai hidup, minat, tujuan, CV.
- **Karya**: judul, kategori, tahun, **gambar utama**, **gambar tambahan (galeri)**, penjelasan, **alat yang dipakai**, tautan, dokumen, tag.
- **Kontak**: pilih platform dan isi tautan. Hanya yang Anda isi dan tampilkan yang muncul di website.

Tips:
- **Karya Pilihan** di beranda menampilkan 6 karya pertama. Isi kolom **Urutan tampil** (1, 2, 3…) untuk mengatur yang tampil lebih dulu. Sisanya terbuka lewat "Lihat semua".
- Foto profil terbaik berbentuk **potret (tegak)** dan wajah di bagian atas.
- Gambar karya tidak dipotong. Semua ukuran tampil utuh.
- Format WhatsApp: `https://wa.me/628123456789` (tanpa `+` dan tanpa `0` di depan).
- **Hapus atau ganti semua teks `[ISI: ...]`** sebelum membagikan link.
- Angka di bagian Tentang Saya (jumlah karya, prestasi, proyek) dihitung otomatis dari isi Anda. Tidak ada angka karangan.

---

## Daftar uji setelah online (±5 menit)

**Halaman publik (HP dan laptop)**
- [ ] Beranda terbuka, nama dan foto Anda tampil, tidak ada teks `[ISI: ...]` yang tersisa
- [ ] Bar kuning "konten contoh" **tidak** muncul (jika muncul, `config.js` belum benar)
- [ ] Menu atas (laptop) / tombol ▦ (HP) membuka semua 10 bagian
- [ ] Ketuk kartu karya membuka halaman detail, tombol Kembali (dan tombol kembali Android) bekerja
- [ ] Filter kategori dan kolom cari di Karya bekerja
- [ ] Tombol 🔍 mencari ke semua isi; tombol bulan/matahari mengganti tema
- [ ] Tidak ada geseran ke samping di HP

**Admin**
- [ ] `/admin` di jendela penyamaran hanya menampilkan form masuk
- [ ] Login benar masuk; kata sandi salah ditolak
- [ ] Tambah karya + unggah gambar → muncul di website
- [ ] Sembunyikan karya → hilang dari website; Tampilkan → muncul lagi

**Keamanan**
- [ ] `config.js` hanya berisi anon/publishable key, **bukan** service_role
- [ ] "Allow new users to sign up" di Supabase **mati**

---

## Mengubah tampilan

- **Warna**: `tokens.css`, bagian atas. Ubah `--accent` (ice blue `#78a9ff`), `--bg` (latar `#080f1e`), `--surface` / `--surface-2` (kartu/panel) di `tokens.css`. Mode terang punya blok sendiri di bawahnya.
- **Huruf**: variabel `--f` di `tokens.css` dan tautan Google Fonts di `index.html` / `admin.html`.
- **Animasi**: jika pengunjung mengaktifkan "kurangi gerakan" di perangkatnya, semua animasi otomatis dimatikan dan konten langsung tampil.

## Masalah umum

| Gejala | Solusi |
|---|---|
| Bar kuning "konten contoh" | `config.js` kosong/salah (mungkin tertimpa), atau SQL belum dijalankan |
| Simpan karya gagal: "Kolom baru belum ada" | Jalankan `supabase-update-v2.sql` |
| "Ditolak: akun ini tidak punya izin" | Akun belum terdaftar admin (`supabase-jadikan-admin.sql`) atau sesi habis, masuk lagi |
| Tampilan lama masih muncul | Tunggu Netlify selesai (±1 menit), lalu muat ulang |
| Gambar tidak tampil | Pastikan tautan diawali `https://` dan bucket `portfolio` ada |
| Font terlihat berbeda | Font Bricolage Grotesque dimuat dari Google Fonts, perlu internet. Tanpa itu tampil font bawaan HP |

---

## Batas pengujian (jujur)

Belum teruji: Supabase asli, HP Android fisik, Safari/iPhone, Firefox, header CSP Netlify asli, dan pemuatan font Google asli (di tes dipakai font cadangan).


Saya menguji kode di Chromium otomatis (ukuran HP 390 px, tablet 820 px, laptop 1440 px) dengan **data uji dan Supabase tiruan**. Yang **belum** teruji:
- Koneksi ke project Supabase **asli** Anda, dan unggahan ke Storage asli
- HP Android fisik, Safari/iPhone, dan Firefox
- Header keamanan (CSP) `netlify.toml` di server Netlify asli. Jika setelah online font atau gambar tidak tampil, hapus sementara baris `Content-Security-Policy` di `netlify.toml` dan kabari saya
