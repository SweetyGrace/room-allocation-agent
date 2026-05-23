import { endPoints, PORTAL } from "../../constants/urlConstants";
import { getItemInLocalStorage } from "../../services/localStorage";
import { hasPermission, RESOURCES, ROLES } from "../../utils/roleBasedAccess";
import { getCall, getCallWithLoader, postCall, putCall, putCallWithLoader } from "../../services/apiService";
import { GroupedQuestion, ProgramQuestionMap, Question, FileUploadPayload } from "./types";
import type { patternObj, ProgramDetails } from "./types";
import { S3Client, ListObjectsCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import dayjs from "dayjs";
import axios from "axios";
import { ACTION_TYPE_LABELS, ApprovalStatus, CANCEL_SWAP, CryptoTrailText, MENU_ACTION_KEYS, STEPPER_STATUSES, SWAP_REQUEST_TITLE, textConstant } from "../../constants/textConstants";
import { profile_binding_keys } from "../../constants/seekerdetails";
import { stateGstCodes } from "../../constants";
import { setTravelStatus } from "../../reducers/ProgramReducer";
import { transformQuestionOptions } from "../../utils/registrationUtils";

const DEFAULT_SECTION_ORDERS = {
  FS_PROFILEDETAILS: 0,
  FS_BASICDETAILS: 1,
  FS_PAYMENTINVOICE: 2,
  FS_TRAVELPLAN: 3,
  FS_MAHATRIAQUESTIONS:4,
  FS_GOODIES:5,
  FS_ADDITI_0871: 6,
};

const s3 = new S3Client({
  region: process.env.REACT_APP_AWS_REGION, // 'ap-south-1',
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID || "", // 'AKIATOWWTX6I3DL2PYXJ',      // ⚠️ Avoid hardcoding in real apps
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY || "", //'xBO1LykVgxozKVqXXxfZX9i661C/1PTU00lGCJ+q',  // ⚠️ Use Cognito or env variables
  },
});

