/* LabelLens diet tracker: food diary, daily checks, goals, 7-day view. Data stays on this device. */
(() => {
  const LL = window.LL; if (!LL) return;
  const $ = id => document.getElementById(id);
  const esc = LL.esc, toast = LL.toast;

  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { toast("Could not save (storage full?)"); } };

  let diary = load("ll_diary", {});
  let goals = load("ll_goals", { water: 8, veg: 5, fruit: 2, cal: "" });
  let hideNums = load("ll_hidenums", false);
  let date = todayKey();

  function todayKey(d = new Date()) {
    const z = n => String(n).padStart(2, "0");
    return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate());
  }
  const parseKey = k => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
  const shift = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return todayKey(d); };
  const day = (k = date) => (diary[k] = diary[k] || { entries: [], water: 0, veg: 0, fruit: 0, note: "" });
  const num = v => (v === "" || v == null || isNaN(+v) ? 0 : +v);
  const dot = c => ({ green: "🟢", yellow: "🟡", red: "🔴" }[c] || "⚪");

  function totals(d) {
    const t = { cal: 0, pro: 0, carb: 0, fat: 0, green: 0, yellow: 0, red: 0 };
    d.entries.forEach(e => { t.cal += num(e.cal); t.pro += num(e.pro); t.carb += num(e.carb); t.fat += num(e.fat); t[e.color] = (t[e.color] || 0) + 1; });
    return t;
  }
  const NF = window.LLNut ? window.LLNut.FIELDS : [];
  const XK = ["sat", "trans", "chol", "sod", "fib", "sug", "add", "pot", "calc", "iron", "vitd", "caf"];
  function nutTotals(d) {          // all tracked nutrients for one day
    const o = { cal: 0, fat: 0, sat: 0, trans: 0, chol: 0, sod: 0, carb: 0, fib: 0, sug: 0, add: 0, pro: 0, pot: 0, calc: 0, iron: 0, vitd: 0, caf: 0 };
    (d ? d.entries : []).forEach(e => {
      o.cal += num(e.cal); o.fat += num(e.fat); o.carb += num(e.carb); o.pro += num(e.pro);
      XK.forEach(k => (o[k] += num(e.x && e.x[k])));
    });
    return o;
  }
  const fmt = (k, v) => (k === "cal" || k === "sod" || k === "chol" ? Math.round(v) : Math.round(v * 10) / 10);
  const calGoal = () => num(goals.cal) || 2000;
  const dvOf = f => (f.k === "cal" ? calGoal() : f.dv);
  const tone = (f, pct) => f.good ? (pct >= 100 ? "green" : pct >= 50 ? "yellow" : "red") : (pct <= 60 ? "green" : pct <= 100 ? "yellow" : "red");
  function bars(tot, days) {
    return NF.filter(f => dvOf(f) > 0 && (tot[f.k] > 0 || ["cal","fat","sod","pro"].includes(f.k))).map(f => {
      const v = tot[f.k] / (days || 1), dv = dvOf(f), pct = Math.round((v / dv) * 100);
      return `<div class="dvrow"><span>${f.label}</span><div class="dvbar"><i class="${tone(f, pct)}" style="width:${Math.min(100, pct)}%"></i></div><b>${fmt(f.k, v)}${f.unit === "kcal" ? "" : f.unit} <small>${pct}%</small></b></div>`;
    }).join("");
  }
  function renderNutrition() {
    const box = $("trkDV"), wk = $("trkWeekNut"), card = $("nutCards"); card.hidden = hideNums; if (hideNums) return;
    const d = diary[date], tot = nutTotals(d);
    box.innerHTML = (d && d.entries.length ? bars(tot, 1) : '<p class="muted small">Log foods with nutrition numbers (scan a Nutrition Facts panel) to see your daily values.</p>') +
      (tot.trans ? `<p class="muted small">Trans fat today: ${fmt("trans", tot.trans)} g. It has no daily value, so keep it as low as you can.</p>` : "");
    // last 7 days
    const week = { cal: 0, fat: 0, sat: 0, trans: 0, chol: 0, sod: 0, carb: 0, fib: 0, sug: 0, add: 0, pro: 0, pot: 0, calc: 0, iron: 0, vitd: 0, caf: 0 }; let logged = 0;
    for (let i = 0; i < 7; i++) { const dd = diary[shift(todayKey(), -i)]; if (dd && dd.entries.length) { logged++; const x = nutTotals(dd); Object.keys(week).forEach(k => (week[k] += x[k])); } }
    wk.innerHTML = logged ? `<p class="muted small">${logged} day${logged === 1 ? "" : "s"} logged in the last 7. Daily average:</p>` + bars(week, logged) +
      `<table class="wktab"><tr><th></th><th>Week total</th><th>Daily avg</th></tr>` + NF.filter(f => week[f.k] > 0).map(f => `<tr><td>${f.label}</td><td>${fmt(f.k, week[f.k])} ${f.unit}</td><td>${fmt(f.k, week[f.k] / logged)} ${f.unit}</td></tr>`).join("") + `</table>`
      : '<p class="muted small">Nothing logged this week yet.</p>';
  }
  function addFood(o) {            // called from the scanner: scales a serving by servings eaten
    const s = o.serv || 1, n = o.nut || {}, sc = k => (n[k] == null ? "" : Math.round(n[k] * s * 10) / 10);
    const x = {}; XK.forEach(k => { if (n[k] != null) x[k] = Math.round(n[k] * s * 10) / 10; });
    day(todayKey()).entries.push({ meal: o.meal || "Snack", name: o.name + (s !== 1 ? " ×" + s : ""), color: o.color || "yellow", cal: sc("cal"), pro: sc("pro"), carb: sc("carb"), fat: sc("fat"), x });
    save("ll_diary", diary); date = todayKey(); render();
  }
  LL.addFood = addFood;

  /* ---------- render ---------- */
  function render() {
    const d = day(), t = totals(d);
    const isToday = date === todayKey();
    $("dayTitle").textContent = isToday ? "Today" : parseKey(date).toLocaleDateString(undefined, { weekday: "long" });
    $("daySub").textContent = parseKey(date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
    $("dayNext").disabled = date >= todayKey();

    // numbers visibility
    $("numFields").hidden = hideNums; $("goalCalWrap").hidden = hideNums;
    $("hideNums").checked = hideNums;

    // summary
    const total = t.green + t.yellow + t.red;
    const sum = [];
    sum.push(`<div><b>${total}</b><small>foods logged</small></div>`);
    sum.push(`<div><b>🟢 ${t.green}</b><small>whole / living</small></div>`);
    sum.push(`<div><b>🟡 ${t.yellow}</b><small>in the middle</small></div>`);
    sum.push(`<div><b>🔴 ${t.red}</b><small>processed</small></div>`);
    if (!hideNums && t.cal) sum.push(`<div><b>${Math.round(t.cal)}</b><small>calories${goals.cal ? " / " + goals.cal : ""}</small></div>`);
    if (!hideNums && (t.pro || t.carb || t.fat)) sum.push(`<div><b>${Math.round(t.pro)}·${Math.round(t.carb)}·${Math.round(t.fat)}</b><small>P · C · F (g)</small></div>`);
    $("trkSummary").innerHTML = sum.join("");

    const bar = $("trkBar");
    if (total) {
      bar.innerHTML = ["green", "yellow", "red"].filter(c => t[c]).map(c => `<span class="seg-${c}" style="flex:${t[c]}"></span>`).join("");
      const pct = Math.round((t.green / total) * 100);
      $("trkBarLabel").textContent = pct + "% of today's foods are whole or living.";
    } else { bar.innerHTML = ""; $("trkBarLabel").textContent = "Log your first food to see your day in color."; }

    // counters
    [["water", "cWater", "gWater"], ["veg", "cVeg", "gVeg"], ["fruit", "cFruit", "gFruit"]].forEach(([k, cid, gid]) => {
      $(cid).textContent = d[k];
      $(gid).textContent = goals[k] ? "goal " + goals[k] + (d[k] >= goals[k] ? " ✔" : "") : "";
    });

    // entries by meal
    const list = $("trkList"); list.innerHTML = "";
    ["Breakfast", "Lunch", "Dinner", "Snack"].forEach(meal => {
      const items = d.entries.map((e, i) => ({ e, i })).filter(x => x.e.meal === meal);
      if (!items.length) return;
      const card = document.createElement("div"); card.className = "card";
      card.innerHTML = `<h2>${meal}</h2>` + items.map(({ e, i }) => `
        <div class="food ${e.color}">
          <span class="dot ${e.color}"></span>
          <div class="fn"><b>${esc(e.name)}</b>${!hideNums && e.cal ? `<small class="muted"> ${Math.round(e.cal)} kcal${e.pro ? " · P" + Math.round(e.pro) : ""}${e.carb ? " · C" + Math.round(e.carb) : ""}${e.fat ? " · F" + Math.round(e.fat) : ""}</small>` : ""}</div>
          <button class="btn ghost del" data-i="${i}" aria-label="Remove">✕</button>
        </div>`).join("");
      list.appendChild(card);
    });
    list.querySelectorAll(".del").forEach(b => b.addEventListener("click", () => {
      day().entries.splice(+b.dataset.i, 1); save("ll_diary", diary); render();
    }));

    $("trkNote").value = d.note || "";
    $("moreNums").hidden = hideNums;
    renderNutrition();
    renderWeek();
  }

  function renderWeek() {
    const box = $("trkWeek"); box.innerHTML = "";
    for (let i = 6; i >= 0; i--) {
      const k = shift(todayKey(), -i), d = diary[k];
      const t = d ? totals(d) : null, total = t ? t.green + t.yellow + t.red : 0;
      const pct = total ? Math.round((t.green / total) * 100) : null;
      const c = pct == null ? "none" : pct >= 60 ? "green" : pct >= 30 ? "yellow" : "red";
      const el = document.createElement("button");
      el.className = "wd " + c + (k === date ? " sel" : "");
      el.innerHTML = `<small>${parseKey(k).toLocaleDateString(undefined, { weekday: "short" })}</small><b>${pct == null ? "–" : pct + "%"}</b><small>${total} foods</small>`;
      el.addEventListener("click", () => { date = k; render(); });
      box.appendChild(el);
    }
  }

  /* ---------- events ---------- */
  $("dayPrev").addEventListener("click", () => { date = shift(date, -1); render(); });
  $("dayNext").addEventListener("click", () => { if (date < todayKey()) { date = shift(date, 1); render(); } });
  $("dayToday").addEventListener("click", () => { date = todayKey(); render(); });

  document.querySelectorAll("[data-c]").forEach(b => b.addEventListener("click", () => {
    const d = day(), k = b.dataset.c;
    d[k] = Math.max(0, d[k] + Number(b.dataset.d)); save("ll_diary", diary); render();
  }));

  $("fAdd").addEventListener("click", () => {
    const name = $("fName").value.trim();
    if (!name) return toast("What did you eat?");
    day().entries.push({
      meal: $("fMeal").value, name, color: $("fColor").value,
      cal: $("fCal").value, pro: $("fPro").value, carb: $("fCarb").value, fat: $("fFat").value,
      x: Object.fromEntries(XK.map(k => [k, num($("fx_" + k).value)]).filter(([, v]) => v))
    });
    save("ll_diary", diary);
    ["fName", "fCal", "fPro", "fCarb", "fFat"].concat(XK.map(k => "fx_" + k)).forEach(i => ($(i).value = ""));
    $("fSaved").value = "";
    render(); toast("Added ✔");
  });

  $("fSaved").addEventListener("change", async () => {
    const id = $("fSaved").value; if (!id) return;
    const it = (await LL.savedItems()).find(i => i.id === id); if (!it) return;
    $("fName").value = it.name;
    $("fColor").value = it.score >= 70 ? "green" : it.score >= 40 ? "yellow" : "red";
  });

  async function fillSaved() {
    const items = await LL.savedItems(), sel = $("fSaved");
    sel.innerHTML = '<option value="">Pick a saved item (optional)</option>' +
      items.map(i => `<option value="${esc(i.id)}">${esc(i.name)}</option>`).join("");
  }

  let noteTimer;
  $("trkNote").addEventListener("input", () => {
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => { day().note = $("trkNote").value; save("ll_diary", diary); }, 500);
  });

  /* goals */
  function fillGoals() {
    $("goalWater").value = goals.water || ""; $("goalVeg").value = goals.veg || "";
    $("goalFruit").value = goals.fruit || ""; $("goalCal").value = goals.cal || "";
  }
  $("goalSave").addEventListener("click", () => {
    goals = { water: num($("goalWater").value) || "", veg: num($("goalVeg").value) || "", fruit: num($("goalFruit").value) || "", cal: num($("goalCal").value) || "" };
    hideNums = $("hideNums").checked;
    save("ll_goals", goals); save("ll_hidenums", hideNums);
    render(); toast("Saved ✔");
  });
  $("hideNums").addEventListener("change", () => { hideNums = $("hideNums").checked; save("ll_hidenums", hideNums); render(); });

  $("trkExport").addEventListener("click", () => {
    const rows = [["date", "meal", "food", "color", "calories", "protein_g", "carbs_g", "fat_g", "sat_fat_g", "trans_fat_g", "cholesterol_mg", "sodium_mg", "fiber_g", "sugars_g", "added_sugars_g", "potassium_mg", "calcium_mg", "iron_mg", "vitamin_d_mcg", "caffeine_mg"]];
    Object.keys(diary).sort().forEach(k => diary[k].entries.forEach(e =>
      rows.push([k, e.meal, '"' + String(e.name).replace(/"/g, '""') + '"', e.color, e.cal || "", e.pro || "", e.carb || "", e.fat || ""].concat(XK.map(k => (e.x && e.x[k]) || "")))));
    if (rows.length === 1) return toast("Nothing to export yet");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" }));
    a.download = "labellens-diary.csv"; a.click();
  });

  /* tab hook */
  const prev = LL.onTab;
  LL.onTab = name => { if (prev) prev(name); if (name === "track") { date = date || todayKey(); fillGoals(); fillSaved(); render(); } };
})();
