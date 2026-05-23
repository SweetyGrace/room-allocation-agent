import React, { useState } from "react";
import { Popover, Toolbar, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import hamburgerIcon from "../../../assets/images/hamburger-icon.svg";
import mySpace from "../../../assets/images/my-space.svg";
import familyAndFriends from "../../../assets/images/family-friends-icon.svg";
import styles from "./index.module.scss";
import { getItemInLocalStorage } from "../../../services/localStorage";

const HamburgerSideNav: React.FC = () => {
  const navigate = useNavigate();
  const seekerDetails = getItemInLocalStorage("seekerDetails") || {};
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleToggleSidebar = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const handleMySpaceOnclick = () => {
    if (
      seekerDetails?.role?.includes("mahatria") ||
      seekerDetails?.role?.includes("admin")
    ) {
      navigate("/admin");
    }
    handleClose();
  };

  return (
    <div>
      <img
        src={hamburgerIcon}
        alt="my space and family hamburger"
        className={styles.hamburger}
        onClick={handleToggleSidebar}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Toolbar className={styles.toolbar}>
          <Button className={styles.menuItem} onClick={handleMySpaceOnclick}>
            <img src={mySpace} alt="My Space Icon" className={styles.icon} />
            My Space
          </Button>
          <Button onClick={handleClose} className={styles.menuItem}>
            <img
              src={familyAndFriends}
              alt="Friends and Family Icon"
              className={styles.icon}
            />
            Friends and Family
          </Button>
        </Toolbar>
      </Popover>
    </div>
  );
};

export default HamburgerSideNav;
