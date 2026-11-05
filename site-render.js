// Renders the data-driven sections of the home page from site-data.json.
// Shared by tools/build-site.mjs (static fallback baked into index.html) and the browser (refresh at load).
// Round 3 (2026-11-05): one piece of proof shown large with plain sentences, the rest as short lines,
// services as plain lines. No cards, labels above headings, chips, numbering or tags.

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const link = (w) => (w.link ? ` <a href="${esc(w.link)}">${esc(w.linkText || 'Open it')}</a>` : '');

function shipped(list) {
  const lead = list.find((w) => w.image);
  const rest = list.filter((w) => w !== lead);
  const feature = lead ? `
  <div class="proof">
    <div class="text">
      <h2>${esc(lead.title)}</h2>
      <p>${esc(lead.outcome)}${link(lead)}</p>
    </div>
    <figure>
      <img src="${esc(lead.image.src)}" alt="${esc(lead.image.alt)}" width="${Number(lead.image.width)}" height="${Number(lead.image.height)}" loading="lazy" decoding="async">
    </figure>
  </div>` : '';
  const more = rest.length ? `
  <div class="more text">
    <h2>Other work you can look at</h2>
${rest.map((w) => `    <p><strong>${esc(w.title)}.</strong> ${esc(w.outcome)}${link(w)}</p>`).join('\n')}
  </div>` : '';
  return `<section id="work"><div class="wrap">${feature}${more}
</div></section>`;
}

function services(list) {
  return `<section id="services"><div class="wrap"><div class="text">
  <h2>What I do</h2>
${list.map((s) => `  <div class="svc"><h3>${esc(s.title)}</h3><p>${esc(s.summary)}</p></div>`).join('\n')}
</div></div></section>`;
}

function certifications(list) {
  if (!list.length) return '';
  const items = list.map((c) => `<li>${esc(c.name)}, ${esc(c.issuer)}${c.year ? `, ${esc(c.year)}` : ''}</li>`).join('');
  return `
<section id="certifications"><div class="wrap text"><h2>Certifications</h2><ul>${items}</ul></div></section>`;
}

export function renderSiteData(data) {
  return [shipped(data.shipped || []), services(data.services || [])].join('\n')
    + certifications(data.certifications || []);
}

if (typeof document !== 'undefined') {
  const mount = document.getElementById('site-data');
  if (mount) {
    fetch('/site-data.json', { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) mount.innerHTML = renderSiteData(d); })
      .catch(() => { /* the static fallback stays in place */ });
  }
}
