import React, { useMemo, useState } from 'react';
import DataGridWithPagination from '../../../common/components/DataGridWithPagination/index';
import styles from './index.module.scss';


interface DynamicDataDashboardProps {
    data: unknown[];
    coloumns: unknown[];
    loading: boolean;
}

const DynamicDataDashboard: React.FC<DynamicDataDashboardProps> = ({
    data,
    columns,
}) => {




    return (
        <div className={styles.container}>
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
