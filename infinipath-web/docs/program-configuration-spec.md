# Program Configuration Specification

---

## Overall Flow

```
Select Program Type
       ↓
Select Template  (predefined per type, controls registration form fields)
       ↓
Configure Program Details  (type-specific sections below)
       ↓
Predefined Workflow Attached  (which will step that which section which point and which roles)
       ↓
Registration Form  (auto-rendered from template; fields can be added / removed)
       ↓
Publish
       ↓
Three post-publish modes  (see Post-Publish section)
```

---

## Step 1 — Select Program Type

| Type | Key |
|---|---|
| HDB / MSD | `PT_HDBMSD` |
| TAT | `PT_TAT` |
| Entrainment | `PT_ENTRAINMENT` |
| Custom | `PT_CUSTOM` |

---

## Step 2 — Select Template

- Each program type has one or more predefined templates.
- If exactly one template exists for the selected type → skip selection, go directly to configuration.
- If multiple templates exist → show template picker.
- Template determines:
  - Which registration form fields are pre-loaded.
  - Default values for certain configuration fields.
  - The predefined workflow attached to the program.

---

## Step 3 — Configure Program Details

### HDB

**Sections:** Program Information · Business Tax

| Area | Fields |
|---|---|
| Basic | Name, Code, Description |
| Mode | Online / Offline / Hybrid |
| Venue | Venue address *(offline/hybrid only)*, Venue name in emails *(offline/hybrid only)* |
| Residential | Is residential?, Total bed count *(if residential)* |
| Seats | Seat limit?, Seat count *(if limited)*, Waitlist? *(if limited)*, Waitlist trigger count *(if waitlist)* |
| Dates | Program date range (start → end), Registration start date/time, Registration end date/time |
| Approval | Approval required? |
| Fees | HDB Fee (₹), MSD Fee (₹), Currency *(locked: INR)* |
| Contact | Helpline number, Email sender name, Email sender address, BCC name, BCC address |
| Tax | TDS %, TDS applicability (base only / base + tax), CGST %, SGST %, IGST %, Business name, Business address, PAN, GSTIN, CIN |

**Sub-Programs (sessions/groups)**

| Field | Notes |
|---|---|
| Title | — |
| Code | Auto-generated from parent code |
| Session type | HDB / MSD |
| Price (₹) | Auto-filled from HDB Fee or MSD Fee based on session type |
| Start date & time | — |
| End date & time | — |
| Mode | Online / Offline / Hybrid |
| Venue | *(offline/hybrid only)* |
| Venue name in emails | *(offline/hybrid only)* |
| Check-in at / ends at | *(offline + has check-in)* |
| Check-out at / ends at | *(offline + has check-in)* |
| Seat limit | Synced from parent |
| Waitlist | Synced from parent |

---

### TAT

**Sections:** Program Information · Business Tax

| Area | Fields |
|---|---|
| Basic | Name, Code, Description |
| Mode | Online / Offline / Hybrid |
| Venue | Venue address *(offline/hybrid)*, Venue name in emails *(offline/hybrid)* |
| Seats | Seat limit?, Seat count *(if limited)* |
| Dates | Program date range, Registration start/end |
| Approval | Approval required? |
| Fees | Program fee (₹), Currency *(locked: INR)* |
| Contact | Helpline number, Email sender name, Email sender address |
| Tax | Same as HDB |

**Sessions**

| Field | Notes |
|---|---|
| Title | — |
| Code | — |
| Start / End date & time | — |
| Mode | Online / Offline / Hybrid |
| Venue | *(offline/hybrid only)* |
| Venue name in emails | *(offline/hybrid only)* |
| Check-in / Check-out | *(offline + has check-in)* |

---

### Entrainment

**Sections:** Program Information · Business Tax

Same as TAT, with the following additions:

| Area | Extra Fields |
|---|---|
| Seats | Waitlist?, Waitlist trigger count *(if waitlist)* |

> No sub-programs / sessions.

---

### Custom

**Sections:** Basic Info · Mode & Structure · Registration Rules · Schedule & Dates · Venue Details · Online Details · Payment & Billing · Email & Communication

#### Basic Info
| Field | Notes |
|---|---|
| Name | — |
| Code | Max 50 chars |
| Description | Required, max 200 chars |
| Logo image | JPEG/JPG/PNG/WEBP, max 200 KB |
| Sub-program type | HDB / MSD / TAT / Entrainment |

#### Mode & Structure
| Field | Options / Notes |
|---|---|
| Mode of program | Online / Offline / Hybrid |
| Program structure | Single / Multiple sessions / Grouped sub-programs |
| No. of sessions | *(if multiple)* Min 1 |
| No. of groups | *(if grouped)* Min 1 |

