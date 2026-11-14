# AGENTS.md

Read **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** first: purpose, file map, key functions in `index.html`,
state model, maps/hosting, and project rules.

Quick rules:
- Static site (GitHub Pages from `main`/root). No build step, no npm, no CDN at runtime – vendor libs into `lib/`.
- Almost all code is in `index.html`; find code by function name (see summary table).
- Keep old saved data (localStorage `routeS`) loading when changing the state model.
- Owner uses Safari on iPad/iPhone – check WebKit behaviour.
- Don't reuse CSS class `.ed`; don't re-add Type/ALT input fields; never commit `*.pmtiles`.
- Bump `APP` in `sw.js` only when `sw.js` changes.
- One feature per PR, English title; the owner merges. Reply to the owner in Thai, short.
- Update PROJECT_SUMMARY.md when you add a feature or change a rule (keep it under 200 lines).
