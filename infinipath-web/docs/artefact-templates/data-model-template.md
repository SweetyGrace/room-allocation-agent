# Data Model Generation Template (v2)

> **How to use this template:**
> Feed this template along with the following inputs to the AI agent:
>
> **From the Product Spec (pass only these sections):**
> 1. §1 Module Overview
> 2. §2 Scope & Boundaries
> 3. §4 Features
> 4. §6 Data Requirements (field constraints only)
>
> **From the Module-level Tech Spec:**
> 5. §4 Data Model Context
> 6. §8 Data Requirements
>
> **For subsequent runs only:**
> 7. Previous schema version file (e.g., `20260505_v1.0_user_management.md`)
> 8. List of existing Alembic migration files (filenames only — for sequence ordering)
>
> The AI agent reads all inputs, follows the generation rules in this template, and produces
> three artifacts together: updated schema file, Alembic migration script, and ER diagrams.
>
> **Do not modify the generation rules in this template.** To change the rules, update
> `input-to-generate-data-model.md` first, then update this template accordingly.

---

## AI Agent Instructions

You are generating or updating the system-wide data model. Follow these steps in order. Do not skip any step.

### Step 1 — Identify Run Type

Determine whether this is a first run or a subsequent run:

| Condition | Run Type |
|---|---|
| No previous schema file provided | First run — generate schema from scratch |
| Previous schema file provided | Subsequent run — generate delta only |

---

### Step 2 — Validate Inputs

**First run:**

| Input | Present? | Sufficient? | Gap (if any) |
|---|---|---|---|
| Product Spec §1 Module Overview | Yes / No | Yes / No | [describe gap] |
| Product Spec §2 Scope & Boundaries | Yes / No | Yes / No | [describe gap] |
| Product Spec §4 Features | Yes / No | Yes / No | [describe gap] |
| Product Spec §6 Data Requirements (field constraints) | Yes / No | Yes / No | [describe gap] |
| Module-level Tech Spec §4 Data Model Context | Yes / No | Yes / No | [describe gap] |
| Module-level Tech Spec §8 Data Requirements | Yes / No | Yes / No | [describe gap] |

**Subsequent run (add these inputs):**

| Input | Present? | Sufficient? | Gap (if any) |
|---|---|---|---|
| Previous schema version file | Yes / No | Yes / No | [describe gap] |
| Existing migration file list | Yes / No | Yes / No | [describe gap] |

**If previous schema version is missing for a subsequent run:** Stop and ask. Do not proceed
without it — a migration cannot be generated correctly without knowing the current state.

**If field constraints from Product Spec §6 are absent:** List each missing field and ask before
proceeding — never assume field constraints.

---

### Step 3 — Identify Entities and Changes

Read the Module-level Tech Spec §4 and §8, and Product Spec §4 and §6 and identify:

```
Modules Being Added: [module name(s)]
New Entities: [list entity names from Module-level Tech Spec §4.1]
Modified Entities (subsequent run only): [list entity names + what is changing]
New Enums: [list enum names]
Modified Enums (subsequent run only): [list enum names + what is changing]
Field Constraints Applied: [list fields with mandatory/optional + min/max from Product Spec §6]
Retention Policies: [list entities with retention periods from Module-level Tech Spec §8.4]
```

**For modified entities** — read the previous schema version and identify exactly what is changing:
- New columns added
- Columns removed (major version change — flag this explicitly)
- Column type changed (major version change — flag this explicitly)
- New indexes added
- New constraints added
- Relationship changed (major version change — flag this explicitly)

---

### Step 4 — Determine Schema Version

| Change Type | Version Rule |
|---|---|
| New entities only | Increment minor version (e.g., v1.0 → v1.1) |
| Existing entity — column / index / constraint added | Increment minor version |
| Existing entity — column removed / type changed / relationship changed | Increment major version — flag to human reviewer |

```
Previous Version: [v{major}.{minor} or "none — first run"]
Change Type: [New entities / Minor modification / Major restructure]
New Version: [v{major}.{minor}]
```

**If a major version increment is required:** Flag this explicitly to the human reviewer before
proceeding. Major version changes affect existing migrations and may require a coordinated deployment
strategy.

