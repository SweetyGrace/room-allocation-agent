import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Alert,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Popover,
} from "@mui/material";
import { Info, X } from "lucide-react";
import { Button } from "../../common/components/Button";
import { getCall } from "../../services/apiService";
import { endPoints, PORTAL } from "../../constants/urlConstants";
import { PUBLISH_MODAL_TEXT, USER_TYPE_FILTER_OPTIONS } from "../../constants/textConstants";
import { AGE_FILTER_OPTIONS, GENDER_FILTER_OPTIONS } from "../../constants";
import { calculateAge } from "../../utils/programUtils";
import { THEME } from "../../constants/theme";
import DataGridWithPagination from "../../common/components/DataGridWithPagination";
import Loader from "../../common/components/Loader";

import CheckBoxChecked from "../../assets/images/checkBoxChecked.svg";
import CheckBoxUnchecked from "../../assets/images/checkboxUnchecked.svg";
import SearchIcon from "../../assets/images/search.svg";
import CloseIcon from "../../assets/images/closebtn.svg";
import FilterIcon from "../../assets/images/filter.svg";
import FilterAppliedIcon from '../../assets/images/filter-applied.svg';



  // Enum for access types
  export enum AccessType {
    PUBLIC = "PUBLIC",
    RESTRICTED = "RESTRICTED",
    INTERNAL = "INTERNAL",
  }

  // Enum for user grid columns
  enum UserGridColumn {
    ID = "id",
    FULL_NAME = "fullName",
    EMAIL = "email",
    COUNTRY_CODE = "countryCode",
    PHONE_NUMBER = "phoneNumber",
    USER_TYPE = "userType",
    GENDER = "gender",
    AGE = 'age'
  }

import styles from "./PublishModal.module.scss";

// User DTO interface matching backend response
export interface User {
  id: number;
  phoneNumber: string | null;
  fullName: string | null;
  role: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  isInfiminute: boolean | null;
  isInfimessages: boolean | null;
  userApprovalStatus: string | null;
  firstName: string | null;
  lastName: string | null;
  statusUpdatedAt: string | null;
  isInfipath: boolean | null;
  email: string | null;
  isInfimessageUserActive: boolean | null;
  isInfipathUserActive: boolean | null;
  nameAudio: string | null;
  isInfiminuteUserActive: boolean | null;
  profileUrl: string | null;
  address: string | null;
  countryCode: string | null;
  countryName: string | null;
  associatedSince: string | null;
  gender: string | null;
  dob: string | null;
  otherAddress: string | null;
  firebaseIdExt: string | null;
  acknowledgementDate: string | null;
  termsAndConditions: string | null;
  alternateCountryCode: string | null;
  alternatePhoneNumber: string | null;
  alternateEmail: string | null;
  encryptedPhoneNumber: string | null;
  maskedPhoneNumber: string | null;
  encryptedEmail: string | null;
  isSystemUser: boolean | null;
  isAiUser: boolean | null;
  userType: string | null;
  legalFullName: string | null;
  auditRefId: string | null;
  hdbDefaulter: boolean | null;
  userRoleMaps: Array<{
    id: number;
    role: {
      id: number;
      name: string;
      roleName: string;
      roleKey: string;
      priority: number;
      isSystemRole: boolean;
      createdAt: string;
      updatedAt: string;
    };
    createdAt: string;
    updatedAt: string;
  }>;
  orgUsrName: string | null;
  orgEmail: string | null;
  source: string | null;
  action: string | null;
}

interface PublishModalProps {
  open: boolean;
  onClose: () => void;
  onPublish: (publishData: PublishData) => Promise<void>;
  programId: string | number;
  isInternalPublish?: boolean;
  programAccessUserIds?: number[]; // Initial user IDs that should NOT be pre-selected
}

export interface PublishData {
  status: string;
  updatedBy: number;
  accessType: AccessType;
  programAccess?: {
    addUserIds: number[];
    removeUserIds: number[];
    accessScope: string;
    effectiveFrom?: string;
    effectiveTill?: string;
    reason: string;
    meta?: Record<string, any>;
    cascadeDeleteRegistrations: boolean;
  };
  clearExistingRegistrations: boolean;
}

interface UserFilters {
  age: string[];
  gender: string[];
  userType: string[];
  search: string;
}


