/* Interactive UI: before/after slider, filterable grids, lightbox gallery,
   testimonial carousel, blog search + pagination and the countdown clock. */
(function () {
  "use strict";

  /* ---------- Before / after comparison slider ---------- */
  document.querySelectorAll("[data-ba]").forEach(function (el) {
    var handle = el.querySelector(".ba-handle");
    var dragging = false;

    function setPos(clientX) {
      var rect = el.getBoundingClientRect();
      var pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      el.style.setProperty("--pos", pct + "%");
      if (handle) handle.setAttribute("aria-valuenow", String(Math.round(pct)));
    }

    el.style.setProperty("--pos", "50%");
    el.addEventListener("pointerdown", function (e) {
      dragging = true;
      el.setPointerCapture(e.pointerId);
      setPos(e.clientX);
    });
    el.addEventListener("pointermove", function (e) { if (dragging) setPos(e.clientX); });
    el.addEventListener("pointerup", function () { dragging = false; });
    el.addEventListener("pointercancel", function () { dragging = false; });

    if (handle) {
      handle.addEventListener("keydown", function (e) {
        var cur = parseFloat(el.style.getPropertyValue("--pos")) || 50;
        if (e.key === "ArrowLeft") { el.style.setProperty("--pos", Math.max(0, cur - 4) + "%"); e.preventDefault(); }
        if (e.key === "ArrowRight") { el.style.setProperty("--pos", Math.min(100, cur + 4) + "%"); e.preventDefault(); }
      });
    }
  });

  /* ---------- Filter + search grids (services, projects, blog) ---------- */
  document.querySelectorAll("[data-filter-root]").forEach(function (root) {
    var chips = root.querySelectorAll("[data-filter]");
    var search = root.querySelector("[data-filter-search]");
    var items = Array.prototype.slice.call(root.querySelectorAll("[data-item]"));
    var empty = root.querySelector("[data-filter-empty]");
    var count = root.querySelector("[data-filter-count]");
    var pager = root.querySelector("[data-pager]");
    var perPage = pager ? parseInt(pager.getAttribute("data-per-page"), 10) || 6 : 0;
    var active = "All";
    var page = 1;

    function matches(item) {
      var cat = (item.getAttribute("data-category") || "").trim().toLowerCase();
      var text = (item.getAttribute("data-search") || item.textContent || "").toLowerCase();
      var q = search ? search.value.trim().toLowerCase() : "";
      var wanted = active.trim().toLowerCase();
      return (wanted === "all" || cat === wanted) && (!q || text.indexOf(q) !== -1);
    }

    function render() {
      var visible = items.filter(matches);
      items.forEach(function (i) {
        i.hidden = true;
        i.removeAttribute("data-visible");
      });

      var pageItems = visible;
      if (perPage) {
        var pages = Math.max(1, Math.ceil(visible.length / perPage));
        if (page > pages) page = pages;
        pageItems = visible.slice((page - 1) * perPage, page * perPage);
        renderPager(pages);
      }
      pageItems.forEach(function (i) {
        i.hidden = false;
        i.setAttribute("data-visible", "true");
      });

      if (empty) empty.hidden = visible.length !== 0;
      if (count) count.textContent = String(visible.length);
    }

    function renderPager(pages) {
      pager.innerHTML = "";
      if (pages < 2) return;
      for (var p = 1; p <= pages; p++) {
        (function (n) {
          var li = document.createElement("li");
          li.className = "page-item" + (n === page ? " active" : "");
          var a = document.createElement("button");
          a.type = "button";
          a.className = "page-link";
          a.textContent = String(n);
          a.addEventListener("click", function () {
            page = n;
            render();
            root.scrollIntoView({ behavior: "smooth", block: "start" });
          });
          li.appendChild(a);
          pager.appendChild(li);
        })(p);
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("is-active"); c.setAttribute("aria-pressed", "false"); });
        chip.classList.add("is-active");
        chip.setAttribute("aria-pressed", "true");
        active = chip.getAttribute("data-filter");
        page = 1;
        render();
      });
    });

    if (search) {
      search.addEventListener("input", function () { page = 1; render(); });
      var form = search.closest("form");
      if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });
    }

    render();
  });

  /* ---------- Lightbox ---------- */
  var lightbox = document.querySelector("[data-lightbox]");
  if (lightbox) {
    var lbImg = lightbox.querySelector("[data-lightbox-image]");
    var lbCaption = lightbox.querySelector("[data-lightbox-caption]");
    var lbCounter = lightbox.querySelector("[data-lightbox-counter]");
    var triggers = [];
    var index = 0;

    function refreshTriggers() {
      triggers = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox-src]"))
        .filter(function (t) { var item = t.closest("[data-item]"); return !item || !item.hidden; });
    }

    function show(i) {
      if (!triggers.length) return;
      index = (i + triggers.length) % triggers.length;
      var t = triggers[index];
      lbImg.setAttribute("src", t.getAttribute("data-lightbox-src"));
      lbImg.setAttribute("alt", t.getAttribute("data-lightbox-alt") || "");
      if (lbCaption) lbCaption.textContent = t.getAttribute("data-lightbox-caption") || "";
      if (lbCounter) lbCounter.textContent = (index + 1) + " / " + triggers.length;
    }

    function open(target) {
      refreshTriggers();
      show(triggers.indexOf(target));
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
      var close = lightbox.querySelector("[data-lightbox-close]");
      if (close) close.focus();
    }

    function close() {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-lightbox-src]");
      if (trigger) { e.preventDefault(); open(trigger); return; }
      if (e.target.closest("[data-lightbox-close]")) { close(); return; }
      if (e.target.closest("[data-lightbox-prev]")) { show(index - 1); return; }
      if (e.target.closest("[data-lightbox-next]")) { show(index + 1); return; }
      if (e.target === lightbox) close();
    });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
  }

  /* ---------- Testimonial carousel ---------- */
  document.querySelectorAll("[data-quotes]").forEach(function (root) {
    var slides = root.querySelectorAll("[data-quote]");
    var dots = root.querySelectorAll("[data-quote-dot]");
    var i = 0;
    var timer;

    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, idx) { s.hidden = idx !== i; });
      dots.forEach(function (d, idx) { d.classList.toggle("is-active", idx === i); });
    }
    function play() { timer = setInterval(function () { go(i + 1); }, 6000); }
    function stop() { clearInterval(timer); }

    root.querySelectorAll("[data-quote-prev]").forEach(function (b) { b.addEventListener("click", function () { stop(); go(i - 1); play(); }); });
    root.querySelectorAll("[data-quote-next]").forEach(function (b) { b.addEventListener("click", function () { stop(); go(i + 1); play(); }); });
    dots.forEach(function (d, idx) { d.addEventListener("click", function () { stop(); go(idx); play(); }); });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", play);

    go(0);
    play();
  });

  /* ---------- Countdown (coming soon) ---------- */
  var countdown = document.querySelector("[data-countdown]");
  if (countdown) {
    var target = new Date(countdown.getAttribute("data-countdown")).getTime();
    var fields = {
      days: countdown.querySelector("[data-cd-days]"),
      hours: countdown.querySelector("[data-cd-hours]"),
      minutes: countdown.querySelector("[data-cd-minutes]"),
      seconds: countdown.querySelector("[data-cd-seconds]")
    };
    (function tick() {
      var diff = Math.max(0, target - Date.now());
      var s = Math.floor(diff / 1000);
      var pad = function (n) { return String(n).padStart(2, "0"); };
      if (fields.days) fields.days.textContent = pad(Math.floor(s / 86400));
      if (fields.hours) fields.hours.textContent = pad(Math.floor((s % 86400) / 3600));
      if (fields.minutes) fields.minutes.textContent = pad(Math.floor((s % 3600) / 60));
      if (fields.seconds) fields.seconds.textContent = pad(s % 60);
      setTimeout(tick, 1000);
    })();
  }
  /* ---------- Mobile nav ---------- */
  var mobileNav = document.getElementById("mobileNav");
  if (mobileNav) {
    var burger = document.querySelector(".nav-burger");
    var setState = function (open) {
      if (burger) {
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      }
    };
    mobileNav.addEventListener("shown.bs.offcanvas", function () { setState(true); });
    mobileNav.addEventListener("hidden.bs.offcanvas", function () { setState(false); });
    /* Close the panel after tapping a real link */
    mobileNav.addEventListener("click", function (e) {
      var link = e.target.closest("a[href]");
      if (!link || link.hasAttribute("data-bs-toggle")) return;
      var inst = window.bootstrap && window.bootstrap.Offcanvas.getInstance(mobileNav);
      if (inst) inst.hide();
    });
  }
})();
