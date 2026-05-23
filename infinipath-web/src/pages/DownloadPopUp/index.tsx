import React, { useState, useEffect } from "react";
import { Modal } from "@mui/material";
import styles from "./index.module.scss";
import { Button } from "../../common/components/Button";
import { Button as MUI } from "../../components/components/ui/button";
import GrayLine from "../../common/components/GrayLine";
import downloadingReport from "../../assets/images/InfographicDownload.svg";
import { BUTTONLABELS, DOWNLOAD_MODE, REPORTS } from "../../constants/textConstants";
import { VALIDATION_REGEX, REPLACEMENT_STRINGS, replacePattern } from "../../utils/validationUtils";
interface DownloadPopupProps {
  open: boolean;
  onClose: () => void;
  name?: string;
  onDownload: (reportName: string) => void;
  reportOptions?: any[];
  mode?: typeof DOWNLOAD_MODE[keyof typeof DOWNLOAD_MODE];
  isDownloading?: boolean;
}

const DownloadPopup: React.FC<DownloadPopupProps> = ({
  open,
  onClose,
  name = '',
  onDownload,
  mode = DOWNLOAD_MODE.REPORT,
  isDownloading = false,
}) => {
  const [baseName, setBaseName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (name) {
      const cleanName = replacePattern(
        replacePattern(name, VALIDATION_REGEX.WHITESPACE, REPLACEMENT_STRINGS.EMPTY),
        VALIDATION_REGEX.NON_ALPHANUMERIC,
        REPLACEMENT_STRINGS.EMPTY
      );
      setBaseName(cleanName);
    } else {
      setBaseName(REPLACEMENT_STRINGS.EMPTY);
    }
    setError(REPLACEMENT_STRINGS.EMPTY);
  }, [name, mode]);

  const validateInput = () => {
    if (!baseName.trim()) {
      setError(mode === DOWNLOAD_MODE.FOLDER ? REPORTS.FOLDER_NAME_REQUIRED : REPORTS.REPORT_NAME_REQUIRED);
      return false;
    }
    if (mode === DOWNLOAD_MODE.FOLDER && !VALIDATION_REGEX.ALPHANUMERIC_WITH_HYPHENS.test(baseName)) {
      setError(REPORTS.ALPHANUMERIC_HYPHENS_ONLY);
      return false;
    }
    setError(REPLACEMENT_STRINGS.EMPTY);
    return true;
  };

  const handleInputChange = (value: string) => {
    if (mode === DOWNLOAD_MODE.REPORT) {
      setBaseName(replacePattern(value, VALIDATION_REGEX.XLSX_EXTENSION, REPLACEMENT_STRINGS.EMPTY));
    } else {
      // Strip .zip extension if user adds it
      setBaseName(replacePattern(value, VALIDATION_REGEX.ZIP_EXTENSION, REPLACEMENT_STRINGS.EMPTY));
      const cleanValue = replacePattern(value, VALIDATION_REGEX.ZIP_EXTENSION, REPLACEMENT_STRINGS.EMPTY);
      if (cleanValue && !VALIDATION_REGEX.ALPHANUMERIC_WITH_HYPHENS.test(cleanValue)) {
        setError(REPORTS.ALPHANUMERIC_HYPHENS_ONLY);
      } else {
        setError(REPLACEMENT_STRINGS.EMPTY);
      }
    }
  };

  const handleSave = async () => {
    if (validateInput()) {
      try {
        // Return just the base name without extension - parent will add it
        await onDownload(baseName);
      } catch (err: any) {
        setError(err.message || (mode === DOWNLOAD_MODE.FOLDER ? REPORTS.FAILED_DOWNLOAD_ID_PROOFS : REPORTS.FAILED_DOWNLOAD_REPORT));
      }
    }
  };

  return (
    <Modal open={open} onClose={isDownloading ? undefined : onClose}>
      <div className={styles.popupContainer} style={ { height: error ? 288 : 268 } }>
        <div className={styles.header}>
          <span className={styles.title}>
            <img src={downloadingReport} alt="downloading" />
            {mode === DOWNLOAD_MODE.FOLDER ? REPORTS.DOWNLOAD_ID_PROOFS : REPORTS.DOWNLOAD_REPORT}
          </span>
        </div>

        <div className={styles.divider}>
          <GrayLine />
        </div>

        {/* Input with or without fixed extension */}
        <div className={styles.optionsContainer}>
          <label className={`${styles.optionText} ${styles.labelText}`}>
            {mode === DOWNLOAD_MODE.FOLDER ? REPORTS.FOLDER_NAME : REPORTS.REPORTNAME}
          </label>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              value={baseName}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={mode === DOWNLOAD_MODE.FOLDER ? REPORTS.ENTER_FOLDER_NAME : REPORTS.ENTER_REPORT_NAME}
              disabled={isDownloading}
              className={`${styles.inputField} ${error ? styles.withError : styles.withoutError}`}
            />
            <span className={`${styles.extensionLabel} ${error ? styles.withError : styles.withoutError}`}>
              {mode === DOWNLOAD_MODE.FOLDER ? '.zip' : '.xlsx'}
            </span>
          </div>
          {error && <p className={styles.errorText}>{error}</p>}
        </div>

        <div className={styles.footer}>
          <MUI 
            variant="outlined" 
            className={styles.cancel} 
            onClick={onClose}
            disabled={isDownloading}
          >
            {BUTTONLABELS.CANCEL}
          </MUI>
          <Button
            onClick={handleSave}
            buttonClassName={styles.downloadBtn}
            disable={!baseName.trim() || !!error || isDownloading}
          >
            {isDownloading ? BUTTONLABELS.PROCESSING : BUTTONLABELS.DOWNLOAD}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DownloadPopup;
