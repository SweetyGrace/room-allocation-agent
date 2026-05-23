import React, { lazy } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "./index.module.scss";
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useRef, useCallback } from "react";
import {
  getAllquestionsFromProgram,
  getApiCallData,
  getGroupNames,
  getRegistrationQuestionsById,
  getSeekerDetailsById,
  groupDataBySection,
  groupProgramQuestionsBySection,
  groupQuestionsByFormSectionName,
  handleAWSFileUpload,
  handleSendInvoice,
  mergeSections,
  omitFields,
  omitFieldsFromProgramQuestionMap,
  transformFormDataToPayload,
  ValidateAllSections,
  areDependenciesSatisfied,
  getQuestionIdsWhereThequestionIdIsDependedOn,
  getActionOptions,
  addPaymentFieldsToSection,
  showMarkPaymentAsReceivedCard,
  getRegistrationStatus,
  getSectionStatus,
  getSeekerProfileKeys,
  validateGSTNumber,
  getCalculatedAmount,
  stringToNumber,
  markSeekerAsPaid,
  getPaymentStatusFromData,
} from "./service";
import { GroupedQuestion, ProgramDetails, StepperItem } from "./types";
import Loader from "../../common/components/Loader";
import VerticalStepper from "../../components/RegisteredSeekerDetailsCards/Stepper";
import { endPoints, PORTAL } from "../../constants/urlConstants";
import { getCall, getCallWithLoader, postCallWithLoader, putCallWithLoader } from "../../services/apiService";
import MarkAsPaidCard from "../../common/components/MarkAsPaid";
import { getItemInLocalStorage } from "../../services/localStorage";
import { hasPermission, RESOURCES, ROLES } from "../../utils/roleBasedAccess";
import RatingsCard from "../../components/RatingsCard";
import HorizontalStepper from "../../common/components/HorizantalStepper";
import { transformApiDataToStepperData } from "../../common/components/HorizantalStepper/Horizantal";
import MessageSection from "../../components/MessageSection";
import DropdownMenu from "../../common/components/KebabMenu";
import { swapTypeOptions, WARNING } from "../../constants";
import {
  ACTION_TYPE_LABELS,
  CANCEL_SWAP,
  FILTER_TYPES,
  MODE,
  PAYMENT_STATUSES,
  PROGRAM_TYPE,
  SECTION_KEYS,
  SECTION_NAME,
  SEEKER_ASSOCIATION,
  SWAP_REQUEST_LABEL,
  textConstant,
  TravelFormText,
} from "../../constants/textConstants";
import { notify } from "../../common/components/ToastMessage";
import SeekerProfileCard from "../../components/SeekerProfileCard";
import {
  BINDINGKEYS,
  LABELS,
  profile_binding_keys,
  TYPES,
} from "../../constants/seekerdetails";
import { ProgramQuestionMap } from "./types";
import { formateYearDate } from "../../utils/commonFunctions";
import TimelineChart from "../../common/components/ExperienceChart";
import { colorizeMahatriaInfinitheism } from "../../common/components/ColorizeMahatriaInfinitheism";
import { ApiService } from "../../services/mockService";
import { useRegistrationData } from "../../utils/registrationUtils";
import CardRenderer from "../../components/RegisteredSeekerDetailsCards/CardRenderer";
import DefaulterTrackingSection from "../../components/DefaulterTrackingSection";
import { fetchDefaulterTrackingData as fetchDefaulterTracking } from "../../services/registration";
import { DefaulterTrackingItem } from "../../types/registration";
import { decrementLoader, incrementLoader } from "../../reducers/ProgramReducer";
import { RootState } from "../../store";
import { setSeekerDetails } from "../../reducers/SeekerReducer";
import EInvoiceError from "../../common/components/EInvoiceError";

// Lazy load overlay components
const ReviewOverlay = lazy(() => import("../../components/RatingOverLay"));
const SwapFilterOverlay = lazy(() => import("../../common/components/SwapFilterContent"));
const AlertPopup = lazy(() => import("../../common/components/AlertPopup"));
const DefaulterOverlay = lazy(() => import("../../common/components/DefaulterOverlay"));

