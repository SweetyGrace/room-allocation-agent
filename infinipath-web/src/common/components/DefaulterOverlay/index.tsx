import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import SideDrawerOverlay from "../../../components/SideOverLay";
import { Button } from "../Button";
import UserCard from "../../../components/SeatApprovalFlow/SeekerDetailsOverlay/Common/UserCards";
import ConfirmationWithReason from "../ConfirmationWithReason";
import {
  markSeekerAsDefaulter,
  updateSeekerDefaulter,
} from "../../../services/registration";
import {
  ACTION_TYPE_LABELS,
  BUTTONLABELS,
  DEFAULTER_HEADING,
  ENTER_REASON_PLACEHOLDER,
  MAKE_DEFAULTER_QUESTIONS,
  UPDATE_DEFAULTER_QUESTIONS
} from "../../../constants/textConstants";
import { Seeker } from "../../../types/seatApproval";

interface DefaulterOverlayProps {
  open: boolean;
  onCancel: () => void;
  onUpdate: () => void;
  seekerData?: Seeker;
  isLoading?: boolean;
  isUpdateMode?: boolean;
  yesText?: string;
  noText?: string;
}

const DefaulterOverlay: React.FC<DefaulterOverlayProps> = ({
  open,
  onCancel,
  onUpdate,
  seekerData,
  isLoading = false,
  isUpdateMode = false
}) => {
  const [confirmValue, setConfirmValue] = useState<boolean | null>(null);
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const seekerId = seekerData?.user?.id  || seekerData?.userId as number;

  // Pre-fill data when in update mode
  useEffect(() => {
    if (isUpdateMode && seekerData) {
      const seekerRecord:Seeker = seekerData;
      setConfirmValue(seekerRecord?.isDefaulter as boolean);
      setReason(String(seekerRecord?.defaulterComment || ""));
      
    } else {
      // Reset form when not in update mode
      setConfirmValue(null);
      setReason("");
    }
  }, [isUpdateMode, seekerData, open]);

  const handleUpdate = async () => {
    if (!isFormValid || !seekerId || !seekerData) return;

    setIsSubmitting(true);
    try {
      const seekerRecord = seekerData as Seeker;
      const registrationId = Number(
        seekerRecord.registrationId || seekerRecord.id,
      );

      const payload = {
        registrationId,
        userId: seekerData?.userId as number,
        isDefaulter: confirmValue, // If updating, we're unmarking (false), if new, we're marking (true)
        comment: reason.trim(),
      };

      if (isUpdateMode) {
        // Use PUT endpoint for updates
        await updateSeekerDefaulter(seekerData?.userId as number, payload);
      } else {
        // Use POST endpoint for new defaulter marking
        await markSeekerAsDefaulter(payload);
      }

      onUpdate();
    } catch (error) {
      console.error(
        `Failed to ${isUpdateMode ? "update" : "mark"} defaulter:`,
        error,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = confirmValue || confirmValue === false;

  const footer = (
    <div className={styles.buttonRow}>
      <Button
        buttonTextClassName={styles.cancelButtonText}
        buttonClassName={styles.cancelButton}
        type="button"
        onClick={onCancel}
      >
        {BUTTONLABELS.CANCEL}
      </Button>

      <Button
        buttonTextClassName={styles.saveButtonText}
        buttonClassName={styles.saveButton}
        onClick={handleUpdate}
        disable={!isFormValid || isLoading || isSubmitting}
      >
        {isUpdateMode ? BUTTONLABELS.UPDATE : BUTTONLABELS.SUBMIT}
      </Button>
    </div>
  );

  return (
    <SideDrawerOverlay
      open={open}
      onClose={onCancel}
      grayLine={true}
      headerText={isUpdateMode ? DEFAULTER_HEADING : ACTION_TYPE_LABELS.MARK}
      footer={footer}
      className={styles.defaulterOverlay}
    >
      <div className={styles.container}>
        {seekerData && (
          <div className={styles.userCardSection}>
            <UserCard
              seeker={seekerData}
              user={seekerData}
              disablePreferences={true}
            />
          </div>
        )}
        {/* <GrayLine /> */}

        <ConfirmationWithReason
          questions={seekerData?.isDefaulter ? UPDATE_DEFAULTER_QUESTIONS : MAKE_DEFAULTER_QUESTIONS}
          confirmValue={confirmValue}
          onConfirmationChange={(value) => {
            setConfirmValue(value);
            setReason(value ? seekerData?.defaulterComment as string : "");
          }}
          reason={reason}
          onReasonChange={setReason}
          reasonPlaceholder={ENTER_REASON_PLACEHOLDER}
          isColumnLayout={seekerData?.isDefaulter}
        />
      </div>
    </SideDrawerOverlay>
  );
};

export default DefaulterOverlay;
