# FalCon2CP – Project Summary (for AI agents / new contributors)

Last updated: 2026-11-16 (usage/FAQ/feedback knowledge for a future bot). Owner: SPD (`Spidersqdn`). Owner writes Thai; reply concise, copy-paste ready.

## 1. Purpose
Web app for helicopter mission route maps on FalconView (CADRG/RPF) charts, styled like **AirNavFlow**
(owner's other app, repo `Spidersqdn/FLIGHT`). User draws a route **PZ → CPs → LZ**; the app draws
leg boxes (HDG / NM / time / ALT) and **TOTAL / ACTUAL / REMAIN** tables, prints true-scale maps,
exports KML/KMZ/GPX/CSV and a 16:9 "Mission Overview" slide PNG.

- Live: https://spidersqdn.github.io/FalCon2CP/ (GitHub Pages, branch `main`, root folder, auto deploy ~1 min)
- Pure static site: no build step, no npm, no backend. Data lives in the browser (localStorage / IndexedDB).
- Cloudflare Workers project `falcontocp` and R2 bucket `map` are **no longer used** (ignore their failing checks).

## 2. Files
```
index.html            whole app: CSS (lines ~6-243) + JS (~244-1009). Long minified-style lines.
config.js             window.CONFIG: MAP_URL, MAPS[] (map dropdown), COWORK_URL, DEFAULT_KT
sw.js                 service worker: app shell + tile cache (OSM, Esri, DEM, PMTiles ranges). APP='app-v16'
manifest.webmanifest  PWA manifest; icon.svg, icon-192/512.png
lib/                  leaflet, pmtiles, jszip, jspdf, html2canvas (lazy), fonts/ (Sarabun woff2)
icons/slide-bg.jpg    SLIDE background
tools/                local scripts (make_pmtiles.bat, make_tiles.bat, make_route_kmz.py, start.bat)
KM/README.md          knowledge documentation index
KM/PROJECT_SUMMARY.md this project summary
KM/ONLINE.md          how to build maps + put them online (DataBase repo)
KM/USER_GUIDE.md      current user workflows and limitations
KM/FAQ.md             concise usage/troubleshooting answers
KM/FEEDBACK.md        feedback intake process and templates
KM/BOT_GUIDE.md       bot knowledge setup, answer rules and acceptance questions
AGENTS.md             agent rules + entry point to KM
docs/                 screenshots and previews
README.md             user guide (Thai)
```

## 3. Key code areas in index.html (search by function name)
| Area | Functions |
|---|---|
| State / save | `S` (from localStorage `routeS`), `save`, `undo`, `snap` |
| Base maps | `pmLayer`, `pickMap`, `setBase` (OSM / SAT Esri / PMTiles), `tileSrc` |
| Local maps (IMPORT MAP) | `lmInit`, `lmPick`, `lmAdd`, `lmDel`, `lmGrant` (IndexedDB `falcon2cp-maps`, URL `local:<name>`) |
| Leg math | `eff` (fly-by point), `legCalc`, `legs`, `timeRule`, `nmInt`, `drawTicks` |
| Terrain / ALT | `demTile`, `legMaxFt`, `legAlt`, `autoAlt`, `terrain`, `profile` |
| Routes | `fixTypes`, `syncEnds`, `setRoute`, `swapRoutes`, `delAlt`, `clearAll`, `revPts`, `reverseRoute` |
| Rendering | `drawRoutes` → `render(g, readOnly, other)`, `draw`, `withAlt`, `shape`, `tipSvg` |
| Editors | `editLeg`, `editBox`/`saveBox`, `editLbl`/`saveLbl`, `setKind`, `setFly`, `setCpn`, `delPt`, `insAt`, `popForm`, `closeEd` |
| SHOW toggles / sizes | `shSet`, `setSh`, `syncShow`, `setGlob`, `setLw`, `globSizes`, `pctIn`, `pctStep` |
| Coords | `ddm`, `parseCoord`, `mgrs`, `mgrsLL`, `setLL` |
| Place search / airports | `cwGet`, `cwDeg`, `apLoad`, `apDraw`, `setAirports`, `plLoad`, `plFind`, `srList`, `srGo`, `srPopup`, `srShow`, `srAdd` |
| Import / export | `importFile`, `parseCSV`, `parseXML`, `setPts`, `expAs`, `routesOut`, `exportKML`, `exportCSV` |
| SLIDE (PNG) | `openSlide`, `slMap`, `buildSlide`, `slPng`, `slShare` (fields in localStorage `slideF`) |
| Print / PDF | `prCfg`, `prPages`, `prUpd`, `buildPages`, `previewPages`, `pv*` (paper view), `pvPDF`, `pvPrint` |
| PWA update | `verCheck` (HEAD index.html, compare ETag; `#upd` bar), `cacheInfo`, `clearCache` |

### State model (`S`, saved as JSON in localStorage `routeS`)
- `S.pts` = active route points, `S.alt` = other route (primary/alternate). `setRoute` swaps them.
- Point `p`: `lat, lon, n` (name), `tf` (chosen kind PZ/LZ/CP), `fly:'by'`, `ltxt`/`lcol`/`loff` (label),
  `msc` (symbol size), per-leg overrides `ov.alt`, `ov` time, `boff` (leg box offset), `lw` (line width), `poff`/`psc`/`ph` (NAVIGATION box).
- `S.ui`: `mode`, `style` (`anf` = NAVIGATION, `cp` = แผนที่แผนสมบูรณ์), `line`/`lineAlt`, sizes `msc/bsc/lsc/lwc/tbx`,
  `sh` (SHOW flags per style), `showMain/showAlt`, `ph`.
- `S.ui.airports`: top-right Layers > AIRPORTS visibility, shared by both styles and PDF / Print / SLIDE; defaults off for old saves.
- `S.ui.editLocked`: optional map edit lock; defaults unlocked for old saves. `setEditLock`/`syncLock` update the button next to paper-view % and redraw the screen read-only.
- Before renaming a field, grep all uses; old saved data must still load (migrate, don't break).

## 4. Features (done)
- Tap map = add point. Kind auto by order: first = PZ, last = LZ, middle = CP (`fixTypes`); user can set kind
  PZ / LZ / CP หลัก / CP สำรอง / CP หลักและสำรอง. CP numbering continues main → alternate; manual CP number.
- Primary + alternate route **share PZ/LZ** (`syncEnds`); separate tables; ⇄ swap roles; solid/dashed per route.
- GS (kt) → HDG, NM (whole NM), time, ALT per leg.
  - Time rule: total = NM/GS + 5 min, rounded to :x0/:x5; extra split 1/2 to last leg, 1/2 by distance; integer minutes.
  - ALT rule: max terrain on leg (AWS Terrarium DEM z12) ceil 100 ft + 500 ft; editable.
- FLY OVER / FLY BY CPs; BACK TRACK (reverse, keeps CP numbers); UNDO; CLEAR (both routes).
- Two styles: **NAVIGATION** (AirNavFlow look, ring waypoints, LEG boxes, shared legs drawn once) and
  **แผนที่แผนสมบูรณ์** (CP plan look: PZ pink circle, CP green square, LZ yellow circle, leg boxes with triangles).
- Draggable labels, leg boxes, tables; tic marks with distance numbers (outbound black, return blue).
- Elevation profile + stats header; place search (airports + OSM names, Nominatim fallback).
- Layers (top-right map menu, AirNavFlow colors) > AIRPORTS: optional airport overlay
  (AP.txt + airfields in สนามบิน ทบ.txt; excludes units/camps/OSM).
  Tap an icon for coordinates, available elevation/frequencies and Add ROUTE. Separate from route SHOW flags.
- `apControl`: Leaflet control with native details/summary, inline SVG icon, touch/keyboard support, map-click/Escape collapse.
  Contains AIRPORTS and `showOptions` (existing SHOW inputs moved from sidebar). `fitLayers` caps scroll height to the map.
  SHOW keeps existing `S.ui.sh` values per style; paper view toggle/% controls are first in sidebar, below the search header.
- 🔓/🔒 beside paper-view % locks map editing (points, labels, LEG/DOG LEG boxes, tables and print-sheet handles).
  Map panning and zoom remain available; map-click point creation and popup Add ROUTE are blocked until unlocked. Lock state persists.
- Coordinates in DDM and MGRS. Base maps: PMTiles charts, OSM, satellite (Esri).
- Export PDF / Print: preview dialog, true scale (1:50k–1:1M), A4/A3, draggable sheets, overlap ticks, paper view %.
- Paper view supports two-finger map pinch via `pvPinch*`/`pvEndPinch`: live 10–400% display zoom, anchored at finger midpoint;
  print scale stays fixed. Map controls keep their visual size via `--pv-ui`; `fitLayers` uses physical screen height.
  Menu gestures are excluded; map dragging resumes and % is saved when the pinch ends.
- SLIDE: 16:9 Mission Overview PNG (map rendered in cp style + table template).
- PWA install, offline cache of viewed areas, auto update.
- Login gate: one shared password before the app (`#lock`, `f2cpLogin`). SHA-256 hash in `config.js` `PASS_HASH` ("" = off);
  new hash: Console `f2cpHash("pw")`. Asked on every app open (not remembered); hidden username "FalCon2CP" + password so Safari Keychain / browser password manager can save & fill (Face ID / fingerprint).
  Correct password logs in without the button. First login registers a local passkey (`f2cpPk`, WebAuthn platform); later opens ask Face ID / fingerprint at once (`f2cpBio`), if blocked, tap the screen or press เข้าสู่ระบบ with empty password (no extra button). No map tiles load before login (`f2cpLocked` in `setBase`). Not real security (public site).

## 5. Maps
- Online (only these two): `map250k.pmtiles` (JOG, 228 MB) and `map500k.pmtiles` (TPC, 65 MB) at
  `https://spidersqdn.github.io/DataBase/FalCon2CP/`. Files are **Release assets** (tag `falcon2cp-maps`) in repo
  `Spidersqdn/DataBase`; its workflow copies them into Pages. **Update:** replace asset in Release → Actions → Run workflow.
  DataBase Pages limit 1 GB (now ~660 MB used, shared with AirNavFlow).
- Local only (never online): `C:\maps\map1m` (ONC), `map2m` (JNC), `map5m` (GNC), `map50k` (TLM 1:50k) →
  opened with **📁 IMPORT MAP**. Chrome/Edge keep a file handle (no copy); Safari stores one copy in IndexedDB.
- Source: `C:\PFPS\map1\rpf\<series>` (cjga, ctpc, conc, cjnc, cgnc, ctlm50; no A.TOC).
  Convert on owner's PC: OSGeo4W Shell → `C:\PFPS\map1\make_rpf.bat <folder>` → `pmtiles.exe` (in `C:\PFPS\map1\`).
  See [ONLINE.md](ONLINE.md). Cloud agents cannot download the maps (network blocked) – conversion is done locally by owner.
- `?map=<url>` opens another PMTiles temporarily; a URL on a site not in `config.js` asks the user first (`mapOk`). `*.pmtiles` is git-ignored – never commit maps.

## 6. Place search data
`CONFIG.COWORK_URL` = `https://spidersqdn.github.io/DataBase/CoWork/` (repo DataBase, folder `CoWork/`):
`AP.txt` (airports: `ICAO|IATA|name|prov|LAT|LONG|ELEV|note`), `สนามบิน ทบ.txt` (MGRS, converted in app),
`AD.txt` (frequencies in popup), `places.json` (OSM names, built at deploy). Cached in localStorage.
To add/fix an airport: edit `CoWork/AP.txt` in DataBase repo.
`apLoad` shares airport data with search without loading places.json; caches via `cwGet` for offline reuse.
Keep separate source positions even when nearby (some are approximate). Airport pane is below route graphics.

## 7. Conventions / rules (important)
- Knowledge Markdown lives in `KM/`; keep repository `README.md` and `AGENTS.md` at the root. Update this summary when adding features or changing rules (under 200 lines).
- **Owner uses Safari (iPad/iPhone)** – test WebKit behaviour; Safari ignores `@page` margins (hence jsPDF export).
- Layout: PC sidebar fixed **390px** (same as AirNavFlow `#panel`); responsive for phone/tablet;
  phone landscape (max-height:500px) uses floating editor `#edp` instead of the side panel (`isSheet()`).
- Touch menus use `touch-action:pan-x pan-y` to stop page pinch/double-tap zoom while retaining scrolling and taps.
  `menuTouchTarget` scopes Safari gesture cancellation to menus/toolbars; do not disable viewport zoom globally or change Leaflet map gestures.
- CSS class **`.ed` is taken** (leg edit grid) – don't reuse the name.
- **Type and ALT input fields were removed** on purpose; kind is automatic by order. Don't add them back.
- UI labels: English section names (MAP, SHOW PZ CPs LZ, SHOW DOG LEGs, UNDO / BACK TRACK / CLEAR) + Thai words
  (หลัก / สำรอง, แผนที่แผนสมบูรณ์). Map font = Sarabun (TH SarabunPSK look).
- Colors: PZ `#FF66CC`, CP `#22BB33`, LZ `#FFD700`. Dark UI, gold buttons (AirNavFlow style).
- `sw.js`: bump `APP` only when `sw.js` itself changes (index.html changes reach installed apps without a bump).
  Add new lib files to `SHELL` if they must work offline.
- No build tools. Keep everything in plain files; vendor libraries into `lib/` (no CDN at runtime).
- Small focused PRs, one feature each, title in English; owner reviews and merges (owner may type "merge" on a
  Thai keyboard as "ทำพเำ").
- Git remote may show old name `falcontocp`; GitHub redirects to `Spidersqdn/FalCon2CP`.

## 8. How to test
- Local: `python -m http.server` in repo root (or `tools/start.bat`) → open http://localhost:8000.
  PMTiles needs HTTP Range (http.server is fine for viewing; online maps are on another origin with CORS).
- Headless: Playwright/Chromium works; external fetches may need the proxy. Stored file handles crash headless Chromium.
- After merge, Pages cache ~10 min: hard reload (Ctrl+Shift+R) or add `?v=N`.

## 9. Related repos
- `Spidersqdn/DataBase` – hosts maps (`FalCon2CP/`) and shared data (`CoWork/`) on GitHub Pages.
- `Spidersqdn/FLIGHT` – AirNavFlow (style reference: sidebar, place search, NAVIGATION look).

## 10. Open ideas (not started)
- A support bot can use USER_GUIDE/FAQ/FEEDBACK/BOT_GUIDE as its knowledge base. Channel, feedback storage and automation are not selected/connected yet.
- AirNavFlow could read `CoWork/AP.txt` instead of its own airport list (needs FLIGHT repo change).
- Optional APK (Capacitor) / .exe (Tauri) wrappers – reuse IMPORT MAP, no map bundling.
