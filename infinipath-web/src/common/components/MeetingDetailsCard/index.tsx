import React, { useState } from "react";
import styles from "./index.module.scss";
import hangingIcon from "../../../assets/images/hanging-icons.svg";
import calendar from "../../../assets/images/calendar.svg";
import clockIcon from "../../../assets/images/clock.svg";
import { Button } from "../Button";
import {
  formatDuration,
  formatTime,
  getDateFromString,
  getDayOfWeek,
  getFutureTime,
  getMonthAbbreviation,
  getYearBasedOnDate,
} from "../../../utils/commonFunctions";
import Loader from "../Loader";
import ArrowIcon from "../../../assets/images/arrow-icon.svg";
import infoIcon from "../../../assets/images/info-icon.svg";
import TermsAndConditions from "../../../components/TermsAndConditions";
import blueClose from "../../../assets/images/blue-close.svg";
import CustomCheckbox from "../CustomCheckBox";
import { Modal } from "@mui/material";
interface UserMeetingData {
  // Define the structure of UserMeetingData here
}

interface CardUIProps {
  userMeetingData: UserMeetingData;
  handleRegisterForWebinar: (
    type: string,
    access: string,
    isPanelist: boolean,
  ) => void;
  handleDowngrade: () => void;
  handleUnregister: () => void;
  handleMarkAttendence: () => void;
  handleJoinMeeting: () => void;
  loader: boolean;
}

