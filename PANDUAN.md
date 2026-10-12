# PANDUAN: Website Portofolio, Desain Baru (v2)

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

- **Warna**: `tokens.css`, bagian atas. Ubah `--accent` dan `--accent-2` (ungu-biru), `--bg` (latar).
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
| Font terlihat berbeda | Font Poppins dimuat dari Google Fonts, perlu internet. Tanpa itu tampil font bawaan HP |

---

## Batas pengujian (jujur)

Saya menguji kode di Chromium otomatis (ukuran HP 390 px, tablet 820 px, laptop 1440 px) dengan **data uji dan Supabase tiruan**. Yang **belum** teruji:
- Koneksi ke project Supabase **asli** Anda, dan unggahan ke Storage asli
- HP Android fisik, Safari/iPhone, dan Firefox
- Header keamanan (CSP) `netlify.toml` di server Netlify asli. Jika setelah online font atau gambar tidak tampil, hapus sementara baris `Content-Security-Policy` di `netlify.toml` dan kabari saya
