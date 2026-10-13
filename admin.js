/* =====================================================================
   admin.js — dashboard admin pribadi
   Keamanan: login lewat Supabase Auth. Hak ubah data dijaga oleh
   Row Level Security di database (lihat supabase-setup.sql), BUKAN oleh
   file ini. Jadi walau orang lain membuka halaman ini, mereka tidak bisa
   mengubah apa pun.
   ===================================================================== */
(function () {
  "use strict";

  var cfg = window.PORTFOLIO_CONFIG || {};
  var BUCKET = cfg.STORAGE_BUCKET || "portfolio";
  var esc = window.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var client = null;

  var MAX_IMG_DIM = 1800;                 // gambar diperkecil otomatis agar hemat kuota
  var MAX_FILE_BYTES = 10 * 1024 * 1024;  // batas dokumen 10 MB (sama dengan bucket)

  function icon(n) { return '<svg class="ic" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; }

  /* ---------------------------------------------------------------
     DAFTAR PILIHAN
     --------------------------------------------------------------- */
  var O = {
    eduLevel: ["TK / PAUD", "SD / MI", "SMP / MTs", "SMA / MA / SMK", "Pondok Pesantren", "Kuliah", "Kursus / Non-formal", "Lainnya"],
    expCat: ["Organisasi", "Kepemimpinan", "Kegiatan Pondok", "Kepanitiaan", "Pekerjaan / Magang", "Relawan", "Lainnya"],
    skillCat: ["Desain Grafis", "Kreativitas", "IT / Teknologi", "Mengajar", "Bahasa", "Komunikasi", "Menulis", "Lainnya"],
    skillLevel: ["Pemula", "Menengah", "Mahir"],
    workCat: ["Desain", "Ilustrasi", "Video", "Proyek Digital", "Tulisan", "Pidato", "Terjemahan", "Dokumentasi", "Lainnya"],
    achType: ["Lomba", "Penghargaan", "Sertifikat", "Beasiswa", "Lainnya"],
    projType: ["Proyek Pribadi", "Proyek Organisasi", "Proyek Digital", "Ide Bisnis", "Lainnya"],
    projStatus: ["Ide", "Sedang Berjalan", "Selesai"],
    toolCat: ["Design", "Video Editing", "Web Development", "AI", "Other"],
    toolStatus: ["Aktif digunakan", "Sesekali", "Sedang belajar"],
    goalCat: ["Kuliah", "Beasiswa", "Pengembangan Kemampuan", "Karier", "Lainnya"],
    goalStatus: ["Rencana", "Sedang Dijalani", "Tercapai"],
    platform: [
      ["email", "Email"], ["whatsapp", "WhatsApp"], ["instagram", "Instagram"], ["tiktok", "TikTok"], ["youtube", "YouTube"],
      ["github", "GitHub"], ["linkedin", "LinkedIn"], ["behance", "Behance"], ["dribbble", "Dribbble"], ["facebook", "Facebook"],
      ["x", "X (Twitter)"], ["telegram", "Telegram"], ["website", "Website"], ["lainnya", "Lainnya"]
    ]
  };

  var COMMON = [
    { name: "sort_order", label: "Urutan tampil", type: "number", def: 0, help: "Angka kecil tampil lebih dulu. Karya dengan urutan terkecil menjadi “Karya Pilihan” di beranda." },
    { name: "is_visible", label: "Tampilkan di website", type: "checkbox", def: true }
  ];

  /* ---------------------------------------------------------------
     DEFINISI BAGIAN KONTEN (nama kolom harus sama dengan di SQL)
     --------------------------------------------------------------- */
  var SECTIONS = [
    { key: "overview", label: "Ringkasan", icon: "dash", overview: true },
    {
      key: "profile", label: "Profil", icon: "user", single: true, table: "profile",
      hint: "Nama, foto, perkenalan, dan isi bagian Tentang Saya.",
      fields: [
        { name: "full_name", label: "Nama lengkap", type: "text", required: true },
        { name: "photo_url", label: "Foto profil", type: "image", folder: "profil", help: "Disarankan foto potret (tegak)." },
        { name: "tagline", label: "Julukan atau profesi singkat", type: "text", placeholder: "Contoh: Pelajar, Kreator, Pengajar" },
        { name: "availability", label: "Status ketersediaan (lencana kecil)", type: "text", placeholder: "Contoh: Terbuka untuk beasiswa dan freelance", help: "Kosongkan jika tidak ingin ditampilkan." },
        { name: "short_intro", label: "Perkenalan singkat (Beranda)", type: "textarea", rows: 4 },
        { name: "about_story", label: "Cerita tentang saya", type: "textarea", rows: 6, help: "Tekan Enter untuk membuat paragraf baru." },
        { name: "character_text", label: "Karakter", type: "textarea", rows: 3 },
        { name: "values_text", label: "Nilai hidup", type: "textarea", rows: 4, help: "Satu nilai per baris." },
        { name: "interests_text", label: "Minat", type: "textarea", rows: 2, help: "Pisahkan dengan koma. Contoh: desain, menulis, mengajar" },
        { name: "goals_text", label: "Tujuan hidup", type: "textarea", rows: 4 },
        { name: "location", label: "Lokasi (opsional)", type: "text", placeholder: "Contoh: Sragen, Jawa Tengah" },
        { name: "cv_url", label: "Berkas CV (PDF)", type: "file", folder: "dokumen", help: "Jika diisi, tombol Unduh CV muncul di Beranda." }
      ]
    },
    {
      key: "education", label: "Pendidikan", icon: "cap", table: "education",
      hint: "Riwayat pendidikan dan pengalaman belajar.",
      titleOf: function (r) { return r.institution; },
      subOf: function (r) { return [r.level, r.major, [r.start_year, r.end_year].filter(Boolean).join(" – ")].filter(Boolean).join(", "); },
      fields: [
        { name: "institution", label: "Nama sekolah, pondok, atau kampus", type: "text", required: true },
        { name: "level", label: "Jenjang", type: "select", options: O.eduLevel },
        { name: "major", label: "Jurusan atau program (opsional)", type: "text" },
        { name: "start_year", label: "Tahun mulai", type: "text", placeholder: "Contoh: 2021" },
        { name: "end_year", label: "Tahun selesai", type: "text", placeholder: "Contoh: 2024 atau Sekarang" },
        { name: "description", label: "Cerita atau pengalaman belajar", type: "textarea" }
      ]
    },
    {
      key: "experiences", label: "Pengalaman", icon: "briefcase", table: "experiences",
      hint: "Organisasi, kepemimpinan, kegiatan pondok, kepanitiaan, dan lainnya.",
      titleOf: function (r) { return r.title; },
      subOf: function (r) { return [r.organization, r.category, [r.start_date, r.end_date].filter(Boolean).join(" – ")].filter(Boolean).join(", "); },
      fields: [
        { name: "title", label: "Jabatan atau peran", type: "text", required: true },
        { name: "organization", label: "Nama organisasi atau kegiatan", type: "text" },
        { name: "category", label: "Kategori", type: "select", options: O.expCat },
        { name: "start_date", label: "Mulai", type: "text", placeholder: "Contoh: Juli 2023" },
        { name: "end_date", label: "Selesai", type: "text", placeholder: "Contoh: Juni 2024 atau Sekarang" },
        { name: "description", label: "Tugas dan hal yang dipelajari", type: "textarea" }
      ]
    },
    {
      key: "skills", label: "Keahlian", icon: "sparkle", table: "skills",
      hint: "Hanya isi keahlian yang benar-benar Anda miliki.",
      titleOf: function (r) { return r.name; },
      subOf: function (r) { return [r.category, r.level].filter(Boolean).join(", "); },
      fields: [
        { name: "name", label: "Nama keahlian", type: "text", required: true },
        { name: "category", label: "Kategori", type: "select", options: O.skillCat },
        { name: "level", label: "Tingkat (jujur saja)", type: "select", options: O.skillLevel },
        { name: "description", label: "Keterangan singkat", type: "textarea", rows: 3, help: "Contoh: alat yang dipakai atau pengalaman memakainya." }
      ]
    },
    {
      key: "works", label: "Karya", icon: "image", table: "works",
      hint: "Desain, ilustrasi, video, proyek digital, tulisan, pidato, terjemahan, dokumentasi.",
      titleOf: function (r) { return r.title; },
      subOf: function (r) { return [r.category, r.year].filter(Boolean).join(", "); },
      fields: [
        { name: "title", label: "Judul karya", type: "text", required: true },
        { name: "category", label: "Kategori", type: "select", options: O.workCat },
        { name: "year", label: "Tahun", type: "text", placeholder: "Contoh: 2025" },
        { name: "image_url", label: "Gambar utama", type: "image", folder: "karya", help: "Tampil di kartu dan halaman detail. Diperkecil otomatis agar ringan." },
        { name: "gallery_urls", label: "Gambar tambahan (galeri)", type: "gallery", folder: "karya", help: "Tampil sebagai thumbnail di halaman detail. Satu tautan per baris." },
        { name: "description", label: "Penjelasan karya", type: "textarea" },
        { name: "tools", label: "Alat yang dipakai", type: "text", placeholder: "Pisahkan dengan koma. Contoh: Photoshop, Illustrator, Canva" },
        { name: "link_url", label: "Tautan (YouTube, Drive, Behance, dll.)", type: "url", placeholder: "https://…" },
        { name: "file_url", label: "Dokumen (PDF, dll.), opsional", type: "file", folder: "dokumen" },
        { name: "tags", label: "Tag", type: "text", placeholder: "Pisahkan dengan koma. Contoh: poster, branding" }
      ]
    },
    {
      key: "achievements", label: "Prestasi", icon: "award", table: "achievements",
      hint: "Lomba, penghargaan, sertifikat, dan pencapaian.",
      titleOf: function (r) { return r.title; },
      subOf: function (r) { return [r.type, r.issuer, r.year].filter(Boolean).join(", "); },
      fields: [
        { name: "title", label: "Nama prestasi atau sertifikat", type: "text", required: true },
        { name: "type", label: "Jenis", type: "select", options: O.achType },
        { name: "issuer", label: "Penyelenggara", type: "text" },
        { name: "year", label: "Tahun", type: "text" },
        { name: "result", label: "Hasil atau peringkat", type: "text", placeholder: "Contoh: Juara 2, Finalis, Peserta" },
        { name: "image_url", label: "Foto sertifikat atau dokumentasi", type: "image", folder: "prestasi" },
        { name: "file_url", label: "Berkas sertifikat (PDF), opsional", type: "file", folder: "dokumen" },
        { name: "description", label: "Keterangan", type: "textarea", rows: 3 }
      ]
    },
    {
      key: "projects", label: "Proyek", icon: "folder", table: "projects",
      hint: "Proyek pribadi, organisasi, digital, dan ide bisnis.",
      titleOf: function (r) { return r.title; },
      subOf: function (r) { return [r.type, r.status].filter(Boolean).join(", "); },
      fields: [
        { name: "title", label: "Nama proyek", type: "text", required: true },
        { name: "type", label: "Jenis", type: "select", options: O.projType },
        { name: "status", label: "Status", type: "select", options: O.projStatus },
        { name: "image_url", label: "Gambar proyek", type: "image", folder: "proyek" },
        { name: "description", label: "Deskripsi", type: "textarea" },
        { name: "link_url", label: "Tautan proyek (opsional)", type: "url", placeholder: "https://…" },
        { name: "tags", label: "Tag", type: "text", placeholder: "Pisahkan dengan koma" }
      ]
    },
    {
      key: "tools", label: "Tools & Platforms", icon: "tools", table: "tools_platforms", reorder: true,
      flag: { field: "is_most_used", on: "Batalkan Most Used", off: "Tandai Most Used", badge: "Most Used" },
      hint: "Aplikasi dan platform yang Anda pakai. Tombol ↑ ↓ mengatur urutan tampil. “Most Used” Anda tandai sendiri.",
      titleOf: function (r) { return r.name; },
      subOf: function (r) { return [r.category, r.usage_status].filter(Boolean).join(", "); },
      fields: [
        { name: "name", label: "Nama aplikasi", type: "text", required: true },
        { name: "category", label: "Kategori", type: "select", options: O.toolCat },
        { name: "image_url", label: "Ikon atau logo", type: "image", folder: "tools", help: "Opsional. Jika kosong, tampil huruf pertama nama aplikasi." },
        { name: "description", label: "Deskripsi singkat", type: "textarea", rows: 3 },
        { name: "link_url", label: "Tautan (opsional)", type: "url", placeholder: "https://…" },
        { name: "usage_status", label: "Status penggunaan", type: "select", options: O.toolStatus },
        { name: "is_most_used", label: "Tandai sebagai “Most Used”", type: "checkbox", def: false, help: "Pilihan manual Anda. Badge ini tidak dihitung otomatis." }
      ]
    },
    {
      key: "goals", label: "Target", icon: "target", table: "goals",
      hint: "Rencana kuliah, beasiswa, pengembangan kemampuan, dan target karier.",
      titleOf: function (r) { return r.title; },
      subOf: function (r) { return [r.category, r.target_period, r.status].filter(Boolean).join(", "); },
      fields: [
        { name: "title", label: "Target", type: "text", required: true },
        { name: "category", label: "Kategori", type: "select", options: O.goalCat },
        { name: "target_period", label: "Waktu atau tahun target", type: "text", placeholder: "Contoh: 2027" },
        { name: "status", label: "Status", type: "select", options: O.goalStatus },
        { name: "description", label: "Langkah dan alasan", type: "textarea" }
      ]
    },
    {
      key: "contact", label: "Kontak", icon: "mail", table: "contact_links",
      hint: "Pilih kontak dan media sosial yang ingin ditampilkan. Hilangkan centang Tampilkan untuk menyembunyikan.",
      titleOf: function (r) { return r.label || r.platform; },
      subOf: function (r) { return r.url; },
      fields: [
        { name: "platform", label: "Platform", type: "select", options: O.platform, required: true },
        { name: "label", label: "Nama tampilan (opsional)", type: "text", placeholder: "Contoh: Instagram Pribadi" },
        { name: "url", label: "Tautan atau alamat email", type: "text", required: true,
          help: "Email: tulis alamat emailnya saja. WhatsApp: https://wa.me/628xxxxxxxxxx (tanpa tanda + atau 0 di depan). Lainnya: tautan lengkap diawali https://" }
      ]
    },
    { key: "account", label: "Akun", icon: "lock", account: true }
  ];

  function secByKey(k) { return SECTIONS.filter(function (s) { return s.key === k; })[0]; }

  /* ---------------------------------------------------------------
     FUNGSI BANTU
     --------------------------------------------------------------- */
  var toastTimer;
  function toast(msg, isErr) {
    var t = $("#toast");
    t.textContent = msg; t.className = "toast" + (isErr ? " err" : ""); t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, isErr ? 6500 : 2800);
  }

  function explain(err) {
    var m = String((err && (err.message || err.error_description)) || err || "");
    if (err && (err.code === "42501" || /row-level security|permission denied/i.test(m))) return "Ditolak: akun ini tidak punya izin. Pastikan Anda sudah masuk dengan akun admin.";
    if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return "Tidak ada koneksi internet. Coba lagi.";
    if (/tools_platforms/i.test(m) && (/schema cache|does not exist|Could not find/i.test(m) || (err && (err.code === "42P01" || err.code === "PGRST205")))) return "Tabel Tools belum dibuat. Jalankan supabase-update-v4-tools.sql di Supabase SQL Editor (lihat PANDUAN).";
    if (err && err.code === "42P01") return "Tabel belum dibuat. Jalankan supabase-setup.sql dulu.";
    if (/schema cache|column .* does not exist|PGRST204/i.test(m)) return "Kolom baru belum ada di database. Jalankan supabase-update-v2.sql di Supabase SQL Editor (lihat PANDUAN).";
    return m || "Terjadi kesalahan.";
  }

  function showView(v) {
    $("#setupView").hidden = v !== "setup";
    $("#loginView").hidden = v !== "login";
    $("#appView").hidden = v !== "app";
  }

  function ago(iso) {
    var s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 3600) return Math.max(1, Math.round(s / 60)) + " menit lalu";
    if (s < 86400) return Math.round(s / 3600) + " jam lalu";
    if (s < 86400 * 30) return Math.round(s / 86400) + " hari lalu";
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  /* ---------------------------------------------------------------
     MEMBUAT FORMULIR
     --------------------------------------------------------------- */
  function fieldHtml(f, v) {
    var id = "f_" + f.name;
    var req = f.required ? ' <span class="req" aria-hidden="true">*</span>' : "";
    var help = f.help ? '<small class="help">' + esc(f.help) + "</small>" : "";
    var ph = f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : "";
    var r = f.required ? " required" : "";
    var s = v == null ? "" : String(v);

    if (f.type === "checkbox") {
      return '<div class="field"><label class="check"><input type="checkbox" id="' + id + '" name="' + f.name + '"' + (v ? " checked" : "") + "> " + esc(f.label) + "</label>" + help + "</div>";
    }
    var ctl = "";
    if (f.type === "textarea") {
      ctl = '<textarea id="' + id + '" name="' + f.name + '" rows="' + (f.rows || 4) + '"' + ph + r + ">" + esc(s) + "</textarea>";
    } else if (f.type === "select") {
      var opts = f.options.map(function (o) { return Array.isArray(o) ? o : [o, o]; });
      if (s && !opts.some(function (o) { return o[0] === s; })) opts.push([s, s]);
      ctl = '<select id="' + id + '" name="' + f.name + '"' + r + '><option value="">Pilih…</option>' +
        opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === s ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select>";
    } else if (f.type === "image" || f.type === "file") {
      var accept = f.type === "image" ? "image/*" : ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt";
      ctl = '<div class="upload" data-kind="' + f.type + '" data-folder="' + esc(f.folder || "umum") + '">' +
        '<input type="url" data-target id="' + id + '" name="' + f.name + '" value="' + esc(s) + '" placeholder="Tempel tautan, atau unggah dari HP" inputmode="url">' +
        '<div class="up-row"><label class="btn btn-outline btn-sm">' + icon("upload") + (f.type === "image" ? "Pilih gambar" : "Pilih berkas") +
        '<input type="file" accept="' + accept + '"></label>' +
        '<button type="button" class="btn btn-outline btn-sm" data-clear>Hapus</button><span class="up-status" role="status"></span></div>' +
        '<div class="up-prev"></div></div>';
    } else if (f.type === "gallery") {
      ctl = '<div class="upload" data-kind="image" data-multi="1" data-folder="' + esc(f.folder || "umum") + '">' +
        '<textarea data-target id="' + id + '" name="' + f.name + '" rows="3" placeholder="Satu tautan gambar per baris">' + esc(s) + "</textarea>" +
        '<div class="up-row"><label class="btn btn-outline btn-sm">' + icon("upload") + 'Tambah gambar<input type="file" accept="image/*" multiple></label>' +
        '<button type="button" class="btn btn-outline btn-sm" data-clear>Kosongkan</button><span class="up-status" role="status"></span></div>' +
        '<div class="up-prev"></div></div>';
    } else {
      var type = f.type === "number" ? "number" : f.type === "url" ? "url" : "text";
      var extra = f.type === "number" ? ' inputmode="numeric" step="1"' : f.type === "url" ? ' inputmode="url"' : "";
      ctl = '<input type="' + type + '" id="' + id + '" name="' + f.name + '" value="' + esc(s) + '"' + ph + extra + r + ">";
    }
    return '<div class="field"><label for="' + id + '">' + esc(f.label) + req + "</label>" + ctl + help + "</div>";
  }

  function allFields(sec) { return sec.single ? sec.fields : sec.fields.concat(COMMON); }

  function formHtml(sec, row) {
    return allFields(sec).map(function (f) {
      var v = row ? row[f.name] : (f.def != null ? f.def : "");
      if (row && f.type === "checkbox" && v == null) v = f.def;
      return fieldHtml(f, v);
    }).join("");
  }

  function collect(form, sec) {
    var out = {};
    allFields(sec).forEach(function (f) {
      var el = form.elements[f.name];
      if (!el) return;
      if (f.type === "checkbox") out[f.name] = el.checked;
      else if (f.type === "number") { var n = parseInt(el.value, 10); out[f.name] = isNaN(n) ? (f.def || 0) : n; }
      else { var v = el.value.trim(); out[f.name] = v === "" ? (f.required ? "" : null) : v; }
    });
    return out;
  }

  /* ---------------------------------------------------------------
     UNGGAH GAMBAR & DOKUMEN
     --------------------------------------------------------------- */
  var EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

  async function shrinkImage(file) {
    if (file.type === "image/gif") return { blob: file, ext: "gif" };
    var bmp = await createImageBitmap(file);
    var scale = Math.min(1, MAX_IMG_DIM / Math.max(bmp.width, bmp.height));
    var w = Math.max(1, Math.round(bmp.width * scale)), h = Math.max(1, Math.round(bmp.height * scale));
    var canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
    canvas.getContext("2d").drawImage(bmp, 0, 0, w, h);
    if (bmp.close) bmp.close();
    var blob = await new Promise(function (res) { canvas.toBlob(res, "image/webp", 0.86); });
    if (!blob || !EXT[blob.type]) blob = await new Promise(function (res) { canvas.toBlob(res, "image/jpeg", 0.88); });
    if (!blob) throw new Error("Gambar tidak bisa diproses.");
    return { blob: blob, ext: EXT[blob.type] || "jpg" };
  }

  function renderPreview(wrap) {
    var target = $("[data-target]", wrap), prev = $(".up-prev", wrap);
    var urls = wrap.dataset.multi ? target.value.split(/\n+/) : [target.value];
    urls = urls.map(function (u) { return u.trim(); }).filter(Boolean).map(window.safeUrl).filter(Boolean);
    if (!urls.length) { prev.innerHTML = ""; return; }
    prev.innerHTML = wrap.dataset.kind === "image"
      ? urls.map(function (u) { return '<img src="' + esc(u) + '" alt="Pratinjau">'; }).join("")
      : '<a href="' + esc(urls[0]) + '" target="_blank" rel="noopener noreferrer">Buka berkas</a>';
  }

  async function uploadOne(file, wrap) {
    var blob = file, ext;
    if (wrap.dataset.kind === "image") {
      if (!/^image\//.test(file.type)) throw new Error("Pilih berkas gambar (JPG, PNG, WebP).");
      var r = await shrinkImage(file); blob = r.blob; ext = r.ext;
    } else {
      if (file.size > MAX_FILE_BYTES) throw new Error("Berkas terlalu besar (maksimal 10 MB).");
      ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
    }
    var path = (wrap.dataset.folder || "umum") + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
    var up = await client.storage.from(BUCKET).upload(path, blob, { contentType: blob.type || file.type || "application/octet-stream", cacheControl: "31536000", upsert: false });
    if (up.error) throw up.error;
    return client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  async function handleUpload(fileInput) {
    var wrap = fileInput.closest(".upload"), status = $(".up-status", wrap), target = $("[data-target]", wrap);
    var files = Array.prototype.slice.call(fileInput.files || []);
    if (!files.length) return;
    status.className = "up-status"; status.textContent = "Mengunggah…";
    try {
      for (var i = 0; i < files.length; i++) {
        status.textContent = "Mengunggah " + (i + 1) + " dari " + files.length + "…";
        var url = await uploadOne(files[i], wrap);
        if (wrap.dataset.multi) target.value = (target.value.trim() ? target.value.trim() + "\n" : "") + url;
        else target.value = url;
      }
      renderPreview(wrap);
      status.textContent = "Berhasil diunggah. Jangan lupa tekan Simpan.";
    } catch (e) {
      status.className = "up-status err"; status.textContent = explain(e);
    } finally { fileInput.value = ""; }
  }

  function bindUploads(scope) {
    scope.addEventListener("change", function (e) {
      if (e.target.matches('.upload input[type="file"]')) handleUpload(e.target);
      else if (e.target.matches(".upload [data-target]")) renderPreview(e.target.closest(".upload"));
    });
    scope.addEventListener("click", function (e) {
      var b = e.target.closest("[data-clear]"); if (!b) return;
      var wrap = b.closest(".upload");
      $("[data-target]", wrap).value = ""; renderPreview(wrap); $(".up-status", wrap).textContent = "";
    });
    $$(".upload", scope).forEach(renderPreview);
  }

  /* ---------------------------------------------------------------
     SIMPAN / HAPUS
     --------------------------------------------------------------- */
  async function save(sec, row, vals) {
    var res;
    if (sec.single) res = await client.from("profile").upsert(Object.assign({ id: 1 }, vals), { onConflict: "id" });
    else if (row) res = await client.from(sec.table).update(vals).eq("id", row.id);
    else res = await client.from(sec.table).insert(vals);
    if (res.error) throw res.error;
  }

  var current = "overview";
  var cache = {};

  /* ---------------------------------------------------------------
     NAVIGASI SIDEBAR
     --------------------------------------------------------------- */
  function buildNav() {
    $("#sideNav").innerHTML = SECTIONS.map(function (s) {
      return '<button class="nav-item" type="button" data-key="' + s.key + '">' + icon(s.icon) + "<span>" + esc(s.label) + "</span></button>";
    }).join("");
  }
  function setCurrentNav() {
    $$(".nav-item[data-key]").forEach(function (t) { if (t.dataset.key === current) t.setAttribute("aria-current", "true"); else t.removeAttribute("aria-current"); });
    $("#pageTitle").textContent = secByKey(current).label;
  }
  function drawer(open) {
    $("#side").classList.toggle("open", open);
    $("#scrim").hidden = !open;
  }

  function openSection(key) {
    current = key; setCurrentNav(); drawer(false);
    var sec = secByKey(key);
    window.scrollTo(0, 0);
    if (sec.overview) return renderOverview();
    if (sec.single) return renderProfile(sec);
    if (sec.account) return renderAccount();
    return renderList(sec);
  }

  /* ---------------------------------------------------------------
     RINGKASAN
     --------------------------------------------------------------- */
  async function renderOverview() {
    var main = $("#adminMain");
    var tiles = [["works", "Karya"], ["achievements", "Prestasi"], ["projects", "Proyek"], ["skills", "Keahlian"], ["tools_platforms", "Tools & Platforms", "tools"], ["experiences", "Pengalaman"], ["education", "Pendidikan"], ["goals", "Target"]];
    main.innerHTML = '<div class="sec-head"><div><h2>Ringkasan</h2><p class="muted">Gambaran isi website Anda saat ini.</p></div></div>' +
      '<div class="quick"><button class="btn btn-primary" type="button" id="qAddWork">' + icon("plus") + 'Tambah karya</button>' +
      '<button class="btn btn-outline" type="button" id="qTools">' + icon("tools") + 'Kelola Tools</button>' +
      '<button class="btn btn-outline" type="button" id="qProfile">' + icon("user") + 'Edit profil</button></div>' +
      '<div class="tiles" id="tiles">' + tiles.map(function (t) { return '<button type="button" class="tile" data-go="' + (t[2] || t[0]) + '"><span class="n">…</span><span class="l">' + t[1] + "</span></button>"; }).join("") + "</div>" +
      '<h3 class="block-title">Karya terbaru</h3><div class="list" id="recent"><p class="muted">Memuat…</p></div>';

    $("#qAddWork").addEventListener("click", function () { current = "works"; setCurrentNav(); renderList(secByKey("works")).then(function () { openEditor(secByKey("works"), null); }); });
    $("#qTools").addEventListener("click", function () { openSection("tools"); });
    $("#qProfile").addEventListener("click", function () { openSection("profile"); });
    $("#tiles").addEventListener("click", function (e) { var t = e.target.closest("[data-go]"); if (t) openSection(t.dataset.go === "works" ? "works" : t.dataset.go); });

    var counts = await Promise.all(tiles.map(function (t) { return client.from(t[0]).select("id", { count: "exact", head: true }); }));
    $$(".tile .n", main).forEach(function (el, i) { el.textContent = counts[i].error ? "–" : String(counts[i].count || 0); });

    var rec = await client.from("works").select("id,title,category,image_url,created_at,is_visible").order("created_at", { ascending: false }).limit(5);
    var box = $("#recent");
    if (rec.error) { box.innerHTML = '<p class="msg">' + esc(explain(rec.error)) + "</p>"; return; }
    if (!rec.data.length) { box.innerHTML = '<div class="empty">Belum ada karya. Tekan Tambah karya untuk mulai.</div>'; return; }
    box.innerHTML = rec.data.map(function (r) {
      var th = window.safeUrl(r.image_url);
      return '<div class="row"><div class="row-top">' + (th ? '<img class="row-thumb" src="' + esc(th) + '" alt="" loading="lazy">' : "") +
        '<div class="row-main"><strong>' + esc(r.title) + "</strong><small>" + esc([r.category, ago(r.created_at)].filter(Boolean).join(", ")) + "</small>" +
        (r.is_visible ? "" : '<span class="badge-off">Disembunyikan</span>') + "</div></div></div>";
    }).join("");
  }

  /* ---------------------------------------------------------------
     PROFIL
     --------------------------------------------------------------- */
  async function renderProfile(sec) {
    var main = $("#adminMain");
    main.innerHTML = '<div class="sec-head"><div><h2>' + esc(sec.label) + '</h2><p class="muted">' + esc(sec.hint) + '</p></div></div><p class="muted">Memuat…</p>';
    var res = await client.from("profile").select("*").eq("id", 1).maybeSingle();
    if (res.error) { toast(explain(res.error), true); return; }
    main.innerHTML = '<div class="sec-head"><div><h2>' + esc(sec.label) + '</h2><p class="muted">' + esc(sec.hint) + "</p></div></div>" +
      '<form class="glass form-card" id="profileForm">' + formHtml(sec, res.data) + '<button class="btn btn-primary block" type="submit">Simpan profil</button></form>';
    var form = $("#profileForm");
    bindUploads(form);
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var btn = $("button[type=submit]", form); btn.disabled = true;
      try { await save(sec, null, collect(form, sec)); toast("Profil tersimpan"); }
      catch (err) { toast(explain(err), true); }
      btn.disabled = false;
    });
  }

  /* ---------------------------------------------------------------
     DAFTAR (CRUD)
     --------------------------------------------------------------- */
  async function renderList(sec) {
    var main = $("#adminMain");
    main.innerHTML = '<div class="sec-head"><div><h2>' + esc(sec.label) + '</h2><p class="muted">' + esc(sec.hint) + '</p></div>' +
      '<button class="btn btn-primary" type="button" id="addBtn">' + icon("plus") + 'Tambah</button></div><div class="list" id="list"><p class="muted">Memuat…</p></div>';
    $("#addBtn").addEventListener("click", function () { openEditor(sec, null); });

    var res = await client.from(sec.table).select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
    var list = $("#list");
    if (res.error) { list.innerHTML = '<p class="msg">' + esc(explain(res.error)) + "</p>"; return; }
    cache[sec.key] = res.data || [];
    if (!cache[sec.key].length) { list.innerHTML = '<div class="empty">Belum ada data. Tekan Tambah untuk mulai.</div>'; return; }

    list.innerHTML = cache[sec.key].map(function (r, idx) {
      var thumb = window.safeUrl(r.image_url);
      return '<article class="row"><div class="row-top">' +
        (thumb ? '<img class="row-thumb" src="' + esc(thumb) + '" alt="" loading="lazy">' : "") +
        '<div class="row-main"><strong>' + esc(sec.titleOf(r) || "(tanpa judul)") + "</strong>" +
        (sec.subOf(r) ? "<small>" + esc(sec.subOf(r)) + "</small>" : "") +
        (sec.flag && r[sec.flag.field] ? '<span class="badge-top">' + icon("star") + esc(sec.flag.badge) + "</span> " : "") +
        (r.is_visible ? "" : '<span class="badge-off">Disembunyikan</span>') + "</div></div>" +
        '<div class="row-actions">' +
        (sec.reorder ? '<button class="btn btn-outline btn-sm" type="button" data-act="up" data-id="' + esc(r.id) + '" aria-label="Naikkan urutan"' + (idx === 0 ? " disabled" : "") + ">" + icon("up") + '</button>' +
          '<button class="btn btn-outline btn-sm" type="button" data-act="down" data-id="' + esc(r.id) + '" aria-label="Turunkan urutan"' + (idx === cache[sec.key].length - 1 ? " disabled" : "") + ">" + icon("down") + "</button>" : "") +
        '<button class="btn btn-outline btn-sm" type="button" data-act="edit" data-id="' + esc(r.id) + '">' + icon("edit") + "Edit</button>" +
        (sec.flag ? '<button class="btn btn-outline btn-sm" type="button" data-act="flag" data-id="' + esc(r.id) + '">' + icon("star") + (r[sec.flag.field] ? sec.flag.on : sec.flag.off) + "</button>" : "") +
        '<button class="btn btn-outline btn-sm" type="button" data-act="toggle" data-id="' + esc(r.id) + '">' + icon(r.is_visible ? "eyeoff" : "eye") + (r.is_visible ? "Sembunyikan" : "Tampilkan") + "</button>" +
        '<button class="btn btn-danger btn-sm" type="button" data-act="del" data-id="' + esc(r.id) + '">' + icon("trash") + "Hapus</button></div></article>";
    }).join("");

    list.onclick = async function (e) {
      var b = e.target.closest("button[data-act]"); if (!b) return;
      var row = cache[sec.key].filter(function (x) { return String(x.id) === b.dataset.id; })[0];
      if (!row) return;
      if (b.dataset.act === "edit") return openEditor(sec, row);
      b.disabled = true;
      try {
        if (b.dataset.act === "flag") {
          var fv = {}; fv[sec.flag.field] = !row[sec.flag.field];
          var fu = await client.from(sec.table).update(fv).eq("id", row.id);
          if (fu.error) throw fu.error;
          toast(fv[sec.flag.field] ? "Ditandai " + sec.flag.badge : "Penanda " + sec.flag.badge + " dibatalkan");
        } else if (b.dataset.act === "up" || b.dataset.act === "down") {
          // tukar posisi dengan tetangga, lalu beri ulang nomor urut 10, 20, 30… agar tidak bentrok
          var arr = cache[sec.key].slice(), at = arr.indexOf(row), to = at + (b.dataset.act === "up" ? -1 : 1);
          if (to < 0 || to >= arr.length) { b.disabled = false; return; }
          arr.splice(to, 0, arr.splice(at, 1)[0]);
          var jobs = [];
          arr.forEach(function (x, i) { if (x.sort_order !== (i + 1) * 10) jobs.push(client.from(sec.table).update({ sort_order: (i + 1) * 10 }).eq("id", x.id)); });
          var rs = await Promise.all(jobs);
          var bad = rs.filter(function (q) { return q.error; })[0];
          if (bad) throw bad.error;
          toast("Urutan diperbarui");
        } else if (b.dataset.act === "toggle") {
          var u = await client.from(sec.table).update({ is_visible: !row.is_visible }).eq("id", row.id);
          if (u.error) throw u.error;
          toast(row.is_visible ? "Disembunyikan dari website" : "Ditampilkan di website");
        } else if (b.dataset.act === "del") {
          if (!window.confirm("Hapus “" + (sec.titleOf(row) || "item ini") + "” secara permanen? Tindakan ini tidak bisa dibatalkan.")) { b.disabled = false; return; }
          var d = await client.from(sec.table).delete().eq("id", row.id);
          if (d.error) throw d.error;
          toast("Terhapus");
        }
        renderList(sec);
      } catch (err) { toast(explain(err), true); b.disabled = false; }
    };
  }

  function openEditor(sec, row) {
    var dlg = $("#editor");
    dlg.innerHTML = '<form id="editForm"><div class="dlg-head"><h3>' + (row ? "Edit " : "Tambah ") + esc(sec.label) + '</h3>' +
      '<button class="icon-btn" type="button" data-close aria-label="Tutup">' + icon("close") + "</button></div>" +
      '<div class="dlg-body">' + formHtml(sec, row) + "</div>" +
      '<div class="dlg-foot"><button class="btn btn-outline" type="button" data-close>Batal</button><button class="btn btn-primary" type="submit">Simpan</button></div></form>';
    var form = $("#editForm", dlg);
    bindUploads(form);
    dlg.onclick = function (e) { if (e.target === dlg || e.target.closest("[data-close]")) dlg.close(); };
    form.onsubmit = async function (e) {
      e.preventDefault();
      var btn = $("button[type=submit]", form); btn.disabled = true;
      try { await save(sec, row, collect(form, sec)); dlg.close(); toast("Tersimpan"); renderList(sec); }
      catch (err) { toast(explain(err), true); btn.disabled = false; }
    };
    dlg.showModal();
  }

  /* ---------------------------------------------------------------
     AKUN
     --------------------------------------------------------------- */
  function renderAccount() {
    var main = $("#adminMain");
    main.innerHTML = '<div class="sec-head"><div><h2>Akun</h2><p class="muted">Ganti kata sandi admin.</p><p class="muted small">Versi dashboard: v4-tools (menu Tools &amp; Platforms tersedia).</p></div></div>' +
      '<form class="glass form-card" id="pwForm">' +
      '<div class="field"><label for="pw1">Kata sandi baru</label><input id="pw1" name="pw1" type="password" minlength="10" autocomplete="new-password" required><small class="help">Minimal 10 karakter. Gunakan campuran huruf, angka, dan simbol.</small></div>' +
      '<div class="field"><label for="pw2">Ulangi kata sandi baru</label><input id="pw2" name="pw2" type="password" minlength="10" autocomplete="new-password" required></div>' +
      '<button class="btn btn-primary block" type="submit">Ganti kata sandi</button></form>';
    var form = $("#pwForm");
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (form.pw1.value !== form.pw2.value) { toast("Kedua kata sandi tidak sama.", true); return; }
      var btn = $("button[type=submit]", form); btn.disabled = true;
      var res = await client.auth.updateUser({ password: form.pw1.value });
      btn.disabled = false;
      if (res.error) toast(explain(res.error), true);
      else { toast("Kata sandi diganti"); form.reset(); }
    });
  }

  /* ---------------------------------------------------------------
     LOGIN / LOGOUT
     --------------------------------------------------------------- */
  function loginMsg(t) { var m = $("#loginMsg"); m.textContent = t || ""; m.hidden = !t; }

  async function enter() {
    var res = await client.rpc("is_owner");
    if (res.error || res.data !== true) {
      await client.auth.signOut();
      showView("login");
      loginMsg(res.error ? explain(res.error) : "Akun ini bukan akun pemilik website, jadi tidak diizinkan masuk.");
      return;
    }
    showView("app");
    buildNav();
    openSection(current);
  }

  async function init() {
    $("#themeBtn").addEventListener("click", window.toggleTheme);
    $("#pwToggle").addEventListener("click", function () {
      var i = $("#loginPass"), show = i.type === "password";
      i.type = show ? "text" : "password";
      this.setAttribute("aria-label", show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi");
      this.innerHTML = icon(show ? "eyeoff" : "eye");
    });
    client = window.getClient();
    if (!client) { showView("setup"); return; }

    $("#sideNav").addEventListener("click", function (e) { var t = e.target.closest(".nav-item"); if (t) openSection(t.dataset.key); });
    $("#menuBtn").addEventListener("click", function () { drawer(true); });
    $("#sideClose").addEventListener("click", function () { drawer(false); });
    $("#scrim").addEventListener("click", function () { drawer(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") drawer(false); });
    $("#logoutBtn").addEventListener("click", async function () { await client.auth.signOut(); showView("login"); loginMsg(""); });
    $("#loginForm").addEventListener("submit", async function (e) {
      e.preventDefault();
      var btn = $("#loginBtn"); btn.disabled = true; loginMsg("");
      var res = await client.auth.signInWithPassword({ email: $("#loginEmail").value.trim(), password: $("#loginPass").value });
      if (res.error) { loginMsg("Email atau kata sandi salah."); btn.disabled = false; return; }
      await enter();
      $("#loginPass").value = "";
      btn.disabled = false;
    });

    var s = await client.auth.getSession();
    if (s.data && s.data.session) await enter(); else showView("login");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
