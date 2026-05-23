/* eslint-disable react/no-unescaped-entities */
import React from "react";
import successIcon from "../../assets/images/success-icon.svg";
import failedIcon from "../../assets/images/error-icon.svg";
import infinipath from "../../assets/images/infinipath-name.svg";
import styles from "./index.module.scss";
import { Button } from "../../common/components/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { getItemInLocalStorage } from "../../services/localStorage";
import { Avatar } from "@mui/material";
import defaultProfileIcon from "../../assets/images/default-profile.svg";
import closeIcon from "../../assets/images/close-icon.svg";

interface VerificationResultProps {
  status: boolean;
  seekerData: unknown;
  enrollFaceId: boolean;
}
const VerificationResultComponent: React.FC<VerificationResultProps> = ({
  status,
  seekerData,
  enrollFaceId,
}) => {
  const seekerDetails = getItemInLocalStorage("seekerDetails");
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location
  const queryParams = new URLSearchParams(location.search);
  const source = queryParams.get("source");

  const handleJoiningAlone = () => {
    navigate("/infinipath/zoom");
  };

  const handleJoinWithOthers = () => {
    navigate(`/infinipath/joinwithothers?user_id=${seekerData?.phone_number}`);
  };

  const handleClose = () => {
    navigate("/infinipath/myspace");
  };

  const handleTryAgain = () => {
    window.location.reload();
  };

  return (
    <>
      {source === "attendance" && (
        <div
          className={styles.closeBlock}
          onClick={handleClose}
          data-testid="close-icon-block"
        >
          <img src={closeIcon} alt="close icon" data-testid="close-icon-img" />
          <span data-testid="close-icon-text">close</span>
        </div>
      )}
      <div className={styles.container} data-testid="container">
        <div>
          <img src={infinipath} alt="infinipath" data-testid="infinipath-img" />
          <p
            className={styles.growthSessionsText}
            data-testid="growth-sessions-text"
          >
            growth sessions with <span>Mahatria</span>
          </p>
        </div>
        <div className={styles.imagesContainer} data-testid="images-container">
          {status ? (
            <div
              className={styles.profileIconDiv}
              data-testid="profile-icon-div-success"
            >
              <Avatar
                alt="Remy Sharp"
                src={
                  seekerDetails?.profile_url?.length > 0
                    ? `${seekerDetails?.profile_url}?timestamp=${new Date().getTime()}` // to avoid caching
                    : defaultProfileIcon
                }
                sx={{
                  width: 160,
                  height: 160,
                  border: "1px solid #DDDDDD",
                }}
                data-testid="avatar-success"
              />
              <div
                className={styles.editDiv}
                onClick={() =>
                  navigate("/verifyuserface?updateProfilePicture=true")
                }
                data-testid="edit-div-success"
              >
                <img
                  src={successIcon}
                  alt="success"
                  className={styles.sussessIcon}
                  data-testid="success-icon"
                />
              </div>
            </div>
          ) : (
            <div
              className={styles.profileIconDiv}
              data-testid="profile-icon-div-failed"
            >
              <Avatar
                alt="Remy Sharp"
                src={
                  seekerDetails?.profile_url?.length > 0
                    ? `${seekerDetails?.profile_url}?timestamp=${new Date().getTime()}` // to avoid caching
                    : defaultProfileIcon
                }
                sx={{
                  width: 160,
                  height: 160,
                  border: "1px solid #DDDDDD",
                }}
                data-testid="avatar-failed"
              />
              <div
                className={styles.editDiv}
                onClick={() =>
                  navigate("/verifyuserface?updateProfilePicture=true")
                }
                data-testid="edit-div-failed"
              >
                <img
                  src={failedIcon}
                  alt="failed"
                  className={styles.sussessIcon}
                  data-testid="failed-icon"
                />
              </div>
            </div>
          )}
        </div>
        <div data-testid="status-text">
          {source !== "attendance" ? (
            status && enrollFaceId ? (
              <p className={styles.text} data-testid="face-id-added-text">
                Face ID added successfully.
                <br />
                please wait, you are redirecting...
              </p>
            ) : status && !enrollFaceId ? (
              <p
                className={styles.text}
                data-testid="verification-success-text"
              >
                {seekerData?.firstName?.charAt(0).toUpperCase() +
                  seekerData?.firstName?.slice(1)}
                , you are successfully verified. <br />
                {/* Is there anyone joining along with you? */}
              </p>
            ) : seekerData?.faceUrl?.length > 0 && !enrollFaceId ? (
              <p className={styles.text} data-testid="verification-failed-text">
                {seekerData?.firstName?.charAt(0).toUpperCase() +
                  seekerData?.firstName?.slice(1)}
                , your verification has <span>failed</span>. <br />
                {/* Is there anyone joining along with you? */}
              </p>
            ) : (
              <p className={styles.text} data-testid="add-face-id-text">
                {enrollFaceId
                  ? "Your face is already exist for another account."
                  : "Please add your face Id. Your attendance will not be marked."}
                <br />
                Please wait, you have been redirected to Infinipath....
              </p>
            )
          ) : status && !enrollFaceId ? (
            <p className={styles.text} data-testid="attendance-verified-text">
              {seekerData?.firstName?.charAt(0).toUpperCase() +
                seekerData?.firstName?.slice(1)}
              , you are successfully verified. <br />
              You're joining from another device.
            </p>
          ) : (
            seekerData?.faceUrl?.length > 0 &&
            !enrollFaceId && (
              <p className={styles.text} data-testid="attendance-failed-text">
                {seekerData?.firstName?.charAt(0).toUpperCase() +
                  seekerData?.firstName?.slice(1)}
                , your verification has <span>failed</span>. <br />
                Please try again, or we hope you can join from another device.
              </p>
            )
          )}
        </div>
        <div
          className={styles.buttonsContainer}
          data-testid="buttons-container"
        >
          {source !== "attendance" && (
            <>
              <Button
                type="button"
                buttonClassName={styles.buttonJoinOthers}
                onClick={() => handleJoinWithOthers()}
                datatestid="join-others-button"
                datatestidText="join-others"
              >
                joining with others
              </Button>
              <Button
                type="button"
                buttonClassName={styles.buttonClassVideo}
                onClick={() => handleJoiningAlone()}
                datatestid="join-alone-button"
                datatestidText="joining-alone"
              >
                joining alone
              </Button>
            </>
          )}

          {source === "attendance" &&
            !status &&
            seekerData?.faceUrl?.length > 0 &&
            !enrollFaceId && (
              <>
                <Button
                  type="button"
                  buttonClassName={styles.buttonClassVideo}
                  onClick={handleTryAgain}
                  datatestid="try-again-button"
                  datatestidText="try-again"
                >
                  try again
                </Button>
              </>
            )}
        </div>
      </div>
    </>
  );
};

export default VerificationResultComponent;