---

### Step 5 — Determine Output File Names

```
Schema File Name: {YYYYMMDD}_{version}_{module_name(s)}
  Example: 20260505_v1.1_content_management_and_vendor_management

Migration Script Name: {alembic_revision_id}_{version}_{description}.py
  Example: a1b2c3d4_v1.1_add_content_management.py
  Note: Alembic generates the revision ID — use a placeholder [REVISION_ID] in the output.
```

---

### Step 6 — Identify Information Gaps

```
Information Gaps:
- [Gap]: [what is needed and why]
```

Ask the human to fill all gaps before proceeding. If no gaps: `No information gaps. Proceeding with generation.`

---

### Step 7 — Generate Output

Generate all three artifacts in order:
1. Updated schema file
2. Alembic migration script
3. ER diagrams (module-scoped + full system)

---

---

# OUTPUT STARTS HERE

---

## Run Metadata

| Field | Value |
|---|---|
| **Run Date** | [YYYYMMDD] |
| **Run Type** | First run / Subsequent run |
| **Previous Schema Version** | [version or "none — first run"] |
| **New Schema Version** | [version] |
| **Modules Added** | [module name(s)] |
| **Schema File Name** | [full file name] |
| **Migration Script Name** | [full file name] |
| **Major Version Change** | Yes / No |
| **Major Version Change Reason** | [if yes — describe what changed and why it is breaking] |
| **Product Spec Version Used** | [version] |
| **Module-level Tech Spec Version Used** | [version] |

---

---

# ARTIFACT 1 — SCHEMA FILE

**File:** `{YYYYMMDD}_{version}_{module_name}.md`

---

## Schema Metadata

| Field | Value |
|---|---|
| **Schema Version** | [v{major}.{minor}] |
| **Generated On** | [YYYYMMDD] |
| **Modules Included** | [list of all modules whose entities are in this schema] |
| **Previous Version** | [previous version or "none"] |
| **Delta Summary** | [brief description of what changed from the previous version] |

---

## Enums

> Define all enums here first. Entities reference enum names — do not inline enum values inside entity definitions.
> Carry forward all enums from the previous schema version unchanged. Add new enums below existing ones.

---

### [EnumName]

| Field | Value |
|---|---|
| **Enum Name** | [EnumName] |
| **Module** | [Module that owns this enum] |
| **Description** | [What this enum represents] |
| **Added In** | [Schema version this enum was introduced] |

| Value | Description |
|---|---|
| [VALUE_ONE] | [What this value means] |
| [VALUE_TWO] | [What this value means] |

> Repeat enum block for each enum. Mark modified enums with `Modified In: [version]`.

---

## Entities

> Carry forward all entities from the previous schema version unchanged.
> Add new entities below existing ones. Mark modified entities with `Modified In: [version]`.

---

### [EntityName]

| Field | Value |
|---|---|
| **Entity Name** | [EntityName] |
| **Table Name** | [snake_case table name] |
| **Module** | [Module that owns this entity — from Module-level Tech Spec §4.1] |
| **Description** | [One sentence — what this entity represents in the domain] |
| **Added In** | [Schema version this entity was introduced] |
| **Modified In** | [Schema version(s) this entity was modified — or "none"] |
| **Soft Delete Strategy** | `deleted_at: DateTime \| None` / `is_deleted: bool` / None — hard delete |
| **Retention Period** | [From Module-level Tech Spec §8.4 — e.g., 90 days / indefinite / until account deleted] |
| **Retention Enforcement** | [From Module-level Tech Spec §8.4 — e.g., scheduled job / soft delete / manual] |

#### Attributes

