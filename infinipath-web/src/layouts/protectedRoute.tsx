import { Outlet, Navigate } from "react-router-dom";
import { getItemInLocalStorage } from "../services/localStorage";

const ProtectedRoute = () => {
  const token = getItemInLocalStorage("idToken");

  return token ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
