// Form Builder Utility Functions
import { SectionItemType, ConditionalOperator } from '../types/formBuilder';
import type { ConditionalConfigEntry } from '../types/formBuilder';
export { SectionItemType, ConditionalOperator };
export type { ConditionalConfigEntry };

// Define which validation fields apply to which display types
const DISPLAY_TYPE_VALIDATION_FIELDS: { [key: string]: string[] } = {
  text: ['minCharacter', 'maxCharacters'],
  textarea: ['minCharacter', 'maxCharacters'],
  slider: ['minValue', 'maxValue'],
};

// Helper function to determine if a display type uses character-based validation
export const usesCharacterValidation = (displayType: string): boolean => {
  return DISPLAY_TYPE_VALIDATION_FIELDS[displayType]?.includes('minCharacter') || false;
};

// Helper function to determine if a display type uses value-based validation
export const usesValueValidation = (displayType: string): boolean => {
  return DISPLAY_TYPE_VALIDATION_FIELDS[displayType]?.includes('minValue') || false;
};

// Helper function to get default validation config based on field type
export const getDefaultValidationConfig = (fieldType: string) => {
  const baseConfig = {
    isRequired: false,
    placeholder: null,
    dependsOn: undefined,
    conditionalFields: null,
    helperText: undefined,
    patternErrorMsg: undefined,
  };

  switch (fieldType) {
    case "text":
      return {
        ...baseConfig,
        minCharacter: null,
        maxCharacters: null,
        validationPattern: null,
      };
    case "textarea":
      return {
        ...baseConfig,
        minCharacter: null,
        maxCharacters: null,
        validationPattern: null,
      };
    case "number":
      return {
        ...baseConfig,
        minValue: null,
        maxValue: null,
        allowDecimals: false,
        minCharacter: null,
        maxCharacters: null,
        validationPattern: null,
      };
    case "email":
      return {
        ...baseConfig,
        validationPattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+",
        minCharacter: null,
        maxCharacters: null,
        prefill: undefined,
      };
    case "tel":
      return {
        ...baseConfig,
        minCharacter: 10,
        maxCharacters: 15,
        validationPattern: "^[0-9+\\-\\s\\(\\)]+$",
      };
    case "file":
      return {
        ...baseConfig,
        maxFileSize: 10,
        allowedFileTypes: null,
        validationPattern: null,
        filetype: undefined,
        fileConfig: undefined,
        allowMultiple: false,
      };
    case "year":
      return {
        ...baseConfig,
        minYear: null,
        maxYear: "current",
        yearOffset: null,
        maxYearOffset: null,
        minCharacter: null,
        maxCharacters: null,
        validationPattern: null,
        minValue: null,
        maxValue: null,
        allowDecimals: false,
      };
    case "yearRange":
      return {
        ...baseConfig,
        yearOffset: null,
        maxYearOffset: null,
      };
    case "apicall":
      return {
        ...baseConfig,
        type: "select",
        endPoint: "lookup-data/all",
        apiUrl: "lookup-data/all",
        category: "",
        minCharacter: null,
        maxCharacters: null,
        validationPattern: null,
        minValue: null,
        maxValue: null,
        allowDecimals: false,
      };
    case "select":
      return {
        ...baseConfig,
        selectPlaceHolder: undefined,
      };
    case "radio":
    case "checkbox":
      return {
        ...baseConfig,
        showDialog: undefined,
        showDialogMessage: undefined,
        prefill: undefined,
      };
    case "date":
      return {
        ...baseConfig,
        dateValidationType: "none",
        dateTypeValidation: undefined,
        startDate: null,
        endDate: null,
        pastValidation: {
          enabled: false,
          minValue: null,
          maxValue: null,
          unit: "days",
          dateValidationField: undefined,
        },
        futureValidation: {
          enabled: false,
          minValue: null,
          maxValue: null,
          unit: "days",
          dateValidationField: undefined,
        },
        excludeWeekends: false,
        onlyWeekdays: false,
        prefill: undefined,
      };
    case "dateandtime":
      return {
        ...baseConfig,
        prefill: undefined,
      };
    case "Address":
      return {
        ...baseConfig,
        minCharacter: 10,
        maxCharacters: 99,
        validationPattern: null,
        patternErrorMsg: undefined,
      };
    case "draganddrop":
      return {
        ...baseConfig,
        maxFileSize: 10,
        allowedFileTypes: null,
        validationPattern: null,
        allowMultiple: false,
        allowMahatriaChoice: false,
        mahatriaChoiceConfig: undefined,
      };
    case "multiQuestion":
      return {
        ...baseConfig,
        questions: [
          {
            key: "field_1",
            label: "Field 1",
            displayOrder: 1,
            minCharacter: 1,
            maxCharacters: 500,
            displayLabelType: "textarea",
            placeholder: "",
          },
        ],
      };
    default:
      return baseConfig;
  }
};

