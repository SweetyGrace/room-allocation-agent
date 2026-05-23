import { Dialog, DialogContent } from "@mui/material";
import styles from './index.module.scss';
import { ImagePreviewProps } from "../../../types/image-preview-info";



const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, altText  , setOpen, isOpen , width, height }) => {

    return (
        <div className={styles.imagePreviewContainer}  onClick={(e) => e.stopPropagation()} >
            <Dialog
                open={isOpen}
                onClose={() => {
                    setOpen(false);
                }}
                maxWidth="md"
                fullWidth
                sx={{
                    "& .MuiPaper-root": {
                        width: "auto",
                        minWidth: "260px",
                        minHeight: "150px",
                    },
                    "& .MuiDialog-paper" : {
                        maxWidth: width,
                    }
                }}
            >
                <DialogContent className={styles.dialogueContainer} style={{height: height || 'auto'}}>
                    <img
                        src={imageUrl}
                        alt={altText}
                        className={styles.image}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ImagePreview;