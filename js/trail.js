// Cursor trail: while the pointer moves over empty space, small colour blocks with a code character
// light up on a 20px grid and fade out. Ten blocks are reused in turn, so it never adds DOM nodes.
// Skipped on touch screens and when the visitor prefers reduced motion.
(function () {
  if (!window.matchMedia || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  var SIZE = 20, COUNT = 10;
  var COLORS = [
    ["#2f8f74", "#ffffff"], ["#e8a33d", "#131512"], ["#1f2d4d", "#ffffff"],
    ["#7fd1b9", "#131512"], ["#f2c14e", "#131512"], ["#62ab95", "#131512"]
  ];
  var CHARS = ["-", "/", ")", ".", "+", "=", ">", "<", "*", "&", "("];
  // Things the trail must not draw over: anything interactive, pictures, diagrams, cards and forms.
  var IGNORE = "a, button, input, select, textarea, label, summary, details, form, svg, img, figure, pre, .card, .facts, .process-diagram, .lr-card, .channel, .cert, .work-row, .jump";

  var layer = document.createElement("div");
  layer.className = "trail";
  layer.setAttribute("aria-hidden", "true");
  var blocks = [];
  for (var i = 0; i < COUNT; i++) {
    var b = document.createElement("div");
    b.className = "trail-block";
    layer.appendChild(b);
    blocks.push({ el: b, timer: 0 });
  }
  document.body.appendChild(layer);

  var next = 0, lastX = -1, lastY = -1;

  function onMove(e) {
    var t = e.target;
    if (!(t instanceof Element) || t.closest(IGNORE)) return;
    // only empty containers: text and other leaf nodes keep the pointer to themselves
    if (t.children.length === 0 && (t.textContent || "").trim() !== "") return;
    var x = SIZE * Math.floor(e.clientX / SIZE), y = SIZE * Math.floor(e.clientY / SIZE);
    if (x === lastX && y === lastY) return;
    lastX = x; lastY = y;

    var blk = blocks[next]; next = (next + 1) % COUNT;
    var c = COLORS[Math.floor(Math.random() * COLORS.length)];
    clearTimeout(blk.timer);
    var s = blk.el.style;
    s.transform = "translate(" + x + "px," + y + "px)";
    s.backgroundColor = c[0];
    s.color = c[1];
    blk.el.textContent = Math.random() < 0.3 ? "" : CHARS[Math.floor(Math.random() * CHARS.length)];
    blk.el.classList.add("on");
    blk.timer = setTimeout(function () { blk.el.classList.remove("on"); }, 100 + Math.random() * 300);
  }

  var areas = document.querySelectorAll("main > section, .site-footer");
  for (var j = 0; j < areas.length; j++) areas[j].addEventListener("mousemove", onMove);
})();
