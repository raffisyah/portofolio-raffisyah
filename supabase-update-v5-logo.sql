-- =====================================================================
--  FITUR "LOGO WEBSITE" — jalankan SEKALI di Supabase → SQL Editor
--
--  Menambah SATU kolom baru di tabel profile: logo_url
--  (tempat tautan logo yang tampil di pojok kiri atas navbar dan footer).
--
--  AMAN:
--    - TIDAK menghapus, mengubah, atau mereset data apa pun.
--    - Kebijakan keamanan (RLS) yang sudah ada otomatis berlaku untuk kolom baru:
--      pengunjung hanya membaca, hanya pemilik (is_owner()) yang boleh mengubah.
--    - Aman dijalankan berulang kali.
-- =====================================================================
alter table public.profile add column if not exists logo_url text;

-- Cek hasilnya: harus muncul 1 baris (logo_url)
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'profile' and column_name = 'logo_url';
