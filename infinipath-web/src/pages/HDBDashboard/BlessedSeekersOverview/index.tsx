import { useEffect, useMemo, useState } from "react";
import {
  transformBarChartData,
  transformBarChartDataMultiColor,
  transformGroupedBarChartData,
} from "../../../utils/hdbDashboardUtils";
import { getCall } from "../../../services/apiService";
import clsx from "clsx";
import SectionCard from "../../../components/SectionCard";
import BarChart from "../../../components/Charts/BarChart";
import PieChart from "../../../components/Charts/PieChart";
import Demographics from "../Demographics";
import styles from "./index.module.scss";
import { useDashboard } from "../../../context/HDBDashboardContext";
import { getItemInLocalStorage } from "../../../services/localStorage";
import {noData} from "../../../constants/index.ts";
import { colorizeMahatriaInfinitheism } from "../../../common/components/ColorizeMahatriaInfinitheism/index.tsx";
import { useDispatch } from "react-redux";
import { setProgramName, setSelectedKpiTab } from "../../../reducers/ProgramReducer.ts";
import { PORTAL } from "../../../constants/urlConstants.ts";

const TabsContainer = ({ activeTab, setActiveTab, tabs }) => {
  return (
    <div className={styles.tabs}>
      {tabs.map((tab) => {
        // Handle both string tabs and object tabs with id/name
        const tabId = typeof tab === "string" ? tab : tab.id;
        const tabName = typeof tab === "string" ? tab : tab.name;

        return (
          <button
            key={tabId}
            className={clsx(styles.tabButton, {
              [styles.active]: tabId === activeTab,
            })}
            onClick={() => setActiveTab(tabId)}
          >
            {colorizeMahatriaInfinitheism(tabName)}
          </button>
        );
      })}
    </div>
  );
};

// Local Stats
const Stats = ({ data }) => {


  return (
    <div className={styles.statsCardRow}>
      {data.map((item, index) => (
        <div
          key={item.key}
          className={`${styles.statCardWrapper} ${
            index === 0 ? styles.withBorder : ""
          }`}
        >
          <div className={styles.statCardCount}>
            {item.key !== "totalSeekers" ? (
              <>
                {item.pendingCount}
                {"/"}
                <span className={styles.count}>{item.totalCount}</span>
              </>
            ) : (
              item.count
            )}
          </div>
          <div className={styles.statCardLabel}>
            {item.displayName?.split(" (")[0] || item.displayName}
          </div>
        </div>
      ))}
    </div>
  );
};

// Local Payment Status Chart
const PaymentStatus = ({ section }) => {
 
  const { updateFilters } = useDashboard();
  const dispatch = useDispatch();

  const transformFiltersForUpdate = (data) => {
    console.log(data,"filtersssss")
      const transformedFilters = {};
      
      const filters = data.filters ?? data;
      console.log(filters,"filters")
      
      Object.entries(filters).forEach(([key, value]) => {
        if (key === 'kpiFilter' || key === 'kpiCategory'  ) {
          return;
        }
        transformedFilters[key] = {
          label: key == "paymentStatus" ? "payment status" : "payment mode", // or data.displayName if available
          value: Array.isArray(value) 
            ? value.map(item => ({
                value: item,
                label: data.displayName || item
              }))
            : [{
                value: value,
                label: data.displayName || value
              }]
        };
      });
    
      return transformedFilters;
    };

  if (!section) return null;

  const { labels, datasets } = useMemo(
    () => transformGroupedBarChartData(section),
    [section],
  );

  const handleBarClick = ({ filterInfo }) => {
  
    if (filterInfo) {
      updateFilters(transformFiltersForUpdate(filterInfo));
       const formConfig = getItemInLocalStorage('filterConfig');
      dispatch(
        setSelectedKpiTab({
          kpiFilter: filterInfo?.kpiFilter,
          kpiCategory: filterInfo.kpiCategory,
        }),
      );
        
    }
  };

  return (
   <SectionCard title={`${section?.displayName}`}>
  {section?.count ? (
    <BarChart
      labels={labels}
      datasets={datasets}
      colors={["#2196F3", "#9E9E9E"]}
      showLegend={true}
      onBarClick={handleBarClick}
    />
  ) : (
    <div className={styles.noData}>
      {noData}
    </div>
  )}
</SectionCard>
  );
};

