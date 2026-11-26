/* Cloudflare Worker: lets anyone suggest an ingredient without a GitHub account.
   It holds a fine-grained GitHub token (Issues: read and write on this one repo, nothing else) as the secret GH_TOKEN.
   It only creates an issue; the repo's "Add suggested ingredient" workflow then fact-checks it and publishes it. */
const REPO = "Zayaiken21/LabelLens-IngredientFacts";
const ORIGIN = "https://zayaiken21.github.io";
const LIMIT = 5, WINDOW = 3600;                                       // suggestions per visitor per hour

const cors = o => ({ "access-control-allow-origin": o, "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type", vary: "origin" });
const reply = (o, status, obj) => new Response(JSON.stringify(obj), { status, headers: { ...cors(o), "content-type": "application/json" } });

export default {
  async fetch(req, env) {
    const o = req.headers.get("origin") || "";
    const allowed = o === ORIGIN || o.startsWith("http://localhost");
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(allowed ? o : ORIGIN) });
    if (!allowed) return reply(ORIGIN, 403, { ok: false, error: "origin not allowed" });
    if (req.method !== "POST") return reply(o, 405, { ok: false, error: "POST only" });

    let name = "";
    try { name = String((await req.json()).name || ""); } catch { return reply(o, 400, { ok: false, error: "bad request" }); }
    name = name.replace(/\s+/g, " ").trim();
    if (!/^[A-Za-z][A-Za-z0-9 ,'()\-]{2,59}$/.test(name)) return reply(o, 400, { ok: false, error: "That name has unusual characters or is the wrong length." });

    const ip = req.headers.get("cf-connecting-ip") || "x", key = new Request("https://rl.local/" + encodeURIComponent(ip)), cache = caches.default;
    const hit = await cache.match(key), n = hit ? +(await hit.text()) : 0;
    if (n >= LIMIT) return reply(o, 429, { ok: false, error: "Too many suggestions from this connection. Try again in an hour." });
    await cache.put(key, new Response(String(n + 1), { headers: { "cache-control": "max-age=" + WINDOW } }));

    const body = "Suggested from the LabelLens website. It is fact-checked automatically against Wikipedia and PubMed.\n\n```json\n" + JSON.stringify({ name }, null, 2) + "\n```\n";
    const r = await fetch(`https://api.github.com/repos/${REPO}/issues`, {
      method: "POST",
      headers: { authorization: "Bearer " + env.GH_TOKEN, accept: "application/vnd.github+json", "user-agent": "labellens-submit", "content-type": "application/json" },
      body: JSON.stringify({ title: "New ingredient: " + name, body }),
    });
    if (!r.ok) return reply(o, 502, { ok: false, error: "Could not send the suggestion right now." });
    return reply(o, 200, { ok: true });
  },
};
