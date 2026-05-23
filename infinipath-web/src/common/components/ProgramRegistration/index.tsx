import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import QuestionList from "./QuestionList";
import FormPreview from "./FormPreview";
import StylesPopup from "./StylesPopUp";
import { Question, Section, GlobalStyles, QuestionCustomStyles } from "./types";
import SectionPopup from "./SectionPopUpView";
import MergePopUpContent from "./MergePopUpContent";
import { FormProvider, useForm } from "react-hook-form";
import { DummyJSON } from "../../../constants/urlConstants";
import { QuestionForm } from "../../../types/question";
import FormStepper from "./FormStepper";
import FloatingButton from "./FloatingButton";
import {
  programConfigurations,
  getFormSectionsForProgram,
  filterQuestionsByProgramConfig,
} from "../../../constants/programConfigurations";
import { useNavigate, useLocation } from "react-router-dom";
import { deleteCall, getCall } from "../../../services/apiService";
import { endPoints , PORTAL} from "../../../constants/urlConstants";
import Loader from "../Loader";

// Add interface for API response
interface ApiQuestion {
  id: number;
  label: string;
  config: any;
  status: string;
  type: string;
  formSection: {
    id: number;
    name: string;
  };
  questionOptionMaps: Array<{
    id: number;
    option: {
      id: number;
      name: string;
      type: string;
    };
  }>;
}

// Add this interface
interface FormOutput {
  formTitle: string;
  sections: {
    id: string;
    title: string;
    fields: Array<{
      id: string | number;
      label: string;
      type: string;
      required?: boolean;
      options?: Array<{ value: string; label: string }>;
      validation?: any;
      placeholder?: string;
    }>;
  }[];
}

// Add this interface for program data
interface ProgramData {
  id: number;
  program: string;
  name: string;
  programQuestionMaps: Array<{
    id: number;
    question: {
      id: number;
      label: string;
      config: {
        required: boolean;
      };
      status: string;
      type: string;
      formSection: {
        id: number;
        name: string;
      };
      questionOptionMaps: Array<{
        option: {
          id: number;
          name: string;
          type: string;
        };
      }>;
    };
  }>;
}

