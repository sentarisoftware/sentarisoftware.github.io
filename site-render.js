// Renders the data-driven sections of the home page from site-data.json.
// Shared by tools/build-site.mjs (static fallback baked into index.html) and the browser (refresh at load).

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function services(list) {
  const cards = list.map((s, i) => `      <article class="card">
        <div class="n">${String(i + 1).padStart(2, '0')}</div>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.summary)}</p>
        <ul class="ticks">${(s.points || []).map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
      </article>`).join('\n');
  return `<section id="services"><div class="wrap">
    <div class="sec-head"><span class="kicker">Services</span>
      <h2>What I do</h2></div>
    <div class="cards">
${cards}
    </div>
  </div></section>`;
}

function capabilities(list) {
  const groups = list.map((g) => `      <div class="cap">
        <h3>${esc(g.group)}</h3>
        <ul class="chips">${(g.items || []).map((it) => `<li>${esc(it)}</li>`).join('')}</ul>
      </div>`).join('\n');
  return `<section id="capabilities" class="band-light"><div class="wrap">
    <div class="sec-head"><span class="kicker">Tools</span>
      <h2>Working tools</h2></div>
    <div class="caps">
${groups}
    </div>
  </div></section>`;
}

function shipped(list) {
  const img = (i) => (i ? `
        <img src="${esc(i.src)}" alt="${esc(i.alt)}" width="${Number(i.width)}" height="${Number(i.height)}" loading="lazy" decoding="async">` : '');
  const items = list.map((w) => `      <article class="proj${w.image ? ' pic' : ''}">${img(w.image)}
        <span class="tag">${esc(w.tag)}</span>
        <h3>${esc(w.title)}</h3>
        <p>${esc(w.outcome)}</p>${w.link ? `
        <a href="${esc(w.link)}">${esc(w.linkText || 'Open it')}</a>` : ''}
      </article>`).join('\n');
  return `<section id="work"><div class="wrap">
    <div class="sec-head"><span class="kicker cy">Proof</span>
      <h2>Shipped and running</h2></div>
    <div class="work-cards">
${items}
    </div>
  </div></section>`;
}

function certifications(list) {
  if (!list.length) return '';
  const items = list.map((c) => `<li><strong>${esc(c.name)}</strong> ${esc(c.issuer)}${c.year ? `, ${esc(c.year)}` : ''}</li>`).join('');
  return `
<section id="certifications"><div class="wrap">
    <div class="sec-head"><span class="kicker">Certifications</span><h2>Certified where it counts.</h2></div>
    <ul class="certs">${items}</ul>
  </div></section>`;
}

export function renderSiteData(data) {
  return [services(data.services || []), capabilities(data.capabilities || []), shipped(data.shipped || [])].join('\n')
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
