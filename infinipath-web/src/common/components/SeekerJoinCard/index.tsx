import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import defaultProfileIcon from "../../../assets/images/default-profile.svg";
import { Avatar } from "@mui/material";
import {
  formatTime,
  getDateFromString,
  getDayOfWeek,
  getFutureTime,
  getMonthAbbreviation,
  getYearBasedOnDate,
} from "../../../utils/commonFunctions";
import Loader from "../Loader";
import { Button } from "../Button";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  getItemInLocalStorage,
  setItemInLocalStorage,
} from "../../../services/localStorage";
import { RootState } from "../../../store";

interface SeekerJoinCardProps {
  seekerDetails?: {
    profile_url?: string;
    first_name?: string;
  };
  startDate?: string;
  duration?: string;
  isChecked?: Array<string>;
}

const SeekerJoinCard: React.FC<SeekerJoinCardProps> = ({
  seekerDetails,
  startDate,
  duration,
}) => {
  const verificationStatus = getItemInLocalStorage("verification_status");
  const status = verificationStatus?.includes("success")
    ? "verified"
    : "not verified";
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const verifiedSeekersIds = useSelector(
    (state: RootState) => state?.seekerReducer?.verifiedSeekersIds || [],
  );

  const selectedSeekers = useSelector(
    (state: RootState) => state?.seekerReducer?.selectedSeekersBeforeJoin || [],
  );

  //handle join meeting
  const handleJoinmeeting = () => {
    const seekersWithStatus = selectedSeekers.map((seeker) => ({
      userId: seeker,
      faceVerificationStatus: verifiedSeekersIds.includes(seeker),
    }));
    setItemInLocalStorage("attendees", seekersWithStatus);
    navigate("/zoom");
  };

  //check if start date and duration is present
  useEffect(() => {
    if (startDate && duration == null) {
      setLoader(true);
    }
  }, [startDate, duration]);

  //check if date is valid
  const isValidDate = (date: string | undefined): boolean => {
    return date != null && !isNaN(new Date(date).getTime());
  };

  //display date text
  const displayDateText = isValidDate(startDate);

  return (
    <>
      {loader ? (
        <Loader type="large" />
      ) : (
        <div className={styles.joinSeekerCard}>
          <div className={styles.avatharContainer}>
            <Avatar
              alt="Profile"
              src={
                seekerDetails?.profile_url &&
                seekerDetails?.profile_url?.length > 0
                  ? `${seekerDetails?.profile_url}?timestamp=${new Date().getTime()}`
                  : defaultProfileIcon
              }
              sx={{
                width: 160,
                height: 160,
                border: "1px solid #DDDDDD",
              }}
            />
          </div>
          <div className={styles.detailsContainer}>
            <div className={styles.seekerText}>
              {seekerDetails?.first_name}, you have been{" "}
              <span
                className={
                  status === "verified" ? styles.verified : styles.notVerified
                }
              >
                {status}
              </span>{" "}
              and your attendance is marked.
            </div>
            {displayDateText && (
              <div
                className={styles.dateText}
                data-testid="date-display-card-date-text"
              >
                <span
                  className={styles.boldText}
                  data-testid="date-display-card-bold-text"
                >
                  {getDayOfWeek(startDate!)}, {getDateFromString(startDate!)}-
                  {getMonthAbbreviation(startDate!)}-
                  {getYearBasedOnDate(startDate!)}{" "}
                </span>
                <span
                  className={styles.fromText}
                  data-testid="date-display-card-from-text"
                >
                  from {formatTime(startDate!)} to{" "}
                  {getFutureTime(startDate!, duration!)}
                </span>
              </div>
            )}
            <div className={styles.button}>
              <Button
                buttonClassName={styles.joinButton}
                buttonTextClassName={styles.joinButtonText}
                onClick={() => handleJoinmeeting()}
                datatestid="join-button"
                datatestidText="join infinipath"
              >
                join infinipath
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SeekerJoinCard;
