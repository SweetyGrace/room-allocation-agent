import React from "react";
import styles from "./index.module.scss"; // Adjust the path as needed
import {
  getDateFromString,
  getDayOfWeek,
  getMonthAbbreviation,
  getYearBasedOnDate,
} from "../../../utils/commonFunctions"; // Adjust the path as needed

type RegistrationsOpenLayerProps = {
  registrationStartsAt: string | undefined;
  formattedTime: string;
  registrationStartDataTestId?: string;
  formattedTimeDataTestId?: string;
  diffStyles?: boolean;
  cardTitle?: string;
};

const RegistrationsOpenLayer: React.FC<RegistrationsOpenLayerProps> = ({
  registrationStartsAt,
  formattedTime,
  registrationStartDataTestId,
  formattedTimeDataTestId,
  diffStyles,
  cardTitle,
}) => {
  return (
    <div
      className={!diffStyles ? styles.regOpen : styles.diffRegStyles}
      data-testid={formattedTimeDataTestId}
    >
      {cardTitle ? cardTitle : "Registartions open on"} <br></br>
      {registrationStartsAt && <span
        className={styles.regOpenText}
        data-testid={registrationStartDataTestId}
      >
        {" "}
        {getDayOfWeek(registrationStartsAt)},{" "}
        {getDateFromString(registrationStartsAt)}-
        {getMonthAbbreviation(registrationStartsAt)}-
        {getYearBasedOnDate(registrationStartsAt)}, at {formattedTime} IST
      </span>}
      {!registrationStartsAt && <span
        className={styles.regOpenText} >
          --
        </span>
      }
    </div>
  );
};

export default RegistrationsOpenLayer;
