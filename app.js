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
  let scanCropper = null, scanFileObj = null;

  function mountCropper(imgEl, wrapEl, file, existing) {
    if (existing) existing.destroy();
    imgEl.src = URL.createObjectURL(file);
    wrapEl.hidden = false;
    return new Promise(res => {
      imgEl.onload = () => res(new Cropper(imgEl, { viewMode: 1, autoCropArea: 0.92, background: false, responsive: true }));
    });
  }

  $("scanFile").addEventListener("change", async e => {
    const f = e.target.files[0]; if (!f) return;
    scanFileObj = f;
    scanCropper = await mountCropper($("scanImg"), $("scanCropWrap"), f, scanCropper);
    $("scanCropBtn").disabled = false; $("scanRunBtn").disabled = false;
    toast("Drag the box around the ingredients, then tap Read text");
  });

  $("scanCropBtn").addEventListener("click", async () => {
    if (!scanCropper) return;
    const canvas = scanCropper.getCroppedCanvas({ maxWidth: 2400, maxHeight: 2400 });
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
    scanFileObj = new File([blob], "crop.jpg", { type: "image/jpeg" });
    scanCropper = await mountCropper($("scanImg"), $("scanCropWrap"), scanFileObj, scanCropper);
    toast("Cropped");
  });

  function prepForOCR(canvas) {
    // upscale small crops + grayscale + contrast for better OCR
    const scale = canvas.width < 1400 ? 1400 / canvas.width : 1;
    const out = document.createElement("canvas");
    out.width = Math.round(canvas.width * scale); out.height = Math.round(canvas.height * scale);
    const ctx = out.getContext("2d");
    ctx.filter = "grayscale(1) contrast(1.35)";
    ctx.drawImage(canvas, 0, 0, out.width, out.height);
    return out;
  }

  $("scanRunBtn").addEventListener("click", async () => {
    if (!scanCropper) return;
    if (!window.Tesseract) return toast("OCR engine failed to load. Check your connection.");
    const btn = $("scanRunBtn"); btn.disabled = true;
    const prog = $("scanProgress"), bar = $("scanBar"), st = $("scanStatus");
    prog.hidden = false; bar.style.width = "3%"; st.textContent = "Preparing image…";
    try {
      const raw = scanCropper.getCroppedCanvas({ maxWidth: 2400, maxHeight: 2400 });
      const canvas = prepForOCR(raw);
      const { data } = await Tesseract.recognize(canvas, "eng", {
        logger: m => {
          if (m.status) st.textContent = m.status.replace(/_/g, " ");
          if (typeof m.progress === "number") bar.style.width = Math.max(3, Math.round(m.progress * 100)) + "%";
        }
      });
      const text = cleanOCR(data.text);
      $("ingText").value = text;
      toast(text ? "Text read. Check it, then Analyze" : "No text found. Try a tighter crop.");
      $("ingText").scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      console.error(err); toast("Could not read the image");
    } finally {
      btn.disabled = false; setTimeout(() => (prog.hidden = true), 800);
    }
  });

  function cleanOCR(t) {
    return (t || "")
      .replace(/-\n(?=[a-z])/g, "")     // hyphenated line breaks
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

  function scoreInfo(s) {
    if (s >= 75) return { c: "var(--good)", l: "Looks pretty clean", sub: "Few or no flagged ingredients." };
    if (s >= 50) return { c: "var(--warn)", l: "Mixed bag", sub: "Some ingredients are worth a closer look." };
    return { c: "var(--bad)", l: "Lots to watch", sub: "Several flagged ingredients. Check the reasons below." };
  }

  function renderResults() {
    $("emptyResults").hidden = true; $("resultsBody").hidden = false;
    const s = scoreInfo(current.score);
    const ring = $("scoreRing");
    ring.style.setProperty("--p", current.score); ring.style.setProperty("--c", s.c);
    $("scoreNum").textContent = current.score;
    $("scoreLabel").textContent = s.l; $("scoreSub").textContent = s.sub + " (This is a simple estimate, not a medical rating.)";
    $("redN").textContent = current.redList.length;
    $("yellowN").textContent = current.yellowList.length;
    $("goodN").textContent = current.goodList.length;
    $("allN").textContent = current.watchList.length + current.goodList.length;
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

  /* the whole label, color coded */
  function renderHighlight() {
    const box = $("highlightBox"); box.innerHTML = "";
    E.highlight(current.text).forEach(p => {
      const b = document.createElement("button");
      b.className = "hl " + p.color; b.textContent = p.text;
      if (p.color !== "plain") {
        const R = { red: 3, yellow: 2, green: 1, neutral: 0.5 };
        const hit = E.matches(p.text).sort((a, c) => R[c.color] - R[a.color])[0];
        b.addEventListener("click", () => openReason({ entry: hit, found: [p.text] }));
      }
      box.appendChild(b);
    });
  }

  const dotFor = e => e.allergen ? "⚠️ " : ({ green: "🟢 ", red: "🔴 ", yellow: "🟡 ", neutral: "⚪ " }[e.color] || "");
  const EMPTY_MSG = { red: "🎉 Nothing in the red.", yellow: "Nothing in the yellow.", good: "No standout healthy ingredients found.", all: "Nothing flagged." };
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
  let studioCropper = null, studioBlob = null, studioFileObj = null;

  $("studioFile").addEventListener("change", async e => {
    const f = e.target.files[0]; if (!f) return;
    studioFileObj = f; studioBlob = null;
    $("studioOut").hidden = true; $("studioActions").hidden = true;
    studioCropper = await mountCropper($("studioImg"), $("studioCropWrap"), f, studioCropper);
    $("studioCropBtn").disabled = false; $("studioBgBtn").disabled = false;
  });

  $("studioCropBtn").addEventListener("click", async () => {
    if (!studioCropper) return;
    const canvas = studioCropper.getCroppedCanvas({ maxWidth: 1600, maxHeight: 1600 });
    const blob = await canvasToBlob(canvas, "image/png");
    studioFileObj = new File([blob], "crop.png", { type: "image/png" });
    studioCropper = await mountCropper($("studioImg"), $("studioCropWrap"), studioFileObj, studioCropper);
    toast("Cropped");
  });

  let bgLib = null;
  $("studioBgBtn").addEventListener("click", async () => {
    if (!studioCropper) return;
    const btn = $("studioBgBtn"); btn.disabled = true;
    const prog = $("studioProgress"), bar = $("studioBar"), st = $("studioStatus");
    prog.hidden = false; bar.style.width = "3%"; st.textContent = "Loading AI model…";
    try {
      if (!bgLib) bgLib = await import("https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm");
      const src = await canvasToBlob(studioCropper.getCroppedCanvas({ maxWidth: 1600, maxHeight: 1600 }), "image/png");
      studioBlob = await bgLib.removeBackground(src, {
        output: { format: "image/png" },
        progress: (key, cur, total) => {
          if (total) bar.style.width = Math.max(3, Math.round((cur / total) * 100)) + "%";
          st.textContent = key.startsWith("fetch") ? "Downloading model (first time only)…" : "Cutting out background…";
        }
      });
      $("studioResult").src = URL.createObjectURL(studioBlob);
      $("studioOut").hidden = false; $("studioActions").hidden = false;
      toast("Background removed ✨");
    } catch (err) {
      console.error(err); toast("Background removal failed. Check your connection and try again.");
    } finally {
      btn.disabled = false; setTimeout(() => (prog.hidden = true), 800);
    }
  });

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
