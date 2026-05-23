import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "./index.module.scss";
import { endPoints, PORTAL } from "../../constants/urlConstants";
import { getCall, getCallWithLoader, putCallWithLoader } from "../../services/apiService";
import {
  getItemInLocalStorage,
  setItemInLocalStorage,
} from "../../services/localStorage";
import { AUTHORIZATION_ACCESS, hasPermission } from "../../utils/roleBasedAccess";
import { noData, SUCCESS, swapTypeOptions, WARNING } from "../../constants";
import starIcon from "../../assets/images/starIcon.svg";
import shuffle from "../../assets/images/shuffle-img.svg";
// Components
import DataGridWithPagination from "../../common/components/DataGridWithPagination";
import Loader from "../../common/components/Loader";
import DashboardHeader from "../../common/components/DashboardHeader";
import AdminKpiData from "../../common/components/AdminKpiData";
import KebabMenu from "../../common/components/KebabMenu";
import FilterPills from "../filterItemsDisplay";
import defaultProfileIcon from "../../assets/images/default-profile.svg";
import swapDemand from '../../assets/images/swap-demand1.svg';
// Types
type HdbSeekersListAdminProps = {
  filters?: any;
};
import { ApiService } from "../../services/mockService";
import { Tooltip } from "@mui/material";
import { downloadExcelFromApi } from "../../utils/downloadExcel";
import { downloadPdf } from "../../utils/downloadPdf";
import { colorizeMahatriaInfinitheism } from "../../common/components/ColorizeMahatriaInfinitheism";
import { transformSeekerResponse } from "../../utils/dataMapper";
import { useDispatch, useSelector } from "react-redux";
import { getFilterConfig } from "../../utils/hdbDashboardUtils";
import { ID_PROOF_EXPORT, ERROR } from "../../constants";
import {
  setFilterOptions,
  setSelectedKpiOption,
  setSelectedKpiTab,
  setActiveTab,
  setProgramName,
  setAppliedFilters,         
  removeFilter,            
  clearAllFilters,         
  setDashboardFilters,     
  setSearchValue,
  setSearchQuery,
  clearSearch,
  setCurrentPage,     
  setPageSize,
  resetPagination,     
  setSortState,
  clearSort,
  decrementLoader,
  setFilterConfig,
} from "../../reducers/ProgramReducer";
import { RootState } from "../../store";
import { formatDateString, formateYearDate, isSessionStartingSoon } from "../../utils/commonFunctions";
import { SortState } from "../../types/seatApproval";
import { ApprovalStatus, CANCEL_SWAP, DOWNLOAD_ERRORS, SWAP_REQUEST_TITLE, textConstant, USER_ACTION_ERRORS, OverlayType, ACTION_TYPE_LABELS, BLESSING_MAIL, RESEND_EMAIL, ID_PROOF_EXPORT_MESSAGES, REPORTS, CONFIRMATION_MESSAGES, ACTION_LABELS, BULKEMAIL } from "../../constants/textConstants";
import { notify } from "../../common/components/ToastMessage";

// Lazy load overlay and popup components
const AdminFilterOverlay = lazy(() => import("../../components/components/AdminFilterOverlay"));
const ReviewOverlay = lazy(() => import("../../components/RatingOverLay"));
const SwapFilterOverlay = lazy(() => import("../../common/components/SwapFilterContent"));
const DefaulterOverlay = lazy(() => import("../../common/components/DefaulterOverlay"));
const CancelRegistrationOverlay = lazy(() => import("../../common/components/CancelRegistrationOverlay"));
const AlertPopup = lazy(() => import("../../common/components/AlertPopup"));
const DownloadPopup = lazy(() => import("../DownloadPopUp"));
const UserCardOverlay = lazy(() => import("../../common/components/UserCardOverlay"));
const BulkEmailsPopUp = lazy(() => import("../BulkEmailsPopUp"));
const QuickViewOverlay = lazy(() => import("../../components/QuickViewOverlay"));
const ImagePreview = lazy(() => import("../../common/components/ImagePreview"));
const SeekerTags = lazy(() => import("../../components/SeekerTags"));
const DownloadReport = lazy(() => import("../../components/DownloadReportPopup"));

import {
  initiateIdProofExport,
  pollIdProofExportStatus,
  downloadFromSignedUrl,
  checkIdProofExportStatus,
} from "../../services/idProofExportService";

const getFiltersByContext = (selectedKpiOption, selectedKpiTab, filterConfigList) => {

  if (!selectedKpiOption || !filterConfigList?.sideFilterSets) return {};

  const { baseSets, contextualFilters } = filterConfigList.sideFilterSets;

  const parentKey = selectedKpiOption.value;
  // Use selectedKpiTab instead of first kpiOption
  const childKey = selectedKpiTab?.value;

  const allowedFilterTypes = contextualFilters[parentKey]?.[childKey] || [];
  const finalFilters = allowedFilterTypes.reduce((acc, filterType) => {
    if (baseSets[filterType]) {
      acc.push(...baseSets[filterType]);
    }
    return acc;
  }, []);

  return finalFilters;
};
const transformFilters = (filters: any) => {
  const transformed: any = {};

  Object.entries(filters).forEach(([key, filterData]: [string, any]) => {
    if (key === 'view' || !filterData) return;

    // Case 1: filterData itself is an array (primitives or objects with value/label)
    if (Array.isArray(filterData)) {
      transformed[key] = filterData.map((item: any) =>
        typeof item === 'object' && item !== null && 'value' in item
          ? item.value // extract value from object
          : item       // keep primitive
      );
    } 
    // Case 2: filterData.value is an array of value-label objects
    else if (filterData && Array.isArray(filterData.value)) {
      transformed[key] = filterData.value.map((item: any) =>
        typeof item === 'object' && item !== null && 'value' in item
          ? item.value
          : item
      );
    } 
    // Case 3: operator-based filters
    else if (filterData && typeof filterData.value === 'object' && 'operator' in filterData.value) {
      transformed[key] = {
        operator: filterData.value.operator,
        value: filterData.value.value
      };
    } 
    // Case 4: date range filters
    else if (filterData && typeof filterData.value === 'object' && 'startDate' in filterData.value) {
      transformed[key] = filterData.value;
    } 
    // Case 5: simple primitive value
    else {
      transformed[key] = filterData.value ?? filterData;
    }
  });

  return transformed;
};

