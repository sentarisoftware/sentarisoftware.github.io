# SEO Content Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Claude Code skill that auto-generates demand-grounded, on-brand, SEO-optimized blog posts for sentarisoftware.com with a human review gate before publish.

**Architecture:** A skill at `C:\Sentari Software\Global\Skills\seo-content\` holds the orchestration (`SKILL.md`) and four deterministic, unit-tested Node scripts (keyword discovery, Pexels images, template render, publish mutations). Content and per-site config (`brand.md`, `_template.html`, `blog/`, `published.json`) live in the site repo `C:\Sentari Software\Projects\Sentari Software\Websites\Sentari Software`. Claude reasons (themes, keyword choice, writing, competitor synthesis); scripts fetch and publish.

**Tech Stack:** Node 24 (built-in `fetch`, `node --test`), CommonJS. Google autocomplete endpoint (free, no key). Pexels API (free key). Plain static HTML on GitHub Pages.

---

## Conventions
- **Skill dir:** `C:\Sentari Software\Global\Skills\seo-content` (its own git repo: `sentarisoftware/skills`, branch `master`).
- **Site dir:** `C:\Sentari Software\Projects\Sentari Software\Websites\Sentari Software` (repo `sentarisoftware.github.io`, branch `main`).
- Run script tests from the skill dir: `node --test`.
- Every commit lands in the repo that owns the file being changed. Each task states which.
- Scripts are CommonJS (`module.exports` / `require`), matching Lead Pipeline style.

---

## Task 1: Keyword discovery — `suggest()` (Google autocomplete)

**Files:**
- Create: `C:\Sentari Software\Global\Skills\seo-content\scripts\keywords.js`
- Test: `C:\Sentari Software\Global\Skills\seo-content\scripts\keywords.test.js`

- [ ] **Step 1: Write the failing test**

```js
// keywords.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { suggest } = require('./keywords');

const fakeFetch = (payload, ok = true) => async () => ({ ok, json: async () => payload });

test('suggest parses the firefox-client autocomplete shape', async () => {
  const out = await suggest('plumber', { fetchImpl: fakeFetch(['plumber', ['plumber near me', 'plumber cost']]) });
  assert.deepStrictEqual(out, ['plumber near me', 'plumber cost']);
});

