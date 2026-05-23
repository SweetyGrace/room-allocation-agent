import NewAnaylticsDashboard from "../../components/MeetingAnalyticsDashboard";
import styles from "./index.module.scss";
const Analytics = () => {
  return (
    <>
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
        <NewAnaylticsDashboard />
      </div>
    </>
  );
};
export default Analytics;
