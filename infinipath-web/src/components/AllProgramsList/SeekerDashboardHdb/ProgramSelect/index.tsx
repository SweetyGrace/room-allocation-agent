import React, { useState } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  Box,
  Typography
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

interface DropdownOption {
  value: string;
  label: string;
  route: string;
}

const CommonDropdown: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const options: DropdownOption[] = [
    { value: 'entrainment', label: 'Entrainment', route: '/admin/entrainment' },
    { value: 'hdb', label: 'HDB', route: '/admin/seeker-dashboard' },
    { value: 'tat', label: 'TAT-Online', route: '/admin/tat-online' }
  ];

  // Determine current selection based on current route
  const getCurrentSelection = (): string => {
    const currentPath = location.pathname;
    
    if (currentPath.includes('/admin/infinipath/sessions') || currentPath.includes('/admin/infinipath/createinfinipath')) {
      return 'infinipath';
    } else if (currentPath.includes('/admin/seeker-dashboard')) {
      return 'hdb';
    } 
    else if (currentPath.includes('/admin/tat-online')) {
      return 'tat';
    }
     else if (currentPath.includes('/admin/entrainment')) {
      return 'entrainment';
    }
    
    // Default to infinipath if no match
    return 'infinipath';
  };

  const [selectedValue, setSelectedValue] = useState<string>(getCurrentSelection());

  const handleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectedValue(value);
    
    const selectedOption = options.find(option => option.value === value);
    if (selectedOption) {
      navigate(selectedOption.route);
    }
  };

  return (
    <Box sx={{ minWidth: 200, margin: 2 }}>
      <FormControl fullWidth size="small">
        <Select
          value={selectedValue}
          onChange={handleChange}
          displayEmpty
          sx={{
            backgroundColor: 'white',
            width: "250px",
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e0e0e0',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#b0b0b0',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1976d2',
            },
          }}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Typography variant="body2">
                {option.label}
              </Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default CommonDropdown;