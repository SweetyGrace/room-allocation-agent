import React from "react";
import styles from "./index.module.scss";

interface AnalyticsDetailsContainerProps {
  kpiData: unknown[];
}

const AnalyticsDetailsContainer: React.FC<AnalyticsDetailsContainerProps> = ({
  kpiData,
}) => {
  return (
    <div className={styles.detailsContainer} data-testid="details-container">
      <div className={styles.detailItem} data-testid={`detail-item-1`}>
        <div
          className={styles.countName}
          data-testid={`attendance-count-of-${kpiData?.[1]?.count}`}
        >
          <p data-testid={`attendance-count`}>
            {" "}
            <span className={styles.value} data-testid={`attendance-value`}>
              {kpiData?.[1]?.count || 0}
            </span>
            / {kpiData?.[0]?.count || 0}
          </p>
          <span className={styles.label} data-testid={`attendance-label`}>
            Attendance count
          </span>
        </div>
      </div>
      <div className={styles.seperator} data-testid={`seperator-1`}></div>

      <div className={styles.detailItem} data-testid={`detail-item-2`}>
        <div className={styles.bothCount} data-testid={`both-count`}>
          <div
            className={styles.countName}
            data-testid={`video-count-of-${kpiData?.[2]?.count}`}
          >
            <span className={styles.value} data-testid={`video-value`}>
              {kpiData?.[2]?.count || 0}
            </span>
            <span className={styles.label} data-testid={`video-label`}>
              Video
            </span>
          </div>
          <div
            className={styles.countName}
            data-testid={`non-video-count-of-${kpiData?.[3]?.count}`}
          >
            <span className={styles.value} data-testid={`non-video-value`}>
              {kpiData?.[3]?.count || 0}
            </span>
            <span className={styles.label} data-testid={`non-video-label`}>
              Non-video
            </span>
          </div>
        </div>
      </div>
      <div className={styles.seperator} data-testid={`seperator-2`}></div>

      <div className={styles.detailItem} data-testid={`detail-item-3`}>
        <div
          className={styles.countName}
          data-testid={`non-registered-count-of-${kpiData?.[4]?.count}`}
        >
          <span className={styles.value} data-testid={`non-registered-value`}>
            {kpiData?.[4]?.count || 0}
          </span>
          <span className={styles.label} data-testid={`non-registered-label`}>
            Non registered attendance
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDetailsContainer;
