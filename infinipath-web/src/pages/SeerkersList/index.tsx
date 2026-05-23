import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import AdminKpiTabs from "../../common/components/AdminKpiTabs/index.tsx";
import DashboardHeader from "../../common/components/DashboardHeader/index.tsx";
import SeekersDataTable from "../../common/components/SeekerDataTable/index.tsx";
import { getCall } from "../../services/apiService.ts";
import { endPoints, INFINIPATH } from "../../constants/urlConstants.ts";
import { modifyResponseForTable } from "../../utils/adminUtils.ts";
import MeetingDetailsCard from "../../common/components/MeetingDetailsDashboard/index.tsx";
import SeekerListFilterPopUp from "../../common/components/MeetingsFilterPopUp/index.tsx";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowIcon from "../../assets/images/arrow-left.svg";
import {
  calculateTimeForMeeting,
  formatTime,
  getDateFromString,
  getDayOfWeek,
  getMonthAbbreviation,
  getYearBasedOnDate,
} from "../../utils/commonFunctions.ts";
import { useDispatch, useSelector } from "react-redux";
import { setKpiLabel } from "../../reducers/SeekerReducer.ts";
import { getDataGridInfinipathHeaders } from "../../common/components/TableHeader/index.tsx";
import UploadTable from "../UploadTable/index.tsx";
import Loader from "../../common/components/Loader/index.tsx";
import { RootState } from "../../store/index.ts";
import { KPI_TAB_STATUSES } from "../../constants/index.ts";

const DataTable: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [dataToShow, setDataToShow] = useState<unknown[]>([]);
  const [tabsData, setTabsData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tableLoader , setTableLoader] = useState<boolean>(false);
  const [filtersApplied, setFiltersApplied] = useState({
    gender: [],
    age: [],
    registration: [],
  });
  const [searchPopup, setSearchPopup] = useState(false);
  const [totalData, setTotalData] = useState(0);
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deBounceValue, setDeBounceValue] = useState("");
  const meetingId = location?.state?.meetingId;
  const webinarTitle = location?.state?.webinarTitle;
  // const type = "";
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [registrationEndDate, setRegistrationEndDate] = useState("");
  const [meetingStartDate, setMeetingStartDate] = useState<string>("");
  const [startEnableTime, setStartEnableTime] = useState<number>(0);
  const [meetingEndTime, setMeetingEndTime] = useState("");
  const [actualmeetingendsat, setActualMeetingEndsAt] = useState("");
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [timeCalculated, setTimeCalculated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchValue, setSearchValue] = useState({ value: '', open: false });
  const [url, setUrl] = useState("");
  const [errorCount, setErrorCount] = useState(0);
  // Fetching the selected label from the redux store
  const selectedLabel = useSelector(
    (state: RootState) => state?.seekerReducer?.kpiLabel || "",
  );
  const [bulkUploadData, setBulkUploadData] = useState("");
  // Memoize the fetchData function to prevent unnecessary recreations

  {/** 
    * @description this function is used to fetch the registered users
     */}
  const fetchRegisteredUsers = async (
    label: string,
    searchValue = "",
    pageNumber = 1,
    pageSizeValue = 10
  ) => {
    try {
      const response = await getCall(
        `${endPoints?.getRegisteredUsersForWebinar}/${meetingId}?page=${pageNumber}&type=${label}&limit=${pageSizeValue}&search=${searchValue}`,
        undefined,
        INFINIPATH
      );
  
      if (response?.status === 200) {
        const dataReq = modifyResponseForTable(response?.data?.data?.users);
        const tabsDataReq = response?.data?.data?.kpiData;
  
        setDataToShow(dataReq);
        setTabsData((prev) => {
          // Preserve existing bulk tab if already set
          const bulkTab = prev.find((tab) => tab.status === KPI_TAB_STATUSES.BULK_REGISTRATIONS);
          return bulkTab ? [...tabsDataReq, bulkTab] : tabsDataReq;
        });
  
        setTotalData(response?.data?.data?.total);
        setRegistrationEndDate(response?.data?.data?.webinarData?.registrationEndsAt);
        setActualMeetingEndsAt(response?.data?.data?.webinarData?.actualMeetingEndsAt);
        setStartEnableTime(response?.data?.data?.webinarData?.startEnableTime);
        setMeetingEndTime(response?.data?.data?.webinarData?.endDate);
        setMeetingStartDate(response?.data?.data?.webinarData?.startAt);
        setErrorCount(0);
      }
    } catch (err) {
      console.error("Error fetching registered users:", err);
    }
  };
  
  {/** 
    * @description this function is used to fetch the bulk registration data
     */}
  const fetchBulkRegistrationData = async (
    searchValue = "",
    pageNumber = 1,
    pageSizeValue = 10,
    label: string,
  ) => {
    const offset = pageSizeValue * (pageNumber - 1);
    try {
      const response = await getCall(
        `${endPoints?.webinars}/${meetingId}/${endPoints?.bulkRegistration}?offset=${offset}&limit=${pageSizeValue}&search=${searchValue}`,
        undefined,
        INFINIPATH
      );
  
      if (response?.status === 200) {
        const count = response?.data?.data?.pagination?.totalCount || 0;
        const bulkRegistrationTab = {
          status: KPI_TAB_STATUSES.BULK_REGISTRATIONS,
          count,
        }
        if(label?.includes("Bulk")) {
        setTableLoader(true);
        setBulkUploadData(mergeErrors(response?.data?.data?.data));
        setTotalData(count);
      
        }
        setTabsData((prevTabs) => {
          const nonBulkTabs = prevTabs.filter(tab => tab.status !== KPI_TAB_STATUSES.BULK_REGISTRATIONS);
          return [...nonBulkTabs, bulkRegistrationTab];
        });
      }
    } catch (err) {
      console.error("Error fetching bulk registration data:", err);
    }
  };
  useEffect(() => {
    if (!meetingId) return;
    setLoading(true);
    Promise.all([
      setTableLoader(true),
      fetchRegisteredUsers(selectedLabel, searchValue.value, currentPage, pageSize),
      fetchBulkRegistrationData(searchValue.value, currentPage, pageSize , selectedLabel)
    ]).finally(() => {
      setLoading(false);
    });
  
  }, [meetingId]);

