import { GridColDef } from "@mui/x-data-grid";
import styles from "./index.module.scss";
import {
  getDateFromString,
  getMonthAbbreviation,
  getYearBasedOnDate,
  formatTime,
} from "../../../utils/commonFunctions";
import { Button } from "../Button";
import KebabMenu from "../KebabMenu";

// Import images
import unpublishIcon from "../../../assets/images/unpublish.svg";
import editIcon from "../../../assets/images/edit.svg";
import deleteIcon from "../../../assets/images/delete.svg";
import { useState } from "react";
import RoomUploadModel from "../../../components/RoomUploadModel";
import { useNavigate } from "react-router-dom";
import { getItemInLocalStorage } from "../../../services/localStorage";
import { deleteCall } from "../../../services/apiService";
import Loader from "../Loader";
import {  WEBINARSTATUS } from "../../../constants";
import { INFINIPATH } from "../../../constants/urlConstants";

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
}

const getInternalOptions = (
  id: string,
  meeting: MeetingData,
  userId: unknown,
  navigate: (path: string, options?: { state?: Record<string, unknown> }) => void,
  handlePublished: (meeting: MeetingData, status: string) => void,
  setOpenBulkPopup: React.Dispatch<React.SetStateAction<boolean>>,
  deleteWebinar: (id: string, userId: unknown, setLoading?: React.Dispatch<React.SetStateAction<boolean>>) => void
) => [
  {
    label: "Un-publish",
    action: () => {handlePublished && handlePublished(meeting, WEBINARSTATUS.DRAFT)},
    imageSource: unpublishIcon,
  },
  {
    label: "Edit",
    action: (e: React.MouseEvent) => {
      e.stopPropagation();
      localStorage.setItem("table_meeting_id", id);
      navigate("/admin/infinipath/createinfinipath", {
        state: { selectedMeeting: meeting },
      });
    },
    imageSource: editIcon,
  },
  {
    label: "Delete",
    action: async () => {
      deleteWebinar(id, userId);
    },
    imageSource: deleteIcon,
  },
];

const getDraftOptions = (
  id: string,
  meeting: MeetingData,
  userId: unknown,
  navigate: (path: string, options?: { state?: Record<string, unknown> }) => void,
  deleteWebinar: (id: string, userId: unknown) => void
) => {
  const [isLoading, setIsLoading] = useState(false);

  return [
    {
      label: "Edit",
      action: (e: React.MouseEvent) => {
        e.stopPropagation();
        localStorage.setItem("table_meeting_id", id);
        navigate("/admin/infinipath/createinfinipath", {
          state: { selectedMeeting: meeting },
        });
      },
      imageSource: editIcon,
    },
    {
      label: "Delete",
      action: async () => {
        setIsLoading(true);
        await deleteWebinar(id, userId);
        setIsLoading(false);
      },
      imageSource: isLoading ? null : deleteIcon, 
      render: () =>
        isLoading ? (
          <Loader type="large" />
        ) : null,
    },
  ];
};

export const getSessionDataGridHeaders = (
  handlePublished?: (meeting: MeetingData, type?: string) => void,
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>,
  getAdminMeetingData?: () => void
): GridColDef[] => [
  {
    field: "startAt",
    headerName: "Session date",
    width: 220,
    sortable: true,
    sortComparator: (v1, v2) => {
      const date1 = v1 ? new Date(v1).getTime() : 0;
      const date2 = v2 ? new Date(v2).getTime() : 0;
      return date1 - date2;
    },
    renderCell: (params) => (
      <div className={styles.row_cell}>
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
    field: "registrationTimeline",
    headerName: "Registration timeline",
    width: 580,
    renderCell: (params) => (
      <div className={styles.row_cell}>
        <span className={styles.detailsText}>
          {params.row?.registrationStartsAt && params.row?.registrationEndsAt ? (
            <>
              {getDateFromString(params.row.registrationStartsAt)}-
              {getMonthAbbreviation(params.row.registrationStartsAt)}-
              {getYearBasedOnDate(params.row.registrationStartsAt)}
              <span className={styles.grayText}>
          {" | "}
          {formatTime(params.row.registrationStartsAt)}{" "}
              </span>
              <span className={styles.blueLine}></span>
              {getDateFromString(params.row.registrationEndsAt)}-
              {getMonthAbbreviation(params.row.registrationEndsAt)}-
              {getYearBasedOnDate(params.row.registrationEndsAt)}
              <span className={styles.grayText}>
          {" | "}
          {formatTime(params.row.registrationEndsAt)}
              </span>
            </>
          ) : (
            "-"
          )}
        </span>
      </div>
    ),
  },
  {
    field: "title",
    headerName: "Title",
    width: 260,
    renderCell: (params) => (
      <div className={styles.row_cell}>
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
    cellClassName: styles.cellWithOverflow,
    renderCell: (params) => {
      const { webinarStatus, id } = params.row;
       const [openBulkPopup, setOpenBulkPopup] = useState(false);
       const navigate = useNavigate();
       const seekerDetails = getItemInLocalStorage("seekerDetails");
       const userId = seekerDetails?.id;

      const deleteWebinar = async (id: unknown, userId: unknown, setLoading?: React.Dispatch<React.SetStateAction<boolean>>): Promise<boolean> => {
        if (!setLoading) return false;
        setLoading(true);
        try {
          const deleteresp = await deleteCall(`webinars/${id}`, { userId }, INFINIPATH);
          if (deleteresp.status === 200 || deleteresp.status === 204) {
            alert("Webinar deleted successfully!");
            getAdminMeetingData && getAdminMeetingData();
          }
          return true; 

        } catch (error) {
          alert("Error deleting webinar!");
          console.error("Error deleting webinar:", error);
          return false; 
        } finally {
          setLoading(false);
        }
      };
      return (
        <div className={styles.row_cell}>
          {webinarStatus === WEBINARSTATUS.DRAFT && (
            <div className={styles.actions}>
              <Button
                type="button"
                buttonClassName={styles.publishButton}
                buttonTextClassName={styles.publishButtonText}
                onClick={(e) =>{
                  e.stopPropagation();
                  handlePublished && handlePublished(params.row, "internalTesting")
                }
                }
                datatestid="publish-button"
                datatestidText="publish-button-text"
              >
                publish internal
              </Button>
              <KebabMenu items={getDraftOptions(id, params.row,userId, navigate, () => deleteWebinar(id, userId, setLoading))} />
            </div>
          )}
          {webinarStatus === "internalTesting" && (
            <div className={styles.actions}>
              <Button
                type="button"
                buttonClassName={styles.publishButton}
                buttonTextClassName={styles.publishButtonText}
                onClick={(e) =>{
                  e.stopPropagation();
                  handlePublished && handlePublished(params.row, WEBINARSTATUS.PUBLISHED)
                }
                }
                datatestid="broadcast-button"
                datatestidText="broadcast-button-text"
              >
                publish external 
              </Button>
              <KebabMenu items={getInternalOptions(id, params.row,userId, navigate,handlePublished,setOpenBulkPopup,() => deleteWebinar(id, userId, setLoading))} />
            </div>
          )}
          
          {openBulkPopup && (
          <RoomUploadModel
            isOpen={true}
            closePopUp={() => {
              setOpenBulkPopup(false);
            }}
            id={id}
          />
      )}
        </div>
      );
    },
  },
];