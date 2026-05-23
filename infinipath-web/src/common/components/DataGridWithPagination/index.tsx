import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridSelectionModel,
  GridSortModel,
} from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { PaginationFooter } from "../GridPagination/index.tsx";
import styles from "./index.module.scss";
import sortAsc from "../../../assets/images/sort-asc.svg";
import sortDesc from "../../../assets/images/sort-desc.svg";
import { noData } from "../../../constants/index.ts";
import shuffle from "../../../assets/images/shuffle-img.svg";
import { colorizeMahatriaInfinitheism } from "../ColorizeMahatriaInfinitheism/index.tsx";
import { textConstant } from "../../../constants/textConstants.ts";
import { SortOrder, SortState } from "../../../types/seatApproval.ts";
interface DataGridWithPaginationProps {
  headers: GridColDef[];
  seekersData?: unknown[];
  hoverImageClass?: string;
  totalData?: number;
  pageSize?: number;
  setPageSize?: (size: number) => void;
  currentPage?: number;
  setCurrentPage?: (page: number) => void;
  loading?: boolean;
  height?: string;
  onRowClick?: (rowData: unknown) => void;
  withoutStartAt?: boolean;
  isheight?: boolean;
  heightToApplyonGrid?: string;
  smallSize?: boolean;
  onSortChange?: (sortState: SortState) => void;
  isSort?: boolean;
}

