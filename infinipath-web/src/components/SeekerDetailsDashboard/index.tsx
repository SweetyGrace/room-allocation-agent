import React, { useEffect, useState } from "react";
import defaultUser from "../../assets/images/default-profile.svg";
import styles from "./index.module.scss";
import SeekerBreadCrumHeader from "../SeekerBreadCrumHeader";
import FilterModal, { Filters } from "../../common/components/FilterComponent";
import Loader from "../../common/components/Loader";
import TableWithPaginationComponent from "../../common/components/TableComponentWithPagination";
import { Avatar, TableCell, TableRow, Tooltip } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCall } from "../../services/apiService";
import {
  ageMapping,
  formatTimeDuration,
  modifyProfileUrl,
  reverseAgeMapping,
} from "../../utils/commonFunctions";
import { RootState } from "../../store";
import { endPoints, INFINIPATH } from "../../constants/urlConstants";
import { setKpiType } from "../../reducers/AnalyticsReducer";
import {
  attendanceMapping,
  FILTER_LABELS,
  KPI_FILTERS,
  LOCATIONS,
  NO_FILTERED_DATA,
  NO_SESSION_DATA,
} from "../../constants";
import noFilteredData from "../../assets/images/no-filtered-data.svg";
import noDataFound from "../../assets/images/aggregated-empty.svg";
import success from "../../assets/images/success.svg";
import failure from "../../assets/images/failure.svg";
// Define seeker interface
interface Seeker {
  userId: number;
  firstName: string;
  fullName: string;
  gender: string;
  age: number;
  email: string
  mobileNumber: string;
  address: string;
  isInfinithiest: boolean;
  modeOfJoining: string;
  faceVerificationStatus: boolean;
  registrationType: string;
  userProfileUrl: string;
  otherAddress: string;
  duration: string;
  formattedDuration: string;
  rejoinCount: number;
  isDropoff: boolean;
  isAbsentee: boolean;
  isLateComer: boolean;
  deviceType: string;
}

const seekerListDashboard: React.FC = () => {
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
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
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
        ? `&filters=${encodeURIComponent(JSON.stringify(computedFilters))}`
        : "";

    if (sessionKPIStatus) {
      setFilterLoader(true);
      getCall(
        `fetch-analytics-data/${sessionId}?limit=${pageSize}&offset=${pageSize * (currentPage - 1)}&search=${searchText}${filterQuery}`,
          undefined,
          INFINIPATH
      )
        .then((response) => {
          setDataToShow(response.data.data.data);
          setTotalAudience(response.data.data.totalCount);
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
    const newComputedFilters = computeFilters(updatedFilters);
    setComputedFilters(newComputedFilters);
    setSessionKPIStatus(true);

    setFilterApplied(sessionKPIType !== "All");
  }, []);

  const columns = [
    { field: "full_name", headerName: "Seeker Profile", width: 250, isSeparator: true, textAlign: "left", },
    { field: "contactInfo", headerName: "Contact info", width: 250,isSeparator: false,textAlign: "left", },
    { field: "type_of_registration", headerName: "Type of Registration", width: 180,textAlign: "left", isSeparator: false },
    { field: "joining_status", headerName: "Joining Status", width: 180, isSeparator: false, textAlign: "left", },
    { field: "verification", headerName: "Verification", width: 120, isSeparator: false, textAlign: "left", },
    { field: "duration", headerName: "Duration", width: 120, isSeparator: false , textAlign: "left",},
    { field: "rejoin_count", headerName: "Rejoins", width: 130, isSeparator: false, textAlign: "center", },
    { field: "Absentee", headerName: "Absentee", width: 130, isSeparator: false, textAlign: "center", },
    { field: "Late_comer", headerName: "Late comer", width: 130, isSeparator: false, textAlign: "center", },
    { field: "Drop_Off", headerName: "Drop Off", width: 130, isSeparator: false,textAlign: "center" },
    { field: "Device_Type", headerName: "Device Type", width: 130, isSeparator: false,textAlign: "left" },
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to the first page when page size changes
  };


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
    navigate(-1);
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
      updatedFilters.selectedAttendanceDetails = [];
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
    const newComputedFilters = computeFilters(updatedFilters);
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
    const newComputedFilters = computeFilters(newSelectedFilters);
    handleDeselectFilter(newSelectedFilters);
    setComputedFilters(newComputedFilters);
    handlePageSizeChange(10);
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

        //modify the below filter to add multiple platforms
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

  const handleRowClick = (row: Seeker) => {
    navigate(`${endPoints.seekerAnalytics}/${row.userId}`);
  };

  // Custom row renderer to display user image, video icon, and truncate long names with tooltip
  const renderCustomRow = (row: Seeker) => (
    <TableRow
      key={row.userId}
      className={styles.tableRow}
      onClick={() => handleRowClick(row)}
    >
      <TableCell
      sx={{
        position: 'sticky',
        left: 0,
        background: 'white',  // ensure it's not transparent
        zIndex: 2,             // ensure it appears above others
      }}
        className={`${styles.tableCell} ${styles.userCell}`}
      >
        <div className ={styles.userCellContent}>
        <Avatar
          alt={row?.fullName ?? "Unknown User"}
          src={
            (row?.userProfileUrl &&
              row?.userProfileUrl?.length > 0)
              ? modifyProfileUrl(row?.userProfileUrl)
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
            <span className={styles.gender}>{row.gender !== null && `${row.gender[0]}`}</span>
            {row.gender !== null && <span className={styles.borderLine}>|</span>}
            <span>{(row.address!=null && row.address != "" && row.address != undefined)? row.address: row.otherAddress}</span>
          </div>
        </div>
        </div>
      </TableCell>
      <TableCell className={styles.tableCell}>
      <span>{row.mobileNumber}</span> 
      {row?.email?.length > 24 ? (
            <Tooltip title={row?.email} arrow>
              <p>{getDisplayName(row?.email, 24)}</p>
            </Tooltip>
          ) : (
            <p> {row?.email}</p>
          )}
      </TableCell>
      <TableCell
        className={styles.tableCell}
      >
        {row.registrationType?.toUpperCase() ?? "-"}
      </TableCell>
      <TableCell className={styles.tableCell}>{row.modeOfJoining ?? "-"}</TableCell>
      <TableCell className={styles.tableCell}>
        {row.faceVerificationStatus ? "Verified" : "Not verified"}
      </TableCell>
      <TableCell className={styles.tableCell}>
        {formatTimeDuration(row.formattedDuration ?? "-")}
      </TableCell>
      <TableCell 
      className={styles.tableCell}
      sx={{
        textAlign: "center",
      }}
      >{row.rejoinCount ?? "-"}</TableCell>
      <TableCell className={styles.tableCell} sx={{
        textAlign: "center",
      }}><img src = {row.isAbsentee ? success : failure}/></TableCell>
      <TableCell className={styles.tableCell} sx={{
        textAlign: "center",
      }}><img src = {row.isLateComer ? success : failure}/></TableCell>
      <TableCell className={styles.tableCell} sx={{
        textAlign: "center",
      }}><img src = {row.isDropoff ? success : failure}/></TableCell>
      {/* <TableCell className={styles.tableCell}>{row.cancellation ?? "-"}</TableCell> */}
      <TableCell className={styles.tableCell}>{row.deviceType ?? "-"}</TableCell>
      
    </TableRow>
  );

  // Loader component to display while fetching data
  const renderLoader = () => (
    <div className={styles.loaderContainer}>
      <Loader type="large" data-testid="search-modal-loader" />
    </div>
  );

  const handleFilterApplied = () => {
    return Object.values(selectedFilters).some(
      (filter) => Array.isArray(filter) && filter.length > 0,
    )
  }
  return (
    <>
      <div
        className={styles.seekerListDashboard}
        data-testid="seeker-list-dashboard"
      >
        {/* breadcrum */}
        <SeekerBreadCrumHeader
          onBack={handleBackClick}
          onSearch={handleSearch}
          onFilter={handleFilter}
          totalAudience={totalAudience}
          xlsUrl={xlsUrl}
          loading={loading}
          filterApplied={filterApplied}
          selectedFilters={selectedFilters}
          onDeselectFilters={handleRemoveChip}
          title="Sessions"
        />

        {/* table */}
        <TableWithPaginationComponent
          columns={columns}
          data={dataToShow}
          loading={filterLoader}
          noDataMessage={handleFilterApplied() ? NO_FILTERED_DATA : NO_SESSION_DATA}
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

        {/* filter modal */}
        <FilterModal
          isOpen={isFilterModalOpen}
          handleClose={() => setIsFilterModalOpen(false)}
          handleSubmit={handleSubmit}
          locationOptions={LOCATIONS}
          initialFilters={selectedFilters}
        />
      </div>
    </>
  );
};

export default seekerListDashboard;
