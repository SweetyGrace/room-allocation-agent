import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import HeaderSection from "../MeetingAnalyticsDashboardSections/HeaderSection";
import StatisticsCard, {
  KPIDataItem,
} from "../MeetingAnalyticsDashboardSections/StatisticsCard";
import GraphContainer from "../MeetingAnalyticsDashboardSections/GraphContainer";
import drop from "../../assets/images/drop-offs.svg";
import absentees from "../../assets/images/absentees.svg";
import hoverAbsentees from "../../assets/images/hover-absentees.svg";
import singleUser from "../../assets/images/join-alone.svg";
import groupUsers from "../../assets/images/join-with-others.svg";
import verifiedUser from "../../assets/images/verified.svg";
import nonVerifiedUser from "../../assets/images/not-verified.svg";
import hoverDrop from "../../assets/images/hover-drop-offs.svg";
import hoverSingleUser from "../../assets/images/hover-join-alone.svg";
import hoverGroupUsers from "../../assets/images/hover-join-with-other.svg";
import hoverVerifiedUser from "../../assets/images/hover-verified.svg";
import hoverNonVerifiedUser from "../../assets/images/hover-not-verified.svg";
import { getItemInLocalStorage } from "../../services/localStorage";
import { formattedDateWithDay } from "../../utils/commonFunctions";
import Loader from "../../common/components/Loader";
import { AdminKPIDetails, WebinarData } from "./Analtyics.modal";
import { useSelector } from "react-redux";
import { getCall } from "../../services/apiService";
import { RootState } from "../../store";
import { endPoints, INFINIPATH } from "../../constants/urlConstants";
import { useSearchParams } from "react-router-dom";
import noDataFound from "../../assets/images/aggregated-empty.svg";
import hoverTotalAttended from "../../assets/images/hover-total-seekers.svg";
import totalAttended from "../../assets/images/total-seekers.svg";
import attendacerate from "../../assets/images/attendance-rate.svg";
import hoverAttendaceRate from "../../assets/images/hover-attendance-rate.svg";
import lateComers from "../../assets/images/late-comers.svg";
import hoverLateComers from "../../assets/images/hover-late-comers.svg";
import newJoiners from "../../assets/images/new-joinees.svg";
import hoverNewJoiners from "../../assets/images/hover-new-joinees.svg";
import { KPI_FILTERS, KPI_TEXT } from "../../constants";