const HdbSeekersListAdmin: React.FC<HdbSeekersListAdminProps> = (props) => {
  // Router
  const navigate = useNavigate();
  const location = useLocation();
  const { programId } = useParams<{ programId: string }>();
  const programIdNumber = programId ? Number(programId) : undefined;
  const sessionId = location.state?.sessionId ?? undefined;
  const { filters } = props;
  const [bulkEmailUrl, setBulkEmailUrl] = useState<{
    programId?: number;
    parentFilter?: string;
    filters?: { kpiCategory?: string; kpiFilter?: string };
  } | null>(null);
  const [programTypeKey, setProgramTypeKey] = useState<string>("");
  const [programCode, setProgramCode] = useState<string>("");
  const [programStartsAtDate, setProgramStartsAtDate] = useState<string>("");
  const [isGroupedProgram, setIsGroupedProgram] = useState<boolean>(false);
  const selectedKpiTab = useSelector(
    (state: RootState) => state.ProgramReducer.selectedKpiTab
   
  );
  const selectViewList = useSelector((state: RootState) => state.ProgramReducer.selectViewList);
  const dispatch = useDispatch();
  const [viewList , setViewList] = useState<any[]>([])

  const [quickView,setQuickView]=useState<any[]>([]);
  const [sessionData, setSessionData] = useState<any[]>([]);
  const [showCancelOverlay, setShowCancelOverlay] = useState(false);
  
  const [alert, setAlert] = useState<{ message: string; open: boolean }>({ message: "", open: false });
  const [confirmPopup, setConfirmPopup] = useState<{ open: boolean; message: string; cancelSwap?: boolean; onConfirm: (reason?:string) => void }>({ open: false, message: '', onConfirm: () => {} });
  // Extract kpiCategory and kpiFilter if present
  // Not used: 27/01/2026
  // const initialKpiFilter =
  //   filters && filters.kpiCategory && filters.kpiFilter
  //     ? { kpiCategory: filters.kpiCategory, kpiFilter: filters.kpiFilter }
  //     : null;

  // Add this at the top of your component with other refs
const fetchControllerRef = useRef<AbortController | null>(null);
const latestRequestIdRef = useRef(0); 
const userRole = getItemInLocalStorage("seekerDetails")?.role || "";

// ADD these Redux selectors:
const appliedFilters = useSelector((state: RootState) => state.ProgramReducer.appliedFilters);
const dashboardFilters = useSelector((state: RootState) => state.ProgramReducer.dashboardFilters);
// ADD this useEffect to initialize filters from props
useEffect(() => {
  if (filters && typeof filters === "object") {
    const initialFilters = Object.keys(filters).reduce((acc, key) => {
      if (key !== "kpiCategory" && key !== "kpiFilter" && key !== "view") {
        acc[key] = filters[key];
      }
      return acc;
    }, {} as any);
    dispatch(setAppliedFilters(initialFilters));
  }
}, []); // Run only once on mount

  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [loading, setLoading] = useState(true);
  // const [pageSize, setPageSize] = useState(100);
  // const [currentPage, setCurrentPage] = useState(1);
// Add these with your other Redux selectors
const searchState = useSelector((state: RootState) => state.ProgramReducer.search);
const searchValue = { value: searchState.value, open: searchState.open };
const searchQuery = searchState.query;
  const [showFilterOverlay, setShowFilterOverlay] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
 const [activeOverlayType, setActiveOverlayType] = useState<OverlayType>(null);
  const [dynamicProgramOptions, setDynamicProgramOptions] = useState<any[]>([]);
  const [reviewInitialRatings, setReviewInitialRatings] = useState<{
    [key: string]: { rating: number; id?: number };
  }>({});
  const [reviewInitialComments, setReviewInitialComments] = useState("");
  const [isIntialLoading, setIsintialLoading] = useState(true);
  const initalLoadingRef = useRef<boolean>(true);
  const [kpis, setKpis] = useState<any[]>([]);
  const [hasSyncedTab, setHasSyncedTab] = useState(false);
  const [subProgramsData, setSubProgramsData] = useState([]);
  const [flippedUserId, setFlippedUserId] = useState<number | null>(null);
  const [reviewInitialRecommendations, setReviewInitialRecommendations] =
    useState<any>(null);
  const [prevRating, setPrevRating] = useState<any>(null); // Add this new state
  const [seekerExperiences, setSeekerExperiences] = useState<any[]>([]); // Generated by Copilot - Seeker experiences state
  // State for export popup
  const [showExportPopup, setShowExportPopup] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
    "filtered" | "all" | "download"
  >("download");
  const [open, setOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = React.useState({
    image: '',
    altText: '',
  });
  const sortState = useSelector((state: RootState) => state.ProgramReducer.sortState);

  // State for bulk emails
  const [showBulkEmailPopup, setShowBulkEmailPopup] = useState(false);
  
  // State for bulk ID proofs
  const [showBulkIdProofsModal, setShowBulkIdProofsModal] = useState(false);
  
  const activeTab = useSelector(
    (state: RootState) => state?.ProgramReducer?.activeTab
  );
  // Get selectedKpiOption and filterConfig from Redux
  const selectedKpiOption = useSelector(
    (state: RootState) => state.ProgramReducer.selectedKpiOption
  );
  const filterConfig = useSelector(
    (state: RootState) => state.ProgramReducer.filterConfig,
  );
  const selectedKpiFilter = useSelector(
    (state: RootState) => state.ProgramReducer.selectedKpiFilter
  );

  const filterConfigList = useSelector((state: RootState) => state.ProgramReducer.filterConfigList)?.data;
  const filterResponse = useSelector((state: RootState) => state.ProgramReducer.filterConfigList);

  const [isSubProgramsLoaded, setIsSubProgramsLoaded] = useState(false);

  const pageSize = useSelector((state: RootState) => state.ProgramReducer.pagination.pageSize);
  const currentPage = useSelector((state: RootState) => state.ProgramReducer.pagination.currentPage);
  
  // Refs to track previous values for change detection (must come after all selectors)
  const prevSelectedKpiOptionRef = useRef(selectedKpiOption);
  const prevSelectViewListRef = useRef(selectViewList);
  const prevActiveTabRef = useRef(activeTab);
  const prevAppliedFiltersRef = useRef(appliedFilters);
  const prevSearchQueryRef = useRef(searchQuery);
  const prevSortStateRef = useRef(sortState);
  const prevCurrentPageRef = useRef(currentPage);
  const prevPageSizeRef = useRef(pageSize);

  // State to trigger fetch with what changed
  const [fetchTrigger, setFetchTrigger] = useState<{
    timestamp: number;
    changes: {
      kpiOption?: boolean;
      view?: boolean;
      tab?: boolean;
      filters?: boolean;
      search?: boolean;
      sort?: boolean;
      pagination?: boolean;
    };
  }>({ timestamp: Date.now(), changes: {} });
  
  // Flag to prevent double fetch when tab is set programmatically after KPI data loads
  // Not used: 27/01/2026
  // const isSettingTabProgrammatically = useRef(false);
  
  // Flag to track if initial fetch has been triggered
  const hasInitialFetchTriggered = useRef(false);
const HIGHLIGHT_COLOR = "#e28619";
const handleSetPageSize = (size: number) => {
  dispatch(setPageSize({ size, programId }));
};

const handleSetCurrentPage = (page: number) => {
  dispatch(setCurrentPage({ page, programId })); 
};

// Not used: 27/01/2026
// const getProgramId = getItemInLocalStorage('programId');

// const prevProgramIdRef = useRef<string | undefined>(undefined);

useEffect(() => {
   setSearchValue((prev) => ({ ...prev, open: false, value: "" }));
}, [activeTab, appliedFilters]);



 useEffect(() => {
  if (selectedKpiOption) {
    const contextualFilters = getFiltersByContext(
      selectedKpiOption,
      selectedKpiTab,
      filterConfigList,
    );
    dispatch(setDashboardFilters(contextualFilters));
  }
}, [selectedKpiOption, filterConfig, selectedKpiTab, dispatch]);;

useEffect(() => {
    const fetchFilteringData = async () => {
      const storedProgramId = getItemInLocalStorage("programId");
      const params = new URLSearchParams(location.search);
      const parentFilterParam = params.get("parentFilter");
      let options = [];
      // Check if we can use cached filterResponse
      if (filterResponse && storedProgramId && Number(storedProgramId) === Number(programId)) {
        const parentOptions = filterResponse?.data?.parentOptions || [];
        options = parentOptions.map((option) => ({
          label: option.label,
          value: option.value,
          kpiOptions: option.kpiOptions,
        }));
      } else {
        // Fetch new config if cache not available or programId changed
        const config = await getFilterConfig(programId, dispatch);
        if (config?.data?.parentOptions) {
          options = config.data.parentOptions.map((option) => ({
            label: option.label,
            value: option.value,
            kpiOptions: option.kpiOptions,
          }));
        }
        dispatch(setFilterConfig(config.data));
        // Update localStorage if programId changed
        if (Number(storedProgramId) !== Number(programId)) {
          setItemInLocalStorage("programId", Number(programId));
          
          if (options.length > 0) {
            dispatch(
              setSelectedKpiOption({
                label: options[0].label,
                value: options[0].value,
              }),
            );
            dispatch(setSelectedKpiTab(options[0].kpiOptions[0]));
          }
        }
      }

      dispatch(setFilterOptions(options));

      // Set option from URL params if available
      if (parentFilterParam && options.length > 0) {
        try {
          const parsedFilter = JSON.parse(parentFilterParam);
          const matchingOption = options.find(
            (opt) => opt.value === parsedFilter.value,
          );
          if (matchingOption) {
            dispatch(
              setSelectedKpiOption({
                label: matchingOption.label,
                value: matchingOption.value,
              }),
            );
          } else {
            dispatch(
              setSelectedKpiOption({
                label: options[0].label,
                value: options[0].value,
              }),
            );
            dispatch(setSelectedKpiTab(options[0].kpiOptions[0]));
          }
        } catch (error) {
          console.error("Error parsing parentFilter:", error);
          dispatch(
            setSelectedKpiOption({
              label: options[0].label,
              value: options[0].value,
            }),
          );
          dispatch(setSelectedKpiTab(options[0].kpiOptions[0]));
        }
      } else if (options.length > 0 && !selectedKpiOption) {
        dispatch(
          setSelectedKpiOption({
            label: options[0].label,
            value: options[0].value,
          }),
        );
      }
    };

    fetchFilteringData();
  }, [programId, location.search]);

  useEffect(() => {
    if (!programId) return;
    getSubProgramsData();
  }, [programId]);

  const getSubProgramsData = async () => {
    try {
      const res = await getCall(`program/${programId}`, undefined, PORTAL);
      dispatch(setProgramName(res?.data?.data?.name));
      setProgramTypeKey(res.data.data?.type?.key || "");
      setProgramCode(res.data.data?.code || "");
      setProgramStartsAtDate(res.data.data?.startsAt || "");
      setIsGroupedProgram(res.data.data?.isGroupedProgram || false);
      const data = res?.data?.data?.groupedPrograms || [];
      const transformedData = data.map(({ id, name, startsAt }) => {
        return { id, name, startsAt };
      });
      console.log(data, "sub programs data");
      transformedData.push(
        { id: "hold", name: "Hold" },
        { id: "yet-to-decide", name: ApprovalStatus.YTD },
      );
      setSubProgramsData(transformedData);
      setIsSubProgramsLoaded(true); // Set flag to true after data is loaded
    } catch (error) {
      console.error("Error fetching sub-programs:", error);
      setIsSubProgramsLoaded(false);
    }
  };

  // Utility Functions
  const fetchAllocatedProgramId = async (seekerId: string | number) => {
    const url = `${endPoints.RegisteredSeekersList}/${seekerId}`;
    const response = await getCall(url, undefined, PORTAL);
    return Number(response?.data?.data?.allocatedProgram?.id);
  };
  const handleReject = (id: any, seekerName: string) => {
    setConfirmPopup({
      open: true,
      message: CONFIRMATION_MESSAGES.MOVE_TO_HOLD(seekerName[0]),
      onConfirm: async () => {
        setConfirmPopup({ ...confirmPopup, open: false });
        const payload = {
          registrationId: Number(id),
          approvalStatus: "rejected",
          rejectionReason: "",
          updatedBy: getItemInLocalStorage("seekerDetails")?.id,
        };
        try {
          const response = await ApiService.blessUser(id, payload);
          if (response.data.statusCode === 200) {
            fetchSeekersList();
          } else {
            setAlert({ message: response.data.message || USER_ACTION_ERRORS.HOLD, open: true });
          }
        } catch (error) {
          setAlert({ message: USER_ACTION_ERRORS.HOLD + USER_ACTION_ERRORS.GENERIC_RETRY, open: true });
        }
      }
    });
  };

  const handleHold = (id: any, seekerName: string) => {
    setConfirmPopup({
      open: true,
      message: CONFIRMATION_MESSAGES.MOVE_TO_SWAP_DEMAND(seekerName[0]),
      onConfirm: async () => {
        setConfirmPopup({ ...confirmPopup, open: false });
        const payload = {
          registrationId: Number(id),
          approvalStatus: "on_hold",
          rejectionReason: "",
          updatedBy: getItemInLocalStorage("seekerDetails")?.id,
        };
        try {
          const response = await ApiService.blessUser(id, payload);
          if (response.data.statusCode === 200) {
            fetchSeekersList();
          } else {
            setAlert({ message: response.data.message || USER_ACTION_ERRORS.YTD, open: true });
          }
        } catch (error) {
          setAlert({ message: USER_ACTION_ERRORS.YTD + USER_ACTION_ERRORS.GENERIC_RETRY, open: true });
        }
      }
    });
  };
  const handleResendProforma = async (registrationId: number) => {
    notify(
      BLESSING_MAIL.TITLE,
      BLESSING_MAIL.INITIATED,
      WARNING
    );
    try {
      const url = endPoints.resendProformaInvoice(registrationId); 
      await putCallWithLoader(
        url,
        {},
        PORTAL,
        "",
        {
          onSuccess: {
            title: BLESSING_MAIL.TITLE,
            message: BLESSING_MAIL.SUCCESS,
            type: SUCCESS
          },
          onError: {
            title: BLESSING_MAIL.TITLE,
            message: BLESSING_MAIL.ERROR,
            type: WARNING
          }
        }
      );
      // Notification is handled by apiService
    } catch (error: any) {
      console.error("Error resending proforma:", error);
      // Error notification is handled by apiService
    }
  };

  const getOptions = (
    id: string,
    row: any,
    onAddReview?: (row: any) => void,
    onSwap?: (row: any) => void,
    onCancelSwap?:(row:any)=>void,
    onInvoiceSend?: (seekerId: any) => void,
    handleResendProforma?:( registrationId: number) => void
  ) => {
    // Extract preferred programs for this row/user
    const preferredPrograms = (row.preference || [])
      .filter((item: any) => item.preferredProgram)
      .map((item: any) => ({
        id: item.preferredProgram.id,
        name: item.preferredProgram.name,
      }));
    const userRole = getItemInLocalStorage("seekerDetails")?.role || "";

    // RBAC-driven options
    const options = [];
    const REGISTRATION_CONFIG = AUTHORIZATION_ACCESS.REGISTRATION;
    // Always add VIEW_DETAILS as first option
    options.push({
      label: ACTION_LABELS.VIEW_DETAILS,
      action: () => handleViewDetails(row),
      imageSource: undefined,
    });
    // Dynamically add options based on AUTHORIZATION_ACCESS.REGISTATION config
    Object.values(REGISTRATION_CONFIG.ACTIONS).forEach((actionConfig: any) => {
      if( actionConfig.action === ACTION_LABELS.VIEW_DETAILS ){
        return; // Skip as already added
      }
      const action = actionConfig.action;
      // Permission check (array of objects: { action, OPERATIONS })
      let hasPerm = true;
      if (Array.isArray(actionConfig.permissions) && actionConfig.permissions.length > 0) {
        hasPerm = actionConfig.permissions.every((permObj: any) => {
          if (permObj && permObj.action && Array.isArray(permObj.OPERATIONS) && permObj.OPERATIONS.length > 0) {
            // At least one operation must pass
            return permObj.OPERATIONS.some((op: string) => hasPermission(userRole, permObj.action, op));
          }
          // If structure is not as expected, default to false
          return false;
        });
      }
      // Accessors check (array of roles as strings)
      let hasAccess = true;
      if (Array.isArray(actionConfig.accessors) && actionConfig.accessors.length > 0) {
        hasAccess = actionConfig.accessors.includes(userRole);
      }
      // Evaluate all deciderKeys (array of objects with key/value functions)
      const deciders = Array.isArray(actionConfig.deciderKeys) ? actionConfig.deciderKeys : [];
      const shouldShow = deciders.length === 0
        ? true
        : deciders.every((decider: any) => {
            // Support object: { key, value }
            if (decider && typeof decider === "object" && decider.key && typeof decider.value === "function") {
              try {
                //  Pass row object as third parameter for decider functions
                return decider.value(row[decider.key], userRole, row);
              } catch {
                return false;
              }
            }
            // If boolean, use value; if anything else, treat as true
            return typeof decider === "boolean" ? decider : true;
          });
      if (hasPerm && hasAccess && shouldShow) {
        // Map actionKey to handler
        let handler;
        switch (action) {
          case ACTION_LABELS.CANCEL_REGISTRATION:
            handler = () => {
              setSelectedRow(row);
              setShowCancelOverlay(true);
            };
            break;
          case ACTION_LABELS.ADD_REVIEW_AND_EXPERIENCE:
          case ACTION_LABELS.UPDATE_REVIEW_AND_EXPERIENCE:
            // Combined handler for both review and seeker experiences
            handler = () => onAddReview && onAddReview(row);
            break;
          case SWAP_REQUEST_TITLE.SWAP_REQUEST:
          case SWAP_REQUEST_TITLE.UPDATE_SWAP_REQUEST: 
            handler = () => onSwap && onSwap(row);
            break;
          case SWAP_REQUEST_TITLE.CANCEL_SWAP_REQUEST:
            handler = () => onCancelSwap && onCancelSwap(row);
            break;
          case ACTION_LABELS.SEND_INVOICE:
            handler = () => onInvoiceSend && onInvoiceSend(row.seekerId || id);
            break;
          case ACTION_LABELS.DOWNLOAD_INVOICE:
            handler = () => {
              const startsAt = programStartsAtDate ? new Date(programStartsAtDate) : undefined;
              const years = startsAt ? formateYearDate(startsAt) : '';
              const fileName = `${programTypeKey === 'PT_HDBMSD' ? 'HDB/MSD' : programCode} ${years} Invoice - ${row.invoiceNumber}`;
              downloadInvoice && downloadInvoice(row.invoiceUrl, fileName);
            };
            break;
          case ACTION_TYPE_LABELS.MARK:
            handler = () => handleMarkAsDefaulter(row);
            break;
          case ACTION_TYPE_LABELS.UNMARK_DEFAULTER:
            handler = () => handleMarkAsDefaulter(row);
            break;
          case ACTION_LABELS.BLESS:
            handler = () => {
              setBlessUser(row.seekerName);
              setSelectedRow(row);
              setDynamicProgramOptions(preferredPrograms);
              setShowBlessCard(true);
            };
            break;
          case ACTION_LABELS.HOLD:
            handler = () => handleReject(id, row.seekerName);
            break;
          case ApprovalStatus.YTD:
            handler = () => handleHold(id, row.seekerName);
            break;
          case ACTION_LABELS.DOWNLOAD_PROFORMA_INVOICE:
            handler = () => downloadPdf(row.proFormaInvoicePdfUrl, undefined);
            break;
          case RESEND_EMAIL:
            handler = () => handleResendProforma && handleResendProforma(row.id);
            break;
          default:
            handler = () => {};
        }
        options.push({
          label: actionConfig.action,
          action: handler,
          imageSource: undefined,
        });
      }
    });
    return options;
  };
  const [showBlessCard, setShowBlessCard] = useState(false);
  const [blessUser, setBlessUser] = useState("");

  const isRowHighlighted = (row: any) => {
    // Mandatory check - don't proceed if subPrograms data isn't loaded
    if (!isSubProgramsLoaded || !subProgramsData || subProgramsData.length === 0) {
      return false;
    }
    const programDate = new Date(row?.allocatedProgramStartsAt);
    const travelDate =( row?.travelUpdatedAt && row?.approvalStatus === 'approved')
      ? new Date(row.travelUpdatedAt)
      : null;
    if (!travelDate) return false;

    const threeDaysBefore = new Date(
      programDate.getTime() - 3 * 24 * 60 * 60 * 1000,
    );
    return travelDate <= programDate && travelDate >= threeDaysBefore;
  };
  const buildDynamicColumns = (tableHeaders: any[]) => {
    const filteredHeaders = tableHeaders
      .filter(
        (header: any) =>
          header.key !== "profileUrl" &&
          header.label?.toLowerCase() !== "profile url" &&
          header.key !== "rmComments" &&
          header.key !== "age" &&
          header.key !== "gender" &&
          header.key !== "location" &&
          header.key !== "recommendationComments" &&
          header.key !== "cancellationComments" &&
          (selectViewList?.value === 'goodies' || header.key !== "goodiesStatus")
      )
      .sort((a: any, b: any) => {
        // If both have order, sort by order
        if (a.order && b.order) {
          // If order is a string with letters, sort lexicographically
          return a.order.localeCompare(b.order, undefined, { numeric: true });
        }
        // If only one has order, it comes first
        if (a.order && !b.order) return -1;
        if (!a.order && b.order) return 1;
        // Otherwise, keep original order
        return 0;
      });

    const handleImageClick = (e: React.MouseEvent, row: any) => {
      e.stopPropagation(); // This prevents the row click event from firing
      console.log("Image clicked, opening preview for:", row.profileUrl);
      setPreviewImageUrl({
        image: row.profileUrl || defaultProfileIcon,
        altText: row.name || "Profile Image",
      });
      setOpen(true);
    };

    const cols = filteredHeaders.map((header: any) => {
      if (header.key === "travelPlanStatus") {
        return {
          field: header.key,
          headerName: "Travel | Goodies Status",
          sortable: header.sortable, 
          width: 190,
          renderCell: (params: any) => {
             const highlightStyle =
              isSubProgramsLoaded && isRowHighlighted(params.row)
                ? { color: HIGHLIGHT_COLOR }
                : {};
            const travel = params.row["travelPlanStatus"] ?? "-";
            const goodies = params.row["goodiesStatus"] ?? "-";
            let displayValue = travel;
            if (goodies && goodies !== "-") {
              displayValue = `${travel} | ${goodies}`;
            }
            return (
              <span title={displayValue} style={{ maxWidth: 190, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block", ...highlightStyle }}>
                {displayValue}
              </span>
            );
          },
        
        };
      }
      if (header.key === "blessedWith") {
        return {
          field: header.key,
          headerName: header.label,
          sortable: header.sortable,
          width: 160,
          renderCell: (params: any) => {
            const highlightStyle =
              isSubProgramsLoaded && isRowHighlighted(params.row)
                ? { color: "#e28619" }
                : {};
            // Not used: 27/01/2026
            // const isSwapRequestActive =
            //   params.row?.isSwapRequestActive === true;
            const blessedWith = params.row.blessedWith;
            let displayValue;
            let showSwapDemand = false;

            if (
              blessedWith === null ||
              blessedWith === undefined ||
              blessedWith === ""
            ) {
              if (params.row.approvalStatus === "pending") {
                displayValue = "Unassigned";
              } else if (params.row.approvalStatus === "rejected") {
                displayValue = "Hold";
              } else if (params.row.approvalStatus === "on_hold") {
                displayValue = ApprovalStatus.YTD;
                showSwapDemand = true;
              } else {
                displayValue = params.row.approvalStatus;
              }
            } else {
              displayValue =
                Object.keys(highlightStyle).length > 0
                  ? blessedWith
                  : colorizeMahatriaInfinitheism(blessedWith);
            }
            
            return (
              <div className={styles.blessedWithContainer}>
                <span
                  className={
                    displayValue === "cancelled" ||
                    displayValue === "Unassigned"
                      ? `${styles.blessedWithText} ${styles.blessedWithTextCancelled}`
                      : styles.blessedWithText
                  }
                  style={highlightStyle}
                >
                  {displayValue === "cancelled"
                    ? displayValue.charAt(0).toUpperCase() + displayValue.slice(1)
                    : displayValue}
                </span>
                {(showSwapDemand || params.row.wantsSwapReqActive || params.row.canShiftReqActive) && (
                  <span className={styles.basicDetailsSeparator}>|</span>
                )}
                {showSwapDemand && (
                  <img
                    src={swapDemand}
                    alt="Swap demand"
                    className={styles.swapIcon}
                    title={(userRole === "mahatria" || userRole === "shoba" || userRole === "relational_manager") && `Swap demand from ${params.row.swapDemandFrom} to ${params.row.swapDemand}\n${params.row.swapDemandComments}`}
                  />
                )}
                {params.row.wantsSwapReqActive && (
                  <img
                    src={shuffle}
                    alt="Wants Swap"
                    className={styles.swapIcon}
                    title={`Wants Swap - ${params.row.swapPreference}`}
                  />
                )}
                {params.row.canShiftReqActive && (
              <span className={styles.canShiftText} title={`Can shift - ${params.row.swapPreference}`}>can shift</span>
                )}
              </div>
            );
          },
        };
      }
      if (header.label === "HDBs") {
        return {
          field: header.key,
          headerName: header.label,
          sortable: header.sortable,
          width: 80,
          // renderHeader: (params: any) => (
          //   <span>
          //     {colorizeMahatriaInfinitheism(params.colDef.headerName)}
          //   </span>
          // ),
          renderCell: (params: any) => {
            const value = params.row[header.key] ?? "-";
            // Only call isRowHighlighted if subPrograms data is loaded
            const highlightStyle =
              isSubProgramsLoaded && isRowHighlighted(params.row)
                ? { color: "#e28619" }
                : {};

            const baseSpanStyle: React.CSSProperties = {
              maxWidth: 140,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
              verticalAlign: "middle",
              ...highlightStyle,
            };

            return (
              <span
                style={baseSpanStyle}
                title={typeof value === "string" ? value : ""}
              >
                {value === null || value === undefined || value === ""
                  ? "-"
                  : value}
              </span>
            );
          },
        };
      }
      if (header.key === "recommendation") {
        return {
          field: header.key,
          headerName: header.label,
          sortable: header.sortable,
          width: 180,
          renderCell: (params: any) => {
            const highlightStyle =
              isSubProgramsLoaded && isRowHighlighted(params.row)
                ? { color: "#e28619" }
                : {};
            const value = params.row[header.key] ?? "-";
            const comment = params.row.recommendationComments ?? "";
            const tooltipContent = (
              <p className={styles.reviewText}>
                {comment
                  ? comment
                      .split("\n")
                      .map((line: string, idx: number, arr: string[]) => (
                        <React.Fragment key={idx}>
                          {line}
                          {idx < arr.length - 1 && <br />}
                        </React.Fragment>
                      ))
                  : ""}
              </p>
            );
            return (
              <Tooltip title={tooltipContent}>
                <span
                  style={{
                    maxWidth: 160,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                    ...highlightStyle,
                  }}
                >
                  {value === null || value === undefined || value === ""
                    ? "-"
                    : value}
                </span>
              </Tooltip>
            );
          },
        };
      }
      if (header.key === "cancellationReason") {
        return {
          field: header.key,
          headerName: header.label,
          sortable: header.sortable,
          width: 180,
          renderCell: (params: any) => {
            const value = params.row[header.key] ?? "-";
            const comment = params.row.cancellationComments ?? "";
            const tooltipContent = (
              <p className={styles.reviewText}>
                {comment
                  ? comment
                      .split("\n")
                      .map((line: string, idx: number, arr: string[]) => (
                        <React.Fragment key={idx}>
                          {line}
                          {idx < arr.length - 1 && <br />}
                        </React.Fragment>
                      ))
                  : ""}
              </p>
            );
            return (
              <Tooltip title={tooltipContent}>
                <span
                  style={{
                    maxWidth: 160,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                  }}
                >
                  {value === null || value === undefined || value === ""
                    ? "-"
                    : value}
                </span>
              </Tooltip>
            );
          },
        };
      }
      return {
        field: header.key,
        headerName: header.label,
        sortable: header.sortable,
        width: [ "paymentStatus"].includes(header.key)
          ? 150
          : ["seekerName", "fullName", "name", "travelUpdatedAt"].includes(
                header.key,
              )
            ? 230
            : [textConstant.BLESSED_DATE_KEY, textConstant.REGISTRATION_DATE_KEY, textConstant.CANCELLATION_DATE_KEY, textConstant.HOLD_DATE_KEY, textConstant.SWAP_DEMAND_DATE_KEY, textConstant.SWAP_REQUEST_DATE_KEY, textConstant.PENDING_DATE_KEY, textConstant.ALL_STATUS_DATE_KEY].includes(
                header.key,
              ) ? 180 
                : 130,
        cellClassName: (params: any) => 
          [textConstant.SEEKER_NAME].includes(header.key) && params.row.isDefaulter 
            ? styles.defaulterCell 
            : '',
        renderCell: (params: any) => {
          const value = params.row[header.key] ?? "-";
          // Only call isRowHighlighted if subPrograms data is loaded
          const highlightStyle =
            isSubProgramsLoaded && isRowHighlighted(params.row)
              ? { color: "#e28619" }
              : {};

          const stylesApply = [textConstant.SEEKER_NAME].includes(header.key) && params.row.isDefaulter ? styles.defaulterCell : '';
          const baseSpanStyle: React.CSSProperties = {
            maxWidth: 140,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "inline-block",
            verticalAlign: "middle",
            ...highlightStyle,
            ...stylesApply,
          };

          
          const baseSpanStyleDate: React.CSSProperties = {
            maxWidth: 200,
            display: "inline-block",
            verticalAlign: "middle",
            ...highlightStyle,
          };

          if (header.key === "travelUpdatedAt" || header.key === textConstant.BLESSED_DATE_KEY || header.key === textConstant.REGISTRATION_DATE_KEY || header.key === textConstant.CANCELLATION_DATE_KEY || header.key === textConstant.HOLD_DATE_KEY || header.key === textConstant.SWAP_DEMAND_DATE_KEY || header.key === textConstant.SWAP_REQUEST_DATE_KEY || header.key === textConstant.PENDING_DATE_KEY || header.key === textConstant.ALL_STATUS_DATE_KEY) {
            return (
              <span
                style={baseSpanStyleDate}
                title={typeof value === "string" ? formatDateString(value) : ""}
              >
                {value === null || value === undefined || value === ""
                  ? "-"
                  : formatDateString(value)}
              </span>
            );
          }

          if (header.key === "averageRating") {
            const avg = params.row.averageRating;
            const hasNoRating =
              avg === null ||
              avg === undefined ||
              avg === "" ||
              avg === 0 ||
              avg === "0.00";
            const hasComment =
              params.row.rmComments && params.row.rmComments !== "";

            // Tooltip content for RM comment
            const tooltipContent = (
              <p className={styles.reviewText}>
                {params.row.rmComments
                  ? params.row.rmComments
                      .split("\n")
                      .map((line: string, idx: number, arr: string[]) => (
                        <React.Fragment key={idx}>
                          {line}
                          {idx < arr.length - 1 && <br />}
                        </React.Fragment>
                      ))
                  : ""}
              </p>
            );

            return (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  ...highlightStyle,
                }}
              >
                {hasNoRating ? (
                  <>
                    <span
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "47px",
                        height: "28px",
                      }}
                    >
                      -
                    </span>
                  </>
                ) : (
                  <>
                    {hasComment ? (
                      <Tooltip title={tooltipContent}>
                        <span className={styles.ratingCell}>
                          <img src={starIcon} alt="star" />
                          <span>{avg}</span>
                        </span>
                      </Tooltip>
                    ) : (
                      <>
                        <img src={starIcon} alt="star" />
                        <span>{avg}</span>
                      </>
                    )}
                  </>
                )}
              </span>
            );
          }
          if (["seekerName", "fullName", "name"].includes(header.key)) {
            // Truncate name if longer than 22 chars
            // Not used: 27/01/2026
            // const displayName =
            //   typeof value === "string" && value.length > 22
            //     ? value.slice(0, 22) + "…"
            //     : value;
            return (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  ...highlightStyle,
                }}
                title={value}
              >
                <>
                  <div className={styles.imageContainer}>
                    <img
                      src={params.row.profileUrl || defaultProfileIcon}
                      alt={value}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginRight: 8,
                        background: "#f0f0f0",
                        border: "1px solid #eee",
                        cursor: "pointer",
                      }}
                      onClick={(e) => handleImageClick(e, params.row)}
                    />
                    <div
                      className={styles.hoverEyePreview}
                      onClick={(e) => handleImageClick(e, params.row)}
                    ></div>
                  </div>
                    <span 
                      title={value}
                      className={styles.seekerNameText}>
                                                       
                        {value}
                    </span>
                </>
              </span>
            );
          }

          // Default renderingf
          return (
            <span
              style={baseSpanStyle}
              title={typeof value === "string" ? value : ""}
            >
              {value === null || value === undefined || value === "" ? (
                <span
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "70px",
                    height: "28px",
                    ...highlightStyle,
                  }}
                >
                  -
                </span>
              ) : (
                value
              )}
            </span>
          );
        },
      };
    });

    // Add the Basic Details column
    cols.splice(1, 0, {
      field: "basicDetails",
      headerName: "Basic Details",
      sortable: false,
      width: 200,
      renderCell: (params: any) => {
        const highlightStyle =
          isSubProgramsLoaded && isRowHighlighted(params.row)
            ? { color: "#e28619" }
            : {};

        const age =
          params.row.age !== undefined && params.row.age !== null
            ? params.row.age
            : "-";
        const gender = params.row.gender
          ? params.row.gender.toLowerCase().startsWith("f")
            ? "F"
            : params.row.gender.toLowerCase().startsWith("m")
              ? "M"
              : params.row.gender.charAt(0).toUpperCase()
          : "-";
        const location = params.row.location || "-";
        return (
          <span
            style={{
              maxWidth: 200,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",

              display: "inline-block",
              verticalAlign: "middle",
              ...highlightStyle,
            }}
            title={`${age} | ${gender} | ${location}`}
          >
            {age}
            <span className={styles.basicDetailsSeparator}>|</span>
            {gender}
            <span className={styles.basicDetailsSeparator}>|</span>
            {location}
          </span>
        );
      },
    });

    cols.push({
      field: "menu",
      headerName: "",
      width: 80,
      pinned: "right",
      renderCell: (params: any) => (
        <div className={styles.menuColumnCell}>
          {/* <div
            className={styles.viewIconContainer}
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(params.row);
            }}
            title="View details"
          >
            <img
              src={ViewDetailsIcon}
              alt="View details"
              className={styles.viewIcon}
            />
          </div> */}
          <KebabMenu
            items={getOptions(
              params.row.id,
              params.row,
              handleAddReview,
              handleOpenSwap,
              handleCancelSwapRequest,
              handleSendInvoice,
              handleResendProforma
            )}
            menuContainerClassname={styles.menuTooltip}
          />
        </div>
      ),
    });

    return cols;
  };
