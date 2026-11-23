/* Renders the Facts tab from window.FACTS */
(() => {
  const LL = window.LL, F = window.FACTS; if (!LL || !F) return;
  const esc = LL.esc, $ = id => document.getElementById(id);
  const link = ([t, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(t)} ↗</a>`;
  const list = (rows, srcs) => rows.map(([h, b]) => `<details class="gloss"><summary><b>${esc(h)}</b></summary><p>${esc(b)}</p></details>`).join("") +
    (srcs ? `<p class="srcs"><b>Sources:</b> ${srcs.map(link).join(" · ")}</p>` : "");
  let done = false, q = "";

  function claims() {
    const rows = F.claims.filter(c => !q || (c.q + " " + c.a).toLowerCase().includes(q));
    $("fxClaims").innerHTML = rows.map(c => { const [lab, col] = F.verdicts[c.v];
      return `<details class="gloss ${col}"><summary><span class="verdict ${col}">${esc(lab)}</span> <b>${esc(c.q)}</b></summary><p>${esc(c.a)}</p><p class="srcs"><b>Sources:</b> ${c.src.map(link).join(" · ")}</p></details>`; }).join("") || '<p class="muted">No match.</p>';
  }
  function render() {
    claims();
    $("fxLaws").innerHTML = `<p class="muted">${esc(F.lawsNote)}</p><ol class="timeline">` + F.laws.map(l =>
      `<li><span class="yr">${esc(l.y)}</span><div><b>${esc(l.t)}</b><p>${esc(l.d)}</p><p class="srcs">${link(l.src)}</p></div></li>`).join("") + "</ol>";
    $("fxEnzymes").innerHTML = list(F.enzymes, F.enzymesSrc);
    $("fxFluoride").innerHTML = list(F.fluoride, F.fluorideSrc);
    $("fxBody").innerHTML = list(F.body, F.bodySrc);
    $("fxHerbs").innerHTML = list(F.herbs, F.herbsSrc);
    $("fxSources").innerHTML = `<ul class="srcl">` + F.sources.map(s => `<li>${link(s)}</li>`).join("") + `</ul><p class="muted small">Not used as sources: Quora, Pinterest, social posts, anonymous blogs.</p>`;
    $("fxDisc").textContent = F.disclaimer;
  }
  document.querySelectorAll("[data-fx]").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll("[data-fx]").forEach(x => x.classList.toggle("on", x === b));
    document.querySelectorAll(".fxseg").forEach(s => (s.hidden = s.id !== "fx-" + b.dataset.fx));
  }));
  $("fxSearch").addEventListener("input", e => { q = e.target.value.trim().toLowerCase(); claims(); });
  const prev = LL.onTab;
  LL.onTab = name => { if (prev) prev(name); if (name === "facts" && !done) { done = true; render(); } };
})();
