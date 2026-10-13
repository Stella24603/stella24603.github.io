// Contact form: progressive enhancement over a plain HTML POST to Web3Forms.
// Without JS the form still submits normally.
(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;
  var status = document.getElementById("form-status");
  var button = form.querySelector('button[type="submit"]');

  function show(msg, kind) {
    status.textContent = msg;
    status.className = "form-status " + (kind || "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Honeypot: bots tick the hidden checkbox. Pretend success, send nothing.
    if (form.elements.botcheck && form.elements.botcheck.checked) {
      show("Thanks, I’ll get back to you soon.", "ok");
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      show("Please fill in the required fields.", "err");
      return;
    }

    var data = {};
    new FormData(form).forEach(function (v, k) {
      if (k !== "botcheck") data[k] = v;
    });

    button.disabled = true;
    show("Sending…");

    fetch(form.action, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (res) { return res.json().then(function (j) { return { ok: res.ok, json: j }; }); })
      .then(function (r) {
        if (r.ok && r.json.success) {
          form.reset();
          show("Thanks, I’ll get back to you soon.", "ok");
        } else {
          throw new Error("rejected");
        }
      })
      .catch(function () {
        show("Something went wrong. Please try again or message me on LinkedIn.", "err");
      })
      .then(function () { button.disabled = false; });
  });
})();
