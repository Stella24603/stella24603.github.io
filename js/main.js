// Footer year, theme toggle, and the mobile menu: below 1080px the section links sit behind the menu button
// (layout in components.css). Without JS the links simply stay visible as a wrapped row.
(function () {
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Theme: the head script has already set data-theme (saved choice, else the system setting).
  // This keeps the toggle buttons, the theme-color meta tag and the saved choice in step.
  var root = document.documentElement;
  var themeBtns = document.querySelectorAll(".theme-btn, .theme-row");
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var THEME_COLOR = { light: "#f6f5f1", dark: "#131512" };

  function paintTheme(t) {
    var next = t === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", t);
    if (themeMeta) themeMeta.setAttribute("content", THEME_COLOR[t]);
    Array.prototype.forEach.call(themeBtns, function (b) {
      b.setAttribute("aria-label", "Switch to " + next + " mode");
      var label = b.querySelector(".theme-row-label");
      if (label) label.textContent = (next === "dark" ? "Dark" : "Light") + " mode";
    });
  }
  function savedTheme() {
    try { var t = localStorage.getItem("theme"); return t === "light" || t === "dark" ? t : null; } catch (e) { return null; }
  }
  paintTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");
  Array.prototype.forEach.call(themeBtns, function (b) {
    b.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      paintTheme(next);
      try { localStorage.setItem("theme", next); } catch (e) { /* private mode: the choice just isn't remembered */ }
    });
  });
  // With no saved choice, follow the system setting if it changes while the page is open.
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
      if (!savedTheme()) paintTheme(e.matches ? "dark" : "light");
    });
  }

  var btn = document.querySelector(".menu-btn");
  var links = document.getElementById("nav-links");
  if (!btn || !links) return;

  function setMenu(open) {
    links.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  btn.addEventListener("click", function () {
    setMenu(btn.getAttribute("aria-expanded") !== "true");
  });
  links.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("click", function (e) {
    if (links.classList.contains("open") && !e.target.closest(".site-header")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && links.classList.contains("open")) { setMenu(false); btn.focus(); }
  });
  window.matchMedia("(min-width: 1080px)").addEventListener("change", function (e) {
    if (e.matches) setMenu(false);
  });
})();
