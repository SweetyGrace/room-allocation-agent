# Module-Level Tech Spec Template (v2)

> **How to use this template:**
> Feed this template along with the following inputs to the AI agent:
>
> **From the Product Spec (pass only these sections):**
> 1. §1 Module Overview
> 2. §2 Scope & Boundaries
> 3. §3 Actors
> 4. §4 Features
> 5. §6 Data Requirements (field constraints only)
>
> **Additional inputs:**
> 6. Business Requirements (NFR section)
> 7. System-level Architecture (if it exists — agent asks if missing)
>
> **Do not modify the generation rules in this template.** To change the rules, update
> `input-to-generate-module-tech-spec.md` first, then update this template accordingly.

---

## AI Agent Instructions

You are generating a module-level Tech Spec. Follow these steps in order. Do not skip any step.

### Step 1 — Validate Inputs

| Input | Present? | Sufficient? | Gap (if any) |
|---|---|---|---|
| Product Spec §1 Module Overview | Yes / No | Yes / No | [describe gap] |
| Product Spec §2 Scope & Boundaries | Yes / No | Yes / No | [describe gap] |
| Product Spec §3 Actors | Yes / No | Yes / No | [describe gap] |
| Product Spec §4 Features | Yes / No | Yes / No | [describe gap] |
| Product Spec §6 Data Requirements | Yes / No | Yes / No | [describe gap] |
| Business Requirements (NFRs) | Yes / No | Yes / No | [describe gap] |
| System-level Architecture | Yes / No / Not available | Yes / No / N/A | [describe gap] |

**If System-level Architecture is missing:** Ask the following before proceeding:
- What is the overall system topology? (monolith, microservices, serverless, hybrid)
- What communication pattern is used between services? (synchronous REST, event-driven, message queue)
- What is the primary data store?
- What caching layer is available?
- What authentication mechanism is used across the system?
- Are there any mandated technology choices for this module?

**If NFR targets are missing:** List each missing NFR and ask for the target value before proceeding.

---

### Step 2 — Identify Module Scope

```
Module: [name]
Primary Responsibility: [one sentence]
Milestones: [M1 / M2 / M3 — list all]
Personas: [list from Product Spec §3]
Platform Scope: [Web / Mobile / Backend / AI / Infrastructure — list all that apply]
```

---

### Step 3 — Identify Infrastructure Needs

Scan the Product Spec features and workflows for cross-cutting technical components:

```
Infrastructure Components Required:
- [Component]: [why needed] — [which features depend on it]
```

If none: `No infrastructure components identified.`

---

### Step 4 — Identify Third-Party Integrations

```
Third-Party Integrations Required:
- [Service]: [purpose] — [credentials / API contracts needed]
```

If none: `No third-party integrations identified.`

---

### Step 5 — Identify Information Gaps

```
Information Gaps:
- [Gap]: [what is needed and why]
```

Ask the human to fill all gaps before proceeding. If no gaps: `No information gaps. Proceeding with generation.`

---

### Step 6 — Determine Version

```
Previous Version: [v{major}.{minor} or "none — first generation"]
Change Type: [First generation / Minor update / Major restructure]
New Version: [v{major}.{minor}]
```

If a major version increment is required, flag this explicitly to the human reviewer before proceeding.

---

### Step 7 — Generate Output

---

---

# OUTPUT STARTS HERE

---

## Document Metadata

| Field | Value |
|---|---|
| **Module** | [Module name] |
| **Version** | v1.0 |
| **Review Status** | Draft |
| **Product Spec Version** | [Version of Product Spec used as input] |
| **Milestone Scope** | [M1 / M2 / M3] |
| **Generated On** | [Date] |
| **Last Updated** | [Date] |
| **Platform Scope** | [Web / Mobile / Backend / AI / Infrastructure] |

---

## Review Comments

| # | Section | Comment | Status | Resolved On |
|---|---|---|---|---|
| 1 | [Section name] | [Comment or change request] | Open / Resolved | [Date] |

---

## 1. Module Overview

**Required.**

### 1.1 Purpose
[What this module does and why it exists. One paragraph. Reference Product Spec §1.]

### 1.2 Personas
[Which personas interact with this module and in what capacity. Reference Product Spec §3.]

### 1.3 Scope

**In Scope:**
- [Capability this module owns]

**Out of Scope:**
- [Capability explicitly excluded]

### 1.4 Milestone Coverage

| Milestone | Scope Summary | Status |
|---|---|---|
| M1 | [What this module delivers in M1] | In Scope |
| M2 | Placeholder — pending M2 Product Spec | Placeholder |
| M3 | Placeholder — pending M3 Product Spec | Placeholder |

### 1.5 Dependencies on Other Modules

