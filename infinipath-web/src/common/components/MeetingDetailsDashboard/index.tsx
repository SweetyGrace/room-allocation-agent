import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import hangingIcon from "../../../assets/images/dashboard-hangings.svg";
import {
  formatDateTimeWithHiphens,
  calculateTimeForMeeting,
  canStartEnableSession,
  handleZoomRedirection,
} from "../../../utils/commonFunctions";
import { Button } from "../Button";
import { getItemInLocalStorage, setItemInLocalStorage } from "../../../services/localStorage";
interface MeetingDetailsCardProps {
  meetingDate: string;
  meetingStartDate: string;
  startEnableTime: number;
  meetingEndTime: string;
  meetingId: string;

}

const MeetingDetailsCard: React.FC<MeetingDetailsCardProps> = ({
  meetingDate,
  meetingStartDate,
  startEnableTime,
  meetingEndTime,
  meetingId,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string | null>(
    calculateTimeForMeeting(meetingDate),
  );
  const role = getItemInLocalStorage("seekerDetails")?.role || "";
  const [startEnable, setStartEnable] = useState<boolean>(false);

  /**
   * Using this useeffect to update the time remaining every second
   */
  useEffect(() => {
  
    // Function to execute the logic
    const startLogicCheck = () => {
      const startEnabled = canStartEnableSession(meetingStartDate, startEnableTime, meetingEndTime);
      setStartEnable(startEnabled);
      const remainingTime = calculateTimeForMeeting(meetingDate);
      setTimeRemaining(remainingTime);
  
    };
  
    // Execute the logic immediately
    startLogicCheck();
  
    // Set interval to execute the logic every 1000ms
    const intervalId = setInterval(() => {
      startLogicCheck();
    }, 1000);
  
    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, [meetingDate, meetingStartDate, startEnableTime, meetingEndTime]);

  return (
    <div className={styles.detailsCard}>
      <div className={styles.hangingIcons}>
        <img src={hangingIcon} alt="" />
        <img src={hangingIcon} alt="" />
      </div>
      {timeRemaining && !startEnable ? (
        <div className={styles.cardContainer}>
          <div className={styles.headingText}>
            Registration will be closed in
          </div>
          <span className={styles.daysText} data-testid="meeting-time">
            {timeRemaining}
          </span>
          <span className={styles.headingText} data-testid="meeting-date">
            {formatDateTimeWithHiphens(meetingDate, false)}
          </span>
        </div>
      ) : (
        <div className={styles.cardContainer}>
          <div className={styles.headingText}>It’s time to connect</div>
          <Button
            type="button"
            buttonClassName={styles.buttonClass}
            onClick={(e) => {
              e.stopPropagation();
              setItemInLocalStorage("table_meeting_id", meetingId);
             handleZoomRedirection()
            }}
            datatestid="start-meeting-button"
            disable={!startEnable}
          >
            {role === "mahatria" ? "join session" : "start session"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MeetingDetailsCard;
