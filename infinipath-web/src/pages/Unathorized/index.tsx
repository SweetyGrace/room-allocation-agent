import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.scss";

function Unathorized() {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login");
    }, 3000);
  }, []);

  return (
    <div className={styles.container}>
      You are not authorized to access this page, you have been redirected to
      login...
    </div>
  );
}

export default Unathorized;
