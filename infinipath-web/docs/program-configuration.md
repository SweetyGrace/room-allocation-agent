# Program Configuration & Form Builder Documentation

## Table of Contents
1. [Program Configuration (Add Program Page)](#1-program-configuration)
2. [Form Builder (FormBuilderEdit)](#2-form-builder)

---

## 1. Program Configuration

The Add Program page is a multi-step form used to create or edit a program. The fields and sections available depend on the **program type** selected.

### 1.1 Basic Program Details

| Field | Type | Required | Description |
|---|---|---|---|
| Program Name | Text | Yes | Auto-generated based on program type (e.g., `HDB 2026`). Editable. |
| Program Code | Text | Yes | Short unique identifier. Auto-generated and editable. |
| Description | Text | No | Free-text description of the program. |
| Banner Image | File Upload | Yes | Image displayed as the program banner. Supports static images (JPG/PNG). |
| Mode of Program | Dropdown | Yes | How the program is conducted: `Online`, `Offline`, or `Hybrid`. |

---

### 1.2 Program Dates

| Field | Required | Validation |
|---|---|---|
| Start Date | Yes | Cannot be empty. |
| End Date | Yes | Must be on or after Start Date. |
| Registration Start Date | Yes | Must be before the Program Start Date. |
| Registration Start Time | Yes | Required when Registration Start Date is set. |
| Registration End Date | Yes | Must be on or after Registration Start Date. |
| Registration End Time | Yes | If on the same day as Registration Start, must be after Registration Start Time. |

---

### 1.3 Payment Configuration

Shown only when the program type **requires payment**.

| Field | Type | Description |
|---|---|---|
| Is Payment Required | Yes/No toggle | Whether participants must pay. |
| Currency | Dropdown | Currently supports `INR`. |
| GST Percentage | Number | Combined GST rate. |
| HDB Fee | Number | Fee specific to HDB-type programs. |
| MSD Fee | Number | Fee specific to MSD-type programs. |

---

### 1.4 Capacity & Waitlist

Shown based on program type configuration.

| Field | Type | Description |
|---|---|---|
| Has Seat Limit | Yes/No | Whether the program has a maximum capacity. |
| Total Seats | Number | Maximum number of registrations. Capped by the program type's `maxCapacity`. |
| Has Waitlist | Yes/No | Whether a waiting list is enabled. |
| Waitlist Trigger Count | Number | Number of seats remaining when waitlist opens. Must be ≤ Total Seats. |
| Approval Required | Yes/No | Whether admin approval is needed before confirming registration. |

---

### 1.5 Venue Configuration

Shown for `Offline` or `Hybrid` programs.

| Field | Description |
|---|---|
| Venue Address | One or more venue locations. Pre-configured venues are available as dropdown options. A custom venue can also be entered via a modal. |

---

### 1.6 Tax & Compliance

These fields are used for invoice generation.

| Field | Validation | Description |
|---|---|---|
| TDS Limit | 0–100, required | Tax Deducted at Source percentage. |
| CGST Limit | 0–100, required | Central GST percentage. |
| SGST Limit | 0–100, required | State GST percentage. |
| IGST Limit | 0–100, required | Integrated GST percentage. |
| TDS Applicable To | Required | Specifies who TDS applies to. |

---

### 1.7 Invoice / Organisation Details

| Field | Validation | Description |
|---|---|---|
| Name in Invoice | Required | Organisation name that appears on invoices. |
| Address | Required | Registered address for invoices. |
| PAN | Required, 10 chars, format `ABCDE1234F` | Permanent Account Number. |
| GSTIN | Required, 15 chars | GST Identification Number. |
| CIN | Required, 21 chars | Company Identification Number. |

---

### 1.8 Email Configuration

| Field | Validation | Description |
|---|---|---|
| Email Sender Name | Min 3 chars, required | Name shown in the "From" field of emails. |
| Email Sender Address | Valid email, required | Email address used to send program emails. |
| Email BCC Name | Min 3 chars, optional | Name for BCC recipient on emails. |
| Email BCC Address | Valid email, optional | BCC email address. |
| Venue Name in Email | Min 3 chars, required | Venue name shown in email communications. |
| Helpline Number | Required | Support contact number displayed in emails. |

---

### 1.9 Age Restrictions

| Field | Validation | Description |
|---|---|---|
| Child Minimum Age | ≥ 0 | Minimum age for child participants. |
| Elder Maximum Age | 18–150 | Maximum age for elder participants. |

---

### 1.10 Sub-Programs / Sessions

Shown for program types that have **multiple sessions** (e.g., HDB, TAT, Entrainment).

Sub-programs represent individual sessions within a program. They are automatically generated based on the program type's `noOfSession` value and the program date range.

Each sub-program / session has the following fields:

| Field | Required | Description |
|---|---|---|
| Session Name / Title | Yes | Name of the session (e.g., `Sub Program 1`, `Session 1`). |
| Description | No | Session description. |
| Mode of Operation | Yes | `Online`, `Offline`, or `Hybrid`. |
| Venue Address | Yes (for Offline/Hybrid) | Venue for this specific session. |
| Program Start Date | Yes | Must be within the main program's date range. |
| Program Start Time | Yes | Must be after the previous session's end time (if on the same day). |
| Program End Date | Yes | Must be within the main program's date range. |
| Program End Time | Yes | Must be after Program Start Time (if same day). |
| Session Type | Yes | Type classification of the session. |
| Session Price | Yes, ≥ 0 | Price for this session. |
| Seat Limit | Conditional | Required when Has Seat Limit = Yes. |
| Waitlist Trigger Count | Conditional | Required when Has Waitlist = Yes. |

**Check-in / Check-out** (Offline and Hybrid only):

| Field | Validation |
|---|---|
| Check-in Start Date | Required; must be before Program End Date. |
| Check-in Start Time | Required. |
| Check-in End Date | Required; must be after Check-in Start Date and before Program End Date. |
| Check-in End Time | Required; must be after Check-in Start Time (same day). |
| Check-out Start Date | Required; must be on or after Program End Date. |
| Check-out Start Time | Required; must be after Program End Time (same day). |
| Check-out End Date | Required; must be after Check-out Start Date and Program End Date. |
| Check-out End Time | Required; must be after Check-out Start Time (same day). |

---

---

## 2. Form Builder

The **Form Builder** (`FormBuilderEdit`) allows administrators to customise the registration form for a program. Forms are structured as **Sections > Sub-sections > Questions (Fields)**.

---

### 2.1 Structure Overview

```
Program Registration Form
├── Section 1
│   ├── Question A
│   ├── Sub-section 1
│   │   ├── Question B
│   │   └── Question C
│   └── Question D
└── Section 2
    └── Question E
```

- A form contains one or more **Sections**.
- Each section can contain **Questions** and **Sub-sections**.
- Each sub-section contains its own **Questions**.
- Questions and sub-sections within a section can be **reordered** using up/down controls.

---

### 2.2 Section Management

| Action | Description |
|---|---|
| Add Section | Creates a new empty section at the bottom of the form. |
| Rename Section | Click the section name to edit it inline. |
| Collapse / Expand | Toggle the section's visibility using the chevron icon. |
| Add Field | Adds a new text field at the bottom of the section. |
| Add Sub-section | Opens a modal to create a named sub-section within the section. |

---

### 2.3 Sub-section Management

| Action | Description |
|---|---|
| Create Sub-section | Enter a sub-section name in the modal and confirm. |
| Add Field to Sub-section | Adds a new field inside the sub-section. |
| Delete Sub-section | Removes the sub-section. Questions inside are moved out to the parent section automatically. |
| Move Sub-section Up / Down | Reorders the sub-section within the parent section. |
| Move Question into Sub-section | A question can be dragged/moved into an existing sub-section. |
| Move Question out of Sub-section | Moves a question back to the parent section. |

---

### 2.4 Field Types

Each question can be set to one of the following field types:

| Type | Label | Description |
|---|---|---|
| `text` | Text Field | Single-line text input. |
| `textarea` | Paragraph | Multi-line text input. |
| `number` | Number Field | Accepts numeric values. |
| `email` | Email Field | Input validated as an email address. |
| `tel` | Phone Number | Telephone number input. |
| `date` | Date Field | Date picker. |
| `time` | Time Field | Time picker. |
| `year` | Year Field | Year-only picker. |
| `yearRange` | Year Range Field | A range of two years. |
| `dateandtime` | Date & Time Field | Combined date and time picker. |
| `select` | Dropdown | Single-select dropdown with predefined options. |
| `radio` | Radio Button | Single selection from visible options. |
| `checkbox` | Checkbox | Multiple selections from a list. |
| `boolean` | Yes / No | Simple Yes or No toggle. |
| `file` | File Upload | Allows file attachment by the registrant. |
| `Address` | Address Field | Structured address input. |
| `draganddrop` | Preference | Drag-and-drop ranking/ordering field. |
| `multiQuestion` | Multiple Questions | A group of sub-questions rendered together. |
| `button` | Button | A clickable button element. |
| `apicall` | API Call Field | Field that triggers an API call for data population. |

---

### 2.5 Common Field Settings

Every field has these base settings regardless of type:

| Setting | Description |
|---|---|
| Label | The question text displayed to the registrant. |
| Field Type | The input type (see table above). |
| Required | Toggle to mark the field as mandatory. |
| Placeholder | Hint text shown inside the input (not available for radio, checkbox, date, file, boolean, select, etc.). |

---

### 2.6 Field Validations

Validations are unlocked per field by enabling the **Advanced Validation** toggle.

#### Text Field (`text`)

| Validation | Description |
|---|---|
| Minimum Characters | Minimum number of characters required. |
| Maximum Characters | Maximum number of characters allowed. |
| Validation Pattern | Regex pattern the input must match (e.g., `^[A-Za-z]+$` for letters only). |
| Pattern Error Message | Custom error shown when the pattern is not matched. |
| Helper Text | Hint displayed below the field (e.g., "roommate preference not guaranteed"). |

#### Paragraph / Textarea (`textarea`)

| Validation | Description |
|---|---|
| Minimum Characters | Minimum number of characters required. |
| Maximum Characters | Maximum number of characters allowed. |
| Validation Pattern | Regex pattern. |
| Pattern Error Message | Custom error message. |

#### Number Field (`number`)

| Validation | Description |
|---|---|
| Minimum Value | Lowest accepted value. |
| Maximum Value | Highest accepted value. |
| Allow Decimals | Toggle to permit decimal (floating-point) numbers. |

#### Email Field (`email`)

| Validation | Description |
|---|---|
| Maximum Characters | Maximum length of the email address. |
| Email Pattern | Regex pattern for email validation. Defaults to standard email format. |

#### File Upload (`file`)

| Validation | Description |
|---|---|
| Maximum File Size | Maximum allowed file size (in MB or KB). |
| Allowed File Types | Restrict uploads to: `Images`, `Videos`, or `Profile` photos. |

#### Date Field (`date`)

Date fields support a dedicated **Date Validation Type** setting:

| Validation Type | Description |
|---|---|
| No Restrictions | Any date can be selected. |
| Fixed Date Range | Restrict selection to a static from–to date range. |
| Relative Date Range | Restrict based on a date calculated relative to a program reference date. |
| Custom Relative Date | Advanced custom date offset using a reference date + time unit (Days / Months / Years) + operator. |

**Date Reference Fields** (for relative/custom types):

| Reference | Description |
|---|---|
| Registration Start Date | Date registration opens. |
| Registration End Date | Date registration closes. |
| Program Start Date | The program's start date. |
| Program End Date | The program's end date. |
| Elder Max Age | Maximum age boundary for elder participants. |
| Child Min Age | Minimum age boundary for child participants. |

**Operators** (for custom date/number conditions):

`Equals`, `Less Than`, `Greater Than`, `Less Than or Equal`, `Greater Than or Equal`, `Range`

#### Radio / Checkbox / Dropdown (`radio`, `checkbox`, `select`)

| Setting | Description |
|---|---|
| Options | Comma-separated list of choices (e.g., `Option1,Option2,Option3`). |

---

### 2.7 Conditional Logic (Depends On)

Every field can be configured to conditionally react based on the value of **another field**. Multiple conditions can be added.

**Condition Actions:**

| Action | Description |
|---|---|
| Show | Display this field only when the condition is met. |
| Hide | Hide this field when the condition is met. |
| Enable | Enable (un-disable) this field when the condition is met. |
| Disable | Disable this field when the condition is met. |
| Prefill | Automatically fill this field's value from another field's answer. |

**Condition Configuration:**

| Setting | Description |
|---|---|
| Depends On Field | The field whose answer triggers this condition. |
| Condition Type | The action to perform (Show / Hide / Enable / Disable / Prefill). |
| Value | The answer value of the trigger field that activates the condition. For radio/checkbox/select, multiple values can be selected. For number fields, an operator (e.g., Greater Than) can be applied. |
| Prefill Source Field | When action is `Prefill`, specifies which field's answer to copy. |

**Date-field specific condition types:**

| Type | Description |
|---|---|
| Custom | Match a specific custom date value. |
| Past | Trigger when the date is in the past. |
| Future | Trigger when the date is in the future. |
| Today | Trigger when the date equals today. |

---

### 2.8 Field Ordering

- Fields within a section or sub-section can be moved **up** or **down** using arrow controls on each field.
- Sub-sections themselves can also be reordered within a section.
- Display order is saved and persisted when the form is submitted.

---

### 2.9 Column Layout

The form builder supports a **1-column** or **2-column** layout for field display. This controls how fields are rendered side-by-side in the registration form preview.

---

### 2.10 Saving Changes

- The form builder auto-detects whether the program is being **created** (clones from a template) or **edited** (patches existing questions).
- Only **changed**, **added**, or **deleted** questions are included in the save payload — unchanged template questions are referenced by ID.
- Deleted questions are tracked per section and sent in the payload on save.
- Deleted sub-sections release their questions back to the parent section before being removed.

---

### 2.11 Navigation

| Button | Action |
|---|---|
| Back | Returns to the Add Program page with the program in edit context. |
| Continue | Saves all form changes and proceeds to the next step in the program setup stepper. |


### What not working currently

- We did not implemented any functionality for Hybrid option while creating program
- We are unable to select file upload options like Images, Profile and Video