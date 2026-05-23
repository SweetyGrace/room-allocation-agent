import React, { useState, useEffect, ChangeEvent } from "react";
import {
  deleteCall,
  getCall,
  postCall,
  putCall,
  patchCall,
} from "../../services/apiService";
import { endPoints, fieldTypes, PORTAL } from "../../constants/urlConstants";
import { FORM_BUILDER_DEFAULTS } from "../../constants/textConstants";
import { EXISTING_ID_THRESHOLD } from "../../constants";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../common/components/Button";
import styles from "./index.module.scss";
import {
  getProgramImage,
  getProgramImageForBanner,
} from "../../utils/commonFunctions";
import { transformQuestionOptions } from "../../utils/registrationUtils";
import deleteIcon from "../../assets/images/delete-icon.svg";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import editbutton from "../../assets/images/editbutton.svg";
import CustomDropDown from "../../common/components/CustomDropDown";
import { ProgramQuestionMap } from "../../types/program";
import Stepper from "../programStepper";
import Select from "react-select";
import CustomDatePicker from "../../common/components/CustomDatePicker";
import { getItemInLocalStorage } from "../../services/localStorage";
import { 
  API_ENDPOINTS, 
  DISPLAY_LABEL_TYPES, 
  DISPLAY_TYPE_VALIDATION_FIELDS,
  FORM_BUILDER_TEXT 
} from "../../constants/textConstants";
import {
  FILE_TYPE_OPTIONS,
  DATE_VALIDATION_TYPE_OPTIONS,
  CUSTOM_CONDITION_TYPE_OPTIONS,
  TIME_UNIT_OPTIONS,
  DATE_REFERENCE_OPTIONS,
  OPERATOR_OPTIONS,
  DATE_AGE_CONDITION_TYPE_OPTIONS,
  DATE_FIELD_CONDITION_TYPES,
  DEPENDS_ON_TYPE_OPTIONS,
  VALIDATION_FIELD_NAMES,
  OPTION_FIELD_TYPES,
} from "../../utils/formBuilderOptions";
import {
  SectionItemType,
  usesCharacterValidation,
  usesValueValidation,
  getDefaultValidationConfig,
  calculateDateLimits,
  getAvailableQuestions,
  getRadioOptionsForQuestion,
  getQuestionTypeById,
  getAllQuestionsFromAllSections,
  getAllQuestionsForDependsOn,
  getCircularDependencyKeys,
  renderSectionName,
  timeStringToValue,
  addDaysToDate,
  evaluateConditionalConfig,
  sanitizeQuestionDependencies,
} from "../../utils/formBuilderUtils";
import type { ConditionalConfigEntry } from "../../utils/formBuilderUtils";
import type {
  Option,
  QuestionOptionMap,
  CustomQuestion,
  DependsOnConfig,
  ShowDialogConfig,
  PrefillConfig,
  FileConfig,
  MahatriaChoiceConfig,
  QuestionConfig,
} from "../../types/formBuilder";
import BannerRenderer from "../../common/components/BannerRenderer";

