// Motion layer: a short fade-and-rise as content scrolls into view. Headlines are never animated or hidden.
// Everything is inside gsap.matchMedia() with prefers-reduced-motion: no-preference.
// The <html class="js-motion"> flag is set by a tiny inline script in <head> only when motion is allowed.
// If anything here fails, content is never left hidden: we drop the flag, and CSS has a 1.2s fail-open.
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

    var FADE_TARGETS = [
      ".work-row", ".work-more", ".steps li", ".timeline li", ".cert", ".facts div",
      ".card", ".lr-card", ".lr-links", ".note-row", ".faq details", ".contact-grid .form",
      ".contact-side", ".cs-body section"
    ].join(",");

    var mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", function () {
      var fadeEls = gsap.utils.toArray(FADE_TARGETS);
      gsap.set(fadeEls, { opacity: 0, y: 16 });
      root.classList.add("js-ready");

      // Anything already on screen (or above it, after a jump link or reload) shows at once.
      ScrollTrigger.batch(fadeEls, {
        start: "top 98%", once: true,
        onEnter: function (batch) {
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: 0.05, overwrite: true });
        }
      });
      ScrollTrigger.addEventListener("refresh", function () {
        fadeEls.forEach(function (el) {
          if (el.getBoundingClientRect().bottom < 0) gsap.set(el, { opacity: 1, y: 0 });
        });
      });

      return function () {
        gsap.set(fadeEls, { clearProps: "all" });
        root.classList.remove("js-motion");
      };
    });


    // Process diagram: Define -> Draft -> Review -> Test -> Ship fill in as you scroll through it;
    // the "if it fails" loop comes last. Scrubbed to the scroll position, so it also runs backwards.
    var mmd = gsap.matchMedia();
    mmd.add({
      wide: "(min-width: 800px) and (prefers-reduced-motion: no-preference)",
      tall: "(max-width: 799px) and (prefers-reduced-motion: no-preference)"
    }, function (ctx) {
      var svg = document.querySelector(ctx.conditions.wide ? ".pd-wide" : ".pd-tall");
      if (!svg) return;
      var steps = svg.querySelectorAll(".pd-step"), arrows = svg.querySelectorAll(".pd-arrow"), loop = svg.querySelector(".pd-loop");
      var tall = !ctx.conditions.wide;
      gsap.set(steps, { opacity: 0.12 });
      gsap.set(arrows, { opacity: 0 });
      gsap.set(loop, { opacity: 0 });
      var tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: svg, start: tall ? "top 70%" : "top 80%", end: tall ? "bottom 45%" : "bottom 55%", scrub: 0.5 }
      });
      steps.forEach(function (st, i) {
        tl.to(st, { opacity: 1, duration: 1 });
        if (arrows[i]) tl.to(arrows[i], { opacity: 1, duration: 0.5 }, "<0.6");
      });
      tl.to(loop, { opacity: 1, duration: 1.2 }, ">0.2");
      return function () { gsap.set(svg.querySelectorAll(".pd-step, .pd-arrow, .pd-loop"), { clearProps: "all" }); };
    });

    if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches) { failOpen(); }
  } catch (e) {
    failOpen();
  }
})();
