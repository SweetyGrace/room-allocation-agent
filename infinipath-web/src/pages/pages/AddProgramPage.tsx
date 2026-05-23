/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { format } from "date-fns";
import { Box } from "@mui/material";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSubPrograms } from "../../hooks/useSubPrograms";
import {
  venueOptions,
  currencyOptions,
  getInitialSubPrograms,
  getCurrencySymbol,
  prefillSubProgramFields,
  fetchWorkflowId,
} from "../../utils/programUtils";
import SubProgramsSection from "../../components/components/SubProgramsSection";
import { useAddProgramFormConfig } from "../../hooks/useAddProgramFormConfig";
import { DynamicFormSection } from "../../components/DynamicFormSection";
import { DynamicSubProgramsSection } from "../../components/DynamicSubProgramsSection";
import { DateRange } from 'rsuite/esm/DateRangePicker';
import styles from "./AddProgramPage.module.scss";
import { Button } from "../../common/components/Button";
import { getCall, postCall, putCall } from "../../services/apiService";
import { endPoints, PORTAL } from "../../constants/urlConstants";
import Loader from "../../common/components/Loader";
import { getCombinedLaunchDateTime } from "../../utils/dateTimeCombine";
import {
  getProgramImageForBanner,
  parseTimeStringToDate,
  generateProgramName,
  generateProgramCode,
} from "../../utils/commonFunctions";
import { getItemInLocalStorage } from "../../services/localStorage";
import Stepper from "../../components/programStepper";
import RectangularCard from "../../components/RectangularCard";
import CustomVenueModal from "../../common/components/CustomVenueModal";
import { validateFileTypeAndSize } from "../../utils/fileUploadValidation";
import { ADD_PROGRAM_PAGE_TEXT, PROGRAM_DETAILS_FORM_TEXT, BANNER_UPLOAD_TEXT, UPLOAD_TYPE, ANIMATION_MIME_TYPES } from "../../constants/textConstants";
import { handleAWSFileUpload } from "../RegisteredSeekersDetails/service";
import { incrementLoader, decrementLoader } from "../../reducers/ProgramReducer";
import { notify } from "../../common/components/ToastMessage";
import { WARNING } from "../../constants";
import { AddProgramFormValues } from "../../types/addProgramForm";
import BannerRenderer from "../../common/components/BannerRenderer";
import {
  FORM_FIELD_NAMES,
  FIELD_TYPES,
  PROGRAM_TYPE_NAMES,
  MODE_OF_PROGRAM_VALUES,
  PROGRAM_STRUCTURE_VALUES,
  YES_NO_VALUES,
  CURRENCY_VALUES,
  PROGRAM_STATUS,
  ONLINE_TYPE_VALUES,
  PROGRAM_LABELS,
  CUSTOM_PROGRAM_LIMITS,
  CODE_FORMAT_REGEX,
  SESSION_TYPES,
  DEFAULT_VALUES,
} from "../../constants/textConstants";
import { createProgramSchema } from "../../utils/programSchemaUtils";
import { useCrossFieldDateValidation } from "../../hooks/useCrossFieldDateValidation";

type SubProgramSession = {
  programStartTime?: Date | string;
  programEndTime?: Date | string;
  programStartDate?: Date | string;
  programEndDate?: Date | string;
  [key: string]: any;
};

const getEarliestStartTime = (sessions: SubProgramSession[]): string => {
  if (!sessions || sessions.length === 0) return DEFAULT_VALUES.TIME.START_FULL;
  const times = sessions.map(s => {
    if (s.programStartTime) {
      const time = new Date(s.programStartTime);
      return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
    }
    return null;
  }).filter(Boolean) as string[];
  if (times.length === 0) return DEFAULT_VALUES.TIME.START_FULL;
  const sortedTimes = times.sort((a, b) => a.localeCompare(b));
  const earliestTime = sortedTimes[0];
  return earliestTime.length === 5 ? earliestTime + ':00' : earliestTime;
};

const getLatestEndTime = (sessions: SubProgramSession[]): string => {
  if (!sessions || sessions.length === 0) return DEFAULT_VALUES.TIME.END_FULL;
  const times = sessions.map(s => {
    if (s.programEndTime) {
      const time = new Date(s.programEndTime);
      return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
    }
    return null;
  }).filter(Boolean) as string[];
  if (times.length === 0) return DEFAULT_VALUES.TIME.END_FULL;
  const sortedTimes = times.sort((a, b) => b.localeCompare(a));
  const latestTime = sortedTimes[0];
  return latestTime.length === 5 ? latestTime + ':00' : latestTime;
};

const getMaxSessionDurationDays = (sessions: SubProgramSession[]): number => {
  if (!sessions || sessions.length === 0) return 0;
  let maxDuration = 0;
  sessions.forEach(session => {
    if (session.programStartDate && session.programEndDate) {
      const start = new Date(session.programStartDate);
      const end = new Date(session.programEndDate);
      const durationInMs = end.getTime() - start.getTime();
      const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24));
      if (durationInDays > maxDuration) {
        maxDuration = durationInDays;
      }
    }
  });
  return maxDuration;
};

const validateSubProgramCounts = (
  programStructureValue: string,
  subProgramsValue: any[],
  formData: any,
  programType: any,
  notifyFn: (title: string, msg: string, type: string) => void,
  warningType: string,
): boolean => {
  const requiresSubs =
    programStructureValue === PROGRAM_STRUCTURE_VALUES.MULTIPLE ||
    programStructureValue === PROGRAM_STRUCTURE_VALUES.GROUPED ||
    programType?.data?.hasMultipleSessions ||
    programType?.hasMultipleSessions;


  if (requiresSubs && subProgramsValue.length === 0) {
    notifyFn(
      ADD_PROGRAM_PAGE_TEXT.ERRORS.GENERIC_ERROR_TITLE,
      programStructureValue === PROGRAM_STRUCTURE_VALUES.GROUPED
        ? ADD_PROGRAM_PAGE_TEXT.ERRORS.NO_SUB_PROGRAMS
        : ADD_PROGRAM_PAGE_TEXT.ERRORS.NO_SESSIONS,
      warningType,
    );
    return false;
  }

  if (programStructureValue === PROGRAM_STRUCTURE_VALUES.MULTIPLE) {
    const declared = parseInt(formData.noOfSession) || 0;
    if (declared !== subProgramsValue.length) {
      notifyFn(
        ADD_PROGRAM_PAGE_TEXT.ERRORS.GENERIC_ERROR_TITLE,
        ADD_PROGRAM_PAGE_TEXT.ERRORS.SESSION_COUNT_MISMATCH(declared, subProgramsValue.length),
        warningType,
      );
      return false;
    }
  }

  if (programStructureValue === PROGRAM_STRUCTURE_VALUES.GROUPED) {
    const declared = parseInt(formData.noOfSubPrograms) || 0;
    if (declared !== subProgramsValue.length) {
      notifyFn(
        ADD_PROGRAM_PAGE_TEXT.ERRORS.GENERIC_ERROR_TITLE,
        ADD_PROGRAM_PAGE_TEXT.ERRORS.SUB_PROGRAM_COUNT_MISMATCH(declared, subProgramsValue.length),
        warningType,
      );
      return false;
    }
  }

  return true;
};

