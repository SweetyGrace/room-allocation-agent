import * as React from "react";
import Modal from "@mui/material/Modal";
import { Box } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "1000px",
  bgcolor: "background.paper",
  padding: "20px",
};
interface CustomModalProps {
  open: boolean;
  handleClose: () => void;
  children: React.ReactNode;
}
const CustomModal: React.FC<CustomModalProps> = ({
  open,
  handleClose,
  children,
}) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{ outline: "none" }}
    >
      <Box
        sx={{
          ...style,
          outline: "none",
          "&:focus": { outline: "none" },
        }}
      >
        {children as React.ReactElement}
      </Box>
    </Modal>
  );
};
export default CustomModal;
