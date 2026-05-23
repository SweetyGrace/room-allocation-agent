import { useEffect, useState, useRef } from "react";
import SideDrawerOverlay from "../../SideOverLay";
import { Button } from "../../../common/components/Button";
import { Button as MuiButton } from "../../components/Common/Button";
import styles from "./index.module.scss";
import CheckBoxChecked from "../../../assets/images/checkBoxChecked.svg";
import CheckBoxUnchecked from "../../../assets/images/checkboxUnchecked.svg";
import RadioUnchecked from "../../../assets/images/radioUncheck.svg";
import MultiSelect from "../../../pages/SearchProp";
import dropdownDown from "../../../assets/images/dropdownDown.svg";
import StarIcon from "../../../assets/images/star.svg";
import CloseIcon from "../../../assets/images/close-cross.svg";
import DateRangePicker, { DateRange } from "rsuite/DateRangePicker";
import { colorizeMahatriaInfinitheism } from "../../../common/components/ColorizeMahatriaInfinitheism";
import { FormControl, Select, MenuItem } from "@mui/material";
import { FILTER_TYPES, NO_OF_HDBS } from "../../../constants/textConstants";

// Update interface for selected state
interface FilterValue {
  value: Array<{
    value: string;
    label: string;
  }> | {
    operator?: string;
    value?: string;
  };
  label: string;
}

interface Selected {
  [key: string]: FilterValue;
}

type AdminFilterOverlayProps = {
  open: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  userRoles?: string[];
  initialFilters?: any;
  displayFilters?: any;
  customClass?: string;
};

