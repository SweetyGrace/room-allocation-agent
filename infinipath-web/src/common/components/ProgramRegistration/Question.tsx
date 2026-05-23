import React, { useState } from 'react';
import styles from './index.module.scss';
import { Question, Section } from './types';

interface QuestionComponentProps {
  question: Question;
  index: number;
  inSection: boolean;
  sectionId?: string;
  sectionMode: boolean;
  selectedQuestions: number[];
  toggleQuestionSelection: (questionId: number) => void;
  handleDragStart: (e: React.DragEvent, question: Question, fromForm?: boolean) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, targetIndex?: number | null) => void;
  getEffectiveStyle: (questionId: number, type: 'question' | 'options') => any;
  openQuestionStylesPopup: (questionId: number) => void;
  questionCustomStyles: any;
  updateQuestionCustomStyle: (questionId: number, type: string, property: string, value: string) => void;
  setAvailableQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  setFormQuestions: React.Dispatch<React.SetStateAction<Question[]>>; 
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  handleMarkAsRequired: (questionId: number) => void;
  setSectionQuestions: React.Dispatch<React.SetStateAction<{
    [key: string]: Question[];
  }>>;
  steps: Array<{ id: string; title: string }>;
  activeStep: number;
  onDelete?: (questionId: number, programQuestionId: number) => void;
  isEditMode?: boolean;
  onUpdate?: (field: string, value: any) => void;
  onUpdateOption?: (index: number, value: string) => void;
  onAddOption?: () => void;
  onRemoveOption?: (index: number) => void;
  onAddValidation?: (rule: string) => void;
  onRemoveValidation?: (rule: string) => void;
}



const QuestionComponent: React.FC<QuestionComponentProps> = ({
  question,
  index,
  inSection,
  sectionMode,
  selectedQuestions,
  toggleQuestionSelection,
  handleDragStart,
  handleDragOver,
  handleDrop,
  getEffectiveStyle,
  questionCustomStyles,
  updateQuestionCustomStyle,
  setAvailableQuestions,
  setFormQuestions,
  setSections,
  // handleMarkAsRequired,
  setSectionQuestions,
  steps,
  activeStep,
  onDelete,
  isEditMode,
  onUpdate,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
}) => {

  const isSelected = selectedQuestions.includes(question.id);
  const questionStyle = getEffectiveStyle(question.id, 'question');
  const optionStyle = getEffectiveStyle(question.id, 'options');

  const handleDeleteQuestion = () => {
    const currentSection = steps[activeStep]?.id;
    
    if (!currentSection || !setSectionQuestions) {
      console.error('Unable to delete question: Missing section or setSectionQuestions');
      return;
    }

    // Call the onDelete prop if it exists (this will handle storing deleted IDs)
    if (onDelete && question.programQuestionId) {
      onDelete(question.id, question.programQuestionId);
    }

    setSectionQuestions(prev => {
      const currentSectionQuestions = prev[currentSection];
      
      if (!currentSectionQuestions) {
        console.error(`No questions found for section: ${currentSection}`);
        return prev;
      }

      return {
        ...prev,
        [currentSection]: currentSectionQuestions.filter(q => q.id !== question.id)
      };
    });
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'tel':
      case 'url':
        return <input type={question.type} placeholder={`Enter ${question.text.toLowerCase()}`} />;
      
      case 'textarea':
        return <textarea placeholder={`Enter ${question.text.toLowerCase()}`}></textarea>;
      
      case 'select':
        return (
          <select>
            <option value="">Please select</option>
            {question.options?.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'multiselect':
        return (
          <div className={styles.multiselect}>
            {question.options?.map((option, idx) => (
              <div key={idx} className={styles.multiselectOption}>
                <input type="checkbox" id={`q${question.id}-opt${idx}`} name={`q${question.id}`} value={option} />
                <label htmlFor={`q${question.id}-opt${idx}`} style={optionStyle as React.CSSProperties}>{option}</label>
              </div>
            ))}
          </div>
        );
      
      case 'radio':
        return (
          <div className={styles.radioGroup}>
            {question.options?.map((option, idx) => (
              <div key={idx} className={styles.radioOption}>
                <input type="radio" id={`q${question.id}-opt${idx}`} name={`q${question.id}`} value={option} />
                <label htmlFor={`q${question.id}-opt${idx}`} style={optionStyle as React.CSSProperties}>{option}</label>
              </div>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className={styles.checkboxOption}>
            <input type="checkbox" id={`q${question.id}`} name={`q${question.id}`} />
            <label htmlFor={`q${question.id}`} style={optionStyle as React.CSSProperties}>Yes, I agree</label>
          </div>
        );
      
      case 'rating':
        return (
          <div className={styles.ratingGroup}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className={styles.ratingStar}>★</span>
            ))}
          </div>
        );
      
      case 'date':
      case 'time':
        return <input type={question.type} />;
      
      case 'file':
        return <input type="file" />;
      
      default:
        return <input type="text" placeholder="Enter your answer" />;
    }
  };

  return (
    <div 
      className={`${styles.questionContainer} ${inSection ? styles.inSection : ''} 
        ${isSelected ? styles.selected : ''} ${isEditMode ? styles.editing : ''}`}
      draggable={!isEditMode}
      onDragStart={(e) => handleDragStart(e, question, true)}
      onDragOver={(e) => {
        e.preventDefault();
        handleDragOver(e);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleDrop(e, index);
      }}
    >
      <div className={styles.questionHeader}>
        <div className={styles.questionTitleWrapper}>
          {isEditMode ? (
            <div className={styles.editableHeader}>
              <input
                type="text"
                value={question.text}
                onChange={(e) => onUpdate?.('text', e.target.value)}
                className={styles.titleInput}
                placeholder="Enter question text"
              />
              <div className={styles.editControls}>
                <select 
                  value={question.type}
                  onChange={(e) => onUpdate?.('type', e.target.value)}
                  className={styles.typeSelect}
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="number">Number</option>
                  <option value="select">Dropdown</option>
                  <option value="radio">Radio</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="date">Date</option>
                </select>
                <label className={styles.requiredToggle}>
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) => onUpdate?.('required', e.target.checked)}
                  />
                  Required
                </label>
              </div>
            </div>
          ) : (
            <label style={questionStyle as React.CSSProperties}>
              {question.text}
              {question.required && <span className={styles.requiredMark}>*</span>}
            </label>
          )}
        </div>
        
        <div className={styles.questionControls}>
          {isEditMode ? (
            <>
              {(question.type === 'select' || question.type === 'radio') && (
                <button
                  className={styles.addOptionBtn}
                  onClick={onAddOption}
                >
                  Add Option
                </button>
              )}
              <button 
                className={styles.deleteBtn}
                onClick={() => onDelete?.(question.id, question.programQuestionId)}
              >
                🗑️
              </button>
            </>
          ) : (
            <button 
              className={styles.styleBtn}
              onClick={handleDeleteQuestion}
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className={styles.questionContent}>
        {isEditMode && (question.type === 'select' || question.type === 'radio') ? (
          <div className={styles.optionsEditor}>
            {question.options?.map((option, idx) => (
              <div key={idx} className={styles.optionRow}>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => onUpdateOption?.(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                />
                <button onClick={() => onRemoveOption?.(idx)}>✕</button>
              </div>
            ))}
          </div>
        ) : (
          renderQuestionInput()
        )}
      </div>
    </div>
  );
};

export default QuestionComponent;