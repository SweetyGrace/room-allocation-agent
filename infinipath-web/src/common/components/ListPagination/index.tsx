import React from "react";
import {
  Box,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import styles from "./index.module.scss";
import { getPageNumbers } from "../../../utils/commonFunctions";

interface ListPaginationProps {
  totalRecords: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

const ListPagination: React.FC<ListPaginationProps> = ({
  totalRecords,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}) => {
  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={3}
      className={styles.listPagination}
    >
      {/* Showing X of Y Seekers */}
      <Typography color="text.secondary" className={styles.showingText}>
        Showing{" "}
        <Select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          variant="standard"
          disableUnderline
            MenuProps={{
              PopoverClasses: {
                root: styles.listPaginationPopover, // Custom class for the Popover
              },
          }}
        >
          {pageSizeOptions.map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </Select>{" "}
        of {totalRecords} Seekers
      </Typography>

      {/* Page Buttons and Navigation */}
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        className={styles.pagination}
      >
        <IconButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={styles.navButton}
        >
          <ChevronLeft />
        </IconButton>

        {getPageNumbers(totalPages, currentPage).map((page, idx) =>
          page === "..." ? (
            <Typography
              key={idx}
              color="text.disabled"
              className={styles.ellipsis}
            >
              •••
            </Typography>
          ) : (
            <Button
              key={idx}
              onClick={() => onPageChange(Number(page))}
              variant={currentPage === page ? "contained" : "text"}
              className={`${styles.pageButton} ${
                currentPage === page ? styles.pageButtonActive : ""
              }`}
              sx={{
                minWidth: 32,
                height: 32,
                borderRadius: "50%",
                fontWeight: 500,
                backgroundColor:
                  currentPage === page
                    ? "rgba(0, 123, 255, 0.1)"
                    : "transparent",
                color: "primary.main",
              }}
            >
              {page}
            </Button>
          ),
        )}

        <IconButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={styles.navButton}
        >
          <ChevronRight />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ListPagination;


//.SeekerDetailsOverlay_seekerDetailsModa - 1300-> 10