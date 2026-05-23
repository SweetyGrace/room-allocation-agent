import React from 'react';
import { Controller, useWatch } from 'react-hook-form';
import MuiSelect from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { CreatableSelectFieldProps } from '../../../types/dynamicForm';
import { CREATABLE_ADD_KEY } from '../../../constants/textConstants';
import { MENU_ITEM_SX, MENU_PAPER_SX, MENU_LIST_STYLE, getSelectSx } from '../../../constants/muiSxStyles';
import { getNestedError } from '../../../utils/validationUtils';
import { THEME } from '../../../constants/theme';
import styles from './index.module.scss';

const CreatableSelectField: React.FC<CreatableSelectFieldProps> = ({
  field,
  control,
  errors,
  getFieldClassName,
  isPublished,
}) => {
  const [isAddingNew, setIsAddingNew] = React.useState(false);
  const [newOptionValue, setNewOptionValue] = React.useState('');
  const [extraOptions, setExtraOptions] = React.useState<{ value: string; label: string }[]>([]);
  const onChangeRef = React.useRef<(val: string) => void>(() => {});
  const error = getNestedError(errors, field.name);

  const currentValue = useWatch({ control, name: field.name });

  // Build options list synchronously — always includes the current saved value so
  // MUI Select has a matching MenuItem on the very first render (no flash of blank).
  const allOptions = React.useMemo(() => {
    const base = field.options || [];
    const extra = extraOptions;
    if (!currentValue || base.some((o) => o.value === currentValue) || extra.some((o) => o.value === currentValue)) {
      return [...base, ...extra];
    }
    return [...base, { value: currentValue, label: currentValue }, ...extra];
  }, [field.options, extraOptions, currentValue]);

  const handleAddOption = (onChange: (val: string) => void) => {
    const val = newOptionValue.trim();
    if (!val) return;
    setExtraOptions((prev) => [...prev, { value: val, label: val }]);
    onChange(val);
    setNewOptionValue('');
    setIsAddingNew(false);
  };

  return (
    <div className={getFieldClassName()}>
      <label className={styles.fieldLabel}>
        {field.label}
        {field.required && <span className={styles.required}>*</span>}
      </label>
      <Controller
        name={field.name}
        control={control}
        render={({ field: controllerField }) => (
          <MuiSelect
            value={controllerField.value || ''}
            displayEmpty
            disabled={field.disabled || isPublished}
            ref={() => { onChangeRef.current = controllerField.onChange; }}
            onChange={(e) => {
              if (e.target.value === CREATABLE_ADD_KEY) {
                setIsAddingNew(true);
              } else {
                setIsAddingNew(false);
                controllerField.onChange(e.target.value);
              }
            }}
            renderValue={(selected) =>
              selected
                ? <span className={styles.selectValue}>{allOptions.find((o) => o.value === selected)?.label || selected}</span>
                : <span className={styles.selectPlaceholder}>{field.placeholder || 'Select or add program type'}</span>
            }
            sx={getSelectSx(error)}
            MenuProps={{
              PaperProps: { sx: MENU_PAPER_SX },
              MenuListProps: { style: MENU_LIST_STYLE },
            }}
          >
            {allOptions.map((option) => (
              <MenuItem key={option.value} value={option.value} sx={MENU_ITEM_SX} title={option.label}>
                {option.label}
              </MenuItem>
            ))}
            <MenuItem
              value={CREATABLE_ADD_KEY}
              sx={{ ...MENU_ITEM_SX, color: THEME.colors.focusBorder, borderTop: `1px solid ${THEME.colors.borderGray}`, marginTop: '4px' }}
            >
              + Add other...
            </MenuItem>
          </MuiSelect>
        )}
      />
      {isAddingNew && (
        <div className={styles.creatableInputRow}>
          <input
            type="text"
            className={styles.inputField}
            placeholder="Enter new option"
            value={newOptionValue}
            maxLength={field.maxLength}
            onChange={(e) => setNewOptionValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newOptionValue.trim()) {
                e.preventDefault();
                handleAddOption(onChangeRef.current);
              }
            }}
          />
          <button type="button" className={styles.creatableAddBtn} onClick={() => handleAddOption(onChangeRef.current)}>
            Add
          </button>
          <button type="button" className={styles.creatableCancelBtn} onClick={() => { setIsAddingNew(false); setNewOptionValue(''); }}>
            Cancel
          </button>
        </div>
      )}
      {error && <span className={styles.errorText}>{error.message}</span>}
    </div>
  );
};

export default CreatableSelectField;
