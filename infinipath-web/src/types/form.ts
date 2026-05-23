export interface ValidationRule {
  pattern?: string;
  message: string;
  minAge?: number;
  maxAge?: number;
  min?: number;
}

export interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  validation?: ValidationRule;
  options?: Array<{ value: string; label: string }>;
  dependsOn?: {
    field: string;
    value: string;
  };
  fields?: FormField[]; // Support for nested fields
  rows?: number;
  accept?: string;
  maxSize?: number;
  helpText?: string;
  conditionalFields?: string;
  showWhen?: string;
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormData {
  formTitle: string;
  sections: FormSection[];
}