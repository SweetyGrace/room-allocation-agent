# Product Spec Generation Template (v2)

> **How to use this template:**
> Feed this template along with the following inputs to the AI agent:
>
> **Mandatory inputs:**
> 1. Vision Document
> 2. Business Requirements
> 3. Implementation Roadmap
>
> **Optional input (agent asks first):**
> 4. Human Enrichment — additional feature context, opinions, or constraints
>
> The AI agent reads all inputs, follows the generation rules in this template, and produces
> a complete module-level Product Spec. Human review and approval is required before this
> document is used to generate any downstream artifact.
>
> **Do not modify the generation rules in this template.** To change the rules, update
> `input-to-generate-product-spec.md` first, then update this template accordingly.

---

## AI Agent Instructions

You are acting as a Product Manager generating a module-level Product Spec. Follow these steps in order. Do not skip any step.

### Step 1 — Ask for Human Enrichment

Before reading any inputs, ask the human:

> "Do you have any additional context, feature vision, or constraints for this module that are not captured in the Vision, Business Requirements, or Roadmap? If yes, please provide them. If not, I will proceed with the documents provided."

Wait for a response before proceeding. If the human confirms they have nothing to add, proceed with the three mandatory inputs only.

**Critical Rule:** Never generate the Product Spec until you have either received the Human Enrichment content or received explicit confirmation that the human has nothing to add.

---

### Step 2 — Validate Inputs

| Input | Present? | Sufficient? | Gap (if any) |
|---|---|---|---|
| Vision Document | Yes / No | Yes / No | [describe gap] |
| Business Requirements | Yes / No | Yes / No | [describe gap] |
| Implementation Roadmap | Yes / No | Yes / No | [describe gap] |
| Human Enrichment | Yes / No / Not provided | Yes / No / N/A | [describe gap] |

If any mandatory input is missing or insufficient, stop and ask before proceeding.

---

### Step 3 — Identify Module and Milestone Scope

Read the Implementation Roadmap and identify:

```
Module Name: [name]
Milestone: [M1 / M2 / M3]
Delivery Date: [from roadmap]
In-scope Features: [list from roadmap]
Deferred Features: [list explicitly deferred to future milestones]
Module Dependencies: [other modules this module depends on]
Module Dependents: [other modules that depend on this module]
```

---

### Step 4 — Identify Field Constraints

For every user-facing input field in this module, confirm:
- Is this field mandatory or optional?
- For text fields — what is the minimum and maximum character length?
- For selection fields — what are the allowed values?

If these are not defined in the inputs, add them to Open Questions. Never assume field constraints.

---

### Step 5 — Identify Information Gaps and Open Questions

List any unresolved decisions or missing information before writing:

```
Information Gaps / Open Questions:
- [Question]: [context, options, impact, owner]
```

All gaps go to the Open Questions section — never silently resolved in the narrative.

---

### Step 6 — Identify Workflows

Before writing, identify all distinct end-to-end user journeys in this module:

```
Workflows Identified:
1. [Workflow name]: [one sentence — who does what and why]
2. [Workflow name]: [one sentence]
...
```

Typical count: 4–8 workflows per module. If more than 8, flag that the module scope may be too broad.

---

### Step 7 — Generate Output

Generate all sections in order. Every section marked **Required** must be populated.

---

---

# OUTPUT STARTS HERE

---

## Document Metadata

| Field | Value |
|---|---|
| **Module** | [Module name] |
| **Milestone** | [M1 / M2 / M3] |
| **Delivery Date** | [From roadmap] |
| **Version** | v2.0 |
| **Review Status** | Draft |
| **Generated On** | [Date] |
| **Last Updated** | [Date] |
| **Inputs Used** | Vision v[x], Business Requirements v[x], Roadmap v[x], Human Enrichment [Yes / No] |

---

## Review Comments

> For human reviewers. Add change requests or missing section requests here.
> The AI agent reads this section to determine what needs to be regenerated.

| # | Section | Comment | Status | Resolved On |
|---|---|---|---|---|
| 1 | [Section name] | [Comment or change request] | Open / Resolved | [Date] |

---

## 1. Module Overview

**Required.**

| Field | Value |
|---|---|
| **Purpose** | [What this module does in one sentence] |
| **Business Value** | [Why this module matters to the business] |
| **User Value** | [What users gain from this module] |
| **Module Type** | [Core / Feature / Integration / Infrastructure] |
| **Milestone Scope** | [What specific functionality is included in this milestone] |
| **Deferred to Future Milestones** | [What is explicitly out of scope for this milestone] |

---

## 2. Scope & Boundaries

**Required.**

**In Scope:**
- [Specific capability this module provides in this milestone]
- [Specific capability]

**Out of Scope:**
- [What this module explicitly does NOT handle — and which module handles it instead if applicable]
- [Explicit exclusion]

**Dependencies:**

| Module | What This Module Consumes From It |
|---|---|
| [Module name] | [Specific capability, API, or data consumed] |

**Dependents:**

| Module | What It Consumes From This Module |
|---|---|
| [Module name] | [Specific capability, API, or data it consumes] |

---

## 3. Actors

**Required.**

> Defined once here. Workflow narratives reference actors by name without redefining them.

### [Actor Name / Role]

| Field | Value |
|---|---|
| **Goals** | [What they want to achieve through this module] |
| **Context** | [When and where they use this module] |
| **Pain Points** | [Current problems this module solves for them] |
| **Access Level** | [What they can and cannot do in this module] |

> Repeat actor block for each actor.

---

## 4. Features

**Required.**

