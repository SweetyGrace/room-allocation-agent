import React from "react";
import TabSwitcher from "../TabSwitch";
import styles from "./index.module.scss";


interface TabContainerProps {
  tabs: string[];
  selectedTab: string;
  onChange: (tab: string) => void;
  containerClassName?: string;
  tabClassName?: string;
  activeTabClassName?: string;
}

const TabContainer: React.FC<TabContainerProps> = ({
  tabs,
  selectedTab,
  onChange,
}) => (
  <TabSwitcher
    tabs={tabs}
    selectedTab={selectedTab}
    containerClassName={styles.customTabContainer}
    tabClassName={styles.customTab}
    activeTabClassName={styles.customActiveTab}
    onChange={onChange}
  />
);

export default TabContainer;
