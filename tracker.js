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
      cal: $("fCal").value, pro: $("fPro").value, carb: $("fCarb").value, fat: $("fFat").value
    });
    save("ll_diary", diary);
    ["fName", "fCal", "fPro", "fCarb", "fFat"].forEach(i => ($(i).value = ""));
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
    const rows = [["date", "meal", "food", "color", "calories", "protein_g", "carbs_g", "fat_g"]];
    Object.keys(diary).sort().forEach(k => diary[k].entries.forEach(e =>
      rows.push([k, e.meal, '"' + String(e.name).replace(/"/g, '""') + '"', e.color, e.cal || "", e.pro || "", e.carb || "", e.fat || ""])));
    if (rows.length === 1) return toast("Nothing to export yet");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" }));
    a.download = "labellens-diary.csv"; a.click();
  });

  /* tab hook */
  const prev = LL.onTab;
  LL.onTab = name => { if (prev) prev(name); if (name === "track") { date = date || todayKey(); fillGoals(); fillSaved(); render(); } };
})();
