
import { useCallback, useEffect, useState } from "react";
import { getCall } from "../services/apiService";
import { SECTION_KEYS } from "../constants/textConstants";
import profile1 from "../assets/images/profile1.png";
import profile2 from "../assets/images/profile2.png";
import profile3 from "../assets/images/profile3.png";
import profile4 from "../assets/images/profile4.png";
import profile5 from "../assets/images/profile5.png";
import { CardData } from "../pages/SeekerExperience";
import { getItemInLocalStorage } from "../services/localStorage";
import { PROGRAM_ID, LOCAL_STORAGE_KEYS} from "../constants/textConstants";
import { getSeekerDetailsById } from "../pages/RegisteredSeekersDetails/service";

export interface ProgramRegistration {
  id: string;
  program: {
    id: number;
    name: string;
    requiresApproval?: boolean;
    requiresPayment?: boolean;
    involvesTravel?: boolean; // can be removed
    isTravelInvolved?: boolean;
    noOfSession?: number;
    limitedSeats?: boolean;
    isGroupedProgram?: boolean; // For grouped programss
  };
  userId: string | null;
  fullName: string;
  programRegistrationSeqNumber?: string | null;
  waitingListSeqNumber?: string | null;
  mobileNumber: string;
  emailAddress: string;
  registrationStatus: string;
  basicDetailsStatus: string;
  invoiceDetails?: any[];
  paymentDetails?: any[];
  approvals?: any[];
  travelInfo?: any[];
  travelPlans?: any[];
  registrationDate: string | null;
  allocatedProgram?: Program | null; // For grouped programs
  isFreeSeat?: boolean; // For free seats
  programSession?: Program | null; // For programs with multiple sessions
}

export interface userRegistration {
  id: string;
  program: {
    id: number;
    name: string;
    requiresApproval?: boolean;
    requiresPayment?: boolean;
    involvesTravel?: boolean; // can be removed
    isTravelInvolved?: boolean;
    noOfSession?: number;
    limitedSeats?: boolean;
    isGroupedProgram?: boolean; // For grouped programss
  };
  fullName: string;
  userId?: string | null;
  registrationSeqNumber?: string | null;
  programRegistrationSeqNumber?: string | null;
  waitingListSeqNumber?: string | null;
  mobileNumber: string;
  emailAddress: string;
  registrationStatus: string;
  basicDetailsStatus: string;
  registrationDate: string | null;
  isFreeSeat?: boolean; // For free seats
  travelInfo: any[];
  travelPlans: any[];
  invoiceDetails: any[];
  paymentDetails: any[];
  approvals?: any[];
  allocatedProgram?: Program | null; // For grouped programs
  programSession?: Program | null; // For programs with multiple sessions
}
export interface Program {
  id: number;
  programId: number;
  name: string;
  code: string;
  description: string;
  startDate: string;
  endDate: string;
  basePrice: string;
  currency: string;
  status: string;
  availableSeats: number;
  duration: string;
  type: {
    id: number;
    name: string;
  };
  sgst?: string;
  cgst?: string;
  igst?: string;
  gstNumber?: string;
}

export interface mahatriaChoiceConfig {
  allowMahatriaChoice: boolean;
  mahatriaChoicetText: string;
}
export interface Question {
  id: number;
  label: string;
  type: string;
  bindingKey: string;
  config: {
    isDisable?: boolean;
    isDefaultValue?: boolean;
    allowMahatriaChoice?: boolean;
    minYears?: number;
    maxYears?: number;
    isRequired?: boolean;
    minCharacter?: number;
    maxCharacters?: number;
    futureDateValidation?: string;
    pastDateValidation?: string;
    mahatriaChoiceConfig?: mahatriaChoiceConfig;
    minValue?: number;
    maxValue?: number;
    validationPattern?: string;
    apiUrl?: string; // For API calls
    category?: string;
    conditionalFields?: number[];
    startDate?: string | null;
    endDate?: string | null;
    allowedDigits?: number;
    helperText?: string;
    prefill?: {
      prefillFrom?: number;
      prefillIf?: {
        questionId: number;
        value: string | number | boolean;
      }[];
      prefillType?: string;
      prefillValue?: string;
    };
    dateTypeValidation?: "static" | "dynamic" | "custom";
    dateValidationType?: "static" | "dynamic";
    futureValidation?: DateValidation;
    pastValidation?: DateValidation;
    patternErrorMsg?: string;
    showDialogMessage:
      | {
          type: string;
          isShow: boolean | string;
          imageName: string | null;
          contentType: string | null;
          dialogueContent: string | null;
        }[]
      | null;
    showDialog?: {
      type: string;
      isShow: boolean | string;
      imageName: string | null;
      contentType: string | null;
      dialogueContent: string | null;
    } | null;
    dependsOn?: {
      questionId: number;
      operator?: string;
      value: string | number | boolean;
      questionBindingKey: string;
      transformedMinValue?: number;
      transformedMaxValue?:number;
      type?: string;
    }[];
  };
  formSection: {
    id: number;
    name: string;
    description: string;
  };
  questionOptionMaps: Array<{
    option: {
      id: number;
      name: string;
    };
  }>;
}
export interface Section {
  id: number;
  name: string;
  description: string;
  displayOrder: number;
  key: string;
}

