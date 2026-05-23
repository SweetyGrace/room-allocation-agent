import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.scss";
import {
  getItemInLocalStorage,
  removeItemInLocalStorage,
} from "../../services/localStorage";

function Redirect() {
  const seekerData = getItemInLocalStorage("seekerDetails") || {};

  /**Navigate to userstatus page after 10 seconds, as the meeting status not updated instantly
   * from the API as it depends on the zoom webhook response */
  const navigate = useNavigate();
  useEffect(() => {
    removeItemInLocalStorage("verification_status");
    setTimeout(() => {
      if (
        seekerData?.role?.includes("mahatria") ||
        seekerData?.role?.includes("admin")
      ) {
        navigate("/admin/infinipath/sessions");
      }
    }, 11000);
  }, []);

  return (
    <div className={styles.redirectContainer}>
      Please wait, we are fetching the latest status of the infinipath...
    </div>
  );
}

export default Redirect;
