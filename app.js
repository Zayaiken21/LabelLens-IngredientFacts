/* LabelLens app logic — runs 100% in the browser (GitHub Pages friendly). */
(() => {
  const $ = id => document.getElementById(id);
  const E = window.IngredientEngine;

  /* ---------- helpers ---------- */
  function toast(msg) {
    const t = $("toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), 2400);
  }
  function showTab(name) {
    document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
    document.querySelectorAll(".panel").forEach(p => p.classList.toggle("active", p.id === "tab-" + name));
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (name === "library") renderLibrary();
    if (window.LL && window.LL.onTab) window.LL.onTab(name);
  }
  document.querySelectorAll(".tab").forEach(b => b.addEventListener("click", () => showTab(b.dataset.tab)));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const blobToDataURL = b => new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); });
  const dataURLToBlob = async u => (await fetch(u)).blob();
  const canvasToBlob = (c, type = "image/png", q) => new Promise(r => c.toBlob(r, type, q));

  /* ---------- IndexedDB ---------- */
  const DB = {
    db: null,
    open() {
      return new Promise((res, rej) => {
        const req = indexedDB.open("labellens", 1);
        req.onupgradeneeded = () => req.result.createObjectStore("items", { keyPath: "id" });
        req.onsuccess = () => { DB.db = req.result; res(); };
        req.onerror = () => rej(req.error);
      });
    },
    tx(mode) { return DB.db.transaction("items", mode).objectStore("items"); },
    all() { return new Promise(r => { const q = DB.tx("readonly").getAll(); q.onsuccess = () => r(q.result || []); }); },
    put(item) { return new Promise((r, j) => { const q = DB.tx("readwrite").put(item); q.onsuccess = () => r(); q.onerror = () => j(q.error); }); },
    del(id) { return new Promise(r => { const q = DB.tx("readwrite").delete(id); q.onsuccess = () => r(); }); }
  };

  /* ---------- state ---------- */
  let current = null;       // latest analysis
  let currentPhoto = null;  // Blob for the item being saved
  let editingId = null;     // id when re-saving an existing item
  let filter = "red";

  /* =====================================================
     SCAN: pick photo -> crop -> OCR
  ===================================================== */
  let qc = null, scanBusy = false;
  const anim = { cur: 0, tgt: 0, raf: 0 };
  function setBar(barEl, pct) {           // eased, always-moving progress
    anim.tgt = Math.max(anim.tgt, pct);
    if (anim.raf) return;
    const tick = () => {
      anim.cur += (anim.tgt - anim.cur) * 0.14 + 0.05;
      if (anim.cur > anim.tgt) anim.cur = anim.tgt;
      barEl.style.width = anim.cur.toFixed(1) + "%";
      anim.raf = Math.abs(anim.tgt - anim.cur) > 0.1 || scanBusy ? requestAnimationFrame(tick) : 0;
    };
    anim.raf = requestAnimationFrame(tick);
  }

  $("scanFile").addEventListener("change", async e => {
    const f = e.target.files[0]; if (!f) return;
    if (!qc) qc = new LLCrop.QuadCrop($("scanCanvas"));
    $("scanCropWrap").hidden = false; $("scanTools").hidden = false; $("scanPrevWrap").hidden = true;
    try { await qc.load(f); } catch (err) { return toast("Could not open that image"); }
    $("scanRunBtn").disabled = false;
    toast("Drag the green corners onto the ingredient list");
  });
  function setPhotoVisible(v) {
    $("scanCropWrap").hidden = !v; $("scanTools").hidden = !v; $("scanEditPhoto").hidden = v || !(qc && qc.src);
    if (v && qc) { qc.layout(); qc.render(); }
  }
  $("scanEditPhoto").addEventListener("click", () => setPhotoVisible(true));
  $("scanRotL").addEventListener("click", () => qc && qc.rotate(-1));
  $("scanRotR").addEventListener("click", () => qc && qc.rotate(1));
  $("scanReset").addEventListener("click", () => qc && qc.resetQuad());
  $("scanTilt").addEventListener("input", e => { $("scanTiltV").textContent = e.target.value + "°"; qc && qc.setTilt(e.target.value); });
  $("scanBoost").addEventListener("input", e => { $("scanBoostV").textContent = e.target.value; });
  const scanOpts = () => ({ filter: $("scanFilter").value, boost: +$("scanBoost").value });
  $("scanPreview").addEventListener("click", () => {
    if (!qc || !qc.src) return;
    const c = prepFor($("scanFilter").value), sm = document.createElement("canvas"), k = Math.min(1, 900 / c.width);
    sm.width = Math.round(c.width * k); sm.height = Math.round(c.height * k); sm.getContext("2d").drawImage(c, 0, 0, sm.width, sm.height);
    $("scanPrevImg").src = sm.toDataURL("image/jpeg", 0.8); $("scanPrevWrap").hidden = false;
  });

  /* vocabulary correction: snap near-miss words to known ingredient words (Levenshtein, conservative) */
  let vocab = null;
  function buildVocab() {
    const set = new Set();
    const add = t => String(t || "").toLowerCase().split(/[^a-z0-9]+/).forEach(w => { if (w.length >= 5) set.add(w); });
    (window.INGREDIENT_DB || []).forEach(e => { add(e.name); (e.match || []).forEach(add); });
    "ingredients contains flavor flavors natural artificial preservative preservatives vitamin enriched flour sugar water salt oil palm soybean cornstarch syrup extract powder starch protein concentrate lecithin citric ascorbic acid sodium potassium calcium phosphate sulfate carbonate hydroxide monoglycerides diglycerides distilled vinegar seasoning spices modified wheat niacin riboflavin thiamine folic cellulose gluten dextrose maltodextrin glycerin".split(" ").forEach(add);
    return [...set];
  }
  function lev(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i]; let rowMin = i;
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (cur[j] < rowMin) rowMin = cur[j];
      }
      if (rowMin > max) return max + 1; prev = cur;
    }
    return prev[b.length];
  }
  function correctWords(text) {
    if (!vocab) vocab = buildVocab();
    const known = new Set(vocab);
    return text.replace(/[A-Za-z]{5,}/g, w => {
      const lw = w.toLowerCase(); if (known.has(lw)) return w;
      const max = lw.length >= 9 ? 2 : 1; let best = null, bd = max + 1, tie = false;
      for (const v of vocab) { const d = lev(lw, v, max); if (d < bd) { bd = d; best = v; tie = false; } else if (d === bd && d <= max) tie = true; }
      if (!best || tie || bd > max) return w;
      return w[0] === w[0].toUpperCase() ? best[0].toUpperCase() + best.slice(1) : best;
    });
  }

  function prepFor(m) {
    return m === "classic"
      ? classicPrep(qc.crop({ filter: "original", minLong: 0, maxDim: 2400 }))
      : qc.crop({ filter: m, boost: +$("scanBoost").value });
  }
  /* The ORIGINAL prep: grayscale + contrast, upscale small crops. Same as the first version. */
  function classicPrep(canvas) {
    const scale = canvas.width < 1400 ? 1400 / canvas.width : 1;
    const out = document.createElement("canvas");
    out.width = Math.round(canvas.width * scale); out.height = Math.round(canvas.height * scale);
    const ctx = out.getContext("2d");
    ctx.filter = "grayscale(1) contrast(1.35)";
    ctx.drawImage(canvas, 0, 0, out.width, out.height);
    return out;
  }
  const readCanvas = (canvas, st, bar, lo, hi) => Tesseract.recognize(canvas, "eng", {
    logger: m => {
      if (m.status) st.textContent = m.status.replace(/_/g, " ");
      if (typeof m.progress === "number") setBar(bar, lo + m.progress * (hi - lo));
    }
  });

  $("scanRunBtn").addEventListener("click", async () => {
    if (!qc || !qc.src || scanBusy) return;
    if (!window.Tesseract) return toast("OCR engine failed to load. Check your connection.");
    scanBusy = true; const btn = $("scanRunBtn"); btn.disabled = true;
    const prog = $("scanProgress"), bar = $("scanBar"), st = $("scanStatus");
    anim.cur = 0; anim.tgt = 0; prog.hidden = false; prog.classList.add("scanning"); $("liveCard").classList.add("scanning"); $("liveState").textContent = "Reading…"; bar.style.width = "0%";
    st.textContent = "Preparing image…"; setBar(bar, 5);
    try {
      await new Promise(r => setTimeout(r, 30));
      const mode = $("scanFilter").value, hard = $("scanHard").checked;
      const prep = prepFor;
      let { data } = await readCanvas(prep(mode), st, bar, 8, hard ? 55 : 98);
      if (hard) {
        st.textContent = "Second look…";
        const alt = await readCanvas(prep(mode === "adaptive" ? "classic" : "adaptive"), st, bar, 55, 96);
        if (alt.data.confidence > data.confidence) data = alt.data;
      }
      let text = cleanOCR(data.text);
      if (hard) text = correctWords(text);
      liveReveal = true; $("ingText").value = text; $("ingText").dispatchEvent(new Event("input"));
      if (text) { setPhotoVisible(false); $("liveCard").scrollIntoView({ behavior: "smooth", block: "start" }); }
      setBar(bar, 100);
      toast(text ? "Text read. Check it, then Analyze" : "No text found. Tighten the corners or try a different filter.");
    } catch (err) {
      console.error(err); toast("Could not read the image");
    } finally {
      scanBusy = false; btn.disabled = false; prog.classList.remove("scanning"); $("liveCard").classList.remove("scanning"); setTimeout(() => { prog.hidden = true; bar.style.width = "0%"; }, 900);
    }
  });

  function cleanOCR(t) {
    return (t || "")
      .replace(/-\n(?=[a-z])/g, "")
      .replace(/\n+/g, " ")
      .replace(/[|_~`]+/g, " ")
      .replace(/\s{2,}/g, " ")
      .replace(/\s+,/g, ",")
            .trim();
  }

  $("pasteBtn").addEventListener("click", async () => {
    try { $("ingText").value = await navigator.clipboard.readText(); toast("Pasted"); }
    catch { toast("Long-press the box and choose Paste"); $("ingText").focus(); }
  });
  $("clearBtn").addEventListener("click", () => { $("ingText").value = ""; });
  $("analyzeBtn").addEventListener("click", () => {
    const text = $("ingText").value.trim();
    if (!text) return toast("Add some ingredients first");
    runAnalysis(text);
  });

  /* =====================================================
     RESULTS
  ===================================================== */
  function runAnalysis(text) {
    current = { text, ...E.analyze(text) };
    if (!current.tokens.length) return toast("Could not find any ingredients");
    renderResults();
    showTab("results");
  }

  function scoreInfo(cur) {
    const r = cur.redList.length, y = cur.yellowList.length, g = cur.goodList.length, n = cur.tokens.length, s = cur.score;
    const plural = (k, w) => k + " " + w + (k === 1 ? "" : "s");
    if (!r && !y) return { c: "var(--good)", l: g ? "Clean label" : "Nothing flagged",
      sub: `We checked ${plural(n, "ingredient")} and none are on our watch list${g ? `. ${plural(g, "good ingredient")} stood out` : ""}. Ingredients we do not know yet stay gray.` };
    if (s >= 70) return { c: "var(--good)", l: "Mostly fine", sub: `${plural(r + y, "ingredient")} worth a look out of ${n}, none serious. Details are below.` };
    if (s >= 45) return { c: "var(--warn)", l: "Some things to watch", sub: `${r ? plural(r, "ingredient") + " to avoid and " : ""}${y + " to watch"} out of ${n}. Open each one below to see why.` };
    return { c: "var(--bad)", l: "Heavily flagged", sub: `${plural(r, "ingredient")} to avoid and ${y + " to watch"} out of ${n}. This looks like a highly processed product.` };
  }
  const firstSentence = t => { const m = String(t || "").match(/^.*?[.!?](\s|$)/); return (m ? m[0] : t || "").trim(); };

  function renderStats() {
    const c = current, n = c.tokens.length;
    const cells = [["red", c.redList.length, "To avoid"], ["yellow", c.yellowList.length, "To watch"], ["green", c.goodList.length, "Good"], ["gray", Math.max(0, n - c.watchList.length - c.goodList.length), "Neutral / unknown"]];
    $("statGrid").innerHTML = cells.map(([k, v, l]) => `<div class="stat ${k}"><b>${v}</b><span>${l}</span></div>`).join("");
    const top = c.redList.concat(c.yellowList).slice(0, 3), box = $("topConcerns");
    box.hidden = !top.length; $("topList").innerHTML = "";
    top.forEach(x => {
      const b = document.createElement("button"); b.className = "toprow " + x.entry.color;
      b.innerHTML = `<span class="dotc"></span><span><b>${esc(x.entry.name)}</b><small>${esc(firstSentence(x.entry.reason))}</small></span><i>›</i>`;
      b.addEventListener("click", () => openReason(x)); $("topList").appendChild(b);
    });
  }

  function renderResults() {
    $("emptyResults").hidden = true; $("resultsBody").hidden = false;
    const s = scoreInfo(current);
    const ring = $("scoreRing");
    ring.style.setProperty("--p", current.score); ring.style.setProperty("--c", s.c);
    $("scoreNum").textContent = current.score;
    $("scoreLabel").textContent = s.l; $("scoreSub").textContent = s.sub;
    $("redN").textContent = current.redList.length;
    $("yellowN").textContent = current.yellowList.length;
    $("goodN").textContent = current.goodList.length;
    $("allN").textContent = current.watchList.length + current.goodList.length;
    renderStats();
    renderHighlight();
    $("otherN").textContent = current.unmatched.length;
    const ol = $("otherList"); ol.innerHTML = "";
    if (!current.unmatched.length) ol.textContent = "None";
    else {
      const hint = document.createElement("p"); hint.className = "small"; hint.textContent = "Tap one to teach LabelLens what it is."; ol.appendChild(hint);
      current.unmatched.forEach(u => {
        const b = document.createElement("button"); b.className = "hl plain tap"; b.textContent = u;
        b.addEventListener("click", () => openAdd(u)); ol.appendChild(b);
      });
    }
    $("itemName").value = $("itemName").value || "";
    $("saveHint").textContent = currentPhoto ? "✔ Product photo attached" : "Tip: add a photo with a transparent background so you can recognize it later.";
    renderChips();
  }

  /* ---------- hover / tap scanner ---------- */
  const RANK = { red: 3, yellow: 2, green: 1, neutral: 0.5 };
  const best = text => E.matches(text).sort((a, c) => (RANK[c.color] || 0) - (RANK[a.color] || 0))[0];
  function claimsFor(entry) {
    const F = window.FACTS; if (!F || !entry) return [];
    const keys = entry.match.concat([entry.name]).map(k => k.toLowerCase().trim()).filter(k => k.length >= 5);
    return F.claims.filter(c => { const q = c.q.toLowerCase(); return keys.some(k => q.includes(k)); });
  }
  const TAGS = { red: "🔴 Avoid", yellow: "🟡 Caution", green: "🟢 Good", neutral: "⚪ Neutral" };
  const tip = document.createElement("div"); tip.id = "hoverTip"; tip.className = "hovertip"; tip.hidden = true; document.body.appendChild(tip);
  let tipTimer = 0;
  function showTip(el, text, pieceText) {
    const hit = best(text) || (pieceText && best(pieceText));
    let html;
    if (!hit) html = `<b>${esc(text)}</b><div class="tt-sub">Not in our list yet. Tap it to look in the glossary, or add it under Learn.</div>`;
    else {
      const claims = claimsFor(hit).map(c => `<div class="tt-claim">⚖️ ${esc(F_VERDICT(c))}: ${esc(c.q)}</div>`).join("");
      html = `<div class="tt-head ${hit.color}"><b>${esc(hit.name)}</b> <span>${TAGS[hit.color] || ""}${hit.allergen ? " · allergen" : ""}</span></div>
        <div class="tt-body">${esc(hit.reason.length > 190 ? hit.reason.slice(0, 187) + "…" : hit.reason)}</div>${claims}<div class="tt-sub">Tap for the full reason</div>`;
    }
    tip.innerHTML = html; tip.hidden = false;
    const r = el.getBoundingClientRect(), w = Math.min(300, innerWidth - 16);
    tip.style.width = w + "px";
    let x = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), innerWidth - w - 8), y = r.bottom + 8;
    if (y + tip.offsetHeight > innerHeight - 8) y = Math.max(8, r.top - tip.offsetHeight - 8);
    tip.style.left = x + "px"; tip.style.top = y + "px";
    clearTimeout(tipTimer);
  }
  const F_VERDICT = c => (window.FACTS && window.FACTS.verdicts[c.v] ? window.FACTS.verdicts[c.v][0] : "Fact check");
  const hideTip = () => { tip.hidden = true; };
  function bindTip(el, text, pieceText) {
    el.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") showTip(el, text, pieceText); });
    el.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") hideTip(); });
    el.addEventListener("focus", () => showTip(el, text, pieceText));
    el.addEventListener("blur", hideTip);
    el.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") { showTip(el, text, pieceText); clearTimeout(tipTimer); tipTimer = setTimeout(hideTip, 3500); } });
  }
  document.addEventListener("scroll", hideTip, true);

  /* color-coded, word-hoverable text (used by Results and the Live scan) */
  function fillHL(box, text, reveal) {
    box.innerHTML = ""; let n = 0;
    E.highlight(text).forEach(p => {
      const b = document.createElement("button");
      b.className = "hl " + p.color;
      p.text.split(/(\s+)/).forEach(w => {
        if (!w.trim()) { b.appendChild(document.createTextNode(w)); return; }
        const sp = document.createElement("span"); sp.className = "w"; sp.textContent = w;
        if (reveal) { sp.classList.add("rv"); sp.style.setProperty("--i", Math.min(n++, 90)); }
        const clean = w.replace(/[^A-Za-z0-9\- ]/g, "");
        if (clean.length >= 3) bindTip(sp, clean, p.text);
        b.appendChild(sp);
      });
      const hit = p.color !== "plain" ? best(p.text) : null;
      b.addEventListener("click", () => { hideTip(); if (hit) openReason({ entry: hit, found: [p.text] }); else openGlossary(p.text); });
      box.appendChild(b);
    });
  }
  function renderHighlight() { fillHL($("highlightBox"), current.text); }

  /* live scanner under the text box: flags known ingredients as you type or scan */
  let liveT = 0, liveReveal = false;
  function liveScan() {
    const box = $("liveScan"), txt = $("ingText").value.trim(), lt = $("liveText"), st = $("liveState");
    if (!txt) { box.innerHTML = ""; lt.innerHTML = '<p class="muted">Read a photo or paste a list below. Each ingredient lights up here: red to avoid, yellow to watch, green good. Hover or tap a word for the reason.</p>'; st.textContent = "Waiting for text"; return; }
    fillHL(lt, txt, liveReveal); liveReveal = false;
    const pieces = E.highlight(txt), cnt = { red: 0, yellow: 0, green: 0 };
    const seen = new Set(), chips = [];
    pieces.forEach(p => {
      if (p.color in cnt) cnt[p.color]++;
      const hit = p.color in cnt ? best(p.text) : null; if (!hit || seen.has(hit.name)) return; seen.add(hit.name); chips.push({ p, hit });
    });
    chips.sort((a, c) => RANK[c.hit.color] - RANK[a.hit.color]);
    st.textContent = `${pieces.length} ingredients · ${cnt.red} avoid · ${cnt.yellow} watch · ${cnt.green} good`;
    box.innerHTML = chips.length ? '<p class="muted small">Flagged in this list:</p>' : '<p class="muted small">Nothing in our list was flagged.</p>';
    const row = document.createElement("div"); row.className = "chips";
    chips.slice(0, 40).forEach(({ p, hit }) => {
      const b = document.createElement("button"); b.className = "chip " + hit.color;
      b.innerHTML = `${dotFor(hit)}${esc(hit.name)}<small>${esc(p.text.slice(0, 40))}</small>`;
      bindTip(b, p.text, p.text);
      b.addEventListener("click", () => { hideTip(); openReason({ entry: hit, found: [p.text] }); });
      row.appendChild(b);
    });
    box.appendChild(row);
  }
  $("ingText").addEventListener("input", () => { clearTimeout(liveT); liveT = setTimeout(liveScan, 250); });
  setTimeout(liveScan, 0);

  const dotFor = e => e.allergen ? "⚠️ " : ({ green: "🟢 ", red: "🔴 ", yellow: "🟡 ", neutral: "⚪ " }[e.color] || "");
  const EMPTY_MSG = { red: "🎉 Nothing to avoid in this list.", yellow: "Nothing to watch in this list.", good: "No standout healthy ingredients recognized.", all: "Nothing flagged in our list." };
  function renderChips() {
    document.querySelectorAll("#tab-results .filter").forEach(b => b.classList.toggle("active", b.dataset.f === filter));
    const list = $("chipList"); list.innerHTML = "";
    let items = [];
    if (filter === "red" || filter === "all") items = items.concat(current.redList);
    if (filter === "yellow" || filter === "all") items = items.concat(current.yellowList);
    if (filter === "good" || filter === "all") items = items.concat(current.goodList);
    if (filter === "all") items = items.concat(current.neutralList);
    if (!items.length) {
      list.innerHTML = `<p class="muted">${EMPTY_MSG[filter]}</p>`;
      return;
    }
    items.forEach(x => {
      const b = document.createElement("button");
      b.className = "chip " + x.entry.color;
      b.innerHTML = `${dotFor(x.entry)}${esc(x.entry.name)}<small>${esc(x.found[0])}</small>`;
      b.addEventListener("click", () => openReason(x));
      list.appendChild(b);
    });
  }
  document.querySelectorAll("#tab-results .filter").forEach(b => b.addEventListener("click", () => { filter = b.dataset.f; if (current) renderChips(); }));

  let modalEntry = null;
  function openReason(x) {
    const tagText = { red: "🔴 Avoid", yellow: "🟡 Caution", green: "🟢 Good", neutral: "⚪ Neutral" };
    modalEntry = x.entry;
    const tag = $("modalTag");
    tag.className = "pill " + x.entry.color;
    tag.textContent = x.entry.allergen ? "⚠️ Allergen" : tagText[x.entry.color];
    $("modalTitle").textContent = x.entry.name;
    $("modalReason").textContent = x.entry.reason;
    $("modalWorldBox").hidden = !x.entry.world;
    $("modalWorld").textContent = x.entry.world || "";
    $("modalFound").textContent = x.found && x.found.length ? "Found on this label as: " + [...new Set(x.found)].join(", ") : "";
    $("modal").hidden = false;
  }
  $("modalLearn").addEventListener("click", () => { $("modal").hidden = true; if (modalEntry) openGlossary(modalEntry.name); });
  $("modalClose").addEventListener("click", () => ($("modal").hidden = true));
  $("modal").addEventListener("click", e => { if (e.target.id === "modal") $("modal").hidden = true; });

  /* =====================================================
     PHOTO STUDIO: crop -> remove background
  ===================================================== */
  let studioQC = null, cut = null, studioBlob = null;
  $("studioFile").addEventListener("change", async e => {
    const f = e.target.files[0]; if (!f) return;
    if (!studioQC) studioQC = new LLCrop.QuadCrop($("studioCanvas"));
    studioBlob = null; $("studioActions").hidden = true; $("cutTools").hidden = true;
    $("studioCropWrap").hidden = false;
    try { await studioQC.load(f); } catch { return toast("Could not open that image"); }
    $("studioCropBtn").disabled = false;
  });
  $("studioCropBtn").addEventListener("click", () => {
    if (!studioQC || !studioQC.src) return;
    if (!cut) {
      cut = new LLCutout($("cutCanvas"));
      document.querySelectorAll("[data-cm]").forEach(b => b.addEventListener("click", () => {
        cut.mode = b.dataset.cm; document.querySelectorAll("[data-cm]").forEach(x => x.classList.toggle("primary", x === b));
      }));
      $("cutTol").addEventListener("input", e => { cut.tol = +e.target.value; $("cutTolV").textContent = e.target.value; });
      $("cutSize").addEventListener("input", e => { cut.size = +e.target.value; $("cutSizeV").textContent = e.target.value; });
      $("cutAuto").addEventListener("click", () => { cut.autoEdges(); publishCut(); });
      $("cutUndo").addEventListener("click", () => { cut.undo() || toast("Nothing to undo"); publishCut(); });
      $("cutReset").addEventListener("click", () => { cut.reset(); publishCut(); });
      $("cutCanvas").addEventListener("pointerup", publishCut);
    }
    cut.load(studioQC.crop({ filter: "original", minLong: 0, maxDim: 1600 }));
    $("cutTools").hidden = false; publishCut();
    toast("Tap the background with the wand, or paint to erase");
  });
  async function publishCut() {
    if (!cut || !cut.orig) return;
    studioBlob = await canvasToBlob(cut.trim(), "image/png");
    $("studioActions").hidden = false;
  }

  $("studioUseBtn").addEventListener("click", () => {
    currentPhoto = studioBlob;
    toast("Photo attached to your item");
    if (current) { $("saveHint").textContent = "✔ Product photo attached"; showTab("results"); }
    else showTab("scan");
  });
  $("studioDownloadBtn").addEventListener("click", () => {
    if (!studioBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(studioBlob); a.download = (($("itemName").value || "product").replace(/\W+/g, "-") || "product") + ".png";
    a.click();
  });
  $("photoGoBtn").addEventListener("click", () => showTab("studio"));

  /* =====================================================
     SAVE + LIBRARY
  ===================================================== */
  $("saveBtn").addEventListener("click", async () => {
    if (!current) return;
    const name = $("itemName").value.trim();
    if (!name) { $("itemName").focus(); return toast("Give the product a name"); }
    const item = {
      id: editingId || "i" + Date.now(),
      name, text: current.text, score: current.score,
      watch: current.watchList.map(w => w.entry.name),
      red: current.redList.length,
      yellow: current.yellowList.length,
      good: current.goodList.map(g => g.entry.name),
      photo: currentPhoto || null,
      created: Date.now()
    };
    if (editingId) { const old = (await DB.all()).find(i => i.id === editingId); if (old) { item.created = old.created; if (!item.photo) item.photo = old.photo; } }
    try { await DB.put(item); } catch (e) { return toast("Could not save (storage full?)"); }
    editingId = null; currentPhoto = null; $("itemName").value = "";
    await refreshCount();
    toast("Saved to your library ⭐");
    showTab("library");
  });

  async function refreshCount() { $("savedCount").textContent = (await DB.all()).length; }

  async function renderLibrary() {
    let items = await DB.all();
    const q = $("searchBox").value.trim().toLowerCase();
    if (q) items = items.filter(i => i.name.toLowerCase().includes(q) || i.text.toLowerCase().includes(q));
    const sort = $("sortBox").value;
    items.sort((a, b) => sort === "score" ? b.score - a.score : sort === "worst" ? a.score - b.score : sort === "name" ? a.name.localeCompare(b.name) : b.created - a.created);
    $("libraryEmpty").hidden = items.length > 0;
    const grid = $("libraryGrid"); grid.innerHTML = "";
    items.forEach(i => {
      const el = document.createElement("div"); el.className = "item";
      const photo = i.photo ? `<img alt="" src="${URL.createObjectURL(i.photo)}">` : "🛒";
      const c = i.score >= 75 ? "var(--good)" : i.score >= 50 ? "var(--warn)" : "var(--bad)";
      el.innerHTML = `<div class="ph">${photo}</div><div class="meta"><b>${esc(i.name)}</b>
        <div class="mini"><span style="color:${c};font-weight:800">${i.score}</span><span>🔴 ${i.red ?? i.watch.length}</span><span>🟡 ${i.yellow ?? 0}</span><span>🟢 ${i.good.length}</span></div></div>`;
      el.addEventListener("click", () => openItem(i));
      grid.appendChild(el);
    });
  }
  $("searchBox").addEventListener("input", renderLibrary);
  $("sortBox").addEventListener("change", renderLibrary);

  function openItem(i) {
    const a = E.analyze(i.text);
    const body = $("itemBody");
    body.innerHTML = `
      <div class="checker" style="margin:0 0 12px">${i.photo ? `<img src="${URL.createObjectURL(i.photo)}" alt="">` : '<div style="font-size:3rem;padding:20px">🛒</div>'}</div>
      <h3>${esc(i.name)}</h3>
      <p class="muted small">Score ${i.score} · saved ${new Date(i.created).toLocaleDateString()}</p>
      <div class="filters"><button class="filter red active" data-f="red">🔴 <b>${a.redList.length}</b></button>
      <button class="filter yellow" data-f="yellow">🟡 <b>${a.yellowList.length}</b></button>
      <button class="filter green" data-f="good">🟢 <b>${a.goodList.length}</b></button>
      <button class="filter" data-f="all">All</button></div>
      <div class="chips" id="itemChips"></div>
      <div class="highlight" id="itemHL"></div>
      <div class="row"><button class="btn" id="itemEdit">Edit &amp; re-analyze</button><button class="btn ghost" id="itemDel">🗑 Delete</button></div>`;
    let f = "red";
    E.highlight(i.text).forEach(p => {
      const hb = document.createElement("span"); hb.className = "hl " + p.color; hb.textContent = p.text;
      body.querySelector("#itemHL").appendChild(hb);
    });
    const draw = () => {
      body.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b.dataset.f === f));
      const box = body.querySelector("#itemChips"); box.innerHTML = "";
      let list = [];
      if (f === "red" || f === "all") list = list.concat(a.redList);
      if (f === "yellow" || f === "all") list = list.concat(a.yellowList);
      if (f === "good" || f === "all") list = list.concat(a.goodList);
      if (f === "all") list = list.concat(a.neutralList);
      if (!list.length) box.innerHTML = '<p class="muted">Nothing here.</p>';
      list.forEach(x => {
        const b = document.createElement("button"); b.className = "chip " + x.entry.color;
        b.innerHTML = dotFor(x.entry) + esc(x.entry.name);
        b.addEventListener("click", () => { $("itemModal").hidden = true; openReason(x); });
        box.appendChild(b);
      });
    };
    body.querySelectorAll(".filter").forEach(b => b.addEventListener("click", () => { f = b.dataset.f; draw(); }));
    draw();
    body.querySelector("#itemEdit").addEventListener("click", () => {
      $("ingText").value = i.text; $("itemName").value = i.name; editingId = i.id; currentPhoto = i.photo;
      $("itemModal").hidden = true; runAnalysis(i.text); $("itemName").value = i.name;
    });
    body.querySelector("#itemDel").addEventListener("click", async () => {
      if (!confirm("Delete " + i.name + "?")) return;
      await DB.del(i.id); $("itemModal").hidden = true; await refreshCount(); renderLibrary(); toast("Deleted");
    });
    $("itemModal").hidden = false;
  }
  $("itemClose").addEventListener("click", () => ($("itemModal").hidden = true));
  $("itemModal").addEventListener("click", e => { if (e.target.id === "itemModal") $("itemModal").hidden = true; });

  /* ---------- export / import ---------- */
  $("exportBtn").addEventListener("click", async () => {
    const items = await DB.all();
    if (!items.length) return toast("Nothing to export");
    const out = [];
    for (const i of items) out.push({ ...i, photo: i.photo ? await blobToDataURL(i.photo) : null });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(out)], { type: "application/json" }));
    a.download = "labellens-library.json"; a.click();
  });
  $("importFile").addEventListener("change", async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      for (const i of data) await DB.put({ ...i, photo: i.photo ? await dataURLToBlob(i.photo) : null });
      await refreshCount(); renderLibrary(); toast("Imported " + data.length + " items");
    } catch { toast("That file could not be imported"); }
    e.target.value = "";
  });

  /* =====================================================
     LEARN: glossary + education center
  ===================================================== */
  let gFilter = "all";

  function renderGlossary() {
    const q = $("glossSearch").value.trim().toLowerCase();
    const db = window.INGREDIENT_DB.slice().sort((a, b) => a.name.localeCompare(b.name));
    $("gAll").textContent = db.length;
    ["red", "yellow", "green", "neutral"].forEach(c => $("g" + c[0].toUpperCase() + c.slice(1)).textContent = db.filter(e => e.color === c).length);
    const list = db.filter(e => (gFilter === "all" || e.color === gFilter) &&
      (!q || (e.name + " " + e.match.join(" ") + " " + (e.found || "") + " " + e.reason).toLowerCase().includes(q)));
    const box = $("glossList"); box.innerHTML = "";
    $("glossEmpty").hidden = list.length > 0;
    const label = { red: "Avoid", yellow: "Caution", green: "Good", neutral: "Neutral" };
    list.forEach(e => {
      const d = document.createElement("details");
      d.className = "gloss " + e.color; d.id = "g-" + e.name.replace(/\W+/g, "-").toLowerCase();      const alias = [...new Set(e.match.map(m => m.trim()).filter(m => m.length > 2))].join(", ");
      d.innerHTML = `<summary><span class="dot ${e.color}"></span>${esc(e.name)}<span class="pill ${e.color}">${e.allergen ? "Allergen" : label[e.color]}</span></summary>
        <div class="body">
          <p>${esc(e.reason)}</p>
          ${e.world ? `<div class="worldbox"><b>🌍 Around the world</b><p>${esc(e.world)}</p></div>` : ""}
          ${e.found ? `<p><span class="lbl">Often found in</span>${esc(e.found)}</p>` : ""}
          <p><span class="lbl">Also listed as</span>${esc(alias)}</p>
        </div>`;
      box.appendChild(d);
    });
  }
  document.querySelectorAll("[data-g]").forEach(b => b.addEventListener("click", () => {
    gFilter = b.dataset.g;
    document.querySelectorAll("[data-g]").forEach(x => x.classList.toggle("active", x === b));
    renderGlossary();
  }));
  $("glossSearch").addEventListener("input", renderGlossary);

  function renderGuides() {
    [["guideList", window.EDU], ["livingList", window.EDU_LIVING], ["healthList", window.EDU_HEALTH]].forEach(([id, data]) => {
      const box = $(id); box.innerHTML = "";
      data.forEach((g, idx) => {
        const d = document.createElement("details");
        d.className = "guide " + g.color; if (idx === 0) d.open = true;
        d.innerHTML = `<summary>${g.icon} ${esc(g.title)}</summary><ul>${g.points.map(p => `<li>${esc(p)}</li>`).join("")}</ul>`;
        box.appendChild(d);
      });
    });
  }

  function setSeg(name) {
    document.querySelectorAll(".segbtn").forEach(b => b.classList.toggle("active", b.dataset.seg === name));
    ["glossary", "guides", "living", "health"].forEach(s => { $("seg-" + s).hidden = s !== name; });
  }

  /* ----- custom ingredients (saved on this device) ----- */
  function loadCustom() {
    try { JSON.parse(localStorage.getItem("ll_custom") || "[]").forEach(c => window.INGREDIENT_DB.push(c)); } catch (e) { /* ignore */ }
  }
  function openAdd(name) {
    showTab("learn"); setSeg("glossary");
    $("addIngBox").open = true; $("addName").value = name || "";
    setTimeout(() => $("addIngBox").scrollIntoView({ behavior: "smooth", block: "center" }), 120);
  }
  $("addSave").addEventListener("click", () => {
    const name = $("addName").value.trim();
    if (!name) return toast("Enter an ingredient name");
    const color = $("addColor").value;
    const match = [name.toLowerCase(), ...$("addMatch").value.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)];
    const entry = {
      name, type: color === "green" ? "good" : color === "neutral" ? "neutral" : "watch",
      level: color === "red" ? 2 : color === "yellow" ? 1 : 0, color, match, custom: true,
      found: "Added by you", reason: $("addReason").value.trim() || "Added by you.", world: ""
    };
    window.INGREDIENT_DB.push(entry);
    try {
      const all = JSON.parse(localStorage.getItem("ll_custom") || "[]"); all.push(entry);
      localStorage.setItem("ll_custom", JSON.stringify(all));
    } catch (e) { toast("Saved for this visit only"); }
    ["addName", "addMatch", "addReason"].forEach(i => ($(i).value = ""));
    $("addIngBox").open = false;
    renderGlossary(); toast("Ingredient added ✔");
    if (current) { current = { text: current.text, ...E.analyze(current.text) }; renderResults(); }
  });
  document.querySelectorAll(".segbtn").forEach(b => b.addEventListener("click", () => setSeg(b.dataset.seg)));

  function openGlossary(name) {
    showTab("learn"); setSeg("glossary");
    $("glossSearch").value = ""; gFilter = "all";
    document.querySelectorAll("[data-g]").forEach(x => x.classList.toggle("active", x.dataset.g === "all"));
    renderGlossary();
    const el = document.getElementById("g-" + name.replace(/\W+/g, "-").toLowerCase());
    if (el) { el.open = true; setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 120); }
  }

  loadCustom(); renderGlossary(); renderGuides();

  /* ---------- init ---------- */
  DB.open().then(refreshCount).catch(() => toast("Saving is unavailable in this browser mode"));

  /* shared with tracker.js and journey.js */
  window.LL = Object.assign(window.LL || {}, {
    toast, showTab, esc, openGlossary, E,
    savedItems: () => (DB.db ? DB.all() : Promise.resolve([]))
  });
  if (window.LL.onTab) window.LL.onTab("scan");
})();
