import { set } from "date-fns";
import ProgramPreference from "../../../components/ProgramPreference";
import {
  ProgramDetails,
  ProgramQuestionMap,
  UploadSlot,
} from "../../../pages/Registration";
import CustomDropDown from "../CustomDropDown";
import BirthDatePicker from "../DatePicker";
import CommonDateTimePicker from "../DateTimePicker"; // Adjust the path if needed
import styles from "./index.module.scss";
import React, { useEffect, useRef, useState } from "react";
import { Select, MenuItem, Avatar } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { Controller } from "react-hook-form";
import VideoRecorder from "../VideoUpload";
import ProfileAddImg from "../../../assets/images/ProfileAdd.svg";
import PenEditIcon from "../../../assets/images/EditPen.svg";
import {
  Select as SelectTag,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../Select";
import DatePicker from "../CustomDatePicker2";
import { getPrice } from "../../../utils/registrationUtils";
interface RenderFieldProps {
  pqm: ProgramQuestionMap;
  formData: Record<string, any>;
  errors: Record<string, string>;
  handleFieldChange: (questionId: number, value: any) => void;
  programDetails: ProgramDetails;
  addedclassName?: string;
  setFormData?: (data: Record<string, any>) => void;
  trigger: (...args: any[]) => void;
  handleMeetingDateChange: (date: Date | null) => void;
  handleTriggerValidation: () => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  resetUpload?: number; // New prop for resetting upload
  totalData?: any;
  basePrice?: string; // New prop for base price
  userStatus: any;
}

const mahatriaChoiceProgram = {
  id: "mahatria_choice",
  name: "Mahatria Choice",
  duration: "",
  dates: "",
};

const RenderField: React.FC<RenderFieldProps> = ({
  pqm,
  formData,
  errors,
  handleFieldChange,
  programDetails,
  addedclassName = "",
  setFormData = () => {},
  resetUpload = 0, // default value
  totalData,
  basePrice,
  userStatus,
}) => {
  if (formData == undefined) {
    return null;
  }

  const [selectedQuestionId, setSelectedQuestionId] = React.useState<
    number | null
  >(null);
  const previousQuestionIdRef = React.useRef<number | null>(null);
  const prevDependencySatisfiedRef = React.useRef<boolean | null>(null);
  const [previouslyOpenedVideoRef, setPreviouslyOpenedVideoRef] =
    useState<string>("");
  const [openRecorderForVideo, setOpenRecorderForVideo] =
    useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Only update if selectedQuestionId changed and is different from previous
    if (
      selectedQuestionId !== null &&
      selectedQuestionId !== previousQuestionIdRef.current
    ) {
      previousQuestionIdRef.current = selectedQuestionId;
      setFormData((prevData) => ({
        ...prevData,
        [selectedQuestionId]: "",
      }));
    }
  }, [selectedQuestionId, setFormData]);

  const [recordedVideoBlob, setRecordedVideoBlob] = React.useState<Blob | null>(
    null,
  );
  const [isValid, setIsValid] = React.useState<boolean>(false);
  const [localFile, setLocalFile] = React.useState<File | null>(null);

  // Reset localFile when resetUpload changes
  useEffect(() => {
    setLocalFile(null);
  }, [resetUpload]);

  const areDependenciesSatisfied = (question: any, formData: any) => {
    if (!question.config.dependsOn || question.config.dependsOn.length === 0) {
      return true;
    }

    return question.config.dependsOn.some((dep) => {
      if (dep.value === "notNull") {
        return (
          formData[dep.questionId] != undefined &&
          formData[dep.questionId] != null &&
          formData[dep.questionId] != ""
        );
      } else {
        const isMatch = formData[dep.questionId] === dep.value;
        if (!isMatch) {
          // Only set if it's different

          if (selectedQuestionId !== question.id) {
            setSelectedQuestionId(question.id);
          }
        }
        return isMatch;
      }
    });
  };

  // New useEffect to handle dependency changes and reset dependent field values
  React.useEffect(() => {
    const { question } = pqm;
    const isDependencySatisfied = areDependenciesSatisfied(question, formData);

    // Check if dependency satisfaction status changed
    if (
      prevDependencySatisfiedRef.current !== null &&
      prevDependencySatisfiedRef.current !== isDependencySatisfied
    ) {
      // If dependency is no longer satisfied, reset the field value
      if (!isDependencySatisfied && formData[question.id]) {
        handleFieldChange(question.id, "");

        // Also reset any nested dependent fields
        resetNestedDependentFields(question.id, formData, handleFieldChange);
      }
    }
    if (
      question.config.isDisable &&
      question.config.isDefaultValue &&
      isDependencySatisfied &&
      basePrice
    ) {
      handleFieldChange(question.id, basePrice);
    }

    //   // Handle prefill logic
    if (
      question.config?.prefill &&
      question.config.prefill.prefillIf &&
      question.config.prefill.prefillFrom
    ) {
      const shouldPrefill = question.config.prefill.prefillIf.some(
        (cond: any) => {
          if (
            totalData[2] &&
            totalData[2][cond.questionId] != null &&
            totalData[2][cond.questionId] != undefined
          ) {
            return totalData[2][cond.questionId] == cond.value;
          }
        },
      );
      if (
        (totalData[1] &&
          totalData[1][question.config.prefill.prefillFrom] != null) ||
        totalData[1][question.config.prefill.prefillFrom] !== undefined
      ) {
        const prefillValue = totalData[1][question.config.prefill.prefillFrom];
        // Only prefill if the condition is met and the current value is empty
        if (
          shouldPrefill &&
          prefillValue !== undefined &&
          value !== prefillValue
        ) {
          handleFieldChange(question.id, prefillValue);
        }
      }
    }

    // Update the previous dependency satisfaction status
    prevDependencySatisfiedRef.current = isDependencySatisfied;
  }, [formData, pqm, handleFieldChange]);

  // Helper function to reset nested dependent fields
  const resetNestedDependentFields = (
    parentQuestionId: number,
    currentFormData: Record<string, any>,
    fieldChangeHandler: (questionId: number, value: any) => void,
  ) => {
    //write reset code if needed
  };
  const { question } = pqm;
  const value = formData[question.id] || "";
  const error = errors[question.id];
  const inputClasses = `${styles.fieldInput} ${error ? styles.fieldInputError : ""} ${question.type == "select" ? styles.textTransform : ""}`;

  // Check if dependencies are satisfied before rendering
  if (!areDependenciesSatisfied(question, formData)) {
    return null;
  }

  switch (question.type) {
    case "draganddrop":
      return (
        <div className={styles.programPreferenceContainer}>
          <ProgramPreference
            availablePrograms={
              programDetails.type?.isGroupedProgram
                ? programDetails.groupedPrograms
                : programDetails?.sessions
            }
            maxPreferences={
              programDetails.type?.isGroupedProgram
                ? programDetails.groupedPrograms.length
                : programDetails?.sessions?.length
            }
            onPreferencesChange={(pref) => {
              handleFieldChange(
                question.id,
                pref != null ? encodeURIComponent(JSON.stringify(pref)) : null,
              );
            }}
            question={question}
            mahatriaChoice={mahatriaChoiceProgram}
            addedclassName={addedclassName}
            value={value != "" ? JSON.parse(decodeURIComponent(value)) : null}
          />
          {error && <p className={styles.fieldError}>{error}</p>}
        </div>
      );
    case "Address":
    case "textarea":
      return (
        <div key={question.id} className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>{question.label}</label>
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(question.id, e.target.value)}
            className={`${inputClasses} ${styles.textArea}`}
          />
          {error && <p className={styles.fieldError}>{error}</p>}
        </div>
      );

    case "text":
    case "email":
    case "tel":
    case "number":
      return (
        <div key={question.id} className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>{question.label}</label>
          <input
            type={question.type}
            value={value}
            min={
              question.type === "number"
                ? question.bindingKey === "tdsAmount" ||
                  question.bindingKey === "chequeNo"
                  ? 1
                  : 0
                : undefined
            }
            onChange={(e) => {
              const val = e.target.value;
              if (
                question.type === "number" &&
                question.bindingKey === "tdsAmount"
              ) {
                // Always allow clearing the field
                if (val === "") {
                  handleFieldChange(question.id, val);
                  return;
                }
                // Only allow positive numbers (integer or decimal) >= 1
                const num = Number(val);
                if (!/^\d*\.?\d*$/.test(val) || isNaN(num) || num < 1) return;
                handleFieldChange(question.id, val);
                return;
              }
              // For other fields, just update as usual
              handleFieldChange(question.id, val);
            }}
            onKeyDown={(e) => {
              if (
                question.type === "number" &&
                question.bindingKey === "tdsAmount"
              ) {
                if (
                  e.key === "-" ||
                  e.key === "+" ||
                  e.key === "e" ||
                  e.key === "E"
                ) {
                  e.preventDefault();
                }
              }
            }}
            className={inputClasses}
            disabled={question.config?.isDisable || false}
          />
          {error && <p className={styles.fieldError}>{error}</p>}
        </div>
      );

    case "date":
      return (
        <div key={question.id} className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>{question.label}</label>
          <BirthDatePicker
            value={value}
            onChange={(date) => handleFieldChange(question.id, date)}
            config={question.config}
          />
          {error && <p className={styles.fieldError}>{error}</p>}
        </div>
      );

    case "select":
      return (
        <div key={question.id} className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>{question.label}</label>
          <CustomDropDown
            value={value}
            question={question}
            handleFieldChange={(id: string | number, val: string) =>
              handleFieldChange(Number(id), val)
            }
            inputClasses={inputClasses}
          />
          {error && <p className={styles.fieldError}>{error}</p>}
        </div>
      );

    case "apicall":
      return (
        <div key={question.id} className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>{question.label}</label>
          <Select
            className={inputClasses}
            id={`select-${question.id}`}
            value={value}
            // Generated by Copilot
            onChange={(e) =>
              handleFieldChange(String(question.id), e.target.value as string)
            }
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return (
                  <span style={{ color: "var(--gray-700)" }}>
                    Select {question.label}
                  </span>
                );
              }
              // Find the option name by id
              const selectedOption = question.questionOptionMaps.find(
                (optionMap) => String(optionMap.option.id) === String(selected),
              );
              return selectedOption ? selectedOption.option.name : "Lalitha";
            }}
            sx={{
              width: "100%",
              height: 48,
              padding: "0 0.75rem",
              border: "0.5px solid var(--gray-10)",
              borderRadius: "var(--border-radius-md)",
              fontSize: "16px",
              color: "var(--gray-700)",
              backgroundColor: "White",
              "&:hover": {
                backgroundColor: "transparent !important",
              },
              "&:focus": {
                outline: "none",
                borderColor: "var(--primary-blue)",
                boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
              },
              ".MuiSelect-select": {
                paddingTop: 6,
                paddingBottom: 6,
                color: "#051B46",
                fontWeight: 400,
                lineHeight: 1.2,
                display: "flex",
                alignItems: "center",
                paddingLeft: "0px",
              },
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--gray-300)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--gray-300)",
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 200,
                  borderRadius: "var(--border-radius-md)",
                  "& .MuiMenuItem-root:hover": {
                    backgroundColor: "var(--gray-300)",
                  },
                  "& .Mui-selected": {
                    backgroundColor: "var(--gray-300)",
                  },
                },
              },
            }}
          >
            <MenuItem value="" disabled>
              <p>Select {question.label}</p>
            </MenuItem>
            {question.questionOptionMaps.map((optionMap) => (
              <MenuItem
                key={optionMap.option.id}
                value={optionMap.option.id}
                sx={{
                  color: "#051B46",
                  fontSize: "16px",
                  fontWeight: 400,
                  fontFamily: "Noto Sans, sans-serif",
                }}
              >
                {optionMap.option.name}
              </MenuItem>
            ))}
          </Select>
          {error && <p className={styles.fieldError}>{error}</p>}
        </div>
      );

    case "file":
      if (question.config.filetype === "video") {
        return (
          <div key={question.id} className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>{question.label}</label>

            {formData[question.id] ? (
              <div className={styles.videoPreview}>
                <div className={styles.videoThumbnailContainer}>
                  <video
                    className={styles.videoThumbnail}
                    src={formData[question.id]}
                    controls
                  />
                  <button
                    className={styles.editVideo}
                    onClick={() => {
                      if (previouslyOpenedVideoRef === "finder") {
                        if (fileInputRef.current) {
                          fileInputRef.current.click();
                        }
                      } else if (previouslyOpenedVideoRef === "recorder") {
                        setOpenRecorderForVideo(true);
                      }
                    }}
                  >
                    {previouslyOpenedVideoRef === "finder" && (
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFieldChange(question.id, file);
                            setPreviouslyOpenedVideoRef("finder");
                          }
                        }}
                        style={{ display: "none" }}
                      ></input>
                    )}
                    {previouslyOpenedVideoRef === "recorder" && (
                      <div style={{ width: "1px", opacity: 0 }}>
                        <VideoRecorder
                          recordedVideoBlob={null}
                          setRecordedVideoBlob={setRecordedVideoBlob}
                          setIsValid={setIsValid}
                          onFileDataUpload={(file: Blob) => {
                            setPreviouslyOpenedVideoRef("recorder");
                            handleFieldChange(question.id, file);
                            setOpenRecorderForVideo(false);
                          }}
                          openVideoRecorder={openRecorderForVideo}
                        />
                      </div>
                    )}
                  </button>
                  <button
                    className={styles.deleteVideo}
                    onClick={() => {
                      handleFieldChange(question.id, null);
                    }}
                  ></button>
                </div>

                <div className={styles.videoDetails}></div>
              </div>
            ) : (
              <div className={styles.videoUploadContainer}>
                <div className={`${styles.uploadArea} ${styles.fileUpload}`}>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFieldChange(question.id, file);
                      }
                      setPreviouslyOpenedVideoRef("finder");
                    }}
                    className={styles.fileInput}
                    id={`banner-upload-${question.id}`}
                  />
                  <label
                    htmlFor={`banner-upload-${question.id}`}
                    className={styles.uploadLabel}
                    style={formData[question.id] ? { padding: 0 } : undefined}
                  >
                    <div className={styles.uploadContent}>
                      <p className={styles.uploadText}>
                        {formData[`${question.id}`]
                          ? formData[`${question.id}`]
                          : "upload file here"}
                      </p>
                      <p className={styles.uploadInstructions}>
                        Please upload your video in
                        <br />
                        MP4 or MOV format (max length: <br /> upto 111 secs).
                      </p>
                    </div>
                  </label>
                </div>
                <div className={styles.uploadOr}>
                  <div className={styles.verticalLine}></div>
                  <div>or</div>
                  <div className={styles.verticalLine}></div>
                </div>
                <div className={styles.videoRecorderContainer}>
                  <VideoRecorder
                    recordedVideoBlob={null}
                    setRecordedVideoBlob={setRecordedVideoBlob}
                    setIsValid={setIsValid}
                    onFileDataUpload={(file: Blob) => {
                      setPreviouslyOpenedVideoRef("recorder");
                      handleFieldChange(question.id, file);
                    }}
                  />
                </div>
              </div>
            )}
            {error && <p className={styles.fieldError}>{error}</p>}
          </div>
        );
      } else if (question.config.filetype === "profile") {
        return (
          <div key={question.id} className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>{question.label}</label>
            <div className={styles.profileUploadArea}>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                id={`profile-upload-${question.id}`}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFieldChange(question.id, file);
                  }
                }}
              />
              <label
                htmlFor={`profile-upload-${question.id}`}
                className={styles.profileUploadLabel}
              >
                <div className={styles.profileImageWrapper}>
                  <div className={styles.profileImage}>
                    <img
                      src={
                        formData[question.id]
                          ? formData[question.id]
                          : ProfileAddImg
                      }
                      alt="Profile"
                      // className={styles.profileImage}
                    />
                  </div>
                  {formData[question.id] && (
                    <img
                      src={PenEditIcon}
                      alt="Edit"
                      className={styles.penEditIcon}
                    />
                  )}
                </div>
              </label>
            </div>
            {error && <p className={styles.fieldError}>{error}</p>}
          </div>
        );
      } else {
        return (
          <div key={question.id} className={styles.fieldGroup}>
            <UploadSlot
              label={question.label}
              uploadedFile={formData[question.id]}
              onFileChange={(file: File) => {
                // setLocalFile(file);
                handleFieldChange(question.id, file);
              }}
              resetUpload={resetUpload} // Pass resetUpload to UploadSlot if needed
            />
            {/*  } */}
            {error && <p className={styles.fieldError}>{error}</p>}
          </div>
        );
      }

    case "radio":
      return (
        <div key={question.id} className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>{question.label}</label>
          <div className={styles.radioGroup}>
            {question.questionOptionMaps.map((optionMap) => (
              <>
                {getPrice(userStatus, formData, optionMap.option.name) && (
                  <div
                    key={optionMap.option.id}
                    className={styles.radioElement}
                  >
                    <input
                      type="radio"
                      name={question.bindingKey}
                      value={optionMap.option.name}
                      checked={value === optionMap.option.name}
                      onChange={(e) =>
                        handleFieldChange(question.id, e.target.value)
                      }
                      className={styles.radioInput}
                    />
                    <label
                      className={styles.radioLabel}
                      onClick={(e) =>
                        handleFieldChange(question.id, optionMap.option.name)
                      }
                    >
                      {optionMap.option.name}
                    </label>
                  </div>
                )}
              </>
            ))}
          </div>
          {error && <p className={styles.fieldError}>{error}</p>}
        </div>
      );

    case "checkbox":
      const checkboxValue = Array.isArray(value) ? value : value ? [value] : [];
      return (
        <div key={question.id} className={styles.fieldGroup}>
          <div className={styles.checkboxGroup}>
            {question.questionOptionMaps.map((optionMap) => (
              <label key={optionMap.option.id} className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  name={question.bindingKey}
                  value={optionMap.option.name}
                  checked={checkboxValue.includes(optionMap.option.name)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...checkboxValue, optionMap.option.name]
                      : checkboxValue.filter(
                          (v: string) => v !== optionMap.option.name,
                        );
                    handleFieldChange(question.id, newValue);
                  }}
                  className={styles.checkboxInput}
                />
                <span className={styles.fieldLabel}>{question.label}</span>
              </label>
            ))}
          </div>
          {error && <p className={styles.fieldError}>{error}</p>}
        </div>
      );

    case "dateandtime":
      return (
        <div className={styles.formRow}>
          <div className={styles.formRowContainer} data-testid="">
            <label className={styles.fieldLeftLabel}>{question.label}</label>
            <div className={styles.formFieldsContainer}>
              <div className={styles.timeFormFields}>
                <CommonDateTimePicker
                  type="date"
                  value={value}
                  onValueChange={(date) => {}}
                  startDate={new Date()}
                  borderRight={true}
                  errorExist={!!errors.meetingDate}
                  dataTestId="set-date"
                  className={styles.formFieldMeeting}
                />
              </div>

              {/* Meeting Start Time */}
              <div className={styles.timeFormFields}>
                <CommonDateTimePicker
                  type="time"
                  value={value}
                  onChange={(time) => {}}
                  errorExist={!!errors.meetingTime}
                  dataTestId="start-time-picker"
                  className={styles.formFieldMeeting}
                />
              </div>
            </div>
          </div>
        </div>
      );

    case "year": {
      const currentYear = new Date().getFullYear();
      const { minYear, maxYear, maxYearOffset, yearOffset }: any =
        question.config || {};
      let years: { value: string; label: string }[] = [];

      if (minYear === "current") {
        // For future years (current to current + 100)
        for (let y = currentYear + 100; y >= currentYear; y--) {
          years.push({
            value: `${y} - ${(y + 1).toString()}`,
            label: `${y} - ${(y + 1).toString()}`,
          });
        }
      } else if (maxYear === "current") {
        // For past years with offset
        const endYear = maxYearOffset
          ? currentYear + maxYearOffset
          : currentYear;
        const startYear = yearOffset ? yearOffset : currentYear - 100;

        for (let y = endYear; y >= startYear; y--) {
          const nextYear = y + 1;
          years.push({
            value: `${y} - ${nextYear.toString()}`,
            label: `${y} - ${nextYear.toString()}`,
          });
        }
      } else {
        // Default case
        const nextYear = currentYear + 1;
        years.push({
          value: `${currentYear} - ${nextYear.toString()}`,
          label: `${currentYear} - ${nextYear.toString()}`,
        });
      }

      return (
        <div key={question.id} className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>{question.label}</label>
          <SelectTag
            value={value}
            onValueChange={(val) => handleFieldChange(question.id, val)}
            matchTriggerWidth={true}
          >
            <SelectTrigger className={styles.selectTrigger}>
              <SelectValue
                placeholder="Select year"
                className={styles.selectValue}
              />
            </SelectTrigger>
            <SelectContent className={styles.selectContent}>
              {years.map((yearOption) => (
                <SelectItem
                  key={yearOption.value}
                  value={yearOption.value}
                  className={styles.selectItem}
                >
                  {yearOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectTag>
          {error && <p className={styles.fieldError}>{error}</p>}
        </div>
      );
    }

    default:
      return null;
  }
};

export default RenderField;
