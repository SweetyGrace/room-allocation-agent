import React from "react";
import styles from "./index.module.scss";
import defaultProfileIcon from "../../assets/images/default-profile.svg";
import { formatDateString } from "../../utils/commonFunctions";
import { DefaulterTrackingSectionProps } from "../../types/registration";
import { ACTION_TYPE, ACTION_TYPE_LABELS, ROLE_DISPLAY_MAPPING } from "../../constants/textConstants";
import { colorizeMahatriaInfinitheism } from "../../common/components/ColorizeMahatriaInfinitheism";

const DefaulterTrackingSection: React.FC<DefaulterTrackingSectionProps> = ({
  data,
  className = "",
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.defaulterTrackingSection} ${className}`}>
      {data.map((item, index) => (
        <div key={item.id} className={styles.trackingItem}>
          {index < data.length - 1 && (
            <div className={styles.timelineItemLine}></div>
          )}
          <div className={styles.trackingHeader}>
            <div className={styles.trackingUser}>
              <div className={styles.userAvatar}>
                <img
                  src={item.performedSeekerProfileUrl || defaultProfileIcon}
                  alt={item.performedByName}
                  className={styles.avatarImage}
                />
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>
                  {colorizeMahatriaInfinitheism(item.performedByName)}
                  {item.role && ROLE_DISPLAY_MAPPING[item.role?.toLowerCase()] && ` - ${ROLE_DISPLAY_MAPPING[item.role?.toLowerCase()]}`}
                </span>
                <span className={styles.trackingDate}>
                  {formatDateString(item.createdAt)}
                </span>
              </div>
            </div>
            <div className={styles.trackingActions}>
              <span
                className={`${
                  item.newIsDefaulter
                    ? styles.markedStatus
                    : styles.unmarkedStatus
                }`}
              >
                {item.newIsDefaulter ? 
                   item?.actionType === ACTION_TYPE.MARKED ? ACTION_TYPE_LABELS.MARKED: ACTION_TYPE_LABELS.UPDATED_COMMENT
                  : ACTION_TYPE_LABELS.UNMARKED}
              </span>
            </div>
          </div>
          {item.comment && (
            <div className={styles.trackingComment}>{item.comment}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DefaulterTrackingSection;
