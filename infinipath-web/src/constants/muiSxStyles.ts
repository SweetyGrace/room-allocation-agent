import { THEME } from './theme';

export const MENU_ITEM_SX = {
  padding: '8px',
  minHeight: '20px',
  width: '100%',
  maxWidth: '100%',
  fontSize: THEME.fontSize.sm,
  color: THEME.colors.primary,
  backgroundColor: THEME.colors.white,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
  '&:hover': { backgroundColor: `${THEME.colors.hoverBg} !important` },
  '&.Mui-selected': { backgroundColor: `${THEME.colors.hoverBg} !important` },
  '&.Mui-selected:hover': { backgroundColor: `${THEME.colors.hoverBg} !important` },
  '&.Mui-focusVisible': { backgroundColor: 'transparent !important' },
} as const;

export const MENU_PAPER_SX = {
  marginTop: '6px',
  borderRadius: '10px',
  padding: '6px',
  border: `1px solid ${THEME.colors.borderGray}`,
  boxShadow: '0 4px 6px -1px #0000001a',
  backgroundColor: THEME.colors.white,
  maxWidth: '100%',
  maxHeight: '220px',
  overflowY: 'auto',
} as const;

export const MENU_LIST_STYLE = { padding: 0 } as const;

export const getSelectSx = (error: unknown) => {
  const borderColor = error ? THEME.colors.errorBorder : THEME.colors.inputBorder;
  const activeBorderColor = error ? THEME.colors.errorBorder : THEME.colors.focusBorder;

  return {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.primary,
    height: 40,
    width: '100%',
    borderRadius: '10px',
    backgroundColor: THEME.colors.white,
    padding: '5px',
    boxShadow: 'none',
    outline: 'none',
    // No border on root — fieldset carries the border (MUI's intended pattern)
    '& fieldset, & .MuiOutlinedInput-notchedOutline': {
      borderColor: `${borderColor} !important`,
      borderWidth: '1px !important',
      borderRadius: '10px !important',
    },
    // Close the notch — we have no floating label
    '& fieldset legend, & .MuiOutlinedInput-notchedOutline legend': {
      width: '0 !important',
    },
    '&:hover fieldset, &:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: `${activeBorderColor} !important`,
      borderWidth: '1px !important',
    },
    '&.Mui-focused fieldset, &.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: `${activeBorderColor} !important`,
      borderWidth: '1px !important',
    },
    '&.MuiOutlinedInput-root': { borderRadius: '10px', paddingRight: '0 !important' },
    '& .MuiSelect-select': {
      padding: '6px 2px',
      height: 40,
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      minWidth: 0,
      outline: 'none',
      backgroundColor: `${THEME.colors.white} !important`,
    },
    '&.Mui-focused': { boxShadow: 'none', outline: 'none' },
    '&:hover': { backgroundColor: 'transparent !important' },
  };
};
