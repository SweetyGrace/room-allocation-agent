# Input Design Specification: Data Model Template Generator (v2)

> This document records all decisions made about the structure, rules, and behavior of the
> data model generation template (v2). It supersedes the v1 design spec.
> Any future changes to the template must first be reflected here.

---

## 1. What Changed from v1

| v1 | v2 |
|---|---|
| Primary input included "Product Spec + System-level Architecture + Business Requirements" routed through Technical Architecture | Primary input is Product Spec sections (§1, §2, §4, §6) + Module-level Tech Spec |
| Pipeline showed "Technical Architecture" as a required upstream step | No separate Technical Architecture step — architecture decisions live in Module-level Tech Spec |
| Entity context came exclusively from Module-level Tech Spec | Entity context comes from both Module-level Tech Spec §4 (Data Model Context) and §8 (Data Requirements) |
| No explicit Downstream Input Matrix | Downstream Input Matrix now defined — specifies which sections feed which downstream artifact |

---

## 2. Purpose

The data model template is an AI-generated artifact that sits between the Module-level Tech Spec
and Story/Task generation in the spec-driven development pipeline. It defines the complete
system-wide schema, generates Alembic migration scripts, and maintains a system-wide ER diagram.

**Position in the pipeline:**
```
Product Spec (§1 Module Overview, §2 Scope & Boundaries, §4 Features, §6 Data Requirements)
  └── Module-level Tech Spec
        ├── Data Model   ← this template
        └── Stories / Tasks + UAT Acceptance Criteria
              └── Task-level Tech Spec (per task)
```

**Who generates it:** AI agent  
**Who reviews it:** Human engineer — can approve, suggest changes, or request missing sections  
**Who consumes it:** Stories/Tasks generation template, Task-level Tech Spec, Code generation agent

---

## 3. Inputs to the AI Agent

| Input | Required | When | Source |
|---|---|---|---|
| Product Spec §1 Module Overview | Yes | Every run | Product Spec |
| Product Spec §2 Scope & Boundaries | Yes | Every run | Product Spec |
| Product Spec §4 Features | Yes | Every run | Product Spec |
| Product Spec §6 Data Requirements (field constraints) | Yes | Every run | Product Spec |
| Module-level Tech Spec §4 Data Model Context | Yes | Every run | Module-level Tech Spec |
| Module-level Tech Spec §8 Data Requirements | Yes | Every run | Module-level Tech Spec |
| Previous schema version file | No — first run only | Subsequent runs | Previous schema file |
| List of existing Alembic migration files | No — first run only | Subsequent runs | Migration directory |

### First Run vs Subsequent Runs

| Scenario | Inputs | Output |
|---|---|---|
| First run (no existing schema) | Product Spec sections + Module Tech Spec + no prior schema | `schema_v1.0` + first migration script + system ER diagram |
| Subsequent run (schema exists) | Product Spec sections + Module Tech Spec + previous schema + migration file list | New schema version + delta migration script + regenerated system ER diagram |

### Missing Input Handling

- If the previous schema version is not provided for a subsequent run, the agent must stop and ask.
  A migration cannot be generated correctly without knowing the current state.
- If the Module-level Tech Spec §4 or §8 does not contain sufficient entity-level context (entity
  names, relationships, business-rule constraints), the agent must stop and ask before proceeding.
- If Product Spec §6 field constraints are absent, the agent must list each missing constraint as a
  gap and ask before proceeding — never assume field constraints.

---

## 4. Why Both Product Spec and Module-level Tech Spec Are Inputs

The two sources are complementary and non-overlapping:

| Source | What It Provides |
|---|---|
| Product Spec §6 Data Requirements | Field constraints — mandatory/optional status, min/max length, allowed values. Product decisions. |
| Module-level Tech Spec §4 Data Model Context | Entity responsibility, key relationships, business-rule constraints. Engineering decisions at entity level. |
| Module-level Tech Spec §8 Data Requirements | Input/output formats, stored data lifecycle, retention policy. Engineering decisions at module boundary level. |

The data model agent needs all three to produce a complete, correct schema — field-level constraints
from the Product Owner and entity-level context from Engineering.

---

## 5. Core Principle — One Cumulative Schema File

The data model is maintained as **one versioned schema file for the entire system**. It is not
split per module or per entity. Every run adds new entities or modifies existing ones and produces
a new version of the same file.

- The schema file always contains the full picture of all entities across all modules generated so far.
- Each run produces a delta — new or modified entities — not a replacement of the whole file.
- The Alembic migration script for each run represents only the delta between the previous schema
  version and the new one.
