import React, { useCallback, useEffect, useState } from "react";
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
import { AI_OVERLAY_STRINGS, noData } from "../../../constants/index.ts";
import shuffle from "../../../assets/images/shuffle-img.svg";
import { colorizeMahatriaInfinitheism } from "../ColorizeMahatriaInfinitheism/index.tsx";
import { Drawer } from "@mui/material";
import GrayLine from "../GrayLine/index.tsx";
import CloseIcon from "../../../assets/images/crossIconBlue.svg";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  getBarChartOptions,
  getPieChartOptions,
  getTimeSeriesOptions,
  ProcessedChartData,
} from "./functions.ts";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler,
);

interface GraphSemantics {
  type: "raw-table" | "bar" | "time-series" | "scalar" | "pie";
  x_axis?: string | null;
  y_axis?: string | null;
}

interface DataGridWithPaginationProps {
  headers: GridColDef[];
  seekersData?: unknown[];
  hoverImageClass?: string;
  totalData?: number;
  pageSize?: number;
  setPageSize?: (size: number) => void;
  currentPage?: number;
  onClose?: () => void;
  setCurrentPage?: (page: number) => void;
  loading?: boolean;
  height?: string;
  onRowClick?: (rowData: unknown) => void;
  withoutStartAt?: boolean;
  isheight?: boolean;
  heightToApplyonGrid?: string;
  smallSize?: boolean;
  viewType?: "table" | "chart" | "time-series";
  chartType?: "bar" | "line" | "pie" | "time-series";
  graphSemantics?: GraphSemantics;
  chartData?: ProcessedChartData | null;
  pageSize: number;
  currentPage: number;
  totalRecords?: number;
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  loading?: boolean;
}

