import React from "react";
import infinipath from "../../assets/images/infinipath-name.svg";
import styles from "./index.module.scss";
import { Button } from "../../common/components/Button";
import defaultProfileIcon from "../../assets/images/default-profile.svg";
import failureIcon from "../../assets/images/failure-tick.svg";
import successIconTick from "../../assets/images/success-icon.svg";
import { getItemInLocalStorage } from "../../services/localStorage";
import { Avatar } from "@mui/material";
import Loader from "../../common/components/Loader";
interface JoinVerificationCardProps {
  smallLoader: boolean;
  joiningInOtherDevice?: string;
  handleGoback: () => void;
}

const JoinInOtherDeviceCard: React.FC<JoinVerificationCardProps> = ({
  smallLoader,
  joiningInOtherDevice,
  handleGoback,
}) => {
  const seekerData = getItemInLocalStorage("seekerDetails") || {};

  return (
    <div className={styles.container} data-testid="verification-container">
      <div
        className={styles.imagesContainer}
        data-testid="verification-images-container"
      >
        <div data-testid="logo-container">
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
                ? `${seekerData?.profileUrl}?timestamp=${new Date().getTime()}` // to avoid caching
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
              joiningInOtherDevice === "true"
                ? styles.editDiv
                : styles.editDivError
            }
            data-testid={
              joiningInOtherDevice === "true"
                ? "verification-success-icon-container"
                : "verification-failure-icon-container"
            }
          >
            <img
              src={
                joiningInOtherDevice === "true" ? successIconTick : failureIcon
              }
              alt="successIcon"
              data-testid={
                joiningInOtherDevice === "true"
                  ? "success-icon"
                  : "failure-icon"
              }
            />
          </div>
        </div>
      </div>

      <div className={styles.skyDiv} data-testid="verification-sky">
        <div className={styles.textDiv} data-testid="verification-text">
          {joiningInOtherDevice === "true" ? (
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
              , you are <span className={styles.errorText}>not verified.</span>
            </p>
          )}
        </div>
        <div>
          {smallLoader ? (
            <Loader type="small" data-testid="loader-small" />
          ) : (
            <div className={styles.buttons} data-testid="button-container">
              <Button
                type="button"
                buttonClassName={styles.buttonClass}
                onClick={() => handleGoback()}
                datatestid="go-back-button"
                datatestidText="go-back"
              >
                go back
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinInOtherDeviceCard;
