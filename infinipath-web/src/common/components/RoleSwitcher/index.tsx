import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import styles from "./index.module.scss";
import downArrow from "../../../assets/images/closedropdown.svg";
import upArrow from "../../../assets/images/opendropdown.svg";
import { getItemInLocalStorage, setItemInLocalStorage } from "../../../services/localStorage";
import { addSeekerData } from "../../../reducers/SeekerReducer";
import { prepareRolesForDropdown, type Role } from "../../../utils/roleUtils";
import { ROLE_STORAGE_KEYS } from "../../../constants/roleConstants";
import { LOCAL_STORAGE_KEYS } from "../../../constants/textConstants";
import { colorizeMahatriaInfinitheism } from "../ColorizeMahatriaInfinitheism";

interface RoleSwitcherProps {
  className?: string;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  // Helper function to render role name with colorization if needed
  const renderRoleName = (role: Role) => {
    const displayName = role.role_name || role.name;
    return colorizeMahatriaInfinitheism(displayName);
  };

  // Load roles on mount
  useEffect(() => {
    const userRole = getItemInLocalStorage(ROLE_STORAGE_KEYS.USER_ROLE);
    const roles = getItemInLocalStorage(ROLE_STORAGE_KEYS.AVAILABLE_ROLES);
    
    // Load role from localStorage (already an object)
    if (userRole) {
      setCurrentRole(userRole);
    }
    
    // Load available roles from localStorage (already an array)
    if (roles && Array.isArray(roles) && roles.length > 0) {
      const preparedRoles = prepareRolesForDropdown(roles);
      setAvailableRoles(preparedRoles);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);


  const handleRoleSwitch = async (role: Role) => {
    try {
      // Update role data in localStorage (setItemInLocalStorage handles JSON serialization)
      setItemInLocalStorage(ROLE_STORAGE_KEYS.USER_ROLE, role);
      setItemInLocalStorage(ROLE_STORAGE_KEYS.ROLE_KEY, role.role_key);
      
      // Update seeker details with new role
      const seekerDetails = getItemInLocalStorage("seekerDetails") || {};
      const updatedSeekerDetails = {
        ...seekerDetails,
        role: role.name, // Use role name directly from API
      };
      
      setItemInLocalStorage("seekerDetails", updatedSeekerDetails);
      dispatch(addSeekerData(updatedSeekerDetails));
      
      // Clear active tab to reset to default tab on role switch
      localStorage.removeItem(LOCAL_STORAGE_KEYS.HDB_ACTIVE_TAB);
      
      // Update local state
      setCurrentRole(role);
      setIsOpen(false);
      
      // Reload the page to reflect role changes in UI/permissions
      window.location.reload();
    } catch (error) {
      console.error("Error switching role:", error);
    }
  };

  // If no roles available, don't render anything
  if (availableRoles.length === 0) {
    return null;
  }

  // If only one role, show just the role name (no dropdown)
  if (availableRoles.length === 1) {
    return (
      <div className={`${styles.roleSwitcher} ${className || ""}`} data-testid="role-switcher-single">
        <div className={styles.roleDisplaySingle}>
          <span className={styles.roleName}>{renderRoleName(availableRoles[0])}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${styles.roleSwitcher} ${className || ""}`} 
      ref={dropdownRef}
      data-testid="role-switcher">
      <div
        className={styles.roleSwitcherTrigger}
        onClick={() => setIsOpen(!isOpen)}
        data-testid="role-switcher-trigger">
        <div className={styles.roleDisplayHorizontal}>
          <span className={styles.roleName}>
            {currentRole ? renderRoleName(currentRole) : "Select Role"}
          </span>
        </div>
        <img 
          src={isOpen ? upArrow : downArrow} 
          alt="dropdown arrow" 
          className={styles.arrow}
        />
      </div>

      {isOpen && (
        <div className={styles.roleSwitcherDropdown} data-testid="role-switcher-dropdown">
          <div className={styles.rolesList}>
            {availableRoles.map((role) => {
              const isActive = currentRole?.name === role.name;
              return (
                <div
                  key={role.role_key || role.name}
                  className={`${styles.roleItem} ${isActive ? styles.active : ""}`}
                  onClick={() => !isActive && handleRoleSwitch(role)}
                  data-testid={`role-item-${role.role_key || role.name}`}
                >
                  <div className={styles.roleInfo}>
                    <span className={styles.roleItemName}>
                      {renderRoleName(role)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSwitcher;
