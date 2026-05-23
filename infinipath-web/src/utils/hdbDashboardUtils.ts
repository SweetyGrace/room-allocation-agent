import { endPoints, PORTAL } from "../constants/urlConstants";
import { getCall } from "../services/apiService";
import { Dispatch } from 'redux';
import { AnyAction } from '@reduxjs/toolkit';
import { resetProgramState,setFilterConfigList } from "../reducers/ProgramReducer";

export const transformBarChartData = (section) => {
  const labels = section?.values?.map((v) => v.displayName);
  const data = section?.values?.map((v) => v.count);
  const filterInfo = section?.values?.map((v) => v.filters);
  return { labels, datasets: [{ label: section?.displayName, data, filterInfo}] };
};

export const transformGroupedBarChartData = (section) => {
  const labels = section?.values?.map((v) => v.displayName);
  const categories =
    section?.values?.[0]?.values?.map((v) => v.displayName) || [];
  const datasets = categories.map((cat) => ({
    label: cat,
    data: section.values.map((g) => {
      const found = g.values.find((v) => v.displayName === cat);
      return found?.count ?? 0;
    }),
    completeData: section.values.map((g) => {
      const found = g.values.find((v) => v.displayName === cat);
      return found ?? [];
    }),
    filterInfo: section.values.map((g) => {
      const found = g.values.find((v) => v.displayName === cat);
      return found?.filters ?? "";
    }),
  }));
  return { labels, datasets };
};

export const transformPieChartData = (section) => {
  const labels = section?.values?.map((v) => v.displayName);
  const datasets = section?.values?.map((v) => v.count);
  const filterInfo = section?.values?.map((v) => v.filters);
  return { labels, datasets, filterInfo };
};


export function formatDisplayNameWithNewline(displayName?: string): string {
  return displayName ? displayName.replace(" ", "\n") : "";
}

export const getFilterConfig = async (
  programId: number | string, 
  dispatch?: Dispatch<AnyAction>
) => {
  try {
    // dispatch(resetProgramState());
    const response = await getCall(endPoints.filterConfig(programId), undefined, PORTAL);
    
    if (response?.data && dispatch) {
      // Store in Redux store instead of localStorage
      dispatch(setFilterConfigList(response.data));
      localStorage.setItem('programId', programId.toString());
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching filter config:', error);
    return null;
  }
};

export const transformBarChartDataMultiColor = (section) => {
  if (!section || !section.values || !Array.isArray(section.values)) {
    return { labels: [], datasets: [] };
  }

  const labels = section?.values?.map((g) => g?.displayName);
  const datasets = [
    {
      label: section?.displayName || section?.label ,
      data: section?.values.map((value) => value?.count),
      completeData: section?.values,
      filterInfo: section?.values?.map((value) => value?.filters),
    }
  ];
  
  return { labels, datasets };
};