// Calculate date limits based on dynamic validation config
export const calculateDateLimits = (config: any) => {
  const today = new Date();
  let minDate = null;
  let maxDate = null;

  if (config.dateValidationType === "dynamic") {
    if (config.pastValidation?.enabled) {
      const { minValue, maxValue, unit } = config.pastValidation;

      if (maxValue) {
        minDate = new Date(today);
        if (unit === "days") minDate.setDate(today.getDate() - maxValue);
        if (unit === "months") minDate.setMonth(today.getMonth() - maxValue);
        if (unit === "years" || unit === "year")
          minDate.setFullYear(today.getFullYear() - maxValue);
      }
    }

    if (config.futureValidation?.enabled) {
      const { minValue, maxValue, unit } = config.futureValidation;

      if (maxValue) {
        maxDate = new Date(today);
        if (unit === "days") maxDate.setDate(today.getDate() + maxValue);
        if (unit === "months") maxDate.setMonth(today.getMonth() + maxValue);
        if (unit === "years")
          maxDate.setFullYear(today.getFullYear() + maxValue);
      }
    }
  }

  return { minDate, maxDate };
};

// Get available questions for conditional logic (only previous questions in same section)
export const getAvailableQuestions = (
  sections: any[],
  currentQuestionIndex: number,
  currentSectionIndex: number,
) => {
  const questions: Array<{ id: number; label: string; type: string; options: any[]; bindingKey: string }> =
    [];

  const currentSection = sections[currentSectionIndex];
  if (!currentSection) return questions;

  currentSection.items.forEach((item: any, itemIndex: number) => {
    if (item.type === SectionItemType.Question && itemIndex < currentQuestionIndex) {
      const question = item.question;
      questions.push({
        id: question.question.id,
        label: question.question.label,
        type: question.question.type,
        options: question.question.questionOptionMaps || [],
        bindingKey: question.question.bindingKey || "",
      });
    }
  });

  return questions;
};

// Get radio/select options for a specific question by binding key
export const getRadioOptionsForQuestion = (sections: any[], bindingKey: string) => {
  let options: any[] = [];

  sections.forEach((section) => {
    section.items.forEach((item: any) => {
      if (item.type === SectionItemType.Question) {
        const question = item.question;
        if (question.question.bindingKey === bindingKey) {
          options = question.question.questionOptionMaps.map((optMap: any) => ({
            value: optMap.option.name,
            label: optMap.option.name,
          }));
        }
      } else if (item.type === SectionItemType.Subsection) {
        (item.questions || []).forEach((q: any) => {
          if (q?.question?.bindingKey === bindingKey) {
            options = (q.question.questionOptionMaps || []).map((optMap: any) => ({
              value: optMap.option.name,
              label: optMap.option.name,
            }));
          }
        });
      }
    });
  });

  return options;
};

// Get question type by binding key
export const getQuestionTypeById = (sections: any[], bindingKey: string): string => {
  let questionType = "";

  sections.forEach((section) => {
    section.items.forEach((item: any) => {
      if (item.type === SectionItemType.Question) {
        const question = item.question;
        if (question.question.bindingKey === bindingKey) {
          questionType = question.question.type;
        }
      } else if (item.type === SectionItemType.Subsection) {
        (item.questions || []).forEach((q: any) => {
          if (q?.question?.bindingKey === bindingKey) {
            questionType = q.question.type;
          }
        });
      }
    });
  });

  return questionType;
};

