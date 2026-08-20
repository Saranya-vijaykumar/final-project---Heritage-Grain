/* Theme (dark/light), text direction (LTR/RTL), sticky header, reveal-on-scroll,
   counters, back-to-top and toasts. Preferences persist in localStorage. */
(function () {
  "use strict";

  var THEME_KEY = "hg.theme";
  var DIR_KEY = "hg.dir";
  var root = document.documentElement;

  /* ---------- Theme ---------- */
  function applyTheme(theme) {
    root.setAttribute("data-bs-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      var icon = btn.querySelector("[data-theme-icon]");
      if (icon) icon.textContent = theme === "dark" ? "☀" : "☾";
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    });
  }

  /* ---------- Direction (RTL support) ---------- */
  function applyDir(dir) {
    root.setAttribute("dir", dir);
    try { localStorage.setItem(DIR_KEY, dir); } catch (e) {}
    var link = document.getElementById("bootstrap-css");
    if (link) {
      var base = link.getAttribute("data-base");
      link.setAttribute("href", dir === "rtl" ? base + "bootstrap.rtl.min.css" : base + "bootstrap.min.css");
    }
    document.querySelectorAll("[data-dir-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", dir === "rtl" ? "true" : "false");
      var label = btn.querySelector("[data-dir-label]");
      if (label) label.textContent = dir === "rtl" ? "LTR" : "RTL";
      btn.setAttribute("aria-label", dir === "rtl" ? "Switch to left-to-right layout" : "Switch to right-to-left layout");
    });
  }

  var storedTheme = "light", storedDir = "ltr";
  try {
    storedTheme = localStorage.getItem(THEME_KEY) ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    storedDir = localStorage.getItem(DIR_KEY) || "ltr";
  } catch (e) {}

  applyTheme(storedTheme);
  applyDir(storedDir);

  document.addEventListener("click", function (e) {
    var themeBtn = e.target.closest("[data-theme-toggle]");
    if (themeBtn) {
      applyTheme(root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark");
      return;
    }
    var dirBtn = e.target.closest("[data-dir-toggle]");
    if (dirBtn) {
      applyDir(root.getAttribute("dir") === "rtl" ? "ltr" : "rtl");
    }
  });

  /* ---------- Sticky header shadow + back to top ---------- */
  var header = document.querySelector(".site-header");
  var toTop = document.querySelector(".back-to-top");

  function onScroll() {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle("is-stuck", y > 8);
    if (toTop) toTop.classList.toggle("is-visible", y > 500);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-visible", "true");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.setAttribute("data-visible", "true"); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll("[data-count-to]");
  if ("IntersectionObserver" in window && counters.length) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        co.unobserve(el);
        var target = parseFloat(el.getAttribute("data-count-to")) || 0;
        var suffix = el.getAttribute("data-count-suffix") || "";
        var start = performance.now();
        var dur = 1600;
        (function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---------- Current year in footer ---------- */
  document.querySelectorAll("[data-current-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Toasts (shared helper: window.hgToast) ---------- */
  var stack = document.querySelector(".toast-stack");
  window.hgToast = function (message, kind) {
    if (!stack) return;
    var el = document.createElement("div");
    el.className = "toast-craft" + (kind ? " is-" + kind : "");
    el.setAttribute("role", "status");
    el.textContent = message;
    stack.appendChild(el);
    setTimeout(function () {
      el.style.opacity = "0";
      setTimeout(function () { el.remove(); }, 300);
    }, 4200);
  };

  /* ---------- Mark the active nav item ---------- */
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav-match]").forEach(function (link) {
    var matches = link.getAttribute("data-nav-match").split(" ");
    if (matches.indexOf(path) !== -1) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
})();
