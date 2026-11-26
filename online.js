/* LabelLens online match: looks a product up in Open Food Facts (open data) by barcode or name,
   compares its ingredient list with what you scanned, and converts its nutrition to LabelLens fields.
   Built to stay inside the service's limits: cache, queue with spacing, timeouts, cooldown after errors. */
(() => {
  const OFF = "https://world.openfoodfacts.org";
  const GAP = { product: 6500, search: 3000, fdc: 400 };        // service allows ~15 product reads/min and 10 searches/min per IP
  const TTL = 14 * 864e5, MAXC = 40;
  const mem = { last: { product: 0, search: 0, fdc: 0 }, cool: 0, coolF: 0, inflight: new Map(), chains: {} };
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ---------- cache ---------- */
  const load = () => { try { return JSON.parse(localStorage.getItem("ll_off") || "{}"); } catch { return {}; } };
  const store = c => { try { const ks = Object.keys(c).sort((a, b) => c[a].t - c[b].t); while (ks.length > MAXC) delete c[ks.shift()]; localStorage.setItem("ll_off", JSON.stringify(c)); } catch {} };
  const cget = k => { const e = load()[k]; return e && Date.now() - e.t < (e.v === null ? 864e5 : TTL) ? { v: e.v } : null; };
  const cput = (k, v) => { const c = load(); c[k] = { t: Date.now(), v }; store(c); };

  /* ---------- polite network ---------- */
  async function polite(kind, url, key, tx) {
    const hit = cget(key); if (hit) return hit.v;
    if (mem.inflight.has(key)) return mem.inflight.get(key);
    const run = (mem.chains[kind] || Promise.resolve()).then(async () => {
      const ck = kind === "fdc" ? "coolF" : "cool";
      if (Date.now() < mem[ck]) throw Object.assign(new Error("cooldown"), { cool: Math.ceil((mem[ck] - Date.now()) / 1000), fdc: kind === "fdc" });
      const wait = mem.last[kind] + GAP[kind] - Date.now(); if (wait > 0) await sleep(wait);
      mem.last[kind] = Date.now();
      const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), kind === "search" ? 6000 : 9000);
      try {
        const res = await fetch(url, { signal: ctl.signal, headers: { Accept: "application/json" } });
        if (res.status === 404) { cput(key, null); return null; }
        if (kind === "fdc" && (res.status === 401 || res.status === 403)) throw Object.assign(new Error("key"), { detail: "the search key was rejected", keyBad: true });
        if (res.status === 429 || res.status === 503 || res.status >= 500) { mem[ck] = Date.now() + (kind === "fdc" ? 600000 : 90000); throw Object.assign(new Error("busy"), { busy: true, fdc: kind === "fdc" }); }
        if (!res.ok) throw Object.assign(new Error("http"), { detail: "HTTP " + res.status });
        const raw = await res.json(), json = tx ? tx(raw) : raw; cput(key, json); return json;
      } catch (e) { if (e instanceof TypeError) e.detail = "the browser could not connect (offline, or the service blocked the request)"; if (e.name === "AbortError") { mem[ck] = Date.now() + 20000; throw Object.assign(new Error("timeout"), { busy: true }); } throw e; }
      finally { clearTimeout(to); }
    });
    mem.chains[kind] = run.catch(() => {});
    mem.inflight.set(key, run); run.finally(() => mem.inflight.delete(key)).catch(() => {});
    return run;
  }
  const FIELDS = "code,product_name,brands,quantity,ingredients_text,ingredients_text_en,serving_size,serving_quantity,nutriments,image_front_small_url,nova_group,nutriscore_grade";
  const validCode = c => /^\d{8}$|^\d{12,14}$/.test(c);
  function ean13ok(c) { if (c.length !== 13 && c.length !== 12 && c.length !== 8) return false; const d = c.split("").map(Number), chk = d.pop(); let s = 0; d.reverse().forEach((x, i) => (s += x * (i % 2 === 0 ? 3 : 1))); return (10 - (s % 10)) % 10 === chk; }

  async function byBarcode(code) {
    code = String(code || "").replace(/\D/g, ""); if (!validCode(code)) throw new Error("bad code");
    const j = await polite("product", `${OFF}/api/v2/product/${code}.json?fields=${FIELDS}`, "p:" + code);
    return j && j.status !== 0 && j.product ? normalize(j.product) : null;
  }
  async function byName(q) {
    q = String(q || "").trim().toLowerCase().slice(0, 80); if (q.length < 3) throw new Error("short");
    // cgi/search.pl is the text-search endpoint that sends CORS headers, so it works from a web page
    const j = await polite("search", `${OFF}/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=6&fields=code,product_name,brands,quantity,ingredients_text,ingredients_text_en,nutriments,serving_size,serving_quantity,image_front_small_url`, "s:" + q);
    const hits = j ? (j.products || j.hits || []) : [];
    return hits.map(normalize).filter(p => p.name);
  }
  /* ---------- USDA FoodData Central (US branded foods, generic foods and drinks) ---------- */
  const FDC = "https://api.nal.usda.gov/fdc/v1";
  const fdcKey = () => (window.LL_CONFIG && String(window.LL_CONFIG.fdcKey || "").trim()) || "DEMO_KEY";   // site key comes from config.js, written at deploy time from a GitHub secret
  /* Per-device allowance: 50 name searches per rolling hour. Cached repeats are free. */
  const QCAP = 50, QKEY = "ll_search_calls";
  const qlist = () => { const now = Date.now(); try { return JSON.parse(localStorage.getItem(QKEY) || "[]").filter(x => now - x < 3600e3); } catch { return []; } };
  function quota() { const l = qlist(); return { cap: QCAP, used: l.length, left: Math.max(0, QCAP - l.length), mins: l.length ? Math.max(1, Math.ceil((l[0] + 3600e3 - Date.now()) / 60000)) : 0 }; }
  function refund() { const l = qlist(); l.pop(); try { localStorage.setItem(QKEY, JSON.stringify(l)); } catch {} }
  function spend() {
    const q = quota(); if (q.left <= 0) throw Object.assign(new Error("quota"), { quota: true, mins: q.mins });
    const l = qlist(); l.push(Date.now()); try { localStorage.setItem(QKEY, JSON.stringify(l)); } catch {}
  }
  const NUT_MAP = [["208", "energy-kcal", "KCAL"], ["204", "fat"], ["606", "saturated-fat"], ["605", "trans-fat"], ["601", "cholesterol"], ["307", "sodium"], ["205", "carbohydrates"], ["291", "fiber"],
    ["269", "sugars"], ["539", "added-sugars"], ["203", "proteins"], ["306", "potassium"], ["301", "calcium"], ["303", "iron"], ["328", "vitamin-d"], ["262", "caffeine"]];
  function fromFDC(f) {
    const n = {};
    (f.foodNutrients || []).forEach(x => {
      const num = String(x.nutrientNumber || ""), unit = String(x.unitName || "").toUpperCase(), v = +x.value; if (isNaN(v)) return;
      const m = NUT_MAP.find(r => num === r[0] || (r[0] === "269" && num.startsWith("269")));
      if (!m || (m[2] && unit !== m[2]) || (!(unit in UNIT))) return;
      if (n[m[1] + "_100g"] != null && m[0] === "269" && num !== "269.3") return;
      n[m[1] + "_100g"] = m[2] ? v : v * UNIT[unit];
    });
    const ss = +f.servingSize || 0, su = String(f.servingSizeUnit || "").toLowerCase(), servingG = ss && (su === "g" || su === "ml" || su === "grm" || su === "mlt") ? ss : 0;
    if (servingG) Object.keys(n).slice().forEach(k => { n[k.replace("_100g", "_serving")] = n[k] * servingG / 100; });
    const title = String(f.description || "").toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase());
    return { code: f.gtinUpc || "", name: title, brand: f.brandName || f.brandOwner || "", qty: "", ing: f.ingredients || "", src: "USDA",
      serving: f.householdServingFullText ? `${f.householdServingFullText}${servingG ? " (" + servingG + " " + su + ")" : ""}` : (servingG ? servingG + " " + su : ""),
      servingG, packageG: parseWeightG(f.packageWeight), pkg: f.packageWeight || "", nutr: n, img: "", dataType: f.dataType };
  }
  const words = s => String(s).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const singular = w => w.replace(/ies$/, "y").replace(/(?<=[^s])s$/, "");
  async function byNameFDC(q) {
    const key = fdcKey(), multi = words(q).length >= 2;
    const url = `${FDC}/foods/search?api_key=${encodeURIComponent(key)}&query=${encodeURIComponent(q)}&dataType=Branded,Foundation,SR%20Legacy&pageSize=50&requireAllWords=${multi}`;
    const list = await polite("fdc", url, "f:" + q, j => (j && j.foods ? j.foods : []).map(fromFDC).filter(p => p.name));   // cache the slim list, not the raw payload
    return list || [];
  }
  /* relevance tiers: 0 exact food name, 1 starts with it, 2 first word is it, 3 contains every word, 4 other */
  function tier(p, qw, qn) {
    const primary = words(p.name.split(",")[0]).map(singular).join(" "), all = words(p.name + " " + p.brand).map(singular);
    if (primary === qn) return 0;
    if (primary.startsWith(qn)) return 1;
    if (qw.length === 1 && primary.split(" ")[0] === qw[0]) return 2;
    if (qw.every(w => all.includes(w))) return 3;
    return 4;
  }
  function rank(list, q) {
    const qw = words(q).map(singular), qn = qw.join(" ");
    const gen = p => (p.dataType === "Foundation" || p.dataType === "SR Legacy" ? 0 : 1);
    const scored = list.map(p => ({ p, t: tier(p, qw, qn) })).sort((a, b) => a.t - b.t || gen(a.p) - gen(b.p) || a.p.name.length - b.p.name.length);
    const good = scored.filter(x => x.t < 4);
    return (good.length ? good : scored).map(x => Object.assign(x.p, { _tier: x.t }));
  }
  /* group the same product sold in different sizes/packages */
  const gkey = p => words(p.name).map(singular).join(" ") + "|" + words(p.brand).join(" ");
  function group(list) {
    const m = new Map(); list.forEach(p => { const k = gkey(p); if (!m.has(k)) m.set(k, []); m.get(k).push(p); });
    return [...m.values()].map(v => ({ main: v[0], variants: v }));
  }
  function sizeLabel(p) { return [p.pkg || p.qty || "", p.serving ? "serving " + p.serving : ""].filter(Boolean).join(" · ") || (p.code ? "barcode " + p.code : "size not listed"); }
  /* name search: USDA first, Open Food Facts as backup/extra (world products). Either can fail without breaking the other. */
  async function search(q) {
    q = String(q || "").trim().replace(/[^\p{L}\p{N}\s'&.-]/gu, " ").replace(/\s+/g, " ").slice(0, 80); if (q.length < 3) throw new Error("short");
    const qw = words(q).map(singular), qn = qw.join(" "), errs = {};
    let out = [], spent = false;
    if (!cget("f:" + q)) { spend(); spent = true; }
    const note = (who, e) => { errs[who] = e; };
    try { out = await byNameFDC(q); } catch (e) { note("USDA", e); }
    if (out.filter(p => tier(p, qw, qn) < 3).length < 3) { try { out = out.concat(await byName(q)); } catch (e) { note("Open Food Facts", e); } }
    const seen = new Set(); out = out.filter(p => { const k = (p.code || "") + "|" + p.name.toLowerCase() + "|" + p.brand.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
    if (!out.length && Object.keys(errs).length) {
      if (spent) refund();                                          // a search that could not run does not use up the allowance
      const first = Object.values(errs).find(e => e.cool || e.busy || e.keyBad) || Object.values(errs)[0];
      const why = Object.entries(errs).map(([k, e]) => k + ": " + (e.detail || (e.cool ? "cooling down " + e.cool + "s" : e.busy ? "busy or rate limited" : e.message || "failed"))).join("; ");
      throw Object.assign(first, { why });
    }
    return rank(out, q).slice(0, 40);
  }
  function normalize(p) {
    return { code: p.code, name: p.product_name || "", brand: (p.brands || "").split(",")[0], qty: p.quantity || "", ing: p.ingredients_text_en || p.ingredients_text || "",
      serving: p.serving_size || "", servingG: +p.serving_quantity || parseWeightG(p.serving_size), packageG: parseWeightG(p.quantity), nutr: p.nutriments || {}, img: p.image_front_small_url || "", nova: p.nova_group, nutri: p.nutriscore_grade, src: "Open Food Facts" };
  }

  /* grams (or ml) from text like "13.5 oz/382 g", "500 g", "1 L", "6 x 330 ml", "12 fl oz" */
  function parseWeightG(s) {
    s = String(s || "").toLowerCase().replace(/,/g, "."); if (!s) return 0;
    const g = s.match(/(\d+(?:\.\d+)?)\s*(?:g|gr|grams?|ml)\b/); if (g) { const mult = s.match(/(\d+)\s*[x×]\s*\d/); return +g[1] * (mult ? +mult[1] : 1); }
    const kg = s.match(/(\d+(?:\.\d+)?)\s*kg\b/); if (kg) return +kg[1] * 1000;
    const l = s.match(/(\d+(?:\.\d+)?)\s*(?:l|liters?|litres?)\b/); if (l) return +l[1] * 1000;
    const floz = s.match(/(\d+(?:\.\d+)?)\s*fl\.?\s*oz/); if (floz) return +floz[1] * 29.57;
    const gal = s.match(/(\d+(?:\.\d+)?)\s*(?:gal|gallons?)\b/); if (gal) return +gal[1] * 3785;
    const qt = s.match(/(\d+(?:\.\d+)?)\s*(?:qt|quarts?)\b/); if (qt) return +qt[1] * 946;
    const pt = s.match(/(\d+(?:\.\d+)?)\s*(?:pt|pints?)\b/); if (pt) return +pt[1] * 473;
    const oz = s.match(/(\d+(?:\.\d+)?)\s*oz\b/); if (oz) return +oz[1] * 28.35;
    const lb = s.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|pounds?)\b/); if (lb) return +lb[1] * 453.6;
    return 0;
  }

  /* ---------- nutrition conversion (only fields the product really has) ---------- */
  const BASES = p => ["serving", "100g", "package"].filter(b => b === "100g" || (b === "serving" && p.servingG > 0) || (b === "package" && p.packageG > 0));
  function toNutrition(p, want) {
    const n = p.nutr || {}, o = {}, bases = BASES(p);
    const basis = want && bases.includes(want) ? want : (bases.includes("serving") ? "serving" : "100g");
    const scale = basis === "serving" ? p.servingG / 100 : basis === "package" ? p.packageG / 100 : 1;
    const per100 = k => { if (n[k + "_100g"] != null && n[k + "_100g"] !== "" && !isNaN(+n[k + "_100g"])) return +n[k + "_100g"]; const s = n[k + "_serving"]; return s != null && s !== "" && p.servingG > 0 && !isNaN(+s) ? +s * 100 / p.servingG : null; };
    const val = (k, conv) => { let v = per100(k); if (v == null) return null; if (conv) v = conv(v); return v * scale; };
    const put = (key, v) => { if (v != null && isFinite(v)) o[key] = Math.round(v * 100) / 100; };
    put("cal", val("energy-kcal")); if (o.cal == null) { const kj = val("energy-kj") ?? val("energy"); if (kj != null) put("cal", kj / 4.184); }
    put("fat", val("fat")); put("sat", val("saturated-fat")); put("trans", val("trans-fat"));
    put("chol", val("cholesterol", v => (v <= 3 ? v * 1000 : v)));
    put("sod", val("sodium", v => (v <= 40 ? v * 1000 : v))); if (o.sod == null) { const salt = val("salt"); if (salt != null) put("sod", salt * 400); }
    put("carb", val("carbohydrates")); put("fib", val("fiber")); put("sug", val("sugars")); put("add", val("added-sugars")); put("pro", val("proteins"));
    put("pot", val("potassium", v => (v <= 5 ? v * 1000 : v))); put("calc", val("calcium", v => (v <= 3 ? v * 1000 : v))); put("iron", val("iron", v => (v <= 0.1 ? v * 1000 : v)));
    put("vitd", val("vitamin-d", v => (v < 0.001 ? v * 1e6 : v))); put("caf", val("caffeine", v => (v <= 3 ? v * 1000 : v)));
    o.basis = basis === "100g" ? "100g" : "serving"; o.which = basis; o.bases = bases;
    o.serving = basis === "serving" ? (p.serving || p.servingG + " g") : basis === "package" ? "whole package (" + Math.round(p.packageG) + " g)" : "100 g";
    o._n = Object.keys(o).filter(k => !["basis", "serving", "_n", "which", "bases"].includes(k)).length; return o;
  }

  /* ---------- ingredient comparison ---------- */
  const key = s => String(s).toLowerCase().replace(/\(.*?\)|\[.*?\]/g, " ").replace(/[\d.,%]+/g, " ").replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
  function lev(a, b) { const m = a.length, n = b.length; if (!m) return n; if (!n) return m; let p = Array.from({ length: n + 1 }, (_, i) => i); for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; } return p[n]; }
  const stem = w => w.replace(/s$/, "");
  function sim(a, b) {
    if (a === b) return 1;
    const A = a.split(" ").map(stem).filter(Boolean), B = b.split(" ").map(stem).filter(Boolean), [sh, lg] = A.length <= B.length ? [A, B] : [B, A];
    if (sh.length && sh.every(w => w.length >= 4 && lg.includes(w))) return 0.88;   // "cocoa" inside "fat-reduced cocoa"
    return 1 - lev(a, b) / Math.max(a.length, b.length, 1);
  }
  const items = text => { const E = window.IngredientEngine; return (E ? E.splitTop(E.clean(text)) : String(text).split(",")).map(s => s.trim()).filter(Boolean); };
  /* compare scanned vs online lists; returns match stats and a corrected list */
  function compare(scanText, onlineText) {
    const S = items(scanText), O = items(onlineText); if (!S.length || !O.length) return null;
    const ok = O.map(key), used = new Set(); let matched = 0; const fixed = [], unmatched = [];
    S.forEach(s => {
      const ks = key(s); let best = -1, bs = 0;
      ok.forEach((k, i) => { if (!k || !ks) return; const v = sim(ks, k); if (v > bs) { bs = v; best = i; } });
      if (best >= 0 && bs >= 0.8) { matched++; used.add(best); fixed.push(bs < 0.88 ? O[best] : s); } else { unmatched.push(s); fixed.push(s); }
    });
    const missing = O.filter((_, i) => !used.has(i));
    const precision = matched / S.length, coverage = matched / O.length;
    const score = Math.round((precision * 0.5 + coverage * 0.5) * 100);
    // order check: matched items should appear in the same order
    return { matched, scanCount: S.length, onlineCount: O.length, unmatched, missing, score, corrected: fixed.join(", "),
      verdict: precision >= 0.9 && coverage >= 0.85 ? "exact" : precision >= 0.6 && coverage >= 0.5 ? "close" : "different" };
  }
  window.LLOnline = { quota, byBarcode, byName, search, fromFDC, rank, group, sizeLabel, bases: BASES, parseWeightG, tier, toNutrition, compare, validCode, ean13ok, normalizeKey: key };
})();
