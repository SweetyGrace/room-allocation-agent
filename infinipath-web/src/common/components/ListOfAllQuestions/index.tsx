import React from "react";
import styles from "./index.module.scss";
import GrayLine from "../GrayLine";
import arrowIcon from "../../../assets/images/arrow-left.svg";
import { questionData } from "../../../constants/aiConstants";

interface AllQuestionsViewProps {
  onBack: () => void;
  onQuestionClick: (question: string) => void;
}

const AllQuestionsView: React.FC<AllQuestionsViewProps> = ({
  onBack,
  onQuestionClick,
}) => {
  return (
    <div className={styles.questionsView}>
      <div className={styles.questionsHeader}>
        <div className={styles.allQuestionsHeader}>
          <img src={arrowIcon} alt="arrow left" onClick={onBack} />
          All Questions
        </div>
      </div>

      <div className={styles.questionsContent}>
        {questionData.map((category, categoryIndex) => (
          <div key={categoryIndex} className={styles.questionCategory}>
            <h3 className={styles.categoryTitle}>
              {category.category}
              <GrayLine />
            </h3>
            {category.questions.length > 0
              ? category.questions.map((question, questionIndex) => (
                  <div
                    key={questionIndex}
                    className={styles.questionItem}
                    onClick={() => onQuestionClick(question)}
                  >
                    {question}
                  </div>
                ))
              : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllQuestionsView;
