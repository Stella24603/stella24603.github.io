// Phase 2: only the footer year. Motion, Jump bar, IST clock and form handling come in later phases.
(function () {
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