// Event Handlers
const handleTabChange = (count: number, status: string, index: number) => {
  const kpiIndex = kpis.findIndex((item) => item.label === status);
  const kpi = kpis[kpiIndex];
  if (kpi) {
   dispatch(setCurrentPage({ page: 1, programId }));
    dispatch(setActiveTab({index, kpiValue : kpi.value}));
    dispatch(clearSearch()); 
    dispatch(resetPagination()) 
    dispatch(clearAllFilters());
    dispatch(clearSort());
  }
};

const handleRowClick = (row: any) => {
  if (row.id && row.programId) {
    // navigate(
    //   `/admin/action-cards/registered/seeker-details/${row.id}/${row.programId}`,
    // );
    setSelectedRow(row);
    setActiveOverlayType("quickView");
    // setFlippedUserId(row.id);
  }
};
const handleViewDetails = (row: any) => {
  if (row.id && row.programId) {
    navigate(
      `/admin/action-cards/registered/seeker-details/${row.id}/${row.programId}`,
    );
   
  }
};
const handleAddReview = async (row: any) => {
  const ratingsObj: { [key: string]: { rating: number; id?: number } } = {};
  if (Array.isArray(row.ratings)) {
    row.ratings.forEach((r: any) => {
      ratingsObj[r.ratingKey] = { rating: r.rating, id: r.id };
    });
  }
  setReviewInitialRatings(ratingsObj);
  setReviewInitialComments(row.rmComments || "");
  
  // Extract experiences from row data if available
  const rowExperiences = row.userProgramExperiences || row.experiences || [];
  setSeekerExperiences(rowExperiences);
  
  try {
    const res = await getCallWithLoader(`registration/${row.id}`, undefined, PORTAL, textConstant.LARGE );
    const recommendationsArr = res?.data?.data?.recommendation || [];
    let latestRecommendation = null;
    if (Array.isArray(recommendationsArr) && recommendationsArr.length > 0) {
      latestRecommendation = recommendationsArr.reduce((latest, curr) => {
        if (!latest) return curr;
        return curr.id > latest.id ? curr : latest;
      }, null);
    }
    setReviewInitialRecommendations(latestRecommendation);
    setPrevRating(res?.data?.data?.prevRating || {});
    
    // Extract experiences from registration response if available
    const apiExperiences = res?.data?.data?.userProgramExperiences || res?.data?.data?.experiences || [];
    if (apiExperiences.length > 0) {
      setSeekerExperiences(apiExperiences);
    }
  } catch {
    setReviewInitialRecommendations(null);
  }
  
  setSelectedRow(row);
  setActiveOverlayType("review");
};