export const getRegistrationQuestionsById = async (id: string) => {
  try {
    const response = await getCall(
      `${endPoints.getRegistrationQuestionsById(id)}?isAdmin=true`,
      undefined,
      PORTAL
    );
    if (response?.data?.statusCode === 200) {
    
      return response.data.data;
    } else {
      console.error("Error fetching categories:", response?.data?.message);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
  return [];
};

export const getSeekerDetailsById = async (id: string,isAdmin?:boolean,selectedOption?:string) => {
  try {
    // if selectedOption is provided, append it as a query parameter check if it there first
    const response = await getCallWithLoader(
      isAdmin ? `${endPoints.registrations(id)}?isAdmin=true${selectedOption ? `&selectedOption=${selectedOption}` : ''}` : `${endPoints.registrations(id)}${selectedOption ? `selectedOption=${selectedOption}` : ''}`,
      undefined,
      PORTAL,
      textConstant.LARGE 
    );
    if (response?.data?.statusCode === 200) {
      return response.data.data;
    } else {
      console.error("Error fetching categories:", response?.data?.message);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
  return [];
};
export const markSeekerAsPaid = async (id: any, payload: any) => {
  try {
    const response = await putCallWithLoader(
      `${endPoints.markSeekerAsPaid(id)}`,
      payload,
      PORTAL,
      textConstant.LARGE 
    );
    if (response?.data?.statusCode === 200) {
      return response.data.data;
    } else {
      console.error("Error marking seeker as paid:", response?.data?.message);
    }
  } catch (error) {
    console.error("Error marking seeker as paid:", error);
  }
  return [];
};

export const omitFields = (data: Array<any>, fieldsToOmit: Array<string>) => {
  const updatedFields: Array<any> = [];
  const userRole = getItemInLocalStorage("seekerDetails")?.role || "";
  
  data.forEach((item: any) => {
    if (
      !fieldsToOmit.includes(item.questionBindingKey) &&
      !fieldsToOmit.includes(item.questionType) &&
      !fieldsToOmit.includes(item.questionLabel) &&
      !fieldsToOmit.includes(item.questionId.toString())
    ) {
      // Apply the same role-based filtering logic for upload ticket fields in display mode
      if (!(item.questionBindingKey === "uploadOnwardJourneyTicket" || item.questionBindingKey === "uploadReturnJourneyTicket") || 
          userRole === ROLES.SHOBA || userRole === ROLES.SUPER_ADMIN || userRole === ROLES.ADMIN) {
        updatedFields.push(item);
      }
    }
  });
  return updatedFields;
};

export const omitFieldsFromProgramQuestionMap = (
  data: ProgramQuestionMap[],
  fieldsToOmit: Array<string>,
) => {
  const updatedFields: Array<any> = [];
  const userRole = getItemInLocalStorage("seekerDetails")?.role || "";
  // Filter out items based on
  data.forEach((item: any) => {
    if (
      // questionBindingKey
      !fieldsToOmit.includes(item.question.bindingKey) &&
      !fieldsToOmit.includes(item.question.type) &&
      !fieldsToOmit.includes(item.question.label) &&
      !fieldsToOmit.includes(item.question.id.toString())
    ) {
      if (!(item.question.bindingKey === "uploadOnwardJourneyTicket" || item.question.bindingKey === "uploadReturnJourneyTicket") || 
      userRole === ROLES.SHOBA || userRole === ROLES.SUPER_ADMIN || userRole=== ROLES.ADMIN) {
    updatedFields.push(item);
  }
    }
  });

  return updatedFields;
};

export const fetchFullNameAndYourPicture = (data: any) => {
  let fullName = "";
  let yourPicture = "";
  data.forEach((item: any) => {
    if (item.questionLabel === "Full Name") {
      fullName = item.answer;
    }
    if (
      item.questionLabel === "Profile Picture" ||
      item.questionLabel === "Upload Profile Picture"
    ) {
      yourPicture = item.answer;

    }
  });

  return { fullName, yourPicture };
};

export const groupDataBySection = (data: Array<any>, paymentStatus) => {
  const userRole = getItemInLocalStorage("seekerDetails")?.role || ""; // Assuming you store the user role in local storage
  const PROFILE_DETAILS_SECTION = "FS_PROFILEDETAILS";
  const groupedProfileSection= {};
  const groupedData = data.reduce((acc, item) => {
    const sectionName = item.sectionName;
    if (!acc[sectionName] && !Object.prototype.hasOwnProperty.call(profile_binding_keys, item.questionBindingKey)) {
      acc[sectionName] = {
        // sectionOrder: item.sectionOrder,
        sectionOrder:
          DEFAULT_SECTION_ORDERS[item.sectionKey as keyof typeof DEFAULT_SECTION_ORDERS] ??
          item.sectionOrder,
        items: [],
        sectionKey: item.sectionKey,
      };
      acc[sectionName].items.push(item);
    } else if(acc[sectionName] && !Object.prototype.hasOwnProperty.call(profile_binding_keys, item.questionBindingKey)) {
        acc[sectionName].items.push(item);
    }
    if (Object.prototype.hasOwnProperty.call(profile_binding_keys, item.questionBindingKey) && !acc[PROFILE_DETAILS_SECTION]) {
      acc[PROFILE_DETAILS_SECTION] = {
        // sectionOrder: item.sectionOrder,
        sectionOrder:
          DEFAULT_SECTION_ORDERS[PROFILE_DETAILS_SECTION] ??
          item.sectionOrder,
        items: [],
        sectionKey: item.sectionKey,
      };
      acc[PROFILE_DETAILS_SECTION].items.push(item);
      // groupedProfileSection[PROFILE_DETAILS_SECTION].items.push(item);
    } else if(Object.prototype.hasOwnProperty.call(profile_binding_keys, item.questionBindingKey) && acc[PROFILE_DETAILS_SECTION]) {
       acc[PROFILE_DETAILS_SECTION].items.push(item);
    }
  
    return acc;
  }, {});

  const sortedSections = Object.keys(groupedData)
    .map((sectionName) => ({
      sectionName,
      sectionOrder: groupedData[sectionName].sectionOrder,
      items: groupedData[sectionName].items,
      isEditable:
        sectionName === "Payment & Invoice"
          ? hasPermission(userRole, sectionName, "U") &&
            !paymentStatus?.includes("completed")
          : hasPermission(userRole, sectionName, "U"),
      sectionKey: groupedData[sectionName].sectionKey,
    }))
    .sort((a, b) => a.sectionOrder - b.sectionOrder);

  return sortedSections;
};

export const getGroupNames = (data: Array<any>) => {
  const groupNames = data.map((item) => {
    return {
      label: item.sectionName,
      status: "pending",
    };
  });
  return groupNames;
};

export const getAllquestionsFromProgram = async (programId: number) => {
  try {
    const response = await getCall(`${endPoints.program}/${programId}?isAdmin=true`, undefined, PORTAL);
    if (response?.data?.statusCode === 200) {
      const programData = response?.data?.data;
      
      // Transform questionOptionMaps to handle new optionConfig format
      if (programData?.programQuestionMaps && Array.isArray(programData?.programQuestionMaps)) {
        programData.programQuestionMaps = programData.programQuestionMaps.map((pqm: any) => ({
          ...pqm,
          question: transformQuestionOptions(pqm.question)
        }));
      }
      
      return programData;
    } else {
      console.error("Error fetching categories:", response?.data?.message);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
  return [];
};

export const groupQuestionsByFormSectionName = (
  programQuestionMaps: ProgramQuestionMap[],
): Record<string, ProgramQuestionMap[]> => {
  const PROFILE_DETAILS_SECTION = "FS_PROFILEDETAILS";

  return programQuestionMaps.reduce(
    (acc, programQuestionMap) => {
      const sectionName = programQuestionMap.question.formSection.name;

      if (
        !acc[sectionName] &&
        !Object.prototype.hasOwnProperty.call(
          profile_binding_keys,
          programQuestionMap.question.bindingKey,
        )
      ) {
        acc[sectionName] = [];
      }
      if (
        Object.prototype.hasOwnProperty.call(
          profile_binding_keys,
          programQuestionMap.question.bindingKey,
        ) &&
        !acc[PROFILE_DETAILS_SECTION]
      ) {
        acc[PROFILE_DETAILS_SECTION] = [];
      }
      if (
        Object.prototype.hasOwnProperty.call(
          profile_binding_keys,
          programQuestionMap.question.bindingKey,
        ) &&
        acc[PROFILE_DETAILS_SECTION]
      ) {
        acc[PROFILE_DETAILS_SECTION].push(programQuestionMap);
      } else {
        acc[sectionName].push(programQuestionMap);
      }
      return acc;
    },
    {} as Record<string, ProgramQuestionMap[]>,
  );
};
// Add this function if it's not already in this file
const isFieldDisabledBasedOnDependency = (
  question: any,
  formData: any,
): boolean => {
  // If no dependencies, field is enabled
  if (!question.config.dependsOn || question.config.dependsOn.length === 0) {
    return false;
  }

  // Check if ALL dependencies are satisfied
  const allDependenciesSatisfied = question.config.dependsOn.every(
    (dep: any) => {
      if (dep.value === "notNull") {
        return (
          formData[dep.questionId] != undefined &&
          formData[dep.questionId] != null &&
          formData[dep.questionId] != ""
        );
      } else {
        let isMatch = formData[dep.questionId] == dep.value;
        if (dep.operator) {
          isMatch =
            (dep.operator === "equals" &&
              formData[dep.questionId] == dep.value) ||
            (dep.operator === "greaterThan" &&
              formData[dep.questionId] > dep.value);
        }
        return isMatch;
      }
    },
  );

  // If dependencies are NOT satisfied, field should be DISABLED
  return !allDependenciesSatisfied;
};

export const ValidateAllSections = (
  groupedQuestions: Record<string, ProgramQuestionMap[]>,
  formData: Record<string, Record<string, any>>,
  setErrors: any,
  sectionName: string,
  questionBindingKey: Record<string, number>,
  seekerDetails?: any 
): { hasErrors: boolean; errors: Record<string, Record<string, string>> } => {
  const acceptedQuestionTypes = [
    "apicall",
    "Address",
    "textarea",
    "text",
    "dateandtime",
    "email",
    "date",
    "select",
    "checkbox",
    "draganddrop",
    "radio",
    "file",
    "number",
    "tel",
  ];
  const errors: Record<string, Record<string, string>> = {};
  let hasErrors = false;

  const questions = groupedQuestions[sectionName];
  const sectionErrors: Record<string, string> = {};

  questions.forEach((programQuestionMap) => {
    const question = programQuestionMap.question;
    
    // Check if this is an always visible field
    const isAlwaysVisible = ALWAYS_VISIBLE_BINDING_KEYS.includes(question.bindingKey);
    
    if (isAlwaysVisible) {
      // For always visible fields, check if they are disabled based on dependencies
      const isFieldDisabled = isFieldDisabledBasedOnDependency(question, formData[sectionName]);
      
      // Skip validation if field is disabled
      if (isFieldDisabled) {
        return;
      }
    } else {
      // For regular fields, check if dependencies are satisfied for visibility
      if (!areDependenciesSatisfied(question, formData[sectionName])) {
        return; // Skip validation if dependencies are not satisfied
      }
    }

    const value = formData[sectionName]?.[question.id];

    // Pass seekerDetails to validateField
    const error = validateField(
      question, 
      value, 
      formData[sectionName], 
      questionBindingKey,
      seekerDetails
    );
    
    const isAcceptedFeildType = acceptedQuestionTypes.includes(question.type);
    if (error && isAcceptedFeildType) {
      sectionErrors[question.id] = error;
      hasErrors = true;
    }
  });

  if (Object.keys(sectionErrors).length > 0) {
    errors[sectionName] = sectionErrors;
  }
  setErrors(errors);

   return { hasErrors, errors }; 
};

export function validateDateInput(
  value: string | Date,
  config: any,
): string | null {
  if (!value) return "Date is required";
  const inputDate = dayjs(value);

  // Static validation: between startDate and endDate
  if (config.dateValidationType === "static") {
    if (
      config.startDate &&
      inputDate.isBefore(dayjs(config.startDate), "day")
    ) {
      return `Date should not be before ${dayjs(config.startDate).format("DD/MM/YYYY")}`;
    }
    if (config.endDate && inputDate.isAfter(dayjs(config.endDate), "day")) {
      return `Date should not be after ${dayjs(config.endDate).format("DD/MM/YYYY")}`;
    }
    return null;
  }

  // Dynamic validation: future and past
  const today = dayjs().startOf("day");

  // Past validation (e.g., age should be at least minValue years and at most maxValue years)
  if (config.pastValidation?.enabled) {
    const { unit, minValue, maxValue } = config.pastValidation;
    const diff = today.diff(inputDate, unit);

    if (minValue != null && diff < minValue) {
      return `Date should be at least ${minValue} ${unit} in the past`;
    }
    if (maxValue != null && diff > maxValue) {
      return `Date should not be more than ${maxValue} ${unit} in the past`;
    }
  }

  // Future validation (e.g., date should not be too far in the future)
  if (config.futureValidation?.enabled) {
    const { unit, minValue, maxValue } = config.futureValidation;
    const diff = inputDate.diff(today, unit);

    if (minValue != null && diff < minValue) {
      return `Date should be at least ${minValue} ${unit} in the future`;
    }
    if (maxValue != null && diff > maxValue) {
      return `Date should not be more than ${maxValue} ${unit} in the future`;
    }
  }

  return null; // Valid
}
const validateField = (
  question: Question, 
  value: any, 
  formData: Record<string, any>, 
  questionBindingKey: Record<string, number>,
  seekerDetails?: any // Add seekerDetails as optional parameter
): string | null => {
  const { config } = question;

  // Check if field is required - field is required only if isRequired is explicitly true
  // Fields are optional if isRequired is false, undefined, or null
  const isFieldRequired = config.isRequired === true;
  
  if (isFieldRequired && (!value || value.toString().trim() === "")) {
    return `${question.label} is required`;
  }

  // For optional fields, if the value is empty or only whitespace, skip all other validations
  if (!isFieldRequired && (!value || value.toString().trim() === "")) {
    return null; // No validation errors for empty optional fields
  }

  if (question.type === "date" && value && validateDateInput(value, config)) {
    const currentDate = new Date();
    const inputDate = new Date(value);
    const age = currentDate.getFullYear() - inputDate.getFullYear();
    if (age < config?.minYears) {
      return `${question.label} must be at least ${config.minYears} years old`;
    }
  }
  if (
    value &&
    config.minCharacter &&
    value.toString().length < config.minCharacter
  ) {
    return `${question.label} must be at least ${config.minCharacter} characters`;
  }

  if (
    value &&
    config.maxCharacters &&
    value.toString().length > config.maxCharacters
  ) {
    return `${question.label} must not exceed ${config.maxCharacters} characters`;
  }

  if (question.type === "email" && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
  }

  // Cheque Number validation
  if (question.bindingKey === "chequeNo" && value) {
    const allowedDigits = question.config?.allowedDigits;
    const chequeStr = String(value);
    
    if (allowedDigits) {
      // allowedDigits is a number, chequeStr should be exactly that many digits
      const digitRegex = new RegExp(`^\\d{${allowedDigits}}$`);
      if (!digitRegex.test(chequeStr)) {
        return `Must be exactly ${allowedDigits} digits`;
      }
    }
  }

  // TDS Amount validation
  if (question.bindingKey === "tdsAmount" && value && seekerDetails?.allocatedProgram) {
    const tdsPercent = Number(seekerDetails.allocatedProgram.tdsPercent) || 0;
    const tdsApplicability = seekerDetails.allocatedProgram.tdsApplicability;
    const baseAmount = Number(seekerDetails.allocatedProgram.basePrice) || 0;
    const gstPercent = Number(seekerDetails.allocatedProgram.gstPercent) || 0;
    const gstAmount = (baseAmount * gstPercent) / 100;
    const tdsAmountOnBaseAmount = (baseAmount * tdsPercent) / 100;
    const tdsAmountOnGst = (gstAmount * tdsPercent) / 100;
    const enteredTds = Number(value);

    if (enteredTds < 0) {
      return "TDS amount cannot be negative";
    }
    
    if (tdsApplicability === "base_only") {
      if (enteredTds > tdsAmountOnBaseAmount) {
        return `TDS percent cannot be more than ${tdsPercent.toFixed(2)}% for this program`;
      }
    } else if (tdsApplicability === "base_plus_tax") {
      const maxTds = tdsAmountOnBaseAmount + tdsAmountOnGst;
      if (enteredTds > maxTds) {
        return `TDS percent cannot be more than ${tdsPercent.toFixed(2)}% for this program`;
      }
    }
    
    // Percentage check
    if (tdsPercent > 0 && baseAmount > 0) {
      const calculatedPercent = (enteredTds / baseAmount) * 100;
      if (calculatedPercent > tdsPercent) {
        return `TDS percent cannot be more than ${tdsPercent.toFixed(2)}% for this program`;
      }
    }
  }

  // TAN Number validation
  if (question.bindingKey === "tanNumber" && value) {
    const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]$/;
    const tanValue = String(value).trim().toUpperCase();
    
    if (!tanRegex.test(tanValue)) {
      return 'min limit: 10';
    }
  }

  if (config.validationPattern && value) {
    const regex = new RegExp(config.validationPattern);
    if (!regex.test(value)) {
      if (config.patternErrorMsg) {
        return config.patternErrorMsg;
      }
      return `${question.label} format is invalid`;
    }
  }

  if (
    config?.validationConfig &&
    config?.validationConfig?.dependentBindingKey &&
    questionBindingKey?.[config?.validationConfig?.dependentBindingKey] &&
    formData[questionBindingKey[config?.validationConfig?.dependentBindingKey]]
  ) {
    const dependentValue = formData[questionBindingKey[config?.validationConfig?.dependentBindingKey]];
    const validatepatten = config?.validationConfig.validationPattern.filter(
      (pattern: patternObj) => {
        if (pattern.validateif?.toLowerCase() == dependentValue.toLowerCase()) {
          return true;
        }
      }
    );
    return validatepatten.length == 0 ||
      (validatepatten.length > 0 &&
        validatepatten[0]?.length == value.length &&
        new RegExp(validatepatten[0]?.pattern).test(value))
      ? null
      : config.patternErrorMsg
      ? config.patternErrorMsg
      : `invalid format`;
  }
  
  return null;
};

export const filterGroupedQuestionsByData = (
  data: Array<any>,
  groupedQuestions: Record<string, ProgramQuestionMap[]>,
): Record<string, ProgramQuestionMap[]> => {
  // Create a set of all questionIds present in the data
  const validQuestionIds = new Set(
    data.flatMap((section) =>
      section.items.map((item: any) => item.questionId),
    ),
  );

  // Filter groupedQuestions based on validQuestionIds
  const filteredGroupedQuestions = Object.keys(groupedQuestions).reduce(
    (acc, sectionName) => {
      const filteredQuestions = groupedQuestions[sectionName].filter(
        (programQuestionMap) =>
          validQuestionIds.has(programQuestionMap.question.id),
      );

      if (filteredQuestions.length > 0) {
        acc[sectionName] = filteredQuestions;
      }

      return acc;
    },
    {} as Record<string, ProgramQuestionMap[]>,
  );

  return filteredGroupedQuestions;
};

export const convertFileToBlob = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: file.type });
  return blob;
};

export const handleAWSFileUpload = async (file: File , userId? : string, uploadType?: string): Promise<string | null> => {
  try {
    const payload: FileUploadPayload = {
      fileName: file.name,
      contentType: file.type,
      userId: userId
    };

    if (uploadType) {
      payload.imageType = uploadType;
    }
    const fileUrls = await postCall(endPoints.fileUpload, payload, PORTAL);
    if (fileUrls?.data?.data?.accessUrl && fileUrls?.data?.data?.putUrl) {
      const blob = await convertFileToBlob(file);
      await axios.put(fileUrls.data.data.putUrl, blob, {
        headers: {
          "Content-Type": file.type,
        },
      });
      return fileUrls.data.data.accessUrl;
    } else {
      alert("File upload failed. Please try again");
      return null;
    }
  } catch (error) {
    alert("File upload failed. Please try again.");
    return null;
  }
};


const getQuestionValue = (
  sectionQuestions: any,
  questionId: string,
  value: any,
) => {
  let returnValue = "";
  let isApiCallValue = false;
  sectionQuestions.map((question: any) => {
    if (
      question.question.id == questionId &&
      question.question.type === "apicall"
    ) {
      if (
        question.question.questionOptionMaps &&
        question.question.questionOptionMaps.length > 0
      ) {
        question.question.questionOptionMaps.forEach((option: any) => {
          if (option.option.name === value.trim()) {
            isApiCallValue = true;
            returnValue = option.option.id;
          }
        });
      }
    }
  });

  return { returnValue, isApiCallValue };
};

export const transformFormDataToPayload = (
  formData: {
    [key: string]: GroupedQuestion;
  },
  sectionQuestions: any,
  sectionName: string,
): Array<{ questionId: number; answer: string }> => {
  const payload: Array<{ questionId: number; answer: string }> = [];

  const sectionData = formData[sectionName];
  Object.keys(sectionData).forEach((questionId: any) => {
    const value = sectionData[questionId];
    const { isApiCallValue, returnValue } = getQuestionValue(
      sectionQuestions,
      questionId,
      value,
    );

    const finalValue = isApiCallValue ? returnValue : value;

    if (!questionId.endsWith(CryptoTrailText)) {
      payload.push({
        questionId: Number(questionId),
        answer: finalValue?.toString().trimEnd() || "",
      });
    }
  });

  return payload;
};

const fetchApiOptions = async (pqm: ProgramQuestionMap) => {
  const apiEndpoint = pqm.question.config?.apiUrl ? pqm.question.config.apiUrl : endPoints.lookupData

  if (!apiEndpoint) return;
  try {
    let updatedProgramQuestionMap = [];
    const response = await getCall(apiEndpoint, undefined, PORTAL);

    if (response?.data?.statusCode === 200) {
      updatedProgramQuestionMap = response.data.data
      return updatedProgramQuestionMap;
    }
  } catch (error) {
    console.error("Error fetching API options:", error);
    return [];
  }
};

export const getApiCallData: any = async (
  fetchApiCalls: ProgramQuestionMap[],
  fetchProfileAPICalls: ProgramQuestionMap[]
)=> {
  if(fetchApiCalls.length === 0) return [];
  // const programData: ProgramQuestionMap[] = await Promise.all(
    const lookUpData = await fetchApiOptions(fetchApiCalls[0]);
    fetchApiCalls.map(async (pqm: ProgramQuestionMap) => {
      if (pqm.question.type === "apicall") {
        if (
          !pqm.question.questionOptionMaps ||
          pqm.question.questionOptionMaps.length === 0
        ) {
          const updatedOptions = pqm.question.config.category ? lookUpData[pqm.question.config.category].map((item: any) => ({
          option: {
            id: item.key ?? 8319,
            name: item.value ?? item.fullName,
          },
        }))
          : [];
          pqm.question.questionOptionMaps = updatedOptions
        }
      }
      return pqm;
    })
      fetchProfileAPICalls.map(async (pqm: ProgramQuestionMap) => {
      if (pqm.question.type === "apicall") {
        if (
          !pqm.question.questionOptionMaps ||
          pqm.question.questionOptionMaps.length === 0
        ) {
          const updatedOptions = pqm.question.config.category ? lookUpData[pqm.question.config.category].map((item: any) => ({
          option: {
            id: item.key ?? 8319,
            name: item.value ?? item.fullName,
          },
        }))
          : [];
          pqm.question.questionOptionMaps = updatedOptions
        }
      }
      return pqm;
    })

  return {fetchApiCalls, fetchProfileAPICalls};
};

export const groupProgramQuestionsBySection = (
  programQuestions: any[],
  paymentStatus: string | string[] | undefined,
) => {
  const userRole = getItemInLocalStorage("seekerDetails")?.role || "";
  const result = programQuestions.reduce(
    (acc, pqm) => {
      const sectionName = pqm.question.formSection.name;
      if (!acc[sectionName]) {
        acc[sectionName] = { 
          sectionOrder: pqm.displayOrder, 
          items: [],
          sectionKey: pqm.programQuestionFormSection?.key
        };
      }
      return acc;
    },
    {} as Record<string, any[]>,
  );
  const sortedSections = Object.keys(result).map((sectionName) => ({
    sectionName,
    sectionOrder: result[sectionName].sectionOrder,
    items: result[sectionName].items,
    sectionKey: result[sectionName].sectionKey,
    isEditable:
      sectionName === "Payment & Invoice"
        ? hasPermission(userRole, sectionName, "U") &&
          !paymentStatus?.includes("completed")
        : hasPermission(userRole, sectionName, "U"),
  }));
  return sortedSections;
};

export const mergeSections = (arrayOne: any[], arrayTwo: any[]) => {
  const sectionNamesInOne = new Set(arrayOne.map((item) => item.sectionName));
  const uniqueFromTwo = arrayTwo.filter(
    (item) => !sectionNamesInOne.has(item.sectionName),
  );
  return [...arrayOne, ...uniqueFromTwo];
};

export const handleSendInvoice = (seekerId: any) => {
  if (seekerId) {
    const response = getCallWithLoader(`${endPoints.sendInvoice(seekerId)}`, undefined, PORTAL, textConstant.LARGE );
  }
};

export const getGroupedProgramsList = (
  programs: Array<{ id: number; name: string }>,
): Array<{ value: number; label: string }> => {
  return programs.map((program) => ({
    value: program.id,
    label: program.name,
  }));
};

const fetchDataFromApiCall = async (config: any) => {
  // try {
  // You may want to store the endpoint in pqm.question.config or elsewhere
  // For demo, let's assume pqm.question.config.apiEndpoint exists
  if (!config?.endPoint) return;
  try {
    let updatedProgramQuestionMap = [];
    const response = await getCall(config.endPoint);
    if (response?.data?.statusCode === 200) {
      // Map API response to questionOptionMaps format
      updatedProgramQuestionMap = response.data.data.data.map((item: any) => ({
        option: {
          id: item.id ?? 8319,
          name: item.name ?? item.fullName,
        },
      }));
      return updatedProgramQuestionMap;
    }
  } catch (error) {
    console.error("Error fetching API options:", error);
    return [];
  }
};

export const fetchApiResultsFromData = async (groupedDataArray: any[]) => {
  // Iterate over each section
  const updatedSections = await Promise.all(
    groupedDataArray.map(async (section: any) => {
      // For each item in the section
      const updatedItems = await Promise.all(
        section.items.map(async (item: any) => {
          // Check if item has a question object with config
          if (item.questionType === "apicall") {
            // If the question has an 'answer' key
            // Fetch data from API using config
            const apiResult = await fetchDataFromApiCall(item.config);
            // Replace the answer with the API result

            let result1: string = "";

            apiResult.forEach((option: any) => {
              const { id, name } = option.option;
             
              if (id == item.answer) {
                result1 = name;
              }
            });

            return {
              ...item,
              answer: result1, // Update the answer with the fetched data
            };
          }
          // If no update needed, return item as is
          return item;
        }),
      );
      // Return the updated section with updated items
      return {
        ...section,
        items: updatedItems,
      };
    }),
  );
  return updatedSections;
};

const ALWAYS_VISIBLE_BINDING_KEYS = ['goodiesTshirtSize', 'goodiesJacketSize','ratriaPillarLocation'];

export const areDependenciesSatisfied = (question: any, formData: any) => {
  if (ALWAYS_VISIBLE_BINDING_KEYS.includes(question.bindingKey)) {
    return true;
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
      // Check the dependency based on operator (if provided)
      if (dep.operator) {
        if (dep.operator === "equals") {
          return formData[dep.questionId] == dep.value;
        } else if (dep.operator === "greaterThan") {
          return formData[dep.questionId] > dep.value;
        }
      }
      return formData[dep.questionId] == dep.value;
    }
  });
};

