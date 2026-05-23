import { useEffect, useMemo, useState } from "react";
import {
  formatDisplayNameWithNewline,
  transformBarChartData,
  transformGroupedBarChartData,
  transformPieChartData,
} from "../../utils/hdbDashboardUtils";
import { useParams } from "react-router-dom";
import BarChart from "../../components/Charts/BarChart";
import SectionCard from "../../components/SectionCard";
import DetailedTable from "./DetailedTable";
import BlessedSeekersOverview from "./BlessedSeekersOverview";
import shuffleSeekers from "../../assets/images/Shuffle.svg";
import blessedSeekers from "../../assets/images/blessedSeeker.svg";
import clockDownCount from "../../assets/images/ClockCountdown.svg";
import groupPeople from "../../assets/images/groupPeople.svg";
import clockAlert from "../../assets/images/clock-alert.svg";
import Messages from "./Messages";
import YetToReview from "../../components/YetToReviewCard";
import Loader from "../../common/components/Loader";
import StatCard from "../../components/Charts/StatCard";
import { useDashboard } from "../../context/HDBDashboardContext";
import styles from "./index.module.scss";
import { getCallWithLoader } from "../../services/apiService";
import Demographics from "./Demographics";
import { getItemInLocalStorage } from "../../services/localStorage";
import payment from "../../assets/images/payment.svg";
import travel from "../../assets/images/travel.svg";
import invoice from "../../assets/images/invoice.svg";
import PieChart from "../../components/Charts/PieChart";
import { CHART_COLORS, TEXT_CONSTANTS, DASHBOARD_KEYS } from "../../constants";
import { useGridStatePersistence } from "@mui/x-data-grid/internals";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedKpiTab } from "../../reducers/ProgramReducer";
import { textConstant } from "../../constants/textConstants";
import { PORTAL } from "../../constants/urlConstants";
import { PREFERENCE_KEYS } from "../../utils/functions";
import { transformFiltersForUpdate } from "../../utils/commonFunctions";
import { RootState } from "../../store";


  
const transformFiltersForLocation = (data) => {
  const transformedFilters = {};
  // If data already IS the filters object
  const filters = data.filters ?? data;
  Object.entries(filters).forEach(([key, value]) => {
    if (key === 'kpiFilter' || key === 'kpiCategory') {
      return;
    }

    transformedFilters[key] = {
      label: data.label || key, // or data.displayName if available
      value: Array.isArray(value)
        ? value.map(item =>
            typeof item === "object" && "value" in item
              ? { value: item.value, label: item.label ?? item.value }
              : { value: item, label: item }
          )
        : [{ value, label: value }]
    };
  });

  return transformedFilters;
};


const DashboardIcons = {
  totalRegistrations: <img src={groupPeople} alt="Total Registrations" />,
  blessedSeekers: <img src={blessedSeekers} alt="Blessed Seekers" />,
  newRegistrations: <img src={clockAlert} alt="New Registrations" />,
  pendingDetails: <img src={clockDownCount} alt="Pending Details" />,
  swapRequest: <img src={shuffleSeekers} alt="Swap Request" />,
  paymentPending: <img src={payment} alt="Payment Pending" />,
  travelPending: <img src={travel} alt="Travel Pending" />,
  invoicePending: <img src={invoice} alt="Invoice Pending" />,
};

const SnapChartOfRegistrations = ({ section }) => {
  const { updateFilters } = useDashboard();
  const dispatch = useDispatch();
  const { labels, datasets } = useMemo(
    () => transformBarChartData(section),
    [section],
  );

  const handleBarClick = (clickedBarData) => {
    const filters = clickedBarData?.filterInfo;
    if (filters) {
      if (filters?.kpiFilter && filters?.kpiCategory) {
        updateFilters(filters);
        dispatch(
          setSelectedKpiTab({
            kpiFilter: filters.kpiFilter,
            kpiCategory: filters.kpiCategory,
          }),
        );
      } else {
        const transformedFilters = transformFiltersForLocation(filters);
        updateFilters(transformedFilters);
        const formConfig = getItemInLocalStorage('filterConfig');
        dispatch(setSelectedKpiTab(formConfig?.data?.parentOptions[0]?.kpiOptions[0]));
      }
    }
  };

  return (
    <SectionCard
      title={section?.displayName}
      totalLabel={`${section?.count ?? 0}`}
      label="Registrations"
    >
      {section?.count ? (
        <BarChart
          labels={labels}
          datasets={datasets}
          colors={[CHART_COLORS.SNAPSHOT_REGISTRATIONS]}
          showLegend={true}
          onBarClick={handleBarClick}
        />
      ) : (
        <div className={styles.noData}>{TEXT_CONSTANTS.NO_DATA}</div>
      )}
    </SectionCard>
  );
};

