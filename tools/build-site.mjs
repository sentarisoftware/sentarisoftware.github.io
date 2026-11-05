// Rebuilds the static sections of index.html from site-data.json.
// Usage: node tools/build-site.mjs   (then commit index.html and site-data.json)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderSiteData } from '../site-render.js';

const START = '<!-- site-data:start -->';
const END = '<!-- site-data:end -->';

export function applyToHtml(html, data) {
  const a = html.indexOf(START);
  const b = html.indexOf(END);
  if (a < 0 || b < a) throw new Error(`index.html needs both ${START} and ${END} markers`);
  return html.slice(0, a + START.length) + '\n' + renderSiteData(data) + '\n' + html.slice(b);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const data = JSON.parse(readFileSync(root + 'site-data.json', 'utf8'));
  const before = readFileSync(root + 'index.html', 'utf8');
  const after = applyToHtml(before, data);
  if (after === before) console.log('index.html already matches site-data.json');
  else { writeFileSync(root + 'index.html', after); console.log('index.html rebuilt from site-data.json'); }
}
