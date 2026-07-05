# Case Study: Event Ticketing & Financial Operations Dashboard

## Client Profile
**Organization:** Royal Vagabonds Inc. — St. Louis fraternal organization established 1930  
**Challenge:** Manual ticketing, payment reconciliation, and financial reporting for annual NYE celebration (200+ attendees)  
**Solution:** Integrated financial and operations dashboard with automated ticketing and real-time reporting

## The Problem

Royal Vagabonds' annual New Year's Eve celebration is their biggest fundraising event — but operations were held together by spreadsheets and hope:

- **Ticketing chaos:** Google Apps Script + manual email confirmations with QR codes
- **No financial visibility:** Officers couldn't see real-time revenue, expenses, or attendee counts
- **Manual reconciliation:** Stripe payments tracked separately from Zoho Books accounting
- **Event-day risk:** QR scanning at the door had to work perfectly — no second chances at 11:55 PM on December 31st
- **Audit requirements:** 501(c)(7) compliance required clean financial records

**"If the door scanning fails on NYE, we can't patch it tomorrow. The event happens when it happens."** — Royal Vagabonds President

## The Sentari Solution

Sentari built a **secure, production-grade operations center** that gave officers real-time visibility:

### What Was Built:
- **Officer/admin dashboard** — Secure login with role-based access
- **Zoho Books integration** — Financial data synced as source of truth
- **Ticketing automation** — Google Apps Script generating QR codes with fail-safes
- **Real-time reporting** — Revenue tracking, attendee counts, payment status
- **Member portal foundation** — Ready for future member self-service
- **Door scanning reliability** — Tested end-to-end before event night

### Technology Stack:
- Node.js/Express API with PostgreSQL backend
- Zoho Books API for financial data sync
- Google Apps Script for ticket/QR generation
- React dashboard for officer visibility
- Render deployment with zero-downtime updates

## Results

**Event Night (NYE):**
- ✅ **Zero scanning failures** — all 200+ attendees checked in smoothly
- ✅ **Real-time visibility** — officers saw exactly who was in the building
- ✅ **Instant revenue reporting** — no end-of-night reconciliation needed

**Month-End Close:**
- **90% reduction** in manual financial reconciliation time
- **Automated AR tracking** — 18 accounts receivable cases flagged automatically
- **Clean 501(c)(7) compliance** — auditable financial trails in Zoho Books
- **Officers freed from spreadsheets** — focus on event quality, not data entry

## Why Sentari Worked

**Production-first mindset:**
> "Event-day operations run on the event's clock, not business days. A bug discovered this December must be permanently solved before next December — not rediscovered."  
> — Cartrel James, Sentari Software

**Key differentiators:**
- **Money operations get extra caution** — dry-run modes, idempotency keys, confirmation before live runs
- **Event-day reliability** — no "we'll patch it later" mentality
- **Financial-grade accuracy** — designed for audited nonprofit operations
- **Future-ready architecture** — member portal, multi-event support, advanced reporting

## Cost Comparison

**Before Sentari:**
- Manual ticketing + spreadsheet tracking + month-end reconciliation = **~15 hours/week** during event season
- Plus risk of door scanning failures and compliance gaps

**After Sentari:**
- **One-time build** + **ongoing managed service** = predictable monthly cost
- **Saves 60+ hours/event season** while eliminating compliance risk
- **Officers focus on member experience** instead of administrative work

## What's Next

The foundation is built for expansion:
- Member self-service portal
- Multi-event support beyond NYE
- Advanced financial reporting and analytics
- Integrated marketing and communications

---

**Running events shouldn't mean drowning in spreadsheets.** 

[Book a free 20-minute call](https://cal.com/cartrel-james-dwefpy/free-20-minute-call) to discuss your operations.
