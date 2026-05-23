import React from "react";
import styles from "./index.module.scss";
import { Button } from "../../components/Button";
import warningIcon from "../../../assets/images/WarningImg.svg";
import successIcon from "../../../assets/images/Infographic.svg";
import { AlertPopupProps } from "../../../types/registration";
import { CONFIRM } from "../../../constants";
import { CANCEL_SWAP } from "../../../constants/textConstants";

const AlertPopup: React.FC<AlertPopupProps> = ({
  message,
  cancelSwap,
  cancelText,
  confirmText = CONFIRM,
  onCancel,
  onConfirm,
  type
}) => {
  const iconSrc = type === "warning" ? warningIcon : successIcon;
  const showIcon = Boolean(type);
  const [reason, setReason] = React.useState("");
   const handleConfirm = () => {
    if (cancelSwap && onConfirm) {
      if (!reason.trim()) {
      return; // Don't proceed if reason is empty or only spaces
    }
      onConfirm(reason.trim());
    } else if (onConfirm) {
      onConfirm();
    }
  };
  const isConfirmDisabled = cancelSwap && !reason.trim();
  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          {showIcon && !cancelSwap && (
            <div className={styles.icon}>
              <img src={iconSrc} alt="icon" />
            </div>
          )}
          {Array.isArray(message) ? (
            message.map((item, idx) => (
              <p key={idx} className={styles.message}>
                {item}
              </p>
            ))
          ) : (
            message && <p className={cancelSwap ? styles.cancelSwapAlertMessage : styles.message}>{message}</p>
          )}
        </div>
          {cancelSwap && (
            <div className={styles.cancelSwapContainer}>
              <p className={styles.cancelSwapMessage}>{CANCEL_SWAP.INPUT_LABEL}</p>
              <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for cancellation"
              className={styles.cancelSwapInput}
              rows={3}
            />
            </div>
          )}
        <div className={styles.buttons}>
          {cancelText && (
            <button onClick={onCancel} className={styles.cancelButton}>
              {cancelText}
            </button>
          )}

          {onConfirm && (
            <Button
              onClick={handleConfirm}
              buttonClassName={styles.confirmButton}
              buttonTextClassName={styles.cancelText}
              datatestid="alert-popup-confirm-button"
              datatestidText={confirmText}
              disable={isConfirmDisabled}
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertPopup;
