import React, { useState, useEffect } from "react";
import { Tooltip } from "@mui/material";
import styles from "./index.module.scss";
import search from "../../../assets/images/search.svg";
import clearIcon from "../../../assets/images/cross-bg.svg";
import opendropdown from "../../../assets/images/opendropdown.svg";
import closedropdown from "../../../assets/images/closedropdown.svg";
import filter from "../../../assets/images/filter.svg";
import appliedFilter from "../../../assets/images/filterApplied.svg";
import { forwardRef } from "react";
import { SidebarItemState, ToolBarProps } from "../../../types/seatApproval";
import sortIcon from "../../../assets/images/sort-icon.svg";
import arrowUp from "../../../assets/images/arrow-up.svg";
import arrowDown from "../../../assets/images/down-arrow.svg";
import appliedSort from "../../../assets/images/applied-sort.svg";
import descendingSortIcon from "../../../assets/images/ascending-sort.svg";
import ascendingSortIcon from "../../../assets/images/descending-sort.svg";
import arrowDescendingIcon from "../../../assets/images/arrows-ascending-up.svg";
import arrowAscendingIcon from "../../../assets/images/arrows-descending-up.svg";
import { colorizeMahatriaInfinitheism } from "../ColorizeMahatriaInfinitheism";
import { ApprovalStatus, DROPDOWNFILTER_SIDEBARITEMS, DROPDOWNFILTERS, dropDownnJSON, sortOptions, textConstant } from "../../../constants/textConstants";