export const getQuestionIdsWhereThequestionIdIsDependedOn = (
  questionId: string,
  questionMapList: ProgramQuestionMap[],
) => {
  const dependedOnQuestionIds = questionMapList?.filter((pqm) => {
      // add validation to check if pqm.question.config.dependsOn exists
      if (!pqm.question?.config?.dependsOn) return false;
      return pqm.question?.config?.dependsOn?.some(
        (dep: any) => dep.questionId === questionId,
      );
    })
    .map((pqm) => pqm.question.id);

  return dependedOnQuestionIds;
};

export const getActionOptions = (
  handleSwapRequest: (row: any) => void, 
  seekerData: any, 
  handleCancelSwap: (row: any) => void,
  handleMarkDefaulter?: (row: any) => void
) => {
  const userRole = getItemInLocalStorage("seekerDetails")?.role || "";
  const options: Array<{ label: string; action: (row: any) => void; imageSource: undefined }> = [];

  // Extract approval status
  const approvals = seekerData?.approvals;
  const latestApprovalStatus =
    Array.isArray(approvals) && approvals.length > 0
      ? approvals[approvals.length - 1]?.approvalStatus
      : undefined;

  // Find the latest swap request by createdAt
  let latestSwapStatus = null;
  if (Array.isArray(seekerData?.swapsRequests) && seekerData.swapsRequests.length > 0) {
    const latestSwap = seekerData.swapsRequests.reduce((latest, current) => {
      return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
    }, seekerData.swapsRequests[0]);
    latestSwapStatus = latestSwap.status;
  }

  // Extract defaulter information
  const isDefaulter = seekerData?.user?.hdbDefaulter;
  const defaultMarkerRole = seekerData?.user?.seekerDefaulter?.defaultMarkerRole?.toLowerCase();

  // RBAC-driven action configuration
  const ACTION_CONFIG = [
    {
      action: textConstant.SWAP_REQUEST_LABEL,
      label: latestSwapStatus === "active" ? SWAP_REQUEST_TITLE.UPDATE_SWAP_REQUEST : SWAP_REQUEST_TITLE.SWAP_REQUEST,
      permissions: [{ action: RESOURCES.REQ_SWAP_SEEKER, operation: "C" }],
      deciderKeys: [
        {
          key: "approvalStatus",
          value: () => latestApprovalStatus?.toLowerCase() === "approved",
        },
      ],
      handler: (row: any) => handleSwapRequest(row),
    },
    {
      action: MENU_ACTION_KEYS.CANCEL_SWAP_REQUEST,
      label: CANCEL_SWAP.TITLE,
      permissions: [{ action: RESOURCES.REQ_SWAP_SEEKER, operation: "C" }],
      deciderKeys: [
        {
          key: "approvalStatus",
          value: () => latestApprovalStatus?.toLowerCase() === "approved",
        },
        {
          key: "swapStatus",
          value: () => latestSwapStatus === "active",
        },
      ],
      handler: (row: any) => handleCancelSwap(row),
    },
    {
      action: MENU_ACTION_KEYS.MARK_DEFAULTER,
      label: ACTION_TYPE_LABELS.MARK,
      permissions: [{ action: RESOURCES.SEEKER_EXPERIENCE, operation: "C" }],
      deciderKeys: [
        {
          key: "isNotDefaulter",
          value: () => !isDefaulter,
        },
      ],
      handler: (row: any) => handleMarkDefaulter?.(row),
    },
    {
      action: MENU_ACTION_KEYS.UNMARK_DEFAULTER,
      label: ACTION_TYPE_LABELS.UNMARK_DEFAULTER,
      permissions: [{ action: RESOURCES.SEEKER_EXPERIENCE, operation: "U" }],
      deciderKeys: [
        {
          key: "isDefaulter",
          value: () => isDefaulter,
        },
        {
          key: "canUnmarkDefaulter",
          value: () => {
            // Can unmark if:
            // 1. (defaultMarkerRole is not current user role AND defaultMarkerRole is not MAHATRIA) OR
            // 2. Current user role is MAHATRIA
            const isMahatria = userRole === ROLES.MAHATRIA;
            const canUnmark = (defaultMarkerRole !== userRole && defaultMarkerRole !== ROLES.MAHATRIA.toLowerCase()) || isMahatria;
            return canUnmark;
          },
        },
      ],
      handler: (row: any) => handleMarkDefaulter?.(row),
    },
  ];

  // Dynamically build options based on configuration
  ACTION_CONFIG.forEach((actionConfig) => {
    // Permission check
    let hasPerm = true;
    if (Array.isArray(actionConfig.permissions) && actionConfig.permissions.length > 0) {
      hasPerm = actionConfig.permissions.every((perm: any) =>
        hasPermission(userRole, perm.action, perm.operation)
      );
    }

    // Evaluate all deciderKeys
    const deciders = Array.isArray(actionConfig.deciderKeys) ? actionConfig.deciderKeys : [];
    const shouldShow = deciders.length === 0
      ? true
      : deciders.every((decider: any) => {
          if (typeof decider.value === "function") {
            return decider.value(); // Call function without parameters
          }
          return seekerData[decider.key] === decider.value;
        });

    if (hasPerm && shouldShow) {
      options.push({
        label: actionConfig.label,
        action: actionConfig.handler,
        imageSource: undefined,
      });
    }
  });

  return options;
};

