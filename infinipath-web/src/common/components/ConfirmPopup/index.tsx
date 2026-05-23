import React from "react";
import styles from "./index.module.scss";
import { Button } from "../../components/Button";
import warningIcon from "../../../assets/images/WarningImg.svg";
import successIcon from "../../../assets/images/Infographic.svg";
import { AlertPopupProps } from "../../../types/registration";
import { CONFIRM } from "../../../constants";
import GrayLine from "../GrayLine";
import closeIcon from "../../../assets/images/close-cross.svg";

const ConfirmAlertPopup: React.FC<AlertPopupProps> = ({
  message,
  cancelText,
  confirmText = CONFIRM,
  onCancel,
  onConfirm,
  type,
  title,
  grayBorder
}) => {
  const iconSrc = type === "warning" ? warningIcon : successIcon;
  const showIcon = Boolean(type);

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.closeIcon}>
            <img src={closeIcon} alt="close popup"  className={styles.closeIconImg} onClick={onCancel}/>
        </div>
        <div className={styles.header}>
          {showIcon && (
            <div className={title ? styles.iconContainer : ""}>
              <div className={styles.icon}>
                <img src={iconSrc} alt="icon" />
              </div>
              <div className={styles.title}>{title}</div>
            </div>
          )}
          {Array.isArray(message) ? (
            message.map((item, idx) => (
              <div key={idx} className={styles.message}>
                {item}
              </div>
            ))
          ) : (
            message && <div className={styles.message}>{message}</div>
          )}
        </div>
        {grayBorder && <div className={styles.border}><GrayLine /></div>}
        <div className={styles.buttons}>
          {cancelText && (
            <button onClick={onCancel} className={styles.cancelButton}>
              {cancelText}
            </button>
          )}

          {onConfirm && (
            <Button
              onClick={onConfirm}
              buttonClassName={styles.confirmButton}
              buttonTextClassName={styles.cancelText}
              datatestid="alert-popup-confirm-button"
              datatestidText={confirmText}
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmAlertPopup;
