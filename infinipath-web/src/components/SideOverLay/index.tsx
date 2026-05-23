import { Drawer } from "@mui/material";
import styles from "./index.module.scss";
import { X } from "lucide-react";
import GrayLine from "../../common/components/GrayLine";
import crossIcon from "../../assets/images/crossIconBlue.svg"
import UseResize from "../../common/components/UseResize";

interface SideDrawerOverlayProps {
  open: boolean;
  onClose: () => void;
  headerText: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  grayLine?: boolean;
  customClass?: string; // Optional custom class for additional styling
  className?: string; // Additional className prop for styling
}

const SideDrawerOverlay = ({
  open,
  onClose,
  headerText,
  children,
  footer,
  grayLine,
  customClass = "",
  className = "",
}: SideDrawerOverlayProps) => {
  const { isMobileResolution, isTabResolution } = UseResize();

  // Choose overlay class based on resolution
  const overlayClass = `${styles.overlay} ${customClass}  ${className} ${open ? styles.open : ""} ${
    isMobileResolution || isTabResolution ? styles.fullScreenOverlay : ""
  }`;

  const paperClass = `${styles.sessionOverlay} ${className} ${
    isMobileResolution || isTabResolution ? styles.fullScreenOverlay : ""
  }`;

  return (
  <Drawer
    anchor="right"
    open={open}
    onClose={onClose}
    PaperProps={{ className: paperClass }}
    sx={{ zIndex: 1250 }}
  >
    <div className={overlayClass}>
      <div className={styles.filterHeader}>
        <>
          {grayLine && (
            <>
              <div className={styles.filter}>{headerText}</div>
              <GrayLine />
            </>)}
        </>
        <div>
          <img src={crossIcon} alt="" className={styles.closeButton} onClick={onClose}  />
        </div>
      </div>
      <div className={styles.filterContainer} style={{ flex: 1 }}>
        {children}
      </div>
      {footer && <div className={styles.buttonRow}>{footer}</div>}
    </div>
  </Drawer>
)};

export default SideDrawerOverlay;