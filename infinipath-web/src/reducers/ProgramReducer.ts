import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LOCAL_STORAGE_KEYS, textConstant } from "../constants/textConstants";
import { LoaderCounts } from "../types/program";
import { filterProgramsByTypeStatus } from "../utils/commonFunctions";

// Add FilterConfig interface
interface FilterConfig {
  sideFilterSets: {
    baseSets: {
      [key: string]: Array<{
        key: string;
        label: string;
        type: string;
        options: Array<{
          label: string;
          value: string;
        }>;
      }>;
    };
    contextualFilters: {
      [key: string]: {
        [key: string]: string[];
      };
    };
  };
  parentOptions: Array<{
    key: string;
    label: string;
    value: string;
    isDefault?: boolean;
    kpiOptions: KpiOption[];
  }>;
  bulkDownloadIdProofs?: Array<{
    label: string;
    value: string;
    programId: number | string;
    allocatedProgramId?: string;
  }>;
}

interface KpiOption {
  key?: string;
  label?: string;
  value?: string;
  kpiFilter: string;
  kpiCategory?: string;
  isDefault?: boolean;
  programType?: string;
  programSequence?: number;
}

interface FilterOption {
  label: string;
  value: string;
}

interface KpiFilter {
  kpiCategory: string;
  kpiFilter: string;
}

interface AppliedFilters {
  [key: string]: any;
}

interface ProgramOption {
  value: string;
  label: string;
  endsAt?: string;
}

interface SearchState {
  value: string;
  open: boolean;
  query: string;
}

interface SortState {
  sortKey: string;
  sortOrder: 'ASC' | 'DESC';
}

interface ProgramState {
  selectedKpiOption: FilterOption | null;
  filterOptions: FilterOption[];
  filterConfig: FilterConfig | null;
  filterConfigList: FilterConfig | null;
  selectedKpiTab: KpiOption | null;
  activeTab: number;
  selectedKpiFilter: KpiFilter | null;
  programName: string | null;
  activeTabKpiValue: string;
  seatApprovalToolbarKpi: any;
  selectViewList: any;
   seatApprovalSessions: any[];
  appliedFilters: AppliedFilters;
  dashboardFilters: any[];
  search: SearchState;
  sortState: SortState;
   dashboardActiveTab: string;
   pagination: {
    pageSize: number;
    currentPage: number;
  };
  travelStatus: string;
  programOptions: ProgramOption[];
  selectedSubProgram: string | null;
  subProgramId: number | null;
  programEndsAt: string | null;
  loaderCounts: LoaderCounts;
  programsList: any[];
  filteredProgramsList: any[];
}

// Not used: 30/01/2026
// const getInitialDashboardTab = (): string => {
//   if (typeof window === 'undefined') return textConstant.DASHBOARD;
//   return localStorage.getItem(LOCAL_STORAGE_KEYS.HDB_ACTIVE_TAB) || textConstant.SEAT_ALLOCATIONS;
// };

const getInitialSelectedSubProgram = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LOCAL_STORAGE_KEYS.SELECTED_SUB_PROGRAM) || null;
};

const getInitialSubProgramId = (): number | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.SUB_PROGRAM_ID);
  return stored ? Number(stored) : null;
};

const initialState: ProgramState = {
  selectedKpiOption: null,
  filterOptions: [],
  selectedSubProgram: getInitialSelectedSubProgram(), 
  subProgramId: getInitialSubProgramId(), 
  filterConfig: null,
  filterConfigList: null,
  selectedKpiTab: null,
  activeTab: 0,
  seatApprovalSessions: [],
  seatApprovalToolbarKpi: "",
  selectedKpiFilter: null,
   dashboardActiveTab: "", 
  activeTabKpiValue: "",
  travelStatus: "",
  programName: null,
  selectViewList: { key: 'registrations', label: 'Registrations',value: 'registrations' },
  appliedFilters: {},
  dashboardFilters: [],
  search: {
    value: "",
    open: false,
    query: ""
  },
   pagination: {
    pageSize: 100,
    currentPage: 1,
  },
   sortState: { 
    sortKey: "",
    sortOrder: "ASC"
  },
  programOptions: [],
  programEndsAt: null,
  loaderCounts: {
    smallLoaderCount: 0,
    largeLoaderCount: 0,
    mediumLoaderCount: 0,
  },
  programsList: [],
  filteredProgramsList: []
};