// Remove this export - call it in the component instead
// export const menuActionsBasedOnRoles = getOptions();

/**
 * Adds payment-related fields to the payment section data
 * @param fetchedMergedGroupedDataBySection - The merged grouped data by section
 * @param seekerDetails - The seeker details containing payment information
 * @param PAYMENT_STATUSES - Payment status constants
 * @returns Updated section data with payment fields
 */
export const addPaymentFieldsToSection = (
  fetchedMergedGroupedDataBySection: any[],
  seekerDetails: any,
  PAYMENT_STATUSES: Record<string, { value: string; label: string }>,
) => {
  return fetchedMergedGroupedDataBySection?.map((section: any) => {
    if (section?.sectionName?.toLowerCase().includes("payment")) {
      // Find matching payment status label
      const paymentStatusLabel =
        Object.values(PAYMENT_STATUSES).find(
          (status) =>
            status.value === seekerDetails?.paymentDetails?.[0]?.paymentStatus,
        )?.label || "-";
        

      // Add payment related fields to the items array
      const updatedItems = [
        ...section.items,
        // Only add payment ID fields if payment mode is online
        ...(seekerDetails?.paymentDetails?.[0]?.paymentMode === "online"
          ? [
              {
                questionId: `${crypto.randomUUID()}${CryptoTrailText}`,
                questionLabel: "Payment ID",
                questionType: "text",
                sectionId: section.sectionId,
                sectionName: section.sectionName,
                sectionOrder: section.sectionOrder,
                answer: seekerDetails?.paymentDetails?.[0]?.id || "-",
              },
              {
                questionId: `${crypto.randomUUID()}${CryptoTrailText}`,
                questionLabel: "Razorpay Payment ID",
                questionType: "text",
                sectionId: section.sectionId,
                sectionName: section.sectionName,
                sectionOrder: section.sectionOrder,
                answer: seekerDetails?.paymentDetails?.[0]?.razorpayId || "-",
              },
            ]
          : []),
        {
          questionId: `${crypto.randomUUID()}${CryptoTrailText}`,
          questionLabel: "Payment Status",
          questionType: "text",
          sectionId: section.sectionId,
          sectionName: section.sectionName,
          sectionOrder: section.sectionOrder,
          answer: paymentStatusLabel,
        },
      ];

      return {
        ...section,
        items: updatedItems,
      };
    }
    return section;
  });
};

