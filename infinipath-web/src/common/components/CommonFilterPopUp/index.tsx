/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import styles from "./index.module.scss";
import closeIcon from "../../../assets/images/closeIcon.svg";
import CustomRadioButton from "../CustomRadioButton";
import FormLine from "../FormLine";
import { Button } from "../Button";
import CustomCheckbox from "../CustomCheckBox";
import { FormControl, Select, MenuItem } from "@mui/material";
import DateRangePicker, { DateRange } from "rsuite/DateRangePicker";
import MultiSelect from "../../../pages/MultiSelect";
import DateTimeRangePicker from "../DateTimeRangePicker";
import dayjs, { Dayjs } from 'dayjs';
import { convertDateRangeToUTC, convertDateTimeRangeToUTC } from "../../../utils/commonFunctions";
import { FILTER_TYPES, textConstant } from "../../../constants/textConstants";

interface SelectedFilters {
  [key: string]: string | string[] | any[] | { startDate: string; endDate: string } | { min: string; max: string };
}

interface CommonFilterPopUpProps {
  onApplyClick: (selectedFilters: SelectedFilters, filterLabels?: { [key: string]: string[] }) => void;
  onClose: () => void;
  selectedFilters: SelectedFilters;
  selectedFilterLabels?: { [key: string]: string[] };
  filterData: any[]; // Receives filter data from parent
  title?: string;
  showLabels?: boolean;
  programEndsAt?: string;
}