const ProgramDataSlice = createSlice({
  name: "programState",
  initialState,
  reducers: {
    setSelectedKpiOption: (state, action: PayloadAction<FilterOption>) => {
      const params = new URLSearchParams(window.location.search);
      if (action.payload) {
        params.set('parentFilter', JSON.stringify(action.payload));
      } else {
        params.delete('parentFilter');
      }
      state.selectedKpiOption = action.payload;
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    },

    setProgramsList : (state, action: PayloadAction<any[]>) => {
      const data =  Array.isArray(action.payload) ? action.payload : [];
      state.programsList = data;
      state.filteredProgramsList = data;
    },

    setSelectedSubProgram: (state, action: PayloadAction<string | null>) => {
      state.selectedSubProgram = action.payload;
      if (typeof window !== 'undefined' && action.payload) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_SUB_PROGRAM, action.payload);
      }
    },
    setSubProgramId: (state, action: PayloadAction<number | null>) => {
      state.subProgramId = action.payload;
      if (typeof window !== 'undefined' && action.payload !== null) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.SUB_PROGRAM_ID, action.payload.toString());
      }
    },

    setSelectedKpiTab: (state, action: PayloadAction<KpiOption>) => {
      const params = new URLSearchParams(window.location.search);
      if (action.payload) {
        state.selectedKpiTab = action.payload;
        params.set('selectedKpiFilter', JSON.stringify(action.payload));
      } else {
        state.selectedKpiTab = null;
        params.set('selectedKpiFilter', '');
        params.delete('selectedKpiFilter');
      }
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    },

    setFilterOptions: (state, action: PayloadAction<FilterOption[]>) => {
      state.filterOptions = action.payload;
    },

    setSeatApprovalSessions: (state, action: PayloadAction<any[]>) => {
      state.seatApprovalSessions = action.payload;
    },

    setFilterConfig: (state, action: PayloadAction<FilterConfig>) => {
      state.filterConfig = action.payload;
    },

    setFilterConfigList: (state, action: PayloadAction<FilterConfig>) => {
      state.filterConfigList = action.payload;
    },
      setSeatApprovalToolbarKpi: (state, action: PayloadAction<any>) => {
      state.seatApprovalToolbarKpi = action.payload;
    },

    setAppliedFilters: (state, action: PayloadAction<AppliedFilters>) => {
      state.appliedFilters = action.payload;
    },

    updateFilter: (state, action: PayloadAction<{ key: string; value: any }>) => {
      const { key, value } = action.payload;
      if (value === null || value === undefined || 
          (Array.isArray(value) && value.length === 0)) {
        delete state.appliedFilters[key];
      } else {
        state.appliedFilters[key] = value;
      }
    },

    removeFilter: (state, action: PayloadAction<{ key: string; valueToRemove?: string }>) => {
      const { key, valueToRemove } = action.payload;
      
      if (!state.appliedFilters[key]) return;

      if (valueToRemove) {
        if (Array.isArray(state.appliedFilters[key].value)) {
          const newValues = state.appliedFilters[key].value.filter(
            (item: any) => 
              (typeof item === 'object' ? item.label !== valueToRemove && item.value !== valueToRemove : item !== valueToRemove)
          );
          
          if (newValues.length === 0) {
            delete state.appliedFilters[key];
          } else {
            state.appliedFilters[key] = {
              ...state.appliedFilters[key],
              value: newValues
            };
          }
        } else {
          delete state.appliedFilters[key];
        }
      } else {
        delete state.appliedFilters[key];
      }
    },

    clearAllFilters: (state) => {
      state.appliedFilters = {};
    },

    setDashboardFilters: (state, action: PayloadAction<any[]>) => {
      state.dashboardFilters = action.payload;
    },

    // Search-related actions
    setSearchValue: (state, action: PayloadAction<string>) => {
      state.search.value = action.payload;
    },

    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.search.open = action.payload;
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.search.query = action.payload;
    },

    setSearch: (state, action: PayloadAction<Partial<SearchState>>) => {
      state.search = { ...state.search, ...action.payload };
    },

    clearSearch: (state) => {
      state.search = { value: "", open: false, query: "" };
    },

    // Sort-related actions
    setSortState: (state, action: PayloadAction<SortState>) => {
      state.sortState = action.payload;
    },

    setSortKey: (state, action: PayloadAction<string>) => {
      state.sortState.sortKey = action.payload;
    },

    setSortOrder: (state, action: PayloadAction<'ASC' | 'DESC'>) => {
      state.sortState.sortOrder = action.payload;
    },

    toggleSortOrder: (state) => {
      state.sortState.sortOrder = state.sortState.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    },

    clearSort: (state) => {
      state.sortState = { sortKey: "", sortOrder: "ASC" };
    },

    // Loader count actions
    incrementLoader: (state, action: PayloadAction<string>) => {
      const loaderType = action.payload;
      const countKey = `${loaderType}LoaderCount` as keyof LoaderCounts;
      state.loaderCounts[countKey] += 1;
    },

    decrementLoader: (state, action: PayloadAction<string>) => {
      const loaderType = action.payload;
      const countKey = `${loaderType}LoaderCount` as keyof LoaderCounts;
      if (state.loaderCounts[countKey] > 0) {
        state.loaderCounts[countKey] -= 1;
      }
    },

    resetLoaderCounts: (state) => {
      state.loaderCounts = {
        smallLoaderCount: 0,
        largeLoaderCount: 0,
        mediumLoaderCount: 0,
      };
    },

