
import React from "react";
import { toast, ToastPosition } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import infoImg from "../../../assets/images/WarningImg.svg";
import successImg from "../../../assets/images/Infographic.svg";
import closeImg from "../../../assets/images/CloseImg.svg";
import styles from "./index.module.scss";
import { TOAST_CONFIG, WARNING, SUCCESS } from "../../../constants";
import { ToastContentProps, CustomCloseButtonProps } from "../../../types/registration";


// Components
const ToastContent: React.FC<ToastContentProps> = ({ icon, title, message }) => (
  <div className={styles.customToastContent}>
    <div className={styles.customToastIcon}>{icon}</div>
    <div className={styles.customToastText}>
      <div className={styles.customToastTitle}>{title}</div>
      <div className={styles.customToastMessage}>{message}</div>
    </div>
  </div>
);

const CustomCloseButton: React.FC<CustomCloseButtonProps> = ({ closeToast }) => (
  <img
    src={closeImg}
    alt="close"
    className={styles.customToastClose}
    onClick={closeToast}
  />
);

// Helper function to create icon
const createIcon = (src: string, alt: string) => (
  <div style={TOAST_CONFIG.ICON_SIZE}>
    <img src={src} alt={alt} style={{ width: "100%", height: "100%" }} />
  </div>
);

// Main notify function
export const notify = (title: string, message: string, type: string) => {
  const baseConfig = {
    hideProgressBar: true,
    draggable: true,
    icon: false as const,
    closeButton: <CustomCloseButton />,
  };

  switch (type) {
    case SUCCESS:
      return toast.success(
        <ToastContent
          icon={createIcon(successImg, "success")}
          title={title}
          message={message}
        />,
        {
          ...baseConfig,
          position: TOAST_CONFIG.POSITIONS.TOP_RIGHT,
          autoClose: TOAST_CONFIG.AUTO_CLOSE.SHORT,
          className: styles.customToastSuccess,
        }
      );

    case WARNING:
      return toast.error(
        <ToastContent
          icon={createIcon(infoImg, "error")}
          title={title}
          message={message}
        />,
        {
          ...baseConfig,
          position: TOAST_CONFIG.POSITIONS.TOP_RIGHT,
          autoClose: TOAST_CONFIG.AUTO_CLOSE.SHORT,
          className: styles.customToastError,
        }
      );

    default:
      return toast(
        <ToastContent icon={null} title={title} message={message} />,
        {
          position: TOAST_CONFIG.POSITIONS.BOTTOM_RIGHT,
          autoClose: TOAST_CONFIG.AUTO_CLOSE.LONG,
          draggable: true,
          className: styles.customToastDefault,
        }
      );
  }
};