const ExpandedTableView: React.FC<DataGridWithPaginationProps> = ({
  headers,
  seekersData = [],
  hoverImageClass,
  totalData = 0,
  pageSize = 10,
  setPageSize,
  currentPage = 1,
  totalRecords = 0,
  onPageChange,
  onPageSizeChange,
  setCurrentPage,
  loading = false,
  height = "calc(100vh - 290px)",
  onRowClick,
  withoutStartAt,
  isheight,
  heightToApplyonGrid,
  smallSize,
  viewType = "table",
  chartType,
  graphSemantics,
  chartData,
  onClose,
}) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [dataToShow, setDataToShow] = useState<unknown[]>([]);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  // Ensure we have valid data arrays
  const validSeekersData = Array.isArray(seekersData) ? seekersData : [];
  const validHeaders = Array.isArray(headers) ? headers : [];

  // Function to get title based on viewType
  const getViewTitle = (): string => {
    switch (viewType) {
      case "chart":
        return "Chart view";
      case "time-series":
        return "Time series view";
      case "table":
      default:
        return AI_OVERLAY_STRINGS.DASHBOARD_TITLE;
    }
  };

  /**
   * Renders a bar chart using the processed chart data from AIOverlay
   */
  const renderBarChart = () => {
    if (!chartData || !graphSemantics)
      return <div>No chart data available</div>;

    // Calculate max Y value for better axis scaling
    const maxY =
      chartData?.datasets?.[0]?.data?.length > 0
        ? Math.max(...chartData.datasets[0].data, 0)
        : 0;

    const baseOptions = getBarChartOptions(chartData.xAxis, chartData.yAxis);

    const options = {
      ...baseOptions,
      scales: {
        ...baseOptions.scales, // Preserve existing scale configuration
        x: {
          ...baseOptions.scales?.x,
          display: true,
          title: {
            display: true,
            text: chartData.xAxis || "X Axis",
            font: {
              size: 14,
              weight: "bold",
            },
          },
        },
        y: {
          ...baseOptions.scales?.y,
          display: true,
          beginAtZero: true,
          max: maxY < 5 ? 5 : maxY + 1,
          title: {
            display: true,
            text: chartData.yAxis || "Y Axis",
            font: {
              size: 14,
              weight: "bold",
            },
          },
          ticks: {
            stepSize: 1,
            callback: (value: number) => {
              return Number.isFinite(value) ? Math.round(value) : value;
            },
          },
        },
      },
    };

    return (
      <div className={styles.chartWrapper}>
        <div className={styles.overlayContent}>
          <Bar data={chartData} options={options} />
        </div>
      </div>
    );
  };

  /**
   * Renders a pie chart using the processed chart data from AIOverlay
   */
  const renderPieChart = () => {
    if (!chartData || !graphSemantics)
      return <div>No chart data available</div>;

    const options = getPieChartOptions(chartData.xAxis);

    return (
      <div className={styles.chartWrapper}>
        <div className={styles.overlayContent}>
          <Pie data={chartData} options={options} />
        </div>
      </div>
    );
  };

  /**
   * Renders a time series chart using the processed chart data from AIOverlay
   */
  const renderTimeSeries = () => {
    if (!chartData || !graphSemantics)
      return <div>No chart data available</div>;

    const options = getTimeSeriesOptions(chartData.xAxis, chartData.yAxis);

    return (
      <div className={styles.chartWrapper}>
        <div className={styles.overlayContent}>
          <Line data={chartData} options={options} />
        </div>
      </div>
    );
  };

  /**
   * Renders the appropriate visualization based on graph semantics or viewType.
   * Now uses the same logic and styling as AIOverlay
   */
  const renderVisualization = () => {
    if (!graphSemantics) return <div>No visualization data available</div>;

    // Use viewType if it's time-series, otherwise use graphSemantics.type
    const visualizationType =
      viewType === "time-series" ? "time-series" : graphSemantics.type;

    switch (visualizationType) {
      case "bar":
        return renderBarChart();
      case "time-series":
        return renderTimeSeries();
      case "pie":
        return renderPieChart();
      default:
        return <div>Unsupported chart type: {visualizationType}</div>;
    }
  };

  const columns: GridColDef[] = validHeaders.map(
    (column: GridColDef, index: number) => {
      if (column.headerName === "No. of HDBs") {
        return {
          ...column,
          headerClassName: "sortable-header",
          renderHeader: (params) => (
            <span>
              {colorizeMahatriaInfinitheism(params.colDef.headerName)}
            </span>
          ),
        };
      }
      if (column.headerName === "Dob") {
        return {
          ...column,
          headerClassName: "sortable-header",
          renderHeader: () => <span>DOB</span>,
        };
      }
      if (
        column.field === "blessedWith" ||
        column.headerName === "Blessed With"
      ) {
        return {
          ...column,
          sortable: column.sortable !== undefined ? column.sortable : false,
          headerClassName: "sortable-header",
          renderCell: (params) => {
            const highlightStyle = params.row?.__highlight
              ? { color: "#e28619" }
              : undefined;
            const isSwapRequestActive =
              params.row?.isSwapRequestActive === true;
            return (
              <div className={styles.blessedWithContainer}>
                <span className={styles.blessedWithText} style={highlightStyle}>
                  {params.value === null ||
                  params.value === undefined ||
                  params.value === ""
                    ? "-"
                    : highlightStyle
                      ? params.value
                      : colorizeMahatriaInfinitheism(params.value)}
                </span>
                {isSwapRequestActive && (
                  <img
                    src={shuffle}
                    alt="Wants Swap"
                    className={styles.swapIcon}
                    title="Wants swap"
                  />
                )}
              </div>
            );
          },
        };
      }
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
  };

  const handlePageSizeChange = (size: number) => {
    if (setPageSize) {
      setPageSize(size);
    }
    if (setCurrentPage) {
      setCurrentPage(1);
    }
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

          if (sort === "asc") {
            return aValue > bValue ? 1 : -1;
          } else if (sort === "desc") {
            return aValue < bValue ? 1 : -1;
          }
          return 0;
        },
      );

      setDataToShow(sortedData);
    }
  };

  const getItemsPerPageOptions = () => {
    return [10, 25, 50, 100];
  };

  const renderContent = () => {
    // Show chart/time-series view if viewType is 'chart' or 'time-series'
    if (
      (viewType === "chart" || viewType === "time-series") &&
      graphSemantics &&
      chartData
    ) {
      return (
        <div className={styles.chartContainer}>{renderVisualization()}</div>
      );
    }

    // Default to table view
    return (
      <Box className={styles.container} data-testid="box-container">
        <DataGrid
          getRowHeight={() => 45}
          sx={{
            rowWidth: "calc(100% - 80px)",
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
                        ? "calc(100vh - 268px)"
                        : "calc(100vh - 268px)",
                  }),
            },
            "& .MuiDataGrid-filler": {
              "--rowBorderColor": "transparent !important",
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
              color: "#051B46",
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
              height: "60px !important",
              minHeight: "60px !important",
              maxHeight: "60px !important",
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
              padding: "8px 16px",
              cursor: "default",
              height: "40px !important",
              //   borderBottom: "1px solid #E0E0E0 !important",
            },
            ".MuiDataGrid-cell": {
              padding: "12px 16px",
              color: "#051B46",
              display: "flex",
              alignItems: "center",
              height: "60px",
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
          rowCount={totalRecords || 0}
          // sortingMode="client"
          pageSize={pageSize}
          onPageChange={(newPage: any) => {
            if (onPageChange) {
              onPageChange(newPage + 1);
            }
          }}
          onPageSizeChange={(newSize: any) => {
            if (onPageSizeChange) {
              onPageSizeChange(newSize);
            }
          }}
          page={currentPage - 1}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: pageSize,
                page: currentPage - 1,
              },
            },
            // sorting: {
            //   sortModel: [],
            // },
          }}
          // sortModel={sortModel}
          // onSortModelChange={handleSortModelChange}
          // sortingOrder={["desc", "asc"]}
          // disableColumnReorder
          // disableMultiSort
          slots={{
            // columnSortedDescendingIcon: () => (
            //   <img
            //     src={sortDesc}
            //     alt="Sort Descending"
            //     style={{ width: "16px", height: "16px" }}
            //   />
            // ),
            // columnSortedAscendingIcon: () => (
            //   <img
            //     src={sortAsc}
            //     alt="Sort Ascending"
            //     style={{ width: "16px", height: "16px" }}
            //   />
            // ),
            footer: () => (
              <PaginationFooter
                currentPage={currentPage}
                pageSize={pageSize}
                total={totalRecords || 0}
                itemsPerPageOptions={getItemsPerPageOptions()}
                onPageSizeChange={(newSize) => {
                  if (onPageSizeChange) {
                    onPageSizeChange(newSize);
                  }
                }}
                onPageChange={(newPage) => {
                  if (onPageChange) {
                    onPageChange(newPage);
                  }
                }}
                showPagination={true}
                data-testid="pagination-footer"
                showDropdown={true}
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
          disableColumnSorting
        />
      </Box>
    );
  };

  // Don't render if no columns are available and not in chart/time-series mode
  if (!loading && columns.length === 0 && viewType === "table") {
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
    <Drawer
      anchor="left"
      open={true}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: "100%",
        },
      }}
    >
      <div
        className={styles.seekerListDashboard}
        data-testid="seeker-list-dashboard"
      >
        <div className={styles.header}>
          <div className={styles.titleText}>{getViewTitle()}</div>
          <GrayLine />
          <img
            src={CloseIcon}
            alt="Close"
            onClick={onClose}
            className={styles.closeIcon}
          />
        </div>

        <div>{renderContent()}</div>
      </div>
    </Drawer>
  );
};

export default ExpandedTableView;
