# Room Allocation Agent — Business Requirement Document

**Version:** v1.0 | **Last Updated:** 2026-05-22 | **Status:** Draft

---

## 1. Executive Summary

Program coordinators managing HDB/MSD programs spend several hours manually assigning hundreds of seekers to rooms before each program begins. This manual process requires the coordinator to simultaneously track gender rules, age groups, city preferences, pairing relationships, preferred roommate requests, and room capacities — all while dragging and dropping individual seekers into slots. The process is slow, error-prone, and mentally exhausting.

This document defines the business requirements for an AI-powered room allocation agent that allows coordinators to issue plain-language instructions and have allocations executed automatically, accurately, and instantly.

---

## 2. Problem Statement

### Current State

Coordinators use a drag-and-drop interface to manually allocate seekers into rooms. For a typical program with 300–500 seekers:

- The allocation process takes **3–6 hours** per coordinator
- Errors (gender mismatches, separated pairs, ignored preferences) are discovered only after completion
- There is **no explanation** for why any placement was made
- Re-doing allocations after errors wastes additional hours
- Multiple constraint types must be juggled simultaneously with no system assistance

### Root Cause

The current system provides tools (drag-and-drop, filters, rule engine) but requires the human to do all the reasoning. The rules are known and finite, but their application across hundreds of seekers exceeds practical human working memory.

### Impact

| Impact Area | Current State |
|---|---|
| Time per allocation cycle | 3–6 hours |
| Error rate (mismatches discovered post-completion) | Estimated 5–15% of allocations require correction |
| Coordinator effort | High cognitive load, repetitive |
| Pair / preference honoring | Often missed due to volume |
| Explainability | Zero — no audit trail for decisions |

---

## 3. Business Objectives

| ID | Objective |
|---|---|
| BO-01 | Reduce room allocation time from hours to minutes |
| BO-02 | Eliminate gender mismatch and capacity violations |
| BO-03 | Increase preferred roommate and pair honoring rate to >90% |
| BO-04 | Give coordinators full control via natural language, not clicks |
| BO-05 | Produce an explainable audit trail for every allocation decision |

---

## 4. Stakeholders

| Role | Responsibility |
|---|---|
| Program Coordinator / Admin | Primary user — issues prompts, reviews results |
| RM (Relationship Manager) | Secondary user — may view allocation status |
| Tech Lead | Approves architecture and integration approach |
| Product Owner | Defines acceptance criteria |

---

## 5. Business Rules (Non-Negotiable Constraints)

These rules must be enforced by the agent at all times, regardless of what the admin instructs:

| ID | Rule |
|---|---|
| BR-01 | A male seeker and a female seeker must never share the same room |
| BR-02 | A seeker cannot be assigned to a room that has no remaining capacity |
| BR-03 | A seeker cannot be assigned to a reserved room |
| BR-04 | If two seekers are paired, they must always be allocated to the same room together — never separately |
| BR-05 | The agent must not execute bulk actions affecting more than 50 seekers without surfacing a confirmation step |
| BR-06 | All agent actions must be scoped to the current program and sub-program — never cross-program |

---

## 6. Functional Requirements

| ID | Requirement |
|---|---|
| FR-01 | Agent must accept natural language prompts from the admin |
| FR-02 | Agent must be able to allocate individual or bulk seekers to rooms |
| FR-03 | Agent must be able to pair two seekers together |
| FR-04 | Agent must be able to unpair seekers |
| FR-05 | Agent must be able to move an allocated seeker to a different room |
| FR-06 | Agent must be able to clear allocations for a room or floor |
| FR-07 | Agent must be able to honor preferred roommate requests automatically |
| FR-08 | Agent must filter seekers and rooms by gender, city, floor, age when instructed |
| FR-09 | Agent must report exactly what it did, what it skipped, and why — after every action |
| FR-10 | Agent must detect and explain conflicts (full room, gender clash, reserved room) instead of silently failing |
| FR-11 | The room and seeker lists on the allocation page must refresh automatically after agent actions |

---

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | Agent response must begin streaming within 2 seconds of prompt submission |
| NFR-02 | Bulk allocation of 100 seekers must complete within 30 seconds |
| NFR-03 | Agent actions must be identical in outcome to manual API calls — no special bypass logic |
| NFR-04 | Agent must forward the admin's auth token to all NestJS API calls — no elevated permissions |
| NFR-05 | No existing NestJS API, database schema, or frontend page requires modification |

---

## 8. Out of Scope (v1.0)

- Allocation across multiple programs in a single command
- Automated scheduling or timing of allocation runs
- Integration with any third-party room management systems
- Mobile interface
- Role-based restrictions on which prompts are allowed (all admins have same access)

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| Time to complete a 300-seeker allocation | < 10 minutes (vs. 3–6 hours today) |
| Gender mismatch errors post-allocation | 0 |
| Pair separation errors | 0 |
| Preferred roommate honoring rate | > 90% where constraints allow |
| Coordinator satisfaction (post-launch survey) | > 4/5 |

---

## 10. Assumptions

- The NestJS backend APIs for room allocation are stable and will not change during agent development
- Admins have valid auth tokens available in their browser session
- The agent service will be deployed as a separate Python microservice alongside the existing NestJS backend
- PydanticAI with Claude Sonnet 4.6 is the chosen LLM stack for the agent

---

## 11. Dependencies

| Dependency | Type | Notes |
|---|---|---|
| NestJS Room Allocation APIs | Internal | Must be reachable by the Python agent service |
| Anthropic API (Claude Sonnet 4.6) | External | Requires API key in agent service env |
| Existing React AI Overlay component | Internal | Reused as chat UI on allocation page |
| `REACT_APP_ROOM_AGENT_URL` env var | Config | Points frontend to the new agent service |
