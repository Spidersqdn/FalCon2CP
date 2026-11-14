# FalCon2CP – Project Summary (for AI agents / new contributors)

Last updated: 2026-11-14 (after PR #79). Owner: SPD (`Spidersqdn`). Owner writes Thai; reply concise, copy-paste ready.

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
sw.js                 service worker: app shell + tile cache (OSM, Esri, DEM, PMTiles ranges). APP='app-v15'
manifest.webmanifest  PWA manifest; icon.svg, icon-192/512.png
lib/                  leaflet, pmtiles, jszip, jspdf, html2canvas (lazy), fonts/ (Sarabun woff2)
icons/slide-bg.jpg    SLIDE background
tools/                local scripts (make_pmtiles.bat, make_tiles.bat, make_route_kmz.py, start.bat)
docs/ONLINE.md        how to build maps + put them online (DataBase repo)
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
| Place search | `cwGet`, `cwDeg`, `plLoad`, `plFind`, `srList`, `srGo`, `srShow`, `srAdd` |
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
- Coordinates in DDM and MGRS. Base maps: PMTiles charts, OSM, satellite (Esri).
- Export PDF / Print: preview dialog, true scale (1:50k–1:1M), A4/A3, draggable sheets, overlap ticks, paper view %.
- SLIDE: 16:9 Mission Overview PNG (map rendered in cp style + table template).
- PWA install, offline cache of viewed areas, auto update.

## 5. Maps
- Online (only these two): `map250k.pmtiles` (JOG, 228 MB) and `map500k.pmtiles` (TPC, 65 MB) at
  `https://spidersqdn.github.io/DataBase/FalCon2CP/`. Files are **Release assets** (tag `falcon2cp-maps`) in repo
  `Spidersqdn/DataBase`; its workflow copies them into Pages. **Update:** replace asset in Release → Actions → Run workflow.
  DataBase Pages limit 1 GB (now ~660 MB used, shared with AirNavFlow).
- Local only (never online): `C:\maps\map1m` (ONC), `map2m` (JNC), `map5m` (GNC), `map50k` (TLM 1:50k) →
  opened with **📁 IMPORT MAP**. Chrome/Edge keep a file handle (no copy); Safari stores one copy in IndexedDB.
- Source: `C:\PFPS\map1\rpf\<series>` (cjga, ctpc, conc, cjnc, cgnc, ctlm50; no A.TOC).
  Convert on owner's PC: OSGeo4W Shell → `C:\PFPS\map1\make_rpf.bat <folder>` → `pmtiles.exe` (in `C:\PFPS\map1\`).
  See `docs/ONLINE.md`. Cloud agents cannot download the maps (network blocked) – conversion is done locally by owner.
- `?map=<url>` opens another PMTiles temporarily. `*.pmtiles` is git-ignored – never commit maps.

## 6. Place search data
`CONFIG.COWORK_URL` = `https://spidersqdn.github.io/DataBase/CoWork/` (repo DataBase, folder `CoWork/`):
`AP.txt` (airports: `ICAO|IATA|name|prov|LAT|LONG|ELEV|note`), `สนามบิน ทบ.txt` (MGRS, converted in app),
`AD.txt` (frequencies in popup), `places.json` (OSM names, built at deploy). Cached in localStorage.
To add/fix an airport: edit `CoWork/AP.txt` in DataBase repo.

## 7. Conventions / rules (important)
- **Owner uses Safari (iPad/iPhone)** – test WebKit behaviour; Safari ignores `@page` margins (hence jsPDF export).
- Layout: PC sidebar fixed **390px** (same as AirNavFlow `#panel`); responsive for phone/tablet;
  phone landscape (max-height:500px) uses floating editor `#edp` instead of the side panel (`isSheet()`).
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
- AirNavFlow could read `CoWork/AP.txt` instead of its own airport list (needs FLIGHT repo change).
- Optional APK (Capacitor) / .exe (Tauri) wrappers – reuse IMPORT MAP, no map bundling.
