import React from "react";
import styles from "./index.module.scss";
import {formatText} from "../../utils/registrationUtils";
import { cleanValue } from "../../utils/commonFunctions";
import { YET_TO_REVIEW_LABEL } from "../../constants/textConstants";
interface FilterValueItem {
  value: string;
  label: string;
}

interface FilterValue {
  label: string;
  value: Array<FilterValueItem> | {
    startDate?: string;
    endDate?: string;
    operator?: string;
    value?: string;
  };
}

interface AppliedFilters {
  [key: string]: FilterValue;
}

type FilterPillsProps = {
  appliedFilters: AppliedFilters;
  totalData: number;
  handleRemoveFilter: (key: string, val: string) => void;
  handleClearAllFilters: () => void;
  onMoreClick?: () => void;
  isSearchOpen?: boolean;
};

type FilterPill = {
  key: string;
  val: string;
  label: string;
};

const FilterPills: React.FC<FilterPillsProps> = ({
  appliedFilters,
  totalData,
  handleRemoveFilter,
  handleClearAllFilters,
  onMoreClick,
  isSearchOpen,
}) => {
  if (!appliedFilters || Object.keys(appliedFilters).length === 0) return null;
  // Flatten all pills for counting and rendering
  const allPills: FilterPill[] = [];
  Object.entries(appliedFilters).forEach(([key, filterData]) => {
    const { label, value } = filterData;

    if (key === "dateRange" && typeof value === "object" && "startDate" in value) {
      allPills.push({
        key: "dateRange",
        label: label || "Date Range",
        val: `${value.startDate} - ${value.endDate}`,
      });
    } else if (Array.isArray(value)) {
      value.forEach((item: any) => {
        let pillValue = "";
        if (item && typeof item === "object") {
          pillValue = item.label ?? item.value ?? Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(", ");
        } else {
          pillValue = String(item);
        }
        allPills.push({
          key,
          label: label || key,
          val: pillValue
        });
      });
    } else if (typeof value === "object" && "operator" in value) {
      allPills.push({
        key,
        label: label || key,
        val: `${value.operator} ${value.value}`
      });
    } else if (typeof value === "string" || typeof value === "number") {
      const cleanedValue = cleanValue(value, /^[=]+\s*/, "");
      allPills.push({
        key,
        label: label || key,
        val: cleanedValue,
      });
    } else if (typeof value === "object" && value !== null) {
      const valString = Object.entries(value)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      allPills.push({
        key,
        label: label || key,
        val: valString,
      });
    }
  });

const pillsConfig = isSearchOpen ? { maxPills: 1 } : { maxPills: 3 };
const pillsToShow = allPills.slice(0, pillsConfig.maxPills);
const pillsHiddenCount = Math.max(0, allPills.length - pillsConfig.maxPills);
  

  // Custom remove handler for dateRange
  const handleRemove = (key: string, val: string) => {
    // Handle both key === "dateRange" and key === "" (for date range pill)
    if (key === "dateRange" || (key === "" && val && val.includes(" - "))) {
      handleRemoveFilter("dateRange", "");
    } else {
      handleRemoveFilter(key, val);
    }
  };

  // Helper function to format text: replace underscores with spaces and apply title case

  return (
    <div className={styles.filterPillContainer}>
      {/* <span className={styles.divider}>|</span> */}
      <span className={styles.filtersLabel}>Filters applied:</span>
      {pillsToShow.map(({ key, val, label }, idx) => (
        <span key={`${key}-${idx}`} className={styles.filterPill}>
          {label}: {formatText(val==="unrated"?YET_TO_REVIEW_LABEL:val)}
          <button
            className={styles.removeFilterBtn}
            onClick={() => handleRemove(key, val)}
          >
            ×
          </button>
        </span>
      ))}
      {pillsHiddenCount > 0 && (
        <span
          className={styles.morePills}
          style={{ cursor: "pointer" }}
          onClick={onMoreClick}
        >
          +{pillsHiddenCount} more
        </span>
      )}
      <button className={styles.clearAllBtn} onClick={handleClearAllFilters}>
        clear all
      </button>
      <span className={styles.divider}>|</span>
    </div>
  );
};

export default FilterPills;