| Field Name | Data Type | Nullable | Default | Constraints | Field Constraint (Product Spec §6) | Description |
|---|---|---|---|---|---|---|
| `id` | `UUID` | No | `uuid4()` | Primary Key | — | Unique identifier |
| `created_at` | `DateTime (timezone=True)` | No | `utcnow()` | — | — | Record creation timestamp |
| `updated_at` | `DateTime (timezone=True)` | No | `utcnow()` | — | — | Last update timestamp |
| `deleted_at` | `DateTime (timezone=True)` | Yes | `None` | — | — | Soft delete timestamp — null means active |
| `[field_name]` | `[type]` | Yes / No | `[default or none]` | `[UNIQUE / CHECK / FK / NOT NULL]` | [Mandatory / Optional, min: n, max: n] | [Description] |
| `[enum_field]` | `[EnumName]` | No | `[EnumName.DEFAULT_VALUE]` | — | [Mandatory, allowed: EnumValues] | [Description — references EnumName enum] |

> Standard fields (`id`, `created_at`, `updated_at`) are required on every entity.
> Add `deleted_at` only if soft delete strategy is timestamp-based.
> Field Constraint column is populated from Product Spec §6 — leave "—" for system-managed fields.

#### Indexes

| Index Name | Fields | Type | Purpose |
|---|---|---|---|
| `idx_[table]_[field]` | `[field_name]` | Standard | [Why this index exists — what query it supports] |
| `uq_[table]_[field]` | `[field_name]` | Unique | [Why uniqueness is enforced] |
| `idx_[table]_[field1]_[field2]` | `[field1, field2]` | Composite | [Why this composite index exists] |

#### Relationships

| Relationship | Related Entity | Type | FK Field | Cascade | Description |
|---|---|---|---|---|---|
| `[field_name]` | `[EntityName]` | Many-to-One / One-to-Many / Many-to-Many | `[fk_field_name]` | CASCADE / SET NULL / RESTRICT | [Description of the relationship] |

#### Business Rule Constraints

> Constraints from Module-level Tech Spec §4.1 — cannot be expressed as simple column constraints.

- [ ] [Business rule — e.g., "A room must have exactly one owner at all times"]
- [ ] [Business rule — e.g., "duration_hours must be between 6 and 73 — from Product Spec §6"]

---

> Repeat entity block for each entity. New entities from this run are added after all carried-forward entities.

---

## Relationship Map

> Summary of all relationships across all entities in the schema. Regenerated in full every run.

| Entity A | Relationship | Entity B | FK Field | Notes |
|---|---|---|---|---|
| [EntityA] | many-to-one | [EntityB] | `entity_b_id` on EntityA | [Any relevant note] |
| [EntityA] | one-to-many | [EntityC] | `entity_a_id` on EntityC | [Any relevant note] |
| [EntityB] | many-to-many | [EntityD] | Junction table: `entity_b_entity_d` | [Any relevant note] |

---

---

# ARTIFACT 2 — ALEMBIC MIGRATION SCRIPT

**File:** `[REVISION_ID]_[version]_[description].py`

> The revision ID is generated by Alembic. Use `[REVISION_ID]` as a placeholder.
> The `down_revision` must reference the revision ID of the immediately preceding migration.
> If this is the first migration, set `down_revision = None`.

