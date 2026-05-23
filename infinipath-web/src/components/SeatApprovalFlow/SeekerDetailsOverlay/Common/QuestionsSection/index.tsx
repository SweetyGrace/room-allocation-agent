import React, { useState } from 'react';
import { Question } from '../../../../../types/seatApproval';
import styles from './index.module.scss';
import GrayLine from '../../../../../common/components/GrayLine';
import CaretCircleDown from '../../../../../assets/images/CaretCircleDown.svg';
import CaretCircleUp from "../../../../../assets/images/CaretCircleUp.svg";
import { colorizeMahatriaInfinitheism } from '../../../../../common/components/ColorizeMahatriaInfinitheism';
import { BINDINGKEYS } from '../../../../../constants/seekerdetails';
import { NO_SONG_PREFERENCE, SECTION_KEYS } from '../../../../../constants/textConstants';

interface QuestionsSectionProps {
  questions: Question[];
  onShowAll?: () => void;
}

const QuestionsSection: React.FC<QuestionsSectionProps> = ({ questions, onShowAll }) => {
  const [isQuestionVisible, setIsQuestionVisible] = useState(true)
  const filteredQuestions = questions.filter((question) => question.questionBindingKey !== "videoUrl" && question.questionBindingKey !== BINDINGKEYS.TERMS && question.sectionKey === SECTION_KEYS.MAHATRIA);
  
  const renderAnswer = (answer: string) => {
    const trimmed = answer.trim();
  
    // Recursive helper to render any value (string, object, array)
    const renderValue = (value: any): React.ReactNode => {
      if (typeof value === "string" || typeof value === "number") {
        return colorizeMahatriaInfinitheism(String(value));
      }
  
      if (Array.isArray(value)) {
        return (
          <ul>
            {value.map((v, idx) => (
              <li key={idx}>{renderValue(v)}</li>
            ))}
          </ul>
        );
      }
  
      if (typeof value === "object" && value !== null) {
        return (
          <div>
            {Object.entries(value).map(([k, v], idx) => (
              <div key={idx}>
                {k}: {renderValue(v)}
              </div>
            ))}
          </div>
        );
      }
  
      return null;
    };
  
    // Handle JSON input
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === "object" && parsed !== null) {
          const entries = Object.entries(parsed);
          const nonEmptyEntries = entries.filter(
            ([_, value]) => String(value).trim() !== ""
          );
  
          if (entries.length > 0 && nonEmptyEntries.length === 0) {
            return (
              <div className={styles.aspectItem}>
                <span className={styles.aspectValue}>{NO_SONG_PREFERENCE}</span>
              </div>
            );
          }
  
          return nonEmptyEntries.map(([key, value], idx) => (
            <div key={idx} className={styles.aspectItem}>
              <span className={styles.aspectValue}>
                {`${idx + 1}. `}
                {renderValue(value)}
              </span>
            </div>
          ));
        }
      } catch {
        return null;
      }
    }
  
    // Fallback for plain text
    return <div className={styles.answerIndent}>{colorizeMahatriaInfinitheism(answer)}</div>;
  };
  
  return (
    <div className={styles.questionsSection}>
      <div className={styles.questionsHeader}>
        <h3>Questions</h3>
        <GrayLine />
       <img
        src={isQuestionVisible ? CaretCircleDown : CaretCircleUp}
        alt={isQuestionVisible ? "Show all" : "Hide"}
        onClick={() => { setIsQuestionVisible(!isQuestionVisible); }}
        className={styles.caretIcon}
      />
      </div>
      {isQuestionVisible && (
        <div className={styles.questionsList}>
          {filteredQuestions
            .filter((item) => !!item.answer)  
            .map((item, index) => (
              <div key={item.id} className={styles.questionItem}>
                <div className={styles.questionNumber}>{index + 1}.</div>
                <div className={styles.questionContent}>
                  <div className={styles.question}>
                    {colorizeMahatriaInfinitheism(item.questionLabel)}
                  </div>
                  <div className={styles.answer}>
                    <div className={styles.answerIndent}>
                      {renderAnswer(item.answer)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default QuestionsSection;
