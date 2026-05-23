
import { Control, UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, UseFormClearErrors } from 'react-hook-form';

export type QuestionType = 
  | 'radio'
  | 'checkbox'
  | 'input'
  | 'datepicker'
  | 'dropdown'
  | 'selectWithText';

export interface Question {
  id: number;
  label: string;
  createdBy: {
    id: number;
  };
  updatedBy: {
    id: number;
  };
}

export interface QuestionPayload {
  id: string;
  name: string;
  type: string;
  status: string;
  categoryId: string | null;
  config?: {
    displayLabel?: string;
    maxChars?: number;
    minChars?: number;
    isMandatory?: boolean;
    placeholder?: string;
    validationRule?: string;
    minValue?: number;
    maxValue?: number;
    enableOtherOption?: boolean;
    options?: Array<{
      label: string;
      otherLabel?: string;
      optionType?: string;
      optionCategory?: string;
      otherOptionCategory?: string;
    }>;
  };
  createdBy: number | undefined;
  updatedBy: number | undefined;
}

export interface PaginationData {
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  numberOfRecords: number;
}

export interface QuestionsResponse {
  data: Question[];
  pagination: PaginationData;
}

export interface category{
  id: number;
  name: string;
}

export interface Option {
  id: number;
  name: string;
  type: string;
  categoryId: number;
  category: category;
  createdBy: number;
  updatedBy: number;
}

export interface CategoryResponsequestion {
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  currentRecords: Array<{
    id: number;
    name: string;
  }>;
}

export interface Category {
  id: number;
  name: string;
}


// Update the CategoryResponse interface to match the API response
export interface CategoryResponse {
  data: {
    data: Array<Category>;
    pagination: PaginationData;
  }
}

export interface QuestionFormData {
  question: string;
  type: string;
  sectionDetails:string,
  placeholder?: string;
  minChars?: number;
  maxChars?: number;
  minValue?: number;
  maxValue?: number;
  validationRule?: string;
  otherValidationRule?: string;
  isMandatory?: boolean;
  fileTypes?: string[];
  isDisabled?: boolean;
  enableOtherOption?: boolean;
  options?: Array<{
    label: string;
    optionCategory: string[]; // Explicitly type as string array
    otherLabel?: string;
    otherOptionCategory?: string;
  }>;
  category?:string;
  displayLabel?:string;
  isMultiple?:boolean;
}

export interface ApiQuestion {
  id: string;
  label: string;
  config: {
    maxChars?: number;
    minChars?: number;
    isMandatory?: boolean;
    placeholder?: string;
    validationRule?: string;
    minValue?: number;
    maxValue?: number;
    enableOtherOption?: boolean;
    options?: Array<{
      label: string;
      otherLabel?: string;
      optionType?: string;
      optionCategory?: string;
      otherOptionCategory?: string;
    }>;
  };
  status: string;
  type: string;
  createdBy:  number;
  updatedBy: number;
  questionOptionMaps?: Array<{
    label: string;
    otherLabel?: string;
    optionType?: string;
    optionCategory?: string;
    otherOptionCategory?: string;
  }>;
}

export interface QuestionOption {
  id: string | number;
  label: string;
  priority: number;
}

export interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: QuestionFormData, status?: string) => void;
  onEdit: (data: QuestionFormData, id: string | undefined) => void;
  editingQuestion: Question | null;
  fetchQuestionsData: () => Promise<void>;
  categories: CategoryResponse;
  fetchCategories: () => Promise<void>;
  options?: QuestionOption[];
  setOptions?: React.Dispatch<React.SetStateAction<QuestionOption[]>>;
  isDuplicating?: boolean; // Add this prop
}

export interface ValidationOption {
  value: string;
  label: string;
}

export interface ConfigFieldProps {
  field: keyof Pick<QuestionFormData, 
    'placeholder' | 
    'minChars' | 
    'maxChars' | 
    'minValue' | 
    'maxValue' | 
    'validationRule' | 
    'enableOtherOption'|
    'isMandatory'|
    'isDisabled' 
  >;
  control: Control<QuestionFormData>;
  register: UseFormRegister<QuestionFormData>;
  errors: FieldErrors<QuestionFormData>;
  watch: UseFormWatch<QuestionFormData>;
  setValue: UseFormSetValue<QuestionFormData>;
  clearErrors: UseFormClearErrors<QuestionFormData>;
  validationRuleOptions?: ValidationOption[];
}

export interface QuestionConfig {
  displayLabel: string;
  isMandatory: boolean;
  validationRule: Array<{
        pattern: string;
        message: string; 
      }>;
  placeholder?: string;
  minChars?: number;
  maxChars?: number;
  minValue?: number;
  maxValue?: number;
  supportedFileTypes?: string[];
  enableOtherOption?: boolean;
  options?: number[];
}

export interface QuestionForm {
  id: number;
  text: string;
  type: string;
  required?: boolean;
  options?: string[];
  validation?: {
    pattern?: string;
    messages?: {
      required?: string;
      pattern?: string;
      [key: string]: string | undefined;
    };
    [key: string]: any;
  };
  placeholder?: string;
  isBuiltIn?: boolean;
}