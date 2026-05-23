import React, { useState, useEffect } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import styles from './index.module.scss';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

interface DateTimeRangePickerProps {
  minValue: Dayjs | null;
  maxValue: Dayjs | null;
  onMinChange: (value: Dayjs | null) => void;
  onMaxChange: (value: Dayjs | null) => void;
  minLabel?: string;
  maxLabel?: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  error?: string | null;
  format?: string;
  disableDate?: boolean; 
  defaultDate?: Dayjs; 
}

const DateTimeRangePicker: React.FC<DateTimeRangePickerProps> = ({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minLabel = "From",
  maxLabel = "To",
  minPlaceholder = "Select start date & time",
  maxPlaceholder = "Select end date & time",
  error = null,
  format = "DD/MM/YYYY HH:mm",
  disableDate = false,
  defaultDate,
}) => {
  const [minTimeSelected, setMinTimeSelected] = useState(false);
  const [maxTimeSelected, setMaxTimeSelected] = useState(false);

  useEffect(() => {
    if (minValue && disableDate && defaultDate) {
      const hasCustomTime = !minValue.isSame(defaultDate, 'hour') || !minValue.isSame(defaultDate, 'minute');
      setMinTimeSelected(hasCustomTime);
    }
  }, [minValue, disableDate, defaultDate]);
  useEffect(() => {
    if (maxValue && disableDate && defaultDate) {
      const hasCustomTime = !maxValue.isSame(defaultDate, 'hour') || !maxValue.isSame(defaultDate, 'minute');
      setMaxTimeSelected(hasCustomTime);
    }
  }, [maxValue, disableDate, defaultDate]);
  const handleMinChange = (value: Dayjs | null) => {
    if (!value) {
      onMinChange(null);
      setMinTimeSelected(false);
      return;
    }

    if (disableDate && defaultDate) {
      const newDateTime = defaultDate
        .hour(value.hour())
        .minute(value.minute())
        .second(0)
        .millisecond(0);
      onMinChange(newDateTime);
      setMinTimeSelected(true);
    } else {
      onMinChange(value);
    }
  };
  const handleMaxChange = (value: Dayjs | null) => {
    if (!value) {
      onMaxChange(null);
      setMaxTimeSelected(false);
      return;
    }

    if (disableDate && defaultDate) {
      const newDateTime = defaultDate
        .hour(value.hour())
        .minute(value.minute())
        .second(0)
        .millisecond(0);
      onMaxChange(newDateTime);
      setMaxTimeSelected(true);
    } else {
      onMaxChange(value);
    }
  };

 
  const shouldDisableDate = (date: Dayjs) => {
    if (!disableDate || !defaultDate) return false;
   
    return !date.isSame(defaultDate, 'day');
  };

 
  const getMinDisplayFormat = () => {
    if (disableDate) {
      return minTimeSelected ? format : "DD/MM/YYYY";
    }
    return format;
  };

  const getMaxDisplayFormat = () => {
    if (disableDate) {
      return maxTimeSelected ? format : "DD/MM/YYYY"; 
    }
    return format;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className={styles.dateTimeRangeContainer}>
        <div className={styles.dateTimePickerWrapper}>
          <DateTimePicker
            label={minLabel}
            value={minValue}
            onChange={handleMinChange}
            format={getMinDisplayFormat()}
            className={styles.dateTimePicker}
            shouldDisableDate={shouldDisableDate}
            slotProps={{
              textField: {
                placeholder: minPlaceholder,
                fullWidth: true,
                error: !!error,
              },
            }}
          />
        </div>
        
        <span className={styles.dateTimeHyphen}>-</span>
        
        <div className={styles.dateTimePickerWrapper}>
          <DateTimePicker
            label={maxLabel}
            value={maxValue}
            onChange={handleMaxChange}
            format={getMaxDisplayFormat()} 
            minDateTime={!disableDate ? (minValue || undefined) : undefined}
            className={styles.dateTimePicker}
            shouldDisableDate={shouldDisableDate} 
            slotProps={{
              textField: {
                placeholder: maxPlaceholder,
                fullWidth: true,
                error: !!error,
              },
            }}
          />
        </div>
      </div>
      
      {error && <div className={styles.dateError}>{error}</div>}
    </LocalizationProvider>
  );
};

export default DateTimeRangePicker;