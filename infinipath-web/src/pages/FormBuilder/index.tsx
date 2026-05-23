import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { IconButton, Tooltip } from '@mui/material';
import StyleIcon from '@mui/icons-material/Style';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import styles from './index.module.scss';

interface Question {
  id: string;
  label: string;
  options: Option[];
  styles?: QuestionStyles;
}

interface Option {
  id: string;
  label: string;
}

interface QuestionStyles {
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  flexDirection?: 'row' | 'column';
}

const DraggableQuestion: React.FC<{ question: Question; index: number }> = ({ question, index }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'QUESTION',
    item: { id: question.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div 
      ref={drag}
      className={`${styles.questionCard} ${isDragging ? styles.dragging : ''}`}
    >
      <DragIndicatorIcon className={styles.dragHandle} />
      <div className={styles.questionContent}>
        <div className={styles.questionText}>{question.label}</div>
        <div className={styles.optionsContainer}>
          {question.options.map(option => (
            <div key={option.id} className={styles.option}>
              {option.label}
            </div>
          ))}
        </div>
      </div>
      <Tooltip title="Change Styles">
        <IconButton size="small">
          <StyleIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  );
};

const DroppableArea: React.FC<{ 
  questions: Question[], 
  onDrop: (item: unknown) => void 
}> = ({ questions, onDrop }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'QUESTION',
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div 
      ref={drop} 
      className={`${styles.droppableArea} ${isOver ? styles.isOver : ''}`}
    >
      {questions.map((question, index) => (
        <DraggableQuestion key={question.id} question={question} index={index} />
      ))}
    </div>
  );
};

const FormBuilder: React.FC = () => {
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([
    // Add some sample questions here
    {
      id: '1',
      label: 'What is your name?',
      options: [{ id: '1', label: 'Text input' }]
    },
    {
      id: '2',
      label: 'Select your age group',
      options: [
        { id: '2-1', label: '18-25' },
        { id: '2-2', label: '26-35' },
        { id: '2-3', label: '36+' }
      ]
    }
  ]);
  
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const handleDrop = (item: unknown) => {
    const question = availableQuestions.find(q => q.id === item.id);
    if (question) {
      setSelectedQuestions([...selectedQuestions, question]);
      setAvailableQuestions(availableQuestions.filter(q => q.id !== item.id));
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Form Builder</h1>
          <Tooltip title="Global Styles">
            <IconButton onClick={() => setIsStyleModalOpen(true)}>
              <StyleIcon />
            </IconButton>
          </Tooltip>
        </div>

        <div className={styles.builderContainer}>
          <div className={styles.formPreview}>
            <h2>Form Preview</h2>
            <DroppableArea 
              questions={selectedQuestions} 
              onDrop={handleDrop}
            />
          </div>

          <div className={styles.questionsList}>
            <h2>Available Questions</h2>
            <div className={styles.availableQuestions}>
              {availableQuestions.map((question, index) => (
                <DraggableQuestion 
                  key={question.id} 
                  question={question} 
                  index={index} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default FormBuilder;