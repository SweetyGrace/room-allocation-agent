import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import SeekerListFilterPopUp from "../../common/components/MeetingsFilterPopUp/index.tsx";
import SeekersDashboard from "../../common/components/uploadDashboard/index.tsx";

interface CustomModelProps {
  isOpen?: boolean;
  setTotalData?: (data: unknown) => void;
  close?: () => void;
  fileName?: string;
  excelData?: string;
  url?: string;
  setUrl?: (url: string) => void;
  adminData?: unknown[];
  id?: unknown;
  errorCount?: number;
  loader?: boolean;
  handleAutoRegister?: (url: string, id: unknown, flag: boolean) => void;

  totalData?: number;
  pageSize?: number;
  setPageSize?: (size: number) => void;
  currentPage?: number;
  setCurrentPage?: (page: number) => void;
}


const UploadTable: React.FC<CustomModelProps> = ({
  adminData,
  loader,
  totalData,
  pageSize,
  setPageSize,
  currentPage,
  setCurrentPage
}) => {
  const [tabsData, setTabsData] = useState<unknown[]>([]);
  const [filtersApplied, setFiltersApplied] = useState({
    gender: [],
    age: [],
    registration: [],
  });
  const [searchPopup, setSearchPopup] = useState(false);


  /**
   * @description this function is used to handle the page change
   * @param newpage
   */  

  /**
   * @description this function is used to handle search
   * @param searchValue
   */

  /**
   * @description this function is used to handle apply click
   * @param filters
   */
  const handleApplyClick = (filters: { gender: string[]; age: string[]; registration: string[] }) => {
    setFiltersApplied(filters as any);
    setSearchPopup(false);
  };

  /**
   * @description this useEffect is used to set the data
   * @dependencies tabsData, loading
   */
  useEffect(() => {
    setTabsData(tabsData);
  }, []);

  return (
      <div >
        <div>
          <SeekersDashboard
            seekersData={adminData}
            hoverImageClass={styles.actionHoverImg}
            totalData={totalData}
            pageSize={pageSize}
            setPageSize={setPageSize}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            loading={loader}
            data-testid="seekers-dashboard"
          />
        </div>
        {searchPopup && (
          <SeekerListFilterPopUp
            seekersFilters={filtersApplied}
            open={searchPopup}
            onClose={() => setSearchPopup(false)}
            onApplyClick={handleApplyClick}
            data-testid="search-modal"
          />
        )}
      </div>
  );
};

export default UploadTable;