const FormBuilderr: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    programName,
    programConfig,
    newSectionQuestion,
    selectedProgramType,
    formSections,
    formData: editFormData,
    isEditing,
    availableSections: initialSections,
  } = location.state || {};

  const [loader, setLoader] = useState<boolean>(false);
  // Add state for form data
  const [formData, setFormData] = useState(editFormData || {});


  // Initialize steps based on available sections from navigation state
  const [steps, setSteps] = useState<FormStep[]>(() => {
    // If formSections is provided, use that
    if (formSections) {
      return formSections;
    }
  
    // Otherwise, create steps from initialSections or default to basicDetails
    const sections = initialSections || ["basicDetails"];
    
    return sections.map((sectionId) => ({
      id: sectionId,
      title: SECTION_TITLES[sectionId] || sectionId // Fallback to sectionId if no mapping exists
    }));
  });



  // Initialize section questions state with available sections
  const [sectionQuestions, setSectionQuestions] = useState(newSectionQuestion);

  useEffect(() => {
    if (isEditing && editFormData) {
      // Populate form with existing data
      setSectionQuestions(editFormData.sections);
      // ... other initialization logic
    }
  }, [isEditing, editFormData]);

  const methods = useForm({
    defaultValues: {
      program: "", // Add default value for program
    },
  });

  const {
    control,
    formState: { errors },
  } = methods;

  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Add function to fetch available questions
  const fetchAvailableQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await getCall(
        `${endPoints.question}?limit=50&offset=0&searchText=`,
        undefined,
        PORTAL
      );

      if (response.data?.statusCode === 200) {
        const apiQuestions = response?.data?.data?.data;

        // Transform API questions to match your Question interface
        const transformedQuestions = apiQuestions.map((q: ApiQuestion) => ({
          id: q.id,
          text: q.label,
          type: q.type,
          required: q.config?.required || false,
          options: q.questionOptionMaps?.map((qom) => qom.option.name) || [],
          validation: q.config,
          formSection: q.formSection,
          status: q.status,
        }));

        // Filter out questions that are already in sectionQuestions
        const filteredQuestions = transformedQuestions.filter((question) => {
          return !Object.values(sectionQuestions).some((sectionQuests) =>
            sectionQuests.some((sq) => sq.id === question.id),
          );
        });

        setAvailableQuestions(filteredQuestions);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect to fetch questions when component mounts and when sectionQuestions changes
  useEffect(() => {
    fetchAvailableQuestions();
  }, [sectionQuestions]);

  // Remove the initial questions array since we're now fetching from API
  // Remove or comment out: const initialQuestions: Question[] = [ ... ];

  // Update the places where initialQuestions was used
  useEffect(() => {
    const resetAvailableQuestions = async () => {
      await fetchAvailableQuestions();
    };

    if (formData) {
      setAvailableQuestions((prevQuestions) =>
        prevQuestions.filter(
          (q) =>
            !Object.values(formData.sections).some((section) =>
              section.fields.some((field) => field.id === q.id),
            ),
        ),
      );
    } else {
      resetAvailableQuestions();
    }
  }, [formData]);

  // Modify convertDummyJSONToQuestions to accept section ID
  const convertDummyJSONToQuestions = (sectionId: string) => {
    const section = DummyJSON.formData[0].sections.find(
      (section) => section.id === sectionId,
    );

    if (!section || !programConfig) return [];

    const questions = section.fields.map((field, index) => ({
      id: index + 1000,
      identifier: field.identifier || "", // Add an identifier field
      text: field.label,
      type: field.type,
      required: field.required,
      options: field.options?.map((opt) => opt.label) || [],
      validation: field.validation,
      placeholder: field.placeholder,
    }));

    // Filter questions based on program configuration
    return questions.filter((question) => {
      if (sectionId === "travelDetails" && !programConfig.isTravelRequired) {
        return false;
      }
      if (
        question.identifier.includes("residence") &&
        !programConfig.hasResidence
      ) {
        return false;
      }
      // Add more filters based on program configuration
      return true;
    });
  };

  // Modify useEffect to set initial questions for each section
  useEffect(() => {
    const basicDetailsQuestions = convertDummyJSONToQuestions("basicDetails");
    const travelDetailsQuestions = convertDummyJSONToQuestions("travelDetails");
    const invoiceDetailsQuestions =
      convertDummyJSONToQuestions("invoiceDetails");

    setSectionQuestions({
      basicDetails: basicDetailsQuestions,
      travelDetails: travelDetailsQuestions,
      invoiceDetails: invoiceDetailsQuestions,
    });
  }, []);

  const [formQuestions, setFormQuestions] = useState<QuestionForm[]>(() => {
    const builtInQuestions = convertDummyJSONToQuestions("basicDetails");
    return builtInQuestions;
  });
  const [sections, setSections] = useState<Section[]>([]);
  const [currentDraggedItem, setCurrentDraggedItem] = useState<{
    question: Question;
    fromForm: boolean;
    sectionId?: string;
  } | null>(null);
  const [showGlobalStylesPopup, setShowGlobalStylesPopup] =
    useState<boolean>(false);
  const [showQuestionStylesPopup, setShowQuestionStylesPopup] =
    useState<boolean>(false);
  const [styleQuestionId, setStyleQuestionId] = useState<number | null>(null);
  const [globalStyles, setGlobalStyles] = useState<GlobalStyles>({});
  const [questionCustomStyles, setQuestionCustomStyles] =
    useState<QuestionCustomStyles>({});
  const [sectionMode, setSectionMode] = useState<boolean>(false);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [newSectionTitle, setNewSectionTitle] = useState<string>("");
  const [isSectionPopupOpen, setIsSectionPopupOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [isMergePopupOpen, setIsMergePopupOpen] = useState(false);
  const [mergeTitle, setMergeTitle] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");

  // Add new state for stepper
  const [activeStep, setActiveStep] = useState(0);
  const [isStepValid, setIsStepValid] = useState(false);

  // Add handler for next step
  const handleNextStep = () => {
    const availableSections = steps.map((step) => step.id);

    if (activeStep === steps.length - 1) {
      const formOutput = generateFormOutput();
      handleFormSubmit(formOutput);
    } else {
      const nextIndex = activeStep + 1;
      // Skip travel details if not available
      if (
        availableSections[nextIndex] === "travelDetails" &&
        !programConfig.isTravelRequired
      ) {
        setActiveStep(nextIndex + 1);
      } else {
        setActiveStep(nextIndex);
      }
    }
  };

  // Add back button handler
  const handleBackStep = () => {
    const availableSections = steps.map((step) => step.id);
    const prevIndex = activeStep - 1;

    // Skip travel details if not available
    if (
      availableSections[prevIndex] === "travelDetails" &&
      !programConfig.isTravelRequired
    ) {
      setActiveStep(prevIndex - 1);
    } else {
      setActiveStep(prevIndex);
    }
  };

  // Add validation check for each step
  useEffect(() => {
    // Add your validation logic here
    const validateCurrentStep = () => {
      // Example validation - replace with your actual validation
      return true;
    };

    setIsStepValid(validateCurrentStep());
  }, [activeStep, formQuestions]);

  // Drag and drop handlers
  const handleDragStart = (
    e: React.DragEvent,
    question: Question,
    fromForm: boolean = false,
  ) => {
    setCurrentDraggedItem({ question, fromForm });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent,
    targetIndex: number | null = null,
  ) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event bubbling

    if (!currentDraggedItem) return;

    const { question, fromForm } = currentDraggedItem;
    const currentSection = steps[activeStep].title
      .toLowerCase()
      .replace(/\s+/g, "_");

    setSectionQuestions((prev) => {
      // Create a new array for the current section's questions
      const currentQuestions = [...(prev[currentSection] || [])];

      // Check if question already exists in the section
      const exists = currentQuestions.some((q) => q.id === question.id);

      if (exists && !fromForm) {
        // If already exists and trying to add from available questions, don't add
        return prev;
      }

      if (fromForm) {
        // Reordering within the section
        const oldIndex = currentQuestions.findIndex(
          (q) => q.id === question.id,
        );
        if (oldIndex > -1) {
          currentQuestions.splice(oldIndex, 1);
          const newIndex =
            targetIndex === null ? currentQuestions.length : targetIndex;
          currentQuestions.splice(newIndex, 0, question);
        }
      } else {
        // Adding from available questions
        if (targetIndex !== null) {
          currentQuestions.splice(targetIndex, 0, question);
        } else {
          currentQuestions.push(question);
        }

        // Remove from available questions
        setAvailableQuestions((prevAvailable) =>
          prevAvailable.filter((q) => q.id !== question.id),
        );
      }

      return {
        ...prev,
        [currentSection]: currentQuestions,
      };
    });

    // Clear dragged item
    setCurrentDraggedItem(null);
  };

  // Selection mode for section creation
  const toggleQuestionSelection = (questionId: number) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(selectedQuestions.filter((id) => id !== questionId));
    } else {
      setSelectedQuestions([...selectedQuestions, questionId]);
    }
  };

  const toggleSectionSelection = (sectionId: string) => {
    if (selectedSections.includes(sectionId)) {
      setSelectedSections(selectedSections.filter((id) => id !== sectionId));
    } else {
      setSelectedSections([...selectedSections, sectionId]);
    }
  };

  const handleMarkAsRequired = (questionId: number) => {
    setFormQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, required: !q.required } : q,
      ),
    );
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        questions: section.questions.map((q) =>
          q.id === questionId ? { ...q, required: !q.required } : q,
        ),
      })),
    );
  };

  const mergeSections = () => {
    // Recursive function to extract sub-sections and maintain hierarchy
    const extractSubSections = (sectionsToMerge: Section[]): Section[] => {
      return sectionsToMerge.map((section) => ({
        id: section.id,
        title: section.title,
        questions: section.questions,
        flexDirection: section.flexDirection,
        subSections: section.subSections
          ? extractSubSections(section.subSections)
          : [],
      }));
    };

    // Get the selected sections to merge
    const sectionsToMerge = sections.filter((section) =>
      selectedSections.includes(section.id),
    );
    // Add additional selected questions (not part of any section)
    const additionalQuestionsFromFormQues = formQuestions.filter((q) =>
      selectedQuestions.includes(q.id),
    );

    const additionalQuesFromAvailable = availableQuestions.filter((q) =>
      selectedQuestions.includes(q.id),
    );
    const additionalQuestions = [
      ...additionalQuestionsFromFormQues,
      ...additionalQuesFromAvailable,
    ];

    // Create a new merged section with recursive sub-sections and additional questions
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: mergeTitle,
      questions: [...additionalQuestions],
      flexDirection: "column",
      subSections: extractSubSections(sectionsToMerge),
    };

    // Update the state
    setSections(
      sections
        .filter((section) => !selectedSections.includes(section.id))
        .concat(newSection),
    );

    // Remove the additional questions from the formQuestions
    setFormQuestions((prev) =>
      prev.filter((q) => !selectedQuestions.includes(q.id)),
    );

    setAvailableQuestions((prev) =>
      prev.filter((q) => !selectedQuestions.includes(q.id)),
    );

    setSelectedSections([]);
    setSelectedQuestions([]);
    setIsMergePopupOpen(false);
    setSectionMode(false);
  };

  const createSection = () => {
    if (selectedQuestions.length < 2) {
      alert("Please select at least 2 questions to create a section");
      return;
    }

    const sectionQuestions = formQuestions.filter((q) =>
      selectedQuestions.includes(q.id),
    );
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: newSectionTitle || `Section ${sections.length + 1}`,
      questions: sectionQuestions,
      flexDirection: "column",
    };

    setSections([...sections, newSection]);
    setFormQuestions(
      formQuestions.filter((q) => !selectedQuestions.includes(q.id)),
    );
    setSelectedQuestions([]);
    setSectionMode(false);
    setNewSectionTitle("");
  };

  const changeSectionLayout = (sectionId: string, direction: string) => {
    const updateLayoutRecursively = (sections: Section[]): Section[] => {
      return sections.map((section) => {
        if (section.id === sectionId) {
          return { ...section, flexDirection: direction };
        }
        if (section.subSections && section.subSections.length > 0) {
          return {
            ...section,
            subSections: updateLayoutRecursively(section.subSections),
          };
        }
        return section;
      });
    };

    setSections(updateLayoutRecursively(sections));
  };

  // Styling functions
  const openGlobalStylesPopup = () => {
    setShowGlobalStylesPopup(true);
  };

  const openQuestionStylesPopup = (questionId: number) => {
    setStyleQuestionId(questionId);
    setShowQuestionStylesPopup(true);
  };

  const updateGlobalStyles = (
    category: string,
    property: string,
    value: string,
  ) => {
    setGlobalStyles((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof GlobalStyles],
        [property]: value,
      },
    }));
  };

  const closeSectionPopup = () => {
    setIsSectionPopupOpen(false);
    setEditingSection(null); // Reset editingSection
  };

  const updateQuestionCustomStyle = (
    questionId: number,
    type: string,
    property: string,
    value: string,
  ) => {
    setQuestionCustomStyles((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [type]: {
          ...(prev[questionId]?.[type] || {}),
          [property]: value,
        },
      },
    }));
  };

  // Get effective style for a question or option
  const getEffectiveStyle = (
    questionId: number,
    type: "question" | "options",
  ) => {
    const customStyle = questionCustomStyles[questionId]?.[type] || {};
    const baseStyle =
      globalStyles[type === "question" ? "questions" : "options"];

    return {
      ...baseStyle,
      ...customStyle,
    };
  };

  // const openCreateSectionPopup = () => {
  //   setEditingSection(null);
  //   setIsSectionPopupOpen(true);
  // };

  const handleSaveSection = (sectionData: {
    title: string;
    questions: Question[];
  }) => {
    const updateSectionRecursively = (sections: Section[]): Section[] => {
      return sections.map((section) => {
        if (editingSection && section.id === editingSection.id) {
          // Edit the existing section
          return {
            ...section,
            title: sectionData.title,
            questions: sectionData.questions,
          };
        }
        if (section.subSections && section.subSections.length > 0) {
          // Recursively update sub-sections
          return {
            ...section,
            subSections: updateSectionRecursively(section.subSections),
          };
        }
        return section;
      });
    };

    if (editingSection) {
      // Edit existing section
      setSections((prevSections) => updateSectionRecursively(prevSections));
    } else {
      // Create new section
      const newSection: Section = {
        id: `section-${Date.now()}`,
        title: sectionData.title,
        questions: sectionData.questions,
        flexDirection: "column",
        subSections: [], // Initialize with no sub-sections
      };
      setSections((prevSections) => [...prevSections, newSection]);
    }
  };

  const handleFormSubmit = async(formOutput: any) => {
    const finalFormData = {
      id: isEditing ? editFormData.id : `form-${Date.now()}`,
      name: isEditing ? editFormData.name : `Form ${Date.now()}`,
      sections: formOutput.sections,
      createdAt: isEditing ? editFormData.createdAt : new Date(),
      lastModified: new Date(),
    };
    await deletedQuestionIds.forEach((id) => {
      deleteCall(`${endPoints.programQuestion}/${id}`,undefined, PORTAL)
      .then((response) => {
      })
      .catch((error) => {
        console.error("Error deleting question:", error);
      }
      )
    })
    // Navigate back to program cards with form data
    navigate("/admin/program-cards", {
      state: {
        formData: finalFormData,
        programName,
        isEditing,
      },
    });
  };

  const loadFormForProgram = (programType: string) => {
    const sections = getFormSectionsForProgram(programType);
    const config = programConfigurations[programType];

    // Filter questions based on program configuration
    const filteredQuestions = questions.map((section) => ({
      ...section,
      questions: filterQuestionsByProgramConfig(
        section.questions,
        programType,
        section.id,
      ),
    }));

    setFormSections(sections);
    setFormQuestions(filteredQuestions);
  };

  // Add this function inside the FormBuilderr component
  const generateFormOutput = (): FormOutput => {
    const formSections = steps.map((step) => {
      const sectionQuestionsList = sectionQuestions[step.id] || [];

      return {
        id: step.id,
        title: step.title,
        fields: sectionQuestionsList.map((question) => ({
          id: question.id,
          label: question.text,
          type: question.type,
          required: question.required || false,
          options: question.options
            ? question.options.map((opt) => ({
                value: opt.toLowerCase().replace(/\s+/g, "_"),
                label: opt,
              }))
            : undefined,
          validation: question.validation,
          placeholder: question.placeholder,
        })),
      };
    });

    return {
      formTitle: programName || "Program Registration Form",
      sections: formSections,
    };
  };

  // In your parent component
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<number[]>([]);
  const [originalSectionQuestions, setOriginalSectionQuestions] = useState(newSectionQuestion)

  // Add these states inside FormBuilderr component
  const [programData, setProgramData] = useState<ProgramData | null>(null);
  // const [isLoading, setIsLoading] = useState(false);

  // When loading questions initially
  useEffect(() => {
    if (programData?.programQuestionMaps) {
      const organizedQuestions = organizeQuestionsBySection(
        programData.programQuestionMaps,
      );
      setSectionQuestions(organizedQuestions);
      setOriginalSectionQuestions(organizedQuestions);
    }
  }, [programData]);

  // Add this function to fetch program data
  const fetchProgramData = async () => {
    try {
      setIsLoading(true);
      const response = await getCall(
        `${endPoints.program}/${programConfig.id}`,
        undefined,
        PORTAL
      );
      if (response?.data.statusCode === 200) {
        setProgramData(response.data.data);
        const questionMaps = response.data.data.programQuestionMaps || [];

        // Group questions by form section
        const sectionMap = new Map();

        questionMaps.forEach((qMap) => {
          const question = qMap.question;
          const sectionName = question?.formSection?.name;

          if (!sectionMap.has(sectionName)) {
            sectionMap.set(sectionName, {
              id: question?.formSection.id,
              title: sectionName,
              fields: [],
            });
          }

          // Transform question options
          const options =
            question?.questionOptionMaps?.map((optMap) => ({
              value: optMap.option.name.toLowerCase().replace(/\s+/g, "_"),
              label: optMap.option.name,
            })) || [];

          // Add question to section
          sectionMap.get(sectionName).fields.push({
            programQuestionId: qMap.id,
            id: question.id,
            label: question.label,
            type: question.type,
            required: question.config?.required || false,
            options: options,
            validation: question.config,
            status: question.status,
          });
        });

        // Convert map to array and sort sections
        const formSection = Array.from(sectionMap.values()).sort((a, b) => {
          const order = {
            "Basic Details": 1,
            "Travel Details": 2,
            Invoice: 3,
          };
          return (order[a.title] || 99) - (order[b.title] || 99);
        });

        // Update form sections
        setSteps(formSection);

        // Update section questions
        const newSectionQuestions = {};
        formSection.forEach((section) => {
          newSectionQuestions[
            section.title.toLowerCase().replace(/\s+/g, "_")
          ] = section.fields.map((field) => ({
            programQuestionId: field.programQuestionId,
            id: field.id,
            text: field.label,
            type: field.type,
            required: field.required,
            options: field.options?.map((opt) => opt.label) || [],
            validation: field.validation,
            status: field.status,
          }));
        });

        setSectionQuestions(newSectionQuestions);
        setOriginalSectionQuestions(newSectionQuestions);
      }
    } catch (error) {
      console.error("Error fetching program data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect to fetch data on mount
  useEffect(() => {
    if (programConfig?.id) {
      fetchProgramData();
    }
  }, [programConfig?.id]);

  // Add organizeQuestionsBySection helper function
  const organizeQuestionsBySection = (questionMaps: any[]) => {
    const organized: { [key: string]: Question[] } = {};

    questionMaps.forEach((qMap) => {
      const question = qMap.question;
      const sectionName = question.formSection.name
        .toLowerCase()
        .replace(/\s+/g, "_");

      if (!organized[sectionName]) {
        organized[sectionName] = [];
      }

      organized[sectionName].push({
        programQuestionId: qMap.id,
        id: question.id,
        text: question.label,
        type: question.type,
        required: question.config?.required || false,
        options:
          question.questionOptionMaps?.map((optMap) => optMap.option.name) ||
          [],
        validation: question.config,
        formSextion: question.formSection,
        status: question.status,
      });
    });

    return organized;
  };

  return (
    <FormProvider {...methods}>
      <div className={styles.formBuilder}>
        {loader && <Loader type="large" />}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>Form Builder</h1>
          </div>
          <div className={styles.globalControls}>
            <FormStepper
              activeStep={activeStep}
              steps={steps.filter((step) => {
                if (step.id === "travelDetails") {
                  return programConfig?.involvesTravel;
                }
                return true;
              })}
            />
          </div>
        </div>

        <div className={styles.mainContent}>
          <QuestionList
            availableQuestions={availableQuestions}
            handleDragStart={handleDragStart}
          />

          <FormPreview
            formQuestions={formQuestions}
            sections={sections}
            setSections={setSections}
            setSectionQuestions={setSectionQuestions}
            sectionQuestions={sectionQuestions}
            sectionMode={sectionMode}
            selectedQuestions={selectedQuestions}
            newSectionTitle={newSectionTitle}
            setNewSectionTitle={setNewSectionTitle}
            createSection={createSection}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            handleDragStart={handleDragStart}
            toggleQuestionSelection={toggleQuestionSelection}
            changeSectionLayout={changeSectionLayout}
            getEffectiveStyle={getEffectiveStyle}
            openQuestionStylesPopup={openQuestionStylesPopup}
            updateQuestionCustomStyle={updateQuestionCustomStyle}
            questionCustomStyles={questionCustomStyles}
            globalStyles={globalStyles}
            currentDraggedItem={currentDraggedItem}
            setCurrentDraggedItem={setCurrentDraggedItem}
            availableQuestions={availableQuestions}
            setAvailableQuestions={setAvailableQuestions}
            isSectionPopupOpen={isSectionPopupOpen}
            setIsSectionPopupOpen={setIsSectionPopupOpen}
            editingSection={editingSection}
            setEditingSection={setEditingSection}
            setFormQuestions={setFormQuestions}
            handleMarkAsRequired={handleMarkAsRequired}
            toggleSectionSelection={toggleSectionSelection}
            selectedSections={selectedSections}
            sectionQuestions={sectionQuestions}
            steps={steps}
            activeStep={activeStep}
            onSubmit={handleFormSubmit}
            deletedQuestionIds={deletedQuestionIds}
            setDeletedQuestionIds={setDeletedQuestionIds}
            originalSectionQuestions={originalSectionQuestions}
          />
        </div>

        {showGlobalStylesPopup && (
          <StylesPopup
            isGlobal={true}
            onClose={() => setShowGlobalStylesPopup(false)}
            globalStyles={globalStyles}
            questionCustomStyles={questionCustomStyles}
            updateGlobalStyles={updateGlobalStyles}
            updateQuestionCustomStyle={updateQuestionCustomStyle}
            styleQuestionId={styleQuestionId}
            getEffectiveStyle={getEffectiveStyle}
          />
        )}

        {showQuestionStylesPopup && (
          <StylesPopup
            isGlobal={false}
            onClose={() => setShowQuestionStylesPopup(false)}
            globalStyles={globalStyles}
            questionCustomStyles={questionCustomStyles}
            updateGlobalStyles={updateGlobalStyles}
            updateQuestionCustomStyle={updateQuestionCustomStyle}
            styleQuestionId={styleQuestionId}
            getEffectiveStyle={getEffectiveStyle}
          />
        )}

        {isSectionPopupOpen && (
          <SectionPopup
            isOpen={isSectionPopupOpen}
            onClose={closeSectionPopup}
            onSave={handleSaveSection}
            availableQuestions={availableQuestions}
            initialSection={editingSection}
            formQuestions={formQuestions}
            setAvailableQuestions={setAvailableQuestions}
            setFormQuestions={setFormQuestions}
            editingSection={editingSection}
            setEditingSection={setEditingSection}
          />
        )}

        {isMergePopupOpen && (
          <div className={styles.mergePopupOverlay}>
            <MergePopUpContent
              isOpen={isMergePopupOpen}
              onClose={() => setIsMergePopupOpen(false)}
              onMerge={mergeSections}
              availableQuestions={availableQuestions}
              formQuestions={formQuestions}
              selectedQuestions={selectedQuestions}
              setSelectedQuestions={setSelectedQuestions}
              mergeTitle={mergeTitle}
              setMergeTitle={setMergeTitle}
              sections={sections}
              selectedSections={selectedSections}
              toggleSectionSelection={toggleSectionSelection}
            />
          </div>
        )}
      </div>
   
      <div className={styles.floatingButtonWrapper}>
        <FloatingButton
          activeStep={activeStep}
          onNext={handleNextStep}
          onBack={handleBackStep}
          isValid={isStepValid}
          showBackButton={activeStep > 0}
          showNextButton={true}
          nextButtonText={activeStep === steps.length - 1 ? "Submit" : "Next"}
          onSubmit={handleFormSubmit}
          formData={generateFormOutput()}
        />
      </div>
    </FormProvider>
  );
};

export default FormBuilderr;
