import React, { useEffect, useState } from "react";
import { Modal } from "@mui/material";
import styles from "./index.module.scss";
import { getCall } from "../../../services/apiService";
import { endPoints, PORTAL } from "../../../constants/urlConstants";
import Loader from "../Loader";

interface QuestionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: number | null;
}

const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({
  isOpen,
  onClose,
  questionId,
}) => {
  interface Question {
    label: string;
    type: string;
    status: string;
    questionOptionMaps?: { id: number; option: { name: string; type: string } }[];
    config?: {
      enableOtherOption?: boolean;
      validationRule?: string;
    };
  }

  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      if (!questionId || !isOpen) return;
      setIsLoading(true);
      try {
        const response = await getCall(`${endPoints.question}/${questionId}`, undefined, PORTAL);
        if (response?.data?.statusCode === 200) {
          setQuestion(response.data.data);
        } else {
            alert("Failed to fetch question details");
        }
      } catch (error) {
        console.error("Error fetching question details:", error);
        alert(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestionDetails();
  }, [questionId, isOpen]);


  return (
    <Modal
      open={isOpen}
      onClose={()=>{
        onClose();
        setQuestion(null);
        setIsLoading(false);
      }}
      aria-labelledby="question-detail-modal"
      aria-describedby="question-detail-description"
    >
            {isLoading ? (
          <Loader type="large" />
        ) : (
      <div className={styles.modalContent}>
    
          <>
            <div className={styles.modalHeader}>
              <h2 data-testid = "question-details">Question Details</h2>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.section}>
                <h3>Basic Information</h3>
                <p>
                  <strong>Question:</strong> {question?.label}
                </p>
                <p>
                  <strong>Type:</strong> {question?.type}
                </p>
                <p>
                  <strong>Status:</strong> {question?.status}
                </p>
              </div>

              {(question?.questionOptionMaps ?? []).length > 0 && (
                <div className={styles.section}>
                  <h3>Options</h3>
                  <ul>
                    {question?.questionOptionMaps?.map((optionMap) => (
                      <li key={optionMap.id}>
                        {optionMap.option.name}
                        {question?.config?.enableOtherOption &&
                          optionMap.option.type === "other" &&
                          " (Other)"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(question?.config?.validationRule?.length ?? 0) > 0 && (
                <div className={styles.section}>
                  <h3>Validation Rules</h3>
                  <ul>
                    {question?.config?.validationRule?.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button onClick={onClose} className={styles.closeButton}>
                Close
              </button>
            </div>
          </>
   
      </div>
           )}
    </Modal>
  );
};

export default QuestionDetailModal;
