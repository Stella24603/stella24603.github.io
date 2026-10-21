# stella24603.github.io

Portfolio of Ayan "Kuro" Mandal: web developer, Data Science student (IIT Madras) and CS educator.
A static site (plain HTML, CSS and JavaScript) hosted on GitHub Pages. There is no build step.

## Run it locally

```bash
python -m http.server 8123
```

Then open http://localhost:8123. (Open it through the server, not by double-clicking `index.html`: the fonts and the sample PDF are loaded by path.)

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | Home page: hero, work, process, journey, teaching, The Logic Room, notes, FAQ, contact dialog |
| `work/` | One case-study page per project |
| `notes/` | Short notes on computer science |
| `css/` | `tokens.css` (colours, fonts, sizes), `base.css`, `components.css` |
| `js/` | `boot.js` boot screen, `mascot.js` mascot and contact dialog, `trail.js` cursor trail, `fx.js` nav glitch, `faq.js` FAQ decode, `motion.js` scroll reveals, `jumpbar.js` command palette, `contact.js` form, `main.js` theme and menu |
| `assets/fonts/` | Self-hosted Bricolage Grotesque and Hanken Grotesk (free, OFL) |
| `assets/samples/` | PDFs linked from the Teaching section |
| `assets/img/` | Images used on the page |

## Notes

- The contact form posts to [Web3Forms](https://web3forms.com). The access key in `index.html` is public by design; the destination email is set in the Web3Forms account.
- Motion (boot screen, cursor trail, glitch text, scroll reveals, mascot) is switched off for visitors who prefer reduced motion, and the cursor effects are off on touch screens.
- Before publishing, check that every file the pages reference is committed, including new files in `assets/` and `js/`.