export interface ProgramQuestionMap {
  id: number;
  question: Question;
  registrationLevel: string;
  displayOrder: number;
  programQuestionFormSection: Section;
}

export interface ProgramDetails {
  id: number;
  name: string;
  code: string;
  bannerImageUrl?: string;
  description: string;
  basePrice: string;
  currency: string;
  requiresApproval: boolean | null;
  duration: string;
  startDate: string;
  checkinAt: string;
  checkoutAt: string;
  checkinEndsAt: string;
  modeOfOperation: string;
  limitedSeats: boolean;
  startsAt?: string;
  endsAt?: string;
  involvesTravel?: boolean;
  noOfSession?: number;
  isGroupedProgram: boolean;
  registrationStartsAt: string;
  bannerAnimationUrl?: string;
  meta: {
    price: { [key: string]: number };
  };
  type: {
    maxSessionDurationDays: number;
    requiresApproval: boolean;
    requiresPayment: boolean;
    involvesTravel: boolean;
    name: string;
    waitlistApplicable: boolean;
    venue: string;
    meta: {
      price: any;
    };
    isGroupedProgram?: boolean;
    key?: string;
  };
  statusMessage?: { message: string[]; state: string };
  registrationId?: string | null;
  blessesProgram?: Program | null;
  sessions: Program[];
  programQuestionMaps: ProgramQuestionMap[];
  groupedPrograms: Program[];
  gstNumber?: string;
  registrationWindowStatus: string;
  cgst?: string;
  sgst?: string;
  igst?: string;
}

export interface DateValidation {
  unit: "year" | "months" | "days";
  enabled: boolean;
  maxValue?: number | null;
  minValue?: number | null;
  dateValidationField?: string | null;
}
export interface FormResponse {
  [key: string]: any;
}

interface RegistrationState {
  programDetails: unknown | null;
  groupedAnswersData: { [key: number]: GroupedQuestion } | null;
  userStatus: userRegistration | null;
  groupedQuestionsForm: unknown;
  bindingKeyHashMap: { [key: string]: number } | null; // Map of questionId to bindingKey and value
  QuestionIdHashMap: { [key: number]: string } | null;
  loading: boolean;
  apiError: string[] | null;
  registrationData?: ProgramRegistration | null;
}

const initialState: RegistrationState = {
  programDetails: null,
  groupedAnswersData: null,
  userStatus: null,
  groupedQuestionsForm: null,
  bindingKeyHashMap: null,
  QuestionIdHashMap: null,
  loading: true,
  apiError: null,
  registrationData: null,
};

