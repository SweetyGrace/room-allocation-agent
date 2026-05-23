import styles from "./index.module.scss";
import { Button } from "../Button";
import { Avatar, Modal } from "@mui/material";
import successIcon from "../../../assets/images/success-tick.svg";
import infinipath from "../../../assets/images/infinipath-name.svg";
import { getItemInLocalStorage } from "../../../services/localStorage";
interface CustomPopUpProps {
  open: boolean;
  onclose?: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText: string;
  cancelText: string;
  confirmDataTestId?: string;
  cancelDataTestId?: string;
  title?: string;
}
const SuccessPopUp: React.FC<CustomPopUpProps> = ({
  open,
  onclose,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  cancelDataTestId,
  confirmDataTestId,
  title,
}) => {
  const seekerData = getItemInLocalStorage("seekerDetails") || {};

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
      data-testid="modal"
    >
      <div className={styles.container} data-testid="container">
        <div className={styles.header} data-testid="header">
          <div
            className={styles.imagesContainer}
            data-testid="images-container"
          >
            <div data-testid="image-text-container">
              <img
                src={infinipath}
                alt="infinipath"
                data-testid="infinipath-image"
              />
              <p
                className={styles.growthSessionsText}
                data-testid="growth-sessions-text"
              >
                growth sessions with{" "}
                <span data-testid="mahatria-text">Mahatria</span>
              </p>
            </div>
            <div
              className={styles.profileIconDiv}
              data-testid="profile-icon-div"
            >
              <Avatar
                alt="Remy Sharp"
                src={successIcon}
                sx={{
                  width: 120,
                  height: 120,
                  border: "2px solid #ffffff !important",
                }}
                data-testid="avatar"
              />
            </div>
          </div>
          <div className={styles.skyDiv} data-testid="sky-div">
            <div className={styles.textDiv} data-testid="text-div">
              <p className={styles.text} data-testid="confirmation-text">
                <span className={styles.nameText}>{seekerData?.firstName?.charAt(0).toUpperCase() +
                  seekerData?.firstName?.slice(1)}, </span>
                
                <span className={styles.growthText} data-testid="growth-text">
                  {title?.length ? title : "Weekly Growth Session"}
                </span>{" "}
                registrations have been successfully scheduled!
              </p>
            </div>
          </div>
        </div>
        <div className={styles.buttonContainer} data-testid="button-container">
          <Button
            onClick={onCancel}
            buttonClassName={styles.cancelButton}
            buttonTextClassName={styles.cancelText}
            datatestid={cancelDataTestId}
            datatestidText={`cancel-${cancelDataTestId}`}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            buttonClassName={styles.confirmButton}
            buttonTextClassName={styles.confirmText}
            datatestid={confirmDataTestId}
            datatestidText={`confirm-${confirmDataTestId}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SuccessPopUp;
