import React from "react";
import infinipath from "../../assets/images/infinipath-name.svg";
import styles from "./index.module.scss";
import { Button } from "../../common/components/Button";
import defaultProfileIcon from "../../assets/images/default-profile.svg";
import successIconTick from "../../assets/images/success-icon.svg";
import { getItemInLocalStorage } from "../../services/localStorage";
import { Avatar } from "@mui/material";
import Loader from "../../common/components/Loader";
import {
  getDateFromString,
  getDayOfWeek,
  getMonthAbbreviation,
  getYearBasedOnDate,
} from "../../utils/commonFunctions";
interface RegistrationStatusCardProps {
  registeredAccessType: string; // Adjust the type as needed
  setRegistered: React.Dispatch<React.SetStateAction<boolean>>;
  fetchUserStatus: () => void;
  smallLoader: boolean;
  userMeetingData?: unknown;
}

const RegistrationStatusCard: React.FC<RegistrationStatusCardProps> = ({
  registeredAccessType,
  fetchUserStatus,
  smallLoader,
  userMeetingData,
}) => {
  const seekerData = getItemInLocalStorage("seekerDetails") || {};
  const handleGoback = () => {
    fetchUserStatus();
  };

  /**
   * @returns {string} - Returns the date and time in the format "Day, Date-Month-Year"
   */
  const getDateAndTime = () => {
    const dateTimeString = `${getDayOfWeek(userMeetingData?.startDate)},
            ${getDateFromString(userMeetingData?.startDate)}-
            ${getMonthAbbreviation(userMeetingData?.startDate)}-
            ${getYearBasedOnDate(userMeetingData?.startDate)}`;
    return dateTimeString;
  };

  return (
    <div className={styles.container} data-testid="registration-status-card">
      <div className={styles.imagesContainer} data-testid="images-container">
        <div>
          <img
            src={infinipath}
            alt="infinipath"
            data-testid="infinipath-logo"
          />
          <p
            className={styles.growthSessionsText}
            data-testid="growth-sessions-text"
          >
            growth sessions with <span>Mahatria</span>
          </p>
        </div>
        <div
          className={styles.profileIconDiv}
          data-testid="profile-icon-container"
        >
          <Avatar
            alt="Remy Sharp"
            src={
              seekerData?.profileUrl?.length > 0
                ? `${seekerData?.profileUrl}?timestamp=${new Date().getTime()}` // To avoid caching
                : defaultProfileIcon
            }
            sx={{
              width: 120,
              height: 120,
              border: "2px solid #ffffff !important",
              boxShadow: "0px 0px 20px 0px #0000001F",
            }}
            data-testid="profile-avatar"
          />
          <div className={styles.editDiv} data-testid="success-icon-container">
            <img
              src={successIconTick}
              alt="successIcon"
              data-testid="success-icon"
            />
          </div>
        </div>
      </div>

      <div className={styles.skyDiv} data-testid="sky-content">
        <div className={styles.textDiv} data-testid="text-content">
          {registeredAccessType && registeredAccessType.length > 0 ? (
            <p
              className={styles.text}
              data-testid="registration-confirmed-text"
            >
              {seekerData?.firstName?.charAt(0).toUpperCase() +
                seekerData?.firstName?.slice(1)}
              ,<br></br> Your registration{" "}
              {registeredAccessType === "video"
                ? "with video access (Panelist)"
                : "without video access (Attendee)"}{" "}
              for the infinipath on{" "}
              {userMeetingData?.startDate && getDateAndTime()} with{" "}
              <span className={styles.mahatriaText}>Mahatria</span> is
              confirmed.
            </p>
          ) : (
            <p
              className={styles.text}
              data-testid="registration-unregistered-text"
            >
              {seekerData?.firstName?.charAt(0).toUpperCase() +
                seekerData?.firstName?.slice(1)}
              , Your{" "}
              {userMeetingData?.title
                ? userMeetingData?.title
                : "Weekly Growth Session"}{" "}
              <br></br>with{" "}
              <span className={styles.mahatriaText}>Mahatria</span> has been
              unregistered.
            </p>
          )}
        </div>
        <div>
          {smallLoader ? (
            <Loader type="small" data-testid="loader-small" />
          ) : (
            <Button
              type="button"
              buttonClassName={styles.buttonClass}
              onClick={() => handleGoback()}
              datatestid="go-back-button"
              datatestidText="go-back"
            >
              go back
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationStatusCard;
