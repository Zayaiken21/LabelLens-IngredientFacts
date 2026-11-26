"""Fact-check a suggested ingredient online and, if it passes, append it to community.json.
Nothing the submitter wrote is trusted except the word itself: the summary, sources and papers are fetched here."""
import json, os, re, sys, urllib.parse, urllib.request

FOOD = re.compile(r"\b(food|additive|ingredient|preservative|sweetener|emulsifier|flavou?r|thickener|thickening|dye|colou?ring|edible|nutrient|vitamin|mineral|protein|oil|sugar|spice|herb|extract|acid|fiber|fibre|starch|salt|antioxidant|stabili[sz]er|seasoning)\b", re.I)

def get_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "LabelLens-bot/1.0 (https://github.com/Zayaiken21/LabelLens-IngredientFacts)"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)

def sentence(t, n=2):
    return " ".join(re.split(r"(?<=[.!?])\s+", re.sub(r"\s+", " ", t).strip())[:n])[:600]

def check(name):
    out = {"ok": False, "why": "", "wiki": None, "papers": [], "count": 0}
    q = urllib.parse.urlencode({"action": "query", "format": "json", "generator": "search", "gsrsearch": name, "gsrlimit": 3, "prop": "extracts|info",
                                "exintro": 1, "explaintext": 1, "exlimit": 3, "inprop": "url"})
    pages = sorted((get_json("https://en.wikipedia.org/w/api.php?" + q).get("query", {}).get("pages", {})).values(), key=lambda p: p.get("index", 9))
    low = name.lower()
    for p in pages:
        t = p.get("title", "").lower()
        if (low == t or low in t or t in low) and FOOD.search(p.get("extract", "")):
            out["wiki"] = {"title": p["title"], "text": sentence(p["extract"]), "url": p["fullurl"]}; break
    if not out["wiki"]:
        out["why"] = "no encyclopedia article that matches the name and describes a food substance"; return out
    term = f'"{name}" AND (food OR diet OR "food additive")'
    s = get_json("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?" + urllib.parse.urlencode({"db": "pubmed", "retmode": "json", "retmax": 5, "term": term}))["esearchresult"]
    out["count"] = int(s.get("count", 0))
    if out["count"] < 5:
        out["why"] = f"only {out['count']} research papers found with food or diet"; return out
    ids = s.get("idlist", [])
    d = get_json("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=" + ",".join(ids))
    for i in ids:
        x = d.get("result", {}).get(i)
        if x: out["papers"].append({"title": str(x.get("title", "")).rstrip(".")[:200], "url": f"https://pubmed.ncbi.nlm.nih.gov/{x['uid']}/", "year": str(x.get("pubdate", ""))[:4]})
    out["ok"] = True; out["term"] = term; return out

def main():
    body = os.environ.get("ISSUE_BODY", "")
    m = re.search(r"```json\s*(\{.*?\})\s*```", body, re.S)
    if not m: return "rejected: no suggestion block found"
    try: name = str(json.loads(m.group(1)).get("name", ""))
    except Exception: return "rejected: unreadable suggestion"
    name = re.sub(r"\s+", " ", name).strip()
    if not re.fullmatch(r"[A-Za-z][A-Za-z0-9 ,'()\-]{2,59}", name): return "rejected: the name has unusual characters or is the wrong length"
    data = json.load(open("community.json"))
    if any(x.get("name", "").lower() == name.lower() for x in data): return "already in the shared glossary"
    r = check(name)
    if not r["ok"]: return "not added: " + r["why"]
    entry = {"name": name, "color": "neutral", "match": [name.lower()], "found": "Community added, checked online",
             "reason": "Not yet reviewed by LabelLens, so it is marked neutral. Reference summary: " + r["wiki"]["text"], "world": "",
             "researched": __import__("datetime").date.today().isoformat(),
             "sources": [{"title": "Wikipedia: " + r["wiki"]["title"], "url": r["wiki"]["url"]},
                         {"title": f"PubMed: {r['count']} papers on food and diet", "url": "https://pubmed.ncbi.nlm.nih.gov/?term=" + urllib.parse.quote(r["term"])}],
             "papers": r["papers"]}
    data.append(entry)
    json.dump(data, open("community.json", "w"), indent=2, ensure_ascii=False); open("community.json", "a").write("\n")
    return "added"

if __name__ == "__main__":
    res = main(); print(res)
    open(os.environ.get("GITHUB_OUTPUT", "/dev/null"), "a").write("result=" + res + "\n")
