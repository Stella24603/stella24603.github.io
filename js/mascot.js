// Mascot ("Logi", the Logic Room doorway): sits in the corner, its eyes follow the pointer, and it pipes up with a
// short line when you hover it or scroll to certain sections. Clicking it opens the contact dialog.
// The dialog also opens for any link to #contact, so links from other pages keep working.
(function () {
  var mascot = document.getElementById("mascot");
  var dlg = document.getElementById("contact-dialog");
  var btn = mascot && mascot.querySelector(".mascot-btn");
  var bubble = mascot && mascot.querySelector(".mascot-bubble");
  if (!mascot || !dlg || typeof dlg.showModal !== "function") return;

  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  var opener = null;

  // ---------- contact dialog ----------
  function openContact(from) {
    if (dlg.open) return;
    opener = from || document.activeElement;
    hideBubble();
    dlg.showModal();
    root.style.overflow = "hidden";
    var first = dlg.querySelector("input:not([type=hidden]):not(.honeypot)");
    if (first) first.focus({ preventScroll: true });
  }
  function closeContact() { if (dlg.open) dlg.close(); }
  dlg.addEventListener("close", function () {
    root.style.overflow = "";
    if (location.hash === "#contact" && history.replaceState) history.replaceState(null, "", location.pathname + location.search);
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) closeContact(); });
  dlg.querySelector(".cd-close").addEventListener("click", closeContact);

  btn.addEventListener("click", function () { openContact(btn); });
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-open-contact], a[href='#contact']");
    if (!a) return;
    e.preventDefault();
    openContact(a);
  });
  function fromHash() { if (location.hash === "#contact") openContact(btn); }
  window.addEventListener("hashchange", fromHash);
  fromHash();
  window.addEventListener("open-contact", function () { openContact(btn); });

  // ---------- speech ----------
  var LINES = [
    "Like what you see?",
    "Want to get in touch?",
    "Got a project in mind?",
    "Say hi. I read every message.",
    "Need a hand with computer science?",
    "Let's build something together.",
    "Psst, the contact form is right here."
  ];
  var lastLine = -1, hideTimer = 0, lastSpoke = 0;

  function say(text) {
    clearTimeout(hideTimer);
    bubble.textContent = text;
    bubble.hidden = false;
    // restart the pop-in
    bubble.classList.remove("pop"); void bubble.offsetWidth; bubble.classList.add("pop");
    mascot.classList.add("talking");
    lastSpoke = Date.now();
    hideTimer = setTimeout(hideBubble, 5200);
  }
  function hideBubble() {
    clearTimeout(hideTimer);
    bubble.hidden = true;
    mascot.classList.remove("talking");
  }
  function randomLine() {
    var i;
    do { i = Math.floor(Math.random() * LINES.length); } while (i === lastLine && LINES.length > 1);
    lastLine = i;
    return LINES[i];
  }

  btn.addEventListener("pointerenter", function () { if (!dlg.open) say(randomLine()); });
  btn.addEventListener("focus", function () { if (!dlg.open) say(randomLine()); });
  btn.addEventListener("blur", hideBubble);
  mascot.addEventListener("pointerleave", function () { hideTimer = setTimeout(hideBubble, 1200); });

  // Speaks up once per section as you scroll through, never more than once every 9 seconds.
  if ("IntersectionObserver" in window) {
    var seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var id = en.target.id;
        if (!en.isIntersecting || seen[id] || dlg.open) return;
        if (Date.now() - lastSpoke < 9000) return;
        seen[id] = true;
        say(randomLine());
      });
    }, { threshold: 0.4 });
    ["work", "teaching", "logic-room", "notes", "faq"].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) io.observe(s);
    });
    // the footer is the last stop
    var foot = document.querySelector(".site-footer");
    if (foot) {
      new IntersectionObserver(function (entries, o) {
        if (entries[0].isIntersecting && !dlg.open) { say("Leaving already? Say hi first."); o.disconnect(); }
      }, { threshold: 0.5 }).observe(foot);
    }
  }

  // ---------- eyes follow the pointer ----------
  if (reduce) return;
  var pupils = mascot.querySelectorAll(".m-pupil");
  var px = 0, py = 0, queued = false;
  function look() {
    queued = false;
    var r = btn.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height * 0.45;
    var dx = px - cx, dy = py - cy;
    var d = Math.hypot(dx, dy) || 1;
    var k = Math.min(1, d / 160) * 4.2;          // max travel in SVG units
    var tx = (dx / d) * k, ty = (dy / d) * k;
    for (var i = 0; i < pupils.length; i++) pupils[i].style.transform = "translate(" + tx.toFixed(2) + "px," + ty.toFixed(2) + "px)";
  }
  document.addEventListener("pointermove", function (e) {
    px = e.clientX; py = e.clientY;
    if (!queued) { queued = true; requestAnimationFrame(look); }
  }, { passive: true });
})();
