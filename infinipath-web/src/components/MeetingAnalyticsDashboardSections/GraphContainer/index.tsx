import React from "react";
import styles from "./index.module.scss"; // SCSS for styling";
import GenderDistributionChart from "../../../common/components/ReusableGenderChart";
import {
  AgeDistribution,
  AttendedInsights,
  GenderDistribution,
  LocationInsights,
  PlatformsUsedByAudience,
  RegisteredInsights,
  TypeOfAudienceInsights,
} from "../../MeetingAnalyticsDashboard/Analtyics.modal";
import { camelCaseAgeMapping } from "../../../utils/commonFunctions";
import AttendanceInsightsChart from "../AttendanceInsightsChart";
import RegisteredInsightChart from "../registrationsInsightsChart";
import { endPoints } from "../../../constants/urlConstants";
import {
  setTotalAudience,
  setKpiType,
} from "../../../reducers/AnalyticsReducer";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import BarLines, { BarLineItem } from "../../../common/components/BarLines";
import noDataIcon from "../../../assets/images/no-behaviour-data.svg";
import { NO_AGE_DATA, NO_GENDER_DATA, NO_LOCATION_DATA, NO_PLATFORM_DATA, PLATFORMMAPPING } from "../../../constants";

interface GraphContainerProps {
  platformUsage: PlatformsUsedByAudience;
  ageDistribution: AgeDistribution;
  locationInsights: LocationInsights;
  audienceInsights?: TypeOfAudienceInsights;
  genderDistribution: GenderDistribution;
  registrationInsights: RegisteredInsights;
  attendanceInsights: AttendedInsights;
  sessionId: string | null;
}

const GraphContainer: React.FC<GraphContainerProps> = ({
  platformUsage,
  ageDistribution,
  locationInsights,
  genderDistribution,
  registrationInsights,
  attendanceInsights,
  sessionId
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const audienceInsightsTitle = 'Type of audience insights';
  const ageTitle = "Age distribution";
  const platformTitle = "Platforms used by the audience";
  const locationTitle = "City wise distributions";
  // const genderTitle = 'Gender distribution';
  const registrationTitle = "Registrations Insights";
  const attendanceTitle = "Attendance Insights";

  const filteredLocationInsights = Object.entries(locationInsights)
    .filter(([, value]) => value !== 0)
    .map(([key, value]) => ({ name: key, value }));
  // const locationData = filteredLocationInsights.map(({ value }) => value);

  const genderDistributionFiltered = Object.entries(genderDistribution)
    .filter(([, value]) => value !== 0)
    .map(([key, value]) => ({ key, value }));
  const genderLabels = genderDistributionFiltered.map(({ key }) => key);
  const genderData = genderDistributionFiltered.map(({ value }) => value);

  const platformUsageFiltered = Object.entries(platformUsage)
    .filter(([, value]) => value !== 0)
    .map(([key, value]) => ({ name: PLATFORMMAPPING[key].displayName, value , filterValue:PLATFORMMAPPING[key].value  }));
  // Filter out age distribution entries with value 0 and map the keys to camelCaseAgeMapping

  const filteredAgeDistribution = Object.entries(ageDistribution)
    .filter(([, value]) => value !== 0)
    .map(([key, value]) => ({ name: camelCaseAgeMapping[key], value }));
  /**
   * Handles the click event on a platform or age label within the analytics dashboard.
   * Depending on the title, it determines the type of KPI (Key Performance Indicator),
   * updates the total audience and KPI type in the state, and navigates to the analytics seeker details page.
   *
   * @param label - The label of the clicked item (e.g., platform or age group).
   * @param value - The value associated with the clicked label (e.g., audience count).
   * @param title - The title indicating the category of the label (e.g., "Platform" or "Age").
   */
  const handlePlatFormLabelClick = (
    label: string,
    value: string,
    title: string,
  ) => {
    if (title.toLowerCase().includes("platform")) {
      const type = "Platform - " + label;
      dispatch(setTotalAudience(Number(value)));
      dispatch(setKpiType(type));
      navigate(endPoints.analyticsSeekerDetails +`?sessionId=${sessionId}`);
    } else if (title.toLowerCase().includes("age")) {
      const type = "Age -" + label;
      dispatch(setTotalAudience(Number(value)));
      dispatch(setKpiType(type));
      navigate(endPoints.analyticsSeekerDetails +`?sessionId=${sessionId}`);
    }
  };

  const handleGenderAction = (it: number) => {
    dispatch(setTotalAudience(it));
  };

  /**
   * Handles the click event for a specific location in the analytics dashboard.
   * Updates the total audience and KPI type in the state, and navigates to the seeker details page.
   *
   * @param location - The name of the location that was clicked.
   * @param value - The numerical value associated with the selected location.
   */
  const handleLocationClick = (location: string, value: number) => {
    const type = "Location- " + location;
    dispatch(setTotalAudience(value));
    dispatch(setKpiType(type));
    navigate(endPoints.analyticsSeekerDetails +`?sessionId=${sessionId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <AttendanceInsightsChart
          chartTitle={attendanceTitle}
          attendanceData={attendanceInsights}
          sessionId = {sessionId}
        />
      </div>
      <div className={styles.subContainer}>
        <RegisteredInsightChart
          chartTitle={registrationTitle}
          registeredData={registrationInsights}
          sessionId = {sessionId}
        />
      </div>
      <div className={styles.subContainer2}>
        <div className={styles.box4}>
          <BarLines
            title={ageTitle}
            data={filteredAgeDistribution}
            handleClick={(item: BarLineItem) =>
              handlePlatFormLabelClick(item.name, item.value.toString(), ageTitle)
            }
            noDataIcon = {noDataIcon}
            noDataMessage= {NO_AGE_DATA}
          />
        </div>
        <div className={styles.box5}>
          <GenderDistributionChart
            endPoint={endPoints.analyticsSeekerDetails +`?sessionId=${sessionId}`}
            labels={genderLabels}
            data={genderData}
            callBack={(it) => {
              handleGenderAction(it);
            }}
            noDataMessage = {NO_GENDER_DATA}
            noDataIcon={noDataIcon}
          />
        </div>
      </div>
      <div className={styles.subContainer3}>
        <div className={styles.box6}>
          <BarLines
            title={locationTitle}
            data={filteredLocationInsights}
            centerText="Locations"
            handleClick={(item: BarLineItem) =>
              handleLocationClick(item.name, item.value)
            }
            noDataIcon = {noDataIcon}
            noDataMessage= {NO_LOCATION_DATA}
          />
        </div>
        <div className={styles.box7}>
          <BarLines
            title={platformTitle}
            data={platformUsageFiltered}
            handleClick={(item: BarLineItem) =>
              handlePlatFormLabelClick(item?.filterValue ?? item.name, item.value.toString(), platformTitle)
            }
            noDataIcon = {noDataIcon}
            noDataMessage= {NO_PLATFORM_DATA}
          />
        </div>
      </div>
    </div>
  );
};

export default GraphContainer;
