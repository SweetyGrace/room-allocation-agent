# User Stories & Tasks Generation Template (v2)

> **How to use this template:**
> Feed this template along with the following inputs to the AI agent:
>
> **From the Product Spec (pass only these sections):**
> 1. §1 Module Overview
> 2. §3 Actors
> 3. §4 Features
> 4. §5 Workflows
> 5. §8 Success Metrics
>
> **Additional inputs:**
> 6. Module-level Tech Spec (full document)
>
> The AI agent reads all inputs, follows the generation rules in this template, and produces
> Epics, Stories, and Tasks. Human input is only requested when the inputs do not contain
> sufficient information to make a decision.
>
> **Do not modify the generation rules in this template.** To change the rules, update
> `input-to-generate-userstories-tasks.md` first, then update this template accordingly.

---

## AI Agent Instructions

You are generating Epics, Stories, and Tasks for a software module. Follow these steps in order. Do not skip any step.

### Step 1 — Validate Inputs

| Input | Present? | Sufficient? | Gap (if any) |
|---|---|---|---|
| Product Spec §1 Module Overview | Yes / No | Yes / No | [describe gap] |
| Product Spec §3 Actors | Yes / No | Yes / No | [describe gap] |
| Product Spec §4 Features | Yes / No | Yes / No | [describe gap] |
| Product Spec §5 Workflows | Yes / No | Yes / No | [describe gap] |
| Product Spec §8 Success Metrics | Yes / No | Yes / No | [describe gap] |
| Module-level Tech Spec | Yes / No | Yes / No | [describe gap] |

If any required input is missing or insufficient, stop and ask before proceeding.

---

### Step 2 — Read and Confirm Platform Scope

Read the Module-level Tech Spec §1 Platform Scope. Confirm which platforms this module touches:

| Platform | In Scope? | Evidence |
|---|---|---|
| Web (React) | Yes / No | [Tech Spec section reference] |
| Mobile (React Native) | Yes / No | [Tech Spec section reference] |
| Backend (Python / FastAPI) | Yes / No | [Tech Spec section reference] |
| AI / Async (workers, pipelines) | Yes / No | [Tech Spec section reference] |
| Infrastructure (WebSocket, Redis, queues) | Yes / No | [Tech Spec section reference] |

If platform scope is ambiguous, **stop and ask** before proceeding.

---

### Step 3 — Identify Technical Infrastructure Needs

Read the Module-level Tech Spec §2.5 Infrastructure Components. Confirm which technical components
must exist before product stories can be implemented. These become a **Technical Infrastructure Epic**.

```
Infrastructure Components Found:
- [Component name]: [reason it is needed — Tech Spec section reference]
```

If none are found: `No infrastructure components identified.`

---

### Step 4 — Identify Third-Party Integrations

Read the Module-level Tech Spec §9 Third-Party Integrations. Each integration becomes a **separate,
explicitly labelled task** flagged `UAT Required: Yes`.

```
Third-Party Integrations Found:
- [Service name]: [purpose — Tech Spec section reference]
```

If none are found: `No third-party integrations identified.`

---

### Step 5 — Identify Information Gaps

```
Information Gaps:
- [Gap description]: [what is needed and why]
```

Ask the human to fill all gaps before proceeding. If no gaps: `No information gaps. Proceeding with generation.`

---

### Step 6 — Generate Output

Generate in this order:
1. Technical Infrastructure Epic (only if Step 3 identified infrastructure components)
2. Product Epics (one per major workflow area from Product Spec §5 Workflows)
3. Stories under each Epic (mapped from Product Spec §5 Workflows)
4. Tasks under each Story (typed based on platform scope and Module-level Tech Spec)
5. Dependency Map
6. Story Points Summary

Use the templates below exactly. Do not omit any field marked **Required**.

---

---

# OUTPUT STARTS HERE

---

## TECHNICAL INFRASTRUCTURE EPIC

> Generate this section only if Step 3 identified infrastructure components.
> If no infrastructure components were found, remove this section entirely.

---

### [EPIC-INFRA-001] [Infrastructure Component Name]

| Field | Value |
|---|---|
| **Epic ID** | EPIC-INFRA-001 |
| **Title** | [Infrastructure component name] |
| **Type** | Technical Infrastructure |
| **Description** | [What this infrastructure component is, why it is needed, and which product stories depend on it] |
| **Platform Scope** | [Infrastructure / Backend / All — whichever applies] |
| **Spec Ref** | [Module-level Tech Spec §2.5 or §9] |
| **Dependencies** | [Rich metadata — see dependency format below, or "None"] |

#### Standalone Tasks

> Infrastructure tasks live directly under this Epic, not under a Story.

---

##### [TASK-INFRA-001-01] [Task Title]

| Field | Value |
|---|---|
| **Task ID** | TASK-INFRA-001-01 |
| **Epic** | EPIC-INFRA-001 |
| **Title** | [Task title] |
| **Task Type** | Infrastructure |
| **Platform** | [Infrastructure / Backend / All] |
| **Story Points** | [Fibonacci: 1 / 2 / 3 / 5 / 8 / 13] |
| **Priority** | [Critical / High / Medium / Low] |
| **UAT Required** | No |
| **Spec Ref** | [Module-level Tech Spec section] |

