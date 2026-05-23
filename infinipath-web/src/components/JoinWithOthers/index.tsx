import React from "react";
import JoinWithOthersCard from "../JoinWithOthersCard";
import styles from "./index.module.scss";

const JoinWithOthers: React.FC = () => {
  return (
    <div className={styles.joinMeeting} data-testid="join-with-others-session">
      <JoinWithOthersCard />
    </div>
  );
};

export default JoinWithOthers;