const handleSaveReview = (result: { success: boolean; message?: string }) => {
  setActiveOverlayType(null);
  setSelectedRow(null);
  onRefresh();
};
const onRefresh = () => {
  fetchSeekersList();
};
const updateRowSwapStatus = (rowId: string | number, isActive: boolean) => {
  setData((prevData) =>
    prevData.map((item) =>
      item.id === rowId ? { ...item, isSwapRequestActive: isActive } : item,
    ),
  );
};
const handleOpenSwap = async (row: any) => {
  setSelectedRow(row);
  setActiveOverlayType("swap");
  try {
    const response = await getCall(`${endPoints.program}/${row.programId}`, undefined, PORTAL);
    const data = response?.data?.data;
    const registrationNearDate = data.groupedPrograms?.map((items: any) => ({
      id: items.id,
      name: items.name,
      startsAt: items.startsAt
    })) || [];
    
    const allocatedId = await fetchAllocatedProgramId(row.id);
    // const registrationNear = 
    let options: { value: number; label: string; disabled?: boolean ; isStartingSoon? : boolean }[] = [];

    if (data?.type?.isGroupedProgram) {
      options =
        data.groupedPrograms?.map((item: any) => ({
          value: Number(item.id),
          label: item.name,
          disabled: Number(item.id) === allocatedId,
          isSessionStartingSoon:
        (() => {
        const match = registrationNearDate.find(session => session.id === item.id);
        return match ? isSessionStartingSoon(match) : false;
      })()
        })) || [];
    } else {
      options =
        data.sessions?.map((item: any) => ({
          value: Number(item.id),
          label: item.name,
          disabled: Number(item.id) === allocatedId,
          isSessionStartingSoon:
      (() => {
        const match = registrationNearDate.find(session => session.id === item.id);
        return match ? isSessionStartingSoon(match) : false;
      })()
        })) || [];
    }
    setDynamicProgramOptions(options);
  } catch {
    setDynamicProgramOptions([]);
  }
};