//Hanlding the visibility of the Mark Payment as Received card
export const showMarkPaymentAsReceivedCard = (
  paymentStatus: boolean,
  reSendInvoice: boolean,
  userRole: string,
  invoicePdfLink: string,
) => {
  // debugger
  if (paymentStatus || reSendInvoice) {
    if (hasPermission(userRole, "MARK_AS_PAID_RESEND_INVOICE", "R")) {
      return true;
    } else if (
      userRole?.includes("relational_manager") &&
      invoicePdfLink?.length > 0
    ) {
      return true;
    } else {
      return false;
    }
  }
};

// Add the function to get registration status
export const getRegistrationStatus = async (
  registrationId: number,
  dispatch : any
): Promise<ProgramDetails> => {
  try {
    const response = await getCall(
      `registration/${registrationId}/statuses`,
      undefined,
      PORTAL,
    );
    if (response?.data?.statusCode === 200) {
       dispatch(setTravelStatus(response.data.data.travelStatus));
      return response.data.data;
    }
    throw new Error("Failed to get registration status");
  } catch (error) {
    console.error("Error getting registration status:", error);
    throw error;
  }
};

/**
 * Maps sectionKey to the corresponding status value from registrationStatus.
 * @param sectionKey - The sectionKey from groupedDataBySection
 * @param registrationStatus - The status object returned from the API
 * @returns The status value for the section, or null if not found
 */
