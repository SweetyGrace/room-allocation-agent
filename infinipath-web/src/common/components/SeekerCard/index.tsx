import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import { Avatar, Tooltip } from "@mui/material";
import defaultProfileIcon from "../../../assets/images/default-profile.svg";
import oranegeDelete from "../../../assets/images/orange-delete.svg";

interface seekerCardsProps {
  seeker: unknown;
  friendsAndFamily: boolean;
  handleDelete?: (seeker: unknown) => void;
  handleChange?: (id: string) => void;
  verifyStatus?: string;
  clicked?: boolean; // Added clicked prop
  handleVerifyClick?: (seeker: unknown) => void;
  onClick?: () => void; // Added onClick prop
  joinClicked?: boolean;
}

const SeekerCard: React.FC<seekerCardsProps> = ({
  seeker,
  friendsAndFamily,
  handleDelete,
  handleChange,
  verifyStatus,
  handleVerifyClick,
  clicked,
  joinClicked,
  onClick,
}) => {
  const [isJoined, setIsJoined] = useState<boolean>(joinClicked || false);

  // useEffect to set isJoined to true if verifyStatus is not "mark attendance"
  useEffect(() => {
    if (verifyStatus !== "mark attendance") {
      setIsJoined(true);
    }
  }, [verifyStatus]);

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };
  const verifyStatusColor =
    verifyStatus === "mark attendance"
      ? styles.markAttendanceColor
      : verifyStatus === "Joining"
        ? styles.joiningColor
        : styles.failedColor;

  return friendsAndFamily ? (
    !clicked ? (
      <div
        className={styles.seekerCard}
        onClick={handleCardClick}
        data-testid="seeker-card-container"
      >
        <div className={styles.seekerImage} data-testid="seeker-card-avatar">
          <Avatar
            alt="Remy Sharp"
            src={
              seeker?.profileUrl
                ? `${seeker?.profileUrl}?timestamp=${new Date().getTime()}`
                : defaultProfileIcon
            }
            sx={{
              width: 80,
              height: 80,
              border: "1px solid #00000014",
            }}
          />
        </div>
        <p className={styles.seekerName} data-testid="seeker-card-name">
          {seeker?.fullName && seeker?.fullName?.length > 15 ? (
            <Tooltip
              title={seeker?.fullName}
              arrow
              placement="top"
              classes={{ tooltip: styles.customTooltip }}
            >
              <span>
                {seeker?.fullName?.slice(0, 15)}
                {"..."}
              </span>
            </Tooltip>
          ) : (
            seeker?.fullName
          )}
        </p>
      </div>
    ) : (
      <div
        className={styles.deleteParent}
        data-testid="seeker-card-delete-parent"
      >
        <div
          className={styles.seekerCardDelete}
          onClick={handleCardClick}
          data-testid="seeker-card-delete-overlay"
        ></div>
        {handleDelete && (
          <img
            src={oranegeDelete}
            alt="seeker"
            className={styles.deleteIcon}
            onClick={() => handleDelete(seeker)}
            data-testid="seeker-card-delete-icon"
          />
        )}
        <div />
      </div>
    )
  ) : (
    <div
      className={`${isJoined ? styles.joinedCardClicked : styles.joinseekerCard}`}
      onClick={() => {
        handleChange && handleChange(seeker?.id);
      }}
      data-testid="seeker-card-container"
    >
      <Avatar
        alt="Remy Sharp"
        src={
          seeker?.profileUrl
            ? `${seeker?.profileUrl}?timestamp=${new Date().getTime()}`
            : defaultProfileIcon
        }
        sx={{
          width: 80,
          height: 80,
          border: "1px solid #fffff",
        }}
        data-testid="seeker-card-avatar"
      />
      <p className={styles.seekerName} data-testid="seeker-card-name">
        {seeker?.fullName && seeker?.fullName?.length > 15 ? (
          <Tooltip
            title={seeker?.fullName}
            arrow
            placement="top"
            classes={{ tooltip: styles.customTooltip }}
          >
            <span>
              {seeker?.fullName?.slice(0, 15)}
              {"..."}
            </span>
          </Tooltip>
        ) : (
          seeker?.fullName
        )}
      </p>

      <div
        className={styles.separator}
        data-testid="seeker-card-separator"
      ></div>

      {handleVerifyClick && (
        <p
          onClick={() => verifyStatus!=="Joining" ? handleVerifyClick(seeker) : null}
          className={`${styles.attendenceText} ${verifyStatusColor}`}
          data-testid={`${verifyStatus}-seeker`}
        >
          {verifyStatus}
        </p>
      )}
    </div>
  );
};

export default SeekerCard;
