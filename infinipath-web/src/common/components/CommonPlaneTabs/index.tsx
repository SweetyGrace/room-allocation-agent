import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';



const a11yProps = (index: number) => {
    return {
        id: `tab-${index}`,
        'aria-controls': `tabpanel-${index}`,
    };
};

interface CommonTabsProps {
    tabs: { label: string }[];
    onTabChange?: (newValue: number) => void;
}

const CommonPlaneTabs: React.FC<CommonTabsProps> = ({ tabs, onTabChange }) => {
    const [value, setValue] = useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        if (onTabChange) {
            onTabChange(newValue);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Tabs
                value={value}
                onChange={handleChange}
                // aria-label="common tabs"
                sx={{
                    '& .MuiButtonBase-root-MuiTab-root': {
                        color: '#051B46 !important', // Default font color
                        
                    },
                    '& .MuiTabs-indicator': {
                        backgroundColor: '#1859B4', // Change indicator color
                        height: '3px', // Change indicator height
                    },
                    '& .MuiTab-root': {
                        color: '#051B46 !important', // Default font color
                        fontSize: '16px', // Font size
                        textTransform: 'none',
                        fontFamily: 'Noto Sans',
                        padding: '16px 16px', // Padding for tabs
                        minHeight: '62px', // Minimum height for tabs
                    },
                    '& .Mui-selected': {
                        color: '#051B46 !important', // Font color for selected tab
                        fontWeight: '600', // Bold font for selected tab
                        fontFamily: 'Noto Sans',
                    },
                }}
            >
                {tabs.map((tab, index) => (
                    <Tab
                        key={index}
                        label={tab.label}
                        {...a11yProps(index)}
                        sx={{
                            color: '#051B46', // Default font color
                        }}
                    />
                ))}
            </Tabs>
        </Box>
    );
};

export default CommonPlaneTabs;