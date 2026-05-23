import styles from "./index.module.scss";
import SectionCard from "../../../components/SectionCard";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCall } from "../../../services/apiService";
import { endPoints, PORTAL } from "../../../constants/urlConstants";
import { format } from "date-fns";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { colorizeMahatriaInfinitheism } from "../../../common/components/ColorizeMahatriaInfinitheism";
import { noData } from "../../../constants";
import MessageOverlay from "../../../components/MessagesOverlay";
import defaultProfile from "../../../assets/images/default-profile.svg";

// Define the type for a message row
export interface MessageRow {
  name: string;
  avatar: string;
  message: string;
  sender: string;
  date: string;
  registrationId?: string;
}

const Messages = () => {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });
  const [rowCount, setRowCount] = useState(0);
  const [overlay , setOverlay] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    getMessages(paginationModel.page, paginationModel.pageSize);
    // eslint-disable-next-line
  }, [paginationModel.page, paginationModel.pageSize]);
  const { programId } = useParams<{ programId: string }>();
  const getMessages = async (page = 0, pageSize = 5) => {
     
    try {
      const offset = page * pageSize;
      const response = await getCall(
        endPoints?.message +
          `?program=${programId}&sort=DESC&offset=${offset}&limit=${pageSize}`,
          undefined,
          PORTAL
      );
      if (response?.status !== 200) {
        throw new Error("Failed to fetch messages");
      }

      const data = response?.data?.data?.data || [];
      setRowCount(response?.data?.data?.pagination?.totalRecords || 0);
      const messages = data.map((msg: any) => ({
        name: msg?.seeker?.legalFullName || "",
        avatar: msg?.seeker?.profileUrl || "",
        message: msg?.content || "",
        sender: msg?.sender?.legalFullName || "Unknown Sender",
        date: msg?.createdAt ? format(new Date(msg.createdAt), "dd MMM yyyy, HH:mm:ss") : "",
        registrationId: msg?.registrationId,
      }));
      setMessages(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // DataGrid columns (moved inside component for access to navigate/programId)
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Seeker",
      flex: 1,
      renderCell: (params) => {
        const value = Array.isArray(params.row.name) ? params.row.name.join(' ') : params.row.name;
        const avatar = params.row.avatar;
        return (
          <span
            style={{
              width: 300,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            title={value}
          >
            {avatar ? (
              <img
                src={avatar}
                alt={value}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginRight: 8,
                  background: "#f0f0f0",
                  border: "1px solid #eee",
                }}
              />
            ) : (
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "#eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                  fontWeight: 600,
                  padding: 15,
                  color: "#051B46",
                  fontSize: 14,
                  textTransform: "uppercase",
                  minWidth: 28,
                  minHeight: 28,
                }}
              >
                <div className={styles.imageContainer}>
                     <img className={styles.image} src={defaultProfile} alt="defaultProfile" />
                  </div>
              </span>
            )}
           <span title={value} className={styles.valueText}>
            {value
            ? colorizeMahatriaInfinitheism(value)
           : <span className={styles.emptyName}>-</span>
            }
          </span>
            
          </span>
        );
      },
    },
    {
      field: "sender",
      headerName: "Sender",
      flex: 1,
     renderCell: (params) => <span>{colorizeMahatriaInfinitheism(params.row.sender)}</span>,
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
    },
    {
      field: "message",
      headerName: "Message",
      flex: 2,
      renderCell: (params) => <span>{colorizeMahatriaInfinitheism(params.row.message)}</span>,
    },
    {
      field: "action",
      headerName: "Action",
      flex: 0.5,
      renderCell: (params) => (
        <button
          style={{
            color: "#1859B4",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => {
            if (params.row.registrationId && programId) {
              navigate(
                `/admin/action-cards/registered/seeker-details/${params.row.registrationId}/${programId}`,
                { state: { purpose: "messages" } }
              );
            } else {
              alert("Unable to navigate");
            }
          }}
        >
          View
        </button>
      ),
    },
  ];

  return (
    <>
     <SectionCard
      title="Messages"
      totalLabel={rowCount > 0 ? rowCount.toString() : undefined}
      label={rowCount > 0 ? 'Total' : undefined}
      customClass={styles.bodyNoScroll}
      cardHeight="auto"
      actionItem={rowCount > 5 && <span>view all</span>}
      onClick={()=> {setOverlay(true)}} // Example onClick handler
    >
      <div className={`${styles.listWrapper} ${styles.bodyNoScroll}`}>
        <DataGrid
          rows={messages.map((msg, idx) => ({ id: idx + paginationModel.page * paginationModel.pageSize, ...msg,

          }))}
          columns={columns}
          autoHeight
          pagination
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={(model) => setPaginationModel(model)}
          onRowClick={(params) => {
            if (params.row.registrationId && programId) {
              navigate(
                `/admin/action-cards/registered/seeker-details/${params.row.registrationId}/${programId}`,
                { state: { purpose: "messages" } }

              );
            } else {
              alert("Unable to navigate");
            }
          }}
          hideFooter
          hideFooterSelectedRowCount
          disableColumnMenu
          disableColumnFilter
          disableColumnSelector
          disableColumnSorting
          disableRowSelectionOnClick
          disableDensitySelector
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              borderBottom: 'none',
              color: '#888888',
            },
            '& .MuiDataGrid-columnSeparator': {
              display: 'none',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: 'none',
              color: '#051B46',
            },
            '& .MuiDataGrid-virtualScroller': {
              background: 'transparent',
              overflow: 'visible !important',
            },
            '& .MuiDataGrid-row': {
              border: 'none',
              cursor: 'pointer',
            },
          }}
          slots={{
          noRowsOverlay: () => (
          <div className={styles.noData}>
          {noData}
      </div>
    ),
  }}
        />
      </div>
    </SectionCard>
    {
      overlay && 
      <MessageOverlay
      messages={messages}
      onClose={()=> setOverlay(false)}
      />
    }
    </>
  );
};

export default Messages;