const ProgramRegistrations = ({ data, iconMap, setActiveHeaderTab }) => {
  const { updateFilters } = useDashboard();
  const dispatch = useDispatch();

  const handleClick = (data) => {
    
    if (data?.displayName === "Total registrations") {
      setActiveHeaderTab(textConstant.REGISTRATIONS);
      localStorage.setItem("hdb_active_tab", textConstant.REGISTRATIONS);
    }
    if (data?.filters) {
      if(data?.displayName === "Unassigned" || data?.displayName === "Blessed seekers")
        {
          updateFilters(data?.filters)
        }
        else{
      const transformedFilters = transformFiltersForUpdate(data);
      updateFilters(transformedFilters);
        }
    }
  };

  return (
    <div className={styles.programRegistrations}>
      {data.map((eachData) => {
        const { key } = eachData;
        return (
          <StatCard
            handleClick={handleClick}
            icon={iconMap[key]}
            cardData={eachData}
          />
        );
      })}
    </div>
  );
};

const SnapshotOfBlessedSeekers = ({ section }) => {
  const { updateFilters } = useDashboard();
  const { labels, datasets } = useMemo(
    () => transformBarChartData(section),
    [section],
  );
  const formConfig = useSelector((state: RootState) => state.ProgramReducer.filterConfigList);
  const dispatch = useDispatch();
  const handleBarClick = ({ filterInfo }) => {
    if (filterInfo) {
      updateFilters(filterInfo);
      if (filterInfo?.kpiFilter) {
        dispatch(
          setSelectedKpiTab({
            kpiFilter: filterInfo?.kpiFilter,
            kpiCategory: filterInfo.kpiCategory,
          }),
        );
      } else {
        dispatch(
          setSelectedKpiTab(formConfig?.data?.parentOptions[0]?.kpiOptions[0]),
        );
      }
    }
  };

  return (
    <SectionCard
      title={section?.displayName}
      totalLabel={`${section?.count ?? 0}`}
      label="Total seekers"
    >
      {section?.count ? (
        <BarChart
          labels={labels}
          datasets={datasets}
          showLegend={true}
          colors={[CHART_COLORS.SNAPSHOT_BLESSED]}
          onBarClick={handleBarClick}
        />
      ) : (
        <div className={styles.noData}>{TEXT_CONSTANTS.NO_DATA}</div>
      )}
    </SectionCard>
  );
};

const PreferenceAgainstBlessings = ({ section }) => {
  const { updateFilters } = useDashboard();

  const { labels, datasets } = useMemo(
    () => transformGroupedBarChartData(section),
    [section],
  );
  const dispatch = useDispatch();

  // Generate dynamic colors based on the keys in section.values
  const dynamicColors = useMemo(() => {
    if (!section?.values) return ["#00B0A2", "#6EA9FF"];
    
    const colors = [];
    section.values.forEach(program => {
      if (program.values) {
        program.values.forEach(item => {
          if (item.key === PREFERENCE_KEYS.TOTAL_PREFERENCES) {
            colors.push("#00B0A2");
          } else if (item.key === PREFERENCE_KEYS.TOTAL_BLESSED_SEEKERS) {
            colors.push("#6EA9FF");
          }
        });
      }
    });
    
    // Fallback to default colors if no matching keys found
    return colors.length > 0 ? colors : ["#00B0A2", "#6EA9FF"];
  }, [section]);

  const handleBarClick = ({ filterInfo }) => {
    if (filterInfo) {
      updateFilters(filterInfo);
      dispatch(
        setSelectedKpiTab({
          kpiFilter: filterInfo?.kpiFilter,
          kpiCategory: filterInfo?.kpiCategory,
        }),
      );
    }
  };

  return (
    <SectionCard title={section?.displayName}>
      {section?.count ? (
        <BarChart
          labels={labels}
          datasets={datasets}
          colors={dynamicColors}
          showLegend={true}
          isClick = {false}
          // onBarClick={handleBarClick}
        />
      ) : (
        <div className={styles.noData}>{TEXT_CONSTANTS.NO_DATA}</div>
      )}
    </SectionCard>
  );
};

const InvoiceGenerated = ({ section }) => {
  const { updateFilters } = useDashboard();
  const dispatch = useDispatch();

  const completedObj = section?.values?.find(
    (statusItem) => statusItem.displayName === "Completed",
  );
  const pendingObj = section?.values?.find(
    (statusItem) => statusItem.displayName === "Pending",
  );

  const completed = completedObj?.count ?? 0;
  const pending = pendingObj?.count ?? 0;

  const total = completed + pending;
  const displayName = formatDisplayNameWithNewline(section?.displayName);
  const centerLabel = `${displayName}\n${completed} / ${total}`;

  const dataValues = [completed, pending];
  const colors = [CHART_COLORS.INVOICE_COMPLETED, CHART_COLORS.INVOICE_PENDING];
  const formConfig = useSelector((state: RootState) => state.ProgramReducer.filterConfigList);

  const handleSliceClick = (sliceInfo) => {
    const index = sliceInfo.index;
    dispatch(
      setSelectedKpiTab(formConfig?.data?.parentOptions[0]?.kpiOptions[0]),
    );

    if (index === 0 && completedObj?.filters) {
      updateFilters(transformFiltersForUpdate(completedObj));
    } else if (index === 1 && pendingObj?.filters) {
      updateFilters(transformFiltersForUpdate(pendingObj));
    }
  };

  return (
    <SectionCard title={section?.displayName}>
      {section?.count ? (
        <PieChart
          labels={["Completed", "Pending"]}
          dataValues={dataValues}
          colors={colors}
          isHalf={true}
          centerLabel={centerLabel}
          onSliceClick={handleSliceClick}
        />
      ) : (
        <div className={styles.noData}>{TEXT_CONSTANTS.NO_DATA}</div>
      )}
    </SectionCard>
  );
};

