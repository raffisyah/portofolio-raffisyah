/* =====================================================================
   common.js — fungsi bantu yang dipakai halaman publik dan admin
   (tema terang/gelap, pengaman teks, koneksi Supabase)
   File ini dimuat di <head> supaya tema langsung benar tanpa berkedip.
   ===================================================================== */
(function () {
  "use strict";

  var cfg = window.PORTFOLIO_CONFIG || {};
  var root = document.documentElement;

  /* ---------- Penanda JavaScript aktif (untuk animasi) ---------- */
  root.classList.add("js");

  /* Pengaman: jika skrip utama gagal, animasi masuk tetap dilepas agar konten tidak tersembunyi */
  setTimeout(function () { root.classList.add("loaded"); }, 4000);

  /* ---------- Tema terang / gelap ---------- */
  function readTheme() {
    try { return localStorage.getItem("theme"); } catch (e) { return null; }
  }
  // Tema bawaan = gelap (desain utama). Pilihan pengunjung disimpan di perangkatnya.
  var initial = readTheme() === "light" ? "light" : "dark";
  root.setAttribute("data-theme", initial);

  function syncThemeColor(theme) {
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", theme === "dark" ? "#060912" : "#f5f6fc");
  }
  document.addEventListener("DOMContentLoaded", function () { syncThemeColor(root.getAttribute("data-theme")); });

  window.toggleTheme = function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) { /* abaikan */ }
    syncThemeColor(next);
    return next;
  };

  /* ---------- Pengaman teks (mencegah XSS) ---------- */
  var ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  window.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ESC[c]; });
  };

  /* Hanya izinkan tautan http, https, mailto, tel */
  window.safeUrl = function (u) {
    if (!u) return "";
    try {
      var x = new URL(String(u).trim(), window.location.href);
      return ["http:", "https:", "mailto:", "tel:"].indexOf(x.protocol) > -1 ? x.href : "";
    } catch (e) { return ""; }
  };

  /* Aman dipakai di dalam url('...') pada atribut style */
  window.cssUrl = function (u) {
    return String(u || "").replace(/'/g, "%27").replace(/"/g, "%22").replace(/\)/g, "%29").replace(/\(/g, "%28").replace(/\\/g, "%5C");
  };

  /* Teks berbaris-baris → paragraf <p> */
  window.paragraphs = function (t) {
    return String(t == null ? "" : t)
      .split(/\n+/)
      .map(function (s) { return s.trim(); })
      .filter(Boolean)
      .map(function (s) { return "<p>" + window.esc(s) + "</p>"; })
      .join("");
  };

  /* "a, b; c" atau baris baru → ["a","b","c"] */
  window.splitList = function (t) {
    return String(t == null ? "" : t)
      .split(/[\n,;]+/)
      .map(function (s) { return s.trim(); })
      .filter(Boolean);
  };

  window.initials = function (name) {
    var parts = String(name || "").replace(/[\[\]()]/g, " ").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "•";
    var a = parts[0].charAt(0);
    var b = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
    return (a + b).toUpperCase();
  };

  /* ---------- Koneksi Supabase ---------- */
  window.isConfigured = function () {
    var u = String(cfg.SUPABASE_URL || ""), k = String(cfg.SUPABASE_ANON_KEY || "");
    return /^https:\/\//i.test(u) && k.length > 20 && !/GANTI/i.test(u + k);
  };

  var client = null;
  window.getClient = function () {
    if (client) return client;
    if (!window.isConfigured() || !window.supabase || !window.supabase.createClient) return null;
    client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
    });
    return client;
  };
})();
