# Module-Level Tech Spec — Custom Program Type (v1.1)

---

## Document Metadata

| Field | Value |
|---|---|
| **Module** | Custom Program Type — Program Creation Wizard |
| **Version** | v1.1 |
| **Review Status** | Draft |
| **Product Spec Version** | v1.0 |
| **Milestone Scope** | M1 |
| **Generated On** | 2026-05-13 |
| **Last Updated** | 2026-05-15 |
| **Platform Scope** | Web (React), Backend (NestJS) |

---

## Review Comments

| # | Section | Comment | Status | Resolved On |
|---|---|---|---|---|
| 1 | §1.3 In Scope | Program edit flow added — same wizard pre-filled via GET, submits via PATCH /api/programs/:id | Resolved | 2026-05-13 |
| 2 | §1.5 / §10.1 / §8.1 | Auth changed to localStorage — user ID passed in request payload, not JWT blocking dependency | Resolved | 2026-05-13 |
| 3 | §1.5 Dependencies | Workflow Module changed to RELATES-TO — API already live | Resolved | 2026-05-13 |
| 4 | §1.5 Dependencies | Program Type Module changed to RELATES-TO — already seeded | Resolved | 2026-05-13 |
| 5 | §1.5 Dependencies | Address Module removed — not required | Resolved | 2026-05-13 |
| 6 | §3.1 / §5.1 / §5.2 / §11 / §13 | Edit flow endpoints (GET, PATCH), ProgramUpdated event, update() interface, integration/UAT tests, M1 infra added | Resolved | 2026-05-13 |

---

## 1. Module Overview

### 1.1 Purpose

This module delivers the "Custom" program type creation wizard — a 15-step, multi-stage form that assembles the full `CreateProgramDto` payload and submits it to the programs API. It is the primary mechanism by which administrators configure programs with any combination of mode, structure, stage flags, payment, travel, goodies, residence, checkin/checkout, grouped sub-programs, and sessions. The wizard enforces all conditional visibility rules and mutual exclusivity constraints client-side before submission.

### 1.2 Personas

**Program Administrator** — creates and configures programs. Interacts exclusively through the web admin interface. Has program-create permission enforced by the backend auth guard; user ID is sourced from localStorage on the client.

### 1.3 Scope

**In Scope:**
- Multi-step wizard UI (React, web only) for program creation
- Program edit flow — same wizard pre-filled with existing values, submits via `PATCH /api/programs/:id`
- Client-side conditional rendering and field validation per step
- Assembly of `CreateProgramDto` and `GroupedProgramDto` payloads
- `POST /api/programs` API call on final submission (create)
- `PATCH /api/programs/:id` API call when editing an existing program
- Draft save via `POST /api/programs` with `status = DRAFT`
- Backend validation of the Custom program payload

**Out of Scope:**
- Program listing and filtering
- Session content management post-creation
- Payment processing, travel operations, goodies fulfillment, residence management

### 1.4 Milestone Coverage

| Milestone | Scope Summary | Status |
|---|---|---|
| M1 | Full wizard with all 15 steps, conditional logic, grouped sub-programs, sessions, draft save, and form submission | In Scope |
| M2 | Placeholder — pending M2 Product Spec | Placeholder |
| M3 | Placeholder — pending M3 Product Spec | Placeholder |

### 1.5 Dependencies on Other Modules

| Module | Dependency Type | What Is Required Before This Module Can Proceed |
|---|---|---|
| Workflow Module | RELATES-TO | `GET /api/workflows` already live — consumed for workflow selector; no blocker |
| Program Type Module | RELATES-TO | Custom `typeId` already seeded in program types table — resolved at runtime; no blocker |
| Program Session Module | RELATES-TO | `CreateProgramSessionDto` shape must be stable before Step 14 session form is built |
| Auth Module | RELATES-TO | Logged-in user ID read from localStorage — no JWT blocking dependency; `createdBy`/`updatedBy` injected from this value on submission |

---

## 2. Architecture

### 2.1 Architectural Pattern

