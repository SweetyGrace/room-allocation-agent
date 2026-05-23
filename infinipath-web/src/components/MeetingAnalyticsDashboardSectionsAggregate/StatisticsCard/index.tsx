import React from "react";
import styles from "./index.module.scss";
import { setTotalAudience, setKpiType } from "../../../reducers/AnalyticsReducer";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { endPoints } from "../../../constants/urlConstants";
import { KPIData } from "../../MeetingAggregateDashboard/Analtyics.modal";
export interface KPIDataItem {
  icon: JSX.Element;
  hoverIcon: JSX.Element;
  text: string;
  value: number;
  displayName: string;
  key: string;
  count: number;
}

interface StatisticsCardProps {
  data: KPIDataItem[];
  kpiData: KPIData;
  iconMap?: { [key: string]: JSX.Element };
  cardsStyles?: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ data, cardsStyles }) => {
  const firstHalf = data;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleListofDataClick = (Label: string, value: number) => {
    if (value !== "0%" && value != 0) {
      dispatch(setTotalAudience(value));
      dispatch(setKpiType(Label));
      navigate(endPoints.aggregateSeekerDetails);
    }
  };
    return (
    <div className={styles.statisticsCard + (cardsStyles ? " " + styles.dashboardCards : "")}>
    
      <div className={
        styles.statisticsCard__data + (cardsStyles ? " " + cardsStyles : "")
      }>

        {firstHalf.map((data, index) => (
          <React.Fragment key={index}>
            <div className={styles.statisticsCard__boxContainer}>
              <div
                className={`${styles.statisticsCard__box} ${data.value === "0%" || data.value == 0 ? styles.notAllow : styles.allow}`}
                onClick={() => handleListofDataClick(data.text, data.value)}
              >
                <div className={styles.statisticsCard__iconContainer}>
                  <div className={styles.statisticsCard__icon}>{data.icon}</div>
                  <div className={styles.statisticsCard__hoverIcon}>{data.hoverIcon}</div>
                </div>
                <div className={styles.statisticsCard__text}>
                  <div className={styles.statisticsCard__subtextcount}>{data.value}</div>
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