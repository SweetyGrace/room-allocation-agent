import React from "react";
import { Pagination, Select, MenuItem, PaginationItem } from "@mui/material";
import styles from "./index.module.scss";
import { ReactComponent as DropdownIcon } from "../../../assets/images/dropdown-pagination.svg";
import { ReactComponent as PaginationCarret } from "../../../assets/images/pagination-carret.svg";

export interface PaginationFooterProps {
  currentPage: number;
  pageSize: number;
  total: number;
  itemsPerPageOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  showPagination?: boolean;
  showDropdown?: boolean;
}

export const PaginationFooter: React.FC<PaginationFooterProps> = ({
  currentPage,
  pageSize,
  total,
  itemsPerPageOptions = [25, 50, 75, 100],
  onPageChange,
  onPageSizeChange,
  showPagination = true,
  showDropdown = true,
}) => {
  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number,
  ) => {
    onPageChange(page);
  };
  const filteredPageSizeOption = itemsPerPageOptions;

  return showPagination ? (
    <div className={styles.footerContainer}>
      <div className={`${styles.footer} ${styles.padding}`}>
        <div className={styles.footerTextDetails}>
          {showDropdown ? (
            <>
              <span className={styles.footerText}>Showing</span>
              <div className={styles.select}>
                <Select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  IconComponent={(props) => <DropdownIcon {...props} />}
                  sx={{
                    ".MuiOutlinedInput-notchedOutline": {
                      borderStyle: "none",
                      padding: "0px",
                    },
                    "& .MuiSelect-select": {
                      padding: "0px",
                    },
                    "& .MuiSelect-icon": {
                      borderRadius: "5px",
                      top: "unset",
                      right: "15px",
                    },
                  }}
                >
                  {filteredPageSizeOption.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                <p className={styles.footerText}>of {total} Seekers</p>
              </div>
            </>
          ) : (
            <span className={styles.footerText}>
              Showing {total} of {total} seekers
            </span>
          )}
        </div>
        <div className={styles.pagination}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            siblingCount={0}
            boundaryCount={1}
            renderItem={(item) => (
              <PaginationItem
                {...item}
                slots={{
                  previous: () => <PaginationCarret />, // Custom previous icon
                  next: () => (
                    <PaginationCarret style={{ transform: "rotate(180deg)" }} />
                  ), // Rotated for next
                }}
              />
            )}
            sx={{
              "& .MuiPaginationItem-root": {
                backgroundColor: "transparent",
                color: "#7F7F7F",
              },
              "& .Mui-selected": {
                backgroundColor: "#EBF3FA",
                color: "#051B46",
              },
              "& .MuiPaginationItem-root:hover": {
                backgroundColor: "#D0E2F2",
              },
              ".MuiPaginationItem-root ": {
                margin: "0px",
              },
            }}
          />
        </div>
      </div>
    </div>
  ) : null;
};