const handleMarkAsDefaulter = (row: any) => {
  setSelectedRow(row);
  setActiveOverlayType(textConstant.DEFAULTER);
};

const handleCancelSwapRequest = (row: any) => {
    setConfirmPopup({
        open: true,
        message: CANCEL_SWAP.CONFIRM_MESSAGE(row.seekerName || ""),
        cancelSwap: true,
        onConfirm: async (reason?:string) => {
          setConfirmPopup({ ...confirmPopup, open: false });
          const payload = {
            action: CANCEL_SWAP.ACTIONS.CANCEL, // Changed from "delete" to "cancel"
            comment: reason || "Cancelled by RM",
          };
          try {
            // Fixed: Use correct property and parameter order
            const swapRequestId = row.activeSwapRequests?.[0]?.id || row.activeSwapRequest?.id;
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
                  message: CANCEL_SWAP.ERROR_MESSAGE,
                  type: CANCEL_SWAP.ERROR_TYPE
                }
              }
            );
            // Notification is handled by apiService
            if (response?.data?.statusCode === 200) {
              fetchSeekersList();
            }
          } catch (error) {
            console.error("Error cancelling swap request:", error);
            // Error notification is handled by apiService
          }
        }
      });
};

const handleSendInvoice = (seekerId: any) => {
  if (seekerId) {
    getCall(`invoice/sendto/${seekerId}`, undefined, PORTAL);
  }
};

const downloadInvoice = async (url: string, name: string | undefined) => {
  if (!url) return;
  try {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) throw new Error("Network response was not ok");
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = name ?? "invoice" + ".pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    alert(USER_ACTION_ERRORS.DOWNLOAD_INVOICE_FAILED);
  }
};

const handleRemoveFilter = (key: string, valueToRemove: string) => {
  dispatch(removeFilter({ key, valueToRemove }));
};

const handleClearAllFilters = () => {
  dispatch(clearAllFilters());
  dispatch(resetPagination())
  dispatch(setCurrentPage({ page: 1, programId })); 
  setShowFilterOverlay(false);
};

useEffect(() => {
  const params = new URLSearchParams(location.search);
  const parentFilterParam = params.get("parentFilter");
  const selectedKpiFilterParam = params.get("selectedKpiFilter");


  if (parentFilterParam) {
    const parsedFilter = JSON.parse(parentFilterParam);
    dispatch(setSelectedKpiOption(parsedFilter));
  }
  if (selectedKpiFilterParam) {
    const parsedKpiFilter = JSON.parse(selectedKpiFilterParam);
    dispatch(setSelectedKpiTab(parsedKpiFilter));
  }
}, [location.search]);

