/* =====================================================================
   KONFIGURASI WEBSITE  (file ini AMAN dilihat publik)
   ---------------------------------------------------------------------
   Isi dua nilai di bawah dengan data dari Supabase Anda:
   Supabase → Project Settings → API (atau "Data API"):
     - Project URL            → contoh: https://abcdefgh.supabase.co
     - anon / publishable key → kunci PUBLIK (boleh ada di sini)

   ⚠️ JANGAN PERNAH menaruh "service_role" atau "secret" key di file ini
      atau di file mana pun di website. Kunci itu hanya untuk server.
   ===================================================================== */
window.PORTFOLIO_CONFIG = {
  SUPABASE_URL: "GANTI_DENGAN_PROJECT_URL_SUPABASE",
  SUPABASE_ANON_KEY: "GANTI_DENGAN_ANON_ATAU_PUBLISHABLE_KEY",
  STORAGE_BUCKET: "portfolio" // jangan diubah kecuali Anda mengubah nama bucket di SQL
};
