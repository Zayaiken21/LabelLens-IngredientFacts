"""Append the JSON block from an approved issue to community.json after strict validation."""
import json, os, re, sys
body = os.environ.get("ISSUE_BODY", "")
m = re.search(r"```json\s*(\{.*?\})\s*```", body, re.S)
if not m:
    sys.exit("no JSON block found")
e = json.loads(m.group(1))
def s(v, n): return v.strip()[:n] if isinstance(v, str) else ""
def links(a): return [{"title": s(x.get("title"), 200) or x["url"], "url": x["url"]} for x in (a if isinstance(a, list) else [])[:8]
                      if isinstance(x, dict) and isinstance(x.get("url"), str) and x["url"].startswith("https://")]
name = s(e.get("name"), 80)
color = e.get("color")
match = [s(x, 80).lower() for x in e.get("match", []) if isinstance(x, str) and s(x, 80)][:10]
if not name or color not in ("red", "yellow", "green", "neutral") or not match:
    sys.exit("invalid entry")
entry = {"name": name, "color": color, "match": match, "found": s(e.get("found"), 200) or "Community added",
         "reason": s(e.get("reason"), 1200), "world": s(e.get("world"), 800), "researched": s(e.get("researched"), 10),
         "sources": links(e.get("sources")), "papers": links(e.get("papers"))}
data = json.load(open("community.json"))
if any(x.get("name", "").lower() == name.lower() for x in data):
    sys.exit("already present")
data.append(entry)
json.dump(data, open("community.json", "w"), indent=2, ensure_ascii=False)
open("community.json", "a").write("\n")
