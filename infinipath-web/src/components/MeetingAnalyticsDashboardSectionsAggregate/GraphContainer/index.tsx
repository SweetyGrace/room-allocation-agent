import React from "react";
import styles from "./index.module.scss"; // SCSS for styling
import { formateDecimalValue } from "../../../utils/commonFunctions";
import MultiChart from "../MultiChart";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setKpiType,
  setTotalAudience,
} from "../../../reducers/AnalyticsReducer";
import { endPoints } from "../../../constants/urlConstants";
import {
  PlatformsUsedByAudience,
  AgeDistribution,
  LocationInsights,
  TypeOfAudienceInsights,
  GenderDistribution,
  MultiGraphData,
} from "../../MeetingAggregateDashboard/Analtyics.modal";
import AttendanceChart from "../../AttendanceChart";
import MultiLine from "../MultiLineChart";
import BarLines, { BarLineItem } from "../../../common/components/BarLines";
import { NO_LOCATION_DATA, NO_PLATFORM_DATA } from "../../../constants";
import noDataIcon from "../../../assets/images/no-behaviour-data.svg";
// import AttendanceInsightsChart from "../../MeetingAnalyticsDashboardSections/AttendanceInsightsChart";

interface GraphContainerProps {
  platformUsage?: PlatformsUsedByAudience;
  ageDistribution?: AgeDistribution;
  locationInsights?: LocationInsights;
  audienceInsights?: TypeOfAudienceInsights;
  genderDistribution: GenderDistribution;
  multiChartData: MultiGraphData[];
  analyticsData?: unknown;
}

/**
 * GraphContainer component is responsible for rendering various analytics charts
 * such as age distribution, gender distribution, location insights, and platform usage.
 * It also handles user interactions with the charts and navigates to detailed views
 * based on the selected data points.
 *
 * @param {GraphContainerProps} props - The props for the GraphContainer component.
 * @param {Record<string, number>} props.platformUsage - Data representing platform usage by the audience.
 * @param {Record<string, number>} props.ageDistribution - Data representing age distribution of the audience.
 * @param {Record<string, number>} props.locationInsights - Data representing location insights of the audience.
 * @param {Record<string, number>} props.genderDistribution - Data representing gender distribution of the audience.
 * @param {any} props.multiChartData - Data for rendering the multi-chart component.
 * @param {any[]} props.webinarStatsData - Data for the webinar attendance chart.
 *
 * @returns {JSX.Element} The rendered GraphContainer component.
 */
