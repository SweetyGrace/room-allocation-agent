import { createSlice } from "@reduxjs/toolkit";
// import { create } from "lodash";

interface AppState {
    filters: {
        [key: string]: string[];
      };
      reloadType: boolean;
    }
    const initialState: AppState = {
        filters: {
            selectedFloor: [],
            selectedOccupancy: [],
            selectedGender: [],
            selectedAge: [],
            selectedLocation: [],
        },
        reloadType: false,
        };
    const FilterData = createSlice({
        name: 'filter',
        initialState,
        reducers: {
            addFilters: (state, data) => {
                state.filters = { ...state.filters, ...data.payload };
              },
              clearFilters: (state) => {
                state.filters = initialState.filters;
              },
              UpdateReloadType: (state) => {
                state.reloadType = !state.reloadType;
              },

        },
    });

    export const { addFilters, clearFilters , UpdateReloadType} = FilterData.actions;
    export default FilterData.reducer;
    

