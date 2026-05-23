import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import QuestionComponent from "./Question";
import SectionComponent from "./SectionComponent";
import { Question, Section, GlobalStyles, QuestionCustomStyles } from "./types";

interface FormPreviewProps {
  formQuestions: Question[];
  sections: Section[];
  setSectionQuestions: React.Dispatch<
    React.SetStateAction<{
      [key: string]: Question[]; // Change to allow dynamic section keys
    }>
  >;
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  sectionMode: boolean;
  selectedQuestions: number[];
  newSectionTitle: string;
  setNewSectionTitle: React.Dispatch<React.SetStateAction<string>>;
  createSection: () => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, targetIndex?: number | null) => void;
  handleDragStart?: (
    e: React.DragEvent,
    question: Question,
    fromForm?: boolean,
  ) => void;
  toggleQuestionSelection: (questionId: number) => void;
  changeSectionLayout: (sectionId: string, direction: string) => void;
  getEffectiveStyle: (questionId: number, type: "question" | "options") => any;
  openQuestionStylesPopup: (questionId: number) => void;
  updateQuestionCustomStyle: (
    questionId: number,
    type: string,
    property: string,
    value: string,
  ) => void;
  questionCustomStyles: QuestionCustomStyles;
  globalStyles: GlobalStyles;
  currentDraggedItem: {
    question: Question;
    fromForm: boolean;
    sectionId?: string;
  } | null;
  setCurrentDraggedItem: React.Dispatch<
    React.SetStateAction<{
      question: Question;
      fromForm: boolean;
      sectionId?: string;
    } | null>
  >;
  availableQuestions: Question[];
  setAvailableQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  editingSection: Section | null;
  setEditingSection: React.Dispatch<React.SetStateAction<Section | null>>;
  isSectionPopupOpen: boolean;
  setIsSectionPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFormQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  handleMarkAsRequired: (questionId: number) => void;
  toggleSectionSelection: (sectionId: string, isSelected: boolean) => void;
  selectedSections: string[];
  sectionQuestions: {
    [key: string]: Question[]; // Change to allow dynamic section keys
  };
  steps: Array<{ id: string; title: string }>;
  activeStep: number;
  onSubmit: (formData: FormOutput) => void;
  deletedQuestionIds: number[];
  setDeletedQuestionIds: React.Dispatch<React.SetStateAction<number[]>>;
  originalSectionQuestions: {
    [key: string]: Question[];
  };
}

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
      validation?: {
        pattern?: string;
        messages?: {
          required?: string;
          pattern?: string;
        };
      };
      placeholder?: string;
      isDisabled?: boolean;
      isMultiple?: boolean;
    }>;
  }[];
}

const fieldTypes = [
  { value: "text", label: "Text Field" },
  { value: "email", label: "Email Field" },
  { value: "date", label: "Date Field" },
  { value: "textarea", label: "Paragraph" },
  { value: "select", label: "Dropdown" },
  { value: "radio", label: "Radio Button" },
  { value: "checkbox", label: "Checkbox" },
  { value: "boolean", label: "Yes/No" },
  { value: "file", label: "File Upload" },
  { value: "number", label: "Number Field" },
  { value: "tele", label: "Phone Number" },
];

