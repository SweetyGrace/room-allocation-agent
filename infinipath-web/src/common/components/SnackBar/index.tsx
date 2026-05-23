import React, { useEffect, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import styles from "./index.module.scss";

interface SnackBarComponentProps {
  icon?: React.ReactNode;
  message?: string;
  snackbarCloseIcon?: React.ReactNode;
  registered?: boolean;
  onClose?: () => void; 
}

const SnackBarComponent: React.FC<SnackBarComponentProps> = ({
  icon,
  message,
  snackbarCloseIcon,
  registered,
  onClose,
}) => {
  const [open, setOpen] = useState(registered);

  useEffect(() => {
    setOpen(registered);
  }, [registered]);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
    if (onClose) {
      onClose(); // Notify the parent component
    }
  };

  return (
    <div>
      <Snackbar
        open={open}
        autoHideDuration={8000}
        onClose={handleClose}
        className={styles.snackbar}
        data-testid="snackbar"
        sx={{
          width: "100%",
          maxWidth: "91.6%",
          left: "0 !important",
          right: "0 !important",
          bottom: "24px !important",
          margin: "0 auto",

          "@media (max-width: 768px)": {
            bottom: "50px !important",
            borderRadius: "16px !important",
          },
        }}
      >
        <div className={styles.container} data-testid="snackbar-container">
          <div
            className={styles.IconContent}
            data-testid="snackbar-icon-content"
          >
            {icon}
            <span className={styles.message} dangerouslySetInnerHTML={{ __html: message }} />
          </div>
          <div
            className={styles.closeIcon}
            onClick={handleClose}
            data-testid="snackbar-close-icon"
          >
            {snackbarCloseIcon}
          </div>
        </div>
      </Snackbar>
    </div>
  );
};

export default SnackBarComponent;
