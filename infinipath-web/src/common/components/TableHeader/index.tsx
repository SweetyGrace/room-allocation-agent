import { GridColDef } from "@mui/x-data-grid";
import styles from "./index.module.scss";
import KebabMenu from "../KebabMenu";
import defaultProfileIcon from "../../../assets/images/default-profile.svg";
import { getItemInLocalStorage } from "../../../services/localStorage"; // Adjust path as needed
import starIcon from "../../../assets/images/starIcon.svg";
import chatTearDrop from "../../../assets/images/ChatTeardropDots.svg";
import { hasPermission } from "../../../utils/roleBasedAccess";
import { Avatar, Tooltip } from "@mui/material";
import { calculateAge, modifyProfileUrl } from "../../../utils/commonFunctions";
import { useState } from "react";
import { ApprovalStatus } from "../../../constants/textConstants";

const handleRowClick = (row: any) => {
  if (row.seekerId && row.programId) {
    window.location.href = `/admin/action-cards/registered/seeker-details/${row.seekerId}/${row.programId}`;
  }
};

const getOptions = (
  id: string,
  row: any,
  onAddReview?: (row: any) => void,
  onSwap?: (row: any) => void,
  onInvoiceSend?: (seekerId: any) => void,
) => {
  const userRole = getItemInLocalStorage("seekerDetails")?.role || "";

  const options = [
    {
      label: "view details",
      action: () => handleRowClick(row),
      imageSource: undefined,
    },
  ];

  if (hasPermission(userRole, "ADD_REVIEW", "C")) {
    const hasReview = row.ratingByRm !== null && row.ratingByRm !== undefined;
  
    options.push({
      label: hasReview ? "update review" : "add a review",
      action: () => onAddReview && onAddReview(row),
      imageSource: undefined,
    });
  }
  if (
    hasPermission(userRole, "REQ_SWAP_SEEKER", "C") &&
    row.status === "completed"
  ) {
    options.push({
      label: "swap request",
      action: () => onSwap && onSwap(row),
      imageSource: undefined,
    });
  }

  if (
    hasPermission(userRole, "SEND_INVOICE", "C") &&
    row?.paymentStatus?.toLowerCase().includes("completed") &&
    row?.status?.toLowerCase().includes("completed")
  ) {
    options.push({
      label: "send invoice",
      action: () => onInvoiceSend && onInvoiceSend(row.seekerId || id),
      imageSource: undefined,
    });
  }

  if (userRole === "mahatria") {
    options.push(
      {
        label: "bless",
        action: () => alert(`Bless ${row.seekerName}`),
        imageSource: undefined,
      },
      {
        label: "Hold",
        action: () => alert(`hold ${row.seekerName}`),
        imageSource: undefined,
      },
      {
        label: ApprovalStatus.YTD,
        action: () => alert(`YTD ${row.seekerName}`),
        imageSource: undefined,
      },
    );
  }
  return options;
};

