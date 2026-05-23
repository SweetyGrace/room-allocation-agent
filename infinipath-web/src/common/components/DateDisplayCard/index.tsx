import React from "react";
import styles from "./index.module.scss";
import {
  formatTime,
  getDateFromString,
  getDayOfWeek,
  getFutureTime,
  getMonthAbbreviation,
  getYearBasedOnDate,
} from "../../../utils/commonFunctions";

interface DateDisplayProps {
  startDate: string;
  duration: string;
}

const DateDisplayCard: React.FC<DateDisplayProps> = ({
  startDate,
  duration,
}) => {
  return (
    <div className={styles.container} data-testid="date-display-card">
      <div className={styles.textContainer} data-testid="date-display-card-text-container">
        <div data-testid="date-display-card-for-label">for</div>
        <div className={styles.dateText} data-testid="date-display-card-date-text">
          <span className={styles.boldText} data-testid="date-display-card-bold-text">
            {getDayOfWeek(startDate)}, {getDateFromString(startDate)}-
            {getMonthAbbreviation(startDate)}-{getYearBasedOnDate(startDate)}{" "}
          </span>
          <span className={styles.fromText} data-testid="date-display-card-from-text">from {" "}
            {formatTime(startDate)} to {getFutureTime(startDate, duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DateDisplayCard;
