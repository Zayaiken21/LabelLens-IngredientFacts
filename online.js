/* LabelLens online match: looks a product up in Open Food Facts (open data) by barcode or name,
   compares its ingredient list with what you scanned, and converts its nutrition to LabelLens fields.
   Built to stay inside the service's limits: cache, queue with spacing, timeouts, cooldown after errors. */
(() => {
  const OFF = "https://world.openfoodfacts.org";
  const GAP = { product: 6500, search: 9000, fdc: 1500 };        // service allows ~15 product reads/min and 10 searches/min per IP
  const TTL = 14 * 864e5, MAXC = 40;
  const mem = { last: { product: 0, search: 0, fdc: 0 }, cool: 0, coolF: 0, inflight: new Map(), chain: Promise.resolve() };
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ---------- cache ---------- */
  const load = () => { try { return JSON.parse(localStorage.getItem("ll_off") || "{}"); } catch { return {}; } };
  const store = c => { try { const ks = Object.keys(c).sort((a, b) => c[a].t - c[b].t); while (ks.length > MAXC) delete c[ks.shift()]; localStorage.setItem("ll_off", JSON.stringify(c)); } catch {} };
  const cget = k => { const e = load()[k]; return e && Date.now() - e.t < (e.v === null ? 864e5 : TTL) ? { v: e.v } : null; };
  const cput = (k, v) => { const c = load(); c[k] = { t: Date.now(), v }; store(c); };

  /* ---------- polite network ---------- */
  async function polite(kind, url, key) {
    const hit = cget(key); if (hit) return hit.v;
    if (mem.inflight.has(key)) return mem.inflight.get(key);
    const run = mem.chain.then(async () => {
      const ck = kind === "fdc" ? "coolF" : "cool";
      if (Date.now() < mem[ck]) throw Object.assign(new Error("cooldown"), { cool: Math.ceil((mem[ck] - Date.now()) / 1000), fdc: kind === "fdc" });
      const wait = mem.last[kind] + GAP[kind] - Date.now(); if (wait > 0) await sleep(wait);
      mem.last[kind] = Date.now();
      const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 9000);
      try {
        const res = await fetch(url, { signal: ctl.signal, headers: { Accept: "application/json" } });
        if (res.status === 404) { cput(key, null); return null; }
        if (kind === "fdc" && (res.status === 401 || res.status === 403)) throw Object.assign(new Error("key"), { detail: "the USDA key was rejected", keyBad: true });
        if (res.status === 429 || res.status === 503 || res.status >= 500) { mem[ck] = Date.now() + (kind === "fdc" ? 600000 : 90000); throw Object.assign(new Error("busy"), { busy: true, fdc: kind === "fdc" }); }
        if (!res.ok) throw Object.assign(new Error("http"), { detail: "HTTP " + res.status });
        const json = await res.json(); cput(key, json); return json;
      } catch (e) { if (e instanceof TypeError) e.detail = "the browser could not connect (offline, or the service blocked the request)"; if (e.name === "AbortError") { mem[ck] = Date.now() + 20000; throw Object.assign(new Error("timeout"), { busy: true }); } throw e; }
      finally { clearTimeout(to); }
    });
    mem.chain = run.catch(() => {});
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
  const fdcKey = () => { try { return (localStorage.getItem("ll_fdc_key") || "").trim() || "DEMO_KEY"; } catch { return "DEMO_KEY"; } };
  function fdcBudget() {                               // stay under the hourly cap: 30 (demo key) or 1000 (own key)
    const cap = fdcKey() === "DEMO_KEY" ? 24 : 900, now = Date.now();
    let l = []; try { l = JSON.parse(localStorage.getItem("ll_fdc_calls") || "[]").filter(x => now - x < 3600e3); } catch {}
    if (l.length >= cap) throw Object.assign(new Error("budget"), { busy: true, fdc: true, budget: true });
    l.push(now); try { localStorage.setItem("ll_fdc_calls", JSON.stringify(l)); } catch {}
  }
  const NUT_MAP = [["208", "energy-kcal", "KCAL"], ["204", "fat"], ["606", "saturated-fat"], ["605", "trans-fat"], ["601", "cholesterol"], ["307", "sodium"], ["205", "carbohydrates"], ["291", "fiber"],
    ["269", "sugars"], ["539", "added-sugars"], ["203", "proteins"], ["306", "potassium"], ["301", "calcium"], ["303", "iron"], ["328", "vitamin-d"], ["262", "caffeine"]];
  const UNIT = { G: 1, MG: 1e-3, UG: 1e-6, "µG": 1e-6, KCAL: 1 };
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
      servingG, nutr: n, img: "", dataType: f.dataType };
  }
  async function byNameFDC(q) {
    fdcBudget();
    const key = fdcKey(), url = `${FDC}/foods/search?api_key=${encodeURIComponent(key)}&query=${encodeURIComponent(q)}&dataType=Branded,Foundation,SR%20Legacy&pageSize=12&requireAllWords=false`;
    const j = await polite("fdc", url, "f:" + q);           // cache key excludes the API key on purpose
    return (j && j.foods ? j.foods : []).map(fromFDC).filter(p => p.name);
  }
  const words = s => String(s).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  function rank(list, q) {                              // all query words present in name+brand first, then shorter names (closer to what was typed)
    const qw = words(q);
    const sc = p => { const hay = words(p.name + " " + p.brand); const all = qw.every(w => hay.some(h => h === w || h.startsWith(w) || w.startsWith(h) && h.length > 3)); return (all ? 0 : 1000) + p.name.length; };
    return list.slice().sort((a, b) => sc(a) - sc(b));
  }
  /* name search: USDA first, Open Food Facts as backup/extra (world products). Either can fail without breaking the other. */
  async function search(q) {
    q = String(q || "").trim().replace(/[^\p{L}\p{N}\s'&.-]/gu, " ").replace(/\s+/g, " ").slice(0, 80); if (q.length < 3) throw new Error("short");
    let out = [], err = null;
    try { out = await byNameFDC(q); } catch (e) { err = e; }
    if (out.length < 3) { try { out = out.concat(await byName(q)); } catch (e) { err = err || e; } }
    const seen = new Set(); out = out.filter(p => { const k = (p.code || "") + "|" + p.name.toLowerCase() + "|" + p.brand.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
    if (!out.length && err) throw err;
    return rank(out, q).slice(0, 10);
  }
  function normalize(p) {
    return { code: p.code, name: p.product_name || "", brand: (p.brands || "").split(",")[0], qty: p.quantity || "", ing: p.ingredients_text_en || p.ingredients_text || "",
      serving: p.serving_size || "", servingG: +p.serving_quantity || 0, nutr: p.nutriments || {}, img: p.image_front_small_url || "", nova: p.nova_group, nutri: p.nutriscore_grade, src: "Open Food Facts" };
  }

  /* ---------- nutrition conversion (only fields the product really has) ---------- */
  function toNutrition(p) {
    const n = p.nutr || {}, o = {}; let basis = "100g";
    const g = (k, mult) => { const s = n[k + "_serving"], h = n[k + "_100g"]; return [s, h]; };
    const useServing = p.servingG > 0 && ["energy-kcal", "proteins", "carbohydrates", "fat"].some(k => n[k + "_serving"] != null);
    if (useServing) basis = "serving";
    const val = (k, conv) => {
      let v = useServing ? (n[k + "_serving"] != null ? n[k + "_serving"] : (n[k + "_100g"] != null ? n[k + "_100g"] * p.servingG / 100 : null)) : n[k + "_100g"];
      if (v == null || v === "" || isNaN(+v)) return null; v = +v; return conv ? conv(v) : v;
    };
    const put = (key, v) => { if (v != null) o[key] = Math.round(v * 100) / 100; };
    put("cal", val("energy-kcal")); if (o.cal == null) { const kj = val("energy-kj") ?? val("energy"); if (kj != null) put("cal", kj / 4.184); }
    put("fat", val("fat")); put("sat", val("saturated-fat")); put("trans", val("trans-fat"));
    put("chol", val("cholesterol", v => (v <= 3 ? v * 1000 : v)));
    put("sod", val("sodium", v => (v <= 40 ? v * 1000 : v))); if (o.sod == null) { const salt = val("salt"); if (salt != null) put("sod", salt * 400); }
    put("carb", val("carbohydrates")); put("fib", val("fiber")); put("sug", val("sugars")); put("add", val("added-sugars")); put("pro", val("proteins"));
    put("pot", val("potassium", v => (v <= 5 ? v * 1000 : v))); put("calc", val("calcium", v => (v <= 3 ? v * 1000 : v))); put("iron", val("iron", v => (v <= 0.1 ? v * 1000 : v)));
    put("vitd", val("vitamin-d", v => (v < 0.001 ? v * 1e6 : v))); put("caf", val("caffeine", v => (v <= 3 ? v * 1000 : v)));
    o.basis = basis; if (basis === "serving" && p.serving) o.serving = p.serving; else if (basis === "100g") o.serving = "100 g";
    o._n = Object.keys(o).filter(k => !["basis", "serving", "_n"].includes(k)).length; return o;
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
  window.LLOnline = { byBarcode, byName, search, fromFDC, rank, toNutrition, compare, validCode, ean13ok, normalizeKey: key };
})();
