import { GridColDef } from "@mui/x-data-grid";
import styles from "./index.module.scss";
import {
  getDateFromString,
  getMonthAbbreviation,
  getYearBasedOnDate,
  formatTime,
} from "../../../utils/commonFunctions";
import { KPI_FILTERS } from "../../../constants";

export const getSessionCompletedHeaders = (
  handleCellClick: ( type: string, meeting: unknown) => void,
): GridColDef[] => [
  {
    field: "startAt",
    headerName: "Session date",
    width: 200,
    headerAlign: "left",
    sortable: true, // Ensure sorting is enabled
    sortComparator: (a, b) => {
      // Convert strings to Date objects for proper comparison
      const dateA = new Date(a).getTime();
      const dateB = new Date(b).getTime();
      return dateA - dateB;
    },
    renderCell: (params) => (
    
      <div className={styles.row_cell_left_align} onClick={()=>{handleCellClick(KPI_FILTERS.TYPES.ALL, params.row)}}>
        <span className={styles.detailsText}>
          {params.row?.startAt
            ? `${getDateFromString(params.row?.startAt)}-${getMonthAbbreviation(params.row?.startAt)}-${getYearBasedOnDate(params.row?.startAt)}`
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
    field: "totalAttendees",
    headerAlign: "center",
    headerName: KPI_FILTERS.TYPES.TOTAL_ATTENDEES,
    width: 160,
    renderCell: (params) => (
      <div className={styles.row_cell} onClick={() => {handleCellClick(KPI_FILTERS.TYPES.TOTAL_ATTENDEES,params.row)}}>
        <span className={styles.detailsText}>
         {params.row?.totalParticipantCount ?? '-'}
        </span>
      </div>
    ),
  },
  {
    field: "video",
    headerAlign: "center",
    headerName: KPI_FILTERS.TYPES.VIDEO,
    width: 140,
    renderCell: (params) => (
      <div className={styles.row_cell} onClick={()=> {handleCellClick(KPI_FILTERS.TYPES.VIDEO,params.row)}}>
        <span className={styles.detailsText}>
         {params.row?.panelistParticipantCount ?? '-'}
        </span>
      </div>
    ),
  },
  {
    field: "nonvideo",
    headerName: KPI_FILTERS.TYPES.NON_VIDEO,
    headerAlign: "center",
    width: 140,
    renderCell: (params) => (
      <div className={styles.row_cell} onClick= {() => {handleCellClick(KPI_FILTERS.TYPES.NONVIDEO,params.row)}}>
        <span className={styles.detailsText}>
          {params.row?.attendeeParticipantCount ?? '-'}
        </span>
      </div>
    ),
  },
  {
    field: "absentees",
    headerName: KPI_FILTERS.TYPES.ABSENTEES,
    headerAlign: "center",
    width: 140,
    renderCell: (params) => (
      <div className={styles.row_cell}>
        <span className={styles.detailsText} onClick={() => {handleCellClick(KPI_FILTERS.TYPES.ABSENTEES,params.row)}}>
          {params.row?.absenteeCount ?? '-'}
        </span>
      </div>
    ),
  },
  {
    field: "dropoff",
    headerName: KPI_FILTERS.TYPES.DROP_OFFS,
    headerAlign: "center",
    width: 140,
    renderCell: (params) => (
      <div className={styles.row_cell} onClick={() => {handleCellClick(KPI_FILTERS.TYPES.DROP_OFFS,params.row)}}>
        <span className={styles.detailsText}>
          {params.row?.dropOffCount ?? '-'}
        </span>
      </div>
    ),
  },
  {
    field: "newseekers",
    headerName: KPI_FILTERS.TYPES.NEW_SEEKERS,
    headerAlign: "center",
    width: 140,
    renderCell: (params) => (
      <div className={styles.row_cell} onClick={() => {handleCellClick(KPI_FILTERS.TYPES.NEW_SEEKERS,params.row)}}>
        <span className={styles.detailsText}>
          {params.row?.newSeekerCount ?? '-'}
        </span>
      </div>
    ),
  },


  {
    field: "title",
    headerName: "Title",
    width: 260,
    headerAlign: "left",
    renderCell: (params) => (
      <div className={styles.row_cell_left_align} onClick={()=>{handleCellClick(KPI_FILTERS.TYPES.ALL,params.row)}}>
        <span className={styles.detailsText} title={params.value}>
          {params.value ? params.value : "-"}
        </span>
      </div>
    ),
  },
];