const fetchSeekersList = async (
  filtersTabObj?: any,
  viewValue?: string
) => {
  if (fetchControllerRef.current) {
    fetchControllerRef.current.abort();
  }

 
  fetchControllerRef.current = new AbortController();
  
  const requestId = ++latestRequestIdRef.current;

  // Set loading state
  if (initalLoadingRef.current) {
    setLoading(true);
    initalLoadingRef.current = false;
  } else {
    setIsintialLoading(true);
  }
  try {
    let url = `${endPoints.registeredSeekerList}?limit=${pageSize}&offset=${(currentPage - 1) * pageSize}`;

    if (programIdNumber) url += `&programId=${programIdNumber}`;

    if (selectedKpiOption?.value) {
      url += `&parentFilter=${selectedKpiOption.value}`;
    } else {
      setLoading(false);
      setIsintialLoading(false);
      return;
    }
    if (sortState.sortKey) {
  url += `&sortKey=${sortState.sortKey}&sortOrder=${sortState.sortOrder}`;
}
    
    const viewParam = viewValue || selectViewList?.value || 'registrations';
    url += `&view=${viewParam}`;

    const filtersObj: any = filtersTabObj ?? {};
    if (!filtersTabObj) {
      if (sessionId && !hasSyncedTab) {
        if (sessionId === "hold") {
          filtersObj.kpiCategory = "registrations";
          filtersObj.kpiFilter = "rejected";
        } else if (["waitlisted", "yet-to-decide"].includes(sessionId)) {
          filtersObj.kpiCategory = "registrations";
          filtersObj.kpiFilter = "onHold";
        } else if (!isNaN(Number(sessionId))) {
          filtersObj.kpiCategory = "programs";
          filtersObj.kpiFilter = `program_${sessionId}`;
        }
      } else if (selectedKpiFilter) {
        filtersObj.kpiCategory = selectedKpiFilter.kpiCategory;
        filtersObj.kpiFilter = selectedKpiFilter.kpiFilter;
      } else if (selectedKpiTab) {
        filtersObj.kpiCategory = selectedKpiTab?.kpiCategory;
        filtersObj.kpiFilter = selectedKpiTab?.kpiFilter;
      }
    }

    const transformedFilters = transformFilters(appliedFilters);
    Object.assign(filtersObj, transformedFilters);

    setBulkEmailUrl({
      programId: programIdNumber,
      parentFilter: selectedKpiOption?.value,
      filters: { 
        kpiCategory: selectedKpiTab?.kpiCategory, 
        kpiFilter: selectedKpiTab?.kpiFilter,
        ...transformedFilters
      },
    });

    if (Object.keys(filtersObj).length > 0) {
      url += `&filters=${encodeURIComponent(JSON.stringify(filtersObj))}`;
    }
    
    if (searchValue.value.trim()) {
      url += `&searchText=${encodeURIComponent(searchValue.value.trim())}`;
    }

    const res = await getCall(url, undefined, PORTAL, {
      signal: fetchControllerRef.current.signal
    });

    if (requestId !== latestRequestIdRef.current) {
      return;
    }

    const rawData = res?.data?.data?.data || [];
    const tableHeaders = res?.data?.data?.tableHeaders || [];
    const pagination = res?.data?.data?.pagination || {};
    const kpis = res?.data?.data?.kpis || [];
    const quickViewData = res?.data?.data?.quickViewHeaders || [];
    const viewList = res?.data?.data?.viewList;
    
    setViewList(viewList);
    
    const transformSessionData = (res) => {
      return res.map(item => ({
        id: item.subProgramId,
        name: item.label,
        totalSeekers: item.totalSeatsCount,
        allocatedCount: item.count,
        organisationUserCount: item.organisationUserCount,
        startsAt : item.startsAt,
        blessEndsAt : item.blessEndsAt,
        canRegisterTill : item.canRegisterTill
      }));
    };

    setSessionData(isGroupedProgram ? transformSessionData(res?.data?.data?.statusCountsData || []) : []);

    setData(rawData);
    setColumns(buildDynamicColumns(tableHeaders));
    setTotalData(pagination.totalRecords || 0);
    setKpis(kpis);
    setQuickView(quickViewData);

    let kpiIndex = kpis.findIndex(
      (k: any) => k.label === selectedKpiTab?.label ||
        k.kpiFilter === selectedKpiTab?.kpiFilter,
    );
    
    if (kpiIndex === -1) {
      kpiIndex = 0;
    }
    
    dispatch(setSelectedKpiTab(kpis[kpiIndex]));

    if (kpiIndex !== -1 && activeTab !== kpiIndex) {
      dispatch(setActiveTab({ 
        index: kpiIndex, 
        kpiValue: kpis[kpiIndex]?.value 
      }));
    }

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Request aborted');
      return;
    }
    
    console.error("Error fetching seekers list:", error);
    
    // Only update state if this is the latest request
    if (requestId === latestRequestIdRef.current) {
      setData([]);
      setColumns([]);
      setTotalData(0);
      setKpis([]);
    }
  } finally {
    if (requestId === latestRequestIdRef.current) {
      setLoading(false);
      setIsintialLoading(false);
    }
  }
};

  // Add handler for sort changes
 const handleSort = (newSortState: SortState) => {
  dispatch(setSortState(newSortState));
  // Trigger refetch with new sort params - this will happen via useEffect
};

// 2. Add a useEffect to sync tab from filters ONLY ONCE after kpis are loaded
// useEffect(() => {
//   if (
//     !hasSyncedTab &&
//     filters &&
//     filters.kpiCategory &&
//     filters.kpiFilter 
//   ) {

//       setSelectedKpiFilter({
//         kpiCategory: kpis[tabIndex].kpiCategory,
//         kpiFilter: kpis[tabIndex].kpiFilter,
//       });

//     }

// }, [filters, hasSyncedTab]);

// Initial fetch when component mounts and subPrograms are loaded
useEffect(() => {
  if (isSubProgramsLoaded && !hasInitialFetchTriggered.current) {
    hasInitialFetchTriggered.current = true;
    setFetchTrigger({
      timestamp: Date.now(),
      changes: { kpiOption: true, view: true } // Mark as initial load
    });
  }
}, [isSubProgramsLoaded]);

// Change detection useEffect - triggers whenever any dependency changes
useEffect(() => {
  if (!isSubProgramsLoaded) {
    return;
  }

  const changes: any = {};
  let hasChanges = false;

  // Check what changed
  if (prevSelectedKpiOptionRef.current?.value !== selectedKpiOption?.value) {
    changes.kpiOption = true;
    hasChanges = true;
    prevSelectedKpiOptionRef.current = selectedKpiOption;
  }

  if (prevSelectViewListRef.current?.value !== selectViewList?.value) {
    changes.view = true;
    hasChanges = true;
    prevSelectViewListRef.current = selectViewList;
  }

  if (prevActiveTabRef.current !== activeTab) {
    changes.tab = true;
    hasChanges = true;
    prevActiveTabRef.current = activeTab;
  }

  if (JSON.stringify(prevAppliedFiltersRef.current) !== JSON.stringify(appliedFilters)) {
    changes.filters = true;
    hasChanges = true;
    prevAppliedFiltersRef.current = appliedFilters;
  }

  if (prevSearchQueryRef.current !== searchQuery) {
    changes.search = true;
    hasChanges = true;
    prevSearchQueryRef.current = searchQuery;
  }

  if (JSON.stringify(prevSortStateRef.current) !== JSON.stringify(sortState)) {
    changes.sort = true;
    hasChanges = true;
    prevSortStateRef.current = sortState;
  }

  // Pagination changes (currentPage, pageSize)
  const paginationChanged = 
    prevCurrentPageRef.current !== currentPage || 
    prevPageSizeRef.current !== pageSize;

  if (paginationChanged) {

    if (changes.kpiOption || changes.view || changes.tab || changes.filters || changes.search) {
      changes.pagination = false; // Other changes will handle the fetch
    } else {
      changes.pagination = true;
      hasChanges = true;
    }
    
    // Update refs after detecting change
    prevCurrentPageRef.current = currentPage;
    prevPageSizeRef.current = pageSize;
  }

  // Only trigger if something changed
  if (hasChanges) {
    setFetchTrigger({
      timestamp: Date.now(),
      changes
    });
  } else {
  }
}, [
  currentPage,
  pageSize,
  searchQuery,
  selectViewList,
  appliedFilters,
  selectedKpiOption,
  isSubProgramsLoaded,
  sortState,
  activeTab,
]);

// Actual fetch useEffect - only depends on fetchTrigger
useEffect(() => {
  if (!isSubProgramsLoaded) {
    return;
  }
  
  if (Object.keys(fetchTrigger.changes).length === 0) {
    return;
  }

  fetchSeekersList(
    undefined,
    selectViewList?.value || 'registrations'
  );
}, [fetchTrigger, isSubProgramsLoaded]);


useEffect(() => {
  if (!sessionId || kpis.length === 0 || hasSyncedTab) return;

  let kpiIndex = -1;

  if (sessionId === "hold") {
    kpiIndex = kpis.findIndex((k: any) => k.kpiFilter === "rejected");
  } else if (["waitlisted", "yet-to-decide"].includes(sessionId)) {
    kpiIndex = kpis.findIndex((k: any) => k.kpiFilter === "onHold");
  } else if (!isNaN(Number(sessionId))) {
    kpiIndex = kpis.findIndex(
      (k: any) => k.kpiFilter === `program_${sessionId}`,
    );
  }

  if (
    kpiIndex !== -1 &&
    (activeTab !== kpiIndex ||
      !selectedKpiFilter ||
      selectedKpiFilter.kpiFilter !== kpis[kpiIndex].kpiFilter)
  ) {
  dispatch(setActiveTab({ index: kpiIndex, kpiValue: kpis[kpiIndex]?.value }));
    // setSelectedKpiFilter({
    //   kpiCategory: kpis[kpiIndex].kpiCategory,
    //   kpiFilter: kpis[kpiIndex].kpiFilter,
    // });
    setHasSyncedTab(true);
  }
}, [sessionId, kpis]);

// When user manually changes tab, allow auto-sync again if sessionId changes
useEffect(() => {
  setHasSyncedTab(false);
}, [sessionId]);

  // Render logic
  const popup = showFilterOverlay && (
    <Suspense fallback={null}>
      <AdminFilterOverlay
        displayFilters={dashboardFilters}
        open={showFilterOverlay}
        onClose={() => setShowFilterOverlay(false)}
        onApply={(filters) => {
          const cleanedFilters = Object.fromEntries(
            Object.entries(filters).filter(([key, value]) => {
              // Handle arrays (including location values)
              if (Array.isArray(value?.value)) {
                return value.value.length > 0;
              }
              // Handle string values
              if (typeof value === "string") {
                return value.trim() !== "";
              }
              // Handle objects (like location with label and value)
              if (typeof value === "object" && value !== null) {
                // Special handling for location
                if (key === 'location' && Array.isArray(value.value)) {
                  return value.value.length > 0;
                }
                return true;
              }
              return true;
            })
          );
           dispatch(setAppliedFilters(cleanedFilters)); // NEW
          setShowFilterOverlay(false);
          dispatch(setCurrentPage({ page: 1, programId })); 
        }}
        initialFilters={appliedFilters}
      />
    </Suspense>
  );

const handleDownload = async (
  reportName: string,
  selectedReport?: string,
) => {
  setShowExportPopup(false);
  try {
    // setLoading(true);
    let url = `${endPoints.registeredSeekerList}?limit=${pageSize}&offset=${(currentPage - 1) * pageSize}`;
    if (programIdNumber) url += `&programId=${programIdNumber}`;
    if (selectedKpiOption?.value) {
      url += `&parentFilter=${selectedKpiOption.value}`;
    }
    url += `&downloadType=${selectedReport}`;

    const filtersObj = {};
    if (selectedOption === "filtered") {
    
      
      if (sessionId && !hasSyncedTab) {
        if (sessionId === "hold") {
          filtersObj.kpiCategory = "registrations";
          filtersObj.kpiFilter = "rejected";
        } else if (["waitlisted", "yet-to-decide"].includes(sessionId)) {
          filtersObj.kpiCategory = "registrations";
          filtersObj.kpiFilter = "onHold";
        } else if (!isNaN(Number(sessionId))) {
          filtersObj.kpiCategory = "programs";
          filtersObj.kpiFilter = `program_${sessionId}`;
         
        }
      } else if (selectedKpiFilter) {
        filtersObj.kpiCategory = selectedKpiFilter.kpiCategory;
        filtersObj.kpiFilter = selectedKpiFilter.kpiFilter;
      } else if (selectedKpiTab) {
        filtersObj.kpiCategory = selectedKpiTab?.kpiCategory;
        filtersObj.kpiFilter = selectedKpiTab?.kpiFilter;
      }
      const transformedFilters = transformFilters(appliedFilters);

      // Merge with filtersObj
      Object.assign(filtersObj, transformedFilters);
    }

    url += `&filters=${encodeURIComponent(JSON.stringify(filtersObj))}`;

    const response = await getCall(url, undefined, PORTAL);
    const statusCode = response?.data?.statusCode;
    const message = response?.data?.message;
    const downloadUrl = response?.data?.data?.downloadUrl;

     if (statusCode >= 400 && statusCode < 500) {
            setAlert({
              message: message || DOWNLOAD_ERRORS.GENERIC ,
              open: true,
            });
            return;
          }
          if (statusCode >= 500) {
            setAlert({
              message: DOWNLOAD_ERRORS.GENERIC,
              open: true,
            });
            return;
          }

   
    await downloadExcelFromApi({
      url: downloadUrl,
      filePrefix: reportName,
    });
  } catch (error: any) {
    setAlert({
      message:
        DOWNLOAD_ERRORS.GENERIC,
      open: true,
    });
    console.error("Error downloading file:", error);
  }
};

