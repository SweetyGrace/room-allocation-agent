import React, { useEffect, useState } from 'react';
import { Breadcrumbs, Typography, IconButton, Tooltip, Chip } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import search from '../../assets/images/dashboard-search.svg';
import filter from '../../assets/images/filter.svg';
import back from '../../assets/images/Back.svg';
import download from '../../assets/images/download-image.svg';
import filterAppliedIcon from '../../assets/images/filter-applied.svg';
import clearIcon from '../../assets/images/cross-icon.svg';
import styles from './index.module.scss';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { endPoints } from '../../constants/urlConstants';
import { formattedDateWithDay } from '../../utils/commonFunctions';
import { Filters } from '../../common/components/FilterComponent';
import { Box } from '@mui/system';
import { FILTER_LABELS } from '../../constants';
import { RootState } from '../../store';

interface DerivedFilters {
  [key: string]: string | string[] | undefined; // Key is dynamic, value can be a string, an array of strings, or undefined
}
interface SeekerBreadCrumHeaderProps {
  onBack?: () => void;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  totalAudience?: number;
  xlsUrl?: string;
  loading?: boolean;
  filterApplied?: boolean;
  selectedFilters: Filters;
  onDeselectFilters: (key: string, value: string) => void;
  title: string;
  totalWebinars?: number;
  isShowFilter?: boolean;
}

/**
 * SeekerBreadCrumHeader component is a React functional component that renders a header
 * with breadcrumb navigation, audience count, search, filter, and download functionalities.
 *
 * @param {Object} props - The props object for the component.
 * @param {() => void} props.onBack - Callback function triggered when the back button is clicked.
 * @param {(searchText: string) => void} props.onSearch - Callback function triggered when a search is performed.
 * @param {() => void} props.onFilter - Callback function triggered when the filter button is clicked.
 * @param {number} props.totalAudience - The total audience count to display.
 * @param {string} props.xlsUrl - The URL for downloading the analytics file in XLS format.
 * @param {boolean} props.loading - Indicates whether the component is in a loading state.
 * @param {boolean} props.filterApplied - Indicates whether any filters are currently applied.
 * @param {Record<string, unknown>} props.selectedFilters - The currently selected filters.
 * @param {(key: string, value: string) => void} props.onDeselectFilters - Callback function triggered when a filter chip is deselected.
 *
 * @returns {JSX.Element} The rendered SeekerBreadCrumHeader component.
 *
 * @remarks
 * - This component uses `useNavigate` from `react-router-dom` for navigation.
 * - It fetches the session date from the Redux store using `useSelector`.
 * - The component supports dynamic rendering of filter chips based on the selected filters.
 * - Includes a download functionality for exporting analytics data as an XLS file.
 * - Provides responsive design for the search and filter sections.
 */
