# Custom Program Type — Requirements Document

## Overview

When a user selects **Program Type: Custom**, the program creation flow is a multi-step wizard that collects all possible program metadata. Fields are shown or hidden conditionally based on the choices made in earlier steps.

---

## Step 1 — Basic Info

Always shown. Captures identity and description of the program.

| Field | DTO Key | Type | Required | Notes |
|---|---|---|---|---|
| Program Name | `name` | string | Yes | |
| Program Code | `code` | string | No | Short identifier e.g. AYW2 |
| Program Description | `description` | string | No | |
| Sub Program Type | `subProgramType` | enum | No | `SubProgramTypeEnum` |
| Banner Image | `bannerImageUrl` | string | No | URL |
| Banner Animation | `bannerAnimationUrl` | string | No | URL |
| Logo | `logoUrl` | string | No | URL |
| Launch Date | `launchDate` | date | No | |
| Status | `status` | enum | No | `ProgramStatusEnum` |
| Is Active | `isActive` | boolean | No | |

---

## Step 2 — Program Mode

Always shown. These flags drive conditional rendering in all subsequent steps.

| Field | DTO Key | Type | Options | Required |
|---|---|---|---|---|
| Mode of Operation | `modeOfOperation` | enum | `ONLINE` / `OFFLINE` / `HYBRID` | Yes |
| Online Type | `onlineType` | enum | `MEETING` / `WEBINAR` / `LIVE_STREAM` | **Only if `modeOfOperation` = ONLINE or HYBRID** |
| Program Structure | `hasMultipleSessions` / `isGroupedProgram` | enum (radio) | `SINGLE_SESSION` / `MULTIPLE_SESSIONS` / `GROUPED` | Yes |
| Frequency | `frequency` | enum | `FrequencyEnum` values | No |
| Max Session Duration Days | `maxSessionDurationDays` | number | ≥ 0 | No |

> **Rule:** If `modeOfOperation = ONLINE`, the Travel stage is automatically disabled regardless of the `isTravelInvolved` flag.

> **Rule:** `hasMultipleSessions` and `isGroupedProgram` are **mutually exclusive**. Only one can be true at a time. Render as a single-select (radio group): `SINGLE_SESSION` (both false) / `MULTIPLE_SESSIONS` (`hasMultipleSessions = true`, `isGroupedProgram = false`) / `GROUPED` (`isGroupedProgram = true`, `hasMultipleSessions = false`).

---

## Step 3 — Schedule & Dates

Always shown.