const AdminFilterOverlay = ({
  open,
  onClose,
  userRoles = [],
  onApply,
  initialFilters,
  displayFilters,
  customClass = "",
}: AdminFilterOverlayProps) => {
  // If you want to add role-based filters, do it here before setFilters
  const [filters, setFilters] = useState<any[]>(displayFilters);
  // State for each filter type
  const [selected, setSelected] = useState<Selected>(initialFilters || {});
  const [rangeOperator, setRangeOperator] = useState(">=");
  const [rangeValue, setRangeValue] = useState("");
  const [selectedDropdowns, setSelectedDropdowns] = useState<{ [key: string]: string[] }>({});
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [multiFilters, setMultiFilters] = useState<{ [key: string]: { operator: string; value1: string; value2?: string } }>({});
  // Dummy trigger for demonstration (replace with your form trigger if needed)
  const trigger = (_field?: string) => { };
  const [placement, setPlacement] = useState<"bottomStart" | "topStart">(
    "bottomStart",
  );
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const handleOpen = () => {
    if (calendarRef.current) {
      const rect = calendarRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Assume calendar height around 300px
      if (spaceBelow < 300 && spaceAbove > 300) {
        setPlacement("topStart");
      } else {
        setPlacement("bottomStart");
      }
    }

    setCalendarOpen(true);
  };

  // Handler for date range change
  const handleDateRangeChange = (value: DateRange | null) => {
    setDateRange(value);
    setDateError(null); // Clear error on change
  };
  useEffect(() => {
    if (initialFilters) {
      // Normalize numberOfHdbs to expected format
      let normalizedFilters = initialFilters;
      if (initialFilters.numberOfHdbs) {
        const nHdbs = initialFilters.numberOfHdbs;
        let rawValue = nHdbs.value;
        let dynamicValue;
        if (typeof rawValue === "string") {
          dynamicValue = rawValue;
        } else if (Array.isArray(rawValue)) {
          dynamicValue = rawValue[0]?.value ?? rawValue[0] ?? "";
        } else if (typeof rawValue === "object" && rawValue !== null) {
          dynamicValue = rawValue.value ?? "";
        } else {
          dynamicValue = String(rawValue ?? "");
        }
        normalizedFilters = {
          ...initialFilters,
          numberOfHdbs: {
            label: NO_OF_HDBS,
            value: dynamicValue
          }
        };
      }
      setSelected(normalizedFilters);
      // set other filter states if needed, e.g. range, dropdown, etc.

      // Prefill range values if present
      if (
        normalizedFilters.numberOfHdbs &&
        typeof normalizedFilters.numberOfHdbs === "object"
      ) {
        setRangeOperator(normalizedFilters.numberOfHdbs.operator || ">=");
        setRangeValue(normalizedFilters.numberOfHdbs.value || "");
      } else {
        setRangeOperator(">=");
        setRangeValue("");
      }
      // Optimized multiSelections logic
const multiSelections: { [key: string]: { operator: string; value1: string; value2?: string } } = {};
(filters as any[])
  ?.filter((filter: any) => filter.type === FILTER_TYPES.MULTI)
  .forEach((filter: any) => {
    const filterKey = filter.key;
    const filterInitial = (normalizedFilters as any)[filterKey];

    // Normalize value to string
    let rawValue = '';
    if (typeof filterInitial === 'string' || typeof filterInitial === 'number') {
      rawValue = String(filterInitial);
    } else if (filterInitial && typeof filterInitial === "object" && filterInitial.value != null) {
      rawValue = String(filterInitial.value);
    }

    // Parse operator and values
    if (rawValue) {
      if (rawValue.includes('-')) {
        const [value1 = '', value2 = ''] = rawValue.split('-');
        multiSelections[filterKey] = { operator: '-', value1, value2 };
      } else {
        const operator = rawValue[0] || (filter.options?.[0]?.value ?? '<');
        const value1 = rawValue.slice(1);
        multiSelections[filterKey] = { operator, value1 };
      }
    } else {
      multiSelections[filterKey] = { operator: filter.options?.[0]?.value || '<', value1: '', value2: '' };
    }
  });
setMultiFilters(multiSelections);

      // Prefill dropdown filters (handle multiple)
      const dropdownSelections: { [key: string]: string[] } = {};
      filters
        .filter((filter: any) => filter.type === FILTER_TYPES.DROPDOWN)
        .forEach((filter: any) => {
          let dropdownValues: string[] = [];
          const filterKey = filter.key;
          const filterInitial = normalizedFilters[filterKey];
          if (filterInitial) {
            if (Array.isArray(filterInitial)) {
              dropdownValues = filterInitial;
            } else if (
              filterInitial.value &&
              Array.isArray(filterInitial.value)
            ) {
              dropdownValues = filterInitial.value.map((item: any) => item.value);
            }
          }
          dropdownSelections[filterKey] = dropdownValues;
        });
      setSelectedDropdowns(dropdownSelections);

      // Prefill date range if present
      if (normalizedFilters.dateRange) {
        const dateRangeData = normalizedFilters.dateRange.value || normalizedFilters.dateRange;
        if (dateRangeData.startDate && dateRangeData.endDate) {
          const parseDate = (str: string) => {
            const [day, month, year] = str.split("/");
            return new Date(Number(year), Number(month) - 1, Number(day));
          };
          setDateRange([
            parseDate(dateRangeData.startDate),
            parseDate(dateRangeData.endDate),
          ]);
        } else {
          setDateRange(null);
        }
      } else {
        setDateRange(null);
      }
    } else {
      setSelected({});
      setRangeOperator(">=");
      setRangeValue("");
      setSelectedDropdowns({});
      setDateRange(null);
      setMultiFilters({});
    }
  }, [initialFilters, open]);
  // Reset all filters
  const handleReset = () => {
    setSelected({});
    setRangeOperator(">=");
    setRangeValue("");
    setSelectedDropdowns({});
    setDateRange(null); // Reset date range
    setDateError(null); // Clear any previous error
    setMultiFilters({});
  };

  // First, create a type for the filter object
  type FilterObjectType = {
    [key: string]: {
      value: string | string[];
      label: string;
    };
  };

  // Update the handleApply function
  const handleApply = () => {
    // Validate date range
    if (dateRange && (dateRange[0] || dateRange[1])) {
      const isValidDate = (d: any) => d instanceof Date && !isNaN(d.getTime());
      if (!isValidDate(dateRange[0]) || !isValidDate(dateRange[1])) {
        setDateError("Please select a valid date range.");
        return;
      }
    }
    setDateError(null); // Clear any previous error

    const filterObj: FilterObjectType = {};

    // Update how we store filters to include labels
    Object.entries(selected).forEach(([key, value]) => {
      // Skip dateRange and range filters as we handle them separately
      if (key === 'dateRange') return;
      
      const filterConfig = filters.find(filter => filter.key === key);
      if (filterConfig) {
        filterObj[key] = {
          value: value.value,
          label: filterConfig.label
        };
      }
    });


    // Store dropdown filters
    filters
      .filter((filter: any) => filter.type === FILTER_TYPES.DROPDOWN)
      .forEach((filter: any) => {
      const dropdownValues = selectedDropdowns[filter.key] || [];
        filterObj[filter.key] = {
          label: filter.label,
          value: dropdownValues.map(value => {
            const option = filter.options.find((opt: any) => opt.value === value);
            return {
              value: value,
              label: option?.label || value
            };
          })
        };
      });
    filters
      .filter((filter: any) => filter.type === FILTER_TYPES.MULTI)
      .forEach((filter: any) => {
        const { key, label } = filter;
        const multiFilter = multiFilters[key];

        // If no value1, or (operator is '-' and no value2), remove from applied filters
        if (
          !multiFilter ||
          !multiFilter.value1 ||
          (multiFilter.operator === '-' && !multiFilter.value2)
        ) {
          // Explicitly remove from filterObj if present
          if (filterObj[key]) {
            delete filterObj[key];
          }
          return;
        }

        let value = '';
        if (multiFilter.operator === '-' && multiFilter.value2) {
          value = `${multiFilter.value1}-${multiFilter.value2}`;
        } else if (multiFilter.operator && multiFilter.value1) {
          value = `${multiFilter.operator}${multiFilter.value1}`;
        }

        if (value) {
          filterObj[key] = { value, label };
        }
      });

    // Update date range to include label - ONLY if dateRange has valid values
    if (dateRange && dateRange[0] && dateRange[1]) {
      const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      const dateFilter = filters.find(filter => filter.type === FILTER_TYPES.DATE);
      filterObj.dateRange = {
        value: {
          startDate: formatDate(dateRange[0] as Date),
          endDate: formatDate(dateRange[1] as Date)
        },
        label: dateFilter?.label || 'Date Range'
      };
    }

    if (onApply) onApply(filterObj);
    onClose();
  };

  // Update handleChange function
  const handleChange = (
    filterKey: string, 
    value: string, 
    type: string, 
    filterLabel: string, 
    optionLabel: string
  ) => {
    setSelected((prev) => {
      const updated = { ...prev };

      if (type === "checkbox") {
        const prevArr = Array.isArray(prev[filterKey]?.value)
          ? (prev[filterKey]?.value as Array<{ value: string; label: string }>)
          : [];

        const valueExists = prevArr.some(item => item.value === value);
        const newArr = valueExists
          ? prevArr.filter(item => item.value !== value)
          : [...prevArr, { value, label: optionLabel }];

        if (newArr.length === 0) {
          delete updated[filterKey];
        } else {
          updated[filterKey] = {
            value: newArr,
            label: filterLabel
          };
        }
      } else {
        updated[filterKey] = {
          value: { value, label: optionLabel },
          label: filterLabel
        };
      }

      return updated;
    });
  };

  // Modified scroll handler - only close if scrolling outside the calendar popup
  useEffect(() => {
    if (!calendarOpen) return;
    
    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement;
      
      // Don't close if scrolling within the calendar popup or its children
      if (target && (
        target.closest('.rs-picker-popup') || 
        target.closest('.rs-calendar') ||
        target.closest('.rs-picker-daterange-menu') ||
        target.classList.contains('rs-picker-popup') ||
        target.classList.contains('rs-calendar')
      )) {
        return;
      }
      
      setCalendarOpen(false);
    };
    
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [calendarOpen]);

  return (
    <SideDrawerOverlay
      open={open}
      grayLine={true}
      onClose={onClose}
      headerText="Filters"
      customClass={customClass}
      footer={
        <>
          <MuiButton
            variant="outline"
            className={styles.cancelButton}
            onClick={handleReset}
          >
            reset
          </MuiButton>
          <Button
            buttonTextClassName={styles.saveButtonText}
            buttonClassName={styles.saveButton}
            onClick={handleApply}
          >
            <span className={styles.saveButtonTextCenter}>apply</span>
          </Button>
        </>
      }
    >
      <div className={styles.filterContainer}>
        {filters.map((filter: any) => (
          <div key={filter.key} className={styles.filterRow}>
            <div className={styles.filterFieldName}>
              {colorizeMahatriaInfinitheism(filter.label)}
            </div>
            <div className={styles.filterButtons}>
              {filter.type === FILTER_TYPES.RANGE ? (
                <div className={styles.hdbFilterRow}>
                  <select
                    value={rangeOperator}
                    onChange={(e) => setRangeOperator(e.target.value)}
                    className={styles.hdbSelectWithIcon}
                  >
                    {filter.operators.map((option: any) => (
                      <option key={option?.value} value={option?.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type= {FILTER_TYPES.INPUT_TYPE}
                    min={0}
                    value={rangeValue}
                    onChange={(e) =>
                      setRangeValue(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    className={styles.hdbInputFlex}
                  />
                </div>
              ) : filter.type === FILTER_TYPES.MULTI ? (
                <div className={styles.hdbFilterRow}>
                  {/* MUI Dropdown for operator */}
                  <FormControl className={styles.muiSelectContainer}>
                    <Select
                      value={multiFilters[filter.key]?.operator || filter.options[0]?.value || ''}
                      onChange={(e) => {
                        const operator = e.target.value;
                        setMultiFilters(prev => ({
                          ...prev,
                          [filter.key]: {
                            operator,
                            value1: '', 
                            value2: ''
                          }
                        }));
                      }}
                      displayEmpty
                      className={styles.muiSelect}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#E5E7EB',
                          },
                          '&:hover fieldset': {
                            borderColor: '#D1D5DB',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3B82F6',
                          },
                        },
                        '& .MuiSelect-select': {
                          padding: '8px 32px 8px 12px',
                          fontSize: '14px',
                          color: '#374151',
                        },
                      }}
                    >
                      {filter.options.map((option: any) => (
                        <MenuItem key={option?.value} value={option?.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {/* First input for "between" option */}
                  {multiFilters[filter.key]?.operator === '-' && (
                    <input
                      type={FILTER_TYPES.INPUT_TYPE}
                      min={0}
                      value={multiFilters[filter.key]?.value1 || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        setMultiFilters(prev => ({
                          ...prev,
                          [filter.key]: {
                            ...prev[filter.key],
                            operator: '-',
                            value1: value
                          }
                        }));
                      }}
                      className={styles.hdbInputFlex}
                      placeholder="Min"
                    />
                  )}
                  
                  {/* Main input field */}
                  <input
                    type={FILTER_TYPES.INPUT_TYPE}
                    min={0}
                    value={multiFilters[filter.key]?.operator === '-' 
                      ? (multiFilters[filter.key]?.value2 || '') 
                      : (multiFilters[filter.key]?.value1 || '')
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      const isRange = multiFilters[filter.key]?.operator === '-';
                      
                      setMultiFilters(prev => ({
                        ...prev,
                        [filter.key]: {
                          ...prev[filter.key],
                          operator: prev[filter.key]?.operator || filter.options[0]?.value,
                          [isRange ? 'value2' : 'value1']: value
                        }
                      }));
                    }}
                    className={styles.hdbInputFlex}
                    placeholder={multiFilters[filter.key]?.operator === '-' ? "Max" : "Value"}
                  />
                </div>
              ) : filter.type === FILTER_TYPES.DATE ? (
                <div className={styles.datePickerWrapper} ref={calendarRef}>
                <div className={styles.datePickerContainer}>
                  <DateRangePicker
                    placement={placement}
                    value={dateRange}
                    onChange={(value) => {
                      handleDateRangeChange(value);
                      trigger("startDate");
                      trigger("endDate");
                    }}
                    ranges={[]}
                    format="dd/MM/yyyy"
                    onClean={() => setDateRange(null)}
                    placeholder="Select program date range"
                    style={{ width: "100%" }}
                    className={`${styles.datePicker} ${styles.datePickerGrayBorder}`}
                    onBlur={() => {
                      trigger("startDate");
                      trigger("endDate");
                    }}
                    onOpen={handleOpen}
                    onClose={() => setCalendarOpen(false)}
                    open={calendarOpen}
                  />
                  {dateRange && dateRange[0] && dateRange[1] && (
                    <img
                      src={CloseIcon}
                      alt="Clear date"
                      className={styles.clearDateIcon}
                      onClick={() => {
                        setDateRange(null);
                        setDateError(null);
                      }}
                    />
                  )}
                </div>
                  {dateError && (
                    <div className={styles.dateError}>{dateError}</div>
                  )}
                </div>
              ) : filter.type === FILTER_TYPES.DROPDOWN ? (
                <MultiSelect
                  options={filter.options.map((opt: any) => ({
                    label: opt.label,
                    value: opt.value
                  }))}
                  selected={(selectedDropdowns[filter.key] || []).map(value => {
                    const option = filter.options.find((opt: any) => opt.value === value);
                    return {
                      label: option?.label || value,
                      value: value
                    };
                  })}
                  setSelected={(selected) => {
                    setSelectedDropdowns(prev => ({
                      ...prev,
                      [filter.key]: selected.map(item => item.value)
                    }));
                  }}
                  closeOnClickOutside={true}
                  placeholder={filter.label}
                />
              ) : (
                filter.options.map((option: any) => (
                  <label key={option?.value} className={styles.filterButton}>
                    <input
                      type={filter.type}
                      name={filter.key}
                      checked={
                        filter.type === FILTER_TYPES.CHECKBOX
                          ? Array.isArray(selected[filter.key]?.value)
                            ? (selected[filter.key]?.value as Array<{ value: string }>)
                              .some(item => item.value === option?.value)
                            : false
                          : selected[filter.key]?.value?.value === option?.value
                      }
                      value={option?.value}
                      onChange={() =>
                        handleChange(
                          filter.key,
                          option?.value,
                          filter.type,
                          filter.label,
                          option?.label
                        )
                      }
                      style={{ display: "none" }}
                    />
                    <img
                      src={
                        filter.type === FILTER_TYPES.CHECKBOX
                          ? Array.isArray(selected[filter.key]?.value)
                            ? (selected[filter.key]?.value as Array<{ value: string }>)
                              .some(item => item.value === option?.value)
                              ? CheckBoxChecked
                              : CheckBoxUnchecked
                            : CheckBoxUnchecked
                          : selected[filter.key]?.value?.value === option?.value
                            ? "RadioChecked"
                            : RadioUnchecked
                      }
                      alt={
                        filter.type === FILTER_TYPES.CHECKBOX
                          ? Array.isArray(selected[filter.key]?.value)
                            ? (selected[filter.key]?.value as Array<{ value: string }>)
                              .some(item => item.value === option?.value)
                              ? "Checked"
                              : "Unchecked"
                            : "Unchecked"
                          : selected[filter.key]?.value?.value === option?.value
                            ? "Checked"
                            : "Unchecked"
                      }
                      className={
                        filter.type === FILTER_TYPES.CHECKBOX
                          ? styles.customCheckbox
                          : styles.customRadio
                      }
                    />
                    <div className={styles.starContainer}>
                      {filter.type === FILTER_TYPES.CHECKBOX &&
                        filter.label === "RM rating" &&
                        option.label !== "Yet to review" && (
                          <img
                            src={StarIcon}
                            alt="star"
                            className={styles.starIcon}
                          />
                        )}
                      <span className={styles.filterOptionLabel}>
                        {colorizeMahatriaInfinitheism(option.label)}
                      </span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </SideDrawerOverlay>
  );
};

export default AdminFilterOverlay;