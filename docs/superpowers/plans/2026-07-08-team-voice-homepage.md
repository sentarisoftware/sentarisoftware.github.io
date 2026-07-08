# Team-Voice Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a sharper Sentari homepage copy pass that uses “show us your messy process” framing and presents Sentari as a team-oriented software partner.

**Architecture:** This is a static GitHub Pages site. The live `index.html` is the only runtime artifact; docs record the approved design and plan.

**Tech Stack:** Plain HTML/CSS, GitHub Pages, FormSubmit contact form, Cal.com booking link.

## Global Constraints

- Static HTML only; no framework, build step, JavaScript, or dependency.
- Preserve FormSubmit endpoint `https://formsubmit.co/info@sentarisoftware.com`.
- Preserve Cal.com booking link `https://cal.com/cartrel-james-dwefpy/free-20-minute-call`.
- Use team-oriented company voice: “Sentari,” “we,” “us,” and “our.”
- Do not invent employees, departments, or false scale.
- Keep public proof links to `https://dashboard.sentarisoftware.com` and `https://demo.sentarisoftware.com`.
- Keep public copy sanitized; do not expose raw private client names.

---

### Task 1: Homepage Copy And CTA Pass

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: existing static HTML/CSS and current section structure.
- Produces: published homepage copy with team-oriented Sentari voice.

- [x] **Step 1: Patch metadata and navigation**

Update title/description/OG copy as needed and change the Cal.com navigation CTA to “Talk through your system.”

- [x] **Step 2: Patch hero**

Replace the solo-builder hero with the approved messy-process offer:

```html
<h1>Your organization is already running on a system. <span class="hl">It may just be trapped in email, spreadsheets, and memory.</span></h1>
<p class="lede">Sentari turns messy operations into dashboards, portals, workflows, reports, and websites your people can actually use.</p>
```

- [x] **Step 3: Patch proof and why sections**

Make the proof section read like a before/after case study and rename “Why Cartrel” style language to “Why Sentari,” while keeping the founder note contained.

- [x] **Step 4: Patch final CTA and form prompts**

Use the approved final CTA:

```html
<h2>Send us the part of your operation that keeps slipping through the cracks.</h2>
```

Use “Talk through your system” only for the 20-minute call path.

- [x] **Step 5: Verify text**

Run:

```powershell
rg -n "I build|one specialist|my inbox|Why Cartrel|solo|freelancer|Royal Vagabonds|cwe-electric.com" index.html
```

Expected: no solo-positioning copy, no raw private client names, no non-live CWE link.

### Task 2: Local And Public Verification

**Files:**
- Read: `index.html`

**Interfaces:**
- Consumes: patched static homepage.
- Produces: verified local/public homepage.

- [x] **Step 1: Local static smoke**

Run a local static server and request `/`:

```powershell
python -m http.server 8793
Invoke-WebRequest http://127.0.0.1:8793/ -UseBasicParsing
```

Expected: HTTP 200.

- [x] **Step 2: Browser screenshot smoke**

Use the existing machine/browser tooling to capture desktop and mobile screenshots of the local homepage. Verify no overlap, clipping, or broken first-screen CTA layout.

- [ ] **Step 3: Commit and push**

Commit exact files:

```powershell
git add index.html docs/superpowers/specs/2026-07-08-team-voice-homepage-design.md docs/superpowers/plans/2026-07-08-team-voice-homepage.md
git commit -m "Sharpen homepage team voice and CTA"
git push
```

- [ ] **Step 4: Public smoke**

After GitHub Pages updates, verify `https://sentarisoftware.com/` returns HTTP 200 and includes:

- `Show us your messy process`
- `Talk through your system`
- `keeps slipping through the cracks`
