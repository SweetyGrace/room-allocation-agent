# User Stories & Tasks — Custom Program Type (v1.1)

---

## GENERATION METADATA

| Field | Value |
|---|---|
| **Module** | Custom Program Type — Program Creation Wizard |
| **Product Spec Version** | v1.0 |
| **Module-level Tech Spec Version** | v1.0 |
| **Milestone** | M1 |
| **Generated On** | 2026-05-13 |
| **Last Updated** | 2026-05-15 |
| **Platform Scope** | Web (React), Backend (NestJS) |
| **Total Epics** | 9 |
| **Total Stories** | 20 |
| **Total Tasks** | 48 |
| **Third-Party Integrations** | 0 |
| **UAT Required Tasks** | 10 |
| **Total Story Points** | 158 |

---

## TECHNICAL INFRASTRUCTURE EPIC

---

### [EPIC-INFRA-001] Wizard State Management & Step Visibility Engine

| Field | Value |
|---|---|
| **Epic ID** | EPIC-INFRA-001 |
| **Title** | Wizard State Management & Step Visibility Engine |
| **Type** | Technical Infrastructure |
| **Description** | Before any product wizard step can be built, the centralized form state store and the step visibility computation engine must exist. The form state store (Zustand or React Context) holds the entire `CreateProgramDto` state across step transitions. The step visibility engine computes which of the 15 steps are active based on current flag values and re-evaluates on every relevant state change. Without these, no conditional step or field can function correctly. |
| **Platform Scope** | Web |
| **Spec Ref** | Tech Spec §2.5 Infrastructure Components |
| **Dependencies** | None |

#### Standalone Tasks

---

##### [TASK-INFRA-001-01] Set Up Wizard Form State Store

| Field | Value |
|---|---|
| **Task ID** | TASK-INFRA-001-01 |
| **Epic** | EPIC-INFRA-001 |
| **Title** | Set Up Wizard Form State Store (Zustand) |
| **Task Type** | Infrastructure |
| **Platform** | Web |
| **Story Points** | 3 |
| **Priority** | Critical |
| **UAT Required** | No |
| **Status** | Done |
| **Spec Ref** | Tech Spec §2.1, §2.5 |

**Description:**
Form state is managed by **React Hook Form** with a config-driven field resolution approach (`useAddProgramFormConfig` hook + `addProgramFormConfig.json`). The hook computes field arrays synchronously via `useMemo` based on program type and `programStructure`. `buildSchemaFromFields()` dynamically builds Yup validation schemas from config rather than hardcoding them. State persists across step navigation via the single RHF `useForm` instance. `reset()` is provided by React Hook Form natively.

**Dependencies:**
None

**Acceptance Criteria:**

Functional:

- [x] Form initialises with all `CreateProgramDto` fields set to `undefined` or their typed defaults
- [x] Updating a field in one step does not reset fields set in a different step
- [x] `reset()` clears all state back to initial values
- [x] Form state is accessible from any wizard step component without prop drilling

Non-Functional:

- [x] No unnecessary re-renders — `useWatch` used for reactive field subscriptions (replaces `watch`)

---

##### [TASK-INFRA-001-02] Implement Step Visibility Engine

| Field | Value |
|---|---|
| **Task ID** | TASK-INFRA-001-02 |
| **Epic** | EPIC-INFRA-001 |
| **Title** | Implement Step Visibility Engine |
| **Task Type** | Infrastructure |
| **Platform** | Web |
| **Story Points** | 5 |
| **Priority** | Critical |
| **UAT Required** | No |
| **Status** | Done |
| **Spec Ref** | Tech Spec §2.5, Product Spec §5 Conditional Visibility Summary |

**Description:**
Field-level conditional visibility is implemented in `DynamicFieldRenderer`. Three condition types are supported: `visibleWhen` (single condition — field shown when one named field equals a value), `visibleWhenAll` (all-match AND conditions — field shown only when every listed condition is simultaneously true), and `disabledWhen` (field is rendered but interactions are blocked when the condition is met, e.g. `isTravelInvolved` disabled when `modeOfProgram = online`). All conditions use `useWatch` for reactive subscriptions. Step-level visibility is computed from these field conditions as part of the config-driven form system.

**Dependencies:**
```
- BLOCKED-BY: TASK-INFRA-001-01
  Type: BLOCKED-BY
  Reason: Visibility engine reads from the form state store shape — store must be defined first.
```

**Acceptance Criteria:**

Functional:

- [x] Returns correct active step list for all 8+ flag combinations documented in the conditional visibility summary
- [x] Steps 13 and 14 are never both active simultaneously
- [x] `isTravelInvolved` is disabled (not hidden) when `modeOfOperation = ONLINE` (`disabledWhen` condition)
- [x] `visibleWhenAll` AND-logic conditions implemented and evaluated reactively
- [ ] Unit tests pass for all documented conditions

Non-Functional:

- [x] Condition evaluation uses `useWatch` — reactive with no unnecessary re-renders

---

##### [TASK-INFRA-001-03] Add New Field Types to DynamicFieldRenderer

| Field | Value |
|---|---|
| **Task ID** | TASK-INFRA-001-03 |
| **Epic** | EPIC-INFRA-001 |
| **Title** | Add New Field Types to DynamicFieldRenderer |
| **Task Type** | Infrastructure |
| **Platform** | Web |
| **Story Points** | 3 |
| **Priority** | High |
| **UAT Required** | No |
| **Status** | Done |
| **Spec Ref** | Tech Spec §2.5 |

**Description:**
Add `creatableSelect`, `imageUpload`, `date`, and `time` field types to DynamicFieldRenderer so the config-driven form can use them. Also add `visibleWhenAll` (multiple conditions required) and `disabledWhen` (field is disabled, not hidden, when condition is met) support.

**Dependencies:**
BLOCKED-BY: TASK-INFRA-001-01

**Acceptance Criteria:**

Functional:

- [x] `creatableSelect` type renders CreatableSelectField
- [x] `imageUpload` type renders ImageUploadField
- [x] `date` and `time` types render their respective pickers
- [x] `visibleWhenAll` hides field unless ALL conditions match
- [x] `disabledWhen` disables field (not hides) when condition matches; radio/select interaction blocked

---

##### [TASK-INFRA-001-04] Build CreatableSelectField and ImageUploadField Common Components

| Field | Value |
|---|---|
| **Task ID** | TASK-INFRA-001-04 |
| **Epic** | EPIC-INFRA-001 |
| **Title** | Build CreatableSelectField and ImageUploadField Common Components |
| **Task Type** | Infrastructure |
| **Platform** | Web |
| **Story Points** | 3 |
| **Priority** | High |
| **UAT Required** | No |
| **Status** | Done |
| **Spec Ref** | Tech Spec §2.5 |

**Description:**
Build two new reusable common components:

- `CreatableSelectField` (`src/common/components/CreatableSelectField/`) — tag-style creatable multiselect backed by React Hook Form Controller
- `ImageUploadField` (`src/common/components/ImageUploadField/`) — file upload input that resolves to a URL string stored in the form payload

**Dependencies:**
None

**Acceptance Criteria:**

Functional:

- [x] `CreatableSelectField` allows creating and selecting multiple string values
- [x] `ImageUploadField` uploads a file and stores resulting URL in form state
- [x] Both integrate with React Hook Form via Controller

---

---

## PRODUCT EPICS

---

### [EPIC-001] Program Type Entry Point — Custom Selection

| Field | Value |
|---|---|
| **Epic ID** | EPIC-001 |
| **Title** | Program Type Entry Point — Custom Selection |
| **Type** | Product |
| **Description** | Adds "Custom" as a selectable program type on the program type selection screen and routes the administrator into the 15-step creation wizard on selection. |
| **Platform Scope** | Web, Backend |
| **Spec Ref** | Product Spec §5 WF-01 |
| **Dependencies** | EPIC-INFRA-001 |

**Epic-Level Dependencies:**
```
- BLOCKED-BY: EPIC-INFRA-001
  Type: BLOCKED-BY
  Reason: Wizard cannot launch without the form state store and step visibility engine.
```

---

#### Stories

---

##### [US-001-01] Select Custom Program Type and Enter Wizard

