import styles from "./index.module.scss";
import { Button } from "../Button";
import { Modal } from "@mui/material";
import close from "../../../assets/images/close-icon.svg";
import requestIcon from "../../../assets/images/request-icon.svg";
import GrayLine from "../GrayLine";
import successIcon from "../../../assets/images/success-tick.svg";
import deleteBin from "../../../assets/images/delete-bin.svg";
import signOutIcon from "../../../assets/images/sign-out-icon.svg";
interface CustomPopUpProps {
  open: boolean;
  onclose?: () => void;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText: string;
  cancelText: string;
  note?: string;
}
const CustomPopup: React.FC<CustomPopUpProps> = ({
  open,
  onclose,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  note,
}) => {
  return (
    <Modal
      open={open}
      onClose={onclose}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        backgroundRepeat: "no-repeat !important",
        backgroundPosition: "-78% -51%!important",
      }}
      data-testid="custom-popup-modal"
    >
      <div className={styles.container} data-testid="custom-popup-container">
        <div className={styles.header} data-testid="custom-popup-header">
          <div
            className={styles.headContainer}
            data-testid="custom-popup-head-container"
          >
            <div
              className={
                title === "Error" ||
                title?.includes("Request") ||
                title?.includes("Please")
                  ? styles.iconTitle
                  : styles.iconTitle2
              }
              data-testid="custom-popup-icon-title"
            >
              <img
                src={
                  title === "Error" ||
                  title?.includes("Request") ||
                  title?.includes("Please")
                    ? requestIcon
                    : title === "Delete Seeker" || title === "Delete account"
                      ? deleteBin
                      : title === "Sign Out"
                        ? signOutIcon
                        : successIcon
                }
                alt="request icon"
                className={
                  title === "Error"
                    ? styles.requestIcon
                    : title !== "Delete Seeker" &&
                        title !== "Delete account" &&
                        title !== "Sign Out"
                      ? styles.successIcon
                      : title === "Sign Out"
                        ? styles.exitIcon
                        : styles.deleteIcon
                }
                data-testid="custom-popup-icon"
              />
              <span
                id="popup-title"
                className={styles.headingText}
                data-testid="custom-popup-title"
              >
                {title?.includes("Request") ? "" : title}
              </span>
            </div>
            {onclose && (
              <div
                className={styles.closeIcon}
                data-testid="custom-popup-close-icon-container"
              >
                <img
                  src={close}
                  alt="close"
                  className={styles.closeIcon}
                  onClick={onclose}
                  data-testid="custom-popup-close-icon"
                />
              </div>
            )}
          </div>
          <GrayLine data-testid="custom-popup-gray-line" />
        </div>
        <p
          id="popup-description"
          className={styles.containerText}
          data-testid="custom-popup-description"
        >
          {description}
        </p>
        {note && (
          <p
            id="popup-note"
            className={styles.noteText}
            data-testid="custom-popup-note"
          >
            {note}
          </p>
        )}
        {(title === "Error" ||
          title?.includes("Request") ||
          title === "Delete Seeker" ||
          title?.includes("Delete account") ||
          title?.includes("Please") ||
          title?.includes("Sign Out")) && (
          <div
            className={styles.buttonContainer}
            data-testid="custom-popup-button-container"
          >
            <Button
              onClick={onCancel}
              buttonClassName={styles.confirmButton}
              buttonTextClassName={styles.confirmText}
              datatestid="custom-popup-cancel-button"
              datatestidText={`${cancelText}`}
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              buttonClassName={styles.cancelButton}
              buttonTextClassName={styles.cancelText}
              datatestid="custom-popup-confirm-button"
              datatestidText={`${confirmText}`}
            >
              {confirmText}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CustomPopup;
