import { Box, Tab, Tabs, styled } from "@mui/material";
import styles from "./index.module.scss";
import React, { useEffect, useRef, useState } from "react";
import { KPI_TAB_STATUSES } from "../../../constants";

type TabsComponentProps = {
  handleTabChange: (value: number, label: string) => void;
  tabsData: { count: number; status: string }[];
  activeTab?: number;
  setActiveTab?: (value: number) => void;
};

const StyledTab = styled(Tabs)(() => ({
  ".MuiTabs-scroller": {
    height: "59px",
  },
  ".MuiTabs-flexContainer": {
    gap: "8px",
    height: "59px",
    display: "flex",
    alignItems: "center",
    boxshadow:
      "inset -10px 0 10px -5px rgba(255, 255, 255, 0.5), inset 10px 0 10px -5px rgba(255, 255, 255, 0.5)",
  },
  ".MuiTabs-root": {
    minHeight: "60px !important",
    padding: "0px 14px",
  },
  ".Mui-disabled": {
    display: "none",
  },
  ".css-ptiqhd-MuiSvgIcon-root": {
    fontSize: "30px",
    fontWeight: "200",
  },
  ".MuiTabs-indicator": {
    backgroundColor: "#1859B4",
    height: "3px",
    border: "unset",
  },
  ".MuiButtonBase-root": {
    padding: "10px 16px",
    textTransform: "capitalize",
    height: "36px",
  },
  ".css-1h9z7r5-MuiButtonBase-root-MuiTab-root": {
    color: "#051B46",
    fontSize: "14px",
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: "24px",
  },
  ".css-1h9z7r5-MuiButtonBase-root-MuiTab-root.Mui-selected": {
    color: "#051B46",
    fontSize: "14px",
    fontStyle: "normal",
    fontWeight: "600",
    lineHeight: "24px",
  },
  ".MuiTabScrollButton-horizontal": {},
}));

const AdminKpiTabs: React.FC<TabsComponentProps> = ({
  handleTabChange,
  tabsData = [],
  // type,
  activeTab,
  setActiveTab = () => {},
}) => {
  const [scrollLeft, setScrollLeft] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [scrollRight, setScrollRight] = useState(true);
 

  const defaultTabsData = [
    { count: 0, status: KPI_TAB_STATUSES.TOTAL_REGISTRATIONS },
    { count: 0, status: KPI_TAB_STATUSES.VIDEO },
    { count: 0, status: KPI_TAB_STATUSES.NON_VIDEO },
    { count: 0, status: KPI_TAB_STATUSES.DOWNGRADED },
    { count: 0, status: KPI_TAB_STATUSES.BULK_REGISTRATIONS },
  ];
  const effectiveTabsData = tabsData?.length ? tabsData : defaultTabsData;
  
  const handleScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setScrollLeft(scrollLeft > 0);
      setScrollRight(scrollLeft + clientWidth < scrollWidth);
    }
  };

  useEffect(() => {
    const ref = tabsRef.current;
    if (ref) {
      handleScroll(); // Initial check
      ref.addEventListener("scroll", handleScroll);
      return () => {
        ref.removeEventListener("scroll", handleScroll);
      };
    }
  }, [tabsRef]);

  return (
    <div className={styles.KPIContainer} data-testid="admin-kpi-data">
      <Box
        sx={{
          maxWidth: { xs: "100%", sm: "100%", md: "100%", lg: "100%" },
          bgcolor: "background.paper",
          border: "1px solid #E7EEF3",
          padding: "0px",
          height: "60px",
          borderRadius: "8px",
        }}
      >
        <StyledTab
          className={`${scrollLeft ? styles.scrollLeft : ""} ${scrollRight ? styles.scrollRight : ""}`}
          variant="scrollable"
          ref={tabsRef}
          value={activeTab}
          onChange={(event, newValue) => {
            setActiveTab(newValue);
            if (newValue < effectiveTabsData.length) {
              const selectedTab = effectiveTabsData[newValue];
              // setKpiType(selectedTab.status);
              handleTabChange(selectedTab.count, selectedTab.status);
            }
          }}
        >
          {effectiveTabsData.map((item, index) => (
            <Tab
              key={index}
              data-testid={`tab-${index}`}
              label={
                <span>
                  <span
                    className={styles.kpiCount}
                    data-testid={`kpi-count-${index}`}
                  >
                    {item?.count}
                  </span>
                  <span
                    className={`${styles.kpiName}  ${index === activeTab ? styles.activeKpiName : ""}`}
                    data-testid={`kpi-name-${index}`}
                  >
                    {item?.status}
                  </span>
                </span>
              }
            />
          ))}
        </StyledTab>
      </Box>
    </div>
  );
};

export default AdminKpiTabs;
