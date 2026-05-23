# Input Design Specification: Module-Level Tech Spec Generator (v2)

> This document records all decisions made about the structure, rules, and behavior of the
> module-level tech spec generation template (v2). It supersedes the v1 design spec.
> Any future changes to the template must first be reflected here.

---

## 1. What Changed from v1

| v1 | v2 |
|---|---|
| Primary input was Technical Architecture (separate pipeline step) | Primary input is Product Spec sections (§1, §2, §3, §4, §6) |
| Technical Architecture was a prerequisite artifact | No separate Technical Architecture step — architecture decisions are made inside the Tech Spec |
| Data Requirements lived entirely in Product Spec | Data Requirements split — field constraints stay in Product Spec, input/output formats + stored data + retention policy move here |
| System-level Architecture was a separate input | System-level Architecture is still an input when it exists — agent asks if missing |

---

## 2. Purpose

The module-level Tech Spec is an AI-generated artifact that sits between the Product Spec and
Story/Task generation in the spec-driven development pipeline. It defines the implementation
approach for an entire module — service boundaries, API contracts (route signatures), data
ownership, infrastructure needs, patterns, interfaces, error handling strategy, and data
requirements (input/output formats, stored data, retention policy).

**Position in the pipeline:**
```
Product Spec (§1 Module Overview, §2 Scope & Boundaries, §3 Actors, §4 Features, §6 Data Requirements)
  └── Module-level Tech Spec   ← this template
        ├── Data Model
        └── Stories / Tasks + UAT Acceptance Criteria
              └── Task-level Tech Spec (per task)
```

**Who generates it:** AI agent
**Who reviews it:** Human engineer
**Who consumes it:** Data Model template, Stories/Tasks template, Task-level Tech Spec

---

## 3. Inputs to the AI Agent

| Input | Required | Source |
|---|---|---|
| Product Spec §1 Module Overview | Yes | Product Spec |
| Product Spec §2 Scope & Boundaries | Yes | Product Spec |
| Product Spec §3 Actors | Yes | Product Spec |
| Product Spec §4 Features | Yes | Product Spec |
| Product Spec §6 Data Requirements (field constraints) | Yes | Product Spec |
| Business Requirements (NFR section) | Yes | Business Requirements document |
| System-level Architecture | If exists | Architecture document — agent asks if missing |

### Missing Input Handling

- If System-level Architecture does not exist, the agent must ask architecture questions
  before making any architectural decisions.
- If NFR targets are not in Business Requirements, the agent must flag each gap and ask.
- If Product Spec sections are incomplete, the agent must stop and ask before proceeding.

---

## 4. Data Requirements — Added in v2

The following Data Requirements fields move from the Product Spec to the Module-level Tech Spec:

| Field | Description |
|---|---|
| Input Data | Data this module receives from other modules or user actions — format, validation, source |
| Output Data | Data this module produces — format, timing, consumers |
| Stored Data | Data this module persists — schema overview, lifecycle |
| Retention Policy | How long data is retained, who owns the retention decision, how it is enforced |

Field constraints (mandatory/optional, min/max length) remain in the Product Spec — they are
product decisions. Everything above is an engineering decision and lives here.

---

## 5. What Remains the Same from v1

- Two-level Tech Spec split (module-level vs task-level) — unchanged
- API contracts at route signature level only — unchanged
- Entity-level schema context only (full schema in Data Model template) — unchanged
- Interface names and purpose only (full definitions in task-level Tech Spec) — unchanged
- Error handling split (categories + propagation here, task-level implementation details in task spec) — unchanged
- NFR mapping — unchanged
- Infrastructure needs identification — unchanged
- Third-party integrations identification — unchanged
- Versioning (v{major}.{minor}) — unchanged
- Review process and partial regeneration rule — unchanged
- Section independence rule — unchanged
- Milestone-scoped sections with placeholders — unchanged

---

## 6. Downstream Input Matrix

| Downstream Artifact | Sections Required from This Document |
|---|---|
| Data Model | §4 Data Model Context, §2 Architecture (data ownership), §8 Data Requirements |
| Stories / Tasks | §1 Module Overview, §3 API Contracts, §5 Interfaces, §6 Error Handling, §7 NFR Mapping, §9 Infrastructure, §10 Third-Party Integrations |
| Task-level Tech Spec | All sections |

---

## 7. Change Log

| Date | Change | Author |
|---|---|---|
| 2026-05-08 | v2 — updated inputs to use Product Spec sections instead of Technical Architecture; added Data Requirements section | Venkat + Claude |
