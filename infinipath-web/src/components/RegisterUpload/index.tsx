import styles from "./index.module.scss";
import upload from "../../assets/images/room-upload.svg";
import UploadIcon from "../../common/components/uploadIconSvg";
interface RoomUploadProps {
  fileName?: string;
  handleCancelUpload: () => void;
  loading?: boolean;
  triggerFileInput: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => void;
}
const RoomUpload: React.FC<RoomUploadProps> = ({
  fileName,
  handleCancelUpload,
  triggerFileInput,
  loading,
}) => {
  return (
    <div className={styles.UploadContainer}>
      <div
        className={styles.svg_border}
        onClick={(event) => {
          event.stopPropagation();
          triggerFileInput(event);
        }}
      >
        <UploadIcon />
        <div className={styles.uploadIcon}>
          <img src={upload} />
        </div>
        <div className={styles.uploadContent}>
          <p>
            {/* Drag and drop or{' '} */}
            {fileName ? (
              <>
                <span className={styles.uploadLink}>{fileName}</span>
              </>
            ) : (
              <>
                <span className={styles.uploadLink}>upload file here</span>
              </>
            )}
          </p>
          {!fileName && <p>Please upload your file in XLSX</p>}
        </div>
      </div>
      {fileName && !loading && (
        <span
          className={styles.cancelLink}
          onClick={(event) => {
            event.stopPropagation();
            handleCancelUpload();
          }}
        >
          cancel upload
        </span>
      )}
    </div>
  );
};
export default RoomUpload;