The wizard follows a **config-driven multi-step form** pattern on the frontend. Form state is managed by **React Hook Form** using a JSON-driven field config (`addProgramFormConfig.json`) interpreted by the `useAddProgramFormConfig` hook. Each section and sub-program type resolves its fields dynamically from config at render time. Validation schemas are built dynamically via `buildSchemaFromFields()` rather than hardcoded Yup shapes. The step sequence is computed dynamically from the state — steps with `visible = false` are skipped in the navigation. On the backend, the programs module follows a standard **Repository + Service layer** pattern (NestJS): the controller receives the DTO, the service orchestrates creation of the root program and child records (grouped programs, sessions), and repositories handle persistence.

### 2.2 Service Boundaries

**Frontend wizard** owns: multi-step state, conditional visibility computation, per-step validation, payload assembly, and the `POST /api/programs` call.

**Backend programs service** owns: DTO validation, `typeId` resolution for Custom type, `createdBy`/`updatedBy` injected from the user ID passed in the request (sourced from localStorage on the client), transactional creation or update of root Program + child GroupedPrograms + child ProgramSessions, and event emission post-creation.

### 2.3 Data Ownership

```
Owned Entities (backend):
- Program: root entity created by this module
- GroupedProgram: child entities created when isGroupedProgram = true
- ProgramSession: child entities created when hasMultipleSessions = true

Read-only Entities (owned by other modules):
- Workflow: owned by Workflow module — read via existing API for selector
- ProgramType: owned by Program Type module — Custom type ID already seeded, read at runtime
```

### 2.4 Communication Patterns

| Consumer | Provider | Pattern | Protocol | Notes |
|---|---|---|---|---|
| Wizard (Web) | Workflow API | Synchronous | REST GET | Fetch workflow list for Step 1 selector; cached for session duration |
| Wizard (Web) | Programs API | Synchronous | REST POST | Submit full payload on final step or draft save |
| Programs Service | Event Bus | Async | Internal event / message queue | Emit ProgramCreated event with stage flags for downstream modules |
| Wizard (Web) | Programs API | Synchronous | REST PATCH | Update existing program on edit submission; pre-fill fetch via REST GET |

### 2.5 Infrastructure Components

| Component | Purpose | Depended On By |
|---|---|---|
| React Hook Form (`useForm`) | Holds entire wizard state across step navigation via a single form instance; prevents data loss on step transitions | All wizard steps and sub-program sections |
| `useAddProgramFormConfig(programType, programStructure?)` hook | Resolves the active field config arrays (main sections + sub-program fields) from `addProgramFormConfig.json` based on program type and structure; returns `useMemo`-computed field lists synchronously | `AddProgramPage`, `DynamicFormSection`, `DynamicSubProgramsSection` |
| `buildSchemaFromFields(fields)` | Dynamically builds a Yup schema shape from a config field array; replaces hardcoded Yup schemas for CUSTOM type | `AddProgramPage` validation |
| Step visibility engine | Computes the active step sequence from current form state; re-evaluates on every relevant flag change | Step indicator, navigation buttons, step renderer |
| Conditional field renderer (`DynamicFieldRenderer`) | Renders fields within a step based on local conditions; supports `visibleWhen` (single condition), `visibleWhenAll` (all-match AND conditions), and `disabledWhen` (field rendered but interactions blocked) | Steps 2, 6, 7, 8, 9, 11, 12, 13, 14 |
| `CreatableSelectField` | Common component — multi-select with tag-style creatable input; used for `venueAddress` and similar fields | Any step needing creatable multi-select |
| `ImageUploadField` | Common component — file picker that uploads an image and returns the resulting URL in the DTO payload; used for `logoUrl` | Step 1 (Basic Info) |

---

## 3. API Contracts (Route Signatures)

### 3.1 Milestone 1 Routes

| Method | Path | Auth Required | Success Code | Error Codes | Description |
|---|---|---|---|---|---|
| POST | /api/programs | Yes | 201 | 400, 401, 403, 409 | Create a new Custom program; accepts full `CreateProgramDto`; creates child GroupedPrograms and ProgramSessions transactionally |
| PATCH | /api/programs/:id | Yes | 200 | 400, 401, 403, 404, 409 | Update an existing Custom program; accepts partial `CreateProgramDto`; updates or replaces child GroupedPrograms and ProgramSessions |
| GET | /api/programs/:id | Yes | 200 | 401, 403, 404 | Fetch existing program to pre-fill the edit wizard |
| GET | /api/workflows | Yes | 200 | 401, 403 | Fetch workflows for Step 1 selector — API already live |

