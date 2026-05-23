
import React, { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import { Tooltip } from "@mui/material";

interface RoommatePreferencePopupProps {
  roommateName: string;
  onShowMatches: () => void;
  className?: string;
  isVisible: boolean;
  anchorElement?: HTMLElement | null;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  diffWidth?:boolean;
}

const RoommatePreferencePopup: React.FC<RoommatePreferencePopupProps> = ({ roommateName, onShowMatches, className, isVisible, anchorElement, onMouseEnter, onMouseLeave, diffWidth }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [openUpward, setOpenUpward] = useState(false);
  const [openLeftward, setOpenLeftward] = useState(false);

  useEffect(() => {
    if (!isVisible || !anchorElement) return;

    const checkPopupDirection = () => {
      if (!popupRef.current || !anchorElement) return;
      
      const anchorRect = anchorElement.getBoundingClientRect();
      const popupHeight = popupRef.current.offsetHeight;
      const popupWidth = popupRef.current.offsetWidth;
      
      // Check vertical positioning
      const spaceBelow = window.innerHeight - anchorRect.bottom;
      const spaceAbove = anchorRect.top;
      
      if (spaceBelow < popupHeight && spaceAbove > popupHeight) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
      
      // Check horizontal positioning
      const spaceRight = window.innerWidth - anchorRect.right;
      const spaceLeft = anchorRect.left;
      
      if (spaceRight < popupWidth && spaceLeft > popupWidth) {
        setOpenLeftward(true);
      } else {
        setOpenLeftward(false);
      }
    };

    checkPopupDirection();
    
    window.addEventListener('resize', checkPopupDirection);
    window.addEventListener('scroll', checkPopupDirection, true);
    
    return () => {
      window.removeEventListener('resize', checkPopupDirection);
      window.removeEventListener('scroll', checkPopupDirection, true);
    };
  }, [isVisible, anchorElement]);

  if (!isVisible) return null;

  return (
    <div 
      ref={popupRef}
      className={`${diffWidth ? styles.diffWidthPopUp : styles.popup} ${openUpward ? styles.popupUp : styles.popupDown} ${openLeftward ? styles.popupLeft : styles.popupRight} ${className || ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={styles.labelRow}>
        <span className={styles.dot}></span>
        <p className={styles.label}>Roommate preference</p>
      </div>
      <Tooltip 
  title={roommateName} 
  arrow
  componentsProps={{
    popper: {
      sx: {
        zIndex: 9999
      }
    }
  }}
>
  <p className={styles.name}>{roommateName}</p>
</Tooltip>
      <hr className={styles.divider} />
      <a href="#" className={styles.link}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onShowMatches();
        } }>
        show all matches
      </a>
    </div>
  );
};

export default RoommatePreferencePopup;