// Get all questions from all sections for prefill - only questions before current question
export const getAllQuestionsFromAllSections = (
  sections: any[],
  currentQuestionId: number,
  currentSectionIndex: number,
  currentQuestionIndex: number,
) => {
  const questions: Array<{ 
    id: number; 
    label: string; 
    type: string; 
    bindingKey: string;
    sectionName: string;
  }> = [];

  sections.forEach((section, sectionIndex) => {
    section.items.forEach((item: any, itemIndex: number) => {
      if (item.type === SectionItemType.Question) {
        const question = item.question;
        // Include all questions from previous sections
        if (sectionIndex < currentSectionIndex) {
          questions.push({
            id: question.question.id,
            label: question.question.label,
            type: question.question.type,
            bindingKey: question.question.bindingKey || "",
            sectionName: section.sectionName,
          });
        }
        // From current section, only include questions that appear before current question
        else if (sectionIndex === currentSectionIndex && itemIndex < currentQuestionIndex) {
          questions.push({
            id: question.question.id,
            label: question.question.label,
            type: question.question.type,
            bindingKey: question.question.bindingKey || "",
            sectionName: section.sectionName,
          });
        }
      }
    });
  });

  return questions;
};

// Get ALL questions from all sections for dependsOn, excluding the current question.
// Includes subsection questions. Caller should further filter by visibleBindingKeys and circular deps.
export const getAllQuestionsForDependsOn = (
  sections: any[],
  currentBindingKey: string,
): Array<{ id: number; label: string; type: string; options: any[]; bindingKey: string; sectionName: string }> => {
  const questions: Array<{ id: number; label: string; type: string; options: any[]; bindingKey: string; sectionName: string }> = [];

  sections.forEach((section) => {
    section.items.forEach((item: any) => {
      if (item.type === SectionItemType.Question) {
        const questionItem = item.question;
        const bindingKey = questionItem?.question?.bindingKey;
        if (bindingKey && bindingKey !== currentBindingKey) {
          questions.push({
            id: questionItem.question.id,
            label: questionItem.question.label,
            type: questionItem.question.type,
            options: questionItem.question.questionOptionMaps || [],
            bindingKey,
            sectionName: section.sectionName,
          });
        }
      } else if (item.type === SectionItemType.Subsection) {
        (item.questions || []).forEach((questionMap: any) => {
          const bindingKey = questionMap?.question?.bindingKey;
          if (bindingKey && bindingKey !== currentBindingKey) {
            questions.push({
              id: questionMap.question.id,
              label: questionMap.question.label,
              type: questionMap.question.type,
              options: questionMap.question.questionOptionMaps || [],
              bindingKey: bindingKey,
              sectionName: section.sectionName,
            });
          }
        });
      }
    });
  });

  return questions;
};

// Returns the set of binding keys that would create a circular dependency if the current
// question were made to depend on them. A key is circular if it can already transitively
// reach currentBindingKey through the existing dependsOn graph.
export const getCircularDependencyKeys = (
  currentBindingKey: string,
  allSections: any[],
): Set<string> => {
  const depMap = new Map<string, string[]>();

  const collectDeps = (questionObj: any, bindingKey: string) => {
    const deps = questionObj?.config?.dependsOn;
    if (!deps) return;
    const depArray = Array.isArray(deps) ? deps : [deps];
    const dependencyBindingKeys = depArray.map((d: any) => d?.questionBindingKey).filter(Boolean) as string[];
    if (dependencyBindingKeys.length > 0) depMap.set(bindingKey, dependencyBindingKeys);
  };

  allSections.forEach((section) => {
    section.items.forEach((item: any) => {
      if (item.type === SectionItemType.Question) {
        const questionItem = item.question;
        const bindingKey = questionItem?.question?.bindingKey;
        if (bindingKey) collectDeps(questionItem.question, bindingKey);
      } else if (item.type === SectionItemType.Subsection) {
        (item.questions || []).forEach((questionMap: any) => {
          const bindingKey = questionMap?.question?.bindingKey;
          if (bindingKey) collectDeps(questionMap.question, bindingKey);
        });
      }
    });
  });

  const canReach = (from: string, target: string, visited: Set<string>): boolean => {
    if (from === target) return true;
    if (visited.has(from)) return false;
    visited.add(from);
    for (const dep of (depMap.get(from) || [])) {
      if (canReach(dep, target, visited)) return true;
    }
    return false;
  };

  const circular = new Set<string>();
  for (const bindingKey of depMap.keys()) {
    if (canReach(bindingKey, currentBindingKey, new Set())) {
      circular.add(bindingKey);
    }
  }
  return circular;
};

// Helper function to escape HTML entities to prevent XSS
const escapeHtml = (text: string): string => {
  const htmlEscapeMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapeMap[char]);
};

