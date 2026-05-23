# Input Design Specification: User Stories & Tasks Generator (v2)

> This document records all decisions made about the structure, rules, and behavior of the
> user stories and tasks generation template (v2). It supersedes the v1 design spec.
> Any future changes to the template must first be reflected here.

---

## 1. What Changed from v1

| v1 | v2 |
|---|---|
| Primary input was Module-level Tech Spec (derived from Product Spec + Technical Architecture) | Primary input is Product Spec sections (§1, §3, §4, §5, §8) — not the full document |
| References "Technical Architecture" as a required upstream step | No separate Technical Architecture step — architecture decisions are made inside the Module-level Tech Spec |
| Module-level Tech Spec was the sole upstream artifact | Module-level Tech Spec is still an input — consumed alongside Product Spec sections |
| Downstream Input Matrix was not formalized at this level | Downstream Input Matrix now specifies exactly which sections are passed from the Product Spec |

---

## 2. Purpose

The user stories and tasks generation template is an AI-generated artifact that sits between the
Module-level Tech Spec and the Task-level Tech Spec in the spec-driven development pipeline.
It defines all Epics, Stories, and Tasks for a module — with dependency chains, acceptance criteria,
story points, priority, and UAT flags.

**Position in the pipeline:**
```
Product Spec (§1 Module Overview, §3 Actors, §4 Features, §5 Workflows, §8 Success Metrics)
  └── Module-level Tech Spec
        ├── Data Model
        └── Stories / Tasks + UAT Acceptance Criteria   ← this template
              └── Task-level Tech Spec (per task)
                    └── Code Generation
```

**Who generates it:** AI agent  
**Who reviews it:** Engineering lead + Product owner  
**Who consumes it:** Task-level Tech Spec agent, Code generation agent, Jira project management

---

## 3. Inputs to the AI Agent

| Input | Required | Source |
|---|---|---|
| Product Spec §1 Module Overview | Yes | Product Spec |
| Product Spec §3 Actors | Yes | Product Spec |
| Product Spec §4 Features | Yes | Product Spec |
| Product Spec §5 Workflows | Yes | Product Spec |
| Product Spec §8 Success Metrics | Yes | Product Spec |
| Module-level Tech Spec (full) | Yes | Module-level Tech Spec |

> Only the listed Product Spec sections are passed — not the full document. The Agent must request
> missing sections if they are not provided.

### Missing Input Handling

- If Product Spec sections are missing or insufficient, the agent must stop and ask before proceeding.
- If the Module-level Tech Spec does not contain sufficient API contract, NFR, or infrastructure context,
  the agent must list each gap and ask.
- If platform scope is ambiguous, the agent must stop and ask before generating any tasks.

---

## 4. What Changed in Inputs

The primary change from v1 is that the **Module-level Tech Spec is no longer the sole input**. It is
consumed alongside specific Product Spec sections. The rationale:

- Product Spec §5 Workflows contains the end-to-end user journeys and acceptance criteria that are the
  primary source for Story generation — this was previously only available indirectly through the Tech Spec.
- Product Spec §4 Features provides standalone capability descriptions that feed Epic structure.
- Product Spec §8 Success Metrics feeds non-functional acceptance criteria at the Story level.
- The Module-level Tech Spec provides the API contracts, infrastructure needs, NFR decisions, and
  third-party integration details that feed Task generation.

---

## 5. Issue Hierarchy

```
Epic
  ├── Story
  │     └── Task (one or more)
  └── Task (standalone — infrastructure / NFR only, no parent story)
```

### Rules

- **Epic** contains Stories and optionally standalone Tasks (infrastructure/NFR components only).
- **Story** contains one or more Tasks. Stories do not contain other Stories.
- **Task** is the smallest unit of work. Tasks belong to either a Story or directly to an Epic.
- A Task that requires **third-party integration** must be a separate, explicitly labelled line item —
  it cannot be merged into a functional task.
- Non-functional technical components (WebSocket infrastructure, Redis, auth middleware, etc.) live
  in a dedicated **Technical Infrastructure Epic** — same priority tracking, story points, and
  dependency enforcement as product epics.