**Description:**
[What needs to be built, configured, or deployed. Be specific enough that an engineer can scope the work without reading additional documents.]

**Dependencies:**
```
- [BLOCKED-BY / BLOCKS / RELATES-TO]: [ID]
  Type: [BLOCKED-BY / BLOCKS / RELATES-TO]
  Reason: [Plain-English explanation of what must be done before this task
           can start and why the dependency exists.]
```
_Or: None_

**Acceptance Criteria:**

Functional:
- [ ] [Condition]
- [ ] [Condition]

Non-Functional:
- [ ] [Response time / throughput / availability condition]
- [ ] [Security / encryption condition]
- [ ] [Logging / audit condition]

---

##### [TASK-INFRA-001-02] [Task Title]

> Repeat TASK block for each infrastructure task under this Epic.

---

---

## PRODUCT EPICS

> Generate one Epic per major workflow area from Product Spec §5 Workflows.
> Repeat the Epic block below for each Epic.

---

### [EPIC-XXX-001] [Epic Title]

| Field | Value |
|---|---|
| **Epic ID** | EPIC-XXX-001 |
| **Title** | [Epic title] |
| **Type** | Product |
| **Description** | [What this Epic covers — the user-facing capability or workflow area it delivers. Reference the Product Spec workflow it maps to.] |
| **Platform Scope** | [Web / Mobile / Backend / AI / All — list all that apply] |
| **Spec Ref** | [Product Spec §5 — Workflow name] |
| **Dependencies** | [Rich metadata format — see below, or "None"] |

**Epic-Level Dependencies:**
```
- [BLOCKED-BY / BLOCKS / RELATES-TO]: [Epic or Task ID]
  Type: [BLOCKED-BY / BLOCKS / RELATES-TO]
  Reason: [Plain-English explanation of the dependency and what specifically
           must be complete before this Epic can begin.]
```
_Or: None_

---

#### Stories

---

##### [US-XXX-001] [Story Title]

| Field | Value |
|---|---|
| **Story ID** | US-XXX-001 |
| **Epic** | EPIC-XXX-001 |
| **Title** | [Story title] |
| **Platform Scope** | [Web / Mobile / Backend / AI — list all that apply for this story] |
| **Story Points** | [Fibonacci: 1 / 2 / 3 / 5 / 8 / 13] |
| **Priority** | [Critical / High / Medium / Low] |
| **UAT Required** | [Yes / No] |
| **Spec Ref** | [Product Spec §5 — Workflow name + section] |

**User Story:**
> As a [persona from Product Spec §3],
> I want [goal — what they are trying to accomplish],
> So that [outcome — the business or personal value they receive].

**Story-Level Dependencies:**
```
- [BLOCKED-BY / BLOCKS / RELATES-TO]: [Story or Epic or Task ID]
  Type: [BLOCKED-BY / BLOCKS / RELATES-TO]
  Reason: [Plain-English explanation of what must be done before this story
           can begin and why the dependency exists.]
```
_Or: None_

**Acceptance Criteria:**

Functional:
- [ ] [Behavioural condition — optionally prefixed with context: "Authenticated users only —"] [specific verifiable outcome]
- [ ] [Behavioural condition from Product Spec §5 Workflows acceptance criteria]
- [ ] [Error / edge case condition from Product Spec §5 Failure Scenarios]
- [ ] [State transition condition]

Non-Functional:
- [ ] Response time: [target from Module-level Tech Spec §7]
- [ ] Rate limiting: [limit from Module-level Tech Spec §7]
- [ ] Audit / logging: [what events must be logged — from Module-level Tech Spec §7]
- [ ] Security: [specific constraint from Module-level Tech Spec §10]
- [ ] Availability: [target if applicable from Module-level Tech Spec §7]

> Add only the NFR categories that apply to this story. Remove categories that do not apply.

---

###### Tasks

---

**[TASK-XXX-001-01] [Task Title]**

| Field | Value |
|---|---|
| **Task ID** | TASK-XXX-001-01 |
| **Story** | US-XXX-001 |
| **Title** | [Task title] |
| **Task Type** | [Backend API / Web UI / Mobile UI / Integration / Third-Party Integration / Data Model & Migration / NFR — Performance / NFR — Security / NFR — Logging & Audit / NFR — Rate Limiting] |
| **Platform** | [Web / Mobile / Backend / AI / Infrastructure] |
| **Priority** | [Critical / High / Medium / Low] |
| **UAT Required** | [Yes / No] |
| **Spec Ref** | [Module-level Tech Spec §3 for API tasks / Product Spec §5 for workflow tasks] |

**Description:**
[What needs to be built for this specific task. Scoped to the task type. Be specific enough that an engineer understands the boundaries of this task without reading additional documents.]