// Bulk ID Proofs Export handlers
const handleBulkIdProofsDownload = async (option: any, folderName: string) => {
  try {
    const { programId, allocatedProgramId, value } = option;

    // Initiate the export
    const initiateResponse = await initiateIdProofExport(
      programId,
      allocatedProgramId,
      value,
      folderName
    );
    
    if (initiateResponse.statusCode !== 200) {
      throw new Error(initiateResponse.message || "Failed to initiate export");
    }

    const jobId = initiateResponse.data.jobId;

    // Store job info in localStorage for refresh handling
    const jobInfo = {
      jobId,
      programId,
      allocatedProgramId,
      value,
      folderName,
      startTime: Date.now(),
    };
    localStorage.setItem(ID_PROOF_EXPORT.LOCALSTORAGE_KEY, JSON.stringify(jobInfo));

    // Show progress notification
    notify(ID_PROOF_EXPORT_MESSAGES.TITLE, ID_PROOF_EXPORT_MESSAGES.INITIATED, WARNING);

    // Track which milestones have been notified
    let lastNotifiedMilestone = 0;

    // Start polling for status
    const finalResponse = await pollIdProofExportStatus(
      jobId,
      (progress, status) => {
        // Skip notifications if status is completed(success notification will be shown instead)
        if (status === ID_PROOF_EXPORT.STATUS.COMPLETED) return;
        
        // Show notify at progress milestones - notify only the next unnotified milestone
        for (const milestone of ID_PROOF_EXPORT.PROGRESS_MILESTONES) {
          if (progress >= milestone && lastNotifiedMilestone < milestone) {
            notify(ID_PROOF_EXPORT_MESSAGES.TITLE, `${ID_PROOF_EXPORT_MESSAGES.IN_PROGRESS} ${progress}% ${ID_PROOF_EXPORT_MESSAGES.COMPLETE}`, WARNING);
            lastNotifiedMilestone = milestone;
            break; // Only notify one milestone per progress update
          }
        }
      },
      ID_PROOF_EXPORT.POLLING_INTERVAL,
      ID_PROOF_EXPORT.MAX_POLLING_TIME
    );

    // Download completed
    if (finalResponse.data.signedUrl) {
      downloadFromSignedUrl(finalResponse.data.signedUrl, `${folderName}.zip`);
      notify("Success", ID_PROOF_EXPORT_MESSAGES.SUCCESS, SUCCESS);
      // Clear job info after successful completion
      localStorage.removeItem(ID_PROOF_EXPORT.LOCALSTORAGE_KEY);
    }

  } catch (error: any) {
    // Log the error object for debugging
    console.error("Error during bulk ID proofs export (full error):", error);
    let errorMsg = ID_PROOF_EXPORT_MESSAGES.FAILED_MESSAGE;
    if (error) {
      if (typeof error === 'string') {
        errorMsg = error;
      } else if (error.message) {
        errorMsg = error.message;
      } else if (error?.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMsg = error.response.data.message.join(', ');
        } else if (typeof error.response.data.message === 'string') {
          errorMsg = error.response.data.message;
        }
      }
    }
    console.error('Extracted error message:', errorMsg);
    if (errorMsg === REPORTS.NO_RECORDS_TO_DOWNLOAD || errorMsg === "No records available to download.") {
      notify("ID Proofs", REPORTS.NO_RECORDS_TO_DOWNLOAD, WARNING);
    } else {
      notify(
        ID_PROOF_EXPORT_MESSAGES.FAILED,
        errorMsg,
        ERROR
      );
    }
    // Clear job info on error
    localStorage.removeItem(ID_PROOF_EXPORT.LOCALSTORAGE_KEY);
  }
};

// Resume export job on page refresh
useEffect(() => {
  const resumeExportJob = async () => {
    const jobInfoStr = localStorage.getItem(ID_PROOF_EXPORT.LOCALSTORAGE_KEY);
    if (!jobInfoStr) return;

    try {
      const jobInfo = JSON.parse(jobInfoStr);
      const { jobId, folderName, startTime } = jobInfo;
      
      // Check if job is too old
      const elapsed = Date.now() - startTime;
      if (elapsed > ID_PROOF_EXPORT.MAX_POLLING_TIME) {
        localStorage.removeItem(ID_PROOF_EXPORT.LOCALSTORAGE_KEY);
        return;
      }

      notify(ID_PROOF_EXPORT_MESSAGES.TITLE, ID_PROOF_EXPORT_MESSAGES.RESUMING, WARNING);

      // Check current status
      const statusResponse = await checkIdProofExportStatus(jobId);
      
      if (statusResponse.data.status === ID_PROOF_EXPORT.STATUS.COMPLETED && statusResponse.data.signedUrl) {
        downloadFromSignedUrl(statusResponse.data.signedUrl, `${folderName}.zip`);
        notify("Success", ID_PROOF_EXPORT_MESSAGES.SUCCESS, SUCCESS);
        localStorage.removeItem(ID_PROOF_EXPORT.LOCALSTORAGE_KEY);
        return;
      }

      if (statusResponse.data.status === ID_PROOF_EXPORT.STATUS.FAILED) {
        notify(ID_PROOF_EXPORT_MESSAGES.FAILED, ID_PROOF_EXPORT_MESSAGES.FAILED_MESSAGE, ERROR);
        localStorage.removeItem(ID_PROOF_EXPORT.LOCALSTORAGE_KEY);
        return;
      }

      // Resume polling
      // Track which milestones have been notified
      const currentProgress = statusResponse.data.progress || 0;
      const milestoneSize = ID_PROOF_EXPORT.PROGRESS_MILESTONES[0]; // 25
      let lastNotifiedMilestone = Math.floor(currentProgress / milestoneSize) * milestoneSize;
      
      const finalResponse = await pollIdProofExportStatus(
        jobId,
        (progress, status) => {
          // Skip notifications if status is completed(success notification will be shown instead)
          if (status === ID_PROOF_EXPORT.STATUS.COMPLETED) return;
          
          // Show notify at progress milestones - notify only the next unnotified milestone
          for (const milestone of ID_PROOF_EXPORT.PROGRESS_MILESTONES) {
            if (progress >= milestone && lastNotifiedMilestone < milestone) {
              notify(ID_PROOF_EXPORT_MESSAGES.TITLE, `${ID_PROOF_EXPORT_MESSAGES.IN_PROGRESS} ${progress}% ${ID_PROOF_EXPORT_MESSAGES.COMPLETE}`, WARNING);
              lastNotifiedMilestone = milestone;
              break; // Only notify one milestone per progress update
            }
          }
        },
        ID_PROOF_EXPORT.POLLING_INTERVAL,
        ID_PROOF_EXPORT.MAX_POLLING_TIME - elapsed // Remaining time
      );

      if (finalResponse.data.signedUrl) {
        downloadFromSignedUrl(finalResponse.data.signedUrl, `${folderName}.zip`);
        notify("Success", ID_PROOF_EXPORT_MESSAGES.SUCCESS, SUCCESS);
      }
      localStorage.removeItem(ID_PROOF_EXPORT.LOCALSTORAGE_KEY);
    } catch (error) {
      console.error("Error resuming export job:", error);
      localStorage.removeItem(ID_PROOF_EXPORT.LOCALSTORAGE_KEY);
    }
  };

  resumeExportJob();
}, []);

const exportPopup = showExportPopup && (
  <DownloadPopup
    open={showExportPopup}
    onClose={() => setShowExportPopup(false)}
    selected={selectedOption}
    setSelected={setSelectedOption}
    onDownload={handleDownload}
  />
);

const transformedStatsData = kpis.map((item: any) => ({
  status: item.label,
  count: typeof item.value === "number" ? item.value : 0,
}));

const handleBless = async (
  user: UserData,
  sessionId: number,
  sessionType: string,
) => {
  const seekerDetails = getItemInLocalStorage("seekerDetails");
  let payload = {
    allocatedProgramId: sessionId,
    registrationId: Number(user.registrationId),
    approvalStatus: "approved",
    approvalDate: new Date().toISOString(),
    approvedBy: seekerDetails.id,
    updatedBy: seekerDetails.id,
  };

  if (sessionType === "hold" || sessionType === "Hold") {
    payload = {
      registrationId: Number(user.registrationId),
      approvalStatus: "rejected",
      rejectionReason: "",
      updatedBy: seekerDetails.id,
    };
  } else if (sessionType === "yet-to-decide" || sessionType === ApprovalStatus.YTD) {
    payload = {
      registrationId: Number(user.registrationId),
      approvalStatus: "on_hold",
      rejectionReason: "",
      updatedBy: seekerDetails.id,
    };
  }

  try {
    const response = await ApiService.blessUser(
      Number(user.registrationId),
      payload,
    );
    if (response.data.statusCode === 200) {
      setShowBlessCard(false);
      fetchSeekersList();
    } else {
      alert(response.data.message || "Failed to bless user");
    }
  } catch (error) {
    console.error("Error blessing user:", error);
    alert("Failed to bless user. Please try again.");
  }
};

