import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import singleUser from "../../assets/images/single-user.svg";
import hoverSingleUser from "../../assets/images/hover-single-user.svg";
import { getItemInLocalStorage } from "../../services/localStorage";
import Loader from "../../common/components/Loader";
import { AdminKPIDetails, WebinarData } from "./Analtyics.modal";
import { useDispatch, useSelector } from "react-redux";
import { getCall } from "../../services/apiService";
import { RootState } from "../../store";
// import { mockAdminKPIResponse } from "../../constants";
import { AGGREGATE_KPI_TEXT, KPI_TEXT } from "../../constants";
import GraphContainer from "../MeetingAnalyticsDashboardSectionsAggregate/GraphContainer";
import HeaderSection from "../MeetingAnalyticsDashboardSectionsAggregate/HeaderSection";
import StatisticsCard, {
  KPIDataItem,
} from "../MeetingAnalyticsDashboardSectionsAggregate/StatisticsCard";
import { endPoints, INFINIPATH } from "../../constants/urlConstants";
import { setAggregatedFilters } from "../../reducers/AnalyticsReducer";

import { formatCount, formatDateToUTC, formatDateWithoutUTC, formatKpiObjectValues } from "../../utils/commonFunctions";
import attendacerate from "../../assets/images/attendance-rate.svg";
import hoverAttendaceRate from "../../assets/images/hover-attendance-rate.svg";
import lateComers from "../../assets/images/late-comers.svg";
import hoverLateComers from "../../assets/images/hover-late-comers.svg";
import absentees from "../../assets/images/absentees.svg";
import hoverAbsentees from "../../assets/images/hover-absentees.svg";
import newJoiners from "../../assets/images/new-joinees.svg";
import hoverNewJoiners from "../../assets/images/hover-new-joinees.svg";
import joinWithOthers from "../../assets/images/join-with-others.svg"
import hoverJoinWithOthers from "../../assets/images/hover-join-with-other.svg";
import verifiedSeekers from "../../assets/images/verified.svg";
import hoverVerifiedSeekers from "../../assets/images/hover-verified.svg";
import notVerifiedSeekers from "../../assets/images/not-verified.svg"
import hoverNotVerifiedSeekers from "../../assets/images/hover-not-verified.svg";
import dropOffs from "../../assets/images/drop-offs.svg";
import hoverDropOffs from "../../assets/images/hover-drop-offs.svg";
import noDataFound from "../../assets/images/aggregated-empty.svg";
import totalAttended from "../../assets/images/total-seekers.svg";
import hoverTotalAttended from "../../assets/images/hover-total-seekers.svg";
import { subMonths } from "date-fns";


