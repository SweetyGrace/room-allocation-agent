import styles from "./index.module.scss";
import Snackbar from "@mui/material/Snackbar";
import Box from "@mui/material/Box";
import close from "../../../assets/images/close-icon.svg";
import notification from "../../../assets/images/notification-icon.svg";
import React from "react";

interface DialogueContent {
  title: string;
  message: string;
  isOpen: boolean;
  classNameAlert?: boolean;
  setOpenToast: (params: { message: string; open: boolean }) => void;
}

const AlertDialog: React.FC<DialogueContent> = ({
  title,
  message,
  isOpen,
  setOpenToast,
  classNameAlert,
}) => {
  const handleClose = () => {
    setTimeout(() => {
      setOpenToast({ message: "", open: false });
    }, 2000);
  };
  const handleCloseIcon = () => {
    setOpenToast({ message: "", open: false });
  };

  return (
    <div>
      <Box
        sx={{
          "@media (max-width: 600px)": {
            top: "100px",
          },
        }}
      >
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={isOpen}
          onClose={handleClose}
          autoHideDuration={1000}
          // eslint-disable-next-line react/no-children-prop
          children={
            <div className="container">
              <div className="content">
                <div className={styles.notification}>
                  <img
                    src={notification}
                    alt="notification icon"
                    className={styles.image}
                  />
                  <div className="content-title">{title}</div>
                </div>
                <div className={styles.notification}>
                  <div className={styles.emptydiv}></div>
                  <div className="content-message">{message}</div>
                </div>
              </div>
              <div>
                <button className="close-button" onClick={handleCloseIcon}>
                  <img src={close} loading="lazy" alt="close"></img>
                </button>
              </div>
            </div>
          }
          sx={{
            ".css-1eqdgzv-MuiPaper-root-MuiSnackbarContent-root": {
              background: "none",
              color: "black",
            },
            ".css-jp7zqv-MuiSnackbar-root": {
              width: "100%",
              top: 100,
            },
            ".container": {
              display: "flex",
              maxWidth: "600px",
              borderRadius: "1px",
              border: `1px solid var(--Stroke-Grey-2, #D9D9D9)`,
              background: `#FFF`,
              boxShadow: `0px 4px 20px 0px rgba(0, 0, 0, 0.20)`,
            },
            ".content": {
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "16px 40px 16px 20px",
            },
            ".content-title": {
              color: "var(--Text-Blue, #051B46)",
              fontSize: "16px",
              fontWeight: "600",
              lineHeight: "26px",
            },
            ".content-message": {
              color: "var(--Text-Blue, #051B46)",
              fontSize: "14px",
              fontWeight: "400",
              lineHeight: "24px",
              textAlign: "left",
            },
            ".close-button": {
              background: "none",
              border: "none",
              position: classNameAlert ? "" : "absolute",
              marginRight: classNameAlert ? "10px" : "",
              marginTop: classNameAlert ? "10px" : "",
              top: "10px",
              right: classNameAlert ? "83px" : "10px",
              cursor: "pointer",
            },
          }}
        />
      </Box>
    </div>
  );
};

export default AlertDialog;