| Field | DTO Key | Type | Required | Notes |
|---|---|---|---|---|
| Starts At | `startsAt` | datetime | No | Program start date/time |
| Ends At | `endsAt` | datetime | No | Program end date/time |
| Bless Ends At | `blessEndsAt` | datetime | No | |
| Can Register Till | `canRegisterTill` | datetime | No | Last possible registration moment |
| Registration Starts At | `registrationStartsAt` | datetime | No | |
| Registration Ends At | `registrationEndsAt` | datetime | No | |
dTime` | time string | No | e.g. "18:00:00" |
| Number of Sessions | `noOfSession` | number | No | ≥ 0 |

---

## Step 4 — Venue & Location

| Field | DTO Key | Type | Condition | Notes |
|---|---|---|---|---|
| Venue | `venue` | string | Always | Venue name/description |
| Venue Name in Emails | `venueNameInEmails` | string | Always | Display name used in email comms |
| Venue Address | `venueAddress` | object (`CreateAddressDto`) | Always | Full address object |

---

## Step 5 — Registration Rules

Always shown. These toggles control the registration workflow.

| Field | DTO Key | Type | Required | Notes |
|---|---|---|---|---|
| Requires Approval | `requiresApproval` | boolean | No | Seeker must be approved before paying |
| Allow Save as Draft | `allowSaveAsDraft` | boolean | No | Seeker can save and return later |
| Allows Proxy Registration | `allowsProxyRegistration` | boolean | No | Someone can register on behalf of another |
| Allows Minors | `allowsMinors` | boolean | No | |
| Registration Level | `registrationLevel` | enum | No | `RegistrationLevelEnum` |
| Requires Attendance All Sessions | `requiresAttendanceAllSessions` | boolean | No | |
| Requires Residence | `requiresResidence` | boolean | No | |
| Elder Minimum Age | `elderMinAge` | number | No | |
| Child Maximum Age | `childMaxAge` | number | No | |

---

## Step 6 — Seats & Capacity

| Field | DTO Key | Type | Condition | Notes |
|---|---|---|---|---|
| Limited Seats | `limitedSeats` | boolean | Always | Toggle — drives seat cap fields |
| Total Seats | `totalSeats` | number ≥ 0 | **Only if `limitedSeats` = true** | |
| Available Seats | `availableSeats` | number ≥ 0 | **Only if `limitedSeats` = true** | |
| Max Capacity | `maxCapacity` | number ≥ 0 | **Only if `limitedSeats` = true** | |
| Waitlist Applicable | `waitlistApplicable` | boolean | **Only if `limitedSeats` = true** | |
| Waitlist Trigger Count | `waitlistTriggerCount` | number ≥ 0 | **Only if `waitlistApplicable` = true** | Number of registrations that trigger waitlist |
| Allocate Seat If Offline Pending | `allocateSeatIfOfflinePending` | boolean | No | |

---

## Step 7 — Stage Flags (Feature Toggles)

These flags enable or disable entire functional stages of the program lifecycle.

| Field | DTO Key | Stage Activated | Condition |
|---|---|---|---|
| Requires Payment | `requiresPayment` | Payment & Invoice stage | Always available |
| Is Travel Involved | `isTravelInvolved` | Travel stage | **Disabled (forced false) if `modeOfOperation = ONLINE`** |
| Has Goodies | `hasGoodies` | Goodies stage | Always available |
| Seeker Can Share Experience | `seekerCanShareExperience` | Share Experience (post-program) | Always available |
| Has Checkin/Checkout | `hasCheckinCheckout` | Check-in / Check-out tracking | Always available |
| Is Residence Required | `isResidenceRequired` | Residence stage | Always available |

---

## Step 8 — Payment & Pricing

**Shown only if `requiresPayment` = true.**

| Field | DTO Key | Type | Notes |
|---|---|---|---|
| Base Price | `basePrice` | decimal ≥ 0 | |
| Program Fee | `programFee` | decimal ≥ 0 | |
| Currency | `currency` | string | e.g. "INR" |
| GST Percentage | `gstPercentage` | decimal 0–100 | |
| CGST | `cgst` | decimal 0–100 | |
| SGST | `sgst` | decimal 0–100 | |
| IGST | `igst` | decimal 0–100 | |
| GST Number | `gstNumber` | string | e.g. "27AAACG1234R1Z5" |
| TDS Percent | `tdsPercent` | decimal 0–100 | |
| TDS Applicability | `tdsApplicability` | enum | `TdsApplicabilityEnum` |

---

## Step 9 — Invoice & Billing Details

**Shown only if `requiresPayment` = true.**

| Field | DTO Key | Type | Notes |
|---|---|---|---|
| Invoice Sender Name | `invoiceSenderName` | string | |
| Invoice Sender PAN | `invoiceSenderPan` | string | |
| Invoice Sender CIN | `invoiceSenderCin` | string | |
| Invoice Sender Address | `invoiceSenderAddress` | string | |

---

## Step 10 — Email & Communication

Always shown.

| Field | DTO Key | Type | Notes |
|---|---|---|---|
| Email Sender Name | `emailSenderName` | string | |
| Email Sender Address | `emailSenderAddress` | string | |
| Email BCC Address | `emailBccAddress` | string | |
| Email BCC Name | `emailBccName` | string | |
| Helpline Number | `helplineNumber` | string | |

---

## Step 11 — Checkin / Checkout

**Shown only if `hasCheckinCheckout` = true.**

| Field | DTO Key | Type | Notes |
|---|---|---|---|
| Check-in At | `checkinAt` | datetime | |
| Check-out At | `checkoutAt` | datetime | |
| Check-in Ends At | `checkinEndsAt` | datetime | |
| Check-out Ends At | `checkoutEndsAt` | datetime | |

---

## Step 12 — Residence

**Shown only if `isResidenceRequired` = true (or `requiresResidence` = true).**

| Field | DTO Key | Type | Notes |
|---|---|---|---|
| Total Bed Count | `totalBedCount` | number ≥ 0 | |

---

## Step 13 — Grouped Programs (Sub-programs)

**Shown only if `isGroupedProgram` = true.**

Each grouped program entry is a `GroupedProgramDto`. A list of sub-programs can be added, each with:

| Field | DTO Key | Type | Required | Notes |
|---|---|---|---|---|
| Sub-program ID | `id` | number | No | For updates only |
| Workflow ID | `workflowId` | number | No | Inherits from parent if not set |
| Name | `name` | string | Yes | |
| Code | `code` | string | No | |
| Description | `description` | string | No | |
| Group Display Order | `groupDisplayOrder` | number ≥ 1 | Yes | Sort order among sibling groups |
| Starts At | `startsAt` | datetime | No | |
| Ends At | `endsAt` | datetime | No | |
| Bless Ends At | `blessEndsAt` | datetime | No | |
| Can Register Till | `canRegisterTill` | datetime | No | |
| Registration Starts At | `registrationStartsAt` | datetime | No | |
| Registration Ends At | `registrationEndsAt` | datetime | No | |
| Duration | `duration` | string | No | |
| Total Seats | `totalSeats` | number ≥ 0 | No | |
| Number of Sessions | `noOfSession` | number ≥ 0 | No | |
| Venue | `venue` | string | No | |
| Venue Address | `venueAddress` | object | No | `CreateAddressDto` |
| Base Price | `basePrice` | decimal | No | |
| Program Fee | `programFee` | decimal | No | |
| GST Percentage | `gstPercentage` | decimal | No | |
| CGST | `cgst` | decimal | No | |
| SGST | `sgst` | decimal | No | |
| IGST | `igst` | decimal | No | |
| GST Number | `gstNumber` | string | No | |
| TDS Percent | `tdsPercent` | decimal | No | |
| TDS Applicability | `tdsApplicability` | enum | No | |
| Invoice Sender Name | `invoiceSenderName` | string | No | |
| Invoice Sender PAN | `invoiceSenderPan` | string | No | |
| Invoice Sender CIN | `invoiceSenderCin` | string | No | |
| Invoice Sender Address | `invoiceSenderAddress` | string | No | |
| Currency | `currency` | string | No | |
| Helpline Number | `helplineNumber` | string | No | |
| Email Sender Name | `emailSenderName` | string | No | |
| Email Sender Address | `emailSenderAddress` | string | No | |
| Email BCC Address | `emailBccAddress` | string | No | |
| Email BCC Name | `emailBccName` | string | No | |
| Venue Name in Emails | `venueNameInEmails` | string | No | |
| Launch Date | `launchDate` | date | No | |
| Mode of Operation | `modeOfOperation` | enum | No | Overrides parent |
| Online Type | `onlineType` | enum | No | Overrides parent |
| Has Multiple Sessions | `hasMultipleSessions` | boolean | No | |
| Max Session Duration Days | `maxSessionDurationDays` | number | No | |
| Frequency | `frequency` | enum | No | |
| Limited Seats | `limitedSeats` | boolean | No | |
| Status | `status` | enum | No | |
| Is Active | `isActive` | boolean | No | |
| Requires Payment | `requiresPayment` | boolean | No | |
| Requires Attendance All Sessions | `requiresAttendanceAllSessions` | boolean | No | |
| Allows Minors | `allowsMinors` | boolean | No | |
| Allows Proxy Registration | `allowsProxyRegistration` | boolean | No | |
| Requires Approval | `requiresApproval` | boolean | No | |
| Allow Save as Draft | `allowSaveAsDraft` | boolean | No | |
| Registration Level | `registrationLevel` | enum | No | |
| Allocate Seat If Offline Pending | `allocateSeatIfOfflinePending` | boolean | No | |
| Seeker Can Share Experience | `seekerCanShareExperience` | boolean | No | |
| Total Bed Count | `totalBedCount` | number | No | |
| Is Residence Required | `isResidenceRequired` | boolean | No | |
| Is Travel Involved | `isTravelInvolved` | boolean | No | |
| Has Goodies | `hasGoodies` | boolean | No | |
| Has Checkin/Checkout | `hasCheckinCheckout` | boolean | No | |
| Check-in At | `checkinAt` | datetime | No | |
| Check-out At | `checkoutAt` | datetime | No | |
| Check-in Ends At | `checkinEndsAt` | datetime | No | |
| Check-out Ends At | `checkoutEndsAt` | datetime | No | |
| Banner Image URL | `bannerImageUrl` | string | No | |
| Banner Animation URL | `bannerAnimationUrl` | string | No | |
| Sub Program Type | `subProgramType` | enum | No | |
| Logo URL | `logoUrl` | string | No | |
| Meta | `meta` | object | No | Free-form JSON |

---

## Step 14 — Sessions

**Shown only if `hasMultipleSessions` = true.**

A list of `CreateProgramSessionDto` entries is collected under `programSessions`.

---

## Step 15 — Meta / Advanced

Always shown (optional).

| Field | DTO Key | Type | Notes |
|---|---|---|---|
| Meta | `meta` | object (JSON) | Free-form additional data |
| Program (legacy) | `program` | string | Optional legacy reference |

---

## Conditional Visibility Summary

```
modeOfOperation = ONLINE
  → onlineType shown (required)
  → isTravelInvolved forced = false, Travel step hidden

