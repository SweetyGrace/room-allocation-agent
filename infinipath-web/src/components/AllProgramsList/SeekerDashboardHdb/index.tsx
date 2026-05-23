


import React, { useMemo, useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import DataGridWithPagination from '../../../common/components/DataGridWithPagination/index';
import styles from './index.module.scss';
import CommonDropdown from './ProgramSelect';
import TabsComponent from './TabsComponent';

interface DynamicDataDashboardProps {
  data: unknown[];
  onRowClick: (id: number | string) => void;
  loading: boolean;
}

const DynamicDataDashboard: React.FC<DynamicDataDashboardProps> = ({
  data,
  loading,
  onRowClick,
}) => {

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    const searchLower = searchTerm.toLowerCase();

    return data.filter((row: unknown) =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(searchLower)
      )
    );
  }, [searchTerm, data]);

  const columns: GridColDef[] = useMemo(() => {
    if (!data || data.length === 0) return [];

    return Object.keys(data[0]).map((key) => ({
      field: key,
      headerName: key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase()),
      width: 200,
      sortable: false,
      renderCell: (params: unknown) => <span>{String(params.value)}</span>,
    }));
  }, [data]);

  const handleRowClick = (row: unknown) => {
    const id = row.id ?? row.userId ?? row._id;
    onRowClick(id);
  };
  // Calculate KPI data from users
  const kpiTabsData = useMemo(() => {
    const totalSeekers = data.length;
    const onlinePayments = data.filter(user => user.paymentMode === 'Online').length;
    const offlinePayments = data.filter(user => user.paymentMode === 'Offline').length;
    const maleUsers = data.filter(user => user.gender === 'male').length;
    const femaleUsers = data.filter(user => user.gender === 'female').length;

    return [
      { status: 'All Seekers', status_count: totalSeekers },
      { status: 'Online Payment', status_count: onlinePayments },
      { status: 'Offline Payment', status_count: offlinePayments },
      { status: 'Male', status_count: maleUsers },
      { status: 'Female', status_count: femaleUsers },
    ];
  }, [data]);
  // Handle tab change
  const handleTabChange = (count: number, label: string) => {
    // setCurrentFilter(label);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  return (
    <div className={styles.container}>
      <div className={styles.dashboardHeader}>
        <div className={styles.title}>
          Dashboard
        </div>
        <CommonDropdown />
      </div>
      <TabsComponent
        handleTabChange={handleTabChange}
        tabsData={kpiTabsData}
      />
      <div className={styles.searchWrapper}>
        <input
          type="text"
          placeholder="Search..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <DataGridWithPagination
        headers={columns}
        seekersData={filteredData}
        totalData={filteredData.length}
        pageSize={pageSize}
        setPageSize={setPageSize}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        loading={loading}
        height="calc(100vh - 200px)"
        onRowClick={handleRowClick}
        withoutStartAt={true}
        hoverImageClass={styles.hoverImage}
      />
    </div>
  );
};

export default DynamicDataDashboard;
