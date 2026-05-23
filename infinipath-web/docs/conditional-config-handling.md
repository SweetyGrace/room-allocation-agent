# Conditional Config Handling in FormBuilderEdit

This document outlines the plan and implementation for handling conditional configurations in the FormBuilderEdit component. Conditional configs allow sections and questions to be shown or hidden based on program data, ensuring only valid elements are saved.

## Overview

The FormBuilderEdit component needs to:
- Validate section and question conditional configs against program data
- Filter save payloads to exclude unmet sections/questions
- Sanitize question dependencies to remove invalid references

## Implementation Plan

### 1. Add Helper Functions for Conditional Validation

Create utility functions to handle conditional logic:

- `validateSectionConditionalConfig(sectionConfig, programData)`: Evaluates if a section's conditionalConfig is met based on program data. Returns true if the section should be included.

- `validateQuestionConditionalConfig(questionConfig, programData)`: Evaluates if a question's conditionalConfig is met. Returns true if the question should be included.

- `sanitizeQuestionDependencies(questionConfig, programData)`: Removes any invalid `dependsOn` entries that reference questions not present in the current program data.

### 2. Modify fetchTemplateData to Preserve Conditional Config

In the `fetchTemplateData` function:
- When loading template data, ensure `conditionalConfig` for sections and questions is preserved in the component state.
- Add validation logic to check each section/question against the loaded program data.
- Mark sections/questions as valid or invalid based on conditional config evaluation.

### 3. Update Save Payload Builders

In `prepareTemplateSavePayload` and `preparePatchPayload`:
- Before building the payload, filter out sections and questions that do not meet their `conditionalConfig`.
- Only include valid sections/questions in the final save payload to prevent saving invalid configurations.

### 4. Update UI to Reflect Conditional State

In the component render logic:
- Conditionally render sections and questions based on their validation status.
- Use the validation results to show/hide elements dynamically.
- Provide visual indicators if needed for conditional states.

### 5. Test the Implementation

- Test with various program data scenarios to ensure sections/questions are correctly filtered.
- Verify that save payloads only include valid elements.
- Check that question dependencies are properly sanitized.

## Example Conditional Config Structure

Conditional configs are arrays of conditions that must all be met for the section or question to be shown. Each condition checks a `metaKey` in the program data against a `value` using an `operator`.

```json
{
  "conditionalConfig": [
    {
      "value": [true],
      "metaKey": "requiresPayment",
      "operator": "equals"
    }
  ]
}
```

This would show the section/question only if the program's `requiresPayment` meta key equals `true`.

## Sample Section and Question Data

Below are examples of sections with conditional configs and questions with dependencies and conditional configs.

### Section Example: Payment & Invoice (Conditional)

```json
{
  "id": "59",
  "programTemplateId": "17",
  "masterFormSectionId": "2",
  "sectionKey": "FS_PAYMENTINVOICE",
  "name": "Payment & Invoice",
  "description": "Section for invoice information",
  "parentSectionId": null,
  "conditionalConfig": [
    {
      "value": [true],
      "metaKey": "requiresPayment",
      "operator": "equals"
    }
  ],
  "displayOrder": 3,
  "createdAt": "2026-05-07T10:44:43.644Z",
  "updatedAt": null,
  "deletedAt": null,
  "createdBy": -2,
  "updatedBy": -2,
  "questions": [
    {
      "id": "1182",
      "templateFormSectionId": "59",
      "masterQuestionId": "5",
      "questionCode": "Q_0000001558",
      "bindingKey": "existingProformaInvoice",
      "questionText": "Use existing details as per pro-forma invoice",
      "questionType": "radio",
      "answerType": "string",
      "answerLocation": null,
      "optionConfig": [
        {
          "name": "yes",
          "type": "string",
          "order": 0,
          "value": "yes"
        },
        {
          "name": "no",
          "type": "string",
          "order": 1,
          "value": "no"
        }
      ],
      "config": {
        "isRequired": true
      },
      "conditionalConfig": null,
      "displayOrder": 0,
      "createdAt": "2026-05-07T10:44:43.644Z",
      "updatedAt": "2026-05-07T10:44:43.644Z"
    }
  ]
}
```

### Section Example: Basic Details (No Conditional)

```json
{
  "id": "62",
  "programTemplateId": "17",
  "masterFormSectionId": "1",
  "sectionKey": "FS_BASICDETAILS",
  "name": "Basic Details",
  "description": "Section for basic user details",
  "parentSectionId": null,
  "conditionalConfig": null,
  "displayOrder": 1,
  "createdAt": "2026-05-07T10:44:43.644Z",
  "updatedAt": null,
  "deletedAt": null,
  "createdBy": -2,
  "updatedBy": -2,
  "questions": [
    {
      "id": "1261",
      "templateFormSectionId": "62",
      "masterQuestionId": "124",
      "questionCode": "Q_0000001671",
      "bindingKey": "registrationForWhom",
      "questionText": "Who are you registering for?",
      "questionType": "radio",
      "answerType": "string",
      "answerLocation": "hdb_program_registration.registration_for_whom",
      "optionConfig": [
        {
          "name": "Register for Myself",
          "type": "default",
          "order": 0,
          "value": "Register for Myself"
        },
        {
          "name": "Register for Other",
          "type": "default",
          "order": 1,
          "value": "Register for Other"
        }
      ],
      "config": {
        "isRequired": true
      },
      "conditionalConfig": [
        {
          "value": [true],
          "metaKey": "allowsProxyRegistration",
          "operator": "equals"
        }
      ],
      "displayOrder": 0,
      "createdAt": "2026-05-07T10:44:43.644Z",
      "updatedAt": "2026-05-07T10:44:43.644Z"
    }
  ]
}
```

Note: The full section data includes many more questions with `dependsOn` configurations for conditional visibility based on other question answers.

## Dependencies

- Program data must be loaded and available for validation.
- Conditional config structure should be standardized across sections and questions.
- UI updates should be reactive to program data changes.