const CommonFilterPopUp: React.FC<CommonFilterPopUpProps> = ({
  onApplyClick,
  onClose,
  selectedFilters,
  selectedFilterLabels = {},
  filterData,
  title = "Filters",
  showLabels = false,
  programEndsAt,
}) => {
  const [checkedState, setCheckedState] = useState<SelectedFilters>(selectedFilters);
  const [filterLabels, setFilterLabels] = useState<{ [key: string]: string[] }>(selectedFilterLabels);
  const [disable, setDisable] = useState(true);
  
  const [rangeFilters, setRangeFilters] = useState<{ [key: string]: { operator: string; value: string } }>({});
  const [multiFilters, setMultiFilters] = useState<{ 
    [key: string]: { 
      selectedOption: any;
      value1: string; 
      value2?: string;
    } 
  }>({});
  const [dateFilters, setDateFilters] = useState<{ [key: string]: [Date | null, Date | null] }>({});
  
  // CHANGED: Make dateTimeFilters an array
  const [dateTimeFilters, setDateTimeFilters] = useState<{ [key: string]: { min: Dayjs | null; max: Dayjs | null }[] }>({});
  
  const [dateErrors, setDateErrors] = useState<{ [key: string]: string | null }>({});
  const [dateTimeErrors, setDateTimeErrors] = useState<{ [key: string]: string | null }>({});
  const [calendarOpen, setCalendarOpen] = useState<{ [key: string]: boolean }>({});
  const [placement, setPlacement] = useState<"bottomStart" | "topStart">("bottomStart");
  const calendarRef = useRef<HTMLDivElement>(null);

  // Initialize filter states from data
  useEffect(() => {
    if (filterData && filterData.length > 0) {
      const initialState: SelectedFilters = {};
      const initialLabels: { [key: string]: string[] } = {};
      const initialRangeFilters: { [key: string]: { operator: string; value: string } } = {};
      const initialMultiFilters: { 
        [key: string]: { 
          selectedOption: string | unknown;
          value1: string; 
          value2?: string;
        } 
      } = {};
      const initialDateFilters: { [key: string]: [Date | null, Date | null] } = {};
      const initialDateTimeFilters: { [key: string]: { min: Dayjs | null; max: Dayjs | null }[] } = {};
      
      filterData.forEach((filter: any) => {
        const filterValue = selectedFilters[filter.key];

        if ((filter.type === FILTER_TYPES.CHECKBOX || filter.type === FILTER_TYPES.RADIO) && filter.options) {
          if (filter.type === FILTER_TYPES.RADIO) {
            initialState[filter.key] = filterValue || '';
          } else {
            initialState[filter.key] = filterValue || [];
          }
          
          // FIX: Initialize labels by finding which options are selected
          if (showLabels && filterValue) {
            if (Array.isArray(filterValue) && filterValue.length > 0) {
              const labels: string[] = [];
              
              // For each option, check if its value matches the selected values
              filter.options?.forEach((opt: any) => {
                const optValue = opt.value;
                
                // Check if this option is selected
                let isSelected = false;
                
                if (Array.isArray(optValue)) {
                  // If option value is an array, check if ALL its values exist in filterValue
                  isSelected = optValue.every((val: any) =>
                    filterValue.some((fv: any) =>
                      typeof fv === 'object' && typeof val === 'object'
                        ? JSON.stringify(fv) === JSON.stringify(val)
                        : fv === val
                    )
                  );
                } else if (typeof optValue === 'object' && optValue !== null) {
                  // If option value is an object, check if it exists in filterValue
                  isSelected = filterValue.some((fv: any) =>
                    JSON.stringify(fv) === JSON.stringify(optValue)
                  );
                } else {
                  // If option value is primitive, check if it exists in filterValue
                  isSelected = filterValue.includes(optValue);
                }
                
                if (isSelected) {
                  labels.push(opt.label);
                }
              });
              
              initialLabels[filter.key] = labels;
            } else if (filter.type === FILTER_TYPES.RADIO && filterValue) {
              // For radio buttons, find the matching option
              const option = filter.options?.find((opt: any) => {
                if (typeof opt.value === 'object' && opt.value !== null) {
                  return JSON.stringify(opt.value) === JSON.stringify(filterValue);
                }
                return opt.value === filterValue;
              });
              initialLabels[filter.key] = option ? [option.label] : [];
            }
          }
        } else if (filter.type === FILTER_TYPES.DROPDOWN) {
          initialState[filter.key] = filterValue || [];
          
          if (showLabels && Array.isArray(filterValue)) {
            initialLabels[filter.key] = filterValue.map((val: string) => {
              const option = filter.options?.find((opt: any) => opt.value === val);
              return option?.label || val;
            });
          }
        } else if (filter.type === FILTER_TYPES.RANGE) {
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
        } else if (filter.type === FILTER_TYPES.MULTI) {
          const hasFilterValue = filterValue && Array.isArray(filterValue) && filterValue.length > 0;

          if (hasFilterValue) {
            const firstValue = filterValue[0];

            if (firstValue && typeof firstValue === 'object' && Object.keys(firstValue).length > 0) {
              const hasValue = (val: any): boolean => val != null;

              const matchingOption = filter?.options?.find((opt: any) => {
                const optValue = opt.value;
                const fv = firstValue;

                // Equals
                if (hasValue(fv.eq)) {
                  return hasValue(optValue.eq);
                }
                // Within a range
                if (hasValue(fv.min) && hasValue(fv.max)) {
                  return hasValue(optValue.min) && hasValue(optValue.max);
                }
                // Greater than (minExcluded)
                if (hasValue(fv.minExcluded)) {
                  return hasValue(optValue.minExcluded);
                }
                // Less than (maxExcluded)
                if (hasValue(fv.maxExcluded)) {
                  return hasValue(optValue.maxExcluded);
                }
                return false;
              });

              const toStr = (val: any) => val != null ? String(val) : '';

              if (matchingOption) {
                // Within a range
                if (hasValue(firstValue.min) && hasValue(firstValue.max)) {
                  initialMultiFilters[filter.key] = {
                    selectedOption: matchingOption,
                    value1: toStr(firstValue.min),
                    value2: toStr(firstValue.max),
                  };
                }
                // Greater than (minExcluded)
                else if (hasValue(firstValue.minExcluded)) {
                  initialMultiFilters[filter.key] = {
                    selectedOption: matchingOption,
                    value1: toStr(firstValue.minExcluded),
                  };
                }
                // Less than (maxExcluded)
                else if (hasValue(firstValue.maxExcluded)) {
                  initialMultiFilters[filter.key] = {
                    selectedOption: matchingOption,
                    value1: toStr(firstValue.maxExcluded),
                  };
                }
                // Equals
                else if (hasValue(firstValue.eq)) {
                  initialMultiFilters[filter.key] = {
                    selectedOption: matchingOption,
                    value1: toStr(firstValue.eq),
                  };
                }
              } else {
                initialMultiFilters[filter.key] = { 
                  selectedOption: filter.options?.[0],
                  value1: '',
                  value2: '',
                };
              }
            } else {
              initialMultiFilters[filter.key] = { 
                selectedOption: filter.options?.[0],
                value1: '',
                value2: '',
              };
            }
          } else {
            initialMultiFilters[filter.key] = { 
              selectedOption: filter.options?.[0],
              value1: '',
              value2: '',
            };
          }
        } else if (filter.type === FILTER_TYPES.DATE_RANGE) {
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
        } else if (filter.type === FILTER_TYPES.DATE_TIME_RANGE) {
          if (filterValue && Array.isArray(filterValue) && filterValue.length > 0) {
            const parsedRanges = filterValue.map((range: any) => {
              if (range && typeof range === 'object' && 'min' in range && 'max' in range) {
                return {
                  min: range.min ? dayjs(range.min) : null,
                  max: range.max ? dayjs(range.max) : null,
                };
              }
              return { min: null, max: null };
            });
            initialDateTimeFilters[filter.key] = parsedRanges;
            if (showLabels) {
              const labels = parsedRanges
                .filter(range => range.min && range.max)
                .map(range => `${range.min!.format('DD/MM/YYYY HH:mm')} - ${range.max!.format('DD/MM/YYYY HH:mm')}`);
              if (labels.length > 0) {
                initialLabels[filter.key] = labels;
              }
            }
          } else {
            initialDateTimeFilters[filter.key] = [];
          }
        }
      });
      
      // CHANGE: Replace state entirely, don't merge
      setCheckedState(initialState);
      setFilterLabels(initialLabels);
      setRangeFilters(initialRangeFilters);
      setMultiFilters(initialMultiFilters); // This was the issue - it was merging before
      setDateFilters(initialDateFilters);
      setDateTimeFilters(initialDateTimeFilters);
    }
  }, [filterData, selectedFilters]);

  // Update disable state
  useEffect(() => {
    const hasCheckboxFilters = Object.values(checkedState).some(
      (value) => (Array.isArray(value) && value.length > 0) || (typeof value === 'string' && value !== '')
    );
    const hasRangeFilters = Object.values(rangeFilters).some((filter) => filter.value !== '');
    
    // FIX: Check if value1 has actual content (not empty string)
    const hasMultiFilters = Object.values(multiFilters).some((filter) => 
      filter.value1 && filter.value1.trim() !== ''
    );
    
    const hasDateFilters = Object.values(dateFilters).some((dateRange) => dateRange[0] !== null && dateRange[1] !== null);
    
    const hasDateTimeFilters = Object.values(dateTimeFilters).some((dateTimeArray) => 
      dateTimeArray.some((dateTimeRange) => dateTimeRange.min !== null && dateTimeRange.max !== null)
    );
    
    setDisable(!hasCheckboxFilters && !hasRangeFilters && !hasMultiFilters && !hasDateFilters && !hasDateTimeFilters);
  }, [checkedState, rangeFilters, multiFilters, dateFilters, dateTimeFilters]);

  // Handle calendar scroll
  useEffect(() => {
    const openKeys = Object.keys(calendarOpen).filter(key => calendarOpen[key]);
    if (openKeys.length === 0) return;

    const handleScroll = () => setCalendarOpen({});
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [calendarOpen]);

  // Handle checkbox/radio change
  const handleChange = (filterKey: string, value: any, filterType: string, label?: string) => (event: ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;

    if (filterType === FILTER_TYPES.RADIO) {
      setCheckedState((prevState) => ({ ...prevState, [filterKey]: value }));
      if (showLabels) {
        setFilterLabels((prevLabels) => ({ ...prevLabels, [filterKey]: [label || ''] }));
      }
    } 
     else {
      // FIX: Handle checkbox changes - flatten arrays properly
      const currentValues = (checkedState[filterKey] as any[]) || [];
      const currentLabels = showLabels ? ((filterLabels[filterKey] as string[]) || []) : [];
      
      let updatedValues: any[];
      let updatedLabels: string[];
      
      if (isChecked) {
        // ADD: If value is already an array, spread it to flatten
        updatedValues = Array.isArray(value)
          ? [...currentValues, ...value]
          : [...currentValues, value];
        
        // FIX: For labels, always add just the single label (not spread)
        updatedLabels = showLabels
          ? [...currentLabels, label || '']
          : [];
      } else {
        // REMOVE: Filter out the unchecked value(s)
        if (Array.isArray(value)) {
          // When value is an array, remove all items that match any element in that array
          updatedValues = currentValues.filter((item) => 
            !value.some((val: any) => 
              typeof val === 'object' && typeof item === 'object'
                ? JSON.stringify(val) === JSON.stringify(item)
                : val === item
            )
          );
        } else if (typeof value === "object" && value !== null) {
          // When value is an object, remove items that match this object
          updatedValues = currentValues.filter((item) => 
            JSON.stringify(item) !== JSON.stringify(value)
          );
        } else {
          // When value is primitive, remove exact matches
          updatedValues = currentValues.filter((item) => item !== value);
        }
        
        // FIX: Remove the corresponding label
        updatedLabels = showLabels
          ? currentLabels.filter((lbl) => lbl !== label)
          : [];
      }

      setCheckedState((prevState) => ({
        ...prevState,
        [filterKey]: updatedValues,
      }));
      
      if (showLabels) {
        setFilterLabels((prevLabels) => ({
          ...prevLabels,
          [filterKey]: updatedLabels,
        }));
      }
    }
  };

  // Handle dropdown change
  const handleDropdownChange = (filterKey: string, values: string[], labels: string[]) => {
    // FIX: Process values and labels together to maintain correspondence
    let flattenedValues: any[] = [];
    const correspondingLabels: string[] = [];
    
    values.forEach((val: any, index: number) => {
      if (Array.isArray(val)) {
        // If val is an array, spread its contents
        flattenedValues = [...flattenedValues, ...val];
        // Add the label once for this array value
        correspondingLabels.push(labels[index] || '');
      } else {
        // If val is not an array, add it directly
        flattenedValues.push(val);
        correspondingLabels.push(labels[index] || '');
      }
    });
    
    setCheckedState((prevState) => ({ 
      ...prevState, 
      [filterKey]: flattenedValues 
    }));
    
    if (showLabels) {
      setFilterLabels((prevLabels) => ({ 
        ...prevLabels, 
        [filterKey]: correspondingLabels
      }));
    }
  };

  // Handle multi filter dropdown change
  const handleMultiFilterChange = (filterKey: string, selectedLabel: string, filter: any) => {
    const selectedOption = filter.options.find((opt: any) => opt.label === selectedLabel);
    
    if (!selectedOption) return;
    
    const value = selectedOption.value;
    const isRange = value.min !== undefined && value.max !== undefined;
    
    setMultiFilters(prev => ({
      ...prev,
      [filterKey]: {
        selectedOption: selectedOption,
        value1: '',
        value2: isRange ? '' : undefined,
      }
    }));
  };

  // Handle date range change
  const handleDateRangeChange = (filterKey: string, value: DateRange | null) => {
    setDateFilters(prev => ({ ...prev, [filterKey]: value || [null, null] }));
    setDateErrors(prev => ({ ...prev, [filterKey]: null }));
    
    if (showLabels && value && value[0] && value[1]) {
      const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };
      setFilterLabels(prev => ({
        ...prev,
        [filterKey]: [`${formatDate(value[0])} - ${formatDate(value[1])}`]
      }));
    }
  };

  // CHANGED: Handle date-time range change with array support
  const handleDateTimeChange = (filterKey: string, index: number, type: 'min' | 'max', value: Dayjs | null) => {
    setDateTimeFilters(prev => {
      const currentArray = prev[filterKey] || [];
      const updatedArray = [...currentArray];
      
      if (!updatedArray[index]) {
        updatedArray[index] = { min: null, max: null };
      }
      
      updatedArray[index] = {
        ...updatedArray[index],
        [type]: value
      };
      
      return { ...prev, [filterKey]: updatedArray };
    });
    
    setDateTimeErrors(prev => ({ ...prev, [filterKey]: null }));

    // Update labels if both min and max are set
    if (showLabels) {
      const currentArray = dateTimeFilters[filterKey] || [];
      const updatedArray = [...currentArray];
      
      if (!updatedArray[index]) {
        updatedArray[index] = { min: null, max: null };
      }
      
      updatedArray[index] = {
        ...updatedArray[index],
        [type]: value
      };
      
      const labels = updatedArray
        .filter(range => range.min && range.max)
        .map(range => `${range.min!.format('DD/MM/YYYY HH:mm')} - ${range.max!.format('DD/MM/YYYY HH:mm')}`);
      
      if (labels.length > 0) {
        setFilterLabels(prev => ({ ...prev, [filterKey]: labels }));
      }
    }
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

  // Apply filters
  const handleApplyClick = () => {
    const filterObj: SelectedFilters = {};
    const labelObj: { [key: string]: string[] } = {};

    // Add checkbox/radio/dropdown filters
    Object.entries(checkedState).forEach(([key, value]) => {
      const filter = filterData.find(f => f.key === key);
      const filterLabel = filter?.label || key;

      if (filter?.type === FILTER_TYPES.RADIO) {
        if (value !== '' && value !== null && value !== undefined) {
          filterObj[key] = value;
          if (showLabels) {
            // Find selected option label
            const option = filter?.options?.find((opt: any) =>
              typeof opt.value === 'object' && opt.value !== null
                ? JSON.stringify(opt.value) === JSON.stringify(value)
                : opt.value === value
            );
            labelObj[key] = [`${filterLabel}: ${option?.label ?? value}`];
          }
        }
      } else if (Array.isArray(value) && value.length > 0) {
        filterObj[key] = value;
        if (showLabels) {
          // Find labels for selected values
          const labels = value?.map((val: any) => {
            const option = filter?.options?.find((opt: any) =>
              typeof opt?.value === 'object' && opt?.value !== null
                ? JSON.stringify(opt.value) === JSON.stringify(val)
                : opt?.value === val
            );
            return option?.label ?? val;
          });
          labelObj[key] = [`${filterLabel}: ${labels.join(', ')}`];
        }
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        filterObj[key] = [value];
        if (showLabels) {
          labelObj[key] = [`${filterLabel}: ${JSON.stringify(value)}`];
        }
      }
    });

    // Add range filters
    Object.entries(rangeFilters).forEach(([key, filter]) => {
      if (filter.value) {
        const filterConfig = filterData?.find(f => f.key === key);
        const filterLabel = filterConfig?.label || key;
        filterObj[key] = filter.value;
        if (showLabels) {
          labelObj[key] = [`${filterLabel}: ${filter.value}`];
        }
      }
    });

    // Multi filters
    Object.entries(multiFilters).forEach(([key, filter]) => {
      if (filter.selectedOption) {
        const filterConfig = filterData?.find(f => f.key === key);
        const filterLabel = filterConfig?.label || key;
        const option = filter.selectedOption;
        const value = option.value;
        const hasValue = (val: any) => val !== undefined && val !== null;

        if (!filter.value1 || filter.value1.trim() === '') {
          return;
        }

        let updatedValue: any;
        let label = `${filterLabel}:`;

        if (hasValue(value.min) && hasValue(value.max) && hasValue(filter.value2) && filter.value2.trim() !== '') {
          updatedValue = { min: parseInt(filter.value1), max: parseInt(filter.value2) };
          label += ` ${filter.value1} - ${filter.value2}`;
        } else if (hasValue(value.minExcluded)) {
          updatedValue = { minExcluded: parseInt(filter.value1) };
          label += ` > ${filter.value1}`;
        } else if (hasValue(value.maxExcluded)) {
          updatedValue = { maxExcluded: parseInt(filter.value1) };
          label += ` < ${filter.value1}`;
        } else if (hasValue(value.eq)) {
          updatedValue = { eq: parseInt(filter.value1) };
          label += `${filter.value1}`;
        }

        if (updatedValue) {
          filterObj[key] = [updatedValue];
          if (showLabels) {
            labelObj[key] = [label];
          }
        }
      }
    });

    // Date filters
    Object.entries(dateFilters).forEach(([key, dateRange]) => {
      if (dateRange[0] && dateRange[1]) {
        const filterConfig = filterData.find(f => f.key === key);
        const filterLabel = filterConfig?.label || key;
        const formatDateForDisplay = (date: Date) => {
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };
        const startDate = dateRange[0] as Date;
        const endDate = dateRange[1] as Date;
        filterObj[key] = convertDateRangeToUTC(startDate, endDate);
        if (showLabels) {
          labelObj[key] = [`${filterLabel}: ${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`];
        }
      }
    });

    // Date-time filters
    Object.entries(dateTimeFilters).forEach(([key, dateTimeArray]) => {
      const filterConfig = filterData.find(f => f.key === key);
      const filterLabel = filterConfig?.label || key;
      const validRanges = dateTimeArray.filter(dateTimeRange => dateTimeRange.min && dateTimeRange.max);
      if (validRanges.length > 0) {
        filterObj[key] = validRanges.map(dateTimeRange =>
          convertDateTimeRangeToUTC(dateTimeRange.min, dateTimeRange.max)
        );
        if (showLabels) {
          labelObj[key] = validRanges.map(dateTimeRange =>
            `${filterLabel}: ${dateTimeRange.min!.format('DD/MM/YYYY HH:mm')} - ${dateTimeRange.max!.format('DD/MM/YYYY HH:mm')}`
          );
        }
      }
    });

    const hasDateErrors = Object.values(dateErrors).some(error => error !== null);
    const hasDateTimeErrors = Object.values(dateTimeErrors).some(error => error !== null);
    
    if (!hasDateErrors && !hasDateTimeErrors) {
      if (showLabels) {
        onApplyClick(filterObj, { ...filterLabels, ...labelObj });
      } else {
        onApplyClick(filterObj);
      }
    }
  };

  // Clear filters
  const handleClear = () => {
    const clearedState: SelectedFilters = {};
    const clearedLabels: { [key: string]: string[] } = {};
    const clearedRangeFilters: { [key: string]: { operator: string; value: string } } = {};
    const clearedMultiFilters: { [key: string]: { 
      selectedOption: string | unknown;
      value1: string; 
      value2?: string;
    } } = {};
    const clearedDateFilters: { [key: string]: [Date | null, Date | null] } = {};
    
    // CHANGED: Clear as empty array
    const clearedDateTimeFilters: { [key: string]: { min: Dayjs | null; max: Dayjs | null }[] } = {};
    
    filterData.forEach((filter: any) => {
      if ((filter.type === FILTER_TYPES.CHECKBOX || filter.type === FILTER_TYPES.DROPDOWN) && filter.options) {
        clearedState[filter.key] = [];
        if (showLabels) clearedLabels[filter.key] = [];
      } else if (filter.type === FILTER_TYPES.RADIO) {
        clearedState[filter.key] = '';
        if (showLabels) clearedLabels[filter.key] = [];
      } else if (filter.type === FILTER_TYPES.RANGE) {
        clearedRangeFilters[filter.key] = { operator: filter.operators?.[0]?.value || '>=', value: '' };
      } else if (filter.type === FILTER_TYPES.MULTI) {
        clearedMultiFilters[filter.key] = { 
          selectedOption: filter.options?.[0],
          value1: '',
          value2: '',
        };
      } else if (filter.type === FILTER_TYPES.DATE_RANGE) {
        clearedDateFilters[filter.key] = [null, null];
      } else if (filter.type === FILTER_TYPES.DATE_TIME_RANGE) {
        // CHANGED: Clear as empty array
        clearedDateTimeFilters[filter.key] = [];
      }
    });
    
    setCheckedState(clearedState);
    setFilterLabels(clearedLabels);
    setRangeFilters(clearedRangeFilters);
    setMultiFilters(clearedMultiFilters);
    setDateFilters(clearedDateFilters);
    setDateTimeFilters(clearedDateTimeFilters);
    setDateErrors({});
    setDateTimeErrors({});
  };

  // Render filter section (same as SeekerListFilterPopUp)
  const renderFilterSection = (filter: any) => {
    // Range type
    if (filter.type === FILTER_TYPES.RANGE) {
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
                <option key={option.value} value={option.value}>{option.label}</option>
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

    // Multi type
    if (filter.type === FILTER_TYPES.MULTI) {
      const currentFilter = multiFilters[filter.key];
      const selectedLabel = currentFilter?.selectedOption?.label || filter.options[0]?.label || '';
      const selectedValue = currentFilter?.selectedOption?.value;
      const isRange = selectedValue?.min !== undefined && selectedValue?.max !== undefined;
      
      return (
        <div key={filter.key} className={styles.levelContainer}>
          <p className={styles.levelHeading}>{filter.label}</p>
          <div className={styles.hdbFilterRow}>
            <FormControl className={styles.muiSelectContainer}>
              <Select
                value={selectedLabel}
                onChange={(e) => handleMultiFilterChange(filter.key, e.target.value, filter)}
                displayEmpty
                className={styles.muiSelect}
                sx={{
                  
                  '& .MuiSelect-select': {
                    padding: '8px 32px 8px 12px',
                    fontSize: '14px',
                    color: '#374151',
                    minWidth: "100px",
                    borderRadius: "8px",
                  },
                }}
              >
                {filter.options?.map((option: any) => (
                  <MenuItem key={option.label} value={option.label}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {isRange && (
              <input
                type="number"
                min={0}
                value={currentFilter?.value1 || ''}
                onChange={(e) => setMultiFilters(prev => ({
                  ...prev,
                  [filter.key]: { 
                    ...prev[filter.key], 
                    value1: e.target.value.replace(/[^0-9]/g, "") 
                  }
                }))}
                className={styles.hdbInputFlex}
                placeholder={textConstant.MIN}
              />
            )}
            
            <input
              type="number"
              min={0}
              value={isRange ? (currentFilter?.value2 || '') : (currentFilter?.value1 || '')}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setMultiFilters(prev => ({
                  ...prev,
                  [filter.key]: { 
                    ...prev[filter.key], 
                    [isRange ? textConstant.MAX_VALUE : textConstant.MIN_VALUE]: value 
                  }
                }));
              }}
              className={styles.hdbInputFlex}
              placeholder={isRange ? textConstant.MAX : textConstant.VALUE}
            />
          </div>
        </div>
      );
    }

    // Date type
    if (filter.type === FILTER_TYPES.DATE_RANGE) {
      return (
        <div key={filter.key} className={styles.levelContainer}>
          <p className={styles.levelHeading}>{filter.label}</p>
          <div className={styles.datePickerContainer}>
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
            {dateErrors[filter.key] && <div className={styles.dateError}>{dateErrors[filter.key]}</div>}
          </div>
        </div>
      );
    }

    // CHANGED: Date-Time Range type - render only first entry for now (can be extended for multiple)
    if (filter.type === FILTER_TYPES.DATE_TIME_RANGE) {
      const currentRanges = dateTimeFilters[filter.key] || [{ min: null, max: null }];
      const isDepartureDatetime = filter.key === 'departureDatetime' && !!programEndsAt;
      const defaultDate = isDepartureDatetime ? dayjs(programEndsAt) : undefined;
      const currentMin = isDepartureDatetime ? (currentRanges[0]?.min || defaultDate) : (currentRanges[0]?.min || null);
      const currentMax = isDepartureDatetime ? (currentRanges[0]?.max || defaultDate) : (currentRanges[0]?.max || null);
      
      return (
        <div key={filter.key} className={styles.levelContainer}>
          <p className={styles.levelHeading}>{filter.label}</p>
          <DateTimeRangePicker
            minValue={currentMin}
            maxValue={currentMax}
            onMinChange={(value) => {
              if (isDepartureDatetime && value && defaultDate) {
                const newDateTime = defaultDate
                  .hour(value.hour())
                  .minute(value.minute())
                  .second(0)
                  .millisecond(0);
                handleDateTimeChange(filter.key, 0, 'min', newDateTime);
              } else {
                handleDateTimeChange(filter.key, 0, 'min', value);
              }
            }}
            onMaxChange={(value) => {
              if (isDepartureDatetime && value && defaultDate) {
                const newDateTime = defaultDate
                  .hour(value.hour())
                  .minute(value.minute())
                  .second(0)
                  .millisecond(0);
                handleDateTimeChange(filter.key, 0, 'max', newDateTime);
              } else {
                handleDateTimeChange(filter.key, 0, 'max', value);
              }
            }}
            minLabel={filter.minLabel}
            maxLabel={filter.maxLabel}
            minPlaceholder={filter.minPlaceholder}
            maxPlaceholder={filter.maxPlaceholder}
            error={dateTimeErrors[filter.key]}
            format={filter.format || "DD/MM/YYYY HH:mm"}
            disableDate={isDepartureDatetime}
            defaultDate={defaultDate}
          />
        </div>
      );
    }

    // Dropdown type
    if (filter?.type === FILTER_TYPES.DROPDOWN) {
      const selectedValues = Array.isArray(checkedState[filter.key]) ? (checkedState[filter.key] as string[]) : [];
      
      // FIX: Map selected values back to their original option labels
      const selectedLabels = filter?.options
        .filter((opt: any) => {
          const optValue = opt.value;
          
          if (Array.isArray(optValue)) {
            // Check if ALL values from this array option exist in selectedValues
            return optValue.every((val: any) =>
              selectedValues.some((sv: any) =>
                typeof sv === 'object' && typeof val === 'object' && val
                  ? JSON.stringify(sv) === JSON.stringify(val)
                  : sv === val
              )
            );
          } else if (typeof optValue === 'object' && optValue) {
            // Check if this object exists in selectedValues
            return selectedValues.some((sv: any) =>
              JSON.stringify(sv) === JSON.stringify(optValue)
            );
          } else {
            // Check if this primitive value exists in selectedValues
            return selectedValues.includes(optValue);
          }
        })
        .map((opt: any) => opt.label);


      return (
        <div key={filter.key} className={styles.levelContainer}>
          <p className={styles.levelHeading}>{filter.label}</p>
          <MultiSelect
            options={filter.options.map((opt: any) => opt.label)}
            selected={selectedLabels}
            setSelected={(labels: string[]) => {
              
              // Map labels back to values
              const values = labels.map((label: string) => {
                const option = filter.options.find((opt: any) => opt.label === label);
                return option?.value || label;
              });
              
              handleDropdownChange(filter.key, values, labels);
            }}
            closeOnClickOutside={true}
            placeholder={filter.placeholder || filter.label}
          />
        </div>
      );
    }

    // FILTER_TYPES.CHECKBOX  and radio types
    if ((filter.type === FILTER_TYPES.CHECKBOX  || filter.type === FILTER_TYPES.RADIO) && filter.options) {
      return (
        <div key={filter.key} className={styles.levelContainer}>
          <p className={styles.levelHeading}>{filter.label}</p>
          <div className={filter.type === FILTER_TYPES.RADIO ? styles.radioButtonsContainer : styles.checkboxesContainer}>
            {filter.options.map((option: any, index: number) => {
              const optionValue = option.value;
              const optionLabel = option.label;
              
              let displayValue: string;
              let uniqueKey: string;
              
              if (typeof optionValue === 'object' && optionValue !== null && !Array.isArray(optionValue)) {
                displayValue = JSON.stringify(optionValue);
                uniqueKey = `${filter.key}-${JSON.stringify(optionValue)}-${index}`;
              } else if (Array.isArray(optionValue)) {
                displayValue = optionValue.join(',');
                uniqueKey = `${filter.key}-${optionValue.join('-')}-${index}`;
              } else {
                displayValue = String(optionValue);
                uniqueKey = `${filter.key}-${optionValue}-${index}`;
              }
              
              // FIX: Improved isChecked logic
              const isChecked = (() => {
                if (filter.type === FILTER_TYPES.RADIO) {
                  // For radio buttons, compare directly
                  if (typeof optionValue === 'object' && optionValue !== null) {
                    return JSON.stringify(checkedState[filter.key]) === JSON.stringify(optionValue);
                  }
                  return checkedState[filter.key] === optionValue;
                } else {
                  // For checkboxes
                  const currentValues = (checkedState[filter.key] as any[]) || [];
                  
                  if (Array.isArray(optionValue)) {
                    // FIX: Check if ALL values from optionValue exist in currentValues
                    return optionValue.every((val: any) => 
                      currentValues.some((cv: any) => 
                        typeof cv === 'object' && typeof val === 'object'
                          ? JSON.stringify(cv) === JSON.stringify(val)
                          : cv === val
                      )
                    );
                  } else if (typeof optionValue === 'object' && optionValue !== null) {
                    // For object values
                    return currentValues.some((cv: any) => 
                      JSON.stringify(cv) === JSON.stringify(optionValue)
                    );
                  } else {
                    // For primitive values
                    return currentValues.includes(optionValue);
                  }
                }
              })();

              if (filter.type === FILTER_TYPES.RADIO) {
                return (
                  <CustomRadioButton
                    key={uniqueKey}
                    text={optionLabel}
                    name={filter.key}
                    value={displayValue}
                    checked={isChecked}
                    onChange={handleChange(filter.key, optionValue, filter.type, optionLabel)}
                  />
                );
              } else {
                return (
                  <CustomCheckbox
                    key={uniqueKey}
                    text={optionLabel}
                    checked={isChecked}
                    onChange={handleChange(filter.key, optionValue, filter.type, optionLabel)}
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
        <p className={styles.heading}>{title}</p>
        <FormLine />
        <img src={closeIcon} alt="close icon" onClick={onClose} className={styles.closeIcon} />
      </div>

      <div className={styles.overAllLevelContainer}>
        {filterData
          .filter((filter: any) => filter.filterable)
          .sort((a: any, b: any) => a.order - b.order)
          .map((filter: any) => renderFilterSection(filter))}
      </div>
    <div className={styles.stickyFooter}>
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
    </div>
  );
};

export default CommonFilterPopUp;