export const getSectionStatus = (
  sectionKey: string,
  registrationStatus: any,
): string | null => {
  const getCombinedStatus = (fields: string[], requireAllCompleted: boolean = false) => {
    const values = fields.map((f) => registrationStatus?.[f]).filter(Boolean);
    if (values.length === 0) return STEPPER_STATUSES.NOT_STARTED;
    
    if (requireAllCompleted) {

      const allCompleted = values.every(
        (v) => typeof v === "string" && v.includes("completed")
      );

      const anyCompleted = values.some(
        (v) => typeof v === "string" && v.includes("completed")
      );

      const anyPending = values.some(
        (v) => typeof v === "string" && v.includes("pending")
      );

      if (allCompleted && values.length === fields.length) {
        return STEPPER_STATUSES.COMPLETED;
      }
      if (anyPending || anyCompleted) {
        return STEPPER_STATUSES.PENDING;
      }
      return STEPPER_STATUSES.NOT_STARTED;
    }

    // Default behavior: any one completed means section is completed
    if (values.some((v) => typeof v === "string" && v.includes("completed")))
      return STEPPER_STATUSES.COMPLETED;
    if (values.some((v) => typeof v === "string" && v.includes("pending")))
      return STEPPER_STATUSES.PENDING;
    return values[0] || STEPPER_STATUSES.NOT_STARTED;
  };

  switch (sectionKey) {
    case "FS_BASICDETAILS":
      return getCombinedStatus(["basicDetailsRegistrationStatus"]);

    case "FS_PAYMENTINVOICE":
      return getCombinedStatus(["paymentStatus", "invoiceStatus"]);
    case "FS_TRAVELPLAN":
      return getCombinedStatus(["travelInfoStatus", "travelPlanStatus"], true);
    case "FS_MAHATRIAQUESTIONS":
      return getCombinedStatus(["basicDetailsRegistrationStatus"]);
    case "FS_GOODIES":
      return getCombinedStatus(["goodiesStatus"]);
    default:
      return "not started";
  }
};

