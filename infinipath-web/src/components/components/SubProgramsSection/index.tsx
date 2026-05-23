import { useRef, useEffect, useState } from "react";
import { Paper, Typography, Box } from "@mui/material";
import { Add } from "@mui/icons-material";
import SubProgramCard from "../SubProgramCard";
import { CurrencyOption, SubProgram } from "../../../types/program";
import styles from "./index.module.scss";
import { useFieldArray, Controller } from "react-hook-form";
import { Button } from "../../../common/components/Button";
import DeleteSubProgramDialog from "../DeleteSubProgramDialog";
import {
  PROGRAM_DETAILS_FORM_TEXT,
  FORM_FIELD_NAMES,
  SUB_PROGRAM_TEXT
} from "../../../constants/textConstants";

interface SubProgramsSectionProps {
  control: any;
  setValue: (name: string, value: any) => void;
  watch: any;
  errors: any;
  getValues: any;
  programType: any;
  modeOfProgram?: string;
  startDate: Date | null;
  endDate: Date | null;
  venueOptions: string[];
  currencyOptions: any[];
  isDateWithinProgramRange: (date: Date) => boolean;
  subPrograms: any[];
  onAddSubProgram: () => void;
  onSubProgramChange: (id: string, field: string, value: any) => void;
  onSubProgramVenueChange: (id: string, value: string[]) => void;
  onDeleteSubProgram: (id: string) => void;
  subProgramDateRanges: { [key: string]: [Date | null, Date | null] };
  onSubProgramDateRangeChange: (
    id: string,
    startDate: Date | null,
    endDate: Date | null,
  ) => void;
  getSubProgramDateRange: (id: string) => [Date | null, Date | null];
  setSubProgramDateRange: (
    id: string,
    dateRange: [Date | null, Date | null],
  ) => void;
  existingSubPrograms?: any[];
  isEditMode?: boolean;
  trigger: any;
  onSubProgramBannerUpload?: (subProgramId: string, imageUrl: string) => void;
  noOfSession?: number;
  isGroupProgram?: boolean; // Optional prop to indicate if it's a group program
  programTypeNameFromSource?: string; // Optional prop to get program type name from source
  isPublished?: boolean; // Optional prop to indicate if program is published
}

