import React, { useEffect, useRef, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import styles from './index.module.scss';
import { styled } from '@mui/material';
import { getItemInLocalStorage } from '../../../../services/localStorage';

type TabDetail = {
  status: string;
  status_count: number;
};

type TabsComponentProps = {
  handleTabChange: (value: number, label: string) => void;
  tabsData?: TabDetail[]; // Optional prop for KPI data
};

const StyledTab = styled(Tabs)(() => ({
  '.MuiTabs-scroller': {
    height: '59px',
  },
  '.MuiTabs-flexContainer': {
    gap: '8px',
    height: '59px',
    display: 'flex',
    alignItems: 'center',
    boxShadow:
      'inset -10px 0 10px -5px rgba(255, 255, 255, 0.5), inset 10px 0 10px -5px rgba(255, 255, 255, 0.5)',
  },
  '.MuiTabs-root': {
    minHeight: '60px !important',
    padding: '0px 14px',
  },
  '.Mui-disabled': {
    display: 'none',
  },
  '.MuiTabs-scrollButtons': {
    border: '1px solid black',
    borderRadius: '50%',
    margin: '12px 14px 0px 14px',
    width: '32px',
    height: '32px',
  },
  '.css-ptiqhd-MuiSvgIcon-root': {
    fontSize: '30px',
    fontWeight: '200',
  },
  '.MuiTabs-indicator': {
    backgroundColor: '#1859B4',
    height: '3px',
    border: 'unset',
  },
  '.MuiButtonBase-root': {
    padding: '10px 16px',
    textTransform: 'capitalize',
    height: '36px',
  },
  '.css-1h9z7r5-MuiButtonBase-root-MuiTab-root': {
    color: '#051B46',
    fontSize: '14px',
    fontStyle: ' normal',
    fontWeight: '400',
    lineHeight: '24px',
  },
  '.css-1h9z7r5-MuiButtonBase-root-MuiTab-root.Mui-selected ': {
    color: '#051B46',
    fontSize: '14px',
    fontStyle: ' normal',
    fontWeight: '600',
    lineHeight: '24px',
  },
}));

const TabsComponent: React.FC<TabsComponentProps> = ({
  handleTabChange,
  tabsData = [],
}) => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(false);
  const [scrollRight, setScrollRight] = useState(true);
  const tabsRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setScrollLeft(scrollLeft > 0);
      setScrollRight(scrollLeft + clientWidth < scrollWidth);
    }
  };

  useEffect(() => {
    const ref = tabsRef.current;
    if (ref) {
      handleScroll(); // Initial check
      ref.addEventListener('scroll', handleScroll);
      return () => {
        ref.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  const updateNumberFormat = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className={styles.tabsContainer}>
      <Box
        sx={{
          maxWidth: '100%',
          bgcolor: 'background.paper',
          border: '1px solid #E7EEF3',
          padding: '0px',
          height: '60px',
        }}
      >
        <StyledTab
          value={selectedTabIndex}
          onChange={(event, newValue) => {
            setSelectedTabIndex(newValue);
            if (tabsData[newValue]) {
              handleTabChange(
                tabsData[newValue].status_count,
                tabsData[newValue].status
              );
            }
          }}
          ref={tabsRef}
          className={`${scrollLeft ? styles.scrollLeft : ''} ${
            scrollRight ? styles.scrollRight : ''
          }`}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          {tabsData.map((tab: TabDetail, index: number) => (
            <Tab
              key={`${tab.status}-${index}`}
              label={
                <span>
                  <span className={styles.tabValue}>
                    {tab.status === 'Cancelled' &&
                    getItemInLocalStorage('roleName')?.includes?.('Regional')
                      ? ''
                      : updateNumberFormat(tab.status_count)}
                  </span>
                  <span className={styles.tabLabel}>{tab.status}</span>
                </span>
              }
            />
          ))}
        </StyledTab>
      </Box>
    </div>
  );
};

export default React.memo(TabsComponent);
