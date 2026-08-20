/* Forms: booking validation with image preview, pickup ZIP availability checker,
   estimate calculator and newsletter signup. Submissions are simulated and stored
   in localStorage so the template works with no backend. */
(function () {
  "use strict";

  var STORE_KEY = "hg.bookings";

  function save(key, value) {
    try {
      var list = JSON.parse(localStorage.getItem(key) || "[]");
      list.push(value);
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {}
  }

  function setError(field, message) {
    var group = field.closest("[data-field]");
    if (!group) return;
    var msg = group.querySelector("[data-error]");
    field.classList.toggle("is-invalid", Boolean(message));
    if (msg) { msg.textContent = message || ""; msg.hidden = !message; }
  }

  function validate(form) {
    var ok = true;
    form.querySelectorAll("[data-field] input, [data-field] select, [data-field] textarea").forEach(function (field) {
      var value = (field.value || "").trim();
      var error = "";

      if (field.hasAttribute("required") && field.type !== "checkbox" && !value) {
        error = "This field is required.";
      } else if (field.type === "checkbox" && field.hasAttribute("required") && !field.checked) {
        error = "Please confirm to continue.";
      } else if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        error = "Enter a valid email address.";
      } else if (field.type === "tel" && value && !/^[+\d][\d\s().-]{6,}$/.test(value)) {
        error = "Enter a valid phone number.";
      } else if (field.type === "date" && value) {
        var picked = new Date(value + "T00:00:00");
        var today = new Date(); today.setHours(0, 0, 0, 0);
        if (picked < today) error = "Choose a date in the future.";
      }

      setError(field, error);
      if (error) ok = false;
    });
    return ok;
  }

  /* ---------- Booking / contact form ---------- */
  document.querySelectorAll("[data-booking-form]").forEach(function (form) {
    var success = form.parentElement.querySelector("[data-form-success]");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(form)) {
        window.hgToast && window.hgToast("Please fix the highlighted fields.", "bad");
        var firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      var data = {};
      new FormData(form).forEach(function (v, k) { if (typeof v === "string") data[k] = v; });
      data.submittedAt = new Date().toISOString();
      save(STORE_KEY, data);

      form.reset();
      form.querySelectorAll(".is-invalid").forEach(function (f) { setError(f, ""); });
      var preview = form.querySelector("[data-upload-preview]");
      if (preview) preview.innerHTML = "";
      if (success) { success.hidden = false; success.scrollIntoView({ behavior: "smooth", block: "center" }); }
      window.hgToast && window.hgToast("Booking request sent — we'll reply within one working day.", "ok");
    });

    form.addEventListener("input", function (e) {
      if (e.target.classList.contains("is-invalid")) setError(e.target, "");
    });
  });

  /* ---------- Image upload preview ---------- */
  document.querySelectorAll("[data-upload]").forEach(function (input) {
    var preview = document.querySelector(input.getAttribute("data-upload"));
    input.addEventListener("change", function () {
      if (!preview) return;
      preview.innerHTML = "";
      Array.prototype.slice.call(input.files || []).slice(0, 4).forEach(function (file) {
        if (!/^image\//.test(file.type)) return;
        var img = document.createElement("img");
        img.className = "ratio-media";
        img.style.width = "78px";
        img.style.height = "78px";
        img.style.objectFit = "cover";
        img.alt = "Preview of " + file.name;
        img.src = URL.createObjectURL(file);
        preview.appendChild(img);
      });
    });
  });

  /* ---------- Pickup availability checker ---------- */
  var pickupForm = document.querySelector("[data-pickup-form]");
  if (pickupForm && window.HG_PICKUP_ZONES) {
    var result = document.querySelector("[data-pickup-result]");
    pickupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var zip = (pickupForm.querySelector("[name=zip]").value || "").trim();
      if (!/^\d{5}$/.test(zip)) {
        result.className = "alert-craft alert-bad p-3 mt-3";
        result.hidden = false;
        result.innerHTML = "<strong>That ZIP doesn't look right.</strong><br>Enter a five-digit US ZIP code, for example 94107.";
        return;
      }
      var zone = window.HG_PICKUP_ZONES.filter(function (z) { return z.zips.indexOf(zip) !== -1; })[0];
      result.hidden = false;
      if (zone) {
        result.className = "alert-craft alert-ok p-3 mt-3";
        result.innerHTML =
          "<strong>Collection available — " + zone.name + "</strong>" +
          "<ul class='mb-0 mt-2 small ps-3'>" +
          "<li>Collection days: " + zone.collectionDays + "</li>" +
          "<li>Notice needed: " + zone.lead + "</li>" +
          "<li>Collection fee: " + (zone.fee === 0 ? "Free" : "$" + zone.fee) + "</li>" +
          "</ul>";
      } else {
        result.className = "alert-craft alert-warn p-3 mt-3";
        result.innerHTML =
          "<strong>Outside our scheduled routes</strong><br>" +
          "We still collect from " + zip + " by arrangement — call us and we'll quote a courier rate.";
      }
    });
  }

  /* ---------- Estimate calculator ---------- */
  var calc = document.querySelector("[data-calculator]");
  if (calc) {
    var out = calc.querySelector("[data-calc-output]");
    var breakdown = calc.querySelector("[data-calc-breakdown]");

    function money(n) { return "$" + Math.round(n).toLocaleString(); }

    function recalc() {
      var base = parseFloat(calc.querySelector("[name=service]").value) || 0;
      var sizeMult = parseFloat(calc.querySelector("[name=size]").value) || 1;
      var condMult = parseFloat(calc.querySelector("[name=condition]").value) || 1;
      var qty = Math.max(1, parseInt(calc.querySelector("[name=quantity]").value, 10) || 1);
      var extras = 0;
      calc.querySelectorAll("[name=extras]:checked").forEach(function (cb) { extras += parseFloat(cb.value) || 0; });

      var perPiece = base * sizeMult * condMult + extras;
      var total = perPiece * qty;
      var low = total * 0.9;
      var high = total * 1.25;

      out.textContent = money(low) + " – " + money(high);
      breakdown.innerHTML =
        "<li class='d-flex justify-content-between'><span>Base service</span><span>" + money(base) + "</span></li>" +
        "<li class='d-flex justify-content-between'><span>Size &amp; condition</span><span>×" + (sizeMult * condMult).toFixed(2) + "</span></li>" +
        "<li class='d-flex justify-content-between'><span>Add-ons</span><span>" + money(extras) + "</span></li>" +
        "<li class='d-flex justify-content-between'><span>Pieces</span><span>×" + qty + "</span></li>";
    }

    calc.addEventListener("input", recalc);
    calc.addEventListener("change", recalc);
    calc.addEventListener("submit", function (e) { e.preventDefault(); });
    recalc();
  }

  /* ---------- Newsletter / subscribe ---------- */
  document.querySelectorAll("[data-subscribe]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input[type=email]");
      var value = (input.value || "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        window.hgToast && window.hgToast("Enter a valid email address.", "bad");
        input.focus();
        return;
      }
      save("hg.subscribers", { email: value, at: new Date().toISOString() });
      form.reset();
      window.hgToast && window.hgToast("You're on the list — workshop notes once a month.", "ok");
    });
  });

  /* ---------- Login / Register ---------- */
  (function authArea() {
    var tabs = document.querySelectorAll("[data-auth-tab]");
    if (!tabs.length) return;

    function show(name) {
      tabs.forEach(function (tab) {
        var on = tab.getAttribute("data-auth-tab") === name;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
      });
      document.querySelectorAll("[data-auth-form]").forEach(function (form) {
        form.hidden = form.getAttribute("data-auth-form") !== name;
      });
    }
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () { show(tab.getAttribute("data-auth-tab")); });
    });

    /* Show / hide password */
    document.querySelectorAll("[data-password-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var input = document.getElementById(btn.getAttribute("data-password-toggle"));
        if (!input) return;
        var hidden = input.type === "password";
        input.type = hidden ? "text" : "password";
        btn.textContent = hidden ? "Hide" : "Show";
        btn.setAttribute("aria-label", hidden ? "Hide password" : "Show password");
      });
    });

    /* Forgot password panel */
    var forgotBtn = document.querySelector("[data-forgot]");
    var panel = document.querySelector("[data-forgot-panel]");
    if (forgotBtn && panel) {
      forgotBtn.addEventListener("click", function () { panel.hidden = !panel.hidden; });
      var send = panel.querySelector("[data-forgot-send]");
      var email = panel.querySelector("input");
      send && send.addEventListener("click", function () {
        var value = (email.value || "").trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
          window.hgToast && window.hgToast("Enter a valid email address.", "bad");
          email.focus();
          return;
        }
        panel.hidden = true;
        window.hgToast && window.hgToast("Reset link sent to " + value + " (demo).", "good");
      });
    }

    document.querySelectorAll("[data-auth-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var ok = validate(form);

        /* Password match is specific to the register form. */
        var pass = form.querySelector("#reg-password");
        var confirm = form.querySelector("#reg-confirm");
        if (pass && confirm && confirm.value !== pass.value) {
          setError(confirm, "Passwords do not match.");
          ok = false;
        }

        if (!ok) {
          window.hgToast && window.hgToast("Please fix the highlighted fields.", "bad");
          var firstInvalid = form.querySelector(".is-invalid");
          if (firstInvalid) firstInvalid.focus();
          return;
        }

        var mode = form.getAttribute("data-auth-form");
        try {
          localStorage.setItem("hg.session", JSON.stringify({
            email: (form.querySelector("input[type=email]") || {}).value || "",
            at: new Date().toISOString(),
          }));
        } catch (err) {}
        form.reset();
        window.hgToast && window.hgToast(
          mode === "login" ? "Signed in — demo session saved locally." : "Account created — demo session saved locally.",
          "good"
        );
      });
    });
  })();

})();

/* ---------- Social sign-in buttons (demo only) ---------- */
document.querySelectorAll("[data-social]").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var name = btn.getAttribute("data-social");
    var label = name.charAt(0).toUpperCase() + name.slice(1);
    if (window.hgToast) window.hgToast(label + " sign-in is a demo placeholder — connect your provider.", "info");
  });
});
