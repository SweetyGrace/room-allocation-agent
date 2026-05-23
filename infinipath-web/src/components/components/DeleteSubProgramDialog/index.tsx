import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
  
} from "@mui/material";
import {Button }from "../../../common/components/Button";
import styles from "./index.module.scss";

interface DeleteSubProgramDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteSubProgramDialog = ({
  open,
  onClose,
  onConfirm,
}: DeleteSubProgramDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete sub-program</DialogTitle>
      <DialogContent sx={{ py: 1.5 }}>
        <Typography>
          Are you sure you want to delete this sub-program? This action cannot
          be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ gap: 1.5, p: 3 }}>
        <button className={styles.cancelText} onClick={onClose}>
                    cancel
                  </button>
        <Button
          type="button"
          buttonClassName={styles.buttonContainer}
          buttonTextClassName={styles.buttonText}
          datatestid="add-program-save-button"
          datatestidText="add-program-save"
          onClick={onConfirm}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteSubProgramDialog;
