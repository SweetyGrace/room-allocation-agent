// Import necessary dependencies
import React from "react";
import styles from "./index.module.scss";
// Import Redux actions and routing utilities
import { setTotalAudience, setKpiType } from "../../../reducers/AnalyticsReducer";
import { useDispatch } from "react-redux";
import { useNavigate  } from "react-router-dom";
import { endPoints } from "../../../constants/urlConstants";
import { formatSingleDigit } from "../../../utils/commonFunctions";
import { KPIData } from "../../MeetingAnalyticsDashboard/Analtyics.modal";

/**
 * Interface for individual KPI data items
 * @property {JSX.Element} icon - Icon to display in normal state
 * @property {JSX.Element} hoverIcon - Icon to display on hover
 * @property {string} text - Label text for the KPI
 * @property {number} value - Numeric value of the KPI
 */
export interface KPIDataItem {
  icon: JSX.Element;
  hoverIcon: JSX.Element;
  text: string;
  value: number;
  displayName: string;
}

/**
 * Interface for StatisticsCard props
 * @property {KPIDataItem[]} data - Array of KPI items to display
 * @property {KPIData} kpiData - Overall KPI statistics
 */
interface StatisticsCardProps {
  data: KPIDataItem[];
  kpiData: KPIData;
  sessionId: string | null;
}

/**
 * StatisticsCard Component
 * Displays a semi-circular chart with KPI metrics and interactive data boxes
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
const StatisticsCard: React.FC<StatisticsCardProps> = ({ data, kpiData, sessionId }) => {
  // Initialize hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Store all KPI items for rendering
  const firstHalf = data;

  /**
   * Handles click events on KPI data boxes
   * Dispatches selected KPI data and navigates to details view
   * 
   * @param Label - Text label of clicked KPI
   * @param value - Numeric value of clicked KPI
   */
  const handleListofDataClick = (Label: string, value: number) => {
    if(value != 0 ){
      dispatch(setTotalAudience(value));
      dispatch(setKpiType(Label));
      navigate(endPoints.analyticsSeekerDetails + `?sessionId=${sessionId}`);
    }
  };

  // Calculate attendance percentage
  // const attendancePercentage = kpiData.Registered === 0 
  //   ? 0 
  //   : Math.floor((kpiData.Attended / kpiData.Registered) * 100);

  return (
    <div className={styles.statisticsCard}>

      {/* KPI data boxes section */}
      <div className={styles.statisticsCard__data}>
        {firstHalf.map((data, index) => (
          <React.Fragment key={index}>
          <div className={styles.statisticsCard__boxContainer}>
            <div
              className={`${styles.statisticsCard__box} ${data.value === 0 ? styles.notAllow : styles.allow}`}
              onClick={() => handleListofDataClick(data.text, data.value)}
            >
              <div className={styles.statisticsCard__iconContainer}>
                <div className={styles.statisticsCard__icon}>{data.icon}</div>
                <div className={styles.statisticsCard__hoverIcon}>{data.hoverIcon}</div>
              </div>
              <div className={styles.statisticsCard__text}>
                <div className={styles.statisticsCard__subtextcount}>{formatSingleDigit(Number(data.value))}</div>
                <div className={styles.statisticsCard__subtext}>{data.displayName}</div>
              </div>
            </div>
          </div>
        </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StatisticsCard;