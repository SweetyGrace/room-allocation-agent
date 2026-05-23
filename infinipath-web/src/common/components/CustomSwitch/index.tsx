import React from "react";
import { Switch } from "@mui/material";
import styles from "./index.module.scss";

interface CommonSwitchProps {
  tabs: string[]; // Example: ["Upcoming", "Completed"]
  selectedTab: string;
  onChange: (tab: string) => void;
  customStyles?: {
    container?: string;
    label?: string;
    activeLabel?: string;
    switch?: string;
  };
}

const CommonSwitch: React.FC<CommonSwitchProps> = ({ tabs, selectedTab, onChange, customStyles }) => {
  if (tabs.length !== 2) {
    console.error("CommonSwitch only supports exactly 2 tabs for now.");
    return null;
  }

  const isChecked = selectedTab === tabs[1];

  return (
    <div className={`${styles.switchContainer} ${customStyles?.container || ""}`}>
      <span
        className={`${styles.label} ${customStyles?.label || ""} ${
          !isChecked ? styles.activeLabel : ""
        } ${!isChecked ? customStyles?.activeLabel || "" : ""}`}
        onClick={() => onChange(tabs[0])}
      >
        {tabs[0]}
      </span>

      <Switch
        checked={isChecked}
        onChange={(e) => onChange(e.target.checked ? tabs[1] : tabs[0])}
        className={`${styles.switch} ${customStyles?.switch || ""}`}
        sx={{
            "& .MuiSwitch-thumb":{
                backgroundColor: "white",
                width: '16px',
                height: '16px',
                marginLeft: '4px',
                marginTop: '4px',
            },
            "& .MuiSwitch-track":{
                height: '18px',
                backgroundColor: "#2F73F1 !important",
                opacity: 1,
                borderRadius: '9px',
            },
        }}
      />

      <span
        className={`${styles.label} ${customStyles?.label || ""} ${
          isChecked ? styles.activeLabel : ""
        } ${isChecked ? customStyles?.activeLabel || "" : ""}`}
        onClick={() => onChange(tabs[1])}
      >
        {tabs[1]}
      </span>
    </div>
  );
};

export default CommonSwitch;
