import React from "react";
import { Tooltip } from "@mui/material";
import styles from "./index.module.scss";
import search from "../../../../assets/images/search.svg";
import clearIcon from "../../../../assets/images/close-icon.svg";
import BuildingOffice from "../../../../assets/images/orgCount.svg";

import { SidebarItemState } from "../../../../types/seatApproval";
import { SortState } from "../../../../types/seatApproval"; 
import { ApprovalStatus, DROPDOWNFILTER_SIDEBARITEMS, DROPDOWNFILTERS, dropDownnJSON, textConstant } from "../../../../constants/textConstants";
import { updateNumberFormat } from "../../../../utils/commonFunctions";

interface ToolBarProps {
  selectedOption: {
    label: string;
    value: string | number;
    data: any;
  };
  isDropdownOpen: boolean;
  searchText: string;
  searchValue: { open: boolean; value: string };
  sessions: any[];
  kpis: any[];
  setIsDropdownUserList: (value: boolean) => void;
  setSelectedOption: (option: any) => void;
  setDropdownAllocatedSessionId: (id: any) => void;
  setIsDropdownOpen: (value: boolean) => void;
  loadUsers: (
    offset: number,
    reset: boolean,
    appliedfilters?: any,
    filterItem?: any,
  ) => void;
  setSelectedSidebarItem: (value: SidebarItemState) => void;
  handleDropdownSessionSelect: (session: any) => void;
  setIsSortDropdownOpen: (value: boolean) => void;
  setSortState: (value: SortState) => void;
}