const DataGridWithPagination: React.FC<DataGridWithPaginationProps> = ({
  headers,
  seekersData = [],
  hoverImageClass,
  totalData = 0,
  pageSize = 100,
  setPageSize,
  currentPage = 1,

  setCurrentPage,
  loading = false,
  height = "calc(100vh - 290px)",
  onRowClick,
  withoutStartAt,
  isheight,
  heightToApplyonGrid,
  smallSize,
  onSortChange,
  isSort,
}) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [dataToShow, setDataToShow] = useState<unknown[]>([]);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [sortState, setSortState] = useState<SortState>({
    sortKey: "",
    sortOrder: textConstant?.ASC,
  });
  // Ensure we have valid data arrays
  const validSeekersData = Array.isArray(seekersData) ? seekersData : [];
  const validHeaders = Array.isArray(headers) ? headers : [];
  const gridContainerRef = useRef<HTMLDivElement | null>(null);

  const columns: GridColDef[] = validHeaders.map(
    (column: GridColDef, index: number) => {
      return {
        ...column,
        sortable: column.sortable !== undefined ? column.sortable : false,
        headerClassName: "sortable-header",
      };
    },
  );

  const loadMoreData = useCallback(() => {
    setDataToShow(validSeekersData);
  }, [validSeekersData]);
  useEffect(() => {
    loadMoreData();
  }, [loadMoreData]);

  const handleSelectionChange = (newSelection: GridSelectionModel) => {
    setSelectedRows(newSelection.map(Number));
  };

  const handlePageChange = (page: number) => {
    if (setCurrentPage) {
      setCurrentPage(page);
    }
   
    setTimeout(() => {
     
      const grid = gridContainerRef.current;
      if (grid) {
       
        const scrollableGrid = grid.querySelector(
          ".MuiDataGrid-virtualScroller",
        );
        if (scrollableGrid) {
          (scrollableGrid as HTMLElement).scrollTo({
            top: 0,
            behavior: "smooth",
          });
        } else {
          grid.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    }, 0);
  };

  const handlePageSizeChange = (size: number) => {
    if (setPageSize) {
      setPageSize(size);
    }
    if (setCurrentPage) {
      setCurrentPage(1);
    }
     setTimeout(() => {
    const grid = gridContainerRef.current;
    if (grid) {
      const scrollableGrid = grid.querySelector(".MuiDataGrid-virtualScroller");
      if (scrollableGrid) {
        (scrollableGrid as HTMLElement).scrollTo({ top: 0, behavior: "smooth" });
      } else {
        grid.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, 0);
  };

  const handleSortModelChange = (model: GridSortModel) => {
    setSortModel(model);

    if (model.length > 0 && validSeekersData.length > 0) {
      const { field, sort } = model[0];

      const sortedData = [...validSeekersData].sort(
        (a: unknown, b: unknown) => {
          const aValue = a?.[field];
          const bValue = b?.[field];

          if (aValue === undefined || aValue === null) return 1;
          if (bValue === undefined || bValue === null) return -1;

          if (sort === textConstant?.ASC) {
            return aValue > bValue ? 1 : -1;
          } else if (sort === textConstant?.DESC) {
            return aValue < bValue ? 1 : -1;
          }
          return 0;
        },
      );

      const startIndex = (currentPage - 1) * pageSize;
      const newData = sortedData.slice(startIndex, startIndex + pageSize);
      setDataToShow(sortedData);
    }
  };

  // Replace handleSortModelChange with this
  const handleServerSort = (model: GridSortModel) => {
    if (model.length === 0) {
      setSortState({ sortKey: "", sortOrder: textConstant?.ASC });
      onSortChange?.("", `${textConstant?.ASC}`);
      return;
    }
    const { field, sort } = model[0];
    // Map column field to backend sort key
    const sortKey = field;
    let sortOrder: SortOrder = textConstant?.ASC;
      if (sortState.sortKey === sortKey) {
        sortOrder = sortState.sortOrder === textConstant?.ASC ? textConstant?.DESC : textConstant?.ASC;
      }
    setSortState({ sortKey, sortOrder });
    onSortChange?.({ sortKey, sortOrder });
  };

  const getItemsPerPageOptions = () => {
    return [25, 50, 75, 100];
  };

  // Don't render DataGrid if no columns are available
  if (!loading && columns.length === 0) {
    return (
      <div className={styles.seekerListDashboard}>
        <Box className={styles.container}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: height,
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
            }}
          >
            No data
          </Box>
        </Box>
      </div>
    );
  }

  return (
    <div
      className={styles.seekerListDashboard}
      data-testid="seeker-list-dashboard"
      ref={gridContainerRef}
    >
      <div>
        <Box className={styles.container} data-testid="box-container">
          <DataGrid
            getRowHeight={() => 45}
            sx={{
              rowWidth: "calc(100% - 80px)",
              "& .MuiDataGrid-cellEmpty": {
                visibility:"hidden"
              },
              "&.MuiDataGrid-root": {
                borderLeft: "none",
                borderRight: "none",
                overflow: "unset",
                ...(smallSize
                  ? { height: "calc(73vh - 164px)" }
                  : {
                      height: heightToApplyonGrid
                        ? heightToApplyonGrid
                        : isheight
                          ? "calc(100vh - 272px)"
                          : "calc(100vh - 205px)",
                    }),
              },
              "& .MuiDataGrid-scrollbar--vertical ": {
                maxWidth: "14px",
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
                color: "#707070",
              },
              "& .MuiDataGrid-columnHeaderTitle:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-sortIcon": {
                opacity: "1 !important",
                color: "#051B46",
              },
              "& .MuiDataGrid-columnHeader:not([aria-sort])": {
                "& .MuiDataGrid-sortIcon": {
                  opacity: "1 !important",
                  color: "#CCCCCC",
                },
              },
              "& .MuiDataGrid-row": {
                cursor: "pointer",
                height: "45px !important",
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
                height: "40px !important",
              },
              ".MuiDataGrid-cell": {
                // padding: "10px",
                color: "#051B46",
                display: "flex",
                alignItems: "center",
              },
              ".MuiDataGrid-cell:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-cellCheckbox:focus-within": {
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
              "& .MuiDataGrid-cell:focus-within": {
                outline: "none",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#F4F8FB",
              },
              "& .MuiDataGrid-cell--textLeft": {
                lineHeight: "20px",
              },
              "& .MuiLinearProgress-root": {
                bottom: "16px",
              },
            }}
            rows={dataToShow}
            getRowId={(row) =>
              row?.id || row?.registrationId || row?.email || Math.random()
            }
            onRowClick={(params) => {
              if (onRowClick) {
                onRowClick(params.row);
              }
            }}
            columns={columns}
            paginationMode="server"
            sortingMode="client"
            rowCount={totalData}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            page={currentPage - 1}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: pageSize,
                  page: currentPage - 1,
                },
              },
              sorting: {
                sortModel: [],
              },
            }}
            sortModel={sortModel}
            onSortModelChange={!isSort ? handleSortModelChange : handleServerSort}
            sortingOrder={[textConstant?.DESC, textConstant?.ASC]}
            disableColumnReorder
            disableMultiSort
            slots={{
              columnSortedDescendingIcon: () => (
                <img
                  src={sortDesc}
                  alt="Sort Descending"
                  style={{ width: "16px", height: "16px" }}
                />
              ),
              columnSortedAscendingIcon: () => (
                <img
                  src={sortAsc}
                  alt="Sort Ascending"
                  style={{ width: "16px", height: "16px" }}
                />
              ),
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
                    color: "#999",
                    fontWeight: 400,
                    fontSize: "1.2rem",
                  }}
                >
                  {noData}
                </Box>
              ),
              noResultsOverlay: () => (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#999",
                    fontWeight: 400,
                    fontSize: "1.2rem",
                  }}
                >
                  {noData}
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

export default DataGridWithPagination;
