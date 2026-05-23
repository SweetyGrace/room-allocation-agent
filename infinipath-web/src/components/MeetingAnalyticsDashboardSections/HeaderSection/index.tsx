// Import necessary dependencies
import { useNavigate } from "react-router-dom";
import styles from "./index.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Modal } from "@mui/material";

// Import utility functions and constants
import { 
  ageMapping, 
  filterOptionsMapping, 
  genderMapping 
} from "../../../utils/commonFunctions";
import { endPoints } from "../../../constants/urlConstants";

// Import assets
import ArrowBack from "../../../assets/images/Back.svg";
import FilterIcon from "../../../assets/images/filter.svg";
import FilterAppliedIcon from "../../../assets/images/filter-applied.svg";
import CrossIcon from "../../../assets/images/cross-icon.svg";

// Import components and actions
import { FilterOptions } from "../../../common/components/FilterOptions";
import { Button } from "../../../common/components/Button";
import { setAnaltyicsFilters } from "../../../reducers/AnalyticsReducer";
import { RootState } from "../../../store";

/**
 * Interface for filter data items
 * @property {number} id - Unique identifier for the filter item
 * @property {string} name - Display name of the filter item
 */
export interface filterDataItem {
  id: number;
  name: string;
}

/**
 * Interface for HeaderSection props
 * @property {string} formattedDate - Formatted date string
 * @property {Object} seekerDetails - User details object
 * @property {Object} filterList - Available filters configuration
 */
interface HeaderSectionProps {
  formattedDate: string;
  seekerDetails: { fullName: string };
  filterList: WebinarFilters;
}

/**
 * HeaderSection Component
 * Renders the header section with filter functionality and navigation
 */
const HeaderSection: React.FC<HeaderSectionProps> = ({ 
  formattedDate, 
  seekerDetails, 
  filterList 
}) => {
  // Hooks initialization
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedFilters = useSelector((state: RootState) => state.AnalyticsReducer.filters);

  // Local state management
  // const selectedDate =formattedDate;
  const [isFilterApplied, setIsFilterApplied] = useState<boolean>(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [tempFilters, setTempFiltersState] = useState<typeof selectedFilters>(selectedFilters);

  // Reorganize filter list for display
  const reorderdFilterList = {
    gender: filterList.genders,
    ageGroup: filterList.ageGroups,
    location: filterList.locations,
  };

  // Default label mappings for filters
  const defaultLabels = {
    gender: genderMapping,
    ageGroup: ageMapping,
    location: {},
  };

  /**
   * Effect to update filter icon state when selected filters change
   */
  useEffect(() => {
    const showIcon = handleFilterIcon();
    setIsFilterApplied(showIcon);
  }, [selectedFilters]);

  /**
   * Determines if filter icon should be shown based on applied filters
   * @returns {boolean} True if any non-audience type filters are applied
   */
  const handleFilterIcon = () => {
    let showIcon = false;
    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (key !== "audienceType" && value.length > 0) {
        showIcon = true;
      }
    });
    return showIcon;
  };

  /**
   * Updates temporary filter state when filter options change
   * @param {string} label - Filter category label
   * @param {string[]} value - Selected filter values
   */
  const handleFilterChange = (label: string, value: string[]) => {
    setTempFiltersState((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  /**
   * Resets all filters to their default state
   */
  const handleClearFilter = () => {
    setTempFiltersState({
      audienceType: [],
      gender:[],
      ageGroup: [],
      location: [],
    });
    setIsFilterApplied(false);
  };

  /**
   * Applies temporary filters to global state
   */
  const handleApplyFilter = () => {
    dispatch(setAnaltyicsFilters(tempFilters as { [key: string]: string[] }));
    setFilterOpen(false);
    setIsFilterApplied(handleFilterIcon());
  };

  // Component render
  return (
    <div>
      <div className={styles.subText}>
        <div className={styles.headerSectionDetails}>
          <div className={styles.headerSection}>
            <div onClick={() => navigate(endPoints.sessions)} className={styles.backButton}>
              <img src={ArrowBack} alt="Back" />
            </div>
            <div className={styles.headerSection__TextContent}>
              <span>{formattedDate}</span>
            </div>
          </div>
          <div className={styles.subTextHide}>
            Hey {seekerDetails.fullName}! here&apos;s the session data for &nbsp;
            <span className={styles.formattedDate}>{formattedDate}</span>
          </div>
        </div>
        <div className={styles.selectInputSection}>
          <span>Filter</span>
          {isFilterApplied ? (
            <img
              src={FilterAppliedIcon}
              alt="Filter Applied"
              className={styles.filterIcon}
              onClick={() => setFilterOpen(!filterOpen)}
            />
          ) : (
            <img
              src={FilterIcon}
              alt="Filter"
              className={styles.filterIcon}
              onClick={() => setFilterOpen(!filterOpen)}
            />
          )}
        </div>
      </div>

      <Modal
        open={filterOpen}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <p>Filters</p>
            <div className={styles.barhorizontallineFilter}></div>
            <img
              src={CrossIcon}
              alt="Close"
              className={styles.closeIcon}
              onClick={() => {
                setTempFiltersState(selectedFilters); // Reset tempFilters to current Redux filters
                setFilterOpen(false);
              }}
            />
          </div>
          <div className={styles.modalBody}>
            {Object.entries(reorderdFilterList).map(([key, value]) =>
              key !== "audienceType" ? (
                <div className={styles.filterOptions} key={key}>
                  <div className={styles.optionsHeader}>
                    <div className={styles.optionText}>{filterOptionsMapping[key]}</div>
                    <div className={styles.barhorizontalline}></div>
                  </div>
                  <div className={styles.options}>
                    <FilterOptions
                      filters={value}
                      filterLabels={defaultLabels[key as keyof typeof defaultLabels]}
                      selectedFilters={tempFilters[key as keyof typeof tempFilters] || []}
                      onChange={(updatedFilters: string[]) => handleFilterChange(key, updatedFilters)}
                    />
                  </div>
                </div>
              ) : null
            )}
          </div>
          <div className={styles.modalFooter}>
            <span className={styles.cancelText} onClick={() => handleClearFilter()}>
              clear
            </span>
            <Button
              onClick={() => handleApplyFilter()}
              buttonClassName={styles.applyButton}
              buttonTextClassName={styles.applyButtonText}
            >
              apply
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HeaderSection;