| Module | Dependency Type | What Is Required Before This Module Can Proceed |
|---|---|---|
| [Module name] | BLOCKED-BY | [Specific capability or artifact that must exist] |
| [Module name] | RELATES-TO | [Informational relationship] |

---

## 2. Architecture

**Required.**

### 2.1 Architectural Pattern
[Primary pattern used — e.g., Repository + Service layer, Event-driven, CQRS.
If not defined in system architecture, state the decision made and the justification.]

### 2.2 Service Boundaries
[What this module owns. What it accepts as input, what it produces as output,
what it delegates to other services.]

### 2.3 Data Ownership

```
Owned Entities:
- [Entity name]: [brief description]

Read-only Entities (owned by another module):
- [Entity name]: [which module owns it]
```

### 2.4 Communication Patterns

| Consumer | Provider | Pattern | Protocol | Notes |
|---|---|---|---|---|
| [This module] | [Other module] | Synchronous / Async / Event | REST / WebSocket / Queue | [Detail] |
| [External client] | [This module] | Synchronous | REST | [Auth requirement] |

### 2.5 Infrastructure Components

| Component | Purpose | Depended On By |
|---|---|---|
| [Component name] | [What it does] | [Features / stories that need it] |

If none: `No infrastructure components required.`

---

## 3. API Contracts (Route Signatures)

**Required for modules with Backend scope.**

> Route signatures only. Full request/response shapes defined at task-level Tech Spec.

### 3.1 Milestone 1 Routes

| Method | Path | Auth Required | Success Code | Error Codes | Description |
|---|---|---|---|---|---|
| POST | /api/v1/[resource] | Yes — JWT | 201 | 400, 401, 409 | [What this route does] |
| GET | /api/v1/[resource]/{id} | Yes — JWT | 200 | 401, 404 | [What this route does] |
| PATCH | /api/v1/[resource]/{id} | Yes — JWT | 200 | 400, 401, 403, 404 | [What this route does] |
| DELETE | /api/v1/[resource]/{id} | Yes — JWT | 200 | 401, 403, 404 | [What this route does] |

### 3.2 Milestone 2 Routes

> Placeholder — to be populated when M2 Product Spec is available.

### 3.3 Deprecated Routes

| Method | Path | Deprecated In | Sunset Date | Replacement |
|---|---|---|---|---|
| — | — | — | — | — |

---

## 4. Data Model Context

**Required.**

> Entity-level context only. Full schema in Data Model template.

### 4.1 Owned Entities

| Entity | Responsibility | Key Relationships | Business-Rule Constraints |
|---|---|---|---|
| [Entity name] | [What it represents] | [e.g., belongs to User (many-to-one)] | [e.g., must have an owner, soft-delete only] |

### 4.2 Cross-Module Entity References

| Entity | Owned By | How This Module Uses It |
|---|---|---|
| [Entity name] | [Module name] | [Read-only / FK reference / event-driven update] |

---

## 5. Interfaces

**Required.**

> Interface names and purpose only. Full definitions in task-level Tech Spec.

### 5.1 Service Interfaces

| Interface | Purpose | Implemented By |
|---|---|---|
| I[Module]Service | [What operations this service exposes] | [Service class name] |
| I[Entity]Repository | [What data access operations this repository exposes] | [Repository class name] |

### 5.2 Event Interfaces (If applicable)

| Event | Producer | Consumer | Payload Summary |
|---|---|---|---|
| [EventName] | [This module / other] | [Consumer module] | [Key fields] |

---

## 6. Error Handling Strategy

**Required.**

### 6.1 Error Categories for This Module

| Error Code | Category | HTTP Status | When It Occurs |
|---|---|---|---|
| [ERROR_CODE] | [Validation / NotFound / Conflict / Auth / Infrastructure] | [4xx / 5xx] | [Scenario] |

### 6.2 Error Propagation Across Service Boundaries
[How errors from downstream services are handled — propagated as-is, wrapped, or transformed.]

### 6.3 Retry and Fallback Strategy

| Scenario | Retry? | Max Attempts | Fallback |
|---|---|---|---|
| [External service call fails] | Yes / No | [n] | [Fallback behavior] |
| [Database write fails] | Yes / No | [n] | [Fallback behavior] |

---

## 7. NFR Mapping

**Required.**

> Map every NFR from Business Requirements to a concrete implementation decision.

