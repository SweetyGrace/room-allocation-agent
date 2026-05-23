import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import SectionCard from "../../../components/SectionCard";
import { useDashboard } from "../../../context/HDBDashboardContext";
import styles from "./index.module.scss";
import { colorizeMahatriaInfinitheism } from "../../../common/components/ColorizeMahatriaInfinitheism";
import { setSelectedKpiTab } from "../../../reducers/ProgramReducer";
import { useDispatch } from "react-redux";
import { transformFiltersForLocation } from "../../../utils/commonFunctions";
import {textConstant} from "../../../constants/textConstants";


type DetailedTableProps = {
  detailedData?: any;
  tshirtData?: any;
  jacketData?: any;
  showViewSelector?: boolean;
};

const DetailedTable = ({ 
  detailedData, 
  tshirtData, 
  jacketData, 
  showViewSelector = false 
}: DetailedTableProps) => {
  const [selectedView, setSelectedView] = useState<'tshirt' | 'jacket'>('tshirt');
  const { updateFilters } = useDashboard();
  const dispatch = useDispatch();

  // Determine which data to use
  const getCurrentData = () => {
    if (showViewSelector) {
      return selectedView === 'tshirt' ? tshirtData : jacketData;
    }
    return detailedData ;
  };

  const currentData = getCurrentData();
  const { columnDefinition, values, displayName } = currentData || {};

  if (!columnDefinition || !values) return null;

  const columns: GridColDef[] = columnDefinition.map((col) => ({
    field: col.key,
    headerName: col.displayName,
    disableColumnMenu: true,
    sortable: false,
    flex: 1,
    cellClassName: (params) => {
      if (params.row.isTotalRow) {
        return "boldCell"; // Add a class for bold styling
      }
      const hasFilter = params.row.filters && params.row.filters[col.key];
      return hasFilter ? 'clickableCell' : 'nonClickableCell';
    },
    ...(col.key === textConstant.HDBS_MSD
      ? {
          renderCell: (params) => colorizeMahatriaInfinitheism(params.value),
        }
      : {}),
  }));

  const rows = values.map((row, index) => ({
    id: index,
    ...row,
    isTotalRow: row[textConstant.HDBS_MSD] === textConstant.TOTAL, // Add a flag for rows where hdbsMsds is "Total"
  }));

  const GoodiesSection = currentData?.key === 'goodiesData'; 

  const handleCellClick = (params) => {
    const {field, row} = params;
    const filter = row.filters?.[field];
    if (filter) {
          updateFilters(transformFiltersForLocation(filter));

          dispatch(
            setSelectedKpiTab({
              kpiFilter: filter?.kpiFilter,
              kpiCategory: filter?.kpiCategory,
            }),
          );
        }
  };

  const handleViewChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedView(event.target.value as 'tshirt' | 'jacket');
  };

  // Check if we need to render grouped columns table
  const hasGroupedColumns = columnDefinition && columnDefinition.some((col: any) => col.type === 'grouped');

  // Custom table renderer for grouped columns
  const renderGroupedTable = () => {
    if (!columnDefinition || !values) return null;

    // Separate columns by type and position
    const firstSingleColumns = columnDefinition.filter((col: any) => 
      (col.type === 'single' || !col.type) && col.key !== 'summaryTotalCount'
    );
    const groupedColumns = columnDefinition.filter((col: any) => col.type === 'grouped');
    const totalColumns = columnDefinition.filter((col: any) => col.key === 'summaryTotalCount');

    return (
      <div className={styles.customTable}>
        <table className={styles.table}>
          <thead>
            {/* First header row - main column headers */}
            <tr className={styles.headerRow}>
              {firstSingleColumns.map((col: any) => (
                <th key={col.key} className={styles.headerCell} rowSpan={2}>
                  {colorizeMahatriaInfinitheism(col.displayName)}
                </th>
              ))}
              {groupedColumns.map((col: any) => (
                <th key={col.key} className={styles.headerCell} colSpan={col.subColumns?.length || 2}>
                  {colorizeMahatriaInfinitheism(col.displayName)}
                </th>
              ))}
              {totalColumns.map((col: any) => (
                <th key={col.key} className={styles.headerCell} rowSpan={2}>
                  {colorizeMahatriaInfinitheism(col.displayName)}
                </th>
              ))}
            </tr>
            {/* Second header row - sub column headers */}
            <tr className={styles.subHeaderRow}>
              {groupedColumns.map((col: any) => 
                col.subColumns?.map((subCol: any) => (
                  <th key={`${col.key}_${subCol.key}`} className={styles.subHeaderCell}>
                    {colorizeMahatriaInfinitheism(subCol.displayName)}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {values.map((row: any, index: number) => (
              <tr key={index} className={styles.bodyRow}>
                {firstSingleColumns.map((col: any) => (
                  <td 
                    key={col.key} 
                    className={styles.bodyCell}
                    onClick={() => handleCellClick({ field: col.key, row })}
                  >
                    {row[col.key]}
                  </td>
                ))}
                {groupedColumns.map((col: any) => 
                  col.subColumns?.map((subCol: any) => (
                    <td 
                      key={`${col.key}_${subCol.key}`} 
                      className={styles.bodyCell}
                      onClick={() => handleCellClick({ field: subCol.key, row })}
                    >
                      {row[subCol.key] || 0}
                    </td>
                  ))
                )}
                {totalColumns.map((col: any) => (
                  <td 
                    key={col.key} 
                    className={styles.bodyCell}
                    onClick={() => handleCellClick({ field: col.key, row })}
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <SectionCard title={displayName} customClass={styles.detailedTableCard}>
      {/* Dropdown Selector */}
      {showViewSelector && (
        <div className={styles.viewSelectorContainer}>
          <label htmlFor="viewSelector" className={styles.viewSelectorLabel}>
            Select View:
          </label>
          <select
            id="viewSelector"
            value={selectedView}
            onChange={handleViewChange}
            className={styles.viewSelector}
          >
            <option value="tshirt">T-Shirt Details</option>
            <option value="jacket">Jacket Details</option>
          </select>
        </div>
      )}

      <div className={styles.tableWrapper}>
        {hasGroupedColumns ? (
          renderGroupedTable()
        ) : (
           <DataGrid
          rows={rows}
          columns={columns.map((col)=>({
                ...col,
                headerName: colorizeMahatriaInfinitheism(col.headerName),
              }))}
          autoHeight
          onCellClick={handleCellClick}
          hideFooter
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              borderBottom: "none",
              color: "#888888",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              whiteSpace: "normal",
              overflow: "visible",
              textAlign: "center", // Center align column header titles
            },
            "& .MuiDataGrid-columnHeaderTitleContainer": {
              display: "flex", // Ensure flexbox is used
              justifyContent: "center", // Center align column header title container horizontally
              alignItems: "center", // Center align column header title container vertically
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
              overflow: "visible",
              textAlign: "center", // Center align cell values
            },
            "& .boldCell": {
                fontWeight: "bold", // Apply bold styling for all values in total rows
              },
            "& .clickableCell": {
              cursor: "pointer",
            },
            "& .nonClickableCell": {
              cursor: "default",
            },

          }}
        />
        )}
      </div>
    </SectionCard>
  );
};

export default DetailedTable;
