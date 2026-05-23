/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import styles from "./index.module.scss";
// import CustomButton from "../CustomButton"; // Import your CustomButton component
import closeIcon from "../../assets/images/closeIcon.svg";
import CustomRadioButton from "../../common/components/CustomRadioButton";
import FormLine from "../../common/components/FormLine";
import { endPoints } from "../../constants/urlConstants";
import { Button } from "../../common/components/Button";
import { getCall } from "../../services/apiService";
import CustomCheckbox from "../../common/components/CustomCheckBox";
import { FormControl, Select, MenuItem } from "@mui/material";
import DateRangePicker, { DateRange } from "rsuite/DateRangePicker";
import MultiSelect from "../../pages/MultiSelect";
import AlertDialog from "../../common/components/AlertDialogue";
import { ERROR_MESSAGES, ERROR_STATUS_CODES } from "../../constants";

// Update the SelectedFilters interface to handle different types
interface SelectedFilters {
  [key: string]: string | string[] | { startDate: string; endDate: string };
}

interface RoomAllocationFilterPopUpProps {
  onApplyClick: (selectedFilters: SelectedFilters, filterLabels: { [key: string]: string[] }) => void;
  onClose: () => void;
  selectedFilters: SelectedFilters;
  selectedFilterLabels?: { [key: string]: string[] }; // ADD: New prop
  setLoader: React.Dispatch<React.SetStateAction<boolean>>;
  programId?: string;
  subProgramId?: number | null;
  selectedDropdownFilters?: { [key: string]: string };
  filterData?: any[];
}