| Field | Value |
|---|---|
| **Story ID** | US-001-01 |
| **Epic** | EPIC-001 |
| **Title** | Select Custom Program Type and Enter Wizard |
| **Platform Scope** | Web |
| **Story Points** | 3 |
| **Priority** | Critical |
| **UAT Required** | Yes |
| **Spec Ref** | Product Spec §5 WF-01 Happy Path |

**User Story:**
> As a Program Administrator,
> I want to select "Custom" from the program type selector,
> So that I am taken into the full-featured program creation wizard.

**Story-Level Dependencies:**
```
- BLOCKED-BY: EPIC-INFRA-001
  Type: BLOCKED-BY
  Reason: Wizard step routing requires the state store and visibility engine to be ready.
```

**Acceptance Criteria:**

Functional:
- [ ] "Custom" appears as an option in the program type selection screen
- [ ] Clicking "Custom" initialises the wizard form state and navigates to Step 1
- [ ] The step indicator is visible from the first step showing all active steps
- [ ] Navigating back from the wizard to the type selection screen prompts a confirmation ("You will lose unsaved changes") before resetting state

Non-Functional:
- [ ] Step 1 renders within 200ms of selection

---

###### Tasks

---

**[TASK-001-01-01] Add Custom Type to Program Type Selector**

| Field | Value |
|---|---|
| **Task ID** | TASK-001-01-01 |
| **Story** | US-001-01 |
| **Title** | Add Custom Type to Program Type Selector (Web UI) |
| **Task Type** | Web UI |
| **Platform** | Web |
| **Priority** | Critical |
| **UAT Required** | No |
| **Spec Ref** | Product Spec §4 F1 |

**Description:**
Add a "Custom" card or option to the existing program type selection screen. On click, call the Zustand store `reset()` action to clear any prior state, then navigate to the wizard at Step 1. The Custom option should display a label, a brief description ("Create a fully configurable program"), and an icon.

**Dependencies:** None

**Acceptance Criteria:**

Functional:
- [ ] "Custom" option renders on the program type selection screen
- [ ] Clicking Custom resets wizard state and navigates to Step 1

Non-Functional:
- [ ] Renders within 200ms

---

**[TASK-001-01-02] Build Step Indicator Component**

| Field | Value |
|---|---|
| **Task ID** | TASK-001-01-02 |
| **Story** | US-001-01 |
| **Title** | Build Wizard Step Indicator Component |
| **Task Type** | Web UI |
| **Platform** | Web |
| **Priority** | High |
| **UAT Required** | No |
| **Spec Ref** | Tech Spec §2.5, Product Spec §4 F1 |

**Description:**
Build a step indicator component that consumes the active step list from the visibility engine and renders the step names with visual state: completed, active, upcoming, hidden. The active step must have `aria-current="step"`. Skipped/hidden steps must not appear in the indicator. The indicator must be sticky/fixed within the wizard layout so it is always visible on scroll.

**Dependencies:**
```
- BLOCKED-BY: TASK-INFRA-001-02
  Type: BLOCKED-BY
  Reason: Needs the active step list from the visibility engine to render correctly.
```

**Acceptance Criteria:**

Functional:
- [ ] Active step is visually distinct from completed and upcoming steps
- [ ] Hidden steps (e.g. Steps 8, 9 when payment is off) do not appear
- [ ] `aria-current="step"` is set on the active step element

---

---

### [EPIC-002] Step 1 & 2 — Basic Info and Program Mode

| Field | Value |
|---|---|
| **Epic ID** | EPIC-002 |
| **Title** | Step 1 & 2 — Basic Info and Program Mode |
| **Type** | Product |
| **Description** | Covers the first two steps of the wizard: program identity fields and the mode/structure configuration that drives all downstream conditional logic. |
| **Platform Scope** | Web, Backend |
| **Spec Ref** | Product Spec §5 WF-01, §6 Data Requirements |
| **Dependencies** | EPIC-INFRA-001 |

**Epic-Level Dependencies:**
```
- BLOCKED-BY: EPIC-INFRA-001
  Type: BLOCKED-BY
  Reason: Steps read from and write to the form state store.
```

---

#### Stories

---

##### [US-002-01] Enter Basic Program Information

| Field | Value |
|---|---|
| **Story ID** | US-002-01 |
| **Epic** | EPIC-002 |
| **Title** | Enter Basic Program Information |
| **Platform Scope** | Web |
| **Story Points** | 5 |
| **Priority** | Critical |
| **UAT Required** | Yes |
| **Spec Ref** | Product Spec §5 WF-01 Step 1, §6 Data Requirements |

**User Story:**
> As a Program Administrator,
> I want to enter the program name, workflow, code, description, and media assets,
> So that the program has a complete identity before I configure its mode and stages.

**Acceptance Criteria:**

Functional:
- [ ] `name` field is required; advancing without it shows an inline error
- [ ] `workflowId` selector is populated from `GET /api/workflows`; required; shows error if empty on advance
- [ ] `code` field is optional; max 50 characters; accepts alphanumeric only
- [ ] `description` field is optional; max 2000 characters
- [ ] `subProgramType`, `status` are enum selectors with values from their respective enums
- [ ] `bannerImageUrl`, `bannerAnimationUrl`, `logoUrl` accept URL strings; invalid URLs show inline error
- [ ] `launchDate` uses a date picker component
- [ ] `isActive` renders as a toggle

Non-Functional:
- [ ] Workflow list renders within 500ms; if fetch fails, selector shows error state with retry option

---

###### Tasks

---

**[TASK-002-01-01] Build Step 1 — Basic Info Form**

| Field | Value |
|---|---|
| **Task ID** | TASK-002-01-01 |
| **Story** | US-002-01 |
| **Title** | Build Step 1 — Basic Info Form (Web UI) |
| **Task Type** | Web UI |
| **Platform** | Web |
| **Priority** | Critical |
| **UAT Required** | No |
| **Spec Ref** | Product Spec §6, Tech Spec §2.2 |

**Description:**
Build the Step 1 form with all fields: `name` (text, required), `workflowId` (async select from API), `code` (text, optional, max 50), `description` (textarea, max 2000), `subProgramType` (select enum), `programTemplateId` (optional number input or select), `bannerImageUrl`, `bannerAnimationUrl`, `logoUrl` (text inputs with URL validation), `launchDate` (date picker), `status` (select enum), `isActive` (toggle). All fields write to the wizard store on change. "Next" button triggers step-level validation before advancing.

**Dependencies:**
```
- BLOCKED-BY: TASK-INFRA-001-01
  Type: BLOCKED-BY
  Reason: Step reads from and writes to the form state store.
```

**Acceptance Criteria:**

Functional:
- [ ] Required fields (`name`, `workflowId`) show inline errors on advance if empty
- [ ] URL fields reject non-URL strings with inline error
- [ ] All values persist in store when navigating back and returning to Step 1

---

**[TASK-002-01-02] Backend — GET /api/workflows for Selector**

| Field | Value |
|---|---|
| **Task ID** | TASK-002-01-02 |
| **Story** | US-002-01 |
| **Title** | Confirm GET /api/workflows Returns Selector Data |
| **Task Type** | Backend API |
| **Platform** | Backend |
| **Priority** | Critical |
| **UAT Required** | No |
| **Spec Ref** | Tech Spec §3.1 |

**Description:**
Verify that `GET /api/workflows` exists and returns at minimum `{ id, name }` per workflow. This endpoint is already live and consumed by the Step 1 workflow selector — confirm the response shape is compatible. No JWT dependency; the endpoint is a RELATES-TO dependency, not a blocker.

**Dependencies:** None

**Acceptance Criteria:**

Functional:
- [ ] `GET /api/workflows` returns 200 with array of `{ id, name }`
- [ ] Returns empty array (not 404) if no workflows exist
- [ ] Response renders correctly in the workflow async-select component

---

##### [US-002-02] Configure Program Mode and Structure

| Field | Value |
|---|---|
| **Story ID** | US-002-02 |
| **Epic** | EPIC-002 |
| **Title** | Configure Program Mode and Structure |
| **Platform Scope** | Web |
| **Story Points** | 8 |
| **Priority** | Critical |
| **UAT Required** | Yes |
| **Spec Ref** | Product Spec §5 WF-01 Step 2, §4 F2 |

