import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.scss";
import ArrowIcon from "../../assets/images/arrow-left.svg";
import {
  formatTime,
  getDateFromString,
  getDayOfWeek,
  getFutureTime,
  getMonthAbbreviation,
  getYearBasedOnDate,
} from "../../utils/commonFunctions";

export interface AnalyticsBreadcrumbProps {
  webinarTitle?: string;
  webinarStartsAt?: string;
  duration?: string;
}

const AnalyticsBreadcrumb: React.FC<AnalyticsBreadcrumbProps> = ({
  webinarTitle,
  webinarStartsAt,
  duration,
}) => {
  const navigate = useNavigate();

  return (
    <div className={styles.breadcrumbs} data-testid="breadcrumbs">
      <div
        className={styles.backArrow}
        onClick={() => {
          navigate(-1);
        }}
        data-testid="back-icon-container"
      >
        <img src={ArrowIcon} alt="back" data-testid="back-icon" />
      </div>
      <div
        className={styles.activeTrack}
        data-testid="breadcrumb-nonactive-myspace"
        onClick={() => {
          navigate(-1);
        }}
      >
        track & manage sessions
      </div>
      <div className={styles.nonActive} data-testid="breadcrumb-separator">
        /
      </div>
      <div className={styles.active} data-testid={`active-${webinarTitle}`}>
        {webinarTitle?.length
          ? webinarTitle?.toLowerCase()
          : "weekly growth session"}{" "}
        {webinarStartsAt && duration && (
          <span>
            {/* (On Thursday, 09-Nov-2024 from 10:00 a.m. to 11:15 a.m. IST) */}
            (On {getDayOfWeek(webinarStartsAt)},{" "}
            {getDateFromString(webinarStartsAt)}-
            {getMonthAbbreviation(webinarStartsAt)}-
            {getYearBasedOnDate(webinarStartsAt)} from{" "}
            {formatTime(webinarStartsAt)} to{" "}
            {getFutureTime(webinarStartsAt, duration)} IST)
          </span>
        )}
      </div>
    </div>
  );
};

export default AnalyticsBreadcrumb;
