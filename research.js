/* LabelLens research: checks whether an unknown label word is really an ingredient, and gathers sources.
   Uses Wikipedia (what it is) and PubMed (research papers, titles only). Spaced and cached to stay inside their limits. */
(() => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const mem = { last: 0, chain: Promise.resolve() };
  const load = () => { try { return JSON.parse(localStorage.getItem("ll_research") || "{}"); } catch { return {}; } };
  const save = c => { try { const ks = Object.keys(c).sort((a, b) => c[a].t - c[b].t); while (ks.length > 60) delete c[ks.shift()]; localStorage.setItem("ll_research", JSON.stringify(c)); } catch {} };
  async function getJSON(url, gap) {
    return (mem.chain = mem.chain.catch(() => {}).then(async () => {
      const w = mem.last + gap - Date.now(); if (w > 0) await sleep(w); mem.last = Date.now();
      const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 9000);
      try { const r = await fetch(url, { signal: ctl.signal }); if (!r.ok) throw Object.assign(new Error("http"), { detail: "HTTP " + r.status }); return await r.json(); }
      finally { clearTimeout(to); }
    }));
  }
  const FOODY = /food additive|additive|preservative|emulsifier|sweetener|thickener|stabili[sz]er|flavou?r|spice|herb|vegetable|fruit|seed|grain|cereal|legume|dairy|edible|ingredient|cooking|nutrient|vitamin|mineral|e number|colou?ring|antioxidant|acid|oil|fat|sugar|starch|protein|fiber|fibre|extract|plant|nut\b|bean|berry|mushroom|seaweed|yeast|ferment/i;
  const NOTFOOD = /\b(surname|given name|village|municipality|film|album|band|footballer|politician|album|song|novel|company|town|commune|software|unit of|asteroid|species of (?:moth|beetle|fish)|disambiguation)\b/i;
  const sentence = t => { const m = String(t || "").replace(/\s+/g, " ").match(/^(.{40,400}?[.!?])(\s|$)/); return (m ? m[1] : String(t || "").slice(0, 300)).trim(); };

  async function research(term) {
    term = String(term || "").trim().replace(/\s+/g, " ").slice(0, 60); if (term.length < 3) throw new Error("short");
    const key = term.toLowerCase(), cache = load(); if (cache[key] && Date.now() - cache[key].t < 30 * 864e5) return cache[key].v;
    const out = { term, wiki: null, papers: [], paperCount: 0, score: 0, evidence: [], verdict: "unknown" };
    // 1) what is it (Wikipedia, best match for "<term> food")
    try {
      const j = await getJSON(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=${encodeURIComponent(term + " food ingredient")}&gsrlimit=1&prop=extracts|pageprops&exintro=1&explaintext=1&exchars=700`, 300);
      const pg = j && j.query && j.query.pages ? Object.values(j.query.pages)[0] : null;
      if (pg && pg.extract) {
        const titleHit = pg.title.toLowerCase().includes(key.split(" ")[0]) || key.includes(pg.title.toLowerCase());
        out.wiki = { title: pg.title, text: pg.extract.trim(), url: "https://en.wikipedia.org/wiki/" + encodeURIComponent(pg.title.replace(/ /g, "_")), titleHit };
        if (titleHit) { out.score += 1; out.evidence.push("A reference article exists for “" + pg.title + "”."); }
        if (titleHit && FOODY.test(pg.extract)) { out.score += 2; out.evidence.push("The article describes it as a food, additive, plant or nutrient."); }
        if (NOTFOOD.test(pg.extract.slice(0, 300))) { out.score -= 3; out.evidence.push("The article looks like it is about something that is not a food."); }
      }
    } catch (e) { out.evidence.push("Could not reach Wikipedia (" + (e.detail || "network") + ")."); }
    // 2) research papers (PubMed titles only)
    try {
      const q = encodeURIComponent(`"${term}"[Title/Abstract] AND (food OR diet OR nutrition OR dietary OR supplement)`);
      const s = await getJSON(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=5&sort=relevance&term=${q}`, 450);
      const ids = (s.esearchresult && s.esearchresult.idlist) || []; out.paperCount = +((s.esearchresult && s.esearchresult.count) || 0);
      if (out.paperCount >= 5) { out.score += 1; out.evidence.push(out.paperCount + " research papers mention it together with food or diet."); }
      if (out.paperCount >= 100) out.score += 1;
      if (ids.length) {
        const d = await getJSON(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(",")}`, 450);
        out.papers = ids.map(id => d.result && d.result[id]).filter(Boolean).map(x => ({ title: String(x.title || "").replace(/\.$/, ""), journal: x.source || "", year: String(x.pubdate || "").slice(0, 4), url: "https://pubmed.ncbi.nlm.nih.gov/" + x.uid + "/" }));
      }
    } catch (e) { out.evidence.push("Could not reach PubMed (" + (e.detail || "network") + ")."); }
    out.verdict = out.score >= 3 ? "ingredient" : out.score >= 1 ? "maybe" : "word";
    out.searchUrl = "https://pubmed.ncbi.nlm.nih.gov/?term=" + encodeURIComponent(term + " health");
    cache[key] = { t: Date.now(), v: out }; save(cache); return out;
  }
  /* a draft glossary entry. Health claims are NOT invented: it carries the reference summary and the papers, marked as unreviewed. */
  function draft(r, color) {
    color = color || "neutral";
    const entry = { name: r.term.replace(/\b[a-z]/g, c => c.toUpperCase()), type: color === "green" ? "good" : color === "neutral" ? "neutral" : "watch", level: color === "red" ? 2 : color === "yellow" ? 1 : 0, color,
      match: [r.term.toLowerCase()], found: "Added from a scanned label", reason: "Not yet reviewed by LabelLens. " + (r.wiki && r.wiki.titleHit ? sentence(r.wiki.text) : "No clear reference summary was found."), world: "",
      community: true, researched: new Date().toISOString().slice(0, 10), sources: [], papers: r.papers.map(p => ({ title: p.title, url: p.url, year: p.year })) };
    if (r.wiki && r.wiki.titleHit) entry.sources.push({ title: "Wikipedia: " + r.wiki.title, url: r.wiki.url });
    entry.sources.push({ title: "PubMed search", url: r.searchUrl });
    return entry;
  }
  function issueUrl(entry) {
    const body = "A scanner user suggests adding this ingredient. It is checked automatically against Wikipedia and PubMed, and added as neutral if it passes.\n\n```json\n" + JSON.stringify(entry, null, 2) + "\n```\n";
    return "https://github.com/Zayaiken21/LabelLens-IngredientFacts/issues/new?labels=new-ingredient&title=" + encodeURIComponent("New ingredient: " + entry.name) + "&body=" + encodeURIComponent(body.slice(0, 6500));
  }
  window.LLResearch = { research, draft, issueUrl };
})();