clearView: (state) => {
      state.selectViewList = { key: 'registrations', label: 'Registrations',value:'registrations' };
    },
    resetRegistrationParams: (state) => {
      state.selectedKpiOption = null;
      state.selectedKpiTab = null;
      
      const params = new URLSearchParams(window.location.search);
      const currentParams = new URLSearchParams(params.toString());
      
      currentParams.delete('parentFilter');
      currentParams.delete('selectedKpiFilter');
      
      window.history.replaceState({}, '', window.location.pathname);
    },

    setPageSize: (state, action: PayloadAction<{ size: number; programId?: string }>) => {
    state.pagination.pageSize = action.payload.size;
    },
    
    setCurrentPage: (state, action: PayloadAction<{ page: number; programId?: string }>) => {
    state.pagination.currentPage = action.payload.page;
    },

    resetPagination: (state) => {
      state.pagination = {
        pageSize: 100,
        currentPage: 1,
      };
    },

    resetProgramState: (state, action: PayloadAction<string | undefined>) => {
      state.selectedKpiOption = null;
      state.filterOptions = [];
      state.filterConfig = null;
      state.filterConfigList = null;
      state.selectedKpiTab = null;
      state.activeTab = 0;
      state.selectedKpiFilter = null;
      state.appliedFilters = {};
      state.dashboardFilters = [];
      state.search = { value: "", open: false, query: "" }; 
      state.pagination = { pageSize: 100, currentPage: 1 }; 
      state.selectViewList = { key: 'registrations', label: 'Registrations', value: 'registrations' };
       state.sortState = { sortKey: "", sortOrder: "ASC" };
      state.programOptions = [];
      state.selectedSubProgram = null;
      state.subProgramId = null;
      state.programEndsAt = null;
      state.loaderCounts = {
        smallLoaderCount: 0,
        largeLoaderCount: 0,
        mediumLoaderCount: 0,
      };
    },

    setActiveTab: (state, action) => {
      state.activeTab = action.payload.index;
      state.activeTabKpiValue = action.payload.kpiValue;
      state.sortState = { sortKey: "", sortOrder: "ASC" };
    },

     setDashboardActiveTab: (state, action: PayloadAction<string>) => {
      state.dashboardActiveTab = action.payload;
       if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEYS.HDB_ACTIVE_TAB, action.payload);
      }
    },

    setSelectedKpiFilter: (state, action: PayloadAction<KpiFilter | null>) => {
      state.selectedKpiFilter = action.payload;
    },

    setTravelStatus: (state, action: PayloadAction<string>) => {
      state.travelStatus = action.payload;
    },

    setProgramName: (state, action: PayloadAction<string>) => {
      state.programName = action.payload;
    },

    setSelectViewList: (state, action: PayloadAction<any>) => {
      state.selectViewList = action.payload;
    },

    setProgramOptions: (state, action: PayloadAction<ProgramOption[]>) => {
      state.programOptions = action.payload;
    },

    setProgramEndsAt: (state, action: PayloadAction<string | null>) => {
      state.programEndsAt = action.payload;
    },

    resetRoomAllocationState: (state) => {
      state.programOptions = [];
      state.selectedSubProgram = null;
      state.subProgramId = null;
      state.programEndsAt = null;
    },
  }
});

export const {
  setSelectedKpiOption,
  setFilterOptions,
  setFilterConfig,
  setSelectedKpiTab,
  resetProgramState,
  resetRegistrationParams,
  setActiveTab,
  setSelectedKpiFilter,
  setProgramName,
  setTravelStatus,
  setFilterConfigList,
  setSelectViewList,
  setAppliedFilters,
  updateFilter,
  removeFilter,
  clearAllFilters,
  setDashboardFilters,
  setSearchValue,
  setSearchOpen,
  setSearchQuery,
  setSearch,
  setPageSize,
  setCurrentPage,
  resetPagination,
  clearSearch,
  setSortState,
  setSortKey,
  setSeatApprovalSessions,
  setSortOrder,
  setSeatApprovalToolbarKpi,
  toggleSortOrder,
  clearSort,
  clearView,
  setProgramOptions,
  setProgramsList,
  setSelectedSubProgram,
  setDashboardActiveTab,
  setSubProgramId,
  setProgramEndsAt,
  resetRoomAllocationState,
  incrementLoader,
  decrementLoader,
  resetLoaderCounts,
} = ProgramDataSlice.actions;

export default ProgramDataSlice.reducer;