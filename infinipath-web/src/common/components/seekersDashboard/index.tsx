import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridSelectionModel } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { PaginationFooter } from "../GridPagination/index.tsx";
import styles from "./index.module.scss";
import { endPoints } from "../../../constants/urlConstants.ts";
import { useNavigate } from "react-router-dom";

interface SeekersDashboardProps {
  headers: GridColDef[];
  seekersData?: unknown[];
  hoverImageClass?: string;
  totalData?: number;
  pageSize?: number;
  setPageSize?: (size: number) => void;
  currentPage?: number;
  setCurrentPage?: (page: number) => void;
  loading?: boolean;
}

const SeekersDashboard: React.FC<SeekersDashboardProps> = ({
  headers,
  seekersData = [],
  hoverImageClass,
  totalData = 0,
  pageSize = 10,
  setPageSize,
  currentPage = 1,
  setCurrentPage,
  loading = false,
}) => {
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [dataToShow, setDataToShow] = useState<unknown[]>([]);
  const columns: GridColDef[] = headers.map((column: GridColDef) => ({
    ...column,
    sortable: false, // Disable sorting for each column
  }));


  useEffect(() => {
    setDataToShow(seekersData);
  }, [seekersData]);

  const handleSelectionChange = (newSelection: GridSelectionModel) => {
    setSelectedRows(newSelection.map(Number));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
  };

  const getItemsPerPageOptions = () => {
    const options = [10, 50, 100];
    return options;
    // return options.filter((option) => option <= total); // Filter options based on the total
  };

  return (
    <div className={styles.seekerListDashboard} data-testid="seeker-list-dashboard">
      <div>
        <Box className={styles.container} data-testid="box-container">
          <DataGrid
            sx={{
              rowWidth: "calc(100% - 80px)",
              "&.MuiDataGrid-root": {
                borderLeft: "none",
                borderRight: "none",
                height: `calc(100vh - 343px)`,
                overflow: "unset",
              },
              "& .MuiDataGrid-scrollbar--vertical ": {
                maxWidth: "5px",
              },
              "& .MuiDataGrid-scrollbar--horizontal ": {
                maxHeight: "100%",
                display: "block",
              },
              "& .MuiDataGrid-columnSeparator": {
                display: "none",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: "400",
                fontSize: "14px",
                color: "#051B46",
              },
              "& .MuiDataGrid-columnHeaderTitle:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-row": {
                cursor: "pointer",
                [`&:hover .${hoverImageClass}`]: {
                  display: "block",
                },
              },
              ".MuiDataGrid-row": {
                cursor: "pointer",
              },
              ".MuiDataGrid-columnHeader": {
                border: "none",
                borderColor: "none",
                padding: "10px",
                cursor: "default",
              },
              ".MuiDataGrid-cell": {
                // padding: "10px",
                color: "#051B46",
              },
              ".MuiDataGrid-cell:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-cellCheckbox:focus-within": {
                outline: "none",
              },
              "& .MuiDataGrid-cell:focus-within": {
                outline: "none",
              },
              "& .MuiDataGrid-columnHeader:focus-within,": {
                outline: "none",
              },
              "& .MuiCheckbox-root": {
                color: "transparent",
              },
              "& .MuiCheckbox-root svg": {
                fill: "grey",
              },
              "& .Mui Checkbox-root.Mui-checked svg": {
                fill: "#1859B4",
              },
            }}
            rows={dataToShow}
            columns={columns}
            getRowId={(row) => row.id || row.registrationId || row.email || Math.random()}
            onRowClick={(params) => {
                 navigate(`${endPoints.seekerAnalytics}/${params.id}`);
            }}
            paginationMode="server"
            rowCount={totalData}
            pageSize={pageSize}
            onPageSizeChange={(newPageSize) => handlePageSizeChange(newPageSize)}
            page={currentPage - 1}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: pageSize || 10,
                  page: currentPage - 1,
                },
              },
            }}
            slots={{
              footer: () => (
                <PaginationFooter
                  currentPage={currentPage}
                  pageSize={pageSize}
                  total={totalData}
                  itemsPerPageOptions={getItemsPerPageOptions()}
                  onPageSizeChange={handlePageSizeChange}
                  onPageChange={handlePageChange}
                  showPagination={true}
                  data-testid="pagination-footer"
                />
              ),
              noRowsOverlay: () => (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  No results found
                </Box>
              ),
            }}
            loading={loading}
            slotProps={{
              loadingOverlay: {
                variant: "linear-progress",
                noRowsVariant: "linear-progress",
              },
            }}
            disableColumnMenu
            disableColumnSelector
            disableColumnResize
            onRowSelectionModelChange={handleSelectionChange}
            selectionModel={selectedRows}
            disableRowSelectionOnClick
            data-testid="data-grid"
          />
        {/* )} */}
        </Box>
      </div>
    </div>
  );
};

export default SeekersDashboard;