### 3.2 Milestone 2 Routes

> Placeholder — to be populated when M2 Product Spec is available.

### 3.3 Deprecated Routes

| Method | Path | Deprecated In | Sunset Date | Replacement |
|---|---|---|---|---|
| — | — | — | — | — |

---

## 4. Data Model Context

### 4.1 Owned Entities

| Entity | Responsibility | Key Relationships | Business-Rule Constraints |
|---|---|---|---|
| Program | Root program record; holds all scalar fields from `CreateProgramDto` | Has many GroupedPrograms; has many ProgramSessions; belongs to Workflow | `typeId` must be Custom type; `createdBy` and `updatedBy` required; `name` required |
| GroupedProgram | Child sub-program within a grouped parent | Belongs to Program (parent); has `groupDisplayOrder` for ordering | Only exists when parent `isGroupedProgram = true`; `groupDisplayOrder` unique within parent |
| ProgramSession | Scheduled session within a multi-session program | Belongs to Program | Only exists when parent `hasMultipleSessions = true`; at least one required |

### 4.2 Cross-Module Entity References

| Entity | Owned By | How This Module Uses It |
|---|---|---|
| Workflow | Workflow Module | FK reference (`workflowId`) on Program; read via existing API |
| ProgramType | Program Type Module | FK reference (`typeId`) on Program; Custom type already seeded, resolved at runtime |

---

## 5. Interfaces

### 5.1 Service Interfaces

| Interface | Purpose | Implemented By |
|---|---|---|
| IProgramService | Exposes `create(dto: CreateProgramDto, userId: number)`: creates root Program + children transactionally, emits ProgramCreated event. Exposes `update(id: number, dto: Partial<CreateProgramDto>, userId: number)`: updates root Program + upserts children, emits ProgramUpdated event | ProgramService |
| IProgramRepository | Provides `save(entity: Program)`, `findById(id)`, `update(id, partial)` | ProgramRepository (TypeORM) |
| IGroupedProgramRepository | Provides `saveMany(entities: GroupedProgram[])`, `upsertMany(parentId, entities)`, `deleteByParentId(parentId)` | GroupedProgramRepository (TypeORM) |
| IProgramSessionRepository | Provides `saveMany(entities: ProgramSession[])`, `upsertMany(parentId, entities)` | ProgramSessionRepository (TypeORM) |

### 5.2 Event Interfaces

| Event | Producer | Consumer | Payload Summary |
|---|---|---|---|
| ProgramCreated | Programs Service | Payment Module, Travel Module, Goodies Module, Residence Module, Checkin Module, Experience Sharing Module | `{ programId, typeId, requiresPayment, isTravelInvolved, hasGoodies, isResidenceRequired, hasCheckinCheckout, seekerCanShareExperience }` |
| ProgramUpdated | Programs Service | Payment Module, Travel Module, Goodies Module, Residence Module, Checkin Module, Experience Sharing Module | `{ programId, typeId, requiresPayment, isTravelInvolved, hasGoodies, isResidenceRequired, hasCheckinCheckout, seekerCanShareExperience, updatedBy }` |

---

## 6. Error Handling Strategy

### 6.1 Error Categories for This Module

| Error Code | Category | HTTP Status | When It Occurs |
|---|---|---|---|
| PROGRAM_NAME_REQUIRED | Validation | 400 | `name` is empty or missing |
| WORKFLOW_NOT_FOUND | NotFound | 400 | `workflowId` does not exist |
| PROGRAM_CODE_CONFLICT | Conflict | 409 | `code` already exists for this organization |
| INVALID_TAX_PERCENTAGE | Validation | 400 | Any tax field > 100 or < 0 |
| INVALID_SEAT_COUNT | Validation | 400 | Any seat count field < 0 |
| GROUPED_PROGRAM_ORDER_CONFLICT | Conflict | 409 | Two sub-programs share the same `groupDisplayOrder` |
| UNAUTHORIZED | Auth | 401 | Auth guard rejects the request — missing or invalid credentials |
| FORBIDDEN | Auth | 403 | User lacks program-create or program-edit permission |

