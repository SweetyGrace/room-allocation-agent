import React from "react";
import styles from "./index.module.scss";
import infinipathIcon from "../../../assets/images/infinipath-name.svg";
import { getItemInLocalStorage } from "../../../services/localStorage";
import MeetingDetailsCard from "../MeetingDetailsCard";
import { formatTime } from "../../../utils/commonFunctions";
import RegistrationOpen from "../RegistrationsOpenLayer";
interface DetailsCardProps {
  title?: string;
  description?: string;
  meetingStatus?: string;
  userMeetingData?: unknown;
  handleRegisterForWebinar: () => void;
  handleDowngrade: () => void;
  handleUnregister: () => void;
  handleMarkAttendence: () => void;
  handleJoinMeeting: () => void;
  loader: boolean;
}

const DetailsCard: React.FC<DetailsCardProps> = ({
  meetingStatus,
  userMeetingData,
  handleRegisterForWebinar,
  handleDowngrade,
  handleUnregister,
  handleMarkAttendence,
  handleJoinMeeting,
  loader,
}) => {
  const seekerDetails = getItemInLocalStorage("seekerDetails");

  return (
    <div>
      <div className={styles.detailsCard} data-testid="details-card">
        <div className={styles.cardContent} data-testid="card-content">
          <img
            src={infinipathIcon}
            alt="infiniPath icon"
            className={styles.infinipathIcon}
            data-testid="icon"
          />
          <div className={styles.upperTextContainer}>
            <span className={styles.boldText} data-testid="user-name">
              {" "}
              {seekerDetails?.firstName?.charAt(0).toUpperCase() +
                seekerDetails?.firstName?.slice(1)}
              ,{" "}
            </span>
            <span
              className={styles.normalText}
              data-testid="latest-status-text"
            >
              {userMeetingData?.isEligible &&
              userMeetingData?.isRegistered &&
              userMeetingData?.isJoin &&
              userMeetingData?.registrationStatus === "CLOSED"
                ? "join the session by clicking the button below."
                : userMeetingData?.registrationStatus === "NOT OPENED" ||
                    userMeetingData?.registrationStatus === "CLOSED"
                  ? "stay tuned for more updates."
                  : userMeetingData?.registrationStatus === "OPENED"
                    ? "registrations for the infinipath are open."
                    : null}
            </span>
            <br />
            <span className={styles.normalText} data-testid="description-text">
              {/* pause, reflect, and reconnect: */}
            </span>
          </div>
        </div>
        <div className={styles.mainMeetingDetailsContainer}>
          <div
            className={styles.formLine}
            data-testid="registration-status-container"
          ></div>
          {(userMeetingData?.registrationStatus === "NOT OPENED" ||
            (userMeetingData?.registrationStatus === "CLOSED" &&
              userMeetingData?.isRegistered === false)) && (
            <RegistrationOpen
              registrationStartsAt={userMeetingData?.registrationStartsAt}
              formattedTime={formatTime(userMeetingData?.registrationStartsAt)}
              cardTitle="Registrations open on"
            />
          )}
          <MeetingDetailsCard
            userMeetingData={userMeetingData}
            meetingStatus={meetingStatus}
            handleRegisterForWebinar={handleRegisterForWebinar}
            handleUnregister={handleUnregister}
            handleDowngrade={handleDowngrade}
            handleMarkAttendence={handleMarkAttendence}
            handleJoinMeeting={handleJoinMeeting}
            loader={loader}
            data-testid="meeting-details-card"
          />
        </div>
      </div>
    </div>
  );
};

export default DetailsCard;
