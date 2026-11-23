/* LabelLens "Change" page: a 90-day life-change program with habits, weekly reviews and milestones.
   Everything is saved on this device. */
(() => {
  const LL = window.LL; if (!LL) return;
  const $ = id => document.getElementById(id);
  const esc = LL.esc, toast = LL.toast;
  const DAY = 86400000;

  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { toast("Could not save (storage full?)"); } };

  const DEFAULT_HABITS = ["Drank water through the day", "Ate whole, living food at my meals", "Moved my body for 30 minutes", "Slept 7+ hours", "No sugary drinks", "Read a label or scanned a product", "Took time for reflection, gratitude or prayer"];

  const PHASES = [
    { name: "Phase 1 · Foundation", days: "Days 1–30", from: 1, to: 30, theme: "Small, easy wins. Build the base.",
      steps: ["Drink water first thing and with every meal.", "Cut sugary drinks (soda, energy drinks, sweet coffee).", "Add one vegetable to lunch and dinner.", "Walk 20 to 30 minutes most days.", "Pick a bedtime and protect it.", "Scan 5 products you buy often and note the red ones.", "Clear the worst processed snacks out of the house."] },
    { name: "Phase 2 · Build", days: "Days 31–60", from: 31, to: 60, theme: "Raise the standard. Replace, don't just remove.",
      steps: ["Swap red items for green or yellow ones using the Learn tab.", "Cook at home at least 5 days a week.", "Add strength training 2 days a week.", "Build every plate: half veg, plus protein, plus whole grain or beans.", "Eat a fermented food most days.", "Aim for 25 g of fiber a day.", "Plan meals and shop from a list."] },
    { name: "Phase 3 · Lock-in", days: "Days 61–90", from: 61, to: 90, theme: "Make it who you are, and plan for life after day 90.",
      steps: ["Keep the 80/20 rule: whole food most of the time, flexibility for real life.", "Build a go-to list of 10 meals you enjoy and can make fast.", "Increase your activity: longer walks, more strength, or a sport you love.", "Practice recovering from slips quickly.", "Share what you've learned with someone you care about.", "Write your next 90-day goal and the habits that stay forever."] }
  ];

  const BADGES = [
    { id: "d1", icon: "🌱", label: "First day", test: s => s.done >= 1 },
    { id: "s7", icon: "🔥", label: "7-day streak", test: s => s.best >= 7 },
    { id: "s14", icon: "💪", label: "14-day streak", test: s => s.best >= 14 },
    { id: "s30", icon: "🏅", label: "30-day streak", test: s => s.best >= 30 },
    { id: "s60", icon: "🥈", label: "60-day streak", test: s => s.best >= 60 },
    { id: "s90", icon: "🏆", label: "90 days", test: s => s.best >= 90 },
    { id: "rv1", icon: "📝", label: "First weekly review", test: s => s.reviews >= 1 },
    { id: "rv4", icon: "📚", label: "4 reviews", test: s => s.reviews >= 4 },
    { id: "pf", icon: "💎", label: "Perfect week", test: s => s.perfectWeek }
  ];

  let J = load("ll_journey", null);
  let showWeight = load("ll_showweight", true);

  const z = n => String(n).padStart(2, "0");
  const key = d => d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate());
  const parse = k => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
  const todayK = () => key(new Date());
  const addDays = (k, n) => { const d = parse(k); d.setDate(d.getDate() + n); return key(d); };
  const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / DAY);

  const commit = () => save("ll_journey", J);
  const dayNum = () => diffDays(J.start, todayK()) + 1;

  function habitsDone(k) { return (J.checks[k] || []).filter(h => J.habits.includes(h)).length; }
  function dayStatus(k) {
    if (!J.habits.length) return "none";
    const n = habitsDone(k);
    return n === 0 ? "none" : n >= J.habits.length ? "full" : "part";
  }

  function stats() {
    let streak = 0, best = 0, run = 0, done = 0;
    const last = Math.min(dayNum(), 90);
    for (let i = 1; i <= last; i++) {
      const k = addDays(J.start, i - 1);
      const full = dayStatus(k) === "full";
      if (dayStatus(k) !== "none") done++;
      if (full) { run++; best = Math.max(best, run); } else if (k !== todayK()) run = 0;
    }
    // current streak counts back from today (or yesterday if today isn't finished)
    let k = todayK();
    if (dayStatus(k) !== "full") k = addDays(k, -1);
    while (diffDays(J.start, k) >= 0 && dayStatus(k) === "full") { streak++; k = addDays(k, -1); }
    // last 7 days rate
    let h = 0, t = 0;
    for (let i = 0; i < 7; i++) {
      const kk = addDays(todayK(), -i);
      if (diffDays(J.start, kk) < 0) continue;
      h += habitsDone(kk); t += J.habits.length;
    }
    // perfect week: any 7 consecutive full days
    let perfectWeek = false, r = 0;
    for (let i = 1; i <= last; i++) { if (dayStatus(addDays(J.start, i - 1)) === "full") { r++; if (r >= 7) perfectWeek = true; } else r = 0; }
    return { streak, best, done, rate: t ? Math.round((h / t) * 100) : 0, reviews: J.reviews.length, perfectWeek };
  }

  /* ---------- render ---------- */
  function render() {
    $("chSetup").hidden = !!J; $("chMain").hidden = !J;
    if (!J) { if (!$("chStart").value) $("chStart").value = todayK(); return; }

    const n = dayNum(), s = stats();
    const shown = Math.max(1, Math.min(n, 90));
    $("chDayLabel").textContent = n < 1 ? `Starts in ${1 - n} day${1 - n === 1 ? "" : "s"}` : n > 90 ? "Journey complete 🎉" : `Day ${n} of 90`;
    const ph = PHASES.find(p => shown >= p.from && shown <= p.to) || PHASES[2];
    $("chPhase").textContent = n > 90 ? "You finished. Keep going." : ph.name;
    $("chIdentityShow").textContent = J.identity ? "I am becoming: " + J.identity : "";
    $("chWhyShow").textContent = J.why || "";
    const pct = Math.max(0, Math.min(100, Math.round((Math.min(n, 90) / 90) * 100)));
    $("chBar").style.width = pct + "%"; $("chBarLabel").textContent = pct + "%";
    $("chStreak").textContent = s.streak; $("chBest").textContent = s.best; $("chRate").textContent = s.rate + "%";

    // habits for today
    const tk = todayK(), checked = J.checks[tk] || [];
    $("chToday").textContent = parse(tk).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) + ` · ${habitsDone(tk)}/${J.habits.length} done`;
    const hb = $("chHabits"); hb.innerHTML = "";
    J.habits.forEach(h => {
      const row = document.createElement("div"); row.className = "habit" + (checked.includes(h) ? " on" : "");
      row.innerHTML = `<button class="chk" aria-label="Toggle">${checked.includes(h) ? "✔" : ""}</button><span>${esc(h)}</span><button class="btn ghost x" aria-label="Remove habit">✕</button>`;
      row.querySelector(".chk").addEventListener("click", () => toggle(h));
      row.querySelector("span").addEventListener("click", () => toggle(h));
      row.querySelector(".x").addEventListener("click", () => { if (confirm("Remove this habit?")) { J.habits = J.habits.filter(x => x !== h); commit(); render(); } });
      hb.appendChild(row);
    });

    // phase plan
    $("chPlan").innerHTML = `<p class="muted small">${esc(ph.days)} · ${esc(ph.theme)}</p>` +
      `<ul class="plan">${ph.steps.map((st, i) => {
        const id = ph.from + "-" + i, on = (J.planDone || []).includes(id);
        return `<li class="${on ? "on" : ""}" data-id="${id}"><button class="chk">${on ? "✔" : ""}</button><span>${esc(st)}</span></li>`;
      }).join("")}</ul>`;
    $("chPlan").querySelectorAll("li").forEach(li => li.addEventListener("click", () => {
      J.planDone = J.planDone || [];
      const id = li.dataset.id;
      J.planDone = J.planDone.includes(id) ? J.planDone.filter(x => x !== id) : J.planDone.concat(id);
      commit(); render();
    }));

    // 90 day grid
    const grid = $("chGrid"); grid.innerHTML = "";
    for (let i = 1; i <= 90; i++) {
      const k = addDays(J.start, i - 1), future = diffDays(J.start, todayK()) < i - 1;
      const c = document.createElement("span");
      c.className = "cell " + (future ? "future" : dayStatus(k)) + (k === tk ? " today" : "");
      c.title = "Day " + i; c.textContent = i;
      grid.appendChild(c);
    }

    renderMeasures();

    // weekly review
    const wk = Math.max(1, Math.ceil(shown / 7));
    $("wkLabel").textContent = `Week ${wk} review`;
    const cur = J.reviews.find(r => r.week === wk);
    $("wkWell").value = cur ? cur.well : ""; $("wkFix").value = cur ? cur.fix : ""; $("wkFocus").value = cur ? cur.focus : "";
    $("wkHistory").innerHTML = J.reviews.slice().sort((a, b) => b.week - a.week).filter(r => r.week !== wk).map(r =>
      `<details class="rv"><summary>Week ${r.week}</summary><p><b>Went well:</b> ${esc(r.well)}</p><p><b>Got in the way:</b> ${esc(r.fix)}</p><p><b>Focus:</b> ${esc(r.focus)}</p></details>`).join("");

    // if-then
    $("ifList").innerHTML = J.ifthen.map((x, i) => `<div class="ifrow"><span><b>If</b> ${esc(x.when)} <b>then</b> ${esc(x.then)}</span><button class="btn ghost x" data-i="${i}">✕</button></div>`).join("") || '<p class="muted small">No plans yet. Example: If I crave soda, then I drink sparkling water with lime.</p>';
    $("ifList").querySelectorAll(".x").forEach(b => b.addEventListener("click", () => { J.ifthen.splice(+b.dataset.i, 1); commit(); render(); }));

    // badges
    $("chBadges").innerHTML = BADGES.map(b => `<div class="badgeit ${b.test(s) ? "on" : ""}"><span>${b.icon}</span><small>${b.label}</small></div>`).join("");
  }

  function toggle(h) {
    const k = todayK(); J.checks[k] = J.checks[k] || [];
    J.checks[k] = J.checks[k].includes(h) ? J.checks[k].filter(x => x !== h) : J.checks[k].concat(h);
    commit(); render();
    if (dayStatus(k) === "full") toast("Perfect day! 🔥");
  }

  /* ---------- measurements ---------- */
  function renderMeasures() {
    const m = J.measures || {}, tk = todayK(), cur = m[tk] || {};
    $("mWeight").value = cur.weight || ""; $("mWaist").value = cur.waist || ""; $("mEnergy").value = cur.energy || ""; $("mSleep").value = cur.sleep || "";
    $("mWeight").hidden = !showWeight;
    const keys = Object.keys(m).sort();
    const series = [["energy", "Energy (1–5)", "#fbbf24"], ["sleep", "Sleep (hrs)", "#6366f1"]];
    if (showWeight) series.unshift(["weight", "Weight", "#22d3a6"], ["waist", "Waist", "#34d399"]);
    let html = "";
    series.forEach(([f, label, color]) => {
      const pts = keys.filter(k => m[k][f] !== undefined && m[k][f] !== "").map(k => ({ k, v: +m[k][f] }));
      if (pts.length < 2) return;
      const min = Math.min(...pts.map(p => p.v)), max = Math.max(...pts.map(p => p.v)), span = max - min || 1;
      const W = 300, H = 70, path = pts.map((p, i) => `${(i / (pts.length - 1)) * (W - 10) + 5},${H - 8 - ((p.v - min) / span) * (H - 16)}`).join(" ");
      html += `<div class="mc"><small class="muted">${label}: ${pts[0].v} → ${pts[pts.length - 1].v}</small><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><polyline fill="none" stroke="${color}" stroke-width="2.5" points="${path}"/></svg></div>`;
    });
    $("mChart").innerHTML = html || '<p class="muted small">Log at least two days to see your trend.</p>';
  }

  /* ---------- events ---------- */
  $("chBegin").addEventListener("click", () => {
    const start = $("chStart").value || todayK();
    J = { start, why: $("chWhy").value.trim(), identity: $("chIdentity").value.trim(), habits: DEFAULT_HABITS.slice(), checks: {}, planDone: [], measures: {}, reviews: [], ifthen: [] };
    commit(); render(); toast("Day 1 starts now 🔥"); window.scrollTo({ top: 0, behavior: "smooth" });
  });

  $("chAddHabit").addEventListener("click", () => {
    const v = $("chNewHabit").value.trim(); if (!v) return;
    if (J.habits.includes(v)) return toast("Already on your list");
    J.habits.push(v); $("chNewHabit").value = ""; commit(); render();
  });

  $("mSave").addEventListener("click", () => {
    const tk = todayK();
    const rec = { weight: $("mWeight").value, waist: $("mWaist").value, energy: $("mEnergy").value, sleep: $("mSleep").value };
    if (rec.energy && (+rec.energy < 1 || +rec.energy > 5)) return toast("Energy is 1 to 5");
    if (!Object.values(rec).some(v => v !== "")) return toast("Enter at least one value");
    J.measures = J.measures || {}; J.measures[tk] = rec; commit(); renderMeasures(); toast("Logged ✔");
  });
  $("mToggle").addEventListener("click", () => { showWeight = !showWeight; save("ll_showweight", showWeight); renderMeasures(); });

  $("wkSave").addEventListener("click", () => {
    const n = dayNum(), wk = Math.max(1, Math.ceil(Math.max(1, Math.min(n, 90)) / 7));
    const rec = { week: wk, well: $("wkWell").value.trim(), fix: $("wkFix").value.trim(), focus: $("wkFocus").value.trim() };
    if (!rec.well && !rec.fix && !rec.focus) return toast("Write something first");
    J.reviews = J.reviews.filter(r => r.week !== wk).concat(rec); commit(); render(); toast("Review saved ✔");
  });

  $("ifAdd").addEventListener("click", () => {
    const when = $("ifWhen").value.trim(), then = $("ifThen").value.trim();
    if (!when || !then) return toast("Fill in both boxes");
    J.ifthen.push({ when, then }); $("ifWhen").value = ""; $("ifThen").value = ""; commit(); render();
  });

  $("chExport").addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(J, null, 2)], { type: "application/json" }));
    a.download = "labellens-journey.json"; a.click();
  });
  $("chReset").addEventListener("click", () => {
    if (!confirm("Restart your journey? This deletes your check-ins and reviews on this device. Export first if you want a copy.")) return;
    J = null; localStorage.removeItem("ll_journey"); $("chWhy").value = ""; $("chIdentity").value = ""; render();
  });

  const prev = LL.onTab;
  LL.onTab = name => { if (prev) prev(name); if (name === "change") render(); };
})();