**User Story:**
> As a Program Administrator,
> I want to select the mode of operation, online type, and program structure,
> So that the wizard shows only the steps and fields relevant to my program's configuration.

**Acceptance Criteria:**

Functional:
- [ ] `modeOfOperation` is a required radio/select with options ONLINE / OFFLINE / HYBRID
- [ ] `onlineType` appears only when `modeOfOperation` is ONLINE or HYBRID; hidden otherwise
- [ ] Program structure renders as a radio with three options: SINGLE_SESSION / MULTIPLE_SESSIONS / GROUPED — only one selectable at a time
- [ ] Selecting MULTIPLE_SESSIONS sets `hasMultipleSessions=true, isGroupedProgram=false` in store
- [ ] Selecting GROUPED sets `isGroupedProgram=true, hasMultipleSessions=false` in store
- [ ] Selecting SINGLE_SESSION sets both to false in store
- [ ] Step visibility engine re-evaluates immediately after structure or mode changes
- [ ] Changing from GROUPED to MULTIPLE_SESSIONS clears the `groupedPrograms` array in the store (and vice versa) with a confirmation prompt if data was entered

Non-Functional:
- [ ] Step visibility re-evaluation completes within 200ms of flag change

---

###### Tasks

---

**[TASK-002-02-01] Build Step 2 — Program Mode Form**

| Field | Value |
|---|---|
| **Task ID** | TASK-002-02-01 |
| **Story** | US-002-02 |
| **Title** | Build Step 2 — Program Mode Form (Web UI) |
| **Task Type** | Web UI |
| **Platform** | Web |
| **Priority** | Critical |
| **UAT Required** | No |
| **Status** | Done |
| **Spec Ref** | Product Spec §4 F2, Tech Spec §2.5 |

**Description:**
Build Step 2 form: `modeOfOperation` (radio, required), `onlineType` (conditional select — shown only when ONLINE or HYBRID), program structure (3-option radio: SINGLE_SESSION / MULTIPLE_SESSIONS / GROUPED), `frequency` (optional select), `maxSessionDurationDays` (optional number ≥ 0). On change of structure selection: if switching away from GROUPED while `groupedPrograms` has entries, show a confirmation modal before clearing. If switching away from MULTIPLE_SESSIONS while `programSessions` has entries, same prompt. Store updates trigger step visibility recomputation.

**Dependencies:**
```
- BLOCKED-BY: TASK-INFRA-001-02
  Type: BLOCKED-BY
  Reason: Step visibility engine must exist to react to structure/mode changes.
```

**Acceptance Criteria:**

Functional:
- [ ] `onlineType` mounts/unmounts based on `modeOfOperation` value
- [ ] Switching structure with existing sub-program or session data prompts confirmation before clearing
- [ ] Store reflects correct boolean values for `hasMultipleSessions` and `isGroupedProgram` per radio selection

---

---

### [EPIC-003] Steps 3–6 — Schedule, Venue, Registration, Seats

| Field | Value |
|---|---|
| **Epic ID** | EPIC-003 |
| **Title** | Steps 3–6 — Schedule, Venue, Registration Rules, and Seats |
| **Type** | Product |
| **Description** | Four always-visible steps covering schedule/dates, venue, registration policy, and seat capacity configuration including the limited-seats and waitlist sub-fields. |
| **Platform Scope** | Web |
| **Spec Ref** | Product Spec §5 WF-01, WF-04 |
| **Dependencies** | EPIC-INFRA-001 |

**Epic-Level Dependencies:**
```
- BLOCKED-BY: EPIC-INFRA-001
  Type: BLOCKED-BY
  Reason: All steps require the form state store.
```

---

#### Stories

---

##### [US-003-01] Configure Schedule and Dates

| Field | Value |
|---|---|
| **Story ID** | US-003-01 |
| **Epic** | EPIC-003 |
| **Title** | Configure Schedule and Dates |
| **Platform Scope** | Web |
| **Story Points** | 5 |
| **Priority** | High |
| **UAT Required** | No |
| **Spec Ref** | Product Spec §5 WF-01 Step 3 |

**User Story:**
> As a Program Administrator,
> I want to enter all program and registration dates and times,
> So that the system has a complete schedule for the program lifecycle.

**Acceptance Criteria:**

Functional:
- [ ] All date fields use a date-time picker component
- [ ] `endsAt` must not be before `startsAt` if both are set — show inline error
- [ ] `registrationEndsAt` must not be before `registrationStartsAt` if both are set — show inline error
- [ ] `defaultStartTime` and `defaultEndTime` use time pickers (HH:MM:SS)
- [ ] `defaultEndTime` must be after `defaultStartTime` if both are set

---

##### [US-003-02] Configure Venue and Location

| Field | Value |
|---|---|
| **Story ID** | US-003-02 |
| **Epic** | EPIC-003 |
| **Title** | Configure Venue and Location |
| **Platform Scope** | Web |
| **Story Points** | 3 |
| **Priority** | Medium |
| **UAT Required** | No |
| **Spec Ref** | Product Spec §5 WF-01 Step 4 |

**User Story:**
> As a Program Administrator,
> I want to enter the venue name, email display name, and full venue address,
> So that location details appear correctly in communications and registrations.

**Acceptance Criteria:**

Functional:
- [ ] `venue` text field, optional, max 500 chars
- [ ] `venueNameInEmails` text field, optional, max 255 chars
- [ ] `venueAddress` renders the full `CreateAddressDto` sub-form (street, city, state, pincode, country)

---

##### [US-003-03] Configure Registration Rules

| Field | Value |
|---|---|
| **Story ID** | US-003-03 |
| **Epic** | EPIC-003 |
| **Title** | Configure Registration Rules |
| **Platform Scope** | Web |
| **Story Points** | 5 |
| **Priority** | High |
| **UAT Required** | Yes |
| **Spec Ref** | Product Spec §5 WF-01 Step 5, §4 F-Registration |

**User Story:**
> As a Program Administrator,
> I want to configure approval, proxy registration, minor allowance, and attendance requirements,
> So that the registration flow enforces the correct policies for my program.

**Acceptance Criteria:**

Functional:
- [ ] `requiresApproval`, `allowSaveAsDraft`, `allowsProxyRegistration`, `allowsMinors`, `requiresAttendanceAllSessions`, `requiresResidence` all render as toggles
- [ ] `registrationLevel` renders as an enum selector
- [ ] `elderMinAge` and `childMaxAge` are optional number inputs with min 0, max 150
- [ ] All values persist on step navigation

---

##### [US-003-04] Configure Seats and Waitlist

| Field | Value |
|---|---|
| **Story ID** | US-003-04 |
| **Epic** | EPIC-003 |
| **Title** | Configure Seats and Waitlist |
| **Platform Scope** | Web |
| **Story Points** | 5 |
| **Priority** | High |
| **UAT Required** | Yes |
| **Spec Ref** | Product Spec §5 WF-04, §6 Data Requirements |

**User Story:**
> As a Program Administrator,
> I want to toggle limited seats and optionally configure a waitlist,
> So that the system correctly caps registrations and manages overflow.

**Acceptance Criteria:**

Functional:
- [ ] `limitedSeats` toggle is always visible
- [ ] `totalSeats`, `availableSeats`, `maxCapacity`, `waitlistApplicable` appear only when `limitedSeats = true`
- [ ] `waitlistTriggerCount` appears only when `waitlistApplicable = true`
- [ ] All seat count fields reject values below 0 with inline error
- [ ] `availableSeats` shows a warning (not error) if it exceeds `totalSeats`
- [ ] `allocateSeatIfOfflinePending` toggle always visible in this step

---

---

### [EPIC-004] Step 7 — Stage Flags

| Field | Value |
|---|---|
| **Epic ID** | EPIC-004 |
| **Title** | Step 7 — Stage Flags |
| **Type** | Product |
| **Description** | The stage flag step enables or disables each optional program lifecycle stage. This step drives which of Steps 8, 9, 11, and 12 become active. Travel is auto-disabled for ONLINE mode. |
| **Platform Scope** | Web |
| **Spec Ref** | Product Spec §5 WF-01 Step 7, WF-03, §4 F3 |
| **Dependencies** | EPIC-002, EPIC-INFRA-001 |

