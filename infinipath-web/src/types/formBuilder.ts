// FormBuilder-specific type definitions
export enum SectionItemType {
  Question = 'question',
  Subsection = 'subsection',
}

export enum ConditionalOperator {
  Equals = 'EQUALS',
  EqualsLower = 'equals',
  NotEquals = 'NOT_EQUALS',
  NotEqualsLower = 'notEquals',
}

export interface ConditionalConfigEntry {
  value: any[];
  metaKey: string;
  operator: ConditionalOperator;
}

export interface Option {
  id: number;
  name: string;
  type: string;
  status: string;
}

export interface QuestionOptionMap {
  id: number;
  option: Option;
}

export interface CustomQuestion {
  question: {
    label: string;
    type: string;
    section: any;
    config: any;
    status: string;
    answerLocation: string;
    bindingKey: string;
  };
  options: {
    name: string;
    type: string;
    category: any;
  }[];
  displayOrder: number;
}

export interface DependsOnConfig {
  questionId: number;
  questionBindingKey?: string;
  value: string | number | boolean | string[];
  type?: "disable" | "show" | "hide" | "enable";
  operator?: "equals" | "greaterThan" | "lessThan" | "IN" | "EQUALS" | "NOT_EQUALS" | "IS_NULL";
}

export interface ShowDialogConfig {
  type: "popup" | "card" | "image" | "video" | "profile" | "disable";
  isShow: string;
  imageName?: string | null;
  contentType?: "text" | "image" | "video";
  dialogueContent?: string;
  dialogueContentType?: "static" | "dynamic";
  dialogContent?: string;
  dialogContentType?: "static" | "dynamic";
}

export interface PrefillConfig {
  prefillType?: "fieldDependent" | "programDependent";
  prefillDateFrom?: "startsAt" | "endsAt";
  prefillIf?: Array<{
    value: string | number | boolean;
    questionId: number;
    questionBindingKey: string;
  }>;
  prefillFrom?: number;
  prefillFromBindingKey?: string;
  addToPrefill?: string;
  prefillValue?: any;
  operator?: string;
}

export interface FileConfig {
  type: "image" | "video" | "profile";
  accepts: string[];
  sizeLimit?: number;
  timeLimit?: number;
}

export interface MahatriaChoiceConfig {
  allowMahatriaChoice: boolean;
  mahatriaChoicetText?: string;
}

export interface QuestionConfig {
  isRequired: boolean;
  isAdvancedValidation?: boolean;
  minCharacter?: number | null;
  maxCharacters?: number | null;
  validationPattern?: string | null;
  patternErrorMsg?: string;
  dependsOn?: DependsOnConfig | DependsOnConfig[];
  conditionalFields?: any[] | null;
  placeholder?: string;
  helperText?: string;
  // Value-based validation
  minValue?: number | null;
  maxValue?: number | null;
  allowDecimals?: boolean;
  allowedDigits?: number;
  // File-related fields
  maxFileSize?: number | null;
  allowedFileTypes?: string | null;
  filetype?: "image" | "video" | "profile";
  fileConfig?: FileConfig;
  allowMultiple?: boolean;
  // Year-related fields
  allowFutureYears?: boolean;
  allowPastYears?: boolean;
  minYear?: "current" | number | null;
  maxYear?: "current" | number | null;
  yearOffset?: number;
  maxYearOffset?: number;
  // API call fields
  type?: "select";
  endPoint?: string | null;
  apiUrl?: string;
  category?: string;
  // Date validation fields
  dateValidationType?: "none" | "static" | "dynamic";
  dateTypeValidation?: "static" | "dynamic";
  startDate?: string | null;
  endDate?: string | null;
  pastValidation?: {
    enabled: boolean;
    minValue: number | null;
    maxValue: number | null;
    unit: "days" | "months" | "years" | "year";
    dateValidationField?: string;
  };
  futureValidation?: {
    enabled: boolean;
    minValue: number | null;
    maxValue: number | null;
    unit: "days" | "months" | "years";
    dateValidationField?: string;
  };
  excludeWeekends?: boolean;
  onlyWeekdays?: boolean;
  // Select/dropdown fields
  selectPlaceHolder?: string;
  // Prefill configuration
  prefill?: PrefillConfig;
  // Dialog/popup configuration
  showDialog?: ShowDialogConfig;
  showDialogMessage?: ShowDialogConfig[];
  // Drag and drop / Mahatria choice
  allowMahatriaChoice?: boolean;
  mahatriaChoiceConfig?: MahatriaChoiceConfig;
  // MultiQuestion fields
  questions?: Array<{
    key: string;
    label: string;
    displayOrder: number;
    minCharacter: number;
    maxCharacters: number;
    displayLabelType: string;
    placeholder: string;
  }>;
}
