import React, { useState } from "react";
import styles from "./index.module.scss";
import { useLocation, useNavigate } from "react-router-dom";
import CustomPopup from "../components/CustomPopup";
import ArrowIcon from "../../assets/images/arrow-left.svg";
import SessionsSelectedImage from "../../assets/images/sessions-selected.svg";
import SessionsDeselectedImage from "../../assets/images/sessions-deselected.svg";
import MyGroupUnselectedImage from "../../assets/images/my-group-deselected.svg";
import MyGroupSelectedImage from "../../assets/images/my-group-selected.svg";
import AnalyticsView from "../../assets/images/analytics-view.svg";
import AnalyticsNonView from "../../assets/images/analytics-non-view.svg";
import { endPoints } from "../../constants/urlConstants";

interface SubheaderProps {
  appType?  : string;
  registrationFlow?: boolean;
}

const Subheader: React.FC<SubheaderProps> = ({ registrationFlow }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const navigate = useNavigate();
  const pathname = location?.pathname;
  const noBorderBottom = pathname?.includes("home") || pathname?.includes("seat-allocations") || pathname?.includes("infiniprayer");
  const backgroundReq = pathname?.includes("sessions");
  const [showPopup, setShowPopup] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );
  const friendsAndFamily = queryParams?.get("friendsAndFamily");
  const analytics = queryParams?.get("aggregated-analytics");
  const [hideSubHeader] = useState(false);

  // Not used: 19/01/2026
  // It will navigate to home page if the user is mahatria else it will navigate to myspace page
  // const handleMySpaceOnclick = () => {
  //   if (
  //     seekerDetails?.role?.includes("mahatria") ||
  //     seekerDetails?.role?.includes("admin")
  //   ) {
  //     navigate("/admin/sessions");
  //   }
  // };

  // Not used: 19/01/2026
  // const handleClicksRegistration = (pathInclude: string) => {
  //   if (pathInclude === "infiniprayer" || pathInclude === "seat-allocations"
  //   ) {
  //     navigate("/admin/infiniprayer");
  //     return;
  //   }
  // };

  // Not used: 19/01/2026
  // It will display the popup when user is in joinwithothers page and try to navigate to friendsandfamily page
  // const handleNavigation = (path: string) => {
  //   if (pathname === "/infinipath/joinwithothers" && pathname !== path) {
  //     setPendingNavigation(path);
  //     setShowPopup(true);
  //   } else {
  //     navigate(path);
  //   }
  // };

  // It will confirm the navigation when user click on yes button in popup
  const confirmNavigation = () => {
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    closePopup();
  };

  // It will close the popup when user click on no button in popup
  const closePopup = () => {
    setShowPopup(false);
    setPendingNavigation(null);
  };

  //getTabs function to return tabs based on the appType
  const getTabs = () => {
    // if (appType === "infinipath" && !registrationFlow) {
    //   return (
    //     <div className={styles.tabs} data-testid="tabs">
    //       <div
    //         className={`${styles.tab} ${!pathname?.includes("myspace") ? styles.activeTab : ""}`}
    //         onClick={() => handleMySpaceOnclick()}
    //         data-testid="tab-myspace"
    //       >
    //         <img
    //           src={mySpace}
    //           alt="myspace"
    //           className={styles.mySpaceIcon}
    //           data-testid="icon-myspace"
    //         />
    //         <p data-testid="text-myspace">my space</p>
    //       </div>
    //       <div className={styles.separator} data-testid="tabs-separator"></div>
    //       <div
    //         className={`${styles.tab} ${pathname?.includes("friendsandfamily") || friendsAndFamily ? styles.activeTab : ""}`}
    //         onClick={() => handleNavigation("/infinipath/friendsandfamily")}
    //         data-testid="tab-friendsandfamily"
    //       >
    //         <img
    //           src={familyAndFriends}
    //           alt="familyAndFriends"
    //           className={styles.mySpaceIcon}
    //           data-testid="icon-friendsandfamily"
    //         />
    //         <p data-testid="text-friendsandfamily">my group</p>
    //       </div>
    //     </div>
    //   );
    // } else if (appType === "admin" && !registrationFlow) {
      return (
        <div className={styles.tabs} data-testid="tabs">
          {/* <ProgramNavigation  /> */}
          <div
            className={`${styles.tab} ${pathname?.includes("session") ? styles.activeTab : ""}`}
            onClick={() => {
              navigate("/admin/infinipath/sessions");
            }}
            data-testid="tab-programmes"
          >
            <img
              src={
                pathname?.includes("session")
                  ? SessionsSelectedImage
                  : SessionsDeselectedImage
              }
              alt="sessions"
              className={styles.adminIcon}
              data-testid="icon-session"
            />
            <p data-testid="text-programmes">sessions</p>
          </div>
          <div
            className={`${styles.tab} ${pathname?.includes("seekers") || friendsAndFamily ? styles.activeTab : ""}`}
            onClick={() => navigate("/admin/infinipath/seekers")}
            data-testid="tab-friendsandfamily"
          >
            <img
              src={
                pathname?.includes("seekers") || friendsAndFamily
                  ? MyGroupSelectedImage
                  : MyGroupUnselectedImage
              }
              alt="my group"
              className={styles.mySpaceIcon}
              data-testid="icon-friendsandfamily"
            />
            <p data-testid="text-friendsandfamily">seekers</p>
          </div>
          <div
            className={`${styles.tab} ${pathname?.includes("aggregate-analytics") || analytics ? styles.activeTab : ""}`}
            onClick={() => navigate(endPoints.aggregateAnaltyics)}
            data-testid="tab-analytics"
          >
            <img
              src={
                pathname?.includes("aggregate-analytics") || analytics
                  ? AnalyticsView
                  : AnalyticsNonView
              }
              alt="my group"
              className={styles.mySpaceIcon}
              data-testid="icon-friendsandfamily"
            />
            <p data-testid="text-analytics">analytics</p>
          </div>
          
        </div>
      );
    // } else if (registrationFlow) {
    //   return (
    //     <div className={styles.tabs} data-testid="tabs">
    //       <div
    //         className={`${styles.tab} ${pathname?.includes("sessions") ? styles.activeTab : ""}`}
    //         onClick={() => navigate("/infinipath/sessions")}
    //         data-testid="tab-sessions"
    //       >
    //         <img
    //           src={SessionsSelectedImage}
    //           alt="sessions"
    //           className={styles.mySpaceIcon}
    //           data-testid="icon-sessions"
    //         />
    //         <p data-testid="text-sessions">seekers</p>
    //       </div>
    //       <div
    //         className={`${styles.tab} ${pathname?.includes("sessions") ? styles.activeTab : ""}`}
    //         onClick={() => navigate("/infinipath/sessions")}
    //         data-testid="tab-sessions"
    //       >
           
    //       </div>
    //     </div>
    //   );
    // }
  };

  /**To show the breadcurmb and back button or app title */
  const showBreadCurmb = () => {
    if (
      window?.location?.pathname?.includes("joinwithothers") ||
      window?.location?.pathname?.includes("newseeker") ||
      window?.location?.pathname?.includes("verifyphonenumber")
    ) {
      return true;
    }
  };

  /** Get breadcrumb tabs based on page */
  const getBreadCrumbTabs = () => {
    if (window?.location?.pathname?.includes("joinwithothers")) {
      return (
        <div className={styles.breadcrumbs} data-testid="breadcrumbs">
          <div
            className={styles.backArrow}
            onClick={() => {
              navigate("/infinipath/myspace");
            }}
            data-testid="back-icon-container"
          >
            <img src={ArrowIcon} alt="back" data-testid="back-icon" />
          </div>
          <div
            className={styles.nonActive}
            data-testid="breadcrumb-nonactive-myspace"
          >
            my space
          </div>
          <div className={styles.nonActive} data-testid="breadcrumb-separator">
            /
          </div>
          <div
            className={styles.active}
            data-testid="breadcrumb-active-session"
          >
            Weekly Growth Session
          </div>
        </div>
      );
    } else if (
      window?.location?.pathname?.includes("newseeker") ||
      window?.location?.pathname?.includes("verifyphonenumber")
    ) {
      return (
        <div className={styles.breadcrumbs} data-testid="breadcrumbs">
          <div
            className={styles.backArrow}
            onClick={() => {
              navigate(-1); // Navigate to the previous page
            }}
            data-testid="back-icon-container"
          >
            <img src={ArrowIcon} alt="back" data-testid="back-icon" />
          </div>
          {!friendsAndFamily && (
            <>
              <div
                className={styles.nonActive}
                data-testid="breadcrumb-nonactive-myspace"
              >
                my space
              </div>
              <div
                className={styles.nonActive}
                data-testid="breadcrumb-separator"
              >
                /
              </div>
              <div
                className={styles.nonActive}
                data-testid="breadcrumb-active-session"
              >
                Weekly Growth Session
              </div>
              <div
                className={styles.nonActive}
                data-testid="breadcrumb-separator"
              >
                /
              </div>
              <div
                className={styles.active}
                data-testid="breadcrumb-add-memebers"
              >
                add member
              </div>
            </>
          )}
        </div>
      );
    }
  };

  return hideSubHeader ? (
    <></>
  ) : (
    <div
      className={`${styles.container} ${noBorderBottom ? styles.noBorder : ""} ${backgroundReq ? styles.containerBackgroundReq : ""}`}
      data-testid="subheader-container"
    >
      {showBreadCurmb() ? (
        getBreadCrumbTabs()
      ) : (
        <p className={styles.appTitle} data-testid="app-title">
          {registrationFlow && (
            <div className={styles.title}>{`Seat Allocation for HDB'25`}</div>
          )}
          {/* {appType?.includes("admin") ? "infinipath" : appType} */}
        </p>
      )}
      <div data-testid="tabs-container">{getTabs()}</div>
      {showPopup && (
        <CustomPopup
          open={showPopup}
          onclose={closePopup}
          title="Please confirm"
          description="Are you sure you want to switch to the Friends & Family"
          onConfirm={confirmNavigation}
          onCancel={closePopup}
          confirmText="yes"
          cancelText="no"
          data-testid="custom-popup"
        />
      )}
    </div>
  );
};

export default Subheader;
