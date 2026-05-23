import React from "react";
import styles from "./index.module.scss";
import CustomRadioButton from "../CustomRadioButton";
import {
  DEFAULTER_HEADING,
  ENTER_REASON_PLACEHOLDER,
  textConstant,
} from "../../../constants/textConstants";
import { CANCEL_REGISTRATION_CONSTANTS } from "../../../constants";
import GrayLine from "../GrayLine";

interface Question {
  question: string;
  yesText?: string;
  noText?: string;
}

interface ConfirmationWithReasonProps {
  questions: Question[];
  confirmValue: boolean | null;
  onConfirmationChange: (value: boolean) => void;
  reason: string;
  onReasonChange: (value: string) => void;
  reasonPlaceholder?: string;
  sectionClassName?: string;
  isHeadingNeeded?: boolean;
  isColumnLayout?: boolean;
}

const ConfirmationWithReason: React.FC<ConfirmationWithReasonProps> = ({
  questions,
  confirmValue,
  onConfirmationChange,
  reason,
  onReasonChange,
  reasonPlaceholder = ENTER_REASON_PLACEHOLDER,
  sectionClassName,
  isHeadingNeeded = false,
  isColumnLayout = false,
}) => {
  return (
    <>
      <div className={styles.section}>
        {isHeadingNeeded && (
          <div className={styles.defaulterSectionLine}>
            <h3 className={styles.swapRequestSectionName}>
              {DEFAULTER_HEADING}
            </h3>

            <GrayLine />
          </div>
        )}
        {
          questions?.map((que: Question, index: number) => {
            return (
              <React.Fragment key={index}>
                <h3
                  className={sectionClassName ? sectionClassName : styles.sectionTitle}
                >
                  {que?.question}
                </h3>
                {(que?.yesText || que?.noText) && <div className={isColumnLayout ? styles.radioGroupColumn : styles.radioGroup}>
                  <CustomRadioButton
                    text={que?.yesText || ""}
                    name={textConstant.CONFIRMATION}
                    value={que?.yesText || ""}
                    checked={confirmValue === true}
                    onChange={() => onConfirmationChange(true)}
                  />
                  <CustomRadioButton
                    text={que?.noText || ""}
                    name={textConstant.CONFIRMATION}
                    value={que?.noText || ""}
                    checked={confirmValue === false}
                    onChange={() => onConfirmationChange(false)}
                  />
                </div>}
              </React.Fragment>
            )
          })
        }
      </div>

      {confirmValue && (
        <div className={styles.section}>
          <h3
            className={
              sectionClassName ? sectionClassName : styles.sectionTitle
            }
          >
            {CANCEL_REGISTRATION_CONSTANTS.LABELS.REASON}
          </h3>
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            className={styles.textarea}
            placeholder={reasonPlaceholder}
            rows={4}
          />
        </div>
      )}
    </>
  );
};

export default ConfirmationWithReason;