---

## 6. Acceptance Criteria

| Level | Has Acceptance Criteria |
|---|---|
| Epic | No |
| Story | Yes |
| Task | Yes |

### Format — Hybrid Checklist

The primary format is a **checklist of conditions** organized into Functional and Non-Functional
categories. NFR criteria (response time, rate limits, logging, audit) are always plain checklist items.

```
Functional:
- [ ] Authenticated users only — unauthenticated requests return 401
- [ ] Post body is rejected if it exceeds 1000 characters with inline error message
- [ ] On success, the feed event is emitted within 2 seconds of publication

Non-Functional:
- [ ] API response time < 500ms at p95
- [ ] Rate limit: max 50 post creation attempts per hour per user
- [ ] All post creation events written to the audit log with user ID and timestamp
- [ ] Input sanitized before persistence — no raw HTML stored
```

### UAT Acceptance Criteria

- Most tasks have one acceptance criteria section (development sign-off).
- Tasks that involve **third-party integrations** must have a **second, separate UAT Acceptance
  Criteria section**. This section covers scenarios verifiable only in a production-equivalent UAT
  environment.
- The task must be flagged `UAT Required: Yes`.

---

## 7. Task Types

Task types are flexible per story — the AI agent generates only the task types relevant to the
platform scope and story content.

| Task Type | When Generated |
|---|---|
| Backend API | Story requires new or modified API endpoints |
| Web UI | Story requires web interface changes |
| Mobile UI | Story requires mobile interface changes |
| Integration | Story requires connecting two internal systems |
| Third-Party Integration | Story requires connecting to an external service — always a separate task |
| Data Model & Migration | Story requires schema changes |
| NFR — Performance | Performance targets from Module-level Tech Spec §7 apply |
| NFR — Security | Security constraints from Module-level Tech Spec §10 apply |
| NFR — Logging & Audit | Audit trail or observability requirements apply |
| NFR — Rate Limiting | Rate limiting constraints apply |
| Infrastructure | Standalone technical component — lives under Technical Infrastructure Epic |

### Third-Party Integration Rule

Any task that touches an external service must be:
1. A **separate task** — never merged with a functional task
2. Flagged with `Task Type: Third-Party Integration`
3. Flagged with `UAT Required: Yes`
4. Given its own UAT Acceptance Criteria section

---

## 8. Story Points

| Level | Has Story Points |
|---|---|
| Epic | No |
| Story | Yes — estimated for the whole story as a unit |
| Task | Only for standalone infrastructure / NFR tasks under an Epic |

**Scale:** Fibonacci — 1, 2, 3, 5, 8, 13

Story-level points are an independent estimate for the whole story — not derived from summing tasks.

---

## 9. Dependencies

| Type | Meaning |
|---|---|
| `BLOCKS` | This item cannot start until the referenced item is complete |
| `BLOCKED-BY` | The inverse — this item is waiting on the referenced item |
| `RELATES-TO` | Related but not blocking — informational link |

Each dependency entry carries:
- **ID** — the Epic, Story, or Task ID referenced
- **Type** — BLOCKS / BLOCKED-BY / RELATES-TO
- **Reason** — plain-English explanation of why the dependency exists

---

## 10. Traceability

Every Story and Task must carry a `Spec Ref` field pointing to either:
- The Product Spec section it was generated from (for user-facing behavior), OR
- The Module-level Tech Spec section it was generated from (for technical tasks)

This ensures full traceability from code back to spec.

---

## 11. What This Template Does Not Cover

- **Product decisions** — these come from the Product Spec
- **Architecture decisions** — these come from the Module-level Tech Spec
- **Data model / schema definitions** — handled by the Data Model template
- **Task-level Tech Spec** — generated separately per task after stories are approved
- **Code generation** — happens after task-level Tech Spec is approved

---

## 12. Change Log

| Date | Change | Author |
|---|---|---|
| 2026-05-10 | v2 — updated inputs to use Product Spec sections alongside Module-level Tech Spec; removed reference to Technical Architecture as a standalone upstream step | Venkat + Claude |
