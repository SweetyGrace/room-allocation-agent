import React, { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import searchIcon from "../../../assets/images/dashboard-search.svg";
import uploadIcon from "../../../assets/images/uploadd.png";
import filterIcon from "../../../assets/images/filter.svg";
import emailOpen from "../../../assets/images/emailOpen.svg";
import { Select, MenuItem, Tooltip } from "@mui/material";
import appliedFiltersIcon from "../../../assets/images/filterApplied.svg";
import { getItemInLocalStorage } from "../../../services/localStorage";
import { hasPermission, ROLES } from "../../../utils/roleBasedAccess";
import DownloadReport from "../../../components/DownloadReportPopup";
import { DOWNLOAD_OPTIONS, ID_PROOF_EXPORT } from "../../../constants";
import { COMMUNICATION_CATEGORY, TOOLTIP_TEXT, TEST_IDS, ALT_TEXT} from "../../../constants/textConstants";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import {
  setSelectViewList,
  setSearchValue,
  setSearchOpen,
  setSearch,
  clearAllFilters,
  clearSearch,
  resetPagination
} from '../../../reducers/ProgramReducer';
import {selectedKpiOptionArray, kpiStatusArray, viewVisibleScreens} from '../../../../src/utils/commonFunctions'
import { DashboardHeaderProps } from "../../../types/roomAllocation";
import clearIcon from "../../../assets/images/cross-bg.svg";


const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onSearch,
  setSearchPopup, 
  title,
  enableFilter,
  enableExport,
  onExport,
  appliedFilters,
  filterPills,
  onClick,
  onFilterClick,
  errors,
  totalDataLength,
  dashboardClassname,
  onSearchValueChange,
  activeTab = 0,
  onEmailClick,
  communicationCategory,
  setSelectedOption,
  selectedOptions,
  handleDownload,
  isDraftsPage,
  viewList,
  onBulkIdProofs,
  idProofDataAvailable = false,
}) => {
  const [debouncedValue, setDebouncedValue] = useState("");
  const [showDownloadReport, setShowDownloadReport] = useState(false);
  const [selectedMainFilter, setSelectedMainFilter] = useState("");

  const dispatch = useDispatch();

  // GET SEARCH STATE FROM REDUX
  const reduxSearchState = useSelector(
    (state: RootState) => state.ProgramReducer.search
  );
  
  // USE REDUX SEARCH STATE
  const searchValue = {
    value: reduxSearchState.value,
    open: reduxSearchState.open
  };

  const selectedKpiTab = useSelector(
    (state: RootState) => state.ProgramReducer.selectedKpiTab
  );
  const selectedKpiOption: string = useSelector(
    (state: RootState) => state.ProgramReducer.selectedKpiOption?.value
  );
  const activeTabValue = useSelector(
    (state: RootState) => state.ProgramReducer.activeTabKpiValue
  );
  const selectViewList = useSelector(
    (state: RootState) => state.ProgramReducer.selectViewList
  );

  const handleSetSelectedViewList = (view: any) => {
    dispatch(setSelectViewList(view));
  };
  const currentActiveTab = localStorage.getItem("hdb_active_tab") || ""
  const userRole = getItemInLocalStorage("seekerDetails")?.role || "";
  const hasSeatPermission = hasPermission(userRole, "seat-allocations-tab", "R");
  const hasAppliedFilters =
    appliedFilters && Object.keys(appliedFilters).length > 0;

  const viewVisibility = viewVisibleScreens.includes(currentActiveTab)
  useEffect(() => {
    if (searchValue.value && searchValue.value.trim() !== "") {
      onSearch(searchValue.value.trim());
    } 
  }, [activeTab]);
  
  const prevSelectedKpiOption = useRef(selectedKpiOption);
const prevActiveTabValue = useRef(activeTabValue);

useEffect(() => {
  const kpiChanged = prevSelectedKpiOption.current !== selectedKpiOption;
  const tabChanged = prevActiveTabValue.current !== activeTabValue;
  
  if ((kpiChanged || tabChanged) && viewList && viewList.length > 0) {
    dispatch(clearAllFilters());
    dispatch(resetPagination())
    dispatch(clearSearch())
    const registrationsView = viewList.find((v) => v.value === 'registrations');
    if (registrationsView) {
      handleSetSelectedViewList(registrationsView);
    }
    
    // Update refs
    prevSelectedKpiOption.current = selectedKpiOption;
    prevActiveTabValue.current = activeTabValue;
  }
}, [selectedKpiOption, activeTabValue]);

  return (
    <div
      className={`${styles.dashboardHeader} ${dashboardClassname || ""}`}
      data-testid="dashboard-header"
    >
      <div className={styles.heading}>
        {filterPills}
        {totalDataLength !== undefined && (
          <span className={styles.totalRecords}>
            {totalDataLength} Seekers found
          </span>
        )}
        {errors !== undefined &&
          totalDataLength !== undefined &&
          errors > 0 &&
          errors < totalDataLength && (
            <div className={styles.errorMsg}>
              &nbsp;&nbsp;({errors} invalid rows found in the file. only valid
              rows will be uploaded)
            </div>
          )}
        {errors !== undefined &&
          totalDataLength !== undefined &&
          errors > 0 &&
          errors === totalDataLength && (
            <div className={styles.errorMsg}>
              &nbsp;&nbsp;(All rows are invalid, can&apos;t upload the file)
            </div>
          )}
      </div>

      <div className={styles.iconsBlock} data-testid="icons-block">
         { viewVisibility &&  (selectedKpiOptionArray.includes(selectedKpiOption) ||
          (selectedKpiOption === "all" &&
            kpiStatusArray.includes(activeTabValue)) ||
          (selectedKpiOption === "blessed" &&
            activeTabValue !== "swapRequests")) && (
          viewList && viewList.length === 1 ? (
            // Single item — no dropdown needed, just show the label
            <span>
              <span className={styles.view}>View:</span>{" "}
              <span className={styles.tableData}>
                {viewList[0].label.charAt(0).toUpperCase() + viewList[0].label.slice(1)}
              </span>
            </span>
          ) : (
          <Select
            value={selectViewList?.value || ""}
            onChange={(e) => {
              // Find the selected view object and set it
              const selectedView = viewList?.find(
                (view) => view.key === e.target.value,
              );
              if (selectedView) {
                handleSetSelectedViewList(selectedView);
              }
            }}
            displayEmpty
            className={styles.select}
            variant="standard"
            disableUnderline
            sx={{
              "& .MuiInput-underline:before, & .MuiInput-underline:after": {
                borderBottom: "none !important",
              },
              "& .MuiSelect-root": {
                width: "154px !important",
              },
              "& .MuiInputBase-root": {
                border: "none !important",
                boxShadow: "none !important",
              },
              "& .MuiSelect-select": {
                color: "#1976d2",
              },
              background: "transparent",
            }}
            inputProps={{ "aria-label": "Select View" }}
            renderValue={(selected) => {
              let label = "Registrations";
              if (selectViewList && selectViewList.label) {
                label =
                  selectViewList.label.charAt(0).toUpperCase() +
                  selectViewList.label.slice(1);
              } else {
                const selectedViewItem = viewList?.find(
                  (view) => view.value === selected,
                );
                if (selectedViewItem) {
                  label =
                    selectedViewItem.label.charAt(0).toUpperCase() +
                    selectedViewItem.label.slice(1);
                }
              }
              return (
                <span>
                  <span className={styles.view}>View:</span>{" "}
                  <span className={styles.tableData}>{label}</span>
                </span>
              );
            }}
          >
            {viewList?.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </MenuItem>
            ))}
          </Select>
          )
        )}
        {enableExport && !isDraftsPage && (
          <Select
            onChange={(e) => {
              setSelectedOption &&
                setSelectedOption(e.target.value as "filtered" | "all");
            }}
            displayEmpty
            className={styles.select}
            variant="standard"
            disableUnderline
            sx={{
              "& .MuiInput-underline:before, & .MuiInput-underline:after": {
                borderBottom: "none !important",
              },
              "& .MuiSelect-root": {
                width: "154px !important",
              },
              "& .MuiInputBase-root": {
                border: "none !important",
                boxShadow: "none !important",
              },
              "& .MuiSelect-select": {
                color: "#1976d2",
              },
              background: "transparent",
            }}
            inputProps={{ "aria-label": "Select Category" }}
            renderValue={(selected) => "download"}
          >
            {DOWNLOAD_OPTIONS.options
              .filter((option) => {
                if (option.value === ID_PROOF_EXPORT.ID_PROOFS) {
                  // Hide if no data available or user lacks permission
                  return idProofDataAvailable && hasPermission(userRole, ID_PROOF_EXPORT.BULK_ID_PROOFS, "R");
                }
                return true;
              })
              .map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  onClick={() => {
                    if (option.value === ID_PROOF_EXPORT.ID_PROOFS) {
                      // Trigger bulk ID proofs modal
                      onBulkIdProofs && onBulkIdProofs();
                    } else {
                      // Trigger regular download report
                      setShowDownloadReport(true);
                      setSelectedMainFilter(option.value);
                    }
                  }}
                >
                  {option.label}
                </MenuItem>
              ))}
          </Select>
        )}
        {enableExport && isDraftsPage && (
          <span
            className={styles.downloadReportText}
            style={{ cursor: "pointer" }}
            onClick={() => {
              handleDownload && handleDownload("Drafts Report", "all");
            }}
          >
            download report
          </span>
        )}
        {searchValue.open && (
          <div className={styles.search} data-testid="search-container">
            <input
              type="text"
              className={styles.searchInput}
              autoFocus
              value={searchValue.value}
              placeholder="Search seeker with name or mobile number"
              onChange={(e) => {
                // DISPATCH TO REDUX
                dispatch(setSearchValue(e.target.value));
                onSearchValueChange(e.target.value);
                
                if (e.target.value === "") {
                  onSearch("");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSearch(searchValue.value.trim());
                  if (searchValue.value.trim() === "") {
                    setTimeout(() => {
                      // DISPATCH TO REDUX
                      dispatch(setSearch({ value: "", open: false }));
                    }, 500);
                  }
                }
              }}
              data-testid="search-input"
            />
            {searchValue.value && (
              <img
                src={clearIcon}
                alt="Clear"
                className={styles.clearIcon}
                onClick={() => {
                  dispatch(setSearchValue(""));
                  onSearchValueChange("");
                  onSearch("");
                }}
              />
            )}
          </div>
        )}
        <Tooltip title="Search" arrow>
          <button className={styles.filter} data-testid="search-button">
            <img
              src={searchIcon}
              alt="search"
              data-testid="search-icon"
              onClick={() => {
                // DISPATCH TO REDUX
                dispatch(setSearch({
                  value: searchValue.value,
                  open: !searchValue.open
                }));
              }}
            />
          </button>
        </Tooltip>
        {errors !== undefined &&
          totalDataLength !== undefined &&
          errors < totalDataLength && (
            <Tooltip title="upload" arrow>
              <button className={styles.filter} data-testid="search-button">
                <img
                  src={uploadIcon}
                  alt="upload"
                  className={styles.uploadIcon}
                  data-testid="search-icon"
                  onClick={() => onClick && onClick()}
                />
              </button>
            </Tooltip>
          )}

        {enableFilter && (
          <Tooltip title="Filter" arrow>
            <button className={styles.filter} onClick={onFilterClick}>
              <img
                src={hasAppliedFilters ? appliedFiltersIcon : filterIcon}
                alt="filter icon"
                data-testid="filter-icon"
              />
            </button>
          </Tooltip>
        )}
        {communicationCategory === COMMUNICATION_CATEGORY.HDB_BLESSED && (userRole === ROLES.ADMIN || userRole === ROLES.SHOBA) && (
          <Tooltip title={TOOLTIP_TEXT.EMAIL} arrow>
            <button
              className={styles.filter}
              data-testid={TEST_IDS.EXPORT_BUTTON}
              onClick={onEmailClick}
            >
              <img
                src={emailOpen}
                alt={ALT_TEXT.EMAIL}
                className={styles.emailIcon}
                data-testid={TEST_IDS.EMAIL_ICON}
              />
            </button>
          </Tooltip>
        )}
      </div>
      {showDownloadReport && (
        <DownloadReport
          open={showDownloadReport}
          onClose={() => setShowDownloadReport(false)}
          valueSelected={selectedMainFilter}
          onContinue={(reportName: string, selectedReport?: string) => {
            handleDownload && handleDownload(reportName, selectedReport);
            setShowDownloadReport(false);
          }}
          totalRecords={totalDataLength}
        />
      )}
    </div>
  );
};

export default DashboardHeader;