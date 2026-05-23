import React, { useState, useEffect, useRef } from "react";
import styles from "./index.module.scss";
import { Button } from "../Button";
import caretUp from "../../../assets/images/filled-caret-up.svg";
import caretDown from "../../../assets/images/filled-caret-down.svg";
import { formatDateWithDay } from "../../../utils/commonFunctions";
import { Program } from "../../../common/types/program";

interface BirthDatePickerProps {
  value?: Date | string;
  onChange: (date: string | undefined) => void;
  className?: string;
  label?: string;
  error?: string;
  config?: any;
  onBlur?: () => void;
  allocatedProgram?: Program | null;
}

const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month, 0).getDate();
};

const formatDisplayDate = (date: Date | string | undefined) => {
  if (!date) return "";
  return formatDateWithDay(date.toString());
};

const BirthDatePicker: React.FC<BirthDatePickerProps> = ({
  value,
  onChange,
  label,
  error,
  config,
  onBlur,
  allocatedProgram,
}) => {
  const dayColRef = useRef<HTMLDivElement>(null);
  const monthColRef = useRef<HTMLDivElement>(null);
  const yearColRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dayItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const monthItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const yearItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [showPicker, setShowPicker] = useState(false);
  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");

  // Debounce timer refs for each column
  const dayScrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const monthScrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const yearScrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize from value
  useEffect(() => {
    if (value instanceof Date && !isNaN(value.getTime())) {
      setDay(value.getDate().toString());
      setMonth((value.getMonth() + 1).toString());
      setYear(value.getFullYear().toString());
    } else if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [yyyy, mm, dd] = value.split("-");
      setYear(yyyy);
      setMonth(parseInt(mm, 10).toString());
      setDay(parseInt(dd, 10).toString());
    }
  }, [value]);

  useEffect(() => {
    // Always sync picker state with value from parent
    if (value instanceof Date && !isNaN(value.getTime())) {
      setDay(value.getDate().toString());
      setMonth((value.getMonth() + 1).toString());
      setYear(value.getFullYear().toString());
    } else if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [yyyy, mm, dd] = value.split("-");
      setYear(yyyy);
      setMonth(parseInt(mm, 10).toString());
      setDay(parseInt(dd, 10).toString());
    }
  }, [value, showPicker]); 

  // Add placement calculation function
  const calculatePlacement = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const pickerHeight = 300;

      if (spaceBelow < pickerHeight && spaceAbove > pickerHeight) {
        setPlacement("top");
      } else {
        setPlacement("bottom");
      }
    }
  };

  // Helper to add/subtract units from a date
  const addToDate = (date: Date, unit: string, value: number) => {
    const newDate = new Date(date);
    switch (unit) {
      case "year":
        newDate.setFullYear(newDate.getFullYear() + value);
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + value);
        break;
      case "days":
      case "day":
        newDate.setDate(newDate.getDate() + value);
        break;
      default:
        break;
    }
    return newDate;
  };

  // FIXED: Better scroll to item function that allows edge items to be selectable
  const scrollToItem = (
    colRef: React.RefObject<HTMLDivElement>,
    itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
    index: number,
    smooth: boolean = true
  ) => {
    const container = colRef.current;
    const item = itemRefs.current[index];
    if (!container || !item) return;

    const containerHeight = container.offsetHeight;
    const itemHeight = item.offsetHeight;
    const itemTop = item.offsetTop;
    
    // Calculate the ideal scroll position (centered)
    const idealScrollPosition = itemTop - containerHeight / 2 + itemHeight / 2;
    
    // Get the maximum possible scroll position
    const maxScroll = container.scrollHeight - containerHeight;
    
    // Clamp the scroll position to valid bounds
    const clampedScrollPosition = Math.max(0, Math.min(idealScrollPosition, maxScroll));
    
    container.scrollTo({ 
      top: clampedScrollPosition, 
      behavior: smooth ? "smooth" : "auto" 
    });
  };

  // FIXED: Better scroll handler that finds the closest visible item
  const findClosestVisibleItem = (
    colRef: React.RefObject<HTMLDivElement>,
    itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
    listLength: number
  ) => {
    const container = colRef.current;
    if (!container || listLength === 0) return 0;

    const containerHeight = container.offsetHeight;
    const scrollTop = container.scrollTop;
    const centerPoint = scrollTop + containerHeight / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    for (let i = 0; i < listLength; i++) {
      const item = itemRefs.current[i];
      if (!item) continue;

      const itemTop = item.offsetTop;
      const itemHeight = item.offsetHeight;
      const itemCenter = itemTop + itemHeight / 2;
      const distance = Math.abs(centerPoint - itemCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    return closestIndex;
  };

  // On click, set value and scroll to item (handle padding)
  const handleItemClick = (
    setter: (v: number | string) => void,
    list: (number | null)[] | ({ value: string | null; label: string })[] | (number | { value: string | null; label: string })[],
    index: number,
    colRef: React.RefObject<HTMLDivElement>,
    itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>
  ) => {
    const item = list[index];
    // Skip if it's a padding item (null)
    if (item === null || (typeof item === 'object' && item.value === null)) {
      return;
    }
    
    const value = typeof item === "object" ? item.value : item;
    setter(value.toString());
    scrollToItem(colRef, itemRefs, index, true);
  };

  // FIXED: Better scroll handler (handle padding)
  const handleScroll = (
    setter: (v: number | string) => void,
    list: (number | null)[] | ({ value: string | null; label: string })[] | (number | { value: string | null; label: string })[],
    e: React.UIEvent<HTMLDivElement>,
    colRef: React.RefObject<HTMLDivElement>,
    itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
    timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
  ) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const closestIndex = findClosestVisibleItem(colRef, itemRefs, list.length);
      const item = list[closestIndex];
      
      // Skip if it's a padding item (null)
      if (item === null || (typeof item === 'object' && item.value === null)) {
        return;
      }
      
      const value = typeof item === "object" ? item.value : item;
      setter(value.toString());
      
      // Only snap to position if we're not already close enough
      const container = colRef.current;
      const itemElement = itemRefs.current[closestIndex];
      if (container && itemElement) {
        const containerHeight = container.offsetHeight;
        const itemTop = itemElement.offsetTop;
        const itemHeight = itemElement.offsetHeight;
        const itemCenter = itemTop + itemHeight / 2;
        const containerCenter = container.scrollTop + containerHeight / 2;
        const distance = Math.abs(itemCenter - containerCenter);
        
        // Only snap if we're more than 5px away from center
        if (distance > 5) {
          scrollToItem(colRef, itemRefs, closestIndex, true);
        }
      }
    }, 150);
  };

  // Set button handler
  const handleSet = () => {
    updateDate(day, month, year);
    setShowPicker(false);
  };


