import React, { useState, useEffect } from "react";
import { getItemInLocalStorage } from "../../../services/localStorage";
import { ROLE_STORAGE_KEYS } from "../../../constants/roleConstants";
import { colorizeMahatriaInfinitheism } from "../ColorizeMahatriaInfinitheism";
import { type Role } from "../../../utils/roleUtils";
import styles from "./index.module.scss";

interface MobileRoleDisplayProps {
  className?: string;
}

const MobileRoleDisplay: React.FC<MobileRoleDisplayProps> = ({ className }) => {
  const [currentRole, setCurrentRole] = useState<Role | null>(null);

  useEffect(() => {
    const userRole = getItemInLocalStorage(ROLE_STORAGE_KEYS.USER_ROLE);
    if (userRole) {
      setCurrentRole(userRole);
    }
  }, []);

  if (!currentRole) return null;

  const displayName = currentRole.role_name || currentRole.name;
  const renderRoleName = () => {
    return colorizeMahatriaInfinitheism(displayName);
  };

  return (
    <div className={`${styles.mobileRoleDisplay} ${className || ""}`}>
      <span className={styles.roleName}>{renderRoleName()}</span>
    </div>
  );
};

export default MobileRoleDisplay;