// Local Travel Overview Pie Chart
const TravelOverview = ({ section }) => {
  const {updateFilters} = useDashboard()
  const dispatch = useDispatch();

  const transformFiltersForUpdate = (data) => {
      const transformedFilters = {};
      
      const filters = data.filters ?? data;
      
      Object.entries(filters).forEach(([key, value]) => {
        if (key === 'kpiFilter' || key === 'kpiCategory'  ) {
          return;
        }
        transformedFilters[key] = {
          label: key ,
          value: Array.isArray(value) 
            ? value.map(item => ({
                value: item,
                label: data.displayName || item
              }))
            : [{
                value: value,
                label: data.displayName || value
              }]
        };
      });
    
      return transformedFilters;
    };
  

  if (!section) return null;

  const labels = section?.values?.map((item) => item.displayName) || [];
  const dataValues = section?.values?.map((item) => item.count) || [];
  const filterInfo = section?.values.map((item) =>  item.filters) || []

  const handleSliceClick = (sliceInfo) => {
    const index = sliceInfo.index;

    if (filterInfo[index]) {
      updateFilters(transformFiltersForUpdate(filterInfo[index]));
      // const formConfig = getItemInLocalStorage('filterConfig');
      if(filterInfo[index]?.kpiFilter){
        dispatch(
          setSelectedKpiTab({
            kpiFilter: filterInfo[index]?.kpiFilter,
            kpiCategory: filterInfo[index]?.kpiCategory,
          }),
        );
      }
    
    }
  };

  return (
   <SectionCard title={`${section?.displayName}`}>
  {section?.count ? (
    <PieChart
      labels={labels}
      dataValues={dataValues}
      
      colors={[
        "#2196F3",
        "#A9D9FF",
      ]}
      centerLabel={`${section?.displayName}`}
      onSliceClick={handleSliceClick}
      isHalf={false}
    />
  ) : (
    <div className={styles.noData}>
      {noData}
    </div>
  )}
</SectionCard>
  );
};

const CompletedTravelPlan = ({ section }) => {
  const { updateFilters } = useDashboard();
  const dispatch = useDispatch();

  const { labels, datasets } = useMemo(
    () => transformBarChartDataMultiColor(section),
    [section],
  );
  const 
  
  transformFiltersForUpdate = (data) => {
    const transformedFilters = {};
    
    const filters =  data;
    
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'kpiFilter' || key === 'kpiCategory' ) {
        return;
      }
      transformedFilters[key] = {
        label:section?.label , // or data.displayName if available
        value: Array.isArray(value) 
          ? value.map(item => ({
              value: item,
              label: data.displayName || item
            }))
          : [{
              value: value,
              label: data.displayName || value
            }]
      };
    });
  
    return transformedFilters;
  };


  // const handleBarClick = ({ filterInfo }) => {
  //   if (filterInfo) {
  //     updateFilters(transformFiltersForUpdate(filterInfo));
  //     const formConfig = getItemInLocalStorage('filterConfig');

  //     dispatch(setSelectedKpiTab(formConfig?.data?.parentOptions[0]?.kpiOptions[0]));
    
  //   }
  // };

  return (
   <SectionCard title={`${section?.displayName}`}>
  {section?.count ? (
    <BarChart
      labels={labels}
      datasets={datasets}
      showLegend={true}
      colors={["#00B0A2", "#E07C24", "#FFCB29"]}
      horizontal
      isClick={false}
      // onBarClick={handleBarClick}
    />
  ) : (
    <div className={styles.noData}>
      {noData}
    </div>
  )}
</SectionCard>
  );
};
const role = getItemInLocalStorage("seekerDetails")?.role || "";

const BlessedSeekersOverview = ({ programId }) => {
  const [activeTab, setActiveTab] = useState("");
  const [dashboardSections, setDashboardSections] = useState({});
  const [subProgramsData, setSubProgramsData] = useState([]);
  const [sectionData, setSectionData] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (sectionData?.length) {
      const transformed = sectionData.reduce((acc, curr) => {
        acc[curr.key] = curr;
        return acc;
      }, {});
      setDashboardSections(transformed);
    }
  }, [sectionData]);

  useEffect(() => {
    if (!programId) return;
    getSubPrograms();
  }, [programId]);

  useEffect(() => {
    if (!activeTab) return;
    getSubPorgramDashboardData();
  }, [activeTab]);

  const getSubPorgramDashboardData = async () => {
    try {
      const subProgramId = activeTab;
      const url = `registration/program/${programId}/dashboard/sub-program/${subProgramId}`;
      const res = await getCall(url, undefined, PORTAL);
      const data = res?.data?.data || [];
      setSectionData(data);
    } catch (error) {
      console.error("Error fetching sub-programs:", error);
    }
  };

  const getSubPrograms = async () => {
    try {
      const res = await getCall(`program/${programId}`, undefined, PORTAL);
      dispatch(setProgramName(res?.data?.data?.name));
      const data = res?.data?.data?.groupedPrograms || [];
      const transformedData = data.map(({ id, name }) => {
        return {
          id,
          name,
        };
      });
      setSubProgramsData(transformedData);
      setActiveTab(transformedData[0].id);
    } catch (error) {
      console.error("Error fetching sub-programs:", error);
    }
  };

  const getSection = (key) => dashboardSections[key];
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.pageTitle}>Blessed seekers overview</h2>
      {subProgramsData && (
        <TabsContainer
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={subProgramsData}
        />
      )}
      <div className={styles.seekersOverviewContainer}>
        <Stats data={getSection("subProgramRegistrations")?.values || []} />
        <div className={styles.grid}>
          <Demographics section={getSection("demographics")} />
          <PaymentStatus section={getSection("paymentStatus")} />
          <TravelOverview section={getSection("travelStatus")} />
          <CompletedTravelPlan section={getSection("travelPlan")} />
        </div>
      </div>
    </div>
  );
};

export default BlessedSeekersOverview;
