# Proof-Led Sentari Homepage Redesign

**Date:** 2026-07-08
**Status:** Approved for implementation
**Project:** Sentari Software Website

## Goal

Reposition the Sentari homepage around proof that Cartrel builds real operating software for small organizations, using the Royal Vagabonds dashboard/demo as the main evidence lane.

## Direction

The homepage should stop leading with File Extractor/document automation. That July 5 direction is too narrow now that the Royal Vagabonds dashboard proves a broader offer: dashboards, member portals, role-scoped access, event/financial reporting, payments, operational workflows, and websites around those systems.

## Page Message

Primary message: Sentari builds the software layer small organizations actually run on.

Hero framing:
- Not just a website.
- The operating system behind the organization.
- Built by one specialist who designs, ships, hosts, and maintains the system.

## Proof Model

Royal Vagabonds is the main proof point, but public copy must stay sanitized:
- Refer to it as a member organization, club, or organization dashboard.
- Link to `https://dashboard.sentarisoftware.com`, the sanitized demo.
- Avoid public real-client specifics that expose private production details.

File Extractor becomes secondary proof under automation/document work, not the main company story.

Central West End Electric should be described only as a proposal/client-site lane unless the public domain is verified live. Do not link to a non-live client domain from the homepage.

## Structure

1. Hero: operating-system positioning and CTA to the dashboard demo.
2. Proof/Case Study: dashboard-led section showing what Sentari built and why it matters.
3. Services: operations dashboards, websites that convert, automation/document workflows.
4. Selected Work: dashboard demo first, File Extractor second, CWE only if safely worded.
5. Contact: book a call and message form.

## Constraints

- Static HTML only: no build step, no JavaScript.
- Preserve the contact form to `https://formsubmit.co/info@sentarisoftware.com`.
- Preserve Cal.com booking link.
- Keep CSP compatible with current static page.
- Make `index-preview.html` the working draft first.
- Do not replace live `index.html` until preview is visually checked.