const CardUI: React.FC<CardUIProps> = ({
  userMeetingData,
  handleRegisterForWebinar,
  handleDowngrade,
  handleUnregister,
  handleMarkAttendence,
  handleJoinMeeting,
  loader,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [checked, setChecked] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const handleModalClose = () => setOpenModal(false);
  //States to handle registration
  const [regType, setRegType] = useState("");
  const [accessType, setAccessType] = useState("");

  /**
   * @description Function to handle open modal and save state of video registration or non-video registration
   * @param type
   * @param access
   * @param isPanelist
   */
  const hanldeOpenModal = (
    type: string,
    access: string,
  ) => {
    setOpenModal(true);
    setRegType(type);
    setAccessType(access);
    setChecked(false);
    setAcceptTerms(false);
  };

  /**
   * @description Function to handle continue button click on model
   */
  const handleContinue = () => {
    handleRegisterForWebinar(regType, accessType, false);
    setOpenModal(false);
  };
  return (
    <div
      data-testid="card-ui"
      className={`${
        userMeetingData?.registrationStatus === "OPENED"
          ? styles.cardContainer
          : userMeetingData?.registrationStatus === "CLOSED" &&
              userMeetingData?.isRegistered === true
            ? styles.cardContainerclosed
            : styles.cardContainerNotOpened
      }`}
    >
      <div
        data-testid="icon-container"
        className={`${
          userMeetingData?.registrationStatus === "OPENED"
            ? styles.iconContainer
            : userMeetingData?.registrationStatus === "CLOSED" &&
                userMeetingData?.isRegistered === true
              ? styles.iconContainerClosed
              : styles.iconContainerNotOpened
        }`}
      >
        <img
          src={hangingIcon}
          alt="Top Image 1"
          className={styles.hangingIconOne}
          data-testid="hanging-icon-one"
        />
        <img
          src={hangingIcon}
          alt="Top Image 2"
          className={styles.hangingIconTwo}
          data-testid="hanging-icon-two"
        />
      </div>

      <div className={styles.cardContent} data-testid="card-content">
        <h3 data-testid="session-title" className={styles.sessionTitle}>
          {userMeetingData?.title
            ? userMeetingData?.title
            : "Weekly Growth Session"}
        </h3>
        <div className={styles.dateTime} data-testid="date-time-container">
          <div className={styles.calendar}>
            <img
              src={calendar}
              alt="calendar icon"
              data-testid="calendar-icon"
            />
            <span data-testid="calendar-date-text">
              {getDayOfWeek(userMeetingData?.startDate)},{" "}
              {getDateFromString(userMeetingData?.startDate)}-
              {getMonthAbbreviation(userMeetingData?.startDate)}-
              {getYearBasedOnDate(userMeetingData?.startDate)}
            </span>
          </div>
          <div className={styles.calendar} data-testid="calendar-time">
            <img src={clockIcon} alt="clock icon" data-testid="clock-icon" />
            <p data-testid="calendar-time-text">
              {formatTime(userMeetingData?.startDate)} to{" "}
              {getFutureTime(
                userMeetingData?.startDate,
                userMeetingData?.duration,
              )}{" "}
              IST
            </p>
            <span className={styles.timer} data-testid="duration-text">
              {formatDuration(userMeetingData?.duration)}
            </span>
          </div>
        </div>
        {loader && <Loader type="small" data-testid="loader-large" />}
        {/* Registrations opened but not yet registered */}
        {userMeetingData?.registrationStatus === "OPENED" &&
          userMeetingData?.isEligible &&
          !userMeetingData?.isRegistered &&
          !loader && (
            <div className={styles.textButtonsContainerOnRegistrationFirst}>
              <div
                className={styles.buttons}
                data-testid="registration-buttons"
              >
                {userMeetingData?.attendeeRegistrationAttempts < 3 && (
                  <Button
                    buttonTextClassName={styles.buttonText}
                    buttonClassName={styles.buttonContainer}
                    isNonActive={true}
                    onClick={
                      () => hanldeOpenModal("REGISTER", "audio", false)
                    }
                    datatestid="non-video-access-button"
                    datatestidText="non-video-access"
                  >
                    without video access
                  </Button>
                )}
                {userMeetingData?.isPanelistRegistrationAvailable &&
                  userMeetingData?.panelistRegistrationAttempts < 3 && (
                    <Button
                      buttonTextClassName={styles.buttonText}
                      buttonClassName={styles.buttonContainer}
                      onClick={
                        () => hanldeOpenModal("REGISTER", "video", true)
                      }
                      datatestid="video-access-button"
                      datatestidText="video-access"
                    >
                      with video access
                    </Button>
                  )}
              </div>
              {userMeetingData?.panelistRegistrationAttempts < 3 && (
                <div>
                  <img
                    src={infoIcon}
                    alt="info-icon"
                    data-testid="info-icon"
                    className={styles.arrowIcon}
                  />
                  <p data-testid="info-message">
                    Choose ‘with video access’ only if you will keep your video
                    ON for the entire session.
                  </p>
                </div>
              )}
              {userMeetingData?.attendeeRegistrationAttempts === 3 &&
              userMeetingData?.panelistRegistrationAttempts === 3 ? (
                <div>
                  <img
                    src={infoIcon}
                    alt="info-icon"
                    data-testid="info-icon"
                    className={styles.noVideoIcon}
                  />
                  <p data-testid="info-message" className={styles.errorExhaust}>
                    Your attempts have been exhausted
                  </p>
                </div>
              ) : userMeetingData?.attendeeRegistrationAttempts === 3 ? (
                <div>
                  <img
                    src={infoIcon}
                    alt="info-icon"
                    data-testid="info-icon"
                    className={styles.noVideoIcon}
                  />
                  <p data-testid="info-message">
                    You have used all your attempts for without video access
                  </p>
                </div>
              ) : userMeetingData?.panelistRegistrationAttempts === 3 ? (
                <div>
                  <img
                    src={infoIcon}
                    alt="info-icon"
                    data-testid="info-icon"
                    className={styles.noVideoIcon}
                  />
                  <p data-testid="info-message">
                    You have used all your attempts for video access
                  </p>
                </div>
              ) : (
                <></>
              )}
            </div>
          )}
        {/* Registrations opened and already registered */}
        {userMeetingData?.registrationStatus === "OPENED" &&
          userMeetingData?.isEligible &&
          userMeetingData?.isRegistered &&
          !loader && (
            <div className={styles.textButtonsContainer}>
              {userMeetingData?.isPanelist && (
                <p>To modify your registration, choose an option</p>
              )}
              <div
                className={styles.buttonsOpened}
                data-testid="registered-buttons"
              >
                {/* checking condition for registered as panelist then showing non-video button */}
                {userMeetingData?.isPanelist && (
                  <Button
                    buttonTextClassName={styles.buttonText}
                    buttonClassName={styles.buttonContainer}
                    onClick={() => handleDowngrade()}
                    datatestid="downgrade-button"
                    datatestidText="downgrade"
                    isNonActive={true}
                  >
                    switch to non-video
                  </Button>
                )}
                {
                  <Button
                    buttonClassName={styles.buttonUnregister}
                    onClick={() => handleUnregister()}
                    datatestid="unregister-button"
                    datatestidText="unregister"
                  >
                    unregister
                  </Button>
                }
              </div>
            </div>
          )}
        {/* Registrations closed */}
        {userMeetingData?.registrationStatus === "CLOSED" &&
          userMeetingData?.isEligible &&
          userMeetingData?.isRegistered &&
          userMeetingData?.isJoin &&
          !loader && (
            <div className={styles.buttonsClosed}>
              <Button
                buttonTextClassName={styles.buttonText}
                buttonClassName={styles.buttonContainer}
                onClick={handleJoinMeeting}
                datatestid="join-meeting-button"
                datatestidText="join-meeting"
              >
                join
              </Button>
              <div className={styles.joinInfoDiv}>
                <img
                  src={infoIcon}
                  alt="info-icon"
                  data-testid="info-icon"
                  className={styles.arrowIcon}
                />
                <p data-testid="info-message">
                  Complete your facial recognition for verification.
                </p>
              </div>
              <p data-testid="attending-other-device-text">
                Attending infinipath on different device?
              </p>
              <span
                className={styles.text3}
                onClick={handleMarkAttendence}
                data-testid="mark-attendance"
              >
                mark your attendance
                <img
                  src={ArrowIcon}
                  alt="skip"
                  data-testid="mark-attendance-arrow"
                />
              </span>
            </div>
          )}
        {openModal && (
          <Modal
            open={openModal}
            onClose={handleModalClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              backgroundRepeat: "no-repeat !important",
              backgroundPosition: "-78% -51%!important",
            }}
            data-testid="custom-popup-modal"
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <div className={styles.closeButtonContainer}>
                <div className={styles.termsAndConditionsHeading}>
                  Terms & Conditions
                </div>
                <img
                  src={blueClose}
                  className={styles.closeButton}
                  onClick={handleModalClose}
                />
              </div>
              <div className={styles.termsAndConditionsContainer}>
                <TermsAndConditions />
              </div>
              <div className={styles.checkbox}>
                <CustomCheckbox
                  key={""}
                  text={
                    "I have read and agreed to infinipath’s pre registration"
                  }
                  checked={checked}
                  onChange={() => {
                    setChecked(!checked);
                    setAcceptTerms(!acceptTerms);
                  }}
                  diffStyles={true}
                />
              </div>
              {!checked && acceptTerms ? (
                <div className={styles.acceptError}>
                  <i
                    className={styles.errorMsg}
                    data-testid="error-msg-end-date"
                  >
                    Please accept terms and conditions
                  </i>
                </div>
              ) : (
                <div className={styles.errorDummyDiv}></div>
              )}
              <div className={styles.cancelButtonContainer}>
                <Button
                  onClick={() => {
                    setAcceptTerms(true);
                    checked && handleContinue();
                  }}
                  buttonClassName={styles.confirmButton}
                  buttonTextClassName={styles.confirmText}
                  datatestid="custom-popup-confirm-button"
                >
                  continue
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default CardUI;