### 6.2 Error Propagation Across Service Boundaries

Backend validation errors are returned as structured `400` responses with a `message` array (NestJS class-validator default). The wizard frontend maps these to the relevant step and field, scrolls to the first error, and displays an inline message. A 409 conflict on `code` is surfaced on the Step 1 `code` field. Generic 5xx errors display a toast: "Something went wrong. Your data has been preserved. Please try again."

### 6.3 Retry and Fallback Strategy

| Scenario | Retry? | Max Attempts | Fallback |
|---|---|---|---|
| Draft save returns 5xx | Yes | 1 automatic retry after 2s | Surface error toast; keep data in form state |
| Final submission returns 5xx | No automatic retry | — | Surface error toast; keep administrator on summary step; allow manual retry |
| Workflow list fetch fails | Yes | 1 automatic retry | Disable workflow selector with message "Unable to load workflows. Please refresh." |

---

## 7. NFR Mapping

| NFR | Business Requirement Target | Implementation Decision | Enforcement Layer |
|---|---|---|---|
| Response Time — Submission | p95 < 3s | GroupedProgram and ProgramSession child records created in a single transaction; avoid N+1 inserts by bulk-inserting children | Backend (DB transaction) |
| Response Time — Step Transition | < 200ms client-side | All step visibility recomputation is synchronous in-memory; no API calls between steps except workflow fetch (cached) | Web (React state) |
| Availability | 99.9% | Standard NestJS deployment; retry on draft save failure | Infrastructure |
| Security — Auth | Auth guard required | Auth guards on programs controller; `createdBy`/`updatedBy` set from user ID sourced from localStorage, passed in request body | Backend (API) |
| Security — Input | Reject XSS in free-text fields | NestJS class-validator `@IsString()` + `@MaxLength()` on all string fields; no raw HTML accepted in description fields | Backend (DTO validation) |
| Security — URL Fields | Reject javascript: scheme | Client-side URL format validation + backend `@IsUrl()` where applicable on banner and logo URL fields | Web + Backend |
| Audit / Logging | Log program creation with actor | Structured log entry on `POST /api/programs`: `{ userId, programId, typeId, action: 'PROGRAM_CREATED', timestamp }` | Backend (service layer) |
| Accessibility | WCAG 2.1 AA | Step indicator uses ARIA `aria-current="step"` on active step; all form inputs have associated `<label>`; disabled Travel toggle has `aria-disabled="true"` and tooltip | Web (React) |

---

## 8. Data Requirements

### 8.1 Input Data

| Data | Source | Format | Validation Rules |
|---|---|---|---|
| Full program creation payload | Administrator via wizard form | JSON (`CreateProgramDto`) | NestJS class-validator decorators on all fields; cross-field rules (endsAt ≥ startsAt, etc.) applied in service layer |
| Workflow selection | `GET /api/workflows` response | JSON array | Must be a valid existing workflow ID |
| User ID (`userId`) | Client localStorage | Number included in request payload | Used to set `createdBy` / `updatedBy` on the backend; never trusted from any other source |
| Existing program data (edit mode) | `GET /api/programs/:id` response | JSON (`CreateProgramDto`-shaped entity) | Used to pre-fill React Hook Form state via `reset()`; must include nested grouped programs and sessions |

### 8.2 Output Data

| Data | Consumer | Format | Timing |
|---|---|---|---|
| Created program ID and full entity | Admin web client (redirect to detail page) | JSON `{ id, name, status, ... }` | Synchronous — returned in POST 201 response |
| ProgramCreated event | Payment, Travel, Goodies, Residence, Checkin, Experience Sharing modules | Internal event payload | Async — emitted after successful DB commit |

### 8.3 Stored Data

| Entity | Storage | Lifecycle | Notes |
|---|---|---|---|
| Program | PostgreSQL — programs table | Created on wizard submission; updated via edit flow; soft-deleted | `status = DRAFT` until explicitly published |
| GroupedProgram | PostgreSQL — grouped_programs table | Created with parent; deleted if parent deleted | Cascade delete with parent |
| ProgramSession | PostgreSQL — program_sessions table | Created with parent; managed by Session module post-creation | Cascade delete with parent |

### 8.4 Retention Policy

