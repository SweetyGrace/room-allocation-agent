import React from "react";
import styles from "./index.module.scss";
import {
  getDateFromString,
  getDayOfWeek,
  getMonthAbbreviation,
  getYearBasedOnDate,
} from "../../utils/commonFunctions";
import locationIcon from "../../assets/images/location-icon.svg";
import CalendarTodayIcon from "../../assets/images/calendar.svg";
import clockIcon from "../../assets/images/clock.svg";
import Line from "../../assets/images/line.svg";
import { calculateDaysLeft } from "../../utils/commonFunctions";
import Duration from "../../assets/images/time-duration-symbol.svg";
import {
  DEFAULT_VALUES,
  CURRENCY_SYMBOLS
} from "../../constants/textConstants";

interface RectangularCardProps {
  title?: string;
  venue?: string;
  startDate?: string;
  endDate?: string;
  payment?: {
    amount: string;
    currency: string;
  };
  hdbFee?: string;
  msdFee?: string;
  registrationStartDate?: string;
  /** Pass false to hide the payment section (e.g. when payment is not required) */
  isPaymentRequired?: boolean;
  /** Pass false to hide the venue row (e.g. online-only programs) */
  hasVenue?: boolean;
}

const setDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
};

const formatINR = (amount: string | number) => {
  const num = Number(amount);
  if (isNaN(num)) return amount;
  return num.toLocaleString("en-IN", { style: "decimal", maximumFractionDigits: 2 });
};

const RectangularCard: React.FC<RectangularCardProps> = ({
  title = DEFAULT_VALUES.TEXT.PROGRAM_TITLE,
  venue = DEFAULT_VALUES.TEXT.VENUE,
  startDate,
  endDate,
  payment,
  hdbFee,
  msdFee,
  isPaymentRequired = true,
  hasVenue = true,
}) => {
  // Parse HDB/MSD fees to numbers so "0" / empty strings are treated as absent
  const parsedHdb = parseFloat(hdbFee || '0');
  const parsedMsd = parseFloat(msdFee || '0');
  const hasHdbFee = parsedHdb > 0;
  const hasMsdFee = parsedMsd > 0;

  return (
    <div className={styles.rectangularCardContainer}>
      <div className={styles.cardContent}>
        {/* Title */}
        <h2 className={styles.title}>{title}</h2>

        {/* Venue — only shown when the program has a venue (offline / hybrid) */}
        {hasVenue && (
          <div className={styles.infoRow}>
            <img src={locationIcon} alt="Location Icon" className={styles.icon} />
            <span className={styles.text}>{venue || "-"}</span>
          </div>
        )}

        {/* Date Range */}
        <div className={styles.infoRow}>
          <img
            src={CalendarTodayIcon}
            alt="Calendar Icon"
            className={styles.icon}
          />
          <div className={styles.dateRange}>
            {startDate && endDate ? (
              <span>
                {getDateFromString(startDate)}-
                {getMonthAbbreviation(startDate)}-
                {getYearBasedOnDate(startDate)}{" "}
                <span className={styles.dateSeparator}> {DEFAULT_VALUES.TEXT.TO} </span>
                {getDateFromString(endDate)}-
                {getMonthAbbreviation(endDate)}-
                {getYearBasedOnDate(endDate)}
              </span>
            ) : (
              <span>-</span>
            )}
          </div>
        </div>

        <div className={styles.infoRow}>
          <img src={Duration} alt="Duration Icon" className={styles.icon} />
          <span className={styles.text}>
            {startDate && endDate ? (
              <span>
                {setDuration(startDate, endDate)} {DEFAULT_VALUES.TEXT.DAYS}
              </span>
            ) : (
              <span>-</span>
            )}
          </span>
        </div>

        <img src={Line} alt="line" className={styles.line} />

        {/* Payment — only shown when payment is required.
            Regular fee shown when no HDB/MSD specific fees are set (> 0). */}
        {isPaymentRequired && payment && !hasHdbFee && !hasMsdFee && (
          <div className={styles.infoRowGap}>
            <span className={styles.paymentText}>{DEFAULT_VALUES.TEXT.TOTAL_PAYABLE}</span>
            <span className={styles.payment}>
              {payment.currency} {formatINR(payment.amount)}
            </span>
          </div>
        )}
        {isPaymentRequired && hasHdbFee && (
          <div className={styles.infoRowGap}>
            <span className={styles.paymentText}>{DEFAULT_VALUES.TEXT.HDB_FEE_LABEL}</span>
            <span className={styles.payment}>
              {CURRENCY_SYMBOLS.INR} {formatINR(hdbFee!)}
            </span>
          </div>
        )}
        {isPaymentRequired && hasMsdFee && (
          <div className={styles.infoRowGap}>
            <span className={styles.paymentText}>{DEFAULT_VALUES.TEXT.MSD_FEE_LABEL}</span>
            <span className={styles.payment}>
              {CURRENCY_SYMBOLS.INR} {formatINR(msdFee!)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RectangularCard;
