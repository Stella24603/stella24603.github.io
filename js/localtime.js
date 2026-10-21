// IST clock for the corner-pinned info. Plain text, updated every 30s.
(function () {
  var el = document.getElementById("localtime");
  if (!el || !window.Intl || !Intl.DateTimeFormat) return;
  var fmt;
  try {
    fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
  } catch (e) { return; }
  function tick() { el.textContent = "Kolkata · " + fmt.format(new Date()) + " IST"; }
  tick();
  setInterval(tick, 30000);
})();