const SubProgramsSection = ({
  control,
  setValue,
  watch,
  errors,
  getValues,
  programType,
  modeOfProgram = "online",
  startDate,
  endDate,
  venueOptions,
  currencyOptions,
  isDateWithinProgramRange,
  onDeleteSubProgram,
  subProgramDateRanges,
  onSubProgramDateRangeChange,
  getSubProgramDateRange,
  setSubProgramDateRange,
  existingSubPrograms = [],
  isEditMode = false,
  trigger,
  onSubProgramBannerUpload,
  noOfSession,
  isGroupProgram,
  programTypeNameFromSource,
  isPublished = false,
}: SubProgramsSectionProps) => {
  const subProgramRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { fields, append, remove } = useFieldArray({
    control,
    name: "subPrograms",
  });
  // Remove the conflicting initialization logic
  // Let the parent component handle all initialization via reset()

  useEffect(() => {
    if (noOfSession && fields.length === 0 && !isEditMode) {
      const parentMode = watch("modeOfProgram") || modeOfProgram;
      const parentCurrency = watch("currency") || "INR";
      const parentPaymentRequired = watch("isPaymentRequired") || "no";

      const newSubProgram = {
        title: "",
        description: "",
        startDate: null,
        endDate: null,
        modeOfProgram: parentMode,
        venueAddress: [],
        hasSeatLimit: programType?.maxCapacity > 0 ? "yes" : "no",
        seatLimit: programType?.maxCapacity?.toString() || "",
        hasWaitlist: programType?.waitlistApplicable ? "yes" : "no",
        waitlistTriggerCount:
          programType?.waitlistTriggerCount?.toString() || "",
        isPaymentRequired: parentPaymentRequired,
        currency: parentCurrency,
        programFee: watch("programFee") || "",
        isActive: true,
      };

      for (let i = 0; i < noOfSession; i++) {
        append({ ...newSubProgram });
      }
    }
  }, [noOfSession, append, fields.length, programType, watch, isEditMode]);

  const handleAddSubProgram = () => {
    const parentMode = watch("modeOfProgram") || modeOfProgram;
    const parentCurrency = watch("currency") || "INR";
    const parentPaymentRequired = watch("isPaymentRequired") || "no";

    const newSubProgram = {
      title: "",
      description: "",
      startDate: null,
      endDate: null,
      modeOfProgram: parentMode,
      venueAddress: [],
      hasSeatLimit: programType?.maxCapacity > 0 ? "yes" : "no",
      seatLimit: programType?.maxCapacity?.toString() || "",
      hasWaitlist: programType?.waitlistApplicable ? "yes" : "no",
      waitlistTriggerCount: programType?.waitlistTriggerCount?.toString() || "",
      isPaymentRequired: parentPaymentRequired,
      currency: parentCurrency,
      programFee: watch("programFee") || "",
      isActive: true,
    };

    const count = noOfSession || 1;

    for (let i = 0; i < count; i++) {
      append({ ...newSubProgram });
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // underscore for private field
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null); // underscore for private field
  const handleRemoveSubProgram = (index: number) => {
    setDeleteIndex(index);
    setDeleteDialogOpen(true);
  };
  const handleConfirmDelete = () => {
    if (deleteIndex !== null) {
      remove(deleteIndex);
      if (onDeleteSubProgram) {
        onDeleteSubProgram(deleteIndex.toString());
      }
    }
    setDeleteDialogOpen(false);
    setDeleteIndex(null);
  };

  // Cancel delete: just close dialog
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeleteIndex(null);
  };

  const handleSubProgramDateChange = (index: number) => {
    return (startDate: Date | null, endDate: Date | null) => {
      setValue(`subPrograms.${index}.startDate`, startDate);
      setValue(`subPrograms.${index}.endDate`, endDate);

      // Call parent handler if provided
      if (onSubProgramDateRangeChange) {
        onSubProgramDateRangeChange(index.toString(), startDate, endDate);
      }
    };
  };

  const handleSubProgramFieldChange = (
    index: number,
    field: string,
    value: any,
  ) => {
    setValue(`subPrograms.${index}.${field}`, value);
    // When end time/date of sub-program N changes, re-validate start time of sub-program N+1
    if ((field === FORM_FIELD_NAMES.PROGRAM_END_TIME || field === FORM_FIELD_NAMES.PROGRAM_END_DATE) && index + 1 < fields.length) {
      trigger(`subPrograms.${index + 1}.${FORM_FIELD_NAMES.PROGRAM_START_TIME}`);
    }
  };

  const handleSubProgramVenueChangeLocal = (index: number, value: string[]) => {
    setValue(`subPrograms.${index}.venueAddress`, value);
  };

  const handleSubProgramBannerUpload = (
    subProgramId: string,
    imageUrl: string,
  ) => {

    // Update the specific subProgram's bannerImageUrl in form data
    const subProgramIndex = fields.findIndex(
      (field) => field.id === subProgramId,
    );
    if (subProgramIndex !== -1) {
      setValue(`subPrograms.${subProgramIndex}.bannerImageUrl`, imageUrl);
    }

    // Call parent handler if provided
    if (onSubProgramBannerUpload) {
      onSubProgramBannerUpload(subProgramId, imageUrl);
    }
  };
  return (
    <div className={styles.formContainer}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4, alignItems: "center" }}>
        <div className={styles.subSessionHeading}>{SUB_PROGRAM_TEXT.SCHEDULER.HEADING}</div>
        {isPublished && (
          <Button
            type="button"
            buttonClassName={styles.addSessionButton}
            onClick={handleAddSubProgram}
          >
            {PROGRAM_DETAILS_FORM_TEXT.UI.ADD_SESSION}
          </Button>
        )}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {fields.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              color: "text.secondary",
            }}
          >
            <Typography variant="body1">
              {isEditMode
                ? SUB_PROGRAM_TEXT.SCHEDULER.NO_SESSIONS_AVAILABLE
                : SUB_PROGRAM_TEXT.SCHEDULER.NO_SESSIONS_ADDED}
            </Typography>
          </Box>
        )}

        {fields.map((field, index) => (
          <SubProgramCard
            key={field.id}
            control={control}
            index={index}
            watch={watch}
            setValue={setValue}
            errors={errors?.subPrograms?.[index]}
            onRemove={() => handleRemoveSubProgram(index)}
            venueOptions={venueOptions}
            onSubProgramBannerUpload={handleSubProgramBannerUpload}
            // Always use bannerImageUrl for the uploaded banner
            bannerImageUrl={field?.bannerImageUrl || null}
            isDateWithinProgramRange={isDateWithinProgramRange}
            currencyOptions={currencyOptions}
            programType={programType}
            startDate={startDate}
            endDate={endDate}
            trigger={trigger}
            onDateChange={handleSubProgramDateChange(index)}
            prevSubProgramEndDate={
              index > 0
                ? watch(`subPrograms.${index - 1}.${FORM_FIELD_NAMES.PROGRAM_END_DATE}`) || null
                : null
            }
            prevSubProgramEndTime={
              index > 0
                ? watch(`subPrograms.${index - 1}.${FORM_FIELD_NAMES.PROGRAM_END_TIME}`) || null
                : null
            }
            onFieldChange={(field: string, value: any) =>
              handleSubProgramFieldChange(index, field, value)
            }
            onVenueChange={(value: string[]) =>
              handleSubProgramVenueChangeLocal(index, value)
            }
            dateRange={
              getSubProgramDateRange
                ? getSubProgramDateRange(index.toString())
                : [null, null]
            }
            fieldlength={fields.length}
            subProgram={field as SubProgram}
            programTypeNameFromSource={programTypeNameFromSource}
            isPublished={isPublished}
          />
        ))}
      </Box>
      <DeleteSubProgramDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default SubProgramsSection;
