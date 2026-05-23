
import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import { getCall } from "../../../services/apiService";
import { endPoints } from "../../../constants/urlConstants";
import { ACTION_LABELS } from "../../../constants/textConstants";
import warningIcon from "../../../assets/images/WarningImg.svg";
import { EInvoiceErrorProps } from "../../../types/registration";
import { replaceUnderscoresWithSpaces } from "../../../utils/commonFunctions";


const EInvoiceError: React.FC<EInvoiceErrorProps> = ({ registrationId, refreshTrigger }) => {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const fetchErrorMessage = async () => {
      try {
        const response = await getCall(
          endPoints.einvoice_errors(registrationId),
        );

        if (response?.data?.data?.errorMessage) {
          setErrorMessage(response.data.data.errorMessage);
          setHasError(true);
        } else {
          setHasError(false);
        }
      } catch (err) {
        console.error("Failed to fetch E-invoice error:", err);
        setHasError(false);
      }
    };

    if (registrationId) {
      fetchErrorMessage();
    }
  }, [registrationId, refreshTrigger]);

  if (!hasError) {
    return null;
  }

  return (
    <div className={styles.confirmCard}>
      <div className={styles.errorContainer}>
        <div className={styles.headerRow}>
          <img src={warningIcon} alt="Warning" className={styles.warningIcon} />
          <div className={styles.invoiceLabel}>{ACTION_LABELS.EINVOICE_FAILED}</div>
        </div>
        <div className={styles.errorMessage}>{replaceUnderscoresWithSpaces(errorMessage)}</div>
      </div>
    </div>
  );
};

export default EInvoiceError;
