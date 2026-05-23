import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style
import 'react-date-range/dist/theme/default.css'; // theme css
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';

export default function DateRangePickerComponent({ control, setValue }) {
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  const handleSelect = (ranges: unknown) => {
    const { startDate, endDate } = ranges.selection;
    setRange([ranges.selection]);
    setValue('startDate', startDate);
    setValue('endDate', endDate);
  };

  return (
    <div>
      <DateRange
        editableDateInputs={true}
        onChange={handleSelect}
        moveRangeOnFirstSelection={false}
        ranges={range}
      />
    </div>
  );
}
