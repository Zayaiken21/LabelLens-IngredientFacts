# LabelLens — Scan. Know. Save.

Scan the back of any product, see what is really inside, and save it for later. Runs entirely in the browser, so it works on GitHub Pages with no server.

## Features
- **Scan**: a live camera scanner. Fit the ingredient list in the frame, it reads continuously on-device (Tesseract OCR, not generative AI), ignores anything that does not look like an ingredient list, and locks when the text is steady. A photo option uses the same reader. The Live scan panel colors each ingredient and shows the reason on hover or tap.
- **Color-coded results**: your label highlighted red (avoid), yellow (caution) and green (good), with filters and a tap-for-reason popup that includes how regulators around the world see each ingredient.
- **Photo studio**: 4-corner crop, then cut out the background by hand with a magic wand, auto-edges, erase/restore brush and undo. No AI, exports a transparent PNG.
- **Facts**: evidence-graded claim checker, law history timeline, how enzymes are (and are not) listed, fluoride, body and lab-test primer, herb safety, and a source list. Each entry links to government, WHO/IARC, EFSA, EUR-Lex or peer-reviewed sources.
- **Offline and fast**: service worker caching, installable on a phone.
- **Saved library**: save items with name, photo, ingredients and score. Search, sort, export and import (stored in your browser).
- **Learn tab**: searchable A–Z glossary (red, yellow, green, neutral and allergen entries), food-label smarts, living vs dead food, and a get-healthier guide. Add your own ingredients and they are used in every scan.
- **Track**: daily food diary with color quality, water/veggie/fruit counters, goals, a 7-day view and CSV export. Numbers can be hidden.
- **Change**: a 90-day life-change program with three phases, daily habit check-ins, streaks, a 90-day map, weekly reviews, if-then plans, body/energy log and milestones.

## Files
`index.html`, `styles.css`, `app.js`, `crop.js`, `cutout.js`, `facts.js`, `nutrition.js`, `ingredient-info.js`, `facts-data.js`, `facts-more.js`, `ingredients-more.js`, `sw.js`, `manifest.webmanifest`, `tracker.js`, `journey.js`, `ingredients.js` (engine and core database), `ingredients-extra.js` (more additives, neutral ingredients, allergens), `education.js` (guides).

## Publish with GitHub Pages
Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save.

## Disclaimer
General consumer information drawn from WHO, EFSA, IARC, JECFA, UK FSA, Health Canada, US FDA and national guidelines. Not medical advice. Always read allergen statements on the package.

## Nutrition tracking
Scan the Nutrition Facts panel (or type it in) to capture calories, fats, trans fat, cholesterol, sodium, carbs, fiber, sugars, added sugars and protein. Add servings to your diary and see daily values and weekly totals and averages in the Track tab. Nutrition rows are kept out of the ingredient scan.

## Online match
Barcodes read by the camera (or typed in) and product-name searches are matched against Open Food Facts, a free open database. The scanned ingredient list is compared with the online list (exact / close / different), typos can be corrected from it, and nutrition can be filled from it. Lookups are cached for 14 days, queued with spacing (about 6.5 s between product reads, 9 s between searches), time out after 9 s, and pause for 90 s after any busy or error response, so the service's limits are respected. The scanner works fully without it.

Name search checks USDA FoodData Central first (US branded foods plus generic foods and drinks, with ingredients and nutrition) and Open Food Facts second (world products). A free USDA key can be pasted in the Match it online card to raise the limit from about 30 to 1,000 searches an hour.
