/* =====================================================================
   app.js — logika halaman publik
   Membaca data dari Supabase (hanya baca) lalu menampilkannya.
   Jika Supabase belum diatur, memakai konten contoh dari sample-data.js.
   ===================================================================== */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = window.esc, safeUrl = window.safeUrl, cssUrl = window.cssUrl, paragraphs = window.paragraphs, splitList = window.splitList;
  var val = function (v) { return v == null ? "" : String(v).trim(); };
  var uniq = function (a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); };
  var splitLines = function (t) { return String(t == null ? "" : t).split(/\n+/).map(val).filter(Boolean); };
  var root = document.documentElement;
  var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function icon(name, cls) { return '<svg class="ic' + (cls ? " " + cls : "") + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>'; }

  var PLATFORMS = {
    email: ["Email", "mail"], whatsapp: ["WhatsApp", "chat"], instagram: ["Instagram", "instagram"], tiktok: ["TikTok", "tiktok"],
    youtube: ["YouTube", "youtube"], github: ["GitHub", "code"], linkedin: ["LinkedIn", "linkedin"], behance: ["Behance", "palette"],
    dribbble: ["Dribbble", "dribbble"], facebook: ["Facebook", "facebook"], x: ["X (Twitter)", "x"], telegram: ["Telegram", "send"],
    website: ["Website", "globe"], lainnya: ["Tautan", "globe"]
  };
  var SKILL_ICON = { "Desain Grafis": "palette", "Kreativitas": "sparkle", "IT / Teknologi": "code", "Mengajar": "book", "Bahasa": "lang", "Komunikasi": "mic", "Menulis": "pen" };
  var LEVEL_DOTS = { "Pemula": 1, "Menengah": 2, "Mahir": 3 };

  /* rute halaman detail: #/karya/ID, #/prestasi/ID, #/proyek/ID */
  var ROUTES = {
    karya: { key: "works", sec: "karya", label: "Karya" },
    prestasi: { key: "achievements", sec: "prestasi", label: "Prestasi" },
    proyek: { key: "projects", sec: "proyek", label: "Proyek" }
  };

  var DATA = {};
  var DEMO = false;
  var INDEX = [];
  var lastResults = [];

  /* ---------------------------------------------------------------
     1. MUAT DATA
     --------------------------------------------------------------- */
  async function loadData() {
    var sample = window.SAMPLE_DATA;
    var client = window.getClient();
    if (!client) return { data: sample, demo: true };
    var lists = ["education", "experiences", "skills", "works", "achievements", "projects", "goals", "contact_links"];
    try {
      var reqs = lists.map(function (t) {
        return client.from(t).select("*").eq("is_visible", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false });
      });
      var all = await Promise.all([client.from("profile").select("*").eq("id", 1).maybeSingle()].concat(reqs));
      if (all[0].error) throw all[0].error;
      var data = { profile: all[0].data || sample.profile };
      for (var i = 0; i < lists.length; i++) {
        if (all[i + 1].error) throw all[i + 1].error;
        data[lists[i]] = all[i + 1].data || [];
      }
      return { data: data, demo: false };
    } catch (err) {
      console.error("Gagal memuat data dari Supabase:", err);
      return { data: sample, demo: true };
    }
  }

  /* ---------------------------------------------------------------
     2. FUNGSI BANTU
     --------------------------------------------------------------- */
  function initialOf(t) {
    var s = String(t || "").replace(/^[^A-Za-z0-9À-ɏ]+/, "");
    return (s.charAt(0) || "•").toUpperCase();
  }
  function period(a, b) {
    a = val(a); b = val(b);
    return a && b ? a + " – " + b : (a || b || "");
  }
  function emptyState(t) { return '<div class="empty">' + esc(t) + "</div>"; }
  function guardImages(scope) {
    $$("img", scope).forEach(function (im) {
      if (im.dataset.guard) return;
      im.dataset.guard = "1";
      im.addEventListener("error", function () { im.style.display = "none"; });
    });
  }
  function thumbHtml(url, alt, cat) {
    var u = safeUrl(url);
    if (!u) return '<div class="thumb"><div class="ph" aria-hidden="true">' + esc(initialOf(cat || alt)) + "</div></div>";
    return '<div class="thumb" style="--img:url(\'' + esc(cssUrl(u)) + '\')"><img src="' + esc(u) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async"></div>';
  }
  function contactInfo(c) {
    var raw = val(c.url), href = "", shown = raw;
    if (c.platform === "email" || /^[^\s@\/]+@[^\s@\/]+\.[^\s@\/]+$/.test(raw)) {
      var mail = raw.replace(/^mailto:/i, "");
      href = safeUrl("mailto:" + mail); shown = mail;
    } else {
      href = safeUrl(/^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : "https://" + raw);
      try { var u = new URL(href); shown = u.host.replace(/^www\./, "") + (u.pathname.length > 1 ? u.pathname : ""); } catch (e) { /* biarkan */ }
    }
    return { href: href, shown: shown };
  }

  /* ---------------------------------------------------------------
     3. HERO, TENTANG
     --------------------------------------------------------------- */
  function renderHero(p, contacts) {
    var name = val(p.full_name) || "Nama Anda";
    document.title = name + " | Portofolio Pribadi";
    var desc = val(p.short_intro) || val(p.tagline);
    var md = $('meta[name="description"]'); if (md && desc) md.setAttribute("content", desc.slice(0, 200));
    var ot = $('meta[property="og:title"]'); if (ot) ot.setAttribute("content", name + " | Portofolio");
    var od = $('meta[property="og:description"]'); if (od && desc) od.setAttribute("content", desc.slice(0, 200));

    var ini = window.initials(name);
    $("#brandName").textContent = name; $("#brandMark").textContent = ini;
    $("#footName2").textContent = name; $("#footMark").textContent = ini;

    var h1 = $("#heroName");
    h1.setAttribute("aria-label", name);
    h1.innerHTML = name.split(/\s+/).map(function (w, i) {
      return '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + esc(w) + "</span></span>";
    }).join(" ");

    var tag = $("#heroTagline"); tag.textContent = val(p.tagline); tag.hidden = !val(p.tagline);
    $("#heroIntro").innerHTML = paragraphs(p.short_intro);
    var badge = $("#heroBadge"); badge.textContent = val(p.availability); badge.hidden = !val(p.availability);

    var photo = $("#heroPhoto"), u = safeUrl(p.photo_url);
    function mono() { photo.innerHTML = '<div class="monogram" aria-hidden="true">' + esc(ini) + "</div>"; }
    if (u) {
      photo.innerHTML = '<img src="' + esc(u) + '" alt="Foto profil ' + esc(name) + '" fetchpriority="high" decoding="async">';
      $("img", photo).addEventListener("error", mono);
    } else mono();

    var cv = $("#cvBtn"), cvu = safeUrl(p.cv_url);
    if (cvu) { cv.href = cvu; cv.hidden = false; } else cv.hidden = true;

    var soc = (contacts || []).slice(0, 6).map(function (c) {
      var plat = PLATFORMS[c.platform] || PLATFORMS.lainnya, info = contactInfo(c);
      if (!info.href) return "";
      return '<li><a href="' + esc(info.href) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(val(c.label) || plat[0]) + '" title="' + esc(val(c.label) || plat[0]) + '">' + icon(plat[1]) + "</a></li>";
    }).join("");
    $("#heroSocial").innerHTML = soc; $("#heroSocial").hidden = !soc;

    $("#footYear").textContent = new Date().getFullYear();
    $("#footName").textContent = name;
  }

  function renderAbout(p, d) {
    var story = paragraphs(p.about_story);
    $("#aboutStory").innerHTML = story || '<p>Bagian ini belum diisi.</p>';

    // Angka nyata dari konten yang ada (disembunyikan pada mode contoh)
    var stats = "";
    if (!DEMO) {
      stats = [["works", "Karya"], ["achievements", "Prestasi dan sertifikat"], ["projects", "Proyek"], ["experiences", "Pengalaman"]]
        .filter(function (s) { return (d[s[0]] || []).length > 0; }).slice(0, 3)
        .map(function (s) { return '<li data-r><span class="num" data-to="' + d[s[0]].length + '">0</span><span class="lbl">' + esc(s[1]) + "</span></li>"; }).join("");
    }
    $("#aboutStats").innerHTML = stats;

    var cards = "";
    if (val(p.character_text)) cards += '<div class="info-card" data-spot data-r><h3>Karakter</h3>' + paragraphs(p.character_text) + "</div>";
    var vals = String(p.values_text || "").split(/\n+/).map(val).filter(Boolean);
    if (vals.length) cards += '<div class="info-card" data-spot data-r><h3>Nilai hidup</h3><ul>' + vals.map(function (v) { return "<li>" + esc(v) + "</li>"; }).join("") + "</ul></div>";
    var ints = splitList(p.interests_text);
    if (ints.length) cards += '<div class="info-card" data-spot data-r><h3>Minat</h3><div class="chips">' + ints.map(function (v) { return '<span class="tag">' + esc(v) + "</span>"; }).join("") + "</div></div>";
    if (val(p.goals_text)) cards += '<div class="info-card" data-spot data-r><h3>Tujuan</h3>' + paragraphs(p.goals_text) + "</div>";
    if (val(p.location)) cards += '<div class="info-card" data-spot data-r><h3>Lokasi</h3><p>' + esc(p.location) + "</p></div>";
    $("#aboutBento").innerHTML = cards;
  }

  /* ---------------------------------------------------------------
     4. KOLEKSI (filter + cari + "lihat semua")
     --------------------------------------------------------------- */
  function collection(host, cfg) {
    var items = cfg.items || [];
    if (!items.length) { host.innerHTML = emptyState(cfg.empty || "Belum ada konten."); return; }

    var cats = uniq(items.map(cfg.catOf).map(val).filter(Boolean));
    var q = "", cat = "Semua", expanded = false;
    var showSearch = cfg.search !== false && items.length > 4;
    var showChips = cats.length > 1;

    host.innerHTML =
      (showSearch || showChips ? '<div class="filters">' +
        (showSearch ? '<label class="search-field"><span class="sr-only">Cari</span><input type="search" placeholder="' + esc(cfg.placeholder || "Cari…") + '" autocomplete="off"></label>' : "") +
        (showChips ? '<div class="chips" role="group" aria-label="Filter kategori">' +
          ["Semua"].concat(cats).map(function (c) {
            return '<button type="button" class="chip" data-cat="' + esc(c) + '" aria-pressed="' + (c === "Semua") + '">' + esc(c) + "</button>";
          }).join("") + "</div>" : "") + "</div>" : "") +
      '<p class="result-info" aria-live="polite"></p><div class="coll-body"></div><div class="more-wrap"></div>';

    var body = $(".coll-body", host), info = $(".result-info", host), more = $(".more-wrap", host);

    function update(animate) {
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      var filtering = terms.length > 0 || cat !== "Semua";
      var list = items.filter(function (it) {
        if (cat !== "Semua" && val(cfg.catOf(it)) !== cat) return false;
        if (!terms.length) return true;
        var hay = cfg.textOf(it).toLowerCase();
        return terms.every(function (t) { return hay.indexOf(t) > -1; });
      });
      var shown = list;
      if (cfg.limit && !filtering && !expanded) shown = list.slice(0, cfg.limit);

      body.innerHTML = shown.length ? cfg.render(shown) : emptyState("Tidak ada hasil yang cocok. Coba kata kunci atau kategori lain.");
      info.textContent = filtering ? list.length + " dari " + items.length + " ditampilkan" : "";
      more.innerHTML = shown.length < list.length
        ? '<button type="button" class="btn btn-outline" data-more>Lihat semua (' + list.length + ") " + icon("arrow-right", "arr") + "</button>" : "";

      if (animate) $$("[data-r]", body).forEach(function (el) { el.removeAttribute("data-r"); el.classList.add("fade-in"); });
      else $$("[data-r]", body).forEach(function (el, i) { el.style.setProperty("--d", String(i % 6)); });
      guardImages(body);
      observeReveal(body);
    }

    var input = $("input", host);
    if (input) input.addEventListener("input", function () { q = input.value; update(true); });
    host.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (chip && host.contains(chip)) {
        cat = chip.dataset.cat;
        $$(".chip", host).forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
        update(true); return;
      }
      if (e.target.closest("[data-more]")) { expanded = true; update(true); return; }
      var op = e.target.closest("[data-open]");
      if (op && cfg.route) goDetail(cfg.route, op.dataset.open);
    });
    update(false);
  }

  function tlItem(o) {
    return '<li class="tl-item" data-r><span class="tl-dot"></span><div class="tl-card" data-spot>' +
      (o.meta ? '<div class="tl-meta">' + esc(o.meta) + "</div>" : "") +
      "<h3>" + esc(o.title) + "</h3>" + (o.sub ? '<p class="tl-sub">' + esc(o.sub) + "</p>" : "") +
      (o.badge ? '<span class="badge">' + esc(o.badge) + "</span>" : "") + paragraphs(o.desc) + "</div></li>";
  }

  function renderEducation(list) {
    collection($("#eduBody"), {
      items: list, empty: "Riwayat pendidikan belum diisi.", search: false,
      catOf: function () { return ""; },
      textOf: function (e) { return [e.institution, e.level, e.major, e.description].join(" "); },
      render: function (ls) { return '<ol class="timeline">' + ls.map(function (e) { return tlItem({ meta: period(e.start_year, e.end_year), title: e.institution, sub: e.major, badge: e.level, desc: e.description }); }).join("") + "</ol>"; }
    });
  }

  function renderExperience(list) {
    collection($("#expBody"), {
      items: list, empty: "Pengalaman belum diisi.", search: false,
      catOf: function (e) { return e.category; },
      textOf: function (e) { return [e.title, e.organization, e.category, e.description].join(" "); },
      render: function (ls) { return '<ol class="timeline">' + ls.map(function (e) { return tlItem({ meta: period(e.start_date, e.end_date), title: e.title, sub: e.organization, badge: e.category, desc: e.description }); }).join("") + "</ol>"; }
    });
  }

  function renderSkills(list) {
    collection($("#skillBody"), {
      items: list, empty: "Keahlian belum diisi.", search: false,
      catOf: function (s) { return s.category; },
      textOf: function (s) { return [s.name, s.category, s.level, s.description].join(" "); },
      render: function (ls) {
        var groups = {}, order = [];
        ls.forEach(function (s) { var c = val(s.category) || "Lainnya"; if (!groups[c]) { groups[c] = []; order.push(c); } groups[c].push(s); });
        return '<div class="skill-groups">' + order.map(function (c) {
          return '<div class="skill-group" data-spot data-r><div class="sg-head"><span class="sg-ico">' + icon(SKILL_ICON[c] || "sliders") + "</span><h3>" + esc(c) + '</h3></div><ul class="skill-list">' +
            groups[c].map(function (s) {
              var n = LEVEL_DOTS[s.level] || 0;
              var lvl = val(s.level) ? '<span class="level"><span class="dots" aria-hidden="true">' + [1, 2, 3].map(function (i) { return '<i class="' + (i <= n ? "on" : "") + '"></i>'; }).join("") + "</span>" + esc(s.level) + "</span>" : "";
              return '<li><div class="skill-top"><span class="skill-name">' + esc(s.name) + "</span>" + lvl + "</div>" + (val(s.description) ? "<small>" + esc(s.description) + "</small>" : "") + "</li>";
            }).join("") + "</ul></div>";
        }).join("") + "</div>";
      }
    });
  }

  function cardHtml(route, o) {
    return '<article class="card" data-spot data-r>' + thumbHtml(o.image, o.title, o.cat) +
      '<div class="card-body"><div class="card-row"><div><h3><button type="button" data-open="' + esc(o.id) + '">' + esc(o.title) + "</button></h3>" +
      '<div class="card-cat">' + (val(o.cat) ? "<span>" + esc(o.cat) + "</span>" : "") + (val(o.meta) ? "<span>" + esc(o.meta) + "</span>" : "") + "</div></div>" +
      '<span class="card-arrow" aria-hidden="true">' + icon("arrow-right") + "</span></div>" +
      (val(o.result) ? '<p class="result-line">' + esc(o.result) + "</p>" : "") +
      (val(o.desc) ? '<p class="clamp">' + esc(o.desc) + "</p>" : "") + "</div></article>";
  }
  function workCard(w) { return cardHtml("karya", { id: w.id, title: w.title, cat: w.category, meta: w.year, desc: w.description, image: w.image_url }); }
  function achCard(a) { return cardHtml("prestasi", { id: a.id, title: a.title, cat: a.type, meta: [a.issuer, a.year].filter(val).join(", "), result: a.result, desc: a.description, image: a.image_url }); }
  function projCard(p) { return cardHtml("proyek", { id: p.id, title: p.title, cat: p.type, meta: p.status, desc: p.description, image: p.image_url }); }
  var CARD_FN = { karya: workCard, prestasi: achCard, proyek: projCard };

  function renderWorks(list) {
    collection($("#workBody"), {
      items: list, route: "karya", empty: "Karya belum ditambahkan.", placeholder: "Cari karya", limit: 5,
      catOf: function (w) { return w.category; },
      textOf: function (w) { return [w.title, w.category, w.year, w.description, w.tags, w.tools].join(" "); },
      render: function (ls) { return '<div class="grid">' + ls.map(workCard).join("") + "</div>"; }
    });
  }
  function renderAchievements(list) {
    collection($("#achBody"), {
      items: list, route: "prestasi", empty: "Prestasi belum ditambahkan.", placeholder: "Cari prestasi", limit: 5,
      catOf: function (a) { return a.type; },
      textOf: function (a) { return [a.title, a.issuer, a.type, a.year, a.result, a.description].join(" "); },
      render: function (ls) { return '<div class="grid">' + ls.map(achCard).join("") + "</div>"; }
    });
  }
  function renderProjects(list) {
    collection($("#projBody"), {
      items: list, route: "proyek", empty: "Proyek belum ditambahkan.", placeholder: "Cari proyek", limit: 5,
      catOf: function (p) { return p.type; },
      textOf: function (p) { return [p.title, p.type, p.status, p.description, p.tags].join(" "); },
      render: function (ls) { return '<div class="grid">' + ls.map(projCard).join("") + "</div>"; }
    });
  }
  function renderGoals(list) {
    collection($("#goalBody"), {
      items: list, empty: "Target masa depan belum diisi.", search: false,
      catOf: function (g) { return g.category; },
      textOf: function (g) { return [g.title, g.category, g.target_period, g.status, g.description].join(" "); },
      render: function (ls) { return '<ol class="timeline">' + ls.map(function (g) { return tlItem({ meta: [g.target_period, g.status].filter(val).join(", "), title: g.title, badge: g.category, desc: g.description }); }).join("") + "</ol>"; }
    });
  }

  /* ---------------------------------------------------------------
     5. KONTAK + FORMULIR (dibuka lewat aplikasi email / WhatsApp pengunjung)
     --------------------------------------------------------------- */
  var mailTo = "", waBase = "";
  function renderContacts(list) {
    var host = $("#contactBody"), form = $("#contactForm");
    if (!list.length) { host.innerHTML = emptyState("Kontak belum ditambahkan."); form.hidden = true; return; }
    host.innerHTML = '<div class="contact-links">' + list.map(function (c) {
      var plat = PLATFORMS[c.platform] || PLATFORMS.lainnya, info = contactInfo(c);
      if (!info.href) return "";
      return '<a class="contact-chip" href="' + esc(info.href) + '" target="_blank" rel="noopener noreferrer">' + icon(plat[1]) + "<span>" + esc(val(c.label) || plat[0]) + "</span><small>" + esc(info.shown) + "</small></a>";
    }).join("") + "</div>";

    mailTo = ""; waBase = "";
    list.forEach(function (c) {
      var info = contactInfo(c);
      if (!mailTo && info.href.indexOf("mailto:") === 0) mailTo = info.shown;
      if (!waBase && c.platform === "whatsapp" && info.href) waBase = info.href;
    });
    form.hidden = !(mailTo || waBase);
    $("#cfMail").hidden = !mailTo;
    $("#cfWa").hidden = !waBase;
  }

  function setupContactForm() {
    var form = $("#contactForm"), err = $("#cfErr");
    function compose() {
      var name = val(form.name.value), email = val(form.email.value), msg = val(form.msg.value);
      err.hidden = true;
      if (!name || !msg) { err.textContent = "Isi nama dan pesan terlebih dulu."; err.hidden = false; return null; }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = "Format email belum benar."; err.hidden = false; return null; }
      return "Halo, saya " + name + (email ? " (" + email + ")" : "") + ".\n\n" + msg;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = compose(); if (!text || !mailTo) return;
      window.location.href = "mailto:" + mailTo + "?subject=" + encodeURIComponent("Pesan dari website portofolio") + "&body=" + encodeURIComponent(text);
    });
    $("#cfWa").addEventListener("click", function () {
      var text = compose(); if (!text || !waBase) return;
      window.open(waBase + (waBase.indexOf("?") > -1 ? "&" : "?") + "text=" + encodeURIComponent(text), "_blank", "noopener");
    });
  }

  /* ---------------------------------------------------------------
     6. HALAMAN DETAIL (rute berbasis hash, tombol Kembali Android berfungsi)
     --------------------------------------------------------------- */
  var page, savedY = 0, fromSite = false, siteTitle = "";
  var inertEls = [];

  function setInert(on) {
    inertEls.forEach(function (el) { if (el) { if (on) el.setAttribute("inert", ""); else el.removeAttribute("inert"); } });
  }

  function goDetail(route, id) {
    fromSite = true;
    window.location.hash = "#/" + route + "/" + encodeURIComponent(id);
  }

  function mainMedia(box, url, alt, cat) {
    var u = safeUrl(url);
    if (u) {
      box.style.setProperty("--img", "url('" + cssUrl(u) + "')");
      box.innerHTML = '<img src="' + esc(u) + '" alt="' + esc(alt) + '" decoding="async">';
      guardImages(box);
    } else {
      box.style.removeProperty("--img");
      box.innerHTML = '<div class="ph" aria-hidden="true">' + esc(initialOf(cat || alt)) + "</div>";
    }
  }

  function renderDetail(route, it) {
    var def = ROUTES[route], body = $("#detailBody");
    var imgs = [];
    [it.image_url].concat(splitLines(it.gallery_urls)).forEach(function (u) { var s = safeUrl(u); if (s && imgs.indexOf(s) < 0) imgs.push(s); });

    var cat = "", meta = [], res = "";
    if (route === "karya") { cat = it.category; meta = [it.year]; }
    if (route === "prestasi") { cat = it.type; meta = [it.issuer, it.year]; res = val(it.result); }
    if (route === "proyek") { cat = it.type; meta = [it.status]; }

    var tools = splitList(it.tools), tags = splitList(it.tags);
    var lu = safeUrl(it.link_url), fu = safeUrl(it.file_url);

    body.innerHTML =
      '<div class="d-media"><div class="d-main" id="dMain"></div>' +
      (imgs.length > 1 ? '<div class="d-thumbs" id="dThumbs">' + imgs.map(function (u, i) {
        return '<button type="button" class="d-thumb" data-i="' + i + '" aria-label="Tampilkan gambar ' + (i + 1) + '" aria-current="' + (i === 0) + '"><img src="' + esc(u) + '" alt="" loading="lazy"></button>';
      }).join("") + "</div>" : "") + "</div>" +
      '<div class="d-info">' + (val(cat) ? '<span class="badge">' + esc(cat) + "</span>" : "") +
      '<h1 id="dTitle">' + esc(it.title) + "</h1>" +
      (meta.filter(val).length ? '<div class="card-cat d-meta">' + meta.filter(val).map(function (m) { return "<span>" + esc(m) + "</span>"; }).join("") + "</div>" : "") +
      (res ? '<p class="d-result">' + esc(res) + "</p>" : "") +
      '<div class="d-desc">' + (paragraphs(it.description) || '<p>Belum ada deskripsi.</p>') + "</div>" +
      (tools.length ? '<p class="d-sub">Alat yang dipakai</p><div class="d-chips">' + tools.map(function (t) { return '<span class="tool">' + esc(t) + "</span>"; }).join("") + "</div>" : "") +
      (tags.length ? '<p class="d-sub">Tag</p><div class="d-chips">' + tags.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + "</div>" : "") +
      '<div class="d-actions">' +
      (lu ? '<a class="btn btn-primary" href="' + esc(lu) + '" target="_blank" rel="noopener noreferrer">Buka tautan ' + icon("arrow-ur", "arr") + "</a>" : "") +
      (fu ? '<a class="btn btn-outline" href="' + esc(fu) + '" target="_blank" rel="noopener noreferrer">Lihat dokumen ' + icon("download") + "</a>" : "") +
      '<button type="button" class="btn btn-outline" data-back>Lihat ' + esc(def.label) + " lain</button></div></div>";

    mainMedia($("#dMain"), imgs[0], it.title, cat);
    var th = $("#dThumbs");
    if (th) th.addEventListener("click", function (e) {
      var b = e.target.closest(".d-thumb"); if (!b) return;
      mainMedia($("#dMain"), imgs[Number(b.dataset.i)], it.title, cat);
      $$(".d-thumb", th).forEach(function (x) { x.setAttribute("aria-current", String(x === b)); });
    });

    // Item lain dari jenis yang sama
    var others = (DATA[def.key] || []).filter(function (x) { return String(x.id) !== String(it.id); }).slice(0, 3);
    var more = $("#detailMore");
    more.hidden = !others.length;
    $("#detailMoreGrid").innerHTML = others.map(function (o) { return CARD_FN[route](o).replace(' data-r', ""); }).join("");
    guardImages(more);
    $("#backLabel").textContent = "Kembali ke " + def.label;
  }

  function openDetail(route, it) {
    var wasOpen = !page.hidden;
    if (!wasOpen) { savedY = window.scrollY; siteTitle = document.title; }
    renderDetail(route, it);
    document.title = it.title + " | " + (val(DATA.profile && DATA.profile.full_name) || "Portofolio");
    page.hidden = false; page.scrollTop = 0;
    root.classList.add("lock"); setInert(true);
    if (!wasOpen) $("#detailBack").focus({ preventScroll: true });
  }

  function closeDetail() {
    if (page.hidden) return;
    page.hidden = true;
    root.classList.remove("lock"); setInert(false);
    if (siteTitle) document.title = siteTitle;
    window.scrollTo({ top: savedY, behavior: "instant" });
  }

  function route() {
    var m = /^#\/(karya|prestasi|proyek)\/(.+)$/.exec(window.location.hash);
    if (!m) { closeDetail(); return; }
    var def = ROUTES[m[1]], id = decodeURIComponent(m[2]);
    var item = (DATA[def.key] || []).filter(function (x) { return String(x.id) === id; })[0];
    if (!item) { closeDetail(); window.location.replace("#" + def.sec); return; }
    openDetail(m[1], item);
  }

  function setupDetail() {
    page = $("#detailPage");
    inertEls = [$("#main"), $(".site-header"), $(".site-footer"), $("#demoBar")];
    function back() {
      var m = /^#\/(karya|prestasi|proyek)\//.exec(window.location.hash);
      if (fromSite) window.history.back();
      else window.location.hash = "#" + (m ? ROUTES[m[1]].sec : "karya");
    }
    $("#detailBack").addEventListener("click", back);
    page.addEventListener("click", function (e) {
      if (e.target.closest("[data-back]")) back();
      var op = e.target.closest("[data-open]");
      if (op) {
        var route = /^#\/(karya|prestasi|proyek)\//.exec(window.location.hash);
        if (route) goDetail(route[1], op.dataset.open);
      }
    });
    window.addEventListener("hashchange", route);
  }

  /* ---------------------------------------------------------------
     7. PENCARIAN GLOBAL
     --------------------------------------------------------------- */
  function buildIndex(d) {
    INDEX = [];
    function add(kind, sec, label, it, title, sub, extra) {
      INDEX.push({ kind: kind, sec: sec, label: label, it: it, title: title, sub: sub, hay: [title, sub, extra].join(" ").toLowerCase() });
    }
    (d.works || []).forEach(function (w) { add("karya", "karya", "Karya", w, w.title, [w.category, w.year].filter(val).join(", "), [w.description, w.tags, w.tools].join(" ")); });
    (d.achievements || []).forEach(function (a) { add("prestasi", "prestasi", "Prestasi", a, a.title, [a.type, a.issuer, a.year].filter(val).join(", "), [a.result, a.description].join(" ")); });
    (d.projects || []).forEach(function (p) { add("proyek", "proyek", "Proyek", p, p.title, [p.type, p.status].filter(val).join(", "), [p.description, p.tags].join(" ")); });
    (d.skills || []).forEach(function (s) { add("", "keahlian", "Keahlian", s, s.name, [s.category, s.level].filter(val).join(", "), s.description); });
    (d.experiences || []).forEach(function (e) { add("", "pengalaman", "Pengalaman", e, e.title, [e.organization, e.category].filter(val).join(", "), e.description); });
    (d.education || []).forEach(function (e) { add("", "pendidikan", "Pendidikan", e, e.institution, [e.level, e.major].filter(val).join(", "), e.description); });
    (d.goals || []).forEach(function (g) { add("", "target", "Target", g, g.title, [g.category, g.target_period].filter(val).join(", "), g.description); });
  }

  function runSearch(q) {
    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    var list = $("#searchResults"), hint = $("#searchHint");
    if (q.trim().length < 2) { lastResults = []; list.innerHTML = ""; hint.textContent = "Ketik minimal 2 huruf."; return; }
    lastResults = INDEX.filter(function (x) { return terms.every(function (t) { return x.hay.indexOf(t) > -1; }); }).slice(0, 30);
    hint.textContent = lastResults.length ? lastResults.length + " hasil ditemukan" : "Tidak ada hasil. Coba kata kunci lain.";
    list.innerHTML = lastResults.map(function (r, i) {
      return '<li><button type="button" data-i="' + i + '"><span class="r-kind">' + esc(r.label) + '</span><span class="r-title">' + esc(r.title) + "</span>" + (r.sub ? '<span class="r-sub">' + esc(r.sub) + "</span>" : "") + "</button></li>";
    }).join("");
  }

  function setupSearch() {
    var dlg = $("#searchDlg");
    function open() { dlg.showModal(); $("#searchInput").focus(); }
    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.closest("[data-close]")) dlg.close(); });
    $("#searchBtn").addEventListener("click", open);
    $("#searchInput").addEventListener("input", function (e) { runSearch(e.target.value); });
    $("#searchResults").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-i]"); if (!b) return;
      var r = lastResults[Number(b.dataset.i)]; if (!r) return;
      dlg.close();
      if (r.kind) goDetail(r.kind, r.it.id);
      else { var el = document.getElementById(r.sec); if (el) el.scrollIntoView({ behavior: RM ? "auto" : "smooth" }); }
    });
    document.addEventListener("keydown", function (e) {
      var tag = (e.target && e.target.tagName) || "";
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(tag) && !dlg.open && page.hidden && !menuOpen) { e.preventDefault(); open(); }
    });
  }

  /* ---------------------------------------------------------------
     8. NAVIGASI, MENU, ANIMASI
     --------------------------------------------------------------- */
  var menuOpen = false;
  // 4 tautan utama di navbar; bagian lain ikut menyalakan induknya
  var PRIMARY = { beranda: "beranda", karya: "karya", prestasi: "karya", proyek: "karya", tentang: "tentang", pendidikan: "tentang", pengalaman: "tentang", keahlian: "tentang", target: "tentang", kontak: "kontak" };
  var currentSec = "beranda";

  function positionIndicator() {
    var ind = $("#navInd"), a = $(".nav-pill a.active");
    if (!a || !a.offsetWidth) { ind.classList.remove("on"); return; }
    ind.style.width = a.offsetWidth + "px";
    ind.style.transform = "translateX(" + a.offsetLeft + "px)";
    ind.classList.add("on");
  }
  function setActive(sec) {
    currentSec = sec;
    var prim = PRIMARY[sec] || sec;
    $$(".nav-pill a").forEach(function (a) { a.classList.toggle("active", a.dataset.sec === prim); });
    $$(".menu-list a").forEach(function (a) { a.classList.toggle("active", a.dataset.sec === sec); });
    positionIndicator();
  }

  function setupMenu() {
    var ov = $("#menuOverlay"), btn = $("#menuBtn"), x = $("#menuClose");
    ov.hidden = false;
    function toggle(open) {
      menuOpen = open;
      ov.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
      [$("#main"), $(".site-header"), $(".site-footer")].forEach(function (el) { if (open) el.setAttribute("inert", ""); else el.removeAttribute("inert"); });
      root.classList.toggle("lock", open);
      if (open) x.focus(); else btn.focus({ preventScroll: true });
    }
    btn.addEventListener("click", function () { toggle(true); });
    x.addEventListener("click", function () { toggle(false); });
    ov.addEventListener("click", function (e) { if (e.target.closest("a")) toggle(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (menuOpen) toggle(false);
      else if (!page.hidden && !$("#searchDlg").open) $("#detailBack").click();
    });
  }

  var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; io.unobserve(el);
      if (el.classList.contains("num")) { countUp(el); return; }
      el.classList.add("in");
      // setelah selesai muncul, lepas penanda agar transisi hover kartu normal kembali
      setTimeout(function () { el.removeAttribute("data-r"); el.classList.remove("in"); el.style.removeProperty("--d"); }, 1400);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }) : null;

  function observeReveal(scope) {
    $$("[data-r]:not(.in)", scope || document).forEach(function (el) {
      if (!io || RM) { el.removeAttribute("data-r"); return; }
      io.observe(el);
    });
    $$(".num", scope || document).forEach(function (el) {
      if (el.dataset.seen) return; el.dataset.seen = "1";
      if (!io || RM) el.textContent = el.dataset.to; else io.observe(el);
    });
  }

  function countUp(el) {
    var to = Number(el.dataset.to) || 0, t0 = performance.now(), dur = 1000;
    (function step(t) {
      var p = Math.min(1, (t - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  function setupScroll() {
    var header = $(".site-header"), prog = $("#progress"), ticking = false;
    function frame() {
      ticking = false;
      var y = window.scrollY, max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      header.classList.toggle("scrolled", y > 24);
      prog.style.transform = "scaleX(" + Math.min(1, y / max) + ")";
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();

    if (io) {
      var spy = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
      }, { rootMargin: "-45% 0px -50% 0px" });
      $$("main section[id]").forEach(function (s) { spy.observe(s); });
    }
    window.addEventListener("resize", positionIndicator);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(positionIndicator);

    $(".brand").addEventListener("click", function () { /* tautan #beranda */ });
    $("#themeBtn").addEventListener("click", window.toggleTheme);
  }

  /* Kolase hero: foto profil + dua karya (hanya yang punya gambar). Tanpa data, tampil bingkai grafis polos. */
  function renderCollage(d) {
    var works = (d.works || []).filter(function (w) { return safeUrl(w.image_url); }).slice(0, 2);
    [{ el: $("#heroFrameA"), ph: "ph-hatch" }, { el: $("#heroFrameB"), ph: "ph-accent" }].forEach(function (s, i) {
      var el = s.el, w = works[i];
      el.classList.remove("has-img", "ph-hatch", "ph-accent");
      el.style.removeProperty("--img");
      if (w) {
        var u = safeUrl(w.image_url);
        el.classList.add("has-img");
        el.style.setProperty("--img", "url('" + cssUrl(u) + "')");
        el.removeAttribute("aria-hidden");
        el.innerHTML = '<button type="button" class="frame-btn" data-hero-work="' + esc(w.id) + '" aria-label="Buka karya ' + esc(w.title) + '">' +
          '<img src="' + esc(u) + '" alt="" decoding="async"><span class="cap">' + esc(w.title) + "</span></button>";
      } else {
        el.classList.add(s.ph);
        el.setAttribute("aria-hidden", "true");
        el.innerHTML = i === 1 ? icon("arrow-ur") : "";
      }
    });
    guardImages($("#heroVisual"));
  }

  /* ---------------------------------------------------------------
     9. MULAI
     --------------------------------------------------------------- */
  async function init() {
    setupDetail(); setupSearch(); setupMenu(); setupScroll(); setupContactForm();
    $("#heroVisual").addEventListener("click", function (e) {
      var b = e.target.closest("[data-hero-work]"); if (b) goDetail("karya", b.dataset.heroWork);
    });
    observeReveal(document);

    var res = await loadData();
    DATA = res.data; DEMO = res.demo;
    $("#demoBar").hidden = !DEMO;

    renderHero(DATA.profile || {}, DATA.contact_links || []);
    renderCollage(DATA);
    renderAbout(DATA.profile || {}, DATA);
    renderEducation(DATA.education || []);
    renderExperience(DATA.experiences || []);
    renderSkills(DATA.skills || []);
    renderWorks(DATA.works || []);
    renderAchievements(DATA.achievements || []);
    renderProjects(DATA.projects || []);
    renderGoals(DATA.goals || []);
    renderContacts(DATA.contact_links || []);

    buildIndex(DATA);
    guardImages(document);
    observeReveal(document);
    setActive("beranda");

    requestAnimationFrame(function () { root.classList.add("loaded"); setTimeout(positionIndicator, 60); });
    route(); // jika alamat langsung berisi #/karya/ID
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