const getAccessTypes = (isInternalPublish?: boolean) => [
  {
    value: AccessType.PUBLIC,
    label: PUBLISH_MODAL_TEXT.ACCESS_TYPE_PUBLIC,
  },
  {
    value: AccessType.RESTRICTED,
    label: PUBLISH_MODAL_TEXT.ACCESS_TYPE_RESTRICTED,
  },
  ...(!isInternalPublish ? [{
    value: AccessType.INTERNAL,
    label: PUBLISH_MODAL_TEXT.ACCESS_TYPE_INTERNAL,
  }] : [])
];

const PublishModal: React.FC<PublishModalProps> = ({
  open,
  onClose,
  onPublish,
  programId,
  isInternalPublish = false,
  programAccessUserIds = [],
}) => {

  // If internal publish, default to RESTRICTED and remove INTERNAL option
  const [accessType, setAccessType] = useState<AccessType>(
    isInternalPublish ? AccessType.RESTRICTED : AccessType.PUBLIC
  );
  const normalizedProgramAccessUserIds = useMemo(() => programAccessUserIds.map(Number), [programAccessUserIds]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set(normalizedProgramAccessUserIds));
  const [initialProgramAccessUserIds] = useState<number[]>(normalizedProgramAccessUserIds);
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [cascadeDeleteRegistrations, setCascadeDeleteRegistrations] = useState(false);
  const [showUserSelection, setShowUserSelection] = useState(false);
  
  // Pagination states
  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Search bar open/close state
  const [searchOpen, setSearchOpen] = useState(false);

  // Filter states
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    age: [],
    gender: [],
    userType: [],
    search: "",
  });
  

  



  // Fetch users when transitioning to user selection view or pagination changes
  useEffect(() => {
    if (showUserSelection) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showUserSelection, currentPage, pageSize]);

  // Ensure programAccessUserIds are selected when modal opens
  useEffect(() => {
    if (showUserSelection && initialProgramAccessUserIds.length > 0) {
      setSelectedRows(new Set(initialProgramAccessUserIds));
    }
  }, [showUserSelection, initialProgramAccessUserIds]);

 // Fetch users when search text clear (for clear to work instantly)
  // Only call fetchUsers on clear if there was a previous search value
  // Only update prevSearchRef after API call (on Enter or clear)
  const prevSearchRef = React.useRef("");
  useEffect(() => {
    if (
      filters.search === "" &&
      showUserSelection &&
      prevSearchRef.current !== ""
    ) {
      fetchUsers();
      prevSearchRef.current = "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  // When user presses Enter in search, call API and update prevSearchRef
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      fetchUsers();
      prevSearchRef.current = filters.search;
    }
  };

  // Unified fetchUsers: optionally set showUserSelection after fetch
  const fetchUsers = async (showSelectionAfterFetch = false) => {
    try {
      setLoading(true);
      let url = `${endPoints.user}?limit=${pageSize}&offset=${(currentPage - 1) * pageSize}`;
      // Add filter parameters
      if (filters.search) {
        url += `&searchText=${encodeURIComponent(filters.search)}`;
      }
      const filterParams: Record<string, string[] | undefined> = {};
      if (filters.age.length > 0) filterParams.age = filters.age;
      if (filters.gender.length > 0) filterParams.gender = filters.gender;
      if (filters.userType.length > 0) filterParams.userType = filters.userType;
      if (Object.keys(filterParams).length > 0) {
        url += `&filters=${encodeURIComponent(JSON.stringify(filterParams))}`;
      }
      const response = await getCall(url, undefined, PORTAL);
      if (response?.data?.statusCode === 200 && response.data.data) {
        const users = response.data.data.data.map((user: any) => ({
          id: user.id,
          fullName: user.legalFullName || user.fullName || user.orgUsrName || user.firstName || user.lastName || "-",
          email: user.email || user.orgEmail || "-",
          phoneNumber: user.phoneNumber || user.maskedPhoneNumber || "-",
          role: user.role || user.userType || "-",
          firstName: user.firstName,
          lastName: user.lastName,
          orgUsrName: user.orgUsrName,
          orgEmail: user.orgEmail,
          userType: user.userType,
          countryCode: user.countryCode,
          gender: user.gender,
          dob: user.dob,
        }));
        setAllUsers(users);
        setTotalCount(response.data.data.pagination?.totalRecords || users.length);
        if (showSelectionAfterFetch) setShowUserSelection(true);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleRowClick = useCallback((row: any) => {
    const id = row.id;
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id); // Deselect
      } else {
        newSet.add(id); // Select
      }
      return newSet;
    });
  }, []);

  const handleHeaderCheckboxClick = useCallback((allCurrentPageSelected: boolean, currentPageRowIds: number[]) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (allCurrentPageSelected) {
        // Deselect all rows on current page
        currentPageRowIds.forEach(id => newSet.delete(id));
      } else {
        // Select all rows on current page
        currentPageRowIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  }, []);

  const handlePublish = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("seekerDetails") || "{}")?.id || 9533;
      
      const publishData: PublishData = {
        status: accessType === AccessType.INTERNAL ? PUBLISH_MODAL_TEXT.STATUS_INTERNAL : PUBLISH_MODAL_TEXT.STATUS_PUBLISHED,
        updatedBy: userId,
        accessType: accessType as AccessType,
        clearExistingRegistrations: false,
      };
      if (accessType === AccessType.INTERNAL || accessType === AccessType.RESTRICTED) {
        const selectedIds = Array.from(selectedRows).map(Number);
        const initialIds = initialProgramAccessUserIds;
        const addUserIds = selectedIds.filter(id => !initialIds.includes(id));
        const removeUserIds = initialIds.filter(id => !selectedIds.includes(id));

        
        publishData.programAccess = {
          addUserIds,
          removeUserIds,
          accessScope: PUBLISH_MODAL_TEXT.ACCESS_SCOPE_VIEW_AND_REGISTER,
          reason: `${accessType} program publish`,
          meta: {},
          cascadeDeleteRegistrations,
        };
      }

      
      await onPublish(publishData);
      
    } catch (error) {
      throw error;
    }
  };

  const handleClose = () => {
    // Reset all states
    setSelectedRows(new Set(programAccessUserIds));
    setCascadeDeleteRegistrations(false);
    setShowUserSelection(false);
    setCurrentPage(1);
    setFilters({ age: [], gender: [], userType: [], search: "" });
    setFilterAnchorEl(null);
    onClose();
  };

  // Filter handlers
  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterChange = (category: keyof Omit<UserFilters, 'search'>, value: string) => {
    setFilters((prev) => {
      const currentValues = prev[category];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];
      return { ...prev, [category]: newValues };
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // if search is cleared then reset to first page to show all results from the beginning then apply search filter
      if (event.target.value === "") {
        setCurrentPage(1);
      }
      setFilters((prev) => ({ ...prev, search: event.target.value }));

  };

  const handleClearFilters = () => {
    setFilters({ age: [], gender: [], userType: [], search: "" });
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchUsers();
    handleFilterClose();
  };

  const handleViewUsers = async () => {
    // Reset states
    setCurrentPage(1);
    setSelectedRows(new Set(programAccessUserIds));
    // Fetch and show user selection
    await fetchUsers(true);
  };

  const isPublishDisabled = () => {
    if (accessType === AccessType.PUBLIC) return false;
    
    // For INTERNAL or RESTRICTED, at least one user must be selected
    return selectedRows.size === 0;
  };

  // Create checkbox column
  const createCheckboxColumn = useCallback(() => {
    const currentPageRowIds = allUsers.map(row => row.id);
    
    // All rows are selected if ALL of them are in the selected set
    const allCurrentPageSelected =
      currentPageRowIds.length > 0 &&
      currentPageRowIds.every(id => selectedRows.has(id));
    
    return {
      field: 'checkbox',
      headerName: '',
      width: 50,
      sortable: false,
      filterable: false,
      renderHeader: () => (
        <div
          className={styles.checkboxCellWrapper}
          onClick={() => handleHeaderCheckboxClick(allCurrentPageSelected, currentPageRowIds)}
          title={allCurrentPageSelected ? PUBLISH_MODAL_TEXT.CHECKBOX_TITLE_DESELECT_ALL : PUBLISH_MODAL_TEXT.CHECKBOX_TITLE_SELECT_ALL}
        >
          <input
            type="checkbox"
            checked={allCurrentPageSelected}
            className={styles.hiddenCheckbox}
            readOnly
          />
          <img
            src={allCurrentPageSelected ? CheckBoxChecked : CheckBoxUnchecked}
            alt={allCurrentPageSelected ? PUBLISH_MODAL_TEXT.CHECKBOX_ALT_CHECKED : PUBLISH_MODAL_TEXT.CHECKBOX_ALT_UNCHECKED}
            className={styles.checkboxIcon}
          />
        </div>
      ),
      renderCell: (params: any) => {
        const isSelected = selectedRows.has(params.row.id);
        return (
          <div className={styles.checkboxCellWrapper}>
            <input
              type="checkbox"
              checked={isSelected}
              className={styles.hiddenCheckbox}
              readOnly
            />
            <img
              src={isSelected ? CheckBoxChecked : CheckBoxUnchecked}
              alt={isSelected ? PUBLISH_MODAL_TEXT.CHECKBOX_ALT_CHECKED : PUBLISH_MODAL_TEXT.CHECKBOX_ALT_UNCHECKED}
              className={styles.checkboxIcon}
            />
          </div>
        );
      },
    };
  }, [allUsers, selectedRows, handleHeaderCheckboxClick]);

  const userColumns = useMemo(() => {
    const checkboxColumn = createCheckboxColumn();
    
    const baseColumns = [
      checkboxColumn,
      {
        field: UserGridColumn.ID,
        headerName: PUBLISH_MODAL_TEXT.GRID_HEADER_ID,
        width: 80,
        sortable: false,
      },
      {
        field: UserGridColumn.FULL_NAME,
        headerName: PUBLISH_MODAL_TEXT.GRID_HEADER_NAME,
        width: 250,
        sortable: false,
        renderCell: (params: any) => (
          <span className={styles.emailCell} title={params.row.fullName || params.row.orgUsrName || params.row.firstName || params.row.lastName || "-"}>
            {params.row.fullName || params.row.orgUsrName || params.row.firstName || params.row.lastName || "-"}
          </span>
        ),
      },
      {
        field: UserGridColumn.EMAIL,
        headerName: PUBLISH_MODAL_TEXT.GRID_HEADER_EMAIL,
        width: 280,
        sortable: false,
        renderCell: (params: any) => (
          <span className={styles.emailCell} title={params.row.email || params.row.orgEmail || "-"}>
            {params.row.email || params.row.orgEmail || "-"}
          </span>
        ),
      },
      {
        field: UserGridColumn.COUNTRY_CODE,
        headerName: PUBLISH_MODAL_TEXT.GRID_HEADER_COUNTRY_CODE,
        width: 120,
        sortable: false,
        renderCell: (params: any) => (
          <span>{params.row.countryCode || "-"}</span>
        ),
      },
      {
        field: UserGridColumn.PHONE_NUMBER,
        headerName: PUBLISH_MODAL_TEXT.GRID_HEADER_PHONE,
        width: 180,
        sortable: false,
        renderCell: (params: any) => (
          <span>{params.row.maskedPhoneNumber || params.row.phoneNumber || "-"}</span>
        ),
      },
      {
        field: UserGridColumn.USER_TYPE,
        headerName: PUBLISH_MODAL_TEXT.GRID_HEADER_USER_TYPE,
        width: 120,
        sortable: false,
        renderCell: (params: any) => (
          <span>{params.row.userType || params.row.role || "-"}</span>
        ),
      },
      {
        field: UserGridColumn.GENDER,
        headerName: PUBLISH_MODAL_TEXT.GRID_HEADER_GENDER,
        width: 100,
        sortable: false,
        renderCell: (params: any) => (
          <span>{params.row.gender || "-"}</span>
        ),
      },
      {
        field: UserGridColumn.AGE,
        headerName: PUBLISH_MODAL_TEXT.GRID_HEADER_AGE,
        width: 100,
        sortable: false,
        renderCell: (params: any) => {
          if (!params.row.dob) return <span>-</span>;
          const age = calculateAge(params.row.dob);
          return <span>{age}</span>;
        }
      }
    ];
    
    return baseColumns;
  }, [createCheckboxColumn]);

  const renderFooter = () => (
    <div className={styles.footerContainer}>
      {showUserSelection && (
        <div className={styles.cascadeOption}>
          <FormControlLabel
            control={
              <Checkbox
                checked={cascadeDeleteRegistrations}
                onChange={(e) => setCascadeDeleteRegistrations(e.target.checked)}
              />
            }
            label={
              <Box>
                <Typography sx={{ fontFamily: 'Noto Sans', fontSize: THEME.fontSize.sm, fontWeight: THEME.fontWeight.semibold, color: THEME.colors.primary }}>
                  {PUBLISH_MODAL_TEXT.LABEL_DELETE_EXISTING_REGISTRATIONS}
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: 'Noto Sans', fontSize: THEME.fontSize.xs, color: THEME.colors.footerGray }}>
                  {PUBLISH_MODAL_TEXT.LABEL_DELETE_EXISTING_REGISTRATIONS_DESC}
                </Typography>
              </Box>
            }
          />
        </div>
      )}
      <div className={styles.buttonGroup}>
        {!showUserSelection && (
          <Button
            onClick={handleClose}
            buttonClassName={styles.secondaryButton}
            buttonTextClassName={styles.secondaryButtonText}
          >
            {PUBLISH_MODAL_TEXT.BUTTON_CANCEL}
          </Button>
        )}
        {showUserSelection && (
          <Button
            onClick={() => setShowUserSelection(false)}
            buttonClassName={styles.secondaryButton}
            buttonTextClassName={styles.secondaryButtonText}
          >
            {PUBLISH_MODAL_TEXT.BUTTON_BACK}
          </Button>
        )}
        <Button
          onClick={handlePublish}
          buttonClassName={styles.primaryButton}
          buttonTextClassName={styles.primaryButtonText}
          disable={isPublishDisabled()}
        >
          {PUBLISH_MODAL_TEXT.BUTTON_PUBLISH}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        className={styles.dialogContainer}
      >
        <DialogTitle className={styles.dialogHeader}>
          <div className={styles.viewUsersHeader}>
            <Typography className={styles.styledDialogTitle}>
              {showUserSelection
                ? PUBLISH_MODAL_TEXT.DIALOG_TITLE_SELECT_USERS
                : `${PUBLISH_MODAL_TEXT.DIALOG_TITLE_PUBLISH_PROGRAM} - ${accessType === AccessType.PUBLIC ? PUBLISH_MODAL_TEXT.ACCESS_TYPE_PUBLIC : accessType === AccessType.INTERNAL ? PUBLISH_MODAL_TEXT.ACCESS_TYPE_INTERNAL : PUBLISH_MODAL_TEXT.ACCESS_TYPE_RESTRICTED}`}
            </Typography>
          </div>
          <IconButton onClick={handleClose} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <div className={styles.horizontalLine} />
        <DialogContent className={styles.customDialogContent}>
          <div className={styles.contentWrapper}>
            {loading ? (
              <div className={styles.loaderWrapper}>
                <Loader type="small" />
              </div>
            ) : showUserSelection ? (
            <div className={styles.usersTabContent}>
              {/* Filter Bar with Selection Count and Search (matching registration list view) */}
              <Box mb={2} display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                <Typography variant="subtitle2" fontWeight={THEME.fontWeight.semibold} sx={{ fontFamily: 'Noto Sans', fontSize: THEME.fontSize.sm, color: THEME.colors.primary }}>
                  {PUBLISH_MODAL_TEXT.USER_SELECTED_COUNT(selectedRows.size, totalCount)}
                </Typography>
                <div className={styles.searchContainer}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {searchOpen && (
                    <div className={styles.search} data-testid="search-container">
                      <input
                        type="text"
                        className={styles.searchInput}
                        autoFocus
                        value={filters.search}
                        placeholder={PUBLISH_MODAL_TEXT.LABEL_SEARCH_USERS}
                        onChange={handleSearchChange}
                        onKeyDown={handleSearchKeyDown}
                        data-testid="search-input"
                      />
                      {filters.search && (
                        <button
                          className={styles.clearIcon}
                          onClick={() => {
                            setCurrentPage(1);
                            setFilters((prev) => ({ ...prev, search: "" }));
                          }}
                          data-testid="clear-button"
                        >
                          <img
                            src={CloseIcon}
                            alt={PUBLISH_MODAL_TEXT.ALT_CLEAR}
                            data-testid="clear-icon"
                          />
                        </button>
                      )}
                    </div>
                  )}
                    <button
                      className={styles.searchIcon}
                      data-testid="search-button"
                      onClick={() => setSearchOpen((prev) => !prev)}
                    >
                      <img
                        src={SearchIcon}
                        alt={PUBLISH_MODAL_TEXT.ALT_SEARCH}
                        data-testid="search-icon"
                      />
                    </button>
                    <button
                      className={styles.filterIconBtn}
                      data-testid="filter-button"
                      onClick={handleFilterClick}
                      style={{ background: 'none', border: 'none', padding: 0, marginLeft: THEME.spacing.xs }}
                    >
                      <img
                        src={
                          filters.age.length > 0 || filters.gender.length > 0 || filters.userType.length > 0
                            ? FilterAppliedIcon
                            : FilterIcon
                        }
                        alt={PUBLISH_MODAL_TEXT.ALT_FILTER}
                        data-testid="filter-icon"
                        style={{ filter: filterAnchorEl ? 'brightness(0.7)' : 'none' }}
                      />
                    </button>
                  </span>
                </div>
              </Box>

              <div className={styles.gridContainer}>
                <DataGridWithPagination
                  headers={userColumns}
                  seekersData={allUsers}
                  totalData={totalCount}
                  pageSize={pageSize}
                  setPageSize={setPageSize}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  loading={loading}
                  heightToApplyonGrid="100%"
                  smallSize={false}
                  onRowClick={handleRowClick}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Access Type Selection */}
              <Box mb={3}>
                <Typography variant="subtitle1" fontWeight={THEME.fontWeight.semibold} gutterBottom sx={{ fontFamily: 'Noto Sans', fontSize: THEME.fontSize.md, color: THEME.colors.primary }}>
                  {PUBLISH_MODAL_TEXT.LABEL_SELECT_ACCESS_TYPE}
                </Typography>
                <RadioGroup
                  value={accessType}
                  onChange={(e) => setAccessType(e.target.value as any)}
                >
                  {getAccessTypes(isInternalPublish).map((type) => (
                    <Box key={type.value} mb={0.5}>
                      <FormControlLabel
                        value={type.value}
                        control={<Radio />}
                        label={
                          <Typography variant="body1" fontWeight={THEME.fontWeight.medium} sx={{ fontFamily: 'Noto Sans', fontSize: THEME.fontSize.sm, color: THEME.colors.primary }}>
                            {type.label}
                          </Typography>
                        }
                      />
                    </Box>
                  ))}
                </RadioGroup>
              </Box>

              {/* Info Alert */}
              <Alert severity="info" icon={<Info size={20} />} sx={{ 
                mb: 3,
                '& .MuiAlert-message': {
                  fontFamily: 'Noto Sans',
                  fontSize: THEME.fontSize.sm,
                }
              }}>
                {accessType === AccessType.PUBLIC
                  ? PUBLISH_MODAL_TEXT.ALERT_PUBLIC
                  : accessType === AccessType.INTERNAL
                  ? PUBLISH_MODAL_TEXT.ALERT_INTERNAL
                  : PUBLISH_MODAL_TEXT.ALERT_RESTRICTED}
              </Alert>

              {/* User Selection Button for INTERNAL and RESTRICTED */}
              {(accessType === AccessType.INTERNAL || accessType === AccessType.RESTRICTED) && (
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary" mb={1} sx={{ fontFamily: 'Noto Sans', fontSize: THEME.fontSize.sm }}>
                    {PUBLISH_MODAL_TEXT.LABEL_SELECT_USERS_DESC}
                  </Typography>
                  <Button
                    onClick={handleViewUsers}
                    buttonClassName={styles.secondaryButton}
                    buttonTextClassName={styles.secondaryButtonText}
                  >
                    {PUBLISH_MODAL_TEXT.BUTTON_SELECT_USERS}
                  </Button>
                </Box>
              )}
            </>
          )}
          </div>
        </DialogContent>
        <div className={styles.dialogActions}>
          {renderFooter()}
        </div>
      </Dialog>
      
      {/* Filter Popover */}
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box className={styles.filterPopover}>
          <Typography variant="subtitle1" fontWeight={THEME.fontWeight.semibold} mb={2} sx={{ fontFamily: 'Noto Sans', fontSize: THEME.fontSize.md, color: THEME.colors.primary }}>
            {PUBLISH_MODAL_TEXT.LABEL_FILTER_USERS}
          </Typography>
          
          {/* Age Filter */}
          <Box mb={2}>
            <Typography variant="subtitle2" fontWeight={THEME.fontWeight.semibold} mb={1} sx={{ fontFamily: 'Noto Sans', fontSize: THEME.fontSize.sm, color: THEME.colors.primary }}>
              {PUBLISH_MODAL_TEXT.LABEL_AGE}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {AGE_FILTER_OPTIONS.map((age) => (
                <label key={age} className={styles.filterCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.age.includes(age)}
                    onChange={() => handleFilterChange('age', age)}
                    className={styles.hiddenCheckbox}
                  />
                  <img
                    src={filters.age.includes(age) ? CheckBoxChecked : CheckBoxUnchecked}
                    alt={filters.age.includes(age) ? PUBLISH_MODAL_TEXT.CHECKBOX_ALT_CHECKED : PUBLISH_MODAL_TEXT.CHECKBOX_ALT_UNCHECKED}
                    className={styles.checkboxIcon}
                  />
                  <span>{age}</span>
                </label>
              ))}
            </Box>
          </Box>
          
          {/* Gender Filter */}
          <Box mb={2}>
            <Typography variant="subtitle2" fontWeight={THEME.fontWeight.semibold} mb={1} sx={{ fontFamily: 'Noto Sans', fontSize: THEME.fontSize.sm, color: THEME.colors.primary }}>
              {PUBLISH_MODAL_TEXT.LABEL_GENDER}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {GENDER_FILTER_OPTIONS.map((gender) => (
                <label key={gender} className={styles.filterCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.gender.includes(gender)}
                    onChange={() => handleFilterChange('gender', gender)}
                    className={styles.hiddenCheckbox}
                  />
                  <img
                    src={filters.gender.includes(gender) ? CheckBoxChecked : CheckBoxUnchecked}
                    alt={filters.gender.includes(gender) ? PUBLISH_MODAL_TEXT.CHECKBOX_ALT_CHECKED : PUBLISH_MODAL_TEXT.CHECKBOX_ALT_UNCHECKED}
                    className={styles.checkboxIcon}
                  />
                  <span>{gender}</span>
                </label>
              ))}
            </Box>
          </Box>
          
          {/* User Type Filter */}
          <Box mb={2}>
            <Typography variant="subtitle2" fontWeight={THEME.fontWeight.semibold} mb={1} sx={{ fontFamily: 'Noto Sans', fontSize: THEME.fontSize.sm, color: THEME.colors.primary }}>
              {PUBLISH_MODAL_TEXT.LABEL_USER_TYPE}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {USER_TYPE_FILTER_OPTIONS.map((userType) => (
                <label key={userType} className={styles.filterCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.userType.includes(userType)}
                    onChange={() => handleFilterChange('userType', userType)}
                    className={styles.hiddenCheckbox}
                  />
                  <img
                    src={filters.userType.includes(userType) ? CheckBoxChecked : CheckBoxUnchecked}
                    alt={filters.userType.includes(userType) ? PUBLISH_MODAL_TEXT.CHECKBOX_ALT_CHECKED : PUBLISH_MODAL_TEXT.CHECKBOX_ALT_UNCHECKED}
                    className={styles.checkboxIcon}
                  />
                  <span>{userType}</span>
                </label>
              ))}
            </Box>
          </Box>
          
          {/* Filter Actions */}
          <Box display="flex" justifyContent="flex-end" gap={1} mt={3}>
            <Button
              onClick={handleClearFilters}
              buttonClassName={styles.secondaryButton}
              buttonTextClassName={styles.secondaryButtonText}
            >
              {PUBLISH_MODAL_TEXT.BUTTON_CLEAR_FILTER}
            </Button>
            <Button
              onClick={handleApplyFilters}
              buttonClassName={styles.primaryButton}
              buttonTextClassName={styles.primaryButtonText}
            >
              {PUBLISH_MODAL_TEXT.BUTTON_APPLY_FILTER}
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default PublishModal;
