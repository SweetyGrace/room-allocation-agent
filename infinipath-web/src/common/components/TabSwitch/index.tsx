import React from "react";
import styles from "./index.module.scss";

interface TabSwitcherProps {
  tabs: string[];
  selectedTab: string;
  onChange: (tab: string) => void;
  containerClassName?: string;
  tabClassName?: string;
  activeTabClassName?: string;
}

const TabSwitcher: React.FC<TabSwitcherProps> = ({
  tabs,
  selectedTab,
  onChange,
  containerClassName,
  tabClassName,
  activeTabClassName,
}) => {
  return (
    <div className={containerClassName || styles.tabSwitchContainer}>
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`${tabClassName || styles.tab} ${
            selectedTab === tab ? activeTabClassName || styles.activeTab : ""
          }`}
          onClick={() => onChange(tab)}
        >
          {tab === "Seats" ? "Registrations" : tab}
        </button>
      ))}
    </div>
  );
};

export default TabSwitcher;