**Epic-Level Dependencies:**
```
- BLOCKED-BY: EPIC-002
  Type: BLOCKED-BY
  Reason: Travel auto-disable logic depends on modeOfOperation value set in Step 2.
- BLOCKED-BY: EPIC-INFRA-001
  Type: BLOCKED-BY
  Reason: Stage flag changes must trigger step visibility recomputation.
```

---

#### Stories

---

##### [US-004-01] Configure Stage Flags Including Travel Auto-Disable

| Field | Value |
|---|---|
| **Story ID** | US-004-01 |
| **Epic** | EPIC-004 |
| **Title** | Configure Stage Flags with Travel Auto-Disable for Online Programs |
| **Platform Scope** | Web |
| **Story Points** | 8 |
| **Priority** | Critical |
| **UAT Required** | Yes |
| **Spec Ref** | Product Spec §4 F3, §5 WF-03 |

**User Story:**
> As a Program Administrator,
> I want to enable the stages my program needs and have travel automatically disabled for online programs,
> So that I cannot accidentally configure travel for a program that has no physical component.

**Acceptance Criteria:**

Functional:
- [ ] Six stage toggles render: Payment, Travel, Goodies, Share Experience, Checkin/Checkout, Residence
- [ ] When `modeOfOperation = ONLINE`, Travel toggle is visually disabled (`aria-disabled="true"`) and cannot be interacted with
- [ ] Travel toggle shows a tooltip on hover: "Travel is not available for online programs"
- [ ] Toggling Payment on activates Steps 8 and 9 in the step indicator immediately
- [ ] Toggling Checkin/Checkout on activates Step 11 in the step indicator immediately
- [ ] Toggling Residence on activates Step 12 in the step indicator immediately
- [ ] Toggling a stage off after data was entered in its steps shows a confirmation: "Disabling this stage will clear data entered in the related steps. Continue?"
- [ ] On confirmation of disable, associated step data is cleared from the store

Non-Functional:
- [ ] Step indicator updates within 200ms of any toggle change

---

###### Tasks

---

**[TASK-004-01-01] Build Step 7 — Stage Flags Form**

| Field | Value |
|---|---|
| **Task ID** | TASK-004-01-01 |
| **Story** | US-004-01 |
| **Title** | Build Step 7 — Stage Flags Form (Web UI) |
| **Task Type** | Web UI |
| **Platform** | Web |
| **Priority** | Critical |
| **UAT Required** | No |
| **Status** | Done |
| **Spec Ref** | Product Spec §4 F3, Tech Spec §2.5 |

**Description:**
Build Step 7 with six toggle rows: Payment (`requiresPayment`), Travel (`isTravelInvolved`), Goodies (`hasGoodies`), Share Experience (`seekerCanShareExperience`), Checkin/Checkout (`hasCheckinCheckout`), Residence (`isResidenceRequired`). Read `modeOfOperation` from the store. If ONLINE, render Travel toggle with `disabled` prop and attach a Tooltip component with the explanatory text. On toggle change for Payment, Checkin/Checkout, and Residence: dispatch to store, which triggers step visibility recomputation. On toggle-off of a stage that has data in its steps: dispatch a `confirmClearStageData` action that shows a modal before clearing.

**Dependencies:**
```
- BLOCKED-BY: TASK-INFRA-001-02
  Type: BLOCKED-BY
  Reason: Stage flag changes must trigger step visibility engine recomputation.
- BLOCKED-BY: TASK-002-02-01
  Type: BLOCKED-BY
  Reason: Travel disabled state derived from modeOfOperation set in Step 2.
```

**Acceptance Criteria:**

Functional:
- [ ] Travel toggle disabled when `modeOfOperation = ONLINE`
- [ ] Tooltip renders on hover of disabled Travel toggle
- [ ] `aria-disabled="true"` set on disabled Travel toggle
- [ ] Confirmation modal appears before clearing stage data on toggle-off

---

---

### [EPIC-005] Steps 8–10 — Payment, Invoice, and Email Configuration

| Field | Value |
|---|---|
| **Epic ID** | EPIC-005 |
| **Title** | Steps 8–10 — Payment, Invoice, and Email Configuration |
| **Type** | Product |
| **Description** | Steps 8 and 9 are conditionally shown when `requiresPayment = true`. Step 10 (Email & Communication) is always shown. Together these steps configure financial settings and outbound communication identity. |
| **Platform Scope** | Web |
| **Spec Ref** | Product Spec §5 WF-07, §6 Data Requirements |
| **Dependencies** | EPIC-004 |

**Epic-Level Dependencies:**
```
- BLOCKED-BY: EPIC-004
  Type: BLOCKED-BY
  Reason: Steps 8 and 9 are only added to the active step list after Payment is toggled on in Step 7.
```

---

#### Stories

---

##### [US-005-01] Configure Payment Pricing and Tax

| Field | Value |
|---|---|
| **Story ID** | US-005-01 |
| **Epic** | EPIC-005 |
| **Title** | Configure Payment Pricing and Tax Settings |
| **Platform Scope** | Web |
| **Story Points** | 8 |
| **Priority** | High |
| **UAT Required** | Yes |
| **Spec Ref** | Product Spec §5 WF-07 Step 8, §6 Data Requirements |

**User Story:**
> As a Program Administrator,
> I want to set the program fee, tax rates, and GST details,
> So that seekers are charged the correct amount and invoices reflect accurate tax information.

**Acceptance Criteria:**

Functional:
- [ ] Step 8 visible only when `requiresPayment = true`
- [ ] `basePrice` and `programFee` are decimal inputs; min 0; max 2 decimal places
- [ ] `currency` is a text input with max 10 chars (ISO currency code)
- [ ] `gstPercentage`, `cgst`, `sgst`, `igst`, `tdsPercent` are decimal inputs; min 0, max 100; max 2 decimal places
- [ ] Values above 100 or below 0 show inline errors and block step advance
- [ ] `gstNumber` is a text input with max 15 chars
- [ ] `tdsApplicability` is an enum selector

Non-Functional:
- [ ] Decimal validation fires on blur, not on every keystroke

---

##### [US-005-02] Configure Invoice Sender Details

| Field | Value |
|---|---|
| **Story ID** | US-005-02 |
| **Epic** | EPIC-005 |
| **Title** | Configure Invoice Sender Identity |
| **Platform Scope** | Web |
| **Story Points** | 3 |
| **Priority** | High |
| **UAT Required** | No |
| **Spec Ref** | Product Spec §5 WF-07 Step 9 |

**User Story:**
> As a Program Administrator,
> I want to enter the invoice sender name, PAN, CIN, and address,
> So that generated invoices carry the correct issuer identity.

**Acceptance Criteria:**

Functional:
- [ ] Step 9 visible only when `requiresPayment = true`
- [ ] `invoiceSenderName` text input, max 255 chars
- [ ] `invoiceSenderPan` text input, max 10 chars
- [ ] `invoiceSenderCin` text input, max 21 chars
- [ ] `invoiceSenderAddress` textarea, max 1000 chars

---

##### [US-005-03] Configure Email and Communication Settings

| Field | Value |
|---|---|
| **Story ID** | US-005-03 |
| **Epic** | EPIC-005 |
| **Title** | Configure Email Sender and Communication Identities |
| **Platform Scope** | Web |
| **Story Points** | 3 |
| **Priority** | Medium |
| **UAT Required** | No |
| **Spec Ref** | Product Spec §5 WF-01 Step 10 |

**User Story:**
> As a Program Administrator,
> I want to set the email sender name, address, BCC, and helpline number,
> So that all outbound communications for this program carry the correct identity.

**Acceptance Criteria:**

Functional:
- [ ] Step 10 always visible
- [ ] `emailSenderAddress` and `emailBccAddress` validate as email format on blur
- [ ] `helplineNumber` accepts string up to 20 chars

---

---

### [EPIC-006] Steps 11–12 — Checkin/Checkout and Residence

