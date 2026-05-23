import { GridColDef } from "@mui/x-data-grid";
import styles from "./index.module.scss";
import { /*Avatar,*/ Tooltip } from "@mui/material";
import error from "../../../assets/images/danger.svg";
import { ERROR_MESSAGES, REGISTRATION_TYPES } from "../../../constants";

export const getDataGridHeaders = (): GridColDef[] => [
  {
    field: "firstName",
    headerName: "First name",
    width: 200,
    renderCell: (params) => {
      return (
        <div className={styles.row_cell}>
          <span className={styles.detailsText}>
            {params.value ? params?.value : "-"}
          </span>
        </div>

      )

    },
  },
  {
    field: "lastName",
    headerName: "Last name",
    width: 200,
    renderCell: (params) => {
      return (
        <div className={styles.row_cell}>
          <span className={styles.detailsText}>
            {params.value ? params?.value : "-"}
          </span>
        </div>
      );
    },
  },
  {
    field: "phoneNumber",
    headerName: "Mobile number",
    width: 250,
    renderCell: (params) => {
      const { value } = params;
      const errorMessages = [
        ERROR_MESSAGES.NO_DATA,
        ERROR_MESSAGES.PHONE_NUMBER_INVALID,
        ERROR_MESSAGES.PHONE_NUMBER_REQUIRED,
        ERROR_MESSAGES.PHONE_NUMBER_STRING,
        ERROR_MESSAGES.PHONE_NUMBER_REGISTERED,
        ERROR_MESSAGES.PHONE_NUMBER_DUPLICATE,
        ERROR_MESSAGES.USER_NOT_EXIST,
      ];
      return errorMessages.includes(value) ? (
          <Tooltip title={value} arrow>
 <div className={`${styles.row_cell} ${styles.truncatedError}`}>
            <img src={error} alt="error" />
            <span className={styles.warning2}> {value ? value : "-"}</span>
          </div>
          </Tooltip>
        ) : (
          <Tooltip title={value} arrow>
          <div className={styles.row_cell}>
            <span className={styles.detailsText}>
              {params.value ? params?.value : "-"}
            </span>
          </div>
          </Tooltip>
        );
    },
  },
  {
    field: "email",
    headerName: "Email",
    width: 280,
    renderCell: (params) => {
      const { value } = params;
      const errorMessages = [
        ERROR_MESSAGES.NO_DATA,
        ERROR_MESSAGES.EMAIL_REQUIRED,
        ERROR_MESSAGES.EMAIL_STRING,
        ERROR_MESSAGES.EMAIL_INVALID,
        ERROR_MESSAGES.EMAIL_EXISTS,
        ERROR_MESSAGES.EMAIL_MISMATCH,
        ERROR_MESSAGES.EMAIL_DUPLICATE,
      ];
  
      const isError = errorMessages.includes(value);
  
      return isError ? (
        <Tooltip title={value} arrow>
          <div className={`${styles.row_cell} ${styles.truncatedError}`}>
            <img src={error} alt="error" />
            <span className={styles.warning2}> {value ? value : "-"}</span>
          </div>
        </Tooltip>
      ) : (
      <Tooltip title={value} arrow>
        <div className={`${styles.row_cell} ${styles.truncatedNormal}`}>
          <span className={styles.detailsText}>
            {params.value ? params?.value : "-"}
          </span>
        </div>
      </Tooltip>
      );
    },
  },

  {
    field: "registrationType",
    headerName: "Registration Type",
    width: 250,
    renderCell: (params) => {
      const { value } = params;
      const errorMessages = [
        ERROR_MESSAGES.NO_DATA,
        ERROR_MESSAGES.REGISTRATION_TYPE_REQUIRED,
        ERROR_MESSAGES.REGISTRATION_TYPE_STRING,
        ERROR_MESSAGES.REGISTRATION_TYPE_INVALID,
      ];
      return errorMessages.includes(value) ? (
        <Tooltip title={value} arrow>
          <div className={styles.warning2}>
            <img src={error} />
            {value?.length > 14 ? value.substring(0, 14) + "..." : value}
          </div>
        </Tooltip>
      ) : (
        <div className={styles.row_cell}>
           <span className={styles.detailsText}>
            {value === REGISTRATION_TYPES.VIDEO
              ? REGISTRATION_TYPES.VIDEOTEXT
              : value === REGISTRATION_TYPES.NON_VIDEO
              ? REGISTRATION_TYPES.NONVIDEOTEXT
              : "-"}
          </span>
        </div>
      );
    },
  },
  {
    field: "registrationStatus",
    headerName: "Registration status",
    width: 250,
    renderCell: (params) => {
      const { value } = params;
      return (
        <Tooltip title={value} arrow>
          <div
            className={`${styles.warning2} ${
              value === "success" ? styles.successText : ""
            }`}
          >
            {value?.length > 14 ? value.substring(0, 14) + "..." : value}
          </div>
        </Tooltip>
      );
    },
  },
];
