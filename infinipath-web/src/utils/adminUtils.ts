import { OptionFormData, OptionMap } from "../types/option";
import {
  Question,
  QuestionConfig,
  QuestionFormData,
  QuestionPayload,
} from "../types/question";
import { ApiQuestion } from "../types/question";
import { questionStatus } from "../constants";
import { COMMON_FORM_FIELDS } from "../constants/textConstants";

export const modifyResponseForTable = (data: unknown) => {
  const modifiedData = data.map((item: unknown) => {
    return {
      id: item?.userId,
      firstName: item?.firstName,
      lastName: item?.lastName,
      mobile: item?.phoneNumber,
      email: item?.email,
      address: item?.otherAddress ? item?.otherAddress : item?.address,
      profileUrl: item?.profileUrl,
      dob: item?.dob || 0,
      typeOfRegistration: item?.isPanelist ? "Video" : "Non-Video",
      countryCode: item?.countryCode,
      joinUrl: item?.joinUrl,
    };
  });

  return modifiedData;
};



/**
 * Maps question row data to form data structure
 * @param row Question row data from grid
 * @returns Formatted question form data
 */
export const mapQuestionRowToFormData = (
  row: QuestionPayload,
): QuestionFormData => {

  return {
    question: row.name, // Assuming 'title' is the correct property in 'Question'
    type: row.type,
    category: row.categoryId || "",
    displayLabel: row.config?.displayLabel || "",
    validationRule: row.config?.validationRule || [],
    placeholder: row.config?.placeholder || "",
    minChars: row.config?.minChars,
    maxChars: row.config?.maxChars,
    minValue: row.config?.minValue,
    maxValue: row.config?.maxValue,
    enableOtherOption: row.config?.enableOtherOption || false,
    sectionDetails: {
      id: row.formSection?.id || null,
      name: row.formSection?.name || "",
    },
    options:
      row.options?.map((optionMap) => ({
        id: optionMap?.option?.id,
        label: optionMap?.option?.id.toString(),
        optionCategory: [],
        createdAt: optionMap?.option?.createdAt,
        updatedAt: optionMap?.option?.updatedAt,
      })) || [],
  };
};

/**
 * Maps option data to the required format
 * @param optionMap Raw option data from API
 * @returns Formatted option data
 */
export const mapOptionData = (optionMap: OptionMap) => ({
  id: optionMap?.option?.id,
  label: optionMap?.option?.id.toString(),
  optionCategory: [],
  createdAt: optionMap?.option?.createdAt,
  updatedAt: optionMap?.option?.updatedAt,
});

/**
 * Maps an array of options to the required format
 * @param options Array of raw option data
 * @returns Array of formatted options
 */
export const mapOptionsArray = (options: OptionMap[] = []) =>
  options?.map(mapOptionData) || [];

/**
 * Formats API question data into the application's Question format
 * @param apiQuestion Question data from API
 * @returns Formatted Question object
 */
export const formatApiQuestion = (apiQuestion: ApiQuestion): Question => ({
  id: apiQuestion.id,
  name: apiQuestion.label,
  type: apiQuestion.type || "Not specified",
  status: apiQuestion.status || questionStatus.draft,
  formSection: apiQuestion?.formSection || null,
  config: {
    displayLabel: apiQuestion.label,
    maxChars: apiQuestion.config?.maxChars,
    minChars: apiQuestion.config?.minChars,
    isMandatory: apiQuestion.config?.isMandatory || false,
    placeholder: apiQuestion.config?.placeholder,
    validationRule: apiQuestion.config?.validationRule || [],
    minValue: apiQuestion.config?.minValue,
    maxValue: apiQuestion.config?.maxValue,
    enableOtherOption: apiQuestion.config?.enableOtherOption || false,
    options: apiQuestion.config?.options || [],
  },
  createdBy: apiQuestion.createdBy?.id,
  updatedBy: apiQuestion.updatedBy?.id,
  options: apiQuestion.questionOptionMaps || [],
});

/**
 * Formats an array of API questions
 * @param apiQuestions Array of questions from API
 * @returns Array of formatted Question objects
 */
export const formatQuestions = (apiQuestions: ApiQuestion[]): Question[] => {
  return apiQuestions?.map(formatApiQuestion) || [];
};

/**
 * Creates question payload from form data
 * @param data Form data
 * @param userId User ID
 * @param questionCategoryId Category ID
 * @param processedOptions Processed options array
 * @returns Question payload
 */
export const createQuestionPayload = (
  data: QuestionFormData,
  userId: number,
  questionCategoryId: string,
  processedOptions: number[],
  regex: string 
): QuestionPayload => {
  const config: QuestionConfig = {
    displayLabel: data?.displayLabel,
    isMandatory: data.isMandatory || false,
    isDisabled: data.isDisabled || false,
    isMultiple: false,
    validationRule: {
      pattern: regex ,
      message:  "",
    }
  };

  // Add text/textarea specific config
  if (data.type === "text" || data.type === "textarea") {
    config.placeholder = data.placeholder;
    config.minChars = Number(data.minChars);
    config.maxChars = Number(data.maxChars);
  }

  // Add number/rating specific config
  if (data.type === "number" || data.type === "rating") {
    config.minValue = Number(data.minValue);
    config.maxValue = Number(data.maxValue);
  }

  // Add file specific config
  if (data.type === "file") {
    config.supportedFileTypes = data.fileTypes;
  }

  // Add options specific config
  if (["radio", "checkbox", "dropdown"].includes(data.type)) {
    config.enableOtherOption = data.enableOtherOption;
    config.options = processedOptions;
  }

  return {
    name: data.question,
    type: data.type,
    categoryId: questionCategoryId === "Other" ? null : questionCategoryId,
    createdBy: parseInt(userId),
    updatedBy: parseInt(userId),
    formSection: data.sectionDetails,
    config,
  };
};

/**
 * Creates option payload based on form data and status
 */
export const createOptionPayload = (
  data: OptionFormData,
  categoryId: number,
) => ({
  name: data.name,
  type: data.type,
  status: isDuplicating
    ? COMMON_FORM_FIELDS.STATUS.PUBLISHED
    : COMMON_FORM_FIELDS.STATUS.DRAFT,
  category: data.category,
  categoryId: categoryId,
  createdBy: userId,
  updatedBy: userId,
});


  // Utility function to clean and trim value
  export const normalizeAadharValue = (val: string) => val.replace(/\s+/g, "").trim().slice(0, 12);

//based on seeker details, decide if an option should be shown
  export const shouldShowOption = (optionName: string, seekerDetails:any) => {
    if (optionName === "Cash" && seekerDetails?.allocatedProgram?.basePrice > 200000) {
      return false;
    }
    return true;
  };