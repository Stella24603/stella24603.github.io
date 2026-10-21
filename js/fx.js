// Nav links scramble their letters for a moment on hover, then settle back.
// Skipped for touch screens and for visitors who ask for reduced motion. (The cursor trail lives in trail.js.)
(function () {
  if (!window.matchMedia) return;
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || calm) return;

  // ---------- nav scramble ----------
  var GLYPHS = "abcdefghijklmnopqrstuvwxyz<>/{}=+*&";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var label = a.textContent, timer = null;
    a.addEventListener("mouseenter", function () {
      clearInterval(timer);
      a.style.minWidth = a.offsetWidth + "px";
      var step = 0, frames = 10;
      timer = setInterval(function () {
        step++;
        var settled = Math.floor((step / frames) * label.length);
        var out = "";
        for (var i = 0; i < label.length; i++) {
          out += i < settled || label[i] === " " ? label[i] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        a.textContent = out;
        if (step >= frames) { clearInterval(timer); a.textContent = label; }
      }, 30);
    });
    a.addEventListener("mouseleave", function () { clearInterval(timer); a.textContent = label; });
  });
})();
