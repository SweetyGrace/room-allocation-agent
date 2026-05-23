# Input Design Specification: Product Spec Template Generator

> This document records all decisions made about the structure, rules, and behavior of the product spec generation template. It is the authoritative reference used to build and validate the template. Any future changes to the template must first be reflected here.

---

## 1. Purpose

The Product Spec is the first AI-generated artifact in the spec-driven development pipeline. It defines what a module does from a product and business perspective — features, workflows, actors, constraints, and success criteria. It is the primary upstream input for all downstream artifacts.

**Position in the pipeline:**
```
Vision + Business Requirements + Implementation Roadmap + Human Enrichment (optional)
  └── Product Spec (AI-generated, human reviewed)   ← this template
        └── Module-level Tech Spec
              ├── Data Model
              └── Stories / Tasks + UAT Acceptance Criteria
                    └── Task-level Tech Spec (per task)
                          └── Unit Tests + Integration Test Scaffolds
                                └── Code Generation
                                      └── Lint / Type-check Gate
                                            └── Test Execution
                                                  └── UAT → Production
```

**Who generates it:** AI agent  
**Who reviews it:** Product owner + Engineering lead — can approve, suggest changes, or request missing sections  
**Who consumes it:** Module-level Tech Spec agent, Stories/Tasks agent, Data Model agent, UAT agent

---

## 2. Foundation

This template is based on the existing v2 PRD template (`4b - PRD.v2.chatmode.md`) with the following modifications:

| What | Change |
|---|---|
| Features section | Added — standalone capability descriptions separate from workflows |
| Data Requirements | Modified — keeps only field constraints (mandatory/optional, min/max length). Input/output formats, stored data, schema, and retention policy moved to Tech Spec |
| Downstream Input Matrix | Added — defines which sections are passed to which downstream artifact |
| Milestone / Phase Marker | Added — explicit connection to the roadmap milestone |
| Input rules | Updated — reflects Vision + Business Requirements + Roadmap + optional Human Enrichment |
| Pre-spec discussion | Updated — agent asks for Human Enrichment document first; proceeds without it if not available |

Everything else from the v2 template is kept as-is.

---

## 3. Inputs to the AI Agent

The AI agent must ask for Human Enrichment first before proceeding. The human either provides it or confirms they do not have it.

| Input | Required | Purpose |
|---|---|---|
| Vision Document | Yes | Product direction, personas, long-term goals |
| Business Requirements | Yes | Functional requirements + NFRs the business owns |
| Implementation Roadmap | Yes | Milestone scope, sequencing, what is in scope for which milestone |
| Human Enrichment | No — ask first | Additional feature context, opinions, or constraints the human has that are not captured in the above documents |

### Human Enrichment Rule

The AI agent must explicitly ask:
> "Do you have any additional context, feature vision, or constraints for this module that are not captured in the Vision, Business Requirements, or Roadmap? If yes, please provide them. If not, I will proceed with the documents provided."

If the human says no or does not respond with enrichment content, the agent proceeds with the three mandatory inputs only.

**Critical Rule:** The agent must never generate the Product Spec until it has either received the Human Enrichment document or received explicit confirmation that the human has nothing to add.

---

## 4. Scope — What the Product Spec Contains

### What it contains

- Module purpose, business value, and user value
- Milestone / phase scope marker
- Scope boundaries (in scope, out of scope, dependencies, dependents)
- Actor / persona definitions (goals, context, pain points)
- Feature list with standalone descriptions
- Workflows — end-to-end user journeys embedding rules, system behavior, and acceptance criteria
- Field constraints only from Data Requirements (mandatory/optional, min/max length per field)
- Module-specific NFRs (performance, reliability, security, usability)
- Module-level success metrics
- Open questions

### What it does NOT contain

- Input/output data formats — Tech Spec
- Stored data / schema overview — Data Model template
- Data retention policy — Tech Spec
- Technology choices — Tech Spec
- API contracts — Tech Spec
- Implementation details — Tech Spec

---

## 5. Features vs Workflows — Distinction

| | Features | Workflows |
|---|---|---|
| Describes | What the module can do — a capability | How a user accomplishes a goal using one or more capabilities |
| Level of detail | Name + description + who uses it + key constraints | End-to-end narrative — happy path, variations, failures, system impact, acceptance criteria |
| Relationship | A feature may appear in one or more workflows | A workflow uses one or more features |
| Used by downstream | Tech Spec agent | Stories/Tasks agent, UAT agent |