| Data / Entity | Retention Period | Enforcement Mechanism | Owner |
|---|---|---|---|
| Program | Indefinite (soft delete only) | Soft delete flag; hard delete requires explicit admin action | Engineering / Product |
| GroupedProgram | Same as parent Program | Cascade soft delete | Engineering |
| ProgramSession | Same as parent Program | Cascade soft delete | Engineering |

---

## 9. Third-Party Integrations

No third-party integrations for this module. All data is persisted internally.

---

## 10. Security Considerations

### 10.1 Authentication and Authorization

The logged-in user's ID is read from localStorage on the client and included in the request payload. `createdBy` and `updatedBy` are set from this value on the backend. Standard auth guards protect all program routes. The `PATCH /api/programs/:id` endpoint verifies the requesting user has permission to edit the target program.

### 10.2 Input Validation

NestJS class-validator runs on the full `CreateProgramDto` and nested `GroupedProgramDto` and `CreateProgramSessionDto` before the service layer is reached. Free-text fields are constrained by `@IsString()` and `@MaxLength()`. Enum fields reject out-of-range values. Decimal fields are validated to max 2 decimal places. URL fields are validated to reject non-URL strings. Nested objects (`venueAddress`, `groupedPrograms`, `programSessions`) use `@ValidateNested()` with `@Type()` to recurse validation.

### 10.3 Sensitive Data Handling

Tax identifiers (PAN, CIN, GST number) and invoice sender details are stored in the programs table. These are not classified as PII but are financially sensitive. They must not appear in application logs. The GST number, PAN, and CIN fields are masked in API list responses — full values returned only in single-record detail responses to authorized users.

### 10.4 Known Security Risks

- **IDOR on draft programs:** A draft program created by User A should not be readable by User B. The GET program detail endpoint must enforce ownership or admin-level access.
- **Large meta payload:** The `meta` field accepts free-form JSON. A size limit (e.g. 64KB) must be enforced server-side to prevent storage abuse.
- **Grouped program override injection:** Sub-programs can override parent fields. The service must ensure sub-programs cannot reference a different parent program via a crafted `id` field — sub-program `id` must be validated against the parent's child list.

---

## 11. Testing Strategy

### 11.1 Unit Test Scope

- `ProgramService.create()`: test all conditional logic — grouped program child creation, session child creation, isTravelInvolved forced-false for ONLINE mode, createdBy/updatedBy injection
- Step visibility engine (frontend): unit test the visibility computation function for all flag combinations
- DTO validation: unit test class-validator constraints for each field, especially cross-field rules

### 11.2 Integration Test Scope

**Create flow:**
- `POST /api/programs` with full Custom payload: verify root program + children created in DB in one transaction
- `POST /api/programs` with ONLINE mode: verify `isTravelInvolved = false` regardless of input
- `POST /api/programs` with missing required fields: verify 400 with correct field errors
- `POST /api/programs` with duplicate `code`: verify 409
- `POST /api/programs` with `status = DRAFT`: verify program saved with DRAFT status

**Edit flow:**
- `GET /api/programs/:id`: verify full entity returned including nested `groupedPrograms` and `programSessions`
- `PATCH /api/programs/:id` with updated fields: verify root program and children updated in one transaction
- `PATCH /api/programs/:id` with ONLINE mode: verify `isTravelInvolved = false` enforced
- `PATCH /api/programs/:id` with unknown ID: verify 404

**Shared:**
- Workflow fetch failure: verify wizard degrades gracefully

### 11.3 Performance Test Scope

- `POST /api/programs` with 10 grouped sub-programs and 20 sessions: must complete < 3s at p95 under 50 concurrent requests
- Tool: k6 or Artillery
- Pass threshold: p95 < 3000ms, error rate < 1%

### 11.4 UAT Scope

**Create flow:**
- Full wizard walkthrough for each program structure variant (SINGLE, MULTIPLE_SESSIONS, GROUPED)
- Travel toggle disabled verification for ONLINE mode
- Draft save and resume flow
- Paid program flow with tax field validation
- Limited seats + waitlist flow
- Submission and redirect to program detail page

