import React from "react";
import { Tabs, Tab } from "@mui/material";

interface TabsComponentProps {
  tabs: { label: string; count?: number }[];
  selectedTab: string;
  onChange: (tab: string) => void;
}

const TabsComponent: React.FC<TabsComponentProps> = ({ tabs, selectedTab, onChange }) => {
  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    onChange(newValue);
  };

  return (
    <Tabs 
      value={selectedTab} 
      onChange={handleChange} 
      variant="scrollable" 
      scrollButtons="auto" 
      sx={{
      "& .MuiTabs-indicator": {
      height: "4px",
      backgroundColor: "#1859B4",
      },
      }}
    >
      {tabs.map((tab) => (
      <Tab 
      key={tab.label} 
      value={tab.label}
      sx={{
      fontFamily: "NotoSans-Regular",
      fontWeight: 400,
      fontSize: "14px",
      textTransform: 'capitalize',
      "&.Mui-selected": {
        color: "#051B46",
      },
      }}
      label={
      <span>
        {tab.count !== undefined && (
        <span style={{ fontSize: "18px", fontWeight: 400 }}>
        {tab.count < 10 ? `0${tab.count}` : tab.count} 
        </span>
        )}
        <span style={{ fontSize: "14px",marginLeft:"6px" }}>{tab.label}</span>
      </span>
      }
      />
      ))}
    </Tabs>
  );
};

export default TabsComponent;
