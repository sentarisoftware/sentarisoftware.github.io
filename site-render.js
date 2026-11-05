// Renders the data-driven sections of the home page from site-data.json.
// Shared by tools/build-site.mjs (static fallback baked into index.html) and the browser (refresh at load).
// Design (2026-11-05 rework): no cards, no labels above headings, no chips. Plain headings, sentences,
// and real screenshots shown large beside the words they prove.

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function services(list) {
  const items = list.map((s) => `      <div class="svc">
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.summary)}</p>
      </div>`).join('\n');
  return `<section id="services" class="col">
    <h2>What I can take off your plate</h2>
${items}
  </section>`;
}

function shipped(list) {
  const withPic = list.filter((w) => w.image);
  const rest = list.filter((w) => !w.image);
  const link = (w) => (w.link ? ` <a href="${esc(w.link)}">${esc(w.linkText || 'Open it')}</a>` : '');
  const shown = withPic.map((w) => `    <figure class="shot">
      <img src="${esc(w.image.src)}" alt="${esc(w.image.alt)}" width="${Number(w.image.width)}" height="${Number(w.image.height)}" loading="lazy" decoding="async">
      <figcaption><h3>${esc(w.title)}</h3><p>${esc(w.outcome)}${link(w)}</p></figcaption>
    </figure>`).join('\n');
  const others = rest.length ? `
    <ul class="also col">
${rest.map((w) => `      <li><h3>${esc(w.title)}</h3> ${esc(w.outcome)}${link(w)}</li>`).join('\n')}
    </ul>` : '';
  return `<section id="work">
    <h2 class="col">Things I've built that are running now</h2>
${shown}${others}
  </section>`;
}

function certifications(list) {
  if (!list.length) return '';
  const items = list.map((c) => `<li>${esc(c.name)}, ${esc(c.issuer)}${c.year ? `, ${esc(c.year)}` : ''}</li>`).join('');
  return `
<section id="certifications" class="col"><h2>Certifications</h2><ul>${items}</ul></section>`;
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
