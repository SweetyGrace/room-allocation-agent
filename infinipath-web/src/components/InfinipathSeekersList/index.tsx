import React, { useEffect, useState } from "react";
import defaultUser from "../../assets/images/default-profile.svg";
import styles from "./index.module.scss";
import Loader from "../../common/components/Loader";
import DataGridWithPagination from "../../common/components/DataGridWithPagination";
import { GridColDef } from "@mui/x-data-grid";
import { Avatar, Tooltip } from "@mui/material";
import { calculateAge, decryptData, modifyProfileUrl } from "../../utils/commonFunctions";
import { getCall } from "../../services/apiService";
import { getItemInLocalStorage } from "../../services/localStorage";
import clearIcon from "../../assets/images/close-icon.svg";
import search from "../../assets/images/dashboard-search.svg";
import { useNavigate } from "react-router-dom";
import { endPoints, INFINIPATH } from "../../constants/urlConstants";
import { INFINIPATH_SEEKERS_LIST } from "../../constants/textConstants";

const AllSeekersList: React.FC = () => {
  const [dataToShow, setDataToShow] = useState<unknown[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [totalAudience, setTotalAudience] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterLoader, setFilterLoader] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [finalsearchText, setFinalSearchText] = useState<string>("");
  const [searchValue, setSearchValue] = useState({ value: "", open: false });
  const navigate = useNavigate();

  const fetchData = () => {
    setFilterLoader(true);
    const userId = getItemInLocalStorage("seekerDetails")?.id;
    getCall(
      endPoints.getAllSeekers(userId, currentPage, pageSize, finalsearchText),
      undefined,
      INFINIPATH,
    )
      .then((res: unknown) => {
        if (res?.status === 200) {
          setLoading(false);
          setDataToShow(res?.data?.data?.usersData);
          setTotalAudience(res?.data?.data?.totalUsersCount);
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        alert(INFINIPATH_SEEKERS_LIST.ERRORS.FETCH_DATA);
        setLoading(false);
      })
      .finally(() => {
        setFilterLoader(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, finalsearchText]);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    if (value.trim() === "") {
      setFinalSearchText("");
      setCurrentPage(1);
    }
  };

  const handleSearch = (query: string) => {
    setFinalSearchText(query);
    setCurrentPage(1);
  };

  const getDisplayName = (name: string, maxLength: number) =>
    name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;

  const columns: GridColDef[] = [
    {
      field: INFINIPATH_SEEKERS_LIST.FIELDS.FIRST_NAME,
      headerName: INFINIPATH_SEEKERS_LIST.COLUMNS.FIRST_NAME,
      width: 220,
      headerAlign: "left",
      renderCell: (params) => (
        <div className={styles.userCell}>
          <Avatar sx={{ width: 36, height: 36, border: "1px solid #DDDDDD", p: 0, bgcolor: "transparent" }}>
            <img
              src={
                params.row?.profileUrl && params.row?.profileUrl?.length > 0
                  ? params.row?.profileUrl
                  : defaultUser
              }
              alt=""
              className={styles.avatarImg}
              onError={(e) => {
                e.currentTarget.src = defaultUser;
                e.currentTarget.onerror = null;
              }}
            />
          </Avatar>
          {params.row?.firstName?.length > 20 ? (
            <Tooltip title={params.row.firstName} arrow>
              <span>{getDisplayName(params.row.firstName, 20)}</span>
            </Tooltip>
          ) : (
            <span>{params.row?.firstName ?? INFINIPATH_SEEKERS_LIST.VALUES.DASH}</span>
          )}
        </div>
      ),
    },
    {
      field: INFINIPATH_SEEKERS_LIST.FIELDS.LAST_NAME,
      headerName: INFINIPATH_SEEKERS_LIST.COLUMNS.LAST_NAME,
      width: 160,
      headerAlign: "left",
      renderCell: (params) => <span>{params.row?.lastName ?? INFINIPATH_SEEKERS_LIST.VALUES.DASH}</span>,
    },
    {
      field: INFINIPATH_SEEKERS_LIST.FIELDS.ENCRYPTED_EMAIL,
      headerName: INFINIPATH_SEEKERS_LIST.COLUMNS.EMAIL,
      width: 220,
      headerAlign: "left",
      renderCell: (params) => {
        const email = decryptData(params.row?.encryptedEmail);
        return email?.length > 25 ? (
          <Tooltip title={email} arrow>
            <span>{getDisplayName(email, 25)}</span>
          </Tooltip>
        ) : (
          <span>{email ?? INFINIPATH_SEEKERS_LIST.VALUES.DASH}</span>
        );
      },
    },
    {
      field: INFINIPATH_SEEKERS_LIST.FIELDS.GENDER,
      headerName: INFINIPATH_SEEKERS_LIST.COLUMNS.GENDER,
      width: 100,
      headerAlign: "center",
      renderCell: (params) => (
        <span>{params.row?.gender ? params.row.gender[0] : INFINIPATH_SEEKERS_LIST.VALUES.DASH}</span>
      ),
    },
    {
      field: INFINIPATH_SEEKERS_LIST.FIELDS.DOB,
      headerName: INFINIPATH_SEEKERS_LIST.COLUMNS.AGE,
      width: 80,
      headerAlign: "center",
      renderCell: (params) => (
        <span>{params.row?.dob ? calculateAge(params.row.dob) : INFINIPATH_SEEKERS_LIST.VALUES.DASH}</span>
      ),
    },
    {
      field: INFINIPATH_SEEKERS_LIST.FIELDS.ENCRYPTED_PHONE,
      headerName: INFINIPATH_SEEKERS_LIST.COLUMNS.MOBILE_NUMBER,
      width: 180,
      headerAlign: "left",
      renderCell: (params) => (
        <span>
          {params.row?.countryCode ?? ""}{" "}
          {decryptData(params.row?.encryptedPhoneNumber) ?? INFINIPATH_SEEKERS_LIST.VALUES.DASH}
        </span>
      ),
    },
    {
      field: INFINIPATH_SEEKERS_LIST.FIELDS.ADDRESS,
      headerName: INFINIPATH_SEEKERS_LIST.COLUMNS.LOCATION,
      flex: 1,
      minWidth: 200,
      headerAlign: "left",
      renderCell: (params) => {
        const row = params.row;
        const displayAddr =
          row?.address?.toLowerCase() === INFINIPATH_SEEKERS_LIST.VALUES.OTHER && row?.otherAddress
            ? `${row.address} - ${row.otherAddress}`
            : row?.address ?? INFINIPATH_SEEKERS_LIST.VALUES.DASH;
        return displayAddr.length > 24 ? (
          <Tooltip title={displayAddr} arrow>
            <span>{getDisplayName(displayAddr, 24)}</span>
          </Tooltip>
        ) : (
          <span>{displayAddr}</span>
        );
      },
    },
  ];

  return (
    <>
      {!loading ? (
        <div className={styles.seekerListDashboard} data-testid="seeker-list-dashboard">
          <div className={styles.header}>
            <div className={styles.totalAudienceContainer}>
              <span className={styles.totalAudienceLabel}>{INFINIPATH_SEEKERS_LIST.LABELS.TOTAL_SEEKERS}</span>
              <span className={styles.totalAudienceCount}>{totalAudience}</span>
            </div>
            <div className={styles.searchContainer}>
              {searchValue.open && (
                <div className={styles.search} data-testid="search-container">
                  <input
                    type="text"
                    className={styles.searchInput}
                    autoFocus
                    value={searchText}
                    placeholder={INFINIPATH_SEEKERS_LIST.PLACEHOLDERS.SEARCH}
                    onChange={handleSearchInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch(e.currentTarget.value);
                    }}
                    data-testid="search-input"
                  />
                  {searchText && (
                    <button
                      className={styles.clearIcon}
                      onClick={() => {
                        setSearchText("");
                        handleSearch("");
                      }}
                      data-testid="clear-button"
                    >
                      <img src={clearIcon} alt="clear" data-testid="clear-icon" />
                    </button>
                  )}
                </div>
              )}
              <Tooltip title={INFINIPATH_SEEKERS_LIST.TOOLTIPS.SEARCH} arrow>
                <button className={styles.searchIcon} data-testid="search-button">
                  <img
                    src={search}
                    alt="search"
                    data-testid="search-icon"
                    onClick={() => setSearchValue({ value: "", open: !searchValue.open })}
                  />
                </button>
              </Tooltip>
            </div>
          </div>

          <DataGridWithPagination
            headers={columns}
            seekersData={dataToShow}
            totalData={totalAudience}
            pageSize={pageSize}
            setPageSize={handlePageSizeChange}
            currentPage={currentPage}
            setCurrentPage={handlePageChange}
            loading={filterLoader}
            heightToApplyonGrid="calc(100vh - 235px)"
            onRowClick={(row) => navigate(`${endPoints.seekerAnalytics}/${row.id}`)}
            withoutStartAt={true}
          />
        </div>
      ) : (
        <Loader type="large" data-test-id="loader" />
      )}
    </>
  );
};

export default AllSeekersList;
