// Motion layer: masked line reveals on headings + staggered fades on scroll.
// Everything is inside gsap.matchMedia() with prefers-reduced-motion: no-preference.
// The <html class="js-motion"> flag is set by a tiny inline script in <head> only when motion is allowed.
// If anything here fails, content is never left hidden: we drop the flag, and CSS has a 2.5s fail-open.
(function () {
  var root = document.documentElement;

  function failOpen() {
    root.classList.remove("js-motion");
    root.classList.add("js-ready");
  }

  if (!root.classList.contains("js-motion")) { root.classList.add("js-ready"); return; }
  if (!window.gsap || !window.ScrollTrigger) { failOpen(); return; }

  try {
    gsap.registerPlugin(ScrollTrigger);

    var LINE_TARGETS = ".hero-line, .section-head h2, .cs-hero h1";
    var FADE_TARGETS = [
      ".work-row", ".work-more", ".steps li", ".timeline li", ".cert", ".facts div",
      ".card", ".lr-card", ".lr-links", ".note-row", ".faq details", ".contact-grid .form",
      ".contact-side", ".cs-body section"
    ].join(",");

    // Split an element's text into masked word spans, keeping inline children such as <em>.
    function splitWords(el) {
      var words = [];
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
              var w = document.createElement("span"); w.className = "w";
              var i = document.createElement("span"); i.className = "wi"; i.textContent = part;
              w.appendChild(i); frag.appendChild(w); words.push(w);
            });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1) { walk(n); }
        });
      })(el);
      return words;
    }

    // Words that share a visual line get the same stagger slot.
    function tagLines(words) {
      var tops = [];
      words.forEach(function (w) { var t = Math.round(w.offsetTop); if (tops.indexOf(t) < 0) tops.push(t); });
      tops.sort(function (a, b) { return a - b; });
      words.forEach(function (w) { w._line = tops.indexOf(Math.round(w.offsetTop)); });
    }

    var mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", function () {
      var small = window.matchMedia("(max-width: 799px)").matches;
      var dur = small ? 1.25 : 1.2;   // slower on purpose: small screens need longer to be noticed

      // 1. Masked line reveals
      var lineEls = Array.prototype.slice.call(document.querySelectorAll(LINE_TARGETS));
      var jobs = lineEls.map(function (el) {
        var words = splitWords(el);
        tagLines(words);
        var inners = words.map(function (w) { return w.firstChild; });
        gsap.set(inners, { yPercent: 115 });
        gsap.set(el, { opacity: 1 });
        return { el: el, words: words, inners: inners };
      });

      // 2. Staggered fades (set start state, reveal in batches as they scroll in)
      var fadeEls = gsap.utils.toArray(FADE_TARGETS);
      gsap.set(fadeEls, { opacity: 0, y: small ? 36 : 44 });

      // Everything is now in its start state: drop the CSS fail-open.
      root.classList.add("js-ready");

      jobs.forEach(function (j, idx) {
        var play = function () {
          gsap.to(j.inners, {
            yPercent: 0, duration: dur, ease: "power3.out",
            delay: function (i, t) { return t.parentNode._line * 0.16 + i * 0.012; }
          });
        };
        if (j.el.matches(".hero-line") || idx === 0) { play(); }
        else { ScrollTrigger.create({ trigger: j.el, start: "top 90%", once: true, onEnter: play }); }
      });

      ScrollTrigger.batch(fadeEls, {
        start: "top 92%", once: true,
        onEnter: function (batch) {
          gsap.to(batch, { opacity: 1, y: 0, duration: small ? 1.15 : 1.1, ease: "power3.out", stagger: 0.14, overwrite: true });
        }
      });

      // Clean up if the user turns reduced motion on mid-session: show everything.
      return function () {
        gsap.set(lineEls.concat(fadeEls), { clearProps: "all" });
        gsap.set(document.querySelectorAll(".wi"), { clearProps: "all" });
        root.classList.remove("js-motion");
      };
    });

    // If reduced motion is set, matchMedia never runs the block above: reveal immediately.
    if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches) { failOpen(); }
  } catch (e) {
    failOpen();
  }
})();