modeOfOperation = OFFLINE or HYBRID
  → onlineType hidden
  → isTravelInvolved available

Program Structure = MULTIPLE_SESSIONS  (hasMultipleSessions = true, isGroupedProgram = false)
  → Step 14 (Sessions) shown; Step 13 hidden

Program Structure = GROUPED  (isGroupedProgram = true, hasMultipleSessions = false)
  → Step 13 (Grouped Programs) shown; Step 14 hidden

Program Structure = SINGLE_SESSION  (both false)
  → Steps 13 and 14 both hidden

limitedSeats = true
  → totalSeats, availableSeats, maxCapacity, waitlistApplicable shown

waitlistApplicable = true  (requires limitedSeats = true)
  → waitlistTriggerCount shown

requiresPayment = true
  → Step 8 (Payment & Pricing) shown
  → Step 9 (Invoice & Billing) shown

hasCheckinCheckout = true
  → Step 11 (Checkin/Checkout dates) shown

isResidenceRequired = true (or requiresResidence = true)
  → Step 12 (Residence / Bed count) shown
```

---

## Required Fields at Root Level (Always)

| DTO Key | Notes |
|---|---|
| `typeId` | Resolved automatically to "Custom" type |
| `workflowId` | Must be selected |
| `name` | Program name |
| `createdBy` | Resolved from logged-in user |
| `updatedBy` | Resolved from logged-in user |
