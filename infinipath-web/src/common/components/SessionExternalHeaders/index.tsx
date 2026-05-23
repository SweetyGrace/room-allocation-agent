import { GridColDef } from "@mui/x-data-grid";
import styles from "./index.module.scss";
import {
  getDateFromString,
  getMonthAbbreviation,
  getYearBasedOnDate,
  formatTime,
  canStartEnableSession,
  checkStartTime,
  checkForMarkAsCompleted,
  handleZoomRedirection,
} from "../../../utils/commonFunctions";
import { Button } from "../Button";
import KebabMenu from "../KebabMenu";

// Import images
import reserveRegistrationIcon from "../../../assets/images/reserve-registration.svg";
import tickMark from "../../../assets/images/checked.svg";
import { useState } from "react";
import RoomUploadModel from "../../../components/RoomUploadModel";
import { setItemInLocalStorage } from "../../../services/localStorage";
import { WEBINARSTATUS } from "../../../constants";

interface MeetingData {
  id: string;
  title: string;
  startAt: string;
  duration: string;
  webinarStatus: string;
  registrationStartsAt: string;
  registrationEndsAt: string;
  actualMeetingEndsAt: string;
  startUrl: string;
  totalRegistration: number;
  video: number;
  nonVideo: number;
  absentees: number;
  dropOff: number;
  newSeekers: number;
}

const getPublishedOptions = (
  id: string,
  meeting: MeetingData,
  setOpenBulkPopup: React.Dispatch<React.SetStateAction<boolean>>,
  handlePublished: (meeting: MeetingData, status: string) => void,
) => {
  const started = checkStartTime(meeting.startAt);
  const completed = checkForMarkAsCompleted(meeting.endDate);
  const options = [];

  if (started) {
    // Add "Reserve registration" if the meeting is not in the future
    options.push({
      label: "Reserve registration",
      action: () => {
        setOpenBulkPopup(true);
      },
      imageSource: reserveRegistrationIcon,
    });
  } else if (completed){
    // Add "Mark as completed" if the meeting is in the future
    options.push({
      label: "Mark as completed",
      action: () => {
        handlePublished && handlePublished(meeting, WEBINARSTATUS.COMPLETED);
      },
      imageSource: tickMark,
    });
  }

  return options;
};

export const getSessionPublishedHeaders = (
  handlePublished?: (meeting: MeetingData, type?: string) => void,
  setSnackbarOpen?: React.Dispatch<React.SetStateAction<{ open: boolean; message: string }>>
): GridColDef[] => [
    {
      field: "startAt",
      headerName: "Session date",
      width: 200,
      headerAlign: "left",
      sortable: true, // Enable sorting
      sortComparator: (v1, v2) => {
        // Convert sessionDate strings to Date objects for proper comparison
        const date1 = v1 ? new Date(v1).getTime() : 0;
        const date2 = v2 ? new Date(v2).getTime() : 0;

        return date1 - date2; // Compare timestamps
      },
      renderCell: (params) => (

        <div className={styles.row_cell_left_align}>
          <span className={styles.detailsText}>
            {params.row?.startAt
              ? `${getDateFromString(params.row.startAt)}-${getMonthAbbreviation(params.row.startAt)}-${getYearBasedOnDate(params.row.startAt)}`
              : '-'}
            <span className={styles.grayText}>
              {" | "}
              {params.row?.startAt ? formatTime(params.row.startAt) : "-"}{" "}
            </span>
        </span>
      </div>
    ),
  },
  {
    field: "totalregistration",
    headerName: "Total Registrations",
    width: 160,
    headerAlign: "center",
    renderCell: (params) => (
      <div className={styles.row_cell}>
        <span className={styles.detailsText}>
         {params.row?.registrationCount ?? '-'}
        </span>
      </div>
    ),
  },
  {
    field: "video",
    headerName: "Video",
    headerAlign: "center",
    width: 140,
    renderCell: (params) => (
      <div className={styles.row_cell}>
        <span className={styles.detailsText}>
         {params.row?.videoRegistrationCount ?? '-'}
        </span>
      </div>
    ),
  },
  {
    field: "nonvideo",
    headerName: "Non-Video",
    headerAlign: "center",
    width: 140,
    renderCell: (params) => (
      <div className={styles.row_cell}>
        <span className={styles.detailsText}>
          {params.row?.nonVideoRegistrationCount ?? '-'}
        </span>
      </div>
    ),
  },
  {
    field: "downgrades",
    headerName: "Downgrades",
    headerAlign: "center",
    width: 140,
    renderCell: (params) => (
      <div className={styles.row_cell}>
        <span className={styles.detailsText}>
          {params.row?.downgradeCount ?? '-'}
        </span>
      </div>
    ),
  },
  {
    field: "cancellations",
    headerName: "Cancellations",
    headerAlign: "center",
    width: 140,
    renderCell: (params) => (
      <div className={styles.row_cell}>
        <span className={styles.detailsText}>
          {params.row?.cancellationCount ?? '-'}
        </span>
      </div>
    ),
  },
  {
    field: "title",
    headerName: "Title",
    headerAlign: "left",
    width: 260,
    renderCell: (params) => (
      <div className={styles.row_cell_left_align}>
        <span className={styles.detailsText} title={params.value}>
          {params.value ? params.value : "-"}
        </span>
      </div>
    ),
  },
  {
    field: "publish",
    headerName: "",
    width: 210,
    headerAlign: "left",
    cellClassName: styles.cellWithOverflow,
    renderCell: (params) => {
      const { webinarStatus, id } = params.row;
      // const registrationEndsAt = params.row.registrationEndsAt;
      // const remainingTime = canStartSession(params.row.startAt, params.row.startEnableTime);
      const startEnable = canStartEnableSession(params.row.startAt, params.row.startEnableTime, params.row.endDate);
       const [openBulkPopup, setOpenBulkPopup] = useState(false);
      //  const [, setCopiedId] = useState<string | null>(null);
      //  const navigate = useNavigate();

      return (
        <div className={styles.row_cell}>
          {webinarStatus === "published" && (
            <div className={styles.actions}>
            <Button
              type="button"
              buttonClassName={styles.publishButton}
              buttonTextClassName={styles.publishButtonText}
              onClick={
                (e) => { 
                  e.stopPropagation();
                  setItemInLocalStorage("table_meeting_id", id);
                 handleZoomRedirection()
                }
              }
              datatestid="start-button"
              datatestidText="start-button-text"
              disable={!startEnable}
            >
              start
            </Button>
          { <KebabMenu items={getPublishedOptions(id, params.row, setOpenBulkPopup, handlePublished)} disableMenu ={!checkForMarkAsCompleted(params.row.endDate) && !checkStartTime(params.row.startAt)} />}
            </div>
          )}
          
          {openBulkPopup && (
          <RoomUploadModel
            isOpen={true}
            closePopUp={() => {
              setOpenBulkPopup(false);
            }}
            id={id}
            //on success upload of bulk registrations to the api then snackbar will be shown and response message from the api
            onUpload={(message) => {
              if (setSnackbarOpen) {
                setSnackbarOpen({ open: true, message }); // Use the message passed from RoomUploadModel
              }
            }}
          />
      )}
        </div>
      );
    },
  },
];