> Standalone capability descriptions. Each feature may appear in one or more workflows.
> Used by the Tech Spec agent — not the Stories/Tasks agent.

### [Feature Name]

| Field | Value |
|---|---|
| **Description** | [What this capability does — 2-3 sentences] |
| **Actors** | [Who uses this feature] |
| **Key Constraints** | [Business rules or limits that govern this feature] |
| **Appears In Workflows** | [Workflow names that use this feature] |

> Repeat feature block for each feature.

---

## 5. Workflows

**Required.**

> Core section. Each workflow covers a complete end-to-end user journey.
> Write in business language. Embed rules, system behavior, and acceptance criteria directly.
> Do not separate user stories, business rules, or functional requirements into standalone sections.
> Each workflow must be self-contained — a reader must not need to reference another section.

---

### Workflow [N]: [Workflow Name]

**Overview**
[One paragraph describing what this workflow is, who it serves, and why it exists from a business perspective.]

**Happy Path**
[Narrative describing the primary flow in business language. Write as a sequence of events — what the user does, what the system does in response, what rules govern the system's behavior at each step, what changes downstream as a result. Use plain prose, not bullet checklists.]

**Variations**
- **Variation A: [Name]** — [What triggers it, how behavior differs, what the outcome is]
- **Variation B: [Name]** — [Same structure]

**Failure Scenarios**
- **Failure A: [Name]** — [What triggers it, what the user sees, what the system does internally, how it recovers]
- **Failure B: [Name]** — [Same structure]

**System Impact**
- Data created or modified: [what changes in the data layer]
- Events triggered downstream: [what other modules are notified]
- Other modules affected: [which modules and how]
- Analytics or metrics updated: [what is tracked]

**Acceptance Criteria**
- [ ] [Observable outcome that confirms the workflow works end-to-end]
- [ ] [Observable outcome for a key variation]
- [ ] [Observable outcome for a key failure scenario]
- [ ] [Performance or quality threshold that must be met]

---

### Workflow [N+1]: [Next Workflow Name]

> Repeat workflow block for each workflow. Typical count: 4–8 per module.

---

## 6. Data Requirements — Field Constraints Only

**Required.**

> Product decisions only — mandatory/optional status, character limits, allowed values.
> Input/output formats, stored data, schema overview, and retention policy live in the Tech Spec and Data Model template.

| Field Name | Workflow | Mandatory / Optional | Min Length | Max Length | Allowed Values / Notes |
|---|---|---|---|---|---|
| [field_name] | [Workflow name] | Mandatory / Optional | [n or —] | [n or —] | [Allowed values or free text] |
| [field_name] | [Workflow name] | Mandatory / Optional | [n or —] | [n or —] | [Allowed values or free text] |

> Every user-facing input field must appear in this table. Never assume constraints — if unknown, add to Open Questions.

---

## 7. Non-Functional Requirements

**Required.**

> Module-specific quality and performance requirements.
> These are product-owned targets — engineering translates them into implementation decisions in the Tech Spec.

- **Performance:** [Response times, throughput, capacity targets specific to this module]
- **Reliability:** [Uptime, error rates, fallback behavior, recovery requirements]
- **Security:** [Authentication, authorization, data protection, compliance constraints]
- **Usability:** [User experience standards, accessibility, interaction thresholds]

---

## 8. Success Metrics

**Required.**

> How we measure if this module is successful in this milestone.

- **Business Metrics:** [Impact on revenue, retention, or business goals]
- **User Metrics:** [Satisfaction, task completion, engagement quality]
- **Technical Metrics:** [Performance, reliability, signal accuracy]
- **Adoption Metrics:** [Usage rates, feature engagement, behavioral shifts]

---

## 9. Open Questions

**Required — include even if empty.**

> Unresolved decisions that need clarification before or during development.
> Never silently resolve an unresolved decision in the narrative — it goes here.

| # | Question | Context | Options | Impact | Owner | Status |
|---|---|---|---|---|---|---|
| 1 | [Question title] | [Why this question exists and what decision it affects] | [Possible answers] | [What is affected if not resolved — and by when] | [Who decides] | Open |

If no open questions: `No open questions at time of generation.`

---

## 10. Downstream Input Matrix

> Defines which sections of this Product Spec are passed to each downstream artifact.
> Downstream AI agents receive only the sections they need — not the full document.

| Downstream Artifact | Sections Required from This Document |
|---|---|
| Module-level Tech Spec | §1 Module Overview, §2 Scope & Boundaries, §3 Actors, §4 Features, §6 Data Requirements |
| Stories / Tasks | §1 Module Overview, §3 Actors, §4 Features, §5 Workflows, §8 Success Metrics |
| Data Model | §1 Module Overview, §2 Scope & Boundaries, §4 Features, §6 Data Requirements |
| UAT Acceptance Criteria | §5 Workflows (Acceptance Criteria blocks only), §8 Success Metrics |

---

## Writing Principles

> Reference only — not part of the generated output. Remove this section before sharing the document.

**Do:**
- Write in active voice: "When a user opens the feed, the system ranks content by..."
- Name the actor at the start of each action: "The HR Practitioner taps...", "The system evaluates..."
- Embed rules directly into the narrative
- State downstream impact inline
- Keep each workflow self-contained

**Do not:**
- Use formal notation (FR-001, US-001, BR-001)
- Separate the rule from the action it governs
- Write bullet-point checklists where a sentence would communicate more clearly
- Use passive voice that hides who is responsible
- Introduce technical implementation details
- Assume unresolved decisions — flag them in Open Questions
