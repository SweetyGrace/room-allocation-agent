import React, { useState, MouseEvent } from 'react';
import { Menu, MenuItem, IconButton, ListItemIcon, Typography, Tooltip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface MenuItemProps {
  label: string;
  imageSource?: string;
  action: (event: MouseEvent) => void;
  disabled?: boolean;
}

interface DropdownMenuProps {
  items: MenuItemProps[];
  menuContainerClassName?: string;
  disableMenu?: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ items, menuContainerClassName = false }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (event: MouseEvent, action: (event: MouseEvent) => void) => {
    event.stopPropagation();
    action(event);
    handleClose();
  };

  return (
    <div className={menuContainerClassName}>
      <IconButton
        aria-label="more"
        aria-controls={open ? 'dropdown-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        disabled={false}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="dropdown-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        sx={{
          zIndex: 1100, // Keep below Drawer’s z-index so the Drawer appears on top  
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            fontSize: '14px',
            color: '#051B46',
            '& .MuiMenuItem-root': {
              '&:hover': {
                backgroundColor: '#F4F8FB',
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
    {items.map((item, index) => (
      <MenuItem
        onClick={(e) => !item.disabled && handleMenuItemClick(e, item.action)}
        disabled={item.disabled}
        sx={{
          color: item.disabled
            ? '#A0A0A0'
            : item?.label?.toLowerCase() === 'delete'
              ? '#FF7D41'
              : 'inherit',
          display: 'flex',
          gap: '2px',
          height: '40px',
          cursor: item.disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {item.imageSource && (
          <ListItemIcon sx={{ minWidth: '10px !important' }}>
            <img src={item.imageSource} alt={item.label} />
          </ListItemIcon>
        )}
        <Typography variant="body2">{item.label}</Typography>
      </MenuItem>

 
))}

      </Menu>
    </div>
  );
};

export default DropdownMenu;