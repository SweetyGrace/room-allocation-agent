import { useMemo } from "react";
import BarChart from "../../../components/Charts/BarChart";
import SectionCard from "../../../components/SectionCard";
import { transformGroupedBarChartData } from "../../../utils/hdbDashboardUtils";
import { useDashboard } from "../../../context/HDBDashboardContext";
import styles from "./index.module.scss";
import { noData } from "../../../constants";
import { useDispatch } from "react-redux";
import { setSelectedKpiTab } from "../../../reducers/ProgramReducer";
import { getItemInLocalStorage } from "../../../services/localStorage";

const Demographics = ({ section, isInclude = false }) => {
  const { updateFilters } = useDashboard();

  const { labels: xLabels, datasets } = useMemo(
    () => transformGroupedBarChartData(section),
    [section],
  );
  
  const transformFiltersForUpdate = (data, completeData) => {
    const transformedFilters = {};
    console.log("transformFilters input", data);
  
    // If data already IS the filters object
    const filters = data.filters ?? data;
  
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'kpiFilter' || key === 'kpiCategory') {
        return;
      }
  
      transformedFilters[key] = {
        label: key, // or data.displayName if available
        value: Array.isArray(value)
          ? value.map(item =>
              typeof item === "object" && "value" in item
                ? { value: item.value, label: item.label ?? item.value }
                : { value: item, label: item }
            )
          : [{ value, label: value }]
      };
    });
  
    console.log("transformFilters output", transformedFilters);
    return transformedFilters;
  };
  
  const dispatch = useDispatch();
  const handleBarClick = ({ filterInfo, data }) => {
    if (filterInfo) {
      const transformedFilters=transformFiltersForUpdate(filterInfo, data)
      updateFilters(transformedFilters);

      if(filterInfo?.kpiFilter){
      dispatch(
        setSelectedKpiTab({
          kpiFilter: filterInfo?.kpiFilter[0],
          kpiCategory: filterInfo.kpiCategory[0],
        }),
      );
    }
    else{
       const formConfig = getItemInLocalStorage('filterConfig');
       dispatch(setSelectedKpiTab(formConfig?.data?.parentOptions[0]?.kpiOptions[0]));
    }
    }
  };

  return (
     <SectionCard title={section?.displayName}>
    {section?.count ? (
      <BarChart
        labels={xLabels}
        datasets={datasets}
        colors={["#2F73F1", "#FF60A5"]}
        stacked={true}
        showLegend={true}
        onBarClick={handleBarClick}
        includeAllGenders={true} // New prop to enable combined
      />
    ) : (
      <div className={styles.noData}>
        {noData}
      </div>
    )}
  </SectionCard>
   
  );
};

export default Demographics;