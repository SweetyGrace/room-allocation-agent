import { useEffect, useState } from "react";
import styles from "./index.module.scss";
import DoneIcon from "../../../assets/images/done-icon.svg";
import { getCallWithoutAuth } from "../../../services/apiService";
import { endPoints, PORTAL } from "../../../constants/urlConstants";
import { colorizeMahatriaInfinitheism } from "../ColorizeMahatriaInfinitheism";
import { formatDateString } from "../../../utils/commonFunctions";

interface TimelineActivity{
  performedByName:string;
  timestamp:string;
  message:string;
  requestId:string | number;
}

const TimelineActivity = ({
  registrationId,
}: {
  registrationId: string | number;
}) => {
  const [data, setData] = useState({
    data: [],
    totalActivities: 0,
    dateRange: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!registrationId) return;
    setLoading(true);
    getCallWithoutAuth(endPoints.activityLog(registrationId), PORTAL)
      .then((resp) => {
        setData(resp?.data || { data: [], totalActivities: 0, dateRange: {} });
      })
      .finally(() => setLoading(false));
  }, [registrationId]);

  const activities = data.data;

  const renderActivityDetails = (activity:TimelineActivity) => {
    const { performedByName, timestamp } = activity;

    return (
      <div className={styles.activitySimpleDetails}>
        <p className={styles.timelineItemTimestamp}>
        {formatDateString(timestamp)}
        </p>
        <span style={{ marginTop: "-3px", fontWeight: 400 }}>|</span>
        <p style={{marginTop:"-1px"}}>By {colorizeMahatriaInfinitheism(performedByName)}</p>
        </div>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!activities || activities.length === 0) {
    return (
      <div className={styles.timelineContainer}>
        <div className={styles.timelineContent}>
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineItemContent}>
                <div className={styles.timelineItemInfo}>
                  <p className={styles.timelineItemTitle}>
                    No activity logs found
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timelineContent}>
        <div className={styles.timeline}>
          {activities.map((activity:TimelineActivity, index:number) => (
            <div key={activity.requestId} className={styles.timelineItem}>
              {index < activities.length - 1 && (
                <div className={styles.timelineItemLine}></div>
              )}

              <div className={styles.timelineItemContent}>
                <div className={styles.timelineItemIconWrapper}>
                  <img src={DoneIcon} alt="done-icon" />
                </div>

                <div className={styles.timelineItemInfo}>
                  <p className={styles.timelineItemTitle}>
                    <span className={styles.timelineItemTitleBold}>
                      {colorizeMahatriaInfinitheism(activity.message)}
                    </span>
                  </p>
                </div>
              </div>

              {renderActivityDetails(activity)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineActivity;
