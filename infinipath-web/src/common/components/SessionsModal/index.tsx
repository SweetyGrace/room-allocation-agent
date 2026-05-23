import React from "react";
import { Avatar, Modal } from "@mui/material";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.scss";
import crossIcon from "../../../assets/images/cross-icon.svg";
import DataGridWithPagination from "../DataGridWithPagination";
import { GridColDef } from "@mui/x-data-grid";
import defaultUser from "../../../assets/images/default-profile.svg";
import {
  formatDurationTime,
  getDateFromString,
  getDayOfWeek,
  getMonthAbbreviation,
  getYearBasedOnDate,
  modifyProfileUrl,
} from "../../../utils/commonFunctions";
import { endPoints } from "../../../constants/urlConstants";
import { Seeker } from "../../../components/MeetingAnalyticsDashboardSectionsAggregate/AggegrateSeekersDashboard";
import { useDispatch } from "react-redux";
import {
  setAnaltyicsFilters,
  setSessionDate,
  setSessionType,
  setTotalAudience,
} from "../../../reducers/AnalyticsReducer";
import success from "../../../assets/images/success.svg";
import failure from "../../../assets/images/failure.svg";

interface SessionData {
  sessionDate: string;
  sessionEndDate: string;
  registrationType: string;
  modeOfJoining: string;
  deviceType: string;
  faceVerificationStatus: boolean;
  title: string;
  webinarId: string;
  fullName: string;
  email: string;
  deviceInfo: string | null;
  profileUrl: string;
}

interface SessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: SessionData[];
  limit?: number;
  setLimit?: (limit: number) => void;
  page?: number;
  setPage?: (page: number) => void;
  SeekerData?: Seeker;
}

const SessionsModal: React.FC<SessionsModalProps> = ({
  isOpen,
  onClose,
  title,
  data,
  limit = 10,
  setLimit,
  page,
  setPage,
  SeekerData = null,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Update the handleRowClick function
  const handleRowClick = (params: unknown) => {
    const webinarId = params?.webinarId;
    if (webinarId) {
      dispatch(setSessionDate(params?.sessionDate));
      dispatch(setSessionType("default"));
      dispatch(setTotalAudience(0));
      dispatch(
        setAnaltyicsFilters({
          audienceType: [],
          gender: [],
          ageGroup: [],
          location: [],
        }),
      );
      navigate(`${endPoints.sessionAnalytics}?sessionId=${webinarId}`);
    }
  };

  // Transform data to ensure each row has an id
  const processedData =
    data?.map((item, index) => ({
      ...item,
      id: item.webinarId || index,
    })) || [];
  

  const columns: GridColDef[] = [
    {
      field: "sessionDate",
      headerName: "Session Date",
      flex: 1,
      minWidth: 200,
      valueGetter: (params) => {
        if (!params) return "";
        const date = params;
        return `${getDayOfWeek(date)}, ${getDateFromString(date)} ${getMonthAbbreviation(date)} ${getYearBasedOnDate(date)}`;
      },
    },
    {
      field: "registrationType",
      headerName: "Registration Type",
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => {
        return params?.toUpperCase() ?? "-";
      },
    },
    {
      field: "modeOfJoining",
      headerName: "Join Status",
      flex: 1,
      minWidth: 120,
      valueGetter: (params) => {
        if (!params) return "-";
        return params === "SELF" ? "SELF" : params;
      },
    },
    {
      field: "deviceType",
      headerName: "Device Type",
      flex: 1,
      minWidth: 130,
      valueGetter: (params) => {
        if (!params) return "-";
        return params === "ThroughLink" ? "Through Link" : params;
      },
    },
    {
      field: "faceVerificationStatus",
      headerName: "Verification Status",
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => {
        return params ? "Verified" : "Not Verified";
      },
    },
    {
      field: "duration",
      headerName: "Duration",
      flex: 1,
      minWidth: 100,
      valueGetter: (params) => {
        return formatDurationTime(params) ?? "-";
        //   return formatTimeDuration(params ?? "-")
      },
    },
    {
      field: "isLateComer",
      headerName: "Late Comer",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => {
        return <div className={styles.icon}><img src = {params?.value ? success : failure}/></div>
      }
      // valueGetter: (params) => {
      //   return <img src = {params? success : failure}/>
      // },
    },
    {
      field: "isDropoff",
      headerName: "Dropoff",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => {
          return <div className={styles.icon}><img src = {params?.value ? success : failure}/></div>
        }
    },
    {
      field: "isAbsentee",
      headerName: "Absentee",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => {
        return <div className={styles.icon}><img src = {params?.value ? success : failure}/></div>
      }
    },
    {
      field: "rejoinCount",
      headerName: "Re-join",
      flex: 1,
      minWidth: 100,
      valueGetter: (params) => {
        return params ?? "-";
      },
    },
    {
      field: "isRegistrationCancelled",
      headerName: "Cancelled",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => {
          return <div className={styles.icon}><img src = {params?.value ? success : failure}/></div>
        }
    },
  ];

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <p className={styles.title}>{title}</p>
          <img
            src={crossIcon}
            alt="Close"
            className={styles.closeIcon}
            onClick={onClose}
          />
        </div>
        <div className={styles.modalBody}>
          {SeekerData && (
            <div className={styles.userCellContent}>
              <Avatar
                alt={SeekerData?.fullName ?? "Unknown User"}
                src={
                  SeekerData?.profileUrl && SeekerData?.profileUrl?.length > 0
                    ? modifyProfileUrl(SeekerData?.profileUrl)
                    : defaultUser
                }
                sx={{
                  width: 70,
                  height: 70,
                  border: "1px solid #DDDDDD",
                }}
                data-testid="profile-avatar"
              />
              <div className={styles.userInfo}>
                <p> {SeekerData?.fullName}</p>
                <div className={styles.additionalInfo}>
                  <span>{SeekerData.age !== null && `${SeekerData.age}`}</span>
                  {SeekerData.age !== null && (
                    <span className={styles.borderLine}>|</span>
                  )}
                  <span className={styles.gender}>
                    {SeekerData.gender !== null && `${SeekerData.gender[0]}`}
                  </span>
                  {SeekerData.gender !== null && (
                    <span className={styles.borderLine}>|</span>
                  )}
                  <span>
                    {SeekerData.address != null &&
                    SeekerData.address != "" &&
                    SeekerData.address != undefined
                      ? SeekerData.address
                      : SeekerData.otherAddress}
                  </span>
                </div>
                <div className={styles.additionalInfo}>
                  <span>{SeekerData.mobileNumber}</span>
                  {SeekerData.mobileNumber !== null && (
                    <span className={styles.borderLine}>|</span>
                  )}
                  <span>{SeekerData.email}</span>
                </div>
              </div>
            </div>
          )}
          <DataGridWithPagination
            headers={columns}
            seekersData={processedData}
            totalData={processedData.length}
            height="calc(100vh - 277px)"
            pageSize={limit < 10 ? 10 : limit}
            setPageSize={setLimit}
            currentPage={page}
            setCurrentPage={setPage}
            withoutStartAt={true}
            onRowClick={(rowData) => handleRowClick(rowData)}
            hoverImageClass="" // Add this required prop
          />
        </div>
      </div>
    </Modal>
  );
};

export default SessionsModal;