test('suggest returns [] on a non-OK response', async () => {
  const out = await suggest('x', { fetchImpl: fakeFetch({}, false) });
  assert.deepStrictEqual(out, []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "C:\Sentari Software\Global\Skills\seo-content" && node --test scripts/keywords.test.js`
Expected: FAIL — `Cannot find module './keywords'`.

- [ ] **Step 3: Write minimal implementation**

```js
// keywords.js
// Google autocomplete (free, no key). The firefox client returns clean JSON:
//   ["query", ["suggestion1","suggestion2", ...]]
async function suggest(query, { fetchImpl = fetch } = {}) {
  const url = 'https://suggestqueries.google.com/complete/search?client=firefox&q=' + encodeURIComponent(query);
  const res = await fetchImpl(url, { headers: { 'user-agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [];
}

module.exports = { suggest };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "C:\Sentari Software\Global\Skills\seo-content" && node --test scripts/keywords.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
cd "C:\Sentari Software\Global\Skills\seo-content"
git add scripts/keywords.js scripts/keywords.test.js
git commit -m "feat(seo-content): keyword autocomplete suggest()"
```

---

## Task 2: Keyword discovery — `expandTheme()` + `filterCandidates()`

**Files:**
- Modify: `C:\Sentari Software\Global\Skills\seo-content\scripts\keywords.js`
- Test: `C:\Sentari Software\Global\Skills\seo-content\scripts\keywords.test.js`

- [ ] **Step 1: Write the failing tests (append)**

```js
const { expandTheme, filterCandidates, MODIFIERS } = require('./keywords');

test('expandTheme queries each modifier and dedupes lowercased results', async () => {
  const calls = [];
  const fetchImpl = async (url) => { calls.push(decodeURIComponent(url.split('q=')[1])); return { ok: true, json: async () => ['x', ['Customer Intake Software', 'customer intake software']] }; };
  const out = await expandTheme('customer intake', { fetchImpl });
  assert.strictEqual(calls.length, MODIFIERS.length);
  assert.ok(out.includes('customer intake software'));
  assert.strictEqual(out.filter((k) => k === 'customer intake software').length, 1); // deduped
});

test('filterCandidates keeps long-tail (>=3 words) and drops published', () => {
  const out = filterCandidates(['best crm', 'how to automate customer intake', 'shared inbox alternatives for teams'], ['how to automate customer intake']);
  assert.deepStrictEqual(out, ['shared inbox alternatives for teams']); // 'best crm' too short; the published one dropped
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "C:\Sentari Software\Global\Skills\seo-content" && node --test scripts/keywords.test.js`
Expected: FAIL — `expandTheme is not a function`.

- [ ] **Step 3: Write minimal implementation (append before `module.exports`, and extend the export)**

```js
const MODIFIERS = ['', 'how to', 'what is', 'best', 'for small business', 'alternatives', 'software', 'examples', 'vs', 'guide'];

// Expand a theme into grounded long-tail keywords via autocomplete with modifiers.
async function expandTheme(theme, { fetchImpl = fetch } = {}) {
  const out = new Set();
  for (const m of MODIFIERS) {
    const q = m ? `${m} ${theme}` : theme;
    let s = [];
    try { s = await suggest(q, { fetchImpl }); } catch { s = []; }
    for (const k of s) out.add(String(k).toLowerCase().trim());
  }
  return [...out];
}

// Long-tail (>=3 words), not already published, most-specific first.
function filterCandidates(keywords, publishedKeywords = []) {
  const used = new Set(publishedKeywords.map((k) => String(k).toLowerCase().trim()));
  return keywords
    .filter((k) => k && k.split(/\s+/).length >= 3 && !used.has(k.toLowerCase().trim()))
    .sort((a, b) => b.length - a.length);
}
```

Change the export line to:

```js
module.exports = { suggest, expandTheme, filterCandidates, MODIFIERS };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "C:\Sentari Software\Global\Skills\seo-content" && node --test scripts/keywords.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
cd "C:\Sentari Software\Global\Skills\seo-content"
git add scripts/keywords.js scripts/keywords.test.js
git commit -m "feat(seo-content): expandTheme + filterCandidates"
```

---

## Task 3: Pexels images — `searchImage()` + `downloadImage()`

**Files:**
- Create: `C:\Sentari Software\Global\Skills\seo-content\scripts\pexels.js`
- Test: `C:\Sentari Software\Global\Skills\seo-content\scripts\pexels.test.js`

- [ ] **Step 1: Write the failing test**

```js
// pexels.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { searchImage, downloadImage } = require('./pexels');

test('searchImage returns the first photo normalized', async () => {
  const payload = { photos: [{ src: { large: 'https://img/large.jpg', original: 'https://img/o.jpg' }, photographer: 'Jane', alt: 'a plumber at work' }] };
  const out = await searchImage('plumbing', { apiKey: 'k', fetchImpl: async () => ({ ok: true, json: async () => payload }) });
  assert.strictEqual(out.url, 'https://img/large.jpg');
  assert.strictEqual(out.alt, 'a plumber at work');
});

test('searchImage returns null when no api key', async () => {
  assert.strictEqual(await searchImage('x', { apiKey: '' }), null);
});

test('downloadImage writes bytes to disk', async () => {
  const dest = path.join(os.tmpdir(), `pexels-${Date.now()}.jpg`);
  const fetchImpl = async () => ({ ok: true, arrayBuffer: async () => new TextEncoder().encode('JPEGDATA').buffer });
  await downloadImage('https://img/large.jpg', dest, { fetchImpl });
  assert.strictEqual(fs.readFileSync(dest, 'utf8'), 'JPEGDATA');
  fs.unlinkSync(dest);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "C:\Sentari Software\Global\Skills\seo-content" && node --test scripts/pexels.test.js`
Expected: FAIL — `Cannot find module './pexels'`.

- [ ] **Step 3: Write minimal implementation**

```js
// pexels.js
const fs = require('node:fs/promises');

async function searchImage(query, { apiKey, fetchImpl = fetch } = {}) {
  if (!apiKey) return null;
  const url = 'https://api.pexels.com/v1/search?per_page=1&orientation=landscape&query=' + encodeURIComponent(query);
  const res = await fetchImpl(url, { headers: { authorization: apiKey }, signal: AbortSignal.timeout(10000) });
  if (!res.ok) return null;
  const data = await res.json();
  const p = data && data.photos && data.photos[0];
  if (!p) return null;
  return { url: p.src && (p.src.large || p.src.original), photographer: p.photographer, alt: p.alt || query };
}

async function downloadImage(url, destPath, { fetchImpl = fetch } = {}) {
  const res = await fetchImpl(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error('image download failed: ' + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(destPath, buf);
  return destPath;
}

module.exports = { searchImage, downloadImage };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "C:\Sentari Software\Global\Skills\seo-content" && node --test scripts/pexels.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd "C:\Sentari Software\Global\Skills\seo-content"
git add scripts/pexels.js scripts/pexels.test.js
git commit -m "feat(seo-content): Pexels searchImage + downloadImage"
```

---

## Task 4: Render — `renderPost()` fills the template with correct technical SEO

**Files:**
- Create: `C:\Sentari Software\Global\Skills\seo-content\scripts\render.js`
- Test: `C:\Sentari Software\Global\Skills\seo-content\scripts\render.test.js`

- [ ] **Step 1: Write the failing test**

```js
// render.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { renderPost, esc } = require('./render');

const TEMPLATE = `<title>{{TITLE}}</title><meta name="description" content="{{META_DESCRIPTION}}">
<link rel="canonical" href="{{CANONICAL}}"><script type="application/ld+json">{{ARTICLE_SCHEMA}}</script>
<script type="application/ld+json">{{FAQ_SCHEMA}}</script><h1>{{H1}}</h1>{{IMAGE_TAG}}{{INTRO}}{{BODY}}{{FAQ_HTML}}`;

const data = {
  title: 'How to Automate Customer Intake', metaDescription: 'A practical guide.', slug: 'automate-customer-intake',
  date: '2026-07-19', h1: 'How to Automate Customer Intake', introHtml: '<p>Answer first.</p>', bodyHtml: '<h2>Step 1</h2><p>Do it.</p>',
  faqs: [{ q: 'Is it hard?', a: 'No.' }], image: { file: 'intake.jpg', alt: 'a tidy intake queue' }, keyword: 'how to automate customer intake'
};

test('renderPost fills every placeholder (no leftovers)', () => {
  const html = renderPost(TEMPLATE, data);
  assert.ok(!/\{\{\w+\}\}/.test(html), 'no unfilled placeholders');
});

test('renderPost injects canonical, one h1, image with alt, and valid JSON-LD', () => {
  const html = renderPost(TEMPLATE, data);
  assert.match(html, /canonical" href="https:\/\/sentarisoftware\.com\/blog\/automate-customer-intake\.html"/);
  assert.strictEqual((html.match(/<h1>/g) || []).length, 1);
  assert.match(html, /<img src="\/blog\/media\/intake\.jpg" alt="a tidy intake queue"/);
  const article = JSON.parse(html.match(/ld\+json">(\{"@context":"https:\/\/schema\.org","@type":"Article"[\s\S]*?\})<\/script>/)[1]);
  assert.strictEqual(article.headline, 'How to Automate Customer Intake');
});

test('esc escapes HTML', () => { assert.strictEqual(esc('<a>&"'), '&lt;a&gt;&amp;&quot;'); });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "C:\Sentari Software\Global\Skills\seo-content" && node --test scripts/render.test.js`
Expected: FAIL — `Cannot find module './render'`.

- [ ] **Step 3: Write minimal implementation**

```js
// render.js
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function faqSchema(faqs) {
  return JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: (faqs || []).map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
  });
}

function articleSchema({ title, description, image, url, date }) {
  return JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article', headline: title, description,
    image: image || undefined, datePublished: date, dateModified: date,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Organization', name: 'Sentari Software' },
    publisher: { '@type': 'Organization', name: 'Sentari Software' }
  });
}

function faqHtml(faqs) {
  return (faqs || []).map((f) => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join('\n');
}

// data: {title, metaDescription, slug, date, h1, introHtml, bodyHtml, faqs, image:{file,alt}, keyword}
function renderPost(template, data) {
  const base = 'https://sentarisoftware.com';
  const url = `${base}/blog/${data.slug}.html`;
  const imgUrl = data.image ? `${base}/blog/media/${data.image.file}` : `${base}/og-image.png`;
  const map = {
    TITLE: esc(data.title),
    META_DESCRIPTION: esc(data.metaDescription),
    CANONICAL: url,
    OG_IMAGE: imgUrl,
    H1: esc(data.h1),
    DATE: esc(data.date),
    INTRO: data.introHtml || '',
    BODY: data.bodyHtml || '',
    IMAGE_TAG: data.image ? `<img src="/blog/media/${esc(data.image.file)}" alt="${esc(data.image.alt)}" width="1200" height="675" loading="lazy">` : '',
    FAQ_HTML: faqHtml(data.faqs),
    FAQ_SCHEMA: faqSchema(data.faqs),
    ARTICLE_SCHEMA: articleSchema({ title: data.title, description: data.metaDescription, image: imgUrl, url, date: data.date }),
    SLUG: esc(data.slug)
  };
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in map ? map[k] : ''));
}

module.exports = { renderPost, faqSchema, articleSchema, faqHtml, esc };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "C:\Sentari Software\Global\Skills\seo-content" && node --test scripts/render.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd "C:\Sentari Software\Global\Skills\seo-content"
git add scripts/render.js scripts/render.test.js
git commit -m "feat(seo-content): renderPost template filler with schema"
```

---

## Task 5: Publish mutations — `slugify` / `updateSitemap` / `appendPublished` / `updateBlogIndex`

**Files:**
- Create: `C:\Sentari Software\Global\Skills\seo-content\scripts\publish.js`
- Test: `C:\Sentari Software\Global\Skills\seo-content\scripts\publish.test.js`

- [ ] **Step 1: Write the failing test**

```js
// publish.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { slugify, updateSitemap, appendPublished, updateBlogIndex } = require('./publish');

test('slugify makes url-safe slugs', () => {
  assert.strictEqual(slugify('How to Automate  Customer Intake!'), 'how-to-automate-customer-intake');
});

test('updateSitemap inserts once, idempotent', () => {
  const base = '<?xml version="1.0"?>\n<urlset>\n</urlset>';
  const once = updateSitemap(base, 'https://sentarisoftware.com/blog/x.html');
  assert.match(once, /<loc>https:\/\/sentarisoftware\.com\/blog\/x\.html<\/loc>/);
  const twice = updateSitemap(once, 'https://sentarisoftware.com/blog/x.html');
  assert.strictEqual((twice.match(/blog\/x\.html/g) || []).length, 1);
});

test('appendPublished adds a normalized record', () => {
  const list = appendPublished([], { keyword: 'How To X', slug: 'how-to-x', title: 'How To X', date: '2026-07-19' });
  assert.strictEqual(list[0].keyword, 'how to x');
  assert.strictEqual(list[0].slug, 'how-to-x');
});

test('updateBlogIndex adds a link once, idempotent', () => {
  const base = '<ul>\n<!--POSTS-->\n</ul>';
  const once = updateBlogIndex(base, { slug: 'x', title: 'X', date: '2026-07-19' });
  assert.match(once, /href="\/blog\/x\.html"/);
  const twice = updateBlogIndex(once, { slug: 'x', title: 'X', date: '2026-07-19' });
  assert.strictEqual((twice.match(/blog\/x\.html/g) || []).length, 1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "C:\Sentari Software\Global\Skills\seo-content" && node --test scripts/publish.test.js`
Expected: FAIL — `Cannot find module './publish'`.

- [ ] **Step 3: Write minimal implementation**

```js
// publish.js
function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70);
}

function updateSitemap(sitemapXml, loc, { changefreq = 'monthly', priority = '0.7' } = {}) {
  if (sitemapXml.includes(`<loc>${loc}</loc>`)) return sitemapXml;
  const entry = `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
  return sitemapXml.replace('</urlset>', entry + '</urlset>');
}

function appendPublished(manifest, { keyword, slug, title, date }) {
  const list = Array.isArray(manifest) ? manifest : [];
  list.push({ keyword: String(keyword).toLowerCase().trim(), slug, title, date });
  return list;
}

function updateBlogIndex(indexHtml, { slug, title, date }) {
  if (indexHtml.includes(`/blog/${slug}.html`)) return indexHtml;
  const li = `<li><a href="/blog/${slug}.html">${title}</a> <span>${date}</span></li>`;
  return indexHtml.replace('<!--POSTS-->', li + '\n<!--POSTS-->');
}

module.exports = { slugify, updateSitemap, appendPublished, updateBlogIndex };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "C:\Sentari Software\Global\Skills\seo-content" && node --test scripts/publish.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
cd "C:\Sentari Software\Global\Skills\seo-content"
git add scripts/publish.js scripts/publish.test.js
git commit -m "feat(seo-content): publish mutations (slug/sitemap/manifest/index)"
```

---

## Task 6: Site scaffold — template, brand file, manifest, blog index

**Files (all in the site repo):**
- Create: `blog\_template.html`
- Create: `blog\index.html`
- Create: `blog\drafts\.gitkeep`
- Create: `blog\media\.gitkeep`
- Create: `seo\brand.md`
- Create: `seo\published.json`

- [ ] **Step 1: Create `seo\published.json`**

```json
[]
```

- [ ] **Step 2: Create `blog\_template.html`** (matches the site design system; all `{{PLACEHOLDERS}}` filled by `render.js`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>{{TITLE}} — Sentari Software</title>
<meta name="description" content="{{META_DESCRIPTION}}">
<link rel="canonical" href="{{CANONICAL}}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%230b1220'/%3E%3Ctext x='50' y='72' font-family='Georgia,serif' font-size='64' fill='%23e6b355' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E">
<meta property="og:type" content="article">
<meta property="og:url" content="{{CANONICAL}}">
<meta property="og:title" content="{{TITLE}}">
<meta property="og:description" content="{{META_DESCRIPTION}}">
<meta property="og:image" content="{{OG_IMAGE}}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<script type="application/ld+json">{{ARTICLE_SCHEMA}}</script>
<script type="application/ld+json">{{FAQ_SCHEMA}}</script>
<style>
  :root{--bg:#0b1220;--panel:#122036;--panel-2:#16263f;--white:#fffdf8;--text-dk:#e9eef6;--text-dk-soft:#9db0c8;--line-dk:rgba(255,255,255,.10);--gold:#e6b355;--gold-deep:#c98a2c;--gold-soft:#f0c877;--cyan:#3fd6c6;--serif:'Fraunces',Georgia,serif;--sans:'Inter',-apple-system,Segoe UI,Roboto,sans-serif;--mono:'IBM Plex Mono',ui-monospace,Menlo,monospace}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:var(--sans);color:var(--text-dk);background:var(--bg);line-height:1.7;-webkit-font-smoothing:antialiased}
  .wrap{max-width:760px;margin:0 auto;padding:0 24px}
  h1,h2,h3{font-family:var(--serif);font-weight:600;line-height:1.15;letter-spacing:-.015em}
  a{color:var(--gold)}
  nav{border-bottom:1px solid var(--line-dk);background:rgba(11,18,32,.85)}
  nav .wrap{display:flex;align-items:center;justify-content:space-between;height:66px}
  .logo{font-family:var(--serif);font-size:1.32rem;font-weight:700;color:var(--white);text-decoration:none}
  .logo span{color:var(--gold)}
  article{padding:44px 0}
  article h1{font-size:2.3rem;margin:0 0 10px}
  .meta{color:var(--text-dk-soft);font-size:.85rem;font-family:var(--mono);margin-bottom:22px}
  article img{width:100%;height:auto;border-radius:12px;border:1px solid var(--line-dk);margin:18px 0}
  article h2{font-size:1.5rem;margin:28px 0 10px}
  article p{margin:0 0 14px;color:var(--text-dk)}
  .faq-item{border-top:1px solid var(--line-dk);padding:14px 0}
  .faq-item h3{font-size:1.1rem;margin-bottom:4px}
  .cta{background:linear-gradient(135deg,var(--panel-2),var(--panel));border:1px solid var(--gold-deep);border-radius:12px;padding:20px;margin-top:28px}
  footer{color:var(--text-dk-soft);font-size:.8rem;padding:40px 0;text-align:center}
</style>
</head>
<body>
<nav><div class="wrap"><a class="logo" href="/">Sentari<span>.</span></a><a href="/blog/" style="font-size:.9rem;text-decoration:none;color:var(--text-dk-soft)">← All posts</a></div></nav>
<div class="wrap">
  <article>
    <h1>{{H1}}</h1>
    <div class="meta">Sentari Software · {{DATE}}</div>
    {{IMAGE_TAG}}
    {{INTRO}}
    {{BODY}}
    <h2>Frequently asked questions</h2>
    {{FAQ_HTML}}
    <div class="cta"><strong>Want your operation running like this?</strong><p style="margin:6px 0 0;color:var(--text-dk-soft)">Sentari builds the software small organizations run on. <a href="/#contact">Talk through your system →</a></p></div>
  </article>
</div>
<footer>© Sentari Software. <a href="/">Home</a> · <a href="/seo-check.html">Free SEO check</a></footer>
</body>
</html>
```

- [ ] **Step 3: Create `blog\index.html`** (post listing; `<!--POSTS-->` marker is where `updateBlogIndex` inserts)

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Blog — Sentari Software</title>
<meta name="description" content="Guides on operations software, automation, and getting small organizations off spreadsheets and email.">
<link rel="canonical" href="https://sentarisoftware.com/blog/">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{--bg:#0b1220;--gold:#e6b355;--white:#fffdf8;--text-dk:#e9eef6;--text-dk-soft:#9db0c8;--line-dk:rgba(255,255,255,.10);--serif:'Fraunces',Georgia,serif;--sans:'Inter',sans-serif}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:var(--sans);color:var(--text-dk);background:var(--bg);line-height:1.7}
  .wrap{max-width:760px;margin:0 auto;padding:0 24px}
  nav{border-bottom:1px solid var(--line-dk)}nav .wrap{display:flex;align-items:center;height:66px}
  .logo{font-family:var(--serif);font-size:1.32rem;font-weight:700;color:var(--white);text-decoration:none}.logo span{color:var(--gold)}
  h1{font-family:var(--serif);font-size:2.2rem;margin:40px 0 20px}
  ul{list-style:none}li{border-top:1px solid var(--line-dk);padding:14px 0}li a{color:var(--gold);text-decoration:none;font-size:1.1rem}li span{color:var(--text-dk-soft);font-size:.8rem;margin-left:8px}
  footer{color:var(--text-dk-soft);font-size:.8rem;padding:40px 0;text-align:center}
</style>
</head>
<body>
<nav><div class="wrap"><a class="logo" href="/">Sentari<span>.</span></a></div></nav>
<div class="wrap">
  <h1>Blog</h1>
  <ul>
<!--POSTS-->
  </ul>
</div>
<footer>© Sentari Software. <a href="/">Home</a></footer>
</body>
</html>
```

- [ ] **Step 4: Create `blog\drafts\.gitkeep` and `blog\media\.gitkeep`** (empty files so the dirs exist).

- [ ] **Step 5: Create `seo\brand.md`** (draft from the live homepage voice; Cartrel edits after)

```markdown
# Sentari Software — Brand & Content Context

## What we do
Sentari builds the operating software small organizations actually run on — replacing the
tangle of email, spreadsheets, and memory with dashboards, intake, and automation. Not "just
a website": the system behind the business.

## Ideal customer (ICP)
Owners and operators of small organizations, clubs, trades, and service businesses (5–50
people) who are drowning in manual process — shared inboxes, retyping data, chasing updates.
They are not technical and do not want to become IT people.

## Voice & tone
- **Team voice:** "we / us / our," never "I" or solo-freelancer framing.
- Plain language a busy operator understands. Name the pain plainly; no hype, no jargon salad.
- Confident and concrete. Show the messy-process → clean-system transformation.
- Founder credibility stays in one contained trust line, not the whole piece.

## Do / Don't
- DO route every CTA to `/#contact` (booking / "Talk through your system") or `info@sentarisoftware.com`.
- DO link internally to the homepage and the free SEO check (`/seo-check.html`) where relevant.
- DON'T name private clients or expose Royal Vagabonds / White Party / CWE specifics.
- DON'T over-promise ranking or revenue outcomes.

## Internal-linking targets
- `/` — homepage (Organization OS positioning)
- `/seo-check.html` — free SEO evaluation tool
- `/#contact` — booking / contact

## Post conventions
- Answer-first opening paragraph (2–4 sentences) that directly answers the keyword.
- One H1 (the keyword, naturally phrased); H2 sections; an FAQ block.
- 800–1500 words, driven by what the competitor research shows is needed to compete.
```

- [ ] **Step 6: Commit (site repo)**

```bash
cd "C:\Sentari Software\Projects\Sentari Software\Websites\Sentari Software"
git add blog/_template.html blog/index.html blog/drafts/.gitkeep blog/media/.gitkeep seo/brand.md seo/published.json
git commit -m "feat(seo): blog template, index, brand context, published manifest"
```

---

## Task 7: The orchestration skill — `SKILL.md`

**Files:**
- Create: `C:\Sentari Software\Global\Skills\seo-content\SKILL.md`

- [ ] **Step 1: Write `SKILL.md`**

````markdown
---
name: seo-content
description: Use when Cartrel wants to generate, write, or publish an SEO blog post for sentarisoftware.com — triggers on "blog", "write a blog post", "generate a blog post", "new blog post", "seo content", "publish a post". Produces a demand-grounded, on-brand, SEO-optimized post with a human review gate.
---

# SEO Content Engine

Generates one publish-ready blog post for **sentarisoftware.com**, grounded in real search
demand, written in Sentari's voice, with a **human review gate** before anything goes live.

**Site repo:** `C:\Sentari Software\Projects\Sentari Software\Websites\Sentari Software`
**Scripts:** `C:\Sentari Software\Global\Skills\seo-content\scripts` (run with `node`)

## Trigger
`blog` → auto-pick the next keyword. `blog about <topic>` → steer to that topic.

## Pipeline (do these in order)

1. **Read context.** Read `seo/brand.md` and `seo/published.json` from the site repo.
2. **Ideas.** If steered, use the given topic as the theme. Else brainstorm 5–8 ICP themes from
   `brand.md`. For each theme run:
   `node scripts/keywords.js expand "<theme>"` (prints JSON array of grounded keywords).
   *If it returns empty for every theme (autocomplete down), fall back to your own long-tail
   ideas and NOTE in the preview that they are not demand-grounded.*
3. **Pick.** Combine candidates, call `filterCandidates(all, publishedKeywords)` logic via
   `node scripts/keywords.js filter <published.json> <candidates.json>` (prints the filtered,
   most-specific-first list). Choose the single best keyword: specific, clear intent, relevant
   to the ICP. If none remain, STOP and report "no new keywords — broaden brand.md themes."
4. **Research.** Read the current top-ranking pages for the keyword with `WebFetch` (3–5 URLs).
   Note what they cover and the gaps you will fill. Do not copy — differentiate.
5. **Draft the content object** (JSON) yourself, obeying `brand.md` voice and these rules:
   - `title`: 50–60 chars, keyword near the front.
   - `metaDescription`: 120–160 chars, benefit-led.
   - `h1`: the keyword, naturally phrased.
   - `introHtml`: an **answer-first** 2–4 sentence `<p>` that directly answers the query.
   - `bodyHtml`: `<h2>` sections + `<p>`; 800–1500 words; at least one internal link to `/`,
     `/seo-check.html`, or `/#contact`.
   - `faqs`: 3–5 `{q,a}` pulled from related autocomplete/PAA-style questions.
   - `keyword`, `slug` (`node scripts/publish.js slug "<title>"`), `date` (today, YYYY-MM-DD).
6. **Image.** `node --env-file=.env scripts/pexels.js search "<image query>"` (key from the
   skill's ignored `.env`; see Setup). Download it:
   `node --env-file=.env scripts/pexels.js download <url> <destUnderBlogMedia>`.
   Write descriptive `alt`. If it returns null, proceed text-only and note it.
7. **Render.** `node scripts/render.js <path/to/contentObject.json>` → writes
   `blog/drafts/<slug>.html` using `blog/_template.html`.
8. **Preview + REVIEW GATE.** Open `blog/drafts/<slug>.html` in the browser (use the
   `playwright-demo-qa` skill or `start`), show Cartrel a summary (keyword, title, meta, word
   count, image, whether demand-grounded). **Stop and wait for explicit approval.** Do not
   commit or push.
9. **Publish (only after approval).**
   - `node scripts/publish.js commit <slug> <title> <keyword>` — moves draft → `blog/<slug>.html`,
     updates `sitemap.xml`, `seo/published.json`, `blog/index.html`.
   - Then commit + push the site repo yourself with a contextual message:
     `cd <site repo> && git add blog/ seo/published.json sitemap.xml && git commit -m "content: <title>" && git push origin main`.
   - Confirm the live URL returns 200 after Pages deploys.

## Setup (once)
- Pexels API key: create a free key at pexels.com/api, put it in
  `C:\Sentari Software\Global\Skills\seo-content\.env` as `PEXELS_API_KEY=...` (this file is
  gitignored). The scripts read it via `process.env` (load with `node --env-file=.env`).

## Guardrails
- NEVER auto-publish. The review gate in step 8 is mandatory.
- Publish at a human cadence — one post per run. Do not batch many posts (Google flags spikes).
- Every post must satisfy the on-page rules above (they are what makes it score A on the
  Sentari SEO audit tool). After the first publish, verify by scanning the live URL with the
  audit tool.
````

- [ ] **Step 2: Add the script CLI entry points** so the SKILL's `node scripts/...` commands work.

Append to `scripts/keywords.js` before `module.exports`:

```js
// CLI: node keywords.js expand "<theme>"  |  node keywords.js filter <publishedJsonPath> <candidatesJsonPath>
if (require.main === module) {
  const [, , cmd, a, b] = process.argv;
  (async () => {
    if (cmd === 'expand') { console.log(JSON.stringify(await expandTheme(a))); }
    else if (cmd === 'filter') {
      const fs = require('node:fs');
      const published = JSON.parse(fs.readFileSync(a, 'utf8')).map((r) => r.keyword || r);
      const candidates = JSON.parse(fs.readFileSync(b, 'utf8'));
      console.log(JSON.stringify(filterCandidates(candidates, published)));
    } else { console.error('usage: expand <theme> | filter <published.json> <candidates.json>'); process.exit(1); }
  })();
}
```

Append to `scripts/publish.js` before `module.exports`:

```js
// CLI: node publish.js slug "<title>"  |  node publish.js commit <slug> <title> <keyword>
if (require.main === module) {
  const fs = require('node:fs');
  const path = require('node:path');
  const SITE = 'C:\\Sentari Software\\Projects\\Sentari Software\\Websites\\Sentari Software';
  const [, , cmd, ...rest] = process.argv;
  if (cmd === 'slug') { console.log(slugify(rest.join(' '))); }
  else if (cmd === 'commit') {
    const [slug, title, keyword] = [rest[0], rest[1], rest.slice(2).join(' ')];
    const draft = path.join(SITE, 'blog', 'drafts', `${slug}.html`);
    const live = path.join(SITE, 'blog', `${slug}.html`);
    fs.renameSync(draft, live);
    const date = new Date().toISOString().slice(0, 10);
    const smPath = path.join(SITE, 'sitemap.xml');
    fs.writeFileSync(smPath, updateSitemap(fs.readFileSync(smPath, 'utf8'), `https://sentarisoftware.com/blog/${slug}.html`));
    const mPath = path.join(SITE, 'seo', 'published.json');
    const manifest = appendPublished(JSON.parse(fs.readFileSync(mPath, 'utf8')), { keyword, slug, title, date });
    fs.writeFileSync(mPath, JSON.stringify(manifest, null, 2));
    const iPath = path.join(SITE, 'blog', 'index.html');
    fs.writeFileSync(iPath, updateBlogIndex(fs.readFileSync(iPath, 'utf8'), { slug, title, date }));
    console.log(`published ${slug}`);
  } else { console.error('usage: slug "<title>" | commit <slug> <title> <keyword>'); process.exit(1); }
}
```

Append a CLI to `scripts/render.js` before `module.exports`:

```js
// CLI: node --env-file=.env render.js <contentObject.json>  → writes blog/drafts/<slug>.html
if (require.main === module) {
  const fs = require('node:fs');
  const path = require('node:path');
  const SITE = 'C:\\Sentari Software\\Projects\\Sentari Software\\Websites\\Sentari Software';
  const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const template = fs.readFileSync(path.join(SITE, 'blog', '_template.html'), 'utf8');
  const outDir = path.join(SITE, 'blog', 'drafts');
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${data.slug}.html`);
  fs.writeFileSync(out, renderPost(template, data));
  console.log(out);
}
```

Append a CLI to `scripts/pexels.js` before `module.exports`:

```js
// CLI: node --env-file=.env pexels.js search "<query>"  |  node --env-file=.env pexels.js download <url> <dest>
if (require.main === module) {
  const [, , cmd, a, b] = process.argv;
  (async () => {
    if (cmd === 'search') { console.log(JSON.stringify(await searchImage(a, { apiKey: process.env.PEXELS_API_KEY }))); }
    else if (cmd === 'download') { await downloadImage(a, b); console.log(b); }
    else { console.error('usage: search "<query>" | download <url> <dest>'); process.exit(1); }
  })();
}
```

- [ ] **Step 3: Create the skill's `.gitignore`** at `C:\Sentari Software\Global\Skills\seo-content\.gitignore`:

```
.env
```

- [ ] **Step 4: Re-run all script tests to confirm the CLI additions didn't break anything**

Run: `cd "C:\Sentari Software\Global\Skills\seo-content" && node --test`
Expected: PASS (all tests from Tasks 1–5).

- [ ] **Step 5: Commit (skill repo)**

```bash
cd "C:\Sentari Software\Global\Skills\seo-content"
git add SKILL.md scripts/keywords.js scripts/pexels.js scripts/render.js scripts/publish.js .gitignore
git commit -m "feat(seo-content): SKILL.md orchestration + script CLIs"
```

---

## Task 8: Register, dogfood acceptance, trigger check

**Files:**
- Modify: `C:\Sentari Software\Global\Skills\REGISTRY.md`
- Create: `C:\Sentari Software\Global\Skills\seo-content\scripts\acceptance.test.js`

- [ ] **Step 1: Write the dogfood acceptance test** (proves a rendered post has every on-page signal the audit tool scores — i.e. would grade A)

```js
// acceptance.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { renderPost } = require('./render');

const SITE = 'C:\\Sentari Software\\Projects\\Sentari Software\\Websites\\Sentari Software';
const template = fs.readFileSync(path.join(SITE, 'blog', '_template.html'), 'utf8');

const sample = {
  title: 'How to Automate Customer Intake for Small Teams', metaDescription: 'A plain-language guide to automating customer intake so your small team stops retyping data and losing leads in a shared inbox.',
  slug: 'automate-customer-intake-small-teams', date: '2026-07-19', h1: 'How to Automate Customer Intake for Small Teams',
  introHtml: '<p>Automating customer intake means replacing your shared inbox and manual retyping with a single form-to-record flow. Here is how a small team does it without hiring IT.</p>',
  bodyHtml: '<h2>Why manual intake breaks</h2><p>' + 'word '.repeat(400) + '</p><h2>The fix</h2><p>Start on the <a href="/seo-check.html">free check</a>. ' + 'word '.repeat(400) + '</p>',
  faqs: [{ q: 'Is this hard to set up?', a: 'No.' }, { q: 'What does it cost?', a: 'Less than a hire.' }],
  image: { file: 'intake.jpg', alt: 'a tidy digital intake queue on a laptop' }, keyword: 'how to automate customer intake for small teams'
};

test('a rendered post carries every on-page signal (would score A)', () => {
  const html = renderPost(template, sample);
  assert.ok(sample.title.length >= 40 && sample.title.length <= 65, 'title length');
  assert.ok(sample.metaDescription.length >= 120 && sample.metaDescription.length <= 165, 'meta length');
  assert.strictEqual((html.match(/<h1[ >]/g) || []).length, 1, 'exactly one h1');
  assert.ok((html.match(/<h2[ >]/g) || []).length >= 2, 'has h2 sections');
  assert.match(html, /rel="canonical"/, 'canonical');
  assert.match(html, /property="og:image"/, 'og image');
  assert.match(html, /<img [^>]*alt="[^"]+"/, 'image with alt');
  assert.match(html, /"@type":"Article"/, 'article schema');
  assert.match(html, /"@type":"FAQPage"/, 'faq schema');
  assert.match(html, /href="\/seo-check\.html"/, 'internal link');
  const words = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length;
  assert.ok(words >= 600, `word count ${words} >= 600`);
  assert.ok(!/\{\{\w+\}\}/.test(html), 'no unfilled placeholders');
});
```

- [ ] **Step 2: Run the acceptance test**

Run: `cd "C:\Sentari Software\Global\Skills\seo-content" && node --test scripts/acceptance.test.js`
Expected: PASS (1 test).

- [ ] **Step 3: Register the skill** — add a row to `C:\Sentari Software\Global\Skills\REGISTRY.md` under the appropriate section:

```markdown
| seo-content | Generate + publish demand-grounded SEO blog posts for sentarisoftware.com (review-gated). Trigger: "blog", "write a blog post". | on-demand |
```

(Match the exact column format already used in REGISTRY.md; if the table differs, follow its columns.)

- [ ] **Step 4: Commit (skill repo)**

```bash
cd "C:\Sentari Software\Global\Skills\seo-content"
git add scripts/acceptance.test.js
git commit -m "test(seo-content): dogfood acceptance (post carries A-grade on-page signals)"
cd "C:\Sentari Software\Global\Skills"
git add REGISTRY.md
git commit -m "docs(registry): register seo-content skill"
```

- [ ] **Step 5: Push both repos**

```bash
cd "C:\Sentari Software\Global\Skills" && git push origin master
cd "C:\Sentari Software\Projects\Sentari Software\Websites\Sentari Software" && git push origin main
```

- [ ] **Step 6: Live trigger + end-to-end smoke (manual, with Cartrel)**
  - In a fresh session, confirm typing `blog` loads the `seo-content` skill (trigger check).
  - Run one real post through to the preview gate; confirm the browser preview renders in the site design.
  - Approve, publish, and after Pages deploys, scan the live URL with the SEO audit tool
    (`/seo-scan` on `https://sentarisoftware.com/blog/<slug>.html`) and confirm grade A.

---

## Self-Review notes
- **Spec coverage:** idea-gen (T1–2, SKILL step 2–3), grounding via autocomplete (T1–2), pick/dedupe (T2, T5 manifest), competitor research (SKILL step 4), draft rules (SKILL step 5), Pexels images (T3), locked template + schema (T4, T6), preview/review gate (SKILL step 8), publish + sitemap/manifest/index (T5, T7 CLI), brand.md + template setup (T6), error handling (SKILL steps 2/6/8 fallbacks), testing incl. dogfood A-grade (T8), out-of-scope items untouched. All covered.
- **Placeholder scan:** none — every step has real code/commands.
- **Type consistency:** `filterCandidates(keywords, publishedKeywords)`, `renderPost(template, data)` with `data.image.file`/`data.image.alt`, `updateSitemap`/`appendPublished`/`updateBlogIndex`/`slugify` names match across tasks and the SKILL CLIs.