export const getPaymentStatusFromData = (data: any[]) => {
  try {
    // Find the section with sectionName "Payment & Invoice"
    const paymentSection = data.find(
      (section) => section.sectionName === "Payment & Invoice",
    );

    if (!paymentSection || !paymentSection.items) {
      return null;
    }

    // Find the item with questionLabel "Payment Status"
    const paymentStatusItem = paymentSection.items.find(
      (item) => item.questionLabel === "Payment Status",
    );

    if (!paymentStatusItem) {
      return null;
    }

    return paymentStatusItem.answer;
  } catch (error) {
    console.error("Error extracting payment status:", error);
    return null;
  }
};

export const getSeekerProfileKeys = async (seekerId: string) => {
  try {
    const response = await getCall(`${endPoints.getSeekerProfileKeys(seekerId)}`, undefined, PORTAL);
    if (response?.data?.statusCode === 200) {
      return response.data.data;
    } else {
      console.error("Error fetching seeker profile keys:", response?.data?.message);
      return null
    }
  } catch (error) {
    console.error("Error fetching seeker profile keys:", error);
    return null

  }
}

async function validateUsingPostalAPI(
  pincode: string,
  gstNumber: string,
): Promise<boolean | null> {
  try {
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`,
    );
    const data = await response.json();

    const result = data?.[0];

    if (result?.Status === "Error" || !result?.PostOffice) {
      return null; // fallback to next API
    }

    const stateName = result.PostOffice?.[0]?.State;

    const gstCodeOfState = stateGstCodes.find(
      (item: any) => item?.stateName === stateName,
    );

    const stateCode = gstCodeOfState?.code ?? "";
    return gstCodeOfState ? gstNumber.startsWith(stateCode) : false;
  } catch (error) {
    console.error("Postal API error:", error);
    return null; // fallback
  }
}

// Validate using Google API (make sure to add your API key)
async function validateUsingGoogleAPI(
  pincode: string,
  gstNumber: string,
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&components=country:IN&key=${process.env.REACT_APP_GEOAPIFY_API_KEY}`,
    );
    const data = await response.json();

    const addressComponents = data?.results?.[0]?.address_components ?? [];

    const stateComponent = addressComponents.find((component: any) =>
      component.types.includes("administrative_area_level_1"),
    );

    const stateShortName = stateComponent?.short_name;
    const stateLongName = stateComponent?.long_name;

    const gstCodeOfState = stateGstCodes.find(
      (item: any) =>
        item.state === stateShortName || item.stateName === stateLongName,
    );

    const stateCode = gstCodeOfState?.code ?? "";
    return gstCodeOfState ? gstNumber.startsWith(stateCode) : false;
  } catch (error) {
    console.error("Google API error:", error);
    return false;
  }
}

// Main GST validation function
export async function validateGSTNumber(
  pincode: string,
  gstNumber: string,
): Promise<boolean> {
  // Try using the Postal Pincode API first
  const isValidUsingPostalAPI = await validateUsingPostalAPI(
    pincode,
    gstNumber,
  );

  if (isValidUsingPostalAPI !== null) {
    return isValidUsingPostalAPI;
  }

  // Fallback to Google Geocoding API
  return await validateUsingGoogleAPI(pincode, gstNumber);
}

// TDS validation function
export const validateTdsAmount = (
  enteredTds: number,
  seekerDetails: any,
): string | null => {
  if (!seekerDetails?.allocatedProgram || !seekerDetails?.paymentDetails?.[0]) {
    return null;
  }

  const tdsPercent = Number(seekerDetails.allocatedProgram.tdsPercent) || 0;
  const tdsApplicability = seekerDetails.allocatedProgram.tdsApplicability;
  const baseAmount =
    Number(seekerDetails.paymentDetails[0].originalAmount) || 0;
  const gstPercent = Number(seekerDetails.allocatedProgram.gstPercent) || 0;
  const gstAmount = (baseAmount * gstPercent) / 100;
  const tdsAmountOnBaseAmount = (baseAmount * tdsPercent) / 100;
  const tdsAmountOnGst = (gstAmount * tdsPercent) / 100;

  if (enteredTds < 0) {
    return "TDS amount cannot be negative";
  } else if (tdsApplicability === "base_only") {
    if (enteredTds > tdsAmountOnBaseAmount) {
      return `TDS amount cannot exceed ${tdsAmountOnBaseAmount}`;
    }
  } else if (tdsApplicability === "base_plus_tax") {
    if (enteredTds > tdsAmountOnBaseAmount + tdsAmountOnGst) {
      return `TDS amount cannot exceed ${tdsAmountOnBaseAmount + tdsAmountOnGst}`;
    }
  }

  return null;
};