**Edit flow:**
- Open existing Custom program via Edit; verify all fields pre-filled correctly across all steps
- Verify step visibility computed from fetched flags (correct steps active on first load)
- Modify fields, submit via Save Changes; verify program detail page reflects updates
- Verify 404 error screen when editing a deleted/unknown program ID

---

## 12. Open Questions

| # | Question | Context | Owner | Status |
|---|---|---|---|---|
| 1 | What is the Custom type's `typeId` value in the database? | Needed to hardcode or seed before M1 delivery | Backend | Open |
| 2 | Is `meta` limited in size? If so, what is the max byte size? | Needed to add server-side validation | Product + Backend | Open |
| 3 | Should clearing `requiresPayment` toggle also zero out pricing fields in the DB for a draft, or just hide them in the UI? | Data integrity concern for drafts that toggle payment on/off multiple times | Product | Open |
| 4 | Does the ProgramCreated event need to be synchronous (within the HTTP response) or can it be async? | Affects whether downstream module activation is immediate | Backend + Product | Open |
| 5 | Are grouped sub-programs validated server-side for `groupDisplayOrder` uniqueness, or is this UI-only? | Determines whether backend needs a unique constraint | Backend | Open |

---

## 13. Milestone-Scoped Sections

---

### Milestone 1 — Custom Program Creation Wizard

**Delivery Date:** TBD
**Scope Summary:** Full 15-step wizard, all conditional fields, grouped sub-programs, sessions, draft save, form submission, and backend program creation with child records.

#### Key Features Delivered
- F1 — Step-by-Step Wizard Navigation
- F2 — Program Mode Configuration (ONLINE/OFFLINE/HYBRID, structure radio)
- F3 — Stage Flag Toggling (payment, travel, goodies, experience, checkin, residence)
- F4 — Seats & Capacity Configuration (limited seats, waitlist)
- F5 — Grouped Sub-Program Entry (inline sub-form with full GroupedProgramDto)
- F6 — Session Entry (CreateProgramSessionDto list)
- F7 — Payment and Invoice Configuration (Steps 8 & 9)
- F8 — Draft Save and Resume
- F9 — Program Edit Flow (same wizard pre-filled via GET, submitted via PATCH)

#### M1 Infrastructure Requirements

- React Hook Form state with config-driven field resolution (`useAddProgramFormConfig`) and `buildSchemaFromFields()` dynamic validation — must be set up before any step is built
- Step visibility engine (field-level `visibleWhen`, `visibleWhenAll`, `disabledWhen` in `DynamicFieldRenderer`) — must be implemented before conditional steps (8, 9, 11, 12, 13, 14) are built
- `POST /api/programs` backend endpoint with full CreateProgramDto support
- `GET /api/programs/:id` backend endpoint returning full entity including nested children
- `PATCH /api/programs/:id` backend endpoint with child upsert support

#### M1 Third-Party Integrations
None.

#### M1 Constraints and Risks
- `CreateProgramSessionDto` shape must be finalised by the Session module team before Step 14 can be built — track as a blocker
- `typeId` for Custom must be seeded in the database before E2E testing can occur
- Grouped sub-program form is the largest single UI surface; estimate conservatively

---

### Milestone 2 — Placeholder

> To be populated when M2 Product Spec is available and reviewed.

**Delivery Date:** TBD
**Scope Summary:** Placeholder — pending M2 Product Spec.

---

### Milestone 3 — Placeholder

> To be populated when M3 Product Spec is available and reviewed.

**Delivery Date:** TBD
**Scope Summary:** Placeholder — pending M3 Product Spec.

---

## 14. Change Log

| Version | Date | Change Summary | Author |
| --- | --- | --- | --- |
| v1.0 | 2026-05-13 | Initial generation from Product Spec v1.0 | AI agent + Madhuri Karedla |
| v1.1 | 2026-05-15 | Added config-driven validation (`buildSchemaFromFields`), new field types (`creatableSelect`, `imageUpload`, `date`, `time`), `visibleWhenAll` and `disabledWhen` support in `DynamicFieldRenderer`, parent-to-child mode sync and reactive prefill in `DynamicSubProgramsSection`, `useAddProgramFormConfig` `programStructure` param, `CreatableSelectField` and `ImageUploadField` common components; removed Zustand/Context references — form state is React Hook Form | Madhuri Karedla |
