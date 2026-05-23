import React, { lazy } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getItemInLocalStorage } from "../services/localStorage"; // Adjust the import path as needed
import TrackSessions from "../components/TrackSessions";
import PortalNavigation from "../components/PortalNavigation";

const Subheader = lazy(() => import("../common/Subheader"));

interface RoleBasedRouteProps {
  element: React.ReactNode;
  allowedRoles: string[];
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  element,
  allowedRoles,
}) => {
  const location = useLocation();
  const userRole = getItemInLocalStorage("seekerDetails")?.role || ""; // Assuming you store the user role in local storage

  if (userRole === "mahatria" && location.pathname === "/admin/infinipath/sessions") {
    return (
      <>
        <div className="layoutContainer">
          <PortalNavigation />
          <div className="contentContainer stopScroll">
            <TrackSessions />
          </div>
        </div>
      </>
    );
  }

  if (!allowedRoles.includes(userRole)) {
    // Redirect to a different page if the user does not have the appropriate role
    return <Navigate to="/unauthorized" />;
  }

  return (
    <>
      {element}
    </>
  );
};

export default RoleBasedRoute;
