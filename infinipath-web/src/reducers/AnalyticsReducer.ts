import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AnalyticsStateFilters {
    audienceType: string[];
    gender: string[];
    ageGroup: string[];
    location: string[];
    startDate?: string;
    endDate?: string;
}

interface AnalyticsState {
  sessionType: string;
  sessionDate: string;
  totalAudience: number;
  kpiType: string;
  registrationInsights: string;
  audienceInsights: string;
  filters: AnalyticsStateFilters;
  aggregatedFilters: AnalyticsStateFilters;
  tempFilters: AnalyticsStateFilters;
}

// Load initial state from localStorage if available
const loadStateFromLocalStorage = (): AnalyticsState => {
  const savedState = localStorage.getItem('analyticsState');
  if (savedState) {
    const parsedState = JSON.parse(savedState);
    // Ensure filters are initialized with default values
    return {
      ...parsedState,
      kpiType: 'All',
      registrationInsights: 'All',
      audienceInsights: 'All',
      filters: {
        audienceType: [],
        gender: [],
        ageGroup: [],
        location: [],
      },
      aggregatedFilters: {
        audienceType: [],
        gender: [],
        ageGroup: [],
        location: [],
        startDate: '',
        endDate:  '',
      }
    };
  }
  return {
    sessionType: 'default',
    sessionDate: '',
    totalAudience: 0,
    kpiType: 'All',
    registrationInsights: 'All',
    audienceInsights: 'All',
    filters: {
      audienceType: [],
      gender: [],
      ageGroup: [],
      location: [],
    },
    aggregatedFilters: {
      audienceType: [],
      gender: [],
      ageGroup: [],
      location: [],
      startDate: "",
      endDate:  "",
    },
    tempFilters: {
      audienceType: [],
      gender: [],
      ageGroup: [],
      location: [],
    }
  };
};

/**
 * Save state to localStorage (excluding filters)
 * @param state AnalyticsState
 */

const saveStateToLocalStorage = (state: AnalyticsState) => {
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { filters, ...stateWithoutFilters } = state; // Destructure to exclude filters
  localStorage.setItem('analyticsState', JSON.stringify(stateWithoutFilters));
};

/**
 * Initial state for the analytics slice
 * @type {AnalyticsState}
 **/
const initialState: AnalyticsState = loadStateFromLocalStorage();

/**
 * Analytics slice to manage the analytics state
 * @type {Slice}
 * @name analyticsSlice
 */
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    // Set the session type for the analytics
    setSessionType(state, action: PayloadAction<string>) {
      state.sessionType = action.payload;
      saveStateToLocalStorage(state);
    },
    // Set the session date for the analytics
    setSessionDate(state, action: PayloadAction<string>) {
      state.sessionDate = action.payload;
      saveStateToLocalStorage(state); 
    },
    // Set the total audience for the analytics
    setTotalAudience(state, action: PayloadAction<number>) {
      state.totalAudience = action.payload;
      saveStateToLocalStorage(state); 
    },
    // Set the filters for the analytics
    setAnaltyicsFilters(state, action: PayloadAction<{ [key: string]: string[] }>) {
      state.filters = { ...state.filters, ...action.payload };
      // saveStateToLocalStorage(state);
      // Do NOT save to localStorage here
    },
    setKpiType(state, action: PayloadAction<string>) {
      state.kpiType = action.payload;
      // saveStateToLocalStorage(state);
    },
    setRegistrationInsights(state, action: PayloadAction<string>) {
      state.registrationInsights = action.payload;
    },
    setAudienceInsights(state, action: PayloadAction<string>) {
      state.audienceInsights = action.payload;
    },
    setRemoveFilters(state) {
      state.filters = {
        audienceType: [],
        gender: [],
        ageGroup: [],
        location: [],
      }
  },
  setAggregatedFilters(state, action: PayloadAction<{ [key: string]: string[] }>) {
    state.aggregatedFilters = { ...state.aggregatedFilters, ...action.payload };
    // saveStateToLocalStorage(state);
    // Do NOT save to localStorage here
  },
  setRemoveAggregatedFilters(state) {
    state.aggregatedFilters = {
      audienceType: [],
      gender: [],
      ageGroup: [],
      location: [],
      startDate: '',
      endDate:  '',
    }
},
}});

export const { setSessionType, setSessionDate, setTotalAudience, setAnaltyicsFilters,setKpiType, setRemoveFilters, setAggregatedFilters,setRemoveAggregatedFilters, setRegistrationInsights, setAudienceInsights } = analyticsSlice.actions;
export default analyticsSlice.reducer;