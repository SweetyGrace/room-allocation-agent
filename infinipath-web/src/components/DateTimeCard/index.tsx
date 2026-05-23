import React from "react";
import styles from "./index.module.scss";
import {
  formatTime,
  getDateFromString,
  getDayOfWeek,
  getFutureTime,
  getMonthAbbreviation,
} from "../../utils/commonFunctions";

const DateTimeCard = ({
  startDate,
  duration,
}: {
  startDate: string;
  duration: number;
}) => {
  return (
    <div
      className={styles.container}
      data-testid="infinipath-details-container"
    >
      <div data-testid="infinipath-date-details">
        <p className={styles.month} data-testid="month">
          {getMonthAbbreviation(startDate)}
        </p>
        <p className={styles.date} data-testid="date">
          {getDateFromString(startDate)}
        </p>
      </div>
      <span className={styles.verticalLine} data-testid="vertical-line"></span>
      <div data-testid="infinipath-time-details">
        for infinipath on {getDayOfWeek(startDate)} <br />
        {formatTime(startDate)} to {getFutureTime(startDate, duration)}
      </div>
    </div>
  );
};

export default DateTimeCard;