const RegisteredSeekerDetails = () => {
  const userRole = getItemInLocalStorage("seekerDetails")?.role || "";
  const getTravelStatus = useSelector((state: RootState) => state.ProgramReducer.travelStatus);
  const { seekerId, programId } = useParams<{
    seekerId: string;
    programId: string;
  }>();
  const dispatch = useDispatch()
  // Create refs for each section
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const horizontalStepperRef = useRef<HTMLDivElement | null>(null);
  const timelineChartRef = useRef<HTMLDivElement | null>(null);


  // Data states
  const [data, setData] = useState<any>([]);
  const [rawData, setRawData] = useState<any>([]);
  const [steps, setSteps] = useState<Array<any>>([]);
  const [fullName, setFullName] = useState<string>("");
  const [profileUrl, setProfileUrl] = useState<string>("");
  const [programDetails, setProgramDetails] = useState<ProgramDetails | null>(
    null,
  );
  const [groupedQuestions, setGroupedQuestions] = useState<any>({});
  const [
    dependencyClearedGroupedQuestions,
    setDependencyClearedGroupedQuestions,
  ] = useState<any>({});
  const seekerDetails:any = useSelector((state:RootState) => state.seekerReducer?.seekerDetails);
  const seekerStatus = seekerDetails?.paymentDetails || [];
  // Not used: 03/02/2026
  // const [groupedQuestionsFromHook, setGroupedQuestionsFromHook] = useState<any>(null);
  const seekerProfileId =   seekerDetails?.user?.id;
  
  // Call the hook but handle null values
  const { groupedAnswersData, groupedQuestionsForm } = useRegistrationData(
    programId || "", 
    seekerProfileId
  );
  const loader = useSelector((state:RootState) => state.ProgramReducer.loaderCounts.largeLoaderCount);

  // Not used: 03/02/2026
  // Handle the hook data when it becomes available
  // useEffect(() => {
  //   if (groupedQuestionsForm && Object.keys(groupedQuestionsForm).length > 0) {
  //     setGroupedQuestionsFromHook(groupedQuestionsForm);
  //   }
  // }, [groupedQuestionsForm]);

  useEffect(() => {
    const fetchSeekerDetails = async () => {
      const seekerDetails = await getSeekerDetailsById(seekerId!, true);
      dispatch(setSeekerDetails(seekerDetails));
    };
    fetchSeekerDetails();
  }, [])


  const [formData, setFormData] = useState<{ [key: number]: GroupedQuestion }>(
    groupedAnswersData || {},
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [editModes, setEditModes] = useState<
    Array<{ sectionName: string; editMode: boolean }>
  >([]);

  // Not used: 03/02/2026
  // const [programsList, setProgramsList] = useState<any>([]);
  // const [swapDetails, setSwapDetails] = useState<any>([]);
  // const [swappedTo, setSwappedTo] = useState<any>({});
  const [ratings, setRatings] = useState<unknown>([]);
  const [rmReview, setRmReview] = useState<string>("");
  const [stepperData, setStepperData] = useState<unknown>([]);
  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
  const [dynamicProgramOptions, setDynamicProgramOptions] = useState<any[]>([]);
  // UI states
  const [activeStep, setActiveStep] = useState(0);
  const [activeOverlayType, setActiveOverlayType] = useState<string | null>("");
  const [reviewInitialRatings, setReviewInitialRatings] = useState<{
    [key: string]: { rating: number; id?: number };
  }>({});
  const [reviewInitialComments, setReviewInitialComments] = useState("");
  const [rawQuestionsData, setRawQuestionsData] = useState<any>([]);
  const [paymentMarkDate, setPaymentMarkDate] = useState<Date | null>(null);
  const [invoicePdfLink, setInvoicePdfLink] = useState<{url:string , name:string}>({url:"", name:""});
  const [invoiceErrorRefresh, setInvoiceErrorRefresh] = useState<number>(0);
  const [registrationStatus, setRegistrationStatus] = useState<any>([]);
  const [reviewInitialRecommendations, setReviewInitialRecommendations] =
    useState<any>(null);
  const [prevRating, setprevRating] = useState<any>({});
  const [recommendations, setRecommendations] = useState<any>({});
  const [swapDisabled, setSwapDisabled] = useState<boolean>(false);
  const [resetUpload, setResetUpload] = useState<number>(0);
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(false);
  const [bindingKeyToQuestionId, setBindingKeyToQuestionId] = useState<
    Record<string, number>
  >({});
  const [seekerProfileDetails, setSeekerProfileDetails] = useState<
    Record<string, any>
  >({});
  const [isFreeSeat, setIsFreeSeat] = useState<boolean>(false);
  const [seekerProfileQuestions, setSeekerProfileQuestions] = useState(null);
  const [openSectionsWithKeys, setOpenSectionsWithKeys] = useState<Array<{sectionName: string, sectionKey: string}>>([]);
  const [activeSwapRequest, setActiveSwapRequest] = useState<any>();
  const [manuallyChangedAirline, setManuallyChangedAirline] = useState<string | null>(null);
  const [defaulterTrackingData, setDefaulterTrackingData] = useState<DefaulterTrackingItem[]>([]);
  const [seekerExperiences, setSeekerExperiences] = useState<any[]>([]); // Generated by Copilot
  const [timelineRefreshKey, setTimelineRefreshKey] = useState<number>(0);

  const getDefaultValue = (question: any, seekerData: any, formData: any) => {
    const config = question.config?.defaultValue;
    if (!config) return null;
    

    try {
      // Check conditions in priority order
      const sortedConditions = [...(config.conditions || [])].sort((a, b) => a.priority - b.priority);
      
      for (const condition of sortedConditions) {
        let conditionMatch = true;
        
        // Check each criteria in the condition
        for (const [bindingKey, operators] of Object.entries(condition.criteria)) {
          let actualValue: any;
          
          // Get value from seekerData first (for base fields like no_of_hdbs, QK_LAST_HDB, etc.)
          if (seekerData && seekerData[bindingKey] !== undefined) {
            actualValue = seekerData[bindingKey];
          } 
          // Then check using bindingKeyToQuestionId mapping
          else if (bindingKeyToQuestionId && bindingKeyToQuestionId[bindingKey]) {
            const questionId = bindingKeyToQuestionId[bindingKey];
            // Search across all sections in formData
            for (const sectionName in formData) {
              if (formData[sectionName] && formData[sectionName][questionId] !== undefined && formData[sectionName][questionId] !== "") {
                actualValue = formData[sectionName][questionId];
                break;
              }
            }
          }
          // Finally, direct search in formData for dependent fields
          else {
            for (const sectionName in formData) {
              if (formData[sectionName]) {
                const sectionQuestions = dependencyClearedGroupedQuestions[sectionName] || [];
                for (const pqm of sectionQuestions) {
                  if (pqm.question.bindingKey === bindingKey) {
                    const qId = pqm.question.id;
                    if (formData[sectionName][qId] !== undefined && formData[sectionName][qId] !== "") {
                      actualValue = formData[sectionName][qId];
                      break;
                    }
                  }
                }
                if (actualValue !== undefined) break;
              }
            }
          }
          
          
          // Skip this condition if actualValue is undefined, null, or empty
          if (actualValue === undefined || actualValue === null || actualValue === "") {
            conditionMatch = false;
            break;
          }
          
          // Check all operators for this binding key (ALL must pass)
          let bindingKeyMatch = true;
          for (const [operator, expectedValue] of Object.entries(operators as any)) {
            
            let operatorMatch = false;
            
            // Handle different operator types
            switch (operator) {
              case "equals":
                operatorMatch = actualValue == expectedValue;
                break;
              case "greaterThan":
                operatorMatch = compareValues(actualValue, expectedValue, ">");
                break;
              case "lessThan":
                operatorMatch = compareValues(actualValue, expectedValue, "<");
                break;
              case "greaterThanOrEqual":
                operatorMatch = compareValues(actualValue, expectedValue, ">=");
                break;
              case "lessThanOrEqual":
                operatorMatch = compareValues(actualValue, expectedValue, "<=");
                break;
              default:
                console.warn(`Unknown operator: ${operator}`);
                operatorMatch = false;
            }
            
            if (!operatorMatch) {
              bindingKeyMatch = false;
              break;
            }
          }
          
          if (!bindingKeyMatch) {
            conditionMatch = false;
            break;
          }
        }
        
        if (conditionMatch) {
          return condition.value;
        }
      }
      
      return config.fallback;
    } catch (error) {
      console.error(`Error evaluating default value for ${question.bindingKey}:`, error);
      return config.fallback || null;
    }
  };

  // Helper function to compare values, handling special cases like year ranges
  const compareValues = (actualValue: any, expectedValue: any, operator: string): boolean => {
    try {
      // Handle year range comparisons (e.g., "2016-2017")
      if (typeof expectedValue === "string" && expectedValue.includes("-")) {
        const expectedYear = parseInt(expectedValue.split("-")[0]);
        let actualYear: number;
        
        if (typeof actualValue === "string" && actualValue.includes("-")) {
          actualYear = parseInt(actualValue.split("-")[0]);
        } else {
          actualYear = parseInt(actualValue);
        }
        
        if (isNaN(expectedYear) || isNaN(actualYear)) {
          console.warn(`Invalid year comparison: ${actualValue} vs ${expectedValue}`);
          return false;
        }
        
        switch (operator) {
          case ">":
            return actualYear > expectedYear;
          case "<":
            return actualYear < expectedYear;
          case ">=":
            return actualYear >= expectedYear;
          case "<=":
            return actualYear <= expectedYear;
          default:
            return false;
        }
      }
      
      // Handle numeric comparisons
      const numActual = Number(actualValue);
      const numExpected = Number(expectedValue);
      
      if (!isNaN(numActual) && !isNaN(numExpected)) {
        switch (operator) {
          case ">":
            return numActual > numExpected;
          case "<":
            return numActual < numExpected;
          case ">=":
            return numActual >= numExpected;
          case "<=":
            return numActual <= numExpected;
          default:
            return false;
        }
      }
      
      // Handle string comparisons (lexicographic)
      const strActual = String(actualValue);
      const strExpected = String(expectedValue);
      
      switch (operator) {
        case ">":
          return strActual > strExpected;
        case "<":
          return strActual < strExpected;
        case ">=":
          return strActual >= strExpected;
        case "<=":
          return strActual <= strExpected;
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error comparing values: ${actualValue} ${operator} ${expectedValue}`, error);
      return false;
    }
  };

  useEffect(() => {
    if (seekerDetails?.swapsRequests && Array.isArray(seekerDetails.swapsRequests)) {
      const foundActiveRequest = seekerDetails.swapsRequests.find(
        (request: any) => request.status === "active"
      );
      setActiveSwapRequest(foundActiveRequest || null);
    } else {
      setActiveSwapRequest(null);
    }
  }, [seekerDetails]);

  useEffect(() => {
    const options = getActionOptions(
      () => handleOpenSwap(seekerDetails),
      seekerDetails,
      () => handleCancelSwap(seekerDetails)
    );
    const swapOption = options.find((item) => item.label === SWAP_REQUEST_LABEL);
    setSwapDisabled(!!swapOption?.disabled);
  }, [seekerDetails]);

  // Check if registration is free seat
  useEffect(() => {
    if (seekerDetails?.isFreeSeat) {
      setIsFreeSeat(true);
    } else {
      setIsFreeSeat(false);
    }
  }, [seekerDetails]);

  // Update the alert state type definition
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string | string[];
    type: string;
    cancelSwap?: boolean;
    onConfirm?: (reason?: string) => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    onReupload?: () => void;
  }>({ open: false, message: [], type: "" });

  // Function to trigger upload reset
  const triggerUploadReset = () => {
    setResetUpload((prev) => prev + 1);
  };

  // Helper function to clear form field value for file uploads
  const clearFormFieldValue = (
    questionId: string,
    sectionName: string,
    bindingKey: string,
  ) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [sectionName]: {
        ...prevFormData[sectionName],
        [questionId]: null,
      },
    }));
    if (bindingKey === "pictureUrl") {
      const questions = groupedQuestions[sectionName] as any;
      if (questions && questions.length) {
        const match = questions.find(
          (pqm: any) =>
            pqm.question && pqm.question.bindingKey === "travelInfoNumber",
        );
        if (match) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            [sectionName]: {
              ...prevFormData[sectionName],
              [match.question.id]: "",
            },
          }));
        }
      }
    } else {
      const questions = groupedQuestions[sectionName] as any;
      if (questions && questions.length) {
        if (isRoundTrip) {
          const dependedOnQuestionIds = questions
            .filter((pqm) => {
              // add validation to check if pqm.question.config.dependsOn exists
              if (!pqm.question?.config?.dependsOn) return false;
              return pqm.question?.config?.dependsOn?.some(
                (dep: any) => dep.value === "Flight",
              );
            })
            .map((pqm) => pqm.question.id);

          dependedOnQuestionIds.forEach((dependentQuestionId) => {
            setFormData((prevFormData) => ({
              ...prevFormData,
              [sectionName]: {
                ...prevFormData[sectionName],
                [dependentQuestionId]: "",
              },
            }));
          });
        } else {
          const currentQuestion = questions.find(
            (question) => question.question?.id == questionId,
          );
          if (currentQuestion) {
            const dependsOnId =
              currentQuestion.question.config.dependsOn[0].questionId;
            const dependedOnQuestionIds = questions
              .filter((pqm) => {
                // add validation to check if pqm.question.config.dependsOn exists
                if (!pqm.question?.config?.dependsOn) return false;
                return pqm.question?.config?.dependsOn?.some(
                  (dep: any) => dep.questionId == dependsOnId,
                );
              })
              .map((pqm) => pqm.question.id);

            dependedOnQuestionIds.forEach((dependentQuestionId) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                [sectionName]: {
                  ...prevFormData[sectionName],
                  [dependentQuestionId]: "",
                },
              }));
            });
          }
        }
      }
    }

    // Reset round trip state when clearing flight ticket uploads
    if (
      bindingKey === "uploadOnwardJourneyTicket" ||
      bindingKey === "uploadReturnJourneyTicket"
    ) {
      setIsRoundTrip(false);
    }
  };

  // Not used: 03/02/2026
  // State to track manual airline changes
  // const [isManualAirlineChange, setIsManualAirlineChange] = useState<boolean>(false);

  // Helper to pre-fill form fields from extract-details API response
  const prefillFormFromExtractedDetails = (
    apiData: any,
    sectionName: string,
    questions: any[],
    isUploadTrigger: boolean = true,
  ) => {
    if (
      !apiData ||
      !apiData.data ||
      !apiData.data.data ||
      !apiData.data.data.data
    )
      return;
    const { tripType, segments } = apiData.data.data.data;
    if (!segments || !Array.isArray(segments) || segments.length === 0) return;
    // Build a map of bindingKey to questionId
    // const bindingKeyToQuestionId: Record<string, number> = {};
    // questions.forEach((pqm: any) => {
    //   if (pqm.question && pqm.question.bindingKey) {
    //     bindingKeyToQuestionId[pqm.question.bindingKey] = pqm.question.id;
    //   }
    // });
    const newFormData = { ...formData };
    if (tripType === "one-way") {
      // Use only the first segment
      const segment = segments[0];
      Object.keys(segment).forEach((key) => {
        if (bindingKeyToQuestionId[key]) {
          if (!newFormData[sectionName]) newFormData[sectionName] = {};
          newFormData[sectionName][bindingKeyToQuestionId[key]] = segment[key];
        }
      });
      setIsRoundTrip(false);
    } else if (tripType === "round-trip") {
      // Use only the first onward and first return segment
      const onwardSeg = segments.find((seg) => seg.type === "onward");
      const returnSeg = segments.find((seg) => seg.type === "return");
      if (onwardSeg) {
        Object.keys(onwardSeg).forEach((key) => {
          if (bindingKeyToQuestionId[key]) {
            if (!newFormData[sectionName]) newFormData[sectionName] = {};
            newFormData[sectionName][bindingKeyToQuestionId[key]] =
              key.includes("Date") ? new Date(onwardSeg[key]).toISOString() : onwardSeg[key];
          }
        });
      }
      if (returnSeg) {
        Object.keys(returnSeg).forEach((key) => {
          if (bindingKeyToQuestionId[key]) {
            if (!newFormData[sectionName]) newFormData[sectionName] = {};
            newFormData[sectionName][bindingKeyToQuestionId[key]] =
              key.includes("Date") ? new Date(returnSeg[key]).toISOString() : returnSeg[key];
          }
        });
      }
      newFormData[sectionName][bindingKeyToQuestionId["travelPlanOnward"]] =
        "Flight";
      newFormData[sectionName][bindingKeyToQuestionId["travelPlanReturn"]] =
        "Flight";
      setIsRoundTrip(true);
    }
    setFormData(newFormData);
  };

  const navigate = useNavigate();
  const location = useLocation();

  const openRatings = location?.state?.openRatings;

  useEffect(() => {
    if (openRatings) {
      handleAddReview();
    }
  }, [openRatings]);

  // Memoized function to fetch seeker data
  const getSeekerRegistrationDetails = useCallback(async () => {
    if (!seekerId || !programId) return;

    try {
      dispatch(incrementLoader(textConstant.LARGE ));

      // Parallel API calls for better performance
      const [registrationData, programData] = await Promise.all([
        getRegistrationQuestionsById(seekerId),
        getAllquestionsFromProgram(parseInt(programId, 10))
      ]);
      setRawData(registrationData || []);
      const seekerProfileId = seekerDetails?.user?.id;
      const seekerProfileKeys = seekerProfileId && await getSeekerProfileKeys(seekerProfileId)
      // Set basic seeker info
      setRatings(seekerDetails?.ratings || []);
      setRecommendations(seekerDetails?.recommendation[0] || {});
      const stepperDataTransformed =
        transformApiDataToStepperData(seekerDetails, getTravelStatus);
      setStepperData(stepperDataTransformed);
      setSeekerDetails(seekerDetails);
      setRmReview(seekerDetails?.rmReview || "");
      const bindingKeyHashMap: Record<string, number> = {};
      let seekerProfileQuestionsList: ProgramQuestionMap[] = [];
      programData?.programQuestionMaps.forEach((pqm: any) => {
        if (pqm.question && pqm.question.bindingKey) {
          bindingKeyHashMap[pqm.question.bindingKey] = pqm.question.id;
        }
      });
      seekerProfileQuestionsList.sort(
        (a, b) => a.displayOrder - b.displayOrder,
      );
      
      const seekerProfileQuestionIds: Record<string, string> = {};
      const seekerProfileAnswers: Record<string, string> = {};
      profile_binding_keys &&
        Object.entries(profile_binding_keys).forEach(([key, value]) => {
          if (key != "id" && bindingKeyHashMap[key]) {
            seekerProfileQuestionIds[key] = bindingKeyHashMap[key].toString();
            seekerProfileAnswers[key] =

              registrationData.filter(
                (item: any) =>
                  key != "id" && item.questionId == bindingKeyHashMap[key],
              )[0] || null;
              seekerProfileQuestionsList.push(
                programData?.programQuestionMaps.find(
                  (pqm: any) =>
                    pqm.question &&
                    pqm.question.bindingKey === key,
                ));
          }
        });

      // seekerProfileQuestionIds[BINDINGKEYS.RMCONTACT] =
      //   bindingKeyHashMap[BINDINGKEYS.RMCONTACT]?.toString() || "";
      // seekerProfileAnswers[BINDINGKEYS.RMCONTACT] =
      //   registrationData.filter(
      //     (item: any) =>
      //       item.questionId == bindingKeyHashMap[BINDINGKEYS.RMCONTACT],
      //   )[0] || null;
      // seekerProfileQuestionIds[BINDINGKEYS.NOOFHDBS] =
      //   bindingKeyHashMap[BINDINGKEYS.NOOFHDBS]?.toString() || "";
      // seekerProfileAnswers[BINDINGKEYS.NOOFHDBS] =
      //   registrationData.filter(
      //     (item: any) =>
      //       item.questionId == bindingKeyHashMap[BINDINGKEYS.NOOFHDBS],
      //   )[0] || null;
      // seekerProfileQuestionIds[BINDINGKEYS.OTHERINFITHEISMCONTACT] =
      //   bindingKeyHashMap[BINDINGKEYS.OTHERINFITHEISMCONTACT]?.toString() || "";
      // seekerProfileAnswers[BINDINGKEYS.OTHERINFITHEISMCONTACT] =
      //   registrationData.filter(
      //     (item: any) =>
      //       item.questionId ==
      //       bindingKeyHashMap[BINDINGKEYS.OTHERINFITHEISMCONTACT],
      //   )[0] || null;
      if (registrationData?.length !== 0) {
         const fieldsToOmit = [
            (userRole !== ROLES.SHOBA && userRole !== ROLES.RM && userRole !== ROLES.ADMIN) && TYPES.DRAGNDROP,
            BINDINGKEYS.TERMS,
            LABELS.UPLOAD_VIDEO,
            // ...Object.values(seekerProfileQuestionIds),
          ];
          if (userRole == ROLES.MAHATRIA || userRole == ROLES.SHOBA) {
            // fieldsToOmit = ["draganddrop"];
            const index = fieldsToOmit.indexOf("Upload video");
            if (index > -1) {
              fieldsToOmit.splice(index, 1); // Remove "Upload video" from the array
            }
          }
          console.log(registrationData, "registrationDatass")

// Add this after processing existing registrationData:
// Add sections from groupedQuestionsFromHook to registrationData
// In your useEffect where you process the data, after line 480, add this:
// Add Travel Plan section from groupedQuestionsFromHook
// Add sections from groupedQuestionsFromHook to registrationData
if (groupedQuestionsForm && typeof groupedQuestionsForm === 'object') {
  Object.keys(groupedQuestionsForm).forEach((sectionKey) => {
    const hookSection = groupedQuestionsForm[sectionKey];
    
    if (hookSection?.hasData && hookSection?.section && Array.isArray(hookSection.hasData) && hookSection?.section.key === SECTION_KEYS.TRAVELSECTION) {
      const sectionDetails = hookSection.section;
      
      // Transform each question item to match your registrationData format
      const sectionItems = hookSection.hasData.map((item: any) => ({
        answer: seekerProfileKeys[item.question.bindingKey] || "", // Get answer from seekerDetails
        config: item.question.config,
        displayOrder: item.displayOrder,
        questionBindingKey: item.question.bindingKey,
        questionId: item.question.id,
        questionLabel: item.question.label,
        questionType: item.question.type,
        sectionId: sectionDetails.id,
        sectionKey: sectionDetails.key,
        sectionName: sectionDetails.name,
        sectionOrder: sectionDetails.displayOrder,
      }));

      // Add items to registrationData if they don't already exist
      sectionItems.forEach((newItem: any) => {
        const existingItemIndex = registrationData.findIndex(
          (item: any) => 
            item.questionId === newItem.questionId && 
            item.sectionKey === newItem.sectionKey
        );
        
        if (existingItemIndex === -1) {
          registrationData.push(newItem);
        } else {
          // Update existing item but preserve existing answer
          registrationData[existingItemIndex] = {
            ...newItem,
            answer: registrationData[existingItemIndex].answer || newItem.answer
          };
        }
      });
    }
  });
}


        const updatedFieldsData = omitFields(registrationData, fieldsToOmit);
        setRawQuestionsData(programData?.programQuestionMaps || []);
        const fullName = seekerDetails?.fullName || "";
        const yourPicture = seekerDetails?.profileUrl || "";
        const groupedDataBySection = groupDataBySection(
          updatedFieldsData,
          seekerDetails?.paymentDetails[0]?.paymentStatus,
        );
        const registrationStatus = await getRegistrationStatus(Number(seekerId) , dispatch);
        setRegistrationStatus(registrationStatus);
        const updatedProgramQuestionMaps = omitFieldsFromProgramQuestionMap(
          programData.programQuestionMaps,
          fieldsToOmit,
        );
        updatedProgramQuestionMaps.sort(
          (a, b) => a.displayOrder - b.displayOrder,
        );

        const groupedProgramQuestionsBySection = groupProgramQuestionsBySection(
          updatedProgramQuestionMaps,
          seekerDetails?.paymentDetails[0]?.paymentStatus,
        );
        const mergedGroupedDataBySection = mergeSections(
          groupedDataBySection,
          groupedProgramQuestionsBySection,
        );

        const initialEditModes = mergedGroupedDataBySection.map(
          (section: any) => ({
            sectionName: section.sectionName,
            editMode: false,
          }),
        );
        setEditModes(initialEditModes);

        const allGroupNames = getGroupNames(mergedGroupedDataBySection);
        const {fetchApiCalls, fetchProfileAPICalls} = await getApiCallData(updatedProgramQuestionMaps, seekerProfileQuestionsList);
        const groupedQuestionsData =
          groupQuestionsByFormSectionName(fetchApiCalls);

        const initialFormData = groupedDataBySection.reduce(
          (acc: any, section: any) => {
            acc[section.sectionName] = section.items.reduce(
              (sectionAcc: any, item: any) => {
                sectionAcc[item.questionId] = item.answer;
                return sectionAcc;
              },
              {},
            );
            return acc;
          },
          {},
        );


          initialFormData["Basic Details"] = {
            ...initialFormData["Basic Details"],
            ...Object.values(seekerProfileAnswers).reduce((acc: any, item: any) => {
              if (item && item.questionId !== undefined) {
                acc[item.questionId] = item.answer;
              }
              return acc;
            }, {})
          }
        // ADD THIS: Initialize ALL sections with seekerDetails data based on bindingKey matching
        if (groupedQuestions && seekerDetails && seekerProfileKeys) {
          Object.keys(groupedQuestions).forEach((sectionName) => {
            const sectionQuestions = groupedQuestions[sectionName];
            if (sectionQuestions && Array.isArray(sectionQuestions)) {
              // Initialize section if it doesn't exist
              if (!initialFormData[sectionName]) {
                initialFormData[sectionName] = {};
              }
              // Check each question in the section
              sectionQuestions.forEach((pqm: any) => {
                const bindingKey = pqm.question.bindingKey;
                const questionId = pqm.question.id;
                // Check if this bindingKey exists in seekerProfileKeys
                if (bindingKey && seekerProfileKeys.hasOwnProperty(bindingKey)) {
                  // Check if seekerDetails has this property and map it
                  if (seekerDetails && seekerDetails[bindingKey] !== undefined) {
                    initialFormData[sectionName][questionId] = seekerDetails[bindingKey];
                  }
                  // If no existing value, keep any existing form data or set to empty
                  else if (initialFormData[sectionName][questionId] === undefined) {
                    initialFormData[sectionName][questionId] = "";
                  }
                }
              });
            }
          });
        }

        // Not used: 03/02/2026
        // const groupedProgramsList = getGroupedProgramsList(
        //   programData?.groupedPrograms,
        // );
        programData;
        setSeekerProfileQuestions(fetchProfileAPICalls)
        // THIS IS THE KEY FIX - Adding payment fields to section data
        const seekerDetailsData = addPaymentFieldsToSection(
          mergedGroupedDataBySection,
          seekerDetails,
          PAYMENT_STATUSES,
        );

        // Set all state in batch
        setBindingKeyToQuestionId(bindingKeyHashMap);
        setSeekerProfileDetails(seekerProfileAnswers);
        setFullName(fullName);
        setProfileUrl(yourPicture);
        setSteps(allGroupNames);
        setData(seekerDetailsData);
        setProgramDetails(programData);
        setGroupedQuestions(groupedQuestionsData);
        setFormData(initialFormData);
        // Not used: 03/02/2026
        // setProgramsList(groupedProgramsList);
        // setSwapDetails(seekerDetails?.swapsRequests || []);
        // setSwappedTo(seekerDetails?.allocatedProgram);
        setTimelineRefreshKey(prev => prev + 1);

        const startsAt = seekerDetails?.program?.startsAt ? new Date(seekerDetails.program.startsAt) : undefined;
        const years = startsAt ? formateYearDate(startsAt) : '';
                 
        const programName = seekerDetails?.program?.type?.key === 'PT_HDBMSD' ? 'HDB/MSD' : seekerDetails?.program?.code;
        const fileName =  `${programName} ${years} Invoice - ${seekerDetails?.invoiceDetails[0]?.invoiceSequenceNumber || ""}`


        // CRITICAL FIX: Only update invoice link if there's actual invoice data
        // This prevents overwriting the link set by refreshSeekerData with empty values
        if (seekerDetails?.invoiceDetails?.[0]?.invoicePdfUrl) {
          setInvoicePdfLink({
            url: seekerDetails.invoiceDetails[0].invoicePdfUrl,
            name: fileName,
          });
        }

      }
    } catch (error) {
      console.error("Error fetching seeker registration details:", error);
      setSteps([]);
      setData([]);
    } finally {
      // if(groupedQuestionsFromHook){
      dispatch(decrementLoader(textConstant.LARGE));
      // }
      setIsFormSubmitted(false);
    }
  }, [groupedQuestionsForm]); // Only depend on seekerId and programId

  // // Initial data fetch - only runs once when component mounts or params change
  // useEffect(() => {
  //   getSeekerRegistrationDetails();
  // }, [groupedQuestionsForm]);

  // Fetch defaulter tracking data
  const fetchDefaulterTrackingData = useCallback(async () => {
    if (!seekerDetails?.user?.id) return;
    const data = await fetchDefaulterTracking(seekerDetails.user.id);
    setDefaulterTrackingData(data);
  }, [seekerDetails?.user?.id]);

  useEffect(() => {
    if (seekerDetails?.user?.id && hasPermission(userRole, RESOURCES.SEEKER_EXPERIENCE, "R") && seekerDetails?.user?.hdbDefaulter) {
      fetchDefaulterTrackingData();
    }
  }, [seekerDetails?.user?.id, fetchDefaulterTrackingData]);

  // Handle dependency clearing for grouped questions
  useEffect(() => {
    if (
      Object.keys(groupedQuestions).length === 0 ||
      Object.keys(formData).length === 0
    )
      return;

    const updatedGroupedQuestions: any = {};
    Object.keys(groupedQuestions).forEach((sectionName) => {
      updatedGroupedQuestions[sectionName] = groupedQuestions[
        sectionName
      ].filter((pqm: any) => {
        if (pqm.question) {
          return areDependenciesSatisfied(pqm.question, formData[sectionName]);
        }
        return false;
      });
    });

    setDependencyClearedGroupedQuestions(updatedGroupedQuestions);
  }, [formData, groupedQuestions]);

  const onBack = () => {
    navigate(-1);
  };

  const scrollToSection = (sectionName: string) => {
    const targetRef = sectionRefs.current[sectionName];
    if (targetRef) {
      targetRef.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  const scrollToHorizontalStepper = () => {
    if (horizontalStepperRef.current) {
      horizontalStepperRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  useEffect(() => {
    seekerProfileId &&  getSeekerRegistrationDetails();
    if (isFormSubmitted) {
      setIsFormSubmitted(false);
    }
  }, [isFormSubmitted, getTravelStatus, groupedQuestionsForm]);

  // Not used: 03/02/2026
  // const seekerStatusTitle = stepperData?.find((step: StepData) =>
  //   step.title?.includes("Blessed with"),
  // );
  const paymentStatus =
    (seekerStatus[0]?.paymentStatus?.includes("pending") ||
      seekerStatus[0]?.paymentStatus?.includes("failed") ||
      seekerStatus[0]?.paymentStatus?.includes("draft")
    ) &&
    (seekerStatus[0]?.paymentMode === "offline" ||
      seekerStatus[0]?.paymentMode === "online");
  const reSendInvoice = seekerStatus[0]?.paymentStatus?.includes("completed");

  // Replace the existing steps generation logic with this function
const generateStepperItems = (): StepperItem[] => {
  const items: StepperItem[] = [];
  
  // Add sections - filter out FS_PAYMENTINVOICE if it's a free seat and FS_PROFILEDETAILS
  
  data.forEach((section: any) => {
       // Skip FS_PROFILEDETAILS section
    if (section.sectionKey === "FS_PROFILEDETAILS" || section.sectionName === "FS_PROFILEDETAILS") {
      return;
    }  
                 
    if(section.sectionKey === "FS_MAHATRIAQUESTIONS" && userRole === "admin"){  
      return ;
    }
    // Skip payment section for free seats
    if (isFreeSeat && (section.sectionKey === "FS_PAYMENTINVOICE" || section.sectionName === RESOURCES.PAYMENT_DETAILS)) {
      return;
    }
    
    const sectionStatus = getSectionStatus(
      section.sectionKey,
      registrationStatus,
    );
    
    items.push({
      label: section.sectionName,
      componentType: "section",
      sectionName: section.sectionName,
      status: sectionStatus,
      show: true,
    });
  });

  // Add ratings card if condition is met
  if (hasPermission(userRole, "RM_REVIEW", "R")) {
    items.push({
      label: "RM Review",
      componentType: "ratings",
      status: ratings && ratings.length > 0 ? "completed" : "not_started",
      show: true,
    });
  }

  return items.filter((item) => item.show);
};
  // Replace the existing stepLabels and handleStepClick logic
  const stepperItems = generateStepperItems();
  const stepLabels = stepperItems.map((item) => item.label);

  // Update the handleStepClick function to use the new structure
  const handleStepClick = (index: number) => {
    const stepperItem = stepperItems[index];
    if (!stepperItem) return;

    const { componentType, sectionName } = stepperItem;

    switch (componentType) {
      case "horizontal_stepper":
        scrollToHorizontalStepper();
        break;

      case "section":
        if (sectionName) {
          scrollToSection(sectionName);
        }
        break;

      case "payment":
        if (paymentCardRef.current) {
          paymentCardRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
        }
        break;
      case "ratings":
        if (ratingsCardRef.current) {
          ratingsCardRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
        }
        break;
    }
  };

  // Update the status checking functions to use the new structure
  const isCompleted = (index: number) => {
    const item = stepperItems[index];
    return item?.status === "completed";
  };

  const isStepNotStarted = (index: number) => {
    const item = stepperItems[index];
    return item?.status === "not_started";
  };

  const inActive = (index: number) => {
    const item = stepperItems[index];
    return item?.status === "pending";
  };

  const toggleEditMode = (sectionName: string, sectionKey: string) => {
    // First, determine the current state
    const currentSection = editModes.find(
      (mode) => mode.sectionName === sectionName,
    );
    const isCurrentlyOpen = currentSection?.editMode || false;
    const willBeOpen = !isCurrentlyOpen; // After toggle

    if (isCurrentlyOpen) { 
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[sectionName];
        return newErrors;
      });
    }

    // Update edit modes
    setEditModes((prevEditModes) => {
      return prevEditModes.map((mode) =>
        mode.sectionName === sectionName
          ? { ...mode, editMode: !mode.editMode }
          : mode,
      );
    });

    // Update open sections with their keys
    setOpenSectionsWithKeys((prevOpenSections) => {
      if (isCurrentlyOpen) {
        // Section is currently open, so close it (remove from openSections)
        return prevOpenSections.filter(
          (section) => section.sectionName !== sectionName,
        );
      } else {
        // Section is currently closed, so open it (add to openSections)
        return [...prevOpenSections, { sectionName, sectionKey }];
      }
    });

    // Handle form data reset/initialization
    setFormData((prevFormData) => {
      if (willBeOpen) {
        // OPENING edit mode - reset to server data with defaults
        const updatedFormData = { ...prevFormData };

        // Build server data for the section being opened
        const sectionData = data.find(
          (section) => section.sectionName === sectionName,
        );
        if (sectionData.items.length > 0 ) {
          updatedFormData[sectionName] = sectionData.items.reduce(
            (sectionAcc: any, item: any) => {
              sectionAcc[item.questionId] = item.answer;
              return sectionAcc;
            },
            {},
          );
        }

        // Include seekerProfileDetails data for Basic Details/FS_PROFILEDETAILS
        if (
          sectionName === "Basic Details" ||
          sectionName === "FS_PROFILEDETAILS"
        ) {
          const profileData = Object.values(seekerProfileDetails).reduce(
            (acc: any, item: any) => {
              if (item && item.questionId !== undefined) {
                acc[item.questionId] = item.answer;
              }
              return acc;
            },
            {},
          );

          updatedFormData[sectionName] = {
            ...profileData,
            ...updatedFormData[sectionName],
          };
        }

        // Check if any section with FS_GOODIES key will be open after this toggle
        const willHaveGoodiesSection = (() => {
          if (sectionKey === "FS_GOODIES") {
            return true; // This section will be open
          } else {
            // Use current openSectionsWithKeys since we haven't updated it yet
            const futureOpenSections = isCurrentlyOpen
              ? openSectionsWithKeys.filter(
                  (section) => section.sectionName !== sectionName,
                )
              : [...openSectionsWithKeys, { sectionName, sectionKey }];

            return futureOpenSections.some(
              (section) => section.sectionKey === "FS_GOODIES",
            );
          }
        })();

        // Apply FS_GOODIES default values if any section with FS_GOODIES will be open
        if (willHaveGoodiesSection) {
          let goodiesSectionName = sectionName;
          if (sectionKey !== "FS_GOODIES") {
            const existingGoodiesSection = openSectionsWithKeys.find(
              (section) => section.sectionKey === "FS_GOODIES",
            );
            if (existingGoodiesSection) {
              goodiesSectionName = existingGoodiesSection.sectionName;
            }
          }

          // Initialize the section if it doesn't exist
          if (!updatedFormData[goodiesSectionName]) {
            updatedFormData[goodiesSectionName] = {};
          }

          // Apply dynamic default values for goodies section
          const goodiesQuestions = dependencyClearedGroupedQuestions[goodiesSectionName] || [];
          
          goodiesQuestions.forEach((pqm: any) => {
            const question = pqm.question;
            const questionId = question.id;
            
            // Check if server already has a value
            const serverValue = updatedFormData[goodiesSectionName][questionId];
            
            // Only set default if no server value exists or it's empty
            if (!serverValue || serverValue === "") {
              const defaultValue = getDefaultValue(question, seekerDetails, updatedFormData);
              
              if (defaultValue !== null) {
                console.log(`Setting dynamic default for ${question.bindingKey}: ${defaultValue}`);
                updatedFormData[goodiesSectionName][questionId] = defaultValue;
              }
            }
          });
        }

        return updatedFormData;
      } else {
        // CLOSING edit mode - reset to server data (remove unsaved changes)
        const updatedFormData = { ...prevFormData };

        // Reset the closing section to server data
        const sectionData = data.find(
          (section) => section.sectionName === sectionName,
        );
        if (sectionData) {
          updatedFormData[sectionName] = sectionData.items.reduce(
            (sectionAcc: any, item: any) => {
              sectionAcc[item.questionId] = item.answer;
              return sectionAcc;
            },
            {},
          );
        }

        // Include seekerProfileDetails data for Basic Details/FS_PROFILEDETAILS
        if (
          sectionName === "Basic Details" ||
          sectionName === "FS_PROFILEDETAILS"
        ) {
          const profileData = Object.values(seekerProfileDetails).reduce(
            (acc: any, item: any) => {
              if (item && item.questionId !== undefined) {
                acc[item.questionId] = item.answer;
              }
              return acc;
            },
            {},
          );

          updatedFormData[sectionName] = {
            ...profileData,
            ...updatedFormData[sectionName],
          };
        }

        // Handle FS_GOODIES reset when closing - apply dynamic defaults if no server values
        if (sectionKey === "FS_GOODIES") {
          // Reset goodies to server values or dynamic defaults if no server values exist
          if (!updatedFormData[sectionName]) {
            updatedFormData[sectionName] = {};
          }

          // Apply dynamic default values for goodies section when closing
          const goodiesQuestions = dependencyClearedGroupedQuestions[sectionName] || [];
          
          goodiesQuestions.forEach((pqm: any) => {
            const question = pqm.question;
            const questionId = question.id;
            
            // Get server value if it exists
            const serverValue = sectionData?.items.find(
              (item: any) => item.questionId === questionId,
            )?.answer;
            
            if (serverValue) {
              updatedFormData[sectionName][questionId] = serverValue;
            } else {
              // Apply dynamic default if no server value
              const defaultValue = getDefaultValue(question, seekerDetails, updatedFormData);
              if (defaultValue !== null) {
                console.log(`Setting dynamic default on close for ${question.bindingKey}: ${defaultValue}`);
                updatedFormData[sectionName][questionId] = defaultValue;
              }
            }
          });
        }

        return updatedFormData;
      }
    });
  };

  const handleFieldChange = (
    questionId: string,
    value: any,
    sectionName: string,
  ) => {
    let isFileTypeQuestion = groupedQuestions[sectionName]?.find(
      (pqm: any) =>
        pqm.question.id === questionId && pqm.question.type === "file",
    );

    if (!isFileTypeQuestion) {
      isFileTypeQuestion = seekerProfileQuestions?.find(
        (pqm: any) =>
          pqm.question.id === questionId && pqm.question.type === "file",
      );
    }

    // Check if this is a manual airline change
    const currentQuestion = groupedQuestions[sectionName]?.find(
      (pqm: any) => pqm.question.id === parseInt(questionId),
    )?.question;
    
   if (currentQuestion && 
      (currentQuestion.bindingKey === "airlineNameOnward" || 
       currentQuestion.bindingKey === "airlineNameReturn")) {
    setManuallyChangedAirline(currentQuestion.bindingKey);
    
    setTimeout(() => {
      setManuallyChangedAirline(null);
    }, 500);
  }


     if (currentQuestion?.type === FILTER_TYPES.RADIO && currentQuestion?.bindingKey === MODE.PAYMENT) {
    const numQuestionId = parseInt(questionId);
    // Get all questions in section
    const allQuestionsInSection = [
      ...(groupedQuestions[sectionName] || []),
      ...(seekerProfileQuestions || []),
    ];
    // Find all dependent question IDs
    const dependentQuestionIds: number[] = [];
    
    allQuestionsInSection.forEach((pqm: any) => {
      const dependencies = pqm.question?.config?.dependency || pqm.question?.config?.dependsOn;
      if (dependencies && Array.isArray(dependencies)) {
        const dependsOnThisRadio = dependencies.some((dep: any) => {
          const depQuestionId = dep.question || dep.questionId;
          return depQuestionId === numQuestionId;
        });
        
        if (dependsOnThisRadio) {
          dependentQuestionIds.push(pqm.question.id);
        }
      }
    });

    // Clear errors only for dependent questions
    if (dependentQuestionIds.length > 0) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        
        if (newErrors[sectionName]) {
          const newSectionErrors = { ...newErrors[sectionName] };
          
          // Clear errors only for dependent questions
          dependentQuestionIds.forEach((depQuestionId) => {
            delete newSectionErrors[depQuestionId];
                    });
          
          // Update section errors
          if (Object.keys(newSectionErrors).length === 0) {
            delete newErrors[sectionName];
          } else {
            newErrors[sectionName] = newSectionErrors;
          }
        }
        
        return newErrors;
      });
    }
  }

    // Find the current question to check for prefill conditions
    // const currentQuestion =
    //   groupedQuestions[sectionName]?.find(
    //     (pqm: any) => pqm.question.id === parseInt(questionId),
    //   )?.question ||
    //   seekerProfileQuestions?.find(
    //     (pqm: any) => pqm.question.id === parseInt(questionId),
    //   )?.question;

    if (isFileTypeQuestion) {
      const bindingKey = programDetails?.programQuestionMaps.find(
        (pqm) => pqm.question.id === questionId,
      )?.question.bindingKey;
      handleAWSFileUpload(value, seekerDetails?.userId).then((fileUrl) => {
        if (
         (
          // bindingKey === "pictureUrl" ||
          bindingKey === "uploadOnwardJourneyTicket" ||
          bindingKey === "uploadReturnJourneyTicket") 
        ) {
          const selectTypeFieldId = programDetails?.programQuestionMaps.find(
            (pqm) => pqm.question.bindingKey === "travelInfoType",
          )?.question.id;
          return postCallWithLoader(
            "extract-details",
            {
              url: fileUrl,
              type:
                bindingKey === "pictureUrl"
                  ? "identity_document"
                  : "flight_ticket",
              journeyType:
                bindingKey !== "pictureUrl"
                  ? bindingKey === "uploadOnwardJourneyTicket"
                    ? "onward"
                    : "return"
                  : undefined,
              programDetails:
                bindingKey !== "pictureUrl"
                  ? {
                      venue: seekerDetails?.allocatedProgram?.venue || "",
                      startsAt: seekerDetails?.allocatedProgram?.startsAt || "",
                      endsAt: seekerDetails?.allocatedProgram?.endsAt || "",
                    }
                  : undefined,
              userName: seekerDetails?.fullName || "",
              docType:
                bindingKey === "pictureUrl" && selectTypeFieldId !== undefined
                  ? formData[sectionName]?.[selectTypeFieldId]
                  : undefined,
            },
            PORTAL,
            textConstant.LARGE ,
          )
            .then((response: any) => {
              if (bindingKey === "pictureUrl") {
                if (
                  response &&
                  response.statusCode &&
                  response.statusCode != 200
                ) {
                  // alert(response?.message)
                  triggerUploadReset(); // Reset upload on error
                  clearFormFieldValue(questionId, sectionName, bindingKey); // Clear form field value
                  setAlert({
                    open: true,
                    message: response?.message,
                    type: WARNING,
                    confirmText: "okay",
                    onConfirm: () => {
                      setAlert({ message: [], open: false, type: "" });
                    },
                  });
                  return;
                } else if (
                  response.status &&
                  response.status == 200 &&
                  !response?.data?.data?.data?.isNameValid
                ) {
                  setAlert({
                    open: true,
                    message:
                      "The Name in the document does not match with the user name in the application. Do you still want to prefill?",
                    type: WARNING,
                    confirmText: "yes",
                    cancelText: "no",
                    onConfirm: () => {
                      setAlert({ message: [], open: false, type: "" });
                      mapAndSetFormData(response, sectionName);

                      // Set the uploaded file URL for the field
                      setFormData((prev = {}) => ({
                        ...prev,
                        [sectionName]: {
                          ...(prev && prev[sectionName]
                            ? prev[sectionName]
                            : {}),
                          [questionId]: fileUrl?.toString() || "",
                        },
                      }));
                    },
                    onCancel: () => {
                      setAlert({ message: [], open: false, type: "" });
                      triggerUploadReset();
                      clearFormFieldValue(questionId, sectionName, bindingKey); // Clear form field value
                    },
                  });
                  return;
                } else if (!response?.data?.data?.data) {
                  triggerUploadReset(); // Reset upload on error
                  clearFormFieldValue(questionId, sectionName, bindingKey); // Clear form field value
                  setAlert({
                    open: true,
                    message:
                      response?.data?.data?.message ||
                      "Failed to extract details from the document.",
                    type: WARNING,
                    confirmText: "okay",
                    onConfirm: () => {
                      setAlert({ message: [], open: false, type: "" });
                    },
                  });
                  // alert(
                  //   response?.data?.data?.data?.message ||
                  //   "Failed to extract details from the document.",
                  // );
                  return;
                }
              } else {
                if (
                  response &&
                  response.statusCode &&
                  response.statusCode != 200
                ) {
                  // alert(response?.message)
                  triggerUploadReset(); // Reset upload on error
                  clearFormFieldValue(questionId, sectionName, bindingKey); // Clear form field value
                  setAlert({
                    open: true,
                    message: response?.message,
                    type: WARNING,
                    confirmText: "okay",
                    onConfirm: () => {
                      setAlert({ message: [], open: false, type: "" });
                    },
                  });
                  return;
                } else if (
                  response.status &&
                  response.status == 200 &&
                  (!response?.data?.data?.data?.isNameValid ||
                    (response?.data?.data?.data?.message &&
                      response?.data?.data?.data?.message != "") || (response?.data?.data?.data?.hasAirlineCodeIssues))
                ) {
                  if (!response?.data?.data?.data?.isNameValid) {
                    setAlert({
                      open: true,
                      message:
                        "The Name in the ticket does not match with the user name in the application. Do you still want to prefill?",
                      type: WARNING,
                      confirmText: "yes",
                      cancelText: "no",
                      onConfirm: () => {
                        setAlert({ message: [], open: false, type: "" });
                        if (
                          response?.data?.data?.data?.message &&
                          response?.data?.data?.data?.message != ""
                        ) {
                          notify(
                            TravelFormText.toastTitle,
                            response?.data?.data?.data?.message,
                            "warning",
                          );
                        }

                        if (response?.data?.data?.data?.hasAirlineCodeIssues) {
                          notify(
                            TravelFormText.toastTitle,
                            response?.data?.data?.data?.airlineCodeMessage,
                            "warning",
                          );
                        }

                        prefillFormFromExtractedDetails(
                          response,
                          sectionName,
                          programDetails?.programQuestionMaps,
                        );

                        // Set the uploaded file URL for the field
                        setFormData((prev = {}) => ({
                          ...prev,
                          [sectionName]: {
                            ...(prev && prev[sectionName]
                              ? prev[sectionName]
                              : {}),
                            [questionId]: fileUrl?.toString() || "",
                          },
                        }));
                      },
                      onCancel: () => {
                        setAlert({ message: [], open: false, type: "" });
                        triggerUploadReset();
                        clearFormFieldValue(
                          questionId,
                          sectionName,
                          bindingKey,
                        ); // Clear form field value
                      },
                    });
                    return;
                  }

                  if (
                    response?.data?.data?.data?.message &&
                    response?.data?.data?.data?.message != ""
                  ) {
                    notify(
                      TravelFormText.toastTitle,
                      response?.data?.data?.data?.message,
                      "warning",
                    );
                  }

                  if (response?.data?.data?.data?.hasAirlineCodeIssues) {
                    notify(
                      TravelFormText.toastTitle,
                      response?.data?.data?.data?.airlineCodeMessage,
                      "warning",
                    );
                  }
                } else if (!response?.data?.data?.data?.segments) {
                  triggerUploadReset(); // Reset upload on error
                  clearFormFieldValue(questionId, sectionName, bindingKey); // Clear form field value
                  setAlert({
                    open: true,
                    message:
                      response?.data?.data?.data?.message ||
                      "Failed to extract details from the document.",
                    type: WARNING,
                    confirmText: "okay",
                    onConfirm: () => {
                      setAlert({ message: [], open: false, type: "" });
                    },
                  });
                  return;
                }
              }

              if (
                bindingKey === "uploadOnwardJourneyTicket" ||
                bindingKey === "uploadReturnJourneyTicket"
              ) {
                prefillFormFromExtractedDetails(
                  response,
                  sectionName,
                  programDetails?.programQuestionMaps,
                );
              } else {
                mapAndSetFormData(response, sectionName);
              }

              // Set the uploaded file URL for the field
              setFormData((prev = {}) => ({
                ...prev,
                [sectionName]: {
                  ...(prev && prev[sectionName] ? prev[sectionName] : {}),
                  [questionId]: fileUrl?.toString() || "",
                },
              }));
            })
            .catch((err: any) => {
              triggerUploadReset(); // Reset upload on error
              clearFormFieldValue(questionId, sectionName, bindingKey); // Clear form field value
              console.error(
                "Failed to extract details from the document.",
                err,
              );
              notify(
                TravelFormText.toastTitle,
                err && err.message
                  ? err.message
                  : "Failed to extract details from the document.",
                "warning",
              );
            });
        } else {
          setFormData((prevFormData) => ({
            ...prevFormData,
            [sectionName]: {
              ...prevFormData[sectionName],
              [questionId]: fileUrl?.toString() || "",
            },
          }));
        }
      });
    } else {
      // Handle non-file field changes

      // Handle prefill logic before updating form data
      const handlePrefillLogic = () => {
        const allQuestionsInSection = [
          ...(groupedQuestions[sectionName] || []),
          ...(seekerProfileQuestions || []),
        ];

        allQuestionsInSection.forEach((pqm: any) => {
          const targetQuestion = pqm.question;
          // Handle originalPayment calculation when TDS changes
          if (targetQuestion.bindingKey === "originalPayment") {
            // Find the TDS question to get current TDS value
            const tdsQuestion = allQuestionsInSection.find(
              (q: any) => q.question.bindingKey === "tdsAmount",
            );

            if (tdsQuestion) {
              // Get current TDS value (either the new value being set or existing value)
              const currentTdsValue =
                tdsQuestion.question.id === parseInt(questionId)
                  ? value
                  : formData[sectionName]?.[tdsQuestion.question.id] || 0;

              const basePrice = seekerDetails?.allocatedProgram?.basePrice || 0;
              const gstPercentage =
                seekerDetails?.allocatedProgram?.gstPercentage || 18;
              const tdsApplicability =
                seekerDetails?.allocatedProgram?.tdsApplicability ||
                "base_only";

              // Calculate new amount based on TDS
              const calculatedAmount = getCalculatedAmount(
                stringToNumber(basePrice),
                stringToNumber(currentTdsValue),
                gstPercentage,
                tdsApplicability,
              );
              // Update originalPayment field
              setFormData((prevFormData) => ({
                ...prevFormData,
                [sectionName]: {
                  ...prevFormData[sectionName],
                  [targetQuestion.id]: calculatedAmount.toString(),
                },
              }));
            }
          }
          if (targetQuestion?.config?.prefill?.prefillIf) {
            const prefillConditions = targetQuestion.config.prefill.prefillIf;

            const matchingCondition = prefillConditions.find(
              (condition: any) =>
                condition.questionId === parseInt(questionId) &&
                condition.value === value,
            );

            if (matchingCondition) {
              let prefillValue = "";

              if (targetQuestion.config.prefill.prefillFrom) {
                const sourceQuestionId =
                  targetQuestion.config.prefill.prefillFrom;

                // Search across ALL sections for the source value
                Object.keys(formData).forEach((sectionKey) => {
                  if (
                    formData[sectionKey] &&
                    formData[sectionKey][sourceQuestionId]
                  ) {
                    prefillValue = formData[sectionKey][sourceQuestionId];
                  }
                });
              } else if (
                targetQuestion.config.prefill.prefillFromBindingKey &&
                bindingKeyToQuestionId
              ) {
                const sourceQuestionId =
                  bindingKeyToQuestionId[
                    targetQuestion.config.prefill.prefillFromBindingKey
                  ];
                if (sourceQuestionId) {
                  // Search across ALL sections for the source value
                  Object.keys(formData).forEach((sectionKey) => {
                    if (
                      formData[sectionKey] &&
                      formData[sectionKey][sourceQuestionId]
                    ) {
                      prefillValue = formData[sectionKey][sourceQuestionId];
                    }
                  });
                }
              }

              if (prefillValue) {

                setFormData((prevFormData) => ({
                  ...prevFormData,
                  [sectionName]: {
                    ...prevFormData[sectionName],
                    [targetQuestion.id]: prefillValue,
                  },
                }));
              }
            }
          }
        });
      };

      // Execute prefill logic
      handlePrefillLogic();

      // Update form data with the current field change
      setFormData((prevFormData) => {
        const newFormData = {
          ...prevFormData,
          [sectionName]: {
            ...prevFormData[sectionName],
            [questionId]: value,
          },
        };

        let dependentQuestionIds = getQuestionIdsWhereThequestionIdIsDependedOn(
          questionId,
          groupedQuestions[sectionName],
        );

        const amountBindingKey = rawQuestionsData?.find((item: any) => {
          return item?.question?.bindingKey === "originalPayment";
        });

        dependentQuestionIds =
          dependentQuestionIds &&
          dependentQuestionIds.filter(
            (eachId) => eachId != amountBindingKey?.question?.id,
          );

        // Only clear dependent fields if their dependencies are NO LONGER satisfied
        dependentQuestionIds &&
          dependentQuestionIds.forEach((dependentQuestionId) => {
            const dependentQuestion = groupedQuestions[sectionName]?.find(
              (pqm: any) => pqm.question.id === dependentQuestionId,
            )?.question;

            if (dependentQuestion?.config?.dependsOn) {
              // Check if dependencies are still satisfied with the NEW value
              const isStillSatisfied = dependentQuestion.config.dependsOn.some(
                (dep) => {
                  const checkValue =
                    dep.questionId === questionId
                      ? value // Use NEW value for the changed field
                      : newFormData[sectionName]?.[dep.questionId]; // Use existing values for other dependencies

                  if (dep.value === "notNull") {
                    return (
                      checkValue != null &&
                      checkValue !== undefined &&
                      checkValue !== ""
                    );
                  } else {
                    return checkValue == dep.value;
                  }
                },
              );

              // Only clear if dependency is NO LONGER satisfied
              if (!isStillSatisfied) {
                newFormData[sectionName][dependentQuestionId] = "";
              }
            }
          });

        // Clear always-visible fields when they become disabled
        const ALWAYS_VISIBLE_BINDING_KEYS = ['goodiesTshirtSize', 'goodiesJacketSize','ratriaPillarLocation'];
        
        const allQuestionsInSection = [
          ...(groupedQuestions[sectionName] || []),
          ...(seekerProfileQuestions || []),
        ];

        allQuestionsInSection.forEach((pqm: any) => {
          const targetQuestion = pqm.question;
          
          // Check if this is an always-visible field
          if (ALWAYS_VISIBLE_BINDING_KEYS.includes(targetQuestion.bindingKey)) {
            // Check if it has dependencies
            if (targetQuestion.config?.dependsOn && targetQuestion.config.dependsOn.length > 0) {
              // Check if dependencies are satisfied with the NEW value
              const isDependencySatisfied = targetQuestion.config.dependsOn.some((dep: any) => {
                const checkValue = dep.questionId === parseInt(questionId)
                  ? value // Use NEW value for the changed field
                  : newFormData[sectionName]?.[dep.questionId]; // Use existing values

                if (dep.value === "notNull") {
                  return checkValue != null && checkValue !== undefined && checkValue !== "";
                } else {
                  let isMatch = checkValue == dep.value;
                  if (dep.operator) {
                    isMatch = (dep.operator === "equals" && checkValue == dep.value) || 
                              (dep.operator === "greaterThan" && checkValue > dep.value);
                  }
                  return isMatch;
                }
              });

            // Clear the field value if dependency is NOT satisfied
            if (!isDependencySatisfied && newFormData[sectionName]?.[targetQuestion.id]) {
              newFormData[sectionName][targetQuestion.id] = "";
            }
          }
        }
      });

      return newFormData;
    });

    setErrors((prevErrors) => {
      const updatedErrors: any = { ...prevErrors };
      if (updatedErrors[sectionName]) {
        delete updatedErrors[sectionName][questionId];
        if (Object.keys(updatedErrors[sectionName]).length === 0) {
          delete updatedErrors[sectionName];
        }
      }

      // **NEW: Clear errors for fields that become disabled due to dependency changes**
      const allQuestionsInSection = [
        ...(groupedQuestions[sectionName] || []),
        ...(seekerProfileQuestions || []),
      ];

      allQuestionsInSection.forEach((pqm: any) => {
        const targetQuestion = pqm.question;
        
        // Check if this field has dependencies and might be affected
        if (targetQuestion.config?.dependsOn && targetQuestion.config.dependsOn.length > 0) {
          // Check if any dependency involves the current field being changed
          const isAffectedByCurrentChange = targetQuestion.config.dependsOn.some((dep: any) => 
            dep.questionId === parseInt(questionId)
          );

          if (isAffectedByCurrentChange) {
            // Check if the field becomes disabled with the new value
            const isDependencySatisfied = targetQuestion.config.dependsOn.some((dep: any) => {
              const checkValue = dep.questionId === parseInt(questionId)
                ? value // Use NEW value for the changed field
                : formData[sectionName]?.[dep.questionId]; // Use existing values

              if (dep.value === "notNull") {
                return checkValue != null && checkValue !== undefined && checkValue !== "";
              } else {
                let isMatch = checkValue == dep.value;
                if (dep.operator) {
                  isMatch = (dep.operator === "equals" && checkValue == dep.value) || 
                            (dep.operator === "greaterThan" && checkValue > dep.value);
                }
                return isMatch;
              }
            });

            // If field becomes disabled (dependency not satisfied), clear its error
            if (!isDependencySatisfied && updatedErrors[sectionName]?.[targetQuestion.id]) {
              delete updatedErrors[sectionName][targetQuestion.id];
              if (Object.keys(updatedErrors[sectionName]).length === 0) {
                delete updatedErrors[sectionName];
              }
            }
          }
        }
      });

      return updatedErrors;
    });
  }
};

  const mapAndSetFormData = (response, sectionName) => {
    // Map travelInfoNumber to the correct field if present
    const travelInfoNumber =
      response?.data?.data?.data?.travelInfoNumber;
    if (travelInfoNumber) {
      // Find the question with bindingKey === 'travelInfoNumber' in the current section
      const questions = groupedQuestions[sectionName] as any;
      if (questions && questions.length) {
        const match = questions.find(
          (pqm: any) =>
            pqm.question &&
            pqm.question.bindingKey === "travelInfoNumber",
        );
        if (match) {
          setFormData((prev = {}) => ({
            ...prev,
            [sectionName]: {
              ...(prev && prev[sectionName]
                ? prev[sectionName]
                : {}),
              [match.question.id]: travelInfoNumber,
            },
          }));
        }
      }
    }
  }

const handleFormSubmit = async (sectionName: string) => {
  // Validate all sections
  const { hasErrors, errors: validationErrors } = ValidateAllSections(
    groupedQuestions,
    formData,
    setErrors,
    sectionName,
    bindingKeyToQuestionId,
    seekerDetails
  );

  // Scroll to first error if any
  if (hasErrors) {
    setTimeout(() => {
      const sectionErrors = validationErrors[sectionName];
      if (sectionErrors && Object.keys(sectionErrors).length > 0) {
        const firstErrorQuestionId = Object.keys(sectionErrors)[0];
        const errorField = document.querySelector(
          `[data-question-id="${firstErrorQuestionId}"]`
        ) as HTMLElement;

        if (errorField) {
          errorField.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });

          const inputElement = errorField.querySelector(
            'input:not([type="radio"]):not([type="checkbox"]), textarea, select'
          ) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

          if (inputElement) {
            setTimeout(() => {
              inputElement.focus();
            }, 500);
          }
        }
      }
    }, 100);
    return;
  }
      try {
        if (
          sectionName === "Payment & Invoice" ||
          sectionName === "FS_PAYMENTINVOICE"
        ) {
          let paymentAnswers = transformFormDataToPayload(
            formData,
            groupedQuestions[sectionName],
            sectionName,
          );
          let formattedData: any = {};
          (groupedQuestions[sectionName] || []).forEach((pqm: any) => {
            const answerObj = paymentAnswers.find(
              (ans: any) => ans.questionId === pqm.question.id,
            );
            if (answerObj && answerObj.answer !== undefined && answerObj.answer !== "") {
              if (pqm.question.bindingKey === "tdsAmount") {
                formattedData[pqm.question.bindingKey] = Number(answerObj.answer);
              } else {
                formattedData[pqm.question.bindingKey] = answerObj.answer;
              }
            }
          });

          if (!(formattedData["paymentMode"] == "Online (Through Razorpay)")) {
            formattedData = {
              ...formattedData,
              offlinePaymentMeta: {
                ...formattedData,
                paymentMethod: formattedData["paymentMode"],
              },
            };
            formattedData["paymentMode"] = "offline";
            formattedData.paymentMeta = {
              ...formattedData.paymentMeta,
            };
          } else {
            formattedData = {
              ...formattedData,
            };
            formattedData["paymentMode"] = "online";

          }

          formattedData["paymentMeta"] = paymentAnswers.filter(
            (item: any) =>
              item.answer !== undefined && item.answer !== null && item.answer !== "",
          );
          formattedData["isSeeker"] = false;
          try {
            const response = await postCallWithLoader(
              endPoints.paymentInitiateAdmin(seekerId),
              formattedData,
              PORTAL,
              textConstant.LARGE
            );
            if (
              response?.data?.statusCode === 200 ||
              response?.data?.statusCode === 201
            ) {
              setEditModes((prevEditModes) =>
                prevEditModes.map((mode) => ({
                  ...mode,
                  editMode: false,
                })),
              );
              // Refresh data after successful submission
              await getSeekerRegistrationDetails();
              return response.data.data;
            } else {
              throw new Error("Submission failed");
            }
          } catch (error) {
            console.error("Error submitting form data:", error);
            return {};
          } finally {
          }
          return;
        }
        const updatedData = transformFormDataToPayload(
          formData,
          groupedQuestions[sectionName],
          sectionName,
        );

        // const updatedAnswers = omitEmptyAnswersFromAnswersPayload(updatedData);
        const updateData = updatedData.map((ans: any) => {
        const pqm = (groupedQuestions[sectionName] || []).find(
          (q: any) => q.question.id === ans.questionId
        );
        return {
          ...ans,
          bindingKey: pqm?.question?.bindingKey || "",
        };
      });
        let payload: any = {
          programRegistrationId: Number(seekerId),
          programId: programDetails?.id,
          answers: updateData,
        };
        if(sectionName === SECTION_NAME.TRAVELSECTION)
        {
          payload = {
            ...payload,
            updateUserProfileData: true
          };
        }

        const response = await putCallWithLoader(endPoints.registrationUpdate(true), payload, PORTAL, textConstant.LARGE );

        if (
          response?.data?.statusCode === 200 ||
          response?.data?.statusCode === 201
        ) {
          setEditModes((prevEditModes) =>
            prevEditModes.map((mode) => ({
              ...mode,
              editMode: false,
            })),
          );

          // Refresh data after successful submission
          await getSeekerRegistrationDetails();
          return response.data.data;
        } else {
          throw new Error("Submission failed");
        }
      } catch (error) {
        console.error("Error submitting form data:", error);
        return {};
      }
};


const handleFieldBlur = async (questionId: number, sectionName: string) => {
  // Find the question from your grouped questions
  const sectionQuestions = dependencyClearedGroupedQuestions[sectionName] || [];
  const question = sectionQuestions.find((pqm: any) => pqm.question.id === questionId);
  
  if (!question) return;
  
  // Get the current field value
  const fieldValue = formData[sectionName]?.[questionId];
  let fieldError = '';
  
  // Basic required field validation
  if (question.question.config?.isRequired && (!fieldValue || String(fieldValue).trim() === '')) {
    fieldError = `${question.question.label} is required`;
  }
  
  // Email validation
  if (question.question.type === 'email' && fieldValue && fieldValue.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fieldValue)) {
      fieldError = 'Please enter a valid email address';
    }
  }
  
  // Phone validation (if needed)
  if (question.question.type === 'tel' && fieldValue) {
    // Add your phone validation logic here if needed
  }
  
  // Cheque Number validation
  if (question.question.bindingKey === "chequeNo" && fieldValue) {
    const allowedDigits = question.question.config?.allowedDigits;
    const chequeStr = String(fieldValue);
    
    if (allowedDigits) {
      // allowedDigits is a number, chequeStr should be exactly that many digits
      const digitRegex = new RegExp(`^\\d{${allowedDigits}}$`);
      if (!digitRegex.test(chequeStr)) {
        fieldError = `Must be exactly ${allowedDigits} digits`;
      }
    }
  }
  
  // TDS Amount validation
  if (
    question.question.bindingKey === "tdsAmount" &&
    fieldValue &&
    seekerDetails?.allocatedProgram
  ) {
    const tdsPercent = Number(seekerDetails?.allocatedProgram.tdsPercent) || 0;
    const tdsApplicability = seekerDetails?.allocatedProgram.tdsApplicability;
    const baseAmount = Number(seekerDetails?.allocatedProgram.basePrice) || 0;
    const gstPercent = Number(seekerDetails?.allocatedProgram.gstPercent) || 0;
    const gstAmount = (baseAmount * gstPercent) / 100;
    const tdsAmountOnBaseAmount = (baseAmount * tdsPercent) / 100;
    const tdsAmountOnGst = (gstAmount * tdsPercent) / 100;
    const enteredTds = Number(fieldValue);

    if (enteredTds < 0) {
      fieldError = "TDS amount cannot be negative";
    } else if (tdsApplicability === "base_only") {
      if (enteredTds > tdsAmountOnBaseAmount) {
        fieldError = `TDS percent cannot be more than ${tdsPercent.toFixed(2)}% for this program`;
      }
    } else if (tdsApplicability === "base_plus_tax") {
      const maxTds = tdsAmountOnBaseAmount + tdsAmountOnGst;
      if (enteredTds > maxTds) {
        fieldError = `TDS percent cannot be more than ${tdsPercent.toFixed(2)}% for this program`;
      }
    }
    
    // Alternative: Show as percentage error (like first repo)
    if (!fieldError && tdsPercent > 0 && baseAmount > 0) {
      const calculatedPercent = (enteredTds / baseAmount) * 100;
      if (calculatedPercent > tdsPercent) {
        fieldError = `TDS percent cannot be more than ${tdsPercent.toFixed(2)}% for this program`;
      }
    }
  }
  
  // TAN Number validation
  if (question.question.bindingKey === "tanNumber" && fieldValue) {
    // TAN format: 4 letters + 5 digits + 1 letter (e.g., ABCD12345E)
    const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]$/;
    const tanValue = String(fieldValue).trim().toUpperCase();
    
    if (!tanRegex.test(tanValue)) {
      fieldError = 'min limit: 10';
    }
  }
  
  // GST Number validation
  if (question.question.bindingKey === 'gstNumber' || 
      question.question.bindingKey === 'proFormaGstNumber') {
    
    const gstValue = fieldValue;
    let pincodeValue = '';
    
    // Determine which pincode field to use based on GST field
    if (question.question.bindingKey === 'gstNumber') {
      // Find the zip field in the same section
      const zipQuestion = sectionQuestions.find(
        (pqm: any) => pqm.question.bindingKey === 'zip'
      );
      pincodeValue = zipQuestion ? formData[sectionName]?.[zipQuestion.question.id] : '';
    } else if (question.question.bindingKey === 'proFormaGstNumber') {
      // Find the proFormaZip field in the same section
      const proFormaZipQuestion = sectionQuestions.find(
        (pqm: any) => pqm.question.bindingKey === 'proFormaZip'
      );
      pincodeValue = proFormaZipQuestion ? formData[sectionName]?.[proFormaZipQuestion.question.id] : '';
    }
    
    // Only validate if both GST and pincode are present
    if (gstValue && pincodeValue) {
      try {
        const isValidGST = await validateGSTNumber(pincodeValue, gstValue);
        if (!isValidGST) {
          fieldError = 'GST number does not match the state for the given pincode';
        }
      } catch (error) {
        fieldError = 'Unable to validate GST number. Please try again.';
      }
    }
  }
  
  // Also validate when pincode changes (to re-validate GST if it exists)
  if (question.question.bindingKey === 'zip' || 
      question.question.bindingKey === 'proFormaZip') {
    
    const pincodeValue = fieldValue;
    let gstValue = '';
    let gstQuestionId = null;
    
    // Determine which GST field to validate based on pincode field
    if (question.question.bindingKey === 'zip') {
      const gstQuestion = sectionQuestions.find(
        (pqm: any) => pqm.question.bindingKey === 'gstNumber'
      );
      gstValue = gstQuestion ? formData[sectionName]?.[gstQuestion.question.id] : '';
      gstQuestionId = gstQuestion?.question.id;
    } else if (question.question.bindingKey === 'proFormaZip') {
      const proFormaGstQuestion = sectionQuestions.find(
        (pqm: any) => pqm.question.bindingKey === 'proFormaGstNumber'
      );
      gstValue = proFormaGstQuestion ? formData[sectionName]?.[proFormaGstQuestion.question.id] : '';
      gstQuestionId = proFormaGstQuestion?.question.id;
    }
    
    // Validate GST if both values exist
    if (gstValue && pincodeValue && gstQuestionId) {
      try {
        const isValidGST = await validateGSTNumber(pincodeValue, gstValue);
        
        // Update error for the GST field
        setErrors(prevErrors => ({
          ...prevErrors,
          [sectionName]: {
            ...prevErrors[sectionName],
            [gstQuestionId]: isValidGST 
              ? undefined 
              : 'GST number does not match the state for the given pincode'
          }
        }));
      } catch (error) {
        console.error('GST validation error:', error);
      }
    } else if (gstQuestionId && !gstValue && pincodeValue) {
      // Clear GST error if pincode is valid but GST is empty
      setErrors(prevErrors => ({
        ...prevErrors,
        [sectionName]: {
          ...prevErrors[sectionName],
          [gstQuestionId]: undefined
        }
      }));
    }
  }
  
  // Min/Max character validation
  if (fieldValue && question.question.config?.minCharacter) {
    const valueLength = String(fieldValue).length;
    if (valueLength < question.question.config.minCharacter) {
      fieldError = fieldError || `Minimum ${question.question.config.minCharacter} characters required`;
    }
  }
  
  if (fieldValue && question.question.config?.maxCharacters) {
    const valueLength = String(fieldValue).length;
    if (valueLength > question.question.config.maxCharacters) {
      fieldError = fieldError || `Maximum ${question.question.config.maxCharacters} characters allowed`;
    }
  }
  
  // Min/Max value validation for numbers
  if (question.question.type === 'number' && fieldValue) {
    const numValue = Number(fieldValue);
    
    if (question.question.config?.minValue !== undefined && numValue < question.question.config.minValue) {
      fieldError = fieldError || `Minimum value is ${question.question.config.minValue}`;
    }
    
    if (question.question.config?.maxValue !== undefined && numValue > question.question.config.maxValue) {
      fieldError = fieldError || `Maximum value is ${question.question.config.maxValue}`;
    }
  }
  
  // Custom validation pattern
  if (question.question.config?.validationPattern && fieldValue) {
    try {
      const rawPattern = question.question.config.validationPattern.replace(/\\\\/g, "\\");
      const regex = new RegExp(rawPattern);
      if (!regex.test(fieldValue)) {
        fieldError = fieldError || (question.question.config.patternErrorMsg || 'Invalid format');
      }
    } catch (error) {
      console.error('Validation pattern error:', error);
    }
  }
  
  // Update errors for this specific field
  setErrors(prevErrors => ({
    ...prevErrors,
    [sectionName]: {
      ...prevErrors[sectionName],
      [questionId]: fieldError || undefined // Use undefined to clear error
    }
  }));
};

  const handleMarkAsPaid = async () => {
    // Not used: 03/02/2026
    const currentPaymentStatus = getPaymentStatusFromData(data);
    try {
      // Not used: 03/02/2026
      const isCurrentlyOnline =
      currentPaymentStatus &&
      (currentPaymentStatus.toLowerCase() === "failed" || currentPaymentStatus.toLowerCase().includes("online"));
      const payload = {
        paymentStatus: isCurrentlyOnline
          ? "online_completed"
          : "offline_completed",
        markAsReceivedDate: paymentMarkDate,
      };

      if (reSendInvoice) {
        await handleSendInvoice(seekerId);
      } 
      // Not used: 03/02/2026
      else if (paymentStatus) {
         await markSeekerAsPaid(seekerId, payload);
      }

      // Refresh data after payment action
      // CRITICAL FIX: First refresh Redux state with fresh seeker details (including updated payment status and invoice URL)
      await refreshSeekerData();
      // Then update form with the refreshed data (which now uses the updated Redux state)
      await getSeekerRegistrationDetails();
      // Trigger invoice error API refetch
      setInvoiceErrorRefresh(prev => prev + 1);
    } catch (error) {
      console.error("Error in payment action:", error);
    }
  };

  const refreshSeekerData = async () => {
    try {
      // const data = await getRegistrationQuestionsById(seekerId || "");
      // const programData = await getAllquestionsFromProgram(
      //   parseInt(programId || "0", 10),
      // );
      const seekerDetails = await getSeekerDetailsById(seekerId || "", true);
      setRatings(seekerDetails?.ratings || []);
      setRmReview(seekerDetails?.rmReview || "");
      const stepperDataTransformed = transformApiDataToStepperData(seekerDetails, getTravelStatus);
      setStepperData(stepperDataTransformed);
      setRecommendations(seekerDetails?.recommendation[0] || {});
      
      // Update Redux state with new seeker details
      dispatch(setSeekerDetails(seekerDetails));
      
      // Update active swap request state
      if (seekerDetails?.swapsRequests && Array.isArray(seekerDetails.swapsRequests)) {
        const activeSwap = seekerDetails.swapsRequests.find(
          (swap: any) => swap.status === "active"
        );
        setActiveSwapRequest(activeSwap || null);
      } else {
        setActiveSwapRequest(null);
      }
      
      // CRITICAL FIX: Update invoice PDF link with fresh data so buttons appear
      const startsAt = seekerDetails?.program?.startsAt ? new Date(seekerDetails.program.startsAt) : undefined;
      const years = startsAt ? formateYearDate(startsAt) : '';
      const programName = seekerDetails?.program?.type?.key === PROGRAM_TYPE.HDB_MSD_KEY ? PROGRAM_TYPE.HDB_MSD_LABEL : seekerDetails?.program?.code;
      const fileName = `${programName} ${years} ${PROGRAM_TYPE.INVOICE_LABEL} - ${seekerDetails?.invoiceDetails[0]?.invoiceSequenceNumber || ""}`;;
    
      
      setInvoicePdfLink({
        url: seekerDetails?.invoiceDetails[0]?.invoicePdfUrl || "",
        name: fileName,
      });
      
      // Not used: 03/02/2026
      // setSwapDetails(seekerDetails?.swapsRequests || []);
      // setSwappedTo(seekerDetails?.allocatedProgram);
      return seekerDetails;
    } catch (error) {
      console.error("Error refreshing seeker data:", error);
    }
  };

  // const refreshSeekerRegistrationData = async () => {
  //   setIsRefreshing(true);
  //   try{
  //     const seekerDetails = await getSeekerDetailsById(seekerId || "", true);
  //     setSeekerData(seekerDetails);
  //   } catch(error){
  //     console.error("Error refreshing seeker registration data:", error);
  //   } finally{
  //     setIsRefreshing(false);
  //   }
  // }

  const handleAddReview = async () => {
    if (ratings && ratings.length > 0) {
      setActiveOverlayType("update review");
    } else {
      setActiveOverlayType("add review");
    }

    const ratingsObj: { [key: string]: { rating: number; id?: number } } = {};
    if (Array.isArray(ratings)) {
      ratings.forEach((r: any) => {
        ratingsObj[r.ratingKey] = { rating: Number(r.rating), id: r.id };
      });
    }
    setReviewInitialRatings(ratingsObj);
    setReviewInitialComments(rmReview || "");

    // This function must be marked as async everywhere it is used, or called from a useEffect or event handler.
    try {
      const res = await getCallWithLoader(`registration/${seekerId}`, undefined, PORTAL, textConstant.LARGE);
      const recommendationsArr = res?.data?.data?.recommendation || [];
      let latestRecommendation = null;
      if (Array.isArray(recommendationsArr) && recommendationsArr.length > 0) {
        latestRecommendation = recommendationsArr.reduce((latest, curr) => {
          if (!latest) return curr;
          return new Date(curr.createdAt) > new Date(latest.createdAt)
            ? curr
            : latest;
        }, null);
      }
      setReviewInitialRecommendations(latestRecommendation);
      setprevRating(res.data?.data?.prevRating || {});
      setRecommendations(latestRecommendation || {});
       const apiExperiences = res.data?.data?.user?.programExperiences || res?.data?.data?.experiences || [];
        if (apiExperiences.length > 0) {
          setSeekerExperiences(apiExperiences);
        }
    } catch {
      setReviewInitialRecommendations(null);
      setRecommendations({});
    } 
  };

  const paymentCardRef = useRef<HTMLDivElement | null>(null);
  const ratingsCardRef = useRef<HTMLDivElement | null>(null);
  
  // Show initial loader while data is being fetched
  // Show loader if: 1) API call in progress, OR 2) Initial load (no data AND no steps yet)
  if (loader > 0 || (!data?.length && !steps?.length)) {
    return (
      <Loader
        type="large"
        data-testid="registered-seeker-details-loader"
      />
    );
  }

  // Show no data message only after loading is complete (loader done AND still no data)
  if (!data || data.length === 0) {
    return (
      <div className={styles.noDataContainer}>
        <p>No data available for this seeker.</p>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className={styles.noDataContainer}>
        <p>No steps available for this seeker.</p>
      </div>
    );
  }
  
  // Not used: 03/02/2026
  // const transformedStepperData = Array.isArray(stepperData)
  //   ? stepperData.map((step: any) =>
  //       step.title && step.title.includes("Blessed with")
  //         ? { ...step, title: "Seeker journey" }
  //         : step,
  //     )
  //   : stepperData;

  const fetchAllocatedProgramId = async (seekerId: string | number) => {
    const url = `${endPoints.RegisteredSeekersList}/${seekerId}`;
    const response = await getCall(url, undefined, PORTAL);
    return Number(response?.data?.data?.allocatedProgram?.id);
  };

  const handleOpenSwap = async (row: any) => {
    setActiveOverlayType("swap");
    try {
      const response = await getCall(`${endPoints.program}/${row.program?.id}`, undefined, PORTAL);
      const data = response?.data?.data;
      const allocatedId = await fetchAllocatedProgramId(row.id);
      let options: { value: number; label: string; disabled?: boolean }[] = [];

      if (data?.type?.isGroupedProgram) {
        options =
          data.groupedPrograms?.map((item: any) => ({
            value: Number(item.id),
            label: item.name,
            disabled: Number(item.id) === allocatedId,
          })) || [];
      } else {
        options =
          data.sessions?.map((item: any) => ({
            value: Number(item.id),
            label: item.name,
            disabled: Number(item.id) === allocatedId,
          })) || [];
      }
      setDynamicProgramOptions(options);
    } catch {
      setDynamicProgramOptions([]);
    }
  };
  const handleCancelSwap = (row: any) => {
      setAlert({
        open: true,
        message: CANCEL_SWAP.CONFIRM_MESSAGE(row.fullName|| ""),
        type: "warning",
        cancelSwap: true,
        confirmText: "Yes",
        cancelText: "No",
        onConfirm: async (reason?: string) => {
            setAlert({ message: [], open: false, type: "" });
            
            if (!reason || !reason.trim()) {
                setAlert({ 
                  open: true, 
                  message: ["Please enter a reason for cancellation"], 
                  type: "error",
                  confirmText: "OK"
                });
                return;
            }

            const payload = {
              action: CANCEL_SWAP.ACTIONS.CANCEL,
              comment: reason || "Cancelled by RM",
            };
            try {
              const swapRequestId = activeSwapRequest?.id;
              
              if (!swapRequestId) {
                setAlert({ 
                  open: true, 
                  message: ["Swap request ID not found"], 
                  type: "error",
                  confirmText: "OK"
                });
                return;
              }
              
              const response = await ApiService.cancelSwapRequest(
                swapRequestId,
                payload,
                {
                  onSuccess: {
                    title: CANCEL_SWAP.TITLE,
                    message: CANCEL_SWAP.SUCCESS_MESSAGE,
                    type: CANCEL_SWAP.SUCCESS_TYPE
                  },
                  onError: {
                    title: CANCEL_SWAP.TITLE,
                    message:CANCEL_SWAP.ERROR_MESSAGE,
                    type:CANCEL_SWAP.ERROR_TYPE
                  }
                }
              );
              
              // Notification is handled by apiService
              if (response && response.data && response.data.statusCode === 200) {
                await refreshSeekerData();
              }
            } catch (error) {
              console.error("Error cancelling swap request:", error);
              // Error notification is handled by apiService
            }
        },
        onCancel: () => {
            setAlert({ message: [], open: false, type: "" });
        }
    });
  };

  // Generated by Copilot
  const handleMarkDefaulter = (_seekerDetails: any) => {
    setActiveOverlayType(textConstant.DEFAULTER);
  };

  const menuItems = getActionOptions(
    () => handleOpenSwap(seekerDetails),
    seekerDetails,
    () => handleCancelSwap(seekerDetails),
    () => handleMarkDefaulter(seekerDetails)
  )
    .filter((item) => {
      // Filter swap request items based on permission
      if (item.label.toLowerCase().includes(textConstant.SWAP)) {
        return hasPermission(userRole, RESOURCES.REQ_SWAP_SEEKER, "C");
      }
      return true;
    })
    .map((item) =>
      item.label === SWAP_REQUEST_LABEL ? { ...item, disabled: swapDisabled } : item,
    );

  // Add imageSource to each item (optional)
  const menuWithIcons = menuItems.map((item) => ({
    ...item,
  }));

  return (
    <>
      {/* Show overlay loader for submit/refresh actions */}

      <div className={styles.registeredSeekerDetailsContainer}>
        <div className={styles.detailsContent}>
          <div className={styles.stepperSection}>
            <VerticalStepper
              title="Seeker Details"
              imageSrc={profileUrl}
              name={fullName}
              status={stepperItems[activeStep]?.status || "active"}
              steps={stepLabels}
              activeStep={activeStep}
              onStepClick={handleStepClick}
              onBack={onBack}
              isActive={isCompleted}
              isStepNotStarted={isStepNotStarted}
              isPending={inActive}
            />
          </div>
          <div className={styles.detailsSection}>
            <div className={styles.actionsSection}>
              {menuWithIcons.length > 0 && (
                <div className={styles.menuDropdown}>
                  <DropdownMenu items={menuWithIcons} />
                </div>
              )}
            </div>
            {dependencyClearedGroupedQuestions && programDetails &&
              <SeekerProfileCard 
                bindingKeyToQuestionId = {bindingKeyToQuestionId}
                userRole = {userRole}
                seekerProfileQuestions = {dependencyClearedGroupedQuestions?.["FS_PROFILEDETAILS"] || []}
                profileData={seekerProfileDetails}
                errors = {errors["FS_PROFILEDETAILS"] || {}}
                formData= {formData["FS_PROFILEDETAILS"] || {}}
                handleFieldChange={handleFieldChange}
                handleFieldBlur={handleFieldBlur}
                rawData={rawData}
                seekerDetails={seekerDetails}
                resetUpload={resetUpload}
                editModes={editModes}
                setEditModes={setEditModes}
                handleFormSubmit = {(secName: string)=> handleFormSubmit(secName)}
                programDetails={programDetails}
              /> 
          }
            <div ref={horizontalStepperRef} style={{ scrollMarginTop: "20px" }}>
              <HorizontalStepper steps={stepperData} registrationId={seekerDetails?.id}/>
            </div>

            {/* Seeker Behaviour Monitoring Card */}
          {seekerDetails?.user?.seekerDefaulter?.isDefaulter && seekerDetails?.userId &&  <div className={styles.seekerBehaviourCard}>
              <div className={styles.behaviourHeader}>
                <h3 className={styles.behaviourTitle}>{textConstant.SEEKER_BEHAVIOUR_TEXT}</h3>
                {((seekerDetails?.user?.seekerDefaulter?.defaultMarkerRole.toLowerCase() !== userRole &&  seekerDetails?.user?.seekerDefaulter?.defaultMarkerRole.toLowerCase() !== ROLES.MAHATRIA) || userRole === ROLES.MAHATRIA) &&  hasPermission(userRole, RESOURCES.SEEKER_EXPERIENCE, "U") && (
                  <span
                    className={styles.updateButton}
                    onClick={() => setActiveOverlayType(textConstant.DEFAULTER)}
                    aria-disabled={loader > 0}
                  >
                    {textConstant.UPDATE}
                  </span>
                )}
              </div>
              
              {/* Defaulter Tracking Data */}
              <DefaulterTrackingSection data={defaulterTrackingData} />
            </div>
}

            {data.map((section: any, index: number) => {
              const editMode = editModes?.find(
                (mode) => mode.sectionName === section.sectionName,
              )?.editMode;
              // Skip FS_PAYMENTINVOICE section if isFreeSeat is true
              if ((isFreeSeat && (section.sectionKey === "FS_PAYMENTINVOICE" || section.sectionName === RESOURCES.PAYMENT_DETAILS)) || section.sectionName == "FS_PROFILEDETAILS") {
                return null;
              }

              return (
                <React.Fragment key={index}>
                  <div
                    ref={(el) =>
                      (sectionRefs.current[section.sectionName] = el)
                    }
                    style={{ scrollMarginTop: "20px" }}
                  >
                    { (section.sectionKey !== "FS_MAHATRIAQUESTIONS" || userRole !== "admin")  &&
                    <CardRenderer
                      heading={section.sectionName}
                      editable={
                        seekerDetails?.registrationStatus != "cancelled" &&
                        (section.isEditable || false)
                      }
                      formData={formData[section.sectionName]}
                      questionMapList={
                        dependencyClearedGroupedQuestions[
                          section.sectionName
                        ] || null
                      }
                      customClass={
                        section.sectionKey === "FS_MAHATRIAQUESTIONS"
                          ? "mahatriaQuestionsWrapper"
                          : ""
                      }
                      handleFieldChange={handleFieldChange}
                      handleFieldBlur={handleFieldBlur}
                      seekerDetails={seekerDetails}
                      sectionName={section.sectionName}
                      sectionKey={section.sectionKey}
                      errors={errors[section.sectionName] || {}}
                      toggleEditMode={toggleEditMode}
                      handleFormSubmit={() =>
                        handleFormSubmit(section.sectionName)
                      }
                      editMode={editMode}
                      rawData={rawData}
                      resetUpload={resetUpload}
                      data={section.items.map((item: any) => ({
                        label: item.questionLabel,
                        value: item.answer,
                        id: item.questionId,
                        config: item.config,
                        bindingKey: item.questionBindingKey,
                        type:
                          item.questionType === "text"
                            ? "text"
                            : item.questionType === "draganddrop"
                              ? "draganddrop"
                            :item.questionType === "yearRange"
                              ? "yearRange"
                              : item.questionType === "email"
                                ? "text"
                                : item.questionType === "date"
                                  ? "date"
                                  : item.questionType === "dateandtime"
                                    ? "datetime"
                                    : item.questionType === "select"
                                      ? "text"
                                      : item.questionType === "radio"
                                        ? "text"
                                        : item.questionType === "checkbox"
                                          ? "text"
                                          : item.questionType === "textarea"
                                            ? "text"
                                           :item.questionType === "multiQuestion"
                                           ? "multiQuestion"
                                              : item.questionType === "apicall"
                                              ? "apiCall"
                                              : item.questionType === "file"
                                                ? item?.config?.filetype ==
                                                  "video"
                                                  ? "video"
                                                  : "image"
                                                : "text",
                      }))}
                      seekerStatus={seekerStatus}
                      refetchSeekerDetails={refreshSeekerData}
                      programDetails={programDetails}
                     manuallyChangedAirline={manuallyChangedAirline}
                      setManuallyChangedAirline={setManuallyChangedAirline}
                    />
            }
                  </div>
                  {section.sectionKey === "FS_PAYMENTINVOICE" && (
                    <>
                      {!isFreeSeat && // Add this condition to prevent showing for free seats
                        showMarkPaymentAsReceivedCard(
                          paymentStatus,
                          reSendInvoice,
                          userRole,
                          invoicePdfLink.url,
                        ) && (
                          <div
                            ref={paymentCardRef}
                            style={{ scrollMarginTop: "20px" }}
                          >
                            <MarkAsPaidCard
                              handleMarkAsPaid={handleMarkAsPaid}
                              sendInvoice={reSendInvoice}
                              sendPaymentLink={paymentStatus}
                              setPaymentMarkDate={setPaymentMarkDate}
                              invoiceLink={invoicePdfLink.url}
                              disable={
                                seekerDetails?.registrationStatus == "cancelled"
                              }
                              downloadedInvoiceFileName={invoicePdfLink.name}
                            />
                          </div>
                        )}
                      {/* E-Invoice Error Section - Only visible to Finance Manager */}
                      {userRole === ROLES.FINANCE_ADMIN && seekerDetails?.id && (
                        <div style={{ scrollMarginTop: "20px" }}>
                          <EInvoiceError registrationId={seekerDetails.id} refreshTrigger={invoiceErrorRefresh} />
                        </div>
                      )}
                    </>
                  )}
                </React.Fragment>
              );
            })}
            {hasPermission(userRole, "RM_REVIEW", "R") && (
              <div ref={ratingsCardRef} style={{ scrollMarginTop: "20px" }}>
                <RatingsCard
                  ratings={ratings}
                  rmReview={rmReview}
                  recommendations={recommendations}
                  userRole={userRole}
                  onEdit={handleAddReview}
                  seekerDetails={seekerDetails}
                />
              </div>
            )}
            {hasPermission(userRole, "SEEKER_ASSOCIATION", "R") && (
              <div ref={timelineChartRef} style={{ scrollMarginTop: "20px" }} className={styles.timelineChart}>
                <p className={styles.seekerAssociation}>{colorizeMahatriaInfinitheism(SEEKER_ASSOCIATION)}</p>
                <TimelineChart  key={timelineRefreshKey} seekerId={seekerDetails?.user?.id} gender={seekerDetails?.gender}/>
              </div>
            )}
          </div>
        </div>

        {activeOverlayType?.includes("review") &&
            <ReviewOverlay
              open={true}
              onClose={() => {
                setActiveOverlayType(null);
              }}
              onSave={async () => {
                await refreshSeekerData();
                setTimelineRefreshKey(prev => prev + 1);
              }}
              seekerId={seekerId}
              programId={programId}
              initialRatings={reviewInitialRatings}
              initialComments={reviewInitialComments}
              onRefresh={refreshSeekerData}
              prevRating={prevRating}
              seekersData={seekerDetails}
              initialRecommendations={reviewInitialRecommendations}
              initialSeekerExperiences={seekerExperiences}
              setTimelineRefreshKey={setTimelineRefreshKey}
            />
          }
        {activeOverlayType === "swap" && (
          <SwapFilterOverlay
              open={true}
              swapTypeOptions={swapTypeOptions}
              programOptions={dynamicProgramOptions}
              seekerId={seekerDetails?.id || seekerId}
              initialData={activeSwapRequest ? {
                "id": activeSwapRequest?.id,
                "swapType": activeSwapRequest?.type,
                "selectedPrograms": activeSwapRequest?.requestedPrograms?.map((program: any) => program.id) || [],
                "reason": activeSwapRequest?.comment,
              } : {}}
              onUpdate={async () => {
                try {
                  setActiveOverlayType(null);
                  // Refresh seeker data which will update Redux and local state
                  await refreshSeekerData();
                } catch (error) { 
                  console.error("Error refreshing seeker data:", error);
                }
              }}
              onCancel={() => setActiveOverlayType(null)}
              seekerData={seekerDetails}
            />
          )}
  
        {activeOverlayType === textConstant.DEFAULTER && (
          <DefaulterOverlay
            open={true}
            onCancel={() => setActiveOverlayType(null)}
            onUpdate={async () => {
              setActiveOverlayType(null);
              const seekerInfo = await refreshSeekerData();
              if(hasPermission(userRole, RESOURCES.SEEKER_EXPERIENCE, "R") && seekerInfo?.user?.hdbDefaulter){
                fetchDefaulterTrackingData();
              }
            }}
            seekerData={{
              ...seekerDetails,
              isDefaulter: seekerDetails?.user?.hdbDefaulter,
              defaulterComment: seekerDetails?.user?.seekerDefaulter?.comment,
              userId: seekerDetails?.user?.id,
              registrationId: seekerDetails?.id,
            }}
            isLoading={loader > 0}
            isUpdateMode={seekerDetails?.user?.seekerDefaulter !== null || seekerDetails?.user?.seekerDefaulter?.length > 0}
          />
        )}
        
        <div className={styles.messageSection}>
          <MessageSection data={seekerDetails}></MessageSection>
        </div>
      </div>
      {alert.open && (
        <AlertPopup
          type={alert.type}
          message={alert.message}
          cancelSwap={alert?.cancelSwap || false}
          confirmText={alert?.confirmText ? alert.confirmText : ""}
          onConfirm={(reason?:string)   => {
            if (alert?.onReupload) {
              alert.onReupload();
            } else if (alert?.onConfirm) {
              alert.onConfirm(reason);
            }
            setAlert({ message: [], open: false, type: "" });
          }}
          cancelText={alert?.cancelText ? alert.cancelText : undefined}
          onCancel={() => {
            alert?.onCancel && alert.onCancel();
            setAlert({ message: [], open: false, type: "" });
          }}
        />
      )}
    </>
  );
};

export default RegisteredSeekerDetails;
