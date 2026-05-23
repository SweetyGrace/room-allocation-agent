# Prefill Configuration Documentation

## Overview

This document outlines the prefill configuration structure for form questions in the FormBuilderEdit component. Prefill allows questions to be automatically populated based on various conditions and sources.

## Overall Question Config Structure

```json
{
  "config": {
    "dependsOn": [
      {
        "questionBindingKey": "registrationForWhom",
        "value": [
          "Register for Myself",
          "Register for Other"
        ]
      },
      {
        "type": "disable",
        "questionBindingKey": "registerForWhom",
        "value": [
          "selfRegister"
        ]
      },
      {
        "type": "disable",
        "questionBindingKey": "phoneNumberType",
        "value": [
          "Family member's number"
        ]
      },
      {
        "type": "transform",
        "questionBindingKey": "dob",
        "transformedMinValue": "childMaxAge",
        "transformedMaxValue": "elderMinAge"
      }
    ],

    "prefill": {
      "prefillType": "static",
      "prefillValue": "Other",
      "prefillIf": [
        {
          "questionBindingKey": "countryName",
          "operator": "not_equals",
          "value": [
            "INDIA"
          ]
        },
        {
          "questionBindingKey": "registerForWhom",
          "operator": "equals",
          "value": [
            "selfRegister"
          ]
        }
      ]
    },

    "validation": {
      "isRequired": true,
      "minCharacter": 2,
      "maxCharacters": 50,
      "validationPattern": "^[a-zA-Z\\\\s&.'-]+$",
      "isAdvancedValidation": true
    },

    "fileConfig": {
      "type": "profile",
      "accepts": [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
      ]
    },

    "apiConfig": {
      "type": "select",
      "apiUrl": "lookup-data/all",
      "category": "COUNTRY"
    },

    "showDialog": {
      "type": "popup",
      "isShow": "no",
      "contentType": "text",
      "dialogueContent": "If you do not provide your GSTIN, this transaction will be filed under \"unregistered\" category in our GST return."
    }
  }
}
```

## Prefill Configuration Combinations

### 1. Basic Field Dependent Prefill

```json
{
  "prefill": {
    "prefillType": "fieldDependent",
    "prefillFrom": 1203,
    "prefillFromBindingKey": "proFormaIsGstRegistered"
  }
}
```

### 2. Field Dependent Prefill With Condition

```json
{
  "prefill": {
    "prefillIf": [
      {
        "value": "yes",
        "questionId": 1084,
        "questionBindingKey": "existingProformaInvoice"
      }
    ],
    "prefillFrom": 1085,
    "prefillType": "fieldDependent",
    "prefillFromBindingKey": "pro_forma_invoice_name"
  }
}
```

### 3. Field Dependent Prefill With DependsOn

```json
{
  "prefill": {
    "prefillIf": [
      {
        "value": "yes",
        "questionId": 1084,
        "questionBindingKey": "existingProformaInvoice"
      }
    ],
    "prefillFrom": 1205,
    "prefillType": "fieldDependent",
    "prefillFromBindingKey": "proFormaZip"
  },
  "dependsOn": [
    {
      "value": "yes",
      "questionId": 340,
      "questionBindingKey": "isGstRegistered"
    }
  ]
}
```

### 4. Static Prefill

```json
{
  "prefill": {
    "prefillType": "static",
    "prefillValue": "Other"
  }
}
```

### 5. Static Prefill With Condition

```json
{
  "prefill": {
    "prefillIf": [
      {
        "value": "INDIA",
        "operator": "not_equals",
        "questionId": 1194,
        "questionBindingKey": "countryName"
      }
    ],
    "prefillType": "static",
    "prefillValue": "Other"
  }
}
```

### 6. Static Prefill With Multiple DependsOn

```json
{
  "prefill": {
    "prefillIf": [
      {
        "value": "yes",
        "operator": "equals",
        "questionId": 1090,
        "questionBindingKey": "internationalId"
      }
    ],
    "prefillType": "static",
    "prefillValue": "Passport"
  },
  "dependsOn": [
    {
      "value": "yes",
      "questionId": 1090,
      "questionBindingKey": "internationalId"
    },
    {
      "value": "no",
      "questionId": 1090,
      "questionBindingKey": "internationalId"
    }
  ]
}
```

### 7. Program Dependent Date Prefill

```json
{
  "prefill": {
    "prefillType": "programDependent",
    "prefillDateFrom": "startsAt"
  }
}
```

### 8. Program Dependent End Date Prefill

```json
{
  "prefill": {
    "prefillType": "programDependent",
    "prefillDateFrom": "endsAt"
  }
}
```

### 9. Field Dependent Prefill With addToPrefill

```json
{
  "prefill": {
    "prefillFrom": 354,
    "prefillType": "fieldDependent",
    "addToPrefill": "-",
    "prefillFromBindingKey": "airlineNameOnward"
  }
}
```

### 10. Empty Field Dependent Prefill Placeholder

```json
{
  "prefill": {
    "prefillType": "fieldDependent"
  }
}
```

## Suggested Unified Prefill Formats

### A. Recommended Generic Structure

```json
{
  "prefill": {
    "prefillType": "fieldDependent | static | programDependent",
    "prefillIf": [
      {
        "questionId": 0,
        "questionBindingKey": "bindingKey",
        "operator": "equals",
        "value": "yes"
      }
    ],
    "prefillFrom": 0,
    "prefillFromBindingKey": "sourceField",
    "prefillValue": "staticValue",
    "prefillDateFrom": "startsAt",
    "addToPrefill": "-"
  }
}
```

## Prefill Type Matrix

| Prefill Type     | Required Keys                | Optional Keys                                  |
| ---------------- | ---------------------------- | ---------------------------------------------- |
| fieldDependent   | prefillType, prefillFrom     | prefillIf, prefillFromBindingKey, addToPrefill |
| static           | prefillType, prefillValue    | prefillIf                                      |
| programDependent | prefillType, prefillDateFrom | prefillIf                                      |

## Common Prefill + DependsOn Combination

```json
{
  "prefill": {
    "prefillType": "fieldDependent",
    "prefillIf": [
      {
        "questionId": 1084,
        "questionBindingKey": "existingProformaInvoice",
        "operator": "equals",
        "value": "yes"
      }
    ],
    "prefillFrom": 1204,
    "prefillFromBindingKey": "proFormaGstNumber"
  },
  "dependsOn": [
    {
      "questionId": 340,
      "questionBindingKey": "isGstRegistered",
      "operator": "equals",
      "value": "yes"
    }
  ]
}
```

## Suggested Standardization

### Current Variants Found

* `prefillIf` sometimes has `operator`, sometimes not.
* `dependsOn` sometimes has `type`, sometimes not.
* `fieldDependent` sometimes misses `prefillFromBindingKey`.
* `programDependent` uses `prefillDateFrom`.
* `static` uses `prefillValue`.

### Recommended Standard

Always include:

```json
{
  "operator": "equals"
}
```

inside every condition object for consistency.

## Implementation Notes

- Prefill will not work as described; it needs to be implemented properly in FormBuilderEdit.
- For `dependsOn`, no need to add `type`: "show"; handle it by defaulting to "show" or removing the type requirement.
- Solution: In payload builders, ensure `dependsOn` is handled without requiring `type`, and implement prefill logic as per the examples.