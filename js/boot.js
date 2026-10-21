// Boot screen: Logi wakes up on a navy screen, its mouth (the terminal prompt) falls out and Logi panics while
// "loading portfolio..." types itself out. Then the line is erased, Logi picks its mouth back up, drops to the
// bottom edge of the screen and pulls the whole screen up to reveal the page. The timeline lives in css/components.css.
// The inline script in <head> only adds html.booting on a first visit this session, without a #hash in the
// URL and without reduced motion, so repeat visits and deep links skip it entirely.
// It lifts once the page has loaded and the animation has played, or on any click or key press,
// and a failsafe removes it after 8 seconds whatever happens.
(function () {
  var root = document.documentElement;
  var boot = document.getElementById("boot");
  if (!boot || !root.classList.contains("booting")) return;

  try { sessionStorage.setItem("booted", "1"); } catch (e) { /* private mode: it just plays again next time */ }

  var svg = boot.querySelector("svg");
  var text = boot.querySelector(".b-text"), clip = boot.querySelector(".b-clip");
  var VB_W = 180, FLOOR_BOTTOM = 131, VB_H = 190, DY = 66;

  // The line (prompt, text, cursor) is centred under Logi. Measure the text as this browser renders it,
  // then work out how far the mouth has to travel sideways and how far Logi has to go to reach the bottom edge.
  function layout() {
    if (!text || !text.getComputedTextLength) return;
    var len = text.getComputedTextLength();
    if (!(len > 0)) return;
    var dx = 5 - len / 2;                       // line width is 30 + len, centred on Logi (x = 60)
    text.setAttribute("x", (61 + dx).toFixed(1));
    if (clip) { clip.setAttribute("x", (61 + dx).toFixed(1)); clip.setAttribute("width", Math.ceil(len) + 2); }
    boot.style.setProperty("--dx", dx.toFixed(1) + "px");
    boot.style.setProperty("--dy", DY + "px");
    boot.style.setProperty("--tw", len.toFixed(1) + "px");
    var s = svg.getBoundingClientRect().width / VB_W;      // px per viewBox unit
    var H = boot.clientHeight;
    var floorNow = (H - VB_H * s) / 2 + FLOOR_BOTTOM * s;  // where Logi's floor line is while centred
    boot.style.setProperty("--down", Math.max(0, H - floorNow).toFixed(0) + "px");
  }
  layout();
  window.addEventListener("resize", layout);

  var MIN = 4900;                         // ms before the screen may be pulled up
  var start = Date.now(), loaded = document.readyState === "complete", leaving = false;

  function leave() {
    if (leaving) return;
    leaving = true;
    boot.classList.add("boot-out");
    var done = function () {
      window.removeEventListener("resize", layout);
      boot.removeEventListener("animationend", onEnd);
      root.classList.remove("booting");
      boot.remove();
    };
    function onEnd(e) { if (e.target === boot) done(); }
    boot.addEventListener("animationend", onEnd);
    setTimeout(done, 1200);               // in case animationend never fires
  }
  function maybeLeave() {
    if (!loaded) return;
    setTimeout(leave, Math.max(0, MIN - (Date.now() - start)));
  }

  if (!loaded) window.addEventListener("load", function () { loaded = true; maybeLeave(); });
  else maybeLeave();

  boot.addEventListener("click", leave);
  window.addEventListener("keydown", leave, { once: true });
  setTimeout(leave, 8000);
})();
