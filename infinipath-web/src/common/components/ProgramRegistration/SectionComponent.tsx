import React, { useState } from "react";
import styles from "./index.module.scss";
import QuestionComponent from "./Question";
import { Section, GlobalStyles, QuestionCustomStyles, Question } from "./types";

interface SectionComponentProps {
  section: Section;
  changeSectionLayout: (sectionId: string, direction: string) => void;
  globalStyles: GlobalStyles;
  getEffectiveStyle: (questionId: number, type: "question" | "options") => any;
  openQuestionStylesPopup: (questionId: number) => void;
  questionCustomStyles: QuestionCustomStyles;
  updateQuestionCustomStyle: (
    questionId: number,
    type: string,
    property: string,
    value: string,
  ) => void;
  updateSectionTitle: (sectionId: string, newTitle: string) => void;
  deleteSection: (sectionId: string) => void;
  handleDragStart: (
    e: React.DragEvent,
    question: Question,
    sectionId: string,
  ) => void;
  handleDragOver: (
    e: React.DragEvent,
    sectionId: string,
    targetIndex: number,
  ) => void;
  handleDrop: (
    e: React.DragEvent,
    sectionId: string,
    targetIndex: number,
  ) => void;
  openEditSectionPopup: (section: Section) => void;
  setAvailableQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  setFormQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  handleMarkAsRequired: (questionId: number) => void;
  toggleSectionSelection: (sectionId: string, isSelected: boolean) => void;
  selectedSections: string[];
  sectionMode: boolean;
}