const LocationInsights = ({ section }) => {
  const { updateFilters } = useDashboard();

  const { labels, datasets } = useMemo(
    () => transformBarChartData(section),
    [section],
  );
  const dispatch = useDispatch();
  const filterConfig = useSelector((state: RootState) => state.ProgramReducer.filterConfigList);

  const handleBarClick = ({ filterInfo }) => {
    const transformedFilters=transformFiltersForLocation(filterInfo)
    if (filterInfo) {
      dispatch(
        setSelectedKpiTab(filterConfig?.data?.parentOptions[0]?.kpiOptions[0]),
      );
      updateFilters(transformedFilters);

    }
  };

  return (
    <SectionCard
      title={section?.displayName || TEXT_CONSTANTS.LOCATION_INSIGHTS_TITLE}
      totalLabel={`${section?.count ?? 0}`}
      label="Locations"
    >
      {section?.count ? (
        <BarChart
          labels={labels}
          datasets={datasets}
          colors={[CHART_COLORS.LOCATION_INSIGHTS]}
          showLegend={true}
          onBarClick={handleBarClick}
        />
      ) : (
        <div className={styles.noData}>{TEXT_CONSTANTS.NO_DATA}</div>
      )}
    </SectionCard>
  );
};

interface HDBDashboardProps {
  setActiveTab?: (tab: string) => void;
}

const HDBDashboard: React.FC<HDBDashboardProps> = ({ setActiveTab }) => {
  const [dashboardData, setDashboardData] = useState({});
  const { programId } = useParams();

  useEffect(() => {
    if (!programId) return;
    fetchDashboardData();
  }, [programId]);

  const getSection = (key) => dashboardData[key];

  const fetchDashboardData = async () => {
    try {
      const url = `registration/program/${programId}/dashboard`;

      const res = await getCallWithLoader(url, undefined, PORTAL, textConstant.LARGE  );
      const data = res?.data?.data || [];
      const transformed = data.reduce((acc, curr) => {
        acc[curr.key] = curr;
        return acc;
      }, {});

      setDashboardData(transformed);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };
  const role = getItemInLocalStorage("seekerDetails")?.role || "";

  const handleSomeAction = () => {
    setActiveTab?.('registrations');
  };

  return (
    <div className={styles.dashboard}>
          <ProgramRegistrations
            data={
              getSection(DASHBOARD_KEYS.PROGRAM_REGISTRATIONS)?.values || []
            }
            iconMap={DashboardIcons}
            setActiveHeaderTab = {setActiveTab}
          />
          {role !== "finance_manager" && <Messages />}
          <div className={styles.grid}>
            <YetToReview
              data={getSection(DASHBOARD_KEYS.YET_TO_REVIEW)}
              programId={programId}
              fetchDashboardData={fetchDashboardData}
            />
            {role != "finance_manager" && (
              <PreferenceAgainstBlessings
                section={getSection(DASHBOARD_KEYS.PREFERRED_VS_BLESSED)}
              />
            )}
            {role != "finance_manager" && (
              <SnapChartOfRegistrations
                section={getSection(DASHBOARD_KEYS.PROGRAM_APPROVAL_STATUS)}
              />
            )}
            <SnapshotOfBlessedSeekers
              section={getSection(DASHBOARD_KEYS.BLESSED_SEEKERS)}
            />
            <Demographics section={getSection(DASHBOARD_KEYS.DEMOGRAPHICS)} isInclude = {true} />
            <InvoiceGenerated
              section={getSection(DASHBOARD_KEYS.INVOICE_STATUS)}
            />
            {role != "finance_manager" && role != "relational_manager" && (
              <LocationInsights
                section={getSection(DASHBOARD_KEYS.LOCATION_INSIGHTS)}
              />
            )}
          </div>
          {role !== "operational_manager" && role!=="rm_support" && role !== "finance_manager" && (
            <DetailedTable
              detailedData={getSection(DASHBOARD_KEYS.DETAILED_DATA) || []}
            />
          )}
            {role !== "mahatria" && role !== "finance_manager" && (
              <DetailedTable
                detailedData={getSection(DASHBOARD_KEYS.GOODIES_DATA) || []}
              />
            )}
          {role !== "mahatria" && role !== "finance_manager" && (
            <DetailedTable
              tshirtData={getSection(DASHBOARD_KEYS.GOODIES_TSHIRT_DATA) || []}
              jacketData={getSection(DASHBOARD_KEYS.GOODIES_JACKET_DATA) || []}
              showViewSelector={true}
            />
          )}
          <BlessedSeekersOverview programId={programId} />
    </div>
  );
};

export default HDBDashboard;
