import { lazy, useEffect, useState } from "react";
import { useDashboard } from "../../context/HDBDashboardContext.tsx";
import DashboardTabs from "./DashboardTabs";
import HDBDashboard from "../HDBDashboard";
import Dashboard from "../../assets/images/DashboardFill.svg";
import Registrations from "../../assets/images/Registrations.svg";
import ListView from "../../assets/images/registrationPrefill.svg";
import styles from "./index.module.scss";
import SeatApproval from "../../assets/images/outline-filled-seat.svg";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { hasPermission, RESOURCES } from "../../utils/roleBasedAccess.ts";
import { getItemInLocalStorage } from "../../services/localStorage.ts";
import { useResponsive } from "../../utils/functions.ts";
import UseResize from "../../common/components/UseResize/index.tsx";
import drafts from "../../assets/images/Drafts.svg";
import activeDraft from "../../assets/images/draftsSelected.svg";
import ReleaseSeats from "../../assets/images/Release Seats.svg";
import RegistrationsFill from "../../assets/images/Registration fill.svg";
import DashboardPrefill from "../../assets/images/dashboardPrefill.svg";
import roomAllocationIcom from "../../assets/images/room-allocation-icon.svg";
import { HEADER_TABS, HEADERTABS, LOCAL_STORAGE_KEYS, PROGRAM_TYPE, PROGRAM_TYPE_TABS, textConstant, USER_ROLE_MAHATRIA, USER_ROLE_SHOBA } from "../../constants/textConstants.ts";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import activeExpressions from "../../assets/images/active-expressions.svg";
import expressions from "../../assets/images/expressions.svg";
import { setDashboardActiveTab } from "../../reducers/ProgramReducer.ts";
import MobileRoleDisplay from "../../common/components/MobileRoleDisplay/index.tsx";
import { getCall } from "../../services/apiService.ts";
import { endPoints, PORTAL } from "../../constants/urlConstants.ts";

