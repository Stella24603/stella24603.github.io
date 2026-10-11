/* ==========================================================
   Ayan Mandal portfolio: interactions
   ========================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme toggle (remembered per browser) ---------- */
  var root = document.documentElement;
  var toggle = document.getElementById("themeToggle");

  function applyTheme(mode) {
    if (mode === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
  }
  try {
    var saved = localStorage.getItem("theme");
    if (saved) applyTheme(saved);
  } catch (e) { /* storage unavailable: ignore */ }

  toggle.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("theme", next); } catch (e) { /* ignore */ }
  });

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Count-up numbers ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var start = null, duration = 1200;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { countUp(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(countUp);
  }

  /* ---------- Hero glow follows the pointer ---------- */
  var glow = document.getElementById("glow");
  var hero = document.querySelector(".hero");
  if (glow && hero && !reduceMotion) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = e.clientX - r.left;
      var y = e.clientY - r.top;
      glow.style.transform = "translate(" + (x - 260) + "px," + (y - 260) + "px)";
      glow.style.left = "0";
      glow.style.top = "0";
    });
  }

  /* ---------- Terminal demo: role tabs with typing ---------- */
  var screen = document.getElementById("demoScreen");
  var tabs = document.querySelectorAll(".demo-tabs .chip");

  var scripts = {
    teacher: [
      ["cmd", "whoami"],
      ["out", "Ayan Mandal, Computer Science teacher"],
      ["cmd", "cat experience.txt"],
      ["out", "5+ years teaching maths, science and computers\nCo-founder, Ganitasastram\nBilingual notes: English + Bengali"],
      ["cmd", "ls favourites/"],
      ["out", "pattern-printing/  loops/  sql-queries/  python-lists/"]
    ],
    builder: [
      ["cmd", "ls projects/"],
      ["out", "classroom-app/  student-app/  institute-website/"],
      ["cmd", "cat classroom-app/stack.txt"],
      ["out", "React + Firebase\nbatches, attendance, tests, fees"],
      ["cmd", "git status"],
      ["out", "student-app: planning, notes + quizzes + progress"]
    ],
    learner: [
      ["cmd", "cat studying.txt"],
      ["out", "BS in Data Science, IIT Madras (online)\nstatistics, maths, computational thinking, English"],
      ["cmd", "ls courses/"],
      ["out", "python-gfg/  ai-masterclass/  ai-webinars/"],
      ["cmd", "echo $NEXT"],
      ["out", "data science + AI, for building and for teaching"]
    ]
  };

  var runId = 0;

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  async function play(role) {
    var id = ++runId;
    var lines = scripts[role];
    var html = "";
    screen.innerHTML = "";

    if (reduceMotion) {
      lines.forEach(function (l) {
        html += l[0] === "cmd"
          ? '<span class="prompt">&gt;_ </span>' + esc(l[1]) + "\n"
          : '<span class="muted">' + esc(l[1]) + "</span>\n";
      });
      screen.innerHTML = html;
      return;
    }

    for (var i = 0; i < lines.length; i++) {
      if (id !== runId) return;
      var type = lines[i][0];
      var text = lines[i][1];

      if (type === "cmd") {
        var typed = "";
        for (var c = 0; c < text.length; c++) {
          if (id !== runId) return;
          typed += text[c];
          screen.innerHTML = html + '<span class="prompt">&gt;_ </span>' + esc(typed) + '<span class="caret"></span>';
          await sleep(34);
        }
        html += '<span class="prompt">&gt;_ </span>' + esc(text) + "\n";
        screen.innerHTML = html;
        await sleep(260);
      } else {
        html += '<span class="muted">' + esc(text) + "</span>\n";
        screen.innerHTML = html;
        await sleep(420);
      }
    }
    if (id === runId) screen.innerHTML = html + '<span class="prompt">&gt;_ </span><span class="caret"></span>';
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      play(tab.getAttribute("data-role"));
    });
  });

  if (screen) play("teacher");

  /* ---------- Project filters ---------- */
  var filterBtns = document.querySelectorAll(".filters .chip");
  var projects = document.querySelectorAll(".project");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var f = btn.getAttribute("data-filter");
      projects.forEach(function (p) {
        var show = f === "all" || p.getAttribute("data-cat") === f;
        p.classList.toggle("hide", !show);
      });
    });
  });

  /* ---------- Project card tilt on hover (desktop pointers only) ---------- */
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (canHover && !reduceMotion) {
    projects.forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(800px) rotateX(" + (-py * 6) + "deg) rotateY(" + (px * 6) + "deg) translateY(-4px)";
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- Live clocks (nav chip + ticker) ---------- */
  var clockEls = document.querySelectorAll("[data-tz]");
  var fmtCache = {};
  function fmtFor(tz) {
    if (!fmtCache[tz]) {
      fmtCache[tz] = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false });
    }
    return fmtCache[tz];
  }
  function tickClocks() {
    var now = new Date();
    clockEls.forEach(function (el) {
      try { el.textContent = fmtFor(el.getAttribute("data-tz")).format(now); } catch (e) { /* ignore */ }
    });
  }
  tickClocks();
  setInterval(tickClocks, 15000);

  /* ---------- Project carousel: arrows, counter, keyboard ---------- */
  var track = document.getElementById("projectGrid");
  var prevBtn = document.getElementById("carPrev");
  var nextBtn = document.getElementById("carNext");
  var countEl = document.getElementById("carCount");

  function cardStep() {
    var first = track.querySelector(".project:not(.hide)");
    if (!first) return 300;
    return first.getBoundingClientRect().width + 20;
  }
  function updateCarousel() {
    var visible = track.querySelectorAll(".project:not(.hide)");
    var step = cardStep();
    var idx = Math.round(track.scrollLeft / step) + 1;
    var maxScroll = track.scrollWidth - track.clientWidth;
    prevBtn.disabled = track.scrollLeft <= 4;
    nextBtn.disabled = track.scrollLeft >= maxScroll - 4;
    if (visible.length && track.scrollLeft >= maxScroll - 4) idx = visible.length;
    countEl.textContent = visible.length ? Math.min(idx, visible.length) + " / " + visible.length : "";
  }
  prevBtn.addEventListener("click", function () { track.scrollBy({ left: -cardStep(), behavior: "smooth" }); });
  nextBtn.addEventListener("click", function () { track.scrollBy({ left: cardStep(), behavior: "smooth" }); });
  track.addEventListener("scroll", function () { window.requestAnimationFrame(updateCarousel); }, { passive: true });
  track.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); nextBtn.click(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); prevBtn.click(); }
  });
  window.addEventListener("resize", updateCarousel);
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () { track.scrollTo({ left: 0 }); updateCarousel(); });
  });
  updateCarousel();

  /* ---------- FAQ: only one open at a time ---------- */
  var details = document.querySelectorAll(".faq details");
  details.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) details.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
})();
