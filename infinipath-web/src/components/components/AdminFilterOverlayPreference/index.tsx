import { useEffect, useState, useRef } from "react";
import SideDrawerOverlay from "../../SideOverLay";
import { Button } from "../../../common/components/Button";
import { Button as MuiButton } from "../../components/Common/Button";
import styles from "./index.module.scss";
import CheckBoxChecked from "../../../assets/images/checkBoxChecked.svg";
import CheckBoxUnchecked from "../../../assets/images/checkboxUnchecked.svg";
import RadioUnchecked from "../../../assets/images/radioUncheck.svg";
import dropdownDown from "../../../assets/images/dropdownDown.svg";
import StarIcon from "../../../assets/images/star.svg";
import DateRangePicker, { DateRange } from "rsuite/DateRangePicker";
import MultiSelect from "../../../pages/MultiSelect";
import { FormControl, Select, MenuItem } from "@mui/material";

type AdminFilterOverlayProps = {
  open: boolean;
  onClose: () => void;
  onApply: (filters: unknown) => void;
  userRoles?: string[];
  initialFilters?: unknown;
  displayFilters?: unknown;
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
  const [filters, setFilters] = useState<unknown[]>(displayFilters);
  // State for each filter type
  const [selected, setSelected] = useState<{
    [key: string]: string | string[];
  }>(initialFilters || {});
  const [rangeOperator, setRangeOperator] = useState(">=");
  const [rangeValue, setRangeValue] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const trigger = (_field?: string) => {};
  const clearDates = () => setDateRange([null, null]);
  const [placement, setPlacement] = useState<"bottomStart" | "topStart">(
    "bottomStart",
  );
  const [dateRange, setDateRange] = useState(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [multiFilters, setMultiFilters] = useState<{ [key: string]: { operator: string; value1: string; value2?: string } }>({});

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
      setSelected(initialFilters);

      // Prefill range values if present
      if (
        initialFilters.numberOfHdbs &&
        typeof initialFilters.numberOfHdbs === "object"
      ) {
        setRangeOperator(initialFilters.numberOfHdbs.operator || ">=");
        setRangeValue(initialFilters.numberOfHdbs.value || "");
      } else {
        setRangeOperator(">=");
        setRangeValue("");
      }

      // FIXED: Multi filters initialization
      const multiSelections: { [key: string]: { operator: string; value1: string; value2?: string } } = {};
      (filters as any[])
        ?.filter((filter: any) => filter.type === "multi")
        .forEach((filter: any) => {
          const filterKey = filter.key;
          const filterInitial = (initialFilters as any)[filterKey];
          
          // Check if filterInitial is a direct string value or an object
          let value = '';
          if (typeof filterInitial === 'string') {
            // Direct string value like "<10", ">5", "3-8"
            value = filterInitial;
          } else if (filterInitial && typeof filterInitial === "object" && filterInitial.value) {
            // Object with value property like {label: "...", value: "<10"}
            value = filterInitial.value;
          }
          
          if (value) {
            if (value.includes('-')) {
              // Range value like "3-8"
              const [val1, val2] = value.split('-');
              multiSelections[filterKey] = { operator: '-', value1: val1, value2: val2 };
            } else {
              // Single operator value like "<10", ">5", "=3"
              const operator = value.charAt(0); // '<', '>', '='
              const val = value.slice(1); // '10', '5', '3'
              multiSelections[filterKey] = { operator, value1: val };
            }
          } else {
            // Default initialization
            multiSelections[filterKey] = { operator: filter.options[0]?.value || '<', value1: '', value2: '' };
          }
        });
      setMultiFilters(multiSelections);

      // Rest of your existing date initialization code...
      if (
        initialFilters.dateRange &&
        initialFilters.dateRange.startDate &&
        initialFilters.dateRange.endDate
      ) {
        const parseDate = (str: string) => {
          const [day, month, year] = str.split("/");
          return new Date(Number(year), Number(month) - 1, Number(day));
        };
        setDateRange([
          parseDate(initialFilters.dateRange.startDate),
          parseDate(initialFilters.dateRange.endDate),
        ]);
      } else {
        setDateRange([null, null]);
      }
    } else {
      setSelected({});
      setRangeOperator(">=");
      setRangeValue("");
      setDateRange([null, null]);
      setMultiFilters({});
    }
  }, [initialFilters, open]);
  // Reset all filters
  const handleReset = () => {
    setSelected({});
    setRangeOperator(">=");
    setRangeValue("");
    setDateRange([null, null]); // Reset date range
    setDateError(null); // Clear any previous error
    setMultiFilters({});
  };

  // Apply filters
  const handleApply = () => {
    // Validate date range
    if (dateRange && (dateRange[0] || dateRange[1])) {
      const isValidDate = (d: unknown) => d instanceof Date && !isNaN(d.getTime());
      if (!isValidDate(dateRange[0]) || !isValidDate(dateRange[1])) {
        setDateError("Please select a valid date range.");
        return;
      }
    }
    setDateError(null);

    const filterObj: any = {};

    Object.entries(selected).forEach(([key, value]) => {
      filterObj[key] = value;
    });

    // Range filter
    if (rangeValue) {
      filterObj.numberOfHdbs = `${rangeValue}`
    }

    // Add multi filters processingxs
    (filters as any[])
      ?.filter((filter: any) => filter.type === "multi")
      .forEach((filter: any) => {
        const filterKey = filter.key;
        const multiFilter = multiFilters[filterKey];
        
        if (multiFilter && multiFilter.value1) {
          let value = '';
          if (multiFilter.operator === '-' && multiFilter.value2) {
            value = `${multiFilter.value1}-${multiFilter.value2}`;
          } else if (multiFilter.operator !== '-') {
            value = `${multiFilter.operator}${multiFilter.value1}`;
          }
          
          if (value) {
            filterObj[filterKey] = `${value}`
          }
        }
        else {
          filterObj[filterKey] = ""
        }
      });

    if (dateRange && dateRange[0] && dateRange[1]) {
      // Convert Date objects to string format "dd/MM/yyyy"
      const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };
      filterObj.dateRange = {
        startDate: formatDate(dateRange[0] as Date),
        endDate: formatDate(dateRange[1] as Date),
      };
    }
    if (onApply) onApply(filterObj);
    onClose();
  };

  // Handler for checkbox and radio
  const handleChange = (
    filterKey: string,
    value: string | string[],
    type: string,
  ) => {
    setSelected((prev) => {
      const updated = { ...prev };

      if (type === "checkbox") {
        const prevArr = Array.isArray(prev[filterKey])
          ? (prev[filterKey] as string[])
          : [];

        const newArr = prevArr.includes(value as string)
          ? prevArr.filter((v) => v !== value)
          : [...prevArr, value as string];

        if (newArr.length === 0) {
          delete updated[filterKey];
        } else {
          updated[filterKey] = newArr;
        }
      } else if (type === "dropdown") {
        updated[filterKey] = Array.isArray(value) ? value : [value];
      } else {
        updated[filterKey] = value;
      }

      return updated;
    });
  };

  useEffect(() => {
    if (!calendarOpen) return;
    const handleScroll = () => {
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
            // disabled={
            //   Object.keys(selected).length === 0 &&
            //   !rangeValue &&
            //   selectedLocation.length === 0 &&
            //   (!dateRange || !dateRange[0] || !dateRange[1])
            // }
          >
            reset
          </MuiButton>
          <Button
            buttonTextClassName={styles.saveButtonText}
            buttonClassName={styles.saveButton}
            onClick={handleApply}
            // disable={
            //   Object.keys(selected).length === 0 &&
            //   !rangeValue &&
            //   selectedLocation.length === 0 &&
            //   (!dateRange || !dateRange[0] || !dateRange[1])
            // }
          >
            <span className={styles.saveButtonTextCenter}>apply</span>
          </Button>
        </>
      }
    >
      <div className={styles.filterContainer}>
        {filters.map((filter: unknown) => (
          <div key={filter.key} className={styles.filterRow}>
            <div className={styles.filterFieldName}>{filter.label}</div>
            <div className={styles.filterButtons}>
              {filter.type === "range" ? (
                <div className={styles.hdbFilterRow}>
                  <select
                    value={rangeOperator}
                    onChange={(e) => setRangeOperator(e.target.value)}
                    className={styles.hdbSelectWithIcon}
                  >
                    {filter.operators.map((option: unknown) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={rangeValue}
                    onChange={(e) =>
                      setRangeValue(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    className={styles.hdbInputFlex}
                  />
                </div>
              ) : filter.type === "multi" ? (
                <div className={styles.hdbFilterRow}>
                  {/* Show first input for "between" option */}
               
                  
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
                  {multiFilters[filter.key]?.operator === '-' && (
                    <input
                      type="number"
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
                    type="number"
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
              ) : filter.type === "date" ? (
                <div className={styles.datePickerWrapper} ref={calendarRef}>
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
                  {dateError && (
                    <div className={styles.dateError}>{dateError}</div>
                  )}
                </div>
              ) : filter.type === "dropdown" ? (
                <MultiSelect
                  options={filter.options.map((opt: any) => opt.label)} // strings only
                  selected={
                    Array.isArray(selected[filter.key])
                      ? selected[filter.key].map((val: string) => {
                          const option = filter.options.find(
                            (opt: any) => opt.value === val,
                          );
                          return option?.label || val;
                        })
                      : []
                  }
                  setSelected={(labels) => {
                    const values = labels.map((label: string) => {
                      const option = filter.options.find(
                        (opt: any) => opt.label === label,
                      );
                      return option?.value || label;
                    });
                    handleChange(filter.key, values, "dropdown"); // values = string[]
                  }}
                  closeOnClickOutside={true}
                  placeholder={filter.label}
                />
              ) : (
                filter.options.map((option: unknown) => (
                  <label key={option.value} className={styles.filterButton}>
                    <input
                      type={filter.type}
                      name={filter.key}
                      checked={
                        filter.type === "checkbox"
                          ? (
                            selected[filter.key] as string[] | undefined
                          )?.includes(option.value) || false
                          : selected[filter.key] === option.value
                      }
                      value={option.value}
                      onChange={() =>
                        handleChange(filter.key, option.value, filter.type)
                      }
                      style={{ display: "none" }}
                    />
                    <img
                      src={
                        filter.type === "checkbox"
                          ? (
                            selected[filter.key] as string[] | undefined
                          )?.includes(option.value)
                            ? CheckBoxChecked
                            : CheckBoxUnchecked
                          : selected[filter.key] === option.value
                            ? "RadioChecked"
                            : RadioUnchecked
                      }
                      alt={
                        filter.type === "checkbox"
                          ? (
                            selected[filter.key] as string[] | undefined
                          )?.includes(option.value)
                            ? "Checked"
                            : "Unchecked"
                          : selected[filter.key] === option.value
                            ? "Checked"
                            : "Unchecked"
                      }
                      className={
                        filter.type === "checkbox"
                          ? styles.customCheckbox
                          : styles.customRadio
                      }
                    />
                    {filter.type === "checkbox" &&
                      filter.label === "RM rating" && option.label !== "Yet to review" && (
                        <img
                          src={StarIcon}
                          alt="star"
                          className={styles.starIcon}
                        />
                      )}
                    {option.label}
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