**Dependencies:**
```
- [BLOCKED-BY / BLOCKS / RELATES-TO]: [Task or Story or Epic ID]
  Type: [BLOCKED-BY / BLOCKS / RELATES-TO]
  Reason: [Plain-English explanation of what must be complete before this
           task can begin and why.]
```
_Or: None_

**Acceptance Criteria:**

Functional:
- [ ] [Specific verifiable condition scoped to this task type]
- [ ] [Specific verifiable condition]
- [ ] [Error handling condition]

Non-Functional:
- [ ] [NFR condition relevant to this task — remove section if none apply]

---

**[TASK-XXX-001-02] [Task Title] — Third-Party Integration**

> Use this block when Task Type is Third-Party Integration.
> This task is always a separate line item — never merged with a functional task.

| Field | Value |
|---|---|
| **Task ID** | TASK-XXX-001-02 |
| **Story** | US-XXX-001 |
| **Title** | [External service name] Integration — [brief description] |
| **Task Type** | Third-Party Integration |
| **Platform** | [Web / Mobile / Backend / AI] |
| **Priority** | [Critical / High / Medium / Low] |
| **UAT Required** | **Yes** |
| **Spec Ref** | [Module-level Tech Spec §9] |

**Description:**
[What integration is being built, which external service is involved, what data flows between systems, and what credentials or API contracts are required. Reference Module-level Tech Spec §9.]

**Dependencies:**
```
- [BLOCKED-BY / BLOCKS / RELATES-TO]: [ID]
  Type: [BLOCKED-BY / BLOCKS / RELATES-TO]
  Reason: [What must exist before this integration task can begin.]
```
_Or: None_

**Acceptance Criteria (Development):**

Functional:
- [ ] [Integration condition verifiable in development / staging environment]
- [ ] [Error handling condition for external service failure]
- [ ] [Retry / fallback condition — from Module-level Tech Spec §6.3]

Non-Functional:
- [ ] [Timeout handling condition]
- [ ] [Credential / secret management condition — no secrets hardcoded]
- [ ] [Logging: external service calls logged with request ID and response status]

**UAT Acceptance Criteria (Third-Party Integration):**

> These criteria are verified in the production-equivalent UAT environment only.

- [ ] [End-to-end integration scenario verifiable only with live external service]
- [ ] [Data integrity condition — data received from external service is correct]
- [ ] [Failure scenario — external service unavailable, system degrades gracefully]

---

> Repeat the Task block for each task under this Story.
> Generate only the task types relevant to the platform scope and story content.
> Do not generate a task type that is not needed for this story.

---

##### [US-XXX-002] [Story Title]

> Repeat the Story block for each story under this Epic.

---

### [EPIC-XXX-002] [Epic Title]

> Repeat the Epic block for each product Epic.

---

---

## DEPENDENCY MAP

> After all Epics, Stories, and Tasks are generated, produce a summary dependency map.
> This gives a single view of all blocking relationships for sprint planning.

```
EPIC-INFRA-001  ──blocks──►  EPIC-XXX-001
EPIC-INFRA-001  ──blocks──►  EPIC-XXX-002
EPIC-XXX-001    ──blocks──►  EPIC-XXX-002
US-XXX-001      ──blocks──►  US-XXX-002
TASK-XXX-001-01 ──blocks──►  TASK-XXX-001-02
```

---

## STORY POINTS SUMMARY

> After generation, produce this summary table for sprint planning.

| ID | Title | Type | Story Points | Priority |
|---|---|---|---|---|
| EPIC-INFRA-001 | [Title] | Infrastructure | — | — |
| TASK-INFRA-001-01 | [Title] | Infrastructure Task | [n] | Critical |
| EPIC-XXX-001 | [Title] | Product Epic | — | — |
| US-XXX-001 | [Title] | Story | [n] | High |
| US-XXX-002 | [Title] | Story | [n] | Medium |
| **Total** | | | **[sum]** | |

> Note: Story points are not summed at Epic level. The total is the sum of all Story-level points
> and standalone infrastructure Task-level points only.

---

## INFORMATION GAPS LOG

> If any information gaps were identified in Step 5 and not yet resolved, list them here so they remain visible.

| Gap | What Is Needed | Status |
|---|---|---|
| [Gap description] | [What the human needs to provide] | Pending / Resolved |

---

## GENERATION METADATA

| Field | Value |
|---|---|
| **Module** | [Module name from Product Spec §1] |
| **Product Spec Version** | [Version of Product Spec used as input] |
| **Module-level Tech Spec Version** | [Version of Module-level Tech Spec used as input] |
| **Milestone** | [Roadmap milestone this module belongs to] |
| **Generated On** | [Date] |
| **Platform Scope** | [All platforms identified in Step 2] |
| **Total Epics** | [n] |
| **Total Stories** | [n] |
| **Total Tasks** | [n] |
| **Third-Party Integrations** | [n] — [list service names] |
| **UAT Required Tasks** | [n] |
| **Total Story Points** | [n] |