const handleBlessed = async (
  seekerId: number,
  targetProgramId: number,
  swapType: string,
  swapRequestId?: number,
) => {
  try {
    let payload;
    let response;

    if (swapRequestId) {
      // Handle existing swap request
      payload = {
        status:
          targetProgramId === "hold"
            ? "rejected"
            : targetProgramId === "yet-to-decide"
              ? "on_hold"
              : "approved",
        // comment: "",
        movingSeekerRegistrationId: Number(seekerId),
        ...(swapType === "move" &&
          targetProgramId !== "hold" &&
          targetProgramId !== "yet-to-decide" && {
          movingToSubProgramId: targetProgramId,
        }),
        swappingType: swapType,
      };
      response = await ApiService.updateSwapRequest(swapRequestId, payload);
    } else {
      // Handle normal blessing
      payload = {
        allocatedProgramId:
          targetProgramId === "hold" || targetProgramId === "yet-to-decide"
            ? null
            : targetProgramId,
        registrationId: Number(seekerId),
        approvalStatus:
          targetProgramId === "hold"
            ? "rejected"
            : targetProgramId === "yet-to-decide"
              ? "on_hold"
              : "approved",
        approvalDate: new Date().toISOString(),
        approvedBy: getItemInLocalStorage("seekerDetails")?.id,
        updatedBy: getItemInLocalStorage("seekerDetails")?.id,
      };
      response = await ApiService.blessUser(seekerId, payload);
    }

    if (response.data.statusCode === 200) {
      setShowBlessCard(false);
      fetchSeekersList();
    } else {
      alert(response.data.message || "Failed to process request");
    }
  } catch (error) {
    console.error("Error in handleBlessed:", error);
    alert("Failed to process request. Please try again.");
  }
};
const sendBulkEmail = showBulkEmailPopup && (
  <BulkEmailsPopUp
      open={showBulkEmailPopup}
      headers={columns}
      loading={loading}
      onClose={() => setShowBulkEmailPopup(false)}
      bulkEmailUrlData={bulkEmailUrl}
      programKey={programTypeKey}
      kpiFilter={
        kpis.find((item) => item.value === selectedKpiTab?.value)
          ?.communicationCategory || "hdb_all"
      }
    />
  );


return (
  <div className={styles.container}>
    {loading ? (
      <Loader type="large" />
    ) : (
      <div className={styles.dataGridContainer}>
        <AdminKpiData
          className={styles.adminKpiData}
          handleTabChange={handleTabChange}
          // activeTab={activeTab}
          tabsData={transformedStatsData}
          role="admin"
          // setActiveTab={setActiveTab}
          kpis={kpis}
        />

        <DashboardHeader
          title={kpis[activeTab]?.label || ""}
          enableFilter={true}
          appliedFilters={appliedFilters}
          viewList = {viewList}
          activeTab={activeTab}
          enableExport={true}
          onExport={() => setShowExportPopup(true)}
          onSearchValueChange={(value: string) => {
            dispatch(setSearchValue(value));
          }}
          onSearch={(val) => {
            dispatch(setSearchQuery(val));
            dispatch(setCurrentPage({ page: 1, programId }));
          }}
          onFilterClick={() => setShowFilterOverlay(true)}
          filterPills={
            <FilterPills
              appliedFilters={appliedFilters}
              totalData={totalData}
              handleRemoveFilter={handleRemoveFilter}
              handleClearAllFilters={handleClearAllFilters}
              onMoreClick={() => setShowFilterOverlay(true)}
              isSearchOpen={searchValue.open}
              totalDataLength={totalData}
            />
          }
          communicationCategory={kpis[activeTab]?.communicationCategory}
          onEmailClick={() => {
            if (totalData === 0) {
              notify("Bulk Email", BULKEMAIL.toastMessage.NO_REGISTRATION, "warning");
              return;
            }
            setShowBulkEmailPopup(showBulkEmailPopup ? false : true);
          }}         
          totalDataLength={totalData}
          setSelectedOption={setSelectedOption}
          selectedOptions={selectedOption}
          handleDownload={handleDownload}
          idProofDataAvailable={((filterResponse as any)?.data?.bulkDownloadIdProofs || []).length > 0}
          onBulkIdProofs={() => {
            // Check if data is available before opening modal
            const idProofOptions = filterResponse?.data?.bulkDownloadIdProofs;
            if (idProofOptions && idProofOptions.length > 0) {
              setShowBulkIdProofsModal(true);
            } else {
              notify("ID Proofs", REPORTS.NO_RECORDS_TO_DOWNLOAD, WARNING);
            }
          }}
        />
        {sendBulkEmail}
        {exportPopup}
        {popup}
        
        {/* Bulk ID Proofs Modal - Using DownloadReport with id-proof mode */}
        {showBulkIdProofsModal && (
          <DownloadReport
            open={showBulkIdProofsModal}
            onClose={() => setShowBulkIdProofsModal(false)}
            mode="id-proof"
            valueSelected="filtered"
            totalRecords={totalData}
            onIdProofDownload={handleBulkIdProofsDownload}
          />
        )}
        
        <DataGridWithPagination
          headers={columns}
          seekersData={data.map((items) => ({
            ...items,
            seekerName: colorizeMahatriaInfinitheism(items.seekerName),
            __highlight: isRowHighlighted(items),
          }))}
          totalData={totalData}
          pageSize={pageSize}
          setPageSize={handleSetPageSize}
          currentPage={currentPage}
          setCurrentPage={handleSetCurrentPage}
          loading={isIntialLoading}
          onRowClick={handleRowClick}
          isheight={true}
          rowHeight={60}
          slots={{
            noRowsOverlay: () => <div>{noData}</div>,
          }}
          onSortChange={handleSort}
          isSort = {true}
        />
        {activeOverlayType === "review" && (
          <ReviewOverlay
            open={true}
            onClose={() => setActiveOverlayType(null)}
            onSave={() => handleSaveReview}
            seekerId={selectedRow?.id}
            programId={programIdNumber}
            initialRatings={reviewInitialRatings}
            initialComments={reviewInitialComments}
            prevRating={prevRating}
            seekersData={selectedRow}
            disablePreferences={true}
            onRefresh={onRefresh}
            initialRecommendations={reviewInitialRecommendations}
            initialSeekerExperiences={seekerExperiences}
          />
        )}
        {activeOverlayType === "swap" && (
          <SwapFilterOverlay
            open={true}
            swapTypeOptions={swapTypeOptions}
            programOptions={dynamicProgramOptions}
            seekerId={selectedRow?.id ? Number(selectedRow?.id) : undefined}
            initialData={selectedRow?.activeSwapRequests?.length > 0 ? {
              "id":selectedRow?.activeSwapRequests[0]?.id,
              "swapType": selectedRow?.activeSwapRequests[0]?.type,
              "selectedPrograms": selectedRow?.activeSwapRequests[0]?.requestedPrograms.map(program=>program.id),
              "reason": selectedRow?.activeSwapRequests[0]?.comment,
            }:{}}
            onUpdate={() => {
              setActiveOverlayType(null);
              onRefresh();
              updateRowSwapStatus(selectedRow?.id, true);
            }}
            onCancel={() => setActiveOverlayType(null)}
            isLoading={loading}
            seekerData={selectedRow}
          />
        )}
        {activeOverlayType === "quickView" && (
          <QuickViewOverlay
            open={true}
            onClose={() => setActiveOverlayType(null)}
            quickViewData={quickView}
            seekersData={selectedRow}
          />
        )}
        {activeOverlayType === "seekerTag" && (
          <SeekerTags
            open={true}
            onClose={() => setActiveOverlayType(null)}
            onSave={(tags) => {
              setActiveOverlayType(null);
            }}
            onRefresh={onRefresh}
            initialTags={selectedRow?.userProgramExperiences || []}
            seekerData={selectedRow}
          />
        )}
        {activeOverlayType === textConstant.DEFAULTER && (
          <DefaulterOverlay
            open={true}
            onCancel={() => setActiveOverlayType(null)}
            onUpdate={() => {
              setActiveOverlayType(null);
              onRefresh();
            }}
            seekerData={selectedRow}
            isLoading={loading}
            isUpdateMode={selectedRow?.isDefaulter !== null}
          />
        )}
        {showBlessCard && (
          <UserCardOverlay
            user={transformSeekerResponse(selectedRow)} // Transform the selected row data
            getInitials={(name: string) =>
              name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            }
            sessionId={programId}
            handleBless={handleBless}
            handleBlessed={handleBlessed}
            isFlipped={flippedUserId === selectedRow?.id}
            onFlip={() => setFlippedUserId(selectedRow?.id)}
            onCloseFlip={() => {
              setShowBlessCard(false);
              setFlippedUserId(null);
            }}
            programsList={dynamicProgramOptions}
            allocatedProgramId={selectedRow?.allocatedProgramId}
            highlightAllocated={false}
            handleShowAllMatches={(name) => {}} // Add if needed
            setShowOverlay={setShowBlessCard}
            fetchApprovedUsersForSession={fetchSeekersList}
            setIsCardClicked={() => {}}
            selectedSwapSeeker={null}
            setExcludedUserId={() => {}}
            setSelectedSwapSeeker={() => {}}
            setCustomTitle={() => {}}
            sessions={sessionData}
            selectedFilter={{}}
            isOverlay={true}
            setShowBlessCard={setShowBlessCard}
            onBlessSuccess={() => {
              setShowBlessCard(false);
              fetchSeekersList();
            }}
          />
        )}
        {showCancelOverlay && selectedRow && (
          <CancelRegistrationOverlay
            onClose={(flag: boolean) => {
              if (flag) {
                fetchSeekersList();
              }
              setShowCancelOverlay(false);
              setSelectedRow(null);
              dispatch(decrementLoader(textConstant.LARGE));
            }}
            seekersData={selectedRow}
          />
        )}
      </div>
    )}

    <ImagePreview
      imageUrl={previewImageUrl?.image}
      altText={previewImageUrl?.altText || "Profile Image"}
      setOpen={setOpen}
      isOpen={open}
      width={600}
      height={400}
    />
    {alert.open && (
      <AlertPopup
        message={alert.message}
        confirmText="ok"
        onConfirm={() => setAlert({ ...alert, open: false })}
        type="warning"
      />
    )}
    {confirmPopup.open && (
      <AlertPopup
        message={confirmPopup.message}
        confirmText="yes"
        cancelText="no"
        cancelSwap={confirmPopup?.cancelSwap || false}
        onConfirm={confirmPopup.onConfirm}
        onCancel={() => setConfirmPopup({ ...confirmPopup, open: false })}
        type="warning"
      />
    )}
  </div>
);
};

export default HdbSeekersListAdmin;
