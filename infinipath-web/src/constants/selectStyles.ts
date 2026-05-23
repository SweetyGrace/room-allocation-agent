import { StylesConfig } from 'react-select';
import { THEME } from './theme';


export const selectStyles: StylesConfig = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? THEME.colors.primary : provided.borderColor,
    boxShadow: state.isFocused ? 'none' : provided.boxShadow,
    '&:hover': {
      borderColor: THEME.colors.primary,
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: THEME.colors.transparent,
    border: `1px solid ${THEME.colors.primary}`,
    borderRadius: THEME.borderRadius.lg,
    padding: `0 ${THEME.spacing.xs}`,
    height: '20px',
    display: 'flex',
    alignItems: 'center',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: THEME.colors.primary,
    fontSize: THEME.fontSize.xs,
    lineHeight: '20px',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: THEME.colors.primary,
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    ':hover': {
      backgroundColor: THEME.colors.transparent,
      color: THEME.colors.primary,
    },
  }),
  menu: (provided) => ({
    ...provided,
    maxHeight: '290px',
    overflowY: 'auto',
  }),
};