#### Registration Rules
| Field | Notes |
|---|---|
| Approval required | — |
| Allow proxy registration | Register on behalf of others |
| Allow save as draft | — |
| Seeker can share experience | — |
| Requires payment | — |
| Travel involved | *(disabled if online)* |
| Has goodies | — |
| Seat limit | — |
| Total seats | *(if seat limit)* |
| Waitlist applicable | *(if seat limit)* |
| Waitlist trigger count | *(if waitlist)* |
| Residential program | *(disabled if online)* |
| Total bed count | *(if residential)* |
| Elder min age | 0–150 |
| Child max age | 0–150 |

#### Schedule & Dates
| Field | Visible When |
|---|---|
| Start date & time | Single structure |
| End date & time | Single structure |
| Bless ends at | Approval required |
| Registration start date | Always |
| Registration end date | Always |
| Check-in at | Single structure + has check-in |
| Check-in ends at | Single structure + has check-in |
| Check-out at | Single structure + has check-in |
| Check-out ends at | Single structure + has check-in |

#### Venue Details
| Field | Visible When |
|---|---|
| Venue | Offline / Hybrid |
| Venue name in emails | Offline / Hybrid |
| Same venue for all | Offline/Hybrid + Multiple/Grouped |

#### Online Details
| Field | Visible When |
|---|---|
| Online type | Online (Meeting / Webinar / Live Stream) |
| Same online details for all | Online + Multiple/Grouped |
| Meeting link, ID, password | Online type: Meeting |
| Webinar link, ID, password, panelist link, registration link | Online type: Webinar |
| Stream URL, backup stream URL, chat URL | Online type: Live Stream |

#### Payment & Billing *(visible when requires payment)*
| Field | Notes |
|---|---|
| Currency | — |
| Program fee (₹) | Min 0 |
| CGST % | 0–100 |
| SGST % | 0–100 |
| GST % | Auto-calculated (CGST + SGST), read-only |
| IGST % | 0–100 |
| GST number | GSTIN format |
| TDS % | 0–100 |
| TDS applicability | Base only / Base + tax |
| Invoice sender name | — |
| Invoice sender PAN | PAN format |
| Invoice sender CIN | CIN format |
| Invoice sender address | Max 255 chars |

#### Email & Communication
| Field | — |
|---|---|
| Email sender name | — |
| Email sender address | — |
| BCC name | — |
| BCC address | — |
| Helpline number | Max 50 chars |

#### Custom Sub-Programs — Sessions *(Multiple structure)*
| Field | Visible When |
|---|---|
| Session name | Always |
| Code | Always |
| Display order | Always |
| Description | Always |
| Start / End date & time | Always |
| Mode of operation | Always (Online / Offline / Hybrid) |
| Online type + details | Online |
| Venue / Venue name in emails | Offline / Hybrid |
| Check-in / Check-out | Offline + has check-in |

#### Custom Sub-Programs — Groups *(Grouped structure)*
Same as sessions, plus:

| Field | Visible When |
|---|---|
| Bless ends at | Approval required |
| Can register till | Approval required |

---

## Step 4 — Predefined Workflow (per type)

Each program type has a workflow attached at the time of template selection.
- Workflow is **predefined** — stages and sequence cannot be changed once set.
- The template controls **which stages are active**.
- Each stage specifies: **step number**, **section it belongs to**, **trigger/condition**, **seeker action**, and **which admin role acts**.

---

### HDB Workflow

| Step | Stage | Section | Trigger / Condition | Seeker | Admin Role | Admin Action |
|---|---|---|---|---|---|---|
| 1 | Registration opens | Registration | Registration start date reached | Fill & submit form | — | — |
| 2 | Pending approval | Approval queue | Submitted; approval required = yes | Waits for approval notification | Admin / Shoba | Review seeker details, approve or reject |
| 3 | Seat allocated | Seat allocation | Approved | Receives seat confirmation | Admin / Shoba | Assign HDB or MSD seat type |
| 4 | Payment due | Payment | Seat allocated; payment required | Receives payment link / invoice | Admin | Collect payment, mark as paid |
| 5 | Registration closed | Registration | Registration end date reached | Cannot register | Admin | Can manually override |
| 6 | Check-in | On-site *(offline only)* | Program start date reached | Arrive and check in | Admin / RM | Mark check-in, assign room *(if residential)* |
| 7 | Check-out | On-site *(offline only)* | Program end date reached | Check out | Admin / RM | Mark check-out |
| 8 | Program closed | Post-program | Program end date passed | Views past program | Admin | Generate attendance + payment reports |

---

### TAT Workflow

