import { Box, Tab, Tabs, styled } from "@mui/material";
import styles from "./index.module.scss";
import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store";
import { setSelectedKpiTab } from "../../../reducers/ProgramReducer";
import { colorizeMahatriaInfinitheism } from "../ColorizeMahatriaInfinitheism";
import { setActiveTab } from "../../../reducers/ProgramReducer";
import BuildingOffice from "../../../assets/images/orgCount.svg";
import { getItemInLocalStorage } from "../../../services/localStorage"; 
import { formattingCount } from "../../../utils/commonFunctions";

type TabsComponentProps = {
  handleTabChange: (value: number, label: string) => void;
  tabsData: { count: number; status: string }[];
  activeTab?: number;
  className?: string;
  role: string;
  totalRecords?: number; // Optional prop for total records
  kpis?: unknown;
  organizationCounts?: { [key: string]: number }; 
};

const StyledTab = styled(Tabs)(() => ({
  ".MuiTabs-scroller": {
    height: "55px",
  },
  ".MuiTabs-flexContainer": {
    height: "55px",
    // paddingLeft: "17px",
    display: "flex",
    alignItems: "center",
    boxshadow:
      "inset -10px 0 10px -5px rgba(255, 255, 255, 0.5), inset 10px 0 10px -5px rgba(255, 255, 255, 0.5)",
  },
  ".MuiTabs-root": {
    minHeight: "55px !important",
    padding: "5px 5px",
  },
  "MuiButtonBase-root-MuiTab-root": {
    padding: "0",
  },
  ".Mui-disabled": {
    display: "none",
  },
  ".MuiTabs-scrollButtons": {
    border: "1.5px solid black",
    borderRadius: "50%",
    margin: "12px 14px 0px 14px",
    width: "35px",
    height: "30px",
  },
  ".css-ptiqhd-MuiSvgIcon-root ": {
    fontSize: "30px",
    fontWeight: "200",
  },
  ".MuiSvgIcon-root ": {
    fill: "black",
  },
  ".MuiTabs-indicator": {
    backgroundColor: "#1859B4",
    height: "3px",
    border: "unset",
  },

  ".MuiButtonBase-root": {
    textTransform: "none",
    height: "36px",
  },
  ".css-1h9z7r5-MuiButtonBase-root-MuiTab-root": {
    color: "#051B46",
    fontSize: "14px",
    fontStyle: " normal",
    fontWeight: "400",
  },
  ".css-1h9z7r5-MuiButtonBase-root-MuiTab-root.Mui-selected ": {
    color: "#051B46",
    fontSize: "14px",
    fontStyle: " normal",
    fontWeight: "600",
  },

  ".MuiTabScrollButton-horizontal": {},
}));