const PreferenceDropDown = forwardRef<HTMLDivElement, ToolBarProps>(
  (
    {
      selectedOption,
      isDropdownOpen,
      searchText,
      searchValue,
      sessions,
      setIsDropdownUserList,
      setSelectedOption,
      setDropdownAllocatedSessionId,
      setIsDropdownOpen,
      loadUsers,
      setSelectedSidebarItem,
      handleDropdownSessionSelect,
      setSearchText,
      setFinalSearchText,
      handleSearch,
      setSearchValue,
      setPaginationProps,
      isOpenFilter,
      setIsOpenFilter,
      isFilterApplied = false,
      setAppliedFilters,
      handleSort,
      setFilterItem,
      sortState,
      isSortDropdownOpen,
      setIsSortDropdownOpen,
    },
    ref,
  ) => {
    useEffect(() => {
      if (!isSortDropdownOpen) return;
      const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setIsSortDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [isSortDropdownOpen]);

    const getArrowDirection = (optionValue: string) => {
      if (sortState.sortKey === optionValue) {
        // If this option is currently selected, use current sort order
        return sortState.sortOrder === "desc" ? arrowDown : arrowUp;
      } else {
        // If not selected, show the initial direction for each option
        return optionValue === "registrationDate" ? arrowDown : arrowUp;
      }
    };

    return (
      <div
        className={styles.toolbarContainer}
        ref={ref}
        onClick={() => {
          if (isDropdownOpen) setIsDropdownOpen(false);
          if (isSortDropdownOpen) setIsSortDropdownOpen(false);
        }}
      >
        <div
          className={styles.statusSelector}
          onClick={(e) => {
            e.stopPropagation();
            // Close sort dropdown when opening KPI dropdown
            if (isSortDropdownOpen) {
              setIsSortDropdownOpen(false);
            }
            setIsDropdownOpen((prev: boolean) => !prev);
          }}
        >
          <span className={styles.toolbar}>
            {colorizeMahatriaInfinitheism(selectedOption?.label || "Select")}{" "}
          </span>
          <span className={styles.dropdownArrow}>
            <img
              src={isDropdownOpen ? opendropdown : closedropdown}
              alt="dropdown"
            />
          </span>
          {isDropdownOpen && (
            <div
              className={styles.dropdownMenu}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`${styles.dropdownItem} ${selectedOption?.value === "all" ? styles.selected : ""}`}
                onClick={() => {
                  handleSort(false);
                  setPaginationProps((prev) => ({
                    ...prev,
                    currentPage: 1,
                  }));
                  setIsDropdownUserList(false);
                  setSelectedOption({
                    label: "All",
                    value: "all",
                    data: "",
                  });
                  setDropdownAllocatedSessionId(null);
                  setIsDropdownOpen(false);
                  setAppliedFilters({});
                  setSelectedSidebarItem({
                    key: "total",
                    kpiCategory: "all",
                    kpiFilter: "all",
                  });
                  setSearchText("");
                  setFinalSearchText("");
                  setSearchValue({ value: "", open: false });
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
                  setFilterItem({
                    kpiFilter: "all",
                    approvalStatus: "all",
                  });
                }}
              >
                All
              </div>
              <div
                className={`${styles.dropdownItem} ${
                  selectedOption?.label === "Unassigned" ||
                  selectedOption?.value === "registered"
                    ? styles.selected
                    : ""
                }`}
                onClick={() => {
                  handleSort(false);
                  setIsDropdownUserList(false);
                  setSelectedOption({
                    label: "Unassigned",
                    value: "registered",
                    data: "",
                  });
                  setPaginationProps((prev) => ({
                    ...prev,
                    currentPage: 1,
                  }));
                  setAppliedFilters({});
                  setSelectedSidebarItem({
                    key: "total_unallocated",
                    kpiCategory: "unallocated",
                    kpiFilter: "total_unallocated",
                  });
                  setDropdownAllocatedSessionId(null);
                  setIsDropdownOpen(false);
                  setSearchText("");
                  setSearchValue({ value: "", open: false });
                  setFinalSearchText("");
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
                  setFilterItem("total_unallocated");
                }}
              >
                Unassigned
              </div>
              <div
                className={`${styles.dropdownItem} ${
                  selectedOption?.label === "Blessed" ||
                  selectedOption?.value === "blessed"
                    ? styles.selected
                    : ""
                }`}
                onClick={() => {
                  handleSort(false);
                  setIsDropdownUserList(false);
                  setSelectedOption({
                    label: "Blessed",
                    value: "blessed",
                    data: "",
                  });
                  setPaginationProps((prev) => ({
                    ...prev,
                    currentPage: 1,
                  }));
                  setAppliedFilters({});
                  setSelectedSidebarItem({
                    key: "total_blessed",
                    kpiCategory: "allocated",
                    kpiFilter: "blessed",
                  });
                  setDropdownAllocatedSessionId(null);
                  setIsDropdownOpen(false);
                  setSearchText("");
                  setSearchValue({ value: "", open: false });
                  setFinalSearchText("");
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
                  setFilterItem("total_blessed");
                }}
              >
               Blessed
              </div>
              {sessions
              .filter((session) => session.name !== "Hold" && session.name !== ApprovalStatus.YTD)
              .map((session) => (
                <div
                  key={session.id}
                  className={`${styles.dropdownItem} ${styles.sessionWithSpacing} ${
                    (selectedOption?.value === session.type &&
                      selectedOption?.data?.id === session.id) ||
                    selectedOption?.label === session.name
                      ? styles.selected
                      : ""
                  }`}
                  onClick={() => {
                    handleSort(false);
                      setDropdownAllocatedSessionId(session.id);
                      setSelectedSidebarItem({
                        key: `${session.kpiFilter}_total`,
                        kpiCategory: session.kpiCategory,
                        kpiFilter: session.kpiFilter,
                      });
                    setSearchText("");
                    setFinalSearchText("");
                    setSearchValue({ value: "", open: false });
                    loadUsers(
                      0,
                      true,
                      {},
                      {
                        kpiFilter: session.kpiFilter,
                        approvalStatus: session.kpiCategory,
                        sortKey: "",
                        sortOrder: "asc",
                      },
                    );
                    setFilterItem({
                      kpiFilter: session.kpiFilter,
                      approvalStatus: session.kpiCategory,
                    });
                    setPaginationProps((prev) => ({
                      ...prev,
                      currentPage: 1,
                    }));
                    setIsDropdownUserList(false);
                    setAppliedFilters({});
                    setSelectedOption({
                      label: session.name,
                      value: session.type,
                      data: session,
                    });

                    setIsDropdownOpen(false);
                  }}
                >
                  <span className={styles.spaceLeft}>
                    {colorizeMahatriaInfinitheism(session.name)}
                  </span>
                </div>
              ))}
                <div
                className={`${styles.dropdownItem} ${
                  selectedOption?.label === dropDownnJSON.PENDING.label ||
                  selectedOption?.value === dropDownnJSON.PENDING.value
                    ? styles.selected
                    : ""
                }`}
                onClick={() => {
                  handleSort(false);
                  setIsDropdownUserList(false);
                  setSelectedOption({
                    label: dropDownnJSON.PENDING.label,
                    value: dropDownnJSON.PENDING.value,
                    data: "",
                  });
                  setPaginationProps((prev) => ({
                    ...prev,
                    currentPage: 1,
                  }));
                  setAppliedFilters({});
                  setSelectedSidebarItem({
                    key: DROPDOWNFILTER_SIDEBARITEMS.pending.total,
                    kpiCategory: DROPDOWNFILTERS.pending.kpiCategory,
                    kpiFilter: DROPDOWNFILTERS.pending.kpiFilter,
                  });
                  setDropdownAllocatedSessionId(null);
                  setIsDropdownOpen(false);
                  setSearchText("");
                  setSearchValue({ value: "", open: false });
                  setFinalSearchText("");
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
                  setFilterItem(DROPDOWNFILTER_SIDEBARITEMS.pending.total);
                }}
              >
                {dropDownnJSON.PENDING.label}
              </div>
              {sessions
                .filter((session) => session.name === "Hold" || session.name === ApprovalStatus.YTD)
                .map((session) => (
                  <div
                    key={session.id}
                    className={`${styles.dropdownItem} ${styles.sessionWithSpacing} ${
                      (selectedOption?.value === session.type &&
                        selectedOption?.data?.id === session.id) ||
                      selectedOption?.label === session.name
                        ? styles.selected
                        : ""
                    }`}
                    onClick={() => {
                      handleSort(false);
                      setSelectedSidebarItem({
                        key: `${session.type}_total`,
                        kpiCategory: session.kpiCategory,
                        kpiFilter: session.kpiFilter,
                      });
                      setDropdownAllocatedSessionId(null);
                      setSearchText("");
                      setFinalSearchText("");
                      setSearchValue({ value: "", open: false });
                      loadUsers(
                        0,
                        true,
                        {},
                        {
                          kpiFilter: session.kpiFilter,
                          approvalStatus: session.kpiCategory,
                          sortKey: "",
                          sortOrder: "asc",
                        },
                      );
                      setFilterItem({
                        kpiFilter: session.kpiFilter,
                        approvalStatus: session.kpiCategory,
                      });
                      setPaginationProps((prev) => ({
                        ...prev,
                        currentPage: 1,
                      }));
                      setIsDropdownUserList(false);
                      setAppliedFilters({});
                      setSelectedOption({
                        label: session.name,
                        value: session.type,
                        data: session,
                      });

                      setIsDropdownOpen(false);
                    }}
                  >
                    <span className={styles.spaceLeft}>
                      {colorizeMahatriaInfinitheism(session.name)}
                    </span>
                  </div>
                ))}
              <div className={styles.dropdownDivider} />
              <div
                className={`${styles.dropdownItem} ${
                  selectedOption?.label === "Swap request" ||
                  selectedOption?.value === "swap requests"
                    ? styles.selected
                    : ""
                }`}
                onClick={() => {
                  handleSort(false);
                  setSelectedSidebarItem({
                    key: "swap_total",
                    kpiCategory: "all",
                    kpiFilter: "swap-requests",
                  });
                  setPaginationProps((prev) => ({
                    ...prev,
                    currentPage: 1,
                  }));
                  setDropdownAllocatedSessionId(null);
                  setIsDropdownOpen(false);
                  setIsDropdownUserList(false);
                  setSelectedOption({
                    label: "Swap request",
                    value: "swap requests",
                    data: "",
                  });
                  setSearchText("");
                  setFinalSearchText("");
                  setSearchValue({ value: "", open: false });
                  loadUsers(
                    0,
                    true,
                    {},
                    {
                      kpiFilter: "swap-requests",
                      approvalStatus: "all",
                      swapRequests: "wants_swap",
                      sortKey: "",
                      sortOrder: "asc",
                    },
                  );
                  setFilterItem({
                    kpiFilter: "swap-requests",
                    approvalStatus: "all",
                    swapRequests: "wants_swap",
                  });
                }}
              >
                Swap request
              </div>
              <div
                className={`${styles.dropdownItem} ${
                  selectedOption?.label === dropDownnJSON.CANCELLED.label ||
                  selectedOption?.value === dropDownnJSON.CANCELLED.value
                    ? styles.selected
                    : ""
                }`}
                onClick={() => {
                  handleSort(false);
                  setSelectedSidebarItem({
                    key: "cancelled_total",
                    kpiCategory: dropDownnJSON.CANCELLED.value,
                    kpiFilter: dropDownnJSON.CANCELLED.value,
                  });
                  setPaginationProps((prev) => ({
                    ...prev,
                    currentPage: 1,
                  }));
                  setDropdownAllocatedSessionId(null);
                  setIsDropdownOpen(false);
                  setIsDropdownUserList(false);
                  setSelectedOption({
                    label:  dropDownnJSON.CANCELLED.label,
                    value: dropDownnJSON.CANCELLED.value,
                    data: "",
                  });
                  setSearchText("");
                  setFinalSearchText("");
                  setSearchValue({ value: "", open: false });
                  loadUsers(
                    0,
                    true,
                    {},
                    {
                      kpiFilter:dropDownnJSON.CANCELLED.value,
                      approvalStatus: dropDownnJSON.CANCELLED.value,
                    },
                  );
                  setFilterItem({
                    kpiFilter: dropDownnJSON.CANCELLED.value,
                    approvalStatus: dropDownnJSON.CANCELLED.value,
                  });
                }}
              >
             { dropDownnJSON.CANCELLED.label}
              </div>
                  <div
                className={`${styles.dropdownItem} ${
                  selectedOption?.label === dropDownnJSON.DEFAULTERS.label ||
                  selectedOption?.value === dropDownnJSON.DEFAULTERS.value
                    ? styles.selected
                    : ""
                }`}
                onClick={() => {
                  handleSort(false);
                  setSelectedSidebarItem({
                    key: textConstant.DEFAULTERS_TOTAL,
                    kpiCategory:  textConstant.ALL,
                    kpiFilter: textConstant.DEFAULTER,
                  });
                  setPaginationProps((prev) => ({
                    ...prev,
                    currentPage: 1,
                  }));
                  setDropdownAllocatedSessionId(null);
                  setIsDropdownOpen(false);
                  setIsDropdownUserList(false);
                  setSelectedOption({
                    label:  dropDownnJSON.DEFAULTERS.label,
                    value: dropDownnJSON.DEFAULTERS.value,
                    data: "",
                  });
                  setSearchText("");
                  setFinalSearchText("");
                  setSearchValue({ value: "", open: false });
                  loadUsers(
                    0,
                    true,
                    {},
                    {
                      kpiFilter: textConstant.DEFAULTER,
                      approvalStatus: textConstant.ALL,
                    },
                  );
                  setFilterItem({
                    kpiFilter: dropDownnJSON.DEFAULTERS.value,
                    approvalStatus: dropDownnJSON.DEFAULTERS.value,
                  });
                }}
              >
             { dropDownnJSON.DEFAULTERS.label}
              </div>
            </div>
          )}
        </div>
        <div className={styles.searchContainer}>
          {searchValue.open && (
            <div className={styles.search} data-testid="search-container">
              <input
                type="text"
                className={
                  searchText ? styles.searchInputWithText : styles.searchInput
                }
                autoFocus
                value={searchText}
                placeholder="Search seeker with name or mobile number"
                onChange={(e) => {
                  setSearchText(e.target.value);
                  if (e.target.value === "") {
                    handleSearch("");
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(e.currentTarget.value);
                    setPaginationProps((prev: any) => ({
                      ...prev,
                      currentPage: 1,
                    }));
                  }
                }}
                data-testid="search-input"
              />
              {searchText && (
                  <img src={clearIcon} 
                   className={styles.clearIcon}
                  onClick={() => {
                    setSearchText("");
                    setFinalSearchText("");
                    setPaginationProps((prev: any) => ({
                      ...prev,
                      currentPage: 1,
                    }));
                  }}
                  alt="clear" data-testid="clear-icon" />
              )}
            </div>
          )}
          <Tooltip title="Search" arrow>
            <button className={styles.searchIcon} data-testid="search-button">
              <img
                src={search}
                alt="search"
                data-testid="search-icon"
                onClick={() =>
                  setSearchValue({ value: "", open: !searchValue.open })
                }
              />
            </button>
          </Tooltip>
          <Tooltip title="Filter" arrow>
            <img
              src={isFilterApplied ? appliedFilter : filter}
              alt="toggle dropdown"
              className={styles.filterIcon}
              onClick={() => {
                setIsOpenFilter(!isOpenFilter);
              }}
            />
          </Tooltip>

          <div
            className={styles.sortContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title="Sort" arrow>
              <>
                <img
                  src={
                    sortState.sortKey
                      ? sortState.sortOrder === textConstant.LOWER_CASE_ASC
                        ? arrowAscendingIcon
                        : arrowDescendingIcon
                      : sortIcon
                  }
                  alt={
                    sortState.sortKey
                      ? sortState.sortOrder === textConstant.LOWER_CASE_ASC
                        ? textConstant.COMPLETE_ASC
                        : textConstant.COMPLETE_DESC
                      : textConstant.SORT
                  }
                  className={styles.filterIcon}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Close KPI dropdown when opening sort dropdown
                    if (isDropdownOpen) {
                      setIsDropdownOpen(false);
                    }
                    setIsSortDropdownOpen((prev) => !prev);
                  }}
                />
              </>
            </Tooltip>
            {isSortDropdownOpen && (
  <div className={styles.dropdownMenu}>
    {sortOptions
      .filter((option) => {
        // Show "Status" option only when "Blessed" is selected
        if (option.label === "Status") {
          return selectedOption?.label === dropDownnJSON.BLESSED.label;
        } 
        if (option.value === textConstant.CANCELLATION_DATE_KEY) {
          return selectedOption?.label === dropDownnJSON.CANCELLED.label;
        } else if (option.value === textConstant.SWAP_REQUEST_DATE_KEY) {
          return selectedOption?.label === textConstant.SWAP_REQUEST_LABEL;
        } else if (option.value === textConstant.REGISTRATION_DATE_KEY) {
          return selectedOption?.label === dropDownnJSON.UNASSIGNED.label || selectedOption?.label === dropDownnJSON.ALL.label;
        } else if (option.value === textConstant.HOLD_DATE_KEY) {
          return selectedOption?.label === ApprovalStatus.HOLD;
        } else if (option.value === textConstant.SWAP_DEMAND_DATE_KEY) {
          return selectedOption?.label === ApprovalStatus.YTD;
        } else if (option.value === textConstant.BLESSED_DATE_KEY) {
          return selectedOption?.label === dropDownnJSON.BLESSED.label || selectedOption?.value === textConstant.HDB;
        } else if (option.value === textConstant.PENDING_DATE_KEY) {
          return selectedOption?.label === dropDownnJSON.PENDING.label;
        }
        // Show all other options normally
        return true;
      })
      .map((option) => {
        const isActive = sortState.sortKey === option.value;
        const order = sortState.sortOrder;

        return (
          <div
            key={option.value}
            className={`${styles.dropdownItemSort} ${isActive ? styles.selected : ""}`}
            onClick={() => handleSort(option.value, true)} // Add isClicked: true
          >
            <div className={styles.sortLabelContainer}>
              {/* CHANGE: Always render the icon container, but conditionally show the icon */}
              <div className={styles.sortIconContainer}>
                {isActive && (
                  <img
                    src={
                      order === textConstant.LOWER_CASE_ASC
                        ? ascendingSortIcon
                        : descendingSortIcon
                    }
                    alt={
                      order === textConstant.LOWER_CASE_ASC
                        ? textConstant.COMPLETE_ASC
                        : textConstant.COMPLETE_DESC
                    }
                    className={styles.sortIconLeft}
                  />
                )}
              </div>
              <span className={styles.optionName}>
                {option.label}
              </span>
            </div>

            {/* Only show applied icon for active sort */}
            {isActive && (
              <img
                src={appliedSort}
                alt={textConstant.SORT}
                className={styles.sortArrow}
              />
            )}
          </div>
        );
      })}
  </div>
)}
          </div>
        </div>
      </div>
    );
  },
);

PreferenceDropDown.displayName = "PreferenceDropDown";
export { PreferenceDropDown };