| Field | Value |
|---|---|
| **Epic ID** | EPIC-006 |
| **Title** | Steps 11–12 — Checkin/Checkout Dates and Residence |
| **Type** | Product |
| **Description** | Conditional steps activated by their respective stage flags. Step 11 collects checkin/checkout datetimes; Step 12 collects the bed count for residence programs. |
| **Platform Scope** | Web |
| **Spec Ref** | Product Spec §5 WF-01 Steps 11–12 |
| **Dependencies** | EPIC-004 |

**Epic-Level Dependencies:**
```
- BLOCKED-BY: EPIC-004
  Type: BLOCKED-BY
  Reason: Steps 11 and 12 become active only after their flags are enabled in Step 7.
```

---

#### Stories

---

##### [US-006-01] Configure Checkin and Checkout Dates

| Field | Value |
|---|---|
| **Story ID** | US-006-01 |
| **Epic** | EPIC-006 |
| **Title** | Configure Checkin and Checkout Date-Times |
| **Platform Scope** | Web |
| **Story Points** | 3 |
| **Priority** | Medium |
| **UAT Required** | No |
| **Spec Ref** | Product Spec §5 WF-01 Step 11 |

**User Story:**
> As a Program Administrator,
> I want to set check-in and check-out datetimes and their end windows,
> So that the checkin/checkout system knows when seekers are expected to arrive and depart.

**Acceptance Criteria:**

Functional:
- [ ] Step 11 visible only when `hasCheckinCheckout = true`
- [ ] `checkoutAt` must not be before `checkinAt` if both are set — inline error
- [ ] All four fields use a date-time picker

---

##### [US-006-02] Configure Residence Bed Count

| Field | Value |
|---|---|
| **Story ID** | US-006-02 |
| **Epic** | EPIC-006 |
| **Title** | Configure Residence Bed Count |
| **Platform Scope** | Web |
| **Story Points** | 2 |
| **Priority** | Low |
| **UAT Required** | No |
| **Spec Ref** | Product Spec §5 WF-01 Step 12 |

**User Story:**
> As a Program Administrator,
> I want to set the total bed count for residential programs,
> So that the residence module knows the accommodation capacity.

**Acceptance Criteria:**

Functional:
- [ ] Step 12 visible only when `isResidenceRequired = true`
- [ ] `totalBedCount` is an integer input with min 0

---

---

### [EPIC-007] Steps 13–14 — Grouped Sub-Programs and Sessions

| Field | Value |
|---|---|
| **Epic ID** | EPIC-007 |
| **Title** | Steps 13–14 — Grouped Sub-Programs and Multi-Session Entry |
| **Type** | Product |
| **Description** | Two mutually exclusive steps. Step 13 allows inline entry of grouped sub-programs (GroupedProgramDto list). Step 14 allows inline entry of program sessions (CreateProgramSessionDto list). Only one is active at a time based on program structure selection. |
| **Platform Scope** | Web |
| **Spec Ref** | Product Spec §5 WF-05, WF-06, §4 F5, F6 |
| **Dependencies** | EPIC-002, EPIC-INFRA-001 |

**Epic-Level Dependencies:**
```
- BLOCKED-BY: EPIC-002
  Type: BLOCKED-BY
  Reason: Program structure selection in Step 2 determines which of Steps 13/14 is active.
- BLOCKED-BY: EPIC-INFRA-001
  Type: BLOCKED-BY
  Reason: Step visibility engine controls mutual exclusivity of Steps 13 and 14.
```

---

#### Stories

---

##### [US-007-01] Add and Configure Grouped Sub-Programs

| Field | Value |
|---|---|
| **Story ID** | US-007-01 |
| **Epic** | EPIC-007 |
| **Title** | Add and Configure Grouped Sub-Programs |
| **Platform Scope** | Web |
| **Story Points** | 13 |
| **Priority** | High |
| **UAT Required** | Yes |
| **Spec Ref** | Product Spec §5 WF-05, §4 F5 |

**User Story:**
> As a Program Administrator,
> I want to add multiple sub-programs with their own schedules and settings,
> So that a single grouped program can have city-wise or variant-specific configurations.

**Acceptance Criteria:**

Functional:
- [ ] Step 13 visible only when `isGroupedProgram = true`; Step 14 hidden simultaneously
- [ ] "Add Sub-Program" button opens an inline expanded form with all `GroupedProgramDto` fields
- [ ] `name` is required per sub-program; advance blocked if any sub-program is missing a name
- [ ] `groupDisplayOrder` is required per sub-program; must be ≥ 1; must be unique within the list — duplicate order shows inline conflict error
- [ ] At least one sub-program must exist to advance past Step 13
- [ ] Sub-programs can be reordered (drag or order input)
- [ ] Each sub-program can be edited and deleted from the list view
- [ ] Full `GroupedProgramDto` fields are accessible in the sub-program form (all fields from requirements doc Step 13 table)

Non-Functional:
- [ ] Sub-program form renders within 200ms of clicking "Add Sub-Program"

---

###### Tasks

---

**[TASK-007-01-01] Build Step 13 — Grouped Sub-Program List and Entry Form**

| Field | Value |
|---|---|
| **Task ID** | TASK-007-01-01 |
| **Story** | US-007-01 |
| **Title** | Build Step 13 — Grouped Sub-Program List and Inline Entry Form |
| **Task Type** | Web UI |
| **Platform** | Web |
| **Priority** | High |
| **UAT Required** | No |
| **Status** | In Progress |
| **Spec Ref** | Product Spec §4 F5, Requirements Doc Step 13 |

**Description:**
Build Step 13 UI. Show a list of added sub-programs (cards with name, order, and edit/delete actions). "Add Sub-Program" expands an inline accordion form. The form covers all `GroupedProgramDto` fields grouped into logical sub-sections: identity (name, code, description, order), schedule (dates), venue (venue, venueAddress), registration (registration windows, seats, requiresPayment, etc.), pricing (basePrice, programFee, GST fields), invoice, email, flags (hasCheckinCheckout, isResidenceRequired, etc.), checkin dates, media (banner, logo), and meta. "Save Sub-Program" validates required fields (name, groupDisplayOrder) and pushes to the `groupedPrograms` array in the store. "Cancel" discards. Validate uniqueness of `groupDisplayOrder` across the list before allowing save.

**Dependencies:**
```
- BLOCKED-BY: TASK-INFRA-001-01
  Type: BLOCKED-BY
  Reason: Writes to the groupedPrograms array in the wizard store.
- BLOCKED-BY: TASK-INFRA-001-02
  Type: BLOCKED-BY
  Reason: Step 13 visibility is controlled by the visibility engine.
```

**Acceptance Criteria:**

Functional:
- [ ] Inline form opens on "Add Sub-Program" click
- [ ] All GroupedProgramDto fields are present in the inline form
- [ ] Save validates name and groupDisplayOrder; blocks save if either is missing or order is duplicate
- [ ] Saved sub-programs appear in the list with edit and delete actions
- [ ] Minimum 1 sub-program required to advance; shows error if list is empty on advance

---

##### [US-007-02] Add Program Sessions

| Field | Value |
|---|---|
| **Story ID** | US-007-02 |
| **Epic** | EPIC-007 |
| **Title** | Add Program Sessions |
| **Platform Scope** | Web |
| **Story Points** | 8 |
| **Priority** | High |
| **UAT Required** | Yes |
| **Spec Ref** | Product Spec §5 WF-06, §4 F6 |

**User Story:**
> As a Program Administrator,
> I want to add multiple sessions to a multi-session program,
> So that each session is individually scheduled and tracked.

**Acceptance Criteria:**

Functional:
- [ ] Step 14 visible only when `hasMultipleSessions = true`; Step 13 hidden simultaneously
- [ ] "Add Session" opens an inline form with `CreateProgramSessionDto` fields
- [ ] At least one session required to advance past Step 14
- [ ] Sessions appear in a list with edit and delete actions

---

---

### [EPIC-008] Step 15, Form Submission, and Draft Save