// Lazy load page components
const HdbSeekersListAdmin = lazy(() => import("../HdbSeekersListAdmin/index.tsx"));
const SeekerApproval = lazy(() => import("../../components/SeatApprovalFlow/SeekerApproval/index.tsx"));
const Drafts = lazy(() => import("../Drafts/index.tsx"));
const RoomAllocation = lazy(() => import("../../components/AllocateRooms/index.tsx"));
const SeekerExperience = lazy(() => import("../SeekerExperience/index.tsx"));

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { programId } = useParams<{ programId: string }>();
  const { isMobileResolution, isTabResolution } = UseResize();
  const { clearFilters } = useDashboard();
  const seekerDetails = getItemInLocalStorage(textConstant.SEEKER_DETAILS) || {};

  const [programTypeKey, setProgramTypeKey] = useState<string>(
    () => localStorage.getItem(LOCAL_STORAGE_KEYS.PROGRAM_TYPE_KEY) || ""
  );

  useEffect(() => {
    if (!programId) return;
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.PROGRAM_TYPE_KEY);
    const storedProgramId = localStorage.getItem(LOCAL_STORAGE_KEYS.PROGRAM_ID);
    if (stored && storedProgramId && Number(storedProgramId) === Number(programId)) {
      setProgramTypeKey(stored);
      return;
    }
    getCall(`${endPoints.program}/${programId}`, undefined, PORTAL)
      .then((res) => {
        const key = res?.data?.data?.type?.key || "";
        localStorage.setItem(LOCAL_STORAGE_KEYS.PROGRAM_TYPE_KEY, key);
        localStorage.setItem(LOCAL_STORAGE_KEYS.PROGRAM_ID, programId);
        setProgramTypeKey(key);
      })
      .catch(() => {});
  }, [programId]);

  const dispatch = useDispatch();

  const getDefaultTab = (typeKey: string, role: string): string => {
    const allowed = PROGRAM_TYPE_TABS[typeKey] ?? null;
    if (typeKey === PROGRAM_TYPE.TAT_KEY) return HEADERTABS.REGISTRATIONS;
    if (role === USER_ROLE_MAHATRIA || role === USER_ROLE_SHOBA) {
      return allowed && !allowed.includes(HEADERTABS.SEAT_ALLOCATIONS)
        ? HEADERTABS.REGISTRATIONS
        : HEADERTABS.SEAT_ALLOCATIONS;
    }
    return allowed && !allowed.includes(HEADERTABS.DASHBOARD)
      ? HEADERTABS.REGISTRATIONS
      : HEADERTABS.DASHBOARD;
  };

  const storedTab = localStorage.getItem(LOCAL_STORAGE_KEYS.HDB_ACTIVE_TAB);
  const [activeTab, setActiveTab] = useState<string>(
    () => storedTab || getDefaultTab(programTypeKey, seekerDetails?.role || "")
  );

  // When programTypeKey resolves, sync activeTab from localStorage (ActionCards
  // writes the correct default tab there before navigating) or fall back to default.
  useEffect(() => {
    if (!programTypeKey) return;
    const allowed = PROGRAM_TYPE_TABS[programTypeKey] ?? null;
    const storedActiveTab = localStorage.getItem(LOCAL_STORAGE_KEYS.HDB_ACTIVE_TAB);
    const tabToSet =
      storedActiveTab && (!allowed || allowed.includes(storedActiveTab))
        ? storedActiveTab
        : getDefaultTab(programTypeKey, seekerDetails?.role || "");
    if (tabToSet !== activeTab) {
      setActiveTab(tabToSet);
      localStorage.setItem(LOCAL_STORAGE_KEYS.HDB_ACTIVE_TAB, tabToSet);
      dispatch(setDashboardActiveTab(tabToSet));
    }
  }, [programTypeKey]);

  const { filters } = useDashboard();
  const location = useLocation();
  const userRole = getItemInLocalStorage("seekerDetails")?.role || "";

  const hasSeatPermission = hasPermission(userRole, "seat-allocations-tab", "R");

  // RBAC-driven tab configuration
  const TAB_CONFIG = [
    {
      label: HEADER_TABS.DASHBOARD,
      key: HEADERTABS.DASHBOARD,
      permissions: [], // No permissions needed - always visible
      icon: {
        active: Dashboard,
        inactive: DashboardPrefill,
        alt: HEADER_TABS.DASHBOARD,
      },
    },
    {
      label: HEADER_TABS.SEAT_ALLOCATIONS,
      key: HEADERTABS.SEAT_ALLOCATIONS,
      permissions: [{ resource: RESOURCES.SEAT_ALLOCATION_TAB, operation: "R" }],
      icon: {
        active: ReleaseSeats,
        inactive: SeatApproval,
        alt: HEADER_TABS.SEAT_ALLOCATIONS,
      },
    },
    {
      label: HEADER_TABS.REGISTRATIONS,
      key: HEADERTABS.REGISTRATIONS,
      permissions: [], // No permissions needed - always visible
      icon: {
        active: RegistrationsFill,
        inactive: ListView,
        alt: HEADER_TABS.REGISTRATIONS,
      },
    },
    {
      label: HEADER_TABS.DRAFTS,
      key: HEADERTABS.DRAFTS,
      permissions: [{ resource: RESOURCES.DRAFT_TAB, operation: "R" }],
      icon: {
        active: activeDraft,
        inactive: drafts,
        alt: HEADER_TABS.DRAFTS,
        width: 16.285,
        height: 16.285,
      },
    },
    {
      label: textConstant.ROOM_ALLOCATION_LABEL,
      key: HEADERTABS.ROOM_ALLOCATION,
      permissions: [{ resource: RESOURCES.ROOM_ALLOCATION, operation: "R" }],
      icon: {
        active: roomAllocationIcom,
        inactive: roomAllocationIcom,
        alt: textConstant.ROOM_ALLOCATION_LABEL,
        width: 16.285,
        height: 16.285,
      },
    },
    {
      label: textConstant.EXPRESSIONS,
      key: HEADERTABS.EXPRESSIONS,
      permissions: [{ resource: textConstant.EXPRESSIONS_KEY, operation: "R" }],
      icon: {
        active: activeExpressions,
        inactive: expressions,
        alt: HEADERTABS.EXPRESSIONS,
      },
    },
  ];

  const allowedTabKeys = PROGRAM_TYPE_TABS[programTypeKey] ?? null;
  // Dynamically build tabs based on program type config + permissions
  const tabs = TAB_CONFIG.filter((tabConfig) => {
    if (allowedTabKeys && !allowedTabKeys.includes(tabConfig.key)) {
      return false;
    }
    // Permission check
    if (Array.isArray(tabConfig.permissions) && tabConfig.permissions.length > 0) {
      return tabConfig.permissions.every((perm: any) =>
        hasPermission(userRole, perm.resource, perm.operation)
      );
    }
    return true;
  }).map((tabConfig) => ({
    label: tabConfig.label,
    key: tabConfig.key,
    icon: (
      <img
        src={activeTab === tabConfig.key ? tabConfig.icon.active : tabConfig.icon.inactive}
        alt={tabConfig.icon.alt}
        className={tabConfig.icon.width ? undefined : styles.subheaderIcons}
        width={tabConfig.icon.width}
        height={tabConfig.icon.height}
      />
    ),
  }));

  const handleTabChange = (key) => {
    setActiveTab(key);
    clearFilters();
    localStorage.setItem("hdb_active_tab", key);
     dispatch(setDashboardActiveTab(key));
    
    if (key === HEADERTABS.SEAT_ALLOCATIONS || key === HEADERTABS.DASHBOARD) {
      const params = new URLSearchParams({
        dropdown: 'Unassigned',
        kpiCategory: 'unallocated',
        kpiFilter: 'total_unallocated',
        sidebarKey: 'total_unallocated'
      });
  
      navigate({
        pathname: location.pathname,
        search: params.toString()
      }, { replace: true });
    }
  };
  
  useEffect(() => {
    // Activate tab from navigation state if present
    if (location.state?.activateTab === "registrations") {
      setActiveTab(HEADERTABS.REGISTRATIONS);
    }
  }, [location.state]);

  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      setActiveTab(HEADERTABS.REGISTRATIONS);
      localStorage.setItem("hdb_active_tab", HEADERTABS.REGISTRATIONS);
    }
  }, [filters]);

  const subProgramId = useSelector(
    (state: RootState) => state.ProgramReducer.subProgramId
  );
  const programOptions = useSelector(
    (state: RootState) => state.ProgramReducer.programOptions
  );
  const selectedSubProgram = useSelector(
    (state: RootState) => state.ProgramReducer.selectedSubProgram
  );

  // Check if program data is ready for EXPRESSIONS tab
  // For EXPRESSIONS tab, wait until program options are loaded and a selection is made
  const isProgramDataReady = activeTab !== HEADERTABS.EXPRESSIONS || 
    (programOptions.length > 0 && selectedSubProgram !== null);

  const shouldHideTabs = (isMobileResolution || isTabResolution) && hasSeatPermission;
  return (
    <div className={activeTab !== HEADERTABS.SEAT_ALLOCATIONS ? styles.dashboardLayout : ""}>
      {shouldHideTabs && isMobileResolution && (
        <div className={styles.mobileRoleWrapper}>
          <MobileRoleDisplay />
        </div>
      )}
      {!shouldHideTabs && (
        <DashboardTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}
      <div className={activeTab !== HEADERTABS.SEAT_ALLOCATIONS ? styles.contentArea : ""}>
        {activeTab === HEADERTABS.DASHBOARD && <HDBDashboard setActiveTab={setActiveTab} />}
        {activeTab === HEADERTABS.REGISTRATIONS && (
          <HdbSeekersListAdmin filters={filters} />
        )}
        {
          activeTab === HEADERTABS.SEAT_ALLOCATIONS && (
            <SeekerApproval />
          )
        }
           {activeTab ===HEADERTABS. DRAFTS && (
          <Drafts/>
        )}    
        {
          activeTab === HEADERTABS.ROOM_ALLOCATION && (
            <div>
             <RoomAllocation />
            </div>
          )
        }  
        {
          activeTab === HEADERTABS.EXPRESSIONS && (
            <div>
             <SeekerExperience allocatedProgramId={subProgramId} isProgramDataReady={isProgramDataReady} />
            </div>
          )
        }           
      </div>
    </div>
  );
};

export default DashboardLayout;