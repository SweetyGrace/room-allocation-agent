import React, { useState } from "react";
import { Menu, MenuItem, IconButton, Tooltip } from "@mui/material";
import optionsIcon from "../../../assets/images/dropdown-icon.svg";
import styles from "./index.module.scss";

interface CommonMenuOptionProps {
  onOptionClick: (option: { label: string; onClick: () => void }) => void;
  options: { label: string; onClick: () => void }[];
}

const CommonMenuOption: React.FC<CommonMenuOptionProps> = ({
  options,
  onOptionClick,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  /*
   * @description this function is used to handle the click
   */
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /*
   * @description this function is used to handle the close
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  /*
   * @description this function is used to handle the option click
   * @param option - option object
   */
  const handleOptionClick = (option: {
    label: string;
    onClick: () => void;
  }) => {
    onOptionClick(option);
    handleClose();
  };

  return (
    <div>
      <Tooltip title="Options" placement="bottom">
        <IconButton onClick={handleClick}>
          <img src={optionsIcon} alt="options" className={styles.image} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: "12px !important",
            border: "1px solid #C7DEFF !important",
            background:
              "linear-gradient(284.09deg, #F5FCFF 6.52%, #FFFFFF 92.65%) !important",
            padding: "0px 0px 0px 0px !important",
            boxShadow: "1px 2px 40px 0px #3BA4FD3D",
            "& .MuiMenu-list": {
              padding: "8px", // Style the menu list
            },
            // position: "absolute !important",
            // top: "390px !important",
            // left: "274px !important",
          },
        }}
        classes={{ list: styles.customMenuList }} // Add custom class here
      >
        {options.map((option, index) => (
          <MenuItem
            key={index}
            onClick={() => handleOptionClick(option)}
            sx={{
              color: option.label.toLowerCase().includes("remove")
                ? " #FF7D41"
                : "#1859B4",
              padding: "8px 16px 8px 12px",
              fontSize: "16px",
              lineHeight: "22px",
              fontFamily: "NatoSans-Regular",
              "&:hover": {
                backgroundColor: "#EEF6FF", // Change to desired hover color
              },
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default CommonMenuOption;
