import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import ImageSubText from "../../common/components/ImageSubText";
import infinipathIcon from "../../assets/images/infinipath-logo.webp";
import HDB_ICON from "../../assets/images/hdb-icon.svg";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSideNavId } from "../../reducers/SeekerReducer";
import { getItemInLocalStorage } from "../../services/localStorage";
import { getCall } from "../../services/apiService";
import { endPoints, PORTAL } from "../../constants/urlConstants";
import { MENU_ID_HDB, API_LIMIT_100, textConstant, USER_ROLE_SHOBA } from "../../constants/textConstants";
import { decrementLoader, incrementLoader, setProgramsList } from "../../reducers/ProgramReducer";
import { RootState } from "../../store";
import { LOGIN_TEXT } from "../../constants";
import { hasPermission } from "../../utils/roleBasedAccess";
// Menu items data with absolute URLs
const menuItems = [
  {
    id: "hdb",
    text: "HDB",
    selectedImageSrc: HDB_ICON,
    url: "/admin/action-cards",
  },
];

const menuItemsMahatria = [
  {
     id: LOGIN_TEXT.APP.NAME,
    text: LOGIN_TEXT.APP.NAME,
    selectedImageSrc: infinipathIcon,
    url: "/admin/infinipath/sessions",
  },
  {
    id: "hdb",
    text: "HDB",
    selectedImageSrc: HDB_ICON,
    //Should be mofified later currently keeping it static for demo
    url: "/admin/action-cards",
  },
];

const menuItemsAdmin = [
  {
    id: "infinipath",
    text: "infinipath",
    selectedImageSrc: infinipathIcon,
    url: "/admin/infinipath/sessions",
  },
  {
    id: "hdb",
    text: "HDB",
    selectedImageSrc: HDB_ICON,
    url: "/admin/action-cards",
  },
];

const PortalNavigation: React.FC = () => {
  const userRole = getItemInLocalStorage("seekerDetails")?.role || "";
  const [selectedItem, setSelectedItem] = useState<string>("infiniprayer");
  const filteredPrograms = useSelector((state: RootState) => state.ProgramReducer.filteredProgramsList) || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchPrograms = async () => {
    dispatch(incrementLoader(textConstant.LARGE));
    
    // Build query parameters based on user role
    let queryParams = `limit=${API_LIMIT_100}`;
    
    // Only add status filter for users who are not admin or shoba
    if (userRole !== "admin" && userRole !== USER_ROLE_SHOBA) {
      const filters = { status: ["internal", "published"] };
      queryParams += `&filters=${encodeURIComponent(JSON.stringify(filters))}`;
    }
    
    await getCall(`${endPoints.program}?${queryParams}`, undefined, PORTAL)
      .then((response) => {
        if (response?.data?.data?.data) {
          dispatch(setProgramsList(response.data.data.data));
        }
      })
      .catch((error) => {
        console.error("There is an Error fetching programs:", error);
      }).finally(() => {
        dispatch(decrementLoader(textConstant.LARGE));
      });
  }

  useEffect(() => {
    // Call the API to fetch programs
    fetchPrograms();
  }, []);

  const handleNavigation = (id: string, url: string) => {
    setSelectedItem(id);
    dispatch(setSideNavId(id)); // Update the sideNavId in the state

    if (id === MENU_ID_HDB && filteredPrograms.length === 1 && !hasPermission(userRole, "ADD_PROGRAM", "C")) {
      navigate(`/admin/hdb-dashboard/${filteredPrograms[0].id}`);
    } else {
      navigate(url);
    }
  };
  const reqMenuItems =
    userRole === "mahatria"
      ? menuItemsMahatria
      : userRole === "admin"
        ? menuItemsAdmin
        : menuItems;

  //To set the initial selected item based on current URL
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Identify which section we're in
    let matchedItem;
    
    // Check for infinipath-specific routes (all under /admin/infinipath/)
    if (currentPath.includes('/admin/infinipath/')) {
      matchedItem = reqMenuItems.find(item => item.id === 'infinipath');
    }
    // Check for HDB-specific routes
    else if (currentPath.includes('/admin/action-cards') || 
             currentPath.includes('/admin/hdb-dashboard')) {
      matchedItem = reqMenuItems.find(item => item.id === MENU_ID_HDB);
    }

    if (matchedItem) {
      setSelectedItem(matchedItem.id);
      dispatch(setSideNavId(matchedItem.id));
    } else {
      // Default fallback based on user role
      const defaultItem = textConstant.HDB_ROUTE;
      setSelectedItem(defaultItem);
      dispatch(setSideNavId(defaultItem));
    }
  }, [location.pathname, userRole]);

  return (
    <div
      className={
        selectedItem === "infinipath" ? styles.sideBarTop : styles.sidebar
      }
    >
      <div className={styles.sidebarMenu}>
        {reqMenuItems?.map((item) => (
          <div
            key={item.id}
            className={`${styles.menuItem} ${selectedItem === item.id ? styles.selected : ""}`}
            onClick={() => handleNavigation(item.id, item.url)}
          >
            <ImageSubText
              selectedImageSrc={item.selectedImageSrc}
              text={item.text}
              isSelected={selectedItem === item.id}
              containerClass={styles.imageSubTextContainer}
              imageContainerClass={styles.imageContainer}
              imageClass={styles.image}
              textClass={styles.text}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortalNavigation;
