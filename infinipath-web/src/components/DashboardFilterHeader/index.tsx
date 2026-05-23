import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

interface StatsItem {
  value: string | number;
  label: string;
}

interface DashboardFilterHeaderProps {
  statsData: StatsItem[];
  selectedTab: number;
  onTabChange: (tabIndex: number) => void;
}

const StyledTabs = styled(Tabs)(() => ({
  minHeight: '60px',
  '.MuiTabs-indicator': {
    height: '0px',
    borderBottom: '4px solid var(--Icon-Link, #1859B4)',
    borderRadius: 0,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: '60px',
  padding: '0 16px',
  textTransform: 'none',
  '& .tabValue': {
    color: 'var(--Text-Blue, #051b46)',
    fontFamily: 'Noto Sans',
    fontSize: '24px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '36px',
    marginRight: '6px',
    display: 'inline-block',
  },
  '& .tabLabel': {
    color: 'var(--Text-Blue, #051b46)',
    fontFamily: 'Noto Sans',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '28px',
    display: 'inline-block',
  },
  '&.Mui-selected .tabLabel': {
    color: 'var(--Text-Blue, #051B46)',
    fontWeight: 600,
  },
}));

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const DashboardFilterHeader: React.FC<DashboardFilterHeaderProps> = ({
  statsData,
  selectedTab,
  onTabChange,
}) => {
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    onTabChange(newValue);
  };

  return (
    <Box
      sx={{
        width: '100%',
        border: '1px solid var(--Stroke-Grey-2, #d9d9d9)',
        background: 'var(--Supportive-White, #fff)',
        boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.1)',
        overflowX: 'auto',
        borderRadius: '4px',
      }}
    >
      <StyledTabs
        value={selectedTab}
        onChange={handleChange}
        aria-label="Stats Tabs"
        // variant="scrollable"
        // scrollButtons="off"
      >
        {statsData.map((item, idx) => (
          <StyledTab
            key={idx}
            label={
              <span style={{ display: 'flex', alignItems: 'baseline' }}>
                <span className="tabValue">{item.value}</span>
                <span className="tabLabel">{item.label}</span>
              </span>
            }
            {...a11yProps(idx)}
          />
        ))}
      </StyledTabs>
    </Box>
  );
};

export default DashboardFilterHeader;