const fetchApiOptions = async (apicallPQMs: ProgramQuestionMap[]) => {
  // try {
  // You may want to store the endpoint in pqm.question.config or elsewhere
  // For demo, let's assume pqm.question.config.apiEndpoint exists
  const apiEndpoint = apicallPQMs[0].question.config?.apiUrl;
  if (!apiEndpoint) return Promise.resolve();
  await getCall(apiEndpoint, undefined, "portal")
    .then((response) => {
      if (response?.data?.statusCode === 200) {
        console.log(
          "API options fetched successfully:API options fetched successfully:",
          response.data.data,
        );
        const lookUpData = response.data.data;
        // Map API response to questionOptionMaps format
        for (const pqm of apicallPQMs) {
        pqm.question.questionOptionMaps =
        pqm.question.config?.category ?
        lookUpData[pqm.question.config?.category].map(
          (item: any, idx: number) => {
           return {
              option: {
                id: item.key,
                name: item.value,
              },
            };
          }
        ): [];
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching API options:", error);
    });
};



const getGroupedQuestions = async (
  programDetails,
  userDetails,
  registrationId,
  prefillData,
) => {
  if (!programDetails) return {};
  let prefilledanswersData = [];
  const apicallPQMs: ProgramQuestionMap[] = [];
  const bindingKeyHashMap:{ [key: string]: number } = {};
  const QuestionIdHashMap:{ [key: number]: string } = {};
  const grouped = programDetails.programQuestionMaps.reduce(
    (acc, pqm: ProgramQuestionMap) => {
      var sectionId = pqm.programQuestionFormSection.id;
      if (sectionId == 4) {
        sectionId = 1;
      }
      if (!acc[sectionId]) {
        acc[sectionId] = {
          section: pqm.programQuestionFormSection,
          hasData: [],
          needData: [],
          questions: [],
          subSection: [],
        };
      }
      bindingKeyHashMap[pqm.question.bindingKey] = pqm.question.id;
      QuestionIdHashMap[pqm.question.id] = pqm.question.bindingKey
      if (pqm.question.type === "apicall") {
        console.log(
          "API options fetched successfully: console",
          pqm.question.questionOptionMaps,
        );
        // Only fetch if not already loaded
        if (
          !pqm.question.questionOptionMaps ||
          pqm.question.questionOptionMaps.length === 0
        ) {
          apicallPQMs.push(pqm);
        }
      }

      const hasUserData =
        registrationId && userDetails[sectionId] != null
          ? Object.entries(userDetails[sectionId]).filter(([key, value]) => {
              return key == pqm.question.id;
            })
          : [];
      const hasPrefilledData =
        prefillData && prefillData[pqm.question.bindingKey] != null
          ? {
              questionId: pqm.question.id,
              questionLabel: pqm.question.label,
              sectionId:
                pqm.programQuestionFormSection.key == SECTION_KEYS.MAHATRIA
                  ? 1
                  : pqm.programQuestionFormSection.id,
              sectionName: pqm.question.formSection.name,
              answer: prefillData[pqm.question.bindingKey],
            }
          : null;
      if (hasPrefilledData) {
        prefilledanswersData.push(hasPrefilledData);
      }
      if (pqm.programQuestionFormSection.key == SECTION_KEYS.MAHATRIA) {
        acc[sectionId].subSection.push(pqm);
      } else if ((hasUserData.length > 0 || hasPrefilledData) && !(pqm.question.bindingKey === "preference" && pqm.question.type === "draganddrop")) {
        acc[sectionId].hasData.push(pqm);
      } else {
        acc[sectionId].needData.push(pqm);
      }
      if (pqm.programQuestionFormSection.key !=  SECTION_KEYS.MAHATRIA) {
        acc[sectionId].questions.push(pqm);
      }
      return acc;
    },
    {} as {
      [key: number]: {
        section: any;
        hasData: ProgramQuestionMap[];
        needData: ProgramQuestionMap[];
        questions: ProgramQuestionMap[];
        subSection?: ProgramQuestionMap[];
      };
    },
  );

  console.log(programDetails.programQuestionMaps , "groupedgrouped")
  if(apicallPQMs.length >0){
    await fetchApiOptions(apicallPQMs);
  }
  // for (const pqm of apicallPQMs) {
  //   await fetchApiOptions(pqm);
  // }
  Object.values(grouped).forEach((group) => {
    group.hasData.sort((a, b) => a.displayOrder - b.displayOrder);
    group.needData.sort((a, b) => a.displayOrder - b.displayOrder);
    group.questions.sort((a, b) => a.displayOrder - b.displayOrder);
    group.subSection.sort((a, b) => a.displayOrder - b.displayOrder);
  });
  // Pre-populate form data with existing user data
  const newFormData: FormResponse = {};
  Object.values(grouped).forEach((group) => {
    group.hasData.forEach((pqm) => {
      if (pqm.question.bindingKey && userDetails[pqm.question.bindingKey]) {
        newFormData[pqm.question.id] = userDetails[pqm.question.bindingKey];
      }
    });
  });
  return { grouped, prefilledanswersData, bindingKeyHashMap, QuestionIdHashMap };
};


export const groupRegistrationQuestions = (
  questions: RegistrationQuestion[],
): { [key: number]: GroupedQuestion } => {
  const grupedAnswers = questions.reduce(
    (grouped, question) => {
      const { sectionId, questionId, answer } = question;
      var secId = sectionId;
      if (secId == 4) {
        secId = 1; // Adjust sectionId if it is 4
      }
      if (!grouped[secId]) {
        grouped[secId] = {};
      }

      // Add the question answer with questionId as key
      grouped[secId][questionId] = answer;

      return grouped;
    },
    {} as { [key: number]: GroupedQuestion },
  );

  return grupedAnswers;
};

export const getProgramRegistration = (
  programId: number,
  registrations: ProgramRegistration[],
): ProgramRegistration | undefined => {
  // const registration = registrations.find(reg => reg.program.id === programId);
  return registrations.find(
    (reg) => reg.program.id == programId && reg.userId != null,
  );
};


export function getProgramIdFromAnySource(location: { pathname: string }) {
  // Priority 1: From localStorage
  const storedId = getItemInLocalStorage(PROGRAM_ID);
  if (storedId) return storedId;

  // Priority 2: From current URL
  const match = location.pathname.match(/\/admin\/hdb-dashboard\/(\d+)/);
  if (match && match[1]) return match[1];

  // Priority 3: Last visited program ID
  const lastProgramId = getItemInLocalStorage(LOCAL_STORAGE_KEYS.LAST_VISITED_PROGRAM_ID);
  if (lastProgramId) return lastProgramId;

  return null;
}


const getProgramDetails = (
  programId: number,
  registrations: ProgramRegistration[],
): userRegistration | null => {
  const registration = getProgramRegistration(programId, registrations);

  if (!registration) {
    return null;
  }

  return {
    id: registration.id,
    program: registration.program,
    fullName: registration.fullName,
    programRegistrationSeqNumber:
      registration.programRegistrationSeqNumber || null,
    waitingListSeqNumber: registration.waitingListSeqNumber || null,
    mobileNumber: registration.mobileNumber,
    emailAddress: registration.emailAddress,
    registrationStatus: registration.registrationStatus,
    basicDetailsStatus: registration.basicDetailsStatus,
    registrationDate: registration.registrationDate,
    travelInfo: registration.travelInfo || [],
    approvals: registration.approvals || [],
    travelPlans: registration.travelPlans || [],
    isFreeSeat: registration.isFreeSeat || false,
    invoiceDetails: registration.invoiceDetails || [],
    paymentDetails: registration.paymentDetails || [],
    allocatedProgram: registration.allocatedProgram || null, // For grouped programs
    programSession: registration.programSession || null, // For programs with multiple sessions
  };
};

export const mergedPrefilledData = (
  prefilledAnswersData: RegistrationQuestion[] | null,
  groupedAnswersData: { [key: number]: GroupedQuestion } | null,
): { [key: number]: GroupedQuestion } => {
  if (!prefilledAnswersData || !groupedAnswersData)
    return groupedAnswersData || {};
  Object.entries(prefilledAnswersData).forEach(([key, value]) => {
    var sectionId = value.sectionId;
    console.log("sectionIdprefilledAnswersData", sectionId);
    if (sectionId == 4) {
      sectionId = 1;
    }
    if (!groupedAnswersData[sectionId]) {
      groupedAnswersData[sectionId] = {};
      groupedAnswersData[sectionId][value.questionId] = value.answer;
    } else {
      if (!groupedAnswersData[sectionId][value.questionId]) {
        groupedAnswersData[sectionId][value.questionId] = value.answer;
      }
    }
  });
  console.log(
    "sectionIdprefilledAnswersData groupedAnswersData",
    groupedAnswersData,
  );
  return groupedAnswersData;
};

export const useRegistrationData = (programId: string, seekerId: string) => {
  const [state, setState] = useState<RegistrationState>(initialState);

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      if(!seekerId ){
        setState((prev) => ({ ...prev, apiError: ["Seeker ID is missing"], loading: false }));
        return ;
      }
      const registrationResponse = await getCall(
        `user/${seekerId}/registrations?programId=${programId}`,
        undefined,
        "portal", // user registration status
      );

      const registrationData = registrationResponse?.data?.data?.data;
      const registrationId = registrationData?.[0]?.id;

      // Then fetch all data in parallel including registration questions
      const [programResponse, prefillResponse, registrationAnswersResponse] =
        await Promise.all([
          getCall(`program/${programId}`, undefined, "portal"), // api to render form
          getCall(`user/${seekerId}/prefill`, undefined, "portal"), // prefill data for the user
          registrationId
            ? getCall(
                `registration/${registrationId}/questions`,
                undefined,
                "portal",
              )
            : Promise.resolve(null), // user entered answers
        ]);

      const prefillData = prefillResponse?.data.data;
      const programData = programResponse?.data?.data;
      // const userData = userResponse?.data?.data;
      const answersData = registrationAnswersResponse?.data.data;
      console.log("answersData", answersData);
      const groupedAnswersData = registrationId
        ? groupRegistrationQuestions(answersData)
        : {};
     console.log(programData, "programDataprogramData", groupedAnswersData, prefillData);
      const { grouped, prefilledanswersData, bindingKeyHashMap, QuestionIdHashMap } =
        await getGroupedQuestions(
          programData,
          groupedAnswersData,
          registrationId,
          prefillData,
        );

      const groupedPrefilledAnswersData = mergedPrefilledData(
        prefilledanswersData,
        groupedAnswersData,
      );
      console.log("groupedPrefilledAnswersData", prefilledanswersData);

      const userStatus = getProgramDetails(Number(programId), registrationData);

      setState((prev) => ({
        ...prev,
        programDetails: programData,
        groupedAnswersData: groupedPrefilledAnswersData,
        userStatus: userStatus,
        bindingKeyHashMap: programData ? bindingKeyHashMap : null,
        QuestionIdHashMap: programData? QuestionIdHashMap : null,
        // Pass questionsData instead of userData to getGroupedQuestions
        groupedQuestionsForm: programData ? grouped : null,
        registrationData: registrationData[0] ? registrationData[0] : null,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        apiError: ["error"],
        loading: false,
      }));
    }
  }, [programId, seekerId]);

  useEffect(() => {
    seekerId && fetchData();
  }, [seekerId]);

  return {
    ...state,
    refetch: fetchData,
  };
};

