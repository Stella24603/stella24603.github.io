// Jump bar: a terminal-style command palette. Press "/" or use the nav button.
// It is an enhancement: every section stays reachable through the normal nav.
(function () {
  var dlg = document.createElement("dialog");
  var btn = document.querySelector(".jump-btn");
  if (typeof dlg.showModal !== "function") { if (btn) btn.remove(); return; }

  var COMMANDS = [
    { k: "web", id: "work", d: "Selected work" },
    { k: "teaching", id: "teaching", d: "Teaching" },
    { k: "logic-room", id: "logic-room", d: "The Logic Room" },
    { k: "journey", id: "journey", d: "Journey and certifications" },
    { k: "notes", id: "notes", d: "Notes" },
    { k: "contact", id: "contact", d: "Get in touch" }
  ];
  var onHome = !!document.getElementById("work");
  var brand = document.querySelector(".brand");
  var indexHref = brand ? brand.getAttribute("href").split("#")[0] : "index.html";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  dlg.className = "jump";
  dlg.setAttribute("aria-label", "Jump to a section");
  dlg.innerHTML =
    '<div class="jump-inner">' +
      '<label class="jump-row"><span class="jump-prompt" aria-hidden="true">kuro@portfolio ~ $</span>' +
      '<input class="jump-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Type a command: web, teaching, logic-room, journey, notes or contact"></label>' +
      '<ul class="jump-list"></ul>' +
      '<p class="jump-status mono" role="status" aria-live="polite"></p>' +
      '<p class="jump-hint mono">Enter to go &middot; Esc to close</p>' +
    '</div>';
  document.body.appendChild(dlg);

  var input = dlg.querySelector(".jump-input");
  var list = dlg.querySelector(".jump-list");
  var status = dlg.querySelector(".jump-status");

  function render(q) {
    q = (q || "").trim().toLowerCase();
    var shown = COMMANDS.filter(function (c) { return !q || c.k.indexOf(q) === 0; });
    list.innerHTML = "";
    shown.forEach(function (c) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button"; b.className = "jump-item";
      b.innerHTML = '<span class="jump-cmd">' + c.k + '</span><span class="jump-desc">' + c.d + "</span>";
      b.addEventListener("click", function () { go(c); });
      li.appendChild(b); list.appendChild(li);
    });
    return shown;
  }

  function go(c) {
    dlg.close();
    if (!onHome) { window.location.href = indexHref + "#" + c.id; return; }
    var t = document.getElementById(c.id);
    if (!t) return;
    t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    if (history.replaceState) history.replaceState(null, "", "#" + c.id);
    t.setAttribute("tabindex", "-1");
    t.focus({ preventScroll: true });
  }

  function open() {
    if (dlg.open) return;
    input.value = ""; status.textContent = ""; render("");
    dlg.showModal();
    input.focus();
  }

  input.addEventListener("input", function () { status.textContent = ""; render(input.value); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") {
      var first = list.querySelector("button");
      if (first) { e.preventDefault(); first.focus(); }
    }
    if (e.key !== "Enter") return;
    e.preventDefault();
    var q = input.value.trim().toLowerCase();
    if (!q) return;
    var exact = COMMANDS.filter(function (c) { return c.k === q; })[0];
    var prefix = COMMANDS.filter(function (c) { return c.k.indexOf(q) === 0; });
    var hit = exact || (prefix.length === 1 ? prefix[0] : null);
    if (hit) { go(hit); return; }
    status.textContent = prefix.length
      ? "Be more specific: " + prefix.map(function (c) { return c.k; }).join(", ")
      : "command not found: " + q + ". Try: " + COMMANDS.map(function (c) { return c.k; }).join(", ");
  });
  list.addEventListener("keydown", function (e) {
    var items = Array.prototype.slice.call(list.querySelectorAll("button"));
    var i = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown" && i < items.length - 1) { e.preventDefault(); items[i + 1].focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); (i > 0 ? items[i - 1] : input).focus(); }
  });
  // Clicking the backdrop (the dialog element itself) closes it.
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  // Nav button lives in the HTML (so the header never changes size); we only bind it here.
  if (btn) btn.addEventListener("click", open);

  // "/" opens it, unless the user is typing somewhere.
  document.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
    var a = document.activeElement, tag = a && a.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (a && a.isContentEditable)) return;
    e.preventDefault();
    open();
  });
})();
