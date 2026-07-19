# Design: SEO Content Engine (v1) — automated blog generation skill

**Date:** 2026-07-19
**Status:** Design approved; pending spec review → implementation plan
**Scope:** Sub-project B of the SEO content initiative. A Claude Code **skill** that
generates demand-grounded, on-brand, SEO-optimized blog posts for sentarisoftware.com,
with a human review gate before publish. (Sub-project A — folding the keyword layer into
the audit tool — is a separate later spec.)

## Context & goal
The SEO **audit tool** (Lead Pipeline, v2 shipped) grades sites and finds problems. It does
not *produce* ranking content — the single biggest gap identified when reviewing our own
site (grade B, thin content) and the competing "Claude Code SEO" method (Jono Catliff video).
This engine fills that gap: it manufactures the ranking pages that actually earn clicks.

**v1 target:** sentarisoftware.com only. Scale to multi-site later.

## Decisions locked (from brainstorming)
- **Content type:** blog posts only (service pages deferred).
- **Idea generation:** fully automatic. The engine generates topic ideas itself from business
  context, grounds them in real searches, and picks the next keyword. An optional manual steer
  (`blog about <topic>`) exists but is never required.
- **Keyword data (free-first):** Google autocomplete + "People Also Ask" for demand grounding.
  No paid data in v1. DataForSEO (volume/difficulty) and GSC (striking-distance) are designed
  as clean later drop-ins, not built now.
- **Publish model:** human **review gate**. Draft → browser preview → explicit approval →
  commit + push. No auto-publish in v1 (scheduled mode deferred).
- **Images:** Pexels API (free), auto-pulled, with descriptive alt text.
- **Dogfooding acceptance:** every produced page must score **A** on our own SEO audit tool.

## Architecture
A Claude Code skill in the master skills folder that operates on the **site repo**
(`Websites/Sentari Software`). Claude does the reasoning (themes, keyword judgment, writing,
competitor synthesis); deterministic Node scripts do fetching/publishing — matching the
"probabilistic reasons, deterministic executes" principle.

### Pipeline (`blog` [optional `about <topic>`])
```
1. IDEA GEN     brand/ICP context + site  → Claude brainstorms ~5-8 ICP themes
2. GROUND       each theme → Google autocomplete + PAA → real long-tail keyword pool
3. PICK         filter to intent-bearing long-tail; dedupe vs published.json; pick next
                (manual steer skips step 1, seeds step 2 directly)
4. RESEARCH     top results for the keyword → WebFetch top 3-5 → coverage + gaps
5. DRAFT        Claude writes in brand voice, SEO-structured (see Draft rules)
6. IMAGE        Pexels API → royalty-free image + alt text → blog/media/
7. RENDER       inject into _template.html (site design + schema/OG/canonical)
8. PREVIEW      write blog/drafts/<slug>.html → open in browser; nothing committed
9. PUBLISH      (approval) → blog/<slug>.html; update sitemap.xml, published.json,
                blog/index.html listing; commit + push (Pages deploys)
```

### Separation of concerns: skill logic vs. site content
- **Skill logic + tests travel with the skill** (site-agnostic, reused when we scale to more
  sites): the deterministic scripts and their unit tests live in the skill folder under the
  master skills directory.
- **Content + per-site config live in the site repo** (site-specific, versioned with the
  content): `brand.md`, `_template.html`, `blog/`, `published.json`. When we scale multi-site,
  each site carries its own copies of these; the skill scripts stay single-source.
- The skill takes the **site repo path** as its operating target (v1 hardcodes/discovers
  `Websites/Sentari Software`; multi-site later passes it as an argument).

### Files in the site repo (versioned with the content)
- `blog/<slug>.html` — published posts
- `blog/drafts/<slug>.html` — pending review
- `blog/index.html` — internal listing so posts are crawlable, not orphaned
- `blog/media/` — Pexels images
- `seo/brand.md` — one-time business/ICP/voice context (powers steps 1 & 5)
- `seo/published.json` — manifest of used keywords/slugs (powers dedupe)
- `blog/_template.html` — locked technical-SEO template

### Scripts in the skill folder (deterministic, unit-tested with `node --test`)
- `keywords.js` — Google autocomplete + PAA fetch/parse → candidate list; dedupe against a
  passed-in `published.json`
- `pexels.js` — Pexels API image fetch (key in an ignored `.env`, never committed)
- `publish.js` — deterministic file mutations only: move draft → live, update sitemap.xml +
  published.json + blog/index.html. **Git commit + push is done by the skill/Claude** (after
  approval) so commit messages stay contextual — the script never touches git.

## One-time setup (bootstrapped as part of the build)
### `seo/brand.md`
- What Sentari does + ICP (drives idea generation).
- Voice & tone: team voice ("we/us/our"), plain-language, no hype — drafted **from the live
  `index.html`** so it matches production, then Cartrel edits.
- Do's/don'ts: no private client names, no over-promising, CTAs route to
  `info@sentarisoftware.com` / booking link.
- Internal-linking targets: home, seo-check, contact.

### `blog/_template.html`
- Exact site nav/footer/fonts/CSS variables (visually identical to the site).
- Pre-baked `<head>`: title/meta slots, canonical, Open Graph + Twitter card, viewport,
  **JSON-LD `Article` + `BreadcrumbList`**.
- Content slots: H1, answer-first intro, body, image, FAQ (`FAQPage` schema), CTA.
- **Acceptance test: the template scores A on our own audit tool.**

### Draft rules (on-page SEO the writer must hit)
- Keyword-bearing `<title>` (50-60 chars) + meta description (120-160).
- Exactly one `<h1>`; `<h2>` section structure.
- **Answer-first opening paragraph** (AI-search citability).
- Natural keyword cluster; FAQ block; internal links to existing pages.
- Length driven by what competitor research shows is needed to compete.

## Error handling (fail safe; never publish junk)
- Autocomplete/PAA empty/down → Claude-only ideas, **flagged in preview** as not
  demand-grounded.
- Pexels fails/no match → publish text-only, note missing image (don't block).
- No unused keyword → stop and report (never republish a used keyword).
- A competitor fetch fails → skip that source, continue.
- The **review gate** is the backstop: worst case is a weak *draft*, never a bad *published page*.

## Testing
- Unit tests for all deterministic scripts (autocomplete/PAA parse, dedupe, Pexels mocked,
  sitemap/manifest/index update, template render → valid HTML).
- **Dogfood acceptance:** a generated draft run through the audit tool scores **A**.
- **Dry-run mode:** produce a full draft with no git action.

## Definition of done (v1)
1. `blog` produces a demand-grounded, on-brand, image-included draft that previews in browser.
2. On approval: publishes to `blog/<slug>.html`, updates sitemap + manifest + blog index,
   commits + pushes; Pages serves it live.
3. The published page scores **A** on the audit tool.
4. `blog about <topic>` steer works.
5. Scripts unit-tested and green.

## Out of scope for v1 (clean later drop-ins)
Service pages; DataForSEO volume/KD scoring; GSC striking-distance keywords; multi-site
parameterization; scheduled auto-publish. Security headers (HSTS/CSP) are a GitHub Pages
hosting limit and out of this engine's control — tracked separately (Cloudflare move).