export const formatText = (text: string): string => {
    return text
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
};

const defaultProfileImages = [profile4, profile1, profile2, profile5, profile3];
export const getdefaultProfileIcon = (index: number) => {
  return defaultProfileImages[index % defaultProfileImages.length];
};

  // Transform API response to CardData format
 export const transformToCardData = (data: any[]): CardData[] => {
    return data.map((item) => ({
      createdAt: item.createdAt,
      id: item.id,
      message: item.message,
      firstName: item.registration?.fullName?.split(" ")[0] || "",
      lastName: item.registration?.fullName?.split(" ").slice(1).join(" ") || "",
      mediaType: item.type,
      mediaUrl: item.mediaUrl,
      profileIcon: item.registration?.profileUrl || "",
      isPrivate: item.isPrivate,
      isViewed: item.isViewed,
      allocatedProgramName: item?.registration?.allocatedProgram?.name || undefined,
      allocatedProgramId: item?.registration?.allocatedProgramId || undefined,
    }));
  };

/**
 * Transform new optionConfig format to old questionOptionMaps format
 * @param question - Question object that may have optionConfig or questionOptionMaps
 * @returns Question object with questionOptionMaps in the old format
 */
export const transformQuestionOptions = (question: any) => {
  if (!question) return question;

  // Helper function to determine type from value
  const getTypeFromValue = (value: any): string => {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'string';
  };

  // If question has optionConfig (new format), transform it to questionOptionMaps
  if (question?.optionConfig && Array.isArray(question?.optionConfig)) {
    question.questionOptionMaps = question?.optionConfig?.map((option: any) => ({
      option: {
        id: option?.value !== undefined ? option.value : option?.name, // Use value as id if available
        name: option?.name,
        type: option?.type !== undefined && option?.type !== null 
          ? (typeof option.type === 'string' ? option.type : String(option.type))
          : (option?.value !== undefined ? getTypeFromValue(option.value) : "string"),
      },
    }));
    // Keep optionConfig for backward compatibility
  }

  // If question already has questionOptionMaps, ensure it's in the correct format
  if (question?.questionOptionMaps && Array.isArray(question?.questionOptionMaps)) {
    // Check if it's already in the old format (with nested option)
    const hasNestedOption = question?.questionOptionMaps?.some((item: any) => item?.option);
    
    // If it doesn't have nested option, it might be in the new format
    if (!hasNestedOption && question?.questionOptionMaps?.some((item: any) => item?.name)) {
      question.questionOptionMaps = question?.questionOptionMaps?.map((option: any) => ({
        option: {
          id: option?.value !== undefined ? option.value : option?.name,
          name: option?.name,
          type: option?.type !== undefined && option?.type !== null
            ? (typeof option.type === 'string' ? option.type : String(option.type))
            : (option?.value !== undefined ? getTypeFromValue(option.value) : "string"),
        },
      }));
    }
  }

  return question;
};