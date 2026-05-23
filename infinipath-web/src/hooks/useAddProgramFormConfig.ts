import { useState, useEffect, useMemo } from 'react';
import formConfig from '../config/addProgramFormConfig.json';
import { PROGRAM_TYPE_NAMES, PROGRAM_STRUCTURE_VALUES, WARNING_MESSAGES } from '../constants/textConstants';

export interface FieldOption {
  value: string;
  label: string;
}

export interface VisibilityCondition {
  field: string;
  values: string[];
}

export interface FieldConfig {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  column: 1 | 2;
  disabled: boolean;
  options?: FieldOption[];
  value?: string;
  prefix?: string;
  min?: number;
  max?: number;
  pattern?: string;
  maxLength?: number;
  fields?: string[];
  visibleWhen?: VisibilityCondition;
  visibleWhenAll?: VisibilityCondition[];
  disabledWhen?: VisibilityCondition;
  prefillFrom?: string;
  dynamicPrefill?: {
    sourceField: string;
    mapping: Record<string, string>;
  };
  // Image upload constraints
  allowedFormats?: string[];
  maxFileSizeKB?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

export interface FormSection {
  sectionId: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  fields: FieldConfig[];
}

export interface ProgramTypeConfig {
  name: string;
  hasSubPrograms?: boolean;
  sections: FormSection[];
}

const resolveBaseTypeName = (programTypeName: string): string => {
  const rawTypeName = programTypeName.split(/[/\-\s]/)[0].trim();
  let baseTypeName = rawTypeName.toUpperCase();
  if (baseTypeName === PROGRAM_TYPE_NAMES.ENTRAINMENT_UPPER) {
    baseTypeName = PROGRAM_TYPE_NAMES.ENTRAINMENT;
  } else if (baseTypeName.includes(PROGRAM_TYPE_NAMES.TAT)) {
    baseTypeName = PROGRAM_TYPE_NAMES.TAT;
  } else if (baseTypeName.includes(PROGRAM_TYPE_NAMES.HDB)) {
    baseTypeName = PROGRAM_TYPE_NAMES.HDB;
  } else if (baseTypeName.includes(PROGRAM_TYPE_NAMES.MSD)) {
    baseTypeName = PROGRAM_TYPE_NAMES.MSD;
  }
  return baseTypeName;
};

export const useAddProgramFormConfig = (programTypeName?: string, programStructure?: string) => {
  const [config, setConfig] = useState<ProgramTypeConfig | null>(null);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);

  useEffect(() => {
    const types = Object.keys(formConfig.programTypes);
    setAvailableTypes(types);

    if (programTypeName) {
      const baseTypeName = resolveBaseTypeName(programTypeName);
      const programConfig = formConfig.programTypes[baseTypeName as keyof typeof formConfig.programTypes];
      if (programConfig) {
        setConfig(programConfig as ProgramTypeConfig);
      } else {
        console.warn(`${WARNING_MESSAGES.PROGRAM_CONFIG_NOT_FOUND} ${baseTypeName}. ${WARNING_MESSAGES.AVAILABLE_TYPES}`, types);
        setConfig(null);
      }
    }
  }, [programTypeName]);

  // Compute subProgramFields synchronously so it updates in the same render cycle
  const subProgramFields = useMemo((): FieldConfig[] => {
    if (!programTypeName) return [];
    const baseTypeName = resolveBaseTypeName(programTypeName);
    if (baseTypeName === PROGRAM_TYPE_NAMES.CUSTOM) {
      if (programStructure === PROGRAM_STRUCTURE_VALUES.MULTIPLE) {
        return (formConfig as any).subProgramFields?.[PROGRAM_TYPE_NAMES.CUSTOM_SESSION] || [];
      } else if (programStructure === PROGRAM_STRUCTURE_VALUES.GROUPED) {
        return (formConfig as any).subProgramFields?.[PROGRAM_TYPE_NAMES.CUSTOM_GROUPED] || [];
      }
      return [];
    }
    return (formConfig as any).subProgramFields?.[baseTypeName] || [];
  }, [programTypeName, programStructure]);

  const getConfigForType = (typeName: string): ProgramTypeConfig | null => {
    const programConfig = formConfig.programTypes[typeName as keyof typeof formConfig.programTypes];
    return programConfig ? (programConfig as ProgramTypeConfig) : null;
  };

  const getAllConfigs = () => {
    return formConfig.programTypes;
  };

  return {
    config,
    availableTypes,
    subProgramFields,
    hasSubPrograms: config?.hasSubPrograms !== false, // Default to true unless explicitly set to false
    getConfigForType,
    getAllConfigs,
  };
};

export default useAddProgramFormConfig;