```python
"""[Brief description of what this migration does]

Schema Version: [v{major}.{minor}]
Modules: [module name(s)]
Generated: [YYYYMMDD]
"""

from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic
revision: str = "[REVISION_ID]"
down_revision: str | None = "[PREVIOUS_REVISION_ID or None]"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    """Apply schema changes for [module name(s)] — schema [version]."""

    # ── Enums ──────────────────────────────────────────────────────────────
    # Create new enums before tables that reference them

    [enum_name]_enum = sa.Enum(
        "[VALUE_ONE]",
        "[VALUE_TWO]",
        name="[enumname]",
    )
    [enum_name]_enum.create(op.get_bind(), checkfirst=True)

    # ── New Tables ─────────────────────────────────────────────────────────

    op.create_table(
        "[table_name]",
        sa.Column("id", sa.UUID(), nullable=False, default=sa.text("gen_random_uuid()")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("[field_name]", sa.[ColumnType](), nullable=False),
        sa.Column("[enum_field]", sa.Enum("[VALUE_ONE]", "[VALUE_TWO]", name="[enumname]"), nullable=False),
        sa.Column("[fk_field]", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(["[fk_field]"], ["[referenced_table].id"], ondelete="[CASCADE / SET NULL / RESTRICT]"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("[field] >= [min] AND [field] <= [max]", name="ck_[table]_[field]_range"),
    )

    # ── Indexes ────────────────────────────────────────────────────────────

    op.create_index("idx_[table]_[field]", "[table_name]", ["[field_name]"])
    op.create_index("uq_[table]_[field]", "[table_name]", ["[field_name]"], unique=True)
    op.create_index("idx_[table]_[field1]_[field2]", "[table_name]", ["[field1]", "[field2]"])

    # ── Modifications to Existing Tables (subsequent runs only) ────────────

    op.add_column("[existing_table]", sa.Column("[new_field]", sa.[ColumnType](), nullable=True))
    op.create_index("idx_[existing_table]_[new_field]", "[existing_table]", ["[new_field]"])


def downgrade() -> None:
    """Reverse schema changes for [module name(s)] — schema [version]."""

    # ── Reverse in opposite order of upgrade ───────────────────────────────

    # Reverse modifications to existing tables
    op.drop_index("idx_[existing_table]_[new_field]", table_name="[existing_table]")
    op.drop_column("[existing_table]", "[new_field]")

    # Drop new indexes
    op.drop_index("idx_[table]_[field1]_[field2]", table_name="[table_name]")
    op.drop_index("uq_[table]_[field]", table_name="[table_name]")
    op.drop_index("idx_[table]_[field]", table_name="[table_name]")

    # Drop new tables
    op.drop_table("[table_name]")

    # Drop new enums (after tables that reference them are dropped)
    sa.Enum(name="[enumname]").drop(op.get_bind(), checkfirst=True)
```

---

---

# ARTIFACT 3 — ER DIAGRAMS

---

## Module-Scoped ER Diagram

> Shows only the entities added or modified in this run and their direct relationships.
> Generated once per run for focused review of the delta.

```mermaid
erDiagram

    [EntityName] {
        UUID id PK
        DateTime created_at
        DateTime updated_at
        DateTime deleted_at
        String field_name
        EnumType enum_field
        UUID fk_field FK
    }

    [RelatedEntity] {
        UUID id PK
        DateTime created_at
        DateTime updated_at
        String field_name
    }

    [EntityName] }o--|| [RelatedEntity] : "belongs to"
    [EntityName] ||--o{ [AnotherEntity] : "has many"
```

> Mermaid relationship notation:
> `||--||` exactly one to exactly one
> `||--o{` exactly one to zero or many
> `}o--||` zero or many to exactly one
> `}o--o{` zero or many to zero or many

---

## Full System ER Diagram

> Shows all entities across all modules in the schema. Regenerated in full every run.
> Always generated from the schema file — never maintained independently.

```mermaid
erDiagram

    %% ── [Module Name] Entities ───────────────────────────────────────────

    [EntityOne] {
        UUID id PK
        DateTime created_at
        DateTime updated_at
        String field_name
        EnumType enum_field
    }

    [EntityTwo] {
        UUID id PK
        DateTime created_at
        DateTime updated_at
        UUID entity_one_id FK
        String field_name
    }

    %% ── [Another Module] Entities ────────────────────────────────────────

    [EntityThree] {
        UUID id PK
        DateTime created_at
        DateTime updated_at
        UUID entity_one_id FK
    }

    %% ── Relationships ────────────────────────────────────────────────────

    [EntityOne] ||--o{ [EntityTwo] : "has many"
    [EntityOne] ||--o{ [EntityThree] : "has many"
    [EntityTwo] }o--|| [EntityOne] : "belongs to"
    [EntityThree] }o--|| [EntityOne] : "belongs to"
```

---

---

## Information Gaps Log

> Unresolved gaps identified during generation. Must be resolved before this output is used.

| Gap | What Is Needed | Status |
|---|---|---|
| [Gap description] | [What the human needs to provide] | Pending / Resolved |

---

## Review Comments

> For human reviewers. Add change requests or missing section requests here.
> The AI agent reads this section to determine what needs to be regenerated.

| # | Section | Comment | Status | Resolved On |
|---|---|---|---|---|
| 1 | [Section] | [Comment] | Open / Resolved | [Date] |
