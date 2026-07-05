# Case Study: Government Document Intake Automation

## Client Profile
**Organization:** St. Louis City Recorder of Deeds  
**Challenge:** Overwhelmed marriage license intake team processing 200+ requests/month through a shared Gmail inbox  
**Solution:** End-to-end automated document workflow built and managed by Sentari Software

## The Problem

The Recorder of Deeds office faced a critical challenge:

- **Manual chaos:** Staff manually checked a shared Gmail inbox for marriage license requests
- **No visibility:** No way to track who was working on what, or what was stuck
- **Data entry burden:** Clerks retyped all extracted data from PDFs into their system
- **Lost requests:** Requests fell through the cracks between staff members
- **Compliance risk:** No audit trail for sensitive government documents

**"We were drowning in sticky notes and hoping nothing got lost."** — ROD Operations Director

## The Sentari Solution

Sentari built a **secure, compliance-grade intake system** that eliminated manual processes:

### What Was Built:
- **Automated email ingestion** — Gmail requests captured and normalized automatically
- **AI-powered data extraction** — Ollama reads each document and pulls key fields
- **Clerk queue dashboard** — Visual workflow showing status, ownership, and exceptions
- **Atomic locking** — 15-minute work locks prevent duplicate effort
- **Audit trail** — Complete history of every action taken on each request
- **PDF generation** — Automated document creation for approval
- **Active Directory integration** — Secure, compliance-grade authentication

### Technology Stack:
- PostgreSQL backend for persistent, compliant storage
- n8n workflow orchestration for document routing
- Local Ollama AI for document reading (no data leaves the network)
- React dashboard for clerk workflow
- Custom API for secure integrations

## Results

**Immediate Impact (Week 1):**
- ✅ **Zero lost requests** — every email becomes a tracked case
- ✅ **50% faster processing** — automated data extraction eliminates retyping
- ✅ **Full audit visibility** — supervisors see real-time queue status
- ✅ **Staff freed from manual entry** — focus on review and approval instead

**6 Months In:**
- **87% reduction** in manual data entry time
- **Zero compliance violations** — complete audit trail for every request
- **Staff satisfaction up** — no more "who has this?" confusion
- **Scalable system** — handles volume spikes without additional hires

## Why Sentari Worked

**Built by someone who understands compliance:**
> "Cartrel spent years as our IT administrator. He knows what happens when a mistake can't be patched the next day. That rigor shows in every line of code."  
> — ROD IT Administrator

**Key differentiators:**
- **Government-grade security** from day one (Active Directory, audit logs, local AI)
- **Fixed-scope delivery** — no surprise bills or scope creep
- **Managed service** — Sentari runs it; no IT staff needed on client side
- **Compliance first** — designed for regulated environments with PII/sensitive data

## Cost Comparison

**Before Sentari:**
- 2 staff members spending ~10 hours/week each on manual intake = **$30,000/year** in labor
- Plus error correction time and compliance risk

**After Sentari:**
- **$2,000 one-time build** + **$500/month managed service** = **$8,000/year**
- **Net savings: $22,000/year** while improving accuracy and compliance

---

**Want similar results?** See a live demo at [demo.sentarisoftware.com](https://demo.sentarisoftware.com)

or

[Book a free 20-minute call](https://cal.com/cartrel-james-dwefpy/free-20-minute-call) to discuss your workflow.
