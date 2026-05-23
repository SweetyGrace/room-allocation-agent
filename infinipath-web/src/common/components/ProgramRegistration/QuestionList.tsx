import React from 'react';
import styles from './index.module.scss';
import { Question } from './types';

interface QuestionListProps {
  availableQuestions: Question[];
  handleDragStart: (e: React.DragEvent, question: Question, fromForm?: boolean) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
  availableQuestions,
  handleDragStart
}) => {
  return (
    <div className={styles.availableQuestions}>
      <h2>Available Questions</h2>
        <div className={styles.questionsList}>
          {availableQuestions.map((question) => (
            <div
              key={question.id}
              className={styles.availableQuestionItem}
              draggable
              onDragStart={(e) => handleDragStart(e, question)}
            >
              <div className={styles.questionText}>{question.text}</div>

                <span className={styles.questionType}>{question.type}</span>
            </div>
          ))}
          {availableQuestions.length === 0 && (
            <div className={styles.emptyState}>No available questions</div>
          )}
        </div>
    </div>
  );
};

export default QuestionList;