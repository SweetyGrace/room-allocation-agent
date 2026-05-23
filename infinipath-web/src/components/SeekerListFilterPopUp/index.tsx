/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import styles from "./index.module.scss";
import FormLine from "../../common/components/FormLine";
import closeIcon from "../../assets/images/closeIcon.svg";
import CustomRadioButton from "../../common/components/CustomRadioButton";
import { Button } from "../../common/components/Button";
import CustomCheckbox from "../../common/components/CustomCheckBox";
import { FormControl, Select, MenuItem } from "@mui/material";
import DateRangePicker, { DateRange } from "rsuite/DateRangePicker";
import MultiSelect from "../../pages/MultiSelect";

// Update the interface to handle different types
interface seekersFilters {
  [key: string]: string | string[] | any[] | { startDate: string; endDate: string };
}

interface seekerListFilterPopUpProps {
  onApplyClick: (selectedFilters: seekersFilters) => void;
  onClose: () => void;
  seekersFilters: seekersFilters;
  setLoader: React.Dispatch<React.SetStateAction<boolean>>;
  subProgramId?: string | undefined;
  filterData: any;
  setFilterData: React.Dispatch<React.SetStateAction<any>>;
}

const SeekerListFilterPopUp: React.FC<seekerListFilterPopUpProps> = ({
  onApplyClick,
  onClose,
  seekersFilters,
  setLoader,
  subProgramId,
  filterData,
  setFilterData
}) => {
  const [checkedState, setCheckedState] = useState<seekersFilters>(seekersFilters);
  const [disable, setDisable] = useState(true);
  
  // Add state for range and multi filters
  const [rangeFilters, setRangeFilters] = useState<{ [key: string]: { operator: string; value: string } }>({});
  const [multiFilters, setMultiFilters] = useState<{ [key: string]: { operator: string; value1: string; value2?: string } }>({});
  
  // Add state for date filters
  const [dateFilters, setDateFilters] = useState<{ [key: string]: [Date | null, Date | null] }>({});
  const [dateErrors, setDateErrors] = useState<{ [key: string]: string | null }>({});
  const [calendarOpen, setCalendarOpen] = useState<{ [key: string]: boolean }>({});
  const [placement, setPlacement] = useState<"bottomStart" | "topStart">("bottomStart");
  const calendarRef = useRef<HTMLDivElement>(null);

  // Initialize filter states from data
  useEffect(() => {
    if (filterData && filterData.length > 0) {
      const initialState: seekersFilters = {};
      const initialRangeFilters: { [key: string]: { operator: string; value: string } } = {};
      const initialMultiFilters: { [key: string]: { operator: string; value1: string; value2?: string } } = {};
      const initialDateFilters: { [key: string]: [Date | null, Date | null] } = {};
      
      filterData.forEach((filter: any) => {
        const filterValue = seekersFilters[filter.key];

        if ((filter.type === 'checkbox' || filter.type === 'radio') && filter.options) {
          initialState[filter.key] = filterValue || (filter.type === 'radio' ? '' : []);
        } else if (filter.type === 'dropdown') {
          initialState[filter.key] = filterValue || [];
        } else if (filter.type === 'range') {
          if (typeof filterValue === 'string' && filterValue) {
            initialRangeFilters[filter.key] = { 
              operator: filter.operators?.[0]?.value || '>=', 
              value: filterValue 
            };
          } else {
            initialRangeFilters[filter.key] = { 
              operator: filter.operators?.[0]?.value || '>=', 
              value: '' 
            };
          }
        } else if (filter.type === 'multi') {
          if (typeof filterValue === 'string' && filterValue) {
            if (filterValue.includes('-')) {
              const [val1, val2] = filterValue.split('-');
              initialMultiFilters[filter.key] = { operator: '-', value1: val1, value2: val2 };
            } else {
              initialMultiFilters[filter.key] = {
                operator: filterValue.charAt(0),
                value1: filterValue.slice(1)
              };
            }
          } else {
            initialMultiFilters[filter.key] = { 
              operator: filter.options?.[0]?.value || '<', 
              value1: '', 
              value2: '' 
            };
          }
        } else if (filter.type === 'date') {
          if (filterValue && typeof filterValue === 'object' && 'startDate' in filterValue && 'endDate' in filterValue) {
            const parseDate = (str: string) => {
              const [day, month, year] = str.split("/");
              return new Date(Number(year), Number(month) - 1, Number(day));
            };
            initialDateFilters[filter.key] = [
              parseDate(filterValue.startDate),
              parseDate(filterValue.endDate)
            ];
          } else {
            initialDateFilters[filter.key] = [null, null];
          }
        }
      });
      
      setCheckedState(prev => ({ ...initialState, ...prev }));
      setRangeFilters(initialRangeFilters);
      setMultiFilters(initialMultiFilters);
      setDateFilters(initialDateFilters);
    } 
  }, [filterData]);

  // Update disable state logic to include all filter types
  useEffect(() => {
    const hasCheckboxFilters = Object.values(checkedState).some(
      (value) => (Array.isArray(value) && value.length > 0) || (typeof value === 'string' && value !== '')
    );
    const hasRangeFilters = Object.values(rangeFilters).some(
      (filter) => filter.value !== ''
    );
    const hasMultiFilters = Object.values(multiFilters).some(
      (filter) => filter.value1 !== ''
    );
    const hasDateFilters = Object.values(dateFilters).some(
      (dateRange) => dateRange[0] !== null && dateRange[1] !== null
    );
    
    setDisable(!hasCheckboxFilters && !hasRangeFilters && !hasMultiFilters && !hasDateFilters);
  }, [checkedState, rangeFilters, multiFilters, dateFilters]);

  // Handle calendar scroll
  useEffect(() => {
    const openKeys = Object.keys(calendarOpen).filter(key => calendarOpen[key]);
    if (openKeys.length === 0) return;

    const handleScroll = () => setCalendarOpen({});
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [calendarOpen]);

  // Handle checkbox/radio change with support for objects
  const handleChange = (filterKey: string, value: any, filterType: string) => (event: ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;

    if (filterType === 'radio') {
      setCheckedState((prevState) => ({
        ...prevState,
        [filterKey]: value,
      }));
    } else if (filterKey === "gender") {
      setCheckedState((prevState) => ({
        ...prevState,
        [filterKey]: isChecked ? [Array.isArray(value) ? value[0] : value] : [],
      }));
    } else {
      setCheckedState((prevState) => {
        const currentValues = (prevState[filterKey] as any[]) || [];
        
        const updatedValues = isChecked
          ? [...currentValues, value]
          : currentValues.filter((item) => {
              // Compare by JSON stringifying for objects
              if (typeof item === "object" && item !== null && typeof value === "object" && value !== null) {
                return JSON.stringify(item) !== JSON.stringify(value);
              }
              return item !== value;
            });

        return { ...prevState, [filterKey]: updatedValues };
      });
    }
  };

  // Handle dropdown change
  const handleDropdownChange = (filterKey: string, values: string[]) => {
    setCheckedState((prevState) => ({
      ...prevState,
      [filterKey]: values,
    }));
  };

  // Handle date range change
  const handleDateRangeChange = (filterKey: string, value: DateRange | null) => {
    setDateFilters(prev => ({
      ...prev,
      [filterKey]: value || [null, null]
    }));
    setDateErrors(prev => ({
      ...prev,
      [filterKey]: null
    }));
  };

  // Handle calendar open
  const handleCalendarOpen = (filterKey: string) => {
    if (calendarRef.current) {
      const rect = calendarRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setPlacement(spaceBelow < 300 && spaceAbove > 300 ? "topStart" : "bottomStart");
    }
    setCalendarOpen(prev => ({ ...prev, [filterKey]: true }));
  };

  // Apply selected filters with all types
  const handleApplyClick = () => {
    const filterObj: seekersFilters = {};

    // Add checkbox/radio/dropdown filters (keep objects as they are)
    Object.entries(checkedState).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        filterObj[key] = value;
      } else if (typeof value === 'string' && value !== '') {
        filterObj[key] = value;
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        filterObj[key] = [value];
      }
    });

    // Add range filters
    Object.entries(rangeFilters).forEach(([key, filter]) => {
      if (filter.value) filterObj[key] = filter.value;
    });

    // Add multi filters
    Object.entries(multiFilters).forEach(([key, filter]) => {
      if (filter.value1) {
        let value = '';
        if (filter.operator === '-' && filter.value2) {
          value = `${filter.value1}-${filter.value2}`;
        } else if (filter.operator !== '-') {
          value = `${filter.operator}${filter.value1}`;
        }
        if (value) filterObj[key] = value;
      }
    });

    // Add date filters with validation
    Object.entries(dateFilters).forEach(([key, dateRange]) => {
      if (dateRange[0] && dateRange[1]) {
        const isValidDate = (d: unknown) => d instanceof Date && !isNaN(d.getTime());
        if (!isValidDate(dateRange[0]) || !isValidDate(dateRange[1])) {
          setDateErrors(prev => ({
            ...prev,
            [key]: "Please select a valid date range."
          }));
          return;
        }

        const formatDate = (date: Date) => {
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };

        filterObj[key] = {
          startDate: formatDate(dateRange[0] as Date),
          endDate: formatDate(dateRange[1] as Date),
        };
      }
    });

    const hasDateErrors = Object.values(dateErrors).some(error => error !== null);
    if (!hasDateErrors) {
      console.log("Filters being sent:", JSON.stringify(filterObj, null, 2));
      onApplyClick(filterObj);
    }
  };

  // Clear all selected filters
  const handleClear = () => {
    const clearedState: seekersFilters = {};
    const clearedRangeFilters: { [key: string]: { operator: string; value: string } } = {};
    const clearedMultiFilters: { [key: string]: { operator: string; value1: string; value2?: string } } = {};
    const clearedDateFilters: { [key: string]: [Date | null, Date | null] } = {};
    
    filterData.forEach((filter: any) => {
      if ((filter.type === 'checkbox' || filter.type === 'dropdown') && filter.options) {
        clearedState[filter.key] = [];
      } else if (filter.type === 'radio') {
        clearedState[filter.key] = '';
      } else if (filter.type === 'range') {
        clearedRangeFilters[filter.key] = { 
          operator: filter.operators?.[0]?.value || '>=', 
          value: '' 
        };
      } else if (filter.type === 'multi') {
        clearedMultiFilters[filter.key] = { 
          operator: filter.options?.[0]?.value || '<', 
          value1: '', 
          value2: '' 
        };
      } else if (filter.type === 'date') {
        clearedDateFilters[filter.key] = [null, null];
      }
    });
    
    setCheckedState(clearedState);
    setRangeFilters(clearedRangeFilters);
    setMultiFilters(clearedMultiFilters);
    setDateFilters(clearedDateFilters);
    setDateErrors({});
  };

  // Render filter section dynamically with all types
  const renderFilterSection = (filter: any) => {
    // Handle range type
    if (filter.type === 'range') {
      return (
        <div key={filter.key} className={styles.levelContainer}>
          <p className={styles.levelHeading}>{filter.label}</p>
          <div className={styles.hdbFilterRow}>
            <select
              value={rangeFilters[filter.key]?.operator || '>='}
              onChange={(e) => setRangeFilters(prev => ({
                ...prev,
                [filter.key]: { ...prev[filter.key], operator: e.target.value }
              }))}
              className={styles.hdbSelectWithIcon}
            >
              {filter.operators?.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              value={rangeFilters[filter.key]?.value || ''}
              onChange={(e) => setRangeFilters(prev => ({
                ...prev,
                [filter.key]: { ...prev[filter.key], value: e.target.value.replace(/[^0-9]/g, '') }
              }))}
              className={styles.hdbInputFlex}
            />
          </div>
        </div>
      );
    }

    // Handle multi type
    if (filter.type === 'multi') {
      return (
        <div key={filter.key} className={styles.levelContainer}>
          <p className={styles.levelHeading}>{filter.label}</p>
          <div className={styles.hdbFilterRow}>
            <FormControl className={styles.muiSelectContainer}>
              <Select
                value={multiFilters[filter.key]?.operator || filter.options[0]?.value || ''}
                onChange={(e) => {
                  const operator = e.target.value;
                  setMultiFilters(prev => ({
                    ...prev,
                    [filter.key]: {
                      operator,
                      value1: prev[filter.key]?.value1 || '',
                      value2: operator === '-' ? (prev[filter.key]?.value2 || '') : undefined
                    }
                  }));
                }}
                displayEmpty
                className={styles.muiSelect}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#E5E7EB' },
                    '&:hover fieldset': { borderColor: '#D1D5DB' },
                    '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
                  },
                  '& .MuiSelect-select': {
                    padding: '8px 32px 8px 12px',
                    fontSize: '14px',
                    color: '#374151',
                  },
                }}
              >
                {filter.options?.map((option: any) => (
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
        </div>
      );
    }

    // Handle date type
    if (filter.type === 'date') {
      return (
        <div key={filter.key} className={styles.levelContainer}>
          <p className={styles.levelHeading}>{filter.label}</p>
          <div className={styles.datePickerWrapper} ref={calendarRef}>
            <DateRangePicker
              placement={placement}
              value={dateFilters[filter.key] || [null, null]}
              onChange={(value) => handleDateRangeChange(filter.key, value)}
              ranges={[]}
              format="dd/MM/yyyy"
              onClean={() => setDateFilters(prev => ({ ...prev, [filter.key]: [null, null] }))}
              placeholder={filter.placeholder || "Select date range"}
              style={{ width: "100%" }}
              className={styles.datePicker}
              onOpen={() => handleCalendarOpen(filter.key)}
              onClose={() => setCalendarOpen(prev => ({ ...prev, [filter.key]: false }))}
              open={calendarOpen[filter.key] || false}
            />
            {dateErrors[filter.key] && (
              <div className={styles.dateError}>{dateErrors[filter.key]}</div>
            )}
          </div>
        </div>
      );
    }

    // Handle dropdown type
    if (filter.type === 'dropdown') {
      return (
        <div key={filter.key} className={styles.levelContainer}>
          <p className={styles.levelHeading}>{filter.label}</p>
          <MultiSelect
            options={filter.options.map((opt: any) => opt.label)}
            selected={
              Array.isArray(checkedState[filter.key])
                ? (checkedState[filter.key] as string[]).map((val: string) => {
                    const option = filter.options.find((opt: any) => opt.value === val);
                    return option?.label || val;
                  })
                : []
            }
            setSelected={(labels: string[]) => {
              const values = labels.map((label: string) => {
                const option = filter.options.find((opt: any) => opt.label === label);
                return option?.value || label;
              });
              handleDropdownChange(filter.key, values);
            }}
            closeOnClickOutside={true}
            placeholder={filter.placeholder || filter.label}
          />
        </div>
      );
    }

    // Handle checkbox and radio types
    if ((filter.type === 'checkbox' || filter.type === 'radio') && filter.options) {
      return (
        <div key={filter.key} className={styles.levelContainer}>
          <p className={styles.levelHeading}>{filter.label}</p>
          <div className={filter.key === "gender" || filter.type === 'radio' ? styles.radioButtonsContainer : styles.checkboxesContainer}>
            {filter.options.map((option: any, index: number) => {
              const optionValue = option.value;
              
              // Handle different value types
              let displayValue: string;
              let uniqueKey: string;
              
              if (typeof optionValue === 'object' && optionValue !== null && !Array.isArray(optionValue)) {
                displayValue = `${optionValue.min}-${optionValue.max}`;
                uniqueKey = `${filter.key}-${JSON.stringify(optionValue)}-${index}`;
              } else if (Array.isArray(optionValue)) {
                displayValue = optionValue.join(',');
                uniqueKey = `${filter.key}-${optionValue.join('-')}-${index}`;
              } else {
                displayValue = String(optionValue);
                uniqueKey = `${filter.key}-${optionValue}-${index}`;
              }
              
              // Check if option is checked (compare objects properly)
              const isChecked = filter.type === 'radio'
                ? JSON.stringify(checkedState[filter.key]) === JSON.stringify(optionValue)
                : Array.isArray(checkedState[filter.key]) &&
                  (checkedState[filter.key] as any[]).some((item) => JSON.stringify(item) === JSON.stringify(optionValue));

              if (filter.type === 'radio') {
                return (
                  <CustomRadioButton
                    key={uniqueKey}
                    text={option.label}
                    name={filter.key}
                    value={displayValue}
                    checked={isChecked}
                    onChange={handleChange(filter.key, optionValue, filter.type)}
                  />
                );
              } else {
                return (
                  <CustomCheckbox
                    key={uniqueKey}
                    text={option.label}
                    checked={isChecked}
                    onChange={handleChange(filter.key, optionValue, filter.type)}
                  />
                );
              }
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.filtersHeader}>
        <p className={styles.heading}>Filters</p>
        <FormLine />
        <img
          src={closeIcon}
          alt="close icon"
          onClick={onClose}
          className={styles.closeIcon}
        />
      </div>

      {/* Dynamic Filter Rendering */}
      <div className={styles.overAllLevelContainer}>
        {filterData
          .sort((a: any, b: any) => a.order - b.order)
          .map((filter: any) => renderFilterSection(filter))}
      </div>

      <FormLine />
      <div className={styles.buttonsContainer}>
        {!disable && (
          <div onClick={handleClear} className={styles.buttonCancel}>
            clear filter
          </div>
        )}
        <Button
          onClick={handleApplyClick}
          buttonClassName={styles.buttonContainer}
          buttonTextClassName={styles.buttonContainerText}
          type="submit"
        >
          apply
        </Button>
      </div>
    </div>
  );
};

export default SeekerListFilterPopUp;