| Field | Value |
|---|---|
| **Epic ID** | EPIC-008 |
| **Title** | Step 15, Form Submission, Draft Save, and Resume |
| **Type** | Product |
| **Description** | Covers the final meta/advanced step, the summary review, final form submission to POST /api/programs, draft save at any step, and the ability to resume a saved draft. |
| **Platform Scope** | Web, Backend |
| **Spec Ref** | Product Spec §5 WF-01 (submission), WF-02 (draft) |
| **Dependencies** | EPIC-001, EPIC-002, EPIC-003, EPIC-004, EPIC-005, EPIC-006, EPIC-007 |

**Epic-Level Dependencies:**
```
- BLOCKED-BY: EPIC-001, EPIC-002, EPIC-003, EPIC-004, EPIC-005, EPIC-006, EPIC-007
  Type: BLOCKED-BY
  Reason: Submission assembles the full payload from all prior steps — all step forms must be complete.
```

---

#### Stories

---

##### [US-008-01] Complete Wizard and Submit Program

| Field | Value |
|---|---|
| **Story ID** | US-008-01 |
| **Epic** | EPIC-008 |
| **Title** | Complete Wizard and Submit Program Creation |
| **Platform Scope** | Web, Backend |
| **Story Points** | 13 |
| **Priority** | Critical |
| **UAT Required** | Yes |
| **Spec Ref** | Product Spec §5 WF-01 Happy Path (submission), Tech Spec §3.1 |

**User Story:**
> As a Program Administrator,
> I want to review my configuration and submit the program,
> So that the program is created in the system and I am taken to its detail page.

**Acceptance Criteria:**

Functional:
- [ ] Step 15 renders `meta` (JSON textarea) and `program` (legacy string) optional fields
- [ ] A summary view is presented before the final submit button, showing key configured values from all steps
- [ ] Clicking "Submit" assembles the full `CreateProgramDto` from the store, reads `userId` from localStorage and includes it as `createdBy`/`updatedBy` in the payload, and calls `POST /api/programs`
- [ ] On 201 success, the administrator is redirected to the newly created program's detail page
- [ ] On 4xx response, the error is displayed as a toast and the administrator is kept on the summary step; structured validation errors are mapped back to their originating step and field
- [ ] On 5xx response, a generic error toast is shown; form data is preserved
- [ ] `isTravelInvolved` is forced to `false` in the payload when `modeOfOperation = ONLINE` regardless of store state

Non-Functional:
- [ ] Submission response received within 3s at p95
- [ ] Submitted payload logged on backend with `{ userId, programId, action: 'PROGRAM_CREATED', timestamp }`

---

###### Tasks

---

**[TASK-008-01-01] Build Step 15 — Meta/Advanced Form**

| Field | Value |
|---|---|
| **Task ID** | TASK-008-01-01 |
| **Story** | US-008-01 |
| **Title** | Build Step 15 — Meta and Advanced Fields |
| **Task Type** | Web UI |
| **Platform** | Web |
| **Priority** | Low |
| **UAT Required** | No |
| **Spec Ref** | Product Spec §5 WF-01 Step 15 |

**Description:**
Build Step 15: a `meta` field rendered as a JSON textarea with basic JSON syntax validation on blur (parse attempt; show "Invalid JSON" inline if fails), and a `program` legacy string text input (max 255 chars). Both optional.

**Dependencies:** None

**Acceptance Criteria:**

Functional:
- [ ] Invalid JSON in `meta` field shows inline "Invalid JSON" error; does not block advance (warning only)
- [ ] Values persist in store on navigation

---

**[TASK-008-01-02] Build Summary Review Screen**

| Field | Value |
|---|---|
| **Task ID** | TASK-008-01-02 |
| **Story** | US-008-01 |
| **Title** | Build Wizard Summary Review Screen |
| **Task Type** | Web UI |
| **Platform** | Web |
| **Priority** | High |
| **UAT Required** | No |
| **Spec Ref** | Product Spec §5 WF-01 |

**Description:**
Build a read-only summary view after Step 15 that presents the key configured values grouped by section (Basic Info, Mode, Dates, Venue, Registration, Seats, Stages, Payment if enabled, Email, Checkin if enabled, Residence if enabled, Sub-programs count if grouped, Sessions count if multi-session). Each section has an "Edit" link that jumps back to the relevant step. A "Submit" button at the bottom triggers the form submission.

**Dependencies:**
```
- BLOCKED-BY: TASK-008-01-01
  Type: BLOCKED-BY
  Reason: Summary is the step after Step 15.
```

**Acceptance Criteria:**

Functional:
- [ ] All configured non-empty values appear in summary
- [ ] "Edit" links navigate back to the correct step without losing other step data
- [ ] "Submit" button is only enabled after user has visited all active required steps

---

**[TASK-008-01-03] Backend — POST /api/programs (Full CreateProgramDto)**

| Field | Value |
|---|---|
| **Task ID** | TASK-008-01-03 |
| **Story** | US-008-01 |
| **Title** | Backend — Create Program Endpoint with Full DTO Validation |
| **Task Type** | Backend API |
| **Platform** | Backend |
| **Priority** | Critical |
| **UAT Required** | No |
| **Spec Ref** | Tech Spec §3.1, §4.1, §6.1 |

**Description:**
Implement (or verify) `POST /api/programs` that accepts the full `CreateProgramDto`. The controller must: (1) read `userId` from the request payload (the client sources this from localStorage) and inject as `createdBy` and `updatedBy` — never trust any other origin; (2) pass to `ProgramService.create()`; (3) service must resolve `typeId` for the Custom type (already seeded); (4) create root Program record; (5) if `isGroupedProgram = true`, bulk-insert all `groupedPrograms` children in the same transaction; (6) if `hasMultipleSessions = true`, bulk-insert all `programSessions` children in the same transaction; (7) if `modeOfOperation = ONLINE`, override `isTravelInvolved = false` before persistence; (8) emit `ProgramCreated` event after successful commit; (9) return 201 with created program entity.

**Dependencies:** None

**Acceptance Criteria:**

Functional:
- [ ] Returns 201 with program entity on valid payload
- [ ] `createdBy`/`updatedBy` populated from the `userId` field in the request payload
- [ ] Child GroupedPrograms created in same transaction as parent
- [ ] Child ProgramSessions created in same transaction as parent
- [ ] `isTravelInvolved = false` enforced server-side for ONLINE programs
- [ ] Returns 400 with field-level errors on invalid payload
- [ ] Returns 409 on duplicate `code`

Non-Functional:
- [ ] p95 response time < 3s for payload with 10 sub-programs and 20 sessions
- [ ] Structured log entry emitted on successful creation: `{ userId, programId, action: 'PROGRAM_CREATED', timestamp }`

---

##### [US-008-02] Save Draft at Any Wizard Step

| Field | Value |
|---|---|
| **Story ID** | US-008-02 |
| **Epic** | EPIC-008 |
| **Title** | Save Program as Draft at Any Step |
| **Platform Scope** | Web, Backend |
| **Story Points** | 5 |
| **Priority** | High |
| **UAT Required** | Yes |
| **Spec Ref** | Product Spec §5 WF-02, §4 F8 |

**User Story:**
> As a Program Administrator,
> I want to save my partially completed program as a draft at any point in the wizard,
> So that I can return later and continue without losing my work.

**Acceptance Criteria:**

Functional:
- [ ] "Save as Draft" button is accessible from every wizard step
- [ ] Draft save requires at minimum `name` and `workflowId`; shows inline error on the relevant step if either is missing
- [ ] Draft is submitted with `status = DRAFT` via `POST /api/programs`
- [ ] On successful save, a toast confirms "Draft saved successfully" and the wizard stays on the current step
- [ ] On save failure (5xx), retry once automatically; if retry fails, show error toast; form data preserved
- [ ] Opening a draft from the program listing pre-fills the wizard with all saved values and positions the user at the first incomplete step

Non-Functional:
- [ ] Draft save response received within 3s

---

---

### [EPIC-009] Program Edit Flow — Pre-fill and PATCH Submission