const FormBuilderEdit: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sections, setSections] = useState<{
    sections: Array<{
      sectionId: number;
      sectionName: string;
      templateFormSectionId?: string | number;
      masterFormSectionId?: string | number;
      sectionKey?: string;
      conditionalConfig?: ConditionalConfigEntry[] | null;
      items: Array<{
        type: SectionItemType;
        question?: any;
        subSectionId?: number;
        templateFormSectionId?: string | number;
        masterFormSectionId?: string | number;
        subSectionName?: string;
        subSectionKey?: string;
        conditionalConfig?: ConditionalConfigEntry[] | null;
        questions?: any[];
      }>;
      sectionDisplayOrder: number;
    }>;
  }>({ sections: [] });
  // Track deleted question IDs per section: { sectionId: [questionIds] }
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<Record<number, number[]>>({});
  const [newSubSectionName, setNewSubSectionName] = useState("");
  const [isSubSectionModalOpen, setIsSubSectionModalOpen] = useState(false);
  const [targetSectionIndex, setTargetSectionIndex] = useState<number | null>(null);
  const templateId = searchParams.get("templateId") || location?.state?.templateId;
  const programId = searchParams.get("programId") || location?.state?.programId;
  const userId = getItemInLocalStorage("seekerDetails")?.id || 9533; // Fallback to 9533 if user ID is not found  
  const [programQuestions, setProgramQuestions] = useState<
    ProgramQuestionMap[]
  >([]);
  const [columnLayout, setColumnLayout] = useState<"1" | "2">("2");
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());
  
  // Store original template data for change detection
  const [originalTemplateData, setOriginalTemplateData] = useState<any>(null);
  
  // Track if program has existing questions (edit mode vs create mode)
  const [isProgramWithQuestions, setIsProgramWithQuestions] = useState<boolean>(false);
  
  // Track deleted section IDs for PATCH payload
  const [deletedSectionIds, setDeletedSectionIds] = useState<number[]>([]);

  // Program-level meta data for evaluating conditionalConfig on sections/questions
  const [programMeta, setProgramMeta] = useState<Record<string, any>>({});

  const programQuestionMaps: ProgramQuestionMap[] =
    location.state?.programQuestionMaps || [];

  const fetchTemplateData = async () => {
    try {
      if (!programId) return;
      const programResponse = await getCall(`${endPoints?.program}/${programId}`, undefined, PORTAL);

      // Extract flat program meta (primitives) for conditionalConfig evaluation.
      // localMeta is used synchronously below to sanitize state at load time;
      // programMeta state is set for reactive use throughout the component.
      let localMeta: Record<string, any> = {};
      if (programResponse?.data?.statusCode === 200 && programResponse?.data?.data) {
        const rawProgramData = programResponse.data.data;
        [rawProgramData.programType || {}, rawProgramData].forEach((dataSource: Record<string, any>) => {
          Object.entries(dataSource).forEach(([key, val]) => {
            if (val !== null && val !== undefined && typeof val !== 'object' && !Array.isArray(val)) {
              localMeta[key] = val;
            }
          });
        });
        setProgramMeta(localMeta);
      }

      // Computes the set of binding keys that are visible given a meta + sections snapshot.
      const computeVisibleBindingKeys = (allSections: any[]): Set<string> => {
        const visibleKeys = new Set<string>();
        allSections.forEach((section) => {
          if (!evaluateConditionalConfig(section.conditionalConfig, localMeta)) return;
          section.items.forEach((item: any) => {
            if (item.type === SectionItemType.Question && evaluateConditionalConfig(item.question?.conditionalConfig, localMeta)) {
              const bindingKey = item.question?.question?.bindingKey;
              if (bindingKey) visibleKeys.add(bindingKey);
            } else if (item.type === SectionItemType.Subsection && evaluateConditionalConfig(item.conditionalConfig, localMeta)) {
              (item.questions || []).forEach((questionMap: any) => {
                if (evaluateConditionalConfig(questionMap.conditionalConfig, localMeta)) {
                  const bindingKey = questionMap.question?.bindingKey;
                  if (bindingKey) visibleKeys.add(bindingKey);
                }
              });
            }
          });
        });
        return visibleKeys;
      };

      // Sanitizes question configs within already-built transformedSections.
      // Questions whose dependsOn/prefill refs change get originalConfig stored
      // so buildSanitizeOverride can still generate correct API overrides.
      const sanitizeSectionsState = (allSections: any[]): any[] => {
        const validBindingKeys = computeVisibleBindingKeys(allSections);
        return allSections.map((section) => ({
          ...section,
          items: section.items.map((item: any) => {
            if (item.type === SectionItemType.Question) {
              const questionItem = item.question;
              const questionConfig = questionItem?.question?.config;
              if (!questionConfig) return item;
              const sanitizedConfig = sanitizeQuestionDependencies(questionConfig, validBindingKeys);
              if (sanitizedConfig === questionConfig) return item;
              return {
                ...item,
                question: {
                  ...questionItem,
                  originalConfig: questionConfig,
                  question: { ...questionItem.question, config: sanitizedConfig },
                },
              };
            } else if (item.type === SectionItemType.Subsection) {
              const sanitizedQuestions = (item.questions || []).map((questionMap: any) => {
                const questionConfig = questionMap?.question?.config;
                if (!questionConfig) return questionMap;
                const sanitizedConfig = sanitizeQuestionDependencies(questionConfig, validBindingKeys);
                if (sanitizedConfig === questionConfig) return questionMap;
                return {
                  ...questionMap,
                  originalConfig: questionConfig,
                  question: { ...questionMap.question, config: sanitizedConfig },
                };
              });
              return { ...item, questions: sanitizedQuestions };
            }
            return item;
          }),
        }));
      };

      if (
        programResponse?.data?.statusCode === 200 &&
        programResponse?.data?.data?.programQuestionMaps?.length > 0
      ) {
        const transformedQuestions = programResponse?.data?.data?.programQuestionMaps.map(
          (item: any) => {
            // Transform question options to handle new optionConfig format
            const transformedQuestion = transformQuestionOptions(item.question);
            return {
              id: item.id,
              question: {
                id: transformedQuestion.id,
                label: transformedQuestion.label,
                type: transformedQuestion.type,
                config: {
                  ...getDefaultValidationConfig(transformedQuestion.type),
                  ...transformedQuestion.config,
                  isAdvancedValidation:
                    transformedQuestion.config?.isAdvancedValidation || false,
                },
                formSection: {
                  id: item?.programQuestionFormSection?.id || 1,
                  name:
                    item.programQuestionFormSection?.name ||
                    FORM_BUILDER_DEFAULTS.SECTION_NAME,
                  description:
                    item.programQuestionFormSection?.description ||
                    FORM_BUILDER_DEFAULTS.SECTION_DESCRIPTION,
                },
                questionOptionMaps: transformedQuestion.questionOptionMaps || [],
                answerLocation: transformedQuestion.answerLocation || "",
                bindingKey: transformedQuestion.bindingKey || "",
              },
              displayOrder: item.displayOrder || 0,
              registrationLevel: item.registrationLevel || FORM_BUILDER_DEFAULTS.PROGRAM,
            };
          },
        );

        if (
          programResponse?.data?.statusCode === 200 &&
          programResponse.data.data?.programQuestionMaps?.length > 0
        ) {
          // Program has existing questions - load from program
          setIsProgramWithQuestions(true);
          const programData = programResponse.data.data;
          
          // Transform program data to form builder format
          const sectionsMap: { [key: number]: any } = {};
          const subSectionsMap: { [key: number]: any } = {};

          programData.programQuestionMaps.forEach((pqm: any) => {
            const formSection = pqm.programQuestionFormSection;
            const question = pqm.question;
            
            const questionData = {
              id: pqm.id, // programQuestionId
              programQuestionId: pqm.id,
              templateQuestionId: question.templateQuestionId,
              masterQuestionId: question.masterQuestionId,
              isEdited: false,
              savedConfig: question.config || getDefaultValidationConfig(question.type),
              conditionalConfig: question.conditionalConfig || null,
              question: {
                id: question.id,
                label: question.label,
                type: question.type,
                config: question.config || getDefaultValidationConfig(question.type),
                formSection: {
                  id: formSection.id,
                  name: formSection.name,
                  description: formSection.description || "",
                },
                questionOptionMaps: (question.questionOptionMaps || []).map((qom: any) => ({
                  id: qom.id,
                  option: {
                    id: qom?.option?.id,
                    name: qom?.option?.name,
                    type: qom?.option?.type,
                    status: qom?.option?.status,
                  },
                })),
                answerLocation: question.answerLocation || "",
                bindingKey: question.bindingKey || "",
                status: question.status,
              },
              displayOrder: pqm.displayOrder,
              registrationLevel: pqm.registrationLevel,
            };

            if (formSection.parentSectionId) {
              // This is a subsection
              if (!subSectionsMap[formSection.id]) {
                subSectionsMap[formSection.id] = {
                  type: SectionItemType.Subsection,
                  subSectionId: formSection.id,
                  formSectionId: formSection.id,
                  templateFormSectionId: formSection.templateFormSectionId,
                  masterFormSectionId: formSection.id,
                  subSectionName: formSection.name,
                  subSectionKey: formSection.key,
                  conditionalConfig: formSection.conditionalConfig || null,
                  questions: [],
                  parentSectionId: formSection.parentSectionId,
                };
              }
              subSectionsMap[formSection.id].questions.push(questionData);
            } else {
              // This is a parent section
              if (!sectionsMap[formSection.id]) {
                sectionsMap[formSection.id] = {
                  sectionId: formSection.id,
                  formSectionId: formSection.id,
                  templateFormSectionId: formSection.templateFormSectionId,
                  masterFormSectionId: formSection.id,
                  sectionName: formSection.name,
                  sectionKey: formSection.key,
                  conditionalConfig: formSection.conditionalConfig || null,
                  items: [],
                  sectionDisplayOrder: formSection.displayOrder,
                };
              }
              sectionsMap[formSection.id].items.push({
                type: SectionItemType.Question,
                question: questionData,
              });
            }
          });

          // Attach subsections to parent sections and calculate their display order
          Object.values(subSectionsMap).forEach((subSection: any) => {
            // Calculate subsection's displayOrder as the minimum displayOrder of its questions
            if (subSection.questions && subSection.questions.length > 0) {
              const minDisplayOrder = Math.min(...subSection.questions.map((q: any) => q.displayOrder));
              subSection.displayOrder = minDisplayOrder;
            }
            
            const parentSection = sectionsMap[subSection.parentSectionId];
            if (parentSection) {
              parentSection.items.push(subSection);
            }
          });

          const transformedSections = Object.values(sectionsMap);
          
          // Sort everything properly
          transformedSections.forEach((section: any) => {
            // Sort questions within each subsection by displayOrder
            section.items.forEach((item: any) => {
              if (item.type === SectionItemType.Subsection && item.questions) {
                item.questions.sort((a: any, b: any) => a.displayOrder - b.displayOrder);
              }
            });
            
            // Sort all items (questions and subsections) within section by displayOrder
            // For subsections, use the displayOrder we calculated (min of questions)
            section.items.sort((a: any, b: any) => {
              const aOrder = a.type === SectionItemType.Question ? a.question.displayOrder : a.displayOrder;
              const bOrder = b.type === SectionItemType.Question ? b.question.displayOrder : b.displayOrder;
              return aOrder - bOrder;
            });
          });
          
          // Sort sections by their displayOrder
          transformedSections.sort((a: any, b: any) => a.sectionDisplayOrder - b.sectionDisplayOrder);

          setSections({ sections: sanitizeSectionsState(transformedSections) });
          return;
        }
      }

      // No existing questions in program, load from template
      if (!templateId) return;
      setIsProgramWithQuestions(false);
      
      const response = await getCall(
        endPoints.programTemplate(templateId),
        undefined,
        PORTAL
      );

      if (response?.data?.statusCode === 200 && response.data.data) {
        const templateData = response.data.data;
        
        // Store original template data for change detection
        setOriginalTemplateData(templateData);

        // Transform template structure to form builder format
        const transformedSections = templateData.sections.map((section: any, sectionIndex: number) => {
          const items: any[] = [];
          
          // Process questions
          if (section.questions && section.questions.length > 0) {
            section.questions.forEach((question: any) => {
              items.push({
                type: SectionItemType.Question,
                question: {
                  id: question.id, // This is templateQuestionId
                  templateQuestionId: question.id,
                  masterQuestionId: question.masterQuestionId,
                  isEdited: false, // Track if this question has been modified
                  conditionalConfig: question.conditionalConfig || null,
                  question: {
                    id: question.id,
                    label: question.questionText,
                    type: question.questionType,
                    config: {
                      ...getDefaultValidationConfig(question.questionType),
                      ...question.config,
                      isAdvancedValidation: question.config?.isAdvancedValidation || false,
                    },
                    formSection: {
                      id: section.id,
                      name: section.name,
                      description: section.description || "",
                    },
                    questionOptionMaps: (question.optionConfig || []).map((opt: any, idx: number) => ({
                      id: idx,
                      option: {
                        id: idx,
                        name: opt.name || opt.value,
                        type: opt.type || "string",
                        status: "published",
                      },
                    })),
                    answerLocation: question.answerLocation || "",
                    bindingKey: question.bindingKey || "",
                    status: "published",
                  },
                  displayOrder: question.displayOrder,
                  registrationLevel: "program",
                }
              });
            });
          }

          // Process subsections if they exist
          if (section.subSections && section.subSections.length > 0) {
            section.subSections.forEach((subsection: any) => {
              const subsectionQuestions = (subsection.questions || []).map((question: any) => ({
                id: question.id,
                templateQuestionId: question.id,
                masterQuestionId: question.masterQuestionId,
                isEdited: false,
                conditionalConfig: question.conditionalConfig || null,
                question: {
                  id: question.id,
                  label: question.questionText,
                  type: question.questionType,
                  config: {
                    ...getDefaultValidationConfig(question.questionType),
                    ...question.config,
                    isAdvancedValidation: question.config?.isAdvancedValidation || false,
                  },
                  formSection: {
                    id: subsection.id,
                    name: subsection.name,
                    description: subsection.description || "",
                  },
                  questionOptionMaps: (question.optionConfig || []).map((opt: any, idx: number) => ({
                    id: idx,
                    option: {
                      id: idx,
                      name: opt.name || opt.value,
                      type: opt.type || "string",
                      status: "published",
                    },
                  })),
                  answerLocation: question.answerLocation || "",
                  bindingKey: question.bindingKey || "",
                  status: "published",
                },
                displayOrder: question.displayOrder,
                registrationLevel: "program",
              }));

              items.push({
                type: SectionItemType.Subsection,
                subSectionId: subsection.id,
                templateFormSectionId: subsection.id,
                masterFormSectionId: subsection.masterFormSectionId,
                subSectionName: subsection.name,
                subSectionKey: subsection.sectionKey,
                conditionalConfig: subsection.conditionalConfig || null,
                questions: subsectionQuestions
              });
            });
          }

          return {
            sectionId: section.id,
            templateFormSectionId: section.id,
            masterFormSectionId: section.masterFormSectionId,
            sectionName: section.name,
            sectionKey: section.sectionKey,
            conditionalConfig: section.conditionalConfig || null,
            items: items,
            sectionDisplayOrder: section.displayOrder,
          };
        });

        setSections({ sections: sanitizeSectionsState(transformedSections) });
      }
    } catch (error) {
      // Error fetching template data
    }
  };

  useEffect(() => {
    if (templateId || programId) {
      fetchTemplateData();
    }
  }, [templateId, programId]);

  const addField = (sectionIndex: number) => {
    const currentSection = sections.sections[sectionIndex];

    const questionItems = currentSection.items.filter((item) => item.type === SectionItemType.Question);
    const maxDisplayOrder =
      questionItems.length > 0
        ? Math.max(...questionItems.map((item) => item.question.displayOrder))
        : -1;

    const newDisplayOrder = maxDisplayOrder + 1;

    const newField = {
      id: Date.now(),
      isEdited: true,
      question: {
        label: FORM_BUILDER_TEXT.DEFAULT_VALUES.NEW_FIELD,
        type: "text",
        config: getDefaultValidationConfig("text"),
        status: "published",
        formSection: {
          id: currentSection.sectionId,
          name: currentSection.sectionName,
          description: "",
        },
        questionOptionMaps: [],
      },
      displayOrder: newDisplayOrder,
    };

    const updatedSections = [...sections.sections];
    updatedSections[sectionIndex].items.push({
      type: SectionItemType.Question,
      question: newField
    });
    setSections({ sections: updatedSections });
  };

  const updateField = (
    sectionIndex: number,
    questionIndex: number,
    updates: any,
  ) => {
    const updatedSections = [...sections.sections];
    const item = updatedSections[sectionIndex].items[questionIndex];
    if (item.type !== SectionItemType.Question) return;
    
    const question = item.question;
    // Deep merge the updates
    const updatedQuestion = {
      ...question,
      isEdited: true,
      question: {
        ...question.question,
        ...updates,
        config: {
          ...question.question.config,
          ...(updates.config || {}),
        },
      },
    };

    updatedSections[sectionIndex].items[questionIndex].question = updatedQuestion;
    setSections({ sections: updatedSections });
  };

  const deleteField = (sectionIndex: number, questionIndex: number) => {
    const updatedSections = [...sections.sections];
    const item = updatedSections[sectionIndex].items[questionIndex];
    const currentSection = updatedSections[sectionIndex];
    
    if (item.type === SectionItemType.Question) {
      const questionToDelete = item.question;
      const programQuestionId = questionToDelete.programQuestionId || questionToDelete.id;
      if (
        programQuestionId &&
        programQuestionId < EXISTING_ID_THRESHOLD
      ) {
        // Track deleted programQuestionId per section
        setDeletedQuestionIds((prev) => ({
          ...prev,
          [currentSection.sectionId]: [
            ...(prev[currentSection.sectionId] || []),
            programQuestionId
          ]
        }));
      }
    }

    updatedSections[sectionIndex].items.splice(questionIndex, 1);
    setSections({ sections: updatedSections });
  };

  const moveQuestionUp = (sectionIndex: number, questionIndex: number) => {
    if (questionIndex === 0) return; // Can't move first item up
    
    const updatedSections = [...sections.sections];
    const items = updatedSections[sectionIndex].items;
    
    const currentItem = items[questionIndex];
    const previousItem = items[questionIndex - 1];
    
    if (currentItem.type !== SectionItemType.Question) return;
    
    const currentDisplayOrder = currentItem.question.displayOrder;
    
    // Swap items
    [items[questionIndex], items[questionIndex - 1]] = 
    [items[questionIndex - 1], items[questionIndex]];
    
    // Update display orders based on what we're swapping with
    if (previousItem.type === SectionItemType.Question) {
      // Swapping two questions
      const previousDisplayOrder = previousItem.question.displayOrder;
      currentItem.question.displayOrder = previousDisplayOrder;
      currentItem.question.isEdited = true;
      previousItem.question.displayOrder = currentDisplayOrder;
      previousItem.question.isEdited = true;
    } else if (previousItem.type === SectionItemType.Subsection) {
      // Swapping question with subsection above
      const subsectionOrders = (previousItem.questions || []).map((q: any) => q.displayOrder);
      if (subsectionOrders.length > 0) {
        const subsectionMin = Math.min(...subsectionOrders);
        const subsectionMax = Math.max(...subsectionOrders);
        
        // Question moves to subsection's min position
        currentItem.question.displayOrder = subsectionMin;
        currentItem.question.isEdited = true;
        
        // Subsection questions shift down
        const offset = currentDisplayOrder - subsectionMin;
        previousItem.questions.forEach((question: any) => {
          question.displayOrder = question.displayOrder + offset;
          question.isEdited = true;
        });
      }
    }
    
    setSections({ sections: updatedSections });
  };

  const moveQuestionDown = (sectionIndex: number, questionIndex: number) => {
    const updatedSections = [...sections.sections];
    const items = updatedSections[sectionIndex].items;
    
    if (questionIndex === items.length - 1) return; // Can't move last item down
    
    const currentItem = items[questionIndex];
    const nextItem = items[questionIndex + 1];
    
    if (currentItem.type !== SectionItemType.Question) return;
    
    const currentDisplayOrder = currentItem.question.displayOrder;
    
    // Swap items
    [items[questionIndex], items[questionIndex + 1]] = 
    [items[questionIndex + 1], items[questionIndex]];
    
    // Update display orders based on what we're swapping with
    if (nextItem.type === SectionItemType.Question) {
      // Swapping two questions
      const nextDisplayOrder = nextItem.question.displayOrder;
      currentItem.question.displayOrder = nextDisplayOrder;
      currentItem.question.isEdited = true;
      nextItem.question.displayOrder = currentDisplayOrder;
      nextItem.question.isEdited = true;
    } else if (nextItem.type === SectionItemType.Subsection) {
      // Swapping question with subsection below
      const subsectionOrders = (nextItem.questions || []).map((q: any) => q.displayOrder);
      if (subsectionOrders.length > 0) {
        const subsectionMin = Math.min(...subsectionOrders);
        
        // Question moves to subsection's min position
        currentItem.question.displayOrder = subsectionMin;
        currentItem.question.isEdited = true;
        
        // Subsection questions shift up
        const offset = currentDisplayOrder - subsectionMin;
        nextItem.questions.forEach((question: any) => {
          question.displayOrder = question.displayOrder + offset;
          question.isEdited = true;
        });
      }
    }
    
    setSections({ sections: updatedSections });
  };

  const toggleSectionCollapse = (sectionIndex: number) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionIndex)) {
      newCollapsed.delete(sectionIndex);
    } else {
      newCollapsed.add(sectionIndex);
    }
    setCollapsedSections(newCollapsed);
  };

  const addSection = () => {
    const timestamp = Date.now();
    const newSection = {
      sectionId: timestamp,
      sectionName: FORM_BUILDER_TEXT.DEFAULT_VALUES.NEW_SECTION,
      sectionKey: `FS_CUSTOM_${timestamp}`,
      items: [],
      sectionDisplayOrder: sections.sections.length,
    };

    setSections({
      sections: [...sections.sections, newSection],
    });
  };

  // Subsection functions
  const createSubSection = (sectionIndex: number) => {
    if (!newSubSectionName.trim()) return;
    
    const updatedSections = [...sections.sections];
    const timestamp = Date.now();
    const newSubSection = {
      type: SectionItemType.Subsection,
      subSectionId: timestamp,
      subSectionName: newSubSectionName,
      subSectionKey: `FSS_CUSTOM_${timestamp}`,
      questions: []
    };
    
    updatedSections[sectionIndex].items.push(newSubSection);
    setSections({ sections: updatedSections });
    setNewSubSectionName("");
    setIsSubSectionModalOpen(false);
  };

  const openSubSectionModal = (sectionIndex: number) => {
    setTargetSectionIndex(sectionIndex);
    setIsSubSectionModalOpen(true);
  };

  const addFieldToSubSection = (sectionIndex: number, subSectionItemIndex: number) => {
    const updatedSections = [...sections.sections];
    const subSection = updatedSections[sectionIndex].items[subSectionItemIndex];
    
    if (subSection.type !== SectionItemType.Subsection) return;
    
    const currentSection = updatedSections[sectionIndex];
    
    // Find max display order from all questions in the entire section (including subsections)
    let maxDisplayOrder = 0;
    currentSection.items.forEach((item) => {
      if (item.type === SectionItemType.Question) {
        maxDisplayOrder = Math.max(maxDisplayOrder, item.question.displayOrder);
      } else if (item.type === SectionItemType.Subsection && item.questions) {
        item.questions.forEach((q: any) => {
          maxDisplayOrder = Math.max(maxDisplayOrder, q.displayOrder);
        });
      }
    });
    
    const newField = {
      id: Date.now(),
      isEdited: true,
      question: {
        label: FORM_BUILDER_TEXT.DEFAULT_VALUES.NEW_FIELD,
        type: "text",
        config: getDefaultValidationConfig("text"),
        status: "published",
        formSection: {
          id: currentSection.sectionId,
          name: currentSection.sectionName,
          description: "",
        },
        questionOptionMaps: [],
      },
      displayOrder: maxDisplayOrder + 1,
    };
    
    if (!subSection.questions) {
      subSection.questions = [];
    }
    subSection.questions.push(newField);
    setSections({ sections: updatedSections });
  };

  const moveSubSectionQuestionUp = (sectionIndex: number, subSectionItemIndex: number, questionIndex: number) => {
    if (questionIndex === 0) return;
    
    const updatedSections = [...sections.sections];
    const subSection = updatedSections[sectionIndex].items[subSectionItemIndex];
    
    if (subSection.type !== SectionItemType.Subsection || !subSection.questions) return;
    
    const questions = subSection.questions;
    [questions[questionIndex], questions[questionIndex - 1]] = 
    [questions[questionIndex - 1], questions[questionIndex]];
    
    questions[questionIndex].displayOrder = questionIndex;
    questions[questionIndex].isEdited = true;
    questions[questionIndex - 1].displayOrder = questionIndex - 1;
    questions[questionIndex - 1].isEdited = true;
    
    setSections({ sections: updatedSections });
  };

  const moveSubSectionQuestionDown = (sectionIndex: number, subSectionItemIndex: number, questionIndex: number) => {
    const updatedSections = [...sections.sections];
    const subSection = updatedSections[sectionIndex].items[subSectionItemIndex];
    
    if (subSection.type !== SectionItemType.Subsection || !subSection.questions) return;
    
    const questions = subSection.questions;
    if (questionIndex === questions.length - 1) return;
    
    [questions[questionIndex], questions[questionIndex + 1]] = 
    [questions[questionIndex + 1], questions[questionIndex]];
    
    questions[questionIndex].displayOrder = questionIndex;
    questions[questionIndex].isEdited = true;
    questions[questionIndex + 1].displayOrder = questionIndex + 1;
    questions[questionIndex + 1].isEdited = true;
    
    setSections({ sections: updatedSections });
  };

  const deleteSubSectionQuestion = (sectionIndex: number, subSectionItemIndex: number, questionIndex: number) => {
    const updatedSections = [...sections.sections];
    const subSection = updatedSections[sectionIndex].items[subSectionItemIndex];
    const currentSection = updatedSections[sectionIndex];
    
    if (subSection.type !== SectionItemType.Subsection || !subSection.questions) return;
    
    const questionToDelete = subSection.questions[questionIndex];
    const programQuestionId = questionToDelete.programQuestionId || questionToDelete.id;
    if (programQuestionId && programQuestionId < EXISTING_ID_THRESHOLD) {
      // Track deleted programQuestionId per section
      setDeletedQuestionIds((prev) => ({
        ...prev,
        [currentSection.sectionId]: [
          ...(prev[currentSection.sectionId] || []),
          programQuestionId
        ]
      }));
    }
    
    subSection.questions.splice(questionIndex, 1);
    setSections({ sections: updatedSections });
  };

  const moveQuestionToSubSection = (sectionIndex: number, questionIndex: number, subSectionId: number) => {
    const updatedSections = [...sections.sections];
    const items = updatedSections[sectionIndex].items;
    const currentSection = updatedSections[sectionIndex];
    
    // First find the subsection
    const subSectionIndex = items.findIndex(
      (item) => item.type === SectionItemType.Subsection && item.subSectionId === subSectionId
    );
    
    if (subSectionIndex === -1) return;
    
    // Then get the question
    const item = items[questionIndex];
    if (item.type !== SectionItemType.Question) return;
    
    const questionToMove = item.question;
    const originalDisplayOrder = questionToMove.displayOrder;
    
    // If this is an existing question (from DB), track it as deleted from parent section
    const programQuestionId = questionToMove.programQuestionId || questionToMove.id;
    if (programQuestionId && programQuestionId < EXISTING_ID_THRESHOLD) {
      setDeletedQuestionIds((prev) => ({
        ...prev,
        [currentSection.sectionId]: [
          ...(prev[currentSection.sectionId] || []),
          programQuestionId
        ]
      }));
    }
    
    // Mark question as edited and moved to subsection
    questionToMove.isEdited = true;
    questionToMove.movedToSubSection = true;
    
    // Get subsection's display order range
    const subsectionQuestions = items[subSectionIndex].questions || [];
    const subsectionMin = subsectionQuestions.length > 0 
      ? Math.min(...subsectionQuestions.map((q: any) => q.displayOrder))
      : originalDisplayOrder;
    const subsectionMax = subsectionQuestions.length > 0
      ? Math.max(...subsectionQuestions.map((q: any) => q.displayOrder))
      : originalDisplayOrder - 1;
    
    // Update display orders for items between the moved question and the subsection
    // All items in this range shift up by 1
    items.forEach((currentItem, idx) => {
      if (currentItem.type === SectionItemType.Question) {
        const currentOrder = currentItem.question.displayOrder;
        // Questions between original position and subsection shift up
        if (currentOrder > originalDisplayOrder && currentOrder < subsectionMin) {
          currentItem.question.displayOrder = currentOrder - 1;
          currentItem.question.isEdited = true;
        }
      } else if (currentItem.type === SectionItemType.Subsection && idx === subSectionIndex) {
        // Subsection questions shift up by 1
        (currentItem.questions || []).forEach((q: any) => {
          q.displayOrder = q.displayOrder - 1;
          q.isEdited = true;
        });
      }
    });
    
    // Set moved question's display order to the end of subsection (after shift)
    questionToMove.displayOrder = subsectionMax; // subsectionMax is now subsectionMax - 1 after shift, so +1 gives us subsectionMax
    
    // Add to subsection
    if (!items[subSectionIndex].questions) {
      items[subSectionIndex].questions = [];
    }
    items[subSectionIndex].questions!.push(questionToMove);
    
    // Remove from main items
    items.splice(questionIndex, 1);
    
    setSections({ sections: updatedSections });
  };

  const moveQuestionOutOfSubSection = (sectionIndex: number, subSectionItemIndex: number, questionIndex: number) => {
    const updatedSections = [...sections.sections];
    const items = updatedSections[sectionIndex].items;
    const subSection = items[subSectionItemIndex];
    const currentSection = updatedSections[sectionIndex];
    
    if (subSection.type !== SectionItemType.Subsection || !subSection.questions) return;
    
    const question = subSection.questions[questionIndex];
    
    // If this is an existing question being moved out of subsection, track it as deleted from SUBSECTION
    const programQuestionId = question.programQuestionId || question.id;
    if (programQuestionId && programQuestionId < EXISTING_ID_THRESHOLD && subSection.subSectionId) {
      // Track deletion in the SUBSECTION's deleteQuestionIds, not parent section
      setDeletedQuestionIds((prev) => ({
        ...prev,
        [subSection.subSectionId]: [
          ...(prev[subSection.subSectionId] || []),
          programQuestionId
        ]
      }));
    }
    
    // Mark question as edited and moved out of subsection
    question.isEdited = true;
    question.movedOutOfSubSection = true;
    // Clear the movedToSubSection flag if it was set
    if (question.movedToSubSection) {
      delete question.movedToSubSection;
    }
    
    subSection.questions.splice(questionIndex, 1);
    
    // Insert question right after the subsection
    items.splice(subSectionItemIndex + 1, 0, {
      type: SectionItemType.Question,
      question: question
    });
    
    setSections({ sections: updatedSections });
  };

  const updateSubSectionField = (sectionIndex: number, subSectionItemIndex: number, questionIndex: number, updates: any) => {
    const updatedSections = [...sections.sections];
    const subSection = updatedSections[sectionIndex].items[subSectionItemIndex];
    
    if (subSection.type !== SectionItemType.Subsection || !subSection.questions) return;
    
    const question = subSection.questions[questionIndex];
    const updatedQuestion = {
      ...question,
      isEdited: true,
      question: {
        ...question.question,
        ...updates,
        config: {
          ...question.question.config,
          ...(updates.config || {}),
        },
      },
    };
    
    subSection.questions[questionIndex] = updatedQuestion;
    setSections({ sections: updatedSections });
  };

  const deleteSubSection = (sectionIndex: number, subSectionItemIndex: number) => {
    const updatedSections = [...sections.sections];
    const items = updatedSections[sectionIndex].items;
    const subSection = items[subSectionItemIndex];
    
    if (subSection.type !== SectionItemType.Subsection) return;
    
    // Track deleted subsection ID if it exists in database
    if (subSection.type === SectionItemType.Subsection && subSection.subSectionId) {
      const sectionIdToDelete = subSection.subSectionId;
      if (typeof sectionIdToDelete === 'number' && sectionIdToDelete < EXISTING_ID_THRESHOLD) {
        setDeletedSectionIds((prev) => [...prev, sectionIdToDelete]);
      }
    }
    
    // Move all questions out of subsection first
    const questionsToMove = subSection.questions || [];
    questionsToMove.reverse().forEach((question) => {
      items.splice(subSectionItemIndex + 1, 0, {
        type: SectionItemType.Question,
        question: question
      });
    });
    
    // Remove subsection
    items.splice(subSectionItemIndex, 1);
    
    setSections({ sections: updatedSections });
  };

  const moveSubSectionUp = (sectionIndex: number, subSectionItemIndex: number) => {
    if (subSectionItemIndex === 0) return;
    
    const updatedSections = [...sections.sections];
    const items = updatedSections[sectionIndex].items;
    
    const currentItem = items[subSectionItemIndex];
    const previousItem = items[subSectionItemIndex - 1];
    
    if (currentItem.type !== SectionItemType.Subsection) return;
    
    // Get display order ranges
    const getItemDisplayOrders = (item: any): number[] => {
      if (item.type === SectionItemType.Question) {
        return [item.question.displayOrder];
      } else if (item.type === SectionItemType.Subsection) {
        return (item.questions || []).map((q: any) => q.displayOrder);
      }
      return [];
    };
    
    const currentOrders = getItemDisplayOrders(currentItem);
    const previousOrders = getItemDisplayOrders(previousItem);
    
    if (currentOrders.length === 0 || previousOrders.length === 0) return;
    
    const previousMin = Math.min(...previousOrders);
    const subsectionLength = currentOrders.length;
    
    // Swap positions in array
    [items[subSectionItemIndex], items[subSectionItemIndex - 1]] = 
    [items[subSectionItemIndex - 1], items[subSectionItemIndex]];
    
    // Update display orders - subsection moves to previous item's position
    currentItem.questions.forEach((question: any, idx: number) => {
      question.displayOrder = previousMin + idx;
      question.isEdited = true;
    });
    
    // Update previous item's display orders - it moves down to AFTER the subsection
    const newPositionForPrevious = previousMin + subsectionLength;
    if (previousItem.type === SectionItemType.Question) {
      previousItem.question.displayOrder = newPositionForPrevious;
      previousItem.question.isEdited = true;
    } else if (previousItem.type === SectionItemType.Subsection) {
      previousItem.questions.forEach((question: any, idx: number) => {
        question.displayOrder = newPositionForPrevious + idx;
        question.isEdited = true;
      });
    }
    
    setSections({ sections: updatedSections });
  };

  const moveSubSectionDown = (sectionIndex: number, subSectionItemIndex: number) => {
    const updatedSections = [...sections.sections];
    const items = updatedSections[sectionIndex].items;
    
    if (subSectionItemIndex === items.length - 1) return;
    
    const currentItem = items[subSectionItemIndex];
    const nextItem = items[subSectionItemIndex + 1];
    
    if (currentItem.type !== SectionItemType.Subsection) return;
    
    // Get display order ranges
    const getItemDisplayOrders = (item: any): number[] => {
      if (item.type === SectionItemType.Question) {
        return [item.question.displayOrder];
      } else if (item.type === SectionItemType.Subsection) {
        return (item.questions || []).map((q: any) => q.displayOrder);
      }
      return [];
    };
    
    const currentOrders = getItemDisplayOrders(currentItem);
    const nextOrders = getItemDisplayOrders(nextItem);
    
    if (currentOrders.length === 0 || nextOrders.length === 0) return;
    
    const currentMin = Math.min(...currentOrders);
    const nextMin = Math.min(...nextOrders);
    const nextLength = nextOrders.length;
    
    // Swap positions in array
    [items[subSectionItemIndex], items[subSectionItemIndex + 1]] = 
    [items[subSectionItemIndex + 1], items[subSectionItemIndex]];
    
    // Update next item's display orders - it moves up to current subsection's position
    if (nextItem.type === SectionItemType.Question) {
      nextItem.question.displayOrder = currentMin;
      nextItem.question.isEdited = true;
    } else if (nextItem.type === SectionItemType.Subsection) {
      nextItem.questions.forEach((question: any, idx: number) => {
        question.displayOrder = currentMin + idx;
        question.isEdited = true;
      });
    }
    
    // Update subsection display orders - it moves down to AFTER the next item
    const newPositionForCurrent = currentMin + nextLength;
    currentItem.questions.forEach((question: any, idx: number) => {
      question.displayOrder = newPositionForCurrent + idx;
      question.isEdited = true;
    });
    
    setSections({ sections: updatedSections });
  };

  // Helper to find original question from template data
  const findOriginalQuestion = (templateQuestionId: string) => {
    if (!originalTemplateData) return null;
    
    for (const section of originalTemplateData.sections) {
      const question = section.questions?.find((q: any) => q.id === templateQuestionId);
      if (question) return question;
    }
    return null;
  };

  // Helper to build override object with only changed fields
  const buildOverrideObject = (currentQuestion: any, originalQuestion: any) => {
    const override: any = {};
    
    // Check label change
    if (currentQuestion.question.label !== originalQuestion.questionText) {
      override.label = currentQuestion.question.label;
    }
    
    // Check placeholder change
    if (currentQuestion.question.config.placeholder !== originalQuestion.config?.placeholder) {
      override.placeholder = currentQuestion.question.config.placeholder;
    }
    
    // Check config changes
    const configOverride: any = {};
    const currentConfig = currentQuestion.question.config;
    const originalConfig = originalQuestion.config || {};

    // Compare common config fields
    VALIDATION_FIELD_NAMES.forEach(field => {
      if (JSON.stringify(currentConfig[field]) !== JSON.stringify(originalConfig[field])) {
        configOverride[field] = currentConfig[field];
      }
    });

    // dependsOn and prefill live inside config
    if (JSON.stringify(currentConfig.dependsOn) !== JSON.stringify(originalConfig.dependsOn)) {
      configOverride.dependsOn = currentConfig.dependsOn;
    }
    if (JSON.stringify(currentConfig.prefill) !== JSON.stringify(originalConfig.prefill)) {
      configOverride.prefill = currentConfig.prefill;
    }

    if (Object.keys(configOverride).length > 0) {
      override.config = { ...originalConfig, ...configOverride };
    }
    
    // Check option changes for radio/checkbox/select
    if (OPTION_FIELD_TYPES.includes(currentQuestion.question.type)) {
      const currentOptions = currentQuestion.question.questionOptionMaps.map((qom: any) => qom.option.name);
      const originalOptions = (originalQuestion.optionConfig || []).map((opt: any) => opt.name || opt.value);
      
      if (JSON.stringify(currentOptions) !== JSON.stringify(originalOptions)) {
        override.optionConfig = currentOptions.map((name: string, idx: number) => ({
          value: name,
          name: name,
          type: "string",
          order: idx
        }));
      }
    }
    
    return Object.keys(override).length > 0 ? override : null;
  };

  // New payload builder for template-based form
  const prepareTemplateSavePayload = (includeCloneFlag: boolean = true) => {
    const payload: any = {
      programId: parseInt(programId),
      programTemplateId: parseInt(templateId),
    };
    
    // Only include cloneFromTemplate for initial submission
    if (includeCloneFlag) {
      payload.cloneFromTemplate = true;
      return payload;
    }
    
    // For updates, include full sections data
    payload.sections = [];

    // Build set of valid question binding keys (only from sections that pass conditionalConfig)
    const validBindingKeys = new Set<string>();
    sections.sections.forEach((section) => {
      if (!evaluateConditionalConfig(section.conditionalConfig, programMeta)) return;
      section.items.forEach((item) => {
        if (item.type === SectionItemType.Question && evaluateConditionalConfig(item.question?.conditionalConfig, programMeta)) {
          const bindingKey = item.question?.question?.bindingKey;
          if (bindingKey) validBindingKeys.add(bindingKey);
        } else if (item.type === SectionItemType.Subsection && evaluateConditionalConfig(item.conditionalConfig, programMeta)) {
          (item.questions || []).forEach((questionMap: any) => {
            if (evaluateConditionalConfig(questionMap.conditionalConfig, programMeta)) {
              const bindingKey = questionMap.question?.bindingKey;
              if (bindingKey) validBindingKeys.add(bindingKey);
            }
          });
        }
      });
    });

    // Returns only the dependsOn/prefill fields that were sanitized at load time,
    // so they can be sent as an override for template/master unchanged questions.
    // q.originalConfig is set by fetchTemplateData when sanitization changed the config.
    const buildSanitizeOverride = (questionMap: any): Record<string, any> | null => {
      const originalCfg = questionMap.originalConfig;
      if (!originalCfg) return null; // no sanitization occurred for this question
      const sanitizedCfg = questionMap?.question?.config;
      if (!sanitizedCfg) return null;
      const configOverride: Record<string, any> = {};
      if (sanitizedCfg.dependsOn !== originalCfg.dependsOn) configOverride.dependsOn = sanitizedCfg.dependsOn;
      if (sanitizedCfg.prefill !== originalCfg.prefill) configOverride.prefill = sanitizedCfg.prefill;
      return Object.keys(configOverride).length > 0 ? { config: configOverride } : null;
    };

    let globalDisplayOrder = 1;

    sections.sections.forEach((section, sectionIndex) => {
      if (!evaluateConditionalConfig(section.conditionalConfig, programMeta)) return;
      const sectionPayload: any = {
        displayOrder: section.sectionDisplayOrder,
        questions: [],
        subSections: []
      };

      // Check if section has changes or is new
      if (section.templateFormSectionId) {
        sectionPayload.templateFormSectionId = typeof section.templateFormSectionId === 'number' ? section.templateFormSectionId : parseInt(String(section.templateFormSectionId));
      } else if (section.masterFormSectionId) {
        sectionPayload.formSectionId = typeof section.masterFormSectionId === 'number' ? section.masterFormSectionId : parseInt(String(section.masterFormSectionId));
      } else {
        // New custom section - both sectionName and sectionKey are required
        const sectionName = section.sectionName?.trim() || `Section ${sectionIndex + 1}`;
        const sectionKey = section.sectionKey || `FS_CUSTOM_${Date.now()}_${sectionIndex}`;
        sectionPayload.sectionName = sectionName;
        sectionPayload.sectionKey = sectionKey;
      }

      const buildQuestionPayload = (question: any): any => {
        const questionPayload: any = { displayOrder: globalDisplayOrder++ };
        if (question.templateQuestionId && !question.isEdited) {
          questionPayload.templateQuestionId = parseInt(question.templateQuestionId);
          const sanitizeOverride = buildSanitizeOverride(question);
          if (sanitizeOverride) {
            questionPayload.override = sanitizeOverride.config
              ? { ...sanitizeOverride, config: { ...(question.originalConfig || {}), ...sanitizeOverride.config } }
              : sanitizeOverride;
          }
        } else if (question.templateQuestionId && question.isEdited) {
          const original = findOriginalQuestion(question.templateQuestionId);
          if (original) {
            questionPayload.templateQuestionId = parseInt(question.templateQuestionId);
            const override: any = buildOverrideObject(question, original) || {};
            const sanitizeOverride = buildSanitizeOverride(question);
            if (sanitizeOverride) {
              if (sanitizeOverride.config && override.config) {
                // override.config is already the full merged config; apply only the sanitized field changes on top
                override.config = { ...override.config, ...sanitizeOverride.config };
              } else if (sanitizeOverride.config) {
                // No user config edits but sanitization changed config — send full merged config
                override.config = { ...(question.originalConfig || {}), ...sanitizeOverride.config };
              } else {
                Object.assign(override, sanitizeOverride);
              }
            }
            if (Object.keys(override).length > 0) questionPayload.override = override;
          }
        } else if (question.masterQuestionId && !question.isEdited) {
          questionPayload.masterQuestionId = parseInt(question.masterQuestionId);
          const sanitizeOverride = buildSanitizeOverride(question);
          if (sanitizeOverride) {
            questionPayload.override = sanitizeOverride.config
              ? { ...sanitizeOverride, config: { ...(question.originalConfig || {}), ...sanitizeOverride.config } }
              : sanitizeOverride;
          }
        } else {
          // New custom question
          questionPayload.label = question.question.label;
          questionPayload.type = question.question.type;
          questionPayload.answerType = question?.question?.answerType || "string";
          questionPayload.config = sanitizeQuestionDependencies(question.question.config, validBindingKeys);
          if (OPTION_FIELD_TYPES.includes(question.question.type)) {
            questionPayload.optionConfig = question.question.questionOptionMaps.map((qom: any, idx: number) => ({
              value: qom?.option?.name,
              name: qom?.option?.name,
              type: qom?.option?.type || "string",
              order: idx,
            }));
          }
        }

        return questionPayload;
      };

      section.items.forEach((item) => {
        if (item.type === SectionItemType.Subsection) {
          if (!evaluateConditionalConfig(item.conditionalConfig, programMeta)) return;

          const subSectionPayload: any = {
            displayOrder: globalDisplayOrder++,
            questions: []
          };

          if (item.templateFormSectionId) {
            subSectionPayload.templateFormSectionId = typeof item.templateFormSectionId === 'number' ? item.templateFormSectionId : parseInt(String(item.templateFormSectionId));
          } else if (item.masterFormSectionId) {
            subSectionPayload.formSectionId = typeof item.masterFormSectionId === 'number' ? item.masterFormSectionId : parseInt(String(item.masterFormSectionId));
          } else {
            subSectionPayload.sectionName = item.subSectionName?.trim() || "Subsection";
            subSectionPayload.sectionKey = item.subSectionKey || `FSS_CUSTOM_${Date.now()}`;
          }

          (item.questions || []).forEach((question: any) => {
            if (!evaluateConditionalConfig(question.conditionalConfig, programMeta)) return;
            subSectionPayload.questions.push(buildQuestionPayload(question));
          });

          sectionPayload.subSections.push(subSectionPayload);
        } else if (item.type === SectionItemType.Question) {
          if (!evaluateConditionalConfig(item.question?.conditionalConfig, programMeta)) return;
          sectionPayload.questions.push(buildQuestionPayload(item.question));
        }
      });

      payload.sections.push(sectionPayload);
    });
    
    payload.createdBy = userId;
    
    return payload;
  };

  // New payload builder for PATCH requests when program has existing questions
  const preparePatchPayload = () => {
    const payload: any = {
      deleteSectionIds: deletedSectionIds,
      updateSections: [],
      addSections: [],
    };

    // Build set of valid question binding keys for dependency sanitization
    const validBindingKeys = new Set<string>();
    sections.sections.forEach((section) => {
      if (!evaluateConditionalConfig(section.conditionalConfig, programMeta)) return;
      section.items.forEach((item) => {
        if (item.type === SectionItemType.Question && evaluateConditionalConfig(item.question?.conditionalConfig, programMeta)) {
          const bindingKey = item.question?.question?.bindingKey;
          if (bindingKey) validBindingKeys.add(bindingKey);
        } else if (item.type === SectionItemType.Subsection && evaluateConditionalConfig(item.conditionalConfig, programMeta)) {
          (item.questions || []).forEach((questionMap: any) => {
            if (evaluateConditionalConfig(questionMap.conditionalConfig, programMeta)) {
              const bindingKey = questionMap.question?.bindingKey;
              if (bindingKey) validBindingKeys.add(bindingKey);
            }
          });
        }
      });
    });

    // Returns only config fields that differ from the saved (DB) baseline (savedConfig).
    const buildPatchConfigOverride = (question: any): any | null => {
      const currentConfig = sanitizeQuestionDependencies(question.question.config, validBindingKeys);
      const baseConfig = question.savedConfig || {};
      const diff: any = {};
      const allKeys = new Set([...Object.keys(currentConfig), ...Object.keys(baseConfig)]);
      allKeys.forEach((key) => {
        if (JSON.stringify(currentConfig[key]) !== JSON.stringify(baseConfig[key])) {
          diff[key] = currentConfig[key];
        }
      });
      return Object.keys(diff).length > 0 ? currentConfig : null;
    };

    let globalDisplayOrder = 1;

    sections.sections.forEach((section, sectionIndex) => {
      if (!evaluateConditionalConfig(section.conditionalConfig, programMeta)) return;

      const isExistingSection = section.sectionId && section.sectionId < EXISTING_ID_THRESHOLD;
      const isNewSection = !isExistingSection;
      
      if (isNewSection) {
        // New section - add to addSections
        const newSection: any = {
          sectionName: section.sectionName,
          sectionKey: section.sectionKey || `FS_CUSTOM_${Date.now()}_${sectionIndex}`,
          displayOrder: section.sectionDisplayOrder,
          questions: [],
        };

        section.items.forEach((item) => {
          if (item.type === SectionItemType.Subsection) {
            if (!evaluateConditionalConfig(item.conditionalConfig, programMeta)) return;
            // New subsection in new section - add questions with subsection metadata
            (item.questions || []).forEach((question: any) => {
              if (!evaluateConditionalConfig(question.conditionalConfig, programMeta)) return;
              const currentDisplayOrder = globalDisplayOrder++;
              const questionPayload: any = {
                displayOrder: currentDisplayOrder,
                isNewSubSection: true,
                sectionKey: item.subSectionKey || `FSS_CUSTOM_${Date.now()}`,
                parentSectionName: item.subSectionName,
              };

              if (question.masterQuestionId) {
                questionPayload.masterQuestionId = parseInt(question.masterQuestionId);
              } else if (question.templateQuestionId) {
                questionPayload.templateQuestionId = parseInt(question.templateQuestionId);
              } else {
                questionPayload.label = question.question.label;
                questionPayload.type = question.question.type;
                questionPayload.answerType = question?.question?.answerType || "string";
                questionPayload.config = sanitizeQuestionDependencies(question.question.config, validBindingKeys);

                if (OPTION_FIELD_TYPES.includes(question.question.type)) {
                  questionPayload.optionConfig = question.question.questionOptionMaps.map((qom: any, idx: number) => ({
                    value: qom?.option?.name,
                    name: qom?.option?.name,
                    type: qom?.option?.type || "string",
                    order: idx,
                  }));
                }
              }

              newSection.questions.push(questionPayload);
            });
          } else if (item.type === SectionItemType.Question) {
            if (!evaluateConditionalConfig(item.question?.conditionalConfig, programMeta)) return;
            const question = item.question;
            const currentDisplayOrder = globalDisplayOrder++;
            const questionPayload: any = {
              displayOrder: currentDisplayOrder,
            };

            if (question.masterQuestionId) {
              questionPayload.masterQuestionId = parseInt(question.masterQuestionId);
            } else if (question.templateQuestionId) {
              questionPayload.templateQuestionId = parseInt(question.templateQuestionId);
            } else {
              questionPayload.label = question.question.label;
              questionPayload.type = question.question.type;
              questionPayload.answerType = question?.question?.answerType || "string";
              questionPayload.config = sanitizeQuestionDependencies(question.question.config, validBindingKeys);

              if (OPTION_FIELD_TYPES.includes(question.question.type)) {
                questionPayload.optionConfig = question.question.questionOptionMaps.map((qom: any, idx: number) => ({
                  value: qom?.option?.name,
                  name: qom?.option?.name,
                  type: qom?.option?.type || "string",
                  order: idx,
                }));
              }
            }

            newSection.questions.push(questionPayload);
          }
        });

        payload.addSections.push(newSection);
      } else {
        // Existing section - add to updateSections
        const updateSection: any = {
          formSectionId: section.sectionId,
          sectionName: section.sectionName,
          displayOrder: section.sectionDisplayOrder,
          updateQuestions: [],
          addQuestions: [],
          deleteQuestionIds: [],
        };

        section.items.forEach((item) => {
          if (item.type === SectionItemType.Subsection) {
            if (!evaluateConditionalConfig(item.conditionalConfig, programMeta)) return;
            const isExistingSubSection = item.subSectionId && item.subSectionId < EXISTING_ID_THRESHOLD;

            if (isExistingSubSection) {
              // Existing subsection - create a separate updateSection for it
              const subSectionUpdateSection: any = {
                formSectionId: item.subSectionId,
                sectionName: item.subSectionName,
                displayOrder: section.sectionDisplayOrder, // Use parent section's display order
                updateQuestions: [],
                addQuestions: [],
                deleteQuestionIds: deletedQuestionIds[item.subSectionId] || [],
              };

              (item.questions || []).forEach((question: any) => {
                if (!evaluateConditionalConfig(question.conditionalConfig, programMeta)) return;
                const currentDisplayOrder = globalDisplayOrder++;
                if (question.programQuestionId) {
                  // If question was moved to this subsection, add to addQuestions instead of updateQuestions
                  if (question.movedToSubSection) {
                    const addQuestion: any = {
                      programQuestionId: question.programQuestionId || question.id,
                      displayOrder: currentDisplayOrder,
                      formSectionId: item.subSectionId,
                      parentSectionId: item.subSectionId,
                      parentSectionName: item.subSectionName,
                    };

                    // Add question source - check for masterQuestionId or templateQuestionId first
                    if (question.masterQuestionId) {
                      addQuestion.masterQuestionId = parseInt(question.masterQuestionId);
                    } else if (question.templateQuestionId) {
                      addQuestion.templateQuestionId = parseInt(question.templateQuestionId);
                    } else {
                      // If no masterQuestionId or templateQuestionId, include full question details
                      addQuestion.label = question.question.label;
                      addQuestion.type = question.question.type;
                      addQuestion.config = sanitizeQuestionDependencies(question.question.config, validBindingKeys);

                      if (OPTION_FIELD_TYPES.includes(question.question.type)) {
                        addQuestion.optionConfig = question?.question?.questionOptionMaps.map((qom: any, idx: number) => ({
                          value: qom?.option?.name,
                          name: qom?.option?.name,
                          type: qom?.option?.type || "string",
                          order: idx,
                        }));
                      }
                    }

                    subSectionUpdateSection.addQuestions.push(addQuestion);
                  } else if (question.isEdited || question.originalConfig) {
                    const configDiff = buildPatchConfigOverride(question);
                    const updateQuestion: any = {
                      programQuestionId: question.programQuestionId || question.id,
                      displayOrder: currentDisplayOrder,
                      formSectionId: item.subSectionId,
                      parentSectionId: item.subSectionId,
                      parentSectionName: item.subSectionName,
                    };
                    if (configDiff) updateQuestion.config = configDiff;
                    if (question.isEdited) {
                      updateQuestion.label = question.question.label;
                      updateQuestion.type = question.question.type;
                    }

                    if (OPTION_FIELD_TYPES.includes(question.question.type)) {
                      updateQuestion.optionConfig = question.question.questionOptionMaps.map((qom: any, idx: number) => ({
                        value: qom?.option?.name,
                        name: qom?.option?.name,
                        type: qom?.option?.type || "string",
                        order: idx,
                      }));
                    }

                    subSectionUpdateSection.updateQuestions.push(updateQuestion);
                  }
                } else {
                  // New question in existing subsection
                  const addQuestion: any = {
                    displayOrder: currentDisplayOrder,
                    formSectionId: item.subSectionId,
                    parentSectionId: item.subSectionId,
                    parentSectionName: item.subSectionName,
                  };

                  if (question.masterQuestionId) {
                    addQuestion.masterQuestionId = parseInt(question.masterQuestionId);
                  } else if (question.templateQuestionId) {
                    addQuestion.templateQuestionId = parseInt(question.templateQuestionId);
                  } else {
                    addQuestion.label = question.question.label;
                    addQuestion.type = question.question.type;
                    addQuestion.answerType = question?.question?.answerType || "string";
                    addQuestion.config = sanitizeQuestionDependencies(question.question.config, validBindingKeys);

                    if (OPTION_FIELD_TYPES.includes(question.question.type)) {
                      addQuestion.optionConfig = question.question.questionOptionMaps.map((qom: any, idx: number) => ({
                        value: qom?.option?.name,
                        name: qom?.option?.name,
                        type: qom?.option?.type || "string",
                        order: idx,
                      }));
                    }
                  }

                  subSectionUpdateSection.addQuestions.push(addQuestion);
                }
              });

              // Only add subsection to payload if there are actual changes
              const hasSubSectionChanges = 
                subSectionUpdateSection.updateQuestions.length > 0 ||
                subSectionUpdateSection.addQuestions.length > 0 ||
                subSectionUpdateSection.deleteQuestionIds.length > 0;

              if (hasSubSectionChanges) {
                payload.updateSections.push(subSectionUpdateSection);
              }
            } else {
              // New subsection in existing section - add as a new section with parentSectionId
              const newSubSection: any = {
                sectionName: item.subSectionName,
                sectionKey: item.subSectionKey || `FSS_CUSTOM_${Date.now()}`,
                parentSectionId: section.sectionId,
                questions: [],
              };

              (item.questions || []).forEach((question: any) => {
                if (!evaluateConditionalConfig(question.conditionalConfig, programMeta)) return;
                const currentDisplayOrder = globalDisplayOrder++;
                const questionPayload: any = {
                  displayOrder: currentDisplayOrder,
                };

                if (question.masterQuestionId) {
                  questionPayload.masterQuestionId = parseInt(question.masterQuestionId);
                } else if (question.templateQuestionId) {
                  questionPayload.templateQuestionId = parseInt(question.templateQuestionId);
                } else {
                  questionPayload.label = question.question.label;
                  questionPayload.type = question.question.type;
                  questionPayload.answerType = question?.question?.answerType || "string";
                  questionPayload.config = sanitizeQuestionDependencies(question.question.config, validBindingKeys);

                  if (OPTION_FIELD_TYPES.includes(question.question.type)) {
                    questionPayload.optionConfig = question.question.questionOptionMaps.map((qom: any, idx: number) => ({
                      value: qom?.option?.name,
                      name: qom?.option?.name,
                      type: qom?.option?.type || "string",
                      order: idx,
                    }));
                  }
                }

                newSubSection.questions.push(questionPayload);
              });

              payload.addSections.push(newSubSection);
            }
          } else if (item.type === SectionItemType.Question) {
            if (!evaluateConditionalConfig(item.question?.conditionalConfig, programMeta)) return;
            const question = item.question;
            const currentDisplayOrder = globalDisplayOrder++;

            if (question.programQuestionId) {
              // If question was moved out of subsection, add to addQuestions
              if (question.movedOutOfSubSection) {
                const addQuestion: any = {
                  programQuestionId: question.programQuestionId || question.id,
                  displayOrder: currentDisplayOrder,
                };

                // Add question source
                if (question.masterQuestionId) {
                  addQuestion.masterQuestionId = parseInt(question.masterQuestionId);
                } else if (question.templateQuestionId) {
                  addQuestion.templateQuestionId = parseInt(question.templateQuestionId);
                } else {
                  addQuestion.label = question.question.label;
                  addQuestion.type = question.question.type;
                  addQuestion.config = sanitizeQuestionDependencies(question.question.config, validBindingKeys);
                  addQuestion.answerType = question?.question?.answerType || "string";

                  if (OPTION_FIELD_TYPES.includes(question.question.type)) {
                    addQuestion.optionConfig = question.question.questionOptionMaps.map((qom: any, idx: number) => ({
                      value: qom?.option?.name,
                      name: qom?.option?.name,
                      type: qom?.option?.type || "string",
                      order: idx,
                    }));
                  }
                }
                updateSection.addQuestions.push(addQuestion);
              }
              // Existing question - check if edited or auto-sanitized
              else if (question.isEdited || question.originalConfig) {
                const configDiff = buildPatchConfigOverride(question);
                const updateQuestion: any = {
                  programQuestionId: question.programQuestionId || question.id,
                  displayOrder: currentDisplayOrder,
                };
                if (configDiff) updateQuestion.config = configDiff;
                if (question.isEdited) {
                  updateQuestion.label = question.question.label;
                  updateQuestion.type = question.question.type;
                }

                if (question.isEdited && OPTION_FIELD_TYPES.includes(question.question.type)) {
                  updateQuestion.optionConfig = question.question.questionOptionMaps.map((qom: any, idx: number) => ({
                      value: qom?.option?.name,
                      name: qom?.option?.name,
                      type: qom?.option?.type || "string",
                      order: idx,
                  }));
                }

                updateSection.updateQuestions.push(updateQuestion);
              }
            } else {
              // New question in existing section
              const addQuestion: any = {
                displayOrder: currentDisplayOrder,
              };

              if (question.masterQuestionId) {
                addQuestion.masterQuestionId = parseInt(question.masterQuestionId);
              } else if (question.templateQuestionId) {
                addQuestion.templateQuestionId = parseInt(question.templateQuestionId);
              } else {
                addQuestion.label = question.question.label;
                addQuestion.type = question.question.type;
                addQuestion.answerType = question?.question?.answerType || "string";
                addQuestion.config = sanitizeQuestionDependencies(question.question.config, validBindingKeys);

                if (OPTION_FIELD_TYPES.includes(question.question.type)) {
                  addQuestion.optionConfig = question.question.questionOptionMaps.map((qom: any, idx: number) => ({
                    value: qom?.option?.name,
                    name: qom?.option?.name,
                    type: qom?.option?.type || "string",
                    order: idx,
                  }));
                }
              }

              updateSection.addQuestions.push(addQuestion);
            }
          }
        });

        // Add deleted question IDs from this specific section
        updateSection.deleteQuestionIds = deletedQuestionIds[section.sectionId] || [];

        // Only add section to payload if there are actual changes
        const hasChanges = 
          updateSection.updateQuestions.length > 0 ||
          updateSection.addQuestions.length > 0 ||
          updateSection.deleteQuestionIds.length > 0;

        if (hasChanges) {
          payload.updateSections.push(updateSection);
        } 
      }
    });
    return payload;
  };

  const prepareApiPayload = () => {
    // Helper function to find questionId by bindingKey
    const getQuestionIdByBindingKey = (bindingKey: string) => {
      if (!bindingKey) return null;
      
      for (const section of sections.sections) {
        for (const item of section.items) {
          if (item.type === SectionItemType.Question && item.question.question.bindingKey === bindingKey) {
            return item.question.question.id;
          }
        }
      }
      return null;
    };
    
    return {
      programId: location?.state?.programId || 0,
      sections: sections.sections
        .filter((section) => section.items.some((item) => item.type === SectionItemType.Question && (item.question.isEdited || !item.question.id)))
        .map((section) => {
          const questionItems = section.items.filter((item) => item.type === SectionItemType.Question);
          const deletedQuestions = [
            ...(deletedQuestionIds[section.sectionId] || []),
            ...questionItems
              .filter(
                (item) =>
                  item.question.isEdited && item.question.question.id && item.question.question.id < EXISTING_ID_THRESHOLD,
              )
              .map((item) => item.question.question.id),
          ];
          return {
            sectionName: section.sectionName,
            sectionId: section.sectionId,
            customQuestions: questionItems
              .filter((item) => item.question.isEdited || !item.question.id)
              .map((item) => {
                const questionMap = item.question;
                return {
                question: {
                  label: questionMap.question.label,
                  type: questionMap.question.type,
                  section: section.sectionId,
                  config: {
                    ...questionMap.question.config,
                    dependsOn: (() => {
                      const dependsOnData = questionMap.question.config.dependsOn;
                      
                      
                      if (!dependsOnData) return undefined;
                      
                      // Check if it's already an array (new multi-condition format)
                      if (Array.isArray(dependsOnData)) {
                        // Filter out conditions without a bindingKey reference
                        const validConditions = dependsOnData.filter(cond => cond?.questionBindingKey);
                        if (validConditions.length === 0) return undefined;
                        
                        return validConditions.flatMap((condition, conditionIndex) => {
                          // Look up the actual questionId using bindingKey
                          const actualQuestionId = getQuestionIdByBindingKey(condition.questionBindingKey);
                          
                          if (!actualQuestionId) {
                            return [];
                          }
                          
                          if (condition.type === "prefill") {
                                // Look up the actual prefillQuestionId using prefillBindingKey
                                const actualPrefillQuestionId = getQuestionIdByBindingKey(condition.prefillBindingKey);
                                
                                return [{
                                  questionId: actualQuestionId,
                                  value: condition.value || "",
                                  type: "prefill",
                                  questionBindingKey: condition.questionBindingKey || "",
                                  prefillQuestionId: actualPrefillQuestionId || condition.prefillQuestionId || null,
                                  prefillBindingKey: condition.prefillBindingKey || "",
                                }];
                              } else if (condition.operator) {
                                // Handle number type with operator
                                return [{
                                  questionId: actualQuestionId,
                                  value: condition.value || [],
                                  type: condition.type || "show",
                                  questionBindingKey: condition.questionBindingKey || "",
                                  operator: condition.operator,
                                }];
                              } else if (Array.isArray(condition.value)) {
                                // Handle multiple values (radio/checkbox/select) - keep as array
                                return [{
                                  questionId: actualQuestionId,
                                  value: condition.value, // Keep values as array
                                  type: condition.type || "show",
                                  questionBindingKey: condition.questionBindingKey || "",
                                  transformedMinValue: condition.transformedMinValue || "",
                                  transformedMaxValue: condition.transformedMaxValue || "",
                                  dateConditionType: condition.dateConditionType || "",
                                }];
                              } else {
                                return [{
                                  questionId: actualQuestionId,
                                  value: condition.value || "",
                                  type: condition.type || "show",
                                  questionBindingKey: condition.questionBindingKey || "",
                                }];
                              }
                            });
                          }
                          // Handle old single-condition format
                          const singleQuestionId = getQuestionIdByBindingKey(dependsOnData.questionBindingKey);
                          
                          if (!singleQuestionId) {
                            return undefined;
                          }
                          
                          if (dependsOnData.type === "prefill") {
                            // Look up the actual prefillQuestionId using prefillBindingKey
                            const actualPrefillQuestionId = getQuestionIdByBindingKey(dependsOnData.prefillBindingKey);
                            
                            if (!actualPrefillQuestionId) {
                            }
                            
                            return [{
                              questionId: singleQuestionId,
                              value: "",
                              type: "prefill",
                              questionBindingKey: dependsOnData.questionBindingKey || "",
                              prefillQuestionId: actualPrefillQuestionId || dependsOnData.prefillQuestionId || null,
                              prefillBindingKey: dependsOnData.prefillBindingKey || "",
                            }];
                          } else if (dependsOnData.operator) {
                            // Handle number type with operator (old format)
                            return [{
                              questionId: singleQuestionId,
                              value: dependsOnData.value || [],
                              type: dependsOnData.type || "show",
                              questionBindingKey: dependsOnData.questionBindingKey || "",
                              operator: dependsOnData.operator,
                            }];
                          } else if (Array.isArray(dependsOnData.value)) {
                            // Handle multiple values - keep as array
                            return [{
                              questionId: singleQuestionId,
                              value: dependsOnData.value, // Keep values as array
                              type: dependsOnData.type || "show",
                              questionBindingKey: dependsOnData.questionBindingKey || "",
                              transformedMinValue: dependsOnData.transformedMinValue || "",
                              transformedMaxValue: dependsOnData.transformedMaxValue || "",
                              dateConditionType: dependsOnData.dateConditionType || "",
                            }];
                          }
                          return undefined;
                        })(),
                  },
                  status: questionMap.question.status,
                  answerLocation: questionMap.question.answerLocation || "",
                  bindingKey: questionMap.question.bindingKey || "",
                },
                options: questionMap.question.questionOptionMaps.map((qom) => ({
                  name: qom?.option?.name,
                  type: qom?.option?.type || "string",
                  category: null,
                })),
                displayOrder: questionMap.id
                  ? questionMap.displayOrder
                  : questionItems.length + 1,
              }}),
            deletedQuestions,
            sectionDisplayOrder: section.sectionDisplayOrder,
          };
        }),
      registrationLevel: "program",
      programSessionId: 0,
    };
  };

  const handleContinue = async () => {
    try {
      if (!programId) {
        return;
      }

      // Check if there are any changes (edited, new, or deleted questions)
      const hasEditedOrNewQuestions = sections.sections.some((section) =>
        section.items.some((item) => 
          item.type === SectionItemType.Question && (item.question.isEdited || !item.question.id)
        ) || 
        section.items.some((item) => 
          item.type === SectionItemType.Subsection && 
          (item.questions || []).some((q: any) => q.isEdited || !q.id)
        )
      );

      const hasDeletedQuestions = Object.values(deletedQuestionIds).some(arr => arr.length > 0);
      const hasChanges = hasEditedOrNewQuestions || hasDeletedQuestions || deletedSectionIds.length > 0;

      if (templateId) {
        if (isProgramWithQuestions) {
          // Program has existing questions - use PATCH
            if (hasChanges) {
            const patchPayload = preparePatchPayload();
            const response = await patchCall(
              endPoints.saveProgramFormId(programId),
              patchPayload,
              PORTAL
            );

            if (response?.data?.statusCode !== 200 && response?.data?.statusCode !== 201) {
              throw new Error("Failed to update form");
            }
            // Clear deleted IDs after successful save
            setDeletedQuestionIds({});
            setDeletedSectionIds([]);
          }
        } else {
          // Program has no questions yet - use POST
          // If any sections/questions are eliminated by conditionalConfig, always send the full
          // payload so the backend doesn't clone those eliminated items from the template.
          const hasEliminatedItems = sections.sections.some((section) => {
            if (!evaluateConditionalConfig((section as any).conditionalConfig, programMeta)) return true;
            return section.items.some((item: any) => {
              if (item.type === SectionItemType.Question) {
                return !evaluateConditionalConfig(item.question?.conditionalConfig, programMeta);
              }
              if (item.type === SectionItemType.Subsection) {
                if (!evaluateConditionalConfig(item.conditionalConfig, programMeta)) return true;
                return (item.questions || []).some((q: any) =>
                  !evaluateConditionalConfig(q.conditionalConfig, programMeta),
                );
              }
              return false;
            });
          });
          const payload = (hasChanges || hasEliminatedItems)
            ? prepareTemplateSavePayload(false)  // Full payload with sections
            : prepareTemplateSavePayload(true);  // Minimal payload with cloneFromTemplate
          
          const response = await postCall(
            endPoints.saveProgramForm,
            payload,
            PORTAL
          );

          if (response?.data?.statusCode !== 200 && response?.data?.statusCode !== 201) {
            throw new Error("Failed to save form");
          }
          // Clear deleted IDs after successful save
          const hasDeletedQuestions = Object.values(deletedQuestionIds).some(arr => arr.length > 0);
          if (hasDeletedQuestions) {
            setDeletedQuestionIds({});
          }
        }
      }

      navigate("/admin/preview-form", {
        state: {
          selectedForm: columnLayout,
          programQuestionMaps: programQuestionMaps,
          programName: location?.state?.programName || location?.state?.templateName || "New Program",
          bannerImage:
            location?.state?.bannerImage ||
            getProgramImage(location?.state?.programName),
          bannerImageUrl: location?.state?.bannerImageUrl || null,
          bannerAnimationUrl: location?.state?.bannerAnimationUrl || null,
          programId: programId,
          fromFormBuilder: false,
        },
      });
    } catch (error) {
      alert("Failed to save form. Please check console for details.");
    }
  };

  const handleSave = async () => {
    try {
      if (!programId) {
        return;
      }

      const hasEditedQuestions = sections.sections.some((section) =>
        section.items.some((item) => 
          item.type === SectionItemType.Question && item.question.isEdited
        ) || 
        section.items.some((item) => 
          item.type === SectionItemType.Subsection && 
          (item.questions || []).some((q: any) => q.isEdited)
        )
      );

      const hasDeletedQuestions = Object.values(deletedQuestionIds).some(arr => arr.length > 0);
      if (!hasEditedQuestions && !hasDeletedQuestions) {
        return;
      }

      if (hasDeletedQuestions) {
        // Flatten all deleted question IDs from all sections
        const allDeletedQuestionIds = Object.values(deletedQuestionIds).flat();
        for (const questionId of allDeletedQuestionIds) {
          await deleteCall(`${endPoints?.programQuestion}/${questionId}`, undefined, PORTAL);
        }
      }

      if (hasEditedQuestions || templateId) {
        
        const payload = prepareTemplateSavePayload(false);
        
        const response = await postCall(
          endPoints.saveProgramForm,
          payload,
          PORTAL
        );

        if (response?.data?.statusCode === 200 || response?.data?.statusCode === 201) {
          // Clear deleted IDs after successful save
          setDeletedQuestionIds({});
          // Refresh the template data to get updated state
          await fetchTemplateData();
        } else {
          throw new Error("Failed to save form changes");
        }
      }
    } catch (error) {
      // Optionally show error message to user
    }
  };

  const handleBack = () => {
    navigate("/admin/add-program", {
      state: {
        programTypeId: location?.state?.programId,
        programName: location?.state?.programName,
        isEditMode: true,
      },
    });
  };

  function handleBannerUpload(event: ChangeEvent<HTMLInputElement>): void {
    throw new Error("Function not implemented.");
  }

  // Helper function to render sub-field validation controls based on type
  const renderSubFieldValidations = (
    subQuestion: any,
    subIndex: number,
    subFieldType: string,
    config: any,
    sectionIndex: number,
    questionIndex: number,
    updateField: Function
  ) => {
    const updateSubQuestion = (updates: any) => {
      const updatedQuestions = [...config.questions];
      updatedQuestions[subIndex] = {
        ...updatedQuestions[subIndex],
        ...updates,
      };
      updateField(sectionIndex, questionIndex, {
        config: { ...config, questions: updatedQuestions },
      });
    };

    // Check if field type supports validations
    const supportsValidation = ![
      'password', 'boolean', 'draganddrop', 'year', 'apicall', 'dateandtime', 'time', 'address', 'button', 'date'
    ].includes(subFieldType);

    return (
      <>
        {/* Placeholder for applicable types */}
        {!['password', 'radio', 'checkbox', 'date', 'file', 'boolean', 'select', 'draganddrop', 'year', 'apicall', 'dateandtime', 'time', 'address', 'button'].includes(subFieldType) && (
          <div className={styles.fullWidthGridItem}>
            <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.PLACEHOLDER}</label>
            <input
              type="text"
              value={subQuestion.placeholder || ""}
              onChange={(e) => updateSubQuestion({ placeholder: e.target.value })}
              className={styles.formInput}
              placeholder="Enter placeholder text"
            />
          </div>
        )}

        {/* Radio/Checkbox/Select options - shown before advanced validation */}
        {(subFieldType === 'radio' || subFieldType === 'checkbox' || subFieldType === 'select') && (
          <div className={styles.fullWidthGridItem}>
            <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.OPTIONS_COMMA_SEPARATED}</label>
            <textarea
              value={(subQuestion.options || []).join(',')}
              onChange={(e) => {
                const options = e.target.value.split(',');
                updateSubQuestion({ options: options });
              }}
              className={styles.formTextarea}
              placeholder="Enter options (e.g. Option1,Option2,Option3)"
              className={styles.autoHeightTextarea}
            />
          </div>
        )}

        {/* Advanced Validation Toggle - only for types that support validation */}
        {supportsValidation && (
          <div className={styles.fullWidthGridItem}>
            <div className={styles.fieldTitleGroup}>
              <span className={styles.requiredText}>{FORM_BUILDER_TEXT.TOGGLES.ENABLE_ADVANCED_VALIDATION}</span>
              <label className={styles.toggleContainer}>
                <input
                  type="checkbox"
                  checked={subQuestion.isAdvancedValidation || false}
                  onChange={(e) => updateSubQuestion({ isAdvancedValidation: e.target.checked })}
                  className={styles.toggleInput}
                />
                <div className={styles.toggleSwitch}></div>
              </label>
            </div>
          </div>
        )}

        {/* Advanced Validation Fields - shown only when toggle is enabled */}
        {subQuestion.isAdvancedValidation && (
          <>
            {/* Text/Textarea specific validations */}
            {(subFieldType === 'text' || subFieldType === 'textarea') && (
              <>
                <div>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MINIMUM_CHARACTERS}</label>
                  <input
                    type="number"
                    value={subQuestion.minCharacter || ""}
                    onChange={(e) => updateSubQuestion({ minCharacter: e.target.value ? parseInt(e.target.value) : null })}
                    className={styles.formInput}
                    placeholder="Enter minimum characters"
                    min="0"
                  />
                </div>

                <div>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MAXIMUM_CHARACTERS}</label>
                  <input
                    type="number"
                    value={subQuestion.maxCharacters || ""}
                    onChange={(e) => updateSubQuestion({ maxCharacters: e.target.value ? parseInt(e.target.value) : null })}
                    className={styles.formInput}
                    placeholder="Enter maximum characters"
                    min="0"
                  />
                </div>

                {subFieldType === 'text' && (
                  <div className={styles.fullWidthGridItem}>
                    <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.VALIDATION_PATTERN}</label>
                    <input
                      type="text"
                      value={subQuestion.validationPattern || ""}
                      onChange={(e) => updateSubQuestion({ validationPattern: e.target.value || null })}
                      className={styles.formInput}
                      placeholder="e.g., ^[A-Za-z]+$ (letters only)"
                    />
                  </div>
                )}
              </>
            )}

            {/* Number specific validations */}
            {subFieldType === 'number' && (
              <>
                <div>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MINIMUM_VALUE}</label>
                  <input
                    type="number"
                    value={subQuestion.minValue !== undefined && subQuestion.minValue !== null ? subQuestion.minValue : ""}
                    onChange={(e) => updateSubQuestion({ minValue: e.target.value !== "" ? parseFloat(e.target.value) : null })}
                    className={styles.formInput}
                    placeholder="Enter minimum value"
                  />
                </div>

                <div>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MAXIMUM_VALUE}</label>
                  <input
                    type="number"
                    value={subQuestion.maxValue !== undefined && subQuestion.maxValue !== null ? subQuestion.maxValue : ""}
                    onChange={(e) => updateSubQuestion({ maxValue: e.target.value !== "" ? parseFloat(e.target.value) : null })}
                    className={styles.formInput}
                    placeholder="Enter maximum value"
                  />
                </div>

                <div className={styles.fullWidthGridItem}>
                  <div className={styles.fieldTitleGroup}>
                    <span className={styles.requiredText}>{FORM_BUILDER_TEXT.TOGGLES.ALLOW_DECIMALS}</span>
                    <label className={styles.toggleContainer}>
                      <input
                        type="checkbox"
                        checked={subQuestion.allowDecimals || false}
                        onChange={(e) => updateSubQuestion({ allowDecimals: e.target.checked })}
                        className={styles.toggleInput}
                      />
                      <div className={styles.toggleSwitch}></div>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Email specific validations */}
            {subFieldType === 'email' && (
              <div className={styles.fullWidthGridItem}>
                <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.EMAIL_PATTERN}</label>
                <input
                  type="text"
                  value={subQuestion.validationPattern || "^[^\\\\s@]+@[^\\\\s@]+\\\\.[^\\\\s@]+$"}
                  onChange={(e) => updateSubQuestion({ validationPattern: e.target.value || "^[^\\\\s@]+@[^\\\\s@]+\\\\.[^\\\\s@]+$"})}
                  className={styles.formInput}
                  placeholder="Enter email validation pattern"
                />
              </div>
            )}

            {/* File specific validations */}
            {subFieldType === 'file' && (
              <>
                <div>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MAXIMUM_FILE_SIZE}</label>
                  <input
                    type="number"
                    value={subQuestion.maxFileSize !== undefined && subQuestion.maxFileSize !== null ? subQuestion.maxFileSize : ""}
                    onChange={(e) => updateSubQuestion({ maxFileSize: e.target.value !== "" ? parseInt(e.target.value) : null })}
                    className={styles.formInput}
                    placeholder="Enter max file size"
                    min="1"
                  />
                </div>

                <div>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.ALLOWED_FILE_TYPES}</label>
                  <CustomDropDown
                    value={subQuestion.allowedFileTypes || ""}
                    onChange={(val) => updateSubQuestion({ allowedFileTypes: typeof val === "object" ? val.value : val })}
                    options={FILE_TYPE_OPTIONS}
                    placeholder="Select file type"
                    width={340}
                    className={styles.formSelect}
                  />
                </div>
              </>
            )}
          </>
        )}
      </>
    );
  };

  // Helper function to render field-specific validation controls
  const renderValidationControls = (
    field: any,
    sectionIndex: number,
    questionIndex: number,
    subSectionItemIndex?: number,
    isSubSectionQuestion?: boolean,
  ) => {
    const fieldType = field.question.type;
    const config = field.question.config;

    // Choose the appropriate update function based on whether this is a subsection question
    const updateFn = isSubSectionQuestion && subSectionItemIndex !== undefined
      ? (sIdx: number, qIdx: number, updates: any) => {
          updateSubSectionField(sIdx, subSectionItemIndex, qIdx, updates);
        }
      : updateField;

    // Only show validation controls for certain field types
    const validationSupportedTypes = [
      "text",
      "textarea",
      "number",
      "email",
      "tel",
      "file",
      "draganddrop",
      "year",
      "yearRange",
      "apicall",
      "date",
      "dateandtime",
      "Address",
      "radio",
      "checkbox",
      "select",
      "multiQuestion",
    ];

    if (!validationSupportedTypes.includes(fieldType)) {
      return null;
    }

    // For multiQuestion, skip all validation controls - only show sub-fields configuration
    if (fieldType === "multiQuestion") {
      return null;
    }

    return (
      <>
        {/* Advanced Validation Toggle - shown for all supported types */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <div className={styles.fieldTitleGroup}>
            <span className={styles.requiredText}>{FORM_BUILDER_TEXT.TOGGLES.ENABLE_ADVANCED_VALIDATION}</span>
            <label className={styles.toggleContainer}>
              <input
                type="checkbox"
                checked={config.isAdvancedValidation || false}
                onChange={(e) =>
                  updateFn(sectionIndex, questionIndex, {
                    config: {
                      ...config,
                      isAdvancedValidation: e.target.checked,
                    },
                  })
                }
                className={styles.toggleInput}
              />
              <div className={styles.toggleSwitch}></div>
            </label>
          </div>
        </div>

        {/* Validation Fields - shown only when advanced validation is enabled */}
        {config.isAdvancedValidation && (
          <>
            {/* Text and Textarea specific validations */}
            {(fieldType === "text" || fieldType === "textarea") && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MINIMUM_CHARACTERS}</label>
                  <input
                    type="number"
                    value={config.minCharacter !== undefined && config.minCharacter !== null ? config.minCharacter : ""}
                    onChange={(e) =>
                      updateFn(sectionIndex, questionIndex, {
                        config: {
                          ...config,
                          minCharacter: e.target.value !== ""
                            ? parseInt(e.target.value)
                            : null,
                        },
                      })
                    }
                    className={styles.formInput}
                    placeholder="Enter minimum characters"
                    min="0"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MAXIMUM_CHARACTERS}</label>
                  <input
                    type="number"
                    value={config.maxCharacters !== undefined && config.maxCharacters !== null ? config.maxCharacters : ""}
                    onChange={(e) =>
                      updateFn(sectionIndex, questionIndex, {
                        config: {
                          ...config,
                          maxCharacters: e.target.value !== ""
                            ? parseInt(e.target.value)
                            : null,
                        },
                      })
                    }
                    className={styles.formInput}
                    placeholder="Enter maximum characters"
                    min="0"
                  />
                </div>

                {fieldType === "text" && (
                  <>
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label className={styles.formLabel}>
                        {FORM_BUILDER_TEXT.LABELS.VALIDATION_PATTERN}
                      </label>
                      <input
                        type="text"
                        value={config.validationPattern || ""}
                        onChange={(e) =>
                          updateFn(sectionIndex, questionIndex, {
                            config: {
                              ...config,
                              validationPattern: e.target.value || null,
                            },
                          })
                        }
                        className={styles.formInput}
                        placeholder="e.g., ^[A-Za-z]+$ (letters only)"
                      />
                    </div>
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.PATTERN_ERROR_MESSAGE}</label>
                      <input
                        type="text"
                        value={config.patternErrorMsg || ""}
                        onChange={(e) =>
                          updateFn(sectionIndex, questionIndex, {
                            config: {
                              ...config,
                              patternErrorMsg: e.target.value || null,
                            },
                          })
                        }
                        className={styles.formInput}
                        placeholder="Custom error message for validation failure"
                      />
                    </div>
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.HELPER_TEXT}</label>
                      <input
                        type="text"
                        value={config.helperText || ""}
                        onChange={(e) =>
                          updateFn(sectionIndex, questionIndex, {
                            config: {
                              ...config,
                              helperText: e.target.value || null,
                            },
                          })
                        }
                        className={styles.formInput}
                        placeholder="e.g., (roommate preference not guaranteed)"
                      />
                      <div className={styles.validationHint}>
                        {FORM_BUILDER_TEXT.VALIDATION_MESSAGES.HELPER_TEXT_INFO}
                      </div>
                    </div>
                  </>
                )}

                {fieldType === "textarea" && (
                  <>
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label className={styles.formLabel}>
                        {FORM_BUILDER_TEXT.LABELS.VALIDATION_PATTERN}
                      </label>
                      <input
                        type="text"
                        value={config.validationPattern || ""}
                        onChange={(e) =>
                          updateFn(sectionIndex, questionIndex, {
                            config: {
                              ...config,
                              validationPattern: e.target.value || null,
                            },
                          })
                        }
                        className={styles.formInput}
                        placeholder="e.g., ^[A-Za-z0-9\\s,.]+$ (letters, numbers, spaces)"
                      />
                    </div>
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.PATTERN_ERROR_MESSAGE}</label>
                      <input
                        type="text"
                        value={config.patternErrorMsg || ""}
                        onChange={(e) =>
                          updateFn(sectionIndex, questionIndex, {
                            config: {
                              ...config,
                              patternErrorMsg: e.target.value || null,
                            },
                          })
                        }
                        className={styles.formInput}
                        placeholder="Custom error message for validation failure"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Number specific validations */}
            {fieldType === "number" && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MINIMUM_VALUE}</label>
                  <input
                    type="number"
                    value={config.minValue !== undefined && config.minValue !== null ? config.minValue : ""}
                    onChange={(e) =>
                      updateFn(sectionIndex, questionIndex, {
                        config: {
                          ...config,
                          minValue: e.target.value !== ""
                            ? parseFloat(e.target.value)
                            : null,
                        },
                      })
                    }
                    className={styles.formInput}
                    placeholder="Enter minimum value"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MAXIMUM_VALUE}</label>
                  <input
                    type="number"
                    value={config.maxValue !== undefined && config.maxValue !== null ? config.maxValue : ""}
                    onChange={(e) =>
                      updateFn(sectionIndex, questionIndex, {
                        config: {
                          ...config,
                          maxValue: e.target.value !== ""
                            ? parseFloat(e.target.value)
                            : null,
                        },
                      })
                    }
                    className={styles.formInput}
                    placeholder="Enter maximum value"
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <div className={styles.fieldTitleGroup}>
                    <span className={styles.requiredText}>{FORM_BUILDER_TEXT.TOGGLES.ALLOW_DECIMALS}</span>
                    <label className={styles.toggleContainer}>
                      <input
                        type="checkbox"
                        checked={config.allowDecimals || false}
                        onChange={(e) =>
                          updateFn(sectionIndex, questionIndex, {
                            config: {
                              ...config,
                              allowDecimals: e.target.checked,
                            },
                          })
                        }
                        className={styles.toggleInput}
                      />
                      <div className={styles.toggleSwitch}></div>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Email specific validations */}
            {fieldType === "email" && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MAXIMUM_CHARACTERS}</label>
                  <input
                    type="number"
                    value={config.maxCharacters !== undefined && config.maxCharacters !== null ? config.maxCharacters : ""}
                    onChange={(e) =>
                      updateFn(sectionIndex, questionIndex, {
                        config: {
                          ...config,
                          maxCharacters: e.target.value !== ""
                            ? parseInt(e.target.value)
                            : null,
                        },
                      })
                    }
                    className={styles.formInput}
                    placeholder="Enter maximum characters"
                    min="0"
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.EMAIL_PATTERN}</label>
                  <input
                    type="text"
                    value={
                      config.validationPattern ||
                      "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
                    }
                    onChange={(e) =>
                      updateFn(sectionIndex, questionIndex, {
                        config: {
                          ...config,
                          validationPattern:
                            e.target.value || "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
                        },
                      })
                    }
                    className={styles.formInput}
                    placeholder="Enter email validation pattern"
                  />
                  {/* <div className={styles.validationHint}>
                    Default pattern validates standard email format (e.g.,
                    user@domain.com)
                  </div> */}
                </div>
              </>
            )}

            {/* File and Drag & Drop specific validations */}
            {fieldType === "file" && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MAXIMUM_FILE_SIZE}</label>
                  <input
                    type="number"
                    value={config.maxFileSize !== undefined && config.maxFileSize !== null ? config.maxFileSize : ""}
                    onChange={(e) =>
                      updateFn(sectionIndex, questionIndex, {
                        config: {
                          ...config,
                          maxFileSize: e.target.value !== ""
                            ? parseInt(e.target.value)
                            : null,
                        },
                      })
                    }
                    className={styles.formInput}
                    placeholder="Enter max file size"
                    min="1"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.ALLOWED_FILE_TYPES}</label>
                  <CustomDropDown
                    value={config.allowedFileTypes || ""}
                    onChange={(val) =>
                      updateFn(sectionIndex, questionIndex, {
                        config: {
                          ...config,
                          allowedFileTypes: val.value,
                        },
                      })
                    }
                    options={FILE_TYPE_OPTIONS}
                    placeholder="Select file type category"
                    width={340}
                    className={styles.formSelect}
                  />
                  <div className={styles.validationHint}>
                    {config.allowedFileTypes === "image" &&
                      "Accepts: .jpg, .jpeg, .png, .gif, .bmp, .webp, .svg"}
                    {config.allowedFileTypes === "video" &&
                      "Accepts: .mp4, .avi, .mov, .wmv, .flv, .webm, .mkv"}
                  </div>
                </div>

                {/* Custom file extensions input - only show when "Custom Extensions" is selected */}
                {config.allowedFileTypes === "custom" && (
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.CUSTOM_FILE_EXTENSIONS}</label>
                    <input
                      type="text"
                      value={config.customFileTypes || ""}
                      onChange={(e) =>
                        updateFn(sectionIndex, questionIndex, {
                          config: {
                            ...config,
                            customFileTypes: e.target.value || null,
                          },
                        })
                      }
                      className={styles.formInput}
                      placeholder="e.g., .jpg, .png, .pdf"
                    />
                    <div className={styles.validationHint}>
                      {FORM_BUILDER_TEXT.VALIDATION_HINTS.FILE_EXTENSIONS}
                    </div>
                  </div>
                )}
              </>
            )}
            {fieldType === "draganddrop" && (
              <>
                {/* Add the new Mahatria Choice toggle */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <div className={styles.fieldTitleGroup}>
                    <span className={styles.requiredText}>{FORM_BUILDER_TEXT.TOGGLES.ALLOW_MAHATRIA_CHOICE}</span>
                    <label className={styles.toggleContainer}>
                      <input
                        type="checkbox"
                        checked={config.allowMahatriaChoice || false}
                        onChange={(e) =>
                          updateFn(sectionIndex, questionIndex, {
                            config: {
                              ...config,
                              allowMahatriaChoice: e.target.checked,
                            },
                          })
                        }
                        className={styles.toggleInput}
                      />
                      <div className={styles.toggleSwitch}></div>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Year specific validations */}
            {fieldType === "year" && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.YEAR_OFFSET}</label>
                  <input
                    type="number"
                    value={config.yearOffset !== undefined && config.yearOffset !== null ? config.yearOffset : ""}
                    onChange={(e) =>
                      updateFn(sectionIndex, questionIndex, {
                        config: {
                          ...config,
                          yearOffset: e.target.value !== ""
                            ? parseInt(e.target.value)
                            : null,
                        },
                      })
                    }
                    className={styles.formInput}
                    placeholder="e.g., 1995"
                    min="1900"
                  />
                  <div className={styles.validationHint}>
                    {FORM_BUILDER_TEXT.VALIDATION_HINTS.MIN_YEAR}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MAX_YEAR_OFFSET}</label>
                  <input
                    type="number"
                    value={config.maxYearOffset !== undefined && config.maxYearOffset !== null ? config.maxYearOffset : ""}
                    onChange={(e) =>
                      updateFn(sectionIndex, questionIndex, {
                        config: {
                          ...config,
                          maxYearOffset: e.target.value !== ""
                            ? parseInt(e.target.value)
                            : null,
                        },
                      })
                    }
                    className={styles.formInput}
                    placeholder="e.g., 0 for current year"
                    min="0"
                  />
                  <div className={styles.validationHint}>
                    {FORM_BUILDER_TEXT.VALIDATION_HINTS.MAX_YEAR_OFFSET}
                  </div>
                </div>
              </>
            )}

            {/* Tel (Telephone) specific validations */}
            {fieldType === "tel" && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MINIMUM_CHARACTERS}</label>
                  <input
                    type="number"
                    value={config.minCharacter !== undefined && config.minCharacter !== null ? config.minCharacter : ""}
                    onChange={(e) =>
                      updateFn(sectionIndex, questionIndex, {
                        config: {
                          ...config,
                          minCharacter: e.target.value !== ""
                            ? parseInt(e.target.value)
                            : null,
                        },
                      })
                    }
                    className={styles.formInput}
                    placeholder="Enter minimum characters"
                    min="0"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MAXIMUM_CHARACTERS}</label>
                  <input
                    type="number"
                    value={config.maxCharacters !== undefined && config.maxCharacters !== null ? config.maxCharacters : ""}
                    onChange={(e) =>
                      updateFn(sectionIndex, questionIndex, {
                        config: {
                          ...config,
                          maxCharacters: e.target.value !== ""
                            ? parseInt(e.target.value)
                            : null,
                        },
                      })
                    }
                    className={styles.formInput}
                    placeholder="Enter maximum characters"
                    min="0"
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.VALIDATION_PATTERN}</label>
                  <input
                    type="text"
                    value={config.validationPattern || ""}
                    onChange={(e) =>
                      updateFn(sectionIndex, questionIndex, {
                        config: {
                          ...config,
                          validationPattern: e.target.value || null,
                        },
                      })
                    }
                    className={styles.formInput}
                    placeholder="e.g., ^[0-9+\\-\\s\\(\\)]+$ (phone format)"
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.PATTERN_ERROR_MESSAGE}</label>
                  <input
                    type="text"
                    value={config.patternErrorMsg || ""}
                    onChange={(e) =>
                      updateFn(sectionIndex, questionIndex, {
                        config: {
                          ...config,
                          patternErrorMsg: e.target.value || null,
                        },
                      })
                    }
                    className={styles.formInput}
                    placeholder="Custom error message for validation failure"
                  />
                </div>
              </>
            )}

            {/* Address specific validations */}
            {fieldType === "Address" && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MINIMUM_CHARACTERS}</label>
                  <input
                    type="number"
                    value={config.minCharacter !== undefined && config.minCharacter !== null ? config.minCharacter : ""}
                    onChange={(e) =>
                      updateFn(sectionIndex, questionIndex, {
                        config: {
                          ...config,
                          minCharacter: e.target.value !== ""
                            ? parseInt(e.target.value)
                            : null,
                        },
                      })
                    }
                    className={styles.formInput}
                    placeholder="Enter minimum characters"
                    min="0"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MAXIMUM_CHARACTERS}</label>
                  <input
                    type="number"
                    value={config.maxCharacters !== undefined && config.maxCharacters !== null ? config.maxCharacters : ""}
                    onChange={(e) =>
                      updateFn(sectionIndex, questionIndex, {
                        config: {
                          ...config,
                          maxCharacters: e.target.value !== ""
                            ? parseInt(e.target.value)
                            : null,
                        },
                      })
                    }
                    className={styles.formInput}
                    placeholder="Enter maximum characters"
                    min="0"
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.VALIDATION_PATTERN}</label>
                  <input
                    type="text"
                    value={config.validationPattern || ""}
                    onChange={(e) =>
                      updateFn(sectionIndex, questionIndex, {
                        config: {
                          ...config,
                          validationPattern: e.target.value || null,
                        },
                      })
                    }
                    className={styles.formInput}
                    placeholder="Enter address validation pattern"
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.PATTERN_ERROR_MESSAGE}</label>
                  <input
                    type="text"
                    value={config.patternErrorMsg || ""}
                    onChange={(e) =>
                      updateFn(sectionIndex, questionIndex, {
                        config: {
                          ...config,
                          patternErrorMsg: e.target.value || null,
                        },
                      })
                    }
                    className={styles.formInput}
                    placeholder="Custom error message for validation failure"
                  />
                </div>
              </>
            )}

            {/* YearRange specific validations */}
            {fieldType === "yearRange" && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.STARTING_YEAR}</label>
                  <input
                    type="number"
                    value={config.yearOffset !== undefined && config.yearOffset !== null ? config.yearOffset : ""}
                    onChange={(e) =>
                      updateFn(sectionIndex, questionIndex, {
                        config: {
                          ...config,
                          yearOffset: e.target.value !== ""
                            ? parseInt(e.target.value)
                            : null,
                        },
                      })
                    }
                    className={styles.formInput}
                    placeholder="e.g., 1995 (earliest year)"
                  />
                  <div className={styles.validationHint}>
                    {FORM_BUILDER_TEXT.VALIDATION_HINTS.STARTING_YEAR}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.ENDING_YEAR}</label>
                  <input
                    type="number"
                    value={config.maxYearOffset ?? ""}
                    onChange={(e) =>
                      updateFn(sectionIndex, questionIndex, {
                        config: {
                          ...config,
                          maxYearOffset: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        },
                      })
                    }
                    className={styles.formInput}
                    placeholder="e.g., 0 (current year) or -1 (last year)"
                  />
                  <div className={styles.validationHint}>
                    {FORM_BUILDER_TEXT.VALIDATION_HINTS.ENDING_YEAR_OFFSET}
                  </div>
                </div>
              </>
            )}

            {/* Select specific validations */}
            {fieldType === "select" && (
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.SELECT_PLACEHOLDER}</label>
                <input
                  type="text"
                  value={config.selectPlaceHolder || ""}
                  onChange={(e) =>
                    updateFn(sectionIndex, questionIndex, {
                      config: {
                        ...config,
                        selectPlaceHolder: e.target.value || null,
                      },
                    })
                  }
                  className={styles.formInput}
                  placeholder="Enter placeholder text for dropdown"
                />
              </div>
            )}

            {/* API Call specific validations */}
            {fieldType === "apicall" && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.API_LIST_TYPE}</label>
                  <CustomDropDown
                    value={(() => {
                      // Find current selection by matching both endPoint and category
                      const current = API_ENDPOINTS.find(
                        ep => ep.value === config.endPoint && 
                              (ep.category === config.category || (!ep.category && !config.category))
                      );
                      // Use label as the unique identifier
                      return current?.label || "";
                    })()}
                    onChange={(selectedLabel) => {
                      const selectedEndpoint = API_ENDPOINTS.find(ep => ep.label === selectedLabel);
                      if (selectedEndpoint) {
                        updateFn(sectionIndex, questionIndex, {
                          config: {
                            ...config,
                            endPoint: selectedEndpoint.value,
                            apiUrl: selectedEndpoint.value,
                            type: "select",
                            category: selectedEndpoint.category || undefined,
                          },
                        });
                      }
                    }}
                    options={API_ENDPOINTS.map((endpoint) => ({
                      value: endpoint.label, // Use label as unique value
                      label: endpoint.label,
                    }))}
                    placeholder="Select list type"
                    width={340}
                    className={styles.formSelect}
                  />
                  <div className={styles.validationHint}>
                    {FORM_BUILDER_TEXT.VALIDATION_HINTS.API_LIST_TYPE}
                  </div>
                </div>
              </>
            )}

            {/* Date specific validations */}
            {fieldType === "date" && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.DATE_VALIDATION_TYPE}</label>
                  <CustomDropDown
                    value={config.dateValidationType || "none"}
                    onChange={(selectedOption) => {
                      const newType =
                        typeof selectedOption === "object"
                          ? selectedOption.value
                          : selectedOption;
                      updateFn(sectionIndex, questionIndex, {
                        config: {
                          ...config,
                          dateValidationType: newType,
                          startDate: null,
                          endDate: null,
                          pastValidation: {
                            enabled: false,
                            minValue: null,
                            maxValue: null,
                            unit: "days",
                          },
                          futureValidation: {
                            enabled: false,
                            minValue: null,
                            maxValue: null,
                            unit: "days",
                          },
                        },
                      });
                    }}
                    options={DATE_VALIDATION_TYPE_OPTIONS}
                    placeholder="Select validation type"
                    width={340}
                    className={styles.formSelect}
                  />
                </div>

                {config.dateValidationType === "static" && (
                  <div className={styles.formGroup}>
                    <div className={styles.formLaunchDateContainer}>
                      <div className={styles.formLaunchDate}>
                        <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.START_DATE}</label>
                        <CustomDatePicker
                          value={config.startDate || ""}
                          onChange={(date) =>
                            updateField(sectionIndex, questionIndex, {
                              config: { ...config, startDate: date },
                            })
                          }
                          futureDate={false}
                          startDate={new Date()}
                          borderRight={true}
                          errorExist={false}
                          dataTestId="date-start"
                        />
                      </div>

                      <div className={styles.formLaunchDate}>
                        <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.END_DATE}</label>
                        <CustomDatePicker
                          value={config.endDate || ""}
                          onChange={(date) =>
                            updateField(sectionIndex, questionIndex, {
                              config: { ...config, endDate: date },
                            })
                          }
                          futureDate={true}
                          startDate={
                            config.startDate
                              ? new Date(config.startDate)
                              : new Date()
                          }
                          borderRight={true}
                          errorExist={false}
                          dataTestId="date-end"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {config.dateValidationType === "custom" && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.CUSTOM_CONDITION_TYPE}</label>
                      <CustomDropDown
                        value={config.customConditionType || "range"}
                        onChange={(selectedOption) => {
                          const conditionType =
                            typeof selectedOption === "object"
                              ? selectedOption.value
                              : selectedOption;
                          updateField(sectionIndex, questionIndex, {
                            config: {
                              ...config,
                              customConditionType: conditionType,
                              pastValidation: {
                                enabled: false,
                                dateValidationField: null,
                                minValue: null,
                                maxValue: null,
                              },
                              futureValidation: {
                                enabled: false,
                                dateValidationField: null,
                                minValue: null,
                                maxValue: null,
                              },
                            },
                          });
                        }}
                        options={CUSTOM_CONDITION_TYPE_OPTIONS}
                        placeholder="Select condition type"
                        width={340}
                        className={styles.formSelect}
                      />
                      <div className={styles.validationHint}>
                        {FORM_BUILDER_TEXT.VALIDATION_HINTS.DATE_VALIDATION_TYPE}
                      </div>
                    </div>

                    {/* Past Date Validation */}
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <div className={styles.fieldTitleGroup}>
                        <span className={styles.requiredText}>{FORM_BUILDER_TEXT.TOGGLES.ALLOW_PAST_DATES}</span>
                        <label className={styles.toggleContainer}>
                          <input
                            type="checkbox"
                            checked={config.pastValidation?.enabled || false}
                            onChange={(e) =>
                              updateField(sectionIndex, questionIndex, {
                                config: {
                                  ...config,
                                  pastValidation: {
                                    enabled: e.target.checked,
                                    dateValidationField: null,
                                  },
                                },
                              })
                            }
                            className={styles.toggleInput}
                          />
                          <div className={styles.toggleSwitch}></div>
                        </label>
                      </div>
                    </div>

                    {config.pastValidation?.enabled && (
                      <>
                        {(!config.customConditionType || config.customConditionType === "range") && (
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.REFERENCE_DATE_FIELD}</label>
                            <CustomDropDown
                              value={config.pastValidation?.dateValidationField || ""}
                              onChange={(selectedOption) => {
                                const dateField = typeof selectedOption === "object" ? selectedOption.value : selectedOption;
                                updateField(sectionIndex, questionIndex, {
                                  config: {
                                    ...config,
                                    pastValidation: {
                                      ...config.pastValidation,
                                      dateValidationField: dateField,
                                    },
                                  },
                                });
                              }}
                              options={DATE_REFERENCE_OPTIONS}
                              placeholder="Select reference date"
                              width={340}
                              className={styles.formSelect}
                              menuwidth={80}
                              menuHeight={200}
                              key={`past-${sectionIndex}-${questionIndex}-${config.pastValidation?.dateValidationField}`}
                            />
                            <div className={styles.validationHint}>
                              {FORM_BUILDER_TEXT.MESSAGES.SELECT_PAST_DATE_REFERENCE}
                            </div>
                          </div>
                        )}

                        {config.customConditionType === "normal" && (
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.CUSTOM_PAST_VALUE}</label>
                            <input
                              type="text"
                              value={config.pastValidation?.minValue || ""}
                              onChange={(e) =>
                                updateField(sectionIndex, questionIndex, {
                                  config: {
                                    ...config,
                                    pastValidation: {
                                      ...config.pastValidation,
                                      minValue: e.target.value,
                                    },
                                  },
                                })
                              }
                              className={styles.formInput}
                              placeholder="e.g., 18 or childMaxAge"
                            />
                            <div className={styles.validationHint}>
                              {FORM_BUILDER_TEXT.VALIDATION_HINTS.PAST_DATE_VALIDATION}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Future Date Validation */}
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <div className={styles.fieldTitleGroup}>
                        <span className={styles.requiredText}>
                          {FORM_BUILDER_TEXT.TOGGLES.ALLOW_FUTURE_DATES}
                        </span>
                        <label className={styles.toggleContainer}>
                          <input
                            type="checkbox"
                            checked={config.futureValidation?.enabled || false}
                            onChange={(e) =>
                              updateField(sectionIndex, questionIndex, {
                                config: {
                                  ...config,
                                  futureValidation: {
                                    enabled: e.target.checked,
                                    dateValidationField: null,
                                  },
                                },
                              })
                            }
                            className={styles.toggleInput}
                          />
                          <div className={styles.toggleSwitch}></div>
                        </label>
                      </div>
                    </div>

                    {config.futureValidation?.enabled && (
                      <>
                        {(!config.customConditionType || config.customConditionType === "range") && (
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.REFERENCE_DATE_FIELD}</label>
                            <CustomDropDown
                              value={config.futureValidation?.dateValidationField || ""}
                              onChange={(selectedOption) => {
                                const dateField = typeof selectedOption === "object" ? selectedOption.value : selectedOption;
                                updateField(sectionIndex, questionIndex, {
                                  config: {
                                    ...config,
                                    futureValidation: {
                                      ...config.futureValidation,
                                      dateValidationField: dateField,
                                    },
                                  },
                                });
                              }}
                              options={DATE_REFERENCE_OPTIONS}
                              placeholder="Select reference date"
                              width={340}
                              className={styles.formSelect}
                              menuwidth={80}
                              menuHeight={200}
                              key={`future-${sectionIndex}-${questionIndex}-${config.futureValidation?.dateValidationField}`}
                            />
                            <div className={styles.validationHint}>
                              {FORM_BUILDER_TEXT.MESSAGES.SELECT_FUTURE_DATE_REFERENCE}
                            </div>
                          </div>
                        )}

                        {config.customConditionType === "normal" && (
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.CUSTOM_FUTURE_VALUE}</label>
                            <input
                              type="text"
                              value={config.futureValidation?.maxValue || ""}
                              onChange={(e) =>
                                updateField(sectionIndex, questionIndex, {
                                  config: {
                                    ...config,
                                    futureValidation: {
                                      ...config.futureValidation,
                                      maxValue: e.target.value,
                                    },
                                  },
                                })
                              }
                              className={styles.formInput}
                              placeholder="e.g., 60 or elderMinAge"
                            />
                            <div className={styles.validationHint}>
                              {FORM_BUILDER_TEXT.VALIDATION_HINTS.FUTURE_DATE_VALIDATION}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {config.dateValidationType === "dynamic" && (
                  <>
                    {/* Past Date Validation */}
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <div className={styles.fieldTitleGroup}>
                        <span className={styles.requiredText}>{FORM_BUILDER_TEXT.TOGGLES.ALLOW_PAST_DATES}</span>
                        <label className={styles.toggleContainer}>
                          <input
                            type="checkbox"
                            checked={config.pastValidation?.enabled || false}
                            onChange={(e) =>
                              updateField(sectionIndex, questionIndex, {
                                config: {
                                  ...config,
                                  pastValidation: {
                                    enabled: e.target.checked,
                                    minValue: null,
                                    maxValue: null,
                                    unit: "days",
                                  },
                                },
                              })
                            }
                            className={styles.toggleInput}
                          />
                          <div className={styles.toggleSwitch}></div>
                        </label>
                      </div>
                    </div>

                    {config.pastValidation?.enabled && (
                      <div className={styles.formLaunchDateContainer}>
                        <div className={styles.formLaunchDate}>
                          <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MIN_VALUE}</label>
                          <input
                            type="number"
                            value={config.pastValidation?.minValue !== undefined && config.pastValidation?.minValue !== null ? config.pastValidation.minValue : ""}
                            onChange={(e) =>
                              updateField(sectionIndex, questionIndex, {
                                config: {
                                  ...config,
                                  pastValidation: {
                                    ...config.pastValidation,
                                    minValue: e.target.value !== ""
                                      ? parseInt(e.target.value)
                                      : null,
                                  },
                                },
                              })
                            }
                            className={styles.formInput}
                            placeholder="Min"
                          />
                        </div>
                        <div className={styles.formLaunchDate}>
                          <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MAX_VALUE}</label>
                          <input
                            type="number"
                            value={config.pastValidation?.maxValue !== undefined && config.pastValidation?.maxValue !== null ? config.pastValidation.maxValue : ""}
                            onChange={(e) =>
                              updateField(sectionIndex, questionIndex, {
                                config: {
                                  ...config,
                                  pastValidation: {
                                    ...config.pastValidation,
                                    maxValue: e.target.value !== ""
                                      ? parseInt(e.target.value)
                                      : null,
                                  },
                                },
                              })
                            }
                            className={styles.formInput}
                            placeholder="Max"
                          />
                        </div>
                        <div className={styles.formLaunchDate}>
                          <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.UNIT}</label>
                          <CustomDropDown
                            value={config.pastValidation?.unit || "days"}
                            onChange={(selectedOption) => {
                              const unitValue =
                                typeof selectedOption === "object"
                                  ? selectedOption.value
                                  : selectedOption;

                              updateField(sectionIndex, questionIndex, {
                                config: {
                                  ...config,
                                  pastValidation: {
                                    ...config.pastValidation,
                                    enabled: true,
                                    minValue:
                                      config.pastValidation?.minValue || null,
                                    maxValue:
                                      config.pastValidation?.maxValue || null,
                                    unit: unitValue,
                                  },
                                },
                              });
                            }}
                            options={TIME_UNIT_OPTIONS}
                            placeholder="Select unit"
                            width={340}
                            className={styles.formSelect}
                            menuwidth={80}
                            menuHeight={200}
                            key={`past-unit-${sectionIndex}-${questionIndex}-${config.pastValidation?.unit}`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Future Date Validation - Same structure */}
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <div className={styles.fieldTitleGroup}>
                        <span className={styles.requiredText}>
                          {FORM_BUILDER_TEXT.TOGGLES.ALLOW_FUTURE_DATES}
                        </span>
                        <label className={styles.toggleContainer}>
                          <input
                            type="checkbox"
                            checked={config.futureValidation?.enabled || false}
                            onChange={(e) =>
                              updateField(sectionIndex, questionIndex, {
                                config: {
                                  ...config,
                                  futureValidation: {
                                    enabled: e.target.checked,
                                    minValue: null,
                                    maxValue: null,
                                    unit: "days",
                                  },
                                },
                              })
                            }
                            className={styles.toggleInput}
                          />
                          <div className={styles.toggleSwitch}></div>
                        </label>
                      </div>
                    </div>

                    {config.futureValidation?.enabled && (
                      <div className={styles.formLaunchDateContainer}>
                        <div className={styles.formLaunchDate}>
                          <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MIN_VALUE}</label>
                          <input
                            type="number"
                            value={config.futureValidation?.minValue !== undefined && config.futureValidation?.minValue !== null ? config.futureValidation.minValue : ""}
                            onChange={(e) =>
                              updateField(sectionIndex, questionIndex, {
                                config: {
                                  ...config,
                                  futureValidation: {
                                    ...config.futureValidation,
                                    minValue: e.target.value !== ""
                                      ? parseInt(e.target.value)
                                      : null,
                                  },
                                },
                              })
                            }
                            className={styles.formInput}
                            placeholder="Min"
                          />
                        </div>
                        <div className={styles.formLaunchDate}>
                          <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MAX_VALUE}</label>
                          <input
                            type="number"
                            value={config.futureValidation?.maxValue !== undefined && config.futureValidation?.maxValue !== null ? config.futureValidation.maxValue : ""}
                            onChange={(e) =>
                              updateField(sectionIndex, questionIndex, {
                                config: {
                                  ...config,
                                  futureValidation: {
                                    ...config.futureValidation,
                                    maxValue: e.target.value !== ""
                                      ? parseInt(e.target.value)
                                      : null,
                                  },
                                },
                              })
                            }
                            className={styles.formInput}
                            placeholder="Max"
                          />
                        </div>
                        <div className={styles.formLaunchDate}>
                          <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.UNIT}</label>
                          <CustomDropDown
                            value={config.futureValidation?.unit || "days"}
                            onChange={(selectedOption) => {
                              const unitValue =
                                typeof selectedOption === "object"
                                  ? selectedOption.value
                                  : selectedOption;

                              updateField(sectionIndex, questionIndex, {
                                config: {
                                  ...config,
                                  futureValidation: {
                                    ...config.futureValidation,
                                    enabled: true,
                                    minValue:
                                      config.futureValidation?.minValue || null,
                                    maxValue:
                                      config.futureValidation?.maxValue || null,
                                    unit: unitValue,
                                  },
                                },
                              });
                            }}
                            options={TIME_UNIT_OPTIONS}
                            placeholder="Select unit"
                            width={340}
                            className={styles.formSelect}
                            menuwidth={80}
                            menuHeight={200}
                            key={`future-unit-${sectionIndex}-${questionIndex}-${config.futureValidation?.unit}`}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </>
    );
  };

  // Binding keys of questions that are currently visible (pass their conditionalConfig).
  // Used to filter dependsOn conditions in the UI so references to hidden questions are not shown.
  const visibleBindingKeys = new Set<string>();
  sections.sections.forEach((section) => {
    if (!evaluateConditionalConfig((section as any).conditionalConfig, programMeta)) return;
    section.items.forEach((item) => {
      if (item.type === SectionItemType.Question && evaluateConditionalConfig((item as any).question?.conditionalConfig, programMeta)) {
        const bindingKey = item.question?.question?.bindingKey;
        if (bindingKey) visibleBindingKeys.add(bindingKey);
      } else if (item.type === SectionItemType.Subsection && evaluateConditionalConfig((item as any).conditionalConfig, programMeta)) {
        ((item as any).questions || []).forEach((questionMap: any) => {
          if (evaluateConditionalConfig(questionMap.conditionalConfig, programMeta)) {
            const bindingKey = questionMap.question?.bindingKey;
            if (bindingKey) visibleBindingKeys.add(bindingKey);
          }
        });
      }
    });
  });

  return (
    <>
      <div className={styles.programHeader}>
        <div className={styles.programHeaderText}>
          <ArrowLeft
            size={24}
            onClick={handleBack}
            className={styles.arrowIcon}
          />
          {FORM_BUILDER_TEXT.UI.HEADING}
        </div>
      </div>
      <div>
        <Stepper currentStep={2} />
      </div>

      <div className={styles.formBuilder}>
        <div className={styles.programBanner}>
          <BannerRenderer
            bannerAnimationUrl={location?.state?.bannerAnimationUrl}
            bannerImageUrl={location?.state?.bannerImageUrl}
            fallbackImage={location?.state?.bannerImage || getProgramImageForBanner(location?.state?.programName)}
            alt="Program Banner"
          />
          {/* <input
            type="file"
            accept="image/*"
            className={styles.hiddenElement}
            id="banner-upload-input"
            onChange={handleBannerUpload}
          />
          <Button
            type="button"
            buttonClassName={styles.buttonContainer}
            buttonTextClassName={styles.buttonText}
            datatestid="add-program-save-button"
            datatestidText="add-program-save"
            onClick={() => {
              const input = document.getElementById(
                "banner-upload-input",
              ) as HTMLInputElement;
              if (input) input.click();
            }}
            lessPadding={true}
          >
            {FORM_BUILDER_TEXT.BUTTONS.CHANGE_BANNER}
          </Button> */}
        </div>
        <div className={styles.layoutToggle}>
          <span className={styles.heading}>Form layout:</span>
          <div className={styles.layoutButtons}>
            <button
              className={`${styles.layoutButton} ${
                columnLayout === "1" ? styles.active : ""
              }`}
              onClick={() => setColumnLayout("1")}
            >
              {FORM_BUILDER_TEXT.BUTTONS.ONE_COLUMN}
            </button>
            <button
              className={`${styles.layoutButton} ${
                columnLayout === "2" ? styles.active : ""
              }`}
              onClick={() => setColumnLayout("2")}
            >
              {FORM_BUILDER_TEXT.BUTTONS.TWO_COLUMN}
            </button>
          </div>
        </div>
        {sections.sections.map((section, sectionIndex) => {
          if (!evaluateConditionalConfig(section.conditionalConfig, programMeta)) return null;
          return (<div key={sectionIndex} className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleEditableWrapper}>
                <button
                  onClick={() => toggleSectionCollapse(sectionIndex)}
                  className={styles.collapseToggleBtn}
                  title={collapsedSections.has(sectionIndex) ? "Expand section" : "Collapse section"}
                >
                  {collapsedSections.has(sectionIndex) ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronUp size={20} />
                  )}
                </button>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const text = e.currentTarget.textContent || "";
                    const updatedSections = [...sections.sections];
                    updatedSections[sectionIndex].sectionName = text;
                    setSections({ sections: updatedSections });
                  }}
                  dangerouslySetInnerHTML={{
                    __html: renderSectionName(section.sectionName),
                  }}
                  className={`${styles.sectionTitleInput} ${styles.sectionTitleInputDynamic}`}
                  style={{
                    width: `${Math.max(section.sectionName.length * 12, 60)}px`,
                  }}
                />
                <div className={styles.editIcon}>
                  <img src={editbutton} alt="edit" />
                </div>
              </div>

              <Button
                buttonClassName={styles.programsDashboardAddButton}
                onClick={() => addField(sectionIndex)}
                datatestid="create-infinipath"
                datatestidText="create-infinipath-text"
              >
                {FORM_BUILDER_TEXT.BUTTONS.ADD_FIELD}
              </Button>
              <Button
                buttonClassName={styles.programsDashboardAddButton}
                onClick={() => openSubSectionModal(sectionIndex)}
                datatestid="create-subsection"
                datatestidText="create-subsection-text"
              >
                {FORM_BUILDER_TEXT.BUTTONS.ADD_SUB_SECTION}
              </Button>
            </div>

            {!collapsedSections.has(sectionIndex) && (
            <div className={styles.sectionContent}>
              {section.items.map((item, itemIndex) => {
                if (item.type === SectionItemType.Subsection && !evaluateConditionalConfig((item as any).conditionalConfig, programMeta)) return null;
                if (item.type === SectionItemType.Question && !evaluateConditionalConfig((item as any).question?.conditionalConfig, programMeta)) return null;
                if (item.type === SectionItemType.Subsection) {
                  return (
                    <div key={item.subSectionId} className={styles.subsectionContainer}>
                      <div className={styles.subsectionHeader}>
                        <h4 className={styles.subsectionTitle}>{item.subSectionName}</h4>
                        <div className={styles.subsectionActions}>
                          <Button
                            buttonClassName={styles.programsDashboardAddButton}
                            onClick={() => addFieldToSubSection(sectionIndex, itemIndex)}
                            datatestid="add-subsection-field"
                            datatestidText="add-subsection-field-text"
                          >
                            {FORM_BUILDER_TEXT.BUTTONS.ADD_FIELD}
                          </Button>
                          <button
                            onClick={() => moveSubSectionUp(sectionIndex, itemIndex)}
                            disabled={itemIndex === 0}
                            className={styles.arrowBtn}
                          >
                            <div className={`${styles.arrowUp} ${itemIndex === 0 ? styles.arrowUpDisabled : styles.arrowUpEnabled}`} />
                          </button>
                          <button
                            onClick={() => moveSubSectionDown(sectionIndex, itemIndex)}
                            disabled={itemIndex === section.items.length - 1}
                            className={styles.arrowBtn}
                          >
                            <div className={`${styles.arrowDown} ${itemIndex === section.items.length - 1 ? styles.arrowDownDisabled : styles.arrowDownEnabled}`} />
                          </button>
                          <button
                            onClick={() => deleteSubSection(sectionIndex, itemIndex)}
                            className={styles.btnDeleteSubsection}
                          >
                            {FORM_BUILDER_TEXT.BUTTONS.DELETE_SUB_SECTION}
                          </button>
                        </div>
                      </div>
                      {item.questions && item.questions.length > 0 ? (
                        item.questions.map((field, subQuestionIndex) => {
                          return (
                            <div key={field.id} className={styles.field}>
                              <div className={styles.fieldHeader}>
                                <div className={styles.fieldTitleGroup}>
                                  <div className={styles.fieldTitleGroup}>
                                    <input
                                      type="text"
                                      value={field.question.label}
                                      onChange={(e) =>
                                        updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                          label: e.target.value,
                                        })
                                      }
                                      className={styles.fieldLabelInput}
                                    />
                                  </div>
                                </div>
                                <div className={styles.fieldActionsColumn}>
                                  <button
                                    onClick={() => moveSubSectionQuestionUp(sectionIndex, itemIndex, subQuestionIndex)}
                                    disabled={subQuestionIndex === 0}
                                    className={styles.arrowBtn}
                                    title="Move up"
                                  >
                                    <div className={`${styles.arrowUp} ${subQuestionIndex === 0 ? styles.arrowUpDisabled : styles.arrowUpEnabled}`} />
                                  </button>
                                  <button
                                    onClick={() => moveSubSectionQuestionDown(sectionIndex, itemIndex, subQuestionIndex)}
                                    disabled={subQuestionIndex === (item.questions?.length || 0) - 1}
                                    className={styles.arrowBtn}
                                    title="Move down"
                                  >
                                    <div className={`${styles.arrowDown} ${subQuestionIndex === (item.questions?.length || 0) - 1 ? styles.arrowDownDisabled : styles.arrowDownEnabled}`} />
                                  </button>
                                </div>
                              </div>
                              <div className={styles.fieldConfig}>
                                <div className={styles.formGroup}>
                                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.LABEL_NAME}</label>
                                  <input
                                    type="text"
                                    value={field.question.label}
                                    onChange={(e) =>
                                      updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                        label: e.target.value,
                                      })
                                    }
                                    className={styles.formInput}
                                  />
                                </div>
                                <div className={styles.formGroup}>
                                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.FIELD_TYPE}</label>
                                  <CustomDropDown
                                    value={field.question.type}
                                    onChange={(selectedOption) => {
                                      const newType = selectedOption?.value || selectedOption;
                                      // Merge existing config with default config for new type
                                      const defaultConfig = getDefaultValidationConfig(newType);
                                      const existingConfig = field.question.config || {};
                                      updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                        type: newType,
                                        questionOptionMaps: [],
                                        config: { ...defaultConfig, ...existingConfig }, // Defaults first, then existing
                                      });
                                    }}
                                    options={fieldTypes.map((type) => ({
                                      value: type.value,
                                      label: type.label,
                                    }))}
                                    placeholder="Select field type"
                                    width={340}
                                    className={styles.formSelect}
                                    menuwidth={80}
                                    menuHeight={200}
                                    key={`${sectionIndex}-${itemIndex}-${subQuestionIndex}-${field.question.type}`}
                                  />
                                </div>
                                
                                {field.question.type !== "multiQuestion" && (
                                  <>
                                    {![
                                      "password",
                                      "radio",
                                      "checkbox",
                                      "date",
                                      "file",
                                      "boolean",
                                    ].includes(field.question.type) && (
                                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.PLACEHOLDER}</label>
                                        <input
                                          type="text"
                                          value={field.question.config.placeholder || ""}
                                          onChange={(e) =>
                                            updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                              config: {
                                                ...field.question.config,
                                                placeholder: e.target.value,
                                              },
                                            })
                                          }
                                          className={styles.formInput}
                                          placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.ENTER_PLACEHOLDER}
                                        />
                                      </div>
                                    )}

                                    {(field.question.type === "radio" ||
                                      field.question.type === "checkbox" ||
                                      field.question.type === "select") && (
                                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.formLabel}>
                                          {FORM_BUILDER_TEXT.LABELS.OPTIONS_MANAGER}
                                        </label>
                                        <textarea
                                          value={field.question.questionOptionMaps
                                            .map((optionMap) => optionMap.option.name)
                                            .join(",")}
                                          onChange={(e) => {
                                            const inputValue = e.target.value;
                                            const optionNames = inputValue.split(",");
                                            const options = optionNames.map((name, index) => ({
                                              id: index,
                                              name: name,
                                              type: "string",
                                              status: "published",
                                            }));
                                            const questionOptionMaps = options.map(
                                              (option, index) => ({
                                                id: index,
                                                option,
                                              }),
                                            );
                                            updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                              questionOptionMaps,
                                            });
                                          }}
                                          className={styles.formTextarea}
                                          placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.ENTER_OPTIONS}
                                        />
                                        <div className={styles.validationHint}>
                                          {FORM_BUILDER_TEXT.MESSAGES.VALIDATION_HINT}
                                        </div>
                                      </div>
                                    )}

                                    {/* Depends On functionality for subsection questions - same as regular questions */}
                                    {(() => {
                                      const currentBK = field?.question?.bindingKey || "";
                                      const circularKeys = currentBK
                                        ? getCircularDependencyKeys(currentBK, sections?.sections || [])
                                        : new Set<string>();
                                      const availableQuestions = getAllQuestionsForDependsOn(
                                        sections?.sections || [],
                                        currentBK,
                                      ).filter(
                                        (q) => visibleBindingKeys.has(q.bindingKey) && !circularKeys.has(q.bindingKey),
                                      );

                                      if (availableQuestions.length === 0) return null;

                                      const dependsOnData = field.question.config.dependsOn;
                                      const allConditions = dependsOnData
                                        ? (Array.isArray(dependsOnData) ? dependsOnData : [dependsOnData])
                                        : [];
                                      // Only show conditions that reference visible questions
                                      const conditions = allConditions.filter(
                                        (c: any) => !c?.questionBindingKey || visibleBindingKeys.has(c.questionBindingKey)
                                      );

                                      return (
                                        <>
                                          {conditions.map((condition, conditionIndex) => {
                                            const dependentQuestionType = condition.questionBindingKey
                                              ? getQuestionTypeById(sections.sections, condition.questionBindingKey)
                                              : null;
                                            const isOptionsBasedType = dependentQuestionType && ['radio', 'select', 'checkbox'].includes(dependentQuestionType);
                                            const isDateFieldType = dependentQuestionType === 'date';
                                            const isNumberType = dependentQuestionType === 'number';
                                            
                                            return (
                                              <div 
                                                key={`condition-${conditionIndex}`}
                                                className={styles.conditionBox}
                                              >
                                                <div className={styles.conditionHeaderRow}>
                                                  <h4 className={styles.conditionHeading}>
                                                    {FORM_BUILDER_TEXT.MESSAGES.CONDITION_LABEL} {conditionIndex + 1}
                                                  </h4>
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        const updatedConditions = conditions.filter((_, idx) => idx !== conditionIndex);
                                                        updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                                          config: {
                                                            ...field.question.config,
                                                            dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                                          },
                                                        });
                                                      }}
                                                      className={styles.btnRemoveCondition}
                                                    >
                                                      {FORM_BUILDER_TEXT.BUTTONS.REMOVE}
                                                    </button>
                                                </div>

                                                <div className={styles.twoColumnGrid}>
                                                  <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                                    <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.DEPENDS_ON}</label>
                                                    <Select
                                                      isClearable
                                                      value={
                                                        condition.questionBindingKey
                                                          ? (() => {
                                                              const matchedQuestion = availableQuestions.find(
                                                                q => q.bindingKey === condition.questionBindingKey
                                                              );
                                                              return matchedQuestion
                                                                ? {
                                                                    value: matchedQuestion.id,
                                                                    label: `${matchedQuestion.label} (${matchedQuestion.type}) - ${matchedQuestion.sectionName}`,
                                                                  }
                                                                : null;
                                                            })()
                                                          : null
                                                      }
                                                      onChange={(selectedOption) => {
                                                        const selectedQuestion = availableQuestions.find(q => q.id === selectedOption?.value);
                                                        const isDateType = selectedQuestion?.type === 'date';
                                                        const isNumberType = selectedQuestion?.type === 'number';
                                                        
                                                        const updatedConditions = [...conditions];
                                                        updatedConditions[conditionIndex] = selectedOption
                                                          ? {
                                                              questionId: selectedOption.value,
                                                              value: [],
                                                              type: "show",
                                                              questionBindingKey: selectedQuestion?.bindingKey || "",
                                                              ...(isDateType && {
                                                                transformedMinValue: "",
                                                                transformedMaxValue: "",
                                                                dateConditionType: "custom",
                                                              }),
                                                              ...(isNumberType && {
                                                                operator: "equals",
                                                              }),
                                                            }
                                                          : {
                                                              questionId: null,
                                                              value: [],
                                                              type: "show",
                                                              questionBindingKey: "",
                                                            };

                                                        updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                                          config: {
                                                            ...field.question.config,
                                                            dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                                          },
                                                        });
                                                      }}
                                                      options={[
                                                        ...getAllQuestionsFromAllSections(
                                                          sections.sections,
                                                          field.question.id,
                                                          sectionIndex,
                                                          questionIndex,
                                                        ).map((q) => ({
                                                          value: q.id,
                                                          label: `${q.label} (${q.type}) - ${q.sectionName}`,
                                                        })),
                                                    
                                                      ]}
                                                      classNamePrefix="dependsOnSelect"
                                                      placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.SELECT_QUESTION}
                                                    />
                                                  </div>

                                                  {condition.questionBindingKey && (
                                                    <>
                                                      {isOptionsBasedType && (
                                                        <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                                          <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.DEPENDS_ON_VALUE}</label>
                                                          <Select
                                                            isMulti
                                                            isClearable
                                                            value={(Array.isArray(condition?.value) ? condition?.value : (condition?.value ? [condition?.value] : [])).map(
                                                              (val) => ({
                                                                value: val,
                                                                label: val,
                                                              }),
                                                            )}
                                                            onChange={(selectedOptions) => {
                                                              const values = selectedOptions
                                                                ? selectedOptions.map((option) => option.value)
                                                                : [];

                                                              const updatedConditions = [...conditions];
                                                              updatedConditions[conditionIndex] = {
                                                                ...updatedConditions[conditionIndex],
                                                                value: values,
                                                              };

                                                              updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                                                config: {
                                                                  ...field.question.config,
                                                                  dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                                                },
                                                              });
                                                            }}
                                                            options={getRadioOptionsForQuestion(
                                                              sections.sections,
                                                              condition.questionBindingKey,
                                                            )}
                                                            classNamePrefix="dependsOnSelect"
                                                            placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.SELECT_VALUES}
                                                          />
                                                        </div>
                                                      )}

                                                      {isNumberType && (
                                                        <>
                                                          <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                                            <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.OPERATOR}</label>
                                                            <Select
                                                              isClearable={false}
                                                              value={
                                                                condition.operator
                                                                  ? OPERATOR_OPTIONS.find((opt) => opt.value === condition.operator) || OPERATOR_OPTIONS[0]
                                                                  : OPERATOR_OPTIONS[0]
                                                              }
                                                              onChange={(selectedOption) => {
                                                                const updatedConditions = [...conditions];
                                                                updatedConditions[conditionIndex] = {
                                                                  ...updatedConditions[conditionIndex],
                                                                  operator: selectedOption ? selectedOption.value : "equals",
                                                                  value: [],
                                                                };

                                                                updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                                                  config: {
                                                                    ...field.question.config,
                                                                    dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                                                  },
                                                                });
                                                              }}
                                                              options={OPERATOR_OPTIONS}
                                                              classNamePrefix="dependsOnSelect"
                                                              placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.SELECT_OPERATOR}
                                                            />
                                                          </div>

                                                          {condition.operator === "range" ? (
                                                            <>
                                                              <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                                                <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MIN_VALUE}</label>
                                                                <input
                                                                  type="number"
                                                                  value={(Array.isArray(condition?.value) ? condition?.value[0] : condition?.value) ?? ""}
                                                                  onChange={(e) => {
                                                                    const updatedConditions = [...conditions];
                                                                    updatedConditions[conditionIndex] = {
                                                                      ...updatedConditions[conditionIndex],
                                                                      value: [e.target.value, condition?.value?.[1] ?? ""],
                                                                    };

                                                                    updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                                                      config: {
                                                                        ...field.question.config,
                                                                        dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                                                      },
                                                                    });
                                                                  }}
                                                                  className={styles.formInput}
                                                                  placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.ENTER_MIN_VALUE}
                                                                />
                                                              </div>

                                                              <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                                                <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MAX_VALUE}</label>
                                                                <input
                                                                  type="number"
                                                                  value={condition?.value?.[1] ?? ""}
                                                                  onChange={(e) => {
                                                                    const updatedConditions = [...conditions];
                                                                    updatedConditions[conditionIndex] = {
                                                                      ...updatedConditions[conditionIndex],
                                                                      value: [condition?.value?.[0] ?? "", e.target.value],
                                                                    };

                                                                    updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                                                      config: {
                                                                        ...field.question.config,
                                                                        dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                                                      },
                                                                    });
                                                                  }}
                                                                  className={styles.formInput}
                                                                  placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.ENTER_MAX_VALUE}
                                                                />
                                                              </div>
                                                            </>
                                                          ) : (
                                                            <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                                              <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.VALUE}</label>
                                                              <input
                                                                type="number"
                                                                value={(Array.isArray(condition?.value) ? condition?.value[0] : condition?.value) ?? ""}
                                                                onChange={(e) => {
                                                                  const updatedConditions = [...conditions];
                                                                  updatedConditions[conditionIndex] = {
                                                                    ...updatedConditions[conditionIndex],
                                                                    value: [e.target.value],
                                                                  };

                                                                  updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                                                    config: {
                                                                      ...field.question.config,
                                                                      dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                                                    },
                                                                  });
                                                                }}
                                                                className={styles.formInput}
                                                                placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.ENTER_VALUE}
                                                              />
                                                            </div>
                                                          )}
                                                        </>
                                                      )}

                                                      {isDateFieldType && (
                                                        <>
                                                          <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                                            <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.DATE_CONDITION_TYPE}</label>
                                                            <CustomDropDown
                                                              value={condition.dateConditionType || "custom"}
                                                              onChange={(selectedOption) => {
                                                                const conditionType = typeof selectedOption === "object" ? selectedOption.value : selectedOption;
                                                                const updatedConditions = [...conditions];
                                                                updatedConditions[conditionIndex] = {
                                                                  ...updatedConditions[conditionIndex],
                                                                  dateConditionType: conditionType,
                                                                  transformedMinValue: conditionType !== "custom" ? "" : updatedConditions[conditionIndex].transformedMinValue || "",
                                                                  transformedMaxValue: conditionType !== "custom" ? "" : updatedConditions[conditionIndex].transformedMaxValue || "",
                                                                };
                                                                updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                                                  config: {
                                                                    ...field.question.config,
                                                                    dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                                                  },
                                                                });
                                                              }}
                                                            options={DATE_FIELD_CONDITION_TYPES}
                                                              width={340}
                                                              className={styles.formSelect}
                                                            />
                                                          </div>

                                                          {condition.dateConditionType === "custom" && (
                                                            <>
                                                              <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                                                <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MIN_DATE}</label>
                                                                <CustomDatePicker
                                                                  selected={condition.transformedMinValue ? new Date(condition.transformedMinValue) : null}
                                                                  onChange={(date: Date | null) => {
                                                                    const updatedConditions = [...conditions];
                                                                    updatedConditions[conditionIndex] = {
                                                                      ...updatedConditions[conditionIndex],
                                                                      transformedMinValue: date ? date.toISOString() : "",
                                                                    };
                                                                    updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                                                      config: {
                                                                        ...field.question.config,
                                                                        dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                                                      },
                                                                    });
                                                                  }}
                                                                  placeholderText={FORM_BUILDER_TEXT.PLACEHOLDERS.SELECT_MIN_DATE}
                                                                  isClearable
                                                                />
                                                              </div>

                                                              <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                                                <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MAX_DATE}</label>
                                                                <CustomDatePicker
                                                                  selected={condition.transformedMaxValue ? new Date(condition.transformedMaxValue) : null}
                                                                  onChange={(date: Date | null) => {
                                                                    const updatedConditions = [...conditions];
                                                                    updatedConditions[conditionIndex] = {
                                                                      ...updatedConditions[conditionIndex],
                                                                      transformedMaxValue: date ? date.toISOString() : "",
                                                                    };
                                                                    updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                                                      config: {
                                                                        ...field.question.config,
                                                                        dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                                                      },
                                                                    });
                                                                  }}
                                                                  placeholderText={FORM_BUILDER_TEXT.PLACEHOLDERS.SELECT_MAX_DATE}
                                                                  isClearable
                                                                />
                                                              </div>
                                                            </>
                                                          )}
                                                        </>
                                                      )}
                                                    </>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })}

                                          {availableQuestions.length > 0 && (
                                            <div className={styles.fullWidthGridItem}>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const dependsOnArray = Array.isArray(field.question.config.dependsOn)
                                                    ? [...field.question.config.dependsOn]
                                                    : field.question.config.dependsOn
                                                    ? [field.question.config.dependsOn]
                                                    : [];

                                                  dependsOnArray.push({
                                                    questionId: null,
                                                    value: [],
                                                    type: "show",
                                                    questionBindingKey: "",
                                                  });

                                                  updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                                    config: {
                                                      ...field.question.config,
                                                      dependsOn: dependsOnArray,
                                                    },
                                                  });
                                                }}
                                                className={styles.btnAddCondition}
                                              >
                                                <span className={styles.btnAddConditionIcon}>+</span>
                                                {conditions.length === 0 ? FORM_BUILDER_TEXT.BUTTONS.ADD_DEPENDS_ON : FORM_BUILDER_TEXT.BUTTONS.ADD_ANOTHER_DEPENDS_ON}
                                              </button>
                                            </div>
                                          )}
                                        </>
                                      );
                                    })()}

                                    {/* Validation controls for subsection questions */}
                                    {renderValidationControls(field, sectionIndex, subQuestionIndex, itemIndex, true)}
                                  </>
                                )}

                                {/* Multi-Question configuration for subsection questions */}
                                {field.question.type === "multiQuestion" && (() => {
                                  const config = field.question.config;
                                  
                                  return (
                                    <>
                                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <div className={styles.multiQuestionFieldHeader}>
                                          <label className={`form-label ${styles.multiQuestionFieldLabel}`}>
                                            {FORM_BUILDER_TEXT.LABELS.CONFIGURE_SUB_FIELDS} ({(config.questions || []).length} {(config.questions || []).length !== 1 ? FORM_BUILDER_TEXT.FIELD_COUNT.PLURAL : FORM_BUILDER_TEXT.FIELD_COUNT.SINGULAR})
                                          </label>
                                          <Button
                                            onClick={() => {
                                              const newQuestion = {
                                                key: `field_${(config.questions?.length || 0) + 1}`,
                                                label: "",
                                                displayOrder: (config.questions?.length || 0) + 1,
                                                displayLabelType: "textarea",
                                                placeholder: "",
                                                minCharacter: 1,
                                                maxCharacters: 500,
                                              };
                                              updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                                config: {
                                                  ...config,
                                                  questions: [...(config.questions || []), newQuestion],
                                                },
                                              });
                                            }}
                                            buttonClassName={styles.programsDashboardAddButton}
                                            datatestid="add-sub-question"
                                            datatestidText="add-sub-question-text"
                                          >
                                            {FORM_BUILDER_TEXT.BUTTONS.ADD_SUB_FIELD}
                                          </Button>
                                        </div>

                                        {(config.questions || []).map((subQuestion: any, subIndex: number) => {
                                          const subFieldType = subQuestion.displayLabelType || "textarea";
                                          
                                          return (
                                            <div key={subIndex} className={styles.multiQuestionSubFieldBox}>
                                              <div className={styles.multiQuestionSubFieldHeader}>
                                                <h4 className={styles.multiQuestionSubFieldTitle}>
                                                  {FORM_BUILDER_TEXT.MESSAGES.SUB_FIELD_LABEL} {subIndex + 1}
                                                </h4>
                                                <button
                                                  onClick={() => {
                                                    const updatedQuestions = config.questions.filter((_: any, i: number) => i !== subIndex);
                                                    updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                                      config: {
                                                        ...config,
                                                        questions: updatedQuestions.map((q: any, i: number) => ({
                                                          ...q,
                                                          displayOrder: i + 1,
                                                        })),
                                                      },
                                                    });
                                                  }}
                                                  className={styles.deleteBtn}
                                                  className={styles.smallButtonPadding}
                                                >
                                                  <img src={deleteIcon} alt="Delete" className={styles.deleteIconSize} />
                                                </button>
                                              </div>

                                              <div className={styles.twoColumnGrid}>
                                                <div>
                                                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.KEY_UNIQUE_IDENTIFIER}</label>
                                                  <input
                                                    type="text"
                                                    value={subQuestion.key}
                                                    onChange={(e) => {
                                                      const updatedQuestions = [...config.questions];
                                                      updatedQuestions[subIndex] = {
                                                        ...updatedQuestions[subIndex],
                                                        key: e.target.value,
                                                      };
                                                      updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                                        config: { ...config, questions: updatedQuestions },
                                                      });
                                                    }}
                                                    className={styles.formInput}
                                                    placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.KEY_EXAMPLE}
                                                  />
                                                </div>

                                                <div>
                                                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.LABEL_SHOWN_TO_SEEKER}</label>
                                                  <input
                                                    type="text"
                                                    value={subQuestion.label || ""}
                                                    onChange={(e) => {
                                                      const updatedQuestions = [...config.questions];
                                                      updatedQuestions[subIndex] = {
                                                        ...updatedQuestions[subIndex],
                                                        label: e.target.value,
                                                      };
                                                      updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                                        config: { ...config, questions: updatedQuestions },
                                                      });
                                                    }}
                                                    className={styles.formInput}
                                                    placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.LABEL_EXAMPLE}
                                                  />
                                                </div>

                                                <div>
                                                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.FIELD_TYPE}</label>
                                                  <CustomDropDown
                                                    value={subFieldType}
                                                    onChange={(val) => {
                                                      const updatedQuestions = [...config.questions];
                                                      const newType = typeof val === "object" ? val.value : val;
                                                      const defaultConfig = getDefaultValidationConfig(newType);
                                                      // Merge existing subQuestion config with default config
                                                      const existingConfig = { ...subQuestion };
                                                      delete existingConfig.key;
                                                      delete existingConfig.label;
                                                      delete existingConfig.displayOrder;
                                                      delete existingConfig.displayLabelType;
                                                      updatedQuestions[subIndex] = {
                                                        key: subQuestion.key,
                                                        label: subQuestion.label || "",
                                                        displayOrder: subQuestion.displayOrder,
                                                        displayLabelType: newType,
                                                        ...defaultConfig,
                                                        ...existingConfig,
                                                      };
                                                      
                                                      updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                                        config: { ...config, questions: updatedQuestions },
                                                      });
                                                    }}
                                                    options={fieldTypes
                                                      .filter(type => type.value !== 'multiQuestion' && type.label)
                                                      .map(type => ({
                                                        value: type.value,
                                                        label: type.label!
                                                      }))}
                                                    placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.SELECT_FIELD_TYPE}
                                                    width={340}
                                                    className={styles.formSelect}
                                                    menuwidth={80}
                                                    menuHeight={200}
                                                    key={`${sectionIndex}-${itemIndex}-${subQuestionIndex}-${subIndex}-${subFieldType}`}
                                                  />
                                                </div>

                                                <div>
                                                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.DISPLAY_ORDER}</label>
                                                  <input
                                                    type="number"
                                                    value={subQuestion.displayOrder}
                                                    onChange={(e) => {
                                                      const updatedQuestions = [...config.questions];
                                                      updatedQuestions[subIndex] = {
                                                        ...updatedQuestions[subIndex],
                                                        displayOrder: parseInt(e.target.value) || 1,
                                                      };
                                                      updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                                        config: { ...config, questions: updatedQuestions },
                                                      });
                                                    }}
                                                    className={styles.formInput}
                                                    min="1"
                                                  />
                                                </div>

                                                {renderSubFieldValidations(subQuestion, subIndex, subFieldType, config, sectionIndex, subQuestionIndex, (sIdx, qIdx, updates) => {
                                                  updateSubSectionField(sIdx, itemIndex, qIdx, updates);
                                                })}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                              <hr className={styles.sectionDivider} />
                              <div className={styles.sectionFooter}>
                                <div className={styles.sectionFooterLeft}>
                                  <span className={styles.requiredText}>{FORM_BUILDER_TEXT.LABELS.MARK_AS_REQUIRED}</span>
                                  <label className={styles.toggleContainer}>
                                    <input
                                      type="checkbox"
                                      checked={field.question.config.isRequired}
                                      onChange={(e) =>
                                        updateSubSectionField(sectionIndex, itemIndex, subQuestionIndex, {
                                          config: {
                                            ...field.question.config,
                                            isRequired: e.target.checked,
                                          },
                                        })
                                      }
                                      className={styles.toggleInput}
                                    />
                                    <div className={styles.toggleSwitch}></div>
                                  </label>
                                </div>
                                <div className={styles.sectionFooterDivider}></div>
                                
                                {/* Move out of subsection button */}
                                <button
                                  onClick={() => moveQuestionOutOfSubSection(sectionIndex, itemIndex, subQuestionIndex)}
                                  className={styles.btnMoveOut}
                                >
                                  {FORM_BUILDER_TEXT.BUTTONS.MOVE_OUT_OF_SUB_SECTION}
                                </button>
                                
                                <button
                                  onClick={() => deleteSubSectionQuestion(sectionIndex, itemIndex, subQuestionIndex)}
                                  className={styles.deleteBtn}
                                >
                                  <img
                                    src={deleteIcon}
                                    alt="Delete"
                                    className={styles.deleteIcon}
                                  />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className={styles.emptyStateMessage}>
                          {FORM_BUILDER_TEXT.MESSAGES.NO_QUESTIONS_IN_SUBSECTION}
                        </div>
                      )}
                    </div>
                  );
                }
                
                // Regular question rendering
                const field = item.question;
                const questionIndex = itemIndex;
                return (
                <div key={field.id} className={styles.field}>
                  <div className={styles.fieldHeader}>
                    <div className={styles.fieldTitleGroup}>
                      <div className={styles.fieldTitleGroup}>
                        <input
                          type="text"
                          value={field.question.label}
                          onChange={(e) =>
                            updateField(sectionIndex, questionIndex, {
                              label: e.target.value,
                            })
                          }
                          className={styles.fieldLabelInput}
                        />
                      </div>
                    </div>
                    <div className={styles.fieldActionsColumn}>
                      <button
                        onClick={() => moveQuestionUp(sectionIndex, questionIndex)}
                        disabled={questionIndex === 0}
                        className={styles.arrowBtn}
                        title="Move up"
                      >
                        <div className={`${styles.arrowUp} ${questionIndex === 0 ? styles.arrowUpDisabled : styles.arrowUpEnabled}`} />
                      </button>
                      <button
                        onClick={() => moveQuestionDown(sectionIndex, questionIndex)}
                        disabled={questionIndex === section.items.length - 1}
                        className={styles.arrowBtn}
                        title="Move down"
                      >
                        <div className={`${styles.arrowDown} ${questionIndex === section.items.length - 1 ? styles.arrowDownDisabled : styles.arrowDownEnabled}`} />
                      </button>
                    </div>
                  </div>
                  <div className={styles.fieldConfig}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.LABEL_NAME}</label>
                      <input
                        type="text"
                        value={field.question.label}
                        onChange={(e) =>
                          updateField(sectionIndex, questionIndex, {
                            label: e.target.value,
                          })
                        }
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.FIELD_TYPE}</label>
                      <CustomDropDown
                        value={field.question.type}
                        onChange={(selectedOption) => {
                          // Ensure we're getting the value correctly from the selected option
                          const newType =
                            selectedOption?.value || selectedOption;

                          // Merge existing config with default config for new type
                          const defaultConfig = getDefaultValidationConfig(newType);
                          const existingConfig = field.question.config || {};
                          updateField(sectionIndex, questionIndex, {
                            type: newType,
                            questionOptionMaps: [], // Clear options when type changes
                            config: { ...defaultConfig, ...existingConfig }, // Defaults first, then existing
                          });
                        }}
                        options={fieldTypes.map((type) => ({
                          value: type.value,
                          label: type.label,
                        }))}
                        placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.SELECT_FIELD_TYPE}
                        width={340}
                        className={styles.formSelect}
                        menuwidth={80}
                        menuHeight={200}
                        // Add key prop to force re-render when value changes
                        key={`${sectionIndex}-${questionIndex}-${field.question.type}`}
                      />
                    </div>
                    
                    {/* For multiQuestion, skip placeholder and show sub-fields config directly */}
                    {field.question.type !== "multiQuestion" && (
                      <>
                        {/* Placeholder field for applicable types */}
                        {![
                          "password",
                          "radio",
                          "checkbox",
                          "date",
                          "file",
                          "boolean",
                        ].includes(field.question.type) && (
                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.PLACEHOLDER}</label>
                        <input
                          type="text"
                          value={field.question.config.placeholder || ""}
                          onChange={(e) =>
                            updateField(sectionIndex, questionIndex, {
                              config: {
                                ...field.question.config,
                                placeholder: e.target.value,
                              },
                            })
                          }
                          className={styles.formInput}
                          placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.ENTER_PLACEHOLDER}
                        />
                      </div>
                        )}

                        {/* Options Manager for radio, checkbox, select */}
                    {(field.question.type === "radio" ||
                      field.question.type === "checkbox" ||
                      field.question.type === "select") && (
                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.formLabel}>
                          {FORM_BUILDER_TEXT.LABELS.OPTIONS_MANAGER}
                        </label>
                        <textarea
                          value={field.question.questionOptionMaps
                            .map((optionMap) => optionMap.option.name)
                            .join(",")}
                          onChange={(e) => {
                            const inputValue = e.target.value;

                            // Simple split - let user type freely
                            const optionNames = inputValue.split(",");

                            const options = optionNames.map((name, index) => ({
                              id: index,
                              name: name, // Don't trim here - let user control spacing
                              type: "string",
                              status: "published",
                            }));

                            const questionOptionMaps = options.map(
                              (option, index) => ({
                                id: index,
                                option,
                              }),
                            );

                            updateField(sectionIndex, questionIndex, {
                              questionOptionMaps,
                            });
                          }}
                          className={styles.formTextarea}
                          placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.ENTER_OPTIONS}
                        />
                        <div className={styles.validationHint}>
                          {FORM_BUILDER_TEXT.MESSAGES.VALIDATION_HINT}
                        </div>
                      </div>
                    )}

                        {/* Depends On functionality */}
                        {(() => {
                          const currentBK = field.question.bindingKey || "";
                          const circularKeys = currentBK
                            ? getCircularDependencyKeys(currentBK, sections.sections)
                            : new Set<string>();
                          const availableQuestions = getAllQuestionsForDependsOn(
                            sections.sections,
                            currentBK,
                          ).filter(
                            (q) => visibleBindingKeys.has(q.bindingKey) && !circularKeys.has(q.bindingKey),
                          );

                          if (availableQuestions.length === 0) return null;

                          // Get dependsOn data and convert to array
                          const dependsOnData = field.question.config.dependsOn;
                          const allConditions = dependsOnData
                            ? (Array.isArray(dependsOnData) ? dependsOnData : [dependsOnData])
                            : [];
                          // Only show conditions that reference visible questions
                          const conditions = allConditions.filter(
                            (c: any) => !c?.questionBindingKey || visibleBindingKeys.has(c.questionBindingKey)
                          );

                          return (
                        <>
                          {/* Render all depends on conditions */}
                          {conditions.map((condition, conditionIndex) => {
                            const dependentQuestionType = condition.questionBindingKey
                              ? getQuestionTypeById(sections.sections, condition.questionBindingKey)
                              : null;
                            const isOptionsBasedType = dependentQuestionType && ['radio', 'select', 'checkbox'].includes(dependentQuestionType);
                            const isDateFieldType = dependentQuestionType === 'date';
                            const isNumberType = dependentQuestionType === 'number';
                            
                            return (
                              <div 
                                key={`condition-${conditionIndex}`}
                                className={styles.conditionBox}
                              >
                                {/* Condition Header with Remove Button */}
                                <div className={styles.conditionHeaderRow}>
                                  <h4 className={styles.conditionHeading}>
                                    {FORM_BUILDER_TEXT.MESSAGES.CONDITION_LABEL} {conditionIndex + 1}
                                  </h4>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedConditions = conditions.filter((_, idx) => idx !== conditionIndex);
                                        updateField(sectionIndex, questionIndex, {
                                          config: {
                                            ...field.question.config,
                                            dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                          },
                                        });
                                      }}
                                      className={styles.btnRemoveCondition}
                                    >
                                      {FORM_BUILDER_TEXT.BUTTONS.REMOVE}
                                    </button>
                                </div>

                                {/* Fields Container - 2 Column Grid Layout */}
                                <div className={styles.twoColumnGrid}>
                                {/* Depends On Question Selector */}
                                <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                  <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.DEPENDS_ON}</label>
                                  <Select
                                    isClearable
                                    value={
                                      condition.questionBindingKey
                                        ? (() => {
                                            // Find question by bindingKey to get current ID
                                            const matchedQuestion = availableQuestions.find(
                                              q => q.bindingKey === condition.questionBindingKey
                                            );
                                            return matchedQuestion
                                              ? {
                                                  value: matchedQuestion.id,
                                                  label: `${matchedQuestion.label} (${matchedQuestion.type}) - ${matchedQuestion.sectionName}`,
                                                }
                                              : null;
                                          })()
                                        : null
                                    }
                                    onChange={(selectedOption) => {
                                      const selectedQuestion = availableQuestions.find(q => q.id === selectedOption?.value);
                                      const isDateType = selectedQuestion?.type === 'date';
                                      const isNumberType = selectedQuestion?.type === 'number';
                                      
                                      const updatedConditions = [...conditions];
                                      updatedConditions[conditionIndex] = selectedOption
                                        ? {
                                            questionId: selectedOption.value,
                                            value: [],
                                            type: "show",
                                            questionBindingKey: selectedQuestion?.bindingKey || "",
                                            ...(isDateType && {
                                              transformedMinValue: "",
                                              transformedMaxValue: "",
                                              dateConditionType: "custom",
                                            }),
                                            ...(isNumberType && {
                                              operator: "equals",
                                            }),
                                          }
                                        : {
                                            questionId: null,
                                            value: [],
                                            type: "show",
                                            questionBindingKey: "",
                                          };

                                      updateField(sectionIndex, questionIndex, {
                                        config: {
                                          ...field.question.config,
                                          dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                        },
                                      });
                                    }}
                                    options={availableQuestions.map((q) => ({
                                      value: q.id,
                                      label: `${q.label} (${q.type}) - ${q.sectionName}`,
                                    }))}
                                    classNamePrefix="dependsOnSelect"
                                    placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.SELECT_QUESTION}
                                  />
                                </div>

                                {/* Show additional fields only when a question is selected */}
                                {condition.questionBindingKey && (
                                  <>
                              {isOptionsBasedType && (
                                <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                  <label className={styles.formLabel}>
                                    {FORM_BUILDER_TEXT.LABELS.DEPENDS_ON_VALUE}
                                  </label>
                                  <Select
                                    isMulti
                                    isClearable
                                    value={(Array.isArray(condition?.value) ? condition?.value : (condition?.value ? [condition?.value] : [])).map(
                                      (val) => ({
                                        value: val,
                                        label: val,
                                      }),
                                    )}
                                    onChange={(selectedOptions) => {
                                      const values = selectedOptions
                                        ? selectedOptions.map(
                                            (option) => option.value,
                                          )
                                        : [];

                                      const updatedConditions = [...conditions];
                                      updatedConditions[conditionIndex] = {
                                        ...updatedConditions[conditionIndex],
                                        value: values,
                                      };

                                      updateField(sectionIndex, questionIndex, {
                                        config: {
                                          ...field.question.config,
                                          dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                        },
                                      });
                                    }}
                                    options={getRadioOptionsForQuestion(
                                      sections.sections,
                                      condition.questionBindingKey,
                                    )}
                                    classNamePrefix="dependsOnSelect"
                                    placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.SELECT_VALUES}
                                  />
                                </div>
                              )}

                              {isNumberType && (
                                <>
                                  <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                    <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.OPERATOR}</label>
                                    <Select
                                      isClearable={false}
                                      value={
                                        condition.operator
                                          ? OPERATOR_OPTIONS.find((opt) => opt.value === condition.operator) || OPERATOR_OPTIONS[0]
                                          : OPERATOR_OPTIONS[0]
                                      }
                                      onChange={(selectedOption) => {
                                        const updatedConditions = [...conditions];
                                        updatedConditions[conditionIndex] = {
                                          ...updatedConditions[conditionIndex],
                                          operator: selectedOption ? selectedOption.value : "equals",
                                          value: [],
                                        };

                                        updateField(sectionIndex, questionIndex, {
                                          config: {
                                            ...field.question.config,
                                            dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                          },
                                        });
                                      }}
                                      options={OPERATOR_OPTIONS}
                                      classNamePrefix="dependsOnSelect"
                                      placeholder="Select operator"
                                    />
                                  </div>

                                  {condition.operator === "range" ? (
                                    <>
                                      <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                        <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MIN_VALUE}</label>
                                        <input
                                          type="number"
                                          value={(Array.isArray(condition?.value) ? condition?.value[0] : condition?.value) ?? ""}
                                          onChange={(e) => {
                                            const updatedConditions = [...conditions];
                                            updatedConditions[conditionIndex] = {
                                              ...updatedConditions[conditionIndex],
                                              value: [e.target.value, condition?.value?.[1] ?? ""],
                                            };

                                            updateField(sectionIndex, questionIndex, {
                                              config: {
                                                ...field.question.config,
                                                dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                              },
                                            });
                                          }}
                                          className={styles.formInput}
                                          placeholder="Enter minimum value"
                                        />
                                      </div>

                                      <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                        <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MAX_VALUE}</label>
                                        <input
                                          type="number"
                                          value={condition.value?.[1] ?? ""}
                                          onChange={(e) => {
                                            const updatedConditions = [...conditions];
                                            updatedConditions[conditionIndex] = {
                                              ...updatedConditions[conditionIndex],
                                              value: [condition?.value?.[0] ?? "", e.target.value],
                                            };

                                            updateField(sectionIndex, questionIndex, {
                                              config: {
                                                ...field.question.config,
                                                dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                              },
                                            });
                                          }}
                                          className={styles.formInput}
                                          placeholder="Enter maximum value"
                                        />
                                      </div>
                                    </>
                                  ) : (
                                    <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                      <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.VALUE}</label>
                                      <input
                                        type="number"
                                        value={(Array.isArray(condition?.value) ? condition?.value[0] : condition?.value) ?? ""}
                                        onChange={(e) => {
                                          const updatedConditions = [...conditions];
                                          updatedConditions[conditionIndex] = {
                                            ...updatedConditions[conditionIndex],
                                            value: [e.target.value],
                                          };

                                          updateField(sectionIndex, questionIndex, {
                                            config: {
                                              ...field.question.config,
                                              dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                            },
                                          });
                                        }}
                                        className={styles.formInput}
                                        placeholder="Enter value"
                                      />
                                    </div>
                                  )}
                                </>
                              )}

                              {isDateFieldType && (
                                <>
                                  <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                    <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.DATE_CONDITION_TYPE}</label>
                                    <CustomDropDown
                                      value={condition.dateConditionType || "custom"}
                                      onChange={(selectedOption) => {
                                        const conditionType =
                                          typeof selectedOption === "object"
                                            ? selectedOption.value
                                            : selectedOption;
                                        
                                        const updatedConditions = [...conditions];
                                        updatedConditions[conditionIndex] = {
                                          ...updatedConditions[conditionIndex],
                                          dateConditionType: conditionType,
                                          transformedMinValue: "",
                                          transformedMaxValue: "",
                                        };

                                        updateField(sectionIndex, questionIndex, {
                                          config: {
                                            ...field.question.config,
                                            dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                          },
                                        });
                                      }}
                                      options={DATE_AGE_CONDITION_TYPE_OPTIONS}
                                      placeholder="Select condition type"
                                      width={340}
                                      className={styles.formSelect}
                                    />
                                    <div className={styles.validationHint}>
                                      {FORM_BUILDER_TEXT.MESSAGES.CHOOSE_AGE_CONDITION}
                                    </div>
                                  </div>

                                  {(!condition.dateConditionType || condition.dateConditionType === "custom") && (
                                    <>
                                      <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                        <label className={styles.formLabel}>
                                          {FORM_BUILDER_TEXT.LABELS.MIN_VALUE_VARIABLE}
                                        </label>
                                        <input
                                          type="text"
                                          value={condition.transformedMinValue || ""}
                                          onChange={(e) => {
                                            const updatedConditions = [...conditions];
                                            updatedConditions[conditionIndex] = {
                                              ...updatedConditions[conditionIndex],
                                              transformedMinValue: e.target.value,
                                            };

                                            updateField(sectionIndex, questionIndex, {
                                              config: {
                                                ...field.question.config,
                                                dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                              },
                                            });
                                          }}
                                          className={styles.formInput}
                                          placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.MIN_AGE_VARIABLE_EXAMPLE}
                                        />
                                        <div className={styles.validationHint}>
                                          {FORM_BUILDER_TEXT.MESSAGES.ENTER_MIN_AGE_VARIABLE}
                                        </div>
                                      </div>

                                      <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                        <label className={styles.formLabel}>
                                          {FORM_BUILDER_TEXT.LABELS.MAX_VALUE_VARIABLE}
                                        </label>
                                        <input
                                          type="text"
                                          value={condition.transformedMaxValue || ""}
                                          onChange={(e) => {
                                            const updatedConditions = [...conditions];
                                            updatedConditions[conditionIndex] = {
                                              ...updatedConditions[conditionIndex],
                                              transformedMaxValue: e.target.value,
                                            };

                                            updateField(sectionIndex, questionIndex, {
                                              config: {
                                                ...field.question.config,
                                                dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                              },
                                            });
                                          }}
                                          className={styles.formInput}
                                          placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.MAX_AGE_VARIABLE_EXAMPLE}
                                        />
                                        <div className={styles.validationHint}>
                                          {FORM_BUILDER_TEXT.MESSAGES.ENTER_MAX_AGE_VARIABLE}
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  {condition.dateConditionType === "range" && (
                                    <>
                                      <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                        <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MIN_DATE_REFERENCE}</label>
                                        <CustomDropDown
                                          value={condition.transformedMinValue || ""}
                                          onChange={(selectedOption) => {
                                            const dateField = typeof selectedOption === "object" ? selectedOption.value : selectedOption;
                                            
                                            const updatedConditions = [...conditions];
                                            updatedConditions[conditionIndex] = {
                                              ...updatedConditions[conditionIndex],
                                              transformedMinValue: dateField,
                                            };

                                            updateField(sectionIndex, questionIndex, {
                                              config: {
                                                ...field.question.config,
                                                dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                              },
                                            });
                                          }}
                                          options={DATE_REFERENCE_OPTIONS}
                                          placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.SELECT_MIN_DATE_REFERENCE}
                                          width={340}
                                          className={styles.formSelect}
                                          menuwidth={80}
                                          menuHeight={200}
                                          key={`dep-min-${sectionIndex}-${questionIndex}-${conditionIndex}-${condition.transformedMinValue}`}
                                        />
                                        <div className={styles.validationHint}>
                                          {FORM_BUILDER_TEXT.MESSAGES.SELECT_MIN_AGE_REFERENCE}
                                        </div>
                                      </div>

                                      <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                        <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.MAX_DATE_REFERENCE}</label>
                                        <CustomDropDown
                                          value={condition.transformedMaxValue || ""}
                                          onChange={(selectedOption) => {
                                            const dateField = typeof selectedOption === "object" ? selectedOption.value : selectedOption;
                                            
                                            const updatedConditions = [...conditions];
                                            updatedConditions[conditionIndex] = {
                                              ...updatedConditions[conditionIndex],
                                              transformedMaxValue: dateField,
                                            };

                                            updateField(sectionIndex, questionIndex, {
                                              config: {
                                                ...field.question.config,
                                                dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                              },
                                            });
                                          }}
                                          options={DATE_REFERENCE_OPTIONS}
                                          placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.SELECT_MAX_DATE_REFERENCE}
                                          width={340}
                                          className={styles.formSelect}
                                          menuwidth={80}
                                          menuHeight={200}
                                          key={`dep-max-${sectionIndex}-${questionIndex}-${conditionIndex}-${condition.transformedMaxValue}`}
                                        />
                                        <div className={styles.validationHint}>
                                          {FORM_BUILDER_TEXT.MESSAGES.SELECT_MAX_AGE_REFERENCE}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </>
                              )}

                              {!isOptionsBasedType && !isDateFieldType && !isNumberType && (
                                <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                  <label className={styles.formLabel}>
                                    {FORM_BUILDER_TEXT.LABELS.DEPENDS_ON_VALUE}
                                  </label>
                                  <input
                                    type="text"
                                    value={(Array.isArray(condition?.value) ? condition?.value[0] : condition?.value) ?? ""}
                                    onChange={(e) => {
                                      const updatedConditions = [...conditions];
                                      updatedConditions[conditionIndex] = {
                                        ...updatedConditions[conditionIndex],
                                        value: e.target.value ? [e.target.value] : [],
                                      };

                                      updateField(sectionIndex, questionIndex, {
                                        config: {
                                          ...field.question.config,
                                          dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                        },
                                      });
                                    }}
                                    className={styles.formInput}
                                    placeholder="Enter the value to match"
                                  />
                                  <div className={styles.validationHint}>
                                    {FORM_BUILDER_TEXT.MESSAGES.FIELD_SHOWS_WHEN_VALUE_MATCHES}
                                  </div>
                                </div>
                              )}

                              <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                <label className={styles.formLabel}>
                                  {FORM_BUILDER_TEXT.LABELS.DEPENDS_ON_TYPE}
                                </label>
                                <Select
                                  isClearable
                                  value={
                                    condition.type
                                      ? DEPENDS_ON_TYPE_OPTIONS.find(
                                          (opt) =>
                                            opt.value === condition.type,
                                        ) || DEPENDS_ON_TYPE_OPTIONS[0]
                                      : DEPENDS_ON_TYPE_OPTIONS[0]
                                  }
                                  onChange={(selectedOption) => {
                                    const updatedConditions = [...conditions];
                                    updatedConditions[conditionIndex] = {
                                      ...updatedConditions[conditionIndex],
                                      type: selectedOption ? selectedOption.value : "show",
                                      ...(selectedOption?.value === "prefill" && {
                                        prefillQuestionId: null,
                                      }),
                                    };

                                    updateField(sectionIndex, questionIndex, {
                                      config: {
                                        ...field.question.config,
                                        dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                      },
                                    });
                                  }}
                                  options={DEPENDS_ON_TYPE_OPTIONS}
                                  classNamePrefix="dependsOnSelect"
                                  placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.SELECT_BEHAVIOR}
                                />
                                <div className={styles.validationHint}>
                                  {condition.type === "show" && FORM_BUILDER_TEXT.MESSAGES.FIELD_VISIBLE_WHEN_MATCHES}
                                  {condition.type === "hide" && FORM_BUILDER_TEXT.MESSAGES.FIELD_HIDDEN_WHEN_MATCHES}
                                  {condition.type === "enable" && FORM_BUILDER_TEXT.MESSAGES.FIELD_ENABLED_WHEN_MATCHES}
                                  {condition.type === "disable" && FORM_BUILDER_TEXT.MESSAGES.FIELD_DISABLED_WHEN_MATCHES}
                                  {condition.type === "prefill" && FORM_BUILDER_TEXT.MESSAGES.FIELD_PREFILL_AUTO}
                                </div>
                              </div>

                              {/* Prefill From dropdown - shown when type is prefill */}
                              {condition.type === "prefill" && (
                                <div className={`${styles.formGroup} ${styles.formGroupNoMargin}`}>
                                  <label className={styles.formLabel}>
                                    {FORM_BUILDER_TEXT.LABELS.PREFILL_FROM}
                                  </label>
                                  <Select
                                    isClearable
                                    value={
                                      condition.prefillQuestionId
                                        ? getAllQuestionsFromAllSections(
                                            sections.sections,
                                            field.question.id,
                                            sectionIndex,
                                            questionIndex,
                                          )
                                            .map((q) => ({
                                              value: q.id,
                                              label: `${q.label} (${q.type}) - ${q.sectionName}`,
                                            }))
                                            .find(
                                              (opt) =>
                                                opt.value ===
                                                condition.prefillQuestionId,
                                            ) || null
                                        : null
                                    }
                                    onChange={(selectedOption) => {
                                      const selectedQuestion = getAllQuestionsFromAllSections(
                                        sections.sections,
                                        field.question.id,
                                        sectionIndex,
                                        questionIndex,
                                      ).find((q) => q.id === selectedOption?.value);

                                      const updatedConditions = [...conditions];
                                      updatedConditions[conditionIndex] = {
                                        ...updatedConditions[conditionIndex],
                                        prefillQuestionId: selectedOption?.value || null,
                                        prefillBindingKey: selectedQuestion?.bindingKey || "",
                                      };

                                      updateField(sectionIndex, questionIndex, {
                                        config: {
                                          ...field.question.config,
                                          dependsOn: updatedConditions.length === 1 ? updatedConditions[0] : updatedConditions,
                                        },
                                      });
                                    }}
                                    options={getAllQuestionsFromAllSections(
                                      sections.sections,
                                      field.question.id,
                                      sectionIndex,
                                      questionIndex,
                                    ).map((q) => ({
                                      value: q.id,
                                      label: `${q.label} (${q.type}) - ${q.sectionName}`,
                                    }))}
                                    classNamePrefix="dependsOnSelect"
                                    placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.SELECT_QUESTION_TO_PREFILL}
                                  />
                                  <div className={styles.validationHint}>
                                    {FORM_BUILDER_TEXT.MESSAGES.FIELD_PREFILL_AUTO}
                                  </div>
                                </div>
                              )}
                                  </>
                                )}
                                </div>
                              </div>
                            );
                          })}

                            {/* Add Another Depends On Button */}
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                              <button
                                type="button"
                                onClick={() => {
                                  // Convert single dependsOn to array if needed, then add new condition
                                  const currentDependsOn = field.question.config.dependsOn;
                                  const dependsOnArray = Array.isArray(currentDependsOn) 
                                    ? [...currentDependsOn] 
                                    : currentDependsOn ? [currentDependsOn] : [];
                                  
                                  // Add new empty condition
                                  dependsOnArray.push({
                                    questionId: null,
                                    value: [],
                                    type: "show",
                                    questionBindingKey: "",
                                  });

                                  updateField(sectionIndex, questionIndex, {
                                    config: {
                                      ...field.question.config,
                                      dependsOn: dependsOnArray,
                                    },
                                  });
                                }}
                                className={styles.btnAddCondition}
                              >
                                <span className={styles.btnAddConditionIcon}>+</span>
                                {conditions.length === 0 ? FORM_BUILDER_TEXT.BUTTONS.ADD_DEPENDS_ON : FORM_BUILDER_TEXT.BUTTONS.ADD_ANOTHER_DEPENDS_ON}
                              </button>
                            </div>
                            </>
                          );
                        })()}

                        {/* Field-specific validation controls */}
                        {renderValidationControls(
                          field,
                          sectionIndex,
                          questionIndex,
                        )}
                      </>
                    )}

                    {/* Multi-Question sub-fields configuration - shown only for multiQuestion type */}
                    {field.question.type === "multiQuestion" && (() => {
                      const config = field.question.config;
                      
                      return (
                      <>
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                          <div className={styles.multiQuestionFieldHeader}>
                            <label className={`form-label ${styles.multiQuestionFieldLabel}`}>
                              {FORM_BUILDER_TEXT.LABELS.CONFIGURE_SUB_FIELDS} ({(config.questions || []).length} {(config.questions || []).length !== 1 ? FORM_BUILDER_TEXT.FIELD_COUNT.PLURAL : FORM_BUILDER_TEXT.FIELD_COUNT.SINGULAR})
                            </label>
                            <Button
                              onClick={() => {
                                const newQuestion = {
                                  key: `field_${(config.questions?.length || 0) + 1}`,
                                  label: "",
                                  displayOrder: (config.questions?.length || 0) + 1,
                                  displayLabelType: "textarea",
                                  placeholder: "",
                                  minCharacter: 1,
                                  maxCharacters: 500,
                                };
                                updateField(sectionIndex, questionIndex, {
                                  config: {
                                    ...config,
                                    questions: [...(config.questions || []), newQuestion],
                                  },
                                });
                              }}
                              buttonClassName={styles.programsDashboardAddButton}
                              datatestid="add-sub-question"
                              datatestidText="add-sub-question-text"
                            >
                              {FORM_BUILDER_TEXT.BUTTONS.ADD_SUB_FIELD}
                            </Button>
                          </div>

                          {(config.questions || []).map((subQuestion: any, subIndex: number) => {
                            const subFieldType = subQuestion.displayLabelType || "textarea";
                            
                            return (
                              <div key={subIndex} className={styles.multiQuestionSubFieldBox}>
                                <div className={styles.multiQuestionSubFieldHeader}>
                                  <h4 className={styles.multiQuestionSubFieldTitle}>
                                    {FORM_BUILDER_TEXT.MESSAGES.SUB_FIELD_LABEL} {subIndex + 1}
                                  </h4>
                                  <button
                                    onClick={() => {
                                      const updatedQuestions = config.questions.filter((_: any, i: number) => i !== subIndex);
                                      updateField(sectionIndex, questionIndex, {
                                        config: {
                                          ...config,
                                          questions: updatedQuestions.map((q: any, i: number) => ({
                                            ...q,
                                            displayOrder: i + 1,
                                          })),
                                        },
                                      });
                                    }}
                                    className={styles.deleteBtn}
                                    className={styles.smallButtonPadding}
                                  >
                                    <img src={deleteIcon} alt="Delete" className={styles.deleteIconSize} />
                                  </button>
                                </div>

                                <div className={styles.twoColumnGrid}>
                                  <div>
                                    <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.KEY_UNIQUE_IDENTIFIER}</label>
                                    <input
                                      type="text"
                                      value={subQuestion.key}
                                      onChange={(e) => {
                                        const updatedQuestions = [...config.questions];
                                        updatedQuestions[subIndex] = {
                                          ...updatedQuestions[subIndex],
                                          key: e.target.value,
                                        };
                                        updateField(sectionIndex, questionIndex, {
                                          config: { ...config, questions: updatedQuestions },
                                        });
                                      }}
                                      className={styles.formInput}
                                      placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.KEY_EXAMPLE}
                                    />
                                  </div>

                                  <div>
                                    <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.LABEL_SHOWN_TO_SEEKER}</label>
                                    <input
                                      type="text"
                                      value={subQuestion.label || ""}
                                      onChange={(e) => {
                                        const updatedQuestions = [...config.questions];
                                        updatedQuestions[subIndex] = {
                                          ...updatedQuestions[subIndex],
                                          label: e.target.value,
                                        };
                                        updateField(sectionIndex, questionIndex, {
                                          config: { ...config, questions: updatedQuestions },
                                        });
                                      }}
                                      className={styles.formInput}
                                      placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.LABEL_EXAMPLE}
                                    />
                                  </div>

                                  <div>
                                    <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.FIELD_TYPE}</label>
                                    <CustomDropDown
                                      value={subFieldType}
                                      onChange={(val) => {
                                        const updatedQuestions = [...config.questions];
                                        const newType = typeof val === "object" ? val.value : val;
                                        
                                        // Get default config for the new type and merge with existing data
                                        const defaultConfig = getDefaultValidationConfig(newType);
                                        // Preserve existing config from subQuestion
                                        const existingConfig = { ...subQuestion };
                                        delete existingConfig.key;
                                        delete existingConfig.label;
                                        delete existingConfig.displayOrder;
                                        delete existingConfig.displayLabelType;
                                        updatedQuestions[subIndex] = {
                                          key: subQuestion.key,
                                          label: subQuestion.label || "",
                                          displayOrder: subQuestion.displayOrder,
                                          displayLabelType: newType,
                                          ...defaultConfig,
                                          ...existingConfig,
                                        };
                                        
                                        updateField(sectionIndex, questionIndex, {
                                          config: { ...config, questions: updatedQuestions },
                                        });
                                      }}
                                      options={fieldTypes
                                        .filter(type => type.value !== 'multiQuestion' && type.label)
                                        .map(type => ({
                                          value: type.value,
                                          label: type.label!
                                        }))}
                                      placeholder="Select field type"
                                      width={340}
                                      className={styles.formSelect}
                                      menuwidth={80}
                                      menuHeight={200}
                                      key={`${sectionIndex}-${questionIndex}-${subIndex}-${subFieldType}`}
                                    />
                                  </div>

                                  <div>
                                    <label className={styles.formLabel}>{FORM_BUILDER_TEXT.LABELS.DISPLAY_ORDER}</label>
                                    <input
                                      type="number"
                                      value={subQuestion.displayOrder}
                                      onChange={(e) => {
                                        const updatedQuestions = [...config.questions];
                                        updatedQuestions[subIndex] = {
                                          ...updatedQuestions[subIndex],
                                          displayOrder: parseInt(e.target.value) || 1,
                                        };
                                        updateField(sectionIndex, questionIndex, {
                                          config: { ...config, questions: updatedQuestions },
                                        });
                                      }}
                                      className={styles.formInput}
                                      min="1"
                                    />
                                  </div>

                                  {/* Render validation fields based on sub-field type - same as normal fields */}
                                  {renderSubFieldValidations(subQuestion, subIndex, subFieldType, config, sectionIndex, questionIndex, updateField)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                      );
                    })()}
                  </div>
                  <hr className={styles.sectionDivider} />
                  <div className={styles.sectionFooter}>
                    <div className={styles.sectionFooterLeft}>
                      <span className={styles.requiredText}>{FORM_BUILDER_TEXT.LABELS.MARK_AS_REQUIRED}</span>
                      <label className={styles.toggleContainer}>
                        <input
                          type="checkbox"
                          checked={field.question.config.isRequired}
                          onChange={(e) =>
                            updateField(sectionIndex, questionIndex, {
                              config: {
                                ...field.question.config,
                                isRequired: e.target.checked,
                              },
                            })
                          }
                          className={styles.toggleInput}
                        />
                        <div className={styles.toggleSwitch}></div>
                      </label>
                    </div>
                    <div className={styles.sectionFooterDivider}></div>
                    
                    {/* Subsection Dropdown */}
                    {section.items.some((item) => item.type === SectionItemType.Subsection) && (
                      <div className={styles.marginRight12}>
                        <select
                          onChange={(e) => {
                            const subSectionId = parseInt(e.target.value);
                            if (subSectionId) {
                              moveQuestionToSubSection(sectionIndex, questionIndex, subSectionId);
                            }
                          }}
                          value=""
                          className={styles.moveToSubsectionDropdown}
                        >
                          <option value="">{FORM_BUILDER_TEXT.PLACEHOLDERS.MOVE_TO_SUBSECTION}</option>
                          {section.items
                            .filter((item) => item.type === SectionItemType.Subsection)
                            .map((subSection) => (
                              <option key={subSection.subSectionId} value={subSection.subSectionId}>
                                {subSection.subSectionName}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                    
                    <button
                      onClick={() => deleteField(sectionIndex, questionIndex)}
                      className={styles.deleteBtn}
                    >
                      <img
                        src={deleteIcon}
                        alt="Delete"
                        className={styles.deleteIcon}
                      />
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
            )}
          </div>
          );
        })}

        {/* <div className={styles.addSectionContainer}>
          <button onClick={addSection} className={styles.addSectionBtn}>
            <span className={styles.addSectionPlus}>+</span>
            <span className={styles.addSectionText}>{FORM_BUILDER_TEXT.BUTTONS.ADD_SECTION}</span>
          </button>
        </div> */}
      </div>
      <div className={styles.divWithButtons}>
        <div className={styles.formRowButton}>
          <Button
            onClick={() => navigate("/admin/action-cards")}
            buttonClassName={styles.buttonContainerSecondary}
            buttonTextClassName={styles.buttonTextSecondary}
          >
            cancel
          </Button>

          <Button
            onClick={handleContinue}
            buttonClassName={styles.buttonContainerPrimary}
            buttonTextClassName={styles.buttonTextPrimary}
          >
            continue
          </Button>
        </div>
      </div>

      {/* Sub-section Creation Modal */}
      {isSubSectionModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>{FORM_BUILDER_TEXT.MODAL.CREATE_SUB_SECTION}</h3>
            <div className={styles.modalFormGroup}>
              <label className={styles.modalLabel}>
                {FORM_BUILDER_TEXT.LABELS.SUB_SECTION_NAME}
              </label>
              <input
                type="text"
                value={newSubSectionName}
                onChange={(e) => setNewSubSectionName(e.target.value)}
                placeholder={FORM_BUILDER_TEXT.PLACEHOLDERS.ENTER_SUB_SECTION_NAME}
                className={styles.modalInput}
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && targetSectionIndex !== null) {
                    createSubSection(targetSectionIndex);
                  }
                }}
              />
            </div>
            <div className={styles.modalActions}>
              <button
                onClick={() => {
                  setIsSubSectionModalOpen(false);
                  setNewSubSectionName("");
                  setTargetSectionIndex(null);
                }}
                className={styles.modalCancelButton}
              >
                {FORM_BUILDER_TEXT.BUTTONS.CANCEL}
              </button>
              <button
                onClick={() => targetSectionIndex !== null && createSubSection(targetSectionIndex)}
                disabled={!newSubSectionName.trim()}
                className={`${styles.modalSubmitButton} ${newSubSectionName.trim() ? styles.modalSubmitButtonEnabled : styles.modalSubmitButtonDisabled}`}
              >
                {FORM_BUILDER_TEXT.BUTTONS.CREATE}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormBuilderEdit;
