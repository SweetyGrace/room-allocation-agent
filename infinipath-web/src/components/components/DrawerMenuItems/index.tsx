import React, { useState } from "react";
import styles from "./index.module.scss";
import closeIcon from '../../../assets/images/close-icon.svg';
import { DRAWER_CLOSE_DELAY, LOCAL_STORAGE_KEYS, menuItems, NAVIGATION } from "../../../constants/textConstants";
import { setItemInLocalStorage } from "../../../services/localStorage";
import { Avatar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setDashboardActiveTab } from "../../../reducers/ProgramReducer";
import { useNavigate, useLocation } from "react-router-dom";
import { RootState } from "../../../store";
import drawerBottomBg from "../../../assets/images/drawer-bg2.svg"
import { getProgramIdFromAnySource } from "../../../utils/registrationUtils";
import RoleSwitcher from "../../../common/components/RoleSwitcher";

interface DrawerMenuItemsProps {
  onClose: () => void;
  avatarAlt: string;
  avatarSrc: string;
}

const DrawerMenu: React.FC<DrawerMenuItemsProps> = ({ onClose, avatarAlt, avatarSrc }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isNavigating, setIsNavigating] = useState(false);
  
  const dashboardActiveTab = useSelector(
    (state: RootState) => state.ProgramReducer.dashboardActiveTab
  );

  const isMenuItemActive = (route: string): boolean => {
    const isOnProfilePage = location.pathname === NAVIGATION.PROFILE;
    
    if (route === NAVIGATION.PROFILE) {
      return isOnProfilePage;
    }
    
    return !isOnProfilePage && dashboardActiveTab === route;
  };

  const handleNavigation = (route: string): void => {
    if (isNavigating) return; 
    
    setIsNavigating(true);

    const programId = getProgramIdFromAnySource(location);

    // Update state BEFORE closing drawer
    if (route !== NAVIGATION.PROFILE) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.HDB_ACTIVE_TAB, route);
      dispatch(setDashboardActiveTab(route));
      
      // Store programId for future use
      if (programId) {
        setItemInLocalStorage(LOCAL_STORAGE_KEYS.LAST_VISITED_PROGRAM_ID, programId);
      }
    }
    
    // Close drawer
    onClose();
    
    // Shorter delay for mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const delay = isMobile ? DRAWER_CLOSE_DELAY.SHORT : DRAWER_CLOSE_DELAY.LONG;
    
    setTimeout(() => {
      if (route === NAVIGATION.PROFILE) {
        navigate(NAVIGATION.PROFILE);
      } else {
        // Use leading slash for proper absolute path
       const targetPath = `${NAVIGATION.DASHBOARD}/${programId}`;
        
        
        //  Always navigate (remove the path check that was blocking navigation)
        navigate(targetPath, { replace: false });
      }
      setIsNavigating(false);
    }, delay);
  };

  return (
    <div className={styles.hamburgerDrawer}>
      <div className={styles.drawerTopBgImageContainer}>
      <div className={styles.closeIconContainer} onClick={onClose}>
        <img src={closeIcon} alt="Close" />
      </div>
         <div className={styles.drawerProfileSection}>
          <div className={styles.avatarBorderWrapper}>
         <Avatar
          alt={avatarAlt}
          src={avatarSrc}
          sx={{
            width: 180,
            height: 180,
            marginBottom: "8px",
            background: "#fff",
          }}
          data-testid="drawer-profile-avatar"
        />
          </div>
        <div className={styles.profileNameContainer}>
        <div
          className={styles.drawerProfileName}
        >
          {avatarAlt}
        </div>
       
        <div className={styles.drawerRoleSwitcherContainer}>
          <RoleSwitcher className={styles.drawerRoleSwitcher} />
        </div>
        </div>
        <div className={styles.horizontalLine}></div>
      </div>
      </div>

      <div className={styles.hamburgerListContainer}>
        {menuItems?.map((items) => {
          const isActive = isMenuItemActive(items.route);
          
          return (
            <div 
              className={`${styles.hamburgerList} ${isActive ? styles.active : ''} ${
                isNavigating ? styles.disabled : ''
              }`}
              key={items.id} 
              onClick={() => !isNavigating && handleNavigation(items.route)}
            >
              <div className={styles.hamburgerContent}>
                <img 
                  src={isActive ? items.selectedImageSrc : items.unselectedImageSrc} 
                  alt={items.text} 
                />
                <div>
                  {items.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
        
      <img className={styles.drawerBottomBgImage} src={drawerBottomBg} alt="drawerBgBottom" />
        
    </div>
  );
};

export default DrawerMenu;