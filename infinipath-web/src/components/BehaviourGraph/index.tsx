// Import styling
import BarLines from "../../common/components/BarLines";
import styles from "./index.module.scss";
import noBehaviour from "../../assets/images/no-behaviour-data.svg";

interface KpiData {
  totalAttended: number;
  totalRegistered: number;
  totalAbsentees: number;
  totalCancellations: number;
  totalDowngrades: number;
  totalDisabled: number;
  totalDropoffs: number;
  totalRejoinCount: number;
  totalDuration: number;
  totalTimeSpent: string;
}



// Update interface for behavior data
interface BehaviorData {
  name: string;
  value: number;
}


/**
 * ReusablePlatformChart Component
 * Renders a horizontal bar chart with gradient bars and custom labels
 * Supports platform usage and age distribution visualization
 */
export const BehaviourGraph: React.FC = ({ kpiData, seekerName }: { kpiData: KpiData, seekerName: string; }) => {
  // Dummy behavior data
  const behaviorData: BehaviorData[] = [
    { name: "Drop off", value: kpiData?.totalDropoffs },
    { name: "Disable video access", value: kpiData?.totalDisabled },
    { name: "Video downgrades", value: kpiData?.totalDowngrades },
    { name: "Cancellations", value: kpiData?.totalCancellations },
  ].filter(item => item.value > 0);

 
  // Calculate maximum value for chart scaling
  // const maxValue = Math.max(...behaviorData.map((d) => d.value)) || 100;
  return (
    <div className={styles.barlinecontainer}>
       <div className={styles.barlineChart}>
           <BarLines
            title={`${seekerName}'s behaviour breakdown`}
            data={behaviorData}
            noDataMessage = {`A consistent and committed seeker!\nSteady engagement noted.`}
            noDataIcon={noBehaviour}
          />
        </div>
    </div>
  );
};
