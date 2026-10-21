// Footer year, and the mobile menu: below 860px the section links sit behind the menu button
// (layout in components.css). Without JS the links simply stay visible as a wrapped row.
(function () {
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

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
  window.matchMedia("(min-width: 860px)").addEventListener("change", function (e) {
    if (e.matches) setMenu(false);
  });
})();
