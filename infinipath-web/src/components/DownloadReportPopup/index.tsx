import { useState, useEffect } from "react";
import SideDrawerOverlay from "../SideOverLay";
import { Button as MuiButton } from "../components/Common/Button";
import styles from "./index.module.scss";
import DownloadPopup from "../../pages/DownloadPopUp";
import { Button } from "../../common/components/Button";
import Tooltip from "@mui/material/Tooltip";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { BUTTONLABELS, DOWNLOAD_MODE, REPORTS } from "../../constants/textConstants";

interface BulkIdProofOption {
  label: string;
  value: string;
  allocatedProgramId?: number;
  programId?: number;
  key?: string;
}

const DownloadReport = ({
  open,
  onClose,
  onContinue,
  totalRecords = 20,
  valueSelected,
  reportOptions = [],
  mode = DOWNLOAD_MODE.REPORT,
  onIdProofDownload,
}: {
  open: boolean;
  onClose: () => void;
  onContinue?: (reportName: string, selected?: string) => void;
  totalRecords?: number;
  valueSelected: string;
  reportOptions?: any[];
  mode?: typeof DOWNLOAD_MODE[keyof typeof DOWNLOAD_MODE];
  onIdProofDownload?: (option: BulkIdProofOption, folderName: string) => Promise<void>;
}) => {
  const filterResponse = useSelector((state: RootState) => state.ProgramReducer.filterConfigList);
  
  // Get options based on mode
  let options = reportOptions;
  if (mode === DOWNLOAD_MODE.REPORT && (reportOptions === undefined || reportOptions.length === 0)) {
    options = (filterResponse as any)?.data?.reports?.options || [];
  } else if (mode === DOWNLOAD_MODE.ID_PROOF) {
    options = (filterResponse as any)?.data?.bulkDownloadIdProofs || [];
  }

  const [selected, setSelected] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<BulkIdProofOption | null>(null);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelected("");
      setSelectedOption(null);
      setShowDownloadPopup(false);
      setIsDownloading(false);
    }
  }, [open]);

  const handleContinue = () => {
    setShowDownloadPopup(true);
  };

  const handleDownload = async (fileName: string) => {
    if (mode === DOWNLOAD_MODE.ID_PROOF && selectedOption && onIdProofDownload) {
      setIsDownloading(true);
      try {
        // Close popups immediately after initiating
        setShowDownloadPopup(false);
        onClose();
        // Pass only the base name
        onIdProofDownload(selectedOption, fileName).catch(() => {
          // Error handling done in parent component
        });
      } catch (error: any) {
        setIsDownloading(false);
        throw error;
      }
    } else if (mode === DOWNLOAD_MODE.REPORT && onContinue) {
      // Add .xlsx extension for reports
      onContinue(`${fileName}.xlsx`, selected);
      setShowDownloadPopup(false);
    }
  };

  return (
    <>
      <SideDrawerOverlay
        open={open}
        grayLine={true}
        onClose={onClose}
        headerText={mode === DOWNLOAD_MODE.ID_PROOF ? REPORTS.DOWNLOAD_ID_PROOFS : REPORTS.DOWNLOAD_REPORTS}
        footer={
          <>
            <MuiButton
              variant="outline"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isDownloading}
            >
              {BUTTONLABELS.CANCEL}
            </MuiButton>
            <Button
              buttonTextClassName={styles.saveButtonText}
              buttonClassName={styles.saveButton}
              onClick={handleContinue}
              disable={!selected}
            >
              {BUTTONLABELS.CONTINUE}
            </Button>
          </>
        }
      >
        <div>
          <p className={styles.downloadreportText}>
            {mode === DOWNLOAD_MODE.ID_PROOF
              ? REPORTS.SELECT_PROGRAM_FOLDER
              : valueSelected === "all"
              ? REPORTS.COMPLETE_LIST_NO_FILTERS
              : `${totalRecords} ${REPORTS.FILTERED_LIST_MESSAGE}`}
          </p>
          <div className={styles.optionsContainer}>
            {options.map((opt) => (
              <div
                className={styles.option}
                key={opt.code || opt.value}
                onClick={() => {
                  const optionValue = opt.code || opt.value;
                  setSelected(optionValue);
                  if (mode === DOWNLOAD_MODE.ID_PROOF) {
                    setSelectedOption(opt);
                  }
                }}
              >
                <input
                  type="radio"
                  checked={selected === (opt.code || opt.value)}
                  readOnly
                  className={styles.radio}
                />
                <span className={styles.optionText}>
                  <Tooltip title={opt.description || ""}arrow>
                    <span>{opt.label}</span>
                  </Tooltip>
                </span>
              </div>
            ))}
          </div>
        </div>
      </SideDrawerOverlay>
      {showDownloadPopup && selected && (
        <DownloadPopup
          open={showDownloadPopup}
          onClose={() => {
            setShowDownloadPopup(false);
            setIsDownloading(false);
          }}
          name={mode === DOWNLOAD_MODE.ID_PROOF ? selectedOption?.label || '' : selected}
          onDownload={handleDownload}
          reportOptions={options}
          mode={mode === DOWNLOAD_MODE.ID_PROOF ? DOWNLOAD_MODE.FOLDER : DOWNLOAD_MODE.REPORT}
          isDownloading={isDownloading}
        />
      )}
    </>
  );
};

export default DownloadReport;