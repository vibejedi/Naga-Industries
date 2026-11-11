# SEO and AI search

The SEO skills live in `.claude/skills/`. They come from RomeoSEO/seo-skills at commit 28afba2, under the MIT licence; a copy of the licence sits in each skill folder. Claude Code loads them automatically.

| Skill | What it produced here |
|---|---|
| technical-seo-audit | Canonical tags; one H1 per page that describes it; fixed dead `href="#"` footer links; links point at `/`, not `index.html`; `vercel.json` 308-redirects `/index.html` to `/` |
| schema-markup | One JSON-LD `@graph` per page. Organization and WebSite on every page, WebPage/ItemPage/AboutPage, and Product + Offer only where the price is confirmed (LAKAN II): price, PreOrder, DHL shipping zones |
| xml-sitemap-check | `sitemap.xml`, generated from `seo/site.json`; `lastmod` comes from git |
| ai-agent-readiness | `robots.txt` (all crawlers allowed, `/api/` blocked), `llms.txt`, an accessible order form with labelled fields |
| ai-brand-facts | `about.html` (the visible fact sheet) and `seo/brand-facts.md` |
| ai-traffic-analytics | `assets/js/naga-analytics.js` (Vercel Analytics + GA4, AI referral tagging), "How did you hear about Naga?" on order forms |
| seo-change-monitor | `seo/seo_snapshot.py`, `seo/urls.txt`, `.github/workflows/seo.yml` |
| ai-prompt-research | `seo/prompts-ph-2026-11.csv` / `.txt`: a starter set, all `inferred` until checked against real queries |
| comparison-page-writer + seo-content-qa | `seo/drafts/lakan-ii-vs-rtx-5060-laptops.md`: blocked; the QA score and open issues are inside |

## Commands

- `npm run seo` regenerates every page's `<!-- seo -->` head block, plus `sitemap.xml`, `robots.txt` and `llms.txt`. The inputs are `seo/site.json` and `assets/data/store.json`. Run it after changing a title, description, price or page list. Don't hand-edit the generated block.
- `npm run seo:check` fails if a generated file is stale. CI runs it on every PR.
- `npm run seo:snap` snapshots production into `after.json`. `npm run seo:diff` compares that snapshot with `seo/baseline.json`.

## To do after launch (needs you)

1. **Domain.** In Vercel → Domains, make `naga.industries` the primary domain and redirect `www.naga.industries` to it with a 308.
2. **Vercel Analytics.** Turn it on in Vercel → Project → Analytics. The script is already wired up and loads only on naga.industries.
3. **GA4.** Create a property and paste the `G-…` ID into `GA4_ID` at the top of `assets/js/naga-analytics.js`.
   - Under Admin → Data display → Channel groups, copy the default group and add a channel called **AI referrals (custom)** above Referral. Use the condition *Session source matches regex*:
     `.*(chatgpt|openai|perplexity|gemini\.google|copilot|claude\.ai|deepseek|grok\.com|meta\.ai|mistral\.ai).*`
   - Mark `generate_lead` and `purchase` as key events.
4. **Search Console and Bing Webmaster Tools.** Verify the domain with a DNS TXT record, then submit `https://naga.industries/sitemap.xml` in both.
5. **Baseline for the monitor.** Run `npm run seo:snap && cp after.json seo/baseline.json`, then commit the baseline. From then on the daily workflow flags regressions.
6. **Rich results.** Paste `https://naga.industries/lakan-ii.html` into Google's Rich Results Test and the Schema Markup Validator.
7. **Monthly AI report.** Use the template in `.claude/skills/ai-traffic-analytics`. Its sources are GA4's AI channel, Search Console's Generative AI report, Bing's AI Performance report and the "How did you hear about Naga?" answers recorded with each order.

## Policy decisions to revisit

- **AI training crawlers are allowed.** GPTBot, ClaudeBot, CCBot and Google-Extended can crawl the site, so models learn the correct facts about Naga. To opt out of training while staying in AI search, add the group shown in `robots.txt`, using `scripts/seo.js`.
- **Page titles were rewritten for search.** No page was ranking before launch, so this carries no risk now. After launch, treat any title change as a tracked change; the monitor flags it.
