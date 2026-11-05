import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderSiteData } from '../site-render.js';
import { applyToHtml } from '../tools/build-site.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(root + p, 'utf8');

const sample = {
  services: [{ title: 'Zoho Books setup', summary: 'Books that match <how> you work', points: ['Chart of accounts'], source: 's' }],
  capabilities: [{ group: 'Accounting', items: ['Zoho Books', 'Stripe'], source: 's' }],
  shipped: [
    { title: 'File Extractor', tag: 'live demo', outcome: 'Pulls fields out of documents.', link: 'https://demo.sentarisoftware.com', linkText: 'Open it', source: 's' },
    { title: 'Private system', tag: 'production', outcome: 'Runs daily.', source: 's' },
  ],
  certifications: [],
};

describe('renderSiteData', () => {
  it('renders every service, capability group and shipped item, with links only where given', () => {
    const html = renderSiteData(sample);
    expect(html).toContain('Zoho Books setup');
    expect(html).toContain('Chart of accounts');
    expect(html).toContain('Accounting');
    expect(html).toContain('Stripe');
    expect(html).toContain('href="https://demo.sentarisoftware.com"');
    expect(html).toContain('Private system');
    expect((html.match(/<a /g) || []).length).toBe(1);
  });

  it('leads a shipped card with its picture, sized and lazy loaded, when one is given', () => {
    const withImg = { ...sample, shipped: [{ ...sample.shipped[0], image: { src: '/media/x.webp', alt: 'Queue "view"', width: 888, height: 551 } }, sample.shipped[1]] };
    const html = renderSiteData(withImg);
    expect(html).toContain('<img src="/media/x.webp" alt="Queue &quot;view&quot;" width="888" height="551" loading="lazy" decoding="async">');
    expect(html.indexOf('<img')).toBeLessThan(html.indexOf('File Extractor</h3>'));
    expect((html.match(/<img /g) || []).length).toBe(1);
  });

  it('renders capability items as chips', () => {
    expect(renderSiteData(sample)).toContain('<ul class="chips"><li>Zoho Books</li><li>Stripe</li></ul>');
  });

  it('escapes HTML in data', () => {
    expect(renderSiteData(sample)).toContain('match &lt;how&gt; you work');
  });

  it('omits the certifications block when there are none, and shows it when there are', () => {
    expect(renderSiteData(sample)).not.toContain('id="certifications"');
    const withCert = { ...sample, certifications: [{ name: 'Example Cert', issuer: 'Issuer', year: '2026', source: 's' }] };
    expect(renderSiteData(withCert)).toContain('id="certifications"');
    expect(renderSiteData(withCert)).toContain('Example Cert');
  });
});

describe('applyToHtml', () => {
  it('replaces only what sits between the markers', () => {
    const page = 'top<!-- site-data:start -->old<!-- site-data:end -->bottom';
    const out = applyToHtml(page, sample);
    expect(out.startsWith('top<!-- site-data:start -->')).toBe(true);
    expect(out.endsWith('<!-- site-data:end -->bottom')).toBe(true);
    expect(out).not.toContain('old');
    expect(out).toContain('Zoho Books setup');
  });

  it('refuses a page without both markers', () => {
    expect(() => applyToHtml('no markers here', sample)).toThrow(/marker/);
  });
});

describe('the real site', () => {
  const data = JSON.parse(read('site-data.json'));
  const index = read('index.html');

  it('gives every site-data entry a source note', () => {
    for (const key of ['services', 'capabilities', 'shipped', 'certifications']) {
      expect(Array.isArray(data[key])).toBe(true);
      for (const entry of data[key]) expect(typeof entry.source === 'string' && entry.source.length > 0).toBe(true);
    }
  });

  it('has index.html in sync with site-data.json (run node tools/build-site.mjs)', () => {
    expect(applyToHtml(index, data)).toBe(index);
  });

  it('never names the club or uses dashes the owner bans', () => {
    for (const text of [index, read('site-data.json')]) {
      expect(text).not.toMatch(/vagabond|rv-stl/i);
      expect(text).not.toMatch(/[–—]/);
    }
  });
});
