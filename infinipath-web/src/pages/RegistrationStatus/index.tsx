import React from "react";
import successIcon from "../../assets/images/success-tick.svg";
import infinipath from "../../assets/images/infinipath-name.svg";
import styles from "./index.module.scss";
import { Button } from "../../common/components/Button";
import { useNavigate } from "react-router-dom";
import failureIcon from "../../assets/images/failure-tick.svg";
import { getItemInLocalStorage } from "../../services/localStorage";

const RegistrationStatus: React.FC = () => {
  const seekerData = getItemInLocalStorage("seekerDetails") || {};
  const navigate = useNavigate();
  const accessType = new URLSearchParams(window.location.search).get("type");

  return (
    <div className={styles.container} data-testid="container">
      <div className={styles.imagesContainer} data-testid="images-container">
        <div>
          <img src={infinipath} alt="infinipath" data-testid="infinipath-img" />
          <p
            className={styles.growthSessionsText}
            data-testid="growth-sessions-text"
          >
            growth sessions with <span>Mahatria</span>
          </p>
        </div>
        <img
          src={accessType && accessType.length > 0 ? successIcon : failureIcon}
          alt="success"
          className={styles.successIcon}
          data-testid="success-failure-icon"
        />
      </div>
      <div data-testid="session-status-text">
        {accessType && accessType.length > 0 ? (
          <p className={styles.text} data-testid="session-confirmed-text">
            {seekerData?.first_name?.charAt(0).toUpperCase() +
              seekerData?.first_name?.slice(1)}
            , Your weekly growth session
            <br />
            with{" "}
            <span className={styles.mahatriaText} data-testid="mahatria-text">
              Mahatria
            </span>{" "}
            has been confirmed.
            <br />
            You will have {accessType === "video" ? "video" : "audio"} access.
          </p>
        ) : (
          <p className={styles.text} data-testid="session-unregistered-text">
            {seekerData?.first_name?.charAt(0).toUpperCase() +
              seekerData?.first_name?.slice(1)}
            , Your weekly growth session <br />
            with{" "}
            <span className={styles.mahatriaText} data-testid="mahatria-text">
              Mahatria
            </span>{" "}
            has been unregistered.
          </p>
        )}
      </div>
      <div data-testid="back-to-my-space-button-container">
        <Button
          type="button"
          buttonClassName={styles.buttonClass}
          onClick={() => navigate("/userstatus")}
          datatestid="back-to-my-space-button"
          datatestidText="back-to-my-space"
        >
          back to my space
        </Button>
      </div>
    </div>
  );
};

export default RegistrationStatus;