const AddProgramPage = () => {
  // Get programId from URL params instead of location.state
  const { programId: _programId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("templateId") || location?.state?.templateId;
  const _programTypeId = searchParams.get("programTypeId") || location?.state?.programTypeId;
  const programTypeName = searchParams.get("programTypeName") || location?.state?.programTypeName || PROGRAM_TYPE_NAMES.HDB;
  
  
  // State variables -- Intial entry point of the program data getting through location state, else it will be null
  const [programType, setProgramType] = useState<any>();
  const [workflowId, setWorkflowId] = useState<number | null>(null);
  const [_dataOfExitingProgram, _setDataOfExitingProgram] = useState<any>();
  const [existingProgramData, setExistingProgramData] = useState<any>();
  const [isEditMode, setIsEditMode] = useState(
    !!existingProgramData || !!location?.state?.isEditMode,
  );
  const [isPublished, setIsPublished] = useState(false);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [codeAvailable, setCodeAvailable] = useState<boolean | null>(null);
  const [_originalSeatLimit, _setOriginalSeatLimit] = useState(0);
  const [loader, _setLoader] = useState(false);
  const [_currentStep, _setCurrentStep] = useState(1);
  const [_showCustomVenue, setShowCustomVenue] = useState(false);
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);
  const [bannerAnimationUrl, setBannerAnimationUrl] = useState<string | null>(null);
  const [uploadedBanner, setUploadedBanner] = useState<File | null>(null);
  const [bannerUploadError, setBannerUploadError] = useState<string | null>(null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [_deleteDialogOpen, _setDeleteDialogOpen] = useState(false);
  const [subProgramToDelete, setSubProgramToDelete] = useState<string | null>(
    null,
  );
  const [_isDataLoaded, setIsDataLoaded] = useState(false);
  const [customVenue, setCustomVenue] = useState("");
  const [isCustomVenueModalOpen, setCustomVenueModalOpen] = useState(false);

  // Date range states for main program
  const [_dateRange, _setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [_registrationDateRange, _setRegistrationDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  // Date range states for sub-programs
  const [subProgramDateRanges, setSubProgramDateRanges] = useState<{
    [key: string]: [Date | null, Date | null];
  }>({});

  const [defaultValuesState, setDefaultValuesState] = useState<any>({});

  // Function to create default sessions dynamically based on program type
  const createDefaultHDBSessions = (programType: any, startDate: any, endDate: any) => {
    const defaultStartTime = parseTimeStringToDate(
      programType?.defaultStartTime,
    );
    const defaultEndTime = parseTimeStringToDate(programType?.defaultEndTime);
    const isResendential = programType?.requiresResidence ? YES_NO_VALUES.YES : YES_NO_VALUES.NO;
    const venueAddress = programType?.venue ? [programType?.venue] : [];
    
    // Get program type name (e.g., "HDB", "TAT", etc.)
    const programTypeName = programType?.name || PROGRAM_DETAILS_FORM_TEXT.UI.SESSION;
    const isTATProgram = programTypeName.toUpperCase().includes(PROGRAM_TYPE_NAMES.TAT);
    const isHDBProgram = programTypeName.toUpperCase().includes(PROGRAM_TYPE_NAMES.HDB) || programTypeName.toUpperCase().includes(PROGRAM_TYPE_NAMES.MSD);
    // Get number of sessions (default to 5 for HDB programs that have multiple sessions)
    const numberOfSessions = programType?.noOfSession || 5;

    // Create sessions dynamically with appropriate labels
    const isEntrainmentProgram = programTypeName.toUpperCase().includes(PROGRAM_TYPE_NAMES.ENTRAINMENT_UPPER);
    const defaultSessions = Array.from({ length: numberOfSessions }, (_, index) => ({
      title: isTATProgram ? `${PROGRAM_LABELS.SESSION} ${index + 1}` : isHDBProgram ? `${PROGRAM_LABELS.SUB_PROGRAM} ${index + 1}` : `${programTypeName} ${index + 1}`,
      description: (isHDBProgram || isTATProgram || isEntrainmentProgram) ? "" : `${programTypeName} ${index + 1} ${PROGRAM_LABELS.DESCRIPTION_SUFFIX}`,
      modeOfProgram: programType?.modeOfOperation || MODE_OF_PROGRAM_VALUES.OFFLINE,
      hasSeatLimit: programType?.limitedSeats > 0 ? YES_NO_VALUES.YES : YES_NO_VALUES.NO,
      seatLimit: programType?.maxCapacity?.toString() || "",
      hasWaitlist: programType?.waitlistApplicable ? YES_NO_VALUES.YES : YES_NO_VALUES.NO,
      waitlistTriggerCount:
        programType?.waitlistTriggerCount?.toString() || "",
      isPaymentRequired: programType?.requiresPayment ? YES_NO_VALUES.YES : YES_NO_VALUES.NO,
      currency: CURRENCY_VALUES.INR,
      programFee: programType?.basePrice?.toString() || "",
      sessionType: SESSION_TYPES.HDB,
      sessionPrice: programType?.basePrice?.toString() || 50000,
      isActive: true,
      startTime: defaultStartTime || null,
      endTime: defaultEndTime || null,
      isResendential: isResendential,
      venueAddress: venueAddress,
      startDate: null as any,
      endDate: null as any,
    }));

    // Add dates if available
    if (startDate && endDate) {
      const sessionDuration = Math.floor(
        (endDate.getTime() - startDate.getTime()) /
          (1000 * 60 * 60 * 24 * defaultSessions.length),
      );

      defaultSessions.forEach((session, index) => {
        const sessionStartDate = new Date(startDate);
        sessionStartDate.setDate(
          sessionStartDate.getDate() + index * sessionDuration,
        );

        const sessionEndDate = new Date(sessionStartDate);
        sessionEndDate.setDate(
          sessionEndDate.getDate() + Math.max(1, sessionDuration - 1),
        );

        session.startDate = sessionStartDate;
        session.endDate = sessionEndDate;
      });
    }
    return defaultSessions;
  };

  const getExistingSubPrograms = (groupedPrograms: any) => {
    const programTypeName = programType?.data?.name || programType?.name || "";
    const isHDBOrTAT = programTypeName.toUpperCase().includes(PROGRAM_TYPE_NAMES.HDB) || 
                       programTypeName.toUpperCase().includes(PROGRAM_TYPE_NAMES.MSD) || 
                       programTypeName.toUpperCase().includes(PROGRAM_TYPE_NAMES.TAT) ||
                       programTypeName.toUpperCase().includes(PROGRAM_TYPE_NAMES.ENTRAINMENT_UPPER);
    
    return groupedPrograms.map((session: any) => ({
      id: session.id, // Keep session ID for updates
      title: session.name,
      code: session.code || "",
      description: isHDBOrTAT ? "" : (session.description || `${session.name} ${PROGRAM_LABELS.SESSION_LOWERCASE}`),
      startDate: new Date(session.startDate),
      startsAt: new Date(session?.programStartDate?.toISOString()),
      endDate: new Date(session.endDate),
      modeOfProgram:
        session.modeOfOperation || programType?.modeOfOperation || MODE_OF_PROGRAM_VALUES.OFFLINE,
      venueAddress: session.venue ? [session.venue] : [],
      hasSeatLimit: session.totalSeats > 0 ? YES_NO_VALUES.YES : undefined,
      seatLimit: session.totalSeats?.toString() || "",
      hasWaitlist: session.waitlistTriggerCount > 0 ? YES_NO_VALUES.YES : undefined,
      waitlistTriggerCount: session.waitlistTriggerCount?.toString() || "",
      isPaymentRequired: programType?.requiresPayment ? YES_NO_VALUES.YES : YES_NO_VALUES.NO,
      currency: programType?.currency || CURRENCY_VALUES.INR,
      programFee: programType?.basePrice || "",
      sessionType: session.sessionType || SESSION_TYPES.HDB,
      sessionPrice: session.basePrice || session.programFee || programType?.data?.basePrice?.toString() ,
      isActive: session.isActive !== undefined ? session.isActive : true,
      isResendential: session?.requiresResidence ? YES_NO_VALUES.YES : YES_NO_VALUES.NO,

      programStartDate: session?.startsAt ? new Date(session.startsAt) : null,
      programStartTime: session?.startsAt ? new Date(session.startsAt) : null,
      programEndDate: session?.endsAt ? new Date(session.endsAt) : null,
      programEndTime: session?.endsAt ? new Date(session.endsAt) : null,
      checkInStartDate: session?.checkinAt ? new Date(session.checkinAt) : null,
      checkInStartTime: session?.checkinAt ? new Date(session.checkinAt) : null,
      checkInEndDate: session?.checkinEndsAt
        ? new Date(session.checkinEndsAt)
        : null,
      checkInEndTime: session?.checkinEndsAt
        ? new Date(session.checkinEndsAt)
        : null,
      checkOutStartDate: session?.checkoutAt
        ? new Date(session.checkoutAt)
        : null,
      checkOutStartTime: session?.checkoutAt
        ? new Date(session.checkoutAt)
        : null,
      checkOutEndDate: session?.checkoutEndsAt
        ? new Date(session.checkoutEndsAt)
        : null,
      checkOutEndTime: session?.checkoutEndsAt
        ? new Date(session.checkoutEndsAt)
        : null,

     }));
  };

  // Converts a boolean or 'yes'/'no' string to YES_NO_VALUES
  const toYesNo = (val: any, defaultVal: string = ''): string => {
    if (val === YES_NO_VALUES.YES || val === true) return YES_NO_VALUES.YES;
    if (val === YES_NO_VALUES.NO || val === false) return YES_NO_VALUES.NO;
    if (typeof val === 'string' && val) return val;
    return defaultVal;
  };

  // Shared helper: build fields common to all program types from API data.
  // savedMeta is the meta object from the API response (contains fields not stored top-level).
  const buildCommonFields = (updatedProgramType: any, savedMeta: any = {}) => {
    // Online details may come back nested from the API
    const md = updatedProgramType?.meetingDetails || {};
    const wd = updatedProgramType?.webinarDetails || {};
    const sd = updatedProgramType?.streamDetails || {};
    return ({
    description: updatedProgramType?.description || "",
    logoUrl: updatedProgramType?.logoUrl || "",
    modeOfProgram: updatedProgramType?.modeOfOperation || updatedProgramType?.modeOfProgram || MODE_OF_PROGRAM_VALUES.ONLINE,
    isPaymentRequired: toYesNo(updatedProgramType?.requiresPayment),
    requiresPayment: toYesNo(updatedProgramType?.requiresPayment),
    currency: updatedProgramType?.currency || CURRENCY_VALUES.INR,
    programFee: updatedProgramType?.basePrice?.toString() || "",
    hdbFee: updatedProgramType?.meta?.price?.[0]?.HDB?.toString() || "",
    msdFee: updatedProgramType?.meta?.price?.[1]?.MSD?.toString() || "",
    gstPercentage: (() => {
      // Prefer the API's precomputed gstPercentage; fall back to summing cgst + sgst
      const direct = updatedProgramType?.gstPercentage;
      if (direct != null && direct !== '') return direct.toString();
      const sum = (parseFloat(updatedProgramType?.cgst?.toString() || '0') || 0)
               + (parseFloat(updatedProgramType?.sgst?.toString() || '0') || 0);
      return sum > 0 ? sum.toString() : '';
    })(),
    hasSeatLimit: (updatedProgramType?.maxCapacity > 0 || updatedProgramType?.limitedSeats === true || updatedProgramType?.hasSeatLimit === YES_NO_VALUES.YES) ? YES_NO_VALUES.YES : (updatedProgramType?.maxCapacity != null || updatedProgramType?.limitedSeats != null || updatedProgramType?.hasSeatLimit != null) ? YES_NO_VALUES.NO : "",
    seatLimit: updatedProgramType?.maxCapacity?.toString() || "",
    totalSeats: updatedProgramType?.totalSeats?.toString() || updatedProgramType?.maxCapacity?.toString() || "",
    hasWaitlist: toYesNo(updatedProgramType?.waitlistApplicable),
    waitlistApplicable: toYesNo(updatedProgramType?.waitlistApplicable),
    waitlistTriggerCount: updatedProgramType?.waitlistTriggerCount?.toString() || "",
    approvalRequired: toYesNo(updatedProgramType?.requiresApproval),
    // startTime/endTime: use actual startsAt/endsAt when available (edit mode), fall back to
    // type-level defaultStartTime for create mode where the instance time is not set yet.
    startDate: updatedProgramType?.startsAt ? new Date(updatedProgramType.startsAt) : null,
    startTime: updatedProgramType?.startsAt ? new Date(updatedProgramType.startsAt) : parseTimeStringToDate(updatedProgramType?.defaultStartTime),
    endDate: updatedProgramType?.endsAt ? new Date(updatedProgramType.endsAt) : null,
    endTime: updatedProgramType?.endsAt ? new Date(updatedProgramType.endsAt) : parseTimeStringToDate(updatedProgramType?.defaultEndTime),
    // blessEndsAt datetime — set both the date field and its time sibling
    blessEndsAt: updatedProgramType?.blessEndsAt ? new Date(updatedProgramType.blessEndsAt) : null,
    blessEndsAtTime: updatedProgramType?.blessEndsAt ? new Date(updatedProgramType.blessEndsAt) : null,
    // registration datetime fields — both date picker value and time picker sibling
    registrationStartDate: updatedProgramType?.registrationStartsAt ? new Date(updatedProgramType.registrationStartsAt) : null,
    registrationStartTime: updatedProgramType?.registrationStartsAt ? new Date(updatedProgramType.registrationStartsAt) : null,
    registrationEndDate: updatedProgramType?.registrationEndsAt ? new Date(updatedProgramType.registrationEndsAt) : null,
    registrationEndTime: updatedProgramType?.registrationEndsAt ? new Date(updatedProgramType.registrationEndsAt) : null,
    // hasCheckinCheckout controls visibility of checkin/checkout fields in the CUSTOM form config.
    // Must be prefilled so those fields are shown and populated in edit mode.
    hasCheckinCheckout: toYesNo(updatedProgramType?.hasCheckinCheckout),
    // checkin/checkout datetime fields — set both date picker and time picker siblings
    checkinAt: updatedProgramType?.checkinAt ? new Date(updatedProgramType.checkinAt) : null,
    checkinAtTime: updatedProgramType?.checkinAt ? new Date(updatedProgramType.checkinAt) : null,
    checkinEndsAt: updatedProgramType?.checkinEndsAt ? new Date(updatedProgramType.checkinEndsAt) : null,
    checkinEndsAtTime: updatedProgramType?.checkinEndsAt ? new Date(updatedProgramType.checkinEndsAt) : null,
    checkoutAt: updatedProgramType?.checkoutAt ? new Date(updatedProgramType.checkoutAt) : null,
    checkoutAtTime: updatedProgramType?.checkoutAt ? new Date(updatedProgramType.checkoutAt) : null,
    checkoutEndsAt: updatedProgramType?.checkoutEndsAt ? new Date(updatedProgramType.checkoutEndsAt) : null,
    checkoutEndsAtTime: updatedProgramType?.checkoutEndsAt ? new Date(updatedProgramType.checkoutEndsAt) : null,
    isResendential: toYesNo(updatedProgramType?.requiresResidence),
    isResidenceRequired: toYesNo(updatedProgramType?.isResidenceRequired ?? updatedProgramType?.requiresResidence),
    isTravelInvolved: toYesNo(updatedProgramType?.isTravelInvolved ?? updatedProgramType?.involvesTravel),
    totalBedCount: updatedProgramType?.totalBedCount?.toString() || "",
    allowsProxyRegistration: toYesNo(updatedProgramType?.allowsProxyRegistration),
    allowSaveAsDraft: toYesNo(updatedProgramType?.allowSaveAsDraft),
    hasGoodies: toYesNo(updatedProgramType?.hasGoodies ?? savedMeta.hasGoodies),
    seekerCanShareExperience: toYesNo(updatedProgramType?.seekerCanShareExperience),
    childMinAge: updatedProgramType?.childMinAge != null ? updatedProgramType.childMinAge.toString() : "",
    childMaxAge: updatedProgramType?.childMaxAge != null ? updatedProgramType.childMaxAge.toString() : "",
    elderMinAge: updatedProgramType?.elderMinAge != null ? updatedProgramType.elderMinAge.toString() : "",
    elderMaxAge: updatedProgramType?.elderMaxAge != null ? updatedProgramType.elderMaxAge.toString() : "",
    venueAddress: updatedProgramType?.venue ? [updatedProgramType.venue] : [],
    venue: updatedProgramType?.venue || "",
    venueNameInEmail: updatedProgramType?.venueNameInEmails || updatedProgramType?.venueNameInEmail || "",
    // Stored in meta because they are not standard API fields
    sameVenueForAll: savedMeta.sameVenueForAll || updatedProgramType?.sameVenueForAll || "",
    sameOnlineDetailsForAll: savedMeta.sameOnlineDetailsForAll || updatedProgramType?.sameOnlineDetailsForAll || "",
    onlineType: updatedProgramType?.onlineType || "",
    // Online detail fields — flat on the form, but the API nests them; read both ways
    meetingLink: updatedProgramType?.meetingLink || md.meetingLink || "",
    meetingId: updatedProgramType?.meetingId || md.meetingId || "",
    meetingPassword: updatedProgramType?.meetingPassword || md.meetingPassword || "",
    webinarLink: updatedProgramType?.webinarLink || wd.webinarLink || "",
    webinarId: updatedProgramType?.webinarId || wd.webinarId || "",
    webinarPassword: updatedProgramType?.webinarPassword || wd.webinarPassword || "",
    panelistLink: updatedProgramType?.panelistLink || wd.panelistLink || "",
    registrationLink: updatedProgramType?.registrationLink || wd.registrationLink || "",
    streamUrl: updatedProgramType?.streamUrl || sd.streamUrl || "",
    backupStreamUrl: updatedProgramType?.backupStreamUrl || sd.backupStreamUrl || "",
    chatUrl: updatedProgramType?.chatUrl || sd.chatUrl || "",
    bannerImageUrl: isEditMode ? (updatedProgramType?.bannerImageUrl || "") : "",
    bannerAnimationUrl: isEditMode ? (updatedProgramType?.bannerAnimationUrl || "") : "",
    helpLineNumber: updatedProgramType?.helplineNumber || "",
    helplineNumber: updatedProgramType?.helplineNumber || "",
    emailSenderName: updatedProgramType?.emailSenderName || "",
    emailSenderAddress: updatedProgramType?.emailSenderAddress || "",
    emailBccName: updatedProgramType?.emailBccName || "",
    emailBccAddress: updatedProgramType?.emailBccAddress || "",
    // Tax / invoice — dual names for legacy and CUSTOM configs.
    // API key for tds applicability can be 'tdsApplicability' or 'tdsApplicableTo'.
    tdsLimit: updatedProgramType?.tdsPercent?.toString() || "",
    tdsPercent: updatedProgramType?.tdsPercent?.toString() || "",
    tdsApplicableTo: updatedProgramType?.tdsApplicability || updatedProgramType?.tdsApplicableTo || "",
    tdsApplicability: updatedProgramType?.tdsApplicability || updatedProgramType?.tdsApplicableTo || "",
    cgstLimit: updatedProgramType?.cgst?.toString() || "",
    cgst: updatedProgramType?.cgst?.toString() || "",
    sgstLimit: updatedProgramType?.sgst?.toString() || "",
    sgst: updatedProgramType?.sgst?.toString() || "",
    igstLimit: updatedProgramType?.igst?.toString() || "",
    igst: updatedProgramType?.igst?.toString() || "",
    gstNumber: updatedProgramType?.gstNumber || updatedProgramType?.gstin || "",
    gstin: updatedProgramType?.gstNumber || updatedProgramType?.gstin || "",
    nameInInvoice: updatedProgramType?.invoiceSenderName || "",
    invoiceSenderName: updatedProgramType?.invoiceSenderName || "",
    pan: updatedProgramType?.invoiceSenderPan || "",
    invoiceSenderPan: updatedProgramType?.invoiceSenderPan || "",
    cin: updatedProgramType?.invoiceSenderCin || "",
    invoiceSenderCin: updatedProgramType?.invoiceSenderCin || "",
    address: updatedProgramType?.invoiceSenderAddress || "",
    invoiceSenderAddress: updatedProgramType?.invoiceSenderAddress || "",
  });
  };

  // Updated getDefaultValues function
  const getDefaultValues = () => {
    // In edit mode, programType.data.name is overwritten by the program instance name
    // (e.g. "My CUSTOM Program 2026"), so it cannot be used for type detection.
    // Use programTypeName from URL/state (same source as useAddProgramFormConfig) instead.
    const resolvedTypeName = (programTypeName?.split(/[/\-\s]/)[0]?.trim() || "").toUpperCase();
    const baseTypeName = programType?.data?.name || programType?.name || "";
    const updatedProgramType = programType?.data;

    const programName = isEditMode && existingProgramData?.name
      ? existingProgramData.name
      : generateProgramName(baseTypeName || PROGRAM_TYPE_NAMES.CUSTOM);
    const programCode = isEditMode && existingProgramData?.code
      ? existingProgramData.code
      : generateProgramCode(baseTypeName || PROGRAM_TYPE_NAMES.CUSTOM);

    // CUSTOM type
    if (resolvedTypeName === PROGRAM_TYPE_NAMES.CUSTOM) {
      // Create mode: populate from the program-type config so the form structure
      // (visible/hidden conditional fields) is identical to edit mode.
      // Only difference from edit mode is that all values are the type-level defaults,
      // not a saved program instance's values.
      if (!isEditMode) {
        return {
          programStructure: "",
          noOfSession: "",
          noOfSubPrograms: "",
          subPrograms: [] as any[],
        };
      }

      // Edit mode: restore all fields from API response
      const existingSessions = existingProgramData?.sessions || [];
      const existingGrouped = existingProgramData?.groupedPrograms || [];
      const fallbackSubPrograms = existingProgramData?.subPrograms || [];
      // Check grouped first — sessions can always be present even for grouped programs
      const existingSubPrograms = existingGrouped.length > 0 ? existingGrouped
        : existingSessions.length > 0 ? existingSessions
        : fallbackSubPrograms;

      // meta may come back under programType.data.meta or existingProgramData.meta
      const savedMeta = updatedProgramType?.meta || existingProgramData?.meta || {};

      // programStructure always comes from meta first — it is the source of truth
      let programStructure = savedMeta.programStructure
        || updatedProgramType?.programStructure
        || existingProgramData?.programStructure
        || "";

      let noOfSession = updatedProgramType?.noOfSession?.toString() || "";
      let noOfSubPrograms = updatedProgramType?.noOfSubPrograms?.toString() || savedMeta.noOfSubPrograms?.toString() || "";
      // Derive counts from data arrays; check grouped first since sessions can always be present.
      // Only set programStructure from data if meta didn't provide it.
      if (existingGrouped.length > 0) {
        if (!programStructure) programStructure = PROGRAM_STRUCTURE_VALUES.GROUPED;
        noOfSubPrograms = existingGrouped.length.toString();
        noOfSession = "";
      } else if (existingSessions.length > 0) {
        if (!programStructure) programStructure = PROGRAM_STRUCTURE_VALUES.MULTIPLE;
        noOfSession = existingSessions.length.toString();
        noOfSubPrograms = "";
      } else if (fallbackSubPrograms.length > 0) {
        if (!programStructure) programStructure = PROGRAM_STRUCTURE_VALUES.MULTIPLE;
        if (programStructure === PROGRAM_STRUCTURE_VALUES.GROUPED) {
          noOfSubPrograms = fallbackSubPrograms.length.toString();
          noOfSession = "";
        } else {
          noOfSession = fallbackSubPrograms.length.toString();
          noOfSubPrograms = "";
        }
      } else {
        if (!programStructure) programStructure = PROGRAM_STRUCTURE_VALUES.SINGLE;
      }

      return {
        programName,
        programCode,
        subProgramType: updatedProgramType?.subProgramType || existingProgramData?.subProgramType || savedMeta?.subProgramType || "",
        programStructure,
        noOfSession,
        noOfSubPrograms,
        ...buildCommonFields(updatedProgramType, savedMeta),
        subPrograms: existingSubPrograms.length > 0
          ? existingSubPrograms.map((s: any) => {
              // Flatten nested online details from the API response
              const md = s.meetingDetails || {};
              const wd = s.webinarDetails || {};
              const sd = s.streamDetails || {};
              // Convert ISO strings to Date objects for all datetime fields.
              // The config uses field.fields[0]/[1] for startsAt/startsAtTime, so
              // both must be Date objects; same pattern for checkinAt, etc.
              const toDate = (val: any) => (val ? new Date(val) : null);
              // Parent-level checkin defaults — used when session has no saved values
              const parentCheckinAt = toDate(updatedProgramType?.checkinAt);
              const parentCheckinEndsAt = toDate(updatedProgramType?.checkinEndsAt);
              const parentCheckoutAt = toDate(updatedProgramType?.checkoutAt);
              const parentCheckoutEndsAt = toDate(updatedProgramType?.checkoutEndsAt);
              return {
                ...s,
                // startsAt/endsAt datetime fields need both date and time siblings
                startsAt: toDate(s.startsAt),
                startsAtTime: toDate(s.startsAt),
                endsAt: toDate(s.endsAt),
                endsAtTime: toDate(s.endsAt),
                // blessEndsAt and canRegisterTill (CUSTOM_grouped)
                blessEndsAt: toDate(s.blessEndsAt),
                blessEndsAtTime: toDate(s.blessEndsAt),
                canRegisterTill: toDate(s.canRegisterTill),
                canRegisterTillTime: toDate(s.canRegisterTill),
                // checkin/checkout: use session's own value; fall back to parent program
                // so sessions inherit the same check-in times when they were not set per-session.
                checkinAt: toDate(s.checkinAt) || parentCheckinAt,
                checkinAtTime: toDate(s.checkinAt) || parentCheckinAt,
                checkinEndsAt: toDate(s.checkinEndsAt) || parentCheckinEndsAt,
                checkinEndsAtTime: toDate(s.checkinEndsAt) || parentCheckinEndsAt,
                checkoutAt: toDate(s.checkoutAt) || parentCheckoutAt,
                checkoutAtTime: toDate(s.checkoutAt) || parentCheckoutAt,
                checkoutEndsAt: toDate(s.checkoutEndsAt) || parentCheckoutEndsAt,
                checkoutEndsAtTime: toDate(s.checkoutEndsAt) || parentCheckoutEndsAt,
                // hasCheckinCheckout: inherit from parent when not explicitly set on session
                hasCheckinCheckout: toYesNo(s.hasCheckinCheckout) || toYesNo(updatedProgramType?.hasCheckinCheckout),
                modeOfOperation: s.modeOfOperation || (updatedProgramType?.modeOfOperation === MODE_OF_PROGRAM_VALUES.ONLINE ? MODE_OF_PROGRAM_VALUES.ONLINE : MODE_OF_PROGRAM_VALUES.OFFLINE),
                // Flatten online detail fields (API nests them; form uses flat names)
                meetingLink: s.meetingLink || md.meetingLink || '',
                meetingId: s.meetingId || md.meetingId || '',
                meetingPassword: s.meetingPassword || md.meetingPassword || '',
                webinarLink: s.webinarLink || wd.webinarLink || '',
                webinarId: s.webinarId || wd.webinarId || '',
                webinarPassword: s.webinarPassword || wd.webinarPassword || '',
                panelistLink: s.panelistLink || wd.panelistLink || '',
                registrationLink: s.registrationLink || wd.registrationLink || '',
                streamUrl: s.streamUrl || sd.streamUrl || '',
                backupStreamUrl: s.backupStreamUrl || sd.backupStreamUrl || '',
                chatUrl: s.chatUrl || sd.chatUrl || '',
                // API uses venueNameInEmails; form field name is venueNameInEmail
                venueNameInEmail: s.venueNameInEmail || s.venueNameInEmails || '',
              };
            })
          : [] as any[],
      };
    }

    // Calculate default dates (HDB/TAT/MSD etc.)
    const defaultStartDate = programType?.startDate ? new Date(programType.startDate) : null;
    const defaultEndDate = programType?.endDate ? new Date(programType.endDate) : null;

    const defaultValues = {
      programName,
      programCode,
      ...buildCommonFields(updatedProgramType),
      subPrograms: [] as any[],
    };

    // Add default sessions if program has multiple sessions (HDB, TAT, etc.)
    // In edit mode, prefer raw API response as source of truth.
    // Sessions may be under groupedPrograms (isGroupedProgram=true) or sessions (isGroupedProgram=false)
    const existingGroupedPrograms =
      existingProgramData?.groupedPrograms ||
      existingProgramData?.sessions ||
      updatedProgramType?.groupedPrograms;

    if (
      !isEditMode &&
      !existingGroupedPrograms &&
      (programType?.hasMultipleSessions ||
        programType.data?.hasMultipleSessions)
    ) {
      // Only create default sessions in create mode
      defaultValues.subPrograms = createDefaultHDBSessions(
        programType?.data ? programType.data : programType,
        defaultStartDate,
        defaultEndDate,
      );
    } else {
      // In edit mode or when grouped programs exist, use existing data
      defaultValues.subPrograms =
        existingGroupedPrograms?.length > 0
          ? getExistingSubPrograms(existingGroupedPrograms)
          : [];
    }
    return defaultValues;
  };


  //Intial Data setup by making an API call to fetch program type details
  const fetchProgramDetails = async (programTypeId: string): Promise<void> => {
    if (!programTypeId) {
      return;
    }

    try {
      dispatch(incrementLoader(ADD_PROGRAM_PAGE_TEXT.VALUES.LOADER_TYPE_LARGE));
      
      if (location?.state?.isEditMode) {
        // In edit mode, fetch the program data
        const programResponse = await getCall(
          `${endPoints.program}/${programTypeId}`,
          undefined,
          PORTAL
        );
        
        if (programResponse?.data?.data) {
          const programData = programResponse.data.data;
          
          // Set existingProgramData
          setExistingProgramData(programData);
          setCodeAvailable(true); // existing code is valid on load

          // Check if program is published (case-insensitive)
          const isProgramPublished = programData.status?.toLowerCase() === PROGRAM_STATUS.PUBLISHED;
          setIsPublished(isProgramPublished);
          
          // Store original seat limit for validation
          _setOriginalSeatLimit(programData.totalSeats || 0);
          
          // Set banner - check for both image and animation URLs
          if (programData?.bannerAnimationUrl) {
            setBannerAnimationUrl(programData?.bannerAnimationUrl);
            setBannerImageUrl(null);
          } else if (programData?.bannerImageUrl) {
            setBannerImageUrl(programData?.bannerImageUrl);
            setBannerAnimationUrl(null);  
          } else if (programData?.bannerUrl) {
            // Fallback to old bannerUrl field
            setBannerImageUrl(programData?.bannerUrl);
            setBannerAnimationUrl(null);
          }
          
          // Now fetch the program TYPE data using the typeId
          const typeId = programData.typeId;
          
          const typeResponse = await getCall(
            `${endPoints.programType}/${typeId}`,
            undefined,
            PORTAL
          );
          
          if (typeResponse?.data) {
            // Merge program type data with program data
            setProgramType({
              ...typeResponse.data,
              data: {
                ...typeResponse.data.data,
                ...programData, // Include actual program data
              }
            });
          }
          
          setIsEditMode(true);
        } else {
          throw new Error(ADD_PROGRAM_PAGE_TEXT.ERRORS.NO_PROGRAM_DATA);
        }
      } else {
        // In create mode, just fetch program type
        const endpoint = `${endPoints.programType}/${programTypeId}`;
        
        const response = await getCall(endpoint, undefined, PORTAL);
        
        if (response?.data) {
          // Do not prefill banner in create mode
          setProgramType(response.data);
        } else {
          throw new Error(ADD_PROGRAM_PAGE_TEXT.ERRORS.NO_PROGRAM_TYPE_DETAILS);
        }
      }
      
      setIsDataLoaded(true);
    } catch (error) {
      notify(
        ADD_PROGRAM_PAGE_TEXT.ERRORS.GENERIC_ERROR_TITLE,
        ADD_PROGRAM_PAGE_TEXT.ERRORS.FETCH_PROGRAM_TYPE_FAILED,
        WARNING
      );
      navigate("/admin/choose-program"); // Redirect on error
    } finally {
      dispatch(decrementLoader(ADD_PROGRAM_PAGE_TEXT.VALUES.LOADER_TYPE_LARGE)); // Hide loading state
    }
  };

  //MOUNTING
  useEffect(() => {
    fetchProgramDetails(location?.state?.programTypeId);
  }, []);

  // Fetch workflowId when programType changes
  useEffect(() => {
    const loadWorkflowId = async () => {
      if (programType?.data?.key) {
        const fetchedWorkflowId = await fetchWorkflowId(programType.data.key);
        if (fetchedWorkflowId) {
          setWorkflowId(fetchedWorkflowId);
        }
      }
    };
    
    loadWorkflowId();
  }, [programType]);

  // Set default values when programType changes
  // This will run when programType is fetched or updated
  // and will reset the form with new default values
  useEffect(() => {
    if (programType?.data) {
      const values = getDefaultValues();
      setDefaultValuesState(values);
      reset(values); // Reset form with default values

      // Explicitly set start and end dates
      if ((values as any).startDate) {
        setValue(FORM_FIELD_NAMES.START_DATE, (values as any).startDate);
      }
      if ((values as any).endDate) {
        setValue(FORM_FIELD_NAMES.END_DATE, (values as any).endDate);
      }
    }
  }, [programType]);

  // Refs to hold current program date range — used by the schema validator without circular deps
  const mainStartDateRef = useRef<Date | null>(null);
  const mainEndDateRef = useRef<Date | null>(null);
  // Preserve travel/checkin/residence values when switching to online so they can be restored on switch back
  const offlineModeValuesRef = useRef<Record<string, any>>({});
  const formRef = useRef<HTMLFormElement>(null);

  // Form setup with dynamic schema and default values
  const {
    control,
    setValue,
    watch,
    getValues,
    trigger,
    handleSubmit,
    reset,
    setError: _setError,
    clearErrors: _clearErrors,
    formState: { errors },
  } = useForm<AddProgramFormValues>({
    resolver: (values, context, options) =>
      (yupResolver(createProgramSchema(programType?.data || {}, mainStartDateRef.current, mainEndDateRef.current, programTypeName, formConfig?.sections, subProgramFields) as any) as any)(values, context, options),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: defaultValuesState,
  });

  // Watch form values for conditional rendering
  const modeOfProgram = watch(FORM_FIELD_NAMES.MODE_OF_PROGRAM);
  const isPaymentRequired = watch(FORM_FIELD_NAMES.IS_PAYMENT_REQUIRED);
  const programCodeValue = watch(FORM_FIELD_NAMES.PROGRAM_CODE);
  const startDate = watch(FORM_FIELD_NAMES.START_DATE);
  const endDate = watch(FORM_FIELD_NAMES.END_DATE);
  // Keep date refs in sync so the schema validator always sees current program dates
  useEffect(() => {
    mainStartDateRef.current = startDate || null;
    mainEndDateRef.current = endDate || null;
  }, [startDate, endDate]);

  useCrossFieldDateValidation({ watch: watch as any, trigger: trigger as any });

  // Debounced real-time availability check — fires 600ms after user stops typing
  useEffect(() => {
    const trimmed = programCodeValue?.trim().toUpperCase() || '';

    if (!trimmed || !CODE_FORMAT_REGEX.test(trimmed)) {
      setCodeAvailable(null);
      setIsCheckingCode(false);
      return;
    }

    const existingCode = existingProgramData?.code?.trim().toUpperCase();
    if (isEditMode && trimmed === existingCode) {
      setCodeAvailable(true);
      setIsCheckingCode(false);
      return;
    }

    setIsCheckingCode(true);

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const excludeId = isEditMode ? existingProgramData?.id : undefined;
        const response = await getCall(
          endPoints.programCodeCheck(trimmed, excludeId),
          undefined,
          PORTAL
        );
        if (cancelled) return;
        if (response?.data?.data?.isAvailable === false) {
          setCodeAvailable(false);
        } else {
          setCodeAvailable(true);
        }
      } catch {
        if (!cancelled) setCodeAvailable(null);
      } finally {
        if (!cancelled) setIsCheckingCode(false);
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [programCodeValue, isEditMode, existingProgramData?.code, existingProgramData?.id]);

  const selectedCurrency = watch(FORM_FIELD_NAMES.CURRENCY);
  const programDescription = watch(FORM_FIELD_NAMES.DESCRIPTION);
  const programName = watch(FORM_FIELD_NAMES.PROGRAM_NAME) || "HDB - 25";
  const _startTime = watch(FORM_FIELD_NAMES.START_TIME);
  const _endTime = watch(FORM_FIELD_NAMES.END_TIME);
  const formSubPrograms = watch(FORM_FIELD_NAMES.SUB_PROGRAMS);
  const _hasSeatLimit = watch(FORM_FIELD_NAMES.HAS_SEAT_LIMIT);
  const _seatLimit = watch(FORM_FIELD_NAMES.SEAT_LIMIT);

  // CUSTOM type: watch programStructure, noOfSession, noOfSubPrograms to drive dynamic sub-programs
  const programStructureValue = watch(FORM_FIELD_NAMES.PROGRAM_STRUCTURE as any);
  const noOfSessionValue = watch(FORM_FIELD_NAMES.NO_OF_SESSION as any);
  const noOfSubProgramsValue = watch(FORM_FIELD_NAMES.NO_OF_SUB_PROGRAMS as any);

  // Load dynamic form config here (after watch) so programStructureValue is available immediately
  const { config: formConfig, subProgramFields, hasSubPrograms } = useAddProgramFormConfig(programTypeName, programStructureValue);

  // Clear sub-programs when CUSTOM structure switches to single or is unset
  useEffect(() => {
    if (formConfig?.name?.toUpperCase() !== PROGRAM_TYPE_NAMES.CUSTOM) return;
    if (programStructureValue === PROGRAM_STRUCTURE_VALUES.SINGLE || programStructureValue === '' || !programStructureValue) {
      setValue(FORM_FIELD_NAMES.SUB_PROGRAMS as any, []);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programStructureValue]);

  // CUSTOM: sync session cards when noOfSession changes.
  // Preserves existing sessions (spread current[i]); never regenerates API-loaded sessions.
  useEffect(() => {
    if (formConfig?.name?.toUpperCase() !== PROGRAM_TYPE_NAMES.CUSTOM) return;
    if (programStructureValue !== PROGRAM_STRUCTURE_VALUES.MULTIPLE) return;
    const raw = parseInt(noOfSessionValue) || 0;
    if (raw <= 0) return;
    const count = Math.min(raw, CUSTOM_PROGRAM_LIMITS.MAX_SESSIONS);
    if (raw > CUSTOM_PROGRAM_LIMITS.MAX_SESSIONS) {
      setValue(FORM_FIELD_NAMES.NO_OF_SESSION as any, CUSTOM_PROGRAM_LIMITS.MAX_SESSIONS);
    }
    const current = (getValues(FORM_FIELD_NAMES.SUB_PROGRAMS as any) || []) as any[];
    if (current.length === count) return;
    // Don't regenerate when existing sessions were loaded from the API (they have an id)
    if (current.some((s: any) => s?.id)) return;
    const sessions = Array.from({ length: count }, (_, i) => ({
      ...(current[i] || {}),
      name: current[i]?.name || '',
      code: current[i]?.code || '',
      displayOrder: i + 1,
      description: current[i]?.description || '',
    }));
    setValue(FORM_FIELD_NAMES.SUB_PROGRAMS as any, sessions);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noOfSessionValue]);

  // CUSTOM: sync grouped sub-program cards when noOfSubPrograms changes.
  // Preserves existing sub-programs; never regenerates API-loaded ones.
  useEffect(() => {
    if (formConfig?.name?.toUpperCase() !== PROGRAM_TYPE_NAMES.CUSTOM) return;
    if (programStructureValue !== PROGRAM_STRUCTURE_VALUES.GROUPED) return;
    const raw = parseInt(noOfSubProgramsValue) || 0;
    if (raw <= 0) return;
    const count = Math.min(raw, CUSTOM_PROGRAM_LIMITS.MAX_SUB_PROGRAMS);
    if (raw > CUSTOM_PROGRAM_LIMITS.MAX_SUB_PROGRAMS) {
      setValue(FORM_FIELD_NAMES.NO_OF_SUB_PROGRAMS as any, CUSTOM_PROGRAM_LIMITS.MAX_SUB_PROGRAMS);
    }
    const current = (getValues(FORM_FIELD_NAMES.SUB_PROGRAMS as any) || []) as any[];
    if (current.length === count) return;
    // Don't regenerate when existing sub-programs were loaded from the API (they have an id)
    if (current.some((s: any) => s?.id)) return;
    const subPrograms = Array.from({ length: count }, (_, i) => ({
      ...(current[i] || {}),
      name: current[i]?.name || '',
      code: current[i]?.code || '',
      groupDisplayOrder: i + 1,
      description: current[i]?.description || '',
    }));
    setValue(FORM_FIELD_NAMES.SUB_PROGRAMS as any, subPrograms);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noOfSubProgramsValue]);

  // CUSTOM multiple/grouped: derive main startDate/endDate from earliest/latest sub-program dates
  useEffect(() => {
    if (formConfig?.name?.toUpperCase() !== PROGRAM_TYPE_NAMES.CUSTOM) return;
    if (programStructureValue !== PROGRAM_STRUCTURE_VALUES.MULTIPLE && programStructureValue !== PROGRAM_STRUCTURE_VALUES.GROUPED) return;
    const subs = (formSubPrograms || []) as any[];
    if (subs.length === 0) return;

    let earliest: Date | null = null;
    let latest: Date | null = null;

    subs.forEach((sub) => {
      // datetime fields store date at startsAt, time at startsAtTime
      const start = sub.startsAt ? new Date(sub.startsAt) : null;
      const end = sub.endsAt ? new Date(sub.endsAt) : null;
      if (start && !isNaN(start.getTime())) {
        if (!earliest || start < earliest) earliest = start;
      }
      if (end && !isNaN(end.getTime())) {
        if (!latest || end > latest) latest = end;
      }
    });

    if (earliest) {
      setValue(FORM_FIELD_NAMES.START_DATE, earliest);
      setValue('startTime' as any, earliest);
    }
    if (latest) {
      setValue(FORM_FIELD_NAMES.END_DATE, latest);
      setValue('endTime' as any, latest);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formSubPrograms, programStructureValue]);

  // When switching to online: save current values and force travel/checkin/residence to 'no'
  // When switching back to offline/hybrid: restore previously saved values
  useEffect(() => {
    if (modeOfProgram === MODE_OF_PROGRAM_VALUES.ONLINE) {
      offlineModeValuesRef.current = {
        isTravelInvolved: watch(FORM_FIELD_NAMES.IS_TRAVEL_INVOLVED as any),
        hasCheckinCheckout: watch(FORM_FIELD_NAMES.HAS_CHECKIN_CHECKOUT as any),
        isResidenceRequired: watch(FORM_FIELD_NAMES.IS_RESIDENCE_REQUIRED as any),
      };
      setValue(FORM_FIELD_NAMES.IS_TRAVEL_INVOLVED as any, YES_NO_VALUES.NO);
      setValue(FORM_FIELD_NAMES.HAS_CHECKIN_CHECKOUT as any, YES_NO_VALUES.NO);
      setValue(FORM_FIELD_NAMES.IS_RESIDENCE_REQUIRED as any, YES_NO_VALUES.NO);
    } else if (modeOfProgram === MODE_OF_PROGRAM_VALUES.OFFLINE || modeOfProgram === MODE_OF_PROGRAM_VALUES.HYBRID) {
      const prev = offlineModeValuesRef.current;
      if (prev.isTravelInvolved) setValue(FORM_FIELD_NAMES.IS_TRAVEL_INVOLVED as any, prev.isTravelInvolved);
      if (prev.hasCheckinCheckout) setValue(FORM_FIELD_NAMES.HAS_CHECKIN_CHECKOUT as any, prev.hasCheckinCheckout);
      if (prev.isResidenceRequired) setValue(FORM_FIELD_NAMES.IS_RESIDENCE_REQUIRED as any, prev.isResidenceRequired);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeOfProgram]);

  // CUSTOM only: when residential is selected, auto-enable check-in/check-out.
  // In edit mode we never auto-clear hasCheckinCheckout to NO — the API-loaded value
  // takes precedence (a program may have check-in without requiring residence).
  const isResidenceRequiredValue = watch(FORM_FIELD_NAMES.IS_RESIDENCE_REQUIRED as any);
  useEffect(() => {
    if (formConfig?.name?.toUpperCase() !== PROGRAM_TYPE_NAMES.CUSTOM) return;
    if (modeOfProgram === MODE_OF_PROGRAM_VALUES.ONLINE) return;
    if (isResidenceRequiredValue === YES_NO_VALUES.YES) {
      setValue(FORM_FIELD_NAMES.HAS_CHECKIN_CHECKOUT as any, YES_NO_VALUES.YES);
    } else if (isResidenceRequiredValue === YES_NO_VALUES.NO && !isEditMode) {
      setValue(FORM_FIELD_NAMES.HAS_CHECKIN_CHECKOUT as any, YES_NO_VALUES.NO);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResidenceRequiredValue]);

  // Auto-compute gstPercentage in background from cgst + sgst (or igst)
  const cgstValue = watch('cgst' as any);
  const sgstValue = watch('sgst' as any);
  const igstValue = watch('igst' as any);
  useEffect(() => {
    const cgst = parseFloat(cgstValue) || 0;
    const sgst = parseFloat(sgstValue) || 0;
    const igst = parseFloat(igstValue) || 0;
    const computed = igst > 0 ? igst : cgst + sgst;
    setValue('gstPercentage' as any, computed || '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cgstValue, sgstValue, igstValue]);

  const seekerDetails = getItemInLocalStorage(ADD_PROGRAM_PAGE_TEXT.VALUES.LOCAL_STORAGE_SEEKER_DETAILS);
  const userId = getItemInLocalStorage(ADD_PROGRAM_PAGE_TEXT.VALUES.LOCAL_STORAGE_SEEKER_DETAILS)?.id || null;
  
  // For HDB / TAT type programs (non-CUSTOM): derive the parent start/end dates from the
  // minimum session start and maximum session end across all sub-programs so the main
  // program's date range always reflects reality without requiring manual input.
  // CUSTOM type already handles this via its own useEffect above (using startsAt/endsAt).
  useEffect(() => {
    if (formConfig?.name?.toUpperCase() === PROGRAM_TYPE_NAMES.CUSTOM) return;
    const subs = (formSubPrograms || []) as any[];
    if (subs.length === 0) return;

    let earliest: Date | null = null;
    let latest: Date | null = null;

    subs.forEach((sub) => {
      const start = sub.programStartDate ? new Date(sub.programStartDate) : null;
      const end = sub.programEndDate ? new Date(sub.programEndDate) : null;
      if (start && !isNaN(start.getTime())) {
        if (!earliest || start < earliest) earliest = start;
      }
      if (end && !isNaN(end.getTime())) {
        if (!latest || end > latest) latest = end;
      }
    });

    if (earliest) {
      setValue(FORM_FIELD_NAMES.START_DATE, earliest);
      setValue('startTime' as any, earliest);
    }
    if (latest) {
      setValue(FORM_FIELD_NAMES.END_DATE, latest);
      setValue('endTime' as any, latest);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formSubPrograms]);

  const {
    subPrograms: _subPrograms,
    subProgramRefs: _subProgramRefs,
    handleAddSubProgram: _handleAddSubProgram,
    handleSubProgramChange,
    handleSubProgramVenueChange: _handleSubProgramVenueChange,
    handleDeleteSubProgram: deleteSubProgram,
  } = useSubPrograms({
    programDescription: programDescription || "",
    uploadedBanner,
    modeOfProgram: (modeOfProgram || MODE_OF_PROGRAM_VALUES.OFFLINE) as "online" | "offline" | "hybrid",
    selectedCurrency,
    isPaymentRequired: (isPaymentRequired || YES_NO_VALUES.NO) as "yes" | "no",
  });

  const handleDeleteSubProgram = (subProgramId: string) => {
    setSubProgramToDelete(subProgramId);
    _setDeleteDialogOpen(true);
  };

  const confirmDeleteSubProgram = () => {
    if (subProgramToDelete) {
      deleteSubProgram(subProgramToDelete);
      // Clean up date range state for deleted sub-program
      setSubProgramDateRanges((prev) => {
        const newState = { ...prev };
        delete newState[subProgramToDelete];
        return newState;
      });
      _setDeleteDialogOpen(false);
      setSubProgramToDelete(null);
    }
  };
  
  const handleSave = async (formData: any) => {
    if (codeAvailable === false) {
      _setError(FORM_FIELD_NAMES.PROGRAM_CODE, {
        message: ADD_PROGRAM_PAGE_TEXT.VALIDATION.PROGRAM_CODE_TAKEN,
      });
      return;
    }

    if (!bannerImageUrl && !bannerAnimationUrl) {
      setBannerUploadError(BANNER_UPLOAD_TEXT.ERROR_MESSAGES.BANNER_REQUIRED);
      notify(
        ADD_PROGRAM_PAGE_TEXT.ERRORS.UPLOAD_ERROR_TITLE,
        BANNER_UPLOAD_TEXT.ERROR_MESSAGES.BANNER_REQUIRED,
        WARNING
      );
      return;
    }

    if (isEditMode && !existingProgramData) {
      notify(
        ADD_PROGRAM_PAGE_TEXT.ERRORS.GENERIC_ERROR_TITLE,
        ADD_PROGRAM_PAGE_TEXT.ERRORS.UPDATE_NO_DATA,
        WARNING
      );
      return;
    }
    
    if (isEditMode && !existingProgramData.id) {
      notify(
        ADD_PROGRAM_PAGE_TEXT.ERRORS.GENERIC_ERROR_TITLE,
        ADD_PROGRAM_PAGE_TEXT.ERRORS.UPDATE_NO_ID,
        WARNING
      );
      return;
    }

    // Validate that sessions/sub-programs are present and counts match
    const subProgramsValue = (formData as any).subPrograms || [];
    if (!validateSubProgramCounts(programStructureValue, subProgramsValue, formData, programType, notify, WARNING)) {
      return;
    }

    try {
      dispatch(incrementLoader(ADD_PROGRAM_PAGE_TEXT.VALUES.LOADER_TYPE_LARGE));

      // Shorthand for program type data — used as fallback when form fields are absent
      const programTypeData = programType?.data || {};

      // Parses a numeric field: returns the number when valid, null when blank/NaN.
      // Avoids sending "0" when the user left a tax/fee field empty.
      const parseNumOrNull = (val: any): number | null => {
        if (val === undefined || val === null || val === '') return null;
        const n = parseFloat(String(val));
        return isNaN(n) ? null : n;
      };

      // Returns the first non-empty value from the list (treats 0 as valid).
      const firstDefined = (...vals: any[]) =>
        vals.find(v => v !== undefined && v !== null && v !== '');

      // For CUSTOM form the rendered tax fields are cgst/sgst/igst/tdsPercent/tdsApplicability/gstNumber.
      // For HDB/TAT/MSD the rendered fields are cgstLimit/sgstLimit/igstLimit/tdsLimit/tdsApplicableTo/gstin.
      // We pick the rendered field first so a user edit is never shadowed by the stale alias.
      const isCustomType = programTypeName?.toUpperCase().includes(PROGRAM_TYPE_NAMES.CUSTOM);
      const resolveTax = (customField: any, limitField: any, fallback: any) =>
        isCustomType
          ? firstDefined(customField, limitField, fallback)
          : firstDefined(limitField, customField, fallback);

      // Transform subPrograms from form data
      // Usage in handleSave:
      const registrationStartDateTime = getCombinedLaunchDateTime(
        formData.registrationStartDate,
        formData.registrationStartTime,
      );
      const registrationEndDateTime = getCombinedLaunchDateTime(
        formData.registrationEndDate,
        formData.registrationEndTime,
      );

      // Gates all tax fields — prevents 0-valued type defaults from polluting the payload when payment is not required
      const paymentRequired =
        (formData as any).requiresPayment === YES_NO_VALUES.YES ||
        (formData as any).isPaymentRequired === YES_NO_VALUES.YES ||
        (!(formData as any).requiresPayment && !(formData as any).isPaymentRequired && (programTypeData.requiresPayment === true));

      const programSessions =
        formData?.subPrograms?.map((subProgram: any, index: any) => {
          // CUSTOM grouped: startsAt/endsAt are datetime fields with separate time siblings (startsAtTime/endsAtTime)
          // CUSTOM session / HDB / TAT: combine programStartDate + programStartTime
          const subProgramStartsAt = subProgram.startsAt
            ? getCombinedLaunchDateTime(subProgram.startsAt, subProgram.startsAtTime || subProgram.startsAt)
            : getCombinedLaunchDateTime(subProgram.programStartDate, subProgram.programStartTime);

          const subProgramEndsAt = subProgram.endsAt
            ? getCombinedLaunchDateTime(subProgram.endsAt, subProgram.endsAtTime || subProgram.endsAt)
            : getCombinedLaunchDateTime(subProgram.programEndDate, subProgram.programEndTime);

          // CUSTOM: checkinAt/checkoutAt stored directly; Legacy: checkInStartDate + checkInStartTime
          const subProgramCheckinStartsAt = subProgram.checkinAt
            ? getCombinedLaunchDateTime(subProgram.checkinAt, subProgram.checkinAtTime)
            : getCombinedLaunchDateTime(subProgram.checkInStartDate, subProgram.checkInStartTime);

          const subProgramCheckoutStartsAt = subProgram.checkoutAt
            ? getCombinedLaunchDateTime(subProgram.checkoutAt, subProgram.checkoutAtTime)
            : getCombinedLaunchDateTime(subProgram.checkOutStartDate, subProgram.checkOutStartTime);

          const subProgramCheckinEndsAt = subProgram.checkinEndsAt
            ? getCombinedLaunchDateTime(subProgram.checkinEndsAt, subProgram.checkinEndsAtTime)
            : getCombinedLaunchDateTime(subProgram.checkInEndDate, subProgram.checkInEndTime);

          const subProgramCheckoutEndsAt = subProgram.checkoutEndsAt
            ? getCombinedLaunchDateTime(subProgram.checkoutEndsAt, subProgram.checkoutEndsAtTime)
            : getCombinedLaunchDateTime(subProgram.checkOutEndDate, subProgram.checkOutEndTime);

          // Resolve mode: CUSTOM uses modeOfOperation, legacy uses modeOfProgram
          const subMode = subProgram.modeOfOperation || subProgram.modeOfProgram;

          // Determine if checkin/checkout applies: parent hasCheckinCheckout + sub-program must be offline/hybrid
          const hasCheckinCheckoutBool = subMode === MODE_OF_PROGRAM_VALUES.ONLINE
            ? false
            : (formData as any).hasCheckinCheckout != null
              ? (formData as any).hasCheckinCheckout === YES_NO_VALUES.YES
              : (programTypeData.hasCheckinCheckout ?? false);
          const subProgramHasCheckin = hasCheckinCheckoutBool
            && (subMode === MODE_OF_PROGRAM_VALUES.OFFLINE || subMode === MODE_OF_PROGRAM_VALUES.HYBRID);

          // Resolve seat limit: CUSTOM_session uses limitedSeats, CUSTOM_grouped/legacy uses hasSeatLimit
          const hasSeatLimit = subProgram.limitedSeats === YES_NO_VALUES.YES
            || subProgram.hasSeatLimit === YES_NO_VALUES.YES;
          const subTotalSeats = hasSeatLimit
            ? parseInt(subProgram.totalSeats || subProgram.seatLimit || 0)
            : 0;

          return {
            ...(subProgram.id && { id: subProgram.id }),
            programId: isEditMode ? existingProgramData.id : programType?.data?.id,
            workflowId: workflowId || 13,
            name: subProgram.name || subProgram.title,
            code: subProgram.code || `${formData.programCode}_S${index + 1}`,
            ...(programType?.data?.isGroupedProgram || (formData as any).programStructure === PROGRAM_STRUCTURE_VALUES.GROUPED
              ? { groupDisplayOrder: index + 2 }
              : { displayOrder: index + 1 }),

            venue: (() => {
              // Use session-level venue when set; fall back to parent program venue
              const parentVenue = formData?.venueAddress?.[0] || (formData as any).venue || programTypeData.venue || "";
              const sessionVenue = Array.isArray(subProgram.venueAddress)
                ? subProgram.venueAddress.join(", ")
                : (subProgram.venue || subProgram.venueAddress || "");
              return sessionVenue || parentVenue;
            })(),
            modeOfOperation: subMode,
            onlineType: subMode === MODE_OF_PROGRAM_VALUES.ONLINE
              ? (subProgram.onlineType || ONLINE_TYPE_VALUES.MEETING).toLowerCase()
              : undefined,
            ...((() => {
              if (subMode !== MODE_OF_PROGRAM_VALUES.ONLINE) return {};
              const onlineTypeValue =((subProgram.onlineType || '') as string).toLowerCase();
              if (onlineTypeValue ===ONLINE_TYPE_VALUES.MEETING) return {
                meetingDetails: {
                  meetingLink: subProgram.meetingLink || null,
                  meetingId: subProgram.meetingId || null,
                  meetingPassword: subProgram.meetingPassword || null,
                },
              };
              if (onlineTypeValue ===ONLINE_TYPE_VALUES.WEBINAR) return {
                webinarDetails: {
                  webinarLink: subProgram.webinarLink || null,
                  webinarId: subProgram.webinarId || null,
                  webinarPassword: subProgram.webinarPassword || null,
                  panelistLink: subProgram.panelistLink || null,
                  registrationLink: subProgram.registrationLink || null,
                },
              };
              if (onlineTypeValue ===ONLINE_TYPE_VALUES.LIVE_STREAM) return {
                streamDetails: {
                  streamUrl: subProgram.streamUrl || null,
                  backupStreamUrl: subProgram.backupStreamUrl || null,
                  chatUrl: subProgram.chatUrl || null,
                },
              };
              return {};
            })()),
            totalSeats: subTotalSeats,
            bannerImageUrl: subProgram.bannerImageUrl || "",
            waitlistTriggerCount: subProgram.waitlistApplicable === YES_NO_VALUES.YES || subProgram.hasWaitlist === YES_NO_VALUES.YES
              ? parseInt(subProgram.waitlistTriggerCount || 0)
              : 0,
            availableSeats: subTotalSeats,
            status: PROGRAM_STATUS.ACTIVE,
            isActive: true,
            startsAt: subProgramStartsAt,
            endsAt: subProgramEndsAt,
            blessEndsAt: subProgram.blessEndsAt
              ? getCombinedLaunchDateTime(subProgram.blessEndsAt, subProgram.blessEndsAtTime)
              : subProgramEndsAt,
            canRegisterTill: subProgram.canRegisterTill
              ? getCombinedLaunchDateTime(subProgram.canRegisterTill, subProgram.canRegisterTillTime)
              : registrationEndDateTime,
            duration: null,
            requiresPayment: (formData as any).requiresPayment != null
              ? (formData as any).requiresPayment === YES_NO_VALUES.YES
              : (programTypeData.requiresPayment ?? false),
            requiresAttendanceAllSessions: programTypeData.requiresAttendanceAllSessions ?? false,
            allowsMinors: programTypeData.allowsMinors ?? false,
            allowsProxyRegistration: (formData as any).allowsProxyRegistration != null
              ? (formData as any).allowsProxyRegistration === YES_NO_VALUES.YES
              : (programTypeData.allowsProxyRegistration ?? false),
            requiresApproval: formData.approvalRequired != null
              ? formData.approvalRequired === YES_NO_VALUES.YES
              : (programTypeData.requiresApproval ?? null),
            allowSaveAsDraft: (formData as any).allowSaveAsDraft != null
              ? (formData as any).allowSaveAsDraft === YES_NO_VALUES.YES
              : (programTypeData.allowSaveAsDraft ?? null),
            registrationLevel: ADD_PROGRAM_PAGE_TEXT.VALUES.REGISTRATION_LEVEL_PROGRAM,
            limitedSeats: hasSeatLimit,
            maxSessionDurationDays: getMaxSessionDurationDays([subProgram]),
            hasMultipleSessions: false,
            frequency: ADD_PROGRAM_PAGE_TEXT.VALUES.FREQUENCY_YEARLY,
            checkinAt: subProgramHasCheckin ? subProgramCheckinStartsAt : undefined,
            checkoutAt: subProgramHasCheckin ? subProgramCheckoutStartsAt : undefined,
            checkinEndsAt: subProgramHasCheckin ? subProgramCheckinEndsAt : undefined,
            checkoutEndsAt: subProgramHasCheckin ? subProgramCheckoutEndsAt : undefined,
            updatedBy: userId,
            ...(!isEditMode && { createdBy: userId }),
            gstNumber: resolveTax((formData as any).gstNumber, (formData as any).gstin, programTypeData.gstNumber),
            invoiceSenderCin: formData?.cin || programTypeData.invoiceSenderCin,
            invoiceSenderName: formData?.nameInInvoice || programTypeData.invoiceSenderName || "",
            invoiceSenderPan: formData?.pan || programTypeData.invoiceSenderPan,
            isTravelInvolved: subMode === MODE_OF_PROGRAM_VALUES.ONLINE
              ? false
              : (formData as any).isTravelInvolved != null
                ? (formData as any).isTravelInvolved === YES_NO_VALUES.YES
                : (formData as any).isTravelRequired != null
                  ? (formData as any).isTravelRequired === YES_NO_VALUES.YES
                  : (programTypeData.involvesTravel ?? false),
            tdsApplicability: paymentRequired ? resolveTax((formData as any).tdsApplicability, (formData as any).tdsApplicableTo, programTypeData.tdsApplicability) : null,
            tdsPercent: paymentRequired ? parseNumOrNull(resolveTax((formData as any).tdsPercent, (formData as any).tdsLimit, programTypeData.tdsPercent)) : null,
            sgst: paymentRequired ? parseNumOrNull(resolveTax((formData as any).sgst, (formData as any).sgstLimit, programTypeData.sgst)) : null,
            cgst: paymentRequired ? parseNumOrNull(resolveTax((formData as any).cgst, (formData as any).cgstLimit, programTypeData.cgst)) : null,
            igst: paymentRequired ? parseNumOrNull(resolveTax((formData as any).igst, (formData as any).igstLimit, programTypeData.igst)) : null,
            gstPercentage: paymentRequired ? ((parseNumOrNull(resolveTax((formData as any).cgst, (formData as any).cgstLimit, programTypeData.cgst)) ?? 0) + (parseNumOrNull(resolveTax((formData as any).sgst, (formData as any).sgstLimit, programTypeData.sgst)) ?? 0) || null) : null,
            helplineNumber: (formData as any).helplineNumber || formData.helpLineNumber || programTypeData.helplineNumber,
            emailSenderName: formData.emailSenderName || programTypeData.emailSenderName,
            emailSenderAddress: formData.emailSenderAddress || programTypeData.emailSenderAddress,
            emailBccName: formData.emailBccName || programTypeData.emailBccName,
            emailBccAddress: formData.emailBccAddress || programTypeData.emailBccAddress,
            venueNameInEmails: subProgram.venueNameInEmail || formData.venueNameInEmail || programTypeData.venueNameInEmails,
            currency: formData.currency,
            description: subProgram.description || formData.description || "",
            hasCheckinCheckout: subProgramHasCheckin,
            invoiceSenderAddress: (formData as any).invoiceSenderAddress || formData?.address || programTypeData.invoiceSenderAddress || "",
            waitlistApplicable: (subProgram as any)?.waitlistApplicable === YES_NO_VALUES.YES || (subProgram as any)?.hasWaitlist === YES_NO_VALUES.YES || null,
            basePrice: (() => { const v = parseFloat(subProgram?.sessionPrice || subProgram?.programFee || formData?.programFee); return isNaN(v) ? null : v; })(),
            programFee: (() => { const v = parseFloat(subProgram?.sessionPrice || subProgram?.programFee || formData?.programFee); return isNaN(v) ? null : v; })(),
            sessionType: subProgram?.sessionType || SESSION_TYPES.HDB,
            registrationStartsAt: registrationStartDateTime,
            registrationEndsAt: registrationEndDateTime,
            meta: {},
            venueAddress: {
              addr1: formData?.address || "",
              addr2: "",
              landmark: "",
              city: "",
              state: "",
              country: "",
              pincode: "",
              lat: 0,
              long: 0,
              type: ADD_PROGRAM_PAGE_TEXT.VALUES.ADDRESS_TYPE_BILLING
            },
            bannerAnimationUrl: "",
            logoUrl: "",
            subProgramType: (formData as any).subProgramType || programTypeData.subProgramType || ADD_PROGRAM_PAGE_TEXT.VALUES.SUB_PROGRAM_TYPE_HDB,
            seekerCanShareExperience: (formData as any).seekerCanShareExperience != null
              ? (formData as any).seekerCanShareExperience === YES_NO_VALUES.YES
              : (programTypeData.seekerCanShareExperience ?? null),
            totalBedCount: formData.isResendential === YES_NO_VALUES.YES && formData.totalBedCount ? parseInt(formData.totalBedCount) : 0,
            isResidenceRequired: subMode === MODE_OF_PROGRAM_VALUES.ONLINE
              ? false
              : formData.isResidenceRequired != null
                ? formData.isResidenceRequired === YES_NO_VALUES.YES
                : formData.isResendential != null
                  ? formData.isResendential === YES_NO_VALUES.YES
                  : (programTypeData.requiresResidence ?? null),
            
          };
        }) || [];

      // Pre-compute hasCheckinCheckout boolean so the four date fields can reference it
      const mainHasCheckinCheckout = formData.modeOfProgram === MODE_OF_PROGRAM_VALUES.ONLINE
        ? false
        : (formData as any).hasCheckinCheckout != null
          ? (formData as any).hasCheckinCheckout === YES_NO_VALUES.YES
          : (programTypeData.hasCheckinCheckout ?? false);

      const payload = {
        ...(isEditMode && { id: existingProgramData.id }), // Include ID if editing
        typeId: isEditMode
          ? existingProgramData.typeId
          : programType?.data?.id || 1,
        workflowId: workflowId || 13,
        ...(templateId && { programTemplateId: parseInt(templateId, 10) }),
        name: formData.programName,
        code: formData.programCode,
        description: formData.description,
        modeOfOperation: formData.modeOfProgram,
        onlineType: formData.modeOfProgram === MODE_OF_PROGRAM_VALUES.ONLINE
          ? ((formData as any).onlineType || ONLINE_TYPE_VALUES.MEETING).toLowerCase()
          : undefined,
        ...((() => {
          if (formData.modeOfProgram !== MODE_OF_PROGRAM_VALUES.ONLINE) return {};
          const onlineTypeValue =((formData as any).onlineType || '').toLowerCase();
          if (onlineTypeValue ===ONLINE_TYPE_VALUES.MEETING) return {
            meetingDetails: {
              meetingLink: (formData as any).meetingLink || null,
              meetingId: (formData as any).meetingId || null,
              meetingPassword: (formData as any).meetingPassword || null,
            },
          };
          if (onlineTypeValue ===ONLINE_TYPE_VALUES.WEBINAR) return {
            webinarDetails: {
              webinarLink: (formData as any).webinarLink || null,
              webinarId: (formData as any).webinarId || null,
              webinarPassword: (formData as any).webinarPassword || null,
              panelistLink: (formData as any).panelistLink || null,
              registrationLink: (formData as any).registrationLink || null,
            },
          };
          if (onlineTypeValue ===ONLINE_TYPE_VALUES.LIVE_STREAM) return {
            streamDetails: {
              streamUrl: (formData as any).streamUrl || null,
              backupStreamUrl: (formData as any).backupStreamUrl || null,
              chatUrl: (formData as any).chatUrl || null,
            },
          };
          return {};
        })()),
        maxSessionDurationDays: getMaxSessionDurationDays(formData?.subPrograms || []),
        hasMultipleSessions: programStructureValue === PROGRAM_STRUCTURE_VALUES.MULTIPLE || programType?.data?.hasMultipleSessions || false,
        hasGoodies: (formData as any).hasGoodies != null
          ? (formData as any).hasGoodies === YES_NO_VALUES.YES
          : (programTypeData?.hasGoodies ?? false),
        frequency: ADD_PROGRAM_PAGE_TEXT.VALUES.FREQUENCY_YEARLY,
        defaultStartTime: getEarliestStartTime(formData?.subPrograms || []),
        defaultEndTime: getLatestEndTime(formData?.subPrograms || []),
        startsAt: (() => {
          // Prefer explicit parent-level startTime, but when sessions exist derive from
          // the earliest session start so the main program always covers its sessions.
          const subs: any[] = formData?.subPrograms || [];
          if (subs.length > 0) {
            let earliest: Date | null = null;
            let earliestSub: any = null;
            subs.forEach((s) => {
              const d = s.programStartDate || s.startsAt;
              if (!d) return;
              const dt = new Date(d);
              if (!isNaN(dt.getTime()) && (!earliest || dt < earliest)) { earliest = dt; earliestSub = s; }
            });
            if (earliest && earliestSub) {
              const t = earliestSub.programStartTime || earliestSub.startsAtTime || earliestSub.startTime;
              return getCombinedLaunchDateTime(earliest, t || earliest);
            }
          }
          return (formData as any).startTime
            ? getCombinedLaunchDateTime(formData.startDate, (formData as any).startTime)
            : new Date(formData.startDate).toISOString();
        })(),
        endsAt: (() => {
          const subs: any[] = formData?.subPrograms || [];
          if (subs.length > 0) {
            let latest: Date | null = null;
            let latestSub: any = null;
            subs.forEach((s) => {
              const d = s.programEndDate || s.endsAt;
              if (!d) return;
              const dt = new Date(d);
              if (!isNaN(dt.getTime()) && (!latest || dt > latest)) { latest = dt; latestSub = s; }
            });
            if (latest && latestSub) {
              const t = latestSub.programEndTime || latestSub.endsAtTime || latestSub.endTime;
              return getCombinedLaunchDateTime(latest, t || latest);
            }
          }
          return (formData as any).endTime
            ? getCombinedLaunchDateTime(formData.endDate, (formData as any).endTime)
            : new Date(formData.endDate).toISOString();
        })(),
        blessEndsAt: (() => {
          const subs: any[] = formData?.subPrograms || [];
          if (subs.length > 0) {
            let latest: Date | null = null;
            let latestSub: any = null;
            subs.forEach((s) => {
              const d = s.programEndDate || s.endsAt;
              if (!d) return;
              const dt = new Date(d);
              if (!isNaN(dt.getTime()) && (!latest || dt > latest)) { latest = dt; latestSub = s; }
            });
            if (latest && latestSub) {
              const t = latestSub.programEndTime || latestSub.endsAtTime || latestSub.endTime;
              return getCombinedLaunchDateTime(latest, t || latest);
            }
          }
          return (formData as any).endTime
            ? getCombinedLaunchDateTime(formData.endDate, (formData as any).endTime)
            : new Date(formData.endDate).toISOString();
        })(),
        canRegisterTill: registrationEndDateTime,
        duration: null,
        bannerImageUrl: bannerImageUrl || null,
        bannerAnimationUrl: bannerAnimationUrl || null,
        requiresResidence: formData.modeOfProgram === MODE_OF_PROGRAM_VALUES.ONLINE
          ? false
          : formData.isResidenceRequired != null
            ? formData.isResidenceRequired === YES_NO_VALUES.YES
            : formData.isResendential != null
              ? formData.isResendential === YES_NO_VALUES.YES
              : (programTypeData.requiresResidence ?? false),
        requiresPayment: (formData as any).requiresPayment != null
          ? (formData as any).requiresPayment === YES_NO_VALUES.YES
          : (programTypeData.requiresPayment ?? false),
        requiresAttendanceAllSessions: programTypeData.requiresAttendanceAllSessions ?? false,
        allowsMinors: programTypeData.allowsMinors ?? false,
        allowsProxyRegistration: (formData as any).allowsProxyRegistration != null
          ? (formData as any).allowsProxyRegistration === YES_NO_VALUES.YES
          : (programTypeData.allowsProxyRegistration ?? false),
        requiresApproval: formData.approvalRequired != null ? formData.approvalRequired === YES_NO_VALUES.YES : (programTypeData.requiresApproval ?? false),
        allowSaveAsDraft: (formData as any).allowSaveAsDraft != null
          ? (formData as any).allowSaveAsDraft === YES_NO_VALUES.YES
          : (programTypeData.allowSaveAsDraft ?? null),
        registrationLevel: ADD_PROGRAM_PAGE_TEXT.VALUES.REGISTRATION_LEVEL_PROGRAM,
        limitedSeats: formData.hasSeatLimit === YES_NO_VALUES.YES,
        isGroupedProgram: programType?.data?.isGroupedProgram || (formData as any).programStructure === PROGRAM_STRUCTURE_VALUES.GROUPED,
        totalSeats:
          formData.hasSeatLimit === YES_NO_VALUES.YES ? parseInt((formData as any).totalSeats || formData.seatLimit || 0) : 0,
        waitlistTriggerCount:
          (formData.hasWaitlist === YES_NO_VALUES.YES || (formData as any).waitlistApplicable === YES_NO_VALUES.YES)
            ? parseInt(formData.waitlistTriggerCount)
            : 0,
        availableSeats:
          formData.hasSeatLimit === YES_NO_VALUES.YES ? parseInt((formData as any).totalSeats || formData.seatLimit || 0) : 0,
        waitlistApplicable: (formData as any).waitlistApplicable != null
          ? (formData as any).waitlistApplicable === YES_NO_VALUES.YES
          : (formData.hasWaitlist != null ? formData.hasWaitlist === YES_NO_VALUES.YES : (programTypeData.waitlistApplicable ?? false)),
        maxCapacity: formData.hasSeatLimit === YES_NO_VALUES.YES ? parseInt((formData as any).totalSeats || formData.seatLimit || 0) : 0,
        meta: {
          ...((formData.hdbFee || formData.msdFee) ? {
            price: [
              { HDB: parseFloat(formData.hdbFee) || null },
              { MSD: parseFloat(formData.msdFee) || null },
            ],
          } : {}),
          // Preserve fields not stored as top-level API fields
          ...((formData as any).programStructure ? {
            programStructure: (formData as any).programStructure,
            noOfSubPrograms: (formData as any).noOfSubPrograms || undefined,
          } : {}),
          sameVenueForAll: (formData as any).sameVenueForAll || undefined,
          sameOnlineDetailsForAll: (formData as any).sameOnlineDetailsForAll || undefined,
          hasGoodies: (formData as any).hasGoodies === YES_NO_VALUES.YES ? YES_NO_VALUES.YES : undefined,
        },
        registrationStartsAt: registrationStartDateTime,
        registrationEndsAt: registrationEndDateTime,
        basePrice: (() => { const v = parseFloat(formData.programFee); return isNaN(v) ? null : v; })(),
        programFee: (() => { const v = parseFloat(formData.programFee); return isNaN(v) ? null : v; })(),
        cgst: paymentRequired ? parseNumOrNull(resolveTax((formData as any).cgst, (formData as any).cgstLimit, programTypeData.cgst)) : null,
        sgst: paymentRequired ? parseNumOrNull(resolveTax((formData as any).sgst, (formData as any).sgstLimit, programTypeData.sgst)) : null,
        igst: paymentRequired ? parseNumOrNull(resolveTax((formData as any).igst, (formData as any).igstLimit, programTypeData.igst)) : null,
        gstPercentage: paymentRequired ? ((parseNumOrNull(resolveTax((formData as any).cgst, (formData as any).cgstLimit, programTypeData.cgst)) ?? 0) + (parseNumOrNull(resolveTax((formData as any).sgst, (formData as any).sgstLimit, programTypeData.sgst)) ?? 0) || null) : null,
        tdsPercent: paymentRequired ? parseNumOrNull(resolveTax((formData as any).tdsPercent, (formData as any).tdsLimit, programTypeData.tdsPercent)) : null,
        gstNumber: paymentRequired ? resolveTax((formData as any).gstNumber, (formData as any).gstin, programTypeData.gstNumber) : null,
        tdsApplicability: paymentRequired ? resolveTax((formData as any).tdsApplicability, (formData as any).tdsApplicableTo, programTypeData.tdsApplicability) : null,
        allocateSeatIfOfflinePending: true,
        invoiceSenderName: (formData as any).invoiceSenderName || formData?.nameInInvoice || programTypeData.invoiceSenderName || "",
        invoiceSenderPan: (formData as any).invoiceSenderPan || formData?.pan || programTypeData.invoiceSenderPan,
        invoiceSenderCin: (formData as any).invoiceSenderCin || formData?.cin || programTypeData.invoiceSenderCin,
        venueAddress: {
          addr1: (formData as any).venue ,
          addr2: "",
          landmark: "",
          city: "",
          state: "",
          country: "",
          pincode: "",
          lat: 0,
          long: 0,
          type: ADD_PROGRAM_PAGE_TEXT.VALUES.ADDRESS_TYPE_BILLING
        },
        invoiceSenderAddress: (formData as any).invoiceSenderAddress || formData?.address || programTypeData.invoiceSenderAddress || "",
        helplineNumber: (formData as any).helplineNumber || formData.helpLineNumber || programTypeData.helplineNumber,
        emailSenderName: formData.emailSenderName || programTypeData.emailSenderName,
        emailSenderAddress: formData.emailSenderAddress || programTypeData.emailSenderAddress,
        emailBccName: formData.emailBccName || programTypeData.emailBccName,
        emailBccAddress: formData.emailBccAddress || programTypeData.emailBccAddress,
        venueNameInEmails: formData.venueNameInEmail || programTypeData.venueNameInEmails,
        seekerCanShareExperience: (formData as any).seekerCanShareExperience != null
          ? (formData as any).seekerCanShareExperience === YES_NO_VALUES.YES
          : (programTypeData.seekerCanShareExperience ?? null),
        totalBedCount: formData.modeOfProgram !== MODE_OF_PROGRAM_VALUES.ONLINE
          && (formData.isResidenceRequired === YES_NO_VALUES.YES || formData.isResendential === YES_NO_VALUES.YES)
          && formData.totalBedCount
            ? parseInt(formData.totalBedCount) : 0,
        currency: formData.currency,
        status: isEditMode ? existingProgramData.status : PROGRAM_STATUS.DRAFT,
        isActive: true,
        program: formData.programName,
        noOfSession: (formData as any).noOfSession || programTypeData.noOfSession || 0,
        venue: (formData as any).venue || formData?.venueAddress?.[0] || programTypeData.venue,
        isTravelInvolved: formData.modeOfProgram === MODE_OF_PROGRAM_VALUES.ONLINE
          ? false
          : formData.isTravelInvolved != null
            ? formData.isTravelInvolved === YES_NO_VALUES.YES
            : formData.isTravelRequired != null
              ? formData.isTravelRequired === YES_NO_VALUES.YES
              : (programTypeData.involvesTravel ?? false),
        hasCheckinCheckout: mainHasCheckinCheckout,
        checkinAt: mainHasCheckinCheckout
          ? ((formData as any).checkinAt
              ? getCombinedLaunchDateTime((formData as any).checkinAt, (formData as any).checkinAtTime)
              : (() => {
                  // Use the earliest check-in start across all sessions
                  const subs: any[] = formData?.subPrograms || [];
                  let earliest: Date | null = null;
                  let earliestSub: any = null;
                  subs.forEach((s) => {
                    const d = s.checkinAt || s.checkInStartDate;
                    if (!d) return;
                    const dt = new Date(d);
                    if (!isNaN(dt.getTime()) && (!earliest || dt < earliest)) { earliest = dt; earliestSub = s; }
                  });
                  if (earliest && earliestSub) {
                    const t = earliestSub.checkinAtTime || earliestSub.checkInStartTime;
                    return getCombinedLaunchDateTime(earliest, t || earliest);
                  }
                  return getCombinedLaunchDateTime(formData.startDate, (formData as any).startTime || formData.startDate);
                })())
          : null,
        checkoutAt: mainHasCheckinCheckout
          ? ((formData as any).checkoutAt
              ? getCombinedLaunchDateTime((formData as any).checkoutAt, (formData as any).checkoutAtTime)
              : (() => {
                  // Use the earliest checkout start across all sessions
                  const subs: any[] = formData?.subPrograms || [];
                  let earliest: Date | null = null;
                  let earliestSub: any = null;
                  subs.forEach((s) => {
                    const d = s.checkoutAt || s.checkOutStartDate;
                    if (!d) return;
                    const dt = new Date(d);
                    if (!isNaN(dt.getTime()) && (!earliest || dt < earliest)) { earliest = dt; earliestSub = s; }
                  });
                  if (earliest && earliestSub) {
                    const t = earliestSub.checkoutAtTime || earliestSub.checkOutStartTime;
                    return getCombinedLaunchDateTime(earliest, t || earliest);
                  }
                  return getCombinedLaunchDateTime(formData.endDate, (formData as any).endTime || formData.endDate);
                })())
          : null,
        subProgramType: (formData as any).subProgramType || programTypeData.subProgramType || ADD_PROGRAM_PAGE_TEXT.VALUES.SUB_PROGRAM_TYPE_HDB,
        checkinEndsAt: mainHasCheckinCheckout
          ? ((formData as any).checkinEndsAt
              ? getCombinedLaunchDateTime((formData as any).checkinEndsAt, (formData as any).checkinEndsAtTime)
              : (() => {
                  // Use the latest check-in end across all sessions
                  const subs: any[] = formData?.subPrograms || [];
                  let latest: Date | null = null;
                  let latestSub: any = null;
                  subs.forEach((s) => {
                    const d = s.checkinEndsAt || s.checkInEndDate;
                    if (!d) return;
                    const dt = new Date(d);
                    if (!isNaN(dt.getTime()) && (!latest || dt > latest)) { latest = dt; latestSub = s; }
                  });
                  if (latest && latestSub) {
                    const t = latestSub.checkinEndsAtTime || latestSub.checkInEndTime;
                    return getCombinedLaunchDateTime(latest, t || latest);
                  }
                  return getCombinedLaunchDateTime(formData.startDate, (formData as any).startTime || formData.startDate);
                })())
          : null,
        checkoutEndsAt: mainHasCheckinCheckout
          ? ((formData as any).checkoutEndsAt
              ? getCombinedLaunchDateTime((formData as any).checkoutEndsAt, (formData as any).checkoutEndsAtTime)
              : (() => {
                  // Use the latest checkout end across all sessions
                  const subs: any[] = formData?.subPrograms || [];
                  let latest: Date | null = null;
                  let latestSub: any = null;
                  subs.forEach((s) => {
                    const d = s.checkoutEndsAt || s.checkOutEndDate;
                    if (!d) return;
                    const dt = new Date(d);
                    if (!isNaN(dt.getTime()) && (!latest || dt > latest)) { latest = dt; latestSub = s; }
                  });
                  if (latest && latestSub) {
                    const t = latestSub.checkoutEndsAtTime || latestSub.checkOutEndTime;
                    return getCombinedLaunchDateTime(latest, t || latest);
                  }
                  return getCombinedLaunchDateTime(formData.endDate, (formData as any).endTime || formData.endDate);
                })())
          : null,
        logoUrl: formData?.logoUrl || programTypeData?.logoUrl || "",
        ...(programType?.data?.isGroupedProgram || (formData as any).programStructure === PROGRAM_STRUCTURE_VALUES.GROUPED
          ? { groupedPrograms: programSessions }
          : { programSessions: programSessions }),
        elderMinAge: parseNumOrNull((formData as any).elderMinAge) ?? parseNumOrNull(programTypeData.elderMinAge) ?? null,
        childMaxAge: parseNumOrNull((formData as any).childMaxAge) ?? parseNumOrNull(programTypeData.childMaxAge) ?? null,
        childMinAge: parseNumOrNull((formData as any).elderMinAge) ?? parseNumOrNull(programTypeData.elderMinAge) ?? null,
        elderMaxAge: parseNumOrNull((formData as any).childMaxAge) ?? parseNumOrNull(programTypeData.childMaxAge) ?? null,
        updatedBy: userId,
        createdBy: userId,
      };
      let response;

      if (isEditMode) {
        // Make PUT call for editing existing program
        response = await putCall(
          `${endPoints.program}/${existingProgramData.id}`,
          payload,
          PORTAL
        );
      } else {
        // Make POST call for creating new program
        response = await postCall(`${endPoints.program}`, payload, PORTAL);
      }

      if (response.status === 201 || response.status === 200) {
        dispatch(decrementLoader(ADD_PROGRAM_PAGE_TEXT.VALUES.LOADER_TYPE_LARGE));
        handleQuestionList(response?.data);
      } else {
        throw new Error(
          `Failed to ${isEditMode ? ADD_PROGRAM_PAGE_TEXT.UI.ACTION_UPDATE : ADD_PROGRAM_PAGE_TEXT.UI.ACTION_CREATE} program`,
        );
      }
    } catch (error) {
      dispatch(decrementLoader(ADD_PROGRAM_PAGE_TEXT.VALUES.LOADER_TYPE_LARGE));
      console.error("Error in program creation/update:", error);
      notify(
        ADD_PROGRAM_PAGE_TEXT.ERRORS.GENERIC_ERROR_TITLE,
        isEditMode ? ADD_PROGRAM_PAGE_TEXT.ERRORS.PROGRAM_UPDATE_FAILED : ADD_PROGRAM_PAGE_TEXT.ERRORS.PROGRAM_CREATE_FAILED,
        WARNING
      );
    }
  };

  // Type for program creation/update API response
  type ProgramApiResponse = {
    data?: {
      id?: number;
      primaryProgram?: {
        id?: number;
      };
    };
  };

  const handleQuestionList = async (res: ProgramApiResponse) => {
    const response = await getCall(
      `${endPoints.question}?filters=%7B%22createdBy%22%3A%22-2%22%7D&limit=100`,
      undefined,
      PORTAL
    );
    if (response?.data?.statusCode === 200) {
      const questionsData = response.data.data;

      // Transform the data to match PreviewForm's expected structure
      const transformedQuestions = questionsData?.data?.map(
        (question: any, index: any) => ({
          id: index + 1,
          question: {
            id: question.id,
            label: question.label,
            type: question.type,
            config: question.config || {
              isRequired: false,
              minCharacter: null,
              maxCharacters: null,
              validationPattern: null,
              endPoint: null,
            },
            formSection: {
              id: question.formSection?.id || 1, // Default section ID, adjust as needed
              name: question.formSection?.name || ADD_PROGRAM_PAGE_TEXT.UI.DEFAULT_SECTION_NAME, // Default section name
              description:
                question.formSection?.description ||
                ADD_PROGRAM_PAGE_TEXT.UI.DEFAULT_SECTION_SUBTITLE,
            },
            questionOptionMaps: question.questionOptionMaps
              ? question.questionOptionMaps.map((optionMap: any) => ({
                  id: optionMap.id,
                  option: {
                    id: optionMap.option.id,
                    name: optionMap.option.name,
                    type: optionMap.option.type,
                  },
                }))
              : [],
          },
          displayOrder: index + 1,
        }),
      );

      // Navigate with the transformed data
      const programIdValue = res?.data?.id
        ? res?.data?.id
        : res?.data?.primaryProgram?.id;
      const url = `/admin/program-edit?programId=${programIdValue}${templateId ? `&templateId=${templateId}` : ''}`;
      navigate(url, {
        state: {
          programQuestionMaps: transformedQuestions,
          programName: programName,
          bannerImageUrl: bannerImageUrl || null,
          bannerAnimationUrl: bannerAnimationUrl || null,
          bannerImage:
            bannerImageUrl || bannerAnimationUrl || getProgramImageForBanner(programName),
          programId: programIdValue,
          templateId: templateId,
          fromFormBuilder: false,
        },
      });

      return transformedQuestions;
    }
    throw new Error(ADD_PROGRAM_PAGE_TEXT.ERRORS.FETCH_QUESTIONS_FAILED);
  };

  const handleCancel = () => {
    navigate("/admin/choose-program");
  };

  const isAnimationType = (mimeType: string) => ANIMATION_MIME_TYPES.includes(mimeType);

  const handleBannerUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear previous errors
    setBannerUploadError(null);
    setBannerUploading(true);

    // Validate file type
    if (!BANNER_UPLOAD_TEXT.ALLOWED_MIME_TYPES.includes(file.type)) {
      setBannerUploadError(BANNER_UPLOAD_TEXT.ERROR_MESSAGES.INVALID_FORMAT);
      notify(
        ADD_PROGRAM_PAGE_TEXT.ERRORS.UPLOAD_ERROR_TITLE,
        BANNER_UPLOAD_TEXT.ERROR_MESSAGES.INVALID_FORMAT,
        WARNING
      );
      event.target.value = '';
      setBannerUploading(false);
      return;
    }

    // Validate file size (convert MB to bytes)
    const maxSizeBytes = BANNER_UPLOAD_TEXT.MAX_SIZE_MB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setBannerUploadError(BANNER_UPLOAD_TEXT.ERROR_MESSAGES.FILE_TOO_LARGE);
      notify(
        ADD_PROGRAM_PAGE_TEXT.ERRORS.UPLOAD_ERROR_TITLE,
        BANNER_UPLOAD_TEXT.ERROR_MESSAGES.FILE_TOO_LARGE,
        WARNING
      );
      event.target.value = '';
      setBannerUploading(false);
      return;
    }


    // Validate image dimensions (min/max) if enabled
    const checkImageDimensions = (file: File, shouldCheck: boolean): Promise<void> => {
      if (!shouldCheck) return Promise.resolve();

      return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new window.Image();

        const cleanup = () => URL.revokeObjectURL(url);

        img.onload = () => {
          cleanup();
          const { width, height } = img;
          const { MIN_WIDTH, MAX_WIDTH, MIN_HEIGHT, MAX_HEIGHT } = BANNER_UPLOAD_TEXT;

          const isValid =
            width >= MIN_WIDTH && width <= MAX_WIDTH &&
            height >= MIN_HEIGHT && height <= MAX_HEIGHT;

          if (isValid) {
            resolve();
          } else {
            reject(
              `Image dimensions must be between ${MIN_WIDTH}-${MAX_WIDTH}px wide and ` +
              `${MIN_HEIGHT}-${MAX_HEIGHT}px high. Uploaded: ${width}x${height}px.`
            );
          }
        };

        img.onerror = () => {
          cleanup();
          reject(BANNER_UPLOAD_TEXT.ERROR_MESSAGES.INVALID_FORMAT);
        };

        img.src = url;
      });
    };

    // Only check dimensions for images (not animations)
    const shouldCheckDimensions = !isAnimationType(file.type) && (typeof BANNER_UPLOAD_TEXT.SHOULD_CHECK_DIMENSIONS !== 'undefined' ? BANNER_UPLOAD_TEXT.SHOULD_CHECK_DIMENSIONS : true);

    try {
      await checkImageDimensions(file, shouldCheckDimensions);
    } catch (dimensionError) {
      setBannerUploadError(dimensionError as string);
      notify(
        ADD_PROGRAM_PAGE_TEXT.ERRORS.UPLOAD_ERROR_TITLE,
        dimensionError as string,
        WARNING
      );
      event.target.value = '';
      setBannerUploading(false);
      return;
    }

    try {
      const url = await handleAWSFileUpload(file, undefined, UPLOAD_TYPE.BANNER);
      if (url) {
        if (isAnimationType(file.type)) {
          setValue(FORM_FIELD_NAMES.BANNER_ANIMATION_URL, url);
          setBannerAnimationUrl(url);
          setBannerImageUrl(null);
        } else {
          setValue(FORM_FIELD_NAMES.BANNER_IMAGE_URL, url);
          setBannerImageUrl(url);
          setBannerAnimationUrl(null);
        }
        setUploadedBanner(file);
        setBannerUploadError(null);
        const successMessage = (bannerImageUrl || bannerAnimationUrl)
          ? BANNER_UPLOAD_TEXT.SUCCESS_MESSAGES.BANNER_CHANGED
          : BANNER_UPLOAD_TEXT.SUCCESS_MESSAGES.BANNER_UPLOADED;
        notify(ADD_PROGRAM_PAGE_TEXT.NOTIFY.SUCCESS_TITLE, successMessage, ADD_PROGRAM_PAGE_TEXT.NOTIFY.SUCCESS_TYPE);
      }
    } catch (error) {
      const errorMessage = (bannerImageUrl || bannerAnimationUrl)
        ? BANNER_UPLOAD_TEXT.ERROR_MESSAGES.CHANGE_FAILED
        : BANNER_UPLOAD_TEXT.ERROR_MESSAGES.UPLOAD_FAILED;
      setBannerUploadError(errorMessage);
      notify(
        ADD_PROGRAM_PAGE_TEXT.ERRORS.UPLOAD_ERROR_TITLE,
        errorMessage,
        WARNING
      );
      event.target.value = '';
    } finally {
      setBannerUploading(false);
    }
  };

  const handleVenueChange = (value: string[]) => {
    if (value.includes(ADD_PROGRAM_PAGE_TEXT.UI.ADD_CUSTOM_VENUE)) {
      setShowCustomVenue(true);
      const filteredValue = value.filter((v) => v !== ADD_PROGRAM_PAGE_TEXT.UI.ADD_CUSTOM_VENUE);
      setValue(FORM_FIELD_NAMES.VENUE_ADDRESS, filteredValue);
    } else {
      setShowCustomVenue(false);
      setValue(FORM_FIELD_NAMES.VENUE_ADDRESS, value);
    }
  };

  const isDateWithinProgramRange = (date: Date) => {
    if (!startDate || !endDate) return true;
    return date >= startDate && date <= endDate;
  };

  // Main program date handlers
  const handleDateChange = (startDate: any, endDate: any) => {
    setValue(FORM_FIELD_NAMES.START_DATE, startDate);
    setValue(FORM_FIELD_NAMES.END_DATE, endDate);
    // Trigger validation for dates that depend on program dates
    if (startDate) trigger(FORM_FIELD_NAMES.START_DATE);
    if (endDate) trigger(FORM_FIELD_NAMES.END_DATE);
    // Re-validate registration dates since they depend on program start date
    trigger(FORM_FIELD_NAMES.REGISTRATION_START_DATE);
    trigger(FORM_FIELD_NAMES.REGISTRATION_END_DATE);
  };

  const _handleRegistrationDateChange = (startDate: any, endDate: any) => {
    setValue(FORM_FIELD_NAMES.REGISTRATION_START_DATE, startDate);
    setValue(FORM_FIELD_NAMES.REGISTRATION_END_DATE, endDate);
  };

  // Function to get program date range value for DateRangePicker
  const getProgramDateRangeValue = (): DateRange | null => {
    const start = watch(FORM_FIELD_NAMES.START_DATE);
    const end = watch(FORM_FIELD_NAMES.END_DATE);
    if (start && end) {
      return [start, end] as DateRange;
    }
    return null;
  };

  // Handler for date range change from DateRangePicker
  const handleProgramDateRangeChange = (value: DateRange | null) => {
    if (value && value.length === 2) {
      const [start, end] = value;
      setValue(FORM_FIELD_NAMES.START_DATE, start);
      setValue(FORM_FIELD_NAMES.END_DATE, end);
      _setDateRange([start, end]);
      if (handleDateChange) {
        handleDateChange(start, end);
      }
      // Trigger validation for program dates
      trigger(FORM_FIELD_NAMES.START_DATE);
      trigger(FORM_FIELD_NAMES.END_DATE);
      // Also trigger validation for registration dates since they depend on program dates
      trigger(FORM_FIELD_NAMES.REGISTRATION_START_DATE);
      trigger(FORM_FIELD_NAMES.REGISTRATION_END_DATE);
    }
  };

  // Sub-program date range handlers
  const handleSubProgramDateRangeChange = (
    subProgramId: string,
    startDate: Date | null,
    endDate: Date | null,
  ) => {
    setSubProgramDateRanges((prev) => ({
      ...prev,
      [subProgramId]: [startDate, endDate],
    }));

    if (startDate) {
      handleSubProgramChange(subProgramId, FORM_FIELD_NAMES.START_DATE, startDate);
    }
    if (endDate) {
      handleSubProgramChange(subProgramId, FORM_FIELD_NAMES.END_DATE, endDate);
    }
  };

  const getSubProgramDateRange = (
    subProgramId: string,
  ): [Date | null, Date | null] => {
    return subProgramDateRanges[subProgramId] || [null, null];
  };

  const setSubProgramDateRange = (
    subProgramId: string,
    dateRange: [Date | null, Date | null],
  ) => {
    setSubProgramDateRanges((prev) => ({
      ...prev,
      [subProgramId]: dateRange,
    }));
  };

  // Currently unused - needs fields array to be defined
  // const handleSubProgramBannerUpload = (
  //   subProgramId: string,
  //   imageUrl: string,
  // ) => {
  //   const subProgramIndex = fields.findIndex(
  //     (field: any) => field.id === subProgramId,
  //   );
  //   if (subProgramIndex !== -1) {
  //     setValue(
  //       `subPrograms.${subProgramIndex}.bannerImageUrl` as any,
  //       imageUrl,
  //     );
  //   }
  // };

  const handlePreview = () => {
    const currentProgramName = watch(FORM_FIELD_NAMES.PROGRAM_NAME) || programName;
    const currentVenue = watch(FORM_FIELD_NAMES.VENUE_ADDRESS)?.[0] || "";
    const startDate = watch(FORM_FIELD_NAMES.START_DATE);
    const endDate = watch(FORM_FIELD_NAMES.END_DATE);
    const programFee = watch(FORM_FIELD_NAMES.PROGRAM_FEE) || "0";
    const currency = watch(FORM_FIELD_NAMES.CURRENCY) || CURRENCY_VALUES.INR;
    _setCurrentStep(2);
    const url = `/admin/program-edit?programId=${existingProgramData?.id}${templateId ? `&templateId=${templateId}` : ''}`;
    navigate(url, {
      state: {
        programQuestionMaps: existingProgramData?.programQuestionMaps || [],
        programName: currentProgramName,
        bannerImageUrl: bannerImageUrl || null,
        bannerAnimationUrl: bannerAnimationUrl || null,
        bannerImage:
          bannerImageUrl || bannerAnimationUrl || getProgramImageForBanner(currentProgramName),
        programId: existingProgramData?.id,
        templateId: templateId,
        fromFormBuilder: false,
        // Add these fields for RectangularCard
        cardDetails: {
          title: currentProgramName,
          venue: currentVenue,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          payment: {
            amount: programFee,
            currency: currency,
          },
        },
      },
    });
  };

  useEffect(() => {
    if (programType?.data?.venue) {
      setValue(FORM_FIELD_NAMES.VENUE_ADDRESS, [programType.data.venue]);
    }
  }, [programType?.data?.venue, setValue]);

  return (
    <div>
      {loader && <Loader type="large" />}
      <Box
        component="form"
        ref={formRef as any}
        noValidate
        onSubmit={(e) => {
          handleSubmit(
            (data) => {
              handleSave(data);
            },
            (errors: any) => {
              const getFirstError = (errs: any, prefix = ''): { path: string; message: string } | null => {
                if (!errs) return null;
                if (Array.isArray(errs)) {
                  for (let i = 0; i < errs.length; i++) {
                    const found = getFirstError(errs[i], `${prefix}.${i}`);
                    if (found) return found;
                  }
                  return null;
                }
                for (const key of Object.keys(errs)) {
                  const fullKey = prefix ? `${prefix}.${key}` : key;
                  const val = errs[key];
                  if (!val) continue;
                  if (val.message) return { path: fullKey, message: `${fullKey}: ${val.message}` };
                  if (typeof val === 'object') {
                    const found = getFirstError(val, fullKey);
                    if (found) return found;
                  }
                }
                return null;
              };

              const firstError = getFirstError(errors);

              const el = document.querySelector(`[data-field-name~="${firstError?.path}"]`) as HTMLElement | null;
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }

              notify(
                ADD_PROGRAM_PAGE_TEXT.NOTIFY.VALIDATION_ERROR_TITLE,
                firstError?.message || ADD_PROGRAM_PAGE_TEXT.ERRORS.VALIDATION_ERRORS,
                WARNING
              );
            }
          )(e);
        }}
        sx={{
          background: " #F9FAFB",
        }}
      >
        <div className={styles.headerSection}>
          <div className={styles.programHeader}>
            <div className={styles.programHeaderText}>
              {/* <img
              src={ArrowLeft}
              alt="Back"
              onClick={() => navigate("/admin/action-cards")}
            /> */}
              {isEditMode ? ADD_PROGRAM_PAGE_TEXT.UI.UPDATE_PROGRAM : ADD_PROGRAM_PAGE_TEXT.UI.CREATE_PROGRAM}
            </div>
          </div>
          <div>
            <Stepper currentStep={1} />
          </div>

          <div className={styles.headerTitle}>
            {ADD_PROGRAM_PAGE_TEXT.UI.SETUP_INTRO} {programType?.data?.name} {ADD_PROGRAM_PAGE_TEXT.UI.PROGRAM_SUFFIX}{" "}
            {seekerDetails?.firstName || ADD_PROGRAM_PAGE_TEXT.UI.DEFAULT_SEEKER}!
          </div>
        </div>

        {/* Program Details Section */}
        <div className={styles.programDetails}>
          <div className={styles.programDetailsContainer}>
            {/* Render banner image based on state */}
            {bannerUploading ? (
              <div className={styles.programBanner} style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f0f0", minHeight: "200px" }}>
                <Loader type={ADD_PROGRAM_PAGE_TEXT.VALUES.LOADER_TYPE_SMALL} />
              </div>
            ) : (bannerAnimationUrl || bannerImageUrl || uploadedBanner) ? (
              <div className={styles.programBanner} style={{ position: "relative" }}>
                <BannerRenderer
                  bannerAnimationUrl={bannerAnimationUrl}
                  bannerImageUrl={bannerImageUrl || (uploadedBanner ? URL.createObjectURL(uploadedBanner) : null)}
                  fallbackImage={getProgramImageForBanner(programName)}
                  alt="Program Banner"
                  className={styles.bannerImage}
                />
                <input
                  type="file"
                  accept={BANNER_UPLOAD_TEXT.ALLOWED_MIME_TYPES.join(",")}
                  style={{ display: "none" }}
                  id={ADD_PROGRAM_PAGE_TEXT.VALUES.BANNER_INPUT_ID}
                  onChange={handleBannerUpload}
                />
                <div className={styles.bannerButtonBottomRight}>
                  <Button
                    type="button"
                    buttonClassName={styles.buttonContainer}
                    buttonTextClassName={styles.buttonText}
                    datatestid="change-banner-button"
                    datatestidText="change-banner"
                    onClick={() => {
                      const input = document.getElementById(
                        ADD_PROGRAM_PAGE_TEXT.VALUES.BANNER_INPUT_ID,
                      ) as HTMLInputElement;
                      if (input) input.click();
                    }}
                  >
                    {BANNER_UPLOAD_TEXT.CHANGE_BANNER_ACTION}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className={`${styles.bannerUploadContainer} ${bannerUploadError ? styles.bannerUploadContainerError : ''}`}>
                  <div className={styles.uploadSection}>
                    <input
                      type="file"
                      accept={BANNER_UPLOAD_TEXT.ALLOWED_MIME_TYPES.join(",")}
                      style={{ display: "none" }}
                      id={ADD_PROGRAM_PAGE_TEXT.VALUES.BANNER_INPUT_ID}
                      onChange={handleBannerUpload}
                    />
                    <label
                      htmlFor={ADD_PROGRAM_PAGE_TEXT.VALUES.BANNER_INPUT_ID}
                      className={styles.uploadLink}
                    >
                      {BANNER_UPLOAD_TEXT.UPLOAD_ACTION}
                    </label>
                    <p className={styles.uploadInstructions}>
                      {BANNER_UPLOAD_TEXT.UPLOAD_INSTRUCTIONS}
                    </p>
                  </div>

                </div>
                {bannerUploadError && (
                  <p className={styles.bannerUploadError}>
                    {bannerUploadError}
                  </p>
                )}
              </>
            )}
            <div className={styles.programDetailsHeader}>
              {/* Dynamic Form Sections based on Program Type */}
              {!formConfig && <div style={{padding: '20px', background: '#ffebee', border: '1px solid red'}}>
                <h3>WARNING: formConfig is null or undefined!</h3>
                <p>programTypeName: {programTypeName}</p>
              </div>}
              
              {formConfig && formConfig.sections && formConfig.sections.map((section) => (
                <DynamicFormSection
                  key={section.sectionId}
                  section={section}
                  control={control}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                  trigger={trigger}
                  venueOptions={venueOptions}
                  handleDateRangeChange={handleProgramDateRangeChange}
                  handleVenueChange={handleVenueChange}
                  getProgramDateRangeValue={getProgramDateRangeValue}
                  isPublished={isPublished}
                  fieldCallbacks={{
                    [FORM_FIELD_NAMES.PROGRAM_CODE]: {
                      isChecking: isCheckingCode,
                      available: codeAvailable,
                    },
                  }}
                />
              ))}

              {/* SubProgramsSection: Dynamic or Legacy based on config availability */}
              {hasSubPrograms && subProgramFields && subProgramFields.length > 0 &&
               !(programTypeName?.toUpperCase() === PROGRAM_TYPE_NAMES.CUSTOM && (!programStructureValue || programStructureValue === PROGRAM_STRUCTURE_VALUES.SINGLE)) ? (
                <DynamicSubProgramsSection
                  subProgramFields={subProgramFields}
                  control={control}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                  trigger={trigger}
                  venueOptions={venueOptions}
                  handleDateRangeChange={handleProgramDateRangeChange}
                  handleVenueChange={handleVenueChange}
                  getProgramDateRangeValue={getProgramDateRangeValue}
                  isPublished={isPublished}
                  programTypeName={programStructureValue === PROGRAM_STRUCTURE_VALUES.MULTIPLE ? PROGRAM_TYPE_NAMES.CUSTOM_SESSION : programStructureValue === PROGRAM_STRUCTURE_VALUES.GROUPED ? PROGRAM_TYPE_NAMES.CUSTOM_GROUPED : programTypeName}
                  noOfItems={
                    programStructureValue === PROGRAM_STRUCTURE_VALUES.MULTIPLE
                      ? parseInt(noOfSessionValue) || 0
                      : programStructureValue === PROGRAM_STRUCTURE_VALUES.GROUPED
                      ? parseInt(noOfSubProgramsValue) || 0
                      : 0
                  }
                  modeOfProgram={modeOfProgram}
                />
              ) : (
                (programType?.data?.noOfSession > 0 ||
                  programType?.data?.isGroupedProgram) && (
                  <SubProgramsSection
                    control={control}
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                    getValues={getValues}
                    programType={programType}
                    modeOfProgram={modeOfProgram}
                    startDate={startDate}
                    endDate={endDate}
                    venueOptions={venueOptions}
                    currencyOptions={currencyOptions}
                    isDateWithinProgramRange={isDateWithinProgramRange}
                    onDeleteSubProgram={handleDeleteSubProgram}
                    subProgramDateRanges={subProgramDateRanges}
                    onSubProgramDateRangeChange={handleSubProgramDateRangeChange}
                    getSubProgramDateRange={getSubProgramDateRange}
                    setSubProgramDateRange={setSubProgramDateRange}
                    existingSubPrograms={
                      existingProgramData?.groupedPrograms
                        ? getExistingSubPrograms(existingProgramData.groupedPrograms)
                        : []
                    }
                    isEditMode={isEditMode}
                    trigger={trigger}
                    noOfSession={programType?.data?.noOfSession || 0}
                    isGroupedProgram={programType?.data?.isGroupedProgram}
                    programTypeNameFromSource={programType?.data?.name || ""}
                    isPublished={isPublished}
                  />
                )
              )}
            </div>
          </div>
          <RectangularCard
            title={watch(FORM_FIELD_NAMES.PROGRAM_NAME)}
            venue={
              watch(FORM_FIELD_NAMES.VENUE) ||
              watch(FORM_FIELD_NAMES.VENUE_ADDRESS)?.[0] ||
              ""
            }
            startDate={
              watch(FORM_FIELD_NAMES.START_DATE) &&
              watch(FORM_FIELD_NAMES.START_DATE) instanceof Date &&
              !isNaN(watch(FORM_FIELD_NAMES.START_DATE).getTime())
                ? format(watch(FORM_FIELD_NAMES.START_DATE), "yyyy-MM-dd")
                : ""
            }
            endDate={
              watch(FORM_FIELD_NAMES.END_DATE) &&
              watch(FORM_FIELD_NAMES.END_DATE) instanceof Date &&
              !isNaN(watch(FORM_FIELD_NAMES.END_DATE).getTime())
                ? format(watch(FORM_FIELD_NAMES.END_DATE), "yyyy-MM-dd")
                : ""
            }
            payment={{
              amount: watch(FORM_FIELD_NAMES.PROGRAM_FEE) || "0",
              currency: watch(FORM_FIELD_NAMES.CURRENCY) || CURRENCY_VALUES.INR,
            }}
            hdbFee={watch(FORM_FIELD_NAMES.HDB_FEE) || "0"}
            msdFee={watch(FORM_FIELD_NAMES.MSD_FEE) || "0"}
            isPaymentRequired={
              watch(FORM_FIELD_NAMES.IS_PAYMENT_REQUIRED) !== YES_NO_VALUES.NO ||
              watch('requiresPayment' as any) !== YES_NO_VALUES.NO
            }
            hasVenue={
              watch(FORM_FIELD_NAMES.MODE_OF_PROGRAM) === MODE_OF_PROGRAM_VALUES.OFFLINE ||
              watch(FORM_FIELD_NAMES.MODE_OF_PROGRAM) === MODE_OF_PROGRAM_VALUES.HYBRID
            }
          />
        </div>
        <div className={styles.formRowButton}>
          <Button
            type="button"
            buttonClassName={styles.buttonContainerSecondary}
            buttonTextClassName={styles.buttonTextSecondary}
            onClick={handleCancel}
            datatestid="add-program-cancel-button"
            datatestidText="add-program-cancel"
          >
            {ADD_PROGRAM_PAGE_TEXT.UI.CANCEL}
          </Button>
          <Button
            type="submit"
            buttonClassName={styles.buttonContainer}
            buttonTextClassName={styles.buttonText}
            datatestid="add-program-save-button"
            datatestidText="add-program-save"
            onClick={() => {

            }}
          >
            {isEditMode ? ADD_PROGRAM_PAGE_TEXT.UI.ACTION_UPDATE_PROGRAM : ADD_PROGRAM_PAGE_TEXT.UI.ACTION_CONTINUE}
          </Button>
          {existingProgramData?.programQuestionMaps?.length > 0 && (
            <Button
              type="submit"
              buttonClassName={styles.buttonContainer}
              buttonTextClassName={styles.buttonText}
              datatestid="add-program-save-button"
              datatestidText="add-program-save"
              onClick={handlePreview}
            >
              preview form
            </Button>
          )}
        </div>
      </Box>

      <CustomVenueModal
        isOpen={isCustomVenueModalOpen}
        onClose={() => setCustomVenueModalOpen(false)}
        value={customVenue}
        setValue={setCustomVenue}
        title={ADD_PROGRAM_PAGE_TEXT.UI.CUSTOM_VENUE_MODAL_TITLE}
        message={ADD_PROGRAM_PAGE_TEXT.UI.CUSTOM_VENUE_MODAL_MESSAGE}
        showInput={true}
      />
    </div>
  );
};

export default AddProgramPage;
