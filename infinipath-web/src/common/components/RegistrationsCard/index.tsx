import React, { useState } from "react";
import styles from "./index.module.scss";
import {
  canStartSession,
  formatDuration,
  formatTime,
  getDateFromString,
  getDayOfWeek,
  getFutureTime,
  getMonthAbbreviation,
  getYearBasedOnDate,
  handleZoomRedirection,
} from "../../../utils/commonFunctions";
import calendar from "../../../assets/images/calendar.svg";
import clockIcon from "../../../assets/images/clock.svg";
import { Button } from "../Button";
import { useNavigate } from "react-router-dom";
import {
  getItemInLocalStorage,
  setItemInLocalStorage,
} from "../../../services/localStorage";
import CommonMenuOption from "../MenuActions";
import RoomUploadModel from "../../../components/RoomUploadModel";
import { NESTEDTAB } from "../../../constants";

interface RegistrationsCardProps {
  formattedMeetingStart?: string;
  durationTime?: string;
  duration?: number;
  inputValue?: string;
  isButtons?: boolean;
  registrationStartsAt?: string | undefined;
  formattedTime?: string;
  registrationStartDataTestId?: string;
  formattedTimeDataTestId?: string;
  diffStyles?: boolean;
  title: string;
  Onclick?: () => void;
  meetingId?: string;
  regEndsAt?: string;
  editButton?: boolean;
  meeting?: unknown;
  published?: (type: string) => void;
  isPublished?: boolean;
  publishString?: string;
  menuOptions? : boolean;
}

export const RegistrationsCard: React.FC<RegistrationsCardProps> = ({
  formattedMeetingStart,
  duration,
  inputValue,
  diffStyles,
  Onclick,
  title,
  isButtons,
  meetingId,
  editButton,
  meeting,
  published,
  publishString,
  menuOptions,
}) => {
  const navigate = useNavigate();
  const role = getItemInLocalStorage("seekerDetails")?.role || "";
  const [openBulkPopup, setOpenBulkPopup] = useState(false);

  const options = [
    { label: "Bulk Register", onClick: () => {} },
    // Add more options here if needed
  ];

  return (
    <div
      className={diffStyles ? styles.diffContainer : styles.cardContainer}
      data-testid="card-content"
    >
      {!diffStyles && (
        <span className={styles.mainTitle}>Upcoming sessions</span>
      )}

      <div
        className={
          diffStyles
            ? styles.diffMeeetingRegistrationDetails
            : styles.meetingRegistrationsDetails
        }
        onClick={Onclick}
        data-testid={`meeting-registrations-details-${title}`}
      >
        <div className={styles.cardContent} data-testid="card-content">
          <span className={styles.titleDisplay} data-testid="title-display">
            {inputValue}
          </span>

          <span className={styles.subtitle} data-testid="title-display">
            {title}
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
             {menuOptions &&  <CommonMenuOption
                onOptionClick={() => {
                  setOpenBulkPopup(true);
                }}
                options={options}
              />}
            </div>
          </span>

          <div className={styles.dateTime} data-testid="date-time">
            <div className={styles.calendar} data-testid="calendar-date">
              <img
                src={calendar}
                alt="calendar icon"
                data-testid="calendar-icon"
              />
              {formattedMeetingStart && (
                <span data-testid="formatted-date">
                  {/* Sunday, 05-Nov-2024 */}
                  {getDayOfWeek(formattedMeetingStart)},{" "}
                  {getDateFromString(formattedMeetingStart)}-
                  {getMonthAbbreviation(formattedMeetingStart)}-
                  {getYearBasedOnDate(formattedMeetingStart)}
                </span>
              )}
            </div>
            <div className={styles.calendar} data-testid="calendar-time">
              <img src={clockIcon} alt="clock icon" data-testid="clock-icon" />
              {formattedMeetingStart && (
                <p data-testid="duration-time">
                  {formatTime(formattedMeetingStart)} to{" "}
                  {getFutureTime(formattedMeetingStart, duration)} IST
                  <span className={styles.timer} data-testid="timer">
                    {formatDuration(duration)}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
        {/* buttons only for external inifiny paths */}
        {!editButton && isButtons && (
          <div
            className={!diffStyles ? styles.buttonsDiv : ""}
            data-testid="start-button"
          >
            {/* {isButtons ?  ( */}
            <Button
              type="submit"
              buttonClassName={styles.buttonContainer}
              buttonTextClassName={styles.buttonText}
              datatestid={`start-${title}`}
              datatestidText={`start-${title}-text`}
              onClick={(e) => {
                e.stopPropagation();
                setItemInLocalStorage("table_meeting_id", meetingId);
                handleZoomRedirection();
              }}
              disable= {!canStartSession(formattedMeetingStart, meeting?.startEnableTime)}
            >
              {role === "mahatria" ? "join session" : "start session"}
            </Button>
            
          </div>
        )}
        {/* buttons only for draft and internal inifiny paths */}
        {editButton && (
          <div>
            <div
              className={
                !diffStyles ? styles.buttonsDiv : styles.buttonsDivEdit
              }
              data-testid="start-button"
            >
              <Button
                type="submit"
                buttonClassName={styles.buttonContainer}
                buttonTextClassName={styles.buttonText}
                datatestid={`start-${title}`}
                datatestidText={`start-${title}-text`}
                onClick={(e) => {
                  e.stopPropagation();
                  setItemInLocalStorage("table_meeting_id", meetingId);
                  navigate("/admin/infinipath/createinfinipath", {
                    state: { selectedMeeting: meeting },
                  });
                }}
              >
                edit
              </Button>
              <Button
                type="submit"
                buttonClassName={styles.buttonContainerPublish}
                buttonTextClassName={styles.buttonText}
                datatestid={`start-${title}`}
                datatestidText={`start-${title}-text`}
                onClick={(e: unknown) => {
                  e.stopPropagation();
                  setItemInLocalStorage("table_meeting_id", meetingId);
                  published && published("publish");
                }}
                lessPadding={true}
              >
                {publishString!==undefined? publishString === NESTEDTAB.INTERNAL? "publish to internal":"publish to external":""}
              </Button>
            </div>
          </div>
        )}
      </div>
      {openBulkPopup && (
        <RoomUploadModel
          isOpen={true}
          handleClose={() => {
            setOpenBulkPopup(false);
          }}
          closePopUp={() => {
            setOpenBulkPopup(false);
          }}
          id={meetingId}
        />
      )}
    </div>
  );
};
