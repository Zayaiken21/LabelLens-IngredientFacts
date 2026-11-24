# LabelLens — Scan. Know. Save.

Scan the back of any product, see what is really inside, and save it for later. Runs entirely in the browser, so it works on GitHub Pages with no server.

## Features
- **Scan**: take or upload a photo, drag any of the 4 corners to crop, and read it on-device with the Tesseract OCR engine (classic OCR, not generative AI). Default is the original classic prep that read labels best; other filters and a "try harder" pass are optional. A live scanner flags known ingredients as you type, and hovering or tapping any word shows its color, reason and related fact checks.
- **Color-coded results**: your label highlighted red (avoid), yellow (caution) and green (good), with filters and a tap-for-reason popup that includes how regulators around the world see each ingredient.
- **Photo studio**: 4-corner crop, then cut out the background by hand with a magic wand, auto-edges, erase/restore brush and undo. No AI, exports a transparent PNG.
- **Facts**: evidence-graded claim checker, law history timeline, how enzymes are (and are not) listed, fluoride, body and lab-test primer, herb safety, and a source list. Each entry links to government, WHO/IARC, EFSA, EUR-Lex or peer-reviewed sources.
- **Offline and fast**: service worker caching, installable on a phone.
- **Saved library**: save items with name, photo, ingredients and score. Search, sort, export and import (stored in your browser).
- **Learn tab**: searchable A–Z glossary (red, yellow, green, neutral and allergen entries), food-label smarts, living vs dead food, and a get-healthier guide. Add your own ingredients and they are used in every scan.
- **Track**: daily food diary with color quality, water/veggie/fruit counters, goals, a 7-day view and CSV export. Numbers can be hidden.
- **Change**: a 90-day life-change program with three phases, daily habit check-ins, streaks, a 90-day map, weekly reviews, if-then plans, body/energy log and milestones.

## Files
`index.html`, `styles.css`, `app.js`, `crop.js`, `cutout.js`, `facts.js`, `facts-data.js`, `facts-more.js`, `ingredients-more.js`, `sw.js`, `manifest.webmanifest`, `tracker.js`, `journey.js`, `ingredients.js` (engine and core database), `ingredients-extra.js` (more additives, neutral ingredients, allergens), `education.js` (guides).

## Publish with GitHub Pages
Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save.

## Disclaimer
General consumer information drawn from WHO, EFSA, IARC, JECFA, UK FSA, Health Canada, US FDA and national guidelines. Not medical advice. Always read allergen statements on the package.
