import NewAggregatedDashboard from "../../components/MeetingAggregateDashboard";
import styles from "./index.module.scss";

const AggregatedAnalytics = () => {
  return (
    <div
    className={styles.analyticsDashboard}
    data-testid="analytics-dashboard"
    style={{
      maxHeight: "fit-content",
      maxWidth: "100vw",
      overflow: "auto",
      color: "#051B46"
    }}
  >
    <NewAggregatedDashboard />
  </div>
  );
};

export default AggregatedAnalytics;