// Render section name with "Mahatria" highlighted in red
export const renderSectionName = (name: string): string => {
  if (!name) return "";

  const parts = name.split(/\b(Mahatria)\b/i);
  let result = "";

  parts.forEach((part) => {
    if (part.toLowerCase() === "mahatria") {
      // Escape the matched word as well for safety
      result += `<span style="color: #d9251d">${escapeHtml(part)}</span>`;
    } else {
      // HTML-escape all non-highlighted text to prevent XSS
      result += escapeHtml(part);
    }
  });

  return result;
};

// Convert time string to numeric value for comparison
export const timeStringToValue = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Add days to a date string
export const addDaysToDate = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};


const evaluateCondition = (condition: ConditionalConfigEntry, programMeta: Record<string, any>): boolean => {
  const metaValue = programMeta?.[condition.metaKey];
  switch (condition.operator) {
    case ConditionalOperator.Equals:
    case ConditionalOperator.EqualsLower:
      return condition.value.some((v) => v === metaValue);
    case ConditionalOperator.NotEquals:
    case ConditionalOperator.NotEqualsLower:
      return condition.value.every((v) => v !== metaValue);
    default:
      return true;
  }
};

// Evaluate all conditions in a conditionalConfig array (all must pass)
export const evaluateConditionalConfig = (
  conditionalConfig: ConditionalConfigEntry[] | null | undefined,
  programMeta: Record<string, any>,
): boolean => {
  if (!conditionalConfig || conditionalConfig.length === 0) return true;
  return conditionalConfig.every((condition) => evaluateCondition(condition, programMeta));
};

// Remove dependsOn and prefill references that point to questions no longer visible.
// Handles all known prefill shapes from prefill-configurations.md:
//   - prefill.prefillIf[].questionBindingKey  → remove condition if question hidden
//   - prefill.prefillFromBindingKey            → clear prefillFrom + prefillFromBindingKey if source hidden
export const sanitizeQuestionDependencies = (
  config: any,
  validBindingKeys: Set<string>,
): any => {
  if (!config) return config;

  let result = config;

  // ── dependsOn ──────────────────────────────────────────────────────────────
  // Only remove entries whose questionBindingKey references a hidden question.
  // Other entries (different questionBindingKey, or no questionBindingKey) are kept.
  // Use null (not undefined) so JSON.stringify includes the key in API payloads,
  // explicitly telling the backend to clear the field when all entries are removed.
  if (config.dependsOn) {
    const wasArray = Array.isArray(config.dependsOn);
    const deps = wasArray ? config.dependsOn : [config.dependsOn];
    const filtered = deps.filter(
      (dep: any) => !dep?.questionBindingKey || validBindingKeys.has(dep.questionBindingKey),
    );
    if (filtered.length !== deps.length) {
      // Preserve array format if the original was an array (even when one entry remains),
      // so the backend's array-vs-object handling is not affected by sanitization.
      const sanitized: any = filtered.length === 0 ? null : wasArray ? filtered : filtered[0];
      result = { ...result, dependsOn: sanitized };
    }
  }

  // ── prefill ─────────────────────────────────────────────────────────────────
  if (config.prefill) {
    let prefillChanged = false;
    const sanitizedPrefill = { ...config.prefill };

    // prefillIf – remove conditions whose source question is hidden
    if (Array.isArray(config.prefill.prefillIf) && config.prefill.prefillIf.length > 0) {
      const filteredIf = config.prefill.prefillIf.filter(
        (cond: any) => !cond?.questionBindingKey || validBindingKeys.has(cond.questionBindingKey),
      );
      if (filteredIf.length !== config.prefill.prefillIf.length) {
        // null = explicitly empty (serializes in JSON); empty array would still apply no conditions
        sanitizedPrefill.prefillIf = filteredIf.length > 0 ? filteredIf : null;
        prefillChanged = true;
      }
    }

    // prefillFromBindingKey – clear source reference if source question is hidden
    if (
      config.prefill.prefillFromBindingKey &&
      !validBindingKeys.has(config.prefill.prefillFromBindingKey)
    ) {
      sanitizedPrefill.prefillFrom = null;
      sanitizedPrefill.prefillFromBindingKey = null;
      prefillChanged = true;
    }

    if (prefillChanged) {
      result = { ...result, prefill: sanitizedPrefill };
    }
  }

  return result;
};