{/**
  * @description this function is used to fetch the seekers data  
   */}
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!meetingId) return;
  
  
      if (selectedLabel === KPI_TAB_STATUSES.BULK_REGISTRATIONS) {
    
        await Promise.all([
          // fetchRegisteredUsers(selectedLabel, searchValue.value, currentPage, pageSize),
          setTableLoader(true),
          fetchBulkRegistrationData(searchValue.value, currentPage, pageSize , selectedLabel)
        ]);
        setDataToShow([]);
      } else {
        setTableLoader(true);
        await fetchRegisteredUsers(selectedLabel, searchValue.value, currentPage, pageSize);
      }
  
      setTableLoader(false);
    }, 300);
  
    return () => clearTimeout(delayDebounce);
  }, [searchValue.value, selectedLabel, currentPage, pageSize, meetingId]);

  useEffect(() => {
    
    ({ value: "", open: false });
  }, [selectedLabel]);

  const handleSearchValueChange = (newValue: string) => {
    setSearchValue(prevState => ({ ...prevState, value: newValue }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleTabChange = (count: number, label: string) => {
    setCurrentPage(1); // Resetting the page number to 1 when tab is changed
    dispatch(setKpiLabel(label)); // Setting the selected label in the redux store
  };

  const handleSearch = (searchValue: string) => {
    setDeBounceValue(searchValue);
  }

  const handleApplyClick = (filters: unknown) => {
    setFiltersApplied(filters);
    setSearchPopup(false);
    fetchData(selectedLabel, searchValue.value, currentPage, pageSize);
  };

  // Update time remaining every second
  useEffect(() => {
    if (!registrationEndDate) return;

    const intervalId = setInterval(() => {
      const remainingTime = calculateTimeForMeeting(registrationEndDate);
      setTimeRemaining(remainingTime);
      setTimeCalculated(true);

      if (remainingTime === null) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [registrationEndDate]);

  const handleNavigateSession = () => {
    navigate("/admin/infinipath/sessions");
    dispatch(setKpiLabel(""));
  }

  const mergeErrors = (backendData: unknown[]) => {
    return backendData.map((record, index) => {
      const validationResults = record.errors || {};
      const hasError = Object.values(validationResults).some(
        (field: unknown) => field?.isError
      );
      if (hasError) {
        setErrorCount((prev) => prev + 1);

      }
      return {
        id: record.id || index + 1,
        SNo: validationResults?.SNo?.isError
          ? validationResults?.SNo?.message
          : index + 1,
        phoneNumber:
          validationResults?.user?.isError ? validationResults?.user?.message :
            validationResults?.countryCode?.isError || validationResults?.phoneNumber?.isError
              ? [
                validationResults?.countryCode?.isError && validationResults?.countryCode?.message,
                validationResults?.phoneNumber?.isError && validationResults?.phoneNumber?.message,
              ].filter(Boolean).join(" ")
              : `${record.countryCode} ${record.phoneNumber}`,
        firstName: validationResults?.firstName?.isError
          ? validationResults?.firstName?.message
          : record.firstName,
        lastName: validationResults?.lastName?.isError
          ? validationResults?.lastName?.message
          : record.lastName,
        email: validationResults?.email?.isError
          ? validationResults?.email?.message
          : record.email,
        registrationType: validationResults?.registrationType?.isError
          ? validationResults?.registrationType?.message
          : record.registrationType,
        registrationStatus : record?.status
      };
    });
  };



  return (
    <>
      {loading ? (
        <Loader type="large" data-testid="seeker-list-dashboard-loader" />
      ) : (
      <div className={styles.seekerListDashboard}>
        <div className={styles.breadcrumbKpiMeetingCard}>
          <div className={styles.breadcrumbKpi}>
            <div className={styles.breadcrumbs} data-testid="breadcrumbs">
              <div
                className={styles.backArrow}
                onClick={handleNavigateSession}
                data-testid="back-icon-container"
              >
                <img src={ArrowIcon} alt="back" data-testid="back-icon" />
              </div>
              <div
                className={styles.activeHome}
                data-testid="breadcrumb-nonactive-myspace"
                onClick={handleNavigateSession}
              >
                Sessions
              </div>
              <div
                className={styles.nonActive}
                data-testid="breadcrumb-separator"
              >
                /
              </div>
              <div
                className={styles.active}
                data-testid="breadcrumb-active-session"
              >
                {webinarTitle?.length
                  ? webinarTitle
                  : "weekly growth session"}{" "}
                {!timeRemaining &&
                  timeCalculated &&
                  registrationEndDate &&
                  registrationEndDate.length > 0 && (
                    <>
                      {`(Registrations closed on `}
                      <span>
                        {getDayOfWeek(registrationEndDate)},{" "}
                        {getDateFromString(registrationEndDate)}-
                        {getMonthAbbreviation(registrationEndDate)}-
                        {getYearBasedOnDate(registrationEndDate)}{" "}
                        {formatTime(registrationEndDate)} IST{")"}
                      </span>
                    </>
                  )}
              </div>
            </div>
            <AdminKpiTabs
              handleTabChange={handleTabChange}
              tabsData={tabsData}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              data-testid="admin-kpi-data"
            />
          </div>
          <div className={styles.kpiMeetingCard}>
            {registrationEndDate?.length !== 0 &&
              actualmeetingendsat === null && (
                <MeetingDetailsCard
                  meetingDate={registrationEndDate}
                  meetingStartDate={meetingStartDate}
                  startEnableTime={startEnableTime}
                  meetingEndTime={meetingEndTime}
                  meetingId={meetingId}
                  data-testid="meeting-details-card"
                />
              )}
          </div>
        </div>
        <div className={styles.container}>
          <DashboardHeader
            onSearch={handleSearch}
            setSearchPopup={setSearchPopup}
            data-testid="dashboard-header"
            dashboardClassname={styles.dashboardHeader}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            onSearchValueChange={handleSearchValueChange}
          />
          {selectedLabel?.includes("Bulk") ? (
            <UploadTable
              isOpen={true}
              url={url}
              id={meetingId}
              setUrl={setUrl}
              errorCount={errorCount}
              loader={tableLoader}
              adminData={bulkUploadData}
              totalData={totalData}
              pageSize={pageSize}
              setPageSize={handlePageSizeChange}
              currentPage={currentPage}
              setCurrentPage={handlePageChange}

            />
          ) : (
            <SeekersDataTable
              headers={getDataGridInfinipathHeaders()}
              seekersData={dataToShow}
              hoverImageClass={styles.actionHoverImg}
              totalData={totalData}
              pageSize={pageSize}
              setPageSize={handlePageSizeChange}
              currentPage={currentPage}
              setCurrentPage={handlePageChange}
              loading={tableLoader}
              data-testid="seekers-dashboard"
            />
          )}
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
    )} 
    </>
  );
};

export default DataTable;