| Field | Value |
|---|---|
| **Epic ID** | EPIC-009 |
| **Title** | Program Edit Flow — Pre-fill Wizard and PATCH Submission |
| **Type** | Product |
| **Description** | Covers the edit path for existing Custom programs. When an administrator opens an existing program for editing, the same 15-step wizard is loaded pre-filled with the program's current values via `GET /api/programs/:id`. Submission sends a `PATCH /api/programs/:id` request with only the changed fields. The edit wizard is identical in structure to the create wizard; step visibility rules apply identically. |
| **Platform Scope** | Web, Backend |
| **Spec Ref** | Tech Spec §3.1 (PATCH endpoint), Product Spec §3 In Scope |
| **Dependencies** | EPIC-INFRA-001, EPIC-008 |

**Epic-Level Dependencies:**
```
- BLOCKED-BY: EPIC-INFRA-001
  Type: BLOCKED-BY
  Reason: Edit wizard uses the same form state store and step visibility engine as create.
- BLOCKED-BY: EPIC-008
  Type: BLOCKED-BY
  Reason: The create wizard must be complete before the edit variant is built on top of it.
```

---

#### Stories

---

##### [US-009-01] Pre-fill Wizard with Existing Program Data

| Field | Value |
|---|---|
| **Story ID** | US-009-01 |
| **Epic** | EPIC-009 |
| **Title** | Pre-fill Program Edit Wizard from Existing Program |
| **Platform Scope** | Web, Backend |
| **Story Points** | 8 |
| **Priority** | High |
| **UAT Required** | Yes |
| **Spec Ref** | Tech Spec §3.1 GET /api/programs/:id |

**User Story:**
> As a Program Administrator,
> I want to open an existing Custom program in the wizard with all its current values pre-filled,
> So that I can review and edit only the fields I want to change without re-entering everything.

**Story-Level Dependencies:**
```
- BLOCKED-BY: EPIC-008
  Type: BLOCKED-BY
  Reason: Edit wizard is the create wizard with pre-filled state; create wizard must exist first.
```

**Acceptance Criteria:**

Functional:
- [ ] Clicking "Edit" on a program listing row (or program detail page) for a Custom program calls `GET /api/programs/:id` and loads the wizard
- [ ] All fields from the existing program entity are mapped into the wizard store before the wizard mounts
- [ ] Step visibility flags (requiresPayment, hasCheckinCheckout, isResidenceRequired, isGroupedProgram, hasMultipleSessions, modeOfOperation) are derived from the fetched data so the correct steps are active from the start
- [ ] The step indicator shows all active steps pre-computed from the fetched data
- [ ] If `GET /api/programs/:id` returns 404 or 5xx, an error screen is shown with a "Go back" action
- [ ] Nested data (groupedPrograms array, programSessions array) is pre-populated in the store and displayed in Steps 13/14

Non-Functional:
- [ ] Wizard renders within 1s of the API response for programs with up to 10 sub-programs

---

###### Tasks

---

**[TASK-009-01-01] Backend — GET /api/programs/:id for Pre-fill**

| Field | Value |
|---|---|
| **Task ID** | TASK-009-01-01 |
| **Story** | US-009-01 |
| **Title** | Verify GET /api/programs/:id Returns Full Program Entity for Edit Pre-fill |
| **Task Type** | Backend API |
| **Platform** | Backend |
| **Priority** | High |
| **UAT Required** | No |
| **Spec Ref** | Tech Spec §3.1 |

**Description:**
Verify that `GET /api/programs/:id` returns the full program entity including nested `groupedPrograms` and `programSessions` arrays. If the endpoint does not include nested data, update the query to eager-load them. The response must include every field present in `CreateProgramDto` so the edit wizard can hydrate its store without a second API call.

**Dependencies:** None

**Acceptance Criteria:**

Functional:
- [ ] `GET /api/programs/:id` returns 200 with the full program entity for a valid ID
- [ ] Response includes `groupedPrograms` array (may be empty) when `isGroupedProgram = true`
- [ ] Response includes `programSessions` array (may be empty) when `hasMultipleSessions = true`
- [ ] Returns 404 for unknown program ID
- [ ] All `CreateProgramDto` fields present in the response (no missing DTO fields)

---

**[TASK-009-01-02] Web — Hydrate Wizard Store from Fetched Program**

| Field | Value |
|---|---|
| **Task ID** | TASK-009-01-02 |
| **Story** | US-009-01 |
| **Title** | Hydrate Wizard Store from GET /api/programs/:id Response |
| **Task Type** | Web UI |
| **Platform** | Web |
| **Priority** | High |
| **UAT Required** | No |
| **Spec Ref** | Tech Spec §2.1, §3.1 |

**Description:**
Build a `hydrateFromProgram(programDto)` action on the wizard store that maps all fields from the GET response into the form state. This action must also derive and set the `programStructure` radio value from `isGroupedProgram` / `hasMultipleSessions`. Call this action before mounting the wizard when in edit mode. The wizard must detect edit mode via a route param (e.g. `/programs/:id/edit`) and bypass the program type selection screen.

**Dependencies:**
```
- BLOCKED-BY: TASK-009-01-01
  Type: BLOCKED-BY
  Reason: Needs the confirmed GET response shape before the hydration mapper can be written.
- BLOCKED-BY: TASK-INFRA-001-01
  Type: BLOCKED-BY
  Reason: Wizard store must exist and expose a hydration action.
```

**Acceptance Criteria:**

Functional:
- [ ] Navigating to `/programs/:id/edit` fetches the program and hydrates the store before wizard mounts
- [ ] All fetched fields appear pre-filled in their respective step forms
- [ ] `programStructure` radio reflects the correct selection derived from `isGroupedProgram` / `hasMultipleSessions`
- [ ] Step visibility engine computes active steps from hydrated state on first render (no flash of empty steps)

---

##### [US-009-02] Submit Program Edit via PATCH

| Field | Value |
|---|---|
| **Story ID** | US-009-02 |
| **Epic** | EPIC-009 |
| **Title** | Submit Edited Program via PATCH Endpoint |
| **Platform Scope** | Web, Backend |
| **Story Points** | 8 |
| **Priority** | High |
| **UAT Required** | Yes |
| **Spec Ref** | Tech Spec §3.1 PATCH /api/programs/:id |

**User Story:**
> As a Program Administrator,
> I want to submit my changes to an existing program,
> So that the program is updated in the system with only my intended modifications.

**Story-Level Dependencies:**
```
- BLOCKED-BY: US-009-01
  Type: BLOCKED-BY
  Reason: Edit submission depends on the pre-fill flow to have the program ID and existing state in context.
```

**Acceptance Criteria:**

Functional:
- [ ] Clicking "Save Changes" on the edit wizard summary screen calls `PATCH /api/programs/:id` with the full current store state
- [ ] `updatedBy` is read from localStorage and included in the payload
- [ ] On 200 success, the administrator is redirected to the program's detail page with a "Program updated" toast
- [ ] On 4xx response, field-level validation errors are mapped back to their originating step; general errors shown as toast
- [ ] On 5xx response, a generic error toast is shown and form data is preserved
- [ ] `isTravelInvolved` is forced to `false` in the payload when `modeOfOperation = ONLINE`
- [ ] Edit wizard summary screen shows a "Save Changes" button instead of "Submit" to disambiguate from create

Non-Functional:
- [ ] PATCH response received within 3s at p95
- [ ] Structured log entry emitted: `{ userId, programId, action: 'PROGRAM_UPDATED', timestamp }`

---

###### Tasks

---

**[TASK-009-02-01] Backend — PATCH /api/programs/:id**

| Field | Value |
|---|---|
| **Task ID** | TASK-009-02-01 |
| **Story** | US-009-02 |
| **Title** | Backend — Implement PATCH /api/programs/:id |
| **Task Type** | Backend API |
| **Platform** | Backend |
| **Priority** | High |
| **UAT Required** | No |
| **Spec Ref** | Tech Spec §3.1 |

**Description:**
Implement `PATCH /api/programs/:id` that accepts the full `CreateProgramDto` (or a partial update DTO). The controller must: (1) read `userId` from the request payload and inject as `updatedBy`; (2) verify the program exists (404 if not); (3) update root Program fields; (4) if `isGroupedProgram = true`, upsert `groupedPrograms` children (insert new, update existing by ID, delete removed); (5) if `hasMultipleSessions = true`, upsert `programSessions` children similarly; (6) enforce `isTravelInvolved = false` if `modeOfOperation = ONLINE`; (7) emit `ProgramUpdated` event after commit; (8) return 200 with updated entity.

**Dependencies:** None

**Acceptance Criteria:**

Functional:
- [ ] Returns 200 with updated program entity on valid payload
- [ ] Returns 404 for unknown program ID
- [ ] Returns 400 with field-level errors on invalid payload
- [ ] `updatedBy` set from request payload `userId`
- [ ] Child GroupedPrograms are upserted (not duplicated) on each PATCH
- [ ] `isTravelInvolved = false` enforced server-side for ONLINE programs

Non-Functional:
- [ ] p95 response time < 3s
- [ ] `{ userId, programId, action: 'PROGRAM_UPDATED', timestamp }` log entry emitted on success

---

**[TASK-009-02-02] Web — Wire Edit Summary and PATCH Submission**

| Field | Value |
|---|---|
| **Task ID** | TASK-009-02-02 |
| **Story** | US-009-02 |
| **Title** | Wire Edit Wizard Summary to PATCH /api/programs/:id |
| **Task Type** | Web UI |
| **Platform** | Web |
| **Priority** | High |
| **UAT Required** | No |
| **Spec Ref** | Tech Spec §2.1, §3.1 |

**Description:**
When the wizard is in edit mode, the summary screen renders a "Save Changes" button instead of "Submit". On click, read `userId` from localStorage, assemble the current store state into the request body, and call `PATCH /api/programs/:id`. Handle 200, 4xx, and 5xx responses as described in the story acceptance criteria. Redirect to program detail page on success.

**Dependencies:**
```
- BLOCKED-BY: TASK-009-01-02
  Type: BLOCKED-BY
  Reason: Edit mode context (program ID) is established by the pre-fill task.
- BLOCKED-BY: TASK-009-02-01
  Type: BLOCKED-BY
  Reason: PATCH endpoint must exist before the client can submit to it.
```

**Acceptance Criteria:**

Functional:
- [ ] "Save Changes" button replaces "Submit" in edit mode
- [ ] Payload includes `userId` sourced from localStorage
- [ ] Successful PATCH redirects to program detail with success toast
- [ ] 4xx errors are mapped to step-level field errors

---

---

## DEPENDENCY MAP

```
EPIC-INFRA-001     ──blocks──►  EPIC-001
EPIC-INFRA-001     ──blocks──►  EPIC-002
EPIC-INFRA-001     ──blocks──►  EPIC-003
EPIC-INFRA-001     ──blocks──►  EPIC-004
EPIC-INFRA-001     ──blocks──►  EPIC-007
EPIC-INFRA-001     ──blocks──►  EPIC-009
TASK-INFRA-001-01  ──blocks──►  TASK-INFRA-001-02
TASK-INFRA-001-01  ──blocks──►  TASK-002-01-01
TASK-INFRA-001-01  ──blocks──►  TASK-009-01-02
TASK-INFRA-001-02  ──blocks──►  TASK-001-01-02
TASK-INFRA-001-02  ──blocks──►  TASK-002-02-01
TASK-INFRA-001-02  ──blocks──►  TASK-004-01-01
TASK-INFRA-001-02  ──blocks──►  TASK-007-01-01
EPIC-002           ──blocks──►  EPIC-004
EPIC-004           ──blocks──►  EPIC-005
EPIC-004           ──blocks──►  EPIC-006
EPIC-002           ──blocks──►  EPIC-007
TASK-002-02-01     ──blocks──►  TASK-004-01-01
EPIC-001           ──blocks──►  EPIC-008
EPIC-002           ──blocks──►  EPIC-008
EPIC-003           ──blocks──►  EPIC-008
EPIC-004           ──blocks──►  EPIC-008
EPIC-005           ──blocks──►  EPIC-008
EPIC-006           ──blocks──►  EPIC-008
EPIC-007           ──blocks──►  EPIC-008
TASK-008-01-01     ──blocks──►  TASK-008-01-02
EPIC-008           ──blocks──►  EPIC-009
US-009-01          ──blocks──►  US-009-02
TASK-009-01-01     ──blocks──►  TASK-009-01-02
TASK-009-01-02     ──blocks──►  TASK-009-02-02
TASK-009-02-01     ──blocks──►  TASK-009-02-02
```

---

## STORY POINTS SUMMARY

| ID | Title | Type | Story Points | Priority |
|---|---|---|---|---|
| EPIC-INFRA-001 | Wizard State Management & Step Visibility Engine | Infrastructure Epic | — | — |
| TASK-INFRA-001-01 | Set Up Wizard Form State Store | Infrastructure Task | 3 | Critical |
| TASK-INFRA-001-02 | Implement Step Visibility Engine | Infrastructure Task | 5 | Critical |
| TASK-INFRA-001-03 | Add New Field Types to DynamicFieldRenderer | Infrastructure Task | 3 | High |
| TASK-INFRA-001-04 | Build CreatableSelectField and ImageUploadField Common Components | Infrastructure Task | 3 | High |
| EPIC-001 | Program Type Entry Point — Custom Selection | Product Epic | — | — |
| US-001-01 | Select Custom Program Type and Enter Wizard | Story | 3 | Critical |
| EPIC-002 | Step 1 & 2 — Basic Info and Program Mode | Product Epic | — | — |
| US-002-01 | Enter Basic Program Information | Story | 5 | Critical |
| US-002-02 | Configure Program Mode and Structure | Story | 8 | Critical |
| EPIC-003 | Steps 3–6 — Schedule, Venue, Registration, Seats | Product Epic | — | — |
| US-003-01 | Configure Schedule and Dates | Story | 5 | High |
| US-003-02 | Configure Venue and Location | Story | 3 | Medium |
| US-003-03 | Configure Registration Rules | Story | 5 | High |
| US-003-04 | Configure Seats and Waitlist | Story | 5 | High |
| EPIC-004 | Step 7 — Stage Flags | Product Epic | — | — |
| US-004-01 | Configure Stage Flags with Travel Auto-Disable | Story | 8 | Critical |
| EPIC-005 | Steps 8–10 — Payment, Invoice, Email | Product Epic | — | — |
| US-005-01 | Configure Payment Pricing and Tax | Story | 8 | High |
| US-005-02 | Configure Invoice Sender Details | Story | 3 | High |
| US-005-03 | Configure Email and Communication Settings | Story | 3 | Medium |
| EPIC-006 | Steps 11–12 — Checkin/Checkout and Residence | Product Epic | — | — |
| US-006-01 | Configure Checkin and Checkout Dates | Story | 3 | Medium |
| US-006-02 | Configure Residence Bed Count | Story | 2 | Low |
| EPIC-007 | Steps 13–14 — Grouped Sub-Programs and Sessions | Product Epic | — | — |
| US-007-01 | Add and Configure Grouped Sub-Programs | Story | 13 | High |
| US-007-02 | Add Program Sessions | Story | 8 | High |
| EPIC-008 | Step 15, Submission, and Draft Save | Product Epic | — | — |
| US-008-01 | Complete Wizard and Submit Program | Story | 13 | Critical |
| US-008-02 | Save Draft at Any Wizard Step | Story | 5 | High |
| EPIC-009 | Program Edit Flow — Pre-fill and PATCH Submission | Product Epic | — | — |
| US-009-01 | Pre-fill Program Edit Wizard from Existing Program | Story | 8 | High |
| US-009-02 | Submit Edited Program via PATCH Endpoint | Story | 8 | High |
| **Total** | | | **158** | |

---

## INFORMATION GAPS LOG

| Gap | What Is Needed | Status |
|---|---|---|
| Custom type `typeId` database value | Backend team must confirm the seeded ID for the Custom program type before E2E testing | Pending |
| `CreateProgramSessionDto` final shape | Session module team must finalize the DTO shape before Step 14 form can be built | Pending |
| Max size for `meta` JSON field | Product must decide the byte/character limit; backend must add validation | Pending |
| Clear-on-toggle-off behavior for payment fields | Product decision on whether toggling off Payment clears pricing/tax values in the store | Pending |
| Minimum value for `totalSeats` when limited seats enabled | Product must confirm if 0 is a valid seat cap or if minimum is 1 | Pending |
