# Proof-Led Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Sentari homepage preview around Royal Vagabonds dashboard proof and the broader operating-systems offer.

**Architecture:** This is a static GitHub Pages site. Work happens in `index-preview.html` first; once visually verified, the preview can be promoted to `index.html`.

**Tech Stack:** Plain HTML/CSS, GitHub Pages, FormSubmit contact form, Cal.com booking link.

## Global Constraints

- Static HTML only: no new framework, build step, script, or dependency.
- Keep the contact form endpoint `https://formsubmit.co/info@sentarisoftware.com`.
- Keep the booking link `https://cal.com/cartrel-james-dwefpy/free-20-minute-call`.
- Main public proof link is `https://dashboard.sentarisoftware.com`.
- Do not publish non-live CWE links.
- Keep Royal Vagabonds public copy sanitized.

---

### Task 1: Patch Preview Positioning

**Files:**
- Modify: `index-preview.html`

**Interfaces:**
- Consumes: existing static page styles and structure.
- Produces: a reviewed preview page that can later replace `index.html`.

- [ ] **Step 1: Update metadata**

Set title and social metadata to operating-systems positioning, not document automation.

- [ ] **Step 2: Update hero**

Change the hero to lead with "operating system behind the organization" and point the secondary CTA to `https://dashboard.sentarisoftware.com`.

- [ ] **Step 3: Add dashboard proof**

Insert a proof-led section near the top explaining the sanitized dashboard: roles, payments, reporting, and live hosted operations.

- [ ] **Step 4: Adjust selected work**

Make dashboard demo first, File Extractor second, and remove live CWE link unless verified.

- [ ] **Step 5: Verify text**

Search for stale document-first copy, raw client-sensitive names, and broken public links.

Run:

```powershell
rg -n "Stop retyping|chasing paper|Royal Vagabonds|cwe-electric.com|demo.sentarisoftware.com|Document automation" index-preview.html
```

Expected: no stale hero copy, no raw Royal Vagabonds name, no live CWE link, File Extractor only secondary.

### Task 2: Visual Smoke Preview

**Files:**
- Read: `index-preview.html`

**Interfaces:**
- Consumes: patched preview.
- Produces: local browser confidence before promotion.

- [ ] **Step 1: Start static server**

Run:

```powershell
python -m http.server 8793
```

- [ ] **Step 2: Smoke desktop and mobile**

Open `http://127.0.0.1:8793/index-preview.html` and verify hero, proof section, selected work, and contact form fit without overlap.

- [ ] **Step 3: Decide promotion**

If preview is visually acceptable, copy the final preview content to `index.html`, then run the same smoke on `/`.