const NewAnalyticsDashboard: React.FC = () => {
  const [kpiIconData, setKpiIconData] = useState<KPIDataItem[]>();
  const [loading, setLoading] = useState(false);
  const [webinarData, setWebinarData] = useState<WebinarData>();
  const [analyticsData, setAnalyticsData] = useState<AdminKPIDetails>();
  const [webinarLoading, setWebinarLoading] = useState(true);
  const [kpiLoading, setKpiLoading] = useState(false);
  const filters = useSelector((state: RootState) => state.AnalyticsReducer.filters);
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const selectedAnalyticDate = useSelector(
    (state: RootState) => state.AnalyticsReducer.sessionDate,
  );
  
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
    
    // Traverse the filters object and add only the non-empty values to updatedFilters
    filters && Object.entries(filters).forEach(([key, value]) => {
      if (value && value.length > 0) {
        if (key === "gender") {
          // convert value array to lowercase
          const lowerCaseValues = value.map((val) => val.toLowerCase());
          updatedFilters[key] = lowerCaseValues;
        }
        else {
        updatedFilters[key] = value;
        }
      }
    });
    
    const filterQuery =
    updatedFilters && Object.keys(updatedFilters).length > 0
      ? `?filters=${encodeURIComponent(JSON.stringify(updatedFilters))}`
      : "";
    getCall(`fetch-analytics-kpi/${sessionId}${filterQuery}`, undefined, INFINIPATH)
      .then((res) => {
  
        const kpiData = res.data.data.kpidata;

        const updatedKpiIconData = [
          {
            icon: (
              <img
                src={totalAttended}
                alt="pairedUser Icon"
                width={40}
                height={40}
              />
            ),
            hoverIcon: (
              <img
                src={hoverTotalAttended}
                alt="hoverPairedUser Icon"
                width={40}
                height={40}
              />
            ),
            text: "TotalAudience",
            value: kpiData.TotalAudience,
            displayName: KPI_TEXT.TOTALAUIDENCE,
          },
          {
            icon: (
              <img
                src={attendacerate}
                alt="pairedUser Icon"
                width={40}
                height={40}
              />
            ),
            hoverIcon: (
              <img
                src={hoverAttendaceRate}
                alt="hoverPairedUser Icon"
                width={40}
                height={40}
              />
            ),
            text: KPI_FILTERS.TYPES.REG_ATTENDANCE,
            value: kpiData.RegAttendanceCount,
            displayName: KPI_TEXT.REGISTRATION_ATTENDANCE,
          },
          {
            icon: (
              <img
                src={lateComers}
                alt="pairedUser Icon"
                width={40}
                height={40}
              />
            ),
            hoverIcon: (
              <img
                src={hoverLateComers}
                alt="hoverPairedUser Icon"
                width={40}
                height={40}
              />
            ),
            text: "lateComer",
            value: kpiData.LateComers,
            displayName: KPI_TEXT.LATECOMERS,
          },
          {
            icon: <img src={drop} alt="drop Icon" width={40} height={40} />,
            hoverIcon: (
              <img
                src={hoverDrop}
                alt="hoverDrop Icon"
                width={40}
                height={40}
              />
            ),
            text: KPI_FILTERS.ATTENDANCE_DETAILS.DROPOFFS,
            value: kpiData.DropOffs,
            displayName: KPI_TEXT.DROPOFFS,

          },
          {
            icon: (
              <img
                src={absentees}
                alt="pairedUser Icon"
                width={40}
                height={40}
              />
            ),
            hoverIcon: (
              <img
                src={hoverAbsentees}
                alt="hoverPairedUser Icon"
                width={40}
                height={40}
              />
            ),
            text: "Absentees",
            value: kpiData.Absentees,
            displayName: KPI_TEXT.ABSENTEES,
          },
          {
            icon: (
              <img
                src={newJoiners}
                alt="singleUser Icon"
                width={40}
                height={40}
              />
            ),
            hoverIcon: (
              <img
                src={hoverNewJoiners}
                alt="hoverSingleUser Icon"
                width={40}
                height={40}
              />
            ),
            text: "New joining",
            value: kpiData.NewSeekers,
            displayName: KPI_TEXT.NEWJOINERS,
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
            text: "Joined alone",
            value: kpiData.JoinedAlone,
            displayName: KPI_TEXT.JOINALONE,
            
          },
          {
            icon: (
              <img
                src={groupUsers}
                alt="groupUsers Icon"
                width={40}
                height={40}
              />
            ),
            hoverIcon: (
              <img
                src={hoverGroupUsers}
                alt="hoverGroupUsers Icon"
                width={40}
                height={40}
              />
            ),
            text: "Joined with others",
            value: kpiData.JoinedWithOthers,
            displayName: KPI_TEXT.JOINEDWITHOTHERS,
          },
          {
            icon: (
              <img
                src={verifiedUser}
                alt="verifiedUser Icon"
                width={40}
                height={40}
              />
            ),
            hoverIcon: (
              <img
                src={hoverVerifiedUser}
                alt="hoverVerifiedUser Icon"
                width={40}
                height={40}
              />
            ),
            text: "Verified seekers",
            value: kpiData.VerifiedSeekers,
            displayName: KPI_TEXT.VERIFIEDSEEKRS,
          },
          {
            icon: (
              <img
                src={nonVerifiedUser}
                alt="nonVerified Icon"
                width={40}
                height={40}
              />
            ),
            hoverIcon: (
              <img
                src={hoverNonVerifiedUser}
                alt="hoverNonVerifiedUser Icon"
                width={40}
                height={40}
              />
            ),
            text: "Not verified seekers",
            value: kpiData.NotVerifiedSeekers,
            displayName: KPI_TEXT.NOTVERIFIEDSEEKERS,
          },
        ];

        setKpiIconData(updatedKpiIconData);
        setAnalyticsData(res.data.data);
        setKpiLoading(false);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setKpiLoading(false);
      });
  }, [filters]);

  // Manage global loading state (Only true when either API is still loading)
  useEffect(() => {
    setLoading(webinarLoading || kpiLoading);
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

  return (
    <div className={styles.dashboard}>
      {!loading && webinarData && analyticsData ?
       (
        <>
          <div className={styles.dashboard__main}>
            <HeaderSection
              formattedDate={selectedAnalyticDate ? formattedDateWithDay(new Date(selectedAnalyticDate)) : ""}
              seekerDetails={seekerName}
              filterList={webinarData.filters}
            />
            {kpiIconData && analyticsData && <StatisticsCard
              data={kpiIconData}
              kpiData={analyticsData.kpidata}
              sessionId={sessionId}
            />}
          </div>
          {analyticsData && <GraphContainer
            platformUsage={analyticsData.platformsUsedByAudience}
            ageDistribution={analyticsData.ageDistribution}
            locationInsights={analyticsData.locationInsights}
            genderDistribution={analyticsData.genderDistribution}
            registrationInsights={analyticsData.registeredInsights}
            attendanceInsights={analyticsData.attendanceInsights}
            sessionId={sessionId}
          />}
        </>
      ) : !analyticsData && !loading ? (
        <>
          <div className={styles.noDataFound}>
            <img src={noDataFound} alt="" />
            <div className={styles.notFoundContent}>Looks like we don’t have enough data to
              view Aggregated Analytics.</div>
          </div>
        </>
      ) : (
        <div>
          <Loader type="large" data-testid="loader" />
        </div>
      )}
    </div>
  );
};

export default NewAnalyticsDashboard;
