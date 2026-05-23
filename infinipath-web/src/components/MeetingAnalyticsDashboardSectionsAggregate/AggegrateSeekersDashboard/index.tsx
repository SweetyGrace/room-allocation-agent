import React, { useEffect, useState } from "react";
import defaultUser from "../../../assets/images/default-profile.svg";
import styles from "./index.module.scss";
import SeekerBreadCrumHeader from "../../SeekerBreadCrumHeader";
import FilterModal, {
  Filters,
} from "../../../common/components/FilterComponent";
import Loader from "../../../common/components/Loader";
import TableWithPaginationComponent from "../../../common/components/TableComponentWithPagination";
import { Avatar, TableCell, TableRow, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCall } from "../../../services/apiService";
import {
  ageMapping,
  calculateOffset,
  convertToSeconds,
  FetchAggregateWebinarList,
  // FetchWebinarList,
  formatDurationTime,
  getFormattedDate,
  modifyProfileUrl,
  reverseAgeMapping,
} from "../../../utils/commonFunctions";
import { RootState } from "../../../store";
import { endPoints, INFINIPATH } from "../../../constants/urlConstants";
import { setKpiType } from "../../../reducers/AnalyticsReducer";
import {
  AGGREGATE_KPI_TEXT,
  attendanceMapping,
  FILTER_LABELS,
  KPI_FILTERS,
  LOCATIONS,
  NO_DATA,
  NO_FILTERED_DATA,
} from "../../../constants";
import DataGridWithPagination from "../../../common/components/DataGridWithPagination";
import { getSessionCompletedHeaders } from "../../../common/components/SessionsCompletedHeaders";
import { CompletedMeetingData } from "../../TrackRegistrations";
import SessionsModal from "../../../common/components/SessionsModal";
import noDataFound from "../../../assets/images/aggregated-empty.svg";
import noFilteredData from "../../../assets/images/no-filtered-data.svg";
// Define seeker interface
export interface Seeker {
  userId: number;
  fullName: string;
  gender: string;
  age: number;
  email: string;
  mobileNumber: string;
  address: string;
  registrationCount: number;
  webinarsAttended: number;
  profileUrl: string;
  otherAddress: string;
  totalDuration: string;
  formattedDuration: string;
  rejoinCount: number;
  verificationCount: number;
  dropOffCount: number;
  absenteesCount: number;
  faceVerificationTrueCount: number;
  faceVerificationFalseCount: number;
  lateComersCount: number;
  joinWithOthersCount: number;
  webinarDate: string;
  videoRegistrationCount: number;
  nonVideoRegistrationCount: number;
  joinAlone: number;
  throughAppCount: number;
  directLinksCount: number;
}

const AggegrateSeekersDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dataToShow, setDataToShow] = useState<Seeker[]>([]);
  const [computedFilters, setComputedFilters] = useState<unknown>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalAudience, setTotalAudience] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterApplied, setFilterApplied] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [filterLoader, setFilterLoader] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [isOpenModal, setModalOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Filters>({
    selectedAge: [],
    selectedRegistrationType: [],
    selectedGender: [],
    selectedPlatform: [],
    selectedVerification: [],
    selectedLocation: [],
    selectedAttendanceStatus: [],
    selectedAttendanceDetails: [],
    selectedJoinMode: [],
  });
  const [searchText, setSearchText] = useState<string>("");
  const [xlsUrl, setXlsUrl] = useState<string>("");
  const filtersSelectedInAnalytics = useSelector(
    (state: RootState) => state.AnalyticsReducer.filters,
  );
  const [sessionKPIStatus, setSessionKPIStatus] = useState<boolean>(false);
  const [adminDataLoading, setAdminDataLoading] = useState(true);
  const [adminCompletedMeetingData, setAdminCompletedMeetingData] = useState<
    CompletedMeetingData[]
  >([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [sessionData, setSessionsData] = useState<[]>([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [rowClicked, setRowClicked] = useState(false);
  const [clickedUserId, setClickedUserId] = useState<number | null>(null);
  const [seekerData, setSeekerData] = useState<Seeker>();
  const aggregateFilters = useSelector((state: RootState) => state.AnalyticsReducer.aggregatedFilters);
  const dispatch = useDispatch();
  const sessionKPIType = useSelector(
    (state: RootState) => state.AnalyticsReducer.kpiType,
  );

  useEffect(() => {

    if (computedFilters && Object.keys(computedFilters).length > 0) {
      setFilterApplied(true);
    }

    const filterQuery =
      Object.keys(computedFilters).length > 0
        ? `programSessionFilters=${encodeURIComponent(
            JSON.stringify(computedFilters),
          )}`
        : "";

    if (sessionKPIStatus) {
      setFilterLoader(true);

      if (sessionKPIType === AGGREGATE_KPI_TEXT.SESSIONS) {
        FetchAggregateWebinarList(
          setAdminDataLoading,
          setLoading,
          setAdminCompletedMeetingData,
          setDataToShow,
        );
      } else {
        getCall(
          `analytics-data?${filterQuery}&limit=${pageSize}&offset=${
            pageSize * (currentPage - 1)
          }&search=${searchText}`,
          undefined, 
          INFINIPATH
        )
          .then((response) => {
            setDataToShow(response.data.data.processedAnalytics.data);
            setTotalAudience(response.data.data.processedAnalytics.count);
            setXlsUrl(response.data.data.downloadUrl);
            setLoading(false);
          })
          .catch((error) => {
            setLoading(false);
          })
          .finally(() => {
            setFilterLoader(false);
          });
      }
    }
  }, [
    filtersSelectedInAnalytics,
    pageSize,
    currentPage,
    computedFilters,
    searchText,
  ]);

  useEffect(() => {
    const updatedFilters = handleSessionKpiSelection(sessionKPIType);
    setSelectedFilters(updatedFilters);

    const newComputedFilters = {...computeFilters(updatedFilters), startDate : aggregateFilters.startDate, endDate: aggregateFilters.endDate};
    setComputedFilters(newComputedFilters);
    setSessionKPIStatus(true);

    setFilterApplied(sessionKPIType !== "All");
  }, []);

  const computeTypes = (title: string): Record<string, unknown> => {
    const sessionLevelcomputedFilters: Record<string, unknown> = {
      baseType: [],
      type: [],
      joiningMode: [],
      verificationStatus: [],
    };

    switch (title) {
      case "Drop offs":
        sessionLevelcomputedFilters.baseType = ["participant"];
        sessionLevelcomputedFilters.type = ["dropOff"];
        break;

      case "Late comers":
        sessionLevelcomputedFilters.baseType = ["participant"];
        sessionLevelcomputedFilters.type = ["lateComer"];
        break;

      case "Absentee":
        sessionLevelcomputedFilters.baseType = ["absentee"];
        break;

      case "infinipaths":
        sessionLevelcomputedFilters.baseType = ["participant"];
        break;

      case "infinipaths joined with others":
        sessionLevelcomputedFilters.baseType = ["participant"];
        sessionLevelcomputedFilters.joiningMode = ["others"];
        break;

      case "infinipaths attended (Verified)":
        sessionLevelcomputedFilters.baseType = ["participant"];
        sessionLevelcomputedFilters.verificationStatus = ["verified"];
        break;

      case "infinipaths attended (Not Verified)":
        sessionLevelcomputedFilters.baseType = ["participant"];
        sessionLevelcomputedFilters.verificationStatus = ["notVerified"];
        break;

      default:
        break;
    }

    // Remove empty arrays
    return Object.entries(sessionLevelcomputedFilters).reduce(
      (acc, [key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, unknown>,
    );
  };

/**
   * Combines two filter objects into a single object by merging their properties.
   * - If a property in both filters is an array, the arrays are merged, and duplicates are removed.
   * - If a property in both filters is not an array, the value from the second filter overrides the first.
   * 
   * @param filter1 - The first filter object to combine.
   * @param filter2 - The second filter object to combine.
   * @returns A new object containing the combined filters.
   */
  const combineFilters = (filter1: Record<string, unknown>, filter2: Record<string, unknown>) => {
    const combinedFilters: Record<string, unknown> = { ...filter1 };
  
    Object.entries(filter2).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Merge arrays and remove duplicates
        combinedFilters[key] = Array.isArray(combinedFilters[key])
          ? Array.from(new Set([...(combinedFilters[key] as unknown[]), ...value]))
          : value;
      } else {
        // Add non-array values directly
        combinedFilters[key] = value;
      }
    });
  
    return combinedFilters;
  };
  const fetchSeekerData = () => {
    setModalLoading(true);
    //pass userid
    const userIdsParam = JSON.stringify([clickedUserId]);
    const offset = calculateOffset(page, limit);
    let computedTitle = computeTypes(title);
    computedTitle = combineFilters(computedTitle, computedFilters);
    const encodedFilters = encodeURIComponent(JSON.stringify(computedTitle));
    getCall(
      endPoints.analyticsUsers(userIdsParam, limit, offset, encodedFilters),
      undefined,
      INFINIPATH
    )
      .then((response: unknown) => {
        if (response?.data?.statusCode === 200) {
          setModalLoading(false);
          setSessionsData(response?.data?.data.seekerWebinarData);
        } else {
          setModalLoading(false);
        }
      })
      .catch((error: unknown) => {
        setModalLoading(false);
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    if (rowClicked && title !== "" && title !== "userData") {
      fetchSeekerData();
    }
  }, [rowClicked, clickedUserId, limit, page, title]);

  const columns = [
    { field: "seekerDetails", headerName: "Seeker Profile", width: 250, textAlign: "left" ,isSeparator: true,},
    { field: "contactInfo", headerName: "Contact info", width: 250, textAlign: "left", isSeparator: false },

    ...(sessionKPIType === AGGREGATE_KPI_TEXT.NEWJOINERS
      ? [
          {
            field: "webinarDate",
            headerName: "Webinar Date",
            width: 200,
            textAlign: "left",
            isSeparator: false,
          },
          {
            field: "verificationStatus",
            headerName: "Verification Status",
            width: 150,
            textAlign: "left",
            isSeparator: false,
          },
          {
            field: "duration",
            headerName: "Duration",
            width: 120,
            textAlign: "left",
            isSeparator: false,
          },
          {
            field: "RegistrationType",
            headerName: "Registration Type",
            width: 120,
            textAlign: "left",
            isSeparator: false,
          },
          {
            field: "JoinStatus",
            headerName: "Join Status",
            width: 120,
            textAlign: "left",
            isSeparator: false,
          },
          {
            field: "DeviceType",
            headerName: "Device Type",
            width: 150,
            textAlign: "left",
            isSeparator: false,
          }
        ]
      : [
        { field: "lateComersCount", headerName: "#Late(s)", width: 120,textAlign: "center", isSeparator: false },
          { field: "dropOffCount", headerName: "#Dropoff(s)",width: 130, textAlign: "center", isSeparator: false  },
          // { field: "address", headerName: "Video Utill" },
          { field: "absenteesCount", headerName: "#Absentee" , width: 100, textAlign: "center", isSeparator: false },
          { field: "webinarsAttended", headerName: "#infinipaths", width: 120, textAlign: "center", isSeparator: false },
          {
            field: "joinWithOthersCount",
            headerName: "#Joined with Others",
            width: 180,
            textAlign: "center",
            isSeparator: false,
          },
          {
            field: "faceVerificationTrueCount",
            headerName: "#Verified",
            width: 120,
            textAlign: "center",
            isSeparator: false,
          },
          {
            field: "faceVerificationFalseCount",
            headerName: "#Not Verified",
            width: 150,
            textAlign: "center",
            isSeparator: false,
          },
        ]),
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to the first page when page size changes
  };

  const handleFilterApplied = ()=>{
    return Object.values(selectedFilters).some(
        (filter) => Array.isArray(filter) && filter.length > 0,
      )
  }

  const getItemsPerPageOptions = () => {
    const options = [10, 50, 100];
    return options;
  };

  const getDisplayName = (name: string, maxLength: number) => {
    return name.length > maxLength
      ? `${name.substring(0, maxLength)}...`
      : name;
  };

  const handleBackClick = () => {
    navigate(endPoints.aggregateAnaltyics);
  };

  const handleSearch = (query: string) => {
    setSearchText(query);
    setCurrentPage(1);
  };

  const handleFilter = () => {
    setIsFilterModalOpen(true);
  };

  // Function to handle the removal of a filter chip
  /**
   * function to handle the removal of a filter chip
   * @param key - The key of the filter to be removed
   */
  const handleRemoveChip = (key: string, value: string) => {
    const updatedFilters = { ...selectedFilters };

    if (key === FILTER_LABELS.AGE) {
      updatedFilters.selectedAge = updatedFilters.selectedAge.filter(
        (item) => item !== value,
      );
    } else if (key === FILTER_LABELS.REGISTRATION_TYPE) {
      updatedFilters.selectedRegistrationType =
        updatedFilters.selectedRegistrationType.filter(
          (item) => item !== value,
        );
    } else if (key === FILTER_LABELS.GENDER) {
      updatedFilters.selectedGender = updatedFilters.selectedGender.filter(
        (item) => item !== value,
      );
    } else if (key === FILTER_LABELS.PLATFORM) {
      updatedFilters.selectedPlatform = updatedFilters.selectedPlatform.filter(
        (item) => item !== value,
      );
    } else if (key === FILTER_LABELS.VERIFICATION_STATUS) {
      updatedFilters.selectedVerification =
        updatedFilters.selectedVerification.filter((item) => item !== value);
    } else if (key === FILTER_LABELS.LOCATION) {
      updatedFilters.selectedLocation = updatedFilters.selectedLocation.filter(
        (item) => item !== value,
      );
    } else if (key === FILTER_LABELS.ATTENDANCE_STATUS) {
      updatedFilters.selectedAttendanceStatus =
        updatedFilters.selectedAttendanceStatus.filter(
          (item) => item !== value,
        );
    } else if (key === FILTER_LABELS.ATTENDANCE_DETAILS) {
      updatedFilters.selectedAttendanceDetails =
        updatedFilters.selectedAttendanceDetails.filter(
          (item) => item !== value,
        );
      updatedFilters.selectedAttendanceStatus =
        updatedFilters.selectedAttendanceStatus.filter(
          (item) => item !== value,
        );
    } else if (key === FILTER_LABELS.JOIN_MODE) {
      updatedFilters.selectedJoinMode = updatedFilters.selectedJoinMode.filter(
        (item) => item !== value,
      );
    }

    setSelectedFilters(updatedFilters);
    // const newComputedFilters = computeFilters(updatedFilters);
    const newComputedFilters = {...computeFilters(updatedFilters), startDate : aggregateFilters.startDate, endDate: aggregateFilters.endDate};
    handlePageSizeChange(10);
    setComputedFilters(newComputedFilters);
    setFilterApplied(
      Object.values(updatedFilters).some(
        (filter) => Array.isArray(filter) && filter.length > 0,
      ),
    );
  };

  const handleDeselectFilter = (newSelectedFilters: Filters) => {
    const sessionKPI = handleSessionKpiSelection(sessionKPIType);

    // from sessionKPI, get the selected filters only array values and make them reduced
    const selectedFiltersValues = Object.values(sessionKPI)
      .filter((value) =>
        Array.isArray(value)
          ? value.length > 0
          : value !== undefined && value !== "",
      )
      .reduce((acc, value) => acc.concat(value), []); // Flatten into a single array
    // If new selected filters don't match with the session KPI filters, dispatch setKPIType to "All"
    const newSelectedFiltersValues = Object.values(newSelectedFilters)
      .filter((value) =>
        Array.isArray(value)
          ? value.length > 0
          : value !== undefined && value !== "",
      )
      .reduce((acc, value) => acc.concat(value), []); // Flatten into a single array

    // all the values of selectedFiltersValues and newSelectedFiltersValues should be compared all the values of selectedFiletrsValue should be there in newSelectedFiltersValues otherwise disapthc setKPIType to "All"
    const isAllSelected = selectedFiltersValues.every((value: string) =>
      newSelectedFiltersValues.includes(value),
    );
    if (!isAllSelected) {
      dispatch(setKpiType(FILTER_LABELS.ALL));
    }
  };

  const handleSubmit = (newSelectedFilters: Filters) => {
    const newComputedFilters = {...computeFilters(newSelectedFilters), startDate : aggregateFilters.startDate, endDate: aggregateFilters.endDate};
    handleDeselectFilter(newSelectedFilters);
    setComputedFilters(newComputedFilters);
    handlePageSizeChange(10);
    // setCurrentPage(1);
    setSelectedFilters(newSelectedFilters);
    setIsFilterModalOpen(false);
    if (Object.keys(newComputedFilters).length > 0) {
      setFilterApplied(true);
    } else {
      setFilterApplied(false);
    }
  };
  const handleSessionKpiSelection = (kpiType: string): Filters => {
    // Initialize empty filters object
    const updatedFilters: Filters = {
      selectedAge: [],
      selectedRegistrationType: [],
      selectedGender: [],
      selectedPlatform: [],
      selectedVerification: [],
      selectedLocation: [],
      selectedAttendanceStatus: [],
      selectedAttendanceDetails: [],
      selectedJoinMode: [],
    };

    // Parse the KPI type string
    const [mainType, subType] = kpiType.includes("-")
      ? [
          kpiType.slice(0, kpiType.indexOf("-")).trim(),
          kpiType.slice(kpiType.indexOf("-") + 1).trim(),
        ]
      : [kpiType.trim(), ""];
    // Extract non-empty filters from filtersSelectedInAnalytics
    const filterSelected = Object.fromEntries(
      Object.entries(filtersSelectedInAnalytics || {}).filter(
        (value) => value && value.length > 0,
      ),
    );

    // Set filters based on main KPI type
    switch (mainType) {
      case KPI_FILTERS.TYPES.ALL:
        break;
      case KPI_FILTERS.TYPES.LATECOMERS:
        updatedFilters.selectedAttendanceStatus = [
          KPI_FILTERS.ATTENDANCE_STATUS.ATTENDED,
        ];
        updatedFilters.selectedAttendanceDetails = [
          KPI_FILTERS.ATTENDANCE_DETAILS.LATE_COMERS,
        ];
        break;
      case KPI_FILTERS.TYPES.REG_ATTENDANCE:
        updatedFilters.selectedAttendanceStatus = [
          KPI_FILTERS.ATTENDANCE_STATUS.ATTENDED,
          KPI_FILTERS.ATTENDANCE_STATUS.REGISTERED,
        ];
        break;
      case KPI_FILTERS.TYPES.VIDEO:
        if (subType != KPI_FILTERS.ATTENDANCE_STATUS.VIDEO_DOWNGRADES) {
          updatedFilters.selectedRegistrationType = [
            KPI_FILTERS.REGISTRATION_TYPE.VIDEO,
          ];
        }
        applySubTypeFilters(updatedFilters, subType);
        break;

      case KPI_FILTERS.TYPES.NONVIDEO:
        updatedFilters.selectedRegistrationType = [
          KPI_FILTERS.REGISTRATION_TYPE.NON_VIDEO,
        ];
        applySubTypeFilters(updatedFilters, subType);
        break;

      case KPI_FILTERS.TYPES.BOTH:
        applySubTypeFilters(updatedFilters, subType);
        break;

      case KPI_FILTERS.TYPES.ABSENTEES:
        updatedFilters.selectedAttendanceStatus = [
          KPI_FILTERS.ATTENDANCE_STATUS.ABSENT,
        ];
        break;

      case KPI_FILTERS.TYPES.DROP_OFFS:
      case KPI_FILTERS.ATTENDANCE_DETAILS.DROPOFFS:
        updatedFilters.selectedAttendanceStatus = [
          KPI_FILTERS.ATTENDANCE_STATUS.ATTENDED,
        ];
        updatedFilters.selectedAttendanceDetails = [
          KPI_FILTERS.ATTENDANCE_DETAILS.DROP_OFF,
        ];
        break;

      case KPI_FILTERS.TYPES.NEW_SEEKERS:
        updatedFilters.selectedAttendanceStatus = [
          KPI_FILTERS.ATTENDANCE_STATUS.ATTENDED,
        ];
        updatedFilters.selectedAttendanceDetails = [
          KPI_FILTERS.ATTENDANCE_DETAILS.NEW_SEEKERS,
        ];
        break;

      case KPI_FILTERS.TYPES.TOTAL_ATTENDEES:
      case KPI_FILTERS.TYPES.ATTENDED:
        updatedFilters.selectedAttendanceStatus = [
          KPI_FILTERS.ATTENDANCE_STATUS.ATTENDED,
        ];
        break;

      case KPI_FILTERS.TYPES.REGISTERED:
        updatedFilters.selectedAttendanceStatus = [
          KPI_FILTERS.ATTENDANCE_STATUS.REGISTERED,
        ];
        break;

      case KPI_FILTERS.TYPES.LOCATION:
        updatedFilters.selectedAttendanceStatus = [
          KPI_FILTERS.ATTENDANCE_STATUS.ATTENDED,
        ];
        updatedFilters.selectedLocation = [subType];
        break;

      case KPI_FILTERS.TYPES.GENDER:
        updatedFilters.selectedAttendanceStatus = [
          KPI_FILTERS.ATTENDANCE_STATUS.ATTENDED,
        ];
        updatedFilters.selectedGender = [subType];
        break;

      case KPI_FILTERS.TYPES.AGE:
        updatedFilters.selectedAttendanceStatus = [
          KPI_FILTERS.ATTENDANCE_STATUS.ATTENDED,
        ];
        updatedFilters.selectedAge = [subType];
        break;

      case KPI_FILTERS.TYPES.PLATFORM:
        updatedFilters.selectedAttendanceStatus = [
          KPI_FILTERS.ATTENDANCE_STATUS.ATTENDED,
        ];
        updatedFilters.selectedPlatform = [
          subType === KPI_FILTERS.PLATFORM.DIRECT_LINKS
            ? KPI_FILTERS.PLATFORM.DIRECT_LINKS
            : KPI_FILTERS.PLATFORM.APP,
        ];
        break;

      case KPI_FILTERS.TYPES.JOINED_ALONE:
        updatedFilters.selectedJoinMode = [KPI_FILTERS.JOIN_MODE.ALONE];
        break;

      case KPI_FILTERS.TYPES.JOINED_WITH_OTHERS:
        updatedFilters.selectedJoinMode = [KPI_FILTERS.JOIN_MODE.OTHERS];
        break;

      case KPI_FILTERS.TYPES.VERIFIED_SEEKERS:
        updatedFilters.selectedVerification = [
          KPI_FILTERS.VERIFICATION_STATUS.VERIFIED,
        ];
        break;

      case KPI_FILTERS.TYPES.NOT_VERIFIED_SEEKERS:
        updatedFilters.selectedVerification = [
          KPI_FILTERS.VERIFICATION_STATUS.NOT_VERIFIED,
        ];
        break;
    }

    // Apply additional filters from analytics if they exist
    if (Object.keys(filterSelected).length > 0) {
      mergeAnalyticsFilters(updatedFilters, filterSelected);
    }

    return updatedFilters;
  };

  // Helper function to apply sub-type filters
  const applySubTypeFilters = (filters: Filters, subType: string): void => {
    switch (subType) {
      case KPI_FILTERS.ATTENDANCE_STATUS.ATTENDED:
        filters.selectedAttendanceStatus = [
          KPI_FILTERS.ATTENDANCE_STATUS.ATTENDED,
        ];
        break;

      case KPI_FILTERS.ATTENDANCE_STATUS.ABSENTEES:
        filters.selectedAttendanceStatus = [
          KPI_FILTERS.ATTENDANCE_STATUS.ABSENT,
        ];
        break;

      case KPI_FILTERS.ATTENDANCE_DETAILS.DROP_OFFS:
        filters.selectedAttendanceStatus = [
          KPI_FILTERS.ATTENDANCE_STATUS.ATTENDED,
        ];
        filters.selectedAttendanceDetails = [
          KPI_FILTERS.ATTENDANCE_DETAILS.DROP_OFF,
        ];
        break;

      case KPI_FILTERS.ATTENDANCE_DETAILS.REJOINS:
        filters.selectedAttendanceStatus = [
          KPI_FILTERS.ATTENDANCE_STATUS.ATTENDED,
        ];
        filters.selectedAttendanceDetails = [
          KPI_FILTERS.ATTENDANCE_DETAILS.REJOIN,
        ];
        break;

      case KPI_FILTERS.ATTENDANCE_DETAILS.LATE_COMERS:
        filters.selectedAttendanceStatus = [
          KPI_FILTERS.ATTENDANCE_STATUS.ATTENDED,
        ];
        filters.selectedAttendanceDetails = [
          KPI_FILTERS.ATTENDANCE_DETAILS.LATE_COMERS,
        ];
        break;

      case KPI_FILTERS.ATTENDANCE_STATUS.REGISTERED:
        filters.selectedAttendanceStatus = [
          KPI_FILTERS.ATTENDANCE_STATUS.REGISTERED,
        ];
        break;

      case KPI_FILTERS.ATTENDANCE_STATUS.CANCELLATIONS:
        if (filters.selectedRegistrationType.length > 0) {
          filters.selectedRegistrationType = [
            KPI_FILTERS.ATTENDANCE_STATUS.CANCELLATIONS,
            filters.selectedRegistrationType[0],
          ];
        } else {
          filters.selectedRegistrationType = [
            KPI_FILTERS.ATTENDANCE_STATUS.CANCELLATIONS,
          ];
        }
        break;

      case KPI_FILTERS.ATTENDANCE_STATUS.VIDEO_DOWNGRADES:
        if (filters.selectedRegistrationType.length > 0) {
          filters.selectedRegistrationType = [
            KPI_FILTERS.ATTENDANCE_STATUS.DOWNGRADES,
            filters.selectedRegistrationType[0],
          ];
        } else {
          filters.selectedRegistrationType = [
            KPI_FILTERS.ATTENDANCE_STATUS.DOWNGRADES,
          ];
        }
        break;
    }
  };

  // Helper function to merge analytics filters
  const mergeAnalyticsFilters = (
    updatedFilters: Filters,
    filterSelected: Record<string, unknown[]>,
  ): void => {
    Object.entries(filterSelected).forEach(([key, value]) => {
      if (!value || value.length === 0) return;

      if (key === FILTER_LABELS.AGE_GROUP) {
        const ageMappedArray = value.map(
          (age) => ageMapping[age as keyof typeof ageMapping],
        );
        updatedFilters.selectedAge = [
          ...updatedFilters.selectedAge,
          ...ageMappedArray.filter(
            (age) => !updatedFilters.selectedAge.includes(age),
          ),
        ];
      } else if (key === FILTER_LABELS.GENDER_LABEL) {
        updatedFilters.selectedGender = [
          ...updatedFilters.selectedGender,
          ...value.filter(
            (gender) => !updatedFilters.selectedGender.includes(gender),
          ),
        ];
      } else if (key === FILTER_LABELS.LOCATION_LABEL) {
        updatedFilters.selectedLocation = [
          ...updatedFilters.selectedLocation,
          ...value.filter(
            (location) => !updatedFilters.selectedLocation.includes(location),
          ),
        ];
      }
    });
  };

  const computeFilters = (filters: Filters): Record<string, unknown> => {
    // Initialize all keys with empty arrays
    const computedFilters: Record<string, unknown> = {
      audienceInsights: [],
      ageGroup: [],
      videoType: [],
      gender: [],
      platformUsed: [],
      location: [],
      verificationStatus: [],
      joiningMode: [],
      baseType: [],
      type: [],
    };

    // Map selected filters to the computedFilters structure
    if (filters.selectedAttendanceStatus.length > 0) {
      // Add attendanceStatus to baseType
      if (filters.selectedAttendanceStatus.length > 0) {
        computedFilters.baseType = [
          ...(computedFilters.baseType || []), // Ensure existing values are preserved
          ...filters.selectedAttendanceStatus.map(
            (status) =>
              attendanceMapping[status.toLowerCase()] || status.toLowerCase(),
          ),
        ];
      }

      // Add attendanceDetails to type
      if (filters.selectedAttendanceDetails.length > 0) {
        computedFilters.type = [
          ...(computedFilters.type || []), // Ensure existing values are preserved
          ...filters.selectedAttendanceDetails.map(
            (detail) =>
              attendanceMapping[detail.toLowerCase()] || detail.toLowerCase(),
          ),
        ];
      }
    }

    if (filters.selectedAge.length > 0) {
      computedFilters.ageGroup = reverseAgeMapping(filters.selectedAge);
    }

    if (filters.selectedRegistrationType.length > 0) {
      // Filter out "cancellations" and "downgrades" from videoType
      computedFilters.videoType = filters.selectedRegistrationType
        .filter(
          (type) =>
            type.toLowerCase() !==
              KPI_FILTERS.ATTENDANCE_STATUS.CANCELLATIONS_LOWER &&
            type.toLowerCase() !==
              KPI_FILTERS.ATTENDANCE_STATUS.DOWNGRADES_LOWER,
        )
        .map((type) => type.toLowerCase());

      // Check for specific values and add them to `type`
      const specialTypes = filters.selectedRegistrationType
        .filter(
          (type) =>
            type.toLowerCase() ===
              KPI_FILTERS.ATTENDANCE_STATUS.CANCELLATIONS_LOWER ||
            type.toLowerCase() ===
              KPI_FILTERS.ATTENDANCE_STATUS.DOWNGRADES_LOWER,
        )
        .map((type) =>
          type.toLowerCase() ===
          KPI_FILTERS.ATTENDANCE_STATUS.CANCELLATIONS_LOWER
            ? KPI_FILTERS.ATTENDANCE_STATUS.CANCELLATION_LOWER
            : KPI_FILTERS.ATTENDANCE_STATUS.DOWNGRADE_LOWER,
        );

      if (specialTypes.length > 0) {
        computedFilters.type = [
          ...(computedFilters.type || []),
          ...specialTypes,
        ];
      }
    }

    if (filters.selectedGender.length > 0) {
      computedFilters.gender = filters.selectedGender.map((gender) => {
        return gender.toLowerCase();
      });
    }

    if (filters.selectedPlatform.length > 0) {
      computedFilters.platformUsed = filters.selectedPlatform.map(
        (platform) => {
          if (platform === KPI_FILTERS.PLATFORM.APP) {
            return KPI_FILTERS.PLATFORM.APP_LOWER;
          } else if (platform === KPI_FILTERS.PLATFORM.DIRECT_LINKS) {
            return KPI_FILTERS.PLATFORM.DIRECT_LINKS_LOWER;
          }
          return platform; // Return the original value if it doesn't match "App" or "Direct Links"
        },
      );
    }

    if (filters.selectedLocation.length > 0) {
      computedFilters.location = filters.selectedLocation;
    }

    if (filters.selectedVerification.length > 0) {
      computedFilters.verificationStatus = filters.selectedVerification.map(
        (status) => {
          const lowerCaseStatus = status.toLowerCase();
          return lowerCaseStatus ===
            KPI_FILTERS.VERIFICATION_STATUS.NOT_VERIFIED_LOWER
            ? KPI_FILTERS.VERIFICATION_STATUS.NOT_VERIFIED_CAMEL
            : lowerCaseStatus;
        },
      );
    }

    if (filters.selectedJoinMode.length > 0) {
      computedFilters.joiningMode = filters.selectedJoinMode.map((mode) =>
        mode.toLowerCase(),
      );
    }

    // Remove keys with empty arrays to keep the computedFilters clean
    return Object.keys(computedFilters).reduce(
      (acc, key) => {
        if (computedFilters[key].length > 0) {
          acc[key] = computedFilters[key];
        }
        return acc;
      },
      {} as Record<string, unknown>,
    );
  };

  const handleRowClick = (title: string, row: Seeker) => {
    if (title === "userData") {
      navigate(`${endPoints.seekerAnalytics}/${row.userId}`);
    } else {
      setModalOpen(true);
      setTitle(title);
      setSeekerData(row);
      setRowClicked(true);
      setClickedUserId(row.userId);
    }
  };
  const onModalClose = () => {
    setTitle("");
    setSessionsData([]);
    setModalOpen(false);
  };
  // Custom row renderer to display user image, video icon, and truncate long names with tooltip
  const renderCustomRow = (row: Seeker) => (
    <TableRow key={row.userId} className={styles.tableRow}>
      <TableCell
        className={`${styles.userCell}`}
        style={{ maxWidth: "800px", minWidth: "200px" }}
        onClick={() => handleRowClick("userData", row)}
        sx={{
          position: 'sticky',
          left: 0,
          background: 'white',  // ensure it's not transparent
          zIndex: 2,             // ensure it appears above others
          minWidth: "400px",
          maxWidth: "800px",
        }}
      >
        <div className={styles.userCellContent}>
          <Avatar
            alt={row?.fullName ?? "Unknown User"}
            src={
              row?.profileUrl && row?.profileUrl?.length > 0
                ? modifyProfileUrl(row?.profileUrl)
                : defaultUser
            }
            sx={{
              width: 50,
              height: 50,
              border: "1px solid #DDDDDD",
            }}
            data-testid="profile-avatar"
          />
          <div className={styles.userInfo}>
            {row?.fullName?.length > 15 ? (
              <Tooltip title={row?.fullName} arrow>
                <p>{getDisplayName(row?.fullName, 15)}</p>
              </Tooltip>
            ) : (
              <p> {row?.fullName}</p>
            )}
            <div className={styles.additionalInfo}>
              <span>{row.age !== null && `${row.age}`}</span>
              {row.age !== null && <span className={styles.borderLine}>|</span>}
              <span className={styles.gender}>
                {row.gender !== null && `${row.gender[0]}`}
              </span>
              {row.gender !== null && (
                <span className={styles.borderLine}>|</span>
              )}
              <span>
                {row.address != null &&
                row.address != "" &&
                row.address != undefined
                  ? row.address
                  : row.otherAddress}
              </span>
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell
      >

        <div className={styles.additionalInfo}>
              <span>{row.mobileNumber}</span>
              <p>{row.email}</p>
            </div>
      </TableCell>
      {sessionKPIType === AGGREGATE_KPI_TEXT.NEWJOINERS ? (
        <>
        <TableCell
        sx={{
          textAlign: "left",
        }}
        >{getFormattedDate(row.webinarDate)}
        </TableCell>
         <TableCell
         sx={{
           textAlign: "left",
           left: 0,
         }}
         >{row.faceVerificationTrueCount > 0 ? "Verified" : "Not Verified"}
         </TableCell>
        <TableCell
        sx={{
          textAlign: "left",
          left: 0,
        }}
        >{formatDurationTime(convertToSeconds(row.formattedDuration))}
        </TableCell>
        <TableCell
         sx={{
           textAlign: "left",
           left: 0,
         }}
         >{row.videoRegistrationCount > 0 ? "Video" : "Non video"}
         </TableCell>
         <TableCell
         sx={{
           textAlign: "left",
           left: 0,
         }}
         >{row.joinAlone > 0 ? "SELF" : "OTHERS"}
         </TableCell>
         <TableCell
         sx={{
           textAlign: "left",
           left: 0,
         }}
         >{row.directLinksCount > 0 ? "Direct Links" : "Portal"} 
         </TableCell>
        </>
      ) : (
        <>
        <TableCell
            className={styles.tableCell}
            sx={{
              textAlign: "center",
              cursor: "pointer",
              left: 0,
            }}
            onClick={() => handleRowClick("Late Comers", row)}
          >
            {row.lateComersCount}
          </TableCell>
          <TableCell
            className={styles.tableCell}
            sx={{
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() => handleRowClick("Drop offs", row)}
          >
            {row.dropOffCount}
          </TableCell>
          <TableCell
            className={styles.tableCell}
            sx={{
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() => handleRowClick("Absentee", row)}
          >
            {row.absenteesCount}
          </TableCell>
          <TableCell
            className={styles.tableCell}
            sx={{
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() => handleRowClick("infinipaths", row)}
          >
            {row.webinarsAttended}
          </TableCell>
          <TableCell
            className={styles.tableCell}
            sx={{
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() => handleRowClick("infinipaths joined with others", row)}
          >
            {row.joinWithOthersCount}
          </TableCell>
          <TableCell
            className={styles.tableCell}
            sx={{
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() => handleRowClick("infinipaths attended (Verified)", row)}
          >
            {row.faceVerificationTrueCount}
          </TableCell>
          <TableCell
            className={styles.tableCell}
            sx={{
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() =>
              handleRowClick("infinipaths attended (Not Verified)", row)
            }
          >
            {row.faceVerificationFalseCount}
          </TableCell>
        </>
      )}
    </TableRow>
  );

  // Loader component to display while fetching data
  const renderLoader = () => (
    <div className={styles.loaderContainer}>
      <Loader type="large" data-testid="search-modal-loader" />
    </div>
  );

  /**
   * Handles the click event on a table cell.
   *
   * @param type - A string representing the type of the cell or action.
   * @param meeting - An object representing the meeting data.
   *                  It is expected to have a property `isReportGenerated`
   *                  which determines if a report has been generated for the meeting.
   *
   * If the `isReportGenerated` property of the `meeting` object is true,
   * the function navigates to the session analytics page.
   */
  const handleCellClick = (type: string, meeting: unknown) => {
    if (meeting.isReportGenerated) {
      // dispatch(setKpiType(type));

      navigate(endPoints.sessionAnalytics);
    }
  };
  return (
    <>
      <div
        className={styles.seekerListDashboard}
        data-testid="seeker-list-dashboard"
      >
        {modalLoading && <Loader type="large" />}
        {/* breadcrum */}
        <SeekerBreadCrumHeader
          onBack={handleBackClick}
          onSearch={handleSearch}
          onFilter={handleFilter}
          totalAudience={totalAudience}
          totalWebinars={dataToShow.length}
          xlsUrl={xlsUrl}
          loading={loading}
          filterApplied={filterApplied}
          selectedFilters={selectedFilters}
          onDeselectFilters={handleRemoveChip}
          title="Analytics"
          isShowFilter={sessionKPIType !== AGGREGATE_KPI_TEXT.SESSIONS}
        />

        {/* table */}
          {
          sessionKPIStatus && sessionKPIType !== AGGREGATE_KPI_TEXT.SESSIONS ? (
            <TableWithPaginationComponent
              columns={columns}
              data={dataToShow}
              loading={filterLoader}
              noDataMessage={handleFilterApplied() ? NO_FILTERED_DATA : NO_DATA}
              // onRowClick={handleRowClick}
              currentPage={currentPage}
              pageSize={pageSize}
              total={totalAudience}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              itemsPerPageOptions={getItemsPerPageOptions()}
              showPagination={true}
              itemLabel="seekers"
              renderLoader={renderLoader}
              renderCustomRow={renderCustomRow}
              customRowClassName={styles.tableRow}
              subHeader={true}
              noDataImg={handleFilterApplied()? noFilteredData : noDataFound}
            />
          ) : (
            <>
            <DataGridWithPagination
              headers={getSessionCompletedHeaders(handleCellClick)}
              seekersData={dataToShow}
              hoverImageClass={styles.actionHoverImg}
              totalData={dataToShow?.length}
              pageSize={pageSize}
              setPageSize={handlePageSizeChange}
              currentPage={currentPage}
              setCurrentPage={handlePageChange}
              loading={loading}
              data-testid="sessions-dashboard-completed"
              height="calc(100vh - 230px)"
              onRowClick={
                (rowData) =>
                  // navigate(
                  //   `${endPoints.sessionAnalytics}/${rowData.id}`,
                  //   )
                  navigate(
                    endPoints.sessionAnalytics + `?sessionId=${rowData.id}`,
                  )
                // handleCompletedSesions(rowData.id, rowData.title, rowData.startAt, rowData.isReportGenerated)
              }
            />
            {dataToShow?.length == 0 && !filterApplied  && !loading &&
              <div className={styles.noDataFound}>
                <img src={noDataFound} alt="" />
                <div className={styles.notFoundContent}>Looks like we don’t have enough data to
                  view Aggregated Analytics.
                </div>
              </div> 
      }
            </>
          )} 
        {/* filter modal */}
        <FilterModal
          isOpen={isFilterModalOpen}
          handleClose={() => setIsFilterModalOpen(false)}
          handleSubmit={handleSubmit}
          locationOptions={LOCATIONS}
          initialFilters={selectedFilters}
        />
        <SessionsModal
          isOpen={isOpenModal}
          onClose={onModalClose}
          title={title}
          data={sessionData}
          loading={modalLoading}
          limit={limit}
          setLimit={setLimit}
          page={page}
          setPage={setPage}
          SeekerData = {seekerData}
        />
      </div>
    </>
  );
};

export default AggegrateSeekersDashboard;
