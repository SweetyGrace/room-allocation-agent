import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { ApiService } from "../../../services/mockService.ts";
import {
  mapApiDataToUserCards,
  transformSeekerResponse,
} from "../../../utils/dataMapper.ts";
import {
  ProgramResponse,
  Session,
  SidebarItemState,
  UserData,
} from "../../../types/seatApproval.ts";
import styles from "./index.module.scss";
import MobileUserCard from "../SeekerDetailsOverlay/Common/UserCards";
import UserCard from "../../../common/components/UserCard";
import search from "../../../assets/images/search.svg";
import filter from "../../../assets/images/filter.svg";
import { sortPreferences } from "../../../utils/dataMapper";
import pillars from "../../../assets/images/pillars.png";
import userCircleDashed from "../../../assets/images/user-circle-dashed.svg";
import male from "../../../assets/images/male.svg";
import totalusers from "../../../assets/images/totalusers.svg";
import swap from "../../../assets/images/Swap.svg";
import roommate_preference from "../../../assets/images/Roommate_Preference.svg";
import female from "../../../assets/images/female.svg";
import { getItemInLocalStorage } from "../../../services/localStorage.ts";
import card from "../../../assets/images/no_program_cards.svg";
import { Avatar, Tooltip } from "@mui/material";
import defaultProfileIcon from "../../../assets/images/default-profile.svg";
import cross_Bg from "../../../assets/images/cross-bg.svg";
import { Button } from "../../../common/components/Button/index.tsx";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import clearIcon from "../../../assets/images/close-icon.svg";
import Loader from "../../../common/components/Loader/index.tsx";
import closedropdown from "../../../assets/images/closedropdown.svg";
import opendropdown from "../../../assets/images/opendropdown.svg";
import { getSeekerDetailsById } from "../../../pages/RegisteredSeekersDetails/service.ts";
import MoveProgramCard from "../../../common/components/MoveProgramCard/index.tsx";
import { DashedBorderBox } from "../../../common/components/DashedBorderBox/index.tsx";
import { PreferenceDropDown } from "../../../common/components/PreferenceDropDown/index.tsx";
import { SessionsGrid } from "../../../common/components/SessionsGrid/index.tsx";
import { SideBar } from "../../../common/components/SideBar/index.tsx";
import { PreferenceMobileScroll } from "../../../common/components/PreferenceDropDown/PreferenceMobileScroll/index.tsx";
import UseResize from "../../../common/components/UseResize/index.tsx";
import { useResponsive } from "../../../utils/functions.ts";
import SearchInput from "../../../common/components/SearchFieldMobile/index.tsx";
import personIcon from "../../../assets/images/person-icon.svg";
import preferenceSeekers from "../PreferenceSeekers/index.tsx";
import {
  fetchAllocatedUsers,
  fetchSwapRequests,
  handleSwapSidebarClick,
} from "../../../utils/seekerApproval.ts";
import { calculateKPIValue } from "../../../utils/commonFunctions.ts";
import ListPagination from "../../../common/components/ListPagination/index.tsx";
import { ApprovalStatus, DROPDOWNFILTER_SIDEBARITEMS, DROPDOWNFILTERS, dropDownnJSON, LABEL_ANY_HDB_MSD, sortOptions, textConstant } from "../../../constants/textConstants.ts";
import { set } from "date-fns";
import PreferenceSeekers from "../PreferenceSeekers/index.tsx";
import { SortState } from "../../../types/seatApproval";
import { setProgramName, setSeatApprovalSessions, setSeatApprovalToolbarKpi } from "../../../reducers/ProgramReducer.ts";
import { useDispatch } from "react-redux";
import { textConstants } from "../../../constants/index.ts";

// Lazy load overlay components
const SessionOverlay = lazy(() => import("../SessionOverlay/index.tsx"));
const SeekerDetails = lazy(() => import("../SeekerDetailsOverlay/index.tsx"));
const UserCardOverlay = lazy(() => import("../../../common/components/UserCardOverlay/index.tsx"));
const AdminFilterOverlay = lazy(() => import("../../components/AdminFilterOverlayPreference/index.tsx"));


const SeatApproval: React.FC = () => {
  const dispatch = useDispatch();
  const [selectedSwapSeeker, setSelectedSwapSeeker] = useState<UserData | null>(
    null,
  );
  const getInitialStates = () => {
    const params = new URLSearchParams(window.location.search);
    const dropdownValue = params.get("dropdown");
    const kpiCategory = params.get("kpiCategory");
    const kpiFilter = params.get("kpiFilter");
    const sidebarKey = params.get("sidebarKey");
    const gender = sidebarKey?.includes("female")
      ? "female"
      : sidebarKey?.includes("male")
        ? "male"
        : "";
    const swap = sidebarKey?.includes("_swap") ? "swap-requests" : "";
    const roommatePreference = sidebarKey?.includes("_roommate_preference")
      ? "preferredRoomMate"
      : "";
    const filtersParam = params.get("filters");

    // Parse filters if present
    let parsedFilters = {};
    if (filtersParam) {
      try {
        parsedFilters = JSON.parse(filtersParam);
      } catch (e) {
        console.error("Error parsing filters from URL:", e);
      }
    }

    // Initial states
    let initialOption = { label: "Unassigned", value: "Registered", data: "" };
    let initialSidebarItem = {
      key: sidebarKey || "total_unallocated",
      kpiCategory: kpiCategory || "unallocated",
      kpiFilter: kpiFilter || "total_unallocated",
    };

    if (dropdownValue) {
      if (dropdownValue === "Swap" || dropdownValue === "Swap Request") {
        initialOption = {
          label: "Swap request",
          value: "swap",
          data: "",
        };
        initialSidebarItem = {
          key: "swap",
          kpiCategory: "all",
          kpiFilter: "swap-requests",
          filters: parsedFilters, // Include filters for swap view
        };
      } else if (dropdownValue === "All") {
        initialOption = {
          label: "All",
          value: "all",
          data: "",
        };
        initialSidebarItem = {
          key: "total",
          kpiCategory: "all",
          kpiFilter: "all",
        };
      } else {
        initialOption = {
          label: dropdownValue,
          value: dropdownValue,
          data: "",
        };
      }
    }

    if (kpiCategory && kpiFilter) {
      initialSidebarItem = {
        key: sidebarKey || kpiFilter,
        gender: gender,
        swap: swap,
        filters: parsedFilters,
        kpiCategory: kpiCategory,
        kpiFilter: kpiFilter,
        preferredRoomMate: roommatePreference,
      };
    }
    return { initialOption, initialSidebarItem };
  };

  const { initialOption, initialSidebarItem } = getInitialStates();
  // Move all state declarations to the top
  const [selectedOption, setSelectedOption] = useState<{
    label: string;
    value: string | number;
    data: Session | string;
  }>(initialOption);

  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedSidebarItem, setSelectedSidebarItem] =
    useState<SidebarItemState>(initialSidebarItem);
  const [draggedUser, setDraggedUser] = useState<UserData | null>(null);
  const [approvedraggedUser, setApprovedDragedUser] = useState<UserData | null>(
    null,
  );
  const [showOverlay, setShowOverlay] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const { programId } = useParams<{ programId: string }>();
  const [searchText, setSearchText] = useState<string>("");
  const [finalsearchText, setFinalSearchText] = useState<string>("");
  const [flippedUserId, setFlippedUserId] = useState<number | null>(null);
  const [flippedUserOverlayId, setFlippedUserOverlayId] = useState<
    number | null
  >(null);
  const [searchValue, setSearchValue] = useState({ value: "", open: false });
  const [selectedSeekerId, setSelectedSeekerId] = useState<any>();
  const [limit, setLimit] = useState(100);
  const [approvedUsers, setApprovedUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalReg, setTotalReg] = useState(0);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [filtering, setFiltering] = useState("total_unallocated");
  const [selectedSwapProgram, setSelectedSwapProgram] = useState<
    Record<string, any>
  >({});
  const [selectedSwapUser, setSelectedSwapUser] = useState<Record<string, any>>(
    {},
  );
  const [isCardClicked, setIsCardClicked] = useState(false);
  const [excludedUserId, setExcludedUserId] = useState<number | null | string>(
    null,
  );
  const [sessionSearchText, setSessionSearchText] = useState<string>("");
  const [isOverlayFromSessionGrid, setIsOverlayFromSessionGrid] =
    useState<boolean>(false);

  const [kpiData, setKpiData] = useState({
    unallocatedCounts: {
      totalUnallocatedCount: 0,
      totalMaleCount: 0,
      totalFemaleCount: 0,
    },
    unallocatedPrograms: [],
    allocatedPrograms: [],
    allocatedCounts: {},
    allKpi: {},
    swapRequests: [],
    swapDemands: [],
    cancelledCounts: {},
    defaulters: {}
  });
  const [paginationProps, setPaginationProps] = useState({
    pageSize: 100,
    totalRecords: 0,
    currentPage: 1,
  });
  const [sessionpaginationProps, setSessionPaginationProps] = useState({
    sessionpageSize: 100,
    sessiontotalRecords: 0,
    sessioncurrentPage: 1,
  });
  const [overlayLoader, setOverlayLoader] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState<{ [key: string]: any }>(
    {},
  );
  const [toolbarkpi,setToolbarKpi] = useState<any>([])
  const observer = useRef<IntersectionObserver>();
  const isSearching = useRef(false); // Add flag to track search state
  const userId = getItemInLocalStorage("seekerDetails")?.id;

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);

    // If input is empty, immediately trigger search to show all results
    if (value.trim() === "") {
      setFinalSearchText("");
    }
  };


  const [sortState, setSortState] = useState<SortState>({
    sortKey: '',
    sortOrder: 'asc'
  });
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);