export const getAllocatedProgamPrice = (
  userRegistration: any,
) => {
  if (userRegistration) {
    if (userRegistration?.program.isGroupedProgram) {
      console.log(
        "userRegistration?.allocatedProgram?.allocatedProgram",
        userRegistration?.allocatedProgram?.basePrice,
      );
      return {
        price: userRegistration?.allocatedProgram?.basePrice,
        program: userRegistration?.allocatedProgram,
      };
    } else if (
      userRegistration?.program?.noOfSession != undefined &&
      userRegistration?.program?.noOfSession != null &&
      userRegistration?.program?.noOfSession > 0
    ) {
      console.log(
        "userRegistration?.allocatedProgram?.programSession",
        userRegistration?.allocatedProgram?.basePrice,
      );
      return {
        price: userRegistration.programSession?.basePrice,
        program: userRegistration.programSession,
      };
    } else {
      console.log(
        "userRegistration?.allocatedProgram?.basePrice",
        userRegistration?.allocatedProgram?.basePrice,
      );
      return {
        price: userRegistration?.program?.basePrice,
        program: userRegistration?.program,
      };
    }
  } else return null;
};

// Add these utility functions at the top of your file
export const stringToNumber = (value: any): number => {
  if (typeof value === 'string') {
    return parseFloat(value) || 0;
  }
  return Number(value) || 0;
};

export const getCalculatedAmount = (
  basePrice: number,
  tdsAmount: number,
  gstPercentage: number = 18, // Default GST percentage
  tdsApplicability: string = "base_only" // Default TDS applicability
) => {
  const taxFee = basePrice * (gstPercentage / 100);
  let totalAmount = 0;
  
  if (tdsApplicability === "base_only") {
    // TDS applied only on base amount
    totalAmount = basePrice - tdsAmount + taxFee;
  } else {
    // TDS applied on base + tax (as percentage)
    const taxTdsAmount = taxFee * (tdsAmount / 100);
    totalAmount = basePrice - taxTdsAmount + taxFee;
  }
  
  return Math.round(totalAmount);
};

// function to trim and capitalize the full value
export const trimAndCapitalize = (value: string): string => {
    if (!value) return "";
    return value.trim().toUpperCase();
};

// Common utility functions
// export const stringToNumber = (value: any): number => {
//   if (value === null || value === undefined || value === '') return 0;
//   const num = parseFloat(String(value));
//   return isNaN(num) ? 0 : num;
// };

export const formatIndianCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN').format(amount);
};

// Price calculation functions
export const getAllocatedProgramPrice = (seekerDetails: any) => {
  if (seekerDetails) {
    if (seekerDetails?.allocatedProgram?.isGroupedProgram) {
      return {
        price: stringToNumber(seekerDetails?.allocatedProgram?.basePrice),
        program: seekerDetails?.allocatedProgram,
      };
    } else if (
      seekerDetails?.allocatedProgram?.noOfSession !== undefined &&
      seekerDetails?.allocatedProgram?.noOfSession !== null &&
      seekerDetails?.allocatedProgram?.noOfSession > 0
    ) {
      return {
        price: stringToNumber(seekerDetails?.allocatedProgram?.basePrice),
        program: seekerDetails?.allocatedProgram,
      };
    } else {
      return {
        price: stringToNumber(seekerDetails?.allocatedProgram?.basePrice),
        program: seekerDetails?.allocatedProgram,
      };
    }
  }
  return null;
};

export const getInputValues = (
  programDetails: any,
  formData: any,
  sectionName: string,
  toPrefill?: boolean,
) => {
  if (!programDetails) return { finalValue: { value: "0" }, inputValues: [] };

  const adminGST = programDetails?.gstNumber || "";
  
  // Get GST percentages
  const cgst = stringToNumber(programDetails?.cgst) || 0;
  const sgst = stringToNumber(programDetails?.sgst) || 0;
  const igst = stringToNumber(programDetails?.igst) || 0;
  const combinedGst = cgst + sgst;
  
  let gstPercentage = combinedGst;
  let tds = 0;

  // Find GST number from form data
  const gstNumberQuestion = Object.values(formData[sectionName] || {}).find((_, index) => {
    // You'll need to identify GST number field based on your question structure
    // This is a simplified approach - adjust based on your actual data structure
    return false; // Placeholder - implement based on your question binding keys
  });

  // Find TDS amount from form data
  const tdsQuestion = Object.values(formData[sectionName] || {}).find((_, index) => {
    // Similar to GST, find TDS field based on your question structure
    return false; // Placeholder - implement based on your question binding keys
  });

  if (tdsQuestion) {
    tds = stringToNumber(tdsQuestion);
  }

  // Calculate GST based on state comparison
  if (gstNumberQuestion && typeof gstNumberQuestion === 'string') {
    if (gstNumberQuestion.slice(0, 2) === adminGST.slice(0, 2)) {
      gstPercentage = combinedGst; // Same state
    } else {
      gstPercentage = igst; // Different state
    }
  }

  const basePrice = stringToNumber(programDetails?.basePrice);
  const taxFee = basePrice * (gstPercentage / 100);
  
  let totalAmount = 0;
  const tdsApplicability = programDetails?.tdsApplicability;
  
  if (tdsApplicability === "base_only") {
    totalAmount = basePrice - tds + taxFee;
  } else {
    const taxTdsAmount = taxFee * (tds / 100);
    totalAmount = basePrice - taxTdsAmount + taxFee;
  }

  const inputValues = [
    {
      label: "Fee",
      value: `INR ${formatIndianCurrency(Math.round(basePrice))}`,
    },
    {
      label: `GST @${gstPercentage}%`,
      value: `INR ${formatIndianCurrency(Math.round(taxFee))}`,
    },
    {
      label: "TDS",
      value: `INR - ${formatIndianCurrency(Math.round(tds))}`,
    },
  ];

  const finalValue = {
    label: "Amount to be Paid",
    value: toPrefill
      ? `${Math.round(totalAmount)}`
      : `INR ${formatIndianCurrency(Math.round(totalAmount))}`,
  };

  return { finalValue, inputValues };
};

export const getPrice = (seekerDetails: any, formData: any, sectionName: string, option: string) => {
  if (option !== "Cash") {
    return true;  // Non-Cash options always shown
  }
  
  const result = getAllocatedProgramPrice(seekerDetails);
  const program = result?.program;
  
  if (!program) return false;
  
  const { finalValue } = getInputValues(program, formData, sectionName, true);
  return stringToNumber(finalValue?.value) <= 150;
}