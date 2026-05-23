import React from "react";
import { Pagination, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import styles from "./index.module.scss";

// Define column interface
interface Column {
  field: string;
  headerName: string;
  width?: string;
  textAlign?: string;
  isSeparator?: boolean;
  renderCell?: (params: unknown) => JSX.Element;
}

// Define PaginationFooter props
interface PaginationFooterProps {
  currentPage: number;
  pageSize: number;
  total: number;
  itemsPerPageOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  showPagination?: boolean;
  itemLabel?: string;
}

// Define TableWithPaginationComponent props
interface TableWithPaginationComponentProps<T> {
  columns: Column[];
  data: T[];
  loading?: boolean;
  noDataMessage?: string;
  onRowClick?: (row: T) => void;
  // Pagination props
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  itemsPerPageOptions?: number[];
  showPagination?: boolean;
  itemLabel?: string;
  // Custom render props
  renderLoader?: () => JSX.Element;
  renderCustomRow?: (row: T, columns: Column[]) => JSX.Element;
  customRowClassName?: string;
  subHeader: boolean;
  noDataImg?: string;
}

// PaginationFooter component
const PaginationFooter: React.FC<PaginationFooterProps> = ({
  currentPage,
  pageSize,
  total,
  itemsPerPageOptions = [10, 50, 100],
  onPageChange,
  onPageSizeChange,
  showPagination = true,
  itemLabel = "items"
}) => {
  const totalPages = Math.ceil(total / pageSize);

  const filteredPageSizeOption = itemsPerPageOptions.filter((option) => option <= total);
  const isSmallValue = filteredPageSizeOption.every((option) => option != total);
  if(isSmallValue){
    filteredPageSizeOption.push(total);
  }
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page);
  };

  return showPagination ? (
    <div className={`${styles.footerContainer} ${styles.stickyFooter}`}>
      <div className={`${styles.footer} ${styles.padding}`}>
        <div className={styles.footerTextDetails}>
          <span className={styles.footerText}>Showing</span>
          <div className={styles.select}>
            {itemsPerPageOptions.length > 0 && (
              <Select
              value={filteredPageSizeOption.length != 1 ? pageSize : total}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                sx={{
                  '.MuiOutlinedInput-notchedOutline': {
                    borderStyle: 'none',
                    padding: '0px',
                  },
                }}
              >
              {filteredPageSizeOption.length > 1 ? (
                filteredPageSizeOption.map((option) => (
                      <MenuItem key={option} value={option}>
                      {option}
                      </MenuItem>
                  ))
                ):
                <MenuItem key={total} value={total}>
                  {total}
                </MenuItem>
                }
              </Select>
            )}
            <p className={styles.footerText}>
              {itemsPerPageOptions.length > 0 && 'of '}
              {total} {itemLabel}
            </p>
          </div>
        </div>
        <div className={styles.pagination}>
          <Pagination
            // showFirstButton
            // showLastButton
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            siblingCount={0}
            boundaryCount={2}
            sx={{
              '& .MuiPaginationItem-root': {
                backgroundColor: 'none',
                color: '#7F7F7F',
              },
              '& .Mui-selected': {
                backgroundColor: '#EBF3FA',
                color: '#051B46',
              },
              '& .MuiPaginationItem-root:hover': {
                backgroundColor: '#D0E2F2',
              },
              '.MuiPaginationItem-root ': {
                margin: '0px',
              },
            }}
          />
        </div>
      </div>
    </div>
  ) : null;
};

// TableWithPaginationComponent component
const TableWithPaginationComponent = <T extends { id: number | string }>(props: TableWithPaginationComponentProps<T>) => {
  const {
    columns,
    data,
    loading = false,
    noDataMessage = "No results found",
    onRowClick,
    currentPage,
    pageSize,
    total,
    onPageChange,
    onPageSizeChange,
    itemsPerPageOptions = [10, 50, 100],
    showPagination = true,
    itemLabel = "items",
    renderLoader,
    renderCustomRow,
    customRowClassName,
    subHeader,
    noDataImg
  } = props;

  // Default loader
  const defaultLoader = () => (
    <div className={styles.loaderContainer}>
      <div className={styles.loader}></div>
    </div>
  );

  return (
    <TableContainer 
      component={Paper} 
      className={styles.tableContainer}
      sx={{
        overflow: 'auto',
        height: subHeader? (data.length > 0 ? 'calc(100vh - 299px)' : 'calc(100vh - 243px)'): 'calc(100vh - 243px)',
        '& tbody tr:hover': {
          backgroundColor: '#F4F8Fb',
        },
      }}
    >
      {loading ? (
        renderLoader ? renderLoader() : defaultLoader()
      ) : (
        <>
          {data.length > 0 ? (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table className={styles.table}
              sx={{ 
                borderCollapse: 'unset',
                tableLayout: 'fixed', // important for fixed column widths
                minWidth: '1000px'    // set a minimum width to trigger scrolling
              }}
              >
                <TableHead>
                  <TableRow>
                    {
                    columns.map((column, index) => (
                      <TableCell key={column.field} className={styles.tableHeader} 
                      style={{ 
                        color: "#051B46",
                        fontSize: "15px", 
                        textAlign: column.textAlign != undefined ? `${column.textAlign}`: "left",
                        borderRight: column.isSeparator ? '1px solid #F0F0F0': '0px solid #F0F0F0', 
                      }} 
                      sx={{
                         minWidth: `${column.width}px`, 
                         maxWidth: "150px", 
                         width: `${column.width}px`, 
                         position: index == 0 ?'sticky' : 'relative',
                         background: 'white',
                         zIndex: index == 0 ? 2: 1,
                         left: 0,
                          // borderLeft: index == 0 ? '1px solid #E0E0E0': '0px solid #F0F0F0',
                      
                        }}
                      >
                        {column.headerName}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row) => (
                    renderCustomRow ? (
                
                      renderCustomRow(row, columns)
                    ) : (
                      <TableRow 
                        key={row.id} 
                        className={customRowClassName || styles.tableRow}
                        onClick={() => onRowClick && onRowClick}
                      >
                        {columns.map((column) => (
                          <TableCell key={`${row.id}-${column.field}`} className={styles.tableCell}>
                            {column.renderCell ? column.renderCell(row) : String(row[column.field as keyof T])}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  ))}
                </TableBody>
              </Table>
              <PaginationFooter
                currentPage={currentPage}
                pageSize={pageSize}
                total={total}
                itemsPerPageOptions={itemsPerPageOptions}
                onPageSizeChange={onPageSizeChange}
                onPageChange={onPageChange}
                showPagination={showPagination}
                itemLabel={itemLabel}
              />
            </TableContainer>
          ) : (
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={columns.length} className={styles.noData} >
                  <img src = {noDataImg}/>
                    <p>{noDataMessage}</p>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </>
      )}
    </TableContainer>
  );
};

export default TableWithPaginationComponent;