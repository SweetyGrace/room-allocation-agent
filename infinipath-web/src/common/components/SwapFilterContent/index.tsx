// SwapSelector.tsx
import React, { useState } from "react";
import styles from "./index.module.scss";
import SideDrawerOverlay from "../../../components/SideOverLay";
import { Button } from "../../../common/components/Button";
import { postCall, putCall } from "../../../services/apiService";
import UserCard from "../../../components/SeatApprovalFlow/SeekerDetailsOverlay/Common/UserCards";
import CustomCheckbox from "../CustomCheckBox";
import { PORTAL } from "../../../constants/urlConstants";
import { CANCEL_SWAP, ENTER_REASON_PLACEHOLDER } from "../../../constants/textConstants";
import ConfirmationWithReason from "../ConfirmationWithReason";

export interface SwapData {
  id?:number;
  swapType: "wants_swap" | "can_shift" | null;
  selectedPrograms: number[];
  reason: string;
}

interface SwapSelectorProps {
  open: boolean;
  swapTypeOptions: Array<{ value: "wants_swap" | "can_shift"; label: string }>;
  programOptions: Array<{ value: number; label: string; disabled?: boolean }>;
  initialData?: Partial<SwapData>;
  onUpdate: (data: SwapData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  seekerId?: number; // Optional seekerId prop
  seekerData?: unknown; // Optional seekerData prop
  disablePreferences?: boolean; // Optional prop to disable preferences
}

const SwapSelector: React.FC<SwapSelectorProps> = ({
  swapTypeOptions,
  programOptions,
  initialData,
  onUpdate,
  onCancel,
  isLoading = false,
  seekerId,
  open,
  seekerData,
  disablePreferences,
}) => {
  //these states were for confirmation with reason component it will be used later
    // const [confirmValue, setConfirmValue] = useState<string>("");
    // const [reasoning, setReasoning] = useState<string>("");
  const [swapType, setSwapType] = useState<"wants_swap" | "can_shift" | null>(
    initialData?.swapType || null,
  );
  const [selectedPrograms, setSelectedPrograms] = useState<number[]>(
    initialData?.selectedPrograms || [],
  );
  const [reason, setReason] = useState<string>(initialData?.reason || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProgramToggle = (programId: number) => {
    setSelectedPrograms((prev) =>
      prev.includes(programId)
        ? prev.filter((id) => id !== programId)
        : [...prev, programId],
    );
  };

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
    if(!initialData?.id){
      const payload = {
        programRegistrationId:
          seekerId !== undefined && seekerId !== null ? Number(seekerId) : 0,
        type: swapType ?? "",
        comment: reason,
        targetPrograms: selectedPrograms.map((id) => ({ id })),
      };
      await postCall("program-registration/swap", payload, PORTAL);
      onUpdate(payload as any);
    }
    else
    {
      const payload = {
        action: CANCEL_SWAP.ACTIONS.EDIT,
        type: swapType ?? "",
        comment: reason,
        targetPrograms: selectedPrograms.map((id) => ({ id })),
      }
      await putCall(`program-registration/swap/${initialData?.id}/action`,payload);
      onUpdate(payload as any);
    };
    } catch (e) {
      alert("failed");
    }
    setIsSubmitting(false);
  };

  const isFormValid =
    swapType && selectedPrograms.length > 0 && reason.trim().length > 0;

  return (
    <SideDrawerOverlay
      open={open}
      onClose={onCancel}
      grayLine={true}
      headerText="Swap seeker"
      footer={
        <div className={styles.buttonRow}>
          <Button
            buttonTextClassName={styles.cancelButtonText}
            buttonClassName={styles.cancelButton}
            type="button"
            onClick={onCancel}
          >
            cancel
          </Button>

          <Button
            buttonTextClassName={styles.saveButtonText}
            buttonClassName={styles.saveButton}
            onClick={handleUpdate}
            disable={!isFormValid || isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? "updating" : "update"}
          </Button>
        </div>
      }
    >
      <div>
        <div className={styles.section}>
          {seekerData && (
            <UserCard seeker={seekerData} disablePreferences={true} />
          )}
          <h3 className={styles.sectionTitle}>Choose swap type</h3>
          <div className={styles.radioGroup}>
            {swapTypeOptions.map((option) => (
              <label key={option.value} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="swapType"
                  value={option.value}
                  checked={swapType === option.value}
                  onChange={(e) =>
                    setSwapType(e.target.value as "wants_swap" | "can_shift")
                  }
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Select programs to swap</h3>
          <div className={styles.radioGroups}>
            {programOptions.map((option) => (
              <CustomCheckbox
                key={option.value}
                text={option.label}
                checked={selectedPrograms.includes(option.value)}
                onChange={() =>
                  !option.disabled && handleProgramToggle(option.value)
                }
                diffStyles={true}
                disable={option.disabled }
                disableWithDate = {option.isSessionStartingSoon}
              />
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            Reason
          </h3>{" "}
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={styles.textarea}
            placeholder={ENTER_REASON_PLACEHOLDER}
            rows={4}
          />
        </div>
        {/* This will be used later */}
         {/* <ConfirmationWithReason
          question={MAKE_DEFAULTER_QUESTION}
          confirmValue={confirmValue}
          onConfirmationChange={(value)=>{
            setConfirmValue(value);
            value && setReasoning(seekerData?.defaulterComment || "");
          }}
          reason={reasoning}
          onReasonChange={setReasoning}
          reasonPlaceholder={ENTER_REASON_PLACEHOLDER}
          showReason={confirmValue === textConstant.YES_TEXT}
        /> */}
      </div>
    </SideDrawerOverlay>
  );
};

export default SwapSelector;