| NFR | Business Requirement Target | Implementation Decision | Enforcement Layer |
|---|---|---|---|
| Response Time | [Target, e.g., < 500ms at p95] | [e.g., Redis cache for read-heavy endpoints] | [API / application / DB] |
| Throughput | [Target] | [e.g., connection pooling, async processing] | [Application / infrastructure] |
| Availability | [Target, e.g., 99.9%] | [e.g., retry strategy, circuit breaker] | [Infrastructure / application] |
| Rate Limiting | [Target, e.g., 50 req/hour/user] | [e.g., Redis-backed rate limiter] | [API gateway] |
| Security | [Target, e.g., PII encrypted at rest] | [e.g., encrypted columns, no PII in logs] | [DB / application] |
| Audit / Logging | [Target] | [e.g., structured logs with user ID, resource ID, action, timestamp] | [Application] |
| Compliance | [Target, e.g., GDPR] | [e.g., soft delete, retention policy via scheduled job] | [Application / infrastructure] |
| Accessibility | [Target, e.g., WCAG 2.1 AA] | [e.g., semantic HTML, ARIA labels] | [Frontend] |

---

## 8. Data Requirements

**Required.**

> Engineering decisions about data. Field constraints (mandatory/optional, min/max length)
> remain in the Product Spec — those are product decisions.

### 8.1 Input Data

| Data | Source | Format | Validation Rules |
|---|---|---|---|
| [Data name] | [Other module / user action / external service] | [JSON / form / event payload] | [Validation applied at this boundary] |

### 8.2 Output Data

| Data | Consumer | Format | Timing |
|---|---|---|---|
| [Data name] | [Other module / client / event consumer] | [JSON / event / file] | [Synchronous / async / scheduled] |

### 8.3 Stored Data

| Entity | Storage | Lifecycle | Notes |
|---|---|---|---|
| [Entity name] | [PostgreSQL / Redis / S3] | [Created when... / deleted when... / archived when...] | [Any relevant detail] |

### 8.4 Retention Policy

| Data / Entity | Retention Period | Enforcement Mechanism | Owner |
|---|---|---|---|
| [Entity name] | [e.g., 90 days / indefinite / until account deleted] | [Scheduled job / soft delete / manual] | [Engineering / Legal / Product] |

---

## 9. Third-Party Integrations

**If applicable.**

> Each integration listed here becomes a separate, UAT-flagged task in story/task generation.

| Integration | External Service | Purpose | Credentials Required | Stories Dependent On This |
|---|---|---|---|---|
| [Name] | [Service, e.g., Stripe] | [What data flows and why] | [API key / OAuth / webhook secret] | [Story IDs once generated] |

If none: `No third-party integrations for this module.`

---

## 10. Security Considerations

**Required.**

### 10.1 Authentication and Authorization
[Auth mechanism used. Roles / permissions required per operation. Where authorization is enforced.]

### 10.2 Input Validation
[Where validation occurs. What types of inputs are sanitized and how.]

### 10.3 Sensitive Data Handling
[What data is sensitive (PII, credentials). How it is stored, transmitted, excluded from logs.]

### 10.4 Known Security Risks
[Known attack vectors and mitigations — injection, IDOR, race conditions on concurrent writes.]

---

## 11. Testing Strategy

**Required.**

### 11.1 Unit Test Scope
[What is unit-tested — service layer, repositories, validators, mappers. What is mocked.]

### 11.2 Integration Test Scope
[What integration tests cover — route contracts, DB, cross-service calls. Environment required.]

### 11.3 Performance Test Scope
[Which endpoints require load testing. Tool used. Pass/fail threshold.]

### 11.4 UAT Scope
[Which workflows require human verification in UAT. Which third-party integrations verified at UAT only.]

---

## 12. Open Questions

| # | Question | Context | Owner | Status |
|---|---|---|---|---|
| 1 | [Question] | [Why it matters] | [Human / team] | Open |

---

## 13. Milestone-Scoped Sections

---

### Milestone 1 — [Milestone Name]

**Delivery Date:** [From roadmap]
**Scope Summary:** [What this module delivers in M1]

#### Key Features Delivered
- [Feature name]: [brief description — reference Product Spec §4]

#### M1 Infrastructure Requirements
[Which infrastructure components from §2.5 are needed for M1]

#### M1 Third-Party Integrations
[Which integrations from §9 are needed for M1]

#### M1 Constraints and Risks
[Constraints or risks specific to M1 delivery]

---

### Milestone 2 — Placeholder

> To be populated when M2 Product Spec is available and reviewed.

**Delivery Date:** [From roadmap]
**Scope Summary:** Placeholder — pending M2 Product Spec.

---

### Milestone 3 — Placeholder

> To be populated when M3 Product Spec is available and reviewed.

**Delivery Date:** [From roadmap]
**Scope Summary:** Placeholder — pending M3 Product Spec.

---

## 14. Change Log

| Version | Date | Change Summary | Author |
|---|---|---|---|
| v1.0 | [Date] | Initial generation | AI agent + [Reviewer name] |
