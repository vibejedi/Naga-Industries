# SEO change monitor, from .claude/skills/seo-change-monitor (RomeoSEO seo-skills, MIT licence).
# Copied verbatim; see that skill for usage, severity rules and triage. Standard library only.
"""Usage: seo_snapshot.py snap urls.txt > new.json | seo_snapshot.py diff old.json new.json (exit 1 on Fix now)"""
import gzip, json, re, sys, urllib.error, urllib.parse as up, urllib.request; from html import unescape
def get(url):
    try: r = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "seo-change-monitor/3"}), timeout=20)
    except urllib.error.HTTPError as e: r = e
    except OSError as e: return 0, url, "", str(e)
    b = r.read(); b = gzip.decompress(b) if b[:2] == b"\x1f\x8b" else b
    return r.getcode(), r.geturl(), ", ".join(r.headers.get_all("X-Robots-Tag") or []).lower(), b.decode("utf-8", "replace")
def text(html): return " ".join(unescape(re.sub(r"<[^>]+>", " ", html)).split())
def jsonld(blob):  # every @type in the blob, nested ones included (Offer, PostalAddress, ...)
    found = []; grab = lambda d: found.extend(d["@type"] if isinstance(d.get("@type"), list) else [d.get("@type")]) or d
    try: json.loads(blob, object_hook=grab)
    except ValueError: return ["INVALID_JSON-LD"]
    return [str(t) for t in found if t]
def page(url):
    code, final, x_robots, html = get(url); attr = r"""([\w:-]+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)"""
    tags = [(t.lower(), {k.lower(): unescape(v.strip("\"'")).strip() for k, v in re.findall(attr, raw)})
            for t, raw in re.findall(r"(?is)<(meta|link|a)\s([^>]*)>", re.sub(r"(?is)<script\b.*?</script>", " ", html))]
    full, host = lambda a: up.urljoin(final, a.get("href", "")), up.urlsplit(final).netloc
    meta = {a.get("name", "").lower(): a.get("content", "") for t, a in tags if t == "meta"}
    links = [(a.get("rel", "").lower().split(), a) for t, a in tags if t == "link"]
    robots = " ".join(a.get("content", "") for t, a in tags if t == "meta" and a.get("name", "").lower() in ("robots", "googlebot")).lower()
    body = re.sub(r"(?is)<(head|script|style|noscript|template)\b.*?</\1>", " ", html)
    return dict(status=code, final_url=final, robots=robots, x_robots=x_robots, description=meta.get("description"),
        noindex=bool(re.search(r"(?<![\w:-])(noindex|none)\b", robots + " " + x_robots)),
        title=text("".join(re.findall(r"(?is)<title[^>]*>(.*?)</title>", html)[:1])),
        h1=[text(h) for h in re.findall(r"(?is)<h1\b[^>]*>(.*?)</h1>", html)], words=len(re.findall(r"\w+", text(body))),
        canonical=next((full(a) for rel, a in links if "canonical" in rel), None),
        hreflang={a["hreflang"].lower(): full(a) for rel, a in links if "alternate" in rel and "hreflang" in a},
        internal_links=sum(up.urlsplit(full(a)).netloc == host for t, a in tags if t == "a" and a.get("href", "")[:1] not in "#"),
        schema=sorted({t for s in re.findall(r"(?is)<script[^>]*ld\+json[^>]*>(.*?)</script>", html) for t in jsonld(s)}))
def sitemap_count(url, depth=0):  # follows one level of sitemap index; reads .xml.gz too
    xml = get(url)[3]; locs = [unescape(l) for l in re.findall(r"<loc>\s*(.*?)\s*</loc>", xml)]
    return sum(sitemap_count(l, 1) for l in locs) if "<sitemapindex" in xml and depth == 0 else len(locs)
def snap(urls):
    origin = "{0.scheme}://{0.netloc}".format(up.urlsplit(urls[0])); code, _, _, txt = get(origin + "/robots.txt")
    txt = txt if code == 200 else ""; maps = re.findall(r"(?im)^\s*sitemap:\s*(\S+)", txt) or [origin + "/sitemap.xml"]
    return dict(robots_status=code, robots_txt=txt, sitemap_urls=sum(map(sitemap_count, maps)), pages={u: page(u) for u in urls})
def rules(t):  # {"googlebot|disallow:/x", ...}: every rule keyed by each user-agent in its group
    out, agents, in_rules = set(), [], False
    for l in t.splitlines():
        k, _, v = re.sub(r"\s+", "", l.split("#")[0]).lower().partition(":")
        if k == "user-agent": agents, in_rules = ([] if in_rules else agents) + [v], False
        elif k in ("allow", "disallow"): in_rules = True; out |= {f"{ua}|{k}:{v}" for ua in agents}
    return out
def diff(a, b):
    out, bad, site = [], lambda c: c == 0 or c >= 500, lambda lvl, k, old, new: out.append((lvl, "site", k, old, new))
    for r in sorted(rules(b["robots_txt"]) - rules(a["robots_txt"])):  # a Disallow for *, Googlebot or Bingbot can hide the site
        ua, rule = r.split("|", 1); rule != "disallow:" and rule.startswith("dis") and site("Fix now" if ua in ("*", "googlebot", "bingbot") else "Fix next", "robots.txt new rule", "", r)
    for r in sorted(r for r in rules(a["robots_txt"]) - rules(b["robots_txt"]) if "|allow:" in r): site("Fix next", "robots.txt allow removed", r, "")
    if bad(b["robots_status"]) > bad(a["robots_status"]): site("Fix now", "robots.txt status", a["robots_status"], b["robots_status"])
    if (sm := (a["sitemap_urls"], b["sitemap_urls"]))[1] < 0.9 * sm[0]: site("Fix next" if sm[1] else "Fix now", "sitemap URLs", *sm)
    for u, o in a["pages"].items():
        if not (n := b["pages"].get(u)): out.append(("Fix next", u, "page", "in baseline", "missing")); continue
        f = lambda lvl, k, old=None, new=None: out.append((lvl, u, k, o[k] if old is None else old, n[k] if new is None else new))
        if o["status"] == 200 != n["status"]: f("Fix now", "status")
        if n["noindex"] != o["noindex"]: f("Fix now" if n["noindex"] else "Fix next", "noindex")
        if n["canonical"] != o["canonical"]: f("Fix now" if n["canonical"] not in (None, n["final_url"]) else "Fix next", "canonical")
        for k in ("final_url", "title", "h1", "hreflang"): o[k] != n[k] and f("Fix next", k)
        if gone := sorted(set(o["schema"]) - set(n["schema"])): f("Fix next", "schema removed", gone, "")
        if n["internal_links"] < 0.7 * o["internal_links"]: f("Fix next", "internal_links")
        if n["description"] != o["description"]: f("Worth doing", "description")
        if (drift := abs(n["words"] - o["words"]) / max(o["words"], 1)) > 0.1: f("Fix next" if drift > 0.3 else "Leave it", "words")
    for row in sorted(out, key=lambda r: ["Fix now", "Fix next", "Worth doing", "Leave it"].index(r[0])): print(" | ".join(map(str, row)))
    return int(any(r[0] == "Fix now" for r in out))
cmd, args = (sys.argv[1:] or ["help"])[0], sys.argv[2:]
if cmd == "snap": print(json.dumps(snap([l.strip() for l in open(args[0]) if l.strip()[:1] not in "#"]), indent=1))
else: sys.exit(diff(*(json.load(open(f)) for f in args)) if cmd == "diff" else __doc__)