const FormPreview: React.FC<FormPreviewProps> = ({
  formQuestions,
  sections,
  setSections,
  sectionMode,
  selectedQuestions,
  setSectionQuestions,
  newSectionTitle,
  setNewSectionTitle,
  createSection,
  handleDragOver,
  handleDrop,
  // handleDragStart: handleDragStartLocal,
  toggleQuestionSelection,
  changeSectionLayout,
  getEffectiveStyle,
  openQuestionStylesPopup,
  updateQuestionCustomStyle,
  questionCustomStyles,
  globalStyles,
  currentDraggedItem,
  setCurrentDraggedItem,
  availableQuestions,
  setAvailableQuestions,
  editingSection,
  setEditingSection,
  isSectionPopupOpen,
  setIsSectionPopupOpen,
  setFormQuestions,
  handleMarkAsRequired,
  toggleSectionSelection,
  selectedSections,
  sectionQuestions,
  steps,
  activeStep,
  onSubmit,
  deletedQuestionIds,
  setDeletedQuestionIds,
  originalSectionQuestions,
}) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAddDropdown) {
        const dropdown = document.querySelector(`.${styles.dropdownContainer}`);
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setShowAddDropdown(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAddDropdown]);

  const handleDragOverWithIndex = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDropWithIndex = (e: React.DragEvent, index: number | null) => {
    e.preventDefault();

    if (!currentDraggedItem?.question) {
      console.error("No dragged item found");
      return;
    }

    const currentStep = steps[activeStep];
    if (!currentStep) {
      console.error("No active step found");
      return;
    }

    const sectionKey = currentStep.title.toLowerCase().replace(/\s+/g, "_");

    setSectionQuestions((prev) => {
      const currentQuestions = [...(prev[sectionKey] || [])];
      const draggedQuestion = currentDraggedItem.question;

      // If the question is from available questions, add it
      if (!currentDraggedItem.fromForm) {
        if (index === null) {
          currentQuestions.push(draggedQuestion);
        } else {
          currentQuestions.splice(index, 0, draggedQuestion);
        }

        // Remove from available questions if it was dragged from there
        setAvailableQuestions((prev) =>
          prev.filter((q) => q.id !== draggedQuestion.id),
        );
      }
      // If it's reordering within the same section
      else {
        const oldIndex = currentQuestions.findIndex(
          (q) => q.id === draggedQuestion.id,
        );
        if (oldIndex > -1) {
          currentQuestions.splice(oldIndex, 1);
          const newIndex = index === null ? currentQuestions.length : index;
          currentQuestions.splice(newIndex, 0, draggedQuestion);
        }
      }

      return {
        ...prev,
        [sectionKey]: currentQuestions,
      };
    });

    setCurrentDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragStart = (
    e: React.DragEvent,
    question: Question,
    fromForm: boolean = false,
  ) => {
    e.dataTransfer.setData("text/plain", ""); // Required for Firefox
    setCurrentDraggedItem({
      question,
      fromForm,
      sectionId: steps[activeStep]?.title.toLowerCase().replace(/\s+/g, "_"),
    });
  };

  const updateSectionTitle = (sectionId: string, newTitle: string) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId ? { ...section, title: newTitle } : section,
      ),
    );
  };

  const deleteSection = (sectionId: string) => {
    const deleteSectionRecursively = (sections: Section[]): Section[] => {
      return sections
        .map((section) => {
          if (section.id === sectionId) {
            // Collect all questions from the section and its sub-sections
            const collectQuestionsRecursively = (
              section: Section,
            ): Question[] => {
              const subSectionQuestions = section.subSections
                ? section.subSections.flatMap(collectQuestionsRecursively)
                : [];
              return [...section.questions, ...subSectionQuestions];
            };

            const allQuestions = collectQuestionsRecursively(section);

            // Add all collected questions back to availableQuestions
            setAvailableQuestions((prevAvailableQuestions) => [
              ...prevAvailableQuestions,
              ...allQuestions,
            ]);

            return null; // Mark this section for deletion
          }

          // Recursively check subSections
          if (section.subSections && section.subSections.length > 0) {
            const updatedSubSections = deleteSectionRecursively(
              section.subSections,
            );
            return {
              ...section,
              subSections: updatedSubSections,
            };
          }

          return section;
        })
        .filter(
          (section) =>
            section !== null && // Remove deleted sections
            (section.questions.length > 0 || // Keep sections with questions
              (section.subSections && section.subSections.length > 0)), // Keep sections with sub-sections
        ) as Section[];
    };

    setSections((prevSections) => deleteSectionRecursively(prevSections));
  };

  const openEditSectionPopup = (section: Section) => {
    setEditingSection(section);
    setIsSectionPopupOpen(true);
  };

  const handleDragStartInSection = (
    e: React.DragEvent,
    question: Question,
    sectionId: string,
  ) => {
    setCurrentDraggedItem({ question, fromForm: true, sectionId });
  };

  const handleDragOverInSection = (
    e: React.DragEvent,
    sectionId: string,
    targetIndex: number,
  ) => {
    e.preventDefault();
    setDragOverIndex(targetIndex);
  };

  const handleDropInSection = (
    e: React.DragEvent,
    sectionId: string,
    targetIndex: number,
  ) => {
    e.preventDefault();
    if (!currentDraggedItem || currentDraggedItem.sectionId !== sectionId)
      return;

    const { question } = currentDraggedItem;
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const updatedQuestions = [...section.questions];
    const oldIndex = updatedQuestions.findIndex((q) => q.id === question.id);
    updatedQuestions.splice(oldIndex, 1);
    updatedQuestions.splice(targetIndex, 0, question);

    setSections((prevSections) =>
      prevSections.map((s) =>
        s.id === sectionId ? { ...s, questions: updatedQuestions } : s,
      ),
    );
    setCurrentDraggedItem(null);
    setDragOverIndex(null);
  };

  const generateFormOutput = (): FormOutput => {
    const formSections = steps.map((step) => {
      const sectionQuestionsList = sectionQuestions[step.id] || [];

      return {
        id: step.id,
        title: step.title,
        fields: sectionQuestionsList.map((question) => ({
          id: question?.id,
          label: question?.text,
          type: question?.type,
          required: question?.required || false,
          options: question?.options
            ? question.options.map((opt) => ({
                value: opt.toLowerCase().replace(/\s+/g, "_"),
                label: opt,
              }))
            : undefined,
          validation: question?.validation,
          placeholder: question?.placeholder,
          isDisabled: false,
          isMultiple:
            question?.type === "multiselect" || question?.type === "checkbox",
        })),
      };
    });

    return {
      formTitle: "Program Registration Form",
      sections: formSections,
    };
  };

  const handleQuestionDelete = (
    questionId: number,
    programQuestionId: number,
  ) => {
   
    // Store the program question ID for later API call
    setDeletedQuestionIds((prev) => [...prev, programQuestionId]);

    // Remove question from current section
    const currentStep = steps[activeStep];
    const sectionKey = currentStep.title.toLowerCase().replace(/\s+/g, "_");

    setSectionQuestions((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey].filter((q) => q.id !== questionId),
    }));
  };

  const handleQuestionUpdate = (
    questionId: number,
    field: string,
    value: any,
  ) => {
    const currentStep = steps[activeStep];
    const sectionKey = currentStep.title.toLowerCase().replace(/\s+/g, "_");

    setSectionQuestions((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map((q) =>
        q.id === questionId ? { ...q, [field]: value } : q,
      ),
    }));
  };

  const handleOptionUpdate = (
    questionId: number,
    optionIndex: number,
    value: string,
  ) => {
    const currentStep = steps[activeStep];
    const sectionKey = currentStep.title.toLowerCase().replace(/\s+/g, "_");

    setSectionQuestions((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options?.map((opt, idx) =>
                idx === optionIndex ? value : opt,
              ),
            }
          : q,
      ),
    }));
  };

  const handleAddNewField = (type: string) => {
    const currentStep = steps[activeStep];
    if (!currentStep) return;

    const sectionKey = currentStep.title.toLowerCase().replace(/\s+/g, "_");

    const newQuestion: Question = {
      id: Date.now(),
      programQuestionId: Date.now(),
      text: `New ${type} field`,
      type,
      required: false,
      options: ["select", "radio", "boolean"].includes(type)
        ? ["Option 1"]
        : [],
      validation: {},
      helperText: "",
      status: "draft",
    };

    setSectionQuestions((prev) => ({
      ...prev,
      [sectionKey]: [...(prev[sectionKey] || []), newQuestion],
    }));

    setShowAddDropdown(false);
  };

  const handleAddOption = (questionId: number) => {
    const currentStep = steps[activeStep];
    const sectionKey = currentStep.title.toLowerCase().replace(/\s+/g, "_");

    setSectionQuestions((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: [...(q.options || []), ""],
            }
          : q,
      ),
    }));
  };

  const handleRemoveOption = (questionId: number, optionIndex: number) => {
    const currentStep = steps[activeStep];
    const sectionKey = currentStep.title.toLowerCase().replace(/\s+/g, "_");

    setSectionQuestions((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options?.filter((_, idx) => idx !== optionIndex),
            }
          : q,
      ),
    }));
  };

  return (
    <div
      className={styles.formPreview}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDropWithIndex(e, null)}
    >
      <div className={styles.formHeader}>
        <h2>Form Preview</h2>
        <button
          className={styles.editButton}
          onClick={() => setIsEditMode(!isEditMode)}
        >
          {isEditMode ? "Exit Edit Mode" : "Edit Form"}
        </button>
      </div>

      {sections.map((section) => (
        <SectionComponent
          key={section.id}
          section={section}
          changeSectionLayout={changeSectionLayout}
          globalStyles={globalStyles}
          getEffectiveStyle={getEffectiveStyle}
          openQuestionStylesPopup={openQuestionStylesPopup}
          questionCustomStyles={questionCustomStyles}
          updateQuestionCustomStyle={updateQuestionCustomStyle}
          updateSectionTitle={updateSectionTitle} // Pass this prop
          deleteSection={deleteSection} // Pass this prop
          handleDragStart={handleDragStartInSection}
          handleDragOver={handleDragOverInSection}
          handleDrop={handleDropInSection}
          openEditSectionPopup={openEditSectionPopup}
          setAvailableQuestions={setAvailableQuestions}
          setFormQuestions={setFormQuestions}
          setSections={setSections}
          handleMarkAsRequired={handleMarkAsRequired}
          toggleSectionSelection={toggleSectionSelection}
          selectedSections={selectedSections}
          sectionMode={sectionMode}
        />
      ))}

      {/* Get current section ID and normalize it */}
      {(() => {
        const currentStep = steps[activeStep];
        if (!currentStep) return null;

        const sectionKey = currentStep.title.toLowerCase().replace(/\s+/g, "_");
        const questions = sectionQuestions[sectionKey] || [];

        return (
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>{currentStep?.title}</h2>

            <div className={styles.questionsContainer}>
              {questions.map((question, index) => (
                <QuestionComponent
                  key={question.id}
                  question={question}
                  index={index}
                  onDelete={() =>
                    handleQuestionDelete(
                      question.id,
                      question.programQuestionId,
                    )
                  }
                  inSection={false}
                  sectionMode={sectionMode}
                  selectedQuestions={selectedQuestions}
                  toggleQuestionSelection={toggleQuestionSelection}
                  handleDragStart={(e) => handleDragStart(e, question, true)} // Pass true for fromForm
                  handleDragOver={handleDragOver}
                  handleDrop={handleDropWithIndex}
                  getEffectiveStyle={getEffectiveStyle}
                  openQuestionStylesPopup={openQuestionStylesPopup}
                  questionCustomStyles={questionCustomStyles}
                  updateQuestionCustomStyle={updateQuestionCustomStyle}
                  setAvailableQuestions={setAvailableQuestions}
                  setFormQuestions={setFormQuestions}
                  setSections={setSections}
                  handleMarkAsRequired={handleMarkAsRequired}
                  setSectionQuestions={setSectionQuestions}
                  steps={steps}
                  activeStep={activeStep}
                  isEditMode={isEditMode}
                  onUpdate={(field, value) =>
                    handleQuestionUpdate(question.id, field, value)
                  }
                  onUpdateOption={(idx, value) =>
                    handleOptionUpdate(question.id, idx, value)
                  }
                  onAddOption={() => handleAddOption(question.id)}
                  onRemoveOption={(idx) => handleRemoveOption(question.id, idx)}
                />
              ))}
            </div>

            {/* Add Field Section - Only in Edit Mode */}
            {isEditMode && (
              <div className={styles.addFieldSection}>
                <div className={styles.dropdownContainer}>
                  <button
                    className={styles.addFieldBtn}
                    onClick={() => setShowAddDropdown(!showAddDropdown)}
                  >
                    + Add New Field
                  </button>
                  {showAddDropdown && (
                    <div className={styles.fieldTypesDropdown}>
                      {fieldTypes.map((type) => (
                        <button
                          key={type.value}
                          className={styles.fieldTypeOption}
                          onClick={() => {
                            handleAddNewField(type.value);
                            setShowAddDropdown(false);
                          }}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {questions.length === 0 && (
              <div className={styles.emptyForm}>
                <p>No questions in this section yet.</p>
                {isEditMode && (
                  <button
                    className={styles.btnPrimary}
                    onClick={() => setShowAddDropdown(true)}
                  >
                    Add First Question
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* Show drag line when dragging */}
      {dragOverIndex ===
        (sectionQuestions[
          steps[activeStep]?.title.toLowerCase().replace(/\s+/g, "_")
        ]?.length || 0) && <div className={styles.dragLine}></div>}

      {/* Show empty state if no questions */}
      {!sectionQuestions[
        steps[activeStep]?.title.toLowerCase().replace(/\s+/g, "_")
      ]?.length && (
        <div className={styles.emptyForm}>
          <p>Drag questions here to build your form</p>
        </div>
      )}
    </div>
  );
};

export default FormPreview;