export const getDataGridHeaders = (
  onAddReview?: (row: any) => void,
  onOpenSwap?: (row: any) => void,
  onInvoiceSend?: (seekerId: any) => void,
): GridColDef[] => {
  const userRole = (getItemInLocalStorage("seekerDetails")?.role || "").toLowerCase();

  // All columns as you have defined above
  const allColumns = [
    {
      field: "id",
      headerName: "Registration ID",
      sortable: true,
      width: 120,
      renderCell: (params:any) => <span>{params.row.seekerId || "-"}</span>,
    },
    {
      field: "paymentStatus",
      headerName: "Payment Status",
      sortable: true,
      width: 150,
      renderCell: (params:any)  => <span>{params.row.paymentStatus || "-"}</span>,
    },
    {
      field: "seekerName",
      headerName: "Seeker Name",
      width: 220,
      sortable: true,
      renderCell: (params:any)  => (
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {params.row.profileUrl ? (
            <img
              src={params.row.profileUrl}
              alt={params.row.seekerName}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                objectFit: "cover", 
                marginRight: 8,
                border: "1px solid #eee",
              }}
            />
          ) : (
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
                fontWeight: 600,
                color: " #051B46",
                fontSize: 14,
                textTransform: "uppercase",
              }}
            >
              {params.row.seekerName
                ?.split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((word) => word[0])
                .join("") || ""}
            </span>
          )}
          <span
            style={{
              maxWidth: 150,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
              verticalAlign: "middle",
            }}
            title={params.row.seekerName}
          >
            {params.row.seekerName}
          </span>
        </span>
      ),
    },
    {
      field: "dob",
      headerName: "DOB",
      sortable: true,
      width: 120,
      renderCell: (params:any)  => <span>{params.row.dob || "-"}</span>,
    },
    {
      field: "Age",
      headerName: "Age",
      sortable: true,
      width: 90,
      renderCell: (params:any) => <span>{params.row.Age || "-"}</span>,
    },
    {
      field: "gender",
      headerName: "Gender",
      sortable: true,
      width: 120,
      renderCell:(params:any)  => <span>{params.row.gender || "-"}</span>,
    },
    {
      field: "contactNumber",
      headerName: "Contact Number",
      sortable: true,
      width: 150,
      renderCell: (params:any)  => <span>{params.row.contactNumber || "-"}</span>,
    },
    {
      field: "email",
      headerName: "Email",
      sortable: true,
      width: 200,
      renderCell: (params:any) => <span>{params.row.email || "-"}</span>,
    },
    {
      field: "ratingByRm",
      headerName: "Rating by RM",
      sortable: true,
      width: 190,
      renderCell: (params:any)  => {
        const userRole = getItemInLocalStorage("seekerDetails")?.role || "";
        if (userRole !== "mahatria" && !params.row.rmName) return null;
        return (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {userRole === "mahatria" && (
              <span
                style={{
                  fontWeight: 500,
                  maxWidth: 80,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "inline-block",
                }}
                title={params.row.rmName}
              >
                {params.row.rmName}
              </span>
            )}
            {params.row.ratingByRm ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginLeft: 16,
                }}
              >
                <img src={starIcon} alt="star" />
                <span>
                  {params.row.ratingByRm !== undefined
                    ? params.row.ratingByRm
                    : "-"}
                </span>
                <Tooltip title={params.row.rmReview || "-"}>
                  <img
                    src={chatTearDrop}
                    alt="chat"
                    style={{ marginLeft: 4, cursor: "pointer" }}
                  />
                </Tooltip>
              </span>
            ) : (
              <></>
            )}
          </span>
        );
      },
    },
    {
      field: "location",
      headerName: "Location",
      sortable: true,
      width: 130,
      renderCell: (params:any)  => (
        <span>
          {params.row.location || params.row.address || params.row.city || "-"}
        </span>
      ),
    },
    {
      field: "allocatedProgram",
      headerName: "Allocated Program",
      sortable: true,
      width: 120,
      renderCell:(params:any)  => <span>{params.row.allocatedProgram || "-"}</span>,
    },
    {
      field: "noOfHdbs",
      headerName: "No of HDBS",
      sortable: true,
      width: 135,
      renderCell: (params:any) => (
        <span>
          {params.row.noOfHdbs !== undefined ? params.row.noOfHdbs : "-"}
        </span>
      ),
    },
    {
      field: "paymentMode",
      headerName: "Payment Mode",
      sortable: true,
      width: 150,
      renderCell: (params:any)  => (
        <span>
          {params.row.paymentMode !== undefined ? params.row.paymentMode : "-"}
        </span>
      ),
    },
    {
      field: "gstNumber",
      headerName: "GST Number",
      sortable: true,
      width: 150,
      renderCell: (params:any)  => (
        <span>
          {params.row.gstNumber !== undefined ? params.row.gstNumber : "-"}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      sortable: true,
      width: 170,
      renderCell: (params:any)  => <span>{params.row.status || "-"}</span>,
    },
    {
      field: "travelPlanStatus",
      headerName: "Travel Plan Status",
      sortable: true,
      width: 170,
      renderHeader: () => (
        <span style={{ marginLeft: 16 }}>Travel Plan Status</span>
      ),
      renderCell: (params:any)  => (
        <span style={{ marginLeft: 16 }}>
          {params.row.travelPlanStatus || "-"}
        </span>
      ),
    },
    {
      field: "menu",
      headerName: "",
      width: 50,
      renderCell: (params) => {
        const id = params.row.id;
        return (
          <KebabMenu
            items={getOptions(
              id,
              params.row,
              onAddReview,
              onOpenSwap,
              onInvoiceSend
            )}
            menuContainerClassname={styles.menuTooltip}
          />
        );
      },
    },
  ];

  // Helper to get column by field name
  const getCol = (field) => allColumns.find((col) => col.field === field);

  // For mahatria and shoba, return only the requested columns in order
  if (userRole === "mahatria" || userRole === "shoba") {
    return [
      getCol("seekerName"),
      getCol("location"),
      getCol("noOfHdbs"),
      getCol("ratingByRm"),
      getCol("status"),
      getCol("gender"),
      getCol("Age"),
      getCol("contactNumber"),
      getCol("email"),
      getCol("paymentMode"),
      getCol("menu"),
    ].filter(Boolean);
  }

  // For all other roles, return all columns as defined above
  return allColumns;
};



