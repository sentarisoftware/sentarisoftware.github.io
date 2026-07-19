/* Sentari — Free SEO Evaluation tool.
   Two-phase: /seo-scan returns the grade; /seo-reveal unlocks findings after email. */
(function () {
  'use strict';
  var BACKEND = 'https://lead-pipeline-hiue.onrender.com';
  var SITE = 'sentari-main';

  var $ = function (id) { return document.getElementById(id); };
  var catLabels = { onpage: 'On-page', technical: 'Technical', local: 'Local SEO', performance: 'Performance' };
  var gradeColors = { A: 'var(--a)', B: 'var(--b)', C: 'var(--c)', D: 'var(--d)', F: 'var(--f)' };

  var state = { resultId: null, url: null };

  function show(el) { el.classList.remove('hidden'); }
  function hide(el) { el.classList.add('hidden'); }
  function setErr(el, text) { if (!text) { hide(el); return; } el.textContent = text; show(el); }
  function loading(btn, on, label) {
    btn.disabled = on;
    btn.innerHTML = on ? '<span class="spin"></span>' + (label || 'Working…') : btn.dataset.label;
  }

  function post(path, body) {
    return fetch(BACKEND + path + '?site=' + encodeURIComponent(SITE), {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body)
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

  function renderFindings(findings) {
    var box = $('findings');
    box.innerHTML = '';
    if (!findings || !findings.length) {
      box.textContent = 'No major issues found — nice work.';
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

  // Step 1 — scan
  var scanBtn = $('scan-btn'); scanBtn.dataset.label = scanBtn.textContent;
  $('scan-form').addEventListener('submit', function (e) {
    e.preventDefault();
    setErr($('scan-msg'), '');
    var url = $('url').value.trim();
    if (!url) { return; }
    if ($('scan-form').company_website.value) { return; } // honeypot
    loading(scanBtn, true, 'Analyzing… (up to 30s)');
    hide($('findings-card'));
    post('/seo-scan', { url: url, company_website: '' }).then(function (res) {
      loading(scanBtn, false);
      if (res.status !== 200 || !res.data.ok) {
        setErr($('scan-msg'), res.data.error || 'Could not scan that URL. Check it and try again.');
        return;
      }
      state.resultId = res.data.resultId; state.url = res.data.url;
      renderGrade(res.data);
      $('email').focus();
    }).catch(function () {
      loading(scanBtn, false);
      setErr($('scan-msg'), 'Network error — the scanner may be waking up. Try again in a moment.');
    });
  });

  // Step 2 — reveal
  var revealBtn = $('reveal-btn'); revealBtn.dataset.label = revealBtn.textContent;
  $('reveal-form').addEventListener('submit', function (e) {
    e.preventDefault();
    setErr($('reveal-msg'), '');
    var email = $('email').value.trim();
    if (!email) { return; }
    if ($('reveal-form').company_website.value) { return; } // honeypot
    if (!state.resultId) { setErr($('reveal-msg'), 'Please run a scan first.'); return; }
    loading(revealBtn, true, 'Unlocking…');
    post('/seo-reveal', { resultId: state.resultId, email: email, company_website: '' }).then(function (res) {
      loading(revealBtn, false);
      if (res.status === 410) { setErr($('reveal-msg'), 'That result expired — please run the check again.'); return; }
      if (res.status !== 200 || !res.data.ok) {
        setErr($('reveal-msg'), res.data.error || 'Could not unlock the report. Try again.');
        return;
      }
      hide($('email-gate'));
      renderFindings(res.data.findings);
      $('findings-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }).catch(function () {
      loading(revealBtn, false);
      setErr($('reveal-msg'), 'Network error — please try again.');
    });
  });
})();