const SectionComponent: React.FC<SectionComponentProps> = ({
  section,
  changeSectionLayout,
  globalStyles,
  getEffectiveStyle,
  openQuestionStylesPopup,
  questionCustomStyles,
  updateQuestionCustomStyle,
  deleteSection,
  handleDragStart,
  handleDragOver,
  handleDrop,
  openEditSectionPopup,
  setAvailableQuestions,
  setFormQuestions,
  setSections,
  handleMarkAsRequired,
  toggleSectionSelection,
  selectedSections,
  sectionMode,
}) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragOverWithIndex = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };
  const renderQuestionsOrSubSections = (section: Section) => {
    if (section.subSections && section.subSections.length > 0) {
      // Render sub-sections recursively
      return (
      <>
      {/* Render questions of the section first */}
      {section.questions && section.questions.length > 0 && (
        <div className={styles.sectionQuestions}
          style={{
              flexDirection: section.flexDirection as "row" | "column",
          }}
        >
          {section.questions.map((question, qIndex) => (
            <React.Fragment key={question.id}>
            {dragOverIndex === qIndex && <div className={styles.dragLine}></div>}
            <QuestionComponent
              question={question}
              index={qIndex}
              inSection={true}
              sectionId={section.id}
              sectionMode={false}
              selectedQuestions={[]}
              toggleQuestionSelection={() => {}}
              handleDragStart={(e) => handleDragStart(e, question, section.id)}
              handleDragOver={(e) => handleDragOverWithIndex(e, qIndex)}
              handleDrop={(e) => handleDropWithIndex(e, qIndex)}
              getEffectiveStyle={getEffectiveStyle}
              openQuestionStylesPopup={openQuestionStylesPopup}
              questionCustomStyles={questionCustomStyles}
              updateQuestionCustomStyle={updateQuestionCustomStyle}
              setAvailableQuestions={setAvailableQuestions}
              setFormQuestions={setFormQuestions}
              setSections={setSections}
              handleMarkAsRequired={handleMarkAsRequired}
            />
          </React.Fragment>
            ))}
        </div>
      )}
      {section.subSections.map((subSection) => (
        <div key={subSection.id} className={styles.subSection}>
          <div className={styles.subSectionHeader}>
            <h4 style={globalStyles.sections.title as React.CSSProperties}>
              {subSection.title}
            </h4>
            <div className={styles.sectionControls}>
              {(!subSection.subSections ||
                subSection.subSections.length === 0) && (
                <>
                  <button
                    className={`${styles.layoutBtn} ${subSection.flexDirection === "column" ? styles.active : ""}`}
                    onClick={() => changeSectionLayout(subSection.id, "column")}
                  >
                    ↓
                  </button>
                  <button
                    className={`${styles.layoutBtn} ${subSection.flexDirection === "row" ? styles.active : ""}`}
                    onClick={() => changeSectionLayout(subSection.id, "row")}
                  >
                    →
                  </button>
                  {/* <button
                    className={styles.layoutBtn}
                    onClick={() => openEditSectionPopup(subSection)}
                  >
                    ✏️
                  </button> */}
                </>
              )}
              <button
                    className={styles.layoutBtn}
                    onClick={() => openEditSectionPopup(subSection)}
                  >
                    ✏️
              </button>
              <button
                className={styles.layoutBtn}
                onClick={() => deleteSection(subSection.id)}
              >
                🗑️
              </button>
            </div>
          </div>
          <div
            className={styles.sectionQuestions}
            style={{
              flexDirection: subSection.flexDirection as "row" | "column",
            }}
          >
            {renderQuestionsOrSubSections(subSection)}
          </div>
        </div>
      ))
    }
    </>);
    } else {
      // Render questions directly if no sub-sections
      return section.questions.map((question, qIndex) => (
        <React.Fragment key={question.id}>
          {dragOverIndex === qIndex && <div className={styles.dragLine}></div>}
          <QuestionComponent
            question={question}
            index={qIndex}
            inSection={true}
            sectionId={section.id}
            sectionMode={false}
            selectedQuestions={[]}
            toggleQuestionSelection={() => {}}
            handleDragStart={(e) => handleDragStart(e, question, section.id)}
            handleDragOver={(e) => handleDragOverWithIndex(e, qIndex)}
            handleDrop={(e) => handleDropWithIndex(e, qIndex)}
            getEffectiveStyle={getEffectiveStyle}
            openQuestionStylesPopup={openQuestionStylesPopup}
            questionCustomStyles={questionCustomStyles}
            updateQuestionCustomStyle={updateQuestionCustomStyle}
            setAvailableQuestions={setAvailableQuestions}
            setFormQuestions={setFormQuestions}
            setSections={setSections}
            handleMarkAsRequired={handleMarkAsRequired}
          />
        </React.Fragment>
      ));
    }
  };

  const handleDropWithIndex = (e: React.DragEvent, index: number) => {
    handleDrop(e, section.id, index);
    setDragOverIndex(null); // Reset the drag line
  };

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <h3 style={globalStyles.sections.title as React.CSSProperties}>
          {section?.title}
        </h3>
        <div className={styles.sectionControls}>
          {(!section.subSections || section.subSections.length === 0) && (
            <>
              <button
                className={`${styles.layoutBtn} ${section.flexDirection === "column" ? styles.active : ""}`}
                onClick={() => changeSectionLayout(section.id, "column")}
              >
                ↓
              </button>
              <button
                className={`${styles.layoutBtn} ${section.flexDirection === "row" ? styles.active : ""}`}
                onClick={() => changeSectionLayout(section.id, "row")}
              >
                →
              </button>
              
            </>
          )}
          <button
            className={styles.layoutBtn}
            onClick={() => openEditSectionPopup(section)}
          >
            ✏️
          </button>
          <button
            className={styles.layoutBtn}
            onClick={() => deleteSection(section.id)}
          >
            🗑️
          </button>
        </div>
      </div>

      <div
        className={styles.sectionQuestions}
        style={{ flexDirection: section.flexDirection as "row" | "column" }}
        onDragOver={(e) =>
          handleDragOver(e, section.id, section.questions.length)
        }
        onDrop={(e) => handleDropWithIndex(e, section.questions.length)}
      >
        {renderQuestionsOrSubSections(section)}
        {/* Render drag line at the end */}
        {dragOverIndex === section.questions.length && (
          <div className={styles.dragLine}></div>
        )}
      </div>
    </div>
  );
};

export default SectionComponent;
