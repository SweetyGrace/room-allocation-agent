import React from "react";
import styles from "./index.module.scss";
import { Button } from "../../common/components/Button";
import { useNavigate } from "react-router-dom";
import CommonSwitch from "../../common/components/CustomSwitch";
import { SELECTEDTABS } from "../../constants";

interface SessionsSubHeaderProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

const SessionsSubHeader: React.FC<SessionsSubHeaderProps> = ({
  selectedTab,
  setSelectedTab,
}) => {
  const seekerDetails = localStorage.getItem("seekerDetails");
  const firstName = seekerDetails ? JSON.parse(seekerDetails).firstName : "";
  const navigate = useNavigate();
  return (
    <div>
      <div className={styles.sessionsSubHeaderContainer}>
        <div className={styles.sessionsSubHeaderContainer__content}>
          <div className={styles.sessionsSubHeaderContainer__content__header}>
            {`Hey ${firstName}, here are the list of sessions`}
          </div>
          <div className={styles.sessionsSubHeaderContainer__content__tabs}>
            <CommonSwitch
              tabs={[SELECTEDTABS.UPCOMING, SELECTEDTABS.COMPLETED]}
              selectedTab={selectedTab}
              onChange={setSelectedTab}
              customStyles={{
                label: styles.switchLabel,
                activeLabel: styles.switchLabelActive,
              }}
            />
          </div>
        </div>
        <div className={styles.sessionsSubHeaderContainer__actions}>
          <Button
            buttonClassName={
              styles.sessionsSubHeaderContainer__actions__buttonCreateInfinipath
            }
            onClick={() => {
              navigate("/admin/infinipath/createinfinipath");
            }}
            datatestid="create-infinipath"
            datatestidText="create-infinipath-text"
          >
            create infinipath
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionsSubHeader;
