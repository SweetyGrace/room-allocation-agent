import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import styles from './index.module.scss';
import { Button } from '../Button';

const ITEM_HEIGHT = 36;
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};
interface DatePickerProps {
  value?: Date;
  onChange: (date: string | undefined) => void;
  className?: string;
  label?: string;
  error?: string;
  disable?: boolean; // Optional prop to disable the date picker
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  className,
  error,
  disable = false,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const date = new Date(value);

const day = date.getDate();
const month = date.getMonth(); // Zero-based (0 = Jan, 5 = June)
const year = date.getFullYear();
  const [selectedDate, setSelectedDate] = useState( {
    day: day || 1,
    month: month || 0,
    year: year || 1998,
  });

  const dayRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);
  const pickerRef = useRef(null);
  const inputRef = useRef(null);

  // Add debounce refs to prevent excessive updates
  const scrollTimeoutRef = useRef(null);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 101 }, (_, i) => currentYear - i);
  }, []);

  const days = useMemo(() => {
    const daysInMonth = getDaysInMonth(selectedDate.year, selectedDate.month);
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [selectedDate.year, selectedDate.month]);

  useEffect(() => {
    if (selectedDate.day > days.length) {
      setSelectedDate(prev => ({ ...prev, day: days.length }));
    }
  }, [days, selectedDate.day]);

  // On mount/open, scroll to the selected value
  useEffect(() => {
    if (isPickerOpen) {
      if (dayRef.current) {
        dayRef.current.scrollTo({
          top: (selectedDate.day - 1) * ITEM_HEIGHT,
          behavior: 'auto',
        });
      }
      if (monthRef.current) {
        monthRef.current.scrollTo({
          top: (selectedDate.month) * ITEM_HEIGHT,
          behavior: 'auto',
        });
      }
      if (yearRef.current) {
        const yearIndex = years.findIndex(y => y === selectedDate.year);
        yearRef.current.scrollTo({
          top: (yearIndex) * ITEM_HEIGHT,
          behavior: 'auto',
        });
      }
    }
  }, [isPickerOpen, selectedDate, days, years]);

  // Improved scroll handlers with debouncing for smooth scrolling
  const onDayScroll = useCallback(() => {
    if (!dayRef.current) return;
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Debounce the update to reduce jerky behavior
    scrollTimeoutRef.current = setTimeout(() => {
      const scrollTop = dayRef.current.scrollTop;
      const index = Math.max(0, Math.min(Math.round(scrollTop / ITEM_HEIGHT), days.length - 1));
      const newDay = days[index];
      
      if (newDay && newDay !== selectedDate.day) {
        setSelectedDate(prev => ({ ...prev, day: newDay }));
      }
    }, 50); // Small delay to smooth out updates
  }, [days, selectedDate.day]);

  const onMonthScroll = useCallback(() => {
    if (!monthRef.current) return;
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      const scrollTop = monthRef.current.scrollTop;
      const index = Math.max(0, Math.min(Math.round(scrollTop / ITEM_HEIGHT), 11));
      
      if (index !== selectedDate.month) {
        setSelectedDate(prev => ({ ...prev, month: index }));
      }
    }, 50);
  }, [selectedDate.month]);

  const onYearScroll = useCallback(() => {
    if (!yearRef.current) return;
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      const scrollTop = yearRef.current.scrollTop;
      const index = Math.max(0, Math.min(Math.round(scrollTop / ITEM_HEIGHT), years.length - 1));
      const newYear = years[index];
      
      if (newYear && newYear !== selectedDate.year) {
        setSelectedDate(prev => ({ ...prev, year: newYear }));
      }
    }, 50);
  }, [years, selectedDate.year]);

  // Arrow click logic (with smooth scroll)
  const handleArrowClick = useCallback((key, delta) => {
    setSelectedDate(prev => {
      let newDate = { ...prev };
      if (key === 'day') {
        const daysCount = days.length;
        newDate.day = Math.max(1, Math.min(prev.day + delta, daysCount));
        if (dayRef.current) {
          dayRef.current.scrollTo({
            top: (newDate.day - 1) * ITEM_HEIGHT,
            behavior: 'smooth',
          });
        }
      } else if (key === 'month') {
        newDate.month = Math.max(0, Math.min(prev.month + delta, 11));
        if (monthRef.current) {
          monthRef.current.scrollTo({
            top: (newDate.month) * ITEM_HEIGHT,
            behavior: 'smooth',
          });
        }
      } else {
        const idx = years.findIndex(y => y === prev.year);
        const yearsCount = years.length;
        const newIdx = Math.max(0, Math.min(idx + delta, yearsCount - 1));
        newDate.year = years[newIdx];
        if (yearRef.current) {
          yearRef.current.scrollTo({
            top: (newIdx) * ITEM_HEIGHT,
            behavior: 'smooth',
          });
        }
      }
      return newDate;
    });
  }, [days.length, years]);

  const formattedDate = useMemo(() => {
  const dayStr = String(selectedDate.day).padStart(2, '0');
  const monthShort = MONTHS[selectedDate.month].slice(0, 3); // "Jan", "Feb", etc.
  return `${dayStr} ${monthShort} ${selectedDate.year}`;
}, [selectedDate]);

  const handleSetClick = useCallback(() => {
    const utcDate = new Date(Date.UTC(selectedDate.year, selectedDate.month, selectedDate.day));
    setIsPickerOpen(false);
    onChange((utcDate.toISOString()).toString());
  }, [formattedDate]);

  useEffect(() => {
    if (!isPickerOpen) return;
    function handleClickOutside(event) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPickerOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const [pickerPlacement, setPickerPlacement] = useState<'top' | 'bottom'>('bottom');

  const updatePickerPlacement = useCallback(() => {
    if (inputRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      const pickerHeight = 300; // match .columns height in SCSS
      const spaceBelow = window.innerHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;

      if (spaceBelow < pickerHeight && spaceAbove > pickerHeight) {
        setPickerPlacement('top');
      } else {
        setPickerPlacement('bottom');
      }
    }
  }, []);

  useEffect(() => {
    if (isPickerOpen) {
      updatePickerPlacement();
      window.addEventListener('scroll', updatePickerPlacement, true);
      window.addEventListener('resize', updatePickerPlacement);
      return () => {
        window.removeEventListener('scroll', updatePickerPlacement, true);
        window.removeEventListener('resize', updatePickerPlacement);
      };
    }
  }, [isPickerOpen, updatePickerPlacement]);

  return (
    <div className={styles.dobContainer} style={{ position: 'relative' }}>
      <input
        type="text"
        value={formattedDate}
        onFocus={() => {
          if(!disable){
          setIsPickerOpen(true)}
        }}
        placeholder="dd/mm/yyyy"
        readOnly
        className={styles.dateInput}
        ref={inputRef}
        disabled={disable}
      />

      {isPickerOpen && (
        <div
          className={styles.picker}
          ref={pickerRef}
          style={{
            top: pickerPlacement === 'bottom' ? '100%' : undefined,
            bottom: pickerPlacement === 'top' ? '100%' : undefined,
            marginTop: pickerPlacement === 'bottom' ? 4 : undefined,
            marginBottom: pickerPlacement === 'top' ? 4 : undefined,
          }}
        >
          <div className={styles.columns}>
            <div className={styles.selectionOverlay}></div>
            <div className={styles.columnWrapper}>
              <div
                className={styles.arrow}
                onClick={() => selectedDate.day > 1 && handleArrowClick('day', -1)}
                style={{
                  opacity: selectedDate.day === 1 ? 0.5 : 1,
                  pointerEvents: selectedDate.day === 1 ? 'none' : 'auto',
                  cursor: selectedDate.day === 1 ? 'none' : 'pointer'
                }}
              >
                &#9650;
              </div>
              <ul
                ref={dayRef}
                className={styles.column}
                onScroll={onDayScroll}
              >
                {days.map((day, i) => (
                  <li key={i} className={day === selectedDate.day ? styles.selected : ''}>
                    {String(day).padStart(2, '0')}
                  </li>
                ))}
              </ul>
              <div
                className={styles.arrow}
                onClick={() => selectedDate.day < days.length && handleArrowClick('day', 1)}
                style={{
                  opacity: selectedDate.day === days.length ? 0.5 : 1,
                  pointerEvents: selectedDate.day === days.length ? 'none' : 'auto',
                  cursor: selectedDate.day === days.length ? 'default' : 'pointer'
                }}
              >
                &#9660;
              </div>
            </div>
            <div className={`${styles.columnWrapper} ${styles.monthColumnWrapper}`}>
              <div
                className={styles.arrow}
                onClick={() => selectedDate.month > 0 && handleArrowClick('month', -1)}
                style={{
                  opacity: selectedDate.month === 0 ? 0.5 : 1,
                  pointerEvents: selectedDate.month === 0 ? 'none' : 'auto',
                  cursor: selectedDate.month === 0 ? 'default' : 'pointer'
                }}
              >
                &#9650;
              </div>
              <ul
                ref={monthRef}
                className={styles.column}
                onScroll={onMonthScroll}
              >
                {MONTHS.map((month, i) => (
                  <li key={i} className={i === selectedDate.month ? styles.selected : ''}>
                    {month}
                  </li>
                ))}
              </ul>
              <div
                className={styles.arrow}
                onClick={() => selectedDate.month < 11 && handleArrowClick('month', 1)}
                style={{
                  opacity: selectedDate.month === 11 ? 0.5 : 1,
                  pointerEvents: selectedDate.month === 11 ? 'none' : 'auto',
                  cursor: selectedDate.month === 11 ? 'default' : 'pointer'
                }}
              >
                &#9660;
              </div>
            </div>
            <div className={styles.columnWrapper}>
              <div
                className={styles.arrow}
                onClick={() => selectedDate.year !== years[0] && handleArrowClick('year', -1)}
                style={{
                  opacity: selectedDate.year === years[0] ? 0.5 : 1,
                  pointerEvents: selectedDate.year === years[0] ? 'none' : 'auto',
                  cursor: selectedDate.year === years[0] ? 'default' : 'pointer'
                }}
              >
                &#9650;
              </div>
              <ul
                ref={yearRef}
                className={styles.column}
                onScroll={onYearScroll}
              >
                {years.map((year, i) => (
                  <li key={i} className={year === selectedDate.year ? styles.selected : ''}>
                    {year}
                  </li>
                ))}
              </ul>
              <div
                className={styles.arrow}
                onClick={() => selectedDate.year !== years[years.length - 1] && handleArrowClick('year', 1)}
                style={{
                  opacity: selectedDate.year === years[years.length - 1] ? 0.5 : 1,
                  pointerEvents: selectedDate.year === years[years.length - 1] ? 'none' : 'auto',
                  cursor: selectedDate.year === years[years.length - 1] ? 'default' : 'pointer'
                }}
              >
                &#9660;
              </div>
            </div>
          </div>
          <div className={styles.buttonContainer}>
            <Button onClick={handleSetClick} buttonClassName={styles.setButton}>
              set
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
