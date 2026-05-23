import React from "react";
import infinipath from "../../assets/images/infinipath-name.svg";
import styles from "./index.module.scss";
import { Button } from "../../common/components/Button";
import { useNavigate } from "react-router-dom";
import defaultProfileIcon from "../../assets/images/default-profile.svg";
import failureIcon from "../../assets/images/failure-tick.svg";
import successIconTick from "../../assets/images/success-icon.svg";
import { getItemInLocalStorage } from "../../services/localStorage";
import { Avatar } from "@mui/material";
import Loader from "../../common/components/Loader";
interface JoinVerificationCardProps {
  smallLoader: boolean;
  verificationStatus?: string;
}

const JoinVerificationCard: React.FC<JoinVerificationCardProps> = ({
  smallLoader,
  verificationStatus,
}) => {
  const seekerData = getItemInLocalStorage("seekerDetails") || {};
  const navigate = useNavigate();

  return (
    <div className={styles.container} data-testid="join-verification-card">
      <div className={styles.imagesContainer} data-testid="images-container">
        <div>
          <img
            src={infinipath}
            alt="infinipath"
            data-testid="infinipath-logo"
          />
          <p className={styles.growthSessionsText}>
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
              seekerData?.profileUrl && seekerData?.profileUrl?.length > 0
                ? `${seekerData?.profileUrl}?timestamp=${new Date().getTime()}`
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
          <div
            className={
              verificationStatus === "success"
                ? styles.editDiv
                : styles.editDivError
            }
            data-testid={
              verificationStatus === "success"
                ? "verification-success-icon-container"
                : "verification-failure-icon-container"
            }
          >
            <img
              src={
                verificationStatus === "success" ? successIconTick : failureIcon
              }
              alt="successIcon"
              data-testid={
                verificationStatus === "success"
                  ? "success-icon"
                  : "failure-icon"
              }
            />
          </div>
        </div>
      </div>

      <div className={styles.skyDiv} data-testid="sky-content">
        <div className={styles.textDiv} data-testid="text-content">
          {verificationStatus === "success" ? (
            <p className={styles.text} data-testid="verification-success-text">
              {seekerData?.firstName?.charAt(0).toUpperCase() +
                seekerData?.firstName?.slice(1)}
              , you are successfully{" "}
              <span className={styles.successText}>verified.</span>
            </p>
          ) : (
            <p className={styles.text} data-testid="verification-failure-text">
              {seekerData?.firstName?.charAt(0).toUpperCase() +
                seekerData?.firstName?.slice(1)}
              , your face verification is{" "}
              <span className={styles.errorText}>failed.</span>
            </p>
          )}
          {/* <p className={styles.text} data-testid="joining-question-text">
            Is there anyone joining along with you?
          </p> */}
        </div>
        <div>
          {smallLoader ? (
            <Loader type="small" data-testid="loader-small" />
          ) : (
            <div className={styles.buttons}>
              <Button
                buttonTextClassName={styles.buttonText}
                buttonClassName={styles.buttonContainer}
                isNonActive={true}
                onClick={() => {
                  navigate(
                    `/infinipath/joinwithothers?user_id=${seekerData?.phoneNumber}`,
                  );
                }}
                data-testid="join-with-others-button"
                datatestidText="join-with-others"
              >
                joining with others
              </Button>
              <Button
                buttonTextClassName={styles.buttonText}
                buttonClassName={styles.buttonContainer}
                onClick={() => {
                  navigate("/infinipath/zoom");
                }}
                datatestid="join-alone-button"
                datatestidText="join-alone"
              >
                joining alone
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinVerificationCard;