const AdminKpiData: React.FC<TabsComponentProps> = ({
  handleTabChange,
  className,
  // Not used: 19/01/2026 (used in commented code)
  // tabsData = [],
  // role,
  // totalRecords,
  // organizationCounts = {},
  kpis,

}) => {
  const [scrollLeft, setScrollLeft] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [scrollRight, setScrollRight] = useState(true);

  // Get user role from localStorage following the pattern from ProgramsDashboard
  const userRole = getItemInLocalStorage("seekerDetails")?.role || "";

  // Get selectedKpiOption from Redux
  const selectedKpiOption = useSelector(
    (state: RootState) => state.ProgramReducer.selectedKpiOption,
  );
  const dispatch = useDispatch();
  const selectedKpiTab = useSelector(
    (state: RootState) => state.ProgramReducer.selectedKpiTab,
  );
  const activeTab = useSelector(
    (state: RootState) => state?.ProgramReducer?.activeTab,
  );


  // const transformedKpiData =
  //   selectedKpiOption?.kpiOptions?.map((kpi) => ({
  //     count: 0,
  //     status: kpi.label,
  //     id: kpi.key,
  //     kpiFilter: kpi.kpiFilter,
  //     programType: kpi.programType,
  //     programSequence: kpi.programSequence,
  //   })) || [];

  // // Add total records at the beginning if available
  // if (totalRecords !== undefined) {
  //   transformedKpiData.unshift({
  //     count: totalRecords,
  //     status: "Registered",
  //     id: "registered",
  //     kpiFilter: "registered",
  //   });
  // }

  // Use defaultTabsData for admin role
  // const defaultTabsData = [
  //   { count: 0, status: KPI_TAB_STATUSES.TOTAL_REGISTRATIONS },
  //   { count: 0, status: KPI_TAB_STATUSES.VIDEO },
  //   { count: 0, status: KPI_TAB_STATUSES.NON_VIDEO },
  //   { count: 0, status: KPI_TAB_STATUSES.DOWNGRADED },
  //   { count: 0, status: KPI_TAB_STATUSES.BULK_REGISTRATIONS },
  // ];

  // Use transformed data or default based on role
  // const effectiveTabsData =
  //   role !== "mahatria"
  //     ? transformedKpiData
  //     : tabsData?.length
  //       ? tabsData
  //       : defaultTabsData;

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
      handleScroll();
      ref.addEventListener("scroll", handleScroll);
      return () => {
        ref.removeEventListener("scroll", handleScroll);
      };
    }
  }, [tabsRef]);

  return (
    <div
      className={className ? styles.className : styles.KPIContainer}
      data-testid="admin-kpi-data"
    >
      <Box
        sx={{
          maxWidth: { xs: "100%", sm: "100%", md: "100%", lg: "100%" },
          bgcolor: "background.paper",
          border: "1px solid #E7EEF3",
          padding: "0px",
          height: "55px",
          borderRadius: "8px",
        }}
      >
        <StyledTab
          className={`${scrollLeft ? styles.scrollLeft : ""} ${
            scrollRight ? styles.scrollRight : ""
          }`}
          variant="scrollable"
          ref={tabsRef}
          value={activeTab}
          onChange={(event, newValue) => {
            // if (typeof setActiveTab === "function") {
               dispatch(setActiveTab(newValue))
            // }


            if (newValue < kpis.length) {
              const selectedTabData = kpis[newValue];

              // Find the corresponding kpiOption
              const selectedTab = kpis?.find(
                (kpi) => kpi.label === selectedTabData.label,
              );
              const selectedTabWithIndex =
                kpis?.findIndex(
                  (kpi) => kpi.label === selectedTabData.label,
                );
               
              // Dispatch selected tab to Redux
              if (selectedTab) {
                dispatch(setSelectedKpiTab(selectedTab));
              }

              // Call the parent handler
              handleTabChange(
                selectedTabData.value,
                selectedTabData.label,
                selectedTabWithIndex,
              );
            }
          }}
        >
          {kpis?.map((item, index) => {
            const orgCount = item?.orgCount || 0;
            const canViewOrgCount = userRole === "admin" || userRole === "shoba" || userRole === "mahatria";
            const showOrgCount = canViewOrgCount && 
              (selectedKpiOption?.value === "all" || selectedKpiOption?.value === "blessed") &&
              (['Blessed', 'MSD 1', 'HDB 1', 'MSD 2', 'HDB 2', 'HDB 3'].includes(item?.label) ||
               ['blessed', 'msd1', 'hdb1', 'msd2', 'hdb2', 'hdb3'].includes(item?.value));

            return (
              <Tab
                key={index}
                data-testid={`tab-${index}`}
                selected={selectedKpiTab?.value === item?.value}
                label={
                  <span className={styles.kpiLabel}>
                    <span
                      className={styles.kpiCount}
                      data-testid={`kpi-count-${index}`}
                    >
                      {item?.count < 10 ? `0${item?.count}` : item?.count}
                      {showOrgCount && (
                        <span className={styles.orgCount}>
                          <span className={styles.verticalLine} />
                          <img src={BuildingOffice} alt="Building Office" className={styles.buildingOfficeIcon} />
                          {formattingCount(orgCount)}
                        </span>
                      )}
                    </span>
                    <span
                      className={`${styles.kpiName} ${styles.activeKpiName}`}
                      data-testid={`kpi-name-${index}`}
                    >
                      {/* {item?.label} */}
                       {colorizeMahatriaInfinitheism(item?.label)}
                    </span>
                      {/* <span
                    className={`${styles.kpiName} ${activeTab === index ? styles.activeKpiName : ""}`}
                    data-testid={`kpi-name-${index}`}
                  >
                    {colorizeMahatriaInfinitheism(item?.status)}
                  </span> */}
                  </span>
                }
              />
            );
          })}
        </StyledTab>
      </Box>
    </div>
  );
};

export default AdminKpiData;
