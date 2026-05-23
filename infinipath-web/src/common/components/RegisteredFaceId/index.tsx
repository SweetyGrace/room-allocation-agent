import React from "react";
import { useNavigate } from "react-router-dom";
import scanIcon from "../../../assets/images/scan-icon.svg";
import rightArrow from "../../../assets/images/right-arrow.svg";
import styles from "./index.module.scss";

interface RegisteredFaceIdProps {
  registeredFaceId: string;
  errors: unknown;
  scanClassname?: string;
  nonInfinipathSeeker?: boolean;
  friendsAndFamily?: boolean;
}

const RegisteredFaceId: React.FC<RegisteredFaceIdProps> = ({
  registeredFaceId,
  errors,
  scanClassname,
  nonInfinipathSeeker,
  friendsAndFamily,
}) => {
  const navigate = useNavigate();

  /**
   * @description navigate to verifyuserface page to enroll face id
   */
  const handleClick = () => {
    if (nonInfinipathSeeker) {
      if (friendsAndFamily) {
        navigate(
          "/verifyuserface?nonInfinipathSeeker=true&friendsAndFamily=true",
        );
      } else {
        navigate("/verifyuserface?nonInfinipathSeeker=true");
      }
    } else {
      if (friendsAndFamily) {
        navigate("/verifyuserface?newSeekerCapture=true&addNewFriend=true");
      } else {
        navigate("/verifyuserface?newSeekerCapture=true");
      }
    }
  };

  return (
    <div data-testid="face-id-section">
      <div
        className={`${styles.termsConditionsBlock} ${scanClassname || ""}`}
        data-testid="terms-conditions-block"
      >
        {registeredFaceId === undefined || registeredFaceId?.length === 0 ? (
          <div
            className={styles.rowFlex}
            onClick={() => handleClick()}
            data-testid="register-face-id"
          >
            <div className={styles.scanAlign} data-testid="scan-icon-block">
              <img src={scanIcon} alt="scan-icon" data-testid="scan-icon" />
              <span
                className={styles.buttonTextSecondary}
                data-testid="register-face-id-text"
              >
                register with face Id
              </span>
            </div>
            <div data-testid="right-arrow-block">
              <img
                src={rightArrow}
                alt="right-arrow"
                data-testid="right-arrow-icon"
              />
            </div>
          </div>
        ) : (
          <div className={styles.rowFlex} data-testid="face-id-registered">
            <div
              className={styles.scanAlign}
              data-testid="scan-icon-success-block"
            >
              <img
                src={scanIcon}
                alt="scan-icon"
                data-testid="scan-icon-success"
              />
              <span
                className={styles.successColor}
                data-testid="face-id-success-text"
              >
                face id registered successfully
              </span>
            </div>
          </div>
        )}
      </div>

      {errors?.faceId && (
        <i
          className={styles.error}
          style={{ textAlign: "right" }}
          data-testid="face-id-error"
        >
          {errors?.faceId?.message}
        </i>
      )}
    </div>
  );
};

export default RegisteredFaceId;