export const getDataGridInfinipathHeaders = (): GridColDef[] => [
  {
    field: "firstName",
    headerName: "First name",
    width: 200,
    renderCell: (params) => (
      <div className={styles.row_cell}>
        <div className={styles.profileImage}>
          <Avatar
            alt={params.row.firstName}
            src={
              params.row.profileUrl && params.row.profileUrl.length > 0
                ? modifyProfileUrl(params.row.profileUrl)
                : defaultProfileIcon
            }
            sx={{
              width: 40,
              height: 40,
              border: "1px solid #DDDDDD",
            }}
            data-testid="user-avatar"
          />
        </div>
        <Tooltip title={params.value} arrow>
          <span className={styles.detailsText}>
            {params?.value
              ? params.value?.length > 17
                ? params.value.substring(0, 17) + "..."
                : params.value
              : "-"}
          </span>
        </Tooltip>
      </div>
    ),
  },
  {
    field: "lastName",
    headerName: "Last name",
    width: 150,
    renderCell: (params) => (
      <Tooltip title={params.value} arrow>
        <div className={styles.row_cell}>
          <span className={styles.detailsText}>
            {params?.value
              ? params.value?.length > 17
                ? params.value.substring(0, 17) + "..."
                : params.value
              : "-"}
          </span>
        </div>
      </Tooltip>
    ),
  },
  {
    field: "dob",
    headerName: "Age",
    width: 90,
    renderCell: (params) => {
      const age = calculateAge(params.value);
      return (
        <div className={styles.row_cell}>
          <span className={styles.detailsText}>
            {age !== "-" ? `${age}` : "-"}
          </span>
        </div>
      );
    },
  },

  {
    field: "mobile",
    headerName: "Mobile number",
    width: 200,
    renderCell: (params) => (
      <div className={styles.row_cell}>
        <span className={styles.detailsText}>
          {params.row.countryCode ? params?.row?.countryCode : ""}{" "}
          {params.value ? params?.value : "-"}
        </span>
      </div>
    ),
  },
  {
    field: "email",
    headerName: "Email",
    width: 230,
    renderCell: (params) => (
      <Tooltip title={params.value} arrow>
        <div className={styles.row_cell}>
          <span className={styles.detailsText}>
            {params?.value
              ? params.value?.length >20
                ? params.value.substring(0, 20) + "..."
                : params.value
              : "-"}
          </span>
        </div>
      </Tooltip>
    ),
  },
  {
    field: "address",
    headerName: "City",
    width: 200,
    renderCell: (params) => (
      <Tooltip title={params.value} arrow>
        <div className={styles.row_cell}>
          <span className={styles.detailsText}>
            {params?.value
              ? params.value?.length > 17
                ? params.value.substring(0, 17) + "..."
                : params.value
              : "-"}
          </span>
        </div>
      </Tooltip>
    ),
  },
  {
    field: "typeOfRegistration",
    headerName: "Type of registration",
    width: 170,
    renderCell: (params) => (
      <div className={styles.row_cell}>
        <span className={styles.detailsText}>
          {params.value ? params?.value : "-"}
        </span>
      </div>
    ),
  },
  // {
  //   field: "menu",
  //   headerName: "",
  //   width: 50,
  //   renderCell: (params) => {
  //     const id = params.row.id;
  //     const [, setCopiedId] = useState<string | null>(null);
  //     return (
  //       <KebabMenu items={getOptions(id, params.row,setCopiedId)} menuContainerClassname={styles.menuTooltip} />
  //     )
  //   }
  //   ,
  // }
];