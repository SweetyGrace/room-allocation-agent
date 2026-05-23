import styles from "./index.module.scss";
import {
  ageMapping,
  filterOptionsMapping,
  formatDateRange,
  formattingCount,
  genderMapping,
} from "../../../utils/commonFunctions";
import Calendar from "../../../assets/images/calendar.svg";
import { WebinarFilters } from "../../MeetingAnalyticsDashboard/Analtyics.modal";
import { useDispatch, useSelector } from "react-redux";
import { setAggregatedFilters, setKpiType } from "../../../reducers/AnalyticsReducer";
import React, { useState } from "react";
import { RootState } from "../../../store";
import { Modal } from "@mui/material";
import { FilterOptions } from "../../../common/components/FilterOptions";
import CrossIcon from "../../../assets/images/cross-icon.svg";
import { Button } from "../../../common/components/Button";
import "rsuite/dist/rsuite.min.css";
import { DateRange } from "rsuite/esm/DateRangePicker";
import DateRangePicker from 'rsuite/DateRangePicker';
import { subMonths } from "date-fns";
import { endPoints } from "../../../constants/urlConstants";
import { useNavigate } from "react-router-dom";
import { AGGREGATE_KPI_TEXT } from "../../../constants";



export interface filterDataItem {
  id: number;
  name: string;
}

interface HeaderSectionProps {
  seekerDetails: { fullName: string };
  filterList: WebinarFilters;
  count?: number;
  onDateChange: (startDate: string, endDate: string) => void;
  dateRange: [Date | string, Date | string];
  setDateRange: React.Dispatch<React.SetStateAction<[Date | string, Date | string]>>;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  seekerDetails,
  filterList,
  count,
  onDateChange,
  dateRange,
  setDateRange
}) => {
  const navigate = useNavigate();
  const selectedFilters = useSelector(
    (state: RootState) => state.AnalyticsReducer.aggregatedFilters,
  );
  const dispatch = useDispatch();
  const [filterOpen, setFilterOpen] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Clean time part
  const oneMonthAgo = subMonths(today, 1); // 1 month back
  const [range, setRange] = useState<[Date, Date]>([
    oneMonthAgo,
    today,
  ]);
  const [touched, setTouched] = useState(false);
  // Temporary filters to hold changes before applying
  const [tempFilters, setTempFiltersState] =
    useState<typeof selectedFilters>(selectedFilters);

  const reorderdFilterList = {
    gender: filterList.genders,
    ageGroup: filterList.ageGroups,
    location: filterList.locations,
  };

  const defaultLabels = {
    gender: genderMapping,
    ageGroup: ageMapping,
    location: {},
  };


  // Handles changes to the temporary filter options
  const handleFilterChange = (label: string, value: string[] | string) => {
    setDateRange((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  // Clears all applied filters by resetting both tempFilters and Redux filters
  const handleClearFilter = () => {
    setTempFiltersState({
      audienceType: [],
      gender: [],
      ageGroup: [],
      location: [],
      startDate: "",
      endDate: "",
    });
    setRange(["", ""]);
  };


  // Applies the temporary filters to the Redux store
  const handleApplyFilter = () => {
    const dateFilter = {
      startDate: dateRange?.startDate,
      endDate: dateRange?.endDate,
    }
    dispatch(setAggregatedFilters(dateFilter)); // Apply filters
    setFilterOpen(false);

    // Pass the selected dates to the parent using the callback function
    if (tempFilters.startDate && tempFilters.endDate) {
      onDateChange(tempFilters.startDate, tempFilters.endDate);  // Pass the dates to parent
    }
  };

  const clearDates = () => {
    setRange(["", ""]);
    setTouched(true);
    setDateRange(["", ""]);
  };


  const handleListofDataClick = (Label: string) => {
    dispatch(setKpiType(Label));
    navigate(endPoints.aggregateSeekerDetails + `?kpiType=${Label}`);
  };
  return (
    <div>
      <div className={styles.subText}>
        <div className={styles.headerSectionDetails}>
          <div className={styles.headerSection}></div>
          <div className={styles.subTextHide}>
           Hey {seekerDetails.fullName}! View Aggregated Analytics for<span className={styles.count} onClick={()=> handleListofDataClick(AGGREGATE_KPI_TEXT.SESSIONS)} > {formattingCount(count)}</span>{" "}{count > 1? "sessions" : "session"}
          </div>
        </div>
        <div className={styles.selectInputSection}>
          <div className = {styles.datePicker} >
            <DateRangePicker
              placement="bottomEnd"
              value={
                dateRange[0] && dateRange[1]
                  ? [
                    new Date(dateRange[0]),
                    new Date(new Date(dateRange[1]).setDate(new Date(dateRange[1]).getDate() - 1)),
                  ]
                  : range
              }
              onOk={(value: DateRange) => {
                if (value && value.length === 2) {
                  const [startDate, endDate] = value;
                  setRange(value);
                  handleFilterChange("startDate", formatDateRange("startDate", value[0]));
                  handleFilterChange("endDate", formatDateRange("endDate", value[1])); // fixed typo
                  setTouched(true);
                }
              }}
              disabledDate={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date > today; // Disable future dates
              }}
              ranges={[]}
              format="dd MMM yyyy"
              onClean={clearDates}
            />
            <div className={styles.borderLine}></div>
            <img src = {Calendar}/>
          </div>
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
                    <div className={styles.optionText}>
                      {filterOptionsMapping[key]}
                    </div>
                    <div className={styles.barhorizontalline}></div>
                  </div>
                  <div className={styles.options}>
                    <FilterOptions
                      filters={value}
                      filterLabels={
                        defaultLabels[key as keyof typeof defaultLabels]
                      }
                      selectedFilters={
                        tempFilters[key as keyof typeof tempFilters] || []
                      }
                      onChange={(updatedFilters: string[]) =>
                        handleFilterChange(key, updatedFilters)
                      }
                    />
                  </div>
                </div>
              ) : null,
            )}
            <div className={styles.filterOptions}>
              <div className={styles.optionsHeader}>
                <div className={styles.optionText}>Date Range</div>
                <div className={styles.barhorizontalline}></div>
              </div>
              <div className={styles.options}>
                <DateRangePicker
                  value={
                    tempFilters.startDate && tempFilters.endDate
                      ? [
                        new Date(tempFilters.startDate),
                        new Date(
                          new Date(tempFilters.endDate).setDate(
                            new Date(tempFilters.endDate).getDate() - 1,
                          ),
                        ),
                      ]
                      : range
                  }
                  onOk={(value: DateRange) => {
                    setRange(value);
                    handleFilterChange(
                      "startDate",
                      formatDateRange("startDate", value[0]),
                    );
                    handleFilterChange(
                      "endDate",
                      formatDateRange("endDate", value[1]),
                    );
                    setTouched(true);

                  }}
                  limitEndYear={0}
                  placement="rightEnd"
                  onClean={() => {
                    setRange(["", ""]);
                    setTouched(true); // mark as touched if user clears the picker
                  }}
                  error={!touched && (range[0] === "" || range[1] === "")}
                  ranges={[]}
                />
              </div>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <span
              className={styles.cancelText}
              onClick={() => handleClearFilter()}
            >
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