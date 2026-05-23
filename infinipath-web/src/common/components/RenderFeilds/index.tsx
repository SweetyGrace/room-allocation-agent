import { ProgramQuestionMap } from "../../../components/RegisteredSeekerDetailsCards/types";
import CustomDropDown from "../CustomDropDownV2";
import {
  Select as SelectTag,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../CustomeSelect";
import BirthDatePicker from "../DatePicker";
import styles from "./index.module.scss";
import React, { useState, useRef, useEffect } from "react";
import { UploadSlot } from "../UploadSection";
import CommonDateTimePicker from "../DateTimePicker";
import parsePhoneNumberFromString from "libphonenumber-js";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { ADMIN_ROLES, disabledBindingKeys, ERROR_MESSAGES, ROLE_RESTRICTED_BINDING_KEYS } from "../../../constants";
import ProgramPreference from "../programPreference";
import { ProgramDetails } from "../../../types/seatApproval";
import { normalizeAadharValue, shouldShowOption } from "../../../utils/adminUtils";
import { getPrice, trimAndCapitalize } from "../../../pages/RegisteredSeekersDetails/service";
import { style } from "@mui/system";
import { getItemInLocalStorage } from "../../../services/localStorage";

interface RenderFieldProps {
  pqm: ProgramQuestionMap;
  formData: Record<string, any>;
  errors: Record<string, string>;
  handleFieldChange: (
    questionId: number,
    value: any,
    sectionName: string,
  ) => void;
  handleFieldBlur: (questionId: number, sectionName: string) => void;
  sectionName: string;
  rawData?: any;
  seekerDetails:any;
  sectionKey?:string;
  resetUpload?: number;
  heading?: string;
  programDetails?: ProgramDetails | null;
   manuallyChangedAirline?: string | null;
  setManuallyChangedAirline?: (value: string | null) => void;
}

const RenderField: React.FC<RenderFieldProps> = ({
  pqm,
  formData,
  errors,
  handleFieldChange,
  handleFieldBlur,
  sectionName,
  rawData,
  seekerDetails,
  sectionKey,
  resetUpload = 0,
  heading,
  programDetails,
 manuallyChangedAirline,
  setManuallyChangedAirline,
}) => {
const currentUserRole = getItemInLocalStorage("seekerDetails")?.role || "";

  if (formData == undefined) {
    return null;
  }

 
  
// Create a list of binding keys that should always be displayed
  const ALWAYS_VISIBLE_BINDING_KEYS = ['goodiesTshirtSize', 'goodiesJacketSize','ratriaPillarLocation'];

  const areDependenciesSatisfied = (question: any, formData: any) => {
  // Check if this question should always be visible (but may be disabled)
   if (ALWAYS_VISIBLE_BINDING_KEYS.includes(question.bindingKey)) {
    return true; // Always return true to show the field
  }

  if (
    !question.config.dependsOn ||
    question.config.dependsOn.length === 0 ||
    !formData
  ) {
    return true;
  }

  return question.config.dependsOn.some((dep: any) => {
    if (dep.value === "notNull") {
      return (
        formData[dep.questionId] != undefined &&
        formData[dep.questionId] != null &&
        formData[dep.questionId] != ""
      );
    } else {
      let isMatch = formData[dep.questionId] == dep.value;
      if (dep.operator) {
        isMatch = (dep.operator === "equals" && formData[dep.questionId] == dep.value) || 
                  (dep.operator === "greaterThan" && formData[dep.questionId] > dep.value);
      }
      return isMatch;
    }
  });
};
const isFieldDisabledBasedOnDependency = (question: any, formData: any): boolean => {
  // If no dependencies, field is enabled
  if (!question.config.dependsOn || question.config.dependsOn.length === 0) {
    return false;
  }

  // Check if ALL dependencies are satisfied
  const allDependenciesSatisfied = question.config.dependsOn.every((dep: any) => {
    if (dep.value === "notNull") {
      return (
        formData[dep.questionId] != undefined &&
        formData[dep.questionId] != null &&
        formData[dep.questionId] != ""
      );
    } else {
      let isMatch = formData[dep.questionId] == dep.value;
      if (dep.operator) {
        isMatch = (dep.operator === "equals" && formData[dep.questionId] == dep.value) || 
                  (dep.operator === "greaterThan" && formData[dep.questionId] > dep.value);
      }
      return isMatch;
    }
  });

  // If dependencies are NOT satisfied, field should be DISABLED
  return !allDependenciesSatisfied;
};

// Check if field should be disabled based on static prefill conditions
const isFieldDisabledByPrefill = (question: any, formData: any): boolean => {
  // Check if field has static prefill configuration
  if (
    !question.config?.prefill ||
    !(question.config.prefill as any).prefillIf ||
    question.config.prefill.prefillType !== "static"
  ) {
    return false;
  }

  // Check if prefill conditions are satisfied
  const shouldPrefill = (question.config.prefill as any).prefillIf.some((cond: any) => {
    const dependentValue = formData[cond.questionId];

    // Skip if dependent field has no value
    if (dependentValue == null || dependentValue == undefined) {
      return false;
    }

    // Handle different operators
    if (cond.operator === "not_equals") {
      return dependentValue != cond.value;
    } else if (cond.operator === "equals") {
      return dependentValue == cond.value;
    } else {
      // Default behavior if no operator specified
      return dependentValue == cond.value;
    }
  });

  return shouldPrefill;
};

  const disableRadioButtons = (name: string, qId: number) => {
    const originalValue = rawData?.find((item: any) => {
      return item?.questionId === qId;
    });
    if (originalValue?.answer?.includes("Online")) {
      return true;
    } else {
      return name?.includes("Online") ? true : false;
    }
  };

  // Track previous prefill state for EACH question separately (using questionId as key)
  const lastPrefillStateMap = useRef<Record<number, boolean>>({});
  const hasInitializedMap = useRef<Record<number, boolean>>({});

  // Add this useEffect to set default radio value
  useEffect(() => {
    const isRadioQuestion =
      pqm.question.bindingKey === "existingProformaInvoice";

    if (
      isRadioQuestion &&
      (formData[pqm.question.id] === undefined ||
        formData[pqm.question.id] === null ||
        formData[pqm.question.id] === "" ||
        formData[pqm.question.id] === "-")
    ) {
      handleFieldChange(pqm.question.id, "yes", sectionName);
    }
  }, []);

  // Handle static prefill values with clearing on state change (works for ALL fields)
  useEffect(() => {
    const { question } = pqm;
    const questionId = question.id;
    const prefillConfig = question.config?.prefill as any;
    
    // Early return if not a static prefill field
    if (
      !prefillConfig?.prefillIf ||
      prefillConfig.prefillType !== "static" ||
      !prefillConfig.prefillValue
    ) {
      return;
    }

    const shouldPrefill = isFieldDisabledByPrefill(question, formData);
    const currentValue = formData[questionId];
    const { prefillValue } = prefillConfig;
    
    // Initialize tracking on first run
    if (!hasInitializedMap.current[questionId]) {
      lastPrefillStateMap.current[questionId] = shouldPrefill;
      hasInitializedMap.current[questionId] = true;
      
      // Set prefill value only if conditions are met and field is empty
      if (shouldPrefill && !currentValue) {
        handleFieldChange(questionId, prefillValue, sectionName);
      }
      return;
    }
    
    const lastPrefillState = lastPrefillStateMap.current[questionId];
    // Handle state transitions
    if (lastPrefillState !== shouldPrefill) {
      if (shouldPrefill) {
        handleFieldChange(questionId, prefillValue, sectionName);
      } else if (currentValue) {
        handleFieldChange(questionId, "", sectionName);
      }
      
      // Update state tracker
      lastPrefillStateMap.current[questionId] = shouldPrefill;
    }
  }, [formData, pqm, sectionName]);

  const { question } = pqm;

  const mahatriaChoiceProgram = {
  id: "mahatria_choice",
  name: "Mahatria Choice",
  duration: "",
  dates: "",
};
  const value =
    formData[question.id] || '';
  // (heading === "Goodies" && question.label === "Note book"
  //   ? "yes"
  //   : heading === "Goodies" && (question.label === "Ratria pillar in leonia" || question.label === "Flask")
  //   ? "no"
  //   : "");
  useEffect(() => {
    if (
      question.type === "text" &&
      question.bindingKey === "travelInfoNumber" &&
      value
    ) {
      const updatedValue = normalizeAadharValue(value);
      if (updatedValue !== value) {
        handleFieldChange(question.id, updatedValue, sectionName);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, question.bindingKey]);
const prevAirlineRef = useRef<string | undefined>(undefined);
useEffect(() => {
  if (
    question?.config?.prefill?.prefillType !== "fieldDependent" ||
    !(question?.config?.prefill as any)?.prefillFrom || 
    !["airlineNameOnward", "airlineNameReturn"].includes((question?.config?.prefill as any)?.prefillFromBindingKey)
  ) {
    return;
  }

  const sourceValue = formData[(question?.config?.prefill as any)?.prefillFrom];
  const isInitialLoad = prevAirlineRef.current === undefined;
  const prefillBindingKey = (question?.config?.prefill as any)?.prefillFromBindingKey;
const isManualChange = manuallyChangedAirline === prefillBindingKey;
  if (isManualChange) {
    
    // Update ref
    prevAirlineRef.current = sourceValue;
    
    // Parse current value
    const parseValue = (val: string) => {
      if (!val || !val.includes('-')) return { prefix: '', userInput: val || '' };
      const parts = val.split('-');
      return { prefix: parts[0], userInput: parts.slice(1).join('-') };
    };
    
    const { userInput } = parseValue(value);
    
    // Handle manual airline change
    if (sourceValue === "OTHER") {
     // For OTHER, clear everything (user needs to enter fresh number)
      handleFieldChange(question.id, "", sectionName);
    } else if (sourceValue) {
      // For regular airlines, clear the number (user needs to re-enter/re-upload)
      handleFieldChange(question.id, `${sourceValue}-`, sectionName);
    } else {
      // No airline selected, clear everything
      handleFieldChange(question.id, "", sectionName);
    }
    
    return; 
  }

  
  const parseValue = (val: string) => {
    if (!val || !val.includes('-')) return { prefix: '', userInput: val || '' };
    const parts = val.split('-');
    return {
      prefix: parts[0],
      userInput: parts.slice(1).join('-').trim()
    };
  };

  const createPrefillValue = (airline: string, userInput: string) => {
    if (airline === "OTHER") {
      return userInput || "";
    }
    return userInput ? `${airline}-${userInput}` : `${airline}-`;
  };

  const { prefix: currentPrefix, userInput } = parseValue(value);
  const airlineChanged = prevAirlineRef.current !== undefined && prevAirlineRef.current !== sourceValue;
  
  // Better detection for upload cases
  const isNewUpload = sourceValue && value && 
    ((!value.includes('-') && value.includes(' ')) || 
     (!value.includes('-') && /^\d+$/.test(value.trim())) || 
     (sourceValue !== "OTHER" && currentPrefix !== sourceValue && value.includes('-')) || 
     (sourceValue !== "OTHER" && currentPrefix !== sourceValue && value.trim().startsWith(sourceValue)) || 
     (sourceValue === "OTHER" && value.trim().length > 0));
     
  const isSameAirlineNewUpload = !airlineChanged && isNewUpload;
  const isDifferentAirlineNewUpload = airlineChanged && isNewUpload;
  
  // Update ref BEFORE any changes
  prevAirlineRef.current = sourceValue;
  
  // Initial load with existing saved data
  if (isInitialLoad && value && sourceValue) {
    if (sourceValue === "OTHER" || currentPrefix === sourceValue) {
      return; 
    }
    const newPrefillValue = createPrefillValue(sourceValue, value);
    handleFieldChange(question.id, newPrefillValue, sectionName);
    return; 
  }
  
  // Initial load, no saved data, airline is selected
  if (isInitialLoad && !value && sourceValue) {
    return; // Don't prefill empty fields
  }

  // Handle same airline new upload
  if (isSameAirlineNewUpload) {
    const newPrefillValue = createPrefillValue(sourceValue, value);
    handleFieldChange(question.id, newPrefillValue, sectionName);
    return;
  }

  // Handle different airline new upload  
  if (isDifferentAirlineNewUpload) {
    const newPrefillValue = createPrefillValue(sourceValue, value);
    handleFieldChange(question.id, newPrefillValue, sectionName);
    return;
  }
  
  if (sourceValue === "OTHER" && value && isNewUpload) {
    handleFieldChange(question.id, value, sectionName);
    return;
  }

  // Handle regular airline change without upload (shouldn't happen often now)
  if (airlineChanged && sourceValue && !isNewUpload) {
    if (sourceValue === "OTHER") {
      handleFieldChange(question.id, value, sectionName);
    } else {
      const newPrefillValue = createPrefillValue(sourceValue, '');
      handleFieldChange(question.id, newPrefillValue, sectionName);
    }
    return;
  }
  
  if (!sourceValue && value) {
    handleFieldChange(question.id, "", sectionName);
  }
}, [formData[(question?.config?.prefill as any)?.prefillFrom], value, manuallyChangedAirline]);
  // Prefill logic for dateandtime fields
  const prefillValue = 
  // null;
    question?.config?.prefill?.prefillType === "programDependent"
      ? seekerDetails?.allocatedProgram?.[question?.config?.prefill?.prefillDateFrom || ""]
      : undefined;
  const [localFile, setLocalFile] = useState<File | null>(null);

  // Helper to check if field should be disabled
  const isFieldDisabled = disabledBindingKeys.includes(question.bindingKey) || 
                          question.config?.isDisable ||
                          (!ADMIN_ROLES.includes(currentUserRole) && ROLE_RESTRICTED_BINDING_KEYS.includes(question.bindingKey));
  

  // Phone number specific states
  const [phoneValue, setPhoneValue] = useState<string>("");
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  
  // Reset localFile when resetUpload changes (only visual reset)
  useEffect(() => {
    if (resetUpload > 0) {
      setLocalFile(null);
    }
  }, [resetUpload]);
  
  const error = errors[question.id];
  const inputClasses = `${styles.fieldInput} ${error ? styles.fieldInputError : ""} ${question.type == "select" ? styles.textTransform : ""}`;
  switch (question.type) {
    case "tel": {
      // Enhanced phone input with country code protection + validation
      const segregatePhoneNumber = value
        ? parsePhoneNumberFromString(value)
        : undefined;
      const initialCountryCode =
        segregatePhoneNumber?.countryCallingCode || "91";
      const [selectedCountryCode, setSelectedCountryCode] =
        useState(initialCountryCode);
      const [phoneValue, setPhoneValue] = useState(
        segregatePhoneNumber?.number || `+${initialCountryCode}`,
      );

      const [phoneError, setPhoneError] = useState<string | null>(null);

      useEffect(() => {
        if (segregatePhoneNumber?.countryCallingCode) {
          setSelectedCountryCode(segregatePhoneNumber.countryCallingCode);
        }
      }, [segregatePhoneNumber]);

      // Helper function to check if phone is empty (only has country code)
      const isPhoneEmpty = (inputPhoneNumber: string, countryCode: string) => {
        // Check if phone is empty or just country code (with or without plus)
        if (!inputPhoneNumber) return true;
        const normalizedPhone = inputPhoneNumber.replace(/[\s\-\(\)]/g, '');
        // Accept both "+91" and "91" as empty, as well as "+" and ""
        return (
          normalizedPhone === `+${countryCode}` ||
          normalizedPhone === countryCode ||
          normalizedPhone === '+' ||
          normalizedPhone === ''
        );
      };

      const validatePhone = (number: string) => {
        try {
          const parsed = parsePhoneNumberFromString(number || "");
          if (parsed && parsed.isValid()) {
            return null;
          } else {
            return ERROR_MESSAGES.INVALID_PHONE_COUNTRY;
          }
        } catch {
          return ERROR_MESSAGES.INVALID_PHONE_FORMAT;
        }
      };

      return (
        <div className={styles.fieldGroup} data-question-id={question.id}>
          <label className={styles.fieldLabel}>
            {question.label}
            {(question.config.isRequired == false ||
              question.config.isRequired == undefined ||
              question.config.isRequired == null) && (
              <span className={styles.optional}>(optional)</span>
            )}
          </label>

          <PhoneInput
            value={phoneValue}
            onChange={(updatedPhoneValue: string, countryData: any) => {
              if (
                countryData?.dialCode &&
                countryData.dialCode !== selectedCountryCode
              ) {
                //  Reset when country changes
                setSelectedCountryCode(countryData.dialCode);
                const newValue = `+${countryData.dialCode}`;
                setPhoneValue(newValue);
                handleFieldChange(question.id, "", sectionName);
                setPhoneError(null);
              } else {
                setPhoneValue(updatedPhoneValue);
                
                // Check if phone is empty (only country code)
                if (isPhoneEmpty(updatedPhoneValue, selectedCountryCode)) {
                  handleFieldChange(question.id, "", sectionName);
                  setPhoneError(null);
                } else {
                  // Has actual phone number
                  const valueToSet = updatedPhoneValue.startsWith("+")
                    ? updatedPhoneValue
                    : `+${updatedPhoneValue}`;
                  handleFieldChange(question.id, valueToSet, sectionName);
                }
              }
            }}
            inputStyle={{ width: "100%" }}
            onBlur={() => {
              const finalPhoneValue = phoneValue?.trim();
              
              // Check if phone is empty or just contains country code
              if (isPhoneEmpty(finalPhoneValue, selectedCountryCode)) {
                // Send empty string to backend
                handleFieldChange(question.id, "", sectionName);
                handleFieldBlur(question.id, sectionName);
                // Keep country code in UI for better UX
                setPhoneValue(`+${selectedCountryCode}`);
                setPhoneError(null);
              } else {
                const valueToSet = finalPhoneValue.startsWith("+")
                  ? finalPhoneValue
                  : `+${finalPhoneValue}`;
                handleFieldChange(question.id, valueToSet, sectionName);
                handleFieldBlur(question.id, sectionName);
              }
            }}
            containerClass={styles.loginCustomContainer}
            inputClass={`${styles.loginCustomInput} `}
            buttonClass={`${styles.loginCustomButton} ${styles.disabledButton}`}
            dropdownClass={styles.loginCustomDropdown}
            enableSearch={true}
            disableSearchIcon={true}
            disabled={question.bindingKey == "mobileNumber" ? true : false}
            countryCodeEditable={false}
            inputProps={{
              readOnly: false,
              ref: phoneInputRef,
              onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                const input = e.target as HTMLInputElement;
                const value = input.value;
                const cursorPosition = input.selectionStart || 0;
                const countryCodePattern = /^\+\d+\s?/;
                const match = value.match(countryCodePattern);
                const countryCodeEndPosition = match ? match[0].length : 0;
                if (
                  (e.key === "Backspace" || e.key === "Delete") &&
                  cursorPosition <= countryCodeEndPosition
                ) {
                  e.preventDefault();
                }
                if (e.key === "a" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  input.setSelectionRange(countryCodeEndPosition, value.length);
                }
              },
              onSelect: (e: React.SyntheticEvent<HTMLInputElement>) => {
                const input = e.target as HTMLInputElement;
                const value = input.value;
                const selectionStart = input.selectionStart || 0;
                const countryCodePattern = /^\+\d+\s?/;
                const match = value.match(countryCodePattern);
                const countryCodeEndPosition = match ? match[0].length : 0;
                if (selectionStart < countryCodeEndPosition) {
                  setTimeout(() => {
                    input.setSelectionRange(
                      countryCodeEndPosition,
                      input.selectionEnd || countryCodeEndPosition,
                    );
                  }, 0);
                }
              },
            }}
            data-testid="phone-input"
          />

          {/* Show validation error if phone number invalid */}
          {(phoneError || error) && (
            <p className={styles.fieldError}>{phoneError || error}</p>
          )}
        </div>
      );
    }
    case "apicall":
      const FoundEntry = question?.questionOptionMaps.find(
        (item: any) => item.option.id === Number(value),
      );
      let updatedVal = FoundEntry?.option?.name || value;

      if (!areDependenciesSatisfied(question, formData)) {
        return null; // Hide field if dependencies not satisfied (for non-always-visible fields)
      }

     // Check if this field should be disabled based on dependencies or prefill
     // eslint-disable-next-line no-case-declarations
     const isFieldDisable = ALWAYS_VISIBLE_BINDING_KEYS.includes(
       question.bindingKey,
     )
       ? isFieldDisabledBasedOnDependency(question, formData)
       : isFieldDisabledByPrefill(question, formData);

      return (
        <div key={question.id}className={
          (question.bindingKey === "travelInfoType")
            ? styles.fieldGroupOccupy
            : styles.fieldGroup} data-question-id={question.id}>
          <label className={styles.fieldLabel}>
            {question.label}
            {(question.config.isRequired == false ||
              question.config.isRequired == undefined ||
              question.config.isRequired == null) && (
              <span className={styles.optional}>(optional)</span>
            )}
          </label>
          <div  className={styles.dropdownWithClear}>
          <CustomDropDown
            value={updatedVal}
            question={question}
            handleFieldChange={(id: string | number, val: string) => {
              handleFieldChange(Number(id), val, sectionName);
            }}
            onBlur={() => handleFieldBlur(question.id, sectionName)}
            inputClasses={inputClasses}
            disabled={isFieldDisable}
          />
             {updatedVal && !isFieldDisable && (sectionKey === "FS_TRAVELPLAN" || sectionKey === "FS_GOODIES" ) && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={() => handleFieldChange(question.id, "", sectionName)}
          aria-label="Clear selection"
        >
          ×
        </button>
      )}
          </div>
          {error && <p className={styles.fieldError}>{error}</p>}
        </div>
      );
    case "textarea":
    case "Address":
      if (!areDependenciesSatisfied(question, formData)) return null;
      else {
        return (
          <div key={question.id} className={styles.fieldGroup} data-question-id={question.id}>
            <label className={styles.fieldLabel}>
              {question.label}
              {(question.config.isRequired == false ||
                question.config.isRequired == undefined ||
                question.config.isRequired == null) && (
                <span className={styles.optional}>(optional)</span>
              )}
            </label>
            <textarea
              // type={question.type}
              value={value}
              onChange={(e) =>
                handleFieldChange(
                  question.id,
                  e.target.value.trimStart(),
                  sectionName,
                )
              }
              onBlur={() => handleFieldBlur(question.id, sectionName)}
              disabled={isFieldDisabled}
              className={inputClasses}
              placeholder={`Enter ${question.label.toLowerCase()}`}
            />
            {error && <p className={styles.fieldError}>{error}</p>}
          </div>
        );
      }

    case "text":
    case "email":
    case "number":
      if (!areDependenciesSatisfied(question, formData)) return null;

      // Set default value for originalPayment if not already set
      let defaultValue = value;
      if (
        question.bindingKey === "originalPayment" &&
        !value &&
        seekerDetails
      ) {
        defaultValue = seekerDetails?.allocatedProgram?.basePrice;
        // Set the initial value in formData if it's not already set
        if (!formData[question.id]) {
          handleFieldChange(question.id, defaultValue, sectionName);
        }
      }

      return (
                <div key={question.id} className={styles.fieldGroup} data-question-id={question.id}>
          <label className={styles.fieldLabel}>
            {question.label}
            {(question.config.isRequired == false ||
              question.config.isRequired == undefined ||
              question.config.isRequired == null) && (
              <span className={styles.optional}>(optional)</span>
            )}
          </label>
          <input
            type={question.type}
            value={value || defaultValue || ""}
            onChange={(e) => {
              let val = e.target.value;

              // Remove spaces for travelInfoNumber
              if (
                question.type === "text" &&
                question.bindingKey === "travelInfoNumber"
              ) {
                if (val.includes(" ")) {
                  val = val.replace(/\s+/g, "");
                }
                handleFieldChange(question.id, val, sectionName);
                return;
              }
              if (
                question?.config?.prefill?.prefillType === "fieldDependent" &&
                (question?.config?.prefill as any)?.prefillFrom &&
                ["airlineNameOnward", "airlineNameReturn"].includes(
                  (question?.config?.prefill as any)?.prefillFromBindingKey,
                )
              ) {
                const sourceValue =
                  formData[(question?.config?.prefill as any)?.prefillFrom];
                if (
                  sourceValue &&
                  sourceValue !== "OTHER" &&
                  val.includes("-")
                ) {
                  const parts = val.split("-");
                  const expectedPrefix = parts[0];

                  if (expectedPrefix !== sourceValue) {
                    const userInput = parts.slice(1).join("-");
                    val = userInput
                      ? `${sourceValue}-${userInput}`
                      : `${sourceValue}-`;
                  }
                }
                handleFieldChange(question.id, val, sectionName);
                return;
              }
              // Handle TAN/GST number - trim and capitalize
              if (
                question.bindingKey === "tanNumber" ||
                question.bindingKey === "gstNumber" ||
                question.bindingKey === "proFormaGstNumber"
              ) {
                val = trimAndCapitalize(val);
              }

              // TDS Amount validation and recalculation
              if (question.bindingKey === "tdsAmount") {
                // Allow clearing the field
                if (val === "") {
                  handleFieldChange(question.id, val, sectionName);

                  // Recalculate originalPayment when TDS is cleared
                  if (seekerDetails?.questionResponses) {
                    const originalPaymentObj =
                      seekerDetails.questionResponses.find(
                        (qr: any) =>
                          qr.questionBindingKey === "originalPayment",
                      );

                    if (originalPaymentObj) {
                      const originalAmount =
                        Number(
                          seekerDetails?.paymentDetails?.[0]?.originalAmount,
                        ) || 0;
                      const gstAmount =
                        Number(seekerDetails?.paymentDetails?.[0]?.gstAmount) ||
                        0;
                      const calculatedOriginalPayment =
                        originalAmount + gstAmount;
                      handleFieldChange(
                        originalPaymentObj.questionId,
                        calculatedOriginalPayment,
                        sectionName,
                      );
                    }
                  }
                  return;
                }

                const num = Number(val);
                if (!/^\d*\.?\d*$/.test(val) || isNaN(num) || num < 1) return;

                handleFieldChange(question.id, val, sectionName);

                // Recalculate originalPayment with new TDS
                if (seekerDetails?.questionResponses) {
                  const originalPaymentObj =
                    seekerDetails.questionResponses.find(
                      (qr: any) => qr.questionBindingKey === "originalPayment",
                    );

                  if (originalPaymentObj) {
                    let originalAmount =
                      Number(
                        seekerDetails?.paymentDetails?.[0]?.originalAmount,
                      ) || 0;
                    const newTdsAmount = Number(val || 0);
                    const gstAmount =
                      Number(seekerDetails?.paymentDetails?.[0]?.gstAmount) ||
                      0;
                    const tdsApplicability =
                      seekerDetails?.allocatedProgram?.tdsApplicability;

                    if (tdsApplicability === "base_only") {
                      originalAmount =
                        originalAmount + gstAmount - newTdsAmount;
                    } else if (tdsApplicability === "base_plus_tax") {
                      originalAmount =
                        originalAmount -
                        newTdsAmount +
                        (gstAmount - newTdsAmount);
                    }

                    handleFieldChange(
                      originalPaymentObj.questionId,
                      originalAmount,
                      sectionName,
                    );
                  }
                }
                return;
              }

              // For originalPayment changes
              if (question.bindingKey === "originalPayment") {
                handleFieldChange(question.id, val.trimStart(), sectionName);
                return;
              }

              handleFieldChange(question.id, val.trimStart(), sectionName);
            }}
            onKeyDown={(e) => {
              // Prevent invalid characters for TDS amount
              if (question.bindingKey === "tdsAmount") {
                if (
                  e.key === "-" ||
                  e.key === "+" ||
                  e.key === "e" ||
                  e.key === "E"
                ) {
                  e.preventDefault();
                }
              }

              if (
                question?.config?.prefill?.prefillType === "fieldDependent" &&
                (question?.config?.prefill as any)?.prefillFrom &&
                ["airlineNameOnward", "airlineNameReturn"].includes(
                  (question?.config?.prefill as any)?.prefillFromBindingKey,
                )
              ) {
                const sourceValue =
                  formData[(question?.config?.prefill as any)?.prefillFrom];
                if (
                  sourceValue &&
                  sourceValue !== "OTHER" &&
                  value &&
                  value.includes("-")
                ) {
                  const input = e.target as HTMLInputElement;
                  const cursorPosition = input.selectionStart || 0;
                  const selectionEnd = input.selectionEnd || 0;
                  const prefixEndPosition = sourceValue.length + 1;

                  if (e.key === "Backspace" || e.key === "Delete") {
                    if (cursorPosition !== selectionEnd) {
                      if (cursorPosition >= prefixEndPosition) {
                        return;
                      }

                      e.preventDefault();
                    } else {
                      if (cursorPosition <= prefixEndPosition) {
                        e.preventDefault();
                      }
                    }
                  }
                  if (e.key === "a" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    input.setSelectionRange(prefixEndPosition, value.length);
                  }
                }
              }
            }}
            onWheel={(e) => {
              if (question.type === "number") e.target.blur();
            }}
            onSelect={(e) => {
              if (
                question?.config?.prefill?.prefillType === "fieldDependent" &&
                (question?.config?.prefill as any)?.prefillFrom &&
                ["airlineNameOnward", "airlineNameReturn"].includes(
                  (question?.config?.prefill as any)?.prefillFromBindingKey,
                )
              ) {
                const sourceValue =
                  formData[(question?.config?.prefill as any)?.prefillFrom];
                if (
                  sourceValue &&
                  sourceValue !== "OTHER" &&
                  value &&
                  value.includes("-")
                ) {
                  const input = e.target as HTMLInputElement;
                  const selectionStart = input.selectionStart || 0;

                  const prefixEndPosition = sourceValue.length + 1;
                  if (selectionStart < prefixEndPosition) {
                    setTimeout(() => {
                      input.setSelectionRange(
                        prefixEndPosition,
                        input.selectionEnd || prefixEndPosition,
                      );
                    }, 0);
                  }
                }
              }
            }}
            className={inputClasses}
            onBlur={() => handleFieldBlur(question.id, sectionName)}
            placeholder={`Enter ${question.label.toLowerCase()}`}
            disabled={
              question.bindingKey === "email" ||
              isFieldDisabled ||
              (question.config?.isDisable && question.config?.isDefaultValue)
            }
            min={
              question.type === "number" && question.bindingKey === "tdsAmount"
                ? 1
                : undefined
            }
          />
          {error && <p className={styles.fieldError}>{error}</p>}
        </div>
      );
    case "date":
      if (!areDependenciesSatisfied(question, formData)) return null;
      else {
        return (
          <div key={question.id} className={styles.fieldGroup} data-question-id={question.id}>
            <label className={styles.fieldLabel}>{question.label}</label>
            <BirthDatePicker
              value={value}
              onChange={(date) =>
                handleFieldChange(question.id, date, sectionName)
              }
              onBlur={() => handleFieldBlur(question.id, sectionName)}
              config={question.config}
              allocatedProgram={seekerDetails?.allocatedProgram}
            />
            {error && <p className={styles.fieldError}>{error}</p>}
          </div>
        );
      }
    case "select":
      if (!areDependenciesSatisfied(question, formData)) return null;
      else {
        return (
          <div
            key={question.id}
            className={
              question.label.toLowerCase().includes("date of birth")
                ? styles.fieldGroupFull
                : styles.fieldGroup
            }
            data-question-id={question.id}
          >
            <label className={styles.fieldLabel}>{question.label}</label>

            <CustomDropDown
              value={value}
              question={question}
              handleFieldChange={(id: string | number, val: string) =>
                handleFieldChange(Number(id), val, sectionName)
              }
              onBlur={() => handleFieldBlur(question.id, sectionName)}
              inputClasses={inputClasses}
            />

            {error && <i className={styles.fieldError}>{error}</i>}
          </div>
        );
      }
    case "file":
      if (!areDependenciesSatisfied(question, formData)) return null;
      else {
        return (
          <div key={question.id} className={styles.fieldGroup} data-question-id={question.id}>
            <UploadSlot
              label={question.label}
              uploadedFile={localFile || value }
              required={!!question.config.isRequired}
              onFileChange={(file: File) => {
                setLocalFile(file);
                handleFieldChange(question.id, file, sectionName);
              }}
              error={error}
            />
            {error && <p className={styles.fieldError}>{error}</p>}
          </div>
        );
      }
    case "radio":
      if (!areDependenciesSatisfied(question, formData)) return null;
      return (
        <div
          key={question.id}
          className={
            sectionKey === "FS_GOODIES" || heading?.includes("Profile")
              ? styles.fieldGroup
              : styles.fieldGroupFull
          }
          data-question-id={question.id}
        >
          <div className={styles.radioLabelContainer}>
          <label className={styles.fieldLabel}>
            {question.label}
            {(question.config.isRequired == false ||
              question.config.isRequired == undefined ||
              question.config.isRequired == null) && (
              <span className={styles.optional}>(optional)</span>
            )}
          </label>
          {["travelPlanReturn", "travelPlanOnward","internationalId"].includes(question.bindingKey) && value && (
          <button
          type="button"
          className={styles.clearLabel}
          onClick={() => handleFieldChange(question.id, "", sectionName)}
          aria-label="Clear selection"
          >
          Clear
          </button>
        )}
          </div>
          <div className={styles.radioGroup}>
            {question.questionOptionMaps.map(
              (optionMap, index) =>
                shouldShowOption(optionMap?.option?.name, seekerDetails) &&
                getPrice(
                  seekerDetails,
                  formData,
                  sectionName,
                  optionMap?.option?.name,
                ) && (
                  <div key={index}>
                    <input
                      type="radio"
                      name={question.bindingKey}
                      value={optionMap?.option?.name}
                      checked={value === optionMap?.option?.name}
                      onChange={(e) =>
                        handleFieldChange(
                          question.id,
                          e.target.value,
                          sectionName,
                        )
                      }
                      className={styles.radioInput}
                      disabled={
                        isFieldDisabled ||
                        (question.bindingKey?.includes("paymentMode") &&
                          disableRadioButtons(
                            optionMap?.option?.name,
                            question.id,
                          ))
                      }
                    />
                    <label
                      key={optionMap.option.id}
                      className={styles.radioLabel}
                      onClick={
                        isFieldDisabled ||
                        (question.bindingKey?.includes("paymentMode") &&
                          disableRadioButtons(
                            optionMap?.option?.name,
                            question.id,
                          ))
                          ? undefined
                          : () => {
                              handleFieldChange(
                                question.id,
                                optionMap?.option?.name,
                                sectionName,
                              );
                            }
                      }
                    >
                      {optionMap.option.name}
                    </label>
                  </div>
                ),
            )}
          </div>
          {error && <p className={styles.fieldError}>{error}</p>}
        </div>
      );
    case "checkbox":
      const checkboxValue = Array.isArray(value) ? value : value ? [value] : [];
      if (!areDependenciesSatisfied(question, formData)) return null;
      else {
        return (
          <div key={question.id} className={styles.fieldGroup} data-question-id={question.id}>
            <div className={styles.checkboxGroup}>
              {question.questionOptionMaps.map((optionMap) => (
                <div key={optionMap.option.id} className={styles.checkboxItem}>
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
                      handleFieldChange(question.id, newValue, sectionName); // Pass the full array
                    }}
                    onBlur={() => handleFieldBlur(question.id, sectionName)}
                    className={styles.checkboxInput}
                  />
                  <label className={styles.fieldLabel}>{question.label}</label>
                </div>
              ))}
            </div>
            {error && <p className={styles.fieldError}>{error}</p>}
          </div>
        );
      }
    case "year": {
      const currentYear = new Date().getFullYear();
      const { minYear, maxYear, maxYearOffset, yearOffset }: any =
        question.config || {};
      let years: { value: string; label: string }[] = [];

      if (minYear === "current") {
        // For future years (current to current + 100)
        for (let y = currentYear + 100; y >= currentYear; y--) {
          years.push({
            value: `${y}`,
            label: `${y}`,
          });
        }
      } else if (maxYear === "current") {
        // For past years with offset
        const endYear = maxYearOffset
          ? currentYear + maxYearOffset
          : currentYear;
        const startYear = yearOffset ? yearOffset : currentYear - 100;

        for (let y = endYear; y >= startYear; y--) {
          years.push({
            value: `${y}`,
            label: `${y}`,
          });
        }
      } else {
        // Default case
        years.push({
          value: `${currentYear}`,
          label: `${currentYear}`,
        });
      }

      return (
        <div key={question.id} className={styles.fieldGroup} data-question-id={question.id}>
          <label className={styles.fieldLabel}>
            {question.label}
            {(question.config.isRequired == false ||
              question.config.isRequired == undefined ||
              question.config.isRequired == null) && (
              <span className={styles.optional}>(optional)</span>
            )}
          </label>
          <SelectTag
            value={value}
            onValueChange={(val) =>
              handleFieldChange(question.id, val, sectionName)
            }
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
    case "yearRange": {
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
        <div key={question.id} className={styles.fieldGroup} data-question-id={question.id}>
          <label className={styles.fieldLabel}>
            {question.label}
            {question.config.isRequired == false && (
              <span className={styles.optional}>(optional)</span>
            )}
          </label>

          <SelectTag
            value={value}
            onValueChange={(val) =>
              handleFieldChange(question.id, val, sectionName)
            }
            matchTriggerWidth={true}
          >
            <SelectTrigger className={styles.selectTrigger}>
              <SelectValue
                placeholder="Select year range"
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
    case "dateandtime": {
      // Use prefillValue if available - let DateTimePicker handle timezone conversion
      // Initialize state with null first
      const [selectedDate, setSelectedDate] = useState<Date | null>(null);
      const [selectedTime, setSelectedTime] = useState<Date | null>(null);

      // Calculate dependency satisfaction first
      const dependenciesSatisfied = areDependenciesSatisfied(
        question,
        formData,
      );

      // Track onward terminal value for reset logic
      const onwardTerminalResponse = programDetails?.programQuestionMaps?.find(
        (pqmItem: any) => pqmItem.question?.bindingKey === "onwardTerminal"
      );
      const onwardTerminalQuestionId = onwardTerminalResponse?.question?.id;        
      const onwardTerminalValue = onwardTerminalQuestionId ? formData[onwardTerminalQuestionId] : null;
      
      // Ref to track previous onward terminal value to detect changes
      const prevOnwardTerminalRef = useRef<string | null>(undefined);

      // Update state when value or prefillValue changes
      useEffect(() => {
        if (!dependenciesSatisfied) {
          // If dependencies not satisfied, clear local state
          setSelectedDate(null);
          setSelectedTime(null);
          return;
        }
        
        if (value) {
      
          const dateObj = new Date(value);
          setSelectedDate(dateObj);
          setSelectedTime(dateObj);
        } else if (prefillValue) {
          // No saved value, but there's a prefillValue - only set date, not time
          const prefillDate = new Date(prefillValue);
          setSelectedDate(prefillDate);
          setSelectedTime(null); // Always keep time empty for prefill only
        } else {
          // No value and no prefillValue
          setSelectedDate(null);
          setSelectedTime(null);
        }
      }, [value, prefillValue, question.bindingKey, dependenciesSatisfied]);

      // Reset date and time when onward terminal changes for arrivalDateTime
      useEffect(() => {
        if (question.bindingKey !== "arrivalDateTime" || !prefillValue) {
          return;
        }

        const isInitialLoad = prevOnwardTerminalRef.current === undefined;
        const hasTerminalChanged = prevOnwardTerminalRef.current !== onwardTerminalValue;
        const previousTerminalValue = prevOnwardTerminalRef.current; // Capture previous value before updating
        
        // Update the ref to current value
        prevOnwardTerminalRef.current = onwardTerminalValue;

        // If initial load and no onward terminal selected, don't do anything
        if (isInitialLoad && !onwardTerminalValue) {
          return;
        }

        // If no onward terminal value, don't trigger any validation
        if (!onwardTerminalValue) {
          return;
        }

        // If field is empty (no date selected) and terminal changes, don't trigger
        if (!selectedDate && hasTerminalChanged) {
          return;
        }

        // If terminal changed (not initial load), validate and clear time
        if (hasTerminalChanged && !isInitialLoad && selectedDate) {
          const prefillDate = new Date(prefillValue);

          if (onwardTerminalValue === "Domestic") {
            // For domestic: Only prefillValue date is allowed
             if (selectedDate.toDateString() !== prefillDate.toDateString()) {
              // Current date is invalid for domestic, reset to prefillValue
              setSelectedDate(prefillDate);
              setSelectedTime(null);
              handleFieldChange(question.id, "", sectionName);
            } else {
              // Check if this is the first time selecting onward terminal (no previous value)
              const isFirstTimeSelection = previousTerminalValue === null || previousTerminalValue === undefined || previousTerminalValue === "";
              
              if (isFirstTimeSelection) {
                // First time selecting terminal, keep both date and time as they are
                // Don't clear time, don't call handleFieldChange
              } else {
                // Date is valid but clear time when terminal changes
                setSelectedTime(null);
                // Don't call handleFieldChange - let the user select time to complete the value
              }
            }
          } else if (onwardTerminalValue === "International") {
            // For international: prefillValue and prefillValue-1 are allowed
            const priorDay = new Date(prefillDate);
            priorDay.setDate(priorDay.getDate() - 1);
            
            const isValidDate = (
              selectedDate.toDateString() === prefillDate.toDateString() ||
              selectedDate.toDateString() === priorDay.toDateString()
            );         
            if (!isValidDate) {
              // Current date is invalid for international, reset to prefillValue
              setSelectedDate(prefillDate);
              setSelectedTime(null);
              handleFieldChange(question.id, "", sectionName);
            } else {
              // Check if this is the first time selecting onward terminal (no previous value)
              const isFirstTimeSelection = previousTerminalValue === null || previousTerminalValue === undefined || previousTerminalValue === "";
              
              if (isFirstTimeSelection) {
                // First time selecting terminal, keep both date and time as they are
                // Don't clear time, don't call handleFieldChange
              } else {
                // Date is valid but clear time when terminal changes
                // Don't call setSelectedDate since we're keeping the same date
                setSelectedTime(null);
                // Don't call handleFieldChange - let the user select time to complete the value
              }
            }
          }
        }
        // For initial load with onward terminal already set, only validate if no saved value exists and there's a selected date
        if (isInitialLoad && onwardTerminalValue && !value && selectedDate) {
          const prefillDate = new Date(prefillValue);

          if (onwardTerminalValue === "Domestic") {
            // For domestic: Only prefillValue date is allowed
            if (selectedDate.toDateString() !== prefillDate.toDateString()) {
              // Current date is invalid for domestic, reset to prefillValue
              setSelectedDate(prefillDate);
              setSelectedTime(null);
              handleFieldChange(question.id, "", sectionName);
            } 
          } else if (onwardTerminalValue === "International") {
            // For international: prefillValue and prefillValue-1 are allowed
            const priorDay = new Date(prefillDate);
            priorDay.setDate(priorDay.getDate() - 1);
            
            const isValidDate = (
              selectedDate.toDateString() === prefillDate.toDateString() ||
              selectedDate.toDateString() === priorDay.toDateString()
            );
            
            if (!isValidDate) {
              setSelectedDate(prefillDate);
              setSelectedTime(null);
              handleFieldChange(question.id, "", sectionName);
            } 
          }
        }
      }, [onwardTerminalValue, prefillValue, question.bindingKey, selectedDate]);

      // Only render if dependencies are satisfied
      if (!dependenciesSatisfied) {
        return null;
      }

      // Calculate date restrictions and prefill date once
      const prefillDate = prefillValue ? new Date(prefillValue) : null;
      let minDate: Date | undefined;
      let maxDate: Date | undefined;
      let isDateDisabled = false;

      if (question.bindingKey === "arrivalDateTime" && prefillDate) {
        if (onwardTerminalValue === "Domestic") {
          // Domestic: ONLY allow program start day (prefillValue date)
          minDate = new Date(prefillDate);
          minDate.setHours(0, 0, 0, 0); // Start of program day
          
          maxDate = new Date(prefillDate);
          maxDate.setHours(23, 59, 59, 999); // End of program day
        } else if (onwardTerminalValue === "International") {
          // International: Allow prior day + start day
          // Set minDate to 1 day before prefillValue
          minDate = new Date(prefillDate);
          minDate.setDate(minDate.getDate() - 1);
          minDate.setHours(0, 0, 0, 0); // Start of prior day

          // Set maxDate to prefillValue date
          maxDate = new Date(prefillDate);
          maxDate.setHours(23, 59, 59, 999); // End of program day
        } else {
          // Default behavior when onwardTerminal is not set or has other values
          minDate = new Date(prefillDate);
          minDate.setHours(0, 0, 0, 0); // Start of program day
          maxDate = new Date(prefillDate);
          maxDate.setHours(23, 59, 59, 999); // End of program day
        }
      } else if (question.bindingKey === "departureDateTime" && prefillDate) {
        // Departure date: date non-editable (fixed to prefillValue date), time editable after prefillValue time
        isDateDisabled = true;
      }

      // shouldDisableTime function for departureDateTime
      const shouldDisableTime = (
        timeValue: Date,
        clockType: "hours" | "minutes" | "seconds",
      ) => {
        if (
          question.bindingKey !== "departureDateTime" ||
          !prefillDate ||
          !selectedDate
        ) {
          return false; // Don't disable any times for other cases
        }

        // Check if selected date is the same as prefill date
        const isSameDate =
          selectedDate.getDate() === prefillDate.getDate() &&
          selectedDate.getMonth() === prefillDate.getMonth() &&
          selectedDate.getFullYear() === prefillDate.getFullYear();

        if (!isSameDate) {
          return false; // If different date, allow all times
        }

        // Get the prefill hour and minute
        const prefillHour = prefillDate.getHours();
        const prefillMinute = prefillDate.getMinutes();
        const timeValueHour = timeValue.getHours();
        const timeValueMinute = timeValue.getMinutes();

        if (clockType === "hours") {
          // If prefill time is PM (12 or later), disable all AM hours (0-11)
          if (prefillHour >= 12 && timeValueHour < 12) {
            return true;
          }
          // Disable hours before the prefill hour
          return timeValueHour < prefillHour;
        }

        if (clockType === "minutes") {
          // If the selected hour equals prefill hour, disable minutes before prefill minute
          if (timeValueHour === prefillHour) {
            return timeValueMinute < prefillMinute;
          }
          // If hour is before prefill hour, disable all minutes
          return timeValueHour < prefillHour;
        }

        return false;
      };

      // Get default time to show in picker (for AM/PM pre-selection)
      const getDefaultPickerTime = () => {
        if (question.bindingKey === "departureDateTime" && prefillDate) {
          // Create a date with the prefill hour to set the correct AM/PM period
          const defaultTime = new Date();
          defaultTime.setHours(
            prefillDate.getHours(),
            prefillDate.getMinutes(),
            0,
            0,
          );
          return defaultTime;
        }
        return undefined;
      };

      const combineDateAndTime = (
        date: Date | null,
        time: Date | null,
      ): string => {
        if (!date || !time) return "";
        const combined = new Date(date);
        combined.setHours(
          time.getHours(),
          time.getMinutes(),
          time.getSeconds(),
          0,
        );
        return combined.toISOString();
      };

      return (
        <div className={styles.fieldGroup} data-question-id={question.id}>
          <div className={styles.formRowContainer} data-testid="">
            <label className={styles.fieldLeftLabel}>{question.label}</label>
            <div className={styles.formFieldsContainer}>
              {/* Date Picker */}
              <div
                className={styles.timeFormFields}
                key={`${question.id}-date`}
              >
                <CommonDateTimePicker
                  type="date"
                  value={selectedDate || undefined}
                  onChange={(date) => {
                    if (!isDateDisabled && date) {
                      setSelectedDate(date);
                      // Only update combined value if time is also selected
                      if (selectedTime) {
                        const combined = combineDateAndTime(date, selectedTime);
                        handleFieldChange(question.id, combined, sectionName);
                      }
                    }
                  }}
                  startDate={minDate}
                  maxDate={maxDate}
                  futureDate={true}
                  disabled={isDateDisabled}
                  borderRight={true}
                  errorExist={!!errors.meetingDate}
                  dataTestId="set-date"
                  className={styles.formFieldMeeting}
                  hideReadOnlyStyle={true}
                />
              </div>

              {/* Time Picker */}
              <div
                className={styles.timeFormFields}
                key={`${question.id}-time`}
              >
                <CommonDateTimePicker
                  type="time"
                  value={selectedTime || undefined}
                  readOnly={false}
                  onChange={(time) => {
                    if (time) {
                      setSelectedTime(time);
                      const combined = combineDateAndTime(selectedDate, time);
                      handleFieldChange(question.id, combined, sectionName);
                    }
                  }}
                  // shouldDisableTime={question.bindingKey === "departureDateTime" ? shouldDisableTime : undefined}
                  // defaultPickerTime={getDefaultPickerTime()}
                  errorExist={!!errors.meetingTime}
                  dataTestId="start-time-picker"
                  className={styles.formFieldMeeting}
                  hideReadOnlyStyle={true}
                />
              </div>
            </div>
          </div>
          {error && <p className={styles.fieldError}>{error}</p>}
        </div>
      );
    }

    case "draganddrop": {
      return (
        <div className={styles.programPreferenceContainer} data-question-id={question.id}>
          <ProgramPreference
            availablePrograms={
              programDetails?.type?.isGroupedProgram
                ? programDetails?.groupedPrograms
                : programDetails?.sessions
            }
            maxPreferences={
              programDetails?.type?.isGroupedProgram
                ? programDetails?.groupedPrograms.length
                : programDetails?.sessions?.length
            }
            onPreferencesChange={(pref) => {
              handleFieldChange(
                question.id,
                pref != null ? encodeURIComponent(JSON.stringify(pref)) : null,
                sectionName, //Fixed: was passing question instead of sectionName
              );
            }}
            question={question}
            mahatriaChoice={mahatriaChoiceProgram} // - Define this variable or set to null
            addedclassName="renderformdragdrop" // - Define this variable or set to empty string
            value={value != "" ? JSON.parse(decodeURIComponent(value)) : null}
          />
          {error && <p className={styles.fieldError}>{error}</p>}
        </div>
      );
    }

    default:
      return null;
  }
};

export default RenderField;