### Feature Description Format

Each feature entry contains:
- **Feature Name** — concise, capability-oriented name
- **Description** — what this capability does in 2-3 sentences
- **Actors** — who uses this feature
- **Key Constraints** — business rules or limits that govern this feature
- **Workflows** — which workflows use this feature (reference by name)

---

## 6. Data Requirements — Scope at This Level

Only field-level constraints that are **product decisions** stay in the Product Spec:
- Whether a field is mandatory or optional
- Minimum and maximum character length for text fields
- Allowed values for selection fields (dropdowns, toggles)

Everything else moves to the Tech Spec or Data Model template.

**Critical Rule from v2:** For every user-facing input field, the spec must document whether it is mandatory or optional, and for text fields, the minimum and maximum character length. These must be confirmed during the Human Enrichment step — never assumed.

---

## 7. Downstream Input Matrix

Defines which Product Spec sections are passed to each downstream artifact. Only the required sections are passed — not the full document.

| Downstream Artifact | Product Spec Sections Required |
|---|---|
| Module-level Tech Spec | Module Overview, Scope & Boundaries, Actors, Features, Data Requirements (field constraints only) |
| Stories / Tasks | Module Overview, Actors, Features, Workflows, Success Metrics |
| Data Model | Module Overview, Scope & Boundaries, Features, Data Requirements (field constraints only) |
| UAT Acceptance Criteria | Workflows (Acceptance Criteria blocks only), Success Metrics |

### Section Independence Rule

Every section in the Product Spec must be self-contained and independently addressable. A downstream agent must be able to read only its required sections and have full context without needing to read other sections.

---

## 8. Milestone / Phase Marker

Each Product Spec is scoped to a specific milestone from the Implementation Roadmap. The milestone marker explicitly states:
- Which milestone this spec covers
- What is in scope for this milestone vs deferred to future milestones
- The delivery date from the roadmap

This prevents the AI agent from generating features that are out of scope for the current milestone.

---

## 9. Workflow Structure

Each workflow must be self-contained — a reader must not need to reference another section to understand it. Workflows embed:
- Happy path narrative (business language, active voice)
- Variations (meaningful alternate paths)
- Failure scenarios (what goes wrong, what the user sees, how the system recovers)
- System impact (data created, events triggered, other modules affected)
- Acceptance criteria (observable outcomes — not implementation details)

**Typical workflow count:** 4–8 per module. More than 8 suggests the module scope is too broad.

---

## 10. Writing Principles

Inherited from v2 template and applied here:

**Do:**
- Write in active voice — "When a user opens the feed, the system ranks content by..."
- Name the actor at the start of each action
- Embed rules directly into the narrative
- State downstream impact inline
- Keep each workflow self-contained

**Do not:**
- Use formal notation (FR-001, US-001, BR-001)
- Separate the rule from the action it governs
- Introduce technical implementation details
- Use passive voice that hides who is responsible
- Assume unresolved decisions — flag them in Open Questions

---

## 11. Open Questions Rule

Any unresolved decision must go to the Open Questions section — never silently resolved in the narrative. Each open question carries:
- Question title
- Context (why it exists, what decision it affects)
- Options (possible answers being considered)
- Impact (what is affected if not resolved, and by when)
- Owner (who makes the decision)

---

## 12. Review and Partial Regeneration

After the AI agent generates the Product Spec, humans review it. They can:
- Approve — set review status to `Approved`
- Request changes — add comments; AI agent updates only affected sections
- Request missing sections — AI agent generates only that section without rewriting the rest

Each section is independently addressable — the AI agent can regenerate any single section given the original inputs without modifying other sections.

A Product Spec that is not in `Approved` status must not be used to generate downstream artifacts.

---

## 13. Output

- **Format:** Markdown (`.md`)
- **Filename:** `docs/implementation/[MODULE-NAME]/[milestone]-product-spec-v2.md`
- **Folder:** Use existing module folder or create if it does not exist

---

## 14. Change Log

| Date | Change | Author |
|---|---|---|
| 2026-05-08 | Initial specification documented | Venkat + Claude |
