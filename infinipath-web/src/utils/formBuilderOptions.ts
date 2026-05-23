import { FORM_BUILDER_TEXT } from "../constants/textConstants";

/**
 * Form Builder Options
 * Centralized option arrays used in FormBuilderEdit component
 */

// File type options for file upload validation
export const FILE_TYPE_OPTIONS = [
  { value: "image", label: FORM_BUILDER_TEXT.FILE_TYPE_OPTIONS.IMAGES },
  { value: "video", label: FORM_BUILDER_TEXT.FILE_TYPE_OPTIONS.VIDEOS },
  { value: "profile", label: FORM_BUILDER_TEXT.FILE_TYPE_OPTIONS.PROFILE },
];

// Date validation type options
export const DATE_VALIDATION_TYPE_OPTIONS = [
  { value: "none", label: "No Restrictions" },
  { value: "static", label: "Fixed Date Range" },
  { value: "dynamic", label: "Relative Date Range" },
  { value: "custom", label: "Custom Relative Date" },
];

// Custom condition type options for date validation
export const CUSTOM_CONDITION_TYPE_OPTIONS = [
  { value: "range", label: "Program Date Range" },
  { value: "normal", label: "Custom Value/Variable" },
];

// Time unit options for date range calculations
export const TIME_UNIT_OPTIONS = [
  { value: "days", label: "Days" },
  { value: "months", label: "Months" },
  { value: "years", label: "Years" },
];

// Date reference field options for date validation
export const DATE_REFERENCE_OPTIONS = [
  { value: "registrationStartsAt", label: FORM_BUILDER_TEXT.DATE_REFERENCES.REGISTRATION_START },
  { value: "registrationEndsAt", label: FORM_BUILDER_TEXT.DATE_REFERENCES.REGISTRATION_END },
  { value: "programStartsAt", label: FORM_BUILDER_TEXT.DATE_REFERENCES.PROGRAM_START },
  { value: "programEndsAt", label: FORM_BUILDER_TEXT.DATE_REFERENCES.PROGRAM_END },
  { value: "elderMaxAge", label: FORM_BUILDER_TEXT.DATE_REFERENCES.ELDER_MAX_AGE },
  { value: "childMinAge", label: FORM_BUILDER_TEXT.DATE_REFERENCES.CHILD_MIN_AGE },
];

// Operator options for number/value comparisons
export const OPERATOR_OPTIONS = [
  { value: "equals", label: FORM_BUILDER_TEXT.OPERATORS.EQUALS },
  { value: "lessThan", label: FORM_BUILDER_TEXT.OPERATORS.LESS_THAN },
  { value: "greaterThan", label: FORM_BUILDER_TEXT.OPERATORS.GREATER_THAN },
  { value: "lessThanOrEqual", label: FORM_BUILDER_TEXT.OPERATORS.LESS_THAN_OR_EQUAL },
  { value: "greaterThanOrEqual", label: FORM_BUILDER_TEXT.OPERATORS.GREATER_THAN_OR_EQUAL },
  { value: "range", label: FORM_BUILDER_TEXT.OPERATORS.RANGE },
];

// Default operator option
export const DEFAULT_OPERATOR = { value: "equals", label: FORM_BUILDER_TEXT.OPERATORS.EQUALS };

// Date/Age condition type options for conditional validation
export const DATE_AGE_CONDITION_TYPE_OPTIONS = [
  { value: "custom", label: FORM_BUILDER_TEXT.DATE_CONDITION_TYPES.CUSTOM_VARIABLE },
  { value: "range", label: FORM_BUILDER_TEXT.DATE_CONDITION_TYPES.PROGRAM_DATE_RANGE },
];

// Date field dependency condition types (for subsection date dependencies)
export const DATE_FIELD_CONDITION_TYPES = [
  { value: "custom", label: FORM_BUILDER_TEXT.DATE_CONDITION_TYPES.CUSTOM },
  { value: "past", label: FORM_BUILDER_TEXT.DATE_CONDITION_TYPES.PAST },
  { value: "future", label: FORM_BUILDER_TEXT.DATE_CONDITION_TYPES.FUTURE },
  { value: "today", label: FORM_BUILDER_TEXT.DATE_CONDITION_TYPES.TODAY },
];

// Depends On Type options - controls field visibility/behavior
export const DEPENDS_ON_TYPE_OPTIONS = [
  { value: "show", label: FORM_BUILDER_TEXT.DEPENDS_ON_TYPES.SHOW },
  { value: "hide", label: FORM_BUILDER_TEXT.DEPENDS_ON_TYPES.HIDE },
  { value: "enable", label: FORM_BUILDER_TEXT.DEPENDS_ON_TYPES.ENABLE },
  { value: "disable", label: FORM_BUILDER_TEXT.DEPENDS_ON_TYPES.DISABLE },
  { value: "prefill", label: FORM_BUILDER_TEXT.DEPENDS_ON_TYPES.PREFILL },
];

// Default depends on type option
export const DEFAULT_DEPENDS_ON_TYPE = { value: "show", label: FORM_BUILDER_TEXT.DEPENDS_ON_TYPES.SHOW };

/**
 * Helper function to get option label by value
 */
export const getOptionLabel = (options: Array<{ value: string; label: string }>, value: string): string => {
  const option = options.find(opt => opt.value === value);
  return option ? option.label : value;
};

/**
 * Validation field names - used for comparing config changes
 * These fields are checked when determining if a question's configuration has been modified
 */
export const VALIDATION_FIELD_NAMES = [
  'isRequired',
  'minCharacter',
  'maxCharacters',
  'minValue',
  'maxValue',
  'validationPattern',
  'patternErrorMsg',
  'helperText',
  'allowDecimals',
  'maxFileSize',
  'allowedFileTypes',
  'yearOffset',
  'maxYearOffset',
  'pastValidation',
  'futureValidation',
  'allowMahatriaChoice'
] as const;

/**
 * Field types that support option configuration (radio, checkbox, select)
 * Used to determine if a question type needs option/choice configuration
 */
export const OPTION_FIELD_TYPES = ['radio', 'checkbox', 'select'] as const;