- The system-wide ER diagram is regenerated in full after every run to reflect the complete current state.

---

## 6. Naming Conventions

### Schema File
**Format:** `{YYYYMMDD}_{schema_version}_{module_name}`

| Field | Description |
|---|---|
| `YYYYMMDD` | Date of the run |
| `schema_version` | Version in `v{major}.{minor}` format |
| `module_name` | Name of the module(s) added in this run — snake_case, joined with `_and_` for multiple |

**Examples:**
- `20260505_v1.0_user_management` — first run, user management module
- `20260506_v1.1_content_management_and_vendor_management` — second run, two modules
- `20260510_v2.0_user_management` — major restructure of user management entities

### Migration Script
**Format:** Standard Alembic convention — `{revision_id}_{description}.py`

Alembic auto-generates the revision ID. The description references the schema version and module:
- `a1b2c3d4_schema_v1.0_add_user_management.py`
- `e5f6g7h8_schema_v1.1_add_content_management.py`

---

## 7. Versioning Rules

| Change Type | Version Increment | Example |
|---|---|---|
| New module(s) added — new entities only | Minor | v1.0 → v1.1 |
| Existing entity — column added, index added, constraint added | Minor | v1.1 → v1.2 |
| Existing entity — column removed, type changed, relationship changed | Major — flag to reviewer | v1.2 → v2.0 |

**Immutability Rule:** Migration files are immutable once merged to `main`. If a past migration
needs to change, a new corrective migration is generated — the old file is never edited.

---

## 8. Schema File Structure

The schema file contains all entities across all modules, organized as:

1. Version metadata (schema version, generated date, modules included)
2. Enums (all enums across all entities — defined once, referenced by entities)
3. Entities (one block per entity — carried forward unchanged + new entities from this run)
4. Relationship map (summary of all relationships — regenerated in full every run)

### Per Entity Block

Each entity block contains:
- Entity name, description, owner module
- Attributes (field name, data type, nullable, default, constraints, description)
- Field constraints from Product Spec §6 (mandatory/optional, min/max length, allowed values)
- Indexes (standard and unique — derived from access patterns in Module-level Tech Spec)
- Soft delete strategy (from Module-level Tech Spec §4 business-rule constraints)
- Relationships (type, related entity, FK field, cascade behavior)
- Retention policy (from Module-level Tech Spec §8.4)

---

## 9. Output Artifacts

Each run produces three artifacts together in one output document:

### Artifact 1 — Updated Schema File
Full cumulative schema at the new version. Contains all existing entities unchanged plus new or
modified entities from this run.

### Artifact 2 — Alembic Migration Script
Python migration file with `upgrade()` and `downgrade()` functions. Represents only the delta.
References the previous revision ID for correct Alembic chaining.

### Artifact 3 — ER Diagrams
Two levels:
- **Module-scoped ERD** — entities added or modified in this run and their direct relationships
- **Full system ERD** — all entities across all modules, regenerated in full every run

Format: Mermaid `erDiagram` syntax. Always generated from the schema — never maintained independently.

---

## 10. Soft Delete Strategy

Each entity must explicitly declare its soft delete strategy. The agent derives this from
Module-level Tech Spec §4 and §8. If not specified, the agent must ask before defaulting.

| Strategy | Field | When to Use |
|---|---|---|
| Timestamp | `deleted_at: DateTime \| None` | When audit trail of deletion time is required |
| Boolean | `is_deleted: bool` | When only the fact of deletion matters, not the time |
| None | — | When hard delete is explicitly acceptable for this entity |

---

## 11. Downstream Input Matrix

| Downstream Artifact | Sections Required from This Document |
|---|---|
| Stories / Tasks | Schema file — entity names and relationships (for Data Model & Migration task generation) |
| Task-level Tech Spec | Schema file — full entity context (for implementation-level decisions) |
| Code generation agent | Schema file + migration script |

---

## 12. What This Template Does Not Cover

- **Field constraints (mandatory/optional, min/max length)** — product decisions that stay in Product Spec §6
- **Full request/response payload shapes** — task-level Tech Spec
- **Service layer implementation** — task-level Tech Spec
- **Seeding / test data** — handled separately
- **Index tuning beyond known access patterns** — task-level Tech Spec

---

## 13. Change Log

| Date | Change | Author |
|---|---|---|
| 2026-05-10 | v2 — updated inputs to use Product Spec sections alongside Module-level Tech Spec; removed reference to Technical Architecture as a standalone upstream step; added Module-level Tech Spec §8 as a required input for retention policy and data lifecycle context | Venkat + Claude |
