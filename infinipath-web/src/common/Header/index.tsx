import rahatriaLogo from "../../assets/images/rahatria.svg";
import { Outlet, useNavigate } from "react-router-dom";
import styles from "./index.module.scss";
import { Avatar, Drawer } from "@mui/material";
import defaultProfileIcon from "../../assets/images/default-profile.svg";
import { getItemInLocalStorage } from "../../services/localStorage";
import infinitheism from "../../assets/images/infinitheism-header-logo.svg";
import mahatriaDotsMobile from "../../assets/images/mahatria-dots-mobile.svg";
import hamburger from "../../assets/images/hamburger-icon.svg"
import DrawerMenuItems from "../../components/components/DrawerMenuItems";
import RoleSwitcher from "../components/RoleSwitcher";
import { useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const activeTab = window?.location?.pathname;
  const seekerDetails = getItemInLocalStorage("seekerDetails") || {};
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleLogoOnclick = () => {
      navigate("/admin/action-cards");
  };

  const handleProfileIconClick = () => {
    navigate("/admin/profile");
  };

  return (
    <>
      <div className={styles.header} data-testid="header">
        <div className={styles.appIconSection} data-testid="app-icon-section">
          <img
            src={infinitheism}
            alt="inifinipath"
            className={styles.appIcon}
            onClick={handleLogoOnclick}
            data-testid="app-icon"
          />
        </div>
        <div className={styles.mahatriaDots} data-testid="mahatria-dots">
          <img
            src={rahatriaLogo}
            alt="logo"
            className={styles.mahatriaDotsLogo}
            data-testid="mahatria-logo"
          />
          <img
            src={mahatriaDotsMobile}
            alt="logo"
            className={styles.mahatriaDotsLogoMobile}
            data-testid="mahatria-logo-mobile"
          />
        </div>
        <div className={styles.logOut} data-testid="logout-container">
          {window?.location?.pathname?.length > 1 &&
            !window?.location?.href?.includes("login") && (
              <>
                <div className={styles.tabs} data-testid="tabs">
                  <div
                    className={`${styles.tab} ${activeTab?.includes("profile") ? styles.activeTab : ""}`}
                    onClick={() => handleProfileIconClick()}
                    data-testid="profile-tab"
                  >
                    <Avatar
                      alt={seekerDetails?.firstName}
                      src={
                        seekerDetails?.profileUrl?.length > 0
                          ? `${seekerDetails?.profileUrl}?timestamp=${new Date().getTime()}` // To avoid caching
                          : defaultProfileIcon
                      }
                      sx={{
                        width: 48,
                        height: 48,
                        border: "1px solid #DDDDDD",
                        "@media (max-width: 600px)": {
                          width: 35, // Avatar size for screens below 600px
                          height: 35,
                        },
                      }}
                      data-testid="profile-avatar"
                    />
                  </div>
                  <RoleSwitcher className={styles.roleSwitcher} />
                </div>
              </>
            )}
        </div>
        <div
          className={styles.HamburgerContainer}
          onClick={() => setDrawerOpen(true)}
        >
          <img src={hamburger} alt="hamburger" />
        </div>
      </div>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{
          sx: { zIndex: 99999 },
        }}
      >
        <DrawerMenuItems
          onClose={() => setDrawerOpen(false)}
          avatarAlt={seekerDetails?.firstName}
          avatarSrc={
            seekerDetails?.profileUrl?.length > 0
              ? `${seekerDetails?.profileUrl}?timestamp=${new Date().getTime()}`
              : defaultProfileIcon
          }
        />
      </Drawer>
      <Outlet />
    </>
  );
};

export default Header;
