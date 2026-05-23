import React from "react";
import styles from "./index.module.scss";
import {
  UserData,
} from "../../../types/seatApproval.ts";
import star from "../../../assets/images/star.svg";
import defaultProfileIcon from "../../../assets/images/default-profile.svg";
import UniDirection from "../../../assets/images/uni-direction.svg";
import { Avatar, Tooltip } from "@mui/material";
interface UserCardProps {
  user: UserData;
  handleSeekerClick?: (user: UserData) => void;
  handleBless: (user: UserData, sessionId: number, tag: string) => void;
  isFlipped?: boolean;
  onFlip?: () => void;
  onCloseFlip?: () => void;
  programsList?: any[];
  allocatedProgramId?: number | string | null;
  highlightAllocated?: boolean;
}

const SwapUserCard: React.FC<UserCardProps> = ({
  user,
  handleBless,
}) => {
  // Add this helper function at the top of the component
  const formatPreferences = (preferences: Array<{ name: string }>) => {
    return preferences.map((pref) => pref.name).join(", ");
  };


  return (
    <div
      className={styles.swapuserCard}
      style={{ cursor: "pointer" }}
    >
      <>
        <div className={styles.userCardHeader}>
          <div className={styles.ratingWrapper}>
            <span className={styles.userCardDate}>{user.lastActiveDate}</span>
            {user?.rating && <span className={styles.verticalDivider}>|</span>}
            {user?.rating && (
              <span className={styles.starIcon}>
                <img src={star} alt="star" width={13} height={13} />
              </span>
            )}
            <span className={styles.ratingText}>{user?.rating}</span>
          </div>
        </div>
        <div className={styles.userCardContent}>
          <div className={styles.userAvatar}>
            <Avatar
              alt="Remy Sharp"
              src={user.profileImage || defaultProfileIcon}
              sx={{
                width: 100,
                height: 100,
                border: "1px solid #fffff",
              }}
              data-testid="user-avatar"
            />
            <div className={styles.hdbBadgeWrapper}>
              {user.preferredRoomMate && <div className={styles.hdbDot}></div>}
              <div className={styles.hdbBadge}>
                {user.completedHDBs.toString().padStart(2, "0")} HDBs
              </div>
            </div>
          </div>
          <div className={styles.userInfo}>
            <h3 className={styles.userName}>{user.fullName}</h3>
            <div className={styles.userDetails}>
              <span className={styles.usersubdetails}>
                {user.gender.charAt(0).toUpperCase()}
              </span>
              <span className={styles.divider}>|</span>
              <span className={styles.usersubdetails}>{user.age} yrs</span>
              {user.city && <span className={styles.divider}>|</span>}
              {user.city && (
                <span className={styles.usersubdetails}>{user.city}</span>
              )}
            </div>
            <div className={styles.horizontalDivider} />
            <div className={styles.userPreferences}>
              {user?.allocatedProgram && (
                <div className={styles.allocatedProgramWrapper}>
                  <span>[{user?.allocatedProgram?.name}]</span>
                  <span className={styles.divider}>|</span>
                  {user.programPreferences &&
                  user.programPreferences.length === 0 ? (
                    <>
                      <span
                        className={styles.mahatriaChip}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent parent click
                        }}
                      >
                        <span className={styles.mahatriaRed}>Mahatria's </span>
                        <span className={styles.mahatriaBlue}> choice</span>
                      </span>
                    </>
                  ) : (
                    user.programPreferences &&
                    user.programPreferences.length > 0 && (
                      <Tooltip
                        title={formatPreferences(user.programPreferences)}
                      >
                        <span className={styles.preferenceItem}>
                          {formatPreferences(user.programPreferences)}
                        </span>
                      </Tooltip>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    </div>
  );
};

export default SwapUserCard;
