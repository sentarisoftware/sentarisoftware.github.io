/* Sentari — internal SEO admin. Runs the full evaluation on any URL in "generous
   free" mode: /seo-scan then /seo-reveal with the x-admin-token header, so the
   backend skips the email/lead gate and returns the full copy-paste schema block.
   Token is stored in localStorage on this device only; never linked publicly. */
(function () {
  'use strict';
  var BACKEND = 'https://lead-pipeline-hiue.onrender.com';
  var SITE = 'sentari-main';
  var TOKEN_KEY = 'sentari_seo_admin_token';

  var $ = function (id) { return document.getElementById(id); };
  var catLabels = { onpage: 'On-page', technical: 'Technical', local: 'Local SEO', geo: 'AI Search', performance: 'Performance' };
  var gradeColors = { A: 'var(--a)', B: 'var(--b)', C: 'var(--c)', D: 'var(--d)', F: 'var(--f)' };

  var state = { resultId: null, url: null };

  function show(el) { el.classList.remove('hidden'); }
  function hide(el) { el.classList.add('hidden'); }
  function setMsg(el, text, cls) { if (!text) { hide(el); return; } el.textContent = text; el.className = 'msg ' + (cls || 'err'); show(el); }
  function loading(btn, on, label) {
    btn.disabled = on;
    btn.innerHTML = on ? '<span class="spin"></span>' + (label || 'Working…') : btn.dataset.label;
  }
  function token() { return ($('token').value || '').trim(); }

  function post(path, body) {
    var headers = { 'content-type': 'application/json' };
    var t = token();
    if (t) { headers['x-admin-token'] = t; }
    return fetch(BACKEND + path + '?site=' + encodeURIComponent(SITE), {
      method: 'POST', headers: headers, body: JSON.stringify(body)
    }).then(function (r) {
      return r.json().catch(function () { return { ok: false, error: 'Unexpected server response.' }; })
        .then(function (d) { return { status: r.status, data: d }; });
    });
  }

  function renderGrade(d) {
    $('grade-letter').textContent = d.grade;
    $('grade-score').textContent = d.overall + '/100';
    var box = $('grade-box');
    box.style.borderColor = gradeColors[d.grade] || 'var(--gold)';
    $('grade-letter').style.color = gradeColors[d.grade] || 'var(--gold)';

    var cats = $('cats');
    cats.innerHTML = '';
    Object.keys(catLabels).forEach(function (k) {
      var v = d.categories ? d.categories[k] : null;
      var wrap = document.createElement('div');
      wrap.className = 'cat';
      var val = (v == null) ? (k === 'performance' && !d.performanceAvailable ? 'n/a' : '—') : v + '/100';
      var pct = (v == null) ? 0 : v;
      var top = document.createElement('div');
      top.className = 'top';
      var a = document.createElement('span'); a.textContent = catLabels[k];
      var b = document.createElement('span'); b.textContent = val;
      top.appendChild(a); top.appendChild(b);
      var track = document.createElement('div'); track.className = 'track';
      var fill = document.createElement('div'); fill.className = 'fill'; fill.style.width = pct + '%';
      track.appendChild(fill);
      wrap.appendChild(top); wrap.appendChild(track);
      cats.appendChild(wrap);
    });
    show($('grade-card'));
  }

  function renderSchema(schema) {
    if (!schema) return;
    var box = $('findings');
    var row = document.createElement('div');
    row.className = 'finding';
    var t = document.createElement('div'); t.className = 'issue';
    var sev = document.createElement('span'); sev.className = 'sev ready'; sev.textContent = 'ready';
    t.appendChild(sev); t.appendChild(document.createTextNode('Structured-data (schema) — copy-paste block'));
    row.appendChild(t);
    if (schema.jsonld) {
      var note = document.createElement('div'); note.className = 'impact';
      note.textContent = 'Paste into the client site’s <head>. TODO placeholders need the owner’s details' + (schema.placeholders && schema.placeholders.length ? ' (' + schema.placeholders.join(', ') + ')' : '') + '.';
      var pre = document.createElement('pre'); pre.className = 'schema'; pre.textContent = schema.jsonld;
      row.appendChild(note); row.appendChild(pre);
    } else {
      var g = document.createElement('div'); g.className = 'impact';
      g.textContent = 'Full block not returned — check the admin token is correct.';
      row.appendChild(g);
    }
    box.appendChild(row);
  }

  function renderFindings(findings) {
    var box = $('findings');
    box.innerHTML = '';
    if (!findings || !findings.length) {
      box.textContent = 'No major issues found.';
    } else {
      findings.forEach(function (f) {
        var row = document.createElement('div'); row.className = 'finding';
        var issue = document.createElement('div'); issue.className = 'issue';
        var sev = document.createElement('span'); sev.className = 'sev ' + f.severity; sev.textContent = f.severity;
        issue.appendChild(sev); issue.appendChild(document.createTextNode(f.issue));
        var impact = document.createElement('div'); impact.className = 'impact'; impact.textContent = f.impact;
        var fix = document.createElement('div'); fix.className = 'fix'; fix.textContent = 'Fix: ' + f.fix;
        row.appendChild(issue); row.appendChild(impact); row.appendChild(fix);
        box.appendChild(row);
      });
    }
    show($('findings-card'));
  }

  // Token persistence (this device only).
  try {
    var saved = localStorage.getItem(TOKEN_KEY);
    if (saved) { $('token').value = saved; }
  } catch (e) { /* localStorage may be blocked — token just won't persist */ }

  $('save-token').addEventListener('click', function () {
    try {
      if (token()) { localStorage.setItem(TOKEN_KEY, token()); setMsg($('token-msg'), 'Saved on this device.', 'ok'); }
      else { localStorage.removeItem(TOKEN_KEY); setMsg($('token-msg'), 'Cleared.', 'ok'); }
    } catch (e) { setMsg($('token-msg'), 'Could not save — storage is blocked in this browser.', 'err'); }
  });

  // Run: scan → reveal (admin, no email) in one click.
  var auditBtn = $('audit-btn'); auditBtn.dataset.label = auditBtn.textContent;
  $('audit-form').addEventListener('submit', function (e) {
    e.preventDefault();
    setMsg($('audit-msg'), '');
    var url = $('url').value.trim();
    if (!url) { return; }
    if (!token()) { setMsg($('audit-msg'), 'Enter the admin token first.'); return; }
    loading(auditBtn, true, 'Analyzing… (up to 30s)');
    hide($('grade-card')); hide($('findings-card'));
    post('/seo-scan', { url: url }).then(function (res) {
      if (res.status !== 200 || !res.data.ok) {
        loading(auditBtn, false);
        setMsg($('audit-msg'), res.data.error || 'Could not scan that URL.');
        return;
      }
      state.resultId = res.data.resultId; state.url = res.data.url;
      renderGrade(res.data);
      loading(auditBtn, true, 'Unlocking full report…');
      return post('/seo-reveal', { resultId: state.resultId }).then(function (r2) {
        loading(auditBtn, false);
        if (r2.status === 410) { setMsg($('audit-msg'), 'Result expired — run it again.'); return; }
        if (r2.status !== 200 || !r2.data.ok) {
          setMsg($('audit-msg'), r2.data.error || 'Could not unlock the report — check the token.');
          return;
        }
        renderFindings(r2.data.findings);
        renderSchema(r2.data.schema);
        $('findings-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }).catch(function () {
      loading(auditBtn, false);
      setMsg($('audit-msg'), 'Network error — the scanner may be waking up. Try again in a moment.');
    });
  });
})();
