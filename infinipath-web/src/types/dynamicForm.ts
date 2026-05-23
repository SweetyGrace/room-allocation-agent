import { Control, FieldErrors, UseFormSetValue, UseFormWatch, UseFormTrigger } from 'react-hook-form';
import { DateRange } from 'rsuite/esm/DateRangePicker';
import { FieldConfig } from '../hooks/useAddProgramFormConfig'; 


// Re-export types from useAddProgramFormConfig hook
export type {
  FieldConfig,
  FieldOption,
  VisibilityCondition,
  FormSection,
  ProgramTypeConfig,
} from '../hooks/useAddProgramFormConfig';

export type FieldCallbacks = Record<
  string,
  { onBlur?: () => void; onChange?: (value: string) => void; isChecking?: boolean; available?: boolean | null }
>;

export interface DynamicFormSectionProps {
  section: any;
  control: Control<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  trigger: UseFormTrigger<any>;
  venueOptions?: string[];
  handleDateRangeChange?: (value: DateRange | null) => void;
  handleVenueChange?: (value: any) => void;
  getProgramDateRangeValue?: () => DateRange | null;
  isPublished?: boolean;
  fieldCallbacks?: FieldCallbacks;
}

export interface DynamicSubProgramCardProps {
  fields: any[];
  index: number;
  control: Control<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  trigger: UseFormTrigger<any>;
  venueOptions?: string[];
  onRemove: () => void;
  handleDateRangeChange?: (value: DateRange | null) => void;
  handleVenueChange?: (value: any) => void;
  getProgramDateRangeValue?: () => DateRange | null;
  isPublished?: boolean;
  sessionNumber?: number;
  programTypeName?: string;
}

export interface DynamicSubProgramsSectionProps {
  subProgramFields: any[];
  control: Control<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  trigger: UseFormTrigger<any>;
  venueOptions?: string[];
  handleDateRangeChange?: (value: DateRange | null) => void;
  handleVenueChange?: (value: any) => void;
  getProgramDateRangeValue?: () => DateRange | null;
  isPublished?: boolean;
  programTypeName?: string;
  noOfItems?: number;
  modeOfProgram?: string;
}

export interface SubProgramCrossFieldValidationOptions {
  watch: UseFormWatch<any>;
  trigger: UseFormTrigger<any>;
  index: number;
}

export interface CrossFieldDateValidationOptions<T extends object> {
  watch: UseFormWatch<T>;
  trigger: UseFormTrigger<T>;
}

export interface CreatableSelectFieldProps {
  field: any;
  control: any;
  errors: any;
  getFieldClassName: () => string;
  isPublished: boolean;
}

export interface ImageUploadFieldProps {
  field: any;
  control: any;
  errors: any;
  getFieldClassName: () => string;
  isPublished: boolean;
}

export interface DynamicFieldRendererProps {
  field: FieldConfig;
  control: Control<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  trigger: UseFormTrigger<any>;
  venueOptions?: string[];
  handleDateRangeChange?: (value: DateRange | null) => void;
  handleRegistrationStartChange?: (value: DateRange | null) => void;
  handleRegistrationEndChange?: (value: DateRange | null) => void;
  handleVenueChange?: (value: any) => void;
  getProgramDateRangeValue?: () => DateRange | null;
  getRegistrationStartValue?: () => Date | null;
  getRegistrationEndValue?: () => Date | null;
  isPublished?: boolean;
  fieldCallbacks?: FieldCallbacks;
}