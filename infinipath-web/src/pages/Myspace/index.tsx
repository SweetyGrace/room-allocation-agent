import { useState, useEffect } from "react";
import { getCall, putCall } from "../../services/apiService";
import styles from "./index.module.scss";
import { useNavigate } from "react-router-dom";
import {} from // formatDateTime,

"../../utils/commonFunctions";
import Loader from "../../common/components/Loader";
import {
  setItemInLocalStorage,
  getItemInLocalStorage,
  removeItemInLocalStorage,
} from "../../services/localStorage";
import CustomPopup from "../../common/components/CustomPopup";

import DetailsCard from "../../common/components/DetailsCard";
import RegistrationStatusCard from "../../components/RegistrationStatusCard";
import JoinVerificationCard from "../../components/JoinVerificationCard";
import JoinInOtherDeviceCard from "../../components/JoinedInOtherDeviceCard";
import { INFINIPATH } from "../../constants/urlConstants";

const UserStatus = () => {
  const navigate = useNavigate();

  const seekerData = getItemInLocalStorage("seekerDetails") || {};
  const verificationStatus = getItemInLocalStorage("verification_status") || "";
  const joiningInOtherDevice =
    getItemInLocalStorage("joining_from_other_device") || false;
  const [meetingStatus, setMeetingStatus] = useState("Loading...");
  const [userMeetingData, setUserMeetingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [smallLoader, setSmallLoader] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [popup, setPopup] = useState(false);
  const [popupDescription, setPopupDescription] = useState("");
  const [popupNote, setPopupNote] = useState("");

  const [actiontype, setActionType] = useState("");
  const [registered, setRegistered] = useState(false);
  const [registeredAccessType, setRegisteredAccessType] = useState("");
  const [attendeeRegistrationAttempts, setAttendeeRegistrationAttempts] =
    useState(0);
  const [panelistRegistrationAttempts, setPanelistRegistrationAttempts] =
    useState(0);

  /**
   * @description To get the user status and meeting details
   */
  const fetchUserStatus = () => {
    if (!registered) {
      setLoading(true);
    } else {
      setSmallLoader(true);
    }
    getCall(
      `users/${seekerData?.id}/webinars`,
      undefined,
      INFINIPATH
    )
      .then((response: unknown) => {
        if (response?.data?.statusCode === 200) {
          const meetingData = response?.data?.data;
          setLoading(false);
          setSmallLoader(false);
          setRegistered(false);
          setMeetingStatus(response?.data?.data?.registrationStatus);
          setUserMeetingData(response?.data?.data);
          setItemInLocalStorage(
            "table_meeting_id",
            response?.data?.data?.meetingId,
          );
          setItemInLocalStorage("userMeetingData", meetingData);
          setPanelistRegistrationAttempts(
            response?.data?.data?.panelistRegistrationAttempts,
          );
          setAttendeeRegistrationAttempts(
            response?.data?.data?.attendeeRegistrationAttempts,
          );
        } else {
          setLoading(false);
          setSmallLoader(false);
          console.error("Error:", response?.data?.message);
          setErrorMsg(response?.data?.message);
        }
      })
      .catch((error: unknown) => {
        setLoading(false);
        setSmallLoader(false);
        console.error("Error:", error);
        setErrorMsg("Failed to fetch data");
      });
  };

  useEffect(() => {
    fetchUserStatus();
    removeItemInLocalStorage("seekerToAdd");
    removeItemInLocalStorage("attendees");
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
      // `Are you sure you want to unregister? \nRegistering again won't be possible later.`,
      "Are you sure you want to cancel your registration for the infinipath?",
    );
    setPopupNote(`Note: ${getRemainingAttempts()}`);
    setActionType("unregister");
  };
  /**
   * @description To handle downgrade scenario popup
   */
  const handleDowngrade = () => {
    setPopup(true);
    setPopupDescription(
      `Are you sure you want to switch to without video access?`,
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
      registrationUpdate: type, // UNREGISTER, REGISTER, DOWNGRADE_TO_AUDIO
      role: accessType === "video" ? "Panelist" : "Attendee",
    };
    setSmallLoader(true);
    putCall(
      `webinars/${userMeetingData?.meetingId}/registration/${seekerData?.id}`,
      payload,
      INFINIPATH
    )
      .then((response: unknown) => {
        if (response?.data?.statusCode === 200) {
          if (fromPopup) {
            fetchUserStatus();
          } else {
            setRegistered(true);
            setRegisteredAccessType(accessType);
          }
          setSmallLoader(false);
        } else {
          setSmallLoader(false);
          console.error("Error:", response?.data?.message);
          const errorMsg =
            response?.data?.message ||
            "Registration failed, please try again later";
          alert(errorMsg);
        }
      })
      .catch((error: unknown) => {
        setLoading(false);
        setSmallLoader(false);
        console.error("Error:", error);
        alert("Registration failed, please try again later");
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

  /** Handling go back from marked attendace from while joining in other device */
  const handleGoback = () => {
    removeItemInLocalStorage("joining_from_other_device");
    fetchUserStatus();
  };

  const getRemainingAttempts = () => {
    if (userMeetingData && userMeetingData?.isPanelist) {
      const remainingAttempts = 3 - panelistRegistrationAttempts;
      if (remainingAttempts > 0) {
        return `${remainingAttempts}${remainingAttempts > 1 ? " Attempts" : " Attempt"} remaining to re-register for ${userMeetingData?.isPanelist ? "video" : "without video"} access.`;
      } else {
        return `No attempts left. You can not re-register for video access further.`;
      }
    } else {
      const remainingAttempts = 3 - attendeeRegistrationAttempts;
      if (remainingAttempts > 0) {
        return `${remainingAttempts}${remainingAttempts > 1 ? " Attempts" : " Attempt"} remaining to re-register for ${userMeetingData?.isPanelist ? "video" : "without video"} access.`;
      } else {
        return `No attempts left. You cannot re-register for without video access further.`;
      }
    }
  };

  return loading ? (
    <Loader type="large" data-testid="loader-large" />
  ) : (
    <div
      className={styles.userStatusContainer}
      data-testid="user-status-container"
    >
      <div className={styles.contentContainer} data-testid="content-container">
        {errorMsg && (
          <p className={styles.errorMsg} data-testid="error-message">
            {errorMsg}
          </p>
        )}
        {registered ? (
          <RegistrationStatusCard
            registeredAccessType={registeredAccessType}
            setRegistered={setRegistered}
            fetchUserStatus={fetchUserStatus}
            smallLoader={smallLoader}
            userMeetingData={userMeetingData}
          />
        ) : verificationStatus?.length > 0 ? (
          <JoinVerificationCard
            smallLoader={smallLoader}
            verificationStatus={verificationStatus}
          />
        ) : joiningInOtherDevice ? (
          <JoinInOtherDeviceCard
            smallLoader={smallLoader}
            joiningInOtherDevice={joiningInOtherDevice}
            handleGoback={handleGoback}
          />
        ) : userMeetingData !== null ? (
          <DetailsCard
            meetingStatus={meetingStatus}
            userMeetingData={userMeetingData}
            handleRegisterForWebinar={handleRegisterForWebinar}
            handleDowngrade={handleDowngrade}
            handleUnregister={handleUnregister}
            handleMarkAttendence={handleMarkAttendence}
            handleJoinMeeting={handleJoinMeeting}
            loader={smallLoader}
          />
        ) : (
          <div className={styles.failedScenario}>
            Failed to fetch Data, please try again later
          </div>
        )}
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
