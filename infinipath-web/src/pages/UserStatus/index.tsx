import { useState, useEffect } from "react";
import { getCall, putCall } from "../../services/apiService";
import { endPoints, INFINIPATH } from "../../constants/urlConstants";
import { Button } from "../../common/components/Button";
import styles from "./index.module.scss";
import { useNavigate } from "react-router-dom";
import {
  formatDateTimeWithHiphens,
  formatTime,
  getDayOfWeek,
  getFutureTime,
} from "../../utils/commonFunctions";
import infinipath from "../../assets/images/infinipath-name.svg";
import Loader from "../../common/components/Loader";
import {
  setItemInLocalStorage,
  getItemInLocalStorage,
  removeItemInLocalStorage,
} from "../../services/localStorage";
import CustomPopup from "../../common/components/CustomPopup";
import DateDisplayCard from "../../common/components/DateDisplayCard";

import rightArrow from "../../assets/images/right-arrow.svg";
import AnimationBanner from "../../common/components/AnimationBanner";

const UserStatus = () => {
  const navigate = useNavigate();

  const seekerData = getItemInLocalStorage("seekerDetails") || {};
  const [meetingStatus, setMeetingStatus] = useState("Loading...");
  const [userMeetingData, setUserMeetingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [popup, setPopup] = useState(false);
  const [popupDescription, setPopupDescription] = useState("");
  const [popupNote, setPopupNote] = useState("");

  const [actiontype, setActionType] = useState("");

  /**
   * @description To get the user status and meeting details
   */
  const fetchUserStatus = () => {
    setLoading(true);
    getCall(
      `${endPoints.getUserMeetingStatus}?user_id=${seekerData?.phone_number}`,
      undefined,
      INFINIPATH
    )
      .then((response: unknown) => {
        if (response?.data?.statusCode === 200) {
          const meetingData = response?.data?.data;
          setLoading(false);
          setMeetingStatus(response?.data?.data?.registration_status);
          setUserMeetingData(response?.data?.data);
          setItemInLocalStorage(
            "table_meeting_id",
            response?.data?.data?.meeting_id,
          );
          setItemInLocalStorage("userMeetingData", meetingData);
        } else {
          setLoading(false);
          console.error("Error:", response?.data?.message);
          setErrorMsg(response?.data?.message);
        }
      })
      .catch((error: unknown) => {
        setLoading(false);
        console.error("Error:", error);
        setErrorMsg("Failed to fetch data");
      });
  };

  useEffect(() => {
    fetchUserStatus();
    removeItemInLocalStorage("seekerToAdd");
    removeItemInLocalStorage("verification_status");
  }, []);

  const handleJoinMeeting = () => {
    navigate("/verifyuserface?source=join");
  };

  /**
   * @description To handle unregister scenario popup
   */
  const handleUnregister = () => {
    setPopup(true);
    setPopupDescription(
      "Are you sure you want to unregister?",
    );
    setPopupNote("");
    setActionType("unregister");
  };
  /**
   * @description To handle downgrade scenario popup
   */
  const handleDowngrade = () => {
    setPopup(true);
    setPopupDescription(
      `Are you sure you want to switch to non-video access?`,
    );
    setPopupNote(
      `Note: You won’t be able to revert to video access option later`,
    );
    setActionType("downgrade");
  };
  /**
   * @description To handle register for webinar function
   * @param {string} type - The type of registration update
   * @param {string} accessType - The type of access
   * @param {boolean} fromPopup - Whether the action is from popup or not
   */
  const handleRegisterForWebinar = (
    type: string,
    accessType: string,
    fromPopup: boolean,
  ) => {
    const payload = {
      registration_update: type, // UNREGISTER, REGISTER, DOWNGRADE_TO_AUDIO
      user_id: seekerData?.phone_number,
      role: accessType === "video" ? "Panelist" : "Attendee",
      meeting_id: userMeetingData?.meeting_id,
    };
    setLoading(true);
    putCall(`${endPoints.updateMeetingRegistration}`, payload, INFINIPATH)
      .then((response: unknown) => {
        if (response?.data?.statusCode === 200) {
          if (fromPopup) {
            // window.location.reload();
            fetchUserStatus();
          } else {
            navigate(`/registrationstatus?type=${accessType}`);
          }
          setLoading(false);
        } else {
          setLoading(false);
          console.error("Error:", response?.data?.message);
        }
      })
      .catch((error: unknown) => {
        setLoading(false);
        console.error("Error:", error);
      });
  };

  /**
   * @description Helper function to get the access type based on the action type
   * @param {string} actionType - The type of action
   * @returns {string} - The access type
   */
  const getAccessType = (actionType: string) => {
    if (actionType === "unregister") {
      return "";
    } else if (actionType === "downgrade") {
      return "audio";
    }
  };

  /**
   * @description To handle confirm function from popup
   */
  const handleConfirm = () => {
    const accessType = getAccessType(actiontype);
    if (actiontype === "unregister") {
      handleRegisterForWebinar("UNREGISTER", accessType, true);
    } else if (actiontype === "downgrade") {
      handleRegisterForWebinar("DOWNGRADE_TO_AUDIO", accessType, true);
    }
    setPopup(false);
    setPopupDescription("");
  };
  /**
   * @description To handle cancel function from popup
   */
  const handleCancel = () => {
    setActionType("");
    setPopup(false);
    setPopupDescription("");
  };
  const handleMarkAttendence = () => {
    navigate("/verifyuserface?source=attendance");
  };

  return loading ? (
    <Loader type="large" data-testid="loader-large" />
  ) : (
    <div
      className={styles.userStatusContainer}
      data-testid="user-status-container"
    >
      <div
        className={styles.animationBannerContainer}
        data-testid="animation-banner-container"
      >
        <AnimationBanner />
      </div>
      <div className={styles.contentContainer} data-testid="content-container">
        {errorMsg && (
          <p className={styles.errorMsg} data-testid="error-message">
            {errorMsg}
          </p>
        )}
        <div className={styles.appIconDiv} data-testid="app-icon-container">
          <img src={infinipath} alt="inifinipath" data-testid="app-icon" />
          {/* <AnimationBanner /> */}
        </div>
        {meetingStatus === "NOT OPENED" && userMeetingData ? (
          /* Registrations not opened but registartion start time is given scenario  */
          userMeetingData?.registration_starts_at ? (
            <div
              className={styles.textContainer}
              data-testid="not-opened-with-start-time"
            >
              <p className={styles.text} data-testid="not-opened-text">
                {seekerData?.first_name?.charAt(0).toUpperCase() +
                  seekerData?.first_name?.slice(1)}
                , registrations will open on<br></br>
                <span
                  className={styles.date}
                  data-testid="registration-start-time"
                >
                  {formatDateTimeWithHiphens(
                    userMeetingData?.registration_starts_at,
                  )}{" "}
                  IST
                </span>
                <br></br>
                {/* find your spiritual journey! */}
              </p>

              <DateDisplayCard
                startDate={userMeetingData?.start_date}
                duration={userMeetingData?.duration}
                data-testid="date-display-card"
              />
            </div>
          ) : (
            /* Hanlding slots not openend scenario below*/
            <div
              className={styles.textContainer}
              data-testid="not-opened-no-start-time"
            >
              <p className={styles.text} data-testid="not-opened-text">
                {seekerData?.first_name?.charAt(0).toUpperCase() +
                  seekerData?.first_name?.slice(1)}
                {/* , slots will open soon! */}, registrations will open on
                <br></br>
                <span
                  className={styles.date}
                  data-testid="registration-start-time"
                >
                  {formatDateTimeWithHiphens(
                    userMeetingData?.registration_starts_at,
                  )}{" "}
                  IST
                </span>
              </p>

              <DateDisplayCard
                startDate={userMeetingData?.start_date}
                duration={userMeetingData?.duration}
                data-testid="date-display-card"
              />
            </div>
          )
        ) : (
          <></>
        )}
        {/* Handling user join meeting scenario below */}
        {meetingStatus === "CLOSED" && userMeetingData ? (
          (userMeetingData?.is_eligible && userMeetingData?.is_registered) ||
          seekerData?.role === "mahatria" ||
          seekerData?.role === "admin" ? (
            userMeetingData?.is_join ? (
              <div
                className={styles.textContainer}
                data-testid="closed-user-join"
              >
                <DateDisplayCard
                  startDate={userMeetingData?.start_date}
                  duration={userMeetingData?.duration}
                  data-testid="date-display-card"
                />
                <Button
                  type="button"
                  buttonClassName={styles.buttonClass}
                  onClick={handleJoinMeeting}
                  datatestid="join-meeting-button"
                  datatestidText="join"
                >
                  {seekerData?.role === "mahatria" ||
                  seekerData?.role === "admin"
                    ? "start"
                    : "join"}
                </Button>
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
                    src={rightArrow}
                    alt="skip"
                    data-testid="mark-attendance-arrow"
                  />
                </span>
              </div>
            ) : (
              <div
                className={styles.textContainer}
                data-testid="closed-no-join"
              >
                <p className={styles.text} data-testid="closed-no-join-text">
                  {seekerData?.first_name?.charAt(0).toUpperCase() +
                    seekerData?.first_name?.slice(1)}
                  , your weekly growth session with{" "}
                  <span className={styles.date} data-testid="mahatria-text">
                    Mahatria
                  </span>
                  , <br></br>
                  which is on {getDayOfWeek(
                    userMeetingData?.start_date,
                  )} from {formatTime(userMeetingData?.start_date)}
                  to{" "}
                  {getFutureTime(
                    userMeetingData?.start_date,
                    userMeetingData?.duration,
                  )}
                </p>
              </div>
            )
          ) : (
            <div
              className={styles.textContainer}
              data-testid="closed-not-eligible"
            >
              <p className={styles.text} data-testid="closed-not-eligible-text">
                {seekerData?.first_name?.charAt(0).toUpperCase() +
                  seekerData?.first_name?.slice(1)}
                , registrations will open on <br></br>
                <span
                  className={styles.date}
                  data-testid="registration-start-time"
                >
                  {formatDateTimeWithHiphens(
                    userMeetingData?.registration_starts_at,
                  )}{" "}
                  IST
                </span>
              </p>

              <DateDisplayCard
                startDate={userMeetingData?.start_date}
                duration={userMeetingData?.duration}
                data-testid="date-display-card"
              />
            </div>
          )
        ) : (
          <></>
        )}
        {/* Handling user to register for webinar scenario below */}
        {meetingStatus === "OPENED" &&
          userMeetingData &&
          (userMeetingData?.is_registered && userMeetingData?.is_eligible ? (
            <div
              className={styles.textContainer}
              data-testid="opened-registered"
            >
              <div
                className={styles.messageWithCard}
                data-testid="opened-registered-text"
              >
                <p className={styles.text} data-testid="opened-registered-text">
                  {seekerData?.first_name?.charAt(0).toUpperCase() +
                    seekerData?.first_name?.slice(1)}
                  , you have opted{" "}
                  {userMeetingData?.is_panelist ? "video" : "non-video"} access.
                  <br></br>{" "}
                </p>
                <DateDisplayCard
                  startDate={userMeetingData?.start_date}
                  duration={userMeetingData?.duration}
                  data-testid="date-display-card"
                />
                <p>
                  {userMeetingData?.is_panelist
                    ? "To modify your registration, choose an option"
                    : ""}
                </p>
              </div>
              <div
                className={styles.buttonsContainer}
                data-testid="opened-not-registered"
              >
                {/* checking condition for registered as panelist then showing non-video button */}
                {userMeetingData?.is_panelist && (
                  <Button
                    type="button"
                    buttonClassName={styles.buttonClass}
                    onClick={() => handleDowngrade()}
                    datatestid="downgrade-button"
                    datatestidText="switch-to-non-video"
                  >
                    switch to non-video
                  </Button>
                )}
                {userMeetingData?.is_panelist && (
                  <Button
                    type="button"
                    buttonClassName={`${styles.buttonClass} ${styles.additionalClass1}`}
                    onClick={() => handleUnregister()}
                    datatestid="unregister-button"
                    datatestidText="unregister"
                  >
                    unregister
                  </Button>
                )}
                {!userMeetingData?.is_panelist && (
                  <span
                    className={styles.text4}
                    onClick={() => handleUnregister()}
                    data-testid="unregister-text"
                  >
                    click here to unregister
                    <img src={rightArrow} alt="skip" />
                  </span>
                )}
              </div>
            </div>
          ) : userMeetingData?.is_eligible ? (
            <div className={styles.textContainer}>
              <p className={styles.text} data-testid="registrations-text">
                {seekerData?.first_name?.charAt(0).toUpperCase() +
                  seekerData?.first_name?.slice(1)}
                , register for your weekly <br />
                growth session with{" "}
                <span
                  className={styles.mahatriaText}
                  data-testid="mahatria-text"
                >
                  Mahatria
                </span>
                , <br></br>
              </p>
              <DateDisplayCard
                startDate={userMeetingData?.start_date}
                duration={userMeetingData?.duration}
                data-testid="date-display-card"
              />
              <div className={styles.buttonsContainer}>
                <Button
                  type="button"
                  buttonClassName={styles.buttonClassVideo}
                  onClick={() =>
                    handleRegisterForWebinar("REGISTER", "audio", false)
                  }
                  isNonActive={true}
                  datatestid="register-audio-button"
                  datatestidText="non-video-access"
                >
                  non-video access
                </Button>
                <Button
                  type="button"
                  buttonClassName={styles.buttonClassVideo}
                  onClick={() =>
                    handleRegisterForWebinar("REGISTER", "video", false)
                  }
                  datatestid="register-video-button"
                  datatestidText="video-access"
                >
                  video access
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.textContainer}>
              <p className={styles.text} data-testid="registrations-opens-text">
                {seekerData?.first_name?.charAt(0).toUpperCase() +
                  seekerData?.first_name?.slice(1)}
                , registrations will open on<br></br>
                <span
                  className={styles.date}
                  data-testid="registration-start-time"
                >
                  {formatDateTimeWithHiphens(
                    userMeetingData?.registration_starts_at,
                  )}{" "}
                  IST
                </span>
                <br></br>
              </p>

              <DateDisplayCard
                startDate={userMeetingData?.start_date}
                duration={userMeetingData?.duration}
                data-testid="date-display-card"
              />
            </div>
          ))}
        {/* Pop up component */}
        <CustomPopup
          open={popup}
          onclose={() => setPopup(false)}
          title={"Request for change"}
          description={popupDescription}
          note={popupNote}
          onConfirm={() => {
            handleConfirm();
          }}
          onCancel={() => {
            handleCancel();
          }}
          confirmText="yes"
          cancelText="no"
          data-testid="custom-popup"
        />
      </div>
    </div>
  );
};

export default UserStatus;