const GraphContainer: React.FC<GraphContainerProps> = ({
  analyticsData,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const platformTitle = "Platforms used by the audience";
  const locationTitle = "City wise distributions";

  const platformInsights = (() => {
    // Convert deviceType data to an array of entries and sort in descending order by value
    const sortedLocationInsights = Object.entries(
      analyticsData?.kpiData?.deviceType || {},
    )
      .filter(([, value]) => value > 0) // Filter out zero values
      .sort(([, valueA], [, valueB]) => valueB - valueA);

    // Extract the top 4 entries with formatted values
    const top4 = sortedLocationInsights.slice(0, 4).map(([name, value]) => ({
      name,
      value: formateDecimalValue(value),
    }));

    return top4;
  })();

  const filteredLocationInsights = (() => {
    // Convert locationInsights to an array of entries and sort in descending order by value

    const sortedLocationInsights = Object.entries(
      analyticsData?.kpiData?.locations,
    ).sort(([, valueA], [, valueB]) => valueB - valueA);

    // Extract the top 4 entries
    const top4 = sortedLocationInsights.slice(0, 4).map(([name, value]) => ({
      name,
      value: formateDecimalValue(value),
    }));

    // Calculate the sum of the remaining values
    const otherValue = sortedLocationInsights
      .slice(4)
      .reduce((sum, [, value]) => sum + value, 0);

    // Add the "Other" category if there are remaining values
    if (otherValue > 0) {
      top4.push({
        name: "Other",
        value: formateDecimalValue(otherValue),
      });
    }

    return top4;
  })();

  const webinarDataStatus = analyticsData?.seekersEngagement;
  const transformedWebinarData = webinarDataStatus.map((webinar) => {
    // Parse the UTC date and adjust for local timezone
    const utcDate = new Date(webinar.startAt);
    // Convert to UTC date string and create new Date to remove timezone offset
    const startAt = new Date(utcDate.toUTCString());

    // Format the date using UTC methods to avoid timezone shift
    const month = startAt.getUTCMonth();
    const date = startAt.getUTCDate();
    const year = startAt.getUTCFullYear();

    // Get month abbreviation
    const monthAbbr = new Date(Date.UTC(2000, month, 1))
      .toLocaleString("en-US", { month: "short" })
      .toLowerCase();

    const startAtkey = new Date(webinar.startAt);
    const key = `${startAtkey.toLocaleString("en-US", { month: "short" }).toLowerCase()}1,${startAt.getFullYear()}`;

    const keyStart = `${monthAbbr}${date},${year}`;

  
    return {
      [key]: {
        webinarId: webinar.webinarId, // Add webinar ID
        webinarStart: keyStart,
        lateCommers: Math.round(webinar.lateComers),
        totalParticipantsCount: Math.round(webinar.attendance),
        dropOffs: Math.round(webinar.dropOffs),
        newJoins: Math.round(webinar.newJoiners),
        registration: Math.round(webinar.registrations),
        ageGroupPercentages: {
          AgeLessThan18: Math.round(webinar.ageGroup.AgeLessThan18),
          AgeBetween19And29: Math.round(webinar.ageGroup.AgeBetween19And29),
          AgeBetween30And59: Math.round(webinar.ageGroup.AgeBetween30And59),
          AgeGreaterThan60: Math.round(webinar.ageGroup.AgeGreaterThan60),
        },
        genderPercentages: {
          Male: webinar.gender.male,
          Female: webinar.gender.female,
        },
      },
    };
  });


  /**
   * Handles the click event for platform or age labels in the analytics dashboard.
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
      navigate(endPoints.aggregateSeekerDetails + `?kpiType=${type}`);

      // navigate(endPoints.aggregateSeekerDetails + `?kpiType=${type}`);
    } else if (title.toLowerCase().includes("age")) {
      const type = "Age -" + label;
      dispatch(setTotalAudience(Number(value)));
      dispatch(setKpiType(type));
      navigate(endPoints.aggregateSeekerDetails + `?kpiType=${type}`);
    } else if (title.toLowerCase().includes("city") || title.toLowerCase().includes("location")) {
      const type = "Location- " + label;
      dispatch(setTotalAudience(Number(value)));
      dispatch(setKpiType(type));
      navigate(endPoints.aggregateSeekerDetails) + `?kpiType=${type}`;
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
      
      <MultiLine webinarStats={transformedWebinarData} />
      </div>
      <div className={styles.subContainer}>
        <MultiChart
          registeredData={analyticsData?.sessionEngagement?.cumulativePercentages}
          chartTitle="Session Engagement"
          highestDropOff={analyticsData?.sessionEngagement?.highestDropOff}
        />
      </div>

      <AttendanceChart webinarStats={transformedWebinarData} />
      <div className={styles.subContainer3}>
        <div className={styles.box6}>
          <BarLines
            title={locationTitle}
            data={filteredLocationInsights}
            handleClick={(item: BarLineItem) =>
              handlePlatFormLabelClick(item.name, item.value.toString(), locationTitle)
            }
            isShowPercentage={true}
            noDataIcon={noDataIcon}
            noDataMessage= {NO_LOCATION_DATA}
          />
        </div>
        <div className={styles.box7}>
          <BarLines
            title={platformTitle}
            data={platformInsights}
            handleClick={(item: BarLineItem) =>
              handlePlatFormLabelClick(item.name, item.value.toString(), platformTitle)
            }
            isShowPercentage={true}
            noDataIcon={noDataIcon}
            noDataMessage= {NO_PLATFORM_DATA}
          />
        </div>
      </div>
    </div>
  );
};

export default GraphContainer;