const RoomAllocationFilterPopUp: React.FC<RoomAllocationFilterPopUpProps> = ({
  onApplyClick,
  onClose,
  selectedFilters,
  selectedFilterLabels = {}, // ADD: Default value
  setLoader,
  programId,
  subProgramId,
  selectedDropdownFilters,
  filterData: propFilterData,
}) => {
  const [filterData, setFilterData] = useState<any[]>(propFilterData || []);
  const [checkedState, setCheckedState] = useState<SelectedFilters>(selectedFilters);
  
  // ADD: State to track labels
  const [filterLabels, setFilterLabels] = useState<{ [key: string]: string[] }>(selectedFilterLabels);
  
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
  const [toastState, setToastState] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  const getFiltersList = async () => {
    try {
      setLoader(true);
      
      let url = `${endPoints.roomInventoryFilters}?type=all`;
      
      if (programId) {
        url += `&programId=${programId}`;
      }
      
      if (subProgramId) {
        url += `&subProgramId=${subProgramId}`;
      }
      
      const response = await getCall(url);
      if (!response?.data?.data) {
        if (
          response?.data?.statusCode === ERROR_STATUS_CODES.BAD_REQUEST || response?.data?.statusCode === ERROR_STATUS_CODES.UNAUTHORIZED || response?.data?.statusCode === ERROR_STATUS_CODES.FORBIDDEN ||response?.data?.statusCode === ERROR_STATUS_CODES.INTERNAL_SERVER_ERROR ||response?.data?.success === false
        ) {
          const errorMessage =
            response.data.message || response.data.error || ERROR_MESSAGES.FETCH_FILTER_DATA;
          setToastState({
            open: true,
            message: errorMessage,
          });
        }
        setFilterData([]);
        setLoader(false);
        return;
      }

      const data = response.data.data;

      if (!data || !Array.isArray(data) || data.length === 0) {
        setFilterData([]);
        setLoader(false);
        return;
      }

      setTimeout(() => {
        setLoader(false);
      }, 300);
      
      const data = response?.data?.data;
      setFilterData(data);
      
      const initialState: SelectedFilters = {};
      const initialRangeFilters: { [key: string]: { operator: string; value: string } } = {};
      const initialMultiFilters: { [key: string]: { operator: string; value1: string; value2?: string } } = {};
      const initialDateFilters: { [key: string]: [Date | null, Date | null] } = {};
      
      data?.forEach((filter: any) => {
        if ((filter?.type === 'checkbox' || filter?.type === 'radio') && filter?.options && filter?.filterable) {
          initialState[filter.key] = selectedFilters[filter.key] || (filter.type === 'radio' ? '' : []);
        } else if (filter?.type === 'dropdown' && filter?.filterable) {
          initialState[filter.key] = selectedFilters[filter.key] || [];
        } else if (filter?.type === 'range' && filter?.filterable) {
          const filterValue = selectedFilters[filter.key];
          if (typeof filterValue === 'string' && filterValue) {
            initialRangeFilters[filter.key] = { 
              operator: filter?.operators?.[0]?.value || '>=', 
              value: filterValue 
            };
          } else {
            initialRangeFilters[filter.key] = { 
              operator: filter?.operators?.[0]?.value || '>=', 
              value: '' 
            };
          }
        } else if (filter?.type === 'multi' && filter?.filterable) {
          const filterValue = selectedFilters[filter.key];
          if (typeof filterValue === 'string' && filterValue) {
            if (filterValue.includes('-')) {
              const [val1, val2] = filterValue.split('-');
              initialMultiFilters[filter.key] = { operator: '-', value1: val1, value2: val2 };
            } else {
              const operator = filterValue.charAt(0);
              const val = filterValue.slice(1);
              initialMultiFilters[filter.key] = { operator, value1: val };
            }
          } else {
            initialMultiFilters[filter.key] = { 
              operator: filter?.options?.[0]?.value || '<', 
              value1: '', 
              value2: '' 
            };
          }
        } else if (filter?.type === 'date' && filter?.filterable) {
          const filterValue = selectedFilters[filter.key];
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
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Error fetching filters";
    
      setToastState({
        open: true,
        message: errorMessage,
      });
      setFilterData([]);
      setLoader(false);
    }
  };

  useEffect(() => {
    if (!propFilterData || propFilterData.length === 0) {
      getFiltersList();
    } else {
      // Initialize states from prop data
      const initialState: SelectedFilters = {};
      const initialLabels: { [key: string]: string[] } = {};
      const initialRangeFilters: { [key: string]: { operator: string; value: string } } = {};
      const initialMultiFilters: { [key: string]: { operator: string; value1: string; value2?: string } } = {};
      const initialDateFilters: { [key: string]: [Date | null, Date | null] } = {};
      
      propFilterData.forEach((filter: any) => {
        if ((filter.type === 'checkbox' || filter.type === 'radio') && filter.options && filter.filterable) {
          initialState[filter.key] = selectedFilters[filter.key] || (filter.type === 'radio' ? '' : []);
        } else if (filter.type === 'dropdown' && filter.filterable) {
          initialState[filter.key] = selectedFilters[filter.key] || [];
        } else if (filter.type === 'range' && filter.filterable) {
          const filterValue = selectedFilters[filter.key];
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
        } else if (filter.type === 'multi' && filter.filterable) {
          const filterValue = selectedFilters[filter.key];
          if (typeof filterValue === 'string' && filterValue) {
            if (filterValue.includes('-')) {
              const [val1, val2] = filterValue.split('-');
              initialMultiFilters[filter.key] = { operator: '-', value1: val1, value2: val2 };
            } else {
              const operator = filterValue.charAt(0);
              const val = filterValue.slice(1);
              initialMultiFilters[filter.key] = { operator, value1: val };
            }
          } else {
            initialMultiFilters[filter.key] = { 
              operator: filter.options?.[0]?.value || '<', 
              value1: '', 
              value2: '' 
            };
          }
        } else if (filter.type === 'date' && filter.filterable) {
          const filterValue = selectedFilters[filter.key];
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
      
      // Initialize labels
      propFilterData.forEach((filter: any) => {
        if (filter.type === 'checkbox' || filter.type === 'dropdown') {
          const selectedValues = selectedFilters[filter.key] as string[] || [];
          initialLabels[filter.key] = selectedValues.map(value => {
            const option = filter.options?.find((opt: any) => opt.value === value);
            return option?.label || value;
          });
        }
      });
      
      setCheckedState(prev => ({ ...initialState, ...prev }));
      setFilterLabels(initialLabels);
      setRangeFilters(initialRangeFilters);
      setMultiFilters(initialMultiFilters);
      setDateFilters(initialDateFilters);
    }
  }, [programId, subProgramId, propFilterData]);

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

    const handleScroll = () => {
      setCalendarOpen({});
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [calendarOpen]);

  const handleChange = (filterKey: string, value: string | string[], filterType: string, label?: string | string[]) => (event: ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;

    if (filterType === 'radio') {
      setCheckedState((prevState) => ({
        ...prevState,
        [filterKey]: value,
      }));
      setFilterLabels((prevLabels) => ({
        ...prevLabels,
        [filterKey]: [Array.isArray(label) ? label[0] : label || ''],
      }));
    } else if (filterKey === "gender") {
      setCheckedState((prevState) => ({
        ...prevState,
        [filterKey]: isChecked ? [Array.isArray(value) ? value[0] : value] : [],
      }));
      setFilterLabels((prevLabels) => ({
        ...prevLabels,
        [filterKey]: isChecked ? [Array.isArray(label) ? label[0] : label || ''] : [],
      }));
    } else {
      const currentValues = (checkedState[filterKey] as string[]) || [];
      const currentLabels = (filterLabels[filterKey] as string[]) || [];
      
      const updatedValues = isChecked
        ? [...currentValues, ...(Array.isArray(value) ? value : [value])]
        : currentValues.filter((item) => 
            Array.isArray(value) ? !value.includes(item) : item !== value
          );

      const updatedLabels = isChecked
        ? [...currentLabels, ...(Array.isArray(label) ? label : [label || ''])]
        : currentLabels.filter((item, index) => {
            const val = currentValues[index];
            return Array.isArray(value) ? !value.includes(val) : val !== value;
          });

      setCheckedState((prevState) => ({
        ...prevState,
        [filterKey]: updatedValues,
      }));
      
      setFilterLabels((prevLabels) => ({
        ...prevLabels,
        [filterKey]: updatedLabels,
      }));
    }
  };
  
  // Handle dropdown change
  const handleDropdownChange = (filterKey: string, values: string[], labels: string[]) => {
    setCheckedState((prevState) => ({
      ...prevState,
      [filterKey]: values,
    }));
    setFilterLabels((prevLabels) => ({
      ...prevLabels,
      [filterKey]: labels,
    }));
  };

  // Handle date range change
  const handleDateRangeChange = (filterKey: string, value: DateRange | null, label?: string) => {
    setDateFilters(prev => ({
      ...prev,
      [filterKey]: value || [null, null]
    }));
    
    if (value && value[0] && value[1]) {
      setFilterLabels(prev => ({
        ...prev,
        [filterKey]: [label || `${formatDate(value[0])} - ${formatDate(value[1])}`]
      }));
    } else {
      setFilterLabels(prev => {
        const newLabels = { ...prev };
        delete newLabels[filterKey];
        return newLabels;
      });
    }
    
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

      if (spaceBelow < 300 && spaceAbove > 300) {
        setPlacement("topStart");
      } else {
        setPlacement("bottomStart");
      }
    }

    setCalendarOpen(prev => ({
      ...prev,
      [filterKey]: true
    }));
  };
  
  // Add the handleApplyClick function with all filter types
  const handleApplyClick = () => {
    const filterObj: SelectedFilters = { ...checkedState };
    const labelObj: { [key: string]: string[] } = { ...filterLabels };

    // Add range filters
    Object.entries(rangeFilters).forEach(([key, filter]) => {
      if (filter.value) {
        filterObj[key] = filter.value;
        labelObj[key] = [`${filter.operator} ${filter.value}`];
      }
    });

    // Add multi filters
    Object.entries(multiFilters).forEach(([key, filter]) => {
      if (filter.value1) {
        let value = '';
        let label = '';
        if (filter.operator === '-' && filter.value2) {
          value = `${filter.value1}-${filter.value2}`;
          label = `${filter.value1} - ${filter.value2}`;
        } else if (filter.operator !== '-') {
          value = `${filter.operator}${filter.value1}`;
          label = `${filter.operator} ${filter.value1}`;
        }
        
        if (value) {
          filterObj[key] = value;
          labelObj[key] = [label];
        }
      }
    });

    // Add date filters
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
        
        labelObj[key] = [`${formatDate(dateRange[0] as Date)} - ${formatDate(dateRange[1] as Date)}`];
      }
    });

    // Check if any date errors exist
    const hasDateErrors = Object.values(dateErrors).some(error => error !== null);
    if (hasDateErrors) {
      return;
    }

    onApplyClick(filterObj, labelObj);
  };

  // Update handleClear to reset all filter types
  const handleClear = () => {
    const clearedState: SelectedFilters = {};
    const clearedLabels: { [key: string]: string[] } = {};
    const clearedRangeFilters: { [key: string]: { operator: string; value: string } } = {};
    const clearedMultiFilters: { [key: string]: { operator: string; value1: string; value2?: string } } = {};
    const clearedDateFilters: { [key: string]: [Date | null, Date | null] } = {};
    
    filterData.forEach((filter: any) => {
      if ((filter.type === 'checkbox' || filter.type === 'dropdown') && filter.options && filter.filterable) {
        clearedState[filter.key] = [];
        clearedLabels[filter.key] = [];
      } else if (filter.type === 'radio' && filter.filterable) {
        clearedState[filter.key] = '';
        clearedLabels[filter.key] = [];
      } else if (filter.type === 'range' && filter.filterable) {
        clearedRangeFilters[filter.key] = { 
          operator: filter.operators?.[0]?.value || '>=', 
          value: '' 
        };
      } else if (filter.type === 'multi' && filter.filterable) {
        clearedMultiFilters[filter.key] = { 
          operator: filter.options?.[0]?.value || '<', 
          value1: '', 
          value2: '' 
        };
      } else if (filter.type === 'date' && filter.filterable) {
        clearedDateFilters[filter.key] = [null, null];
      }
    });
    
    setCheckedState(clearedState);
    setFilterLabels(clearedLabels);
    setRangeFilters(clearedRangeFilters);
    setMultiFilters(clearedMultiFilters);
    setDateFilters(clearedDateFilters);
    setDateErrors({});
  };

  // Update renderFilterSection to handle all filter types
  const renderFilterSection = (filter: any) => {
    // Handle range type
    if (filter?.type === 'range') {
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
              {filter?.operators?.map((option: any) => (
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
    if (filter?.type === 'multi') {
      return (
        <div key={filter.key} className={styles.levelContainer}>
          <p className={styles.levelHeading}>{filter.label}</p>
          <div className={styles.hdbFilterRow}>
            <FormControl className={styles.muiSelectContainer}>
              <Select
                value={multiFilters[filter.key]?.operator || filter?.options?.[0]?.value || ''}
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
                {filter?.options?.map((option: any) => (
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
                    operator: prev[filter.key]?.operator || filter?.options?.[0]?.value,
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
    if (filter?.type === 'date') {
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
              placeholder={filter?.placeholder || "Select date range"}
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
    if (filter?.type === 'dropdown') {
      const selectedValues = Array.isArray(checkedState[filter.key])
        ? (checkedState[filter.key] as string[])
        : [];
      
      const selectedLabels = selectedValues.map((val: string) => {
        const option = filter?.options?.find((opt: any) => opt.value === val);
        return option?.label || val;
      });

      return (
        <div key={filter.key} className={styles.levelContainer}>
          <p className={styles.levelHeading}>{filter.label}</p>
          <MultiSelect
            options={filter?.options?.map((opt: any) => opt.label) || []}
            selected={selectedLabels}
            setSelected={(labels: string[]) => {
              const values = labels.map((label: string) => {
                const option = filter?.options?.find((opt: any) => opt.label === label);
                return option?.value || label;
              });
              handleDropdownChange(filter.key, values, labels);
            }}
            closeOnClickOutside={true}
            placeholder={filter?.placeholder || filter.label}
          />
        </div>
      );
    }

    // Handle checkbox and radio types
    if ((filter?.type === 'checkbox' || filter?.type === 'radio') && filter?.options) {
      return (
        <div key={filter.key} className={styles.levelContainer}>
          <p className={styles.levelHeading}>{filter.label}</p>
          <div className={filter.key === 'gender' || filter.type === 'radio' ? styles.radioButtonsContainer : styles.checkboxesContainer}>
            {filter?.options?.map((option: any, index: number) => {
              const optionValue = option.value;
              const optionLabel = option.label;
              
              // FIX: Keep the actual value (object, array, or string)
              const actualValue = optionValue;
              const actualLabel = optionLabel;
              
              // Create unique key for React
              let uniqueKey: string;
              if (typeof optionValue === 'object' && optionValue !== null && !Array.isArray(optionValue)) {
                uniqueKey = `${filter.key}-${JSON.stringify(optionValue)}-${index}`;
              } else if (Array.isArray(optionValue)) {
                uniqueKey = `${filter.key}-${optionValue.join('-')}-${index}`;
              } else {
                uniqueKey = `${filter.key}-${optionValue}-${index}`;
              }
              
              // FIX: Check if option is checked by comparing actual values
              const isChecked = (() => {
                if (filter.type === 'radio') {
                  if (typeof actualValue === 'object' && actualValue !== null) {
                    return JSON.stringify(checkedState[filter.key]) === JSON.stringify(actualValue);
                  }
                  return checkedState[filter.key] === actualValue;
                } else {
                  // For checkboxes
                  const currentValues = (checkedState[filter.key] as any[]) || [];
                  if (Array.isArray(actualValue)) {
                    return actualValue.some((val: any) => 
                      currentValues.some((cv: any) => 
                        typeof cv === 'object' ? JSON.stringify(cv) === JSON.stringify(val) : cv === val
                      )
                    );
                  } else if (typeof actualValue === 'object' && actualValue !== null) {
                    return currentValues.some((cv: any) => 
                      JSON.stringify(cv) === JSON.stringify(actualValue)
                    );
                  } else {
                    return currentValues.includes(actualValue);
                  }
                }
              })();

              if (filter.key === 'gender' || filter.type === 'radio') {
                return (
                  <CustomRadioButton
                    key={uniqueKey}
                    text={optionLabel}
                    name={filter.key}
                    value={typeof actualValue === 'object' ? JSON.stringify(actualValue) : String(actualValue)}
                    checked={isChecked}
                    onChange={handleChange(filter.key, actualValue, filter.type, actualLabel)}
                  />
                );
              } else {
                return (
                  <CustomCheckbox
                    key={uniqueKey}
                    text={optionLabel}
                    checked={isChecked}
                    onChange={handleChange(filter.key, actualValue, filter.type, actualLabel)}
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

      <div className={styles.floorLevelContainer}>
        <div className={styles.overAllFloorLevelContainer}>
          {filterData.map(renderFilterSection)}
        </div>
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

      <AlertDialog
        title="Notification"
        message={toastState.message}
        isOpen={toastState.open}
        setOpenToast={() => setToastState({ open: false, message: "" })}
      />
    </div>
  );
};

export default RoomAllocationFilterPopUp;
