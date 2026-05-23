import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import { Button } from "../../../common/components/Button";
import NewDatePicker from "../NewDatePicker"; // Adjust import path as needed
import { downloadPdf } from "../../../utils/downloadPdf";
import { LOGIN_TEXT, textConstants, WARNING } from "../../../constants";
import ConfirmAlertPopup from "../ConfirmPopup";

interface MarkAsPaidCardProps {
  handleMarkAsPaid: () => void;
  sendInvoice?: boolean;
  sendPaymentLink?: boolean;
  setPaymentMarkDate?: (date: Date) => void;
  invoiceLink: string;
  disable?: boolean; // Optional prop to disable the button
  downloadedInvoiceFileName?: string;
}

const MarkAsPaidCard: React.FC<MarkAsPaidCardProps> = ({
  handleMarkAsPaid,
  sendInvoice,
  sendPaymentLink,
  setPaymentMarkDate,
  invoiceLink,
  downloadedInvoiceFileName,
  disable = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateError, setDateError] = useState<string>("");
  const [alert, setAlert] = useState<{
      open: boolean;
      message: string[];
      type: string;
      onConfirm?: () => void;
      onCancel?: () => void;
      confirmText?: string;
      cancelText?: string;
      onReupload?: () => void;
      title?: string;
      grayBorder?: boolean;
    }>({ open: false, message: [], type: "" });
  useEffect(() => {
    const dateString  = selectedDate.toISOString()
    setPaymentMarkDate && setPaymentMarkDate(new Date(dateString));
  }, [ ]);

  const handleDateChange = (date: Date | null) => {
    if (!date) {
      setDateError("Date is required");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date > today) {
      setDateError("Future dates are not allowed");
      return;
    }

    setDateError("");
    setSelectedDate(date);
    if (setPaymentMarkDate) {
      setPaymentMarkDate(date);
    }
  };

  return (
    <div className={styles.confirmCard}>
      {!sendInvoice && <div className={styles.invoiceLabel}>Payment date</div>}

      <div className={styles.fieldRow}>
        <div
          className={
            invoiceLink
              ? styles.markAsReceivedContainer
              : `${styles.markAsReceivedContainer} ${styles.fullWidth}`
          }
        >
          {!sendInvoice && (
            <div className={styles.dateField}>
              <NewDatePicker
                value={selectedDate}
                onChange={handleDateChange}
                maxDate={new Date()}
                disable={disable}
              />
              {dateError && <p className={styles.fieldError}>{dateError}</p>}
            </div>
          )}

          <Button
            buttonClassName={styles.buttonContainer}
            buttonTextClassName={styles.buttonContainer}
            type="submit"
            disable={disable && !sendInvoice}
            onClick={() => {
              if (!disable || sendInvoice) {
                if (sendInvoice) {
                  handleMarkAsPaid();
                } else {
                  setAlert({
                    open: true,
                    message: [
                     textConstants.paymentConfirmText,
                    ],
                    type: WARNING,
                    onConfirm: handleMarkAsPaid,
                    confirmText: LOGIN_TEXT.YES,
                    cancelText: LOGIN_TEXT.NO,
                    title: textConstants.confirmationTitle,
                    grayBorder: true,
                  });
                }
              }
            }}
          >
            {sendInvoice ? textConstants.resendInvoiceText : textConstants.markAsPaymentText}
          </Button>
        </div>
        {invoiceLink && (
          <Button
            buttonClassName={styles.buttonContainer}
            buttonTextClassName={styles.buttonContainer}
            type="button"
            onClick={async () => {
              downloadPdf(invoiceLink, downloadedInvoiceFileName);
            }}
          >
            download invoice
          </Button>
        )}
      </div>
      {alert.open && (
        <ConfirmAlertPopup
          type={alert.type}
          title={alert.title}
          message={alert.message}
          confirmText={alert?.confirmText ? alert.confirmText : ""}
          onConfirm={() => {
            alert?.onConfirm && alert.onConfirm();
            setAlert({ message: [], open: false, type: "" });
          }}
          cancelText={alert?.cancelText ? alert.cancelText : undefined}
          onCancel={() => {
            alert?.onCancel && alert.onCancel();
            setAlert({ message: [], open: false, type: "" });
          }}
          grayBorder={alert.grayBorder}
        />
      )}
    </div>
  );
};

export default MarkAsPaidCard;