// Auto-update placement on scroll/resize
useEffect(() => {
  if (!showPicker) return;

  const handleRecalc = () => {
    calculatePlacement();
  };

  window.addEventListener("scroll", handleRecalc, true); // true = capture, handles nested scrolls too
  window.addEventListener("resize", handleRecalc);

  return () => {
    window.removeEventListener("scroll", handleRecalc, true);
    window.removeEventListener("resize", handleRecalc);
  };
}, [showPicker]);

  // Close picker on outside click
  useEffect(() => {
    if (!showPicker) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&  inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
        if (onBlur) {
          onBlur();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPicker]);

  // Calculate minDate and maxDate based on config
  let minDate: Date | null = null;
  let maxDate: Date | null = null;
  const today = new Date();
  
  if (
    config?.dateTypeValidation === "custom" &&
    config?.pastValidation?.dateValidationField &&
    allocatedProgram
  ) {
    const field = config.pastValidation.dateValidationField;
    const fieldValue = allocatedProgram[field];
    if (fieldValue) {
      const baseDate = new Date(fieldValue);
      if (config.pastValidation?.enabled) {
        baseDate.setFullYear(baseDate.getFullYear());
        baseDate.setMonth(baseDate.getMonth());
        baseDate.setDate(baseDate.getDate());
        minDate = baseDate;
      }
      if (config.futureValidation?.enabled) {
        const { unit, minValue, maxValue } = config.futureValidation;
        const futureMin = addToDate(baseDate, unit, minValue);
        const futureMax = addToDate(baseDate, unit, maxValue);
        if (minDate && maxDate) {
          if (futureMin > maxDate || futureMax < minDate) {
            minDate = maxDate = null;
          } else {
            minDate = futureMin > minDate ? futureMin : minDate;
            maxDate = futureMax < maxDate ? futureMax : maxDate;
          }
        } else {
          minDate = futureMin;
          maxDate = futureMax;
        }
      }
    }
  } else if (config && config.pastValidation && config.pastValidation.enabled) {
    const { unit, minValue, maxValue } = config.pastValidation;
    minDate = addToDate(today, unit, -maxValue);
    maxDate = addToDate(today, unit, -minValue);
  }
  
  if (config && config.futureValidation && config.futureValidation.enabled) {
    const { unit, minValue, maxValue } = config.futureValidation;
    const futureMin = addToDate(today, unit, minValue);
    const futureMax = addToDate(today, unit, maxValue);
    if (minDate && maxDate) {
      if (futureMin > maxDate || futureMax < minDate) {
        minDate = maxDate = null;
      } else {
        minDate = futureMin > minDate ? futureMin : minDate;
        maxDate = futureMax < maxDate ? futureMax : maxDate;
      }
    } else {
      minDate = futureMin;
      maxDate = futureMax;
    }
  }
  
  if (!minDate) minDate = new Date(new Date().getFullYear() - 100, 0, 1);
  if (!maxDate) maxDate = today;

  // Generate years, months, and days lists with padding for scroll-ability
  const minYear = minDate.getFullYear();
  const maxYear = maxDate.getFullYear();
  const baseYears = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i,
  ).filter((y) => y >= minYear && y <= maxYear);
  
  // Add padding items at top only to allow scrolling to first items
  const PADDING_ITEMS = 3;
  const years = [
    ...Array(PADDING_ITEMS).fill(null), // Empty items at top
    ...baseYears
  ];

  let monthsList = months;
  if (year) {
    const selectedYear = parseInt(year);
    let startMonth = 1;
    let endMonth = 12;
    if (selectedYear === minYear) startMonth = minDate.getMonth() + 1;
    if (selectedYear === maxYear) endMonth = maxDate.getMonth() + 1;
    const baseMonths = months.filter(
      (m: { value: string; label: string }) =>
        parseInt(m.value) >= startMonth && parseInt(m.value) <= endMonth,
    );
    // Add padding for months (top only)
    monthsList = [
      ...Array(PADDING_ITEMS).fill({ value: null, label: "" }),
      ...baseMonths
    ];
  } else if (minYear == maxYear) {
    let startMonth = 1;
    let endMonth = 12;
    startMonth = minDate.getMonth() + 1;
    endMonth = maxDate.getMonth() + 1;
    const baseMonths = months.filter(
      (m: { value: string; label: string }) =>
        parseInt(m.value) >= startMonth && parseInt(m.value) <= endMonth,
    );
    // Add padding for months (top only)
    monthsList = [
      ...Array(PADDING_ITEMS).fill({ value: null, label: "" }),
      ...baseMonths
    ];
  } else {
    const selectedYear = parseInt(year);
    let startMonth = 1;
    let endMonth = 12;
    if (selectedYear === minYear) startMonth = minDate.getMonth() + 1;
    if (selectedYear === maxYear) endMonth = maxDate.getMonth() + 1;
    const baseMonths = months.filter(
      (m: { value: string; label: string }) =>
        parseInt(m.value) >= startMonth && parseInt(m.value) <= endMonth,
    );
    // Add padding for months (top only)
    monthsList = [
      ...Array(PADDING_ITEMS).fill({ value: null, label: "" }),
      ...baseMonths
    ];
  }

  let daysList = Array.from({ length: 31 }, (_, i) => i + 1);
  if (year && month) {
    const selectedYear = parseInt(year);
    const selectedMonth = parseInt(month);
    let startDay = 1;
    let endDay = getDaysInMonth(selectedMonth, selectedYear);
    if (selectedYear === minYear && selectedMonth === minDate.getMonth() + 1)
      startDay = minDate.getDate();
    if (selectedYear === maxYear && selectedMonth === maxDate.getMonth() + 1)
      endDay = maxDate.getDate();
    const baseDays = Array.from(
      { length: endDay - startDay + 1 },
      (_, i) => startDay + i,
    );
    // Add padding for days (top only)
    daysList = [
      ...Array(PADDING_ITEMS).fill(null),
      ...baseDays
    ];
  } else {
    const selectedYear = years.find(y => y !== null) || years[PADDING_ITEMS];
    const selectedMonth = parseInt(monthsList.find(m => m.value !== null)?.value || monthsList[PADDING_ITEMS]?.value);
    if (selectedYear && selectedMonth) {
      let startDay = 1;
      let endDay = getDaysInMonth(selectedMonth, selectedYear);
      if (selectedYear === minYear && selectedMonth === minDate.getMonth() + 1)
        startDay = minDate.getDate();
      if (selectedYear === maxYear && selectedMonth === maxDate.getMonth() + 1)
        endDay = maxDate.getDate();
      const baseDays = Array.from(
        { length: endDay - startDay + 1 },
        (_, i) => startDay + i,
      );
      // Add padding for days (top only)
      daysList = [
        ...Array(PADDING_ITEMS).fill(null),
        ...baseDays
      ];
    }
  }

  useEffect(() => {
    if (!month || !year || daysList.length === 0) return;
    // Find first non-null day
    const validDays = daysList.filter(d => d !== null);
    if (!validDays.includes(Number(day))) {
      setDay(validDays[0].toString());
    }
  }, [month, year, daysList]);

  useEffect(() => {
    // Find first non-null values for initialization, but only if not set by value
    const validMonths = monthsList.filter(m => m.value !== null);
    const validYears = years.filter(y => y !== null);
    const validDays = daysList.filter(d => d !== null);

    if (!month && validMonths.length > 0) {
      setMonth(validMonths[0].value);
    }
    if (!year && validYears.length > 0) {
      setYear(validYears[0].toString());
    }
    if (!day && validDays.length > 0) {
      setDay(validDays[0].toString());
    }
  }, [monthsList, years, daysList, showPicker]); // <-- add showPicker to dependencies

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const updateDate = (newDay: string, newMonth: string, newYear: string) => {
    if (newDay && newMonth && newYear) {
      const date = new Date(
        parseInt(newYear),
        parseInt(newMonth) - 1,
        parseInt(newDay),
      );
      if (isNaN(date.getTime())) {
        onChange(undefined);
        return;
      }
      const formattedDate = formatDate(date);
      onChange(formattedDate);
    } else {
      onChange(undefined);
    }
  };

  // FIXED: Better initial scroll positioning
  useEffect(() => {
    if (!showPicker) return;
    
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      // Scroll to selected day
      if (dayColRef.current && day && daysList.length > 0) {
        const dayIndex = daysList.findIndex((d) => String(d) === String(day));
        if (dayIndex >= 0) {
          scrollToItem(dayColRef, dayItemRefs, dayIndex, false);
        }
      }
      
      // Scroll to selected month
      if (monthColRef.current && month && monthsList.length > 0) {
        const monthIndex = monthsList.findIndex((m) => String(m.value) === String(month));
        if (monthIndex >= 0) {
          scrollToItem(monthColRef, monthItemRefs, monthIndex, false);
        }
      }
      
      // Scroll to selected year
      if (yearColRef.current && year && years.length > 0) {
        const yearIndex = years.findIndex((y) => String(y) === String(year));
        if (yearIndex >= 0) {
          scrollToItem(yearColRef, yearItemRefs, yearIndex, false);
        }
      }
    }, 50);
  }, [showPicker, day, month, year, daysList, monthsList, years]);

  // Helper to select previous/next item in a list (skipping padding)
  const selectPrev = (
    setter: (v: number | string) => void,
    list: any[],
    currentValue: string,
    colRef: React.RefObject<HTMLDivElement>,
    itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>
  ) => {
    let currentIndex = list.findIndex(item =>
      item !== null && (
        typeof item === "object"
          ? String(item.value) === String(currentValue)
          : String(item) === String(currentValue)
      )
    );
    let prevIndex = currentIndex - 1;
    while (prevIndex >= 0 && (list[prevIndex] === null || (typeof list[prevIndex] === "object" && list[prevIndex].value === null))) {
      prevIndex--;
    }
    if (prevIndex >= 0) {
      const value = typeof list[prevIndex] === "object" ? list[prevIndex].value : list[prevIndex];
      setter(value.toString());
      scrollToItem(colRef, itemRefs, prevIndex, true);
    }
  };

  const selectNext = (
    setter: (v: number | string) => void,
    list: any[],
    currentValue: string,
    colRef: React.RefObject<HTMLDivElement>,
    itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>
  ) => {
    let currentIndex = list.findIndex(item =>
      item !== null && (
        typeof item === "object"
          ? String(item.value) === String(currentValue)
          : String(item) === String(currentValue)
      )
    );
    let nextIndex = currentIndex + 1;
    while (nextIndex < list.length && (list[nextIndex] === null || (typeof list[nextIndex] === "object" && list[nextIndex].value === null))) {
      nextIndex++;
    }
    if (nextIndex < list.length) {
      const value = typeof list[nextIndex] === "object" ? list[nextIndex].value : list[nextIndex];
      setter(value.toString());
      scrollToItem(colRef, itemRefs, nextIndex, true);
    }
  };

  // Helper to check if prev/next is available (not at edge)
  const canSelectPrev = (list: any[], currentValue: string) => {
    let currentIndex = list.findIndex(item =>
      item !== null && (
        typeof item === "object"
          ? String(item.value) === String(currentValue)
          : String(item) === String(currentValue)
      )
    );
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (list[i] !== null && (typeof list[i] !== "object" || list[i].value !== null)) {
        return true;
      }
    }
    return false;
  };

  const canSelectNext = (list: any[], currentValue: string) => {
    let currentIndex = list.findIndex(item =>
      item !== null && (
        typeof item === "object"
          ? String(item.value) === String(currentValue)
          : String(item) === String(currentValue)
      )
    );
    for (let i = currentIndex + 1; i < list.length; i++) {
      if (list[i] !== null && (typeof list[i] !== "object" || list[i].value !== null)) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className={styles.birthDatePickerWrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        ref={inputRef}
        className={styles.fieldInput}
        value={formatDisplayDate(value)}
        readOnly
        onClick={() => {
        if (showPicker) {
          setShowPicker(false);
        } else {
          calculatePlacement();
          setShowPicker(true);
        }
      }}
        placeholder="DD-MMM-YYYY"
      />
      {showPicker && (
        <div
          className={`${styles.wheelPickerPopup} ${
            placement === "top"
              ? styles.wheelPickerPopupTop
              : styles.wheelPickerPopupBottom
          }`}
        >
          <div className={styles.wheelPickerContainer} ref={pickerRef}>
            <div className={styles.wheelColumnCaretIcons}>
              {/* Days up arrow */}
              <div className={styles.wheelColumnIcon}>
                <img
                  src={caretUp}
                  style={{
                    cursor: canSelectPrev(daysList, day) ? "pointer" : "not-allowed",
                    opacity: canSelectPrev(daysList, day) ? 1 : 0.3,
                    height: '16px',
                    width: '16px'
                  }}
                  onClick={() => canSelectPrev(daysList, day) && selectPrev(setDay, daysList, day, dayColRef, dayItemRefs)}
                  alt="up"
                />
              </div>
              {/* Months up arrow */}
              <div className={styles.wheelColumnMonthIcon}>
                <img
                  src={caretUp}
                  style={{
                    cursor: canSelectPrev(monthsList, month) ? "pointer" : "not-allowed",
                    opacity: canSelectPrev(monthsList, month) ? 1 : 0.3,
                     height: '16px',
                    width: '16px'
                  }}
                  onClick={() => canSelectPrev(monthsList, month) && selectPrev(setMonth, monthsList, month, monthColRef, monthItemRefs)}
                  alt="up"
                />
              </div>
              {/* Years up arrow */}
              <div className={styles.wheelColumnIcon}>
                <img
                  src={caretUp}
                  style={{
                    cursor: canSelectPrev(years, year) ? "pointer" : "not-allowed",
                    opacity: canSelectPrev(years, year) ? 1 : 0.3,
                     height: '16px',
                    width: '16px'
                  }}
                  onClick={() => canSelectPrev(years, year) && selectPrev(setYear, years, year, yearColRef, yearItemRefs)}
                  alt="up"
                />
              </div>
            </div>
            <div className={styles.wheelPicker}>
              <div className={styles.wheelCenterLine}></div>

              {/* Days */}
              <div
                ref={dayColRef}
                className={`${styles.wheelColumn} ${
                  daysList.length <= 7 ? styles.noScroll : ""
                }`}
                onScroll={
                  daysList.length > 7
                    ? (e) =>
                        handleScroll(
                          setDay,
                          daysList,
                          e,
                          dayColRef,
                          dayItemRefs,
                          dayScrollTimeout
                        )
                    : undefined
                }
              >
                {daysList.map((d, index) => (
                  <div
                    key={`day-${index}`}
                    ref={(el) => (dayItemRefs.current[index] = el)}
                    onClick={() =>
                      handleItemClick(
                        setDay,
                        daysList,
                        index,
                        dayColRef,
                        dayItemRefs,
                      )
                    }
                    className={d == day ? styles.selected : styles.item}
                    style={{
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: d === null ? 0 : 1, // Hide padding items
                      pointerEvents: d === null ? 'none' : 'auto'
                    }}
                  >
                    {d || ''}
                  </div>
                ))}
              </div>

              {/* Months */}
              <div
                ref={monthColRef}
                className={`${styles.wheelColumnMonth} ${
                  months.length <= 7 ? styles.noScroll : ""
                }`}
                onScroll={
                  months.length > 7
                    ? (e) =>
                        handleScroll(
                          setMonth,
                          monthsList,
                          e,
                          monthColRef,
                          monthItemRefs,
                          monthScrollTimeout
                        )
                    : undefined
                }
              >
                {monthsList.map((m, index) => (
                  <div
                    key={`month-${index}`}
                    ref={(el) => (monthItemRefs.current[index] = el)}
                    onClick={() =>
                      handleItemClick(
                        setMonth,
                        monthsList,
                        index,
                        monthColRef,
                        monthItemRefs,
                      )
                    }
                    className={
                      (m.value && Number(m.value) == month)
                        ? styles.selectedMonth
                        : styles.monthitem
                    }
                    style={{
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: m.value === null ? 0 : 1, // Hide padding items
                      pointerEvents: m.value === null ? 'none' : 'auto'
                    }}
                  >
                    {m.label || ''}
                  </div>
                ))}
              </div>

              {/* Years */}
              <div
                ref={yearColRef}
                className={`${styles.wheelColumn} ${
                  years.length <= 7 ? styles.noScroll : ""
                }`}
                onScroll={
                  years.length > 7
                    ? (e) =>
                        handleScroll(
                          setYear,
                          years,
                          e,
                          yearColRef,
                          yearItemRefs,
                          yearScrollTimeout
                        )
                    : undefined
                }
              >
                {years.map((y, index) => (
                  <div
                    key={`year-${index}`}
                    ref={(el) => (yearItemRefs.current[index] = el)}
                    className={y == year ? styles.selected : styles.item}
                    onClick={() =>
                      handleItemClick(
                        setYear,
                        years,
                        index,
                        yearColRef,
                        yearItemRefs,
                      )
                    }
                    style={{
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: y === null ? 0 : 1, // Hide padding items
                      pointerEvents: y === null ? 'none' : 'auto'
                    }}
                  >
                    {y || ''}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.wheelColumnCaretIcons}>
              {/* Days down arrow */}
              <div className={styles.wheelColumnIcon}>
                <img
                  src={caretDown}
                  style={{
                    cursor: canSelectNext(daysList, day) ? "pointer" : "not-allowed",
                    opacity: canSelectNext(daysList, day) ? 1 : 0.3,
                     height: '16px',
                    width: '16px'
                  }}
                  onClick={() => canSelectNext(daysList, day) && selectNext(setDay, daysList, day, dayColRef, dayItemRefs)}
                  alt="down"
                />
              </div>
              {/* Months down arrow */}
              <div className={styles.wheelColumnMonthIcon}>
                <img
                  src={caretDown}
                  style={{
                    cursor: canSelectNext(monthsList, month) ? "pointer" : "not-allowed",
                    opacity: canSelectNext(monthsList, month) ? 1 : 0.3,
                     height: '16px',
                    width: '16px'
                  }}
                  onClick={() => canSelectNext(monthsList, month) && selectNext(setMonth, monthsList, month, monthColRef, monthItemRefs)}
                  alt="down"
                />
              </div>
              {/* Years down arrow */}
              <div className={styles.wheelColumnIcon}>
                <img
                  src={caretDown}
                  style={{
                    cursor: canSelectNext(years, year) ? "pointer" : "not-allowed",
                    opacity: canSelectNext(years, year) ? 1 : 0.3,
                     height: '16px',
                    width: '16px'
                  }}
                  onClick={() => canSelectNext(years, year) && selectNext(setYear, years, year, yearColRef, yearItemRefs)}
                  alt="down"
                />
              </div>
            </div>

            <div className={styles.horizontalDivider}></div>
            <div className={styles.wheelPickerContainerBottom}>
              <Button
                buttonTextClassName={styles.buttonText}
                buttonClassName={styles.buttonContainer}
                onClick={handleSet}
              >
                set
              </Button>
            </div>
          </div>
        </div>
      )}
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default BirthDatePicker;