const handleSort = (sortValue: string | boolean, isClicked: boolean = false) => {
  if (sortValue === false) {
    setSortState(prev => ({
      sortKey: '',
      sortOrder: 'asc'
    }));
    return;
  }

  // Find the initial sort order from configuration
  const getInitialSortOrder = (sortKey: string) => {
    const sortOption = sortOptions.find(option => option.value === sortKey);
    return sortOption?.initialOrder || 'asc';
  };

  // If it's a new sort key or no current sort key, use initial order
  const isNewSortKey = sortState.sortKey !== sortValue || sortState.sortKey === '';
  
  // FIX: Only toggle when explicitly clicked from preference dropdown
  const newSortOrder = isNewSortKey 
    ? getInitialSortOrder(sortValue as string)
    : isClicked ? (sortState.sortOrder === 'asc' ? 'desc' : 'asc') : sortState.sortOrder;

  setSortState(prev => ({
    sortKey: sortValue,
    sortOrder: newSortOrder
  }));

  setPaginationProps((prev) => ({
    ...prev,
    currentPage: 1,
  }));

  loadUsers(
    0,
    true,
    appliedFilters,
    {
      ...filterItem,
      kpiFilter: filterItem?.kpiFilter || "total_unallocated",
      kpiCategory: filterItem?.kpiCategory || "unallocated",
      sortKey: sortValue,
      sortOrder: newSortOrder,
    },
  );

  setIsSortDropdownOpen(false);
};


  const [isGroupedProgram, setIsGroupedProgram] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [dragPreview, setDragPreview] = useState<{
    x: number;
    y: number;
    user: UserData | null;
  }>({
    x: 0,
    y: 0,
    user: null,
  });
  const [dragOverSessionId, setDragOverSessionId] = useState<
    string | number | null
  >(null);
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [seatAllocFilters, setSeatAllocFilters] = useState<any>({});
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [filterItem, setFilterItem] = useState<any>(null);
  const seekerDetails = getItemInLocalStorage("seekerDetails");
  const scrollableRef = useRef<HTMLDivElement>(null); 

  const getProgram = useCallback(async () => {
    try {
      const response = await ApiService.getProgramByID({
        programId: programId, 
      });
      const responseData: ProgramResponse = response.data.data;
      dispatch(setProgramName(response?.data?.data?.name));
      setIsGroupedProgram(responseData.type.isGroupedProgram);

      // Convert AllocatedKpiData directly to sessions
    } catch (error) {
      console.error("Error fetching program details:", error);
    }
  }, [programId]);
  
  useEffect(() => {
    if (programId) {
      getProgram();
    } else {
      console.error("Program ID is not available");
    }
  }, [programId]);

  useEffect(() => {
    const { pageSize, currentPage } = paginationProps;
    const offset = (currentPage - 1) * pageSize;

    if (!isDropdownUserList) {
      // Always send { kpiCategory: "all", kpiFilter: "all" } for "All"
      const newFilterItem = {
        ...filterItem, // preserves previous filters like gender/preferredRoomMate
        kpiCategory: selectedSidebarItem?.kpiCategory,
        kpiFilter: selectedSidebarItem?.kpiFilter,
        gender: selectedSidebarItem?.gender,
        searchText: finalsearchText || searchText,
        sortKey: sortState.sortKey,
        sortOrder: sortState.sortOrder,
        approvalStatus: selectedSidebarItem?.kpiCategory,
        filters: selectedSidebarItem?.filters || {},
        swapRequests:
          selectedSidebarItem?.kpiFilter === "swap-requests" ||
            selectedSidebarItem?.swap === "swap-requests"
            ? "wants_swap"
            : null,
        preferredRoomMate:
          selectedSidebarItem?.preferredRoomMate === "preferredRoomMate"
            ? "yes"
            : null,
      };

      loadUsers(offset, true, appliedFilters, newFilterItem);
      setFilterItem(newFilterItem);
    } else if (isDropdownUserList) {
      fetchData(currentSession);
    } else {
      loadUsers(offset, false);
    }
  }, [
    paginationProps.pageSize,
    paginationProps.currentPage,
    currentSession,
    finalsearchText,
    selectedOption?.value,
  ]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkActiveTabAndSetParams = () => {
      const activeTab = localStorage.getItem("hdb_active_tab");

      if (activeTab === "seat-allocations") {
        const params = new URLSearchParams(location.search);
        const currentDropdown = params.get("dropdown");
        const currentKpiCategory = params.get("kpiCategory");
        const currentKpiFilter = params.get("kpiFilter");
        const currentSidebarKey = params.get("sidebarKey");

        if (
          selectedOption?.label &&
          selectedSidebarItem?.kpiCategory &&
          selectedSidebarItem?.kpiFilter &&
          (currentDropdown !== selectedOption.label ||
            currentKpiCategory !== selectedSidebarItem.kpiCategory ||
            currentKpiFilter !== selectedSidebarItem.kpiFilter ||
            currentSidebarKey !== selectedSidebarItem.key)
        ) {
          params.set("dropdown", selectedOption.label);
          params.set("kpiCategory", selectedSidebarItem.kpiCategory);
          params.set("kpiFilter", selectedSidebarItem.kpiFilter);
          params.set("sidebarKey", selectedSidebarItem?.key);
          if (selectedSidebarItem?.kpiFilter === "swap-requests") {
            params.set("filters", JSON.stringify(selectedSidebarItem.filters));
          }
          navigate({ search: params.toString() }, { replace: true });
        }
      }
    };

    const interval = setInterval(checkActiveTabAndSetParams, 500);

    return () => {
      clearInterval(interval);
    };
  }, [sessions, selectedSidebarItem, navigate, location.search]);

  const resetPagination = () => {
    setPaginationProps((prev) => ({
      ...prev,
      totalRecords: 0,
      currentPage: 1,
    }));
  };
  const formatSessionsWithSpecial = (responseData: any) => {
    // Map program sessions
    const programSessions =
      responseData.kpis.mahatria.groupedProgramMetrics.allocated.programs?.map(
        (program) => ({
          id: program.programId,
          name: program.programName,
          type: "HDB",
          level: 1,
          totalSeekers: program.totalSeatsCount,
          totalBeds: program.totalBedCount,
          kpiFilter: program.kpiFilter,
          kpiCategory: program.kpiCategory,
          assignedUsers: [],
          allocatedCount: program.allocatedCount,
          organisationUserCount: program.organisationUserCount,
          startsAt : program?.startsAt,
          blessEndsAt : program?.blessEndsAt

        }),
      );

    // Get hold and reject counts
    const holdCount =
      responseData?.kpis?.mahatria?.groupedProgramMetrics?.allocated?.totals
        .holdCount || 0;
    const rejectCount =
      responseData.kpis?.mahatria?.groupedProgramMetrics?.allocated?.totals
        ?.rejectCount || 0;

    // Get YTD count from swapDemands (similar to swap requests)
    const swapDemandsArray = responseData?.kpis?.mahatria?.groupedProgramMetrics?.swapDemands || [];
    const ytdMaleCount = swapDemandsArray
      ?.filter((program: any) => program?.kpiName === "male")
      .reduce((sum: number, program: any) => sum + Number(program?.count || 0), 0);
    const ytdFemaleCount = swapDemandsArray
      ?.filter((program: any) => program?.kpiName === "female")
      .reduce((sum: number, program: any) => sum + Number(program?.count || 0), 0);
    const ytdTotalCount = ytdMaleCount + ytdFemaleCount;

    // Combine with special sessions
    return [
      ...programSessions,
      {
        id: "hold",
        name: "Hold",
        type: "hold",
        kpiFilter: rejectCount.kpiFilter,
        kpiCategory: rejectCount.kpiCategory,
        totalSeekers: rejectCount.value,
        assignedUsers: [],
        allocatedCount: rejectCount.value,
      },
      {
        id: "yet-to-decide",
        name: ApprovalStatus.YTD,
        type: "yet-to-decide",
        kpiFilter: holdCount.kpiFilter,
        kpiCategory: holdCount.kpiCategory,
        totalSeekers: ytdTotalCount,
        assignedUsers: [],
        allocatedCount: ytdTotalCount,
      },
    ];
  };

  const loadUsers = useCallback(
    async (
      offset = 0,
      reset = false,
      appliedFilter?: any,
      filterItem?: any,
      // sort: SortState = sortState,
    ) => {
      // if (loading) return;

      if (reset) {
        isSearching.current = true;
        if (observer.current) {
          observer.current.disconnect();
        }
      }

      try {
        const response = await ApiService.getRegistrationApprovals({
          programId: programId,
          limit: paginationProps.pageSize,
          kpiFilter: filterItem?.kpiFilter || filterItem || filtering,
          gender: filterItem?.gender || null,
          offset,
          search: finalsearchText || filterItem?.searchText || searchText,
          mahatriaChoice: filterItem === "mahatria-choice",
          approvalStatus: filterItem?.approvalStatus || "unallocated",
          swapRequests: filterItem?.swapRequests || null,
          preferredRoomMate: filterItem?.preferredRoomMate || null,
          appliedFilters: appliedFilter,
          programPreference: filterItem?.programPreference,
          kpifilters: {
            ...filterItem?.filters,
          },
          sortKey: filterItem.sortKey || sortState?.sortKey || "",
          sortOrder: filterItem.sortOrder || sortState?.sortOrder || "asc",
        });

        const responseData = response.data.data;
        if (responseData?.pagination) {
          setPaginationProps((prev) => {
            return {
              ...prev,
              totalRecords: responseData?.pagination.totalRecords,
            };
          });
        }
        setToolbarKpi(responseData?.kpis?.mahatria?.groupedProgramMetrics);
        dispatch(setSeatApprovalToolbarKpi(responseData?.kpis?.mahatria?.groupedProgramMetrics));
        setKpiData({
          unallocatedCounts:
            responseData?.kpis.mahatria.groupedProgramMetrics.unallocated,
          unallocatedPrograms:
            responseData?.kpis.mahatria.groupedProgramMetrics.unallocated
              .programs,
          allocatedPrograms:
            responseData?.kpis.mahatria.groupedProgramMetrics.allocated
              .programs,
          allocatedCounts:
            responseData?.kpis.mahatria.groupedProgramMetrics.allocated,
          allKpi:
            responseData?.kpis.mahatria.groupedProgramMetrics?.allKpis || {},
          swapRequests:
            responseData?.kpis.mahatria.groupedProgramMetrics?.swapRequests ||
            [],
          swapDemands:
            responseData?.kpis.mahatria.groupedProgramMetrics?.swapDemands ||
            [],
          cancelledCounts:
            responseData?.kpis?.mahatria?.groupedProgramMetrics?.cancelledKpis || {},
          defaulters:
            responseData?.kpis?.mahatria?.groupedProgramMetrics?.defaulters || {},
        });

        const sessionsWithSpecial = formatSessionsWithSpecial(responseData);

        setSessions(sessionsWithSpecial);
        dispatch(setSeatApprovalSessions(sessionsWithSpecial)); 
        const newUsers = mapApiDataToUserCards(response.data.data.data, true);
        if (reset) {
          setUsers(newUsers);
          setApprovedUsers(newUsers);
        } else {
          setUsers((prev) => [...prev, ...newUsers]);
        }
        setTotalRecords(response.data.data.pagination.totalRecords);
        setHasMore(
          newUsers.length > 0 &&
          (reset ? newUsers.length : users.length + newUsers.length) <
          response.data.data.pagination.totalRecords,
        );
        setSeatAllocFilters(responseData.filters || {});
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        if (reset) {
          setTimeout(() => {
            isSearching.current = false;
          }, 100);
        }
      }
    },
    [
      selectedOption,
      programId,
      limit,
      loading,
      finalsearchText,
      paginationProps.pageSize,
      sortState.sortKey,
      sortState.sortOrder
    ],
  );

  const handleSidebarItemClick = (item: any) => {
    setPaginationProps((prev) => ({
      ...prev,
      currentPage: 1,
    }));
    setIsDropdownUserList(false);
    setDropdownAllocatedSessionId(null);
    setFlippedUserId(null);

    handleCancelSwap();
    
    // Handle YTD program filters (similar to swap requests)
    if (selectedOption?.label === ApprovalStatus.YTD && item.key?.startsWith("ytd_") && !item.key?.includes("_male") && !item.key?.includes("_female") && !item.key?.includes("_total")) {
      setSelectedSidebarItem({
        ...item,
        kpiFilter: item.kpiFilter || "hold",
        kpiCategory: item.kpiCategory || "allocated",
        filters: item?.filters || {},
      });
      loadUsers(
        0,
        true,
        {},
        {
          kpiFilter: item.kpiFilter,
          approvalStatus: item.kpiCategory,
          filters: item?.filters,
        },
      );
      setFilterItem({
        kpiFilter: item.kpiFilter,
        approvalStatus: item.kpiCategory,
        filters: item?.filters,
      });
      return;
    }
    
    if (selectedOption?.label === "Swap request" || item?.label === "Swap request") {
      setSelectedSidebarItem({
        ...item,
        kpiFilter: item.kpiFilter || "swap-requests",
        kpiCategory: item.kpiCategory || "all",
        swap: "swap-requests",
        filters: item?.filters || {},
      });
      loadUsers(
        0,
        true,
        {},
        {
          kpiFilter: item.kpiFilter,
          approvalStatus: item.kpiCategory,
          swapRequests: "wants_swap",
          filters: item?.filters,
        },
      );
      setFilterItem({
        kpiFilter: item.kpiFilter,
        approvalStatus: item.kpiCategory,
        swapRequests: "wants_swap",
        filters: item?.filters,
      });
      return;
    }
    
    // Handle Pending program filters with gender
    if (selectedOption?.label === "Pending") {
      const gender = item.key?.includes("_male") ? "male" : item.key?.includes("_female") ? "female" : null;
      
      setSelectedSidebarItem({
        ...item,
        kpiFilter: item.kpiFilter || DROPDOWNFILTERS.pending.kpiFilter,
        kpiCategory: item.kpiCategory || DROPDOWNFILTERS.pending.kpiCategory,
        gender: gender,
        filters: item?.filters || {},
      });
      
      const filterParams = {
        kpiFilter: item.kpiFilter || DROPDOWNFILTERS.pending.kpiFilter,
        approvalStatus: item.kpiCategory || DROPDOWNFILTERS.pending.kpiCategory,
        gender: gender,
        filters: item?.filters || {},
      };
      
      
      loadUsers(0, true, {}, filterParams);
      setFilterItem(filterParams);
      return;
    }
    if (item?.label === "RoommatePreference") {
      setSelectedSidebarItem({
        ...item,
        kpiFilter: item.kpiFilter || "roommate-preference",
        kpiCategory: item.kpiCategory || "all",
        preferredRoomMate: "preferredRoomMate",
      });

      loadUsers(
        0,
        true,
        {},
        {
          kpiFilter: item.kpiFilter,
          approvalStatus: item.kpiCategory,
          preferredRoomMate: "yes",
        },
      );
      setFilterItem({
        kpiFilter: item.kpiFilter,
        approvalStatus: item.kpiCategory,
        preferredRoomMate: "yes",
      });
      return;
    }

    setFiltering(item);

    resetPagination(); // Reset pagination when changing sidebar item

    if (observer.current) {
      observer.current.disconnect();
    }


    // setSelectedSidebarItem(item);
    setUsers([]);
    setHasMore(true);
    setAppliedFilters({});

    // Get current program from dropdown
    const selectedProgram = kpiData.allocatedPrograms.find(
      (program) => program.programName === selectedOption?.label,
    );

    // Determine if we should include gender filter
    const shouldUseGender =
      selectedOption?.label?.startsWith("HDB") ||
      selectedOption?.label?.startsWith("MSD") ||
      selectedOption?.label === "Hold" ||
      selectedOption?.label === ApprovalStatus.YTD||
      selectedOption?.label === "Blessed" ||
      selectedOption?.label === "Swap Request"
      || selectedOption?.label === dropDownnJSON.PENDING.label;
    let gender = null;
    if (item.key && item.key.includes("_male")) {
      gender = "male";
    } else if (item.key && item.key.includes("_female")) {
      gender = "female";
    }
    setSelectedSidebarItem({
      ...item,
      gender: gender, // Add gender property
    });

    if (shouldUseGender) {
      // Extract gender from item key instead of toString()
     const filterParams = {
      kpiFilter: item.kpiFilter,
          gender: gender,
          approvalStatus: item?.kpiCategory,
          ...(item.filters && { filters: item.filters }),
     }
      if (item.programPreference) {
        filterParams.programPreference = item.programPreference;
      }
loadUsers(0, true, {}, filterParams);
      setFilterItem(filterParams);
    } else if (item.key?.includes("_swap")) {
      setSelectedSidebarItem({
        ...item,
        kpiFilter: item.kpiFilter || "swap-requests",
        kpiCategory: item.kpiCategory || "allocated",
        filters: item?.filters || {},
      });
      loadUsers(
        0,
        true,
        {},
        {
          kpiFilter: item.kpiFilter,
          swapRequests: "wants_swap",
          approvalStatus: "allocated",
        },
      );
      setFilterItem({
        kpiFilter: item.kpiFilter,
        swapRequests: "wants_swap",
        approvalStatus: "allocated",
      });
    } else {
      // Normal filter behavior for other cases

      loadUsers(
        0,
        true,
        {},
        {
          kpiFilter: item.kpiFilter,
          approvalStatus: item?.kpiCategory,
        },
      );
      setFilterItem({
        kpiFilter: item.kpiFilter,
        approvalStatus: item?.kpiCategory,
      });
    }
  };

  const loadMore = useCallback(() => {
    if (!loading && hasMore && !isSearching.current && users.length > 0) {
      loadUsers(users.length, false);
    }
  }, [loading, hasMore, users.length, totalRecords]);

  const handleSearch = (query: string) => {
    setFinalSearchText(query.trim());
    if (query === "") {
      setPaginationProps((prev) => ({
        ...prev,
        currentPage: 1,
      }));
    }
  };

  const padCount = (count: number) => (count < 10 ? `0${count}` : `${count}`);

  const getFilteredUsers = () => {
    let filtered = users.filter((user) => !user.isAssigned);

    return filtered;
  };

  const calculateProgramMetrics = (kpiData: any) => {
    if (!kpiData) return [];
    if (selectedOption?.value === "all") {
      return [
        {
          programId: 0,
          programName: "Total",
          count: kpiData?.allKpi?.totalRegistrations,
          key: "total",
          kpiFilter: "all",
          kpiCategory: "all",
          label: "Total",
          maleCount:
            kpiData?.unallocatedCounts?.totals?.totalMaleCount?.value || 0,
          femaleCount:
            kpiData?.unallocatedCounts?.totals?.totalFemaleCount?.value || 0,
          totalSeatsCount: kpiData?.allKpi?.totalRegistrations,
          icon: userCircleDashed,
          showIcon: true,
        },
        {
          programId: 1,
          programName: "Any HDB/MSD",
          key: "mahatria-choice",
          count: kpiData?.allKpi?.mahatriaChoicesRegistrations || 0,
          kpiFilter: "mahatria-choice",
          kpiCategory: "all",
          label:
            kpiData?.unallocatedCounts?.totals?.totalMahatriaChoiceCount?.label,
          maleCount: 0,
          femaleCount: 0,
          totalSeatsCount: kpiData?.allKpi?.mahatriaChoicesRegistrations || 0,
        },
        ...(kpiData?.unallocatedPrograms || [])?.map((program: any, index) => ({
          programId: program.programId,
          programName: program.programName,
          count: kpiData?.allKpi?.subProgramMetrics?.[index]?.count || 0,
          key: program.kpiFilter,
          kpiFilter: program.kpiFilter,
          kpiCategory: "all",
          label: `${program.programName}`,
          maleCount: program.maleCount,
          femaleCount: program.femaleCount,
          totalSeatsCount:
            kpiData?.allKpi?.subProgramMetrics?.[index]?.count || 0,
        })),
        {
          key: kpiData.unallocatedCounts?.totals?.totalMaleCount.kpiFilter,
          kpiFilter:
            kpiData.unallocatedCounts?.totals?.totalMaleCount.kpiFilter,
          kpiCategory: "all",
          icon: male,
          label: kpiData.unallocatedCounts?.totals?.totalMaleCount.label,
          count: kpiData?.allKpi?.maleRegistrations || 0,
          showIcon: true,
        },
        {
          key: kpiData.unallocatedCounts?.totals?.totalFemaleCount.kpiFilter,
          kpiFilter:
            kpiData.unallocatedCounts?.totals?.totalFemaleCount.kpiFilter,
          kpiCategory: "all",
          icon: female,
          label: kpiData.unallocatedCounts?.totals?.totalFemaleCount.label,
          count: kpiData?.allKpi?.femaleRegistrations || 0,
          showIcon: true,
        },
      ];
    }

    return [];
  };

    const calculateProgramDefaulter = (kpiData: any) => {
    if (!kpiData) return [];
      return [
        {
          programId: 0,
          programName: textConstant.TOTAL,
          count: kpiData?.defaulters?.totalRegistrations,
          key: textConstant.DEFAULTERS_TOTAL,
          kpiFilter: textConstant.ALL,
          kpiCategory: textConstant.DEFAULTER,
          label: textConstant.TOTAL,
          maleCount:
            kpiData?.unallocatedCounts?.totals?.totalMaleCount?.value || 0,
          femaleCount:
            kpiData?.unallocatedCounts?.totals?.totalFemaleCount?.value || 0,
          totalSeatsCount: kpiData?.allKpi?.totalRegistrations,
          icon: userCircleDashed,
          showIcon: true,
        },
        {
          programId: 1,
          programName: LABEL_ANY_HDB_MSD,
          key: textConstant.MAHATRIACHOICE,
          count: kpiData?.defaulters?.mahatriaChoicesRegistrations || 0,
          kpiFilter: textConstant.MAHATRIACHOICE,
          kpiCategory: textConstant.DEFAULTER,
          label:
            kpiData?.unallocatedCounts?.totals?.totalMahatriaChoiceCount?.label,
          maleCount: 0,
          femaleCount: 0,
          totalSeatsCount: kpiData?.defaulters?.mahatriaChoicesRegistrations || 0,
        },
        ...(kpiData?.unallocatedPrograms || [])?.map((program: any, index) => ({
          programId: program.programId,
          programName: program.programName,
          count: kpiData?.defaulters?.subProgramMetrics?.[index]?.count || 0,
          key: program.kpiFilter,
          kpiFilter: program.kpiFilter,
          kpiCategory: textConstant.DEFAULTER,
          label: `${program.programName}`,
          maleCount: program.maleCount,
          femaleCount: program.femaleCount,
          totalSeatsCount:
            kpiData?.defaulters?.subProgramMetrics?.[index]?.count || 0,
        })),
        {
          key: kpiData.unallocatedCounts?.totals?.totalMaleCount.kpiFilter,
          kpiFilter:
            kpiData.unallocatedCounts?.totals?.totalMaleCount.kpiFilter,
          kpiCategory: textConstant.DEFAULTER,
          icon: male,
          label: kpiData.unallocatedCounts?.totals?.totalMaleCount.label,
          count: kpiData?.defaulters?.maleRegistrations || 0,
          showIcon: true,
        },
        {
          key: kpiData.unallocatedCounts?.totals?.totalFemaleCount.kpiFilter,
          kpiFilter:
            kpiData.unallocatedCounts?.totals?.totalFemaleCount.kpiFilter,
          kpiCategory: textConstant.DEFAULTER,
          icon: female,
          label: kpiData.unallocatedCounts?.totals?.totalFemaleCount.label,
          count: kpiData?.defaulters?.femaleRegistrations || 0,
          showIcon: true,
        },
      ];

  };

  const getFilteredSidebarItems = () => {
    const isCancelled = selectedOption?.label ===  dropDownnJSON.CANCELLED.label;
    const isHDBorMSD =
      selectedOption?.label?.startsWith("HDB") ||
      selectedOption?.label?.startsWith("MSD");
    const isSwapRequest = selectedOption?.label === "Swap request";
    const isRegistered = selectedOption?.label === "Unassigned";
    const allApplied = selectedOption?.label === "All";
    const isHold = selectedOption?.label === "Hold";
    const isYetToDecide = selectedOption?.label === ApprovalStatus.YTD;
    const isBlessed = selectedOption?.label === "Blessed";
    const isPending = selectedOption?.label === dropDownnJSON.PENDING.label;
    const isDefaulter = selectedOption?.label === dropDownnJSON.DEFAULTERS.label;

    if (isHDBorMSD) {
      const selectedProgram = kpiData?.allocatedPrograms?.find(
        (program) =>
          program.programName === selectedOption.data?.name ||
          program.programName === selectedOption.label.replace(" blessed", ""),
      );

      if (selectedProgram) {
        return [
          {
            key: `${selectedProgram.kpiFilter}_total`,
            kpiFilter: selectedProgram.kpiFilter,
            kpiCategory: selectedProgram.kpiCategory,
            icon: totalusers,
            label: "total",
            count:
              selectedProgram?.maleCount + selectedProgram?.femaleCount || 0,
            showIcon: true,
          },
          {
            key: `${selectedProgram.kpiFilter}_male`,
            kpiFilter: selectedProgram.kpiFilter,
            kpiCategory: selectedProgram.kpiCategory,
            icon: male,
            label: "Male",
            count: selectedProgram.maleCount,
            showIcon: true,
          },
          {
            key: `${selectedProgram.kpiFilter}_female`,
            kpiFilter: selectedProgram.kpiFilter,
            kpiCategory: selectedProgram.kpiCategory,
            icon: female,
            label: "Female",
            count: selectedProgram.femaleCount,
            showIcon: true,
          },
          {
            key: `${selectedProgram.kpiFilter}_swap`, // Unique key
            kpiFilter: selectedProgram.kpiFilter,
            kpiCategory: selectedProgram.kpiCategory,
            icon: swap,
            label: "Swap request",
            count: selectedProgram?.swapRequestsCount || 0,
            showIcon: true,
          },
          {
            key: `${selectedProgram.kpiFilter}_roommate_preference`, // Unique key
            kpiFilter: selectedProgram.kpiFilter,
            kpiCategory: selectedProgram.kpiCategory,
            icon: roommate_preference,
            label: "RoommatePreference",
            count: selectedProgram?.roomMatePreferenceCount || 0,
            showIcon: true,
          },
        ];
      }
    }
    else if(isBlessed){
      const countsReference = kpiData?.allocatedCounts?.totals?.blessedCount;
     
      return [
        {
          key: `total_blessed`,
          kpiFilter: "blessed",
          kpiCategory: "allocated",
          icon: totalusers,
          label: "total",
          count: countsReference?.allocatedCount || 0,
          showIcon: true,
        },
        {
          key: `blessed_male`,
          kpiFilter:"blessed",
          kpiCategory: "allocated",
          icon: male,
          label: "Male",
          count: countsReference?.maleCount || 0,
          showIcon: true,
        },
        {
          key: `blessed_female`,
          kpiFilter: "blessed",
          kpiCategory: "allocated",
          icon: female,
          label: "Female",
          count: countsReference?.femaleCount || 0,
          showIcon: true,
        },
        {
          key: `blessed_swap`, // Unique key
          kpiFilter: "blessed",
          kpiCategory: "allocated",
          icon: swap,
          label: "Swap request",
          count:  countsReference?.swapRequestsCount || 0,
          showIcon: true,
        },
        {
          key: `blessed_roommate_preference`, // Unique key
          kpiFilter: "blessed",
          kpiCategory: "allocated",
          icon: roommate_preference,
          label: "RoommatePreference",
          count: countsReference?.roomMatePreferenceCount || 0,
          showIcon: true,
        },
      ];

    }
     else if (isRegistered) {
      return [
        {
          key: kpiData.unallocatedCounts?.totals?.totalUnallocatedCount
            .kpiFilter,
          kpiFilter:
            kpiData.unallocatedCounts?.totals?.totalUnallocatedCount.kpiFilter,
          kpiCategory:
            kpiData.unallocatedCounts?.totals?.totalUnallocatedCount
              .kpiCategory,
          icon: userCircleDashed,
          label: kpiData.unallocatedCounts?.totals?.totalUnallocatedCount.label,
          count: kpiData.unallocatedCounts?.totals?.totalUnallocatedCount.value,
          showIcon: true,
        },
        {
          key: kpiData.unallocatedCounts?.totals?.totalMahatriaChoiceCount
            .kpiFilter,
          kpiFilter:
            kpiData.unallocatedCounts?.totals?.totalMahatriaChoiceCount
              ?.kpiFilter,
          kpiCategory:
            kpiData.unallocatedCounts?.totals?.totalMahatriaChoiceCount
              ?.kpiCategory,
          icon: "",
          label:
            kpiData.unallocatedCounts?.totals?.totalMahatriaChoiceCount?.label,
          count:
            kpiData.unallocatedCounts?.totals?.totalMahatriaChoiceCount?.value,
          showIcon: false,
        },
        ...kpiData.unallocatedPrograms?.map((program) => ({
          key: program.kpiFilter,
          kpiFilter: program.kpiFilter,
          kpiCategory: program.kpiCategory,
          icon: "",
          label: `${program.programName}`,
          count: program.count,
          showIcon: false,
        })),
        {
          key: kpiData.unallocatedCounts?.totals?.totalMaleCount.kpiFilter,
          kpiFilter:
            kpiData.unallocatedCounts?.totals?.totalMaleCount.kpiFilter,
          kpiCategory:
            kpiData.unallocatedCounts?.totals?.totalMaleCount.kpiCategory,
          icon: male,
          label: kpiData.unallocatedCounts?.totals?.totalMaleCount.label,
          count: kpiData.unallocatedCounts?.totals?.totalMaleCount.value,
          showIcon: true,
        },
        {
          key: kpiData.unallocatedCounts?.totals?.totalFemaleCount.kpiFilter,
          kpiFilter:
            kpiData.unallocatedCounts?.totals?.totalFemaleCount.kpiFilter,
          kpiCategory:
            kpiData.unallocatedCounts?.totals?.totalFemaleCount.kpiCategory,
          icon: female,
          label: kpiData.unallocatedCounts?.totals?.totalFemaleCount.label,
          count: kpiData.unallocatedCounts?.totals?.totalFemaleCount.value,
          showIcon: true,
        },
      ];
    } else if (allApplied) {
      return calculateProgramMetrics(kpiData);
    } 
    else if (isDefaulter) {
      return calculateProgramDefaulter(kpiData);
    }
    else if (isSwapRequest) {
          const swapRequestsArray = Array.isArray(kpiData?.swapRequests) ? kpiData?.swapRequests : [];
      const swapMaleCount = swapRequestsArray
        ?.filter((program) => program?.kpiName === "male")
        .reduce((sum, program) => sum + Number(program?.count || 0), 0);

      const swapFemaleCount = swapRequestsArray
        ?.filter((program) => program?.kpiName === "female")
        .reduce((sum, program) => sum + Number(program?.count || 0), 0);
      return [
        {
          key: "swap_total",
          kpiCategory: "all",
          kpiFilter: "swap-requests",
          label: "Total",
          count: swapMaleCount + swapFemaleCount,
          icon: userCircleDashed,
          showIcon: true,
        },
        ...swapRequestsArray.map((program) => ({
          key: program?.kpiName,
          kpiCategory: "all",
          kpiFilter: "swap-requests",
          icon: program?.kpiName === "male" ? male : female,
          label: `${program?.kpiName}`,
          filters: program?.filters,
          count: program?.count,
          showIcon: !(
            program?.kpiName?.toLowerCase().includes("msd") ||
            program?.kpiName?.toLowerCase().includes("hdb")
          ),
        })),
      ];
    } else if (isPending) {
      const registrationPendingsArray = Array.isArray(toolbarkpi?.registrationPendings) ? toolbarkpi?.registrationPendings : [];
      
      // Calculate male and female counts from registrationPendings
      const pendingMaleCount = registrationPendingsArray
        ?.filter((program) => program?.kpiName === "male")
        .reduce((sum, program) => sum + Number(program?.count || 0), 0);

      const pendingFemaleCount = registrationPendingsArray
        ?.filter((program) => program?.kpiName === "female")
        .reduce((sum, program) => sum + Number(program?.count || 0), 0);

      // Filter out gender entries and get only program entries
      const programPendings = registrationPendingsArray.filter(
        (program) => program?.kpiName !== "male" && program?.kpiName !== "female"
      );

      return [
        {
          key: DROPDOWNFILTER_SIDEBARITEMS.pending.total,
          kpiCategory: DROPDOWNFILTERS.pending.kpiCategory,
          kpiFilter: DROPDOWNFILTERS.pending.kpiFilter,
          label: "Total",
          count: pendingMaleCount + pendingFemaleCount,
          icon: userCircleDashed,
          showIcon: true,
        },
        ...programPendings.map((program) => ({
          key: `pending_${program?.kpiName}`,
          kpiCategory: DROPDOWNFILTERS.pending.kpiCategory,
          kpiFilter: DROPDOWNFILTERS.pending.kpiFilter,
          icon: "",
          label: program?.kpiName,
          count: program?.count || 0,
          filters: program?.filters || {},
          showIcon: false,
        })),
        {
          key: "pending_male",
          kpiCategory: DROPDOWNFILTERS.pending.kpiCategory,
          kpiFilter: DROPDOWNFILTERS.pending.kpiFilter,
          icon: male,
          label: "male",
          count: pendingMaleCount,
          showIcon: true,
        },
        {
          key: "pending_female",
          kpiCategory: DROPDOWNFILTERS.pending.kpiCategory,
          kpiFilter: DROPDOWNFILTERS.pending.kpiFilter,
          icon: female,
          label: "female",
          count: pendingFemaleCount,
          showIcon: true,
        },
      ];
    } else if (isHold) {
      return [
        {
          key: "hold_total",
          kpiCategory: "allocated",
          kpiFilter: "reject",
          label: "Total",
          count:
            Number(kpiData.allocatedCounts?.totals?.rejectCount?.maleCount) +
            Number(kpiData.allocatedCounts?.totals?.rejectCount?.femaleCount),
          icon: userCircleDashed,
          showIcon: true,
        },
        ...(kpiData?.allocatedCounts?.totals?.rejectCount?.preferredPrograms || []).map((program) => ({
          key: `${program?.programName}`,
          kpiFilter: "reject",
          kpiCategory: "allocated",
          icon: "",
          label: `${program?.programName}`,
          count: program?.count,
          programPreference: program?.programId,
          showIcon: false,
        })),
        {
          key: "hold_male",
          kpiCategory: "allocated",
          kpiFilter: "reject",
          icon: male,
          label: "male",
          count: kpiData.allocatedCounts?.totals?.rejectCount?.maleCount,
          showIcon: true,
        },
        {
          key: "hold_female",
          kpiCategory: "allocated",
          kpiFilter: "reject",
          icon: female,
          label: "female",
          count: kpiData.allocatedCounts?.totals?.rejectCount?.femaleCount,
          showIcon: true,
        },
      ];
    } else if (isYetToDecide) {
      const swapDemandsArray = Array.isArray(kpiData?.swapDemands) ? kpiData?.swapDemands : [];
      
      // Calculate male and female counts from swapDemands
      const ytdMaleCount = swapDemandsArray
        ?.filter((program) => program?.kpiName === "male")
        .reduce((sum, program) => sum + Number(program?.count || 0), 0);

      const ytdFemaleCount = swapDemandsArray
        ?.filter((program) => program?.kpiName === "female")
        .reduce((sum, program) => sum + Number(program?.count || 0), 0);

      // Filter out gender entries and get only program entries
      const programDemands = swapDemandsArray.filter(
        (program) => program?.kpiName !== "male" && program?.kpiName !== "female"
      );

      return [
        {
          key: "yet-to-decide_total",
          kpiCategory: "allocated",
          icon: totalusers,
          label: "Total",
          kpiFilter: "hold",
          count: ytdMaleCount + ytdFemaleCount,
          showIcon: true,
        },
        ...programDemands.map((program) => ({
          key: `ytd_${program?.kpiName}`,
          kpiFilter: "hold",
          kpiCategory: "allocated",
          icon: "",
          label: program?.kpiName,
          count: program?.count || 0,
          filters: program?.filters || {},
          showIcon: false,
        })),
        {
          key: "yet_to_decide_male",
          kpiCategory: "allocated",
          icon: male,
          kpiFilter: "hold",
          label: "male",
          count: ytdMaleCount,
          showIcon: true,
        },
        {
          key: "yet_to_decide_female",
          kpiCategory: "allocated",
          kpiFilter: "hold",
          icon: female,
          label: "female",
          count: ytdFemaleCount,
          showIcon: true,
        },
      ];
    }
    else if (isCancelled) {
      return [
        {
          key: "cancelled_total",
          kpiCategory: "cancelled",
          icon: totalusers,
          label: "Total",
          kpiFilter: "cancelled",
          count:
            Number(kpiData?.cancelledCounts?.totalCancelledRegistrations)  || 0 ,
          showIcon: true,
        },
        {
          key: "cancelled_male",
          kpiCategory: "cancelled",
          icon: male,
          kpiFilter: "male",
          label: "male",
          count: Number(kpiData?.cancelledCounts?.maleCancelledRegistrations)  || 0 ,
          showIcon: true,
        },
        {
          key: "cancelled_female",
          kpiCategory: "cancelled",
          kpiFilter: "female",
          icon: female,
          label: "female",
          count: Number(kpiData?.cancelledCounts?.femaleCancelledRegistrations)  || 0 ,
          showIcon: true,
        },

      
      ]}


    return [
      {
        key: "allocated_male",
        kpiCategory: "allocated",
        icon: male,
        label: "Male",
        count: kpiData.allocatedCounts?.totals?.totalMaleCount?.value || 0,
        showIcon: true,
      },
      {
        key: "allocated_female",
        kpiCategory: "allocated",
        icon: female,
        label: "Female",
        count: kpiData.allocatedCounts?.totals?.totalFemaleCount?.value || 0,
        showIcon: true,
      },
    ];
  };

  useEffect(() => {
    getFilteredSidebarItems();
  }, [kpiData]);

  const handleSwapDragOver = (e: React.DragEvent) => {
    // Prevent drop if there's already a card
    if (approvedraggedUser) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
  };

  const handleSwapDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSwapDrop = (e: React.DragEvent) => {
    e.preventDefault();

    // Don't allow drop if there's already a card
    if (approvedraggedUser) {
      return;
    }

    if (draggedUser) {
      if (selectedOption.data === "" && selectedOption.label !== "Swap") {
        setDraggedUser(null);
        setDragPreview({ x: 0, y: 0, user: null });
      } else {
        setApprovedDragedUser(draggedUser);
        setDraggedUser(null);
        setDragPreview({ x: 0, y: 0, user: null });
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, user: UserData) => {
    if (user.isPending) {
      e.preventDefault();
      return;
    }

    setDraggedUser(user);
    setApprovedDragedUser(null); // Reset approved dragged user
    e.dataTransfer.effectAllowed = "move";

    setDragPreview({
      x: e.clientX,
      y: e.clientY,
      user: user,
    });

    const emptyImg = document.createElement("img");
    emptyImg.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    e.dataTransfer.setDragImage(emptyImg, 0, 0);
    e.stopPropagation();
  };

  const handleDragEnd = () => {
    setDragPreview({ x: 0, y: 0, user: null });
    setDraggedUser(null);
    setDragOverSessionId(null);
  };

  const handleDragMove = (e: React.DragEvent) => {
    if (dragPreview.user) {
      setDragPreview((prev) => ({
        ...prev,
        x: e.clientX,
        y: e.clientY,
      }));
    }
  };

  const handleProgramSelect = (program: Record<string, any>) => {
    setSelectedSwapProgram(program);
  };
  const handleDragOver = (e: React.DragEvent, sessionId: string | number) => {
    const session = sessions.find((s) => s.id === sessionId);

    // Prevent drag if:
    // 1. Session already has users
    // 2. User's allocated program matches the drop target session
    if (session?.assignedUsers.length > 0 ||
                      (draggedUser?.approvalStatus === ApprovalStatus?.ON_HOLD &&
                        session?.name === ApprovalStatus?.YTD) ||
                        (draggedUser?.approvalStatus === ApprovalStatus?.REJECTED &&
                          session?.name === ApprovalStatus?.HOLD) ||
                      (draggedUser?.approvalStatus === ApprovalStatus?.REJECTED &&
                        session?.name === ApprovalStatus?.YTD) ||
                      draggedUser?.approvalStatus === ApprovalStatus?.CANCELLED ||
                      (session?.name === ApprovalStatus?.YTD &&
                      draggedUser?.approvalStatus === ApprovalStatus.PENDING) ||
                      draggedUser?.allocatedProgram?.name === session?.name ||
                      (session?.name === ApprovalStatus?.YTD && draggedUser?.swapRequests?.length === 0 &&
                        draggedUser?.approvalStatus === ApprovalStatus.APPROVED) 
                     
    ) {
      return;
    }

    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverSessionId(sessionId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSessionId(null);
  };

  const handleDrop = (e: React.DragEvent, sessionId: string | number) => {
    // e.preventDefault();
    setDragOverSessionId(null);

    const session = sessions.find((s) => s.id === sessionId);

    // Don't allow drop if:
    // 1. Session already has users
    // 2. No dragged user
    // 3. User's allocated program matches the drop target session
    if (session?.assignedUsers.length > 0 ||
      (draggedUser?.approvalStatus === ApprovalStatus?.ON_HOLD &&
        session?.name === ApprovalStatus?.YTD) ||
        (draggedUser?.approvalStatus === ApprovalStatus?.REJECTED &&
          session?.name === ApprovalStatus?.HOLD) ||
      (draggedUser?.approvalStatus === ApprovalStatus?.REJECTED &&
        session?.name === ApprovalStatus?.YTD) ||
      draggedUser?.approvalStatus === ApprovalStatus?.CANCELLED ||
       (session?.name === ApprovalStatus?.YTD &&
          draggedUser?.approvalStatus === ApprovalStatus.PENDING) ||
      draggedUser?.allocatedProgram?.name === session?.name ||
      (session?.name === ApprovalStatus?.YTD && draggedUser?.swapRequests?.length === 0 &&
        draggedUser?.approvalStatus === ApprovalStatus.APPROVED) 
    ) {
      return;
    }

    // Clear all users from all sessions
    setSessions((prev) =>
      prev?.map((session) => ({
        ...session,
        assignedUsers: [],
      })),
    );

    // Reset pending state for all users
    setUsers((prev) =>
      prev?.map((user) => ({
        ...user,
        isPending: user?.id === draggedUser?.id ? true : false,
        assignedSession: user?.id === draggedUser?.id ? sessionId : undefined,
      })),
    );

    // Add user to the new session
    setSessions((prev) =>
      prev?.map((session) =>
        session.id === sessionId
          ? {
            ...session,
            assignedUsers: [...session.assignedUsers, draggedUser],
          }
          : session,
      ),
    );

    // Reset drag states
    setDraggedUser(null);
    setDragPreview({ x: 0, y: 0, user: null });
  };

  const handleSessionClick = async (session: Session) => {
    setSelectedSession(session);
    setSessionId(session.id);
    setIsOverlayFromSessionGrid(true);
    setShowOverlay(true);

    let approvalStatus = "approved";
    if (session.type === "hold") {
      approvalStatus = "rejected";
    } else if (session.type === "yet-to-decide") {
      approvalStatus = "on_hold";
    }

    setIsLoading(true);
    await fetchApprovedUsersForSession(session);
  };

  const handleBlessed = async (
    seekerId: number,
    targetProgramId: number,
    swapType: string,
    swapRequestId?: number, // Add swapRequestId parameter
  ) => {
    try {
      let payload;
      let response;
      const swappingType = swapType || (selectedSwapUser?.id ? "swap" : "move");

      if (swapRequestId) {
        // Handle existing swap request
        payload = {
          status:
            targetProgramId === "hold"
              ? ApprovalStatus?.REJECTED
              : targetProgramId === "yet-to-decide"
                ? ApprovalStatus?.ON_HOLD
                : "accepted",
          // comment: "",
          movingSeekerRegistrationId:
            Number(approvedraggedUser?.registrationId) || Number(seekerId),
          ...(swappingType === "move" &&
            targetProgramId !== "hold" &&
            targetProgramId !== "yet-to-decide" && {
            movingToSubProgramId: targetProgramId?.id || targetProgramId,
          }),
          swappingType: swappingType,
          ...(swappingType === "swap" && {
            outgoingSeekerRegistrationId: Number(
              selectedSwapUser?.id || selectedSwapSeeker?.id,
            ),
          }),
        };
        response = await ApiService.updateSwapRequest(swapRequestId, payload);
      } else if (
        (Object.keys(selectedSwapProgram).length &&
          Object.keys(selectedSwapUser).length) ||
        selectedSwapSeeker?.id
      ) {
        // Handle new swap request
        payload = {
          status: "accepted",
          // comment: "",
          movingSeekerRegistrationId:
            Number(approvedraggedUser?.registrationId) || Number(seekerId),
          ...(swappingType === "move" && {
            movingToSubProgramId: targetProgramId?.id || targetProgramId,
          }),
          swappingType: swappingType,
          ...(swappingType === "swap" && {
            outgoingSeekerRegistrationId: Number(
              selectedSwapUser?.id || selectedSwapSeeker?.id,
            ),
          }),
        };
        response = await ApiService.blessSwapUser(payload);
      } else {
        // Handle normal blessing

        payload = {
          allocatedProgramId:
            targetProgramId?.id === "hold" ||
              targetProgramId === "hold" ||
              targetProgramId?.id === "yet-to-decide" ||
              targetProgramId === "yet-to-decide"
              ? null
              : targetProgramId?.id || targetProgramId,
          registrationId: Number(seekerId),
          approvalStatus:
            targetProgramId?.id === "hold" || targetProgramId === "hold"
              ? "rejected"
              : targetProgramId?.id === "yet-to-decide" ||
                targetProgramId === "yet-to-decide"
                ? "on_hold"
                : "approved",
          approvalDate: new Date().toISOString(),
          approvedBy: userId,
          updatedBy: userId,
        };
        response = await ApiService.blessUser(seekerId, payload);
      }

      if (response.data.statusCode === 200) {
        setApprovedDragedUser(null);
        setShowBlessCard(false);
        setSessions((prev) =>
          prev?.map((session) => ({
            ...session,
            assignedUsers: session?.assignedUsers?.filter(
              (u) => u.id !== seekerId,
            ),
          })),
        );

        // Remove user from left panel after blessing
        setUsers((prev) => prev.filter((u) => u.id !== seekerId));
        setSelectedSwapSeeker(null);
        setOpenOverlay(false);
        loadUsers((paginationProps.currentPage - 1) * paginationProps.pageSize, true, appliedFilters, {
          ...filterItem,
          kpiFilter: selectedSidebarItem?.kpiFilter,
          approvalStatus: selectedSidebarItem?.kpiCategory,
          searchText: finalsearchText || searchText,
          sortKey: sortState.sortKey, 
          sortOrder: sortState.sortOrder,
          ...(selectedOption?.label === "Swap request" && {
            swapRequests: "wants_swap",
            filters: selectedSidebarItem?.filters,
          }),
          ...(selectedOption?.label === dropDownnJSON.PENDING.label && {
            filters: selectedSidebarItem?.filters,
          }),
        });
      } else {
        alert(response.data.message || "Failed to process request");
      }
    } catch (error) {
      console.error("Error in handleBlessed:", error);
      alert("Failed to process request. Please try again.");
    }
  };

  const handleBless = async (
    user: UserData,
    sessionId: number,
    sessionType: string,
  ) => {
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
        // Remove user from session after blessing

        setApprovedDragedUser(null);
        setSessions((prev) =>
          prev?.map((session) => ({
            ...session,
            assignedUsers: session?.assignedUsers?.filter(
              (u) => u.id !== user.id,
            ),
          })),
        );

        // Remove user from left panel after blessing
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        setSelectedSwapSeeker(null);
        setShowBlessCard(false);
        setOpenOverlay(false);
        loadUsers((paginationProps.currentPage - 1) * paginationProps.pageSize, true, appliedFilters, {
          ...filterItem,
          kpiFilter: selectedSidebarItem?.kpiFilter,
          approvalStatus: selectedSidebarItem?.kpiCategory,
          searchText: finalsearchText || searchText,
          sortKey: sortState.sortKey, 
          sortOrder: sortState.sortOrder, 
          ...(selectedOption?.label === "Swap request" && {
            swapRequests: "wants_swap",
            filters: selectedSidebarItem?.filters,
          }),
          ...(selectedOption?.label === dropDownnJSON.PENDING.label && {
            filters: selectedSidebarItem?.filters,
          }),
        });
      } else {
        alert(response.data.message || "Failed to bless user");
      }
    } catch (error) {
      console.error("Error blessing user:", error);
      alert("Failed to bless user. Please try again.");
    }
  };

  const handleRemoveFromSession = (
    user: UserData,
    sessionId: string | number,
  ) => {
    setSessions((prev) =>
      prev?.map((session) => ({
        ...session,
        assignedUsers: session?.assignedUsers?.filter((u) => u?.id !== user?.id),
      })),
    );
    setSelectedSwapSeeker(null);
    setUsers((prev) =>
      prev?.map((u) =>
        u?.id === user?.id
          ? {
            ...u,
            isPending: false,
            isAssigned: false,
            assignedSession: undefined,
          }
          : u,
      ),
    );
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      ?.map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const [openOverlay, setOpenOverlay] = useState(false);
  const [sessionsData, setSessionsData] = useState<Session[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedUserOverlay, setSelectedUserOverlay] =
    useState<UserData | null>(null);
  const [selectedUserForBless, setSelectedUserForBless] =
    useState<UserData | null>(null);
  const [showBlessCard, setShowBlessCard] = useState(false);

  const handleBlessButtonClick = () => {
    setShowBlessCard(true);
  };

  const handleSeekerDetails = async (userId: number) => {
    if (userId) {
      try {
        const response = await getSeekerDetailsById(userId, true, selectedOption?.value);
        setSelectedUser(response);
        const transformedData = transformSeekerResponse(response);

        setSelectedUserOverlay(transformedData);
        setSelectedSeekerId(userId);
        setOpenOverlay(true);
      } catch (error) {
        console.error("Error fetching seeker details:", error);
      }
    }
  };

  const filteredUsers = getFilteredUsers();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownAllocatedSessionId, setDropdownAllocatedSessionId] = useState<
    string | number | null
  >(null);
  const [isDropdownUserList, setIsDropdownUserList] = useState(false);

  useEffect(() => {
    if (!isDropdownOpen) return; // Only add listener when open

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false); // Generated by Copilot
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, setIsDropdownOpen]); // Generated by Copilot

  const handleDropdownSessionSelect = async (
    selectedSession: Session | string,
  ) => {
    setIsDropdownOpen(false);
    setPaginationProps({
      ...paginationProps,
      currentPage: 1,
    });
    handleCancelSwap();
    setIsDropdownUserList(true);
    handleCancelSwap();
    setSelectedOption({
      label:
        selectedSession === "Swap Request" ? "Swap" : selectedSession?.name,
      value: selectedSession?.name,
      data: selectedSession?.name,
    });
    setSelectedSidebarItem(null);
    setCurrentSession(selectedSession);
    resetPagination();
    // fetchData(selectedSession)
  };

  const fetchData = async (selectedSession: Session | string) => {
    setAppliedFilters({});
    if (selectedSession === "Swap Request") {
      setSelectedOption({
        label: "Swap request",
        value: selectedSession,
        data: "",
      });
      // Call the new swap requests API
      await fetchSwapRequests(
        programId,
        setApprovedUsers,
        setKpiData,
      );
      return;
    }

    if (typeof selectedSession != "string" && selectedSession) {
      setSelectedOption({
        label:
          selectedSession.name === "Hold" || selectedSession.name === ApprovalStatus.YTD
            ? selectedSession.name
            : `${selectedSession.name}`,
        value: selectedSession.id,
        data: selectedSession,
      });

      await fetchAllocatedUsers(
        programId,
        selectedSession,
        setTotalRecords,
        setApprovedUsers,
        setKpiData,
        paginationProps,
        setPaginationProps,
        setSessions,
        formatSessionsWithSpecial,
      );
      setDropdownAllocatedSessionId(selectedSession?.id);
    } else if (selectedSession === "Swap") {
      setSelectedOption({
        label: "Swap request",

        value: "swap",

        data: "",
      });
      setSelectedSidebarItem({
        key: "swap",

        kpiCategory: "all",

        kpiFilter: "swap-requests",
      });

      loadUsers(
        0,

        true,

        {},

        {
          kpiFilter: "swap-requests",

          approvalStatus: "allocated",

          swapRequests: "wants_swap",
        },
      );
      setFilterItem({
        kpiFilter: "swap-requests",
        approvalStatus: "allocated",
        swapRequests: "wants_swap",
      });

      setPaginationProps((prev) => ({
        ...prev,

        currentPage: 1,
      }));
    } else if (selectedSession === "All") {
      setPaginationProps((prev) => ({
        ...prev,
        currentPage: 1,
      }));
      setSelectedOption({
        label: "All",
        value: "all",
        data: "",
      });
      setSelectedSidebarItem({
        key: "total",
        kpiCategory: "all",
        kpiFilter: "all",
      });
      loadUsers(
        0,
        true,
        {},
        {
          kpiFilter: "all",
          approvalStatus: "all",
        },
      );
      setFilterItem({
        kpiFilter: "all",
        approvalStatus: "all",
      });
    } else {
      setSelectedOption({
        label: "Unassigned",
        value: "unassigned",
        data: "",
      });
      setSelectedSidebarItem({
        key: "total_unallocated",
        kpiCategory: "unallocated",
        kpiFilter: "total_unallocated",
      });
      loadUsers(
        0,
        true,
        {},
        {
          kpiFilter: "total_unallocated",
          approvalStatus: "unallocated",
        },
      );
      setFilterItem({
        kpiFilter: "total_unallocated",
        approvalStatus: "unallocated",
      });
    }
    setIsDropdownUserList(false);
  };

  // Add this handler function
  const handleCancelSwap = () => {
    setApprovedDragedUser(null);
    setDraggedUser(null);
    setDragPreview({ x: 0, y: 0, user: null });
    setSelectedSwapProgram({});
    setSelectedSwapUser({});
  };

  const handleSwapUser = (value: Record<string, any>) => {
    setSelectedSwapUser(value);
  };

  const handleResetAllFilters = () => {
    setSeatAllocFilters({});
    setAppliedFilters({});
    setIsOpenFilter(false);
    loadUsers(0, true, null, filterItem);
  };

  const handlePageChange = (newPage: number) => {
    setPaginationProps((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
    setTimeout(() => {
    if (scrollableRef.current) {
      scrollableRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, 0);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPaginationProps({
      ...paginationProps,
      pageSize: newSize,
      currentPage: 1, // Reset to first page on size change
    });
    setTimeout(() => {
    if (scrollableRef.current) {
      scrollableRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, 0);
  };

  const handleSessionPageChange = (newPage: number) => {
    setSessionPaginationProps((prev) => ({
      ...prev,
      sessioncurrentPage: newPage,
    }));
  };

  const handleSessionPageSizeChange = (newSize: number) => {
    setSessionPaginationProps({
      ...sessionpaginationProps,
      sessionpageSize: newSize,
      sessioncurrentPage: 1,
    });
  };

  const { isMobileResolution, isTabResolution } = UseResize();
  const [matchesOverlayOpen, setMatchesOverlayOpen] = useState(false);
  const [matchesOverlayLoading, setMatchesOverlayLoading] = useState(false);
  const [matchedSeekers, setMatchedSeekers] = useState<UserData[]>([]);
  const [customTitle, setCustomTitle] = useState<string>("");
  const [matchesOverlayPreferredName, setMatchesOverlayPreferredName] =
    useState<string>("");

  const handleShowAllMatches = async (preferredName: string, id: string) => {
    setMatchesOverlayLoading(true);
    setMatchesOverlayPreferredName(preferredName);
    setCustomTitle(`seekers named  ${preferredName}`);
    await fetchApprovedUsersForSession({
      kpiFilter: "all",
      kpiCategory: "all",
      id: null,
      searchText: preferredName,
    });
    setExcludedUserId(id);
    setMatchedSeekers(users);
    setMatchesOverlayOpen(true);
    setMatchesOverlayLoading(false);
  };

  const fetchApprovedUsersForSession = async (params) => {
    try {
      const offset =
        ((sessionpaginationProps.sessioncurrentPage || 1) - 1) *
        (sessionpaginationProps.sessionpageSize || 10);

      setOverlayLoader(true);
      const response = await ApiService.getRegistrationApprovals({
        programId: programId,
        limit: sessionpaginationProps.sessionpageSize,
        offset,
        kpiFilter: params.kpiFilter,
        approvalStatus: params.kpiCategory,
        swapRequests: params.swapRequests,
        shiftRequests: params.shiftRequests,
        preferredProgramId: params.id,
        search: params.searchText,
        setOverlayLoader: setOverlayLoader,
      });

      const approved = mapApiDataToUserCards(response?.data?.data?.data, true);

      setSessionPaginationProps({
        ...sessionpaginationProps,
        sessiontotalRecords: response?.data?.data?.pagination?.totalRecords,
      });
      setSessionsData(approved);
    } catch (error) {
      setApprovedUsers([]);
    } finally {
      setOverlayLoader(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if ((showOverlay || matchesOverlayOpen) && selectedSession) {
      fetchApprovedUsersForSession({
        ...selectedSession,
        searchText: sessionSearchText,
        // Preserve existing filters
        ...(selectedFilter?.wantsSwap === "wants_swap" && {
          swapRequests: "wants_swap",
        }),
        ...(selectedFilter?.canShift === "can_shift" && {
          shiftRequests: "can_shift",
        }),
      });
    }
  }, [
    showOverlay,
    selectedSession,
    sessionpaginationProps.sessioncurrentPage,
    sessionpaginationProps.sessionpageSize,
    sessionSearchText,
    selectedFilter, // Add selectedFilter to dependencies
  ]);

  const handleSeekerSelect = (selectedUser: UserData) => {
    setSelectedSwapSeeker(selectedUser);
    setShowOverlay(true);
  };

  return (
    <div className={styles.mainConatiner}>
      {!isMobileResolution && !isTabResolution ? (
        <div className={styles.container}>
          <div className={styles.leftPanel}>
            <PreferenceDropDown
              ref={dropdownRef}
              selectedOption={selectedOption}
              isDropdownOpen={isDropdownOpen}
              searchText={searchText}
              searchValue={searchValue}
              sessions={sessions}
              setIsDropdownUserList={setIsDropdownUserList}
              setSelectedOption={setSelectedOption}
              setDropdownAllocatedSessionId={setDropdownAllocatedSessionId}
              setIsDropdownOpen={setIsDropdownOpen}
              loadUsers={loadUsers}
              setSelectedSidebarItem={setSelectedSidebarItem}
              handleDropdownSessionSelect={handleDropdownSessionSelect}
              setSearchText={setSearchText}
              setFinalSearchText={setFinalSearchText}
              handleSearch={handleSearch}
              setPaginationProps={setPaginationProps}
              setSearchValue={setSearchValue}
              isOpenFilter={isOpenFilter}
              setIsOpenFilter={setIsOpenFilter}
              isFilterApplied={
                appliedFilters && Object.keys(appliedFilters).length > 0
              }
              setAppliedFilters={setAppliedFilters}
              setFilterItem={setFilterItem}
              filterItem={filterItem}
              appliedFilters={appliedFilters}
              handleSort={handleSort}
              sortState={sortState}
              isSortDropdownOpen={isSortDropdownOpen}
              setIsSortDropdownOpen={setIsSortDropdownOpen}
            />
            <div className={styles.leftPanelContainer}>
              {/* {!loading && ( */}
              <SideBar
                selectedSidebarItem={selectedSidebarItem}
                handleSidebarItemClick={handleSidebarItemClick}
                items={getFilteredSidebarItems()}
                sessions={sessions}
              />
              {/* )} */}

              <div className={styles.usersList} ref={scrollableRef}>
                {(isDropdownUserList ? approvedUsers : filteredUsers).length >
                  0 ? (
                  (isDropdownUserList ? approvedUsers : filteredUsers)?.map(
                    (user, index) => (
                      <div
                        key={user.id}
                        className={`
                      ${user?.isDefaulter ? styles.defaulterUserCard : styles.userCard}
                      ${user.isAssigned ? styles.assigned : ""}
                      ${user.isPending ? styles.pending : ""}
                       ${flippedUserId === user.id || approvedraggedUser?.id === user.id ? styles.flipped : ""}
                    `}
                        draggable={!user.isAssigned && !user.isPending}
                        onDragStart={(e) => handleDragStart(e, user)}
                        onDragEnd={handleDragEnd}
                        onDrag={handleDragMove}
                        onClick={
                          flippedUserId !== user.id
                            ? () => {
                              setSelectedUserForBless(user);
                              handleSeekerDetails(user.id);
                            }
                            : undefined
                        }
                        style={{
                          opacity:
                            user.isPending || approvedraggedUser?.id === user.id
                              ? 0.5
                              : 1,
                          cursor: user.isPending
                            ? "not-allowed"
                            : flippedUserId === user.id
                              ? "default"
                              : "pointer",
                        }}
                      >
                        <>
                          <UserCard
                            user={user}
                            handleSeekerClick={() => {
                              setSelectedUserForBless(user);
                              handleSeekerDetails(user.id);
                            }}
                            setSelectedSession={setSelectedSession}
                            getInitials={getInitials}
                            handleShowAllMatches={handleShowAllMatches}
                            sessionId={sessionId}
                            isFlipped={flippedUserId === user.id}
                            onFlip={() => {
                              setFlippedUserId(user.id);
                            }}
                            onCloseFlip={() => setFlippedUserId(null)}
                            disabled={user.isPending}
                            programsList={kpiData.unallocatedPrograms?.map(
                              (program) => ({
                                id: program.programId,
                                name: program.programName,
                              }),
                            )}
                            allocatedProgramId={
                              isDropdownUserList
                                ? dropdownAllocatedSessionId
                                : null
                            }
                            highlightAllocated={isDropdownUserList}
                            handleBless={handleBless}
                            handleBlessed={handleBlessed}
                            setShowOverlay={setShowOverlay}
                            fetchApprovedUsersForSession={
                              fetchApprovedUsersForSession
                            }
                            setIsCardClicked={setIsCardClicked}
                            selectedSwapSeeker={selectedSwapSeeker}
                            setExcludedUserId={setExcludedUserId}
                            setSelectedSwapSeeker={setSelectedSwapSeeker}
                            setCustomTitle={setCustomTitle}
                            sessions={sessions}
                            selectedFilter={selectedFilter}
                          />
                        </>
                      </div>
                    ),
                  )
                ) : (
                  <div className={styles.noProgramsContent}>
                    <img
                      src={card}
                      alt="No seekers"
                      className={styles.noProgramsImage}
                    />
                    <div className={styles.noProgramsText}>
                      {isDropdownUserList
                        ? `No seekers allocated to ${selectedOption.label}`
                        : "All the seekers are blessed into their destined programs."}
                    </div>
                  </div>
                )}
                <div className={styles.paginationContainer}>
                  {paginationProps.totalRecords > 10 && (
                    <ListPagination
                      {...paginationProps}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                      pageSizeOptions={[25, 50, 100]}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.rightPanelContainer}>
            <div className={styles.rightPanel}>
              <div className={styles.rightPanelHeader}>
                <img src={pillars} />
              </div>

              {true ? (
                <SessionsGrid
                  sessions={sessions}
                  dragOverSessionId={dragOverSessionId}
                  selectedSession={selectedSession}
                  setSelectedSession={setSelectedSession}
                  showOverlay={showOverlay}
                  sessionId={sessionId}
                  approvedUsers={sessionsData}
                  isLoading={isLoading}
                  programId={programId}
                  totalRecords={totalRecords}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onSessionClick={handleSessionClick}
                  onRemoveFromSession={handleRemoveFromSession}
                  onBless={handleBless}
                  onCloseOverlay={() => {
                    setSessionPaginationProps({
                      sessionpageSize: 100,
                      sessiontotalRecords: 0,
                      sessioncurrentPage: 1,
                    });
                    setShowOverlay(false);
                    setIsOverlayFromSessionGrid(false);
                  }}
                  handleBlessed={handleBlessed}
                  selectedSwapSeeker={selectedSwapSeeker}
                  setShowOverlay={setShowOverlay}
                  fetchApprovedUsersForSession={fetchApprovedUsersForSession}
                  setExcludedUserId={setExcludedUserId}
                  setCustomTitle={setCustomTitle}
                  setIsCardClicked={setIsCardClicked}
                  handleSessionPageChange={handleSessionPageChange}
                  handleSessionPageSizeChange={handleSessionPageSizeChange}
                  sessionpaginationProps={sessionpaginationProps}
                  setSessionSearchText={setSessionSearchText}
                  overlayLoader={overlayLoader}
                  selectedFilter={selectedFilter}
                  setSelectedFilter={setSelectedFilter}
                  draggedUser = {draggedUser}
                />
              ) : (
                <div className={styles.swapGrid}>
                  <div
                    className={styles.sessionCard}
                    onDragOver={handleSwapDragOver}
                    onDragLeave={handleSwapDragLeave}
                    onDrop={handleSwapDrop}
                  >
                    <div className={styles.sessionUsers}>
                      {approvedraggedUser ? (
                        <div className={styles.usersdisplay}>
                          <MoveProgramCard
                            user={approvedraggedUser}
                            handleBless={handleBlessed}
                            currentProgram={
                              approvedraggedUser?.allocatedProgram?.name
                            }
                            availablePrograms={sessions.filter(
                              (session) =>
                                session.name !== selectedOption?.label &&
                                approvedraggedUser?.allocatedProgram?.name !==
                                session.name &&
                                session?.name !== ApprovalStatus?.YTD ,
                            )}
                            onProgramSelect={handleProgramSelect}
                            onCancel={handleCancelSwap}
                            programId={programId}
                            handleSwapUser={handleSwapUser}
                          />
                          {Object.keys(selectedSwapProgram).length &&
                            !Object.keys(selectedSwapUser).length ? (
                            <div className={styles.userDescription}>
                              moving {approvedraggedUser?.fullName} to{" "}
                              {selectedSwapProgram?.name}
                            </div>
                          ) : Object.keys(selectedSwapUser).length ? (
                            <div className={styles.userDescription}>
                              {approvedraggedUser?.fullName} is being swapped
                              into {selectedSwapProgram?.name}, and{" "}
                              {selectedSwapUser?.fullName} into{" "}
                              {approvedraggedUser?.allocatedProgram?.name}.
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className={styles.moveProgramCard}>
                          <div className={styles.swapHeader}>
                            <span className={styles.swapLabel}>
                              Swapping / Moving
                            </span>
                          </div>
                          <DashedBorderBox
                            isDragOver={
                              draggedUser !== null && !approvedraggedUser
                            }
                          >
                            <div className={styles.sessionHeader}>
                              <h3 className={styles.sessionName}>
                                {approvedraggedUser
                                  ? "Complete current swap first"
                                  : "Drag and Drop to swap or move the seekers"}
                              </h3>
                            </div>
                          </DashedBorderBox>
                        </div>
                      )}
                      <div className={styles.swapBlessedButton}>
                        <Button
                          type="submit"
                          buttonClassName={`${styles.buttonContainer} ${selectedSwapProgram ? styles.active : ""}`}
                          buttonTextClassName={styles.buttonText}
                          datatestid="add-program-save-button"
                          datatestidText="add-program-save"
                          onClick={() => {
                            if (approvedraggedUser?.registrationId) {
                              handleBlessed(
                                approvedraggedUser.registrationId,
                                selectedSwapProgram,
                                "swap",
                                approvedraggedUser.swapRequestId, // Pass the swapRequestId if it exists
                              );
                            }
                          }}
                          disable={
                            !selectedSwapProgram ||
                            Object.keys(selectedSwapProgram).length === 0
                          }
                        >
                          <span className={styles.blessText}>bless</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {dragPreview.user && (
            <div
              className={styles.dragPreview}
              style={{
                left: dragPreview.x - 60,
                top: dragPreview.y - 30,
              }}
            >
              <Avatar
                alt={dragPreview.user.fullName}
                src={dragPreview.user.profileImage || defaultProfileIcon}
                sx={{ width: 100, height: 100 }}
              />
              <span className={styles.dragPreviewName}>
                {dragPreview.user.fullName}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.contentContainer}>
          <div className={styles.mobileContainer}>
            <PreferenceMobileScroll
              selectedOption={selectedOption}
              isDropdownOpen={isDropdownOpen}
              kpis={toolbarkpi}
              sessions={sessions}
              setIsDropdownUserList={setIsDropdownUserList}
              setSelectedOption={setSelectedOption}
              setDropdownAllocatedSessionId={setDropdownAllocatedSessionId}
              setIsDropdownOpen={setIsDropdownOpen}
              loadUsers={loadUsers}
              setSelectedSidebarItem={setSelectedSidebarItem}
              handleDropdownSessionSelect={handleDropdownSessionSelect}
              setIsSortDropdownOpen={setIsSortDropdownOpen}
              setSortState={setSortState}
            />
            {/* Section below tabs: seekers count left, search & filter icons right (no input) */}
            <div className={styles.mobileSeekersHeaderRow}>
              <div className={styles.mobileSeekersHeaderRight}>
                <SearchInput
                  searchText={searchText}
                  searchValue={searchValue}
                  setSearchText={setSearchText}
                  setFinalSearchText={setFinalSearchText}
                  handleSearch={handleSearch}
                  setSearchValue={setSearchValue}
                  setPaginationProps={setPaginationProps}
                   isOpenFilter={isOpenFilter}
                  setIsOpenFilter={setIsOpenFilter}
                  isFilterApplied={
                    appliedFilters && Object.keys(appliedFilters).length > 0
                  }
                  handleSort={handleSort}
                  sortState={sortState}
                  isSortDropdownOpen={isSortDropdownOpen}
                  setIsSortDropdownOpen={setIsSortDropdownOpen}
                />
              </div>
            </div>
          </div>
          <div className={styles.seekersListAndFilters}>
            <div>
              {(isDropdownUserList ? approvedUsers : filteredUsers).length >
                0 ? (
                (isDropdownUserList ? approvedUsers : filteredUsers)?.map(
                  (user, index) => (
                    <div
                      key={user.id}
                      className={`
                      ${user?.isDefaulter ? styles.defaulterUserCard : styles.userCard}
                      ${user.isAssigned ? styles.assigned : ""}
                      ${user.isPending ? styles.pending : ""}
                       ${flippedUserId === user.id || approvedraggedUser?.id === user.id ? styles.flipped : ""}
                    `}
                      draggable={!user.isAssigned && !user.isPending}
                      onDragStart={(e) => handleDragStart(e, user)}
                      onDragEnd={handleDragEnd}
                      onDrag={handleDragMove}
                      style={{
                        opacity:
                          user.isPending ||
                            flippedUserId === user.id ||
                            approvedraggedUser?.id === user.id
                            ? 0.5
                            : 1,
                        cursor: user.isPending ? "not-allowed" : "pointer",
                      }}
                    >
                      <>
                        <UserCard
                          seeker={user}
                          user={user}
                          handleSeekerClick={() => {
                            setSelectedUserForBless(user);
                            handleSeekerDetails(user.id);
                          }}
                          preferenceData={user?.programPreferences}
                        />
                      </>
                    </div>
                  ),
                )
              ) : (
                <div className={styles.noProgramsContent}>
                  <img
                    src={card}
                    alt="No seekers"
                    className={styles.noProgramsImage}
                  />
                  <div className={styles.noProgramsText}>
                    {isDropdownUserList
                      ? `No seekers allocated to ${selectedOption.label}`
                      : "All the seekers are blessed into their destined programs."}
                  </div>
                </div>
              )}
            </div>
          {paginationProps.totalRecords > 10 && (
            <ListPagination
              {...paginationProps}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[25, 50, 100]}
            />
          )}
           </div>
        </div>
      )}

      {openOverlay && (
        <SeekerDetails
          isOpen={openOverlay}
          onClose={() => setOpenOverlay(false)}
          seekerDetails={selectedUser}
          getInitials={getInitials}
          isGroupedProgram={isGroupedProgram}
          sessions={sessions as Session[]}
          onBless={handleBless}
          user={selectedUserForBless as UserData}
          handleBlessed={handleBlessed}
          currentProgram={selectedOption?.label}
          availablePrograms={sessions?.filter(
            (session) =>
              session.name !== selectedOption?.label && session.name !== ApprovalStatus.YTD,
          )}
          onProgramSelect={handleProgramSelect}
          onCancel={handleCancelSwap}
          programId={programId}
          selectedSwapProgram={selectedSwapProgram}
          selectedSwapUser={selectedSwapUser}
          handleSwapUser={handleSwapUser}
          selectedOption={selectedOption}
          onBlessButtonClick={() => setShowBlessCard(true)} // Add this prop
          handleSeekerDetails={handleSeekerDetails}
          onUserUpdate={() => loadUsers(0, true, appliedFilters, filterItem)}
          setParentLoading={setLoading}
        />
      )}
      {isOpenFilter && (
        <Suspense fallback={null}>
          <AdminFilterOverlay
            open={isOpenFilter}
            onClose={() => {
              setIsOpenFilter(false);
            }}
            onApply={(filters) => {
              const cleanedFilters = Object.fromEntries(
                Object.entries(filters)?.filter(([_, value]) => {
                  if (Array.isArray(value)) return value.length > 0;
                  if (typeof value === "string") return value.trim() !== "";
                  if (typeof value === "object") return value !== null;
                  return true;
                }),
              );
              setPaginationProps &&
                setPaginationProps((prev) => ({
                  ...prev,
                  currentPage: 1,
                }));
              setAppliedFilters(cleanedFilters);
              setIsOpenFilter(false);
              loadUsers(0, true, cleanedFilters, filterItem);
            }}
            customClass={styles.kpisFilterSectionWrapper}
            initialFilters={appliedFilters}
            onReset={handleResetAllFilters}
            displayFilters={seatAllocFilters}
          ></AdminFilterOverlay>
        </Suspense>
      )}

      {matchesOverlayOpen ? (
        <SessionOverlay
          // session={null}
          isOpen={matchesOverlayOpen}
          preferredName={matchesOverlayPreferredName}
          onClose={() => {
            setSessionPaginationProps({
              sessionpageSize: 100,
              sessiontotalRecords: 0,
              sessioncurrentPage: 1,
            });
            setMatchesOverlayOpen(false);
          }}
          selectedSession={selectedSession}
          setSelectedSession={setSelectedSession}
          // sessionId={0}
          users={sessionsData}
          programId={programId}
          sessionId={sessionId}
          handleBless={handleBless}
          loading={matchesOverlayLoading}
          // programId={0}
          // sessiondata={[]}
          customTitle={customTitle}
          // isCardClicked={isCardClicked}
          setFlippedUserId={setFlippedUserId}
          flippedUserId={flippedUserId}
          kpiData={kpiData}
          isDropdownUserList={isDropdownUserList}
          handleBlessed={handleBlessed}
          onSeekerSelect={handleSeekerSelect}
          excludedUserId={excludedUserId}
          handleSessionPageChange={handleSessionPageChange}
          handleSessionPageSizeChange={handleSessionPageSizeChange}
          sessionpaginationProps={sessionpaginationProps}
          sessions={sessions}
          sessionSearchText={sessionSearchText}
          setSessionSearchText={setSessionSearchText}
          fetchApprovedUsersForSession={fetchApprovedUsersForSession}
        />
      ) : null}
      {showOverlay ? (
        <SessionOverlay
          isOpen={showOverlay}
          session={selectedSession}
          selectedSession={selectedSession}
          onClose={() => {
            setSessionPaginationProps({
              sessionpageSize: 100,
              sessiontotalRecords: 0,
              sessioncurrentPage: 1,
            });
            setShowOverlay(false);
            setIsOverlayFromSessionGrid(false);
            setSessionSearchText("");
          }}
          overlayLoader={overlayLoader}
          isOverlayFromSessionGrid={isOverlayFromSessionGrid}
          users={sessionsData}
          sessionId={sessionId}
          handleBless={handleBless}
          loading={matchesOverlayLoading}
          showOverlay={showOverlay}
          fromSessionGrid={
            selectedSession?.name === ApprovalStatus.YTD || selectedSession?.name === "Hold"
          }
          customTitle={customTitle}
          isCardClicked={isCardClicked}
          setFlippedUserId={setFlippedUserId}
          flippedUserId={flippedUserId}
          kpiData={kpiData}
          isDropdownUserList={isDropdownUserList}
          handleBlessed={handleBlessed}
          onSeekerSelect={handleSeekerSelect}
          handleSessionPageChange={handleSessionPageChange}
          handleSessionPageSizeChange={handleSessionPageSizeChange}
          sessionpaginationProps={sessionpaginationProps}
          sessions={sessions}
          programId={programId}
          sessionSearchText={sessionSearchText}
          setSessionSearchText={setSessionSearchText}
          fetchApprovedUsersForSession={fetchApprovedUsersForSession}
          setSelectedFilter={setSelectedFilter}
          selectedFilter={selectedFilter}
          showBlessCard={showBlessCard}
        />
      ) : null}

      {showBlessCard && (
        <UserCardOverlay
          user={selectedUserOverlay}
          handleSeekerClick={() => {
            setSelectedUserForBless(selectedUserOverlay);
            handleSeekerDetails(selectedUserOverlay.id);
          }}
          setSelectedSession={setSelectedSession}
          getInitials={getInitials}
          handleShowAllMatches={handleShowAllMatches}
          setShowBlessCard={setShowBlessCard}
          sessionId={sessionId}
          isFlipped={flippedUserOverlayId === selectedUserOverlay.id}
          onFlip={() => {
            setFlippedUserOverlayId(selectedUserOverlay.id);
          }}
          onCloseFlip={() => setFlippedUserOverlayId(null)}
          disabled={selectedUserOverlay.isPending}
          programsList={kpiData.unallocatedPrograms?.map((program) => ({
            id: program.programId,
            name: program.programName,
          }))}
          allocatedProgramId={
            isDropdownUserList ? dropdownAllocatedSessionId : null
          }
          highlightAllocated={isDropdownUserList}
          handleBless={handleBless}
          handleBlessed={handleBlessed}
          setShowOverlay={setShowOverlay}
          fetchApprovedUsersForSession={fetchApprovedUsersForSession}
          setIsCardClicked={setIsCardClicked}
          selectedSwapSeeker={selectedSwapSeeker}
          setExcludedUserId={setExcludedUserId}
          setSelectedSwapSeeker={setSelectedSwapSeeker}
          setCustomTitle={setCustomTitle}
          sessions={sessions}
          selectedFilter={selectedFilter}
        />
      )}
    </div>
  );
};

export default SeatApproval;
