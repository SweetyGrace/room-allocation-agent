import React, { useCallback, useEffect, useState } from "react";
import { DataGrid, GridColDef, GridSelectionModel } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { PaginationFooter } from "../GridPagination/index.tsx";
import styles from "./index.module.scss";
import { getDataGridHeaders } from "../uploadTableHeader/index.tsx";
interface SeekersDashboardProps {
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
  seekersData,
  hoverImageClass,
  totalData,
  pageSize,
  setPageSize,
  currentPage,
  setCurrentPage,
  loading,
}) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [dataToShow, setDataToShow] = useState<unknown[]>([]);
  const columns: GridColDef[] = getDataGridHeaders().map((column) => ({
    ...column,
    sortable: false, // Disable sorting for each column
  }));

  /**
   * @description this function is used to convert to loadMoreData
   * @param
   */
  const loadMoreData = useCallback(() => {
    const newData = seekersData

    setDataToShow(newData);
    // setLoading(false);
  }, [currentPage, pageSize, seekersData]);

  /**
   * @description this function is used to call when the component is mounted
   */
  useEffect(() => {
    loadMoreData();
  }, [loadMoreData]);

  /**
   * @description this function is used to handle the selection change
   * @param newSelection
   **/
  const handleSelectionChange = (newSelection: GridSelectionModel) => {
    setSelectedRows(newSelection.map(Number));
  };

  /**
   * @description this function is used to handle the page change
   * @param page
   **/
  const total = totalData;
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadMoreData();
    setDataToShow(seekersData);
  };

  /**
   * @description this function is used to handle the page size change
   * @param size
   **/
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    loadMoreData();
  };

  /**
   * @description this function is used to get the items per page options
   * @param total
   **/
  const getItemsPerPageOptions = () => {
    const options = [10, 50, 100];
    return options;
  };

  return (
    <div
      className={styles.seekerListDashboard}
      data-testid="seeker-list-dashboard"
    >
      <div>
        <Box className={styles.container} data-testid="box-container">
          <DataGrid
            sx={{
              rowWidth: "100%",
              "&.MuiDataGrid-root": {
                borderLeft: "none",
                borderRight: "none",
                height: `calc(100vh - 347px)`,
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
                padding: "10px",
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
            paginationMode="server"
            rowCount={total}
            pageSize={pageSize}
            onPageSizeChange={(newPageSize) =>
              handlePageSizeChange(newPageSize)
            }
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
                  total={total}
                  itemsPerPageOptions={getItemsPerPageOptions(total)}
                  onPageSizeChange={(newPageSize) => {
                    setPageSize(newPageSize);
                    setCurrentPage(1);
                  }}
                  onPageChange={(newPage) => {
                    handlePageChange(newPage);
                  }}
                  showPagination={true}
                  data-testid="pagination-footer"
                />
              ),
              noRowsOverlay: () => (
                // Custom "No results found" message
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
        </Box>
      </div>
    </div>
  );
};

export default SeekersDashboard;
