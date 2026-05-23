# Program Code Uniqueness — Frontend Tasks

---

## Context

Program Code is a user-editable field on the Add/Edit Program page.
It is auto-generated as `TYPE_YEAR` (e.g. `HDB_2026`) and currently only validated as required — no format or uniqueness check exists.

**Backend endpoint is already available:**

```http
GET /program/check-code?code=HDB_2026
GET /program/check-code?code=HDB_2026&excludeId=<programId>   ← use in edit mode
```

Response:

```json
{ "available": true }
{ "available": false }
```

**Goal:** Enforce format + check availability on blur (GitHub-style inline feedback). Skip the check in edit mode if the code hasn't changed.

---

## Task 1 — Constants, Endpoint & Format Validation

**Files:**

- `src/constants/urlConstants.ts`
- `src/constants/textConstants.ts`
- `src/pages/pages/AddProgramPage.tsx` — `createProgramSchema` (~line 85)

**1a. Add endpoint helper** inside the `endPoints` object in `urlConstants.ts`:

```ts
programCodeCheck: (code: string, excludeId?: string) =>
  `program/check-code?code=${encodeURIComponent(code)}${excludeId ? `&excludeId=${excludeId}` : ''}`,
```

**1b. Add text constants** inside `ADD_PROGRAM_PAGE_TEXT.VALIDATION` in `textConstants.ts`:

```ts
PROGRAM_CODE_TAKEN: "This program code is already in use",
PROGRAM_CODE_FORMAT: "Only uppercase letters, numbers, and underscores allowed. Cannot start or end with underscore.",
PROGRAM_CODE_MIN: "Program code must be at least 3 characters",
PROGRAM_CODE_MAX: "Program code must be 30 characters or less",
PROGRAM_CODE_CHECKING: "Checking availability...",
PROGRAM_CODE_AVAILABLE: "This code is available",
```

**1c. Update Yup schema** — replace the existing `programCode` rule:

```ts
programCode: yup
  .string()
  .required(ADD_PROGRAM_PAGE_TEXT.VALIDATION.PROGRAM_CODE_REQUIRED)
  .min(3, ADD_PROGRAM_PAGE_TEXT.VALIDATION.PROGRAM_CODE_MIN)
  .max(30, ADD_PROGRAM_PAGE_TEXT.VALIDATION.PROGRAM_CODE_MAX)
  .matches(
    /^[A-Z0-9][A-Z0-9_]*[A-Z0-9]$|^[A-Z0-9]{1}$/,
    ADD_PROGRAM_PAGE_TEXT.VALIDATION.PROGRAM_CODE_FORMAT
  ),
```

---

## Task 2 — Availability Check Logic

**File:** `src/pages/pages/AddProgramPage.tsx`

**2a. Add state** near other `useState` declarations (~line 551):

```ts
const [isCheckingCode, setIsCheckingCode] = useState(false);
const [codeAvailable, setCodeAvailable] = useState<boolean | null>(null);
```

**2b. Add check function** inside the component:

```ts
const checkProgramCodeAvailability = async (code: string) => {
  const trimmed = code.trim().toUpperCase();
  const formatRegex = /^[A-Z0-9][A-Z0-9_]*[A-Z0-9]$|^[A-Z0-9]{1}$/;

  if (!trimmed || !formatRegex.test(trimmed)) return; // yup handles format errors

  // Skip in edit mode if code hasn't changed
  if (isEditMode && trimmed === existingProgramData?.code?.trim().toUpperCase()) {
    setCodeAvailable(true);
    return;
  }

  setIsCheckingCode(true);
  setCodeAvailable(null);

  try {
    const excludeId = isEditMode ? existingProgramData?.id : undefined;
    const response = await getCall(
      endPoints.programCodeCheck(trimmed, excludeId),
      undefined,
      PORTAL
    );

    if (response?.data?.available === false) {
      setCodeAvailable(false);
      setError(FORM_FIELD_NAMES.PROGRAM_CODE, {
        message: ADD_PROGRAM_PAGE_TEXT.VALIDATION.PROGRAM_CODE_TAKEN,
      });
    } else {
      setCodeAvailable(true);
      clearErrors(FORM_FIELD_NAMES.PROGRAM_CODE);
    }
  } catch {
    setCodeAvailable(null); // silently fail — don't block the user
  } finally {
    setIsCheckingCode(false);
  }
};
```

**2c. Pre-set on edit mode load** — in `fetchProgramDetails`, after `setExistingProgramData(programData)`:

```ts
setCodeAvailable(true);
```

**2d. Submit guard** — at the top of the submit handler, before building the payload:

```ts
if (codeAvailable === false) {
  setError(FORM_FIELD_NAMES.PROGRAM_CODE, {
    message: ADD_PROGRAM_PAGE_TEXT.VALIDATION.PROGRAM_CODE_TAKEN,
  });
  return;
}
```

**2e. Pass props** to `<ProgramDetailsForm>` where it is rendered:

```tsx
<ProgramDetailsForm
  {...existingProps}
  isCheckingCode={isCheckingCode}
  codeAvailable={codeAvailable}
  onProgramCodeBlur={() => checkProgramCodeAvailability(getValues(FORM_FIELD_NAMES.PROGRAM_CODE))}
  onProgramCodeChange={() => setCodeAvailable(null)}
/>
```

---

## Task 3 — Input Wiring & Inline UI Feedback

**File:** `src/components/components/ProgramDetailsForm/index.tsx` + its styles module

**3a. Accept new props** from parent:

```ts
onProgramCodeBlur: () => void;
onProgramCodeChange: () => void;
isCheckingCode: boolean;
codeAvailable: boolean | null;
```

**3b. Update the `programCode` Controller render** (~line 230) — add `onChange` and `onBlur`:

```tsx
render={({ field }) => (
  <input
    {...field}
    type="text"
    placeholder={generateProgramCodePlaceholder(watch("programName") || "")}
    className={`${styles.inputFieldtitle} ${errors.programCode ? styles.inputError : ""}`}
    disabled={shouldDisableField(...)}
    onChange={(e) => {
      const formatted = e.target.value.toUpperCase().replace(/\s+/g, '_');
      field.onChange(formatted);
      onProgramCodeChange(); // clears previous availability result
    }}
    onBlur={onProgramCodeBlur}
  />
)}
```

**3c. Replace the error span** below the input with the full availability indicator:

```tsx
{isCheckingCode && (
  <span className={styles.codeChecking}>
    {ADD_PROGRAM_PAGE_TEXT.VALIDATION.PROGRAM_CODE_CHECKING}
  </span>
)}
{!isCheckingCode && codeAvailable === true && !errors.programCode && (
  <span className={styles.codeAvailable}>
    ✓ {ADD_PROGRAM_PAGE_TEXT.VALIDATION.PROGRAM_CODE_AVAILABLE}
  </span>
)}
{!isCheckingCode && codeAvailable === false && !errors.programCode && (
  <span className={styles.codeUnavailable}>
    ✗ {ADD_PROGRAM_PAGE_TEXT.VALIDATION.PROGRAM_CODE_TAKEN}
  </span>
)}
{errors.programCode && (
  <span className={styles.errorText}>{errors.programCode.message}</span>
)}
```

**3d. Add CSS classes** to the styles module:

```css
.codeChecking {
  font-size: 12px;
  color: #888;
}

.codeAvailable {
  font-size: 12px;
  color: #2e7d32;
}

.codeUnavailable {
  font-size: 12px;
  color: #c62828;
}
```

---

## Files to Touch

| File | What changes |
|---|---|
| `src/constants/urlConstants.ts` | `programCodeCheck` endpoint helper |
| `src/constants/textConstants.ts` | 6 new text constants |
| `src/pages/pages/AddProgramPage.tsx` | Schema rule, state, check function, submit guard, props passed down, edit mode pre-set |
| `src/components/components/ProgramDetailsForm/index.tsx` | New props, onChange/onBlur, inline availability UI |
| `ProgramDetailsForm` styles module | 3 new CSS classes |