export const PreferenceMobileScroll: React.FC<ToolBarProps> = ({
  selectedOption,
  sessions,
  setIsDropdownUserList,
  setSelectedOption,
  setDropdownAllocatedSessionId,
  loadUsers,
  setSelectedSidebarItem,
  handleDropdownSessionSelect,
  setIsSortDropdownOpen,
  setSortState,
  kpis,
}) => {
    const resetSort = () => {
    setSortState({ sortKey: "", sortOrder: "asc" }); 
    setIsSortDropdownOpen(false);
  }; 
function padCount(val: number, length: number = 2): string {
  return val.toString().padStart(length, "0");
}

// Assign swapDemands male and female counts to variables
const swapDemandMale = kpis?.swapDemands?.find((item: any) => item.kpiName === "male")?.count ?? 0;
const swapDemandFemale = kpis?.swapDemands?.find((item: any) => item.kpiName === "female")?.count ?? 0;

// Calculate pending counts
const registrationPendingsArray = Array.isArray(kpis?.registrationPendings) ? kpis?.registrationPendings : [];
const pendingMaleCount = registrationPendingsArray
  ?.filter((program: any) => program?.kpiName === "male")
  .reduce((sum: number, program: any) => sum + Number(program?.count || 0), 0);
const pendingFemaleCount = registrationPendingsArray
  ?.filter((program: any) => program?.kpiName === "female")
  .reduce((sum: number, program: any) => sum + Number(program?.count || 0), 0);

const kpiCounts = {
  all: {
    count: (kpis?.allKpis?.totalRegistrations ?? 0).toString().padStart(2, "0"),
  },
  cancelled: {
    count: (kpis?.cancelledKpis?.totalCancelledRegistrations ?? 0).toString().padStart(2, "0"),
  },
  pending: {
    count: padCount(pendingMaleCount + pendingFemaleCount),
  },
  blessed: {
    count: (kpis?.allocated?.totals?.blessedCount?.allocatedCount ?? 0).toString().padStart(2, "0"),
    org: (kpis?.allocated?.totals?.blessedCount?.organisationUserCount ?? 0).toString().padStart(2, "0"),
  },
  hold: {
    count: (kpis?.allocated?.totals?.rejectCount?.value ?? 0).toString().padStart(2, "0"),
  },
  // Assign swapDemands male and female counts to variables
  
  ytd: {
    count: padCount(swapDemandMale + swapDemandFemale),
  },
  unassigned: {
    count: (kpis?.unallocated?.totals?.totalUnallocatedCount?.value ?? 0).toString().padStart(2, "0"),
  },
  swapRequests: {
    count: (
      ((kpis?.swapRequests?.find((item: any) => item.kpiName === "male")?.count ?? 0) +
        (kpis?.swapRequests?.find((item: any) => item.kpiName === "female")?.count ?? 0))
    ).toString().padStart(2, "0"),
    
  },
  defaulters: {
    count: updateNumberFormat(kpis?.defaulters?.totalRegistrations) || textConstant.ZERO_TEXT,
  },
};
  const handleAllClick = () => {
    resetSort();
    setIsDropdownUserList(false);
    setSelectedOption({
      label: "All",
      value: "all",
      data: "",
    });
    setDropdownAllocatedSessionId(null);
    setSelectedSidebarItem({
      key: "total",
      kpiCategory: "all",
      kpiFilter: "all",
    });
    loadUsers(
      0,
      true,
      {},
      {
        kpiFilter: "all",
        approvalStatus: "all",
        sortKey: "",
        sortOrder: "asc",
      },
    );
  };

  const handleUnassignedClick = () => {
    resetSort();
    setIsDropdownUserList(false);
    setSelectedOption({
      label: "Unassigned",
      value: "registered",
      data: "",
    });
    setSelectedSidebarItem({
      key: "total_unallocated",
      kpiCategory: "unallocated",
      kpiFilter: "total_unallocated",
    });
    setDropdownAllocatedSessionId(null);
    loadUsers(
      0,
      true,
      {},
      {
        kpiFilter: "total_unallocated",
        approvalStatus: "unallocated",
        sortKey: "",
        sortOrder: "asc",
      },
    );
  };
  const handleBlessedClick = () => {
    resetSort();
    setIsDropdownUserList(false);
    setSelectedOption({
      label: "Blessed",
      value: "blessed",
      data: "",
    });
    setSelectedSidebarItem({
      key: "total_blessed",
      kpiCategory: "allocated",
      kpiFilter: "blessed",
    });
    setDropdownAllocatedSessionId(null);
    loadUsers(
      0,
      true,
      {},
      {
        kpiFilter: "blessed",
        approvalStatus: "allocated",
        sortKey: "",
        sortOrder: "asc",
      },
    );
  };

  const handleSessionClick = (session: any) => {
    resetSort();
    handleDropdownSessionSelect(session);
    setIsDropdownUserList(false);
    setSelectedOption({
      label: session.name,
      value: session.type,
      data: session,
    });
    setDropdownAllocatedSessionId(session.id);
    if (session.name === "Hold" || session.name === ApprovalStatus.YTD) {
      setSelectedSidebarItem({
        key: `${session.type}_total`,
        kpiCategory: session.kpiCategory,
        kpiFilter: session.kpiFilter,
      });
      setDropdownAllocatedSessionId(null);
    } else {
      setDropdownAllocatedSessionId(session.id);
      setSelectedSidebarItem({
        key: `${session.kpiFilter}_total`,
        kpiCategory: session.kpiCategory,
        kpiFilter: session.kpiFilter,
      });
    }
    loadUsers(
      0,
      true,
      {},
      {
        kpiFilter: session.kpiFilter,
        approvalStatus: session.kpiCategory,
      },
    );
  };

  const handleSwapRequestClick = () => {
    resetSort();
    handleDropdownSessionSelect("Swap Request");
    // setIsDropdownUserList(true);
    setSelectedOption({
      label: "Swap request",
      value: "swap requests",
      data: "",
    });
    setSelectedSidebarItem({
      key: "swap_total",
      kpiCategory: "all",
      kpiFilter: "swap-requests",
    });
    setDropdownAllocatedSessionId(null);
    setIsDropdownUserList(false);
    setSelectedSidebarItem({
      key: "swap_total",
      kpiCategory: "all",
      kpiFilter: "swap-requests",
    });
    loadUsers(
      0,
      true,
      {},
      {
        kpiFilter: "swap-requests",
        approvalStatus: "all",
        swapRequests: "wants_swap",
      },
    );
  };
  const handleCancelledRequestClick = () => {
    resetSort();
    handleDropdownSessionSelect("Cancelled");
    // setIsDropdownUserList(true);
    setSelectedOption({
      label: "Cancelled",
      value: "cancelled",
      data: "",
    });
    setSelectedSidebarItem({
      key: "cancelled_total",
      kpiCategory: "cancelled",
      kpiFilter: "cancelled",
    });
    setDropdownAllocatedSessionId(null);
    setIsDropdownUserList(false);
    setSelectedSidebarItem({
     key: "cancelled_total",
      kpiCategory: "cancelled",
      kpiFilter: "cancelled",
    });
    loadUsers(
      0,
      true,
      {},
      {
        kpiFilter: "cancelled",
        approvalStatus: "cancelled",
      },
    );
  };

   const handleDefaultersClick = () => {
    resetSort();
    handleDropdownSessionSelect(dropDownnJSON.DEFAULTERS.label);
    // setIsDropdownUserList(true);
    setSelectedOption({
      label: dropDownnJSON.DEFAULTERS.label,
      value: dropDownnJSON.DEFAULTERS.value,
      data: "",
    });
    setDropdownAllocatedSessionId(null);
    setIsDropdownUserList(false);
    setSelectedSidebarItem({
     key:  textConstant.DEFAULTERS_TOTAL,
      kpiCategory:textConstant.ALL ,
      kpiFilter: dropDownnJSON.DEFAULTERS.value,
    });
    loadUsers(
      0,
      true,
      {},
      {
        kpiFilter: dropDownnJSON.DEFAULTERS.value,
        approvalStatus: textConstant.ALL,
      },
    );
  };
  

  const handlePendingClick = () => {
    resetSort();
    setIsDropdownUserList(false);
    setSelectedOption({
      label: dropDownnJSON.PENDING.label,
      value: dropDownnJSON.PENDING.value,
      data: "",
    });
    setSelectedSidebarItem({
      key: DROPDOWNFILTER_SIDEBARITEMS.pending.total,
      kpiCategory: DROPDOWNFILTERS.pending.kpiCategory,
      kpiFilter: DROPDOWNFILTERS.pending.kpiFilter,
    });
    setDropdownAllocatedSessionId(null);
    loadUsers(
      0,
      true,
      {},
      {
        kpiFilter: DROPDOWNFILTERS.pending.kpiFilter,
        approvalStatus: DROPDOWNFILTERS.pending.kpiCategory,
        sortKey: "",
        sortOrder: "asc",
      },
    );
  };

  const isSelected = (value: string) => {
    return (
      selectedOption?.value === value ||
      selectedOption?.label?.toLowerCase() === value.toLowerCase()
    );
  };
  return (
    <div className={styles.toolbarContainer}>
      <div className={styles.horizontalScrollContainer}>
        <div className={styles.scrollableContent}>
          <div
            className={`${styles.horizontalItem} ${
              isSelected("all") ? styles.selectedItem : ""
            }`}
            onClick={handleAllClick}
          >
            <p>
              {kpiCounts.all.count}
            </p>
            <p>{dropDownnJSON.ALL.label}</p>
          </div>
          <div
            className={`${styles.horizontalItem} ${isSelected("registered") || isSelected("Unassigned") ? styles.selectedItem : ""}`}
            onClick={handleUnassignedClick}
          >
            <p>
              {kpiCounts.unassigned.count}
            </p>
            <p>{dropDownnJSON.UNASSIGNED.label}</p>
          </div>
          <div
            className={`${styles.horizontalItem} ${isSelected("blessed") ? styles.selectedItem : ""}`}
            onClick={handleBlessedClick}
          >
            <p>
              {kpiCounts.blessed.count}
              <span className={styles.orgCount} >
                <span className={styles.verticalLine} />
                <img src={BuildingOffice} alt="Building Office" className={styles.buildingOfficeIcon} />
                {kpiCounts.blessed.org}
              </span>
            </p>
            <p>{dropDownnJSON.BLESSED.label}</p>
          </div>
            {/* Render regular sessions first (not Hold or YTD) */}
            {sessions
              .filter(session => session.name !== ApprovalStatus.HOLD && session.name !== ApprovalStatus.YTD)
              .map((session) => {
            // Find the matching program by programId === session.id
            const matchedProgram = kpis?.allocated?.programs?.find(
              (program: any) => program.programId === session.id
            );
            const orgCount = matchedProgram?.organisationUserCount || 0;
            return (
              <div
                key={session.id}
                className={`${styles.horizontalItem} ${
                  isSelected(session.name) ? styles.selectedItem : ""
                }`}
                onClick={() => handleSessionClick(session)}
              >
                <p>
                  {`${(matchedProgram?.allocatedCount ?? 0).toString().padStart(2, "0")}`}
                  <span className={styles.orgCount}>
                    <span className={styles.verticalLine} />
                    <img src={BuildingOffice} alt="Building Office" className={styles.buildingOfficeIcon} />
                    {orgCount.toString().padStart(2, "0")}
                  </span>
                </p>
                <p>{`${session.name}`}</p>
              </div>
            );
          })}
          {/* Render Pending after regular sessions */}
          <div
            className={`${styles.horizontalItem} ${isSelected("pending") ? styles.selectedItem : ""}`}
            onClick={handlePendingClick}
          >
            <p>
              {kpiCounts.pending.count}
            </p>
            <p>{dropDownnJSON.PENDING.label}</p>
          </div>
          {/* Render Hold and YTD sessions */}
          {sessions
            .filter(session => session.name === ApprovalStatus.HOLD || session.name === ApprovalStatus.YTD)
            .map((session) => {
            return (
              <div
                key={session.id}
                className={`${styles.horizontalItem} ${
                  isSelected(session.name) ? styles.selectedItem : ""
                }`}
                onClick={() => handleSessionClick(session)}
              >
                {session.name === ApprovalStatus.HOLD
                  ? <>
                  <p>{kpiCounts.hold.count}
                  </p>
                  <p>{ApprovalStatus.HOLD}</p></>
                  : session.name === ApprovalStatus.YTD
                  ? <><p>{kpiCounts.ytd.count}
                  </p><p>{ApprovalStatus.YTD}</p></>
                  : ""}
              </div>
            );
          })}
          <div
          className={`${styles.horizontalItem} ${
            isSelected("swap requests") || isSelected("Swap") ? styles.selectedItem : ""
          }`}
          onClick={handleSwapRequestClick}
        >
      <p>
          {kpiCounts.swapRequests.count}
        </p>            
       <p>{dropDownnJSON.SWAP_REQUESTS.label}</p> 
          </div>
          <div
          className={`${styles.horizontalItem} ${
            isSelected("cancelled") ? styles.selectedItem : ""
          }`}
          onClick={handleCancelledRequestClick}
        >
           <p>
              {kpiCounts.cancelled.count}
           </p>            
           <p>{dropDownnJSON.CANCELLED.label}</p> 
          </div>
               <div
          className={`${styles.horizontalItem} ${
            isSelected(dropDownnJSON.DEFAULTERS.value) ? styles.selectedItem : ""
          }`}
          onClick={handleDefaultersClick}
        >
           <p>
              {kpiCounts.defaulters.count}
           </p>            
           <p>{dropDownnJSON.DEFAULTERS.label}</p> 
          </div>
        </div> 
      </div>
    </div>
  );
};