const NewAggregatedDashboard: React.FC = () => {
  const [kpiIconData, setKpiIconData] = useState<KPIDataItem[]>();
  const [loading, setLoading] = useState(true);
  const [webinarData, setWebinarData] = useState<WebinarData>();
  const [analyticsData, setAnalyticsData] = useState<AdminKPIDetails>();
  const [webinarLoading, setWebinarLoading] = useState(true);
  const [kpiLoading, setKpiLoading] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.AnalyticsReducer.aggregatedFilters);
  const today = new Date();
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: formatDateToUTC(new Date(subMonths(today, 1)), true), // Start date at 00:00:00+00
    endDate: formatDateToUTC(today, false), // End date at 23:59:59+00
  });

 
  const selectedAnalyticDate = useSelector(
    (state: RootState) => state.AnalyticsReducer.sessionDate,
  );

  // Sync dateRange to Redux so SeekerBreadCrumHeader can display the selected dates
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      dispatch(setAggregatedFilters({ startDate: dateRange.startDate, endDate: dateRange.endDate }));
    }
  }, [dateRange]);

  useEffect(() => {
    setWebinarLoading(true);

    getCall(endPoints.completedWebinarsList, undefined, INFINIPATH)
      .then((res) => {
        setWebinarData(res.data.data);
      })
      .catch((err) => {
        alert("Error fetching webinar data");
        console.error(err);
      })
      .finally(() => {
        setWebinarLoading(false);
      });
  }, []);

  useEffect(() => {
    setKpiLoading(true);
    const updatedFilters: { [key: string]: string | undefined } = {};


  // Get today's date (end date)
    const today = new Date();
    const defaultEndDate = formatDateWithoutUTC(today, false); // Default end date: 23:59:59

    // Get the date one month ago (start date)
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    const defaultStartDate = formatDateWithoutUTC(lastMonth, true); // Default start date: 00:00:00
    
    // Use dateRange values if available, otherwise use default values
    const startDate = dateRange.startDate ? dateRange.startDate : defaultStartDate;
    const endDate = dateRange.endDate ?  dateRange.endDate : defaultEndDate;
    
    // Add dynamic start and end dates to the filters
    updatedFilters.startDate = startDate;
    updatedFilters.endDate = endDate;

    // Traverse the filters object and add only the non-empty values to updatedFilters
    filters &&
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.length > 0) {
          if (key === "gender") {
            // convert value array to lowercase
            const lowerCaseValues = value.map((val) => val.toLowerCase());
            updatedFilters[key] = lowerCaseValues;
          } else {
            updatedFilters[key] = value;
          }
        }
      });
     
    const filterQuery =
      updatedFilters && Object.keys(updatedFilters).length > 0
        ? `&programSessionFilters=${encodeURIComponent(JSON.stringify(updatedFilters))}`
        : "";
    //  const id = Number(getItemInLocalStorage("sessionIdAnalytics"));
    getCall(endPoints.getAggregateAnalytics(1, 1, 1) + filterQuery, undefined, INFINIPATH)
      .then((res) => {
        const kpiData = formatKpiObjectValues(res.data.data.kpiData);
        setTotalCount(res.data.data.kpiData.totalWebinarsCount);
        const totalParticipantsCount = res.data.data.kpiData.totalParticipantsCount;
        const updatedKpiIconData = [
          {
            icon: (
              <img
                src={totalAttended}
                alt="singleUser Icon"
                width={"100%"}
                height={"100%"}
              />
            ),
            hoverIcon: (
              <img
                src={hoverTotalAttended}
                alt="hoverSingleUser Icon"
                width={"100%"}
                height={"100%"}
              />
            ),
            text: AGGREGATE_KPI_TEXT.TOTALAUIDENCE,
            displayName: KPI_TEXT.TOTALAUIDENCE,
            value: formatCount(totalParticipantsCount),
          },
          {
            icon: (
              <img
                src={attendacerate}
                alt="verifiedUser Icon"
                width={"100%"}
                height={"100%"}
              />
            ),
            hoverIcon: (
              <img
                src={hoverAttendaceRate}
                alt="hoverVerifiedUser Icon"
                width={"100%"}
                height={"100%"}
              />
            ),
            text: AGGREGATE_KPI_TEXT.REGISTRATION_ATTENDANCE,
            displayName: KPI_TEXT.REGISTRATION_ATTENDANCE,
            value: `${kpiData.registeredAttendance}%`,
          },
          {
            icon: <img src={lateComers} alt="drop Icon" width={"100%"} height={"100%"} />,
            hoverIcon: (
              <img
                src={hoverLateComers}
                alt="hoverDrop Icon"
                width={"100%"}
                height={"100%"}
              />
            ),
            text: AGGREGATE_KPI_TEXT.LATECOMERS,
            displayName: KPI_TEXT.LATECOMERS,
            value: `${kpiData.lateComers}%`,
          },
          {
            icon: <img src={dropOffs} alt="drop Icon" width={"100%"} height={"100%"} />,
            hoverIcon: (
              <img
                src={hoverDropOffs}
                alt="hoverDrop Icon"
                width={"100%"}
                height={"100%"}
              />
            ),
            text: AGGREGATE_KPI_TEXT.DROPOFFS,
            displayName: KPI_TEXT.DROPOFFS,
            value: `${kpiData.dropOffs}%`,
          },
          {
            icon: (
              <img
                src={absentees}
                alt="groupUsers Icon"
                width={"100%"}
                height={"100%"}
              />
            ),
            hoverIcon: (
              <img
                src={hoverAbsentees}
                alt="hoverGroupUsers Icon"
                width={"100%"}
                height={"100%"}
              />
            ),
            text: AGGREGATE_KPI_TEXT.ABSENTEES,
            displayName: KPI_TEXT.ABSENTEES,
            value: `${kpiData.absentee}%`,
          },
          {
            icon: (
              <img
                src={newJoiners}
                alt="nonVerified Icon"
                width={"100%"}
                height={"100%"}
              />
            ),
            hoverIcon: (
              <img
                src={hoverNewJoiners}
                alt="hoverNonVerifiedUser Icon"
                width={"100%"}
                height={"100%"}
              />
            ),
            text: AGGREGATE_KPI_TEXT.NEWJOINERS,
            displayName: KPI_TEXT.NEWJOINERS,
            value: `${kpiData.newJoiners}%`,
          },
          {
            icon: (
              <img
                src={singleUser}
                alt="singleUser Icon"
                width={40}
                height={40}
              />
            ),
            hoverIcon: (
              <img
                src={hoverSingleUser}
                alt="hoverSingleUser Icon"
                width={40}
                height={40}
              />
            ),
            text: AGGREGATE_KPI_TEXT.JOINALONE,
            displayName: KPI_TEXT.JOINALONE,
            value: `${kpiData.joinAlone}%`,
          },
          {
            icon: (
              <img
                src={joinWithOthers}
                alt="nonVerified Icon"
                width={"100%"}
                height={"100%"}
              />
            ),
            hoverIcon: (
              <img
                src={hoverJoinWithOthers}
                alt="hoverNonVerifiedUser Icon"
                width={"100%"}
                height={"100%"}
              />
            ),
            text: AGGREGATE_KPI_TEXT.JOINEDWITHOTHERS,
            displayName: KPI_TEXT.JOINEDWITHOTHERS,
            value: `${kpiData.groupVerified}%`,
          },
          {
            icon: (
              <img
                src={verifiedSeekers}
                alt="nonVerified Icon"
                width={"100%"}
                height={"100%"}
              />
            ),
            hoverIcon: (
              <img
                src={hoverVerifiedSeekers}
                alt="hoverNonVerifiedUser Icon"
                width={"100%"}
                height={"100%"}
              />
            ),
            text: AGGREGATE_KPI_TEXT.VERIFIEDSEEKRS,
            displayName: KPI_TEXT.VERIFIEDSEEKRS,
            value: `${kpiData.selfVerified}%`,
          },
          {
            icon: (
              <img
                src={notVerifiedSeekers}
                alt="nonVerified Icon"
                width={"100%"}
                height={"100%"}
              />
            ),
            hoverIcon: (
              <img
                src={hoverNotVerifiedSeekers}
                alt="hoverNonVerifiedUser Icon"
                width={"100%"}
                height={"100%"}
              />
            ),
            text: AGGREGATE_KPI_TEXT.NOTVERIFIEDSEEKERS,
            displayName: KPI_TEXT.NOTVERIFIEDSEEKERS,
            value: `${kpiData.selfNotVerified}%`,
          },
        ];
        if (kpiData !== null && kpiData !== undefined) {
          setKpiIconData(updatedKpiIconData);
          setAnalyticsData(res.data.data);
          setKpiLoading(false);
        } else {
          setKpiIconData(undefined);
          setAnalyticsData(undefined);
          setKpiLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setKpiLoading(false);
      });
  }, [dateRange]);

  // Manage global loading state (Only true when either API is still loading)
  useEffect(() => {
    if (!webinarLoading && !kpiLoading) {
      setLoading(false);
    }
  }, [webinarLoading, kpiLoading]);

  useEffect(() => {
    // if analytics data is not available  render component with no data found
    if (!selectedAnalyticDate) {
      return;
    }
  }, [selectedAnalyticDate]);
  // get seeker details from local storage
  const seekerDetails = getItemInLocalStorage("seekerDetails");
  const seekerName = {
    fullName: seekerDetails.fullName,
  };
  const handleDateChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };
  // Update the return statement in the component
  return (
    <div className={styles.dashboard}>
      {!loading && webinarData ? (
        <>
          {analyticsData && (
            <>
              <div className={styles.dashboard__main}>
                <HeaderSection
                  seekerDetails={seekerName}
                  filterList={webinarData.filters}
                  count={totalCount}
                  onDateChange={handleDateChange}
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                />
                {kpiIconData && analyticsData && (
                  <StatisticsCard
                    data={kpiIconData}
                    kpiData={analyticsData.kpiData}
                  />
                )}
              </div>

              <GraphContainer
                platformUsage={analyticsData.platformUsage}
                ageDistribution={analyticsData.ageDistribution}
                locationInsights={analyticsData.locationInsights}
                genderDistribution={analyticsData.genderDistribution}
                multiChartData={analyticsData.graphData}
                analyticsData={analyticsData}
              />
            </>
          )}
        </>
      ) : totalCount === 0 && !loading ? (
          <div className={styles.noDataFound}>
            <img src={noDataFound} alt="" />
            <div className={styles.notFoundContent}>Looks like we don’t have enough data to
              view Aggregated Analytics.</div>
          </div>
      ) : (
        <div>
          <Loader type="large" data-testid="loader" />
        </div>
      )}
    </div>
  );
};

export default NewAggregatedDashboard;

