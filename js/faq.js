// FAQ answers decode line by line when a question opens: each line fills in left to right through a few
// random glyphs, the same trick as the nav links. Every character keeps its real width while it scrambles,
// so nothing reflows. Links in an answer appear with their line instead of scrambling.
// Skipped for visitors who ask for reduced motion: the answer just opens.
(function () {
  if (!window.matchMedia || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var GLYPHS = "abcdefghijklmnopqrstuvwxyz<>/{}=+*&";
  var LINE_GAP = 170;     // ms between the start of one line and the next
  var LINE_SPAN = 420;    // ms for a line to sweep from its first to its last character
  var GLITCH = 130;       // ms a character shows random glyphs before it settles

  function decode(p) {
    if (p._fx) p._fx.stop();
    var original = p.innerHTML;
    var units = [];

    // 1. split text into character spans (words stay unbreakable, spaces stay plain text)
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span");
            w.style.whiteSpace = "nowrap";
            for (var i = 0; i < part.length; i++) {
              var c = document.createElement("span");
              c.textContent = part[i];
              c.style.display = "inline-block";
              w.appendChild(c);
              units.push({ el: c, ch: part[i] });
            }
            frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) {
          if (n.tagName === "A") units.push({ el: n, ch: null }); // links stay whole
          else walk(n);
        }
      });
    })(p);

    // 2. lock every character to its real width and note which visual line it is on
    units.forEach(function (u) { u.w = u.el.getBoundingClientRect().width; u.top = Math.round(u.el.getBoundingClientRect().top); });
    units.forEach(function (u) { if (u.ch !== null) { u.el.style.width = u.w + "px"; u.el.style.textAlign = "center"; } });
    var tops = [];
    units.forEach(function (u) { if (tops.indexOf(u.top) < 0) tops.push(u.top); });
    tops.sort(function (a, b) { return a - b; });
    var lines = tops.map(function () { return []; });
    units.forEach(function (u) { lines[tops.indexOf(u.top)].push(u); });
    lines.forEach(function (line, li) {
      line.forEach(function (u, j) { u.start = li * LINE_GAP + (j / Math.max(1, line.length)) * LINE_SPAN; });
    });

    // 3. start hidden, then reveal on a timer
    units.forEach(function (u) { u.el.style.visibility = "hidden"; });
    var t0 = Date.now(), timer = setInterval(tick, 32);
    function tick() {
      var t = Date.now() - t0, done = true;
      units.forEach(function (u) {
        var dt = t - u.start;
        if (dt < 0) { done = false; return; }
        if (u.ch === null) { u.el.style.visibility = ""; return; }
        u.el.style.visibility = "";
        if (dt < GLITCH && u.ch !== " ") {
          u.el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          u.el.style.color = "var(--accent)";
          done = false;
        } else {
          u.el.textContent = u.ch;
          u.el.style.color = "";
        }
      });
      if (done) stop();
    }
    function stop() {
      clearInterval(timer);
      p.innerHTML = original;
      p._fx = null;
    }
    p._fx = { stop: stop };
  }

  document.querySelectorAll(".faq details").forEach(function (d) {
    var p = d.querySelector("p");
    if (!p) return;
    d.addEventListener("toggle", function () {
      if (d.open) decode(p);
      else if (p._fx) p._fx.stop();
    });
  });
})();