| Step | Stage | Section | Trigger / Condition | Seeker | Admin Role | Admin Action |
|---|---|---|---|---|---|---|
| 1 | Registration opens | Registration | Registration start date reached | Fill & submit form | — | — |
| 2 | Pending approval | Approval queue | Submitted; approval required = yes | Waits for approval | Admin / Shoba | Review, approve or reject |
| 3 | Seat confirmed | Seat allocation | Approved | Receives confirmation | Admin / Shoba | Confirm seat |
| 4 | Payment due | Payment | Seat confirmed; payment required | Receives payment link | Admin | Collect payment |
| 5 | Session check-in | On-site *(offline only)* | Each session start | Attend & check in per session | Admin / RM | Mark per-session check-in |
| 6 | Program closed | Post-program | All sessions done | — | Admin | Per-session attendance report |

---

### Entrainment Workflow

| Step | Stage | Section | Trigger / Condition | Seeker | Admin Role | Admin Action |
|---|---|---|---|---|---|---|
| 1 | Registration opens | Registration | Registration start date reached | Fill & submit form | — | — |
| 2 | Waitlist *(if seats full)* | Waitlist | Seats exhausted | Placed on waitlist, notified when slot opens | Admin | Promote from waitlist when seat frees |
| 3 | Seat confirmed | Seat allocation | Seat available | Receives confirmation | Admin | Confirm seat |
| 4 | Payment due | Payment | Seat confirmed; payment required | Receives payment link | Admin | Collect payment |
| 5 | Program closed | Post-program | Program end date passed | — | Admin | Attendance + revenue report |

---

### Custom Workflow

Adapts based on program **structure** (single / multiple / grouped) and **registration rules** configured.

| Step | Stage | Section | Trigger / Condition | Seeker | Admin Role | Admin Action |
|---|---|---|---|---|---|---|
| 1 | Registration opens | Registration | Registration start date reached | Fill & submit form | — | — |
| 2 | Save as draft *(optional)* | Registration | Allow save as draft = yes | Save incomplete form, return later | — | — |
| 3 | Proxy registration *(optional)* | Registration | Allow proxy = yes | Register another person | — | — |
| 4 | Pending approval | Approval queue | Submitted; approval required = yes | Waits; notified on decision | Admin / Shoba | Review, bless or reject |
| 5 | Bless window | Bless / confirmation | Approved; bless ends at not passed | In confirmed state | Admin / Shoba | Bless before bless-ends-at deadline |
| 6 | Seat allocated | Seat allocation | Blessed; seat limit applies | Receives seat confirmation | Admin / Shoba | Assign to sub-program / group |
| 7 | Waitlist *(if applicable)* | Waitlist | Seats full; waitlist = yes | Added to waitlist | Admin | Promote when trigger count reached |
| 8 | Payment due | Payment | Seat confirmed; requires payment = yes | Pays online / offline | Admin / Finance Admin | Issue invoice, reconcile TDS/GST |
| 9 | Can register till *(grouped)* | Sub-program registration | Grouped structure; approval required | Assigned to group, deadline shown | Admin | Close group registration at deadline |
| 10 | Check-in *(offline/hybrid)* | On-site | Session/program start; has check-in = yes | Arrive, scan or manual check-in | Admin / RM | Mark check-in per session or group |
| 11 | Check-out *(offline/hybrid)* | On-site | Session end | Check out | Admin / RM | Mark check-out |
| 12 | Share experience *(optional)* | Post-program | Program closed; seeker can share = yes | Submit testimonial / feedback | — | Admin reviews & publishes |
| 13 | Program closed | Post-program | All sessions/groups completed | Views summary | Admin | Full report: attendance, payment, mode split |

---

### Role Summary (all types)

| Role | Responsibilities |
|---|---|
| **Admin** | Full control — approve, seat allocation, payment, check-in/out, reports |
| **Shoba** | Approve / bless seekers, view seat allocations (cannot create programs) |
| **RM** | On-site check-in / check-out management |
| **Finance Admin** | Payment collection, invoice management, TDS/GST reconciliation |
| **Mahatria** | View published programs and seeker lists (read-only) |
| **Seeker** | Register, pay, check in, share experience |

> Workflow stages are predefined per type and cannot be reconfigured. The template controls which stages are active.

---

## Step 5 — Registration Form

- Fields are auto-rendered from the selected template.
- Admins can:
  - **Add** new fields (text, dropdown, radio, checkbox, date, file upload, etc.)
  - **Remove** existing non-mandatory fields
  - **Reorder** fields
  - **Mark fields** as required / optional
- Changes apply only to this program instance, not the template.

---

## Step 6 — Publish

Once configuration is complete, the program moves through statuses:

| Status | Description |
|---|---|
| Internal | Visible to internal users only |
| Published | Live — registration open per registration dates |
| Restricted | Visible to specific seekers

---

*Last updated: 2026-05-20*