const SeekerBreadCrumHeader: React.FC<SeekerBreadCrumHeaderProps> = ({
  onBack,
  onSearch,
  onFilter,
  totalAudience,
  xlsUrl,
  loading,
  filterApplied,
  selectedFilters,
  onDeselectFilters,
  title,
  totalWebinars,
  isShowFilter = true,
}) => {
  const navigate = useNavigate();
  const sessionDate = useSelector((state: RootState) => state.AnalyticsReducer.sessionDate);
  const aggregateFilters = useSelector((state: RootState) => state.AnalyticsReducer.aggregatedFilters);
  const [searchText, setSearchText] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [derivedFilters, setDerivedFilters] = useState<DerivedFilters>({});
  // const sessionDate = useSelector((state: RootState) => state.AnalyticsReducer.sessionDate);
  const sessionKPIType = useSelector((state: RootState) => state.AnalyticsReducer.kpiType);

  useEffect(() => {
    if (selectedFilters) {
      const keyMapping: { [key: string]: string } = {
        selectedAge: FILTER_LABELS.AGE,
        selectedRegistrationType: FILTER_LABELS.REGISTRATION_TYPE,
        selectedGender: FILTER_LABELS.GENDER,
        selectedPlatform: FILTER_LABELS.PLATFORM,
        selectedVerification: FILTER_LABELS.VERIFICATION_STATUS,
        selectedLocation: FILTER_LABELS.LOCATION,
        selectedAttendanceStatus: FILTER_LABELS.ATTENDANCE_STATUS,
        selectedAttendanceDetails: FILTER_LABELS.ATTENDANCE_DETAILS,
        selectedJoinMode: FILTER_LABELS.JOIN_MODE,
      };

      const derived: { [key: string]: unknown } = {};

      Object.entries(selectedFilters).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          derived[keyMapping[key] || key] = value; // Rename key if mapping exists
        } else if (typeof value === "string" && value !== "") {
          derived[keyMapping[key] || key] = value; // Rename key if mapping exists
        }
      });

      setDerivedFilters(derived);
    }
  }, [selectedFilters]);

  const handleSessionsClick = () => {
    if (title === "Sessions") {
      navigate(endPoints.sessions);
    } else {
      navigate(endPoints.aggregateAnaltyics);
    }
  };

  /**
   * Handles the download of an Excel file from a given URL.
   * 
   * This function performs the following steps:
   * 1. Retrieves the current date and time, adjusts it to Indian Standard Time (IST),
   *    and formats it for use in the file name.
   * 2. Formats the session date (retrieved from the Redux store) to ensure compatibility
   *    with file naming conventions.
   * 3. Constructs a file name using the session date and the current IST time.
   * 4. Fetches the file from the provided URL and validates the response.
   * 5. Converts the fetched file into a Blob object and creates a temporary anchor element
   *    to trigger the file download.
   * 6. Cleans up by removing the temporary anchor element after the download is triggered.
   * 
   * @async
   * @function handleDownload
   * @throws {Error} Throws an error if the file fetch operation fails.
   */
  const handleDownload = async () => {
    if (xlsUrl) {
      try {
        const currentDate = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(currentDate.getTime() + istOffset);
        const formattedSessionDate = sessionDate.split("T")[0].replace(/[/]/g, "-");
        const formattedTime = istDate.toISOString().replace(/:/g, "-");
        const fileName = `Analytics_${formattedSessionDate}_${formattedTime}.xlsx`;

        const response = await fetch(xlsUrl);
        if (!response.ok) throw new Error("Failed to fetch the file");
        const blob = await response.blob();

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error downloading the file:", error);
      }
    }
  };

  return (
    <div className={styles.headerContainer}>
      <div className={styles.breadcrumb}>
        <IconButton className={styles.backButton} onClick={onBack}>
          <img src={back} alt="back" />
        </IconButton>
        <Breadcrumbs aria-label="breadcrumb">
          <Typography
            color="inherit"
            onClick={handleSessionsClick}
            className={`${styles.breadcrumbSessionItem} ${styles.breadcrumbItem}`}
            component="button"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {title}
          </Typography>
          {title === "Sessions" && <Typography
            color="textPrimary"
            className={styles.breadcrumb}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <CalendarTodayIcon className={styles.calendarIcon} style={{ height: '17px' }} />
            {formattedDateWithDay(new Date(sessionDate))}
          </Typography>}

          {title === "Analytics" && aggregateFilters.startDate!= undefined && aggregateFilters.startDate != "" && <Typography
            color="textPrimary"
            className={styles.breadcrumb}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <CalendarTodayIcon className={styles.calendarIcon} style={{ height: '17px' }} />
            {formattedDateWithDay(new Date(aggregateFilters.startDate))} {" "} - {" "}
            {formattedDateWithDay(new Date(aggregateFilters.endDate))}

          </Typography>}
        </Breadcrumbs>
      </div>

      {!loading && (
        <div className={styles.audienceCountContainer}>
          <div className={styles.chipDataContainer}>
            {sessionKPIType !== "Sessions" ?
             ( <div className={styles.audienceCount}>
                <span className={styles.audienceLabel}>Total Audience - </span>
                <span className={styles.audienceNumber}>{totalAudience}</span>
              </div>)
               : (
                <div className={styles.audienceCount}>
                <span className={styles.audienceLabel}>Total Webinars - </span>
                <span className={styles.audienceNumber}>{totalWebinars}</span>
                </div>
              )
            }
            <Box
              sx={{
                display: "flex",
                justifyContent: "start",
                maxWidth: isSearchOpen ? "calc(90vw - 720px)" : "calc(90vw - 330px)",
                flexWrap: "nowrap", // Prevent wrapping
                overflowX: "auto", // Enable horizontal scrolling
                whiteSpace: "nowrap", // Ensure chips stay in a single line
                padding: "4px", // Optional padding for better spacing
                "&::-webkit-scrollbar": {
                  height: "2px", // Customize scrollbar height
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#ccc", // Customize scrollbar color
                  borderRadius: "4px", // Rounded scrollbar
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#E5F0F0", // Customize scrollbar track
                },
                // boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.1)",
              }}
            >
              {Object.keys(derivedFilters).map((key) =>
                Array.isArray(derivedFilters[key]) && (
                  derivedFilters[key].map((value: string, index: number) => (
                    <Chip
                      key={index}
                      label={value} // Display the value instead of the key
                      variant="outlined"
                      onDelete={() => onDeselectFilters && onDeselectFilters(key, value)}
                      deleteIcon={
                        <img
                          src={clearIcon}
                          alt="clear"
                          style={{ width: "11px", height: "11px" }}
                        />
                      }
                      sx={{
                        margin: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: "#0A4D6E",
                        height: "24px",
                        borderColor: "#E5F0F0",
                        backgroundColor: "#E5F0F0",
                        cursor: "pointer",
                      }}
                    />
                  ))
                )
              )}
            </Box>

          </div>
          <div className={styles.searchFilterContainer}>
            <div className={styles.searchContainer}>
              {isSearchOpen && (
                <div className={styles.search} data-testid="search-container">
                  <input
                    type="text"
                    className={styles.searchInput}
                    autoFocus
                    value={searchText}
                    placeholder="Search seeker with name, mobile number or location"
                    onChange={(e) => {
                      const value = e.currentTarget.value.trim();
                      setSearchText(value);
                      if (value === "") {
                        onSearch && onSearch("");
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onSearch && onSearch(searchText);
                      }
                    }}
                    data-testid="search-input"
                  />
                  {searchText && (
                    <button
                      className={styles.clearIcon}
                      onClick={() => {
                        setSearchText("");
                        onSearch && onSearch("");
                      }}
                      data-testid="clear-button"
                    >
                      <img src={clearIcon} alt="clear" data-testid="clear-icon" />
                    </button>
                  )}
                </div>
              )}
             {isShowFilter &&  <Tooltip title="Search" arrow>
                <button
                  className={styles.searchIcon}
                  data-testid="search-button"
                  onClick={() => setIsSearchOpen((prev) => !prev)}
                >
                  <img src={search} alt="search" data-testid="search-icon" />
                </button>
              </Tooltip>
              }
            </div>
            {isShowFilter && <Tooltip title="Filter" arrow>
              <button
                className={styles.filterButton}
                onClick={() => onFilter && onFilter()}
                disabled={loading}
              >
                <img src={filterApplied ? filterAppliedIcon : filter} alt="filter" />
              </button>
            </Tooltip>
            }
            {
              isShowFilter &&
              <Tooltip title="Downlaod" arrow>
                <button
                  className={xlsUrl ? styles.filterButton: styles.filterButtonDisabled}
                  onClick={handleDownload}
                >
                  <img src={download} alt="download" />
                </button>
              </Tooltip>
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default